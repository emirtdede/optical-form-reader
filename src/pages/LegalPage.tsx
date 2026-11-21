import { ExternalLink } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getVelliumLegalUrls, VELLIUM_BRAND } from '../brand/vellium';
import { useI18n } from '../i18n/I18nContext';
import { LEGAL_LAST_UPDATED, ROUTE_TO_LEGAL_DOC } from '../i18n/legal';
import { openExternalUrl } from '../platform/runtime';

export function LegalPage() {
  const { pathname } = useLocation();
  const { lang, t, legalDocs } = useI18n();
  const docId = ROUTE_TO_LEGAL_DOC[pathname] ?? 'privacy';
  const doc = legalDocs[docId] ?? legalDocs.privacy;
  const legalUrls = getVelliumLegalUrls(lang);
  const allDocs = Object.values(legalDocs);

  return (
    <div className="page-section section-wrap legal-layout">
      <aside className="legal-nav">
        <span>{t.legalPage.sidebarTitle}</span>
        {allDocs.map((item) => (
          <Link
            key={item.routePath}
            to={item.routePath}
            className={doc.id === item.id ? 'is-active' : ''}
          >
            {item.title}
          </Link>
        ))}
      </aside>
      <article className="legal-document">
        <header>
          <span className="eyebrow">{doc.eyebrow}</span>
          <h1>{doc.title}</h1>
          <p>{doc.intro}</p>
          <small>
            {t.legalPage.lastUpdatedLabel}:{' '}
            {lang === 'tr' ? LEGAL_LAST_UPDATED.tr : LEGAL_LAST_UPDATED.en} ·{' '}
            {VELLIUM_BRAND.companyFullName}
          </small>
        </header>
        {doc.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
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
        <div className="settings-actions-row" style={{ marginTop: '20px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="button button-primary"
            onClick={() => void openExternalUrl(doc.externalUrl)}
          >
            {t.legalPage.openAuthoritativeDoc} <ExternalLink size={16} />
          </button>
          <button
            type="button"
            className="button button-ghost"
            onClick={() => void openExternalUrl(legalUrls.companyInformation)}
          >
            {t.legalPage.companyInfoButton} <ExternalLink size={16} />
          </button>
        </div>
        <div className="legal-disclaimer">
          <strong>{t.legalPage.reviewNoteTitle}:</strong> {t.legalPage.reviewNoteBody}
        </div>
      </article>
    </div>
  );
}
