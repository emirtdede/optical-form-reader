import { useEffect, useState } from 'react';
import {
  ChevronRight,
  Cpu,
  CreditCard,
  Database,
  ExternalLink,
  FileText,
  Globe,
  Headphones,
  Lock,
  Mail,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { APP_VERSION, getVelliumLegalUrls, VELLIUM_BRAND } from '../brand/vellium';
import { ProductMark, VelliumMark } from '../components/Brand';
import { useAppData } from '../context/AppDataContext';
import { useAppSettings } from '../context/AppSettingsContext';
import { useI18n } from '../i18n/I18nContext';
import { LEGAL_LAST_UPDATED } from '../i18n/legal';
import type { LegalDocId } from '../i18n/types';
import { getDesktopAppInfo, isDesktopShell, openExternalUrl, type DesktopAppInfo } from '../platform/runtime';

export function AboutPage() {
  const { lang, t, legalDocs } = useI18n();
  const { sessions } = useAppData();
  const { openOnboarding } = useAppSettings();
  const [appInfo, setAppInfo] = useState<DesktopAppInfo | null>(null);
  const [activeLegalDocId, setActiveLegalDocId] = useState<LegalDocId | null>(null);

  const isTr = lang === 'tr';
  const desktop = isDesktopShell();
  const legalUrls = getVelliumLegalUrls(lang);
  const totalStudents = sessions.reduce((sum, s) => sum + s.results.length, 0);

  useEffect(() => {
    void getDesktopAppInfo().then(setAppInfo);
  }, []);

  const legalList: Array<{ id: LegalDocId; icon: typeof Shield }> = [
    { id: 'terms', icon: Scale },
    { id: 'privacy', icon: Shield },
    { id: 'kvkk', icon: Lock },
    { id: 'licenses', icon: FileText },
    { id: 'disclaimer', icon: ShieldAlert },
    { id: 'storage', icon: Database },
    { id: 'cookies', icon: FileText },
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

  const activeDoc = activeLegalDocId ? legalDocs[activeLegalDocId] : null;
  const displayVersion = appInfo?.version ?? APP_VERSION;

  return (
    <div id="view-about" className="pp-about-single-col">
      {/* Header */}
      <div className="pp-page-header">
        <div className="pp-page-header-copy">
          <h1 className="page-title">{t.nav.about}</h1>
          <p className="pp-page-subtitle">{t.meta.tagline}</p>
        </div>
        <div className="pp-page-header-actions">
          <button
            type="button"
            className="pp-btn-secondary"
            onClick={openOnboarding}
          >
            <Sparkles size={14} />
            <span>{isTr ? 'Karşılama Rehberi' : 'Welcome Guide'}</span>
          </button>
          <button
            type="button"
            className="pp-btn-secondary"
            onClick={() => void openExternalUrl(VELLIUM_BRAND.website)}
          >
            <Globe size={14} />
            <span>{t.settingsModal.aboutVisitWebsite}</span>
          </button>
          <button
            type="button"
            className="pp-btn-secondary"
            onClick={() => void openExternalUrl(VELLIUM_BRAND.productWebUrl)}
          >
            <ExternalLink size={14} />
            <span>optikformokuyucu.com</span>
          </button>
        </div>
      </div>

      {/* 4-Card Bento KPI Strip */}
      <div className="pp-bento-strip">
        <div className="pp-kpi-card">
          <div className="pp-kpi-head">
            <span className="pp-kpi-label">{t.settingsModal.aboutVersionLabel}</span>
            <span className="pp-kpi-icon">
              <ShieldCheck size={15} />
            </span>
          </div>
          <div>
            <p className="pp-kpi-value">v{displayVersion}</p>
            <p className="pp-kpi-sub">
              {desktop
                ? isTr
                  ? 'Windows 11 Masaüstü (x64)'
                  : 'Windows 11 Desktop (x64)'
                : t.settingsModal.aboutRuntimeWeb}
            </p>
          </div>
        </div>

        <div className="pp-kpi-card">
          <div className="pp-kpi-head">
            <span className="pp-kpi-label">{isTr ? 'Çekirdek' : 'Core Engine'}</span>
            <span className="pp-kpi-icon">
              <Cpu size={15} />
            </span>
          </div>
          <div>
            <p className="pp-kpi-value">{isTr ? 'Çevrimdışı' : 'Offline'}</p>
            <p className="pp-kpi-sub">OpenCV WASM · IndexedDB · PDF.js</p>
          </div>
        </div>

        <div className="pp-kpi-card">
          <div className="pp-kpi-head">
            <span className="pp-kpi-label">{isTr ? 'Dil Kataloğu' : 'Languages'}</span>
            <span className="pp-kpi-icon">
              <Globe size={15} />
            </span>
          </div>
          <div>
            <p className="pp-kpi-value">{t.settingsModal.languageTotalBadge}</p>
            <p className="pp-kpi-sub">
              {isTr ? '2 tam çeviri · 71 EN yedek' : '2 translated · 71 EN fallback'}
            </p>
          </div>
        </div>

        <div className="pp-kpi-card">
          <div className="pp-kpi-head">
            <span className="pp-kpi-label">{isTr ? 'Gizlilik' : 'Privacy'}</span>
            <span className="pp-kpi-icon pp-kpi-icon--success">
              <Shield size={15} />
            </span>
          </div>
          <div>
            <p className="pp-kpi-value">{isTr ? '%100 Yerel' : '100% Local'}</p>
            <p className="pp-kpi-sub">
              {isTr ? 'Telemetri ve bulut yok' : 'Zero telemetry or cloud'}
            </p>
          </div>
        </div>
      </div>

      {/* Section: Overview & Publisher */}
      <section id="about-sec-overview" className="pp-settings-section">
        <div className="pp-bento-panel">
          <div className="pp-about-brand-bar">
            <div className="pp-about-brand-left">
              <ProductMark className="pp-about-product-logo" />
              <div style={{ minWidth: 0 }}>
                <h2 className="pp-about-product-title">
                  {t.meta.productName} - {VELLIUM_BRAND.brandName}
                </h2>
                <p className="pp-about-product-sub">{t.meta.tagline}</p>
              </div>
            </div>
            <div className="pp-about-brand-right" title={VELLIUM_BRAND.companyFullName}>
              <VelliumMark className="v-about-vellium-mark" />
            </div>
          </div>

          <div className="pp-meta-list">
            <div className="pp-meta-row">
              <span className="pp-meta-label">{isTr ? 'Geliştirici' : 'Developer'}</span>
              <button
                type="button"
                className="pp-meta-link"
                onClick={() => void openExternalUrl(VELLIUM_BRAND.website)}
              >
                vellium.dev
              </button>
            </div>
            <div className="pp-meta-row">
              <span className="pp-meta-label">{t.settingsModal.aboutPublisherLabel}</span>
              <span className="pp-meta-value">{VELLIUM_BRAND.companyFullName}</span>
            </div>
            <div className="pp-meta-row">
              <span className="pp-meta-label">{t.settingsModal.aboutIdentityLabel}</span>
              <span className="pp-meta-value">
                {VELLIUM_BRAND.msix.tauriIdentifier}
              </span>
            </div>
            <div className="pp-meta-row">
              <span className="pp-meta-label">{t.settingsModal.aboutRuntimeLabel}</span>
              <span className="pp-meta-value">
                {desktop ? t.settingsModal.aboutRuntimeDesktop : t.settingsModal.aboutRuntimeWeb}
              </span>
            </div>
            <div className="pp-meta-row">
              <span className="pp-meta-label">{isTr ? 'Açık Kaynak Deposu' : 'Repository'}</span>
              <button
                type="button"
                className="pp-meta-link"
                onClick={() => void openExternalUrl(VELLIUM_BRAND.repositoryUrl)}
              >
                github.com/emirtdede/optical-form-reader
              </button>
            </div>
            <div className="pp-meta-row">
              <span className="pp-meta-label">{isTr ? 'Açık Kaynak Sponsorluğu' : 'Sponsor'}</span>
              <button
                type="button"
                className="pp-meta-link"
                onClick={() => void openExternalUrl(VELLIUM_BRAND.sponsorUrl)}
              >
                github.com/sponsors/emirtdede
              </button>
            </div>
            <div className="pp-meta-row">
              <span className="pp-meta-label">
                {isTr ? 'Resmî Şirket Bilgileri' : 'Company Information'}
              </span>
              <button
                type="button"
                className="pp-meta-link"
                onClick={() => void openExternalUrl(legalUrls.companyInformation)}
              >
                {t.settingsModal.aboutCompanyInfoLink}
              </button>
            </div>
          </div>

          <div className="pp-trust-strip">
            <ShieldCheck size={17} className="pp-trust-icon" aria-hidden="true" />
            <span>{t.settingsModal.aboutLocalFirstDesc}</span>
          </div>
        </div>
      </section>

      {/* Section: Local Device Summary */}
      <section id="about-sec-health" className="pp-settings-section">
        <div className="pp-section-bar">
          <span className="pp-section-bar-icon">
            <Database size={15} />
          </span>
          <h2 className="pp-section-bar-title">
            {isTr ? 'Bu Cihazdaki Değerlendirme Özeti' : 'On-Device Assessment Summary'}
          </h2>
        </div>

        <div className="pp-bento-panel">
          <div className="pp-bento-strip pp-bento-strip--3">
            <div className="pp-kpi-card">
              <span className="pp-kpi-label">{t.dataPage.storageSessionsLabel}</span>
              <p className="pp-kpi-value">{sessions.length}</p>
            </div>
            <div className="pp-kpi-card">
              <span className="pp-kpi-label">{t.dataPage.storageFormsLabel}</span>
              <p className="pp-kpi-value">{totalStudents}</p>
            </div>
            <div className="pp-kpi-card">
              <span className="pp-kpi-label">{isTr ? 'Şablon Kapasitesi' : 'Form Capacity'}</span>
              <p className="pp-kpi-value">1-160 {isTr ? 'Soru' : 'Questions'}</p>
            </div>
          </div>
          <p className="v-row-desc" style={{ margin: 0 }}>
            {isTr
              ? 'Bu istatistikler yalnızca bu bilgisayarda hesaplanır ve hiçbir sunucuya gönderilmez.'
              : 'These metrics are computed strictly on this computer and are never sent anywhere.'}
          </p>
        </div>
      </section>

      {/* Section: Legal Documents & Support */}
      <section id="about-sec-legal" className="pp-settings-section">
        <div className="pp-section-bar">
          <span className="pp-section-bar-icon">
            <Scale size={15} />
          </span>
          <h2 className="pp-section-bar-title">{t.settingsModal.legalSectionTitle}</h2>
        </div>

        <div className="pp-bento-panel">
          <p className="v-row-desc" style={{ margin: 0 }}>
            {t.settingsModal.legalSectionSubtitle}
          </p>

          <div className="pp-about-legal-grid">
            {legalList.map(({ id, icon: Icon }) => {
              const doc = legalDocs[id];
              return (
                <button
                  key={id}
                  type="button"
                  className="pp-legal-card-btn"
                  onClick={() => setActiveLegalDocId(id)}
                >
                  <div className="pp-legal-card-top">
                    <Icon size={17} className="v-legal-row-icon" aria-hidden="true" />
                    <ChevronRight size={15} className="v-legal-row-arrow" aria-hidden="true" />
                  </div>
                  <p className="pp-legal-card-title">{doc.title}</p>
                  <p className="pp-legal-card-sub">{doc.eyebrow}</p>
                </button>
              );
            })}
          </div>

          <div className="v-group-head" style={{ marginTop: '6px' }}>
            <h3>{t.settingsModal.aboutContactsTitle}</h3>
          </div>
          <div className="v-contacts-grid">
            {velliumContacts.map(({ label, email, desc, icon: Icon }) => (
              <button
                key={email}
                type="button"
                className="v-contact-card"
                onClick={() => void openExternalUrl(`mailto:${email}`, { skipConfirm: true })}
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

          <div className="pp-about-copyright-bar">
            <span>{t.settingsModal.copyrightLine}</span>
            <span>
              {VELLIUM_BRAND.companyFullName} · vellium.dev
            </span>
          </div>
        </div>
      </section>

      {/* In-App Legal Document Reader Modal */}
      {activeDoc && (
        <div
          className="pp-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="about-legal-modal-title"
        >
          <div className="pp-modal-panel pp-modal-panel-lg">
            <div className="pp-modal-header">
              <div className="pp-modal-title-row">
                <span className="pp-modal-icon" aria-hidden="true">
                  <Scale size={17} />
                </span>
                <div>
                  <h3 id="about-legal-modal-title" className="pp-modal-title">
                    {activeDoc.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    {activeDoc.eyebrow} · {t.legalPage.lastUpdatedLabel}:{' '}
                    {isTr ? LEGAL_LAST_UPDATED.tr : LEGAL_LAST_UPDATED.en}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="pp-modal-close"
                onClick={() => setActiveLegalDocId(null)}
                aria-label={isTr ? 'Kapat' : 'Close'}
              >
                <X size={17} />
              </button>
            </div>

            <div className="pp-modal-body pp-modal-body-scroll">
              <p className="v-legal-intro" style={{ marginBottom: '12px' }}>
                {activeDoc.intro}
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

            <div className="pp-modal-footer">
              <button
                type="button"
                className="pp-btn-secondary"
                onClick={() => void openExternalUrl(activeDoc.externalUrl)}
              >
                <span>{t.settingsModal.openOnVellium}</span>
                <ExternalLink size={13} />
              </button>
              <button
                type="button"
                className="pp-btn-primary"
                onClick={() => setActiveLegalDocId(null)}
              >
                {isTr ? 'Kapat' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
