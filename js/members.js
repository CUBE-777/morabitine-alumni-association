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

/**
 * يحوّل صفًا من جدول "members" في Supabase إلى بنية person المستخدمة في memberCardHtml.
 * (يحافظ على نفس أسماء الحقول المستخدمة سابقًا في content/members.json)
 */
function memberRowToPerson(row) {
  return {
    name: row.full_name,
    role: 'عضو الجمعية',
    university: row.university,
    age: row.age,
    promo: row.promotion,
    track: row.track,
    profession: row.profession,
    image: row.photo_url
  };
}

/**
 * يحوّل صفًا من جدول "board_members" إلى نفس بنية person (نفس البطاقة والـ classes).
 */
function boardRowToPerson(row) {
  return {
    name: row.full_name,
    role: row.position,
    university: row.university,
    age: null,
    promo: null,
    track: null,
    profession: row.bio, // نعرض النبذة في مكان "المهنة/التخصص" حتى لا نضيف حقلاً جديدًا للبطاقة
    image: row.photo_url
  };
}

async function fetchPeopleFromSupabase(listKey) {
  if (!window.sb) throw new Error('Supabase client غير متاح');
  if (listKey === 'board') {
    const { data, error } = await sb
      .from('board_members')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data || []).map(boardRowToPerson);
  }
  const { data, error } = await sb
    .from('members')
    .select('*')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(memberRowToPerson);
}

function loadMembersPage(options) {
  const grid = document.getElementById(options.gridId);
  if (!grid) return;

  const searchInput = document.getElementById(options.searchId);
  const countElement = document.getElementById(options.countId);

  grid.innerHTML = '<div class="gallery-empty">جاري التحميل...</div>';

  fetchPeopleFromSupabase(options.listKey)
    .then(people => {
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
    .catch((err) => {
      console.error('تعذر تحميل البيانات من Supabase:', err);
      grid.innerHTML = `<div class="gallery-empty">${options.emptyText}</div>`;
    });
}
