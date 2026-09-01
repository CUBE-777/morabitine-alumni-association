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
  const university = escapeHtml(person.university || '').trim();
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
      <div class="member-card-main">
        <div class="member-photo-column">
          <img class="member-photo" src="${image}" alt="صورة ${name}" loading="lazy"
            onerror="this.src='logo.jpg'">
          ${university ? `<span class="member-university">${university}</span>` : ''}
        </div>
        <div class="member-body">
          <div class="member-name-row">
            <h3>${name}</h3>
            <span class="member-badge">${badge}</span>
          </div>
          ${factsHtml}
        </div>
      </div>
    </article>`;
}

function normalizeSearchValue(value) {
  return String(value == null ? '' : value)
    .toLocaleLowerCase('ar')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/ـ/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim();
}

function matchesMemberSearch(person, query) {
  if (!query) return true;
  const searchableText = [
    person.name,
    person.university,
    person.promo
  ].map(normalizeSearchValue).join(' ');
  return searchableText.includes(query);
}

function loadMembersPage(options) {
  const grid = document.getElementById(options.gridId);
  if (!grid) return;

  const searchInput = document.getElementById(options.searchId);
  const countElement = document.getElementById(options.countId);

  fetch('content/members.json')
    .then(res => res.ok ? res.json() : { board: [], members: [] })
    .then(data => {
      const people = Array.isArray(data[options.listKey]) ? data[options.listKey] : [];
      if (!people.length) {
        grid.innerHTML = `<div class="gallery-empty">${options.emptyText}</div>`;
        return;
      }

      function renderPeople() {
        const query = normalizeSearchValue(searchInput ? searchInput.value : '');
        const filteredPeople = people.filter(person => matchesMemberSearch(person, query));

        if (countElement) {
          countElement.textContent = query
            ? `${filteredPeople.length} نتيجة من أصل ${people.length}`
            : `${people.length} ${options.countLabel || 'عضو'}`;
        }

        if (!filteredPeople.length) {
          grid.innerHTML = '<div class="gallery-empty">لا توجد نتائج مطابقة للبحث.</div>';
          return;
        }

        grid.innerHTML = filteredPeople
          .map(person => memberCardHtml(person, options.fallbackBadge))
          .join('');
      }

      if (searchInput) searchInput.addEventListener('input', renderPeople);
      renderPeople();
    })
    .catch(() => {
      grid.innerHTML = `<div class="gallery-empty">${options.emptyText}</div>`;
    });
}
