;Language: Sinhala (1115)
;By Joost Verburg

!insertmacro LANGFILE "Sinhala" "Sinhala" "සිංහල" "Sinhala" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) සැකසුම වෙත සාදරයෙන් පිළිගනිමු"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "සැකසුම $(^NameDA) ස්ථාපනය හරහා ඔබට මග පෙන්වනු ඇත. මෙය ඔබගේ පරිගණකය නැවත පණගැන්වීමකින් තොරව අදාල පද්ධති ගොනු යාවත්කාලීන කිරීමට හැකි වනු ඇත.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) අස්ථාපනය කිරීමට සාදරයෙන් පිළිගනිමු"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "සැකසුම ඔබට $(^NameDA) අස්ථාපනය හරහා මග පෙන්වනු ඇත.$\r$\n$\r$\n අස්ථාපනය ආරම්භ කිරීමට පෙර, $(^NameDA) ක්‍රියාත්මක නොවන බවට වග බලා ගන්න."
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "බලපත්ර ගිවිසුම"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "කරුණාකර $(^NameDA) ස්ථාපනය කිරීමට පෙර බලපත්‍ර නියමයන් සමාලෝචනය කරන්න."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "ඔබ ගිවිසුමේ නියමයන් පිළිගන්නේ නම්, ඉදිරියට යාමට මම එකඟයි ක්ලික් කරන්න. $(^NameDA) ස්ථාපනය කිරීමට ඔබ ගිවිසුම පිළිගත යුතුය."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "ඔබ ගිවිසුමේ නියමයන් පිළිගන්නේ නම්, පහත සලකුණු කොටුව ක්ලික් කරන්න. $(^NameDA) ස්ථාපනය කිරීමට ඔබ ගිවිසුම පිළිගත යුතුය. $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "ඔබ ගිවිසුමේ නියමයන් පිළිගන්නේ නම්, පහත පළමු විකල්පය තෝරන්න. $(^NameDA) ස්ථාපනය කිරීමට ඔබ ගිවිසුම පිළිගත යුතුය. $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "බලපත්ර ගිවිසුම"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "කරුණාකර $(^NameDA) අස්ථාපනය කිරීමට පෙර බලපත්‍ර නියමයන් සමාලෝචනය කරන්න."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "ඔබ ගිවිසුමේ නියමයන් පිළිගන්නේ නම්, ඉදිරියට යාමට මම එකඟයි ක්ලික් කරන්න. $(^NameDA) අස්ථාපනය කිරීමට ඔබ ගිවිසුම පිළිගත යුතුය."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "ඔබ ගිවිසුමේ නියමයන් පිළිගන්නේ නම්, පහත සලකුණු කොටුව ක්ලික් කරන්න. $(^NameDA) අස්ථාපනය කිරීමට ඔබ ගිවිසුම පිළිගත යුතුය. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "ඔබ ගිවිසුමේ නියමයන් පිළිගන්නේ නම්, පහත පළමු විකල්පය තෝරන්න. $(^NameDA) අස්ථාපනය කිරීමට ඔබ ගිවිසුම පිළිගත යුතුය. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "ගිවිසුමේ ඉතිරි කොටස බැලීමට පිටුව පහළ ඔබන්න."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "සංරචක තෝරන්න"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "ඔබට ස්ථාපනය කිරීමට අවශ්‍ය $(^NameDA) හි කුමන විශේෂාංගද යන්න තෝරන්න."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "සංරචක තෝරන්න"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "ඔබට අස්ථාපනය කිරීමට අවශ්‍ය $(^NameDA) හි කුමන විශේෂාංගද යන්න තෝරන්න."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "විස්තරය"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "එහි විස්තරය බැලීමට ඔබේ මූසිකය සංරචකයක් මත තබන්න."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "එහි විස්තරය බැලීමට සංරචකයක් තෝරන්න."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "ස්ථාපන ස්ථානය තෝරන්න"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) ස්ථාපනය කළ යුතු ෆෝල්ඩරය තෝරන්න."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "අස්ථාපනය කරන ස්ථානය තෝරන්න"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA) අස්ථාපනය කළ යුතු ෆෝල්ඩරය තෝරන්න."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "ස්ථාපනය කිරීම"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "කරුණාකර $(^NameDA) ස්ථාපනය කරන තෙක් රැඳී සිටින්න."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "ස්ථාපනය සම්පූර්ණයි"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "පිහිටුවීම සාර්ථකව නිම කරන ලදී."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "ස්ථාපනය නවත්වන ලදී"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "පිහිටුවීම සාර්ථකව සම්පූර්ණ කර නැත."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "අස්ථාපනය කිරීම"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "$(^NameDA) අස්ථාපනය කරන තෙක් කරුණාකර රැඳී සිටින්න."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "අස්ථාපනය සම්පූර්ණයි"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "අස්ථාපනය සාර්ථකව නිම කරන ලදී."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "අස්ථාපනය කිරීම අත්හිටුවා ඇත"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "අස්ථාපනය සාර්ථකව සම්පූර්ණ කර නැත."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) සැකසුම සම්පූර්ණ කරමින්"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) ඔබගේ පරිගණකයේ ස්ථාපනය කර ඇත.$\r$\n$\r$\n පිහිටුවීම වැසීමට අවසන් කරන්න ක්ලික් කරන්න."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA) ස්ථාපනය සම්පූර්ණ කිරීම සඳහා ඔබේ පරිගණකය නැවත ආරම්භ කළ යුතුය. ඔබට දැන් නැවත ආරම්භ කිරීමට අවශ්‍යද?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) අස්ථාපනය සම්පූර්ණ කරමින්"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) ඔබේ පරිගණකයෙන් අස්ථාපනය කර ඇත.$\r$\n$\r$\n පිහිටුවීම වැසීමට අවසන් කරන්න ක්ලික් කරන්න."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA) අස්ථාපනය කිරීම සම්පූර්ණ කිරීම සඳහා ඔබේ පරිගණකය නැවත ආරම්භ කළ යුතුය. ඔබට දැන් නැවත ආරම්භ කිරීමට අවශ්‍යද?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "දැන් නැවත ආරම්භ කරන්න"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "මට පසුව අතින් නැවත ආරම්භ කිරීමට අවශ්‍යයි"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA) ධාවනය කරන්න"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Readme පෙන්වන්න"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "අවසන් කරන්න"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "ආරම්භක මෙනු ෆෝල්ඩරය තෝරන්න"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) කෙටිමං සඳහා ආරම්භක මෙනු ෆෝල්ඩරයක් තෝරන්න."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "ඔබ වැඩසටහනේ කෙටිමං සෑදීමට කැමති ආරම්භක මෙනු ෆෝල්ඩරය තෝරන්න. ඔබට නව ෆෝල්ඩරයක් සෑදීමට නමක් ඇතුළත් කළ හැකිය."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "කෙටිමං සාදන්න එපා"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA) අස්ථාපනය කරන්න"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "ඔබේ පරිගණකයෙන් $(^NameDA) ඉවත් කරන්න."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "ඔබට $(^Name) සැකසුමෙන් ඉවත් වීමට අවශ්‍ය බව විශ්වාසද?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "ඔබට $(^Name) අස්ථාපනයෙන් ඉවත් වීමට අවශ්‍ය බව විශ්වාසද?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "පරිශීලකයන් තෝරන්න"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "ඔබට $(^NameDA) ස්ථාපනය කිරීමට අවශ්‍ය පරිශීලකයින් සඳහා තෝරන්න."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "ඔබට $(^NameDA) ස්ථාපනය කිරීමට අවශ්‍ය වන්නේ ඔබ සඳහා හෝ මෙම පරිගණකයේ සියලුම පරිශීලකයින් සඳහා පමණක්ද යන්න තෝරන්න. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "මෙම පරිගණකය භාවිතා කරන ඕනෑම කෙනෙකුට ස්ථාපනය කරන්න"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "මට පමණක් ස්ථාපනය කරන්න"
!endif
