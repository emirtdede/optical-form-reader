import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  CreditCard,
  Database,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Headphones,
  Info,
  Keyboard,
  Lock,
  Mail,
  Moon,
  Palette,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { APP_VERSION, getVelliumLegalUrls, VELLIUM_BRAND } from '../../brand/vellium';
import { useAppData } from '../../context/AppDataContext';
import { exportAllSessionsJson } from '../../export/exporters';
import { useI18n } from '../../i18n/I18nContext';
import { LEGAL_LAST_UPDATED } from '../../i18n/legal';
import type { LanguageCode } from '../../i18n/languages';
import type { LegalDocId } from '../../i18n/types';
import { getDesktopAppInfo, isDesktopShell, openExternalUrl, type DesktopAppInfo } from '../../platform/runtime';
import { importProcessingJobs, importSessions, listProcessingJobs } from '../../storage/database';
import { useThemeContext } from '../../theme/ThemeContext';
import type { AppIconVariant } from '../../theme/themes';
import { ProductMark, VelliumMark } from '../Brand';

export type SettingsTab = 'appearance' | 'language' | 'data' | 'legal' | 'about';

interface SettingsModalProps {
  isOpen: boolean;
  initialTab?: SettingsTab;
  onClose: () => void;
}

export function SettingsModal({ isOpen, initialTab = 'appearance', onClose }: SettingsModalProps) {
  const { lang, meta, t, isFallbackEnglish, languages, setLanguage, getThemeName, legalDocs } = useI18n();
  const {
    mode,
    themeId,
    reduceMotion,
    appIconVariant,
    themes,
    setMode,
    setThemeId,
    setReduceMotion,
    setAppIconVariant,
  } = useThemeContext();
  const { sessions, refresh, deleteAll } = useAppData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocId | null>(null);
  const [langQuery, setLangQuery] = useState('');
  const [dataNotice, setDataNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [appInfo, setAppInfo] = useState<DesktopAppInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setActiveLegalDoc(null);
      setDataNotice(null);
      void getDesktopAppInfo().then(setAppInfo);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.stopPropagation();
      if (activeLegalDoc) {
        setActiveLegalDoc(null);
      } else {
        onClose();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, activeLegalDoc, onClose]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeTab, activeLegalDoc]);

  const filteredLanguages = useMemo(() => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return languages;
    return languages.filter(
      (item) =>
        item.nativeName.toLowerCase().includes(q) ||
        item.englishName.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q),
    );
  }, [languages, langQuery]);

  if (!isOpen) return null;

  const totalStudents = sessions.reduce((sum, s) => sum + s.results.length, 0);
  const legalUrls = getVelliumLegalUrls(lang);
  const isDesktop = isDesktopShell();

  const tabs: Array<{ id: SettingsTab; label: string; icon: typeof Palette }> = [
    { id: 'appearance', label: t.settingsModal.tabAppearance, icon: Palette },
    { id: 'language', label: t.settingsModal.tabLanguage, icon: Globe },
    { id: 'data', label: t.settingsModal.tabData, icon: Database },
    { id: 'legal', label: t.settingsModal.tabLegal, icon: Scale },
    { id: 'about', label: t.settingsModal.tabAbout, icon: Info },
  ];

  const legalList: Array<{ id: LegalDocId; icon: typeof Shield }> = [
    { id: 'privacy', icon: Shield },
    { id: 'kvkk', icon: Lock },
    { id: 'terms', icon: Scale },
    { id: 'disclaimer', icon: ShieldAlert },
    { id: 'storage', icon: Database },
    { id: 'cookies', icon: FileText },
    { id: 'licenses', icon: FileText },
    { id: 'accessibility', icon: ShieldCheck },
    { id: 'contact', icon: Mail },
  ];

  const velliumContacts = [
    {
      label: t.settingsModal.contactGeneral,
      email: VELLIUM_BRAND.emails.contact,
      desc: t.settingsModal.contactGeneralDesc,
      icon: Mail,
    },
    {
      label: t.settingsModal.contactSupport,
      email: VELLIUM_BRAND.emails.support,
      desc: t.settingsModal.contactSupportDesc,
      icon: Headphones,
    },
    {
      label: t.settingsModal.contactPrivacy,
      email: VELLIUM_BRAND.emails.privacy,
      desc: t.settingsModal.contactPrivacyDesc,
      icon: Lock,
    },
    {
      label: t.settingsModal.contactLegal,
      email: VELLIUM_BRAND.emails.legal,
      desc: t.settingsModal.contactLegalDesc,
      icon: Scale,
    },
    {
      label: t.settingsModal.contactSecurity,
      email: VELLIUM_BRAND.emails.security,
      desc: t.settingsModal.contactSecurityDesc,
      icon: ShieldAlert,
    },
    {
      label: t.settingsModal.contactBilling,
      email: VELLIUM_BRAND.emails.billing,
      desc: t.settingsModal.contactBillingDesc,
      icon: CreditCard,
    },
  ];

  async function handleExportJson() {
    try {
      const allJobs = (await Promise.all(sessions.map((s) => listProcessingJobs(s.id)))).flat();
      exportAllSessionsJson(sessions, allJobs);
      setDataNotice({
        type: 'success',
        text: lang === 'tr' ? 'JSON yedeği indirildi.' : 'JSON backup exported.',
      });
    } catch {
      setDataNotice({
        type: 'error',
        text: lang === 'tr' ? 'Yedek hazırlanamadı.' : 'Failed to prepare JSON backup.',
      });
    }
  }

  async function handleImportJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      setDataNotice({
        type: 'error',
        text: lang === 'tr' ? 'Yedek dosyası 20 MB sınırını aşıyor.' : 'Backup file exceeds the 20 MB limit.',
      });
      return;
    }
    try {
      const payload = JSON.parse(await file.text()) as {
        schemaVersion?: number;
        sessions?: unknown[];
        jobs?: unknown[];
      };
      if (![1, 2].includes(payload.schemaVersion ?? 0) || !Array.isArray(payload.sessions)) {
        throw new Error(lang === 'tr' ? 'Yedek biçimi tanınmadı.' : 'Unrecognized backup format.');
      }
      const count = await importSessions(payload.sessions);
      if (!count) {
        throw new Error(
          lang === 'tr' ? 'İçe aktarılabilir kayıt bulunamadı.' : 'No valid sessions found to import.',
        );
      }
      if (Array.isArray(payload.jobs)) await importProcessingJobs(payload.jobs);
      await refresh();
      setDataNotice({
        type: 'success',
        text:
          lang === 'tr'
            ? `${count} değerlendirme başarıyla içe aktarıldı.`
            : `${count} assessment(s) imported successfully.`,
      });
    } catch (error) {
      setDataNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Import failed.',
      });
    }
  }

  async function handleDeleteAll() {
    if (!window.confirm(t.settingsModal.deleteAllConfirm)) return;
    try {
      await deleteAll();
      setDataNotice({
        type: 'success',
        text: lang === 'tr' ? 'Tüm yerel kayıtlar silindi.' : 'All local records were deleted.',
      });
    } catch {
      setDataNotice({
        type: 'error',
        text: lang === 'tr' ? 'Kayıtlar silinemedi.' : 'Could not delete local records.',
      });
    }
  }

  const activeDoc = activeLegalDoc ? legalDocs[activeLegalDoc] : null;

  return (
    <div
      className="v-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="v-settings-title"
    >
      <button
        type="button"
        className="v-modal-backdrop"
        aria-label={t.settingsModal.close}
        onClick={onClose}
      />

      <div className="v-modal-card">
        {/* Header */}
        <div className="v-modal-header">
          <div className="v-modal-header-top">
            <div className="v-modal-title-block">
              <h2 id="v-settings-title" className="v-modal-title">
                {activeDoc ? activeDoc.title : t.settingsModal.title}
              </h2>
              <p className="v-modal-subtitle">
                {activeDoc ? activeDoc.eyebrow : t.settingsModal.subtitle}
              </p>
            </div>
            <button
              type="button"
              className="desktop-icon-btn"
              onClick={onClose}
              aria-label={t.settingsModal.close}
            >
              <X size={16} />
            </button>
          </div>

          {!activeDoc && (
            <div className="v-modal-tabs" role="tablist" aria-label={t.settingsModal.title}>
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  className={`v-modal-tab ${activeTab === id ? 'is-active' : ''}`}
                  onClick={() => setActiveTab(id)}
                >
                  <Icon size={14} aria-hidden="true" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div ref={scrollRef} className="v-modal-body">
          {activeDoc ? (
            <div className="v-legal-reader">
              <div className="v-legal-reader-bar">
                <button
                  type="button"
                  className="v-btn v-btn-ghost"
                  onClick={() => setActiveLegalDoc(null)}
                >
                  <ArrowLeft size={14} />
                  <span>{t.settingsModal.backToSettings}</span>
                </button>
                <button
                  type="button"
                  className="v-btn v-btn-ghost"
                  onClick={() => void openExternalUrl(activeDoc.externalUrl)}
                >
                  <span>{t.settingsModal.openOnVellium}</span>
                  <ExternalLink size={13} />
                </button>
              </div>

              <p className="v-legal-intro">{activeDoc.intro}</p>
              <p className="v-legal-meta">
                {t.legalPage.lastUpdatedLabel}:{' '}
                {lang === 'tr' ? LEGAL_LAST_UPDATED.tr : LEGAL_LAST_UPDATED.en} ·{' '}
                {VELLIUM_BRAND.companyFullName}
              </p>

              <div className="v-legal-sections">
                {activeDoc.sections.map((section) => (
                  <section key={section.title} className="v-legal-section">
                    <h3>{section.title}</h3>
                    {section.paragraphs?.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                    {section.items && (
                      <ul>
                        {section.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            </div>
          ) : activeTab === 'appearance' ? (
            <div className="v-settings-stack">
              {/* Light / Dark Mode */}
              <section className="v-settings-group">
                <div className="v-group-head">
                  <h3>{t.settingsModal.appearanceModeTitle}</h3>
                </div>
                <div className="v-mode-grid">
                  <button
                    type="button"
                    aria-pressed={mode === 'light'}
                    className={`v-mode-btn ${mode === 'light' ? 'is-active' : ''}`}
                    onClick={() => setMode('light')}
                  >
                    <Sun size={15} />
                    <span>{t.settingsModal.lightMode}</span>
                  </button>
                  <button
                    type="button"
                    aria-pressed={mode === 'dark'}
                    className={`v-mode-btn ${mode === 'dark' ? 'is-active' : ''}`}
                    onClick={() => setMode('dark')}
                  >
                    <Moon size={15} />
                    <span>{t.settingsModal.darkMode}</span>
                  </button>
                </div>
              </section>

              {/* 14 Color Themes */}
              <section className="v-settings-group">
                <div className="v-group-head">
                  <h3>{t.settingsModal.colorThemeTitle}</h3>
                  <span className="v-mono-meta">
                    {themes.length} {t.settingsModal.themesCountUnit}
                  </span>
                </div>
                <div className="v-theme-grid">
                  {themes.map((theme) => {
                    const selected = theme.id === themeId;
                    const swatch = mode === 'dark' ? theme.swatchDark : theme.swatch;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        aria-pressed={selected}
                        className={`v-theme-chip ${selected ? 'is-active' : ''}`}
                        onClick={() => setThemeId(theme.id)}
                      >
                        <span className="v-theme-chip-left">
                          <span
                            className="v-theme-swatch"
                            style={{ backgroundColor: swatch }}
                            aria-hidden="true"
                          />
                          <span className="v-theme-label">{getThemeName(theme.id)}</span>
                        </span>
                        {selected && <Check size={14} className="v-check-icon" />}
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Monochrome Application & Desktop Icon Picker (Power Pilot Parity) */}
              <section className="v-settings-group">
                <div className="v-group-head">
                  <h3 id="v-app-icon-label">{t.settingsModal.appIconTitle}</h3>
                </div>
                <p id="v-app-icon-desc" className="v-row-desc">
                  {t.settingsModal.appIconDesc}
                </p>
                <div
                  className="v-icon-grid"
                  role="group"
                  aria-labelledby="v-app-icon-label"
                  aria-describedby="v-app-icon-desc"
                >
                  {(
                    [
                      { id: 'monochrome-dark', label: t.settingsModal.appIconMonochromeDark },
                      { id: 'monochrome-light', label: t.settingsModal.appIconMonochromeLight },
                      { id: 'monochrome-contrast', label: t.settingsModal.appIconMonochromeContrast },
                    ] as Array<{ id: AppIconVariant; label: string }>
                  ).map((opt) => {
                    const selected = appIconVariant === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        aria-pressed={selected}
                        className={`v-icon-card ${selected ? 'is-active' : ''}`}
                        onClick={() => setAppIconVariant(opt.id)}
                      >
                        <ProductMark variant={opt.id} className="v-icon-card-preview" />
                        <span className="v-icon-card-label">{opt.label}</span>
                        {selected && <Check size={14} className="v-icon-card-check" />}
                      </button>
                    );
                  })}
                </div>
                <p className="v-row-desc">{t.settingsModal.appIconSyncHint}</p>
              </section>

              {/* Reduce Motion */}
              <section className="v-settings-group">
                <div className="v-list-card">
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{t.settingsModal.reduceMotionTitle}</p>
                      <p className="v-row-desc">{t.settingsModal.reduceMotionDesc}</p>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={reduceMotion}
                      className={`v-pill-toggle ${reduceMotion ? 'is-active' : ''}`}
                      onClick={() => setReduceMotion(!reduceMotion)}
                    >
                      {reduceMotion ? t.settingsModal.onLabel : t.settingsModal.offLabel}
                    </button>
                  </div>
                </div>
              </section>

              {/* Shortcuts */}
              <section className="v-settings-group">
                <div className="v-group-head">
                  <h3 className="v-head-with-icon">
                    <Keyboard size={14} />
                    <span>{t.settingsModal.shortcutsTitle}</span>
                  </h3>
                </div>
                <div className="v-shortcuts-list">
                  <div className="v-shortcut-row">
                    <span>{t.settingsModal.shortcutToggleSidebar}</span>
                    <kbd>Ctrl + B</kbd>
                  </div>
                  <div className="v-shortcut-row">
                    <span>{t.settingsModal.shortcutOpenSettings}</span>
                    <kbd>Ctrl + ,</kbd>
                  </div>
                  <div className="v-shortcut-row">
                    <span>{t.settingsModal.shortcutSwitchViews}</span>
                    <kbd>Alt + 1–5</kbd>
                  </div>
                  <div className="v-shortcut-row">
                    <span>{t.settingsModal.shortcutCloseModal}</span>
                    <kbd>Esc</kbd>
                  </div>
                </div>
              </section>
            </div>
          ) : activeTab === 'language' ? (
            <div className="v-settings-stack">
              <section className="v-settings-group">
                <div className="v-group-head">
                  <h3>{t.settingsModal.languageSectionTitle}</h3>
                  <span className="v-mono-meta">
                    {meta.nativeName} ({meta.code}) · {t.settingsModal.languageTotalBadge}
                  </span>
                </div>
                <p className="v-row-desc">{t.settingsModal.languageSectionDesc}</p>

                {isFallbackEnglish && (
                  <div className="v-info-banner" role="status">
                    <Globe size={15} aria-hidden="true" />
                    <span>{t.settingsModal.languageFallbackNotice}</span>
                  </div>
                )}

                <div className="v-search-box">
                  <Search size={14} className="v-search-icon" aria-hidden="true" />
                  <input
                    type="search"
                    value={langQuery}
                    onChange={(e) => setLangQuery(e.target.value)}
                    placeholder={t.settingsModal.languageSearchPlaceholder}
                    aria-label={t.settingsModal.languageSearchPlaceholder}
                  />
                </div>

                {filteredLanguages.length === 0 ? (
                  <p className="v-empty-inline">{t.settingsModal.languageNoResults}</p>
                ) : (
                  <div className="v-lang-grid" role="listbox" aria-label={t.settingsModal.languageSectionTitle}>
                    {filteredLanguages.map((item) => {
                      const selected = item.code === lang;
                      return (
                        <button
                          key={item.code}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          className={`v-lang-item ${selected ? 'is-active' : ''}`}
                          onClick={() => setLanguage(item.code as LanguageCode)}
                        >
                          <div className="v-lang-item-copy">
                            <span className="v-lang-native">{item.nativeName}</span>
                            <span className="v-lang-english">{item.englishName}</span>
                          </div>
                          <div className="v-lang-item-right">
                            <span className={`v-lang-badge ${item.translated ? 'is-native' : ''}`}>
                              {item.translated
                                ? t.settingsModal.languageNativeBadge
                                : t.settingsModal.languageFallbackBadge}
                            </span>
                            {selected && <Check size={14} className="v-check-icon" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          ) : activeTab === 'data' ? (
            <div className="v-settings-stack">
              <section className="v-settings-group">
                <div className="v-group-head">
                  <h3>{t.settingsModal.dataSectionTitle}</h3>
                  <span className="v-mono-meta">
                    {sessions.length} {t.settingsModal.recordsSummary} · {totalStudents}{' '}
                    {t.nav.studentsUnit}
                  </span>
                </div>
                <p className="v-row-desc">{t.settingsModal.dataSectionDesc}</p>

                {dataNotice && (
                  <div className={`v-info-banner ${dataNotice.type === 'error' ? 'is-error' : ''}`} role="status">
                    <span>{dataNotice.text}</span>
                  </div>
                )}

                <div className="v-list-card">
                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{t.dataPage.jsonTitle}</p>
                      <p className="v-row-desc">{t.dataPage.jsonDesc}</p>
                    </div>
                    <div className="v-row-actions">
                      <button
                        type="button"
                        className="v-btn v-btn-ghost"
                        disabled={!sessions.length}
                        onClick={() => void handleExportJson()}
                      >
                        <Download size={14} />
                        <span>{t.settingsModal.exportJsonBackup}</span>
                      </button>
                      <button
                        type="button"
                        className="v-btn v-btn-ghost"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload size={14} />
                        <span>{t.settingsModal.importJsonBackup}</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json,application/json"
                        style={{ display: 'none' }}
                        onChange={(e) => void handleImportJson(e)}
                      />
                    </div>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{t.dataPage.zipVaultTitle}</p>
                      <p className="v-row-desc">{t.dataPage.zipVaultDesc}</p>
                    </div>
                    <button
                      type="button"
                      className="v-btn v-btn-ghost"
                      onClick={() => {
                        onClose();
                        navigate('/ayarlar');
                      }}
                    >
                      <span>{t.settingsModal.openDataPage}</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  <div className="v-list-row">
                    <div>
                      <p className="v-row-title">{t.settingsModal.deleteAllData}</p>
                      <p className="v-row-desc">{t.dataPage.dangerDesc}</p>
                    </div>
                    <button
                      type="button"
                      className="v-btn v-btn-danger"
                      disabled={!sessions.length}
                      onClick={() => void handleDeleteAll()}
                    >
                      <Trash2 size={14} />
                      <span>{t.settingsModal.deleteAllData}</span>
                    </button>
                  </div>
                </div>
              </section>
            </div>
          ) : activeTab === 'legal' ? (
            <div className="v-settings-stack">
              <section className="v-settings-group">
                <div className="v-group-head">
                  <h3>{t.settingsModal.legalSectionTitle}</h3>
                </div>
                <p className="v-row-desc">{t.settingsModal.legalSectionSubtitle}</p>

                <div className="v-list-card">
                  {legalList.map(({ id, icon: Icon }) => {
                    const doc = legalDocs[id];
                    return (
                      <button
                        key={id}
                        type="button"
                        className="v-legal-row-btn"
                        onClick={() => setActiveLegalDoc(id)}
                      >
                        <span className="v-legal-row-left">
                          <Icon size={15} className="v-legal-row-icon" aria-hidden="true" />
                          <span>{doc.title}</span>
                        </span>
                        <ChevronRight size={15} className="v-legal-row-arrow" aria-hidden="true" />
                      </button>
                    );
                  })}
                </div>

                <div className="v-legal-external-bar">
                  <button
                    type="button"
                    className="v-btn v-btn-ghost"
                    onClick={() => void openExternalUrl(legalUrls.privacy)}
                  >
                    <span>{legalDocs.privacy.title} (vellium.dev)</span>
                    <ExternalLink size={13} />
                  </button>
                  <button
                    type="button"
                    className="v-btn v-btn-ghost"
                    onClick={() => void openExternalUrl(legalUrls.companyInformation)}
                  >
                    <span>{t.settingsModal.aboutCompanyInfoLink}</span>
                    <ExternalLink size={13} />
                  </button>
                </div>
              </section>
            </div>
          ) : (
            /* About Vellium Tab */
            <div className="v-settings-stack">
              <section className="v-about-hero">
                <div className="v-about-logos">
                  <ProductMark className="v-about-product-mark" />
                  <VelliumMark className="v-about-vellium-mark" />
                </div>
                <div className="v-about-copy">
                  <h3>{t.settingsModal.aboutTitle}</h3>
                  <p>{t.settingsModal.aboutLocalFirstDesc}</p>
                </div>
              </section>

              <div className="v-meta-table">
                <div className="v-meta-row">
                  <span>{t.settingsModal.aboutVersionLabel}</span>
                  <strong>v{appInfo?.version ?? APP_VERSION}</strong>
                </div>
                <div className="v-meta-row">
                  <span>{t.settingsModal.aboutRuntimeLabel}</span>
                  <strong>
                    {isDesktop
                      ? t.settingsModal.aboutRuntimeDesktop
                      : t.settingsModal.aboutRuntimeWeb}
                  </strong>
                </div>
                <div className="v-meta-row">
                  <span>{t.settingsModal.aboutIdentityLabel}</span>
                  <strong>{appInfo?.identityName ?? VELLIUM_BRAND.msix.identityName}</strong>
                </div>
                <div className="v-meta-row">
                  <span>{t.settingsModal.aboutPublisherLabel}</span>
                  <strong>{VELLIUM_BRAND.companyFullName}</strong>
                </div>
              </div>

              <div className="v-trust-banner">
                <ShieldCheck size={16} aria-hidden="true" />
                <span>{t.settingsModal.aboutLocalFirstBadge}</span>
              </div>

              <div className="v-about-links">
                <button
                  type="button"
                  className="v-btn v-btn-primary"
                  onClick={() => void openExternalUrl(VELLIUM_BRAND.website)}
                >
                  <Globe size={14} />
                  <span>{t.settingsModal.aboutVisitWebsite}</span>
                  <ExternalLink size={13} />
                </button>
                <button
                  type="button"
                  className="v-btn v-btn-ghost"
                  onClick={() => void openExternalUrl(legalUrls.companyInformation)}
                >
                  <span>{t.settingsModal.aboutCompanyInfoLink}</span>
                  <ExternalLink size={13} />
                </button>
              </div>

              <section className="v-settings-group">
                <div className="v-group-head">
                  <h3>{t.settingsModal.aboutContactsTitle}</h3>
                </div>
                <p className="v-row-desc">{t.settingsModal.aboutContactsSubtitle}</p>
                <div className="v-contacts-grid">
                  {velliumContacts.map(({ label, email, desc, icon: Icon }) => (
                    <button
                      key={email}
                      type="button"
                      className="v-contact-card"
                      onClick={() => void openExternalUrl(`mailto:${email}`)}
                      title={email}
                    >
                      <span className="v-contact-icon" aria-hidden="true">
                        <Icon size={15} />
                      </span>
                      <span className="v-contact-info">
                        <span className="v-contact-label">{label}</span>
                        <strong className="v-contact-email">{email}</strong>
                        <span className="v-contact-desc">{desc}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              <footer className="v-about-footer">
                <span>{t.settingsModal.copyrightLine}</span>
              </footer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
