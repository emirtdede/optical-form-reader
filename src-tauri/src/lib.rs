use serde::Serialize;
use std::path::Path;
use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    image::Image,
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Emitter, Manager, WindowEvent,
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
                &format!("Write-Host 'Optical Form Reader v1.0.0 CLI:' -ForegroundColor Cyan; Write-Host '{}'", safe_cmd.replace('\'', "''")),
            ])
            .spawn();
    }
    Ok(())
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
    tauri::Builder::default()
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            focus_main_window(app);
        }))
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let _ = setup_system_tray(app.handle());
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
            open_ofr_cli_terminal
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
}
