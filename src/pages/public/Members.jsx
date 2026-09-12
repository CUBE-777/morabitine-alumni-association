import PeoplePage from './PeoplePage';

export default function Members() {
  return (
    <PeoplePage
      listKey="members"
      title="الأعضاء"
      description="خريجو ثانوية المرابطين المنخرطون في الجمعية، مع نبذة عن مسار كل واحد منهم."
      crumbLabel="قائمة الأعضاء"
      countLabel="عضو"
      fallbackBadge="عضو"
      emptyText="سيتم إضافة الأعضاء من لوحة الإدارة قريباً."
      switchHref="/board"
      switchLabel="عرض المكتب المسير الحالي"
      searchPlaceholder="ابحث بالاسم أو الجامعة أو سنة التخرج"
    />
  );
}
