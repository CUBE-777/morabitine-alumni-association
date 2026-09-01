function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function memberCardHtml(person, fallbackBadge) {
  const name = escapeHtml(person.name || 'عضو الجمعية');
  const badge = escapeHtml(person.role || fallbackBadge);
  const image = person.image ? escapeHtml(person.image) : 'logo.jpg';
  const facts = [
    ['العمر', person.age],
    ['سنة التخرج', person.promo],
    ['شعبة الباكالوريا', person.track],
    ['المهنة / التخصص', person.profession]
  ].filter(([, value]) => value != null && String(value).trim() !== '');
  const factsHtml = facts.length
    ? `<ul class="member-facts">${facts.map(([label, value]) =>
      `<li><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></li>`
    ).join('')}</ul>`
    : '';
  return `
    <article class="member-card">
      <img class="member-photo" src="${image}" alt="صورة ${name}" loading="lazy"
        onerror="this.src='logo.jpg'">
      <div class="member-body">
        <div class="member-name-row">
          <h3>${name}</h3>
          <span class="member-badge">${badge}</span>
        </div>
        ${factsHtml}
      </div>
    </article>`;
}

function loadMembersPage(options) {
  const grid = document.getElementById(options.gridId);
  if (!grid) return;

  fetch('content/members.json')
    .then(res => res.ok ? res.json() : { board: [], members: [] })
    .then(data => {
      const people = Array.isArray(data[options.listKey]) ? data[options.listKey] : [];
      if (!people.length) {
        grid.innerHTML = `<div class="gallery-empty">${options.emptyText}</div>`;
        return;
      }
      grid.innerHTML = people.map(person => memberCardHtml(person, options.fallbackBadge)).join('');
    })
    .catch(() => {
      grid.innerHTML = `<div class="gallery-empty">${options.emptyText}</div>`;
    });
}
