;Language: Amharic (1118)
;By Joost Verburg

!insertmacro LANGFILE "Amharic" "Amharic" "አማርኛ" "Amharic" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "ወደ $(^NameDA) ማዋቀር እንኳን በደህና መጡ"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "ማዋቀር በ$(^NameDA) ጭነት ውስጥ ይመራዎታል።$\r$\n$\r$\n Setupን ከመጀመርዎ በፊት ሁሉንም ሌሎች መተግበሪያዎችን እንዲዘጉ ይመከራል። ይህ ኮምፒተርዎን እንደገና ማስጀመር ሳያስፈልግ ተዛማጅ የሆኑ የስርዓት ፋይሎችን ማዘመን ያስችላል።$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "ወደ $(^NameDA) ማራገፍ እንኳን በደህና መጡ"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "ማዋቀር በ$(^NameDA) ማራገፍ ውስጥ ይመራዎታል።$\r$\n$\r$\n ማራገፉን ከመጀመርዎ በፊት $(^NameDA) እየሰራ አለመሆኑን ያረጋግጡ።$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "የፍቃድ ስምምነት"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "እባክዎ $(^NameDA) ከመጫንዎ በፊት የፍቃድ ውሉን ይከልሱ።"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "የስምምነቱን ውሎች ከተቀበሉ፣ ለመቀጠል እስማማለሁ የሚለውን ጠቅ ያድርጉ። $(^NameDA) ን ለመጫን ስምምነቱን መቀበል አለቦት።"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "የስምምነቱን ውሎች ከተቀበሉ, ከታች ያለውን አመልካች ሳጥን ጠቅ ያድርጉ. $(^NameDA) ን ለመጫን ስምምነቱን መቀበል አለቦት። $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "የስምምነቱን ውሎች ከተቀበሉ, ከታች ያለውን የመጀመሪያውን አማራጭ ይምረጡ. $(^NameDA) ን ለመጫን ስምምነቱን መቀበል አለቦት። $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "የፍቃድ ስምምነት"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "እባክዎ $(^NameDA) ን ከማራገፍዎ በፊት የፍቃድ ውሉን ይከልሱ።"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "የስምምነቱን ውሎች ከተቀበሉ፣ ለመቀጠል እስማማለሁ የሚለውን ጠቅ ያድርጉ። $(^NameDA) ን ለማራገፍ ስምምነቱን መቀበል አለቦት።"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "የስምምነቱን ውሎች ከተቀበሉ, ከታች ያለውን አመልካች ሳጥን ጠቅ ያድርጉ. $(^NameDA) ን ለማራገፍ ስምምነቱን መቀበል አለቦት። $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "የስምምነቱን ውሎች ከተቀበሉ, ከታች ያለውን የመጀመሪያውን አማራጭ ይምረጡ. $(^NameDA) ን ለማራገፍ ስምምነቱን መቀበል አለቦት። $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "የቀረውን ስምምነቱን ለማየት ገጹን ወደታች ይጫኑ።"
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "ክፍሎችን ይምረጡ"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "የትኞቹን የ $(^NameDA) ባህሪያት መጫን እንደሚፈልጉ ይምረጡ።"
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "ክፍሎችን ይምረጡ"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "የትኞቹን የ$(^NameDA) ባህሪያት ማራገፍ እንደሚፈልጉ ይምረጡ።"
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "መግለጫ"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "መግለጫውን ለማየት መዳፊትዎን በአንድ አካል ላይ ያስቀምጡት።"
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "መግለጫውን ለማየት አንድ አካል ይምረጡ።"
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "የመጫኛ ቦታን ይምረጡ"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) የሚጭኑበት አቃፊ ይምረጡ።"
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "የማራገፍ አካባቢን ይምረጡ"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA) ን የሚያራግፍበትን አቃፊ ይምረጡ።"
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "በመጫን ላይ"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "እባክህ $(^NameDA) እየተጫነ ሳለ ጠብቅ።"
  ${LangFileString} MUI_TEXT_FINISH_TITLE "መጫኑ ተጠናቋል"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "ማዋቀር በተሳካ ሁኔታ ተጠናቅቋል።"
  ${LangFileString} MUI_TEXT_ABORT_TITLE "መጫኑ ተቋርጧል"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "ማዋቀር በተሳካ ሁኔታ አልተጠናቀቀም።"
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "በማራገፍ ላይ"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "እባክህ $(^NameDA) እየራገፈ ሳለ ጠብቅ።"
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "ማራገፍ ተጠናቅቋል"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "ማራገፍ በተሳካ ሁኔታ ተጠናቅቋል።"
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "ማራገፍ ተቋርጧል"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "ማራገፍ በተሳካ ሁኔታ አልተጠናቀቀም።"
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "የ$(^NameDA) ማዋቀርን በማጠናቀቅ ላይ"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) በኮምፒውተርዎ ላይ ተጭኗል።$\r$\n$\r$\n Setupን ለመዝጋት ጨርስን ጠቅ ያድርጉ።"
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "የ$(^NameDA) ጭነትን ለማጠናቀቅ ኮምፒውተርዎ እንደገና መጀመር አለበት። አሁን ዳግም ማስጀመር ይፈልጋሉ?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) ማራገፍን በማጠናቀቅ ላይ"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) ከኮምፒዩተርዎ ተራግፏል።$\r$\n$\r$\n ማዋቀርን ለመዝጋት ጨርስን ጠቅ ያድርጉ።"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "የ$(^NameDA) ን ማራገፊያ ለማጠናቀቅ ኮምፒተርዎ እንደገና መጀመር አለበት። አሁን ዳግም ማስጀመር ይፈልጋሉ?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "አሁን ዳግም አስነሳ"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "በኋላ ላይ በእጅ ዳግም ማስነሳት እፈልጋለሁ"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA) አሂድ"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Readme አሳይ"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "ጨርስ"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "የጀምር ምናሌ አቃፊን ይምረጡ"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "ለ$(^NameDA) አቋራጮች የጀምር ሜኑ አቃፊን ይምረጡ።"
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "የፕሮግራሙን አቋራጮች ለመፍጠር የሚፈልጉትን የጀምር ሜኑ አቃፊ ይምረጡ። አዲስ አቃፊ ለመፍጠር ስም ማስገባትም ይችላሉ።"
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "አቋራጮችን አትፍጠር"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA)ን ያራግፉ"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "$(^NameDA)ን ከኮምፒዩተርዎ ያስወግዱ።"
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "እርግጠኛ ነዎት የ$(^Name) Setupን ማቋረጥ ይፈልጋሉ?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "እርግጠኛ ነዎት $(^Name) ማራገፍን ማቆም ይፈልጋሉ?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "ተጠቃሚዎችን ይምረጡ"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "ለየትኞቹ ተጠቃሚዎች $(^NameDA) መጫን እንደሚፈልጉ ይምረጡ።"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "$(^NameDA)ን ለራስዎ ብቻ ወይም ለሁሉም የዚህ ኮምፒውተር ተጠቃሚዎች መጫን ይፈልጉ እንደሆነ ይምረጡ። $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "ይህን ኮምፒውተር ለሚጠቀም ለማንኛውም ሰው ጫን"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "ለእኔ ብቻ ጫን"
!endif
