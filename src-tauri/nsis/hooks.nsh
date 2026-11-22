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
  ; Ask user whether to delete or keep local Optical Form Reader exam data & AI models
  ; (Skipped automatically during silent installs or in-place app updates)
  ${IfNot} ${Silent}
    ${If} $UpdateMode != 1
      !insertmacro GetCleanableUninstDataPrompt $R9
      MessageBox MB_YESNO|MB_ICONQUESTION|MB_DEFBUTTON2 "$R9" IDYES ofr_wipe_user_data IDNO ofr_keep_user_data
      ofr_wipe_user_data:
        RMDir /r "$LOCALAPPDATA\dev.vellium.opticalformreader"
        RMDir /r "$APPDATA\dev.vellium.opticalformreader"
        DeleteRegKey HKCU "Software\dev.vellium.opticalformreader"
      ofr_keep_user_data:
    ${EndIf}
  ${EndIf}
!macroend

!macro GetCleanableUninstDataPrompt OUTVAR
  StrCpy ${OUTVAR} "Do you also want to permanently delete all saved exam sessions, answer keys, local AI models, and preferences?$\r$\n$\r$\nClick 'No' to keep your data for future installations."
  ${Switch} $LANGUAGE
    ${Case} 1055 ; Turkish
      StrCpy ${OUTVAR} "Kayıtlı tüm sınav oturumlarını, cevap anahtarlarını, indirilen yerel yapay zeka modellerini ve uygulama tercihlerini de kalıcı olarak silmek istiyor musunuz?$\r$\n$\r$\nVerilerinizi sonraki kurulumlar için korumak istiyorsanız 'Hayır' seçeneğine tıklayın."
      ${Break}
    ${Case} 1031 ; German
      StrCpy ${OUTVAR} "Möchten Sie auch alle gespeicherten Prüfungssitzungen, Antwortschlüssel, lokalen KI-Modelle und Einstellungen dauerhaft löschen?$\r$\n$\r$\nKlicken Sie auf 'Nein', um Ihre Daten zu behalten."
      ${Break}
    ${Case} 1036 ; French
      StrCpy ${OUTVAR} "Voulez-vous également supprimer définitivement toutes les sessions d'examen, corrigés, modèles IA locaux et préférences ?$\r$\n$\r$\nCliquez sur 'Non' pour conserver vos données."
      ${Break}
    ${Case} 3082 ; Spanish
      StrCpy ${OUTVAR} "¿Desea eliminar también permanentemente todas las sesiones de examen, claves de respuestas, modelos de IA locales y preferencias?$\r$\n$\r$\nHaga clic en 'No' para conservar sus datos."
      ${Break}
    ${Case} 1049 ; Russian
      StrCpy ${OUTVAR} "Удалить также все сохраненные сессии экзаменов, ключи ответов, локальные ИИ-модели и настройки?$\r$\n$\r$\nНажмите «Нет», чтобы сохранить данные."
      ${Break}
    ${Case} 1025 ; Arabic
      StrCpy ${OUTVAR} "هل تريد أيضًا حذف جميع جلسات الاختبار المحفوظة ومفاتيح الإجابات ونماذج الذكاء الاصطناعي المحلية والإعدادات نهائيًا؟"
      ${Break}
  ${EndSwitch}
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
