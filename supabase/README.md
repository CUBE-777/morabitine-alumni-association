# Supabase — Phase 1: قاعدة البيانات

## طريقة التشغيل

### الخيار أ — عبر SQL Editor في لوحة Supabase (الأسهل)
1. افتح مشروعك في supabase.com → SQL Editor.
2. نفّذ الملفات **بالترتيب** من `migrations/`:
   - `0001_extensions_and_types.sql`
   - `0002_tables.sql`
   - `0003_rls_policies.sql`
   - `0004_functions_and_triggers.sql`
   - `0005_storage.sql`
3. (اختياري) نفّذ `seed/0001_site_settings_and_content.sql` لإدخال القيم الأولية.

### الخيار ب — عبر Supabase CLI
```bash
supabase link --project-ref <PROJECT_REF>
supabase db push
```

## بعد التشغيل — أنشئ أول Super Admin يدويًا
Supabase Auth لا يُنشئ صف `profiles` تلقائيًا، نفّذ بعد إنشاء أول مستخدم من تبويب Authentication:

```sql
insert into public.profiles (id, full_name, email, role)
values ('<AUTH_USER_UUID>', 'اسمك الكامل', 'admin@example.com', 'super_admin');
```

## ما بعد ذلك
أعطني `SUPABASE_URL` و `SUPABASE_ANON_KEY` (Settings → API) لأبدأ **Phase 2: ربط الموقع بـ Supabase Client**.
لا تشاركني أبدًا `service_role key`.
