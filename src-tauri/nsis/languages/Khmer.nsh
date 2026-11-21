;Language: Khmer (1107)
;By Joost Verburg

!insertmacro LANGFILE "Khmer" "Khmer" "ខ្មែរ" "Khmer" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "សូមស្វាគមន៍មកកាន់ការដំឡើង $(^NameDA)"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "ការដំឡើងនឹងណែនាំអ្នកតាមរយៈការដំឡើង $(^NameDA).$\r$\n$\r$\n វាត្រូវបានណែនាំឱ្យអ្នកបិទកម្មវិធីផ្សេងទៀតទាំងអស់មុនពេលចាប់ផ្តើមការដំឡើង។ វានឹងធ្វើឱ្យវាអាចធ្វើបច្ចុប្បន្នភាពឯកសារប្រព័ន្ធដែលពាក់ព័ន្ធដោយមិនចាំបាច់ចាប់ផ្ដើមកុំព្យូទ័ររបស់អ្នកឡើងវិញ។$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "សូមស្វាគមន៍មកកាន់ $(^NameDA) លុប"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "ការដំឡើងនឹងណែនាំអ្នកតាមរយៈការលុប $(^NameDA)។$\r$\n$\r$\n មុនពេលចាប់ផ្តើមការលុប សូមប្រាកដថា $(^NameDA) មិនដំណើរការ។$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "កិច្ចព្រមព្រៀងអាជ្ញាប័ណ្ណ"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "សូមពិនិត្យមើលលក្ខខណ្ឌអាជ្ញាប័ណ្ណមុនពេលដំឡើង $(^NameDA) ។"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "ប្រសិនបើអ្នកទទួលយកលក្ខខណ្ឌនៃកិច្ចព្រមព្រៀង សូមចុច ខ្ញុំយល់ស្រប ដើម្បីបន្ត។ អ្នកត្រូវតែទទួលយកកិច្ចព្រមព្រៀងដើម្បីដំឡើង $(^NameDA) ។"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "ប្រសិនបើអ្នកទទួលយកលក្ខខណ្ឌនៃកិច្ចព្រមព្រៀង សូមចុចប្រអប់ធីកខាងក្រោម។ អ្នកត្រូវតែទទួលយកកិច្ចព្រមព្រៀងដើម្បីដំឡើង $(^NameDA) ។ $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "ប្រសិនបើអ្នកទទួលយកលក្ខខណ្ឌនៃកិច្ចព្រមព្រៀង សូមជ្រើសរើសជម្រើសទីមួយខាងក្រោម។ អ្នកត្រូវតែទទួលយកកិច្ចព្រមព្រៀងដើម្បីដំឡើង $(^NameDA) ។ $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "កិច្ចព្រមព្រៀងអាជ្ញាប័ណ្ណ"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "សូមពិនិត្យមើលលក្ខខណ្ឌអាជ្ញាប័ណ្ណមុនពេលលុបការដំឡើង $(^NameDA) ។"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "ប្រសិនបើអ្នកទទួលយកលក្ខខណ្ឌនៃកិច្ចព្រមព្រៀង សូមចុច ខ្ញុំយល់ស្រប ដើម្បីបន្ត។ អ្នកត្រូវតែទទួលយកកិច្ចព្រមព្រៀងដើម្បីលុប $(^NameDA) ។"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "ប្រសិនបើអ្នកទទួលយកលក្ខខណ្ឌនៃកិច្ចព្រមព្រៀង សូមចុចប្រអប់ធីកខាងក្រោម។ អ្នកត្រូវតែទទួលយកកិច្ចព្រមព្រៀងដើម្បីលុប $(^NameDA) ។ $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "ប្រសិនបើអ្នកទទួលយកលក្ខខណ្ឌនៃកិច្ចព្រមព្រៀង សូមជ្រើសរើសជម្រើសទីមួយខាងក្រោម។ អ្នកត្រូវតែទទួលយកកិច្ចព្រមព្រៀងដើម្បីលុប $(^NameDA) ។ $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "ចុចទំព័រចុះក្រោមដើម្បីមើលកិច្ចព្រមព្រៀងដែលនៅសល់។"
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "ជ្រើសរើសសមាសភាគ"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "ជ្រើសរើសលក្ខណៈពិសេសណាមួយរបស់ $(^NameDA) ដែលអ្នកចង់ដំឡើង។"
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "ជ្រើសរើសសមាសភាគ"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "ជ្រើសរើសលក្ខណៈពិសេសណាមួយរបស់ $(^NameDA) ដែលអ្នកចង់លុប។"
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "ការពិពណ៌នា"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "ដាក់កណ្ដុររបស់អ្នកលើសមាសធាតុមួយ ដើម្បីមើលការពិពណ៌នារបស់វា។"
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "ជ្រើសរើសសមាសធាតុមួយដើម្បីមើលការពិពណ៌នារបស់វា។"
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "ជ្រើសរើសទីតាំងដំឡើង"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "ជ្រើសរើសថតដែលត្រូវដំឡើង $(^NameDA) ។"
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "ជ្រើសរើស លុបទីតាំង"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "ជ្រើសរើសថតឯកសារដែលត្រូវលុប $(^NameDA) ។"
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "ការដំឡើង"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "សូមរង់ចាំខណៈពេលដែល $(^NameDA) កំពុងត្រូវបានដំឡើង។"
  ${LangFileString} MUI_TEXT_FINISH_TITLE "ការដំឡើងបានបញ្ចប់"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "ការដំឡើងត្រូវបានបញ្ចប់ដោយជោគជ័យ។"
  ${LangFileString} MUI_TEXT_ABORT_TITLE "ការដំឡើងត្រូវបានលុបចោល"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "ការដំឡើងមិនត្រូវបានបញ្ចប់ដោយជោគជ័យទេ។"
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "ការលុបការដំឡើង"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "សូមរង់ចាំខណៈពេលដែល $(^NameDA) កំពុងត្រូវបានលុប។"
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "ការលុបការដំឡើងបានបញ្ចប់"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "ការលុបត្រូវបានបញ្ចប់ដោយជោគជ័យ។"
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "ការលុបការដំឡើងត្រូវបានលុបចោល"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "ការលុបមិនត្រូវបានបញ្ចប់ដោយជោគជ័យទេ។"
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "កំពុងបញ្ចប់ការដំឡើង $(^NameDA)"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) ត្រូវបានដំឡើងនៅលើកុំព្យូទ័ររបស់អ្នក។$\r$\n$\r$\n ចុច បញ្ចប់ ដើម្បីបិទការដំឡើង។"
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "កុំព្យូទ័ររបស់អ្នកត្រូវតែចាប់ផ្តើមឡើងវិញ ដើម្បីបញ្ចប់ការដំឡើង $(^NameDA) ។ តើអ្នកចង់ចាប់ផ្ដើមឡើងវិញឥឡូវនេះទេ?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "ការបញ្ចប់ការលុប $(^NameDA)"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "$(^NameDA) ត្រូវបានលុបចេញពីកុំព្យូទ័ររបស់អ្នក។$\r$\n$\r$\n ចុច បញ្ចប់ ដើម្បីបិទការដំឡើង។"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "កុំព្យូទ័ររបស់អ្នកត្រូវតែចាប់ផ្តើមឡើងវិញ ដើម្បីបញ្ចប់ការលុប $(^NameDA) ។ តើអ្នកចង់ចាប់ផ្ដើមឡើងវិញឥឡូវនេះទេ?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "ចាប់ផ្ដើមឡើងវិញឥឡូវនេះ"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "ខ្ញុំចង់ចាប់ផ្ដើមឡើងវិញដោយដៃនៅពេលក្រោយ"
  ${LangFileString} MUI_TEXT_FINISH_RUN "ដំណើរការ $(^&NameDA)"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "បង្ហាញ &Readme"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "បញ្ចប់"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "ជ្រើសរើស Start Menu Folder"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "ជ្រើសរើសថត Start Menu សម្រាប់ផ្លូវកាត់ $(^NameDA) ។"
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "ជ្រើសរើសថត Start Menu ដែលអ្នកចង់បង្កើតផ្លូវកាត់របស់កម្មវិធី។ អ្នកក៏អាចបញ្ចូលឈ្មោះដើម្បីបង្កើតថតថ្មីមួយ។"
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "កុំបង្កើតផ្លូវកាត់"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "លុបការដំឡើង $(^NameDA)"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "យក $(^NameDA) ចេញពីកុំព្យូទ័ររបស់អ្នក។"
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "តើអ្នកប្រាកដថាចង់ចាកចេញពីការដំឡើង $(^Name)?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "តើអ្នកប្រាកដថាចង់ចាកចេញពី $(^Name) លុប មែនទេ?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "ជ្រើសរើសអ្នកប្រើប្រាស់"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "ជ្រើសរើសអ្នកប្រើប្រាស់ណាដែលអ្នកចង់ដំឡើង $(^NameDA) ។"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "ជ្រើសរើសថាតើអ្នកចង់ដំឡើង $(^NameDA) សម្រាប់តែខ្លួនអ្នក ឬសម្រាប់អ្នកប្រើប្រាស់ទាំងអស់នៃកុំព្យូទ័រនេះ។ $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "ដំឡើងសម្រាប់អ្នកដែលប្រើកុំព្យូទ័រនេះ។"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "ដំឡើងសម្រាប់តែខ្ញុំ"
!endif
