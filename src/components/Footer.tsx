import { Link } from 'react-router-dom';
import {
  Camera,
  FileCheck2,
  HardDrive,
  Layers,
  LayoutTemplate,
  Lock,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { getVelliumLegalUrls, VELLIUM_BRAND } from '../brand/vellium';
import { useI18n } from '../i18n/I18nContext';
import { ProductMark, VelliumMark } from './Brand';

export function Footer() {
  const { lang, t } = useI18n();
  const currentYear = new Date().getFullYear();
  const legalUrls = getVelliumLegalUrls(lang);

  const productLinks = [
    { to: '/tara', label: t.footer.linkScan },
    { to: '/sablonlar', label: t.footer.linkTemplates },
    { to: '/sonuclar', label: t.footer.linkResults },
    { to: '/rehber', label: t.footer.linkGuide },
    { to: '/rehber#sik-sorulan-sorular', label: t.footer.linkFaq },
    { to: '/ayarlar', label: t.footer.linkData },
  ];

  const legalLinks = [
    { to: '/gizlilik', label: t.footer.linkPrivacy },
    { to: '/kvkk-aydinlatma', label: t.footer.linkKvkk },
    { to: '/kullanim-kosullari', label: t.footer.linkTerms },
    { to: '/sorumluluk-reddi', label: t.footer.linkDisclaimer },
    { to: '/cerez-politikasi', label: t.footer.linkCookies },
  ];

  const supportLinks = [
    { to: '/yerel-depolama', label: t.footer.linkStorage },
    { to: '/acik-kaynak-lisanslari', label: t.footer.linkLicenses },
    { to: '/erisilebilirlik', label: t.footer.linkAccessibility },
    { to: '/iletisim', label: t.footer.linkContact },
  ];

  return (
    <footer className="site-footer" role="contentinfo">
      {/* 1. Trust Ribbon */}
      <div className="footer-ribbon">
        <div className="footer-ribbon-inner">
          <div className="ribbon-card">
            <div className="ribbon-icon">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <div className="ribbon-content">
              <h4>{t.footer.ribbonSecureTitle}</h4>
              <p>{t.footer.ribbonSecureDesc}</p>
            </div>
          </div>

          <div className="ribbon-card">
            <div className="ribbon-icon">
              <Zap size={20} aria-hidden="true" />
            </div>
            <div className="ribbon-content">
              <h4>{t.footer.ribbonAccuracyTitle}</h4>
              <p>{t.footer.ribbonAccuracyDesc}</p>
            </div>
          </div>

          <div className="ribbon-card">
            <div className="ribbon-icon">
              <LayoutTemplate size={20} aria-hidden="true" />
            </div>
            <div className="ribbon-content">
              <h4>{t.footer.ribbonTemplatesTitle}</h4>
              <p>{t.footer.ribbonTemplatesDesc}</p>
            </div>
          </div>

          <div className="ribbon-card">
            <div className="ribbon-icon">
              <HardDrive size={20} aria-hidden="true" />
            </div>
            <div className="ribbon-content">
              <h4>{t.footer.ribbonOfflineTitle}</h4>
              <p>{t.footer.ribbonOfflineDesc}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Grid */}
      <div className="footer-main">
        <div className="footer-inner-grid">
          <div className="footer-col footer-col-brand">
            <Link to="/" className="footer-brand-title" aria-label={t.meta.productName}>
              <ProductMark className="footer-brand-icon" />
              <span className="footer-brand-name">{t.meta.productName}</span>
            </Link>

            <p className="footer-brand-desc">{t.footer.brandDesc}</p>

            <ul className="footer-brand-features">
              <li>
                <Lock size={13} aria-hidden="true" />
                <span>{t.footer.featurePrivacy}</span>
              </li>
              <li>
                <FileCheck2 size={13} aria-hidden="true" />
                <span>{t.footer.featureTemplates}</span>
              </li>
              <li>
                <Layers size={13} aria-hidden="true" />
                <span>{t.footer.featureBooklets}</span>
              </li>
              <li>
                <Camera size={13} aria-hidden="true" />
                <span>{t.footer.featureCamera}</span>
              </li>
              <li>
                <ShieldCheck size={13} aria-hidden="true" />
                <span>{t.footer.featureStandards}</span>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">{t.footer.colProduct}</h3>
            <ul className="footer-nav-list">
              {productLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">{t.footer.colLegal}</h3>
            <ul className="footer-nav-list">
              {legalLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={legalUrls.companyInformation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer-nav-link"
                >
                  {t.footer.linkCompanyInfo}
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">{t.footer.colSupport}</h3>
            <ul className="footer-nav-list">
              {supportLinks.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="footer-nav-link">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={`mailto:${VELLIUM_BRAND.emails.support}`} className="footer-nav-link">
                  {VELLIUM_BRAND.emails.support}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Official Vellium Teknoloji Anonim Şirketi Signature Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <div className="unified-shimmer-wrapper">
            <div className="unified-shimmer-base">
              <span>
                © {currentYear} {VELLIUM_BRAND.companyFullName}. {t.footer.allRightsReserved}
              </span>
              <a
                href={VELLIUM_BRAND.website}
                target="_blank"
                rel="noopener noreferrer"
                className="vellium-link-anchor"
                title={`Designed & Developed by ${VELLIUM_BRAND.companyFullName}`}
              >
                <VelliumMark className="vellium-svg-logo" aria-hidden="true" />
                <span>
                  {t.footer.designedByPrefix} <strong>{VELLIUM_BRAND.brandName}</strong>
                </span>
              </a>
            </div>

            <div className="unified-shimmer-shine" aria-hidden="true">
              <span>
                © {currentYear} {VELLIUM_BRAND.companyFullName}. {t.footer.allRightsReserved}
              </span>
              <span className="vellium-link-anchor">
                <VelliumMark className="vellium-svg-logo" aria-hidden="true" />
                <span>
                  {t.footer.designedByPrefix} <strong>{VELLIUM_BRAND.brandName}</strong>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
