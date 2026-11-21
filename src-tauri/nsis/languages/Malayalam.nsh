;Language: Malayalam (1100)
;By Joost Verburg

!insertmacro LANGFILE "Malayalam" "Malayalam" "മലയാളം" "Malayalam" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) സജ്ജീകരണത്തിലേക്ക് സ്വാഗതം"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "$(^NameDA)-ൻ്റെ ഇൻസ്റ്റാളേഷനിലൂടെ സജ്ജീകരണം നിങ്ങളെ നയിക്കും. നിങ്ങളുടെ കമ്പ്യൂട്ടർ റീബൂട്ട് ചെയ്യാതെ തന്നെ പ്രസക്തമായ സിസ്റ്റം ഫയലുകൾ അപ്ഡേറ്റ് ചെയ്യുന്നത് ഇത് സാധ്യമാക്കും.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) അൺഇൻസ്റ്റാളിലേക്ക് സ്വാഗതം"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "$(^NameDA)-ൻ്റെ അൺഇൻസ്റ്റാളേഷനിലൂടെ സജ്ജീകരണം നിങ്ങളെ നയിക്കും."
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "ലൈസൻസ് കരാർ"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "$(^NameDA) ഇൻസ്റ്റാൾ ചെയ്യുന്നതിന് മുമ്പ് ലൈസൻസ് നിബന്ധനകൾ അവലോകനം ചെയ്യുക."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "കരാറിൻ്റെ നിബന്ധനകൾ നിങ്ങൾ അംഗീകരിക്കുകയാണെങ്കിൽ, തുടരാൻ ഞാൻ അംഗീകരിക്കുന്നു ക്ലിക്ക് ചെയ്യുക. $(^NameDA) ഇൻസ്റ്റാൾ ചെയ്യുന്നതിനുള്ള കരാർ നിങ്ങൾ അംഗീകരിക്കണം."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "കരാറിൻ്റെ നിബന്ധനകൾ നിങ്ങൾ അംഗീകരിക്കുകയാണെങ്കിൽ, ചുവടെയുള്ള ചെക്ക് ബോക്സിൽ ക്ലിക്കുചെയ്യുക. $(^NameDA) ഇൻസ്റ്റാൾ ചെയ്യുന്നതിനുള്ള കരാർ നിങ്ങൾ അംഗീകരിക്കണം. $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "കരാറിൻ്റെ നിബന്ധനകൾ നിങ്ങൾ അംഗീകരിക്കുകയാണെങ്കിൽ, ചുവടെയുള്ള ആദ്യ ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക. $(^NameDA) ഇൻസ്റ്റാൾ ചെയ്യുന്നതിനുള്ള കരാർ നിങ്ങൾ അംഗീകരിക്കണം. $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "ലൈസൻസ് കരാർ"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "$(^NameDA) അൺഇൻസ്റ്റാൾ ചെയ്യുന്നതിന് മുമ്പ് ലൈസൻസ് നിബന്ധനകൾ അവലോകനം ചെയ്യുക."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "കരാറിൻ്റെ നിബന്ധനകൾ നിങ്ങൾ അംഗീകരിക്കുകയാണെങ്കിൽ, തുടരാൻ ഞാൻ അംഗീകരിക്കുന്നു ക്ലിക്ക് ചെയ്യുക. $(^NameDA) അൺഇൻസ്റ്റാൾ ചെയ്യുന്നതിനുള്ള കരാർ നിങ്ങൾ അംഗീകരിക്കണം."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "കരാറിൻ്റെ നിബന്ധനകൾ നിങ്ങൾ അംഗീകരിക്കുകയാണെങ്കിൽ, ചുവടെയുള്ള ചെക്ക് ബോക്സിൽ ക്ലിക്കുചെയ്യുക. $(^NameDA) അൺഇൻസ്റ്റാൾ ചെയ്യുന്നതിനുള്ള കരാർ നിങ്ങൾ അംഗീകരിക്കണം. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "കരാറിൻ്റെ നിബന്ധനകൾ നിങ്ങൾ അംഗീകരിക്കുകയാണെങ്കിൽ, ചുവടെയുള്ള ആദ്യ ഓപ്ഷൻ തിരഞ്ഞെടുക്കുക. $(^NameDA) അൺഇൻസ്റ്റാൾ ചെയ്യുന്നതിനുള്ള കരാർ നിങ്ങൾ അംഗീകരിക്കണം. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "കരാറിൻ്റെ ബാക്കി ഭാഗം കാണാൻ പേജ് ഡൗൺ അമർത്തുക."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "ഘടകങ്ങൾ തിരഞ്ഞെടുക്കുക"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "നിങ്ങൾ ഇൻസ്റ്റാൾ ചെയ്യാൻ ആഗ്രഹിക്കുന്ന $(^NameDA)-ൻ്റെ സവിശേഷതകൾ തിരഞ്ഞെടുക്കുക."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "ഘടകങ്ങൾ തിരഞ്ഞെടുക്കുക"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "$(^NameDA)-ൻ്റെ ഏതൊക്കെ സവിശേഷതകൾ നിങ്ങൾ അൺഇൻസ്റ്റാൾ ചെയ്യണമെന്ന് തിരഞ്ഞെടുക്കുക."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "വിവരണം"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "അതിൻ്റെ വിവരണം കാണുന്നതിന് നിങ്ങളുടെ മൗസ് ഒരു ഘടകത്തിന് മുകളിൽ വയ്ക്കുക."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "അതിൻ്റെ വിവരണം കാണുന്നതിന് ഒരു ഘടകം തിരഞ്ഞെടുക്കുക."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "ഇൻസ്റ്റാൾ ലൊക്കേഷൻ തിരഞ്ഞെടുക്കുക"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "$(^NameDA) ഇൻസ്റ്റാൾ ചെയ്യേണ്ട ഫോൾഡർ തിരഞ്ഞെടുക്കുക."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "അൺഇൻസ്റ്റാൾ ലൊക്കേഷൻ തിരഞ്ഞെടുക്കുക"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "$(^NameDA) അൺഇൻസ്റ്റാൾ ചെയ്യേണ്ട ഫോൾഡർ തിരഞ്ഞെടുക്കുക."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "ഇൻസ്റ്റാൾ ചെയ്യുന്നു"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "$(^NameDA) ഇൻസ്റ്റാൾ ചെയ്യുമ്പോൾ ദയവായി കാത്തിരിക്കുക."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "ഇൻസ്റ്റലേഷൻ പൂർത്തിയായി"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "സജ്ജീകരണം വിജയകരമായി പൂർത്തിയാക്കി."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "ഇൻസ്റ്റലേഷൻ നിർത്തി"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "സജ്ജീകരണം വിജയകരമായി പൂർത്തിയാക്കിയില്ല."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "അൺഇൻസ്റ്റാൾ ചെയ്യുന്നു"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "$(^NameDA) അൺഇൻസ്റ്റാൾ ചെയ്യുമ്പോൾ ദയവായി കാത്തിരിക്കുക."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "അൺഇൻസ്റ്റാളേഷൻ പൂർത്തിയായി"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "അൺഇൻസ്റ്റാൾ വിജയകരമായി പൂർത്തിയാക്കി."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "അൺഇൻസ്റ്റാളേഷൻ നിർത്തി"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "അൺഇൻസ്റ്റാൾ വിജയകരമായി പൂർത്തിയാക്കിയില്ല."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) സജ്ജീകരണം പൂർത്തിയാക്കുന്നു"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) നിങ്ങളുടെ കമ്പ്യൂട്ടറിൽ ഇൻസ്റ്റാൾ ചെയ്തു.$\r$\n$\r$\n സജ്ജീകരണം അടയ്ക്കുന്നതിന് പൂർത്തിയാക്കുക ക്ലിക്കുചെയ്യുക."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA)-ൻ്റെ ഇൻസ്റ്റാളേഷൻ പൂർത്തിയാക്കാൻ നിങ്ങളുടെ കമ്പ്യൂട്ടർ പുനരാരംഭിക്കേണ്ടതുണ്ട്. നിങ്ങൾക്ക് ഇപ്പോൾ റീബൂട്ട് ചെയ്യണോ?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) അൺഇൻസ്റ്റാൾ പൂർത്തിയാക്കുന്നു"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "നിങ്ങളുടെ കമ്പ്യൂട്ടറിൽ നിന്ന് $(^NameDA) അൺഇൻസ്റ്റാൾ ചെയ്‌തു.$\r$\n$\r$\n സജ്ജീകരണം അടയ്ക്കുന്നതിന് പൂർത്തിയാക്കുക ക്ലിക്കുചെയ്യുക."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA)-ൻ്റെ അൺഇൻസ്റ്റാളേഷൻ പൂർത്തിയാക്കാൻ നിങ്ങളുടെ കമ്പ്യൂട്ടർ പുനരാരംഭിക്കേണ്ടതുണ്ട്. നിങ്ങൾക്ക് ഇപ്പോൾ റീബൂട്ട് ചെയ്യണോ?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "ഇപ്പോൾ റീബൂട്ട് ചെയ്യുക"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "എനിക്ക് പിന്നീട് സ്വമേധയാ റീബൂട്ട് ചെയ്യണം"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA) പ്രവർത്തിപ്പിക്കുക"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "&Readme കാണിക്കുക"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "പൂർത്തിയാക്കുക"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "ആരംഭ മെനു ഫോൾഡർ തിരഞ്ഞെടുക്കുക"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) കുറുക്കുവഴികൾക്കായി ഒരു ആരംഭ മെനു ഫോൾഡർ തിരഞ്ഞെടുക്കുക."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "പ്രോഗ്രാമിൻ്റെ കുറുക്കുവഴികൾ സൃഷ്ടിക്കാൻ നിങ്ങൾ ആഗ്രഹിക്കുന്ന ആരംഭ മെനു ഫോൾഡർ തിരഞ്ഞെടുക്കുക. ഒരു പുതിയ ഫോൾഡർ സൃഷ്ടിക്കാൻ നിങ്ങൾക്ക് ഒരു പേര് നൽകാനും കഴിയും."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "കുറുക്കുവഴികൾ സൃഷ്ടിക്കരുത്"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA) അൺഇൻസ്റ്റാൾ ചെയ്യുക"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "നിങ്ങളുടെ കമ്പ്യൂട്ടറിൽ നിന്ന് $(^NameDA) നീക്കം ചെയ്യുക."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "$(^Name) സജ്ജീകരണം ഉപേക്ഷിക്കണമെന്ന് തീർച്ചയാണോ?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "$(^Name) അൺഇൻസ്റ്റാൾ ഉപേക്ഷിക്കണമെന്ന് തീർച്ചയാണോ?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "ഉപയോക്താക്കളെ തിരഞ്ഞെടുക്കുക"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "ഏത് ഉപയോക്താക്കൾക്കാണ് $(^NameDA) ഇൻസ്റ്റാൾ ചെയ്യേണ്ടതെന്ന് തിരഞ്ഞെടുക്കുക."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "$(^NameDA) നിങ്ങൾക്കായി മാത്രമാണോ അല്ലെങ്കിൽ ഈ കമ്പ്യൂട്ടറിൻ്റെ എല്ലാ ഉപയോക്താക്കൾക്കുമായി ഇൻസ്റ്റാൾ ചെയ്യണോ എന്ന് തിരഞ്ഞെടുക്കുക. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "ഈ കമ്പ്യൂട്ടർ ഉപയോഗിക്കുന്ന ആർക്കും ഇൻസ്റ്റാൾ ചെയ്യുക"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "എനിക്കായി മാത്രം ഇൻസ്റ്റാൾ ചെയ്യുക"
!endif
