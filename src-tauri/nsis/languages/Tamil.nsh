;Language: Tamil (1097)
;By Joost Verburg

!insertmacro LANGFILE "Tamil" "Tamil" "தமிழ்" "Tamil" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) அமைப்பிற்கு வரவேற்கிறோம்"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "$(^NameDA) இன் நிறுவலின் மூலம் அமைவு உங்களை வழிநடத்தும். இது உங்கள் கணினியை மறுதொடக்கம் செய்யாமலேயே தொடர்புடைய கணினி கோப்புகளை புதுப்பிக்கும்.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) நிறுவல் நீக்கத்திற்கு வரவேற்கிறோம்"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "$(^NameDA) இன் நிறுவல் நீக்கம் மூலம் அமைவு உங்களுக்கு வழிகாட்டும்.$\r$\n$\r$\n நிறுவல் நீக்கத்தைத் தொடங்கும் முன், $(^NameDA) இயங்கவில்லை என்பதை உறுதிப்படுத்தவும்.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "உரிம ஒப்பந்தம்"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "$(^NameDA) ஐ நிறுவும் முன் உரிம விதிமுறைகளை மதிப்பாய்வு செய்யவும்."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "ஒப்பந்தத்தின் விதிமுறைகளை நீங்கள் ஏற்றுக்கொண்டால், தொடர நான் ஒப்புக்கொள்கிறேன் என்பதைக் கிளிக் செய்யவும். $(^NameDA) ஐ நிறுவுவதற்கான ஒப்பந்தத்தை நீங்கள் ஏற்க வேண்டும்."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "ஒப்பந்தத்தின் விதிமுறைகளை நீங்கள் ஏற்றுக்கொண்டால், கீழே உள்ள தேர்வுப்பெட்டியைக் கிளிக் செய்யவும். $(^NameDA) ஐ நிறுவுவதற்கான ஒப்பந்தத்தை நீங்கள் ஏற்க வேண்டும். $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "ஒப்பந்தத்தின் விதிமுறைகளை நீங்கள் ஏற்றுக்கொண்டால், கீழே உள்ள முதல் விருப்பத்தைத் தேர்ந்தெடுக்கவும். $(^NameDA) ஐ நிறுவுவதற்கான ஒப்பந்தத்தை நீங்கள் ஏற்க வேண்டும். $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "உரிம ஒப்பந்தம்"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "$(^NameDA) ஐ நிறுவல் நீக்கும் முன் உரிம விதிமுறைகளை மதிப்பாய்வு செய்யவும்."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "ஒப்பந்தத்தின் விதிமுறைகளை நீங்கள் ஏற்றுக்கொண்டால், தொடர நான் ஒப்புக்கொள்கிறேன் என்பதைக் கிளிக் செய்யவும். $(^NameDA) நிறுவல் நீக்க ஒப்பந்தத்தை நீங்கள் ஏற்க வேண்டும்."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "ஒப்பந்தத்தின் விதிமுறைகளை நீங்கள் ஏற்றுக்கொண்டால், கீழே உள்ள தேர்வுப்பெட்டியைக் கிளிக் செய்யவும். $(^NameDA) நிறுவல் நீக்க ஒப்பந்தத்தை நீங்கள் ஏற்க வேண்டும். $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "ஒப்பந்தத்தின் விதிமுறைகளை நீங்கள் ஏற்றுக்கொண்டால், கீழே உள்ள முதல் விருப்பத்தைத் தேர்ந்தெடுக்கவும். $(^NameDA) நிறுவல் நீக்க ஒப்பந்தத்தை நீங்கள் ஏற்க வேண்டும். $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "ஒப்பந்தத்தின் மீதமுள்ளவற்றைப் பார்க்க, பக்கத்தின் கீழே அழுத்தவும்."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "கூறுகளைத் தேர்ந்தெடுக்கவும்"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "நீங்கள் நிறுவ விரும்பும் $(^NameDA) இன் அம்சங்களைத் தேர்வுசெய்யவும்."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "கூறுகளைத் தேர்ந்தெடுக்கவும்"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "$(^NameDA) இன் எந்த அம்சங்களை நிறுவல் நீக்க வேண்டும் என்பதைத் தேர்வுசெய்யவும்."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "விளக்கம்"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "அதன் விளக்கத்தைக் காண உங்கள் சுட்டியை ஒரு பாகத்தின் மேல் வைக்கவும்."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "அதன் விளக்கத்தைப் பார்க்க ஒரு கூறுகளைத் தேர்ந்தெடுக்கவும்."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "நிறுவல் இடத்தை தேர்வு செய்யவும்"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) ஐ நிறுவ வேண்டிய கோப்புறையைத் தேர்ந்தெடுக்கவும்."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "நிறுவல் நீக்கும் இடத்தைத் தேர்ந்தெடுக்கவும்"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA) ஐ நிறுவல் நீக்க வேண்டிய கோப்புறையைத் தேர்வு செய்யவும்."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "நிறுவுதல்"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "$(^NameDA) நிறுவப்படும் வரை காத்திருக்கவும்."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "நிறுவல் முடிந்தது"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "அமைவு வெற்றிகரமாக முடிந்தது."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "நிறுவல் நிறுத்தப்பட்டது"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "அமைவு வெற்றிகரமாக முடிக்கப்படவில்லை."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "நிறுவல் நீக்குகிறது"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "$(^NameDA) நிறுவல் நீக்கப்படும் வரை காத்திருக்கவும்."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "நிறுவல் நீக்கம் முடிந்தது"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "நிறுவல் நீக்கம் வெற்றிகரமாக முடிந்தது."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "நிறுவல் நீக்கம் நிறுத்தப்பட்டது"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "நிறுவல் நீக்கம் வெற்றிகரமாக முடிக்கப்படவில்லை."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) அமைப்பை நிறைவு செய்கிறது"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) உங்கள் கணினியில் நிறுவப்பட்டுள்ளது.$\r$\n$\r$\n அமைப்பை மூட, முடி என்பதைக் கிளிக் செய்யவும்."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA) இன் நிறுவலை முடிக்க உங்கள் கணினி மறுதொடக்கம் செய்யப்பட வேண்டும். இப்போது மறுதொடக்கம் செய்ய வேண்டுமா?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) நிறுவல் நீக்கத்தை நிறைவு செய்கிறது"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "உங்கள் கணினியிலிருந்து $(^NameDA) நிறுவல் நீக்கப்பட்டது.$\r$\n$\r$\n அமைப்பை மூட, முடி என்பதைக் கிளிக் செய்யவும்."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA) இன் நிறுவல் நீக்கத்தை முடிக்க உங்கள் கணினி மறுதொடக்கம் செய்யப்பட வேண்டும். இப்போது மறுதொடக்கம் செய்ய வேண்டுமா?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "இப்போது மீண்டும் துவக்கவும்"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "நான் பின்னர் கைமுறையாக மறுதொடக்கம் செய்ய விரும்புகிறேன்"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA) ஐ இயக்கவும்"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Readme காட்டு"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "முடிக்கவும்"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "தொடக்க மெனு கோப்புறையைத் தேர்ந்தெடுக்கவும்"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) குறுக்குவழிகளுக்கான தொடக்க மெனு கோப்புறையைத் தேர்வு செய்யவும்."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "நிரலின் குறுக்குவழிகளை உருவாக்க விரும்பும் தொடக்க மெனு கோப்புறையைத் தேர்ந்தெடுக்கவும். புதிய கோப்புறையை உருவாக்க நீங்கள் பெயரையும் உள்ளிடலாம்."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "குறுக்குவழிகளை உருவாக்க வேண்டாம்"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA) ஐ நிறுவல் நீக்கவும்"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "உங்கள் கணினியிலிருந்து $(^NameDA) ஐ அகற்றவும்."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "$(^Name) அமைப்பிலிருந்து நிச்சயமாக வெளியேற விரும்புகிறீர்களா?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "$(^Name) நிறுவல் நீக்கலில் இருந்து நிச்சயமாக வெளியேற விரும்புகிறீர்களா?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "பயனர்களைத் தேர்ந்தெடுக்கவும்"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "எந்தப் பயனர்களுக்காக $(^NameDA) ஐ நிறுவ விரும்புகிறீர்கள் என்பதைத் தேர்வுசெய்யவும்."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "$(^NameDA) ஐ உங்களுக்காக அல்லது இந்த கணினியின் அனைத்து பயனர்களுக்காக மட்டும் நிறுவ வேண்டுமா என்பதைத் தேர்ந்தெடுக்கவும். $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "இந்தக் கணினியைப் பயன்படுத்தும் அனைவருக்கும் நிறுவவும்"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "எனக்காக மட்டும் நிறுவவும்"
!endif
