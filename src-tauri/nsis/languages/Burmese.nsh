;Language: Burmese (1109)
;By Joost Verburg

!insertmacro LANGFILE "Burmese" "Burmese" "မြန်မာ" "Myanmar" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) Setup မှကြိုဆိုပါသည်။"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "စနစ်ထည့်သွင်းမှုသည် $(^NameDA) တပ်ဆင်မှုမှတစ်ဆင့် သင့်ကို လမ်းညွှန်ပေးမည်ဖြစ်သည်။$\r$\n$\r$\n တပ်ဆင်မှုမစတင်မီ အခြားအပလီကေးရှင်းအားလုံးကို ပိတ်ရန် အကြံပြုထားသည်။ ၎င်းသည် သင့်ကွန်ပြူတာကို ပြန်လည်စတင်ရန်မလိုဘဲ သက်ဆိုင်ရာစနစ်ဖိုင်များကို အပ်ဒိတ်လုပ်နိုင်ပါသည်။$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) ဖြုတ်ပါ။ မှလှိုက်လှဲစွာကြိုဆိုပါသည်။"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "စနစ်ထည့်သွင်းခြင်းသည် $(^NameDA) ကို ဖြုတ်ချခြင်းတွင် သင့်အား လမ်းညွှန်ပေးပါမည်။$\r$\n$\r$\n ဖယ်ရှားခြင်းကို မစတင်မီ၊ $(^NameDA) မလည်ပတ်ကြောင်း သေချာပါစေ။$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "လိုင်စင်သဘောတူညီချက်"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "$(^NameDA) ကိုမထည့်သွင်းမီ လိုင်စင်စည်းကမ်းချက်များကို ပြန်လည်သုံးသပ်ပါ။"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "သဘောတူညီချက်၏ စည်းကမ်းချက်များကို သင်လက်ခံပါက ရှေ့ဆက်ရန် ငါ သဘောတူတယ်။ ကိုနှိပ်ပါ။ $(^NameDA) ထည့်သွင်းရန် သဘောတူညီချက်ကို သင်လက်ခံရပါမည်။"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "သဘောတူညီချက်၏ စည်းကမ်းချက်များကို သင်လက်ခံပါက အောက်ပါ checkbox ကိုနှိပ်ပါ။ $(^NameDA) ထည့်သွင်းရန် သဘောတူညီချက်ကို သင်လက်ခံရပါမည်။ $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "သဘောတူညီချက်၏ စည်းကမ်းချက်များကို သင်လက်ခံပါက၊ အောက်ဖော်ပြပါ ပထမရွေးချယ်မှုကို ရွေးချယ်ပါ။ $(^NameDA) ထည့်သွင်းရန် သဘောတူညီချက်ကို သင်လက်ခံရပါမည်။ $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "လိုင်စင်သဘောတူညီချက်"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "$(^NameDA) ကိုမဖြုတ်မီ လိုင်စင်စည်းကမ်းချက်များကို ပြန်လည်သုံးသပ်ပါ။"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "သဘောတူညီချက်၏ စည်းကမ်းချက်များကို သင်လက်ခံပါက ရှေ့ဆက်ရန် ငါ သဘောတူတယ်။ ကိုနှိပ်ပါ။ $(^NameDA) ကိုဖြုတ်ရန် သဘောတူညီချက်ကို သင်လက်ခံရပါမည်။"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "သဘောတူညီချက်၏ စည်းကမ်းချက်များကို သင်လက်ခံပါက အောက်ပါ checkbox ကိုနှိပ်ပါ။ $(^NameDA) ကိုဖြုတ်ရန် သဘောတူညီချက်ကို သင်လက်ခံရပါမည်။ $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "သဘောတူညီချက်၏ စည်းကမ်းချက်များကို သင်လက်ခံပါက၊ အောက်ဖော်ပြပါ ပထမရွေးချယ်မှုကို ရွေးချယ်ပါ။ $(^NameDA) ကိုဖြုတ်ရန် သဘောတူညီချက်ကို သင်လက်ခံရပါမည်။ $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "ကျန်သဘောတူညီချက်များကိုကြည့်ရှုရန် Page Down ကိုနှိပ်ပါ။"
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "အစိတ်အပိုင်းများကို ရွေးပါ။"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "သင်ထည့်သွင်းလိုသော $(^NameDA) ၏ အင်္ဂါရပ်များကို ရွေးချယ်ပါ။"
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "အစိတ်အပိုင်းများကို ရွေးပါ။"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "သင်ဖြုတ်လိုသော $(^NameDA) ၏ အင်္ဂါရပ်များကို ရွေးပါ။"
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "ဖော်ပြချက်"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "၎င်း၏ဖော်ပြချက်ကိုကြည့်ရန် သင်၏မောက်စ်ကို အစိတ်အပိုင်းတစ်ခုပေါ်တွင် နေရာချထားပါ။"
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "၎င်း၏ဖော်ပြချက်ကိုကြည့်ရန် အစိတ်အပိုင်းတစ်ခုကို ရွေးပါ။"
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "တပ်ဆင်ပါ။ Location ကို ရွေးပါ။"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) ထည့်သွင်းရန် ဖိုင်တွဲကို ရွေးချယ်ပါ။"
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "ဖြုတ်ပါ။ Location ကို ရွေးပါ။"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA) ကို ဖြုတ်ရန် ဖိုင်တွဲကို ရွေးပါ။"
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "တပ်ဆင်ခြင်း။"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "$(^NameDA) ကို ထည့်သွင်းနေစဉ် စောင့်ဆိုင်းပါ။"
  ${LangFileString} MUI_TEXT_FINISH_TITLE "တပ်ဆင်မှု အပြီးအစီး"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "စနစ်ထည့်သွင်းမှု အောင်မြင်စွာပြီးမြောက်ခဲ့သည်။"
  ${LangFileString} MUI_TEXT_ABORT_TITLE "တပ်ဆင်မှုကို ဖျက်သိမ်းထားသည်။"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "စနစ်ထည့်သွင်းမှု မပြီးမြောက်ခဲ့ပါ။"
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "ဖြုတ်နေသည်"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "$(^NameDA) ကို ဖြုတ်နေချိန်တွင် စောင့်ပါ။"
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "Uninstallation အပြီးသတ်"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "ဖြုတ်ပါ။ ကို အောင်မြင်စွာ ပြီးဆုံးသွားပါပြီ။"
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "ဖြုတ်ချခြင်းကို ဖျက်သိမ်းထားသည်။"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "ဖြုတ်ပါ။ ကို အောင်မြင်စွာ မပြီးမြောက်ခဲ့ပါ။"
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) စနစ်ထည့်သွင်းမှု အပြီးသတ်ခြင်း။"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) ကို သင့်ကွန်ပြူတာတွင် ထည့်သွင်းထားပါသည်။$\r$\n$\r$\n Setup ကိုပိတ်ရန် ပြီးအောင် ကိုနှိပ်ပါ။"
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA) တပ်ဆင်ခြင်းကို အပြီးသတ်ရန်အတွက် သင့်ကွန်ပျူတာကို ပြန်လည်စတင်ရပါမည်။ ယခု ပြန်လည်စတင်လိုပါသလား။"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) ဖြုတ်ပါ။ ပြီးအောင်လုပ်ခြင်း။"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) ကို သင့်ကွန်ပြူတာမှ ဖြုတ်လိုက်ပါပြီ။$\r$\n$\r$\n သတ်မှတ်မှုကို ပိတ်ရန် ပြီးအောင် ကို နှိပ်ပါ။"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA) ကို ဖြုတ်ချခြင်းကို အပြီးသတ်ရန်အတွက် သင့်ကွန်ပျူတာကို ပြန်လည်စတင်ရပါမည်။ ယခု ပြန်လည်စတင်လိုပါသလား။"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "ယခု ပြန်ဖွင့်ပါ။"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "ကျွန်ုပ်သည် နောက်ပိုင်းတွင် ကိုယ်တိုင်ပြန်ဖွင့်လိုပါသည်။"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA) ကိုဖွင့်ပါ။"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Readme ကိုပြပါ။"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "ပြီးအောင်"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "Start Menu Folder ကို ရွေးပါ။"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) ဖြတ်လမ်းများအတွက် Start Menu ဖိုဒါကို ရွေးပါ။"
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "ပရိုဂရမ်၏ ဖြတ်လမ်းလင့်ခ်များကို သင်ဖန်တီးလိုသည့် Start Menu ဖိုဒါကို ရွေးချယ်ပါ။ ဖိုင်တွဲအသစ်တစ်ခုဖန်တီးရန် အမည်တစ်ခုကိုလည်း ထည့်သွင်းနိုင်သည်။"
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "ဖြတ်လမ်းများ မဖန်တီးပါနှင့်"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA) ကိုဖြုတ်ပါ။"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "သင်၏ကွန်ပျူတာမှ $(^NameDA) ကိုဖယ်ရှားပါ။"
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "$(^Name) စနစ်ထည့်သွင်းခြင်းမှ ထွက်လိုသည်မှာ သေချာပါသလား။"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "$(^Name) ဖြုတ်ပါ။ မှထွက်လိုသည်မှာ သေချာပါသလား။"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "အသုံးပြုသူများကို ရွေးချယ်ပါ။"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "$(^NameDA) ကို ထည့်သွင်းလိုသည့် သုံးစွဲသူများအတွက် ရွေးချယ်ပါ။"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "$(^NameDA) ကို သင်ကိုယ်တိုင် သို့မဟုတ် ဤကွန်ပြူတာအသုံးပြုသူအားလုံးအတွက်သာ တပ်ဆင်လိုသည်ဖြစ်စေ ရွေးချယ်ပါ။ $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "ဤကွန်ပြူတာအသုံးပြုသူတိုင်းအတွက် ထည့်သွင်းပါ။"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "ကျွန်ုပ်အတွက်သာ ထည့်သွင်းပါ။"
!endif
