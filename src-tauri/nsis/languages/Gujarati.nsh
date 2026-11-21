;Language: Gujarati (1095)
;By Joost Verburg

!insertmacro LANGFILE "Gujarati" "Gujarati" "ગુજરાતી" "Gujarati" ; See \Include\LangFile.nsh for a description of these parameters

!ifdef MUI_WELCOMEPAGE
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TITLE "$(^NameDA) સેટઅપમાં આપનું સ્વાગત છે"
  ${LangFileString} MUI_TEXT_WELCOME_INFO_TEXT "સેટઅપ તમને $(^NameDA) ના ઇન્સ્ટોલેશન દ્વારા માર્ગદર્શન આપશે.$\r$\n$\r$\n એ ભલામણ કરવામાં આવે છે કે તમે સેટઅપ શરૂ કરતા પહેલા અન્ય તમામ એપ્લિકેશનો બંધ કરો. આ તમારા કમ્પ્યુટરને રીબૂટ કર્યા વિના સંબંધિત સિસ્ટમ ફાઇલોને અપડેટ કરવાનું શક્ય બનાવશે.$\r$\n$\r$\n$_CLICK"
!endif

!ifdef MUI_UNWELCOMEPAGE
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TITLE "$(^NameDA) અનઇન્સ્ટોલ પર આપનું સ્વાગત છે"
  ${LangFileString} MUI_UNTEXT_WELCOME_INFO_TEXT "$(^NameDA) ના અનઇન્સ્ટોલેશન માટે સેટઅપ તમને માર્ગદર્શન આપશે.$\r$\n$\r$\n અનઇન્સ્ટોલેશન શરૂ કરતા પહેલા, ખાતરી કરો કે $(^NameDA) ચાલી રહ્યું નથી.$\r$\n$\r$\nXQ7QXZ"
!endif

!ifdef MUI_LICENSEPAGE
  ${LangFileString} MUI_TEXT_LICENSE_TITLE "લાઇસન્સ કરાર"
  ${LangFileString} MUI_TEXT_LICENSE_SUBTITLE "$(^NameDA) ઇન્સ્ટોલ કરતાં પહેલાં કૃપા કરીને લાઇસન્સની શરતોની સમીક્ષા કરો."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM "જો તમે કરારની શરતો સ્વીકારો છો, તો ચાલુ રાખવા માટે હું સંમત છું પર ક્લિક કરો. તમારે $(^NameDA) ઇન્સ્ટોલ કરવા માટેનો કરાર સ્વીકારવો આવશ્યક છે."
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_CHECKBOX "જો તમે કરારની શરતો સ્વીકારો છો, તો નીચેના ચેક બોક્સને ક્લિક કરો. તમારે $(^NameDA) ઇન્સ્ટોલ કરવા માટેનો કરાર સ્વીકારવો આવશ્યક છે. $_CLICK"
  ${LangFileString} MUI_INNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "જો તમે કરારની શરતો સ્વીકારો છો, તો નીચેનો પ્રથમ વિકલ્પ પસંદ કરો. તમારે $(^NameDA) ઇન્સ્ટોલ કરવા માટેનો કરાર સ્વીકારવો આવશ્યક છે. $_CLICK"
!endif

!ifdef MUI_UNLICENSEPAGE
  ${LangFileString} MUI_UNTEXT_LICENSE_TITLE "લાઇસન્સ કરાર"
  ${LangFileString} MUI_UNTEXT_LICENSE_SUBTITLE "$(^NameDA) અનઇન્સ્ટોલ કરતાં પહેલાં કૃપા કરીને લાઇસન્સની શરતોની સમીક્ષા કરો."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM "જો તમે કરારની શરતો સ્વીકારો છો, તો ચાલુ રાખવા માટે હું સંમત છું પર ક્લિક કરો. તમારે $(^NameDA) અનઇન્સ્ટોલ કરવા માટેનો કરાર સ્વીકારવો આવશ્યક છે."
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_CHECKBOX "જો તમે કરારની શરતો સ્વીકારો છો, તો નીચેના ચેક બોક્સને ક્લિક કરો. તમારે $(^NameDA) અનઇન્સ્ટોલ કરવા માટેનો કરાર સ્વીકારવો આવશ્યક છે. $_CLICK"
  ${LangFileString} MUI_UNINNERTEXT_LICENSE_BOTTOM_RADIOBUTTONS "જો તમે કરારની શરતો સ્વીકારો છો, તો નીચેનો પ્રથમ વિકલ્પ પસંદ કરો. તમારે $(^NameDA) અનઇન્સ્ટોલ કરવા માટેનો કરાર સ્વીકારવો આવશ્યક છે. $_CLICK"
!endif

!ifdef MUI_LICENSEPAGE | MUI_UNLICENSEPAGE
  ${LangFileString} MUI_INNERTEXT_LICENSE_TOP "બાકીના કરારને જોવા માટે પેજ ડાઉન દબાવો."
!endif

!ifdef MUI_COMPONENTSPAGE
  ${LangFileString} MUI_TEXT_COMPONENTS_TITLE "ઘટકો પસંદ કરો"
  ${LangFileString} MUI_TEXT_COMPONENTS_SUBTITLE "તમે $(^NameDA) ની કઈ સુવિધાઓ ઇન્સ્ટોલ કરવા માંગો છો તે પસંદ કરો."
!endif

!ifdef MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_UNTEXT_COMPONENTS_TITLE "ઘટકો પસંદ કરો"
  ${LangFileString} MUI_UNTEXT_COMPONENTS_SUBTITLE "$(^NameDA) ની કઈ સુવિધાઓ તમે અનઇન્સ્ટોલ કરવા માંગો છો તે પસંદ કરો."
!endif

!ifdef MUI_COMPONENTSPAGE | MUI_UNCOMPONENTSPAGE
  ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_TITLE "વર્ણન"
  !ifndef NSIS_CONFIG_COMPONENTPAGE_ALTERNATIVE
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "તમારા માઉસને એક ઘટક પર તેનું વર્ણન જોવા માટે મૂકો."
  !else
    ${LangFileString} MUI_INNERTEXT_COMPONENTS_DESCRIPTION_INFO "તેનું વર્ણન જોવા માટે એક ઘટક પસંદ કરો."
  !endif
!endif

!ifdef MUI_DIRECTORYPAGE
  ${LangFileString} MUI_TEXT_DIRECTORY_TITLE "ઇન્સ્ટોલ સ્થાન પસંદ કરો"
  ${LangFileString} MUI_TEXT_DIRECTORY_SUBTITLE "ફોલ્ડર પસંદ કરો જેમાં $(^NameDA) ઇન્સ્ટોલ કરવું છે."
!endif

!ifdef MUI_UNDIRECTORYPAGE
  ${LangFileString} MUI_UNTEXT_DIRECTORY_TITLE "અનઇન્સ્ટોલ સ્થાન પસંદ કરો"
  ${LangFileString} MUI_UNTEXT_DIRECTORY_SUBTITLE "જેમાંથી $(^NameDA) અનઇન્સ્ટોલ કરવું તે ફોલ્ડર પસંદ કરો."
!endif

!ifdef MUI_INSTFILESPAGE
  ${LangFileString} MUI_TEXT_INSTALLING_TITLE "ઇન્સ્ટોલ કરી રહ્યું છે"
  ${LangFileString} MUI_TEXT_INSTALLING_SUBTITLE "$(^NameDA) ઇન્સ્ટોલ થઈ રહ્યું હોય ત્યાં સુધી કૃપા કરીને રાહ જુઓ."
  ${LangFileString} MUI_TEXT_FINISH_TITLE "ઇન્સ્ટોલેશન પૂર્ણ"
  ${LangFileString} MUI_TEXT_FINISH_SUBTITLE "સેટઅપ સફળતાપૂર્વક પૂર્ણ થયું."
  ${LangFileString} MUI_TEXT_ABORT_TITLE "સ્થાપન બંધ કર્યું"
  ${LangFileString} MUI_TEXT_ABORT_SUBTITLE "સેટઅપ સફળતાપૂર્વક પૂર્ણ થયું ન હતું."
!endif

!ifdef MUI_UNINSTFILESPAGE
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_TITLE "અનઇન્સ્ટોલ કરી રહ્યું છે"
  ${LangFileString} MUI_UNTEXT_UNINSTALLING_SUBTITLE "$(^NameDA) અનઇન્સ્ટોલ કરવામાં આવે ત્યાં સુધી કૃપા કરીને રાહ જુઓ."
  ${LangFileString} MUI_UNTEXT_FINISH_TITLE "અનઇન્સ્ટોલેશન પૂર્ણ"
  ${LangFileString} MUI_UNTEXT_FINISH_SUBTITLE "અનઇન્સ્ટોલ સફળતાપૂર્વક પૂર્ણ થયું."
  ${LangFileString} MUI_UNTEXT_ABORT_TITLE "અનઇન્સ્ટોલેશન રદ કર્યું"
  ${LangFileString} MUI_UNTEXT_ABORT_SUBTITLE "અનઇન્સ્ટોલ સફળતાપૂર્વક પૂર્ણ થયું ન હતું."
!endif

!ifdef MUI_FINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_INFO_TITLE "$(^NameDA) સેટઅપ પૂર્ણ કરી રહ્યાં છીએ"
  ${LangFileString} MUI_TEXT_FINISH_INFO_TEXT "$(^NameDA) તમારા કમ્પ્યુટર પર ઇન્સ્ટોલ થઈ ગયું છે.$\r$\n$\r$\n સેટઅપ બંધ કરવા માટે સમાપ્ત પર ક્લિક કરો."
  ${LangFileString} MUI_TEXT_FINISH_INFO_REBOOT "$(^NameDA) ના ઇન્સ્ટોલેશનને પૂર્ણ કરવા માટે તમારું કમ્પ્યુટર પુનઃપ્રારંભ કરવું આવશ્યક છે. શું તમે હમણાં રીબૂટ કરવા માંગો છો?"
!endif

!ifdef MUI_UNFINISHPAGE
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TITLE "$(^NameDA) અનઇન્સ્ટોલ પૂર્ણ કરી રહ્યાં છીએ"
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_TEXT "તમારા કમ્પ્યુટરમાંથી $(^NameDA) ને અનઇન્સ્ટોલ કરવામાં આવ્યું છે.$\r$\n$\r$\n સેટઅપ બંધ કરવા માટે સમાપ્ત પર ક્લિક કરો."
  ${LangFileString} MUI_UNTEXT_FINISH_INFO_REBOOT "$(^NameDA) ના અનઇન્સ્ટોલેશનને પૂર્ણ કરવા માટે તમારું કમ્પ્યુટર પુનઃપ્રારંભ કરવું આવશ્યક છે. શું તમે હમણાં રીબૂટ કરવા માંગો છો?"
!endif

!ifdef MUI_FINISHPAGE | MUI_UNFINISHPAGE
  ${LangFileString} MUI_TEXT_FINISH_REBOOTNOW "હવે રીબૂટ કરો"
  ${LangFileString} MUI_TEXT_FINISH_REBOOTLATER "હું પછીથી મેન્યુઅલી રીબૂટ કરવા માંગુ છું"
  ${LangFileString} MUI_TEXT_FINISH_RUN "$(^&NameDA) ચલાવો"
  ${LangFileString} MUI_TEXT_FINISH_SHOWREADME "રીડમી બતાવો"
  ${LangFileString} MUI_BUTTONTEXT_FINISH "સમાપ્ત કરો"  
!endif

!ifdef MUI_STARTMENUPAGE
  ${LangFileString} MUI_TEXT_STARTMENU_TITLE "સ્ટાર્ટ મેનૂ ફોલ્ડર પસંદ કરો"
  ${LangFileString} MUI_TEXT_STARTMENU_SUBTITLE "$(^NameDA) શૉર્ટકટ્સ માટે સ્ટાર્ટ મેનૂ ફોલ્ડર પસંદ કરો."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_TOP "સ્ટાર્ટ મેનૂ ફોલ્ડર પસંદ કરો જેમાં તમે પ્રોગ્રામના શોર્ટકટ્સ બનાવવા માંગો છો. તમે નવું ફોલ્ડર બનાવવા માટે નામ પણ દાખલ કરી શકો છો."
  ${LangFileString} MUI_INNERTEXT_STARTMENU_CHECKBOX "શોર્ટકટ બનાવશો નહીં"
!endif

!ifdef MUI_UNCONFIRMPAGE
  ${LangFileString} MUI_UNTEXT_CONFIRM_TITLE "$(^NameDA) અનઇન્સ્ટોલ કરો"
  ${LangFileString} MUI_UNTEXT_CONFIRM_SUBTITLE "તમારા કમ્પ્યુટરમાંથી $(^NameDA) દૂર કરો."
!endif

!ifdef MUI_ABORTWARNING
  ${LangFileString} MUI_TEXT_ABORTWARNING "શું તમે ખરેખર $(^Name) સેટઅપ છોડવા માંગો છો?"
!endif

!ifdef MUI_UNABORTWARNING
  ${LangFileString} MUI_UNTEXT_ABORTWARNING "શું તમે ખરેખર $(^Name) અનઇન્સ્ટોલ છોડવા માંગો છો?"
!endif

!ifdef MULTIUSER_INSTALLMODEPAGE
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_TITLE "વપરાશકર્તાઓ પસંદ કરો"
  ${LangFileString} MULTIUSER_TEXT_INSTALLMODE_SUBTITLE "તમે કયા વપરાશકર્તાઓ માટે $(^NameDA) ઇન્સ્ટોલ કરવા માંગો છો તે પસંદ કરો."
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_TOP "પસંદ કરો કે તમે $(^NameDA) ફક્ત તમારા માટે અથવા આ કમ્પ્યુટરના બધા વપરાશકર્તાઓ માટે ઇન્સ્ટોલ કરવા માંગો છો. $(^ClickNext)"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_ALLUSERS "આ કમ્પ્યુટરનો ઉપયોગ કરનાર કોઈપણ માટે ઇન્સ્ટોલ કરો"
  ${LangFileString} MULTIUSER_INNERTEXT_INSTALLMODE_CURRENTUSER "ફક્ત મારા માટે ઇન્સ્ટોલ કરો"
!endif
