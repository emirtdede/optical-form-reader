; Optical Form Reader — Vellium Windows 11 Özel Kurulum ve Kaldırma Betiği
; (Görsellerde sürüm numarası kullanılmaz; siyah-beyaz monokrom tasarım ve isteğe bağlı yerel veri temizliği içerir)

!macro NSIS_HOOK_PREINSTALL
  ; Kurulum öncesi eski süreçlerin kapalı olduğundan emin olunur
!macroend

!macro NSIS_HOOK_POSTINSTALL
  ; Windows 11 Ayarlar > Yüklü Uygulamalar ve Denetim Masası yayıncı, ikon ve destek bilgileri
  WriteRegStr SHCTX "${UNINSTALLKEY}" "Publisher" "Vellium"
  WriteRegStr SHCTX "${UNINSTALLKEY}" "URLInfoAbout" "https://vellium.dev"
  WriteRegStr SHCTX "${UNINSTALLKEY}" "HelpLink" "https://vellium.dev"
  WriteRegStr SHCTX "${UNINSTALLKEY}" "Contact" "support@vellium.dev"
  WriteRegStr SHCTX "${UNINSTALLKEY}" "Comments" "Local-first optical mark recognition (OMR) and academic grading suite for Windows 11 by Vellium."
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  ; Kaldırma işlemi başlatılıyor
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  System::Call 'Shell32::SHChangeNotify(i 0x8000000, i 0, i 0, i 0)'
!macroend
