import { Link } from 'react-router-dom';

export default function PageHero({ crumbs, title, description }) {
  return (
    <section className="page-hero">
      <div className="container">
        <div className="breadcrumbs">
          <Link to="/">الرئيسية</Link>
          {crumbs.map((crumb) => (
            <span key={crumb.label} style={{ display: 'contents' }}>
              <span>‹</span>
              {crumb.href ? (
                <a href={crumb.href}>{crumb.label}</a>
              ) : (
                <span style={{ color: 'var(--gold)' }}>{crumb.label}</span>
              )}
            </span>
          ))}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
