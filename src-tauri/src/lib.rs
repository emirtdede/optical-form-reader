use serde::Serialize;
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
}

fn is_allowed_external_url(raw: &str) -> bool {
    let trimmed = raw.trim();
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

fn load_icon_variant_bytes(variant: &str) -> &'static [u8] {
    match variant {
        "monochrome-light" => ICON_MONO_LIGHT,
        "monochrome-contrast" => ICON_MONO_CONTRAST,
        _ => ICON_MONO_DARK,
    }
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
    }
}

#[tauri::command]
fn set_app_icon_variant(app: tauri::AppHandle, variant: String) -> Result<(), String> {
    let bytes = load_icon_variant_bytes(variant.trim());
    let img = Image::from_bytes(bytes).map_err(|e| e.to_string())?;

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_icon(img.clone());
    }
    if let Some(tray) = app.tray_by_id(TRAY_ID) {
        let _ = tray.set_icon(Some(img));
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

    let show_item = MenuItem::with_id(app, "show", "Optical Form Reader — Göster / Show", true, None::<&str>)?;
    let sep = PredefinedMenuItem::separator(app)?;
    let quit_item = MenuItem::with_id(app, "quit", "Çıkış / Quit", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show_item, &sep, &quit_item])?;

    let _ = TrayIconBuilder::with_id(TRAY_ID)
        .icon(icon)
        .tooltip("Optical Form Reader — Vellium")
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
            send_desktop_notification
        ])
        .run(tauri::generate_context!())
        .expect("error while running Optical Form Reader");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn external_url_allowlist_accepts_vellium_and_rejects_untrusted() {
        assert!(is_allowed_external_url("https://vellium.dev/en/legal/privacy"));
        assert!(is_allowed_external_url("https://optikformokuyucu.com/"));
        assert!(is_allowed_external_url("https://github.com/emirtdede/optical-form-reader"));
        assert!(is_allowed_external_url("https://github.com/sponsors/emirtdede"));
        assert!(is_allowed_external_url("mailto:support@vellium.dev"));
        assert!(is_allowed_external_url("mailto:privacy@vellium.dev"));
        assert!(!is_allowed_external_url("http://vellium.dev"));
        assert!(!is_allowed_external_url("javascript:alert(1)"));
        assert!(!is_allowed_external_url("file:///C:/Windows/System32/cmd.exe"));
        assert!(!is_allowed_external_url("mailto:evil@example.com"));
        assert!(!is_allowed_external_url("https://evil.example.com/vellium.dev"));
    }

    #[test]
    fn embedded_monochrome_icons_are_valid() {
        assert!(ICON_MONO_DARK.len() > 256);
        assert!(ICON_MONO_LIGHT.len() > 256);
        assert!(ICON_MONO_CONTRAST.len() > 256);
        assert!(Image::from_bytes(load_icon_variant_bytes("monochrome-dark")).is_ok());
        assert!(Image::from_bytes(load_icon_variant_bytes("monochrome-light")).is_ok());
        assert!(Image::from_bytes(load_icon_variant_bytes("monochrome-contrast")).is_ok());
    }
}
