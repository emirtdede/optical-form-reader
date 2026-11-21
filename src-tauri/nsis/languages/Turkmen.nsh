;Language: Turkmen (1090)
;By Joost Verburg

!insertmacro LANGFILE "Turkmen" "Turkmen" "Türkmençe" "Turkmence" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) gurnamasyna hoş geldiňiz"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "Gurnama size $(^NameDA) gurmak arkaly ýol görkezer. $ \ R$\n $ \ r$\n Gurnama başlamazdan ozal beýleki programmalaryň hemmesini ýapmak maslahat berilýär. Bu, kompýuteriňizi täzeden açmazdan degişli ulgam faýllaryny täzelemäge mümkinçilik berer. $ \ R$\n $ \ r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) Aýyrmak üçin hoş geldiňiz"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "Gurnama size $(^NameDA) aýyrmak arkaly ýol görkezer. $ \ R$\n $ \ r$\n Aýyrmaga başlamazdan ozal $(^NameDA) işlemeýändigine göz ýetiriň."
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "Ygtyýarnama şertnamasy"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "$(^NameDA) gurmazdan ozal ygtyýarnama şertlerini gözden geçirmegiňizi haýyş edýäris."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "Ylalaşygyň şertlerini kabul etseňiz, dowam etmek üçin ylalaşýaryn. $(^NameDA) gurmak baradaky şertnamany kabul etmeli."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "Ylalaşygyň şertlerini kabul etseňiz, aşakdaky bellik gutusyna basyň. $(^NameDA) gurmak baradaky şertnamany kabul etmeli. $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Ylalaşygyň şertlerini kabul etseňiz, aşakdaky birinji warianty saýlaň. $(^NameDA) gurmak baradaky şertnamany kabul etmeli. $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "Ygtyýarnama şertnamasy"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "$(^NameDA)-i aýyrmazdan ozal ygtyýarnama şertlerini gözden geçirmegiňizi haýyş edýäris."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "Ylalaşygyň şertlerini kabul etseňiz, dowam etmek üçin ylalaşýaryn. $(^NameDA)-i aýyrmak baradaky şertnamany kabul etmeli."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "Ylalaşygyň şertlerini kabul etseňiz, aşakdaky bellik gutusyna basyň. $(^NameDA)-i aýyrmak baradaky şertnamany kabul etmeli. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Ylalaşygyň şertlerini kabul etseňiz, aşakdaky birinji warianty saýlaň. $(^NameDA)-i aýyrmak baradaky şertnamany kabul etmeli. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "Ylalaşygyň galan bölegini görmek üçin Page Down basyň."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "Komponentleri saýlaň"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "$(^NameDA)-iň haýsy aýratynlyklaryny gurmak isleýändigiňizi saýlaň."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "Komponentleri saýlaň"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "Aýyrmak isleýän $(^NameDA)-iň haýsy aýratynlyklaryny saýlaň."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "Düşündiriş"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Düşündirişini görmek üçin syçanjygy bir komponentiň üstünde goýuň."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Onuň beýanyny görmek üçin bir komponent saýlaň."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "Locationerleşişini saýlaň"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) guruljak bukjany saýlaň."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "Locationerini aýyrmak saýlaň"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA)-i aýyrmak üçin bukjany saýlaň."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "Gurmak"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "$(^NameDA) gurulýan wagty garaşyň."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "Gurmak tamamlandy"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "Gurnamak üstünlikli tamamlandy."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "Gurmak ýatyryldy"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "Gurnamak üstünlikli tamamlanmady."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "Aýyrmak"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "$(^NameDA) aýrylanda garaşyň."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "Aýyrmak tamamlandy"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "Aýyrmak üstünlikli tamamlandy."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "Aýyrmak ýatyryldy"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "Aýyrmak üstünlikli tamamlanmady."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) gurnamasyny tamamlamak"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) kompýuteriňize gurnaldy. $ \ R$\n $ \ r$\n Sazlamany ýapmak üçin Tamamla düwmesine basyň."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA) gurnamasyny tamamlamak üçin kompýuteriňizi täzeden açmaly. Indi gaýtadan açmak isleýärsiňizmi?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) Aýyrmak"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) kompýuteriňizden aýryldy. $ \ R$\n $ \ r$\n Sazlamany ýapmak üçin Tamamla düwmesine basyň."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA)-i aýyrmagy tamamlamak üçin kompýuteriňizi täzeden açmaly. Indi gaýtadan açmak isleýärsiňizmi?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "Indi açyň"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "Soň el bilen açmak isleýärin"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA) işlediň"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Readme görkez"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "&Tamamla"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "Başlangyç menýu bukjasyny saýlaň"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) gysga ýollary üçin Başlangyç menýu bukjasyny saýlaň."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "Programmanyň gysga ýollaryny döretmek isleýän Başlangyç menýu bukjasyny saýlaň. Şeýle hem täze bukja döretmek üçin at girizip bilersiňiz."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "Salgylanmalary döretmäň"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA)-i aýyryň"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "$(^NameDA)-i kompýuteriňizden aýyryň."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "$(^Name) sazlamasyny taşlamak isleýändigiňize ynanýarsyňyzmy?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "$(^Name) Aýyrmakdan ýüz öwürmek isleýärsiňizmi?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "Ulanyjylary saýlaň"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "$(^NameDA) haýsy ulanyjylary gurmak isleýändigiňizi saýlaň."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "$(^NameDA)-i diňe özüňiz ýa-da bu kompýuteriň ähli ulanyjylary üçin gurmak isleýändigiňizi saýlaň. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "Bu kompýuter ulanýanlar üçin guruň"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "Diňe meniň üçin guruň"
!endif
