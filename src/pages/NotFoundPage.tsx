import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext';

export function NotFoundPage() {
  const { t } = useI18n();
  return (
    <div className="page-section section-wrap empty-state">
      <span className="error-code">404</span>
      <h1>{t.notFound.title}</h1>
      <p>{t.notFound.description}</p>
      <Link className="button button-primary" to="/">
        <ArrowLeft size={17} /> {t.notFound.backHome}
      </Link>
    </div>
  );
}
