// supabase/functions/admin-create-user/index.ts
//
// يستبدل هذا الـ Edge Function عملية "انسخ UUID يدويًا من Supabase Dashboard"
// بعملية واحدة آمنة: مسؤول أعلى (super_admin) مسجّل دخوله يستدعي هذه الدالة
// عبر sb.functions.invoke('admin-create-user', {...}) من admin/admins.html.
//
// الدالة تُنشئ حساب Auth جديد (بريد + كلمة مرور مؤقتة) ثم تُنشئ صف profiles
// المرتبط به تلقائيًا — كل ذلك ضمن عملية واحدة على الخادم.
//
// ⚠️ service_role موجود فقط هنا، في بيئة Edge Function على خوادم Supabase،
// ويُقرأ من متغيرات البيئة (secrets) — لا يظهر أبدًا في أي كود يعمل في
// المتصفح (HTML/CSS/JS) ولا في Git repository.
//
// النشر:
//   supabase functions deploy admin-create-user
// (لا حاجة لضبط أي secret يدويًا: SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY
// متاحان تلقائيًا لكل Edge Function في مشروع Supabase.)

import { createClient } from 'jsr:@supabase/supabase-js@2';

const ALLOWED_ROLES = ['super_admin', 'editor', 'members_manager'];

function randomTempPassword(): string {
  // كلمة مرور مؤقتة عشوائية قوية (32 محرف عشوائي base64url تقريبًا)
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'مطلوب تسجيل الدخول' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // عميل بصلاحية المستدعي (يحمل JWT الخاص به) — نستخدمه فقط للتحقق من هويته ودوره
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: userData, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'جلسة غير صالحة' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // عميل بصلاحية service_role — للتحقق من دور المستدعي في profiles وللقيام
    // بعمليات الإنشاء المحمية. لا يُستخدم إلا على الخادم هنا.
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: callerProfile, error: profileErr } = await adminClient
      .from('profiles')
      .select('role, is_active')
      .eq('id', userData.user.id)
      .single();

    if (profileErr || !callerProfile || !callerProfile.is_active || callerProfile.role !== 'super_admin') {
      return new Response(JSON.stringify({ error: 'غير مصرح لك بإنشاء مستخدمين إداريين' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const full_name = String(body.full_name || '').trim();
    const role = String(body.role || '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({ error: 'بريد إلكتروني غير صالح' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!full_name || full_name.length < 2 || full_name.length > 150) {
      return new Response(JSON.stringify({ error: 'الاسم الكامل مطلوب' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (!ALLOWED_ROLES.includes(role)) {
      return new Response(JSON.stringify({ error: 'دور غير صالح' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const tempPassword = randomTempPassword();

    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
    });
    if (createErr || !created?.user) {
      return new Response(JSON.stringify({ error: createErr?.message || 'تعذر إنشاء المستخدم' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { error: insertErr } = await adminClient.from('profiles').insert({
      id: created.user.id,
      full_name,
      email,
      role,
      is_active: true,
    });
    if (insertErr) {
      // تراجع: احذف حساب Auth الذي أُنشئ للتو حتى لا يبقى حساب بلا profile
      await adminClient.auth.admin.deleteUser(created.user.id);
      return new Response(JSON.stringify({ error: insertErr.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // أرسل رابط "استعادة كلمة المرور" للمستخدم الجديد كي يضبط كلمة مروره
    // الخاصة بدل استخدام كلمة المرور المؤقتة العشوائية.
    await adminClient.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    return new Response(
      JSON.stringify({ id: created.user.id, message: 'تم إنشاء المستخدم؛ أُرسل له رابط لضبط كلمة المرور.' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('admin-create-user error:', err);
    return new Response(JSON.stringify({ error: 'خطأ داخلي في الخادم' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
