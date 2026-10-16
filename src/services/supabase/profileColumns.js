/**
 * src/services/supabase/profileColumns.js
 * مساعد مشترك لحفظ الأعضاء وأعضاء المكتب مع أعمدة الملف العام (0010/0011) والترجمات (0011).
 * إن لم تكن الأعمدة موجودة بعد في القاعدة نعيد المحاولة بدونها بدل أن يفشل الحفظ كله:
 *   1) المحاولة الكاملة  2) بدون translations  3) بدون كل أعمدة الملف العام والترجمات.
 * فشل المحاولة بسبب عمود ناقص لا يكتب شيئًا، فإعادة المحاولة آمنة.
 */
export const PROFILE_COLS = ['public_bio', 'study_path', 'socials', 'extra'];
export const TRANSLATION_COL = 'translations';

export const isMissingColumn = (e) => !!e && (e.code === 'PGRST204' || e.code === '42703');

const strip = (payload, keys) => {
  const copy = { ...payload };
  keys.forEach((k) => delete copy[k]);
  return copy;
};

/**
 * run(payload) => Promise<{data, error}>
 * يُرجع { res, degraded } حيث degraded=true إن حُفظت بيانات ناقصة بسبب غياب أعمدة.
 */
export async function runWithColumnFallback(run, payload) {
  const hasTr = TRANSLATION_COL in payload;
  const hasProfile = PROFILE_COLS.some((k) => k in payload);
  const attempts = [payload];
  if (hasTr) attempts.push(strip(payload, [TRANSLATION_COL]));
  if (hasProfile || hasTr) attempts.push(strip(payload, [...PROFILE_COLS, TRANSLATION_COL]));

  let res;
  let degraded = false;
  for (let i = 0; i < attempts.length; i += 1) {
    res = await run(attempts[i]);
    if (!(res.error && isMissingColumn(res.error))) {
      degraded = i > 0;
      break;
    }
  }
  return { res, degraded };
}
