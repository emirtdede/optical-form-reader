;Language: Swahili (1089)
;By Joost Verburg

!insertmacro LANGFILE "Swahili" "Swahili" "Kiswahili" "Kiswahili" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "Karibu kwa Usanidi wa $(^NameDA)"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "Usanidi utakuongoza kupitia usakinishaji wa $(^NameDA).$\r$\n$\r$\n Inapendekezwa kuwa ufunge programu zingine zote kabla ya kuanza Kuweka. Hii itafanya uwezekano wa kusasisha faili za mfumo husika bila kuwasha upya kompyuta yako.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "Karibu kwenye $(^NameDA) Sanidua"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "Mipangilio itakuongoza katika uondoaji wa $(^NameDA).$\r$\n$\r$\n Kabla ya kuanza usakinishaji, hakikisha $(^NameDA) haifanyiki.$\r$\n$\rZXQAQAQXZ$_CLICK"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "Mkataba wa Leseni"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "Tafadhali kagua masharti ya leseni kabla ya kusakinisha $(^NameDA)."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "Ikiwa unakubali masharti ya makubaliano, bofya Ninakubali ili kuendelea. Ni lazima ukubali makubaliano ya kusakinisha $(^NameDA)."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "Ikiwa unakubali masharti ya makubaliano, bofya kisanduku tiki hapa chini. Ni lazima ukubali makubaliano ya kusakinisha $(^NameDA). $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Ikiwa unakubali masharti ya makubaliano, chagua chaguo la kwanza hapa chini. Ni lazima ukubali makubaliano ya kusakinisha $(^NameDA). $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "Mkataba wa Leseni"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "Tafadhali kagua masharti ya leseni kabla ya kusanidua $(^NameDA)."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "Ikiwa unakubali masharti ya makubaliano, bofya Ninakubali ili kuendelea. Lazima ukubali makubaliano ya kusanidua $(^NameDA)."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "Ikiwa unakubali masharti ya makubaliano, bofya kisanduku tiki hapa chini. Lazima ukubali makubaliano ya kusanidua $(^NameDA). $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Ikiwa unakubali masharti ya makubaliano, chagua chaguo la kwanza hapa chini. Lazima ukubali makubaliano ya kusanidua $(^NameDA). $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "Bonyeza Ukurasa Chini ili kuona makubaliano mengine."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "Chagua Vipengele"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "Chagua ni vipengele vipi vya $(^NameDA) ungependa kusakinisha."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "Chagua Vipengele"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "Chagua ni vipengele vipi vya $(^NameDA) ungependa kusanidua."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "Maelezo"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Weka kipanya chako juu ya kijenzi ili kuona maelezo yake."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Chagua kijenzi ili kuona maelezo yake."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "Chagua Mahali pa Kusakinisha"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "Chagua folda ambayo usakinishe $(^NameDA)."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "Chagua Mahali pa Kuondoa"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "Chagua folda ambayo unaweza kuondoa $(^NameDA)."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "Inasakinisha"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "Tafadhali subiri wakati $(^NameDA) inasakinishwa."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "Ufungaji Umekamilika"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "Usanidi umekamilika."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "Usakinishaji Umeghairiwa"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "Usanidi haujakamilika."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "Inaondoa"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "Tafadhali subiri wakati $(^NameDA) inatolewa."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "Uondoaji Umekamilika"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "Kuondoa kulikamilishwa."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "Uondoaji Umeghairiwa"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "Uondoaji haukukamilika."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "Inakamilisha Usanidi wa $(^NameDA)"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) imesakinishwa kwenye kompyuta yako.$\r$\n$\r$\n Bofya Maliza ili kufunga Kuweka."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "Kompyuta yako lazima iwashwe upya ili kukamilisha usakinishaji wa $(^NameDA). Je, ungependa kuwasha upya sasa?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "Inakamilisha Kuondoa $(^NameDA)"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) imetolewa kutoka kwa kompyuta yako.$\r$\n$\r$\n Bofya Maliza ili kufunga Kuweka."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "Kompyuta yako lazima iwashwe upya ili kukamilisha uondoaji wa $(^NameDA). Je, ungependa kuwasha upya sasa?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "Washa upya sasa"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "Ninataka kuwasha upya mwenyewe baadaye"
  ${LangFileString} MUI_TEXT_FINISH_RUN "&Endesha $(^NameDA)"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Onyesha Readme"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "&Maliza"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "Chagua Folda ya Menyu ya Anza"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "Chagua folda ya Menyu ya Anza kwa njia za mkato za $(^NameDA)."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "Chagua folda ya Menyu ya Mwanzo ambayo ungependa kuunda njia za mkato za programu. Unaweza pia kuingiza jina ili kuunda folda mpya."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "Usiunde njia za mkato"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "Ondoa $(^NameDA)"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "Ondoa $(^NameDA) kutoka kwa kompyuta yako."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "Je, una uhakika unataka kuacha Kuweka Mipangilio ya $(^Name)?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "Je, una uhakika unataka kuacha Kuondoa $(^Name)?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "Chagua Watumiaji"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "Chagua watumiaji gani ungependa kusakinisha $(^NameDA)."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "Chagua kama ungependa kusakinisha $(^NameDA) kwa ajili yako tu au kwa watumiaji wote wa kompyuta hii. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "Sakinisha kwa mtu yeyote anayetumia kompyuta hii"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "Sakinisha kwa ajili yangu tu"
!endif
