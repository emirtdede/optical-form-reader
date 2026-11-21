;Language: Kazakh (1087)
;By Joost Verburg

!insertmacro LANGFILE "Kazakh" "Kazakh" "Қазақша" "Kazaksha" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) орнатуына қош келдіңіз"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "Орнату сізге $(^NameDA) орнату арқылы нұсқау береді.$\r$\n$\r$\n Орнатуды бастамас бұрын барлық басқа қолданбаларды жабу ұсынылады. Бұл компьютерді қайта іске қоспай-ақ тиісті жүйелік файлдарды жаңартуға мүмкіндік береді.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) Жою қолданбасына қош келдіңіз"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "Орнату сізге $(^NameDA) қолданбасын жоюға нұсқау береді.$\r$\n$\r$\n Жоюды бастамас бұрын, $(^NameDA) іске қосылмағанын тексеріңіз.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "Лицензиялық келісім"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "$(^NameDA) орнату алдында лицензия шарттарын қарап шығыңыз."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "Келісімнің шарттарын қабылдасаңыз, жалғастыру үшін Мен келісемін түймесін басыңыз. $(^NameDA) орнату келісімін қабылдауыңыз керек."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "Келісімнің шарттарын қабылдасаңыз, төмендегі құсбелгіні басыңыз. $(^NameDA) орнату келісімін қабылдауыңыз керек. $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Егер келісім шарттарын қабылдасаңыз, төмендегі бірінші опцияны таңдаңыз. $(^NameDA) орнату келісімін қабылдауыңыз керек. $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "Лицензиялық келісім"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "$(^NameDA) қолданбасын жою алдында лицензия шарттарын қарап шығыңыз."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "Келісімнің шарттарын қабылдасаңыз, жалғастыру үшін Мен келісемін түймесін басыңыз. $(^NameDA) бағдарламасын жою туралы келісімді қабылдауыңыз керек."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "Келісімнің шарттарын қабылдасаңыз, төмендегі құсбелгіні басыңыз. $(^NameDA) бағдарламасын жою туралы келісімді қабылдауыңыз керек. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Егер келісім шарттарын қабылдасаңыз, төмендегі бірінші опцияны таңдаңыз. $(^NameDA) бағдарламасын жою туралы келісімді қабылдауыңыз керек. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "Келісімнің қалған бөлігін көру үшін Page Down түймесін басыңыз."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "Компоненттерді таңдаңыз"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "Орнатқыңыз келетін $(^NameDA) мүмкіндіктерін таңдаңыз."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "Компоненттерді таңдаңыз"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "Жойғыңыз келетін $(^NameDA) мүмкіндіктерін таңдаңыз."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "Сипаттама"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Сипаттаманы көру үшін тінтуірді компоненттің үстіне қойыңыз."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Сипаттаманы көру үшін компонентті таңдаңыз."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "Орналасу орнын таңдаңыз"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) орнатылатын қалтаны таңдаңыз."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "Орынды жою опциясын таңдаңыз"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA) жойылатын қалтаны таңдаңыз."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "Орнату"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "$(^NameDA) орнатылып жатқанша күтіңіз."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "Орнату аяқталды"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "Орнату сәтті аяқталды."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "Орнату тоқтатылды"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "Орнату сәтті аяқталмады."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "Жоюда"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "$(^NameDA) жойылғанша күтіңіз."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "Жою аяқталды"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "Жою сәтті аяқталды."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "Жою тоқтатылды"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "Жою сәтті аяқталмады."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) орнату аяқталуда"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) компьютеріңізге орнатылды.$\r$\n$\r$\n Орнатуды жабу үшін Аяқтау түймесін басыңыз."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA) орнатуды аяқтау үшін компьютерді қайта іске қосу керек. Қазір қайта жүктегіңіз келе ме?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) жоюды аяқтау"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) компьютеріңізден жойылды.$\r$\n$\r$\n Орнату параметрлерін жабу үшін Аяқтау түймесін басыңыз."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA) жоюды аяқтау үшін компьютерді қайта іске қосу керек. Қазір қайта жүктегіңіз келе ме?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "Қазір қайта жүктеңіз"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "Мен кейінірек қолмен қайта жүктегім келеді"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA) іске қосыңыз"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Readme көрсету"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "Аяқтау"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "Бастау мәзірінің қалтасын таңдаңыз"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) таңбашалары үшін Бастау мәзірі қалтасын таңдаңыз."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "Бағдарламаның таңбашаларын жасағыңыз келетін Бастау мәзірі қалтасын таңдаңыз. Жаңа қалта жасау үшін атауды енгізуге де болады."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "Таңбашаларды жасамаңыз"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA) жойыңыз"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "$(^NameDA) компьютеріңізден жойыңыз."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "$(^Name) орнатудан шынымен шыққыңыз келе ме?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "$(^Name) Жою бағдарламасынан шығуды шынымен қалайсыз ба?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "Пайдаланушыларды таңдаңыз"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "$(^NameDA) орнатқыңыз келетін пайдаланушылар үшін таңдаңыз."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "$(^NameDA) орнатуды тек өзіңіз үшін немесе осы компьютердің барлық пайдаланушылары үшін таңдаңыз. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "Осы компьютерді пайдаланатын кез келген адам үшін орнатыңыз"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "Мен үшін ғана орнатыңыз"
!endif
