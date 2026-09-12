import PeoplePage from './PeoplePage';

export default function Board() {
  return (
    <PeoplePage
      listKey="board"
      title="المكتب المسير الحالي"
      description="الأعضاء المكلفون بتسيير الجمعية وتنفيذ قراراتها، كما يُحدَّثون من لوحة الإدارة."
      crumbLabel="المكتب المسير"
      countLabel="عضو مكتب"
      fallbackBadge="المكتب المسير"
      emptyText="سيتم إضافة أعضاء المكتب المسير من لوحة الإدارة قريباً."
      switchHref="/members"
      switchLabel="عرض قائمة الأعضاء"
      searchPlaceholder="البحث في أعضاء المكتب المسير"
    />
  );
}
