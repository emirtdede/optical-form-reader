; ============================================================
; Optical Form Reader - Vellium Windows 11 NSIS Installer Hooks
; Supports 73 languages with Windows OS language detection and
; English fallback (1033 is first in language list).
; ============================================================

!include "${__FILEDIR__}\languages\picker.nsh"

!define MUI_LANGDLL_WINDOWTITLE "$(DcPickerTitle)"
!define MUI_LANGDLL_INFO "$(DcPickerInfo)"
!define MUI_LANGDLL_ALWAYSSHOW

!ifndef MUI_HEADERIMAGE_RIGHT
  !define MUI_HEADERIMAGE_RIGHT
!endif

!define MUI_ABORTWARNING
!define MUI_INSTFILESPAGE_PROGRESSBAR "smooth colored"
!define MUI_INSTFILESPAGE_COLORS "18181B F4F4F5"

!define OFR_PBM_SETBARCOLOR 0x0409
!define OFR_PBM_SETBKCOLOR  0x2001
!define OFR_BAR_COLOR       0x001B1818
!define OFR_TROUGH_COLOR    0x00F5F4F4

!macro OFR_STYLE_PROGRESSBAR_BODY
  FindWindow $0 "#32770" "" $HWNDPARENT
  ${If} $0 != 0
    GetDlgItem $1 $0 1004
    ${If} $1 != 0
      System::Call 'uxtheme::SetWindowTheme(p r1, w "", w "") i .r2'
      System::Call 'user32::SendMessage(p r1, i ${OFR_PBM_SETBKCOLOR}, p 0, p ${OFR_TROUGH_COLOR}) i .r2'
      System::Call 'user32::SendMessage(p r1, i ${OFR_PBM_SETBARCOLOR}, p 0, p ${OFR_BAR_COLOR}) i .r2'
    ${EndIf}
  ${EndIf}
!macroend

Function OfrStyleProgressBar
  !insertmacro OFR_STYLE_PROGRESSBAR_BODY
FunctionEnd

Function un.OfrStyleProgressBar
  !insertmacro OFR_STYLE_PROGRESSBAR_BODY
FunctionEnd

!macro NSIS_HOOK_PREINSTALL
  Call OfrStyleProgressBar
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  Call un.OfrStyleProgressBar
!macroend

!define OFR_SHCNE_ASSOCCHANGED 0x08000000
!define OFR_SHCNE_UPDATEITEM   0x00002000
!define OFR_SHCNF_FLUSH        0x1000
!define OFR_SHCNF_PATHW_FLUSH  0x1005

!macro NSIS_HOOK_POSTINSTALL
  File "/oname=$INSTDIR\app.ico" "${INSTALLERICON}"
  WriteRegStr SHCTX "${UNINSTKEY}" "DisplayIcon" "$\"$INSTDIR\app.ico$\""
  WriteRegStr SHCTX "${UNINSTKEY}" "Publisher" "Vellium Teknoloji Anonim Sirketi"
  WriteRegStr SHCTX "${UNINSTKEY}" "URLInfoAbout" "https://vellium.dev"
  WriteRegStr SHCTX "${UNINSTKEY}" "HelpLink" "https://vellium.dev"
  WriteRegStr SHCTX "${UNINSTKEY}" "Contact" "support@vellium.dev"
  WriteRegStr SHCTX "${UNINSTKEY}" "Comments" "Local-first optical mark recognition (OMR) and academic grading suite for Windows 11 by Vellium."
  WriteRegStr HKCU "Software\dev.vellium.opticalformreader" "InstallerLanguageLcid" "$LANGUAGE"

  System::Call 'shell32::SHChangeNotify(i ${OFR_SHCNE_ASSOCCHANGED}, i ${OFR_SHCNF_FLUSH}, p 0, p 0)'
  System::Call 'shell32::SHChangeNotify(i ${OFR_SHCNE_UPDATEITEM}, i ${OFR_SHCNF_PATHW_FLUSH}, w "$INSTDIR\${MAINBINARYNAME}.exe", p 0)'
  System::Call 'shell32::SHChangeNotify(i ${OFR_SHCNE_UPDATEITEM}, i ${OFR_SHCNF_PATHW_FLUSH}, w "$DESKTOP\${PRODUCTNAME}.lnk", p 0)'
  System::Call 'shell32::SHChangeNotify(i ${OFR_SHCNE_UPDATEITEM}, i ${OFR_SHCNF_PATHW_FLUSH}, w "$SMPROGRAMS\$AppStartMenuFolder\${PRODUCTNAME}.lnk", p 0)'
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  Delete "$INSTDIR\app.ico"
  System::Call 'shell32::SHChangeNotify(i ${OFR_SHCNE_ASSOCCHANGED}, i ${OFR_SHCNF_FLUSH}, p 0, p 0)'
!macroend
