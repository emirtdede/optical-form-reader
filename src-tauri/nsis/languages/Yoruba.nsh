;Language: Yoruba (1130)
;By Joost Verburg

!insertmacro LANGFILE "Yoruba" "Yoruba" "Yorùbá" "Yoruba" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "Kaabọ si Eto $(^NameDA)"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "Eto yoo ṣe itọsọna fun ọ nipasẹ fifi sori ẹrọ ti $(^NameDA).$\r$\n$\r$\n O gba ọ niyanju pe ki o pa gbogbo awọn ohun elo miiran ṣaaju ki o to bẹrẹ Eto. Eyi yoo jẹ ki o ṣee ṣe lati ṣe imudojuiwọn awọn faili eto ti o yẹ laisi nini atunbere kọnputa rẹ.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "Kaabo si $(^NameDA) Aifi si po"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "Eto yoo ṣe itọsọna fun ọ nipasẹ yiyọ kuro ti $(^NameDA).$\r$\n$\r$\n Ṣaaju ki o to bẹrẹ yiyọ kuro, rii daju pe $(^NameDA) ko ṣiṣẹ.$\r$\n$\r$\nXQ7QXZ"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "Adehun iwe-aṣẹ"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "Jọwọ ṣe ayẹwo awọn ofin iwe-aṣẹ ṣaaju fifi sori $(^NameDA)."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "Ti o ba gba awọn ofin ti adehun, tẹ Mo Gba lati tẹsiwaju. O gbọdọ gba adehun lati fi sori ẹrọ $(^NameDA)."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "Ti o ba gba awọn ofin ti adehun, tẹ apoti ayẹwo ni isalẹ. O gbọdọ gba adehun lati fi sori ẹrọ $(^NameDA). $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Ti o ba gba awọn ofin ti adehun, yan aṣayan akọkọ ni isalẹ. O gbọdọ gba adehun lati fi sori ẹrọ $(^NameDA). $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "Adehun iwe-aṣẹ"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "Jọwọ ṣe ayẹwo awọn ofin iwe-aṣẹ ṣaaju yiyọ $(^NameDA) kuro."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "Ti o ba gba awọn ofin ti adehun, tẹ Mo Gba lati tẹsiwaju. O gbọdọ gba adehun lati yọ $(^NameDA) kuro."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "Ti o ba gba awọn ofin ti adehun, tẹ apoti ayẹwo ni isalẹ. O gbọdọ gba adehun lati yọ $(^NameDA) kuro. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "Ti o ba gba awọn ofin ti adehun, yan aṣayan akọkọ ni isalẹ. O gbọdọ gba adehun lati yọ $(^NameDA) kuro. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "Tẹ Oju-iwe isalẹ lati wo iyoku adehun."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "Yan Awọn eroja"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "Yan iru awọn ẹya ti $(^NameDA) ti o fẹ fi sii."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "Yan Awọn eroja"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "Yan iru awọn ẹya ti $(^NameDA) ti o fẹ lati mu kuro."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "Apejuwe"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Gbe asin rẹ sori paati kan lati wo apejuwe rẹ."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "Yan paati kan lati wo apejuwe rẹ."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "Yan Ibi fifi sori ẹrọ"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "Yan folda ninu eyiti o le fi $(^NameDA) sori ẹrọ."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "Yan Aifi si ipo"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "Yan folda lati eyiti o le yọ $(^NameDA) kuro."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "Fifi sori ẹrọ"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "Jọwọ duro lakoko ti a ti fi $(^NameDA) sori ẹrọ."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "Fifi sori Pari"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "Iṣeto ti pari ni aṣeyọri."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "Fifi sori Aborted"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "Iṣeto ko pari ni aṣeyọri."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "Yiyokuro"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "Jọwọ duro lakoko ti a ti gbe $(^NameDA) kuro."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "Uninstallation Pari"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "Yiyo kuro ti pari ni aṣeyọri."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "Uninstallation Aborted"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "Yiyo kuro ko pari ni aṣeyọri."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "Ipari $(^NameDA) Eto"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) ti fi sori ẹrọ kọmputa rẹ.$\r$\n$\r$\n Tẹ Pari lati pa Eto."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "Kọmputa rẹ gbọdọ tun bẹrẹ lati le pari fifi sori ẹrọ ti $(^NameDA). Ṣe o fẹ atunbere ni bayi?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "Ipari $(^NameDA) aifi si po"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) ti jẹ yiyọ kuro lati kọnputa rẹ.$\r$\n$\r$\n Tẹ Pari lati pa Eto."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "Kọmputa rẹ gbọdọ tun bẹrẹ lati le pari yiyọ kuro ti $(^NameDA). Ṣe o fẹ atunbere ni bayi?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "Atunbere bayi"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "Mo fẹ lati tun bẹrẹ pẹlu ọwọ nigbamii"
  ${LangFileString} MUI_TEXT_FINISH_RUN "Ṣ&iṣe $(^NameDA)"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "Ṣ&e afihan Readme"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "&Pari"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "Yan Ibẹrẹ Akojọ Folda"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "Yan folda Akojọ aṣyn fun awọn ọna abuja $(^NameDA)."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "Yan folda Akojọ aṣyn ninu eyiti iwọ yoo fẹ lati ṣẹda awọn ọna abuja eto naa. O tun le tẹ orukọ sii lati ṣẹda folda titun kan."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "Ma ṣe ṣẹda awọn ọna abuja"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "Yọ $(^NameDA) kuro"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "Yọ $(^NameDA) lati kọmputa rẹ."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "Ṣe o da ọ loju pe o fẹ lati fi eto $(^Name) silẹ bi?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "Ṣe o da ọ loju pe o fẹ fi $(^Name) kuro bi?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "Yan Awọn olumulo"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "Yan fun iru awọn olumulo ti o fẹ fi $(^NameDA) sori ẹrọ."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "Yan boya o fẹ fi $(^NameDA) sori ẹrọ nikan fun ararẹ tabi fun gbogbo awọn olumulo kọnputa yii. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "Fi sori ẹrọ fun ẹnikẹni ti o nlo kọnputa yii"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "Fi sori ẹrọ nikan fun mi"
!endif
