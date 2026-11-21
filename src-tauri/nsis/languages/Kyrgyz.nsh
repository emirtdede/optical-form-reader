;Language: Kyrgyz (1088)
;By Joost Verburg

!insertmacro LANGFILE "Kyrgyz" "Kyrgyz" "Кыргызча" "Kyrgyzcha" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) орнотуусуна кош келиңиз"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "Орнотуу $(^NameDA).$\r$\n$\r$\n орнотуу боюнча жол көрсөтөт Орнотууну баштоодон мурун бардык башка колдонмолорду жабуу сунушталат. Бул компьютериңизди өчүрүп күйгүзбөстөн тиешелүү тутум файлдарын жаңыртууга мүмкүндүк берет.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) Чыгаруу кош келиңиз"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "Орнотуу $(^NameDA).$\r$\n$\r$\n. Орнотуудан мурун, $(^NameDA) иштебей турганын текшериңиз.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "Лицензиялык келишим"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "$(^NameDA) орнотуудан мурун лицензиянын шарттарын карап чыгыңыз."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "Эгер сиз келишимдин шарттарын кабыл алсаңыз, улантуу үчүн Мен макулмун дегенди басыңыз. $(^NameDA) орнотуу үчүн келишимди кабыл алышыңыз керек."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "Эгер сиз келишимдин шарттарын кабыл алсаңыз, төмөнкү белгини чыкылдатыңыз. $(^NameDA) орнотуу үчүн келишимди кабыл алышыңыз керек. $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Эгер сиз келишимдин шарттарын кабыл алсаңыз, төмөндөгү биринчи параметрди тандаңыз. $(^NameDA) орнотуу үчүн келишимди кабыл алышыңыз керек. $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "Лицензиялык келишим"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "$(^NameDA)ди орнотуудан мурун лицензиянын шарттарын карап чыгыңыз."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "Эгер сиз келишимдин шарттарын кабыл алсаңыз, улантуу үчүн Мен макулмун дегенди басыңыз. $(^NameDA)ди орнотуудан чыгаруу келишимин кабыл алышыңыз керек."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "Эгер сиз келишимдин шарттарын кабыл алсаңыз, төмөнкү белгини чыкылдатыңыз. $(^NameDA)ди орнотуудан чыгаруу келишимин кабыл алышыңыз керек. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Эгер сиз келишимдин шарттарын кабыл алсаңыз, төмөндөгү биринчи параметрди тандаңыз. $(^NameDA)ди орнотуудан чыгаруу келишимин кабыл алышыңыз керек. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "Келишимдин калган бөлүгүн көрүү үчүн Page Down баскычын басыңыз."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "Компоненттерди тандаңыз"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "$(^NameDA)'дин кайсы функцияларын орноткуңуз келгенин тандаңыз."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "Компоненттерди тандаңыз"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "$(^NameDA)'дин кайсы функцияларын чыгарып салгыңыз келгенин тандаңыз."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "Description"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Компоненттин сүрөттөлүшүн көрүү үчүн чычканыңызды анын үстүнө жайгаштырыңыз."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Анын сүрөттөмөсүн көрүү үчүн компонентти тандаңыз."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "Орнотуу ордун тандаңыз"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) орнотула турган папканы тандаңыз."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "Жайгашкан жерди орнотууну тандаңыз"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA) өчүрүлө турган папканы тандаңыз."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "Орнотулууда"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "$(^NameDA) орнотулуп жатканда күтө туруңуз."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "Орнотуу аяктады"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "Орнотуу ийгиликтүү аяктады."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "Орнотуу токтотулду"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "Орнотуу ийгиликтүү аяктаган жок."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "Орнотуудан чыгарылууда"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "Сураныч, $(^NameDA) орнотулбай жатканда күтө туруңуз."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "Орнотуу аяктады"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "Орнотуу ийгиликтүү аяктады."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "Орнотуу токтотулду"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "Орнотуу ийгиликтүү аяктаган жок."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) орнотуу аякталууда"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) компьютериңизге орнотулду.$\r$\n$\r$\n Орнотууну жабуу үчүн Аяктоо баскычын басыңыз."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA) орнотууну аяктоо үчүн компьютериңиз кайра күйгүзүлүшү керек. Азыр өчүрүп күйгүзүүнү каалайсызбы?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) орнотууну бүтүрүү"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) компьютериңизден чыгарылды.$\r$\n$\r$\n Орнотууну жабуу үчүн Аяктоо баскычын басыңыз."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA) орнотууну аяктоо үчүн компьютериңиз кайра күйгүзүлүшү керек. Азыр өчүрүп күйгүзүүнү каалайсызбы?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "Азыр өчүрүп күйгүзүңүз"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "Мен кийинчерээк кол менен өчүрүп күйгүм келет"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA) иштетиңиз"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Readme көрсөтүү"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "Бүтүрүү"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "Баштоо менюсунун папкасын тандаңыз"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) жарлыктар үчүн Start Меню папкасын тандаңыз."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "Программанын жарлыктарын түзгүңүз келген Start Меню папкасын тандаңыз. Ошондой эле жаңы папка түзүү үчүн ат киргизсеңиз болот."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "Жарлыктарды түзбөңүз"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA)ди орнотуудан чыгаруу"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "$(^NameDA) компьютериңизден алып салыңыз."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "$(^Name) орнотуудан чын эле чыккыңыз келеби?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "$(^Name) Чыгаруу'тан чын эле чыккыңыз келеби?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "Колдонуучуларды тандаңыз"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "$(^NameDA) орнотууну каалаган колдонуучулар үчүн тандаңыз."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "$(^NameDA) орнотууну өзүңүз үчүн же бул компьютердин бардык колдонуучулары үчүн гана тандаңыз. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "Бул компьютерди колдонгондор үчүн орнотуу"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "Мен үчүн гана орнотуу"
!endif
