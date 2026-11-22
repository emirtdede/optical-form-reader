import { invoke } from '@tauri-apps/api/core';
import { isTauriRuntime } from '../platform/runtime';
import {
  SUPPORTED_LANGUAGES as SUPPORTED_INSTALLER_LANGUAGES,
  detectSystemLanguage,
  normalizeLanguageCode,
} from '../i18n/languages';
import INSTALLER_I18N_73 from './installerI18n73.json';

export type InstallerMode = 'app' | 'setup' | 'uninstall';

export interface InstallerContext {
  mode: InstallerMode;
  version: string;
  defaultInstallDir: string;
  isUpdate: boolean;
  installedVersion: string | null;
  estimatedSizeMb: number;
  osLocale: string;
  userDataDir: string;
}

export interface InstallerRunOptions {
  installDir: string;
  language: string;
  createDesktopShortcut: boolean;
  createStartMenuShortcut: boolean;
  launchAtStartup: boolean;
  addCliToPath: boolean;
}

export interface InstallerRunResult {
  installDir: string;
  executablePath: string;
  uninstallerPath: string;
  status: string;
}

export interface InstallerStrings {
  title: string;
  uninstallWindowTitle: string;
  install: string;
  update: string;
  welcomeFresh: string;
  welcomeUpdate: string;
  licenseCaption: string;
  optionsTitle: string;
  optionsHide: string;
  languageLabel: string;
  folderLabel: string;
  browseButton: string;
  taskDesktopIcon: string;
  taskStartMenu: string;
  taskStartup: string;
  taskCli: string;
  spaceRequired: string;
  optionsLaterHint: string;
  progressInstall: string;
  progressUpdate: string;
  progressUninstall: string;
  statusVerifying: string;
  statusCopying: string;
  statusShortcuts: string;
  statusFinishing: string;
  statusRemoving: string;
  doneTitle: string;
  doneText: string;
  doneUpdatedText: string;
  doneLaunch: string;
  errorTitle: string;
  uninstallErrorTitle: string;
  copyDetails: string;
  copied: string;
  uninstallTitle: string;
  uninstallText: string;
  uninstallDeleteSettings: string;
  uninstallSettingsWhere: string;
  uninstallButton: string;
  uninstalledTitle: string;
  uninstalledText: string;
  uninstalledKeptText: string;
  close: string;
  cancel: string;
  minimize: string;
}

const TR_STRINGS: InstallerStrings = {
  title: 'Optic Form Reader Kurulumu',
  uninstallWindowTitle: 'Optic Form Reader Kaldırma',
  install: 'Kur',
  update: 'Güncelle',
  welcomeFresh: 'Kurulum, bu bilgisayara Optic Form Reader {version} sürümünü kurar.',
  welcomeUpdate: 'Optic Form Reader {oldVersion} kurulu. Kurulum {version} sürümüne günceller; sınav oturumlarınız ve ayarlarınız korunur.',
  licenseCaption: '%100 yerel OpenCV OMR motoru - Sıfır telemetri ve tam gizlilik.',
  optionsTitle: 'Seçenekler',
  optionsHide: 'Gizle',
  languageLabel: 'Dil',
  folderLabel: 'Kurulum klasörü',
  browseButton: 'Değiştir...',
  taskDesktopIcon: 'Masaüstü kısayolu oluştur',
  taskStartMenu: 'Başlat menüsü kısayolu oluştur',
  taskStartup: 'Oturum açtığımda Optic Form Reader uygulamasını başlat',
  taskCli: '"ofr" CLI komutunu PATH değişkenine ekle (komut satırından OMR ve MCP)',
  spaceRequired: 'Optic Form Reader yaklaşık {size} MB disk alanına ihtiyaç duyar.',
  optionsLaterHint: 'Bu tercihleri daha sonra uygulama içinden Ayarlar bölümünden değiştirebilirsiniz.',
  progressInstall: 'Optic Form Reader kuruluyor',
  progressUpdate: 'Optic Form Reader güncelleniyor',
  progressUninstall: 'Optic Form Reader kaldırılıyor',
  statusVerifying: 'Kurulum paketi ve bütünlük denetleniyor...',
  statusCopying: 'Optic Form Reader dosyaları kopyalanıyor...',
  statusShortcuts: 'Kısayollar, CLI bağlantısı ve kayıt defteri yapılandırılıyor...',
  statusFinishing: 'Tamamlanıyor...',
  statusRemoving: 'Uygulama dosyaları ve sistem kayıtları kaldırılıyor...',
  doneTitle: 'Optic Form Reader hazır',
  doneText: 'Optic Form Reader bilgisayarınıza kuruldu. Sınav şablonlarınızı oluşturmaya ve optik formları okumaya hemen başlayabilirsiniz.',
  doneUpdatedText: 'Optic Form Reader güncellendi. Tüm sınav oturumlarınız, cevap anahtarlarınız ve yerel ayarlarınız korundu.',
  doneLaunch: "Optic Form Reader'ı başlat",
  errorTitle: 'Optic Form Reader kurulamadı',
  uninstallErrorTitle: 'Optic Form Reader kaldırılamadı',
  copyDetails: 'Ayrıntıları kopyala',
  copied: 'Kopyalandı',
  uninstallTitle: "Optic Form Reader'ı kaldır",
  uninstallText: 'Bu işlem Optic Form Reader {version} sürümünü, masaüstü kısayollarını ve CLI bağlantısını bu bilgisayardan kaldırır.',
  uninstallDeleteSettings: 'Kayıtlı sınav oturumlarımı, cevap anahtarlarımı, yerel yapay zeka modellerimi ve ayarlarımı da sil',
  uninstallSettingsWhere: '{dataDir} içinde bulunurlar. Yeniden kurduğunuzda geri gelmeleri için saklayın.',
  uninstallButton: 'Kaldır',
  uninstalledTitle: 'Optic Form Reader kaldırıldı',
  uninstalledText: 'Optic Form Reader artık bu bilgisayarda bulunmuyor.',
  uninstalledKeptText: 'Optic Form Reader kaldırıldı. Yeniden kurmanız için yerel sınav verileriniz ve ayarlarınız korundu.',
  close: 'Kapat',
  cancel: 'İptal',
  minimize: 'Simge durumuna küçült',
};

const EN_STRINGS: InstallerStrings = {
  title: 'Optic Form Reader Setup',
  uninstallWindowTitle: 'Optic Form Reader Uninstaller',
  install: 'Install',
  update: 'Update',
  welcomeFresh: 'Setup will install Optic Form Reader {version} on this computer.',
  welcomeUpdate: 'Optic Form Reader {oldVersion} is installed. Setup will update it to {version} while keeping your exam sessions and settings.',
  licenseCaption: '100% local OpenCV OMR engine - Zero telemetry and full privacy.',
  optionsTitle: 'Options',
  optionsHide: 'Hide',
  languageLabel: 'Language',
  folderLabel: 'Install folder',
  browseButton: 'Change...',
  taskDesktopIcon: 'Create a desktop shortcut',
  taskStartMenu: 'Create a Start menu shortcut',
  taskStartup: 'Launch Optic Form Reader when I sign in',
  taskCli: 'Add "ofr" CLI command to PATH (command-line OMR and MCP)',
  spaceRequired: 'Optic Form Reader requires about {size} MB of disk space.',
  optionsLaterHint: 'You can change these preferences anytime later in Settings.',
  progressInstall: 'Installing Optic Form Reader',
  progressUpdate: 'Updating Optic Form Reader',
  progressUninstall: 'Uninstalling Optic Form Reader',
  statusVerifying: 'Verifying setup package integrity...',
  statusCopying: 'Copying Optic Form Reader files...',
  statusShortcuts: 'Configuring shortcuts, CLI path, and registry entries...',
  statusFinishing: 'Finishing up...',
  statusRemoving: 'Removing application files and system registrations...',
  doneTitle: 'Optic Form Reader is ready',
  doneText: 'Optic Form Reader is installed on your computer. You can start designing templates and grading optical forms right away.',
  doneUpdatedText: 'Optic Form Reader has been updated. Your exam sessions, answer keys, and local settings were preserved.',
  doneLaunch: 'Launch Optic Form Reader',
  errorTitle: 'Could not install Optic Form Reader',
  uninstallErrorTitle: 'Could not uninstall Optic Form Reader',
  copyDetails: 'Copy details',
  copied: 'Copied',
  uninstallTitle: 'Uninstall Optic Form Reader',
  uninstallText: 'This will remove Optic Form Reader {version}, its shortcuts, and CLI integration from this computer.',
  uninstallDeleteSettings: 'Also delete my saved exam sessions, answer keys, local AI models, and settings',
  uninstallSettingsWhere: 'Stored in {dataDir}. Keep them if you plan to reinstall Optic Form Reader later.',
  uninstallButton: 'Uninstall',
  uninstalledTitle: 'Optic Form Reader uninstalled',
  uninstalledText: 'Optic Form Reader is no longer on this computer.',
  uninstalledKeptText: 'Optic Form Reader was removed. Your local exam sessions and settings were kept for future installations.',
  close: 'Close',
  cancel: 'Cancel',
  minimize: 'Minimize',
};

const LOCALIZED_OVERRIDES: Record<string, Partial<InstallerStrings>> = {
  tr: TR_STRINGS,
  en: EN_STRINGS,
  de: {
    title: 'Optic Form Reader Einrichtung',
    uninstallWindowTitle: 'Optic Form Reader Deinstallation',
    install: 'Installieren',
    update: 'Aktualisieren',
    welcomeFresh: 'Das Setup installiert Optic Form Reader {version} auf diesem Computer.',
    licenseCaption: '100 % lokale OpenCV-OMR-Engine - Null Telemetrie und volle Privatsphäre.',
    optionsTitle: 'Optionen',
    optionsHide: 'Ausblenden',
    languageLabel: 'Sprache',
    folderLabel: 'Installationsordner',
    browseButton: 'Ändern...',
    taskDesktopIcon: 'Desktop-Verknüpfung erstellen',
    taskStartMenu: 'Startmenü-Verknüpfung erstellen',
    taskStartup: 'Beim Anmelden automatisch starten',
    taskCli: '"ofr" CLI-Befehl zu PATH hinzufügen',
    spaceRequired: 'Optic Form Reader benötigt etwa {size} MB Speicherplatz.',
    progressInstall: 'Optic Form Reader wird installiert',
    progressUninstall: 'Optic Form Reader wird deinstalliert',
    doneTitle: 'Optic Form Reader ist bereit',
    doneLaunch: 'Optic Form Reader starten',
    uninstallTitle: 'Optic Form Reader deinstallieren',
    uninstallDeleteSettings: 'Gespeicherte Prüfungssitzungen, Antwortschlüssel, lokale KI-Modelle und Einstellungen ebenfalls löschen',
    uninstallButton: 'Deinstallieren',
    uninstalledTitle: 'Optic Form Reader wurde deinstalliert',
    close: 'Schließen',
    cancel: 'Abbrechen',
  },
  bg: {
    title: 'Инсталиране на Optic Form Reader',
    uninstallWindowTitle: 'Деинсталиране на Optic Form Reader',
    install: 'Инсталирай',
    update: 'Обнови',
    welcomeFresh: 'Инсталаторът ще инсталира Optic Form Reader {version} на този компютър.',
    licenseCaption: '100% локален OpenCV OMR двигател - Нулева телеметрия и пълна поверителност.',
    optionsTitle: 'Опции',
    optionsHide: 'Скрий',
    languageLabel: 'Език',
    folderLabel: 'Папка за инсталиране',
    browseButton: 'Промени...',
    taskDesktopIcon: 'Създай пряк път на работния плот',
    taskStartMenu: 'Създай пряк път в менюто Старт',
    taskStartup: 'Стартирай при влизане в системата',
    taskCli: 'Добави командата "ofr" към PATH',
    spaceRequired: 'Optic Form Reader изисква около {size} MB дисково пространство.',
    progressInstall: 'Инсталиране на Optic Form Reader',
    progressUninstall: 'Деинсталиране на Optic Form Reader',
    doneTitle: 'Optic Form Reader е готов',
    doneLaunch: 'Стартирай Optic Form Reader',
    uninstallTitle: 'Деинсталиране на Optic Form Reader',
    uninstallDeleteSettings: 'Изтрий също запазените изпитни сесии, ключове с отговори, локални ИИ модели и настройки',
    uninstallButton: 'Деинсталирай',
    uninstalledTitle: 'Optic Form Reader е деинсталиран',
    close: 'Затвори',
    cancel: 'Отказ',
  },
  ru: {
    title: 'Установка Optic Form Reader',
    uninstallWindowTitle: 'Удаление Optic Form Reader',
    install: 'Установить',
    update: 'Обновить',
    welcomeFresh: 'Программа установит Optic Form Reader {version} на этот компьютер.',
    licenseCaption: '100% локальный движок OpenCV OMR - Без телеметрии и с полной приватностью.',
    optionsTitle: 'Параметры',
    optionsHide: 'Скрыть',
    languageLabel: 'Язык',
    folderLabel: 'Папка установки',
    browseButton: 'Изменить...',
    taskDesktopIcon: 'Создать ярлык на рабочем столе',
    taskStartMenu: 'Создать ярлык в меню «Пуск»',
    taskStartup: 'Запускать при входе в систему',
    taskCli: 'Добавить команду "ofr" в переменную PATH',
    spaceRequired: 'Optic Form Reader требует около {size} МБ свободного места.',
    progressInstall: 'Установка Optic Form Reader',
    progressUninstall: 'Удаление Optic Form Reader',
    doneTitle: 'Optic Form Reader готов к работе',
    doneLaunch: 'Запустить Optic Form Reader',
    uninstallTitle: 'Удалить Optic Form Reader',
    uninstallDeleteSettings: 'Также удалить сохраненные сессии экзаменов, ключи ответов, локальные ИИ-модели и настройки',
    uninstallButton: 'Удалить',
    uninstalledTitle: 'Optic Form Reader удален',
    close: 'Закрыть',
    cancel: 'Отмена',
  },
  fr: {
    title: 'Installation de Optic Form Reader',
    uninstallWindowTitle: 'Désinstallation de Optic Form Reader',
    install: 'Installer',
    update: 'Mettre à jour',
    welcomeFresh: 'Le programme va installer Optic Form Reader {version} sur cet ordinateur.',
    licenseCaption: 'Moteur OMR OpenCV 100 % local - Zéro télémétrie et confidentialité totale.',
    optionsTitle: 'Options',
    optionsHide: 'Masquer',
    languageLabel: 'Langue',
    folderLabel: "Dossier d'installation",
    browseButton: 'Modifier...',
    taskDesktopIcon: 'Créer un raccourci sur le bureau',
    taskStartMenu: 'Créer un raccourci dans le menu Démarrer',
    taskStartup: 'Lancer au démarrage de la session',
    taskCli: 'Ajouter la commande CLI "ofr" au PATH',
    spaceRequired: "Optic Form Reader nécessite environ {size} Mo d'espace disque.",
    progressInstall: 'Installation de Optic Form Reader',
    progressUninstall: 'Désinstallation de Optic Form Reader',
    doneTitle: 'Optic Form Reader est prêt',
    doneLaunch: 'Lancer Optic Form Reader',
    uninstallTitle: 'Désinstaller Optic Form Reader',
    uninstallDeleteSettings: 'Supprimer également mes sessions, corrigés, modèles IA locaux et paramètres',
    uninstallButton: 'Désinstaller',
    uninstalledTitle: 'Optic Form Reader désinstallé',
    close: 'Fermer',
    cancel: 'Annuler',
  },
  es: {
    title: 'Instalación de Optic Form Reader',
    uninstallWindowTitle: 'Desinstalación de Optic Form Reader',
    install: 'Instalar',
    update: 'Actualizar',
    welcomeFresh: 'El instalador configurará Optic Form Reader {version} en este equipo.',
    licenseCaption: 'Motor OMR OpenCV 100 % local - Cero telemetría y privacidad total.',
    optionsTitle: 'Opciones',
    optionsHide: 'Ocultar',
    languageLabel: 'Idioma',
    folderLabel: 'Carpeta de instalación',
    browseButton: 'Cambiar...',
    taskDesktopIcon: 'Crear un acceso directo en el escritorio',
    taskStartMenu: 'Crear un acceso directo en el menú Inicio',
    taskStartup: 'Iniciar al abrir sesión en Windows',
    taskCli: 'Añadir el comando CLI "ofr" al PATH',
    spaceRequired: 'Optic Form Reader necesita unos {size} MB de espacio en disco.',
    progressInstall: 'Instalando Optic Form Reader',
    progressUninstall: 'Desinstalando Optic Form Reader',
    doneTitle: 'Optic Form Reader está listo',
    doneLaunch: 'Iniciar Optic Form Reader',
    uninstallTitle: 'Desinstalar Optic Form Reader',
    uninstallDeleteSettings: 'Eliminar también mis sesiones de examen, claves, modelos de IA locales y ajustes',
    uninstallButton: 'Desinstalar',
    uninstalledTitle: 'Optic Form Reader desinstalado',
    close: 'Cerrar',
    cancel: 'Cancelar',
  },
  ar: {
    title: 'تثبيت Optic Form Reader',
    uninstallWindowTitle: 'إزالة تثبيت Optic Form Reader',
    install: 'تثبيت',
    update: 'تحديث',
    welcomeFresh: 'سيقوم برنامج الإعداد بتثبيت Optic Form Reader {version} على هذا الكمبيوتر.',
    licenseCaption: 'محرك OMR محلي بالكامل - بدون تتبع وخصوصية تامة.',
    optionsTitle: 'الخيارات',
    optionsHide: 'إخفاء',
    languageLabel: 'اللغة',
    folderLabel: 'مجلد التثبيت',
    browseButton: 'تغيير...',
    taskDesktopIcon: 'إنشاء اختصار على سطح المكتب',
    taskStartMenu: 'إنشاء اختصار في قائمة ابدأ',
    taskStartup: 'تشغيل البرنامج عند تسجيل الدخول',
    taskCli: 'إضافة أمر "ofr" إلى متغير المسار PATH',
    spaceRequired: 'يتطلب Optic Form Reader حوالي {size} ميجابايت من مساحة القرص.',
    progressInstall: 'جارٍ تثبيت Optic Form Reader',
    progressUninstall: 'جارٍ إزالة Optic Form Reader',
    doneTitle: 'Optic Form Reader جاهز للاستخدام',
    doneLaunch: 'تشغيل Optic Form Reader',
    uninstallTitle: 'إزالة تثبيت Optic Form Reader',
    uninstallDeleteSettings: 'حذف جلسات الاختبار المحفوظة ومفاتيح الإجابات ونماذج الذكاء الاصطناعي المحلية والإعدادات أيضاً',
    uninstallButton: 'إزالة التثبيت',
    uninstalledTitle: 'تمت إزالة Optic Form Reader',
    close: 'إغلاق',
    cancel: 'إلغاء',
  },
  it: {
    title: 'Installazione di Optic Form Reader',
    uninstallWindowTitle: 'Disinstallazione di Optic Form Reader',
    install: 'Installa',
    update: 'Aggiorna',
    welcomeFresh: 'Il programma installerà Optic Form Reader {version} su questo computer.',
    optionsTitle: 'Opzioni',
    optionsHide: 'Nascondi',
    languageLabel: 'Lingua',
    folderLabel: 'Cartella di installazione',
    browseButton: 'Cambia...',
    taskDesktopIcon: 'Crea collegamento sul desktop',
    taskStartMenu: 'Crea collegamento nel menu Start',
    doneTitle: 'Optic Form Reader è pronto',
    doneLaunch: 'Avvia Optic Form Reader',
    uninstallTitle: 'Disinstalla Optic Form Reader',
    uninstallButton: 'Disinstalla',
    uninstalledTitle: 'Optic Form Reader disinstallato',
    close: 'Chiudi',
    cancel: 'Annulla',
  },
  pt: {
    title: 'Instalação do Optic Form Reader',
    uninstallWindowTitle: 'Desinstalação do Optic Form Reader',
    install: 'Instalar',
    update: 'Atualizar',
    welcomeFresh: 'O instalador irá configurar o Optic Form Reader {version} neste computador.',
    optionsTitle: 'Opções',
    optionsHide: 'Ocultar',
    languageLabel: 'Idioma',
    folderLabel: 'Pasta de instalação',
    browseButton: 'Alterar...',
    taskDesktopIcon: 'Criar atalho na área de trabalho',
    taskStartMenu: 'Criar atalho no menu Iniciar',
    doneTitle: 'Optic Form Reader está pronto',
    doneLaunch: 'Iniciar Optic Form Reader',
    uninstallTitle: 'Desinstalar Optic Form Reader',
    uninstallButton: 'Desinstalar',
    uninstalledTitle: 'Optic Form Reader desinstalado',
    close: 'Fechar',
    cancel: 'Cancelar',
  },
  nl: {
    title: 'Optic Form Reader Installatie',
    uninstallWindowTitle: 'Optic Form Reader Verwijderen',
    install: 'Installeren',
    update: 'Bijwerken',
    welcomeFresh: 'Setup installeert Optic Form Reader {version} op deze computer.',
    optionsTitle: 'Opties',
    optionsHide: 'Verbergen',
    languageLabel: 'Taal',
    folderLabel: 'Installatiemap',
    browseButton: 'Wijzigen...',
    doneTitle: 'Optic Form Reader is gereed',
    doneLaunch: 'Optic Form Reader starten',
    uninstallTitle: 'Optic Form Reader verwijderen',
    uninstallButton: 'Verwijderen',
    uninstalledTitle: 'Optic Form Reader verwijderd',
    close: 'Sluiten',
    cancel: 'Annuleren',
  },
  pl: {
    title: 'Instalacja Optic Form Reader',
    uninstallWindowTitle: 'Usuwanie Optic Form Reader',
    install: 'Zainstaluj',
    update: 'Aktualizuj',
    welcomeFresh: 'Instalator zainstaluje Optic Form Reader {version} na tym komputerze.',
    optionsTitle: 'Opcje',
    optionsHide: 'Ukryj',
    languageLabel: 'Język',
    folderLabel: 'Folder instalacji',
    browseButton: 'Zmień...',
    doneTitle: 'Optic Form Reader jest gotowy',
    doneLaunch: 'Uruchom Optic Form Reader',
    uninstallTitle: 'Odinstaluj Optic Form Reader',
    uninstallButton: 'Odinstaluj',
    uninstalledTitle: 'Optic Form Reader odinstalowany',
    close: 'Zamknij',
    cancel: 'Anuluj',
  },
  zh: {
    title: 'Optic Form Reader 安装程序',
    uninstallWindowTitle: 'Optic Form Reader 卸载程序',
    install: '安装',
    update: '更新',
    welcomeFresh: '安装程序将在此计算机上安装 Optic Form Reader {version}。',
    optionsTitle: '选项',
    optionsHide: '隐藏',
    languageLabel: '语言',
    folderLabel: '安装文件夹',
    browseButton: '更改...',
    doneTitle: 'Optic Form Reader 已就绪',
    doneLaunch: '启动 Optic Form Reader',
    uninstallTitle: '卸载 Optic Form Reader',
    uninstallButton: '卸载',
    uninstalledTitle: 'Optic Form Reader 已卸载',
    close: '关闭',
    cancel: '取消',
  },
  'zh-tw': {
    title: 'Optic Form Reader 安裝程式',
    uninstallWindowTitle: 'Optic Form Reader 解除安裝',
    install: '安裝',
    update: '更新',
    welcomeFresh: '安裝程式將在此電腦上安裝 Optic Form Reader {version}。',
    optionsTitle: '選項',
    optionsHide: '隱藏',
    languageLabel: '語言',
    folderLabel: '安裝資料夾',
    browseButton: '變更...',
    doneTitle: 'Optic Form Reader 已就緒',
    doneLaunch: '啟動 Optic Form Reader',
    uninstallTitle: '解除安裝 Optic Form Reader',
    uninstallButton: '解除安裝',
    uninstalledTitle: 'Optic Form Reader 已解除安裝',
    close: '關閉',
    cancel: '取消',
  },
  ja: {
    title: 'Optic Form Reader セットアップ',
    uninstallWindowTitle: 'Optic Form Reader アンインストール',
    install: 'インストール',
    update: '更新',
    welcomeFresh: 'このコンピューターに Optic Form Reader {version} をインストールします。',
    optionsTitle: 'オプション',
    optionsHide: '隠す',
    languageLabel: '言語',
    folderLabel: 'インストール先フォルダー',
    browseButton: '変更...',
    doneTitle: 'Optic Form Reader の準備が完了しました',
    doneLaunch: 'Optic Form Reader を起動',
    uninstallTitle: 'Optic Form Reader をアンインストール',
    uninstallButton: 'アンインストール',
    uninstalledTitle: 'アンインストールが完了しました',
    close: '閉じる',
    cancel: 'キャンセル',
  },
  ko: {
    title: 'Optic Form Reader 설치',
    uninstallWindowTitle: 'Optic Form Reader 제거',
    install: '설치',
    update: '업데이트',
    welcomeFresh: '이 컴퓨터에 Optic Form Reader {version} 버전을 설치합니다.',
    optionsTitle: '옵션',
    optionsHide: '숨기기',
    languageLabel: '언어',
    folderLabel: '설치 폴더',
    browseButton: '변경...',
    doneTitle: 'Optic Form Reader 준비 완료',
    doneLaunch: 'Optic Form Reader 시작',
    uninstallTitle: 'Optic Form Reader 제거',
    uninstallButton: '제거',
    uninstalledTitle: 'Optic Form Reader 제거됨',
    close: '닫기',
    cancel: '취소',
  },
  uk: {
    title: 'Встановлення Optic Form Reader',
    uninstallWindowTitle: 'Видалення Optic Form Reader',
    install: 'Встановити',
    update: 'Оновити',
    welcomeFresh: 'Програма встановить Optic Form Reader {version} на цей комп’ютер.',
    optionsTitle: 'Параметри',
    optionsHide: 'Сховати',
    languageLabel: 'Мова',
    folderLabel: 'Папка встановлення',
    browseButton: 'Змінити...',
    doneTitle: 'Optic Form Reader готовий',
    doneLaunch: 'Запустити Optic Form Reader',
    uninstallTitle: 'Видалити Optic Form Reader',
    uninstallButton: 'Видалити',
    uninstalledTitle: 'Optic Form Reader видалено',
    close: 'Закрити',
    cancel: 'Скасувати',
  },
  az: {
    title: 'Optic Form Reader Quraşdırma',
    uninstallWindowTitle: 'Optic Form Reader Silinməsi',
    install: 'Quraşdır',
    update: 'Yenilə',
    welcomeFresh: 'Quraşdırıcı bu kompüterə Optic Form Reader {version} versiyasını quraşdıracaq.',
    optionsTitle: 'Seçimlər',
    optionsHide: 'Gizlət',
    languageLabel: 'Dil',
    folderLabel: 'Quraşdırma qovluğu',
    browseButton: 'Dəyişdir...',
    doneTitle: 'Optic Form Reader hazırdır',
    doneLaunch: 'Optic Form Reader-i başlat',
    uninstallTitle: 'Optic Form Reader-i sil',
    uninstallButton: 'Sil',
    uninstalledTitle: 'Optic Form Reader silindi',
    close: 'Bağla',
    cancel: 'Ləğv et',
  },
};

interface RawInstaller73Pack {
  setupTitle: string;
  uninstallTitle: string;
  welcomeDescInstall: string;
  welcomeDescUpgrade: string;
  btnInstall: string;
  btnUpgrade: string;
  btnOptions: string;
  btnHide: string;
  footerNotice: string;
  optionsTitle: string;
  labelLanguage: string;
  labelInstallDir: string;
  btnChange: string;
  optDesktop: string;
  optStartMenu: string;
  optStartup: string;
  optPath: string;
  diskSpace: string;
  installingTitle: string;
  uninstallingTitle: string;
  stepPrepare: string;
  stepClose: string;
  stepExtract: string;
  stepRegister: string;
  stepPath: string;
  stepRefresh: string;
  stepRemoveFiles: string;
  stepRemoveData: string;
  doneTitle: string;
  doneDesc: string;
  btnClose: string;
  btnLaunch: string;
  uninstallHeading: string;
  uninstallDesc: string;
  uninstallDeleteData: string;
  uninstallDataHint: string;
  btnCancel: string;
  btnUninstall: string;
  uninstalledTitle: string;
  uninstalledDesc: string;
  errorTitle: string;
  btnRetry: string;
  ariaMinimize: string;
}

const APP_DISPLAY_NAME = 'Optic Form Reader';

function adaptPackToInstallerStrings(pack: RawInstaller73Pack): InstallerStrings {
  const rep = (s: string) =>
    s
      .replaceAll('{app}', APP_DISPLAY_NAME)
      .replaceAll('{ver}', '{version}')
      .replaceAll('{installed}', '{oldVersion}')
      .replaceAll('{size}', '{size} MB')
      .replaceAll('{path}', '{dataDir}');

  return {
    title: rep(pack.setupTitle),
    uninstallWindowTitle: rep(pack.uninstallTitle),
    install: rep(pack.btnInstall),
    update: rep(pack.btnUpgrade),
    welcomeFresh: rep(pack.welcomeDescInstall),
    welcomeUpdate: rep(pack.welcomeDescUpgrade),
    licenseCaption: rep(pack.footerNotice),
    optionsTitle: rep(pack.optionsTitle || pack.btnOptions),
    optionsHide: rep(pack.btnHide),
    languageLabel: rep(pack.labelLanguage),
    folderLabel: rep(pack.labelInstallDir),
    browseButton: rep(pack.btnChange),
    taskDesktopIcon: rep(pack.optDesktop),
    taskStartMenu: rep(pack.optStartMenu),
    taskStartup: rep(pack.optStartup),
    taskCli: rep(pack.optPath),
    spaceRequired: rep(pack.diskSpace),
    optionsLaterHint: rep(pack.footerNotice),
    progressInstall: rep(pack.installingTitle),
    progressUpdate: rep(pack.installingTitle),
    progressUninstall: rep(pack.uninstallingTitle),
    statusVerifying: rep(pack.stepPrepare),
    statusCopying: rep(pack.stepExtract),
    statusShortcuts: rep(pack.stepRegister),
    statusFinishing: rep(pack.stepRefresh),
    statusRemoving: rep(pack.stepRemoveFiles),
    doneTitle: rep(pack.doneTitle),
    doneText: rep(pack.doneDesc),
    doneUpdatedText: rep(pack.doneDesc),
    doneLaunch: rep(pack.btnLaunch),
    errorTitle: rep(pack.errorTitle),
    uninstallErrorTitle: rep(pack.errorTitle),
    copyDetails: rep(pack.btnRetry),
    copied: rep(pack.doneTitle),
    uninstallTitle: rep(pack.uninstallHeading),
    uninstallText: rep(pack.uninstallDesc),
    uninstallDeleteSettings: rep(pack.uninstallDeleteData),
    uninstallSettingsWhere: rep(pack.uninstallDataHint),
    uninstallButton: rep(pack.btnUninstall),
    uninstalledTitle: rep(pack.uninstalledTitle),
    uninstalledText: rep(pack.uninstalledDesc),
    uninstalledKeptText: rep(pack.uninstalledDesc),
    close: rep(pack.btnClose),
    cancel: rep(pack.btnCancel),
    minimize: rep(pack.ariaMinimize),
  };
}

export function getInstallerStrings(langCode: string): InstallerStrings {
  const normalized = normalizeLanguageCode(langCode) ?? 'en';
  if (normalized === 'tr') return TR_STRINGS;
  if (normalized === 'en') return EN_STRINGS;

  const packMap = INSTALLER_I18N_73 as Record<string, RawInstaller73Pack>;
  const fullPack = packMap[normalized];
  if (fullPack) {
    const adapted = adaptPackToInstallerStrings(fullPack);
    const manualOverride = LOCALIZED_OVERRIDES[normalized];
    return manualOverride ? { ...adapted, ...manualOverride } : adapted;
  }

  const override = LOCALIZED_OVERRIDES[normalized];
  if (override) {
    return { ...EN_STRINGS, ...override };
  }
  return EN_STRINGS;
}

export function formatInstallerText(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (acc, [key, val]) => acc.replaceAll(`{${key}}`, String(val)),
    template,
  );
}

export function detectQueryInstallerMode(): InstallerMode | null {
  if (typeof window === 'undefined') return null;
  const search = new URLSearchParams(window.location.search);
  const hashQueryIndex = window.location.hash.indexOf('?');
  const hashParams =
    hashQueryIndex >= 0 ? new URLSearchParams(window.location.hash.slice(hashQueryIndex)) : null;

  const isSetup = search.get('setup') === '1' || hashParams?.get('setup') === '1';
  const isUninstall = search.get('uninstall') === '1' || hashParams?.get('uninstall') === '1';
  if (isUninstall) return 'uninstall';
  if (isSetup) return 'setup';
  return null;
}

export async function fetchInstallerContext(): Promise<InstallerContext> {
  const queryMode = detectQueryInstallerMode();
  const osLocale = detectSystemLanguage();
  if (isTauriRuntime()) {
    try {
      const ctx = await invoke<InstallerContext>('get_installer_context');
      const normalizedLocale = normalizeLanguageCode(ctx.osLocale) ?? osLocale;
      return {
        ...ctx,
        mode: queryMode ?? ctx.mode,
        osLocale: normalizedLocale,
      };
    } catch {
      // Fallback below
    }
  }
  return {
    mode: queryMode ?? 'app',
    version: '1.0.0',
    defaultInstallDir: '%LOCALAPPDATA%\\Programs\\Optic Form Reader',
    isUpdate: false,
    installedVersion: null,
    estimatedSizeMb: 15,
    osLocale,
    userDataDir: '%LOCALAPPDATA%\\dev.vellium.opticalformreader',
  };
}

export async function pickInstallerFolder(currentDir: string): Promise<string | null> {
  if (isTauriRuntime()) {
    try {
      return await invoke<string | null>('installer_pick_folder', { currentDir });
    } catch {
      return null;
    }
  }
  return currentDir;
}

export async function runNativeInstall(options: InstallerRunOptions): Promise<InstallerRunResult> {
  try {
    localStorage.setItem('optik-language', options.language);
    localStorage.setItem('optik-ui-lang', options.language);
  } catch {
    // ignore
  }
  if (isTauriRuntime()) {
    return await invoke<InstallerRunResult>('installer_run_install', { options });
  }
  return {
    installDir: options.installDir,
    executablePath: `${options.installDir}\\optical-form-reader.exe`,
    uninstallerPath: `${options.installDir}\\uninstall.exe`,
    status: 'OK',
  };
}

export async function runNativeUninstall(
  installDir: string,
  deleteUserData: boolean,
): Promise<InstallerRunResult> {
  if (isTauriRuntime()) {
    return await invoke<InstallerRunResult>('installer_run_uninstall', {
      installDir,
      deleteUserData,
    });
  }
  return {
    installDir,
    executablePath: `${installDir}\\optical-form-reader.exe`,
    uninstallerPath: `${installDir}\\uninstall.exe`,
    status: 'OK',
  };
}

export async function launchInstalledAppAndExit(installDir: string): Promise<void> {
  if (isTauriRuntime()) {
    await invoke('installer_launch_installed_app', { installDir });
    return;
  }
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

export async function finishUninstallAndExit(installDir: string, isUninstallDone: boolean): Promise<void> {
  if (isTauriRuntime()) {
    if (isUninstallDone) {
      await invoke('installer_finish_uninstall_and_exit', { installDir });
    } else {
      await invoke('exit_app');
    }
    return;
  }
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

export { SUPPORTED_INSTALLER_LANGUAGES };
