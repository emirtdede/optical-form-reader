;Language: Hausa (1128)
;By Joost Verburg

!insertmacro LANGFILE "Hausa" "Hausa" "Hausa" "Hausa" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "Barka da zuwa Saitin $(^NameDA)"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "Saita zai jagorance ku ta hanyar shigar da $(^NameDA).$\r$\n$\r$\n Ana ba da shawarar ku rufe duk sauran aikace-aikacen kafin fara saitin. Wannan zai ba da damar sabunta fayilolin tsarin da suka dace ba tare da sake kunna kwamfutarka ba.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "Barka da zuwa Cire shigarwa $(^NameDA)"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "Saita zai jagorance ku ta hanyar cirewar $(^NameDA).$\r$\n$\r$\n Kafin fara cirewa, tabbatar cewa $(^NameDA) baya gudana.$\r$\n$\r$\nXQ7QXZ"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "Yarjejeniyar lasisi"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "Da fatan za a sake nazarin sharuɗɗan lasisi kafin shigar da $(^NameDA)."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "Idan kun yarda da sharuɗɗan yarjejeniyar, danna Na Amince don ci gaba. Dole ne ku karɓi yarjejeniya don shigar da $(^NameDA)."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "Idan kun yarda da sharuɗɗan yarjejeniyar, danna akwatin rajistan da ke ƙasa. Dole ne ku karɓi yarjejeniya don shigar da $(^NameDA). Saukewa: $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Idan kun karɓi sharuɗɗan yarjejeniyar, zaɓi zaɓi na farko a ƙasa. Dole ne ku karɓi yarjejeniya don shigar da $(^NameDA). Saukewa: $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "Yarjejeniyar lasisi"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "Da fatan za a duba sharuɗɗan lasisi kafin cirewa $(^NameDA)."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "Idan kun yarda da sharuɗɗan yarjejeniyar, danna Na Amince don ci gaba. Dole ne ku karɓi yarjejeniyar cire $(^NameDA)."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "Idan kun yarda da sharuɗɗan yarjejeniyar, danna akwatin rajistan da ke ƙasa. Dole ne ku karɓi yarjejeniyar cire $(^NameDA). Saukewa: $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Idan kun karɓi sharuɗɗan yarjejeniyar, zaɓi zaɓi na farko a ƙasa. Dole ne ku karɓi yarjejeniyar cire $(^NameDA). Saukewa: $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "Danna Page Down don ganin sauran yarjejeniyar."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "Zaɓi Abubuwan da aka haɗa"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "Zaɓi waɗanne fasalolin $(^NameDA) kuke son girka."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "Zaɓi Abubuwan da aka haɗa"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "Zaɓi waɗanne fasalolin $(^NameDA) kuke son cirewa."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "Bayani"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Sanya linzamin kwamfuta akan wani sashi don ganin bayaninsa."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Zaɓi ɓangaren don ganin bayaninsa."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "Zaɓi Wurin Shigarwa"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "Zaɓi babban fayil ɗin da za a shigar da $(^NameDA)."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "Zaɓi Cire shigarwa Wuri"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "Zaɓi babban fayil ɗin da za a cire $(^NameDA)."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "Shigarwa"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "Da fatan za a jira yayin da ake shigar da $(^NameDA)."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "An Kammala Shigarwa"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "An kammala saitin cikin nasara."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "An zubar da shigarwa"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "Ba a kammala saitin cikin nasara ba."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "Ana cirewa"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "Da fatan za a jira yayin da ake cire $(^NameDA)."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "Cikakkiyar cirewa"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "An gama cirewa cikin nasara."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "Cire cirewa"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "Ba a gama cirewa cikin nasara ba."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "Ana Kammala Saitin $(^NameDA)"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "An saka $(^NameDA) akan kwamfutarka.$\r$\n$\r$\n Danna Gama don rufe Saita."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "Dole ne a sake kunna kwamfutarka don kammala shigar da $(^NameDA). Kuna so a sake yi yanzu?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "Ana Kammala Cire $(^NameDA)"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "An cire $(^NameDA) daga kwamfutarka.$\r$\n$\r$\n Danna Gama don rufe Saita."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "Dole ne a sake kunna kwamfutarka don kammala cirewar $(^NameDA). Kuna so a sake yi yanzu?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "Sake yi yanzu"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "Ina so in sake yi da hannu daga baya"
  ${LangFileString} MUI_TEXT_FINISH_RUN "&Gudu $(^NameDA)"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Nuna Karatu"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "&Gama"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "Zaɓi Jakar Menu ta Fara"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "Zaɓi babban fayil na Fara Menu don gajerun hanyoyin $(^NameDA)."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "Zaɓi babban fayil ɗin Fara Menu inda kake son ƙirƙirar gajerun hanyoyin shirin. Hakanan zaka iya shigar da suna don ƙirƙirar sabon babban fayil."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "Kar a ƙirƙiri gajerun hanyoyi"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "Cire $(^NameDA)"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "Cire $(^NameDA) daga kwamfutarka."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "Shin kun tabbata kuna son barin Saitin $(^Name)?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "Shin kun tabbata kuna son barin $(^Name) Cire shigarwa?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "Zaɓi Masu amfani"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "Zaɓi wanne masu amfani kuke son shigar da $(^NameDA)."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "Zaɓi ko kuna son shigar da $(^NameDA) don kanku kawai ko don duk masu amfani da wannan kwamfutar. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "Shigar ga duk mai amfani da wannan kwamfutar"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "Shigar da ni kawai"
!endif
