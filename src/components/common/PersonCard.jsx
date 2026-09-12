export default function PersonCard({ person, fallbackBadge }) {
  const name = person.name || 'عضو الجمعية';
  const badge = person.role || fallbackBadge;
  const university = (person.university || '').trim();
  const facts = [
    ['العمر', person.age],
    ['سنة التخرج', person.promo],
    ['شعبة الباكالوريا', person.track],
    ['المهنة / التخصص', person.profession],
  ].filter(([, value]) => value != null && String(value).trim() !== '');

  return (
    <article className="member-card">
      <div className="member-card-main">
        <div className="member-photo-column">
          <img
            className="member-photo"
            src={person.image || '/logo.jpg'}
            alt={`صورة ${name}`}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = '/logo.jpg';
            }}
          />
          {university && <span className="member-university">{university}</span>}
        </div>
        <div className="member-body">
          <div className="member-name-row">
            <h3>{name}</h3>
            <span className="member-badge">{badge}</span>
          </div>
          {facts.length > 0 && (
            <ul className="member-facts">
              {facts.map(([label, value]) => (
                <li key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
