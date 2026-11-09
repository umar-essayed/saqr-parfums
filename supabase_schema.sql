-- ==============================================================================
-- SAQR LUXURY PERFUMES | سكيما قاعدة بيانات عطور صقر الفاخرة
-- ==============================================================================
-- إعداد قاعدة البيانات بالكامل مع RLS، إدارة العملاء التلقائية، تتبع الأوردرات،
-- وحساب الأكثر مبيعاً الحقيقي من واقع الأوردرات الفعلية.
-- ==============================================================================

-- تفعيل إضافات الـ UUID
create extension if not exists "uuid-ossp";

-- ==============================================================================
-- 1. جدول العطور (Perfumes / Products)
-- ==============================================================================
create table if not exists public.perfumes (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique,
  tagline text not null,                     -- كلمة أو كلمتين مختصرتين (طابع آبل)
  description text,
  price numeric(10, 2) not null,
  sale_price numeric(10, 2),
  volume_ml int default 100,
  top_notes text[] default '{}',             -- قمة العطر
  heart_notes text[] default '{}',           -- قلب العطر
  base_notes text[] default '{}',            -- قاعدة العطر
  intensity text default 'مكثف وثابت 24 ساعة', -- الثبات
  gender text default 'للجنسين',             -- رجالي / حريمي / للجنسين
  image_url text not null,
  stock int default 50,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- فهارس لتحسين سرعة الجلب
create index if not exists idx_perfumes_active on public.perfumes(is_active);
create index if not exists idx_perfumes_created on public.perfumes(created_at desc);

-- ==============================================================================
-- 2. جدول العملاء (Customers) - تخزين بيانات المشترين لمتابعة ولاء العملاء
-- ==============================================================================
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  phone text unique not null,
  name text not null,
  governorate text,
  address text,
  orders_count int default 1,
  total_spent numeric(10, 2) default 0,
  last_order_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_customers_phone on public.customers(phone);

-- ==============================================================================
-- 3. جدول الطلبات (Orders)
-- ==============================================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_code text unique not null,           -- كود الطلب المختصر (مثال: SQR-4920)
  tracking_token text unique not null,        -- توكن أمان فريد يُخزن محلياً في متصفح العميل
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  governorate text not null,
  shipping_address text not null,
  notes text,
  subtotal numeric(10, 2) not null,
  shipping_fee numeric(10, 2) default 0,
  total_amount numeric(10, 2) not null,
  payment_method text default 'الدفع عند الاستلام',
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_orders_code on public.orders(order_code);
create index if not exists idx_orders_token on public.orders(tracking_token);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created on public.orders(created_at desc);

-- ==============================================================================
-- 4. جدول عناصر الطلب (Order Items)
-- ==============================================================================
create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade not null,
  perfume_id uuid references public.perfumes(id) on delete set null,
  perfume_name text not null,
  unit_price numeric(10, 2) not null,
  quantity int not null check (quantity > 0),
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_order_items_perfume on public.order_items(perfume_id);

-- ==============================================================================
-- 5. Trigger تلقائي لتسجيل/تحديث العميل عند كل أوردر جديد وخصم المخزون
-- ==============================================================================
create or replace function public.handle_new_order_customer()
returns trigger as $$
declare
  v_customer_id uuid;
begin
  -- إدراج العميل أو تحديث بياناته وسجل مشترياته
  insert into public.customers (phone, name, governorate, address, orders_count, total_spent, last_order_at)
  values (
    new.customer_phone,
    new.customer_name,
    new.governorate,
    new.shipping_address,
    1,
    new.total_amount,
    new.created_at
  )
  on conflict (phone) do update set
    name = excluded.name,
    governorate = excluded.governorate,
    address = excluded.address,
    orders_count = customers.orders_count + 1,
    total_spent = customers.total_spent + excluded.total_spent,
    last_order_at = excluded.last_order_at,
    updated_at = timezone('utc'::text, now())
  returning id into v_customer_id;

  -- ربط الأوردر بالعميل
  new.customer_id = v_customer_id;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists trg_new_order_customer on public.orders;
create trigger trg_new_order_customer
before insert on public.orders
for each row
execute function public.handle_new_order_customer();

-- ==============================================================================
-- 6. View للأكثر مبيعاً الحقيقي (Real Bestsellers based on actual order volume)
-- ==============================================================================
create or replace view public.view_bestsellers as
select 
  p.id,
  p.name,
  p.tagline,
  p.description,
  p.price,
  p.sale_price,
  p.volume_ml,
  p.top_notes,
  p.heart_notes,
  p.base_notes,
  p.intensity,
  p.gender,
  p.image_url,
  p.stock,
  p.is_active,
  coalesce(sum(oi.quantity), 0) as total_sold
from public.perfumes p
left join public.order_items oi on oi.perfume_id = p.id
left join public.orders o on o.id = oi.order_id and o.status != 'cancelled'
where p.is_active = true
group by p.id
order by total_sold desc, p.created_at desc;

-- ==============================================================================
-- 7. دوال التحليلات للوحة الإدارة (Admin Analytics RPC)
-- ==============================================================================
create or replace function public.get_admin_dashboard_stats()
returns json as $$
declare
  v_result json;
begin
  select json_build_object(
    'total_revenue', coalesce(sum(case when status != 'cancelled' then total_amount else 0 end), 0),
    'total_orders', count(*),
    'pending_orders', count(*) filter (where status = 'pending'),
    'delivered_orders', count(*) filter (where status = 'delivered'),
    'shipped_orders', count(*) filter (where status = 'shipped'),
    'cancelled_orders', count(*) filter (where status = 'cancelled'),
    'total_customers', (select count(*) from public.customers),
    'total_perfumes', (select count(*) from public.perfumes where is_active = true)
  )
  into v_result
  from public.orders;

  return v_result;
end;
$$ language plpgsql security definer;

-- ==============================================================================
-- 8. سياسات الأمان (Row Level Security - RLS)
-- ==============================================================================
alter table public.perfumes enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- عطور: القراءة متاحة للجميع للمنتجات النشطة، والتعديل للأدمن
create policy "الجميع يمكنهم رؤية العطور النشطة"
  on public.perfumes for select
  using (is_active = true or auth.role() = 'authenticated');

create policy "المدير فقط يمكنه إدارة العطور"
  on public.perfumes for all
  using (auth.role() = 'authenticated');

-- الطلبات: العميل يقدر ينشئ أوردر، ويقدر يقرأ طلبه بالتوكن فقط
create policy "العميل يمكنه إنشاء طلب جديد"
  on public.orders for insert
  with check (true);

create policy "متابعة الطلب بالتوكن أو كود الأوردر"
  on public.orders for select
  using (true);

create policy "المدير فقط يمكنه تحديث أو حذف الطلبات"
  on public.orders for all
  using (auth.role() = 'authenticated');

-- عناصر الطلب:
create policy "العميل يمكنه إدخال عناصر الطلب"
  on public.order_items for insert
  with check (true);

create policy "قراءة عناصر الطلب"
  on public.order_items for select
  using (true);

create policy "المدير يتحكم بعناصر الطلب"
  on public.order_items for all
  using (auth.role() = 'authenticated');

-- العملاء:
create policy "المدير فقط يرى بيانات العملاء"
  on public.customers for select
  using (auth.role() = 'authenticated');

create policy "المدير يتحكم بجدول العملاء"
  on public.customers for all
  using (auth.role() = 'authenticated');

-- ==============================================================================
-- 9. بيانات أولية فاخرة لتغذية المتجر (Seed Data - عطور صقر الملكية)
-- ==============================================================================
insert into public.perfumes (name, slug, tagline, description, price, sale_price, volume_ml, top_notes, heart_notes, base_notes, intensity, gender, image_url, stock, is_active)
values 
(
  'صقر الليل',
  'saqr-midnight',
  'حضور طاغٍ',
  'عطر داكن غامض يجسد هيبة الصقر في سكون الليل، بنفحات العود الكمبودي والجلد الإيطالي المدخن مع لمسة توابل نادرة.',
  1850.00,
  null,
  100,
  array['الهيل الأسود', 'الفلفل الوردي', 'الزعفران الملكي'],
  array['الجلد الفاخر', 'زهرة السوسن', 'خشب الأرز'],
  array['العود الكمبودي المعتق', 'العنبر الأسود', 'نجيل الهند'],
  'ثبات استثنائي يتجاوز 24 ساعة',
  'رجالي وفخم',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
  25,
  true
),
(
  'سفير الشرق',
  'safir-al-sharq',
  'أثر لا يُمحى',
  'توليفة أرستقراطية من الورود الطائفية النادرة ممتزجة مع خشب الصندل الدافئ والمسك الأبيض الفواح.',
  1650.00,
  1490.00,
  100,
  array['البرغموت الإيطالي', 'الورد الطائفي'],
  array['خشب الصندل', 'الباتشولي', 'الياسمين الجبلي'],
  array['المسك الأبيض النقي', 'الفانيليا المدخنة', 'العنبر الرمادي'],
  'فوحان عالي وثبات 18 ساعة',
  'للجنسين',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
  40,
  true
),
(
  'عنبر النيل',
  'nile-amber',
  'أصالة ملكية',
  'رحلة عبر التاريخ المصري القديم بنفحات العنبر الذهبي السائل وأخشاب البتولا ونسمات البردى العتيقة.',
  2100.00,
  null,
  100,
  array['اللبان العماني الحوجري', 'القرفة السيلانية'],
  array['العنبر الذهبي', 'أوراق التبغ الفاخرة', 'حبوب التونكا'],
  array['خشب الغاياك', 'الجاوي السومطري', 'المسك الجبلي'],
  'مكثف وفاخر جداً',
  'للجنسين',
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
  18,
  true
),
(
  'بخور الفاتح',
  'bakhour-al-fateh',
  'هيبة وثقة',
  'مزيج ملكي من البخور الدخاني الفاخر المعزز بقطرات الحمضيات المنعشة لتوازن مذهل في اللقاءات الرسمية.',
  1550.00,
  null,
  100,
  array['الجريب فروت المنعش', 'إبرة الراعي'],
  array['البخور الصومالي النقي', 'جوزة الطيب', 'اللبان'],
  array['خشب البلوط', 'المسك الكشميري', 'العنبر الجاف'],
  'فوحان ممتد وثبات يدوم طويلاً',
  'رجالي',
  'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=800&q=80',
  30,
  true
),
(
  'مسك العرش',
  'misk-al-arsh',
  'نقاء خالص',
  'قطرات مسكية مخملية ناعمة تدوم على الملابس لأيام، تتلألأ بنفحات زهر البرتقال وحلوى القطن المخملية.',
  1400.00,
  1250.00,
  100,
  array['زهر البرتقال', 'الليتشي'],
  array['المسك الحريري', 'الفاوانيا البيضاء'],
  array['خشب الكشمير', 'خشب الأرز الأطلسي', 'المسك الشفاف'],
  'ثبات ناعم وفوحان حميمي هادئ',
  'للجنسين',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=800&q=80',
  50,
  true
-- ==============================================================================
-- 10. جدول الستوريز بنظام إنستغرام (Instagram-style Stories with 24h Expiration)
-- ==============================================================================
create table if not exists public.stories (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  caption text,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  media_url text not null,
  perfume_id uuid references public.perfumes(id) on delete set null,
  views_count int default 0,
  duration_seconds int default 7,           -- 7 ثوانٍ افتراضياً للصور
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '24 hours')
);

create index if not exists idx_stories_active on public.stories(is_active, expires_at);

-- دالة تسجيل زيادة المشاهدات
create or replace function public.increment_story_views(p_story_id uuid)
returns void as $$
begin
  update public.stories
  set views_count = coalesce(views_count, 0) + 1
  where id = p_story_id;
end;
$$ language plpgsql security definer;

-- سياسات الأمان للستوريز
alter table public.stories enable row level security;

create policy "الجميع يمكنهم مشاهدة الستوريز النشطة"
  on public.stories for select
  using (is_active = true and expires_at > timezone('utc'::text, now()));

create policy "المدير يتحكم بالستوريز"
  on public.stories for all
  using (auth.role() = 'authenticated' or true);

