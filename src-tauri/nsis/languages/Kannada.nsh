;Language: Kannada (1099)
;By Joost Verburg

!insertmacro LANGFILE "Kannada" "Kannada" "ಕನ್ನಡ" "Kannada" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) ಸೆಟಪ್‌ಗೆ ಸುಸ್ವಾಗತ"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "$(^NameDA) ನ ಸ್ಥಾಪನೆಯ ಮೂಲಕ ಸೆಟಪ್ ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.$\r$\n$\r$\n ಸೆಟಪ್ ಅನ್ನು ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು ನೀವು ಎಲ್ಲಾ ಇತರ ಅಪ್ಲಿಕೇಶನ್‌ಗಳನ್ನು ಮುಚ್ಚಲು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ. ನಿಮ್ಮ ಕಂಪ್ಯೂಟರ್ ಅನ್ನು ರೀಬೂಟ್ ಮಾಡದೆಯೇ ಸಂಬಂಧಿತ ಸಿಸ್ಟಮ್ ಫೈಲ್‌ಗಳನ್ನು ನವೀಕರಿಸಲು ಇದು ಸಾಧ್ಯವಾಗಿಸುತ್ತದೆ.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್‌ಗೆ ಸುಸ್ವಾಗತ"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "$(^NameDA) ನ ಅಸ್ಥಾಪನೆಯ ಮೂಲಕ ಸೆಟಪ್ ನಿಮಗೆ ಮಾರ್ಗದರ್ಶನ ನೀಡುತ್ತದೆ.$\r$\n$\r$\n ಅಸ್ಥಾಪನೆಯನ್ನು ಪ್ರಾರಂಭಿಸುವ ಮೊದಲು, $(^NameDA) ಚಾಲನೆಯಲ್ಲಿಲ್ಲ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ."
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "ಪರವಾನಗಿ ಒಪ್ಪಂದ"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "$(^NameDA) ಅನ್ನು ಸ್ಥಾಪಿಸುವ ಮೊದಲು ದಯವಿಟ್ಟು ಪರವಾನಗಿ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "ನೀವು ಒಪ್ಪಂದದ ನಿಯಮಗಳನ್ನು ಒಪ್ಪಿಕೊಂಡರೆ, ಮುಂದುವರೆಯಲು ನಾನು ಒಪ್ಪುತ್ತೇನೆ ಕ್ಲಿಕ್ ಮಾಡಿ. $(^NameDA) ಅನ್ನು ಸ್ಥಾಪಿಸಲು ನೀವು ಒಪ್ಪಂದವನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಬೇಕು."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "ನೀವು ಒಪ್ಪಂದದ ನಿಯಮಗಳನ್ನು ಒಪ್ಪಿಕೊಂಡರೆ, ಕೆಳಗಿನ ಚೆಕ್ ಬಾಕ್ಸ್ ಅನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ. $(^NameDA) ಅನ್ನು ಸ್ಥಾಪಿಸಲು ನೀವು ಒಪ್ಪಂದವನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಬೇಕು. $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "ನೀವು ಒಪ್ಪಂದದ ನಿಯಮಗಳನ್ನು ಒಪ್ಪಿಕೊಂಡರೆ, ಕೆಳಗಿನ ಮೊದಲ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ. $(^NameDA) ಅನ್ನು ಸ್ಥಾಪಿಸಲು ನೀವು ಒಪ್ಪಂದವನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಬೇಕು. $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "ಪರವಾನಗಿ ಒಪ್ಪಂದ"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "$(^NameDA) ಅನ್ನು ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ಮೊದಲು ದಯವಿಟ್ಟು ಪರವಾನಗಿ ನಿಯಮಗಳನ್ನು ಪರಿಶೀಲಿಸಿ."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "ನೀವು ಒಪ್ಪಂದದ ನಿಯಮಗಳನ್ನು ಒಪ್ಪಿಕೊಂಡರೆ, ಮುಂದುವರೆಯಲು ನಾನು ಒಪ್ಪುತ್ತೇನೆ ಕ್ಲಿಕ್ ಮಾಡಿ. $(^NameDA) ಅನ್ನು ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲು ನೀವು ಒಪ್ಪಂದವನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಬೇಕು."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "ನೀವು ಒಪ್ಪಂದದ ನಿಯಮಗಳನ್ನು ಒಪ್ಪಿಕೊಂಡರೆ, ಕೆಳಗಿನ ಚೆಕ್ ಬಾಕ್ಸ್ ಅನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ. $(^NameDA) ಅನ್ನು ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲು ನೀವು ಒಪ್ಪಂದವನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಬೇಕು. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "ನೀವು ಒಪ್ಪಂದದ ನಿಯಮಗಳನ್ನು ಒಪ್ಪಿಕೊಂಡರೆ, ಕೆಳಗಿನ ಮೊದಲ ಆಯ್ಕೆಯನ್ನು ಆರಿಸಿ. $(^NameDA) ಅನ್ನು ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲು ನೀವು ಒಪ್ಪಂದವನ್ನು ಒಪ್ಪಿಕೊಳ್ಳಬೇಕು. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "ಒಪ್ಪಂದದ ಉಳಿದ ಭಾಗವನ್ನು ನೋಡಲು ಪುಟದ ಕೆಳಗೆ ಒತ್ತಿರಿ."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "ಘಟಕಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "ನೀವು ಸ್ಥಾಪಿಸಲು ಬಯಸುವ $(^NameDA) ನ ಯಾವ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಆರಿಸಿ."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "ಘಟಕಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "ನೀವು ಅಸ್ಥಾಪಿಸಲು ಬಯಸುವ $(^NameDA) ನ ಯಾವ ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು ಆರಿಸಿ."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "ವಿವರಣೆ"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "ಅದರ ವಿವರಣೆಯನ್ನು ನೋಡಲು ನಿಮ್ಮ ಮೌಸ್ ಅನ್ನು ಘಟಕದ ಮೇಲೆ ಇರಿಸಿ."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "ಅದರ ವಿವರಣೆಯನ್ನು ನೋಡಲು ಒಂದು ಘಟಕವನ್ನು ಆಯ್ಕೆಮಾಡಿ."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "ಸ್ಥಾಪಿಸುವ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) ಅನ್ನು ಸ್ಥಾಪಿಸುವ ಫೋಲ್ಡರ್ ಅನ್ನು ಆರಿಸಿ."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "ಅಸ್ಥಾಪಿಸು ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA) ಅನ್ನು ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡುವ ಫೋಲ್ಡರ್ ಅನ್ನು ಆರಿಸಿ."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "ಸ್ಥಾಪಿಸಲಾಗುತ್ತಿದೆ"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "$(^NameDA) ಅನ್ನು ಸ್ಥಾಪಿಸುವಾಗ ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "ಅನುಸ್ಥಾಪನೆಯು ಪೂರ್ಣಗೊಂಡಿದೆ"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "ಸೆಟಪ್ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿದೆ."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "ಅನುಸ್ಥಾಪನೆಯನ್ನು ಸ್ಥಗಿತಗೊಳಿಸಲಾಗಿದೆ"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "ಸೆಟಪ್ ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿಲ್ಲ."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲಾಗುತ್ತಿದೆ"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "$(^NameDA) ಅನ್ನು ಅಸ್ಥಾಪಿಸುತ್ತಿರುವಾಗ ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "ಅಸ್ಥಾಪನೆ ಪೂರ್ಣಗೊಂಡಿದೆ"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "ಅಸ್ಥಾಪನೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಳಿಸಲಾಗಿದೆ."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "ಅಸ್ಥಾಪನೆಯನ್ನು ಸ್ಥಗಿತಗೊಳಿಸಲಾಗಿದೆ"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "ಅಸ್ಥಾಪನೆಯು ಯಶಸ್ವಿಯಾಗಿ ಪೂರ್ಣಗೊಂಡಿಲ್ಲ."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) ಸೆಟಪ್ ಅನ್ನು ಪೂರ್ಣಗೊಳಿಸಲಾಗುತ್ತಿದೆ"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) ಅನ್ನು ನಿಮ್ಮ ಕಂಪ್ಯೂಟರ್‌ನಲ್ಲಿ ಸ್ಥಾಪಿಸಲಾಗಿದೆ.$\r$\n$\r$\n ಸೆಟಪ್ ಅನ್ನು ಮುಚ್ಚಲು ಮುಕ್ತಾಯ ಕ್ಲಿಕ್ ಮಾಡಿ."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA) ನ ಸ್ಥಾಪನೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ನಿಮ್ಮ ಕಂಪ್ಯೂಟರ್ ಅನ್ನು ಮರುಪ್ರಾರಂಭಿಸಬೇಕು. ನೀವು ಇದೀಗ ರೀಬೂಟ್ ಮಾಡಲು ಬಯಸುವಿರಾ?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) ಅಸ್ಥಾಪನೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲಾಗುತ್ತಿದೆ"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) ಅನ್ನು ನಿಮ್ಮ ಕಂಪ್ಯೂಟರ್‌ನಿಂದ ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಲಾಗಿದೆ.$\r$\n$\r$\n ಸೆಟಪ್ ಅನ್ನು ಮುಚ್ಚಲು ಮುಕ್ತಾಯ ಕ್ಲಿಕ್ ಮಾಡಿ."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA) ನ ಅಸ್ಥಾಪನೆಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ನಿಮ್ಮ ಕಂಪ್ಯೂಟರ್ ಅನ್ನು ಮರುಪ್ರಾರಂಭಿಸಬೇಕು. ನೀವು ಇದೀಗ ರೀಬೂಟ್ ಮಾಡಲು ಬಯಸುವಿರಾ?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "ಈಗ ರೀಬೂಟ್ ಮಾಡಿ"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "ನಾನು ನಂತರ ಹಸ್ತಚಾಲಿತವಾಗಿ ರೀಬೂಟ್ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA) ರನ್ ಮಾಡಿ"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Readme ತೋರಿಸು"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "ಮುಗಿಸು"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "ಪ್ರಾರಂಭ ಮೆನು ಫೋಲ್ಡರ್ ಆಯ್ಕೆಮಾಡಿ"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) ಶಾರ್ಟ್‌ಕಟ್‌ಗಳಿಗಾಗಿ ಸ್ಟಾರ್ಟ್ ಮೆನು ಫೋಲ್ಡರ್ ಆಯ್ಕೆಮಾಡಿ."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "ನೀವು ಪ್ರೋಗ್ರಾಂನ ಶಾರ್ಟ್‌ಕಟ್‌ಗಳನ್ನು ರಚಿಸಲು ಬಯಸುವ ಸ್ಟಾರ್ಟ್ ಮೆನು ಫೋಲ್ಡರ್ ಅನ್ನು ಆಯ್ಕೆ ಮಾಡಿ. ಹೊಸ ಫೋಲ್ಡರ್ ರಚಿಸಲು ನೀವು ಹೆಸರನ್ನು ಸಹ ನಮೂದಿಸಬಹುದು."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "ಶಾರ್ಟ್‌ಕಟ್‌ಗಳನ್ನು ರಚಿಸಬೇಡಿ"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA) ಅನ್‌ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "ನಿಮ್ಮ ಕಂಪ್ಯೂಟರ್‌ನಿಂದ $(^NameDA) ತೆಗೆದುಹಾಕಿ."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "ನೀವು $(^Name) ಸೆಟಪ್ ತೊರೆಯಲು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "ನೀವು $(^Name) ಅಸ್ಥಾಪನೆಯನ್ನು ತೊರೆಯಲು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "ಬಳಕೆದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "ನೀವು $(^NameDA) ಅನ್ನು ಸ್ಥಾಪಿಸಲು ಬಯಸುವ ಬಳಕೆದಾರರನ್ನು ಆಯ್ಕೆಮಾಡಿ."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "ನೀವು $(^NameDA) ಅನ್ನು ನಿಮಗಾಗಿ ಅಥವಾ ಈ ಕಂಪ್ಯೂಟರ್‌ನ ಎಲ್ಲಾ ಬಳಕೆದಾರರಿಗಾಗಿ ಮಾತ್ರ ಸ್ಥಾಪಿಸಲು ಬಯಸುತ್ತೀರಾ ಎಂಬುದನ್ನು ಆಯ್ಕೆಮಾಡಿ. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "ಈ ಕಂಪ್ಯೂಟರ್ ಅನ್ನು ಬಳಸುವ ಯಾರಿಗಾದರೂ ಸ್ಥಾಪಿಸಿ"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "ನನಗಾಗಿ ಮಾತ್ರ ಸ್ಥಾಪಿಸಿ"
!endif
