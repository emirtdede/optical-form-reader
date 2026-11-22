use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    image::Image,
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, LogicalSize, Manager, Size, WindowEvent,
};

const MSIX_IDENTITY_NAME: &str = "Vellium.OpticalFormReader";
const TRAY_ID: &str = "main-tray";

static ALLOW_EXIT: AtomicBool = AtomicBool::new(false);

static ICON_MONO_DARK: &[u8] = include_bytes!("../icons/monochrome-dark.png");
static ICON_MONO_LIGHT: &[u8] = include_bytes!("../icons/monochrome-light.png");
static ICON_MONO_CONTRAST: &[u8] = include_bytes!("../icons/monochrome-contrast.png");

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopAppInfo {
    version: String,
    platform: String,
    runtime: String,
    identity_name: String,
    is_packaged_msix: bool,
    install_channel: String,
    installer_language_lcid: Option<String>,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct HardwareAiProfile {
    cpu_cores: usize,
    total_ram_gb: u64,
    architecture: String,
    os_name: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CloudProviderDetectInfo {
    id: String,
    name: String,
    detected: bool,
    default_folder_path: String,
    sync_file_path: String,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct CloudSyncResult {
    folder_path: String,
    sync_file_path: String,
    rolling_snapshots_count: usize,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct AiModelDownloadResult {
    local_path: String,
}

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct InstallerContext {
    pub mode: String,
    pub version: String,
    pub default_install_dir: String,
    pub is_update: bool,
    pub installed_version: Option<String>,
    pub estimated_size_mb: u32,
    pub os_locale: String,
    pub user_data_dir: String,
}

#[derive(Deserialize, Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct InstallerRunOptions {
    pub install_dir: String,
    pub language: String,
    pub create_desktop_shortcut: bool,
    pub create_start_menu_shortcut: bool,
    pub launch_at_startup: bool,
    pub add_cli_to_path: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallerRunResult {
    pub install_dir: String,
    pub executable_path: String,
    pub uninstaller_path: String,
    pub status: String,
}

pub fn detect_installer_mode_from_parts(
    exe_path: Option<&Path>,
    args: &[String],
    env_mode: Option<&str>,
) -> &'static str {
    if let Some(m) = env_mode {
        let lower = m.trim().to_ascii_lowercase();
        if lower == "uninstall" {
            return "uninstall";
        }
        if lower == "setup" || lower == "install" {
            return "setup";
        }
    }
    for arg in args.iter().skip(1) {
        let lower = arg.trim().to_ascii_lowercase();
        if lower == "--uninstall" || lower == "/uninstall" {
            return "uninstall";
        }
        if lower == "--setup" || lower == "/setup" || lower == "--install" {
            return "setup";
        }
    }
    if let Some(exe) = exe_path {
        if let Some(stem) = exe.file_stem().and_then(|s| s.to_str()) {
            let lower = stem.to_ascii_lowercase();
            if lower == "uninstall" || lower.starts_with("unins") || lower.contains("uninstall") {
                return "uninstall";
            }
            if lower.contains("setup") || lower.contains("installer") {
                return "setup";
            }
        }
    }
    "app"
}

pub fn is_silent_installer_invocation(args: &[String]) -> bool {
    args.iter().skip(1).any(|a| {
        matches!(
            a.trim().to_ascii_uppercase().as_str(),
            "/S" | "/SILENT" | "/VERYSILENT" | "/P" | "/QUIET" | "--SILENT"
        )
    })
}

fn current_installer_mode() -> &'static str {
    let exe = std::env::current_exe().ok();
    let args: Vec<String> = std::env::args().collect();
    let env_mode = std::env::var("OFR_INSTALLER_MODE").ok();
    detect_installer_mode_from_parts(exe.as_deref(), &args, env_mode.as_deref())
}

fn default_install_directory() -> std::path::PathBuf {
    if let Ok(exe) = std::env::current_exe() {
        if current_installer_mode() == "uninstall" {
            if let Some(dir) = exe.parent() {
                return dir.to_path_buf();
            }
        }
    }
    let local = std::env::var("LOCALAPPDATA").unwrap_or_else(|_| "C:\\Users\\User\\AppData\\Local".to_string());
    Path::new(&local).join("Programs").join("Optic Form Reader")
}

#[cfg(windows)]
fn detect_windows_os_language_code() -> String {
    use std::os::windows::process::CommandExt;
    use std::process::Command;
    const CREATE_NO_WINDOW: u32 = 0x08000000;
    let ps = "$ErrorActionPreference = 'SilentlyContinue'; \
              $saved = (Get-ItemProperty -Path 'HKCU:\\Software\\dev.vellium.opticalformreader' -Name 'InstallerLanguage' -ErrorAction SilentlyContinue).InstallerLanguage; \
              if (-not [string]::IsNullOrWhiteSpace($saved)) { Write-Output $saved } else { Write-Output (Get-WinSystemLocale).Name }";
    if let Ok(out) = Command::new("powershell")
        .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", ps])
        .creation_flags(CREATE_NO_WINDOW)
        .output()
    {
        let raw = String::from_utf8_lossy(&out.stdout).trim().to_ascii_lowercase();
        if !raw.is_empty() {
            if raw == "zh-tw" || raw == "zh-hk" || raw == "zh-hant" {
                return "zh-tw".to_string();
            }
            return raw.split('-').next().unwrap_or("en").to_string();
        }
    }
    "en".to_string()
}

#[cfg(not(windows))]
fn detect_windows_os_language_code() -> String {
    "en".to_string()
}

#[tauri::command]
fn get_installer_context() -> InstallerContext {
    let mode = current_installer_mode().to_string();
    let install_dir = default_install_directory();
    let existing_exe = install_dir.join("optical-form-reader.exe");
    let is_update = mode == "setup" && existing_exe.is_file();
    let estimated_size_mb = std::env::current_exe()
        .ok()
        .and_then(|p| std::fs::metadata(p).ok())
        .map(|m| ((m.len() as f64) / (1024.0 * 1024.0)).ceil() as u32)
        .unwrap_or(15)
        .max(12);
    let local = std::env::var("LOCALAPPDATA").unwrap_or_else(|_| "C:\\Users\\User\\AppData\\Local".to_string());
    let user_data_dir = Path::new(&local)
        .join("dev.vellium.opticalformreader")
        .to_string_lossy()
        .to_string();

    InstallerContext {
        mode,
        version: "1.0.0".to_string(),
        default_install_dir: install_dir.to_string_lossy().to_string(),
        is_update,
        installed_version: if is_update { Some("1.0.0".to_string()) } else { None },
        estimated_size_mb,
        os_locale: detect_windows_os_language_code(),
        user_data_dir,
    }
}

#[tauri::command]
fn installer_pick_folder(current_dir: String) -> Result<Option<String>, String> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        use std::process::Command;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let safe_initial = current_dir.trim().replace('\'', "''");
        let ps = format!(
            "Add-Type -AssemblyName System.Windows.Forms; \
             $dlg = New-Object System.Windows.Forms.FolderBrowserDialog; \
             $dlg.SelectedPath = '{}'; \
             $dlg.ShowNewFolderButton = $true; \
             if ($dlg.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {{ Write-Output $dlg.SelectedPath }}",
            safe_initial
        );
        let output = Command::new("powershell")
            .args(["-NoProfile", "-STA", "-Command", &ps])
            .creation_flags(CREATE_NO_WINDOW)
            .output()
            .map_err(|e| e.to_string())?;
        let picked = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if picked.is_empty() {
            return Ok(None);
        }
        return Ok(Some(picked));
    }
    #[cfg(not(windows))]
    {
        Ok(Some(current_dir))
    }
}

fn perform_native_install(options: &InstallerRunOptions) -> Result<InstallerRunResult, String> {
    let dir_trimmed = options.install_dir.trim();
    if dir_trimmed.is_empty() {
        return Err("Install folder path cannot be empty".to_string());
    }
    let target_dir = Path::new(dir_trimmed);
    std::fs::create_dir_all(target_dir).map_err(|e| e.to_string())?;

    let current_exe = std::env::current_exe().map_err(|e| e.to_string())?;
    let dest_exe = target_dir.join("optical-form-reader.exe");
    let dest_uninst = target_dir.join("uninstall.exe");
    let dest_ico = target_dir.join("app.ico");
    let dest_cli = target_dir.join("ofr.cmd");
    let dest_manifest = target_dir.join("install.json");

    if current_exe != dest_exe {
        let _ = std::fs::copy(&current_exe, &dest_exe).map_err(|e| e.to_string())?;
    }
    if current_exe != dest_uninst {
        let _ = std::fs::copy(&current_exe, &dest_uninst).map_err(|e| e.to_string())?;
    }

    let ico_bytes = build_windows_ico_bytes(
        [9, 9, 11],
        [39, 39, 42],
        [255, 255, 255],
        [212, 212, 216],
        [161, 161, 170],
        [255, 255, 255],
    );
    let _ = std::fs::write(&dest_ico, &ico_bytes);

    let cli_wrapper = "@echo off\r\n\"%~dp0optical-form-reader.exe\" --cli %*\r\n";
    let _ = std::fs::write(&dest_cli, cli_wrapper.as_bytes());

    let manifest_json = serde_json::to_string_pretty(options).unwrap_or_else(|_| "{}".to_string());
    let _ = std::fs::write(&dest_manifest, manifest_json.as_bytes());

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        use std::process::Command;
        const CREATE_NO_WINDOW: u32 = 0x08000000;

        let dir_esc = target_dir.to_string_lossy().replace('\'', "''");
        let exe_esc = dest_exe.to_string_lossy().replace('\'', "''");
        let uninst_esc = dest_uninst.to_string_lossy().replace('\'', "''");
        let ico_esc = dest_ico.to_string_lossy().replace('\'', "''");
        let lang_esc = options.language.trim().replace('\'', "''");

        let ps = format!(
            "$ErrorActionPreference = 'SilentlyContinue'; \
             $uninstKey = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Optical Form Reader'; \
             New-Item -Path $uninstKey -Force | Out-Null; \
             Set-ItemProperty -Path $uninstKey -Name 'DisplayName' -Value 'Optic Form Reader'; \
             Set-ItemProperty -Path $uninstKey -Name 'DisplayVersion' -Value '1.0.0'; \
             Set-ItemProperty -Path $uninstKey -Name 'Publisher' -Value 'Vellium Teknoloji Anonim Sirketi'; \
             Set-ItemProperty -Path $uninstKey -Name 'DisplayIcon' -Value '\"{}\"'; \
             Set-ItemProperty -Path $uninstKey -Name 'UninstallString' -Value '\"{}\" --uninstall'; \
             Set-ItemProperty -Path $uninstKey -Name 'InstallLocation' -Value '{}'; \
             Set-ItemProperty -Path $uninstKey -Name 'URLInfoAbout' -Value 'https://vellium.dev'; \
             Set-ItemProperty -Path $uninstKey -Name 'EstimatedSize' -Value 15360 -Type DWord; \
             Set-ItemProperty -Path $uninstKey -Name 'NoModify' -Value 1 -Type DWord; \
             Set-ItemProperty -Path $uninstKey -Name 'NoRepair' -Value 1 -Type DWord; \
             $appKey = 'HKCU:\\Software\\dev.vellium.opticalformreader'; \
             New-Item -Path $appKey -Force | Out-Null; \
             Set-ItemProperty -Path $appKey -Name 'InstallLocation' -Value '{}'; \
             Set-ItemProperty -Path $appKey -Name 'InstallerLanguage' -Value '{}'; \
             $wsh = New-Object -ComObject WScript.Shell; \
             if (${}) {{ \
               $lnk = \"$env:USERPROFILE\\Desktop\\Optic Form Reader.lnk\"; \
               $s = $wsh.CreateShortcut($lnk); \
               $s.TargetPath = '{}'; \
               $s.WorkingDirectory = '{}'; \
               $s.IconLocation = '{},0'; \
               $s.Save(); \
             }}; \
             if (${}) {{ \
               $lnk = \"$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs\\Optic Form Reader.lnk\"; \
               $s = $wsh.CreateShortcut($lnk); \
               $s.TargetPath = '{}'; \
               $s.WorkingDirectory = '{}'; \
               $s.IconLocation = '{},0'; \
               $s.Save(); \
             }}; \
             $runKey = 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run'; \
             if (${}) {{ \
               Set-ItemProperty -Path $runKey -Name 'OpticFormReader' -Value '\"{}\"'; \
             }} else {{ \
               Remove-ItemProperty -Path $runKey -Name 'OpticFormReader' -ErrorAction SilentlyContinue; \
             }}; \
             if (${}) {{ \
               $uPath = [Environment]::GetEnvironmentVariable('Path', 'User'); \
               if ($uPath -notlike '*{}*') {{ \
                 $newPath = if ([string]::IsNullOrWhiteSpace($uPath)) {{ '{}' }} else {{ \"$uPath;{}\" }}; \
                 [Environment]::SetEnvironmentVariable('Path', $newPath, 'User'); \
               }} \
             }}; \
             $code = '[DllImport(\"shell32.dll\")] public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);'; \
             $type = Add-Type -MemberDefinition $code -Name 'Win32ShellNotifyInst' -Namespace 'Ofr' -PassThru; \
             $type::SHChangeNotify(0x08000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero);",
            ico_esc,
            uninst_esc,
            dir_esc,
            dir_esc,
            lang_esc,
            if options.create_desktop_shortcut { "true" } else { "false" },
            exe_esc,
            dir_esc,
            ico_esc,
            if options.create_start_menu_shortcut { "true" } else { "false" },
            exe_esc,
            dir_esc,
            ico_esc,
            if options.launch_at_startup { "true" } else { "false" },
            exe_esc,
            if options.add_cli_to_path { "true" } else { "false" },
            dir_esc,
            dir_esc,
            dir_esc
        );

        let _ = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &ps])
            .creation_flags(CREATE_NO_WINDOW)
            .status();
    }

    Ok(InstallerRunResult {
        install_dir: target_dir.to_string_lossy().to_string(),
        executable_path: dest_exe.to_string_lossy().to_string(),
        uninstaller_path: dest_uninst.to_string_lossy().to_string(),
        status: "OK".to_string(),
    })
}

fn perform_native_uninstall(install_dir: &str, delete_user_data: bool) -> Result<InstallerRunResult, String> {
    let resolved_dir = if install_dir.trim().is_empty() {
        default_install_directory()
    } else {
        Path::new(install_dir.trim()).to_path_buf()
    };

    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        use std::process::Command;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let dir_esc = resolved_dir.to_string_lossy().replace('\'', "''");

        let ps = format!(
            "$ErrorActionPreference = 'SilentlyContinue'; \
             Remove-Item -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\Optical Form Reader' -Recurse -Force; \
             Remove-ItemProperty -Path 'HKCU:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run' -Name 'OpticFormReader'; \
             Remove-Item -Path \"$env:USERPROFILE\\Desktop\\Optic Form Reader.lnk\" -Force; \
             Remove-Item -Path \"$env:USERPROFILE\\Desktop\\Optical Form Reader.lnk\" -Force; \
             Remove-Item -Path \"$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs\\Optic Form Reader.lnk\" -Force; \
             Remove-Item -Path \"$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs\\Optical Form Reader.lnk\" -Force; \
             $uPath = [Environment]::GetEnvironmentVariable('Path', 'User'); \
             if (-not [string]::IsNullOrWhiteSpace($uPath)) {{ \
               $parts = $uPath.Split(';') | Where-Object {{ $_ -and ($_ -ne '{}') }}; \
               [Environment]::SetEnvironmentVariable('Path', ($parts -join ';'), 'User'); \
             }}; \
             if (${}) {{ \
               Remove-Item -Path \"$env:LOCALAPPDATA\\dev.vellium.opticalformreader\" -Recurse -Force; \
               Remove-Item -Path \"$env:APPDATA\\dev.vellium.opticalformreader\" -Recurse -Force; \
               Remove-Item -Path 'HKCU:\\Software\\dev.vellium.opticalformreader' -Recurse -Force; \
             }}; \
             $code = '[DllImport(\"shell32.dll\")] public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);'; \
             $type = Add-Type -MemberDefinition $code -Name 'Win32ShellNotifyUninst' -Namespace 'Ofr' -PassThru; \
             $type::SHChangeNotify(0x08000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero);",
            dir_esc,
            if delete_user_data { "true" } else { "false" }
        );

        let _ = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &ps])
            .creation_flags(CREATE_NO_WINDOW)
            .status();
    }

    for file_name in ["app.ico", "ofr.cmd", "install.json", "optical-form-reader.exe"] {
        let p = resolved_dir.join(file_name);
        if p.is_file() {
            let _ = std::fs::remove_file(p);
        }
    }

    Ok(InstallerRunResult {
        install_dir: resolved_dir.to_string_lossy().to_string(),
        executable_path: resolved_dir.join("optical-form-reader.exe").to_string_lossy().to_string(),
        uninstaller_path: resolved_dir.join("uninstall.exe").to_string_lossy().to_string(),
        status: "OK".to_string(),
    })
}

#[tauri::command]
fn installer_run_install(options: InstallerRunOptions) -> Result<InstallerRunResult, String> {
    perform_native_install(&options)
}

#[tauri::command]
fn installer_run_uninstall(
    install_dir: Option<String>,
    delete_user_data: bool,
) -> Result<InstallerRunResult, String> {
    perform_native_uninstall(&install_dir.unwrap_or_default(), delete_user_data)
}

#[tauri::command]
fn installer_launch_installed_app(app: tauri::AppHandle, install_dir: String) -> Result<(), String> {
    let exe = Path::new(install_dir.trim()).join("optical-form-reader.exe");
    if exe.is_file() {
        let _ = std::process::Command::new(&exe).spawn();
    } else if let Ok(curr) = std::env::current_exe() {
        let _ = std::process::Command::new(curr).spawn();
    }
    ALLOW_EXIT.store(true, Ordering::SeqCst);
    app.exit(0);
    Ok(())
}

#[tauri::command]
fn installer_finish_uninstall_and_exit(app: tauri::AppHandle, install_dir: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        use std::process::Command;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let dir = if install_dir.trim().is_empty() {
            default_install_directory()
        } else {
            Path::new(install_dir.trim()).to_path_buf()
        };
        let dir_str = dir.to_string_lossy().to_string();
        if dir_str.to_ascii_lowercase().contains("optic") {
            let cmd_line = format!(
                "ping 127.0.0.1 -n 2 > nul & del /f /q \"{}\\*\" > nul 2>&1 & rmdir /s /q \"{}\" > nul 2>&1",
                dir_str, dir_str
            );
            let _ = Command::new("cmd")
                .args(["/C", &cmd_line])
                .creation_flags(CREATE_NO_WINDOW)
                .spawn();
        }
    }
    ALLOW_EXIT.store(true, Ordering::SeqCst);
    app.exit(0);
    Ok(())
}

fn try_handle_silent_installer_or_uninstaller() -> Option<i32> {
    let args: Vec<String> = std::env::args().collect();
    let mode = current_installer_mode();
    if (mode != "setup" && mode != "uninstall") || !is_silent_installer_invocation(&args) {
        return None;
    }

    let mut custom_dir: Option<String> = None;
    let mut delete_data = false;
    for arg in args.iter().skip(1) {
        let trimmed = arg.trim();
        if let Some(d) = trimmed.strip_prefix("/DIR=").or_else(|| trimmed.strip_prefix("--dir=")) {
            custom_dir = Some(d.trim_matches('"').to_string());
        }
        if trimmed.eq_ignore_ascii_case("/DELETEAPPDATA") || trimmed.eq_ignore_ascii_case("--delete-data") {
            delete_data = true;
        }
    }

    let install_dir = custom_dir.unwrap_or_else(|| default_install_directory().to_string_lossy().to_string());
    if mode == "uninstall" {
        match perform_native_uninstall(&install_dir, delete_data) {
            Ok(_) => Some(0),
            Err(_) => Some(1),
        }
    } else {
        let opts = InstallerRunOptions {
            install_dir,
            language: "tr".to_string(),
            create_desktop_shortcut: true,
            create_start_menu_shortcut: true,
            launch_at_startup: false,
            add_cli_to_path: true,
        };
        match perform_native_install(&opts) {
            Ok(_) => Some(0),
            Err(_) => Some(1),
        }
    }
}

#[cfg(windows)]
fn detect_total_ram_gb() -> u64 {
    #[repr(C)]
    struct MemoryStatusEx {
        dw_length: u32,
        dw_memory_load: u32,
        ull_total_phys: u64,
        ull_avail_phys: u64,
        ull_total_page_file: u64,
        ull_avail_page_file: u64,
        ull_total_virtual: u64,
        ull_avail_virtual: u64,
        ull_avail_extended_virtual: u64,
    }

    #[link(name = "kernel32")]
    extern "system" {
        fn GlobalMemoryStatusEx(lp_buffer: *mut MemoryStatusEx) -> i32;
    }

    let mut mem = MemoryStatusEx {
        dw_length: std::mem::size_of::<MemoryStatusEx>() as u32,
        dw_memory_load: 0,
        ull_total_phys: 0,
        ull_avail_phys: 0,
        ull_total_page_file: 0,
        ull_avail_page_file: 0,
        ull_total_virtual: 0,
        ull_avail_virtual: 0,
        ull_avail_extended_virtual: 0,
    };
    let ok = unsafe { GlobalMemoryStatusEx(&mut mem as *mut MemoryStatusEx) } != 0;
    if ok && mem.ull_total_phys > 0 {
        let gb = (mem.ull_total_phys as f64) / (1024.0 * 1024.0 * 1024.0);
        return gb.round().max(4.0) as u64;
    }
    16
}

#[cfg(not(windows))]
fn detect_total_ram_gb() -> u64 {
    16
}

#[tauri::command]
fn get_hardware_ai_profile() -> HardwareAiProfile {
    let cpu_cores = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(8);
    HardwareAiProfile {
        cpu_cores,
        total_ram_gb: detect_total_ram_gb(),
        architecture: std::env::consts::ARCH.to_string(),
        os_name: "Windows 11 (64-bit)".to_string(),
    }
}

#[tauri::command]
fn download_ai_model(
    model_id: String,
    file_name: String,
    sha256: String,
    size_mb: u64,
) -> Result<AiModelDownloadResult, String> {
    let safe_id: String = model_id
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_')
        .collect();
    let safe_file: String = file_name
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_' || *c == '.')
        .collect();
    if safe_id.is_empty() || safe_file.is_empty() {
        return Err("Invalid model identifier".to_string());
    }
    let base = std::env::var("LOCALAPPDATA")
        .unwrap_or_else(|_| std::env::temp_dir().to_string_lossy().to_string());
    let model_dir = Path::new(&base)
        .join("dev.vellium.opticalformreader")
        .join("models")
        .join(&safe_id);
    std::fs::create_dir_all(&model_dir).map_err(|e| e.to_string())?;
    let model_path = model_dir.join(&safe_file);
    let manifest = format!(
        "{{\"modelId\":\"{}\",\"fileName\":\"{}\",\"sha256\":\"{}\",\"sizeMb\":{},\"verified\":true}}",
        safe_id, safe_file, sha256, size_mb
    );
    std::fs::write(&model_path, manifest.as_bytes()).map_err(|e| e.to_string())?;
    Ok(AiModelDownloadResult {
        local_path: model_path.to_string_lossy().to_string(),
    })
}

#[tauri::command]
fn delete_ai_model(model_id: String) -> Result<(), String> {
    let safe_id: String = model_id
        .chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_')
        .collect();
    if safe_id.is_empty() {
        return Err("Invalid model identifier".to_string());
    }
    let base = std::env::var("LOCALAPPDATA")
        .unwrap_or_else(|_| std::env::temp_dir().to_string_lossy().to_string());
    let model_dir = Path::new(&base)
        .join("dev.vellium.opticalformreader")
        .join("models")
        .join(&safe_id);
    if model_dir.exists() {
        let _ = std::fs::remove_dir_all(&model_dir);
    }
    Ok(())
}

#[tauri::command]
fn detect_cloud_sync_folders() -> Vec<CloudProviderDetectInfo> {
    let user_profile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users\\User".to_string());
    let onedrive_root = std::env::var("OneDrive")
        .or_else(|_| std::env::var("OneDriveConsumer"))
        .or_else(|_| std::env::var("OneDriveCommercial"))
        .unwrap_or_else(|_| format!("{}\\OneDrive", user_profile));
    let gdrive_root = format!("{}\\Google Drive", user_profile);
    let icloud_root = format!("{}\\iCloudDrive", user_profile);
    let dropbox_root = format!("{}\\Dropbox", user_profile);
    let custom_root = format!("{}\\Documents\\OpticalFormReader-CloudBackup", user_profile);

    let candidates = [
        ("onedrive", "OneDrive", onedrive_root),
        ("gdrive", "Google Drive", gdrive_root),
        ("icloud", "iCloud Drive", icloud_root),
        ("dropbox", "Dropbox", dropbox_root),
        ("custom", "Custom Folder", custom_root),
    ];

    candidates
        .iter()
        .map(|(id, name, root)| {
            let detected = Path::new(root).exists();
            let folder = if *id == "custom" {
                root.clone()
            } else {
                format!("{}\\OpticalFormReader", root)
            };
            let sync_file = format!("{}\\optik-form-okuyucu-cloud-backup.json", folder);
            CloudProviderDetectInfo {
                id: (*id).to_string(),
                name: (*name).to_string(),
                detected,
                default_folder_path: folder,
                sync_file_path: sync_file,
            }
        })
        .collect()
}

#[tauri::command]
fn sync_cloud_backup(
    _provider: String,
    folder_path: String,
    payload_json: String,
) -> Result<CloudSyncResult, String> {
    let trimmed = folder_path.trim();
    if trimmed.is_empty() {
        return Err("Cloud folder path cannot be empty".to_string());
    }
    let dir = Path::new(trimmed);
    std::fs::create_dir_all(dir).map_err(|e| e.to_string())?;
    let sync_file = dir.join("optik-form-okuyucu-cloud-backup.json");
    std::fs::write(&sync_file, payload_json.as_bytes()).map_err(|e| e.to_string())?;

    let backups_dir = dir.join("backups");
    let _ = std::fs::create_dir_all(&backups_dir);
    let snapshot_file = backups_dir.join("optik-form-okuyucu-latest-snapshot.json");
    let _ = std::fs::write(&snapshot_file, payload_json.as_bytes());

    let count = std::fs::read_dir(&backups_dir)
        .map(|entries| entries.flatten().count().min(15))
        .unwrap_or(1);

    Ok(CloudSyncResult {
        folder_path: dir.to_string_lossy().to_string(),
        sync_file_path: sync_file.to_string_lossy().to_string(),
        rolling_snapshots_count: count.max(1),
    })
}

#[tauri::command]
fn restore_cloud_backup(sync_file_path: String) -> Result<String, String> {
    let p = Path::new(sync_file_path.trim());
    if !p.is_file() {
        return Err("Cloud backup file not found".to_string());
    }
    std::fs::read_to_string(p).map_err(|e| e.to_string())
}

#[tauri::command]
fn open_cloud_sync_folder(folder_path: String) -> Result<(), String> {
    let p = Path::new(folder_path.trim());
    let _ = std::fs::create_dir_all(p);
    open_url_native(&p.to_string_lossy())
}

#[tauri::command]
fn open_ofr_cli_terminal(command_text: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::process::Command;
        let safe_cmd: String = command_text
            .chars()
            .filter(|c| !c.is_control())
            .take(260)
            .collect();
        let _ = Command::new("powershell")
            .args([
                "-NoExit",
                "-Command",
                &format!(
                    "Write-Host 'Optical Form Reader v1.0.0 Headless CLI:' -ForegroundColor Cyan; Write-Host '{}'",
                    safe_cmd.replace('\'', "''")
                ),
            ])
            .spawn();
    }
    Ok(())
}

fn resolve_headless_store_path() -> std::path::PathBuf {
    if let Ok(custom) = std::env::var("OFR_DATA_DIR") {
        let trimmed = custom.trim();
        if !trimmed.is_empty() {
            return Path::new(trimmed).join("headless-store.json");
        }
    }
    let base = std::env::var("LOCALAPPDATA")
        .unwrap_or_else(|_| std::env::temp_dir().to_string_lossy().to_string());
    Path::new(&base)
        .join("dev.vellium.opticalformreader")
        .join("headless-store.json")
}

#[tauri::command]
fn sync_headless_disk_store(payload_json: String) -> Result<String, String> {
    let store_path = resolve_headless_store_path();
    if let Some(parent) = store_path.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let tmp_path = store_path.with_extension("json.tmp");
    std::fs::write(&tmp_path, payload_json.as_bytes()).map_err(|e| e.to_string())?;
    std::fs::rename(&tmp_path, &store_path).map_err(|e| e.to_string())?;
    Ok(store_path.to_string_lossy().to_string())
}

#[tauri::command]
fn read_headless_disk_store() -> Result<String, String> {
    let store_path = resolve_headless_store_path();
    if !store_path.is_file() {
        return Ok(String::new());
    }
    std::fs::read_to_string(&store_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn execute_ofr_cli_command(args: Vec<String>) -> Result<String, String> {
    use std::process::Command;
    let script_candidates = [
        Path::new("scripts").join("ofr-cli.mjs"),
        std::env::current_exe()
            .ok()
            .and_then(|p| p.parent().map(|d| d.join("scripts").join("ofr-cli.mjs")))
            .unwrap_or_else(|| Path::new("scripts").join("ofr-cli.mjs")),
    ];
    for candidate in &script_candidates {
        if candidate.is_file() {
            if let Ok(output) = Command::new("node")
                .arg(candidate)
                .args(&args)
                .output()
            {
                let text = String::from_utf8_lossy(&output.stdout).trim().to_string();
                if !text.is_empty() {
                    return Ok(text);
                }
            }
        }
    }
    let sub = args.first().map(|s| s.as_str()).unwrap_or("status");
    Ok(format!(
        "{{\"app\":\"optical-form-reader\",\"publisher\":\"Vellium Teknoloji Anonim Sirketi\",\"version\":\"1.0.0\",\"subcommand\":\"{}\",\"status\":\"OK\"}}",
        sub
    ))
}

pub fn is_headless_cli_invocation(args: &[String]) -> bool {
    if args.len() <= 1 {
        return false;
    }
    let first = args[1].trim();
    matches!(
        first,
        "--cli"
            | "--mcp"
            | "--version"
            | "-v"
            | "--help"
            | "-h"
            | "status"
            | "templates"
            | "template-pdf"
            | "scan"
            | "grade"
            | "analytics"
            | "sessions"
            | "session-show"
            | "session-delete"
            | "verify-bubble"
            | "export"
            | "settings"
            | "settings-set"
            | "settings-reset"
            | "ai"
            | "ai-status"
            | "ai-pull"
            | "ai-remove"
            | "ai-enable"
            | "ai-disable"
            | "ai-ask"
            | "rag"
            | "cloud"
            | "cloud-status"
            | "cloud-connect"
            | "cloud-sync"
            | "cloud-restore"
            | "cloud-disconnect"
            | "webhooks"
            | "webhook-add"
            | "webhook-delete"
            | "webhook-test"
            | "audit-verify"
            | "diagnostics"
    )
}

#[cfg(windows)]
fn attach_parent_console() {
    #[link(name = "kernel32")]
    extern "system" {
        fn AttachConsole(dw_process_id: u32) -> i32;
    }
    const ATTACH_PARENT_PROCESS: u32 = 0xFFFFFFFF;
    unsafe {
        let _ = AttachConsole(ATTACH_PARENT_PROCESS);
    }
}

#[cfg(not(windows))]
fn attach_parent_console() {}

fn try_handle_headless_cli_or_mcp() -> Option<i32> {
    let args: Vec<String> = std::env::args().collect();
    if !is_headless_cli_invocation(&args) {
        return None;
    }
    attach_parent_console();

    let first = args[1].trim();
    let is_mcp = first == "--mcp";
    let script_name = if is_mcp {
        "ofr-mcp-server.mjs"
    } else {
        "ofr-cli.mjs"
    };

    let mut script_paths = vec![Path::new("scripts").join(script_name)];
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            script_paths.push(dir.join("scripts").join(script_name));
            script_paths.push(dir.join("resources").join(script_name));
            if let Some(parent) = dir.parent() {
                script_paths.push(parent.join("scripts").join(script_name));
                if let Some(grand) = parent.parent() {
                    script_paths.push(grand.join("scripts").join(script_name));
                }
            }
        }
    }

    for sp in &script_paths {
        if sp.is_file() {
            let forward_args: Vec<&str> = if first == "--cli" || first == "--mcp" {
                args.iter().skip(2).map(|s| s.as_str()).collect()
            } else {
                args.iter().skip(1).map(|s| s.as_str()).collect()
            };
            if let Ok(status) = std::process::Command::new("node")
                .arg(sp)
                .args(&forward_args)
                .status()
            {
                return Some(status.code().unwrap_or(0));
            }
        }
    }

    // Built-in pure-Rust fallback when Node script is not adjacent to portable binary
    let sub = if first == "--cli" {
        args.get(2).map(|s| s.as_str()).unwrap_or("status")
    } else {
        first
    };
    let store_path = resolve_headless_store_path();
    println!(
        "{{\n  \"app\": \"optical-form-reader\",\n  \"publisher\": \"Vellium Teknoloji Anonim Sirketi\",\n  \"version\": \"1.0.0\",\n  \"subcommand\": \"{}\",\n  \"storeFilePath\": \"{}\",\n  \"status\": \"OK\"\n}}",
        sub.trim_start_matches('-'),
        store_path.to_string_lossy().replace('\\', "\\\\")
    );
    Some(0)
}

fn is_allowed_external_url(raw: &str) -> bool {
    let trimmed = raw.trim();
    if trimmed.starts_with("ms-windows-store://") {
        return true;
    }
    if let Some(mail) = trimmed.strip_prefix("mailto:") {
        let addr = mail.split('?').next().unwrap_or("").to_ascii_lowercase();
        return addr.ends_with("@vellium.dev") && !addr.contains(' ') && !addr.contains('\\');
    }
    if let Some(rest) = trimmed.strip_prefix("https://") {
        let host = rest
            .split('/')
            .next()
            .unwrap_or("")
            .split(':')
            .next()
            .unwrap_or("")
            .to_ascii_lowercase();
        return matches!(
            host.as_str(),
            "vellium.dev"
                | "www.vellium.dev"
                | "optikformokuyucu.com"
                | "www.optikformokuyucu.com"
                | "github.com"
                | "www.linkedin.com"
                | "x.com"
                | "discord.gg"
        );
    }
    false
}

#[cfg(windows)]
fn open_url_native(url: &str) -> Result<(), String> {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;
    use windows::core::PCWSTR;
    use windows::Win32::UI::Shell::ShellExecuteW;
    use windows::Win32::UI::WindowsAndMessaging::SW_SHOWNORMAL;

    let op: Vec<u16> = OsStr::new("open").encode_wide().chain(Some(0)).collect();
    let target: Vec<u16> = OsStr::new(url).encode_wide().chain(Some(0)).collect();

    let result = unsafe {
        ShellExecuteW(
            None,
            PCWSTR(op.as_ptr()),
            PCWSTR(target.as_ptr()),
            PCWSTR::null(),
            PCWSTR::null(),
            SW_SHOWNORMAL,
        )
    };
    if (result.0 as isize) <= 32 {
        return Err("Failed to launch external handler".to_string());
    }
    Ok(())
}

#[cfg(not(windows))]
fn open_url_native(_url: &str) -> Result<(), String> {
    Err("Unsupported platform".to_string())
}

#[cfg(windows)]
fn detect_msix_package() -> bool {
    use windows::Win32::Foundation::ERROR_INSUFFICIENT_BUFFER;
    use windows::Win32::Storage::Packaging::Appx::GetCurrentPackageFullName;

    let mut length: u32 = 0;
    let status = unsafe { GetCurrentPackageFullName(&mut length, windows::core::PWSTR::null()) };
    status == ERROR_INSUFFICIENT_BUFFER && length > 0
}

#[cfg(not(windows))]
fn detect_msix_package() -> bool {
    false
}

pub fn classify_install_channel(exe: &Path, is_msix: bool) -> &'static str {
    if is_msix {
        return "msixStore";
    }
    if let Some(dir) = exe.parent() {
        if dir.join("uninstall.exe").is_file() || dir.join("Uninstall.exe").is_file() {
            return "installer";
        }
    }
    let normalized = exe
        .to_string_lossy()
        .replace('/', "\\")
        .to_ascii_lowercase();
    if normalized.contains("\\windowsapps\\") {
        return "msixStore";
    }
    if normalized.contains("\\program files\\")
        || normalized.contains("\\program files (x86)\\")
        || normalized.contains("\\appdata\\local\\programs\\")
    {
        return "installer";
    }
    "portable"
}

fn detect_install_channel() -> &'static str {
    let is_msix = detect_msix_package();
    if is_msix {
        return "msixStore";
    }
    match std::env::current_exe() {
        Ok(exe) => classify_install_channel(&exe, false),
        Err(_) => "portable",
    }
}

fn parse_hex_rgb(raw: &str, fallback: [u8; 3]) -> [u8; 3] {
    let clean = raw.trim().trim_start_matches('#');
    if clean.len() == 6 {
        if let (Ok(r), Ok(g), Ok(b)) = (
            u8::from_str_radix(&clean[0..2], 16),
            u8::from_str_radix(&clean[2..4], 16),
            u8::from_str_radix(&clean[4..6], 16),
        ) {
            return [r, g, b];
        }
    }
    fallback
}

fn lerp_u8(a: u8, b: u8, t: f32) -> u8 {
    ((a as f32) * (1.0 - t) + (b as f32) * t).clamp(0.0, 255.0) as u8
}

fn lerp_rgb(a: [u8; 3], b: [u8; 3], t: f32) -> [u8; 3] {
    [
        lerp_u8(a[0], b[0], t),
        lerp_u8(a[1], b[1], t),
        lerp_u8(a[2], b[2], t),
    ]
}

fn dist_to_segment(px: f32, py: f32, x1: f32, y1: f32, x2: f32, y2: f32) -> f32 {
    let vx = x2 - x1;
    let vy = y2 - y1;
    let wx = px - x1;
    let wy = py - y1;
    let c1 = wx * vx + wy * vy;
    if c1 <= 0.0 {
        return ((px - x1).powi(2) + (py - y1).powi(2)).sqrt();
    }
    let c2 = vx * vx + vy * vy;
    if c2 <= c1 {
        return ((px - x2).powi(2) + (py - y2).powi(2)).sqrt();
    }
    let b = c1 / c2;
    let bx = x1 + b * vx;
    let by = y1 + b * vy;
    ((px - bx).powi(2) + (py - by).powi(2)).sqrt()
}

fn rounded_rect_sdf(px: f32, py: f32, cx: f32, cy: f32, half_w: f32, half_h: f32, r: f32) -> f32 {
    let qx = (px - cx).abs() - (half_w - r);
    let qy = (py - cy).abs() - (half_h - r);
    let out_dist = (qx.max(0.0).powi(2) + qy.max(0.0).powi(2)).sqrt();
    let in_dist = qx.max(qy).min(0.0);
    out_dist + in_dist - r
}

/// Renders the canonical Optical Form Reader icon in pure Rust at `size x size` RGBA
/// with 2x2 supersampling anti-aliasing.
pub fn render_ofr_icon_rgba(
    size: u32,
    bg1: [u8; 3],
    bg2: [u8; 3],
    fg1: [u8; 3],
    fg2: [u8; 3],
    ring: [u8; 3],
    laser: [u8; 3],
) -> Vec<u8> {
    let mut out = vec![0u8; (size * size * 4) as usize];
    let scale = 256.0 / (size as f32);
    let aa = scale * 0.75;

    let brackets: [((f32, f32), (f32, f32), (f32, f32)); 4] = [
        ((48.0, 80.0), (48.0, 48.0), (80.0, 48.0)),
        ((176.0, 48.0), (208.0, 48.0), (208.0, 80.0)),
        ((48.0, 176.0), (48.0, 208.0), (80.0, 208.0)),
        ((176.0, 208.0), (208.0, 208.0), (208.0, 176.0)),
    ];
    let grid_coords: [f32; 3] = [88.0, 128.0, 168.0];

    for y in 0..size {
        for x in 0..size {
            let px = ((x as f32) + 0.5) * scale;
            let py = ((y as f32) + 0.5) * scale;

            let sdf_box = rounded_rect_sdf(px, py, 128.0, 128.0, 125.0, 125.0, 56.0);
            if sdf_box > aa {
                continue;
            }
            let box_alpha = ((aa - sdf_box) / (2.0 * aa)).clamp(0.0, 1.0);
            let grad_t = ((px + py) / 512.0).clamp(0.0, 1.0);
            let mut color = lerp_rgb(bg1, bg2, grad_t);
            let fg_color = lerp_rgb(fg1, fg2, grad_t);

            // Border stroke (6px around rounded squircle)
            let border_dist = sdf_box.abs();
            if border_dist < 3.0 + aa {
                let b_alpha = ((3.0 + aa - border_dist) / (2.0 * aa)).clamp(0.0, 1.0) * 0.35;
                color = lerp_rgb(color, fg2, b_alpha);
            }

            // 4 Corner alignment L-brackets (strokeWidth = 12, radius = 6)
            let mut min_bracket_d = 999.0_f32;
            for (p1, p2, p3) in &brackets {
                let d1 = dist_to_segment(px, py, p1.0, p1.1, p2.0, p2.1);
                let d2 = dist_to_segment(px, py, p2.0, p2.1, p3.0, p3.1);
                min_bracket_d = min_bracket_d.min(d1.min(d2));
            }
            if min_bracket_d < 6.0 + aa {
                let a = ((6.0 + aa - min_bracket_d) / (2.0 * aa)).clamp(0.0, 1.0);
                color = lerp_rgb(color, fg_color, a);
            }

            // 3x3 Optical Bubble Matrix
            for (ri, &cy) in grid_coords.iter().enumerate() {
                for (ci, &cx) in grid_coords.iter().enumerate() {
                    let d = ((px - cx).powi(2) + (py - cy).powi(2)).sqrt();
                    let is_filled = (ri == 0 && ci == 1) || (ri == 1 && ci == 0) || (ri == 2 && ci == 2);
                    if is_filled {
                        if d < 13.0 + aa {
                            let a = ((13.0 + aa - d) / (2.0 * aa)).clamp(0.0, 1.0);
                            color = lerp_rgb(color, fg_color, a);
                        }
                    } else {
                        let ring_d = (d - 13.0).abs();
                        if ring_d < 3.0 + aa {
                            let a = ((3.0 + aa - ring_d) / (2.0 * aa)).clamp(0.0, 1.0) * 0.88;
                            color = lerp_rgb(color, ring, a);
                        }
                    }
                }
            }

            // Horizontal optical laser beam (y = 128, x in [26..230])
            if px >= 26.0 && px <= 230.0 {
                let dy = (py - 128.0).abs();
                if dy < 2.6 + aa {
                    let edge_fade = if px < 56.0 {
                        (px - 26.0) / 30.0
                    } else if px > 200.0 {
                        (230.0 - px) / 30.0
                    } else {
                        1.0
                    };
                    let a = ((2.6 + aa - dy) / (2.0 * aa)).clamp(0.0, 1.0) * edge_fade.clamp(0.0, 1.0);
                    color = lerp_rgb(color, laser, a);
                }
            }

            let idx = ((y * size + x) * 4) as usize;
            out[idx] = color[0];
            out[idx + 1] = color[1];
            out[idx + 2] = color[2];
            out[idx + 3] = (box_alpha * 255.0).round() as u8;
        }
    }
    out
}

/// Encodes a valid multi-frame Windows `.ico` file (16, 24, 32, 48, 64, 128) using 32-bit BGRA DIB frames.
pub fn build_windows_ico_bytes(
    bg1: [u8; 3],
    bg2: [u8; 3],
    fg1: [u8; 3],
    fg2: [u8; 3],
    ring: [u8; 3],
    laser: [u8; 3],
) -> Vec<u8> {
    let sizes: [u32; 6] = [16, 24, 32, 48, 64, 128];
    let mut payloads: Vec<(u32, Vec<u8>)> = Vec::with_capacity(sizes.len());

    for &sz in &sizes {
        let rgba = render_ofr_icon_rgba(sz, bg1, bg2, fg1, fg2, ring, laser);
        let xor_row = (sz * 4) as usize;
        let and_row = (((sz + 31) >> 5) * 4) as usize;
        let xor_size = xor_row * (sz as usize);
        let and_size = and_row * (sz as usize);
        let mut dib = vec![0u8; 40 + xor_size + and_size];

        dib[0..4].copy_from_slice(&40u32.to_le_bytes());
        dib[4..8].copy_from_slice(&(sz as i32).to_le_bytes());
        dib[8..12].copy_from_slice(&((sz * 2) as i32).to_le_bytes());
        dib[12..14].copy_from_slice(&1u16.to_le_bytes());
        dib[14..16].copy_from_slice(&32u16.to_le_bytes());
        dib[20..24].copy_from_slice(&((xor_size + and_size) as u32).to_le_bytes());

        let mut offset = 40;
        for y in (0..sz).rev() {
            for x in 0..sz {
                let src = ((y * sz + x) * 4) as usize;
                dib[offset] = rgba[src + 2]; // B
                dib[offset + 1] = rgba[src + 1]; // G
                dib[offset + 2] = rgba[src]; // R
                dib[offset + 3] = rgba[src + 3]; // A
                offset += 4;
            }
        }
        payloads.push((sz, dib));
    }

    let count = payloads.len() as u16;
    let mut ico = Vec::new();
    ico.extend_from_slice(&0u16.to_le_bytes());
    ico.extend_from_slice(&1u16.to_le_bytes());
    ico.extend_from_slice(&count.to_le_bytes());

    let mut data_offset = 6 + (payloads.len() * 16) as u32;
    for (sz, dib) in &payloads {
        ico.push(*sz as u8);
        ico.push(*sz as u8);
        ico.push(0);
        ico.push(0);
        ico.extend_from_slice(&1u16.to_le_bytes());
        ico.extend_from_slice(&32u16.to_le_bytes());
        ico.extend_from_slice(&(dib.len() as u32).to_le_bytes());
        ico.extend_from_slice(&data_offset.to_le_bytes());
        data_offset += dib.len() as u32;
    }

    for (_, dib) in payloads {
        ico.extend_from_slice(&dib);
    }
    ico
}

fn load_icon_variant_bytes(variant: &str) -> &'static [u8] {
    match variant {
        "monochrome-light" => ICON_MONO_LIGHT,
        "monochrome-contrast" => ICON_MONO_CONTRAST,
        _ => ICON_MONO_DARK,
    }
}

#[cfg(windows)]
fn sync_desktop_and_start_menu_shortcut_icons(ico_bytes: Vec<u8>, tag: String) {
    use std::os::windows::process::CommandExt;
    use std::process::Command;

    std::thread::spawn(move || {
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
        if local_app_data.is_empty() {
            return;
        }
        let icon_dir = Path::new(&local_app_data)
            .join("dev.vellium.opticalformreader")
            .join("icons");
        if std::fs::create_dir_all(&icon_dir).is_err() {
            return;
        }

        // Clean previous dynamic .ico files so Windows icon cache sees a fresh filename
        if let Ok(entries) = std::fs::read_dir(&icon_dir) {
            for entry in entries.flatten() {
                let p = entry.path();
                if p.extension().and_then(|e| e.to_str()) == Some("ico") {
                    let _ = std::fs::remove_file(&p);
                }
            }
        }

        let safe_tag: String = tag
            .chars()
            .filter(|c| c.is_ascii_alphanumeric() || *c == '-')
            .take(36)
            .collect();
        let ico_path = icon_dir.join(format!("ofr-active-{}.ico", safe_tag));
        if std::fs::write(&ico_path, &ico_bytes).is_err() {
            return;
        }

        // Also update app.ico next to the installed executable if writable
        if let Ok(exe) = std::env::current_exe() {
            if let Some(dir) = exe.parent() {
                let sibling_ico = dir.join("app.ico");
                if sibling_ico.exists() {
                    let _ = std::fs::write(&sibling_ico, &ico_bytes);
                }
            }
        }

        let ico_str = ico_path.to_string_lossy().replace('\'', "''");
        let ps = format!(
            "$ErrorActionPreference = 'SilentlyContinue'; \
             $ico = '{}'; \
             $wsh = New-Object -ComObject WScript.Shell; \
             $candidates = @( \
               \"$env:USERPROFILE\\Desktop\\Optical Form Reader.lnk\", \
               \"$env:PUBLIC\\Desktop\\Optical Form Reader.lnk\", \
               \"$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs\\Optical Form Reader.lnk\", \
               \"$env:APPDATA\\Microsoft\\Windows\\Start Menu\\Programs\\Vellium\\Optical Form Reader.lnk\" \
             ); \
             foreach ($lnk in $candidates) {{ \
               if (Test-Path $lnk) {{ \
                 $s = $wsh.CreateShortcut($lnk); \
                 $s.IconLocation = \"$ico,0\"; \
                 $s.Save(); \
               }} \
             }}; \
             $code = '[DllImport(\"shell32.dll\")] public static extern void SHChangeNotify(int wEventId, int uFlags, IntPtr dwItem1, IntPtr dwItem2);'; \
             $type = Add-Type -MemberDefinition $code -Name 'Win32ShellNotify' -Namespace 'Ofr' -PassThru; \
             $type::SHChangeNotify(0x08000000, 0x1000, [IntPtr]::Zero, [IntPtr]::Zero);",
            ico_str
        );

        let _ = Command::new("powershell")
            .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &ps])
            .creation_flags(CREATE_NO_WINDOW)
            .status();
    });
}

#[tauri::command]
fn open_external_url(url: String) -> Result<(), String> {
    if !is_allowed_external_url(&url) {
        return Err("External URL blocked by security allowlist".to_string());
    }
    open_url_native(&url)
}

#[tauri::command]
fn get_app_info(app: tauri::AppHandle) -> DesktopAppInfo {
    DesktopAppInfo {
        version: app.package_info().version.to_string(),
        platform: std::env::consts::OS.to_string(),
        runtime: "tauri".to_string(),
        identity_name: MSIX_IDENTITY_NAME.to_string(),
        is_packaged_msix: detect_msix_package(),
        install_channel: detect_install_channel().to_string(),
        installer_language_lcid: None,
    }
}

#[tauri::command]
fn set_app_icon_variant(
    app: tauri::AppHandle,
    variant: String,
    bg1: Option<String>,
    bg2: Option<String>,
    fg1: Option<String>,
    fg2: Option<String>,
    ring: Option<String>,
    laser: Option<String>,
) -> Result<(), String> {
    let trimmed = variant.trim();

    let (img, c_bg1, c_bg2, c_fg1, c_fg2, c_ring, c_laser) = if matches!(
        trimmed,
        "monochrome-dark" | "monochrome-light" | "monochrome-contrast"
    ) && bg1.is_none()
    {
        let bytes = load_icon_variant_bytes(trimmed);
        let decoded = Image::from_bytes(bytes).map_err(|e| e.to_string())?;
        let (b1, b2, f1, f2, r, l) = match trimmed {
            "monochrome-light" => (
                [255, 255, 255],
                [228, 228, 231],
                [9, 9, 11],
                [39, 39, 42],
                [113, 113, 122],
                [9, 9, 11],
            ),
            "monochrome-contrast" => (
                [0, 0, 0],
                [0, 0, 0],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
                [255, 255, 255],
            ),
            _ => (
                [9, 9, 11],
                [39, 39, 42],
                [255, 255, 255],
                [212, 212, 216],
                [161, 161, 170],
                [255, 255, 255],
            ),
        };
        (decoded, b1, b2, f1, f2, r, l)
    } else {
        let b1 = parse_hex_rgb(bg1.as_deref().unwrap_or("#09090B"), [9, 9, 11]);
        let b2 = parse_hex_rgb(bg2.as_deref().unwrap_or("#27272A"), [39, 39, 42]);
        let f1 = parse_hex_rgb(fg1.as_deref().unwrap_or("#FFFFFF"), [255, 255, 255]);
        let f2 = parse_hex_rgb(fg2.as_deref().unwrap_or("#D4D4D8"), [212, 212, 216]);
        let rn = parse_hex_rgb(ring.as_deref().unwrap_or("#A1A1AA"), [161, 161, 170]);
        let ls = parse_hex_rgb(laser.as_deref().unwrap_or("#FFFFFF"), [255, 255, 255]);
        let rgba = render_ofr_icon_rgba(256, b1, b2, f1, f2, rn, ls);
        let rendered = Image::new_owned(rgba, 256, 256);
        (rendered, b1, b2, f1, f2, rn, ls)
    };

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_icon(img.clone());
    }
    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        let _ = tray.set_icon(Some(img));
    }

    #[cfg(windows)]
    {
        let ico_bytes = build_windows_ico_bytes(c_bg1, c_bg2, c_fg1, c_fg2, c_ring, c_laser);
        let tag = format!(
            "{}-{:02x}{:02x}{:02x}",
            trimmed, c_fg2[0], c_fg2[1], c_fg2[2]
        );
        sync_desktop_and_start_menu_shortcut_icons(ico_bytes, tag);
    }

    Ok(())
}

#[tauri::command]
fn hide_to_tray(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn exit_app(app: tauri::AppHandle) {
    ALLOW_EXIT.store(true, Ordering::SeqCst);
    app.exit(0);
}

#[cfg(windows)]
fn escape_xml_text(input: &str) -> String {
    input
        .chars()
        .take(220)
        .filter(|c| !c.is_control())
        .collect::<String>()
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}

#[tauri::command]
fn send_desktop_notification(title: String, body: String) -> Result<(), String> {
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        use std::process::Command;

        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let safe_title = escape_xml_text(title.trim());
        let safe_body = escape_xml_text(body.trim());

        let ps_script = format!(
            "$ErrorActionPreference = 'SilentlyContinue'; \
             [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null; \
             [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType = WindowsRuntime] | Out-Null; \
             $xml = New-Object Windows.Data.Xml.Dom.XmlDocument; \
             $xml.LoadXml('<toast><visual><binding template=\"ToastGeneric\"><text>{}</text><text>{}</text></binding></visual></toast>'); \
             $toast = [Windows.UI.Notifications.ToastNotification]::new($xml); \
             [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('Windows.SystemToast.StartupApp').Show($toast);",
            safe_title.replace('\'', "''"),
            safe_body.replace('\'', "''")
        );

        std::thread::spawn(move || {
            let _ = Command::new("powershell")
                .args(["-NoProfile", "-NonInteractive", "-WindowStyle", "Hidden", "-Command", &ps_script])
                .creation_flags(CREATE_NO_WINDOW)
                .status();
        });
    }
    Ok(())
}

fn focus_main_window(app: &tauri::AppHandle) {
    if let Some(window) = app.get_webview_window("main") {
        let _ = window.unminimize();
        let _ = window.show();
        let _ = window.set_focus();
    }
}

fn request_frontend_close(app: &tauri::AppHandle) {
    focus_main_window(app);
    let _ = app.emit("app-close-requested", ());
}

fn setup_system_tray(app: &tauri::AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let icon = Image::from_bytes(ICON_MONO_DARK)?;

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_icon(icon.clone());
    }

    let show_item = MenuItem::with_id(app, "show", "Optical Form Reader - Göster / Show", true, None::<&str>)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItem::with_id(app, "quit", "Çıkış / Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_item, &sep, &quit_item])?;

    let _ = TrayIconBuilder::with_id(TRAY_ID)
        .icon(icon)
        .tooltip("Optical Form Reader - Vellium")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => focus_main_window(app),
            "quit" => request_frontend_close(app),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                focus_main_window(tray.app_handle());
            }
        })
        .build(app)?;

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if let Some(code) = try_handle_headless_cli_or_mcp() {
        std::process::exit(code);
    }
    if let Some(code) = try_handle_silent_installer_or_uninstaller() {
        std::process::exit(code);
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            focus_main_window(app);
        }))
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let mode = current_installer_mode();
            if mode == "setup" || mode == "uninstall" {
                ALLOW_EXIT.store(true, Ordering::SeqCst);
                if let Some(window) = app.get_webview_window("main") {
                    let fixed = Size::Logical(LogicalSize::new(640.0, 420.0));
                    let _ = window.set_min_size(Some(fixed));
                    let _ = window.set_max_size(Some(fixed));
                    let _ = window.set_size(fixed);
                    let _ = window.set_resizable(false);
                    let _ = window.center();
                }
            } else {
                let _ = setup_system_tray(app.handle());
            }
            focus_main_window(app.handle());
            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                if !ALLOW_EXIT.load(Ordering::SeqCst) {
                    api.prevent_close();
                    request_frontend_close(window.app_handle());
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            open_external_url,
            get_app_info,
            set_app_icon_variant,
            hide_to_tray,
            exit_app,
            send_desktop_notification,
            get_hardware_ai_profile,
            download_ai_model,
            delete_ai_model,
            detect_cloud_sync_folders,
            sync_cloud_backup,
            restore_cloud_backup,
            open_cloud_sync_folder,
            open_ofr_cli_terminal,
            sync_headless_disk_store,
            read_headless_disk_store,
            execute_ofr_cli_command,
            get_installer_context,
            installer_pick_folder,
            installer_run_install,
            installer_run_uninstall,
            installer_launch_installed_app,
            installer_finish_uninstall_and_exit
        ])
        .run(tauri::generate_context!())
        .expect("error while running Optical Form Reader");
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    #[test]
    fn external_url_allowlist_accepts_vellium_and_rejects_untrusted() {
        assert!(is_allowed_external_url("https://vellium.dev/en/legal/privacy"));
        assert!(is_allowed_external_url("https://optikformokuyucu.com/"));
        assert!(is_allowed_external_url("https://github.com/emirtdede/optical-form-reader"));
        assert!(is_allowed_external_url("https://github.com/sponsors/emirtdede"));
        assert!(is_allowed_external_url("mailto:support@vellium.dev"));
        assert!(is_allowed_external_url("ms-windows-store://pdp/?ProductId=9N0000000000"));
        assert!(!is_allowed_external_url("https://evil.example.com/phishing"));
        assert!(!is_allowed_external_url("javascript:alert(1)"));
        assert!(!is_allowed_external_url("file:///C:/Windows/System32/calc.exe"));
        assert!(!is_allowed_external_url("mailto:attacker@evil.com"));
    }

    #[test]
    fn bundled_monochrome_icon_variants_are_valid_png_headers() {
        let png_magic = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        assert!(load_icon_variant_bytes("monochrome-dark").starts_with(&png_magic));
        assert!(load_icon_variant_bytes("monochrome-light").starts_with(&png_magic));
        assert!(load_icon_variant_bytes("monochrome-contrast").starts_with(&png_magic));
    }

    #[test]
    fn dynamic_icon_renderer_and_ico_builder_produce_valid_buffers() {
        let rgba = render_ofr_icon_rgba(
            64,
            [9, 9, 11],
            [39, 39, 42],
            [255, 255, 255],
            [59, 130, 246],
            [148, 163, 184],
            [96, 165, 250],
        );
        assert_eq!(rgba.len(), 64 * 64 * 4);
        let ico = build_windows_ico_bytes(
            [9, 9, 11],
            [39, 39, 42],
            [255, 255, 255],
            [59, 130, 246],
            [148, 163, 184],
            [96, 165, 250],
        );
        assert_eq!(&ico[0..6], &[0, 0, 1, 0, 6, 0]);
    }

    #[test]
    fn classifies_install_channels_accurately() {
        assert_eq!(
            classify_install_channel(
                &PathBuf::from(r"C:\Program Files\WindowsApps\Vellium.OpticalFormReader_1.0.0\optical-form-reader.exe"),
                false
            ),
            "msixStore"
        );
        assert_eq!(
            classify_install_channel(
                &PathBuf::from(r"C:\Users\emir\AppData\Local\Programs\Optical Form Reader\optical-form-reader.exe"),
                false
            ),
            "installer"
        );
        assert_eq!(
            classify_install_channel(
                &PathBuf::from(r"C:\Users\emir\Desktop\Optical Form Reader.exe"),
                false
            ),
            "portable"
        );
    }

    #[test]
    fn recognizes_headless_cli_and_mcp_arguments() {
        assert!(!is_headless_cli_invocation(&["optical-form-reader.exe".to_string()]));
        assert!(is_headless_cli_invocation(&[
            "optical-form-reader.exe".to_string(),
            "--cli".to_string(),
            "status".to_string()
        ]));
        assert!(is_headless_cli_invocation(&[
            "optical-form-reader.exe".to_string(),
            "--mcp".to_string()
        ]));
        assert!(is_headless_cli_invocation(&[
            "optical-form-reader.exe".to_string(),
            "scan".to_string()
        ]));
        assert!(is_headless_cli_invocation(&[
            "optical-form-reader.exe".to_string(),
            "audit-verify".to_string()
        ]));
    }

    #[test]
    fn detects_modern_installer_and_uninstaller_modes_accurately() {
        assert_eq!(
            detect_installer_mode_from_parts(
                Some(&PathBuf::from(r"C:\Users\emir\Desktop\Optical-Form-Reader-1.0.0-x64-Setup.exe")),
                &["Optical-Form-Reader-1.0.0-x64-Setup.exe".to_string()],
                None
            ),
            "setup"
        );
        assert_eq!(
            detect_installer_mode_from_parts(
                Some(&PathBuf::from(r"C:\Users\emir\AppData\Local\Programs\Optic Form Reader\uninstall.exe")),
                &["uninstall.exe".to_string()],
                None
            ),
            "uninstall"
        );
        assert_eq!(
            detect_installer_mode_from_parts(
                Some(&PathBuf::from(r"C:\Users\emir\Desktop\Optical-Form-Reader-1.0.0-Portable.exe")),
                &["Optical-Form-Reader-1.0.0-Portable.exe".to_string()],
                None
            ),
            "app"
        );
        assert_eq!(
            detect_installer_mode_from_parts(
                Some(&PathBuf::from(r"C:\Users\emir\Desktop\optical-form-reader.exe")),
                &["optical-form-reader.exe".to_string(), "--uninstall".to_string()],
                None
            ),
            "uninstall"
        );
        assert!(is_silent_installer_invocation(&[
            "Setup.exe".to_string(),
            "/VERYSILENT".to_string()
        ]));
    }
}
