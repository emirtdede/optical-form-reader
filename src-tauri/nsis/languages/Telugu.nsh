;Language: Telugu (1098)
;By Joost Verburg

!insertmacro LANGFILE "Telugu" "Telugu" "తెలుగు" "Telugu" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) సెటప్‌కి స్వాగతం"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "$(^NameDA) యొక్క ఇన్‌స్టాలేషన్ ద్వారా సెటప్ మీకు మార్గనిర్దేశం చేస్తుంది.$\r$\n$\r$\n సెటప్‌ను ప్రారంభించే ముందు మీరు అన్ని ఇతర అప్లికేషన్‌లను మూసివేయాలని సిఫార్సు చేయబడింది. ఇది మీ కంప్యూటర్‌ను రీబూట్ చేయకుండానే సంబంధిత సిస్టమ్ ఫైల్‌లను నవీకరించడం సాధ్యం చేస్తుంది.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) అన్‌ఇన్‌స్టాల్‌కు స్వాగతం"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "$(^NameDA) అన్‌ఇన్‌స్టాలేషన్ ద్వారా సెటప్ మీకు మార్గనిర్దేశం చేస్తుంది.$\r$\n$\r$\n అన్‌ఇన్‌స్టాలేషన్‌ను ప్రారంభించే ముందు, $(^NameDA) అమలులో లేదని నిర్ధారించుకోండి.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "లైసెన్స్ ఒప్పందం"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "దయచేసి $(^NameDA)ని ఇన్‌స్టాల్ చేసే ముందు లైసెన్స్ నిబంధనలను సమీక్షించండి."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "మీరు ఒప్పందం యొక్క నిబంధనలను అంగీకరిస్తే, కొనసాగించడానికి నేను అంగీకరిస్తున్నాను క్లిక్ చేయండి. $(^NameDA)ని ఇన్‌స్టాల్ చేయడానికి మీరు తప్పనిసరిగా ఒప్పందాన్ని అంగీకరించాలి."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "మీరు ఒప్పందం యొక్క నిబంధనలను అంగీకరిస్తే, దిగువ చెక్ బాక్స్‌ను క్లిక్ చేయండి. $(^NameDA)ని ఇన్‌స్టాల్ చేయడానికి మీరు తప్పనిసరిగా ఒప్పందాన్ని అంగీకరించాలి. $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "మీరు ఒప్పందం యొక్క నిబంధనలను అంగీకరిస్తే, దిగువ మొదటి ఎంపికను ఎంచుకోండి. $(^NameDA)ని ఇన్‌స్టాల్ చేయడానికి మీరు తప్పనిసరిగా ఒప్పందాన్ని అంగీకరించాలి. $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "లైసెన్స్ ఒప్పందం"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "దయచేసి $(^NameDA)ని అన్‌ఇన్‌స్టాల్ చేసే ముందు లైసెన్స్ నిబంధనలను సమీక్షించండి."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "మీరు ఒప్పందం యొక్క నిబంధనలను అంగీకరిస్తే, కొనసాగించడానికి నేను అంగీకరిస్తున్నాను క్లిక్ చేయండి. $(^NameDA)ని అన్‌ఇన్‌స్టాల్ చేయడానికి మీరు ఒప్పందాన్ని తప్పనిసరిగా ఆమోదించాలి."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "మీరు ఒప్పందం యొక్క నిబంధనలను అంగీకరిస్తే, దిగువ చెక్ బాక్స్‌ను క్లిక్ చేయండి. $(^NameDA)ని అన్‌ఇన్‌స్టాల్ చేయడానికి మీరు ఒప్పందాన్ని తప్పనిసరిగా ఆమోదించాలి. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "మీరు ఒప్పందం యొక్క నిబంధనలను అంగీకరిస్తే, దిగువ మొదటి ఎంపికను ఎంచుకోండి. $(^NameDA)ని అన్‌ఇన్‌స్టాల్ చేయడానికి మీరు ఒప్పందాన్ని తప్పనిసరిగా ఆమోదించాలి. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "మిగిలిన ఒప్పందాన్ని చూడటానికి పేజ్ డౌన్ నొక్కండి."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "భాగాలు ఎంచుకోండి"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "మీరు ఇన్‌స్టాల్ చేయాలనుకుంటున్న $(^NameDA) ఫీచర్‌లను ఎంచుకోండి."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "భాగాలు ఎంచుకోండి"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "మీరు అన్‌ఇన్‌స్టాల్ చేయాలనుకుంటున్న $(^NameDA) ఫీచర్లను ఎంచుకోండి."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "వివరణ"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "దాని వివరణను చూడటానికి మీ మౌస్‌ని ఒక కాంపోనెంట్‌పై ఉంచండి."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "దాని వివరణను చూడటానికి ఒక భాగాన్ని ఎంచుకోండి."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "ఇన్‌స్టాల్ లొకేషన్‌ని ఎంచుకోండి"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) ఇన్‌స్టాల్ చేయాల్సిన ఫోల్డర్‌ను ఎంచుకోండి."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "అన్‌ఇన్‌స్టాల్ లొకేషన్‌ని ఎంచుకోండి"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA)ని అన్‌ఇన్‌స్టాల్ చేసే ఫోల్డర్‌ను ఎంచుకోండి."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "ఇన్‌స్టాల్ చేస్తోంది"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "దయచేసి $(^NameDA) ఇన్‌స్టాల్ అవుతున్నప్పుడు వేచి ఉండండి."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "ఇన్‌స్టాలేషన్ పూర్తయింది"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "సెటప్ విజయవంతంగా పూర్తయింది."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "ఇన్‌స్టాలేషన్ నిలిపివేయబడింది"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "సెటప్ విజయవంతంగా పూర్తి కాలేదు."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "అన్‌ఇన్‌స్టాల్ చేస్తోంది"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "$(^NameDA) అన్‌ఇన్‌స్టాల్ చేస్తున్నప్పుడు దయచేసి వేచి ఉండండి."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "అన్‌ఇన్‌స్టాలేషన్ పూర్తయింది"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "అన్‌ఇన్‌స్టాల్ విజయవంతంగా పూర్తయింది."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "అన్‌ఇన్‌స్టాలేషన్ నిలిపివేయబడింది"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "అన్‌ఇన్‌స్టాల్ విజయవంతంగా పూర్తి కాలేదు."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) సెటప్‌ని పూర్తి చేస్తోంది"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) మీ కంప్యూటర్‌లో ఇన్‌స్టాల్ చేయబడింది.$\r$\n$\r$\n సెటప్‌ను మూసివేయడానికి ముగించు క్లిక్ చేయండి."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA) యొక్క ఇన్‌స్టాలేషన్‌ను పూర్తి చేయడానికి మీ కంప్యూటర్ తప్పనిసరిగా పునఃప్రారంభించబడాలి. మీరు ఇప్పుడు రీబూట్ చేయాలనుకుంటున్నారా?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) అన్‌ఇన్‌స్టాల్‌ని పూర్తి చేస్తోంది"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) మీ కంప్యూటర్ నుండి అన్‌ఇన్‌స్టాల్ చేయబడింది.$\r$\n$\r$\n సెటప్‌ను మూసివేయడానికి ముగించు క్లిక్ చేయండి."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA) అన్‌ఇన్‌స్టాలేషన్‌ను పూర్తి చేయడానికి మీ కంప్యూటర్ తప్పనిసరిగా పునఃప్రారంభించబడాలి. మీరు ఇప్పుడు రీబూట్ చేయాలనుకుంటున్నారా?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "ఇప్పుడే రీబూట్ చేయండి"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "నేను తర్వాత మాన్యువల్‌గా రీబూట్ చేయాలనుకుంటున్నాను"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA)ని అమలు చేయండి"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "రీడ్‌మీని చూపించు"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "ముగించు"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "ప్రారంభ మెను ఫోల్డర్‌ని ఎంచుకోండి"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) సత్వరమార్గాల కోసం ప్రారంభ మెను ఫోల్డర్‌ను ఎంచుకోండి."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "మీరు ప్రోగ్రామ్ యొక్క సత్వరమార్గాలను సృష్టించాలనుకుంటున్న ప్రారంభ మెను ఫోల్డర్‌ను ఎంచుకోండి. మీరు కొత్త ఫోల్డర్‌ను సృష్టించడానికి పేరును కూడా నమోదు చేయవచ్చు."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "సత్వరమార్గాలను సృష్టించవద్దు"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA)ని అన్‌ఇన్‌స్టాల్ చేయండి"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "మీ కంప్యూటర్ నుండి $(^NameDA)ని తీసివేయండి."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "మీరు ఖచ్చితంగా $(^Name) సెటప్ నుండి నిష్క్రమించాలనుకుంటున్నారా?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "మీరు ఖచ్చితంగా $(^Name) అన్‌ఇన్‌స్టాల్ నుండి నిష్క్రమించాలనుకుంటున్నారా?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "వినియోగదారులను ఎంచుకోండి"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "మీరు $(^NameDA)ని ఏ వినియోగదారుల కోసం ఇన్‌స్టాల్ చేయాలనుకుంటున్నారో ఎంచుకోండి."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "మీరు $(^NameDA)ని మీ కోసం లేదా ఈ కంప్యూటర్‌లోని వినియోగదారులందరి కోసం మాత్రమే ఇన్‌స్టాల్ చేయాలనుకుంటున్నారా అని ఎంచుకోండి. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "ఈ కంప్యూటర్‌ని ఉపయోగించే ఎవరికైనా ఇన్‌స్టాల్ చేయండి"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "నా కోసం మాత్రమే ఇన్‌స్టాల్ చేయండి"
!endif
