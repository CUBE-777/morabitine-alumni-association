import { supabase } from './client';
import { normalizeSearchValue } from '../../utils/arabicSearch';

const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

function memberRowToPerson(row) {
  return {
    id: row.id,
    createdAt: row.created_at,
    name: row.full_name,
    role: null, // يُترجَم في الواجهة (person.memberRole)
    university: row.university,
    // ملاحظة أمان/خصوصية: لا يُطلب حقل "age" هنا لأن قاعدة البيانات لا تمنح anon
    // صلاحية قراءته إطلاقًا (انظر supabase/migrations/0007_member_privacy.sql).
    // نفس الأمر لـ email/phone/city — تبقى خاصة بالإدارة فقط.
    promo: row.promotion,
    track: row.track,
    profession: row.profession,
    image: row.photo_url,
    // الملف العام (migration 0010) — قد تكون غير موجودة إن لم تُشغَّل بعد
    publicBio: row.public_bio,
    studyPath: row.study_path,
    socials: row.socials,
    extra: row.extra,
    // الترجمات (migration 0011) — اختيارية
    tr: row.translations,
  };
}

// inMembers=true: العضو يُعرض داخل صفحة الأعضاء (بطاقة عضو لا تعرض النبذة المختصرة)،
// فنستعمل النبذة المختصرة كنبذة عامة احتياطية حتى لا تضيع.
function boardRowToPerson(row, { inMembers = false } = {}) {
  const tr = isObj(row.translations) ? row.translations : {};
  return {
    id: row.id,
    memberId: row.member_id || null,
    createdAt: row.created_at,
    isBoard: true,
    name: row.full_name,
    role: row.position,
    roleTr: { fr: isObj(tr.fr) ? tr.fr.position : '', en: isObj(tr.en) ? tr.en.position : '' },
    university: row.university,
    age: null,
    promo: null,
    track: null,
    profession: null,
    bio: row.bio, // نبذة مختصرة (إن وجدت) تُعرض تحت الاسم في بطاقة المكتب
    image: row.photo_url,
    // الملف العام (migration 0011) — قد تكون غير موجودة إن لم تُشغَّل بعد
    publicBio: row.public_bio || (inMembers ? row.bio : null),
    studyPath: row.study_path,
    socials: row.socials,
    extra: row.extra,
    tr: row.translations,
  };
}

async function fetchBoardRows() {
  const BASE = 'id, member_id, full_name, position, photo_url, university, bio, sort_order, is_active, created_at';
  const query = (cols) => supabase
    .from('board_members')
    .select(cols)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  let res = await query(`${BASE}, public_bio, study_path, socials, extra, translations`);
  if (res.error) res = await query(BASE);
  if (res.error) throw res.error;
  return res.data || [];
}

async function fetchMemberRows() {
  // نطلب فقط الأعمدة العامة غير الحساسة (RLS يرفض الباقي أصلاً لدور anon).
  // نتراجع تدريجيًا إن لم تُشغَّل ملفات SQL الجديدة: (0011) ثم (0010) ثم الأعمدة الأساسية،
  // حتى لا تتعطل الصفحة.
  const BASE_COLS = 'id, full_name, photo_url, promotion, track, university, profession, status, created_at, deleted_at';
  const PROFILE = 'public_bio, study_path, socials, extra';
  const queryMembers = (cols) => supabase
    .from('members')
    .select(cols)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  let res = await queryMembers(`${BASE_COLS}, ${PROFILE}, translations`);
  if (res.error) res = await queryMembers(`${BASE_COLS}, ${PROFILE}`);
  if (res.error) res = await queryMembers(BASE_COLS);
  if (res.error) throw res.error;
  return res.data || [];
}

/**
 * يدمج أعضاء المكتب في قائمة الأعضاء بنفس الترتيب العام (الأحدث أولًا) دون مكان مخصص لهم،
 * وتظهر صفتهم في الشارة. من كان في الجدولين معًا (ربط member_id أو تطابق الاسم) تظهر له بطاقة واحدة فقط.
 */
function mergeBoardIntoMembers(members, boardRows) {
  const byId = new Map(members.map((p) => [p.id, p]));
  const byName = new Map(members.map((p) => [normalizeSearchValue(p.name), p]));
  const standalone = [];

  boardRows.forEach((row) => {
    const board = boardRowToPerson(row, { inMembers: true });
    const match = (board.memberId && byId.get(board.memberId)) || byName.get(normalizeSearchValue(board.name));
    if (!match) {
      standalone.push(board);
      return;
    }
    // بطاقة عضو واحدة: بيانات العضو هي الأصل، وتُكمَّل الحقول الفارغة من بيانات المكتب
    match.isBoard = true;
    match.role = board.role;
    match.roleTr = board.roleTr;
    match.image = match.image || board.image;
    match.university = match.university || board.university;
    match.publicBio = match.publicBio || board.publicBio;
    match.studyPath = match.studyPath || board.studyPath;
    if (!isObj(match.socials) || !Object.keys(match.socials).length) match.socials = board.socials;
    const hasExtra = isObj(match.extra) && Array.isArray(match.extra.items) && match.extra.items.length;
    if (!hasExtra) match.extra = board.extra;
  });

  const time = (p) => (p.createdAt ? new Date(p.createdAt).getTime() : 0);
  return [...members, ...standalone].sort((a, b) => time(b) - time(a));
}

export async function fetchPeopleDirectory(listKey) {
  if (listKey === 'board') {
    const rows = await fetchBoardRows();
    return rows.map((row) => boardRowToPerson(row));
  }
  const members = (await fetchMemberRows()).map(memberRowToPerson);
  // أعضاء المكتب إضافة مساعدة: فشل جلبهم لا يجب أن يعطّل صفحة الأعضاء.
  let boardRows = [];
  try {
    boardRows = await fetchBoardRows();
  } catch (err) {
    console.warn('تعذر جلب أعضاء المكتب لدمجهم في صفحة الأعضاء:', err);
  }
  return mergeBoardIntoMembers(members, boardRows);
}
