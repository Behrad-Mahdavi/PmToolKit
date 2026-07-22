# بریف برنامه‌نویسی — ابزار جامع Product Management (PM Toolkit)

## ۰. خلاصه اجرایی

هدف: ساخت یک وب‌اپ شخصی (React/Next.js) که تمام کارهای روزمره یک Product Manager را در یک جا جمع کند: اولویت‌بندی بک‌لاگ، اقتصاد واحد (Unit Economics)، سلسله‌مراتب متریک‌ها و KPI، تحلیل فانل/کوهورت، محاسبه‌گر A/B تست، مدل قیمت‌گذاری، OKR، و گزارش‌دهی با نمودار. کاربر تک‌نفره (خودت) است؛ معماری باید ساده و بدون بار عملیاتی اضافه (بدون میکروسرویس، بدون DevOps سنگین) اما داده‌محور و قابل توسعه به تیمی در آینده باشد.

**تصمیم کلیدی:** این یک ابزار محاسباتی + آرشیو تصمیم است، نه فقط یک کالکولیتور یک‌بارمصرف. هر محاسبه باید ذخیره، قابل مقایسه در طول زمان، و قابل خروجی‌گیری (Export) باشد — وگرنه فقط یک صفحه‌ی فرمول می‌شود که ارزش تکرارش را ندارد.

**Trade-off آگاهانه:** چون تک‌کاربره است، از Auth پیچیده و Multi-tenancy صرف‌نظر می‌کنیم در MVP؛ این یعنی اگر بعداً بخواهی تیمت هم از آن استفاده کند، باید لایه‌ی نقش‌ها/سازمان را اضافه کنی. این هزینه‌ی آینده را آگاهانه می‌پذیریم تا سرعت ساخت الان بالاتر برود.

---

## ۱. تکنولوژی پیشنهادی

| لایه | انتخاب | چرا |
|---|---|---|
| Frontend | Next.js 14+ (App Router) + TypeScript | SSR/SSG برای گزارش‌ها، Routing تمیز، اکوسیستم بزرگ |
| UI Kit | Tailwind CSS + shadcn/ui | سریع، سفارشی‌سازی راحت، بدون قفل‌شدن به یک دیزاین سیستم سنگین |
| نمودار | Recharts (پیش‌فرض) + D3 برای نمودارهای سفارشی (Funnel، Cohort Heatmap) | Recharts برای ۸۰٪ نیازها کافی است؛ D3 فقط برای Cohort Heatmap و Funnel چندمرحله‌ای |
| State | Zustand یا React Query (برای cache کردن داده‌های سرور) | سبک، بدون Boilerplate ریداکس |
| دیتابیس + Backend | **Supabase** (Postgres مدیریت‌شده + Auth + Storage + Realtime) | یک پلتفرم به‌جای سه ابزار جدا؛ برای یک پروژه‌ی شخصی، هزینه‌ی عملیاتی صفر و سرعت راه‌اندازی بالا |
| ORM / Data Access | Prisma **یا** Supabase JS Client مستقیم (`@supabase/supabase-js`) | اگر بخواهی از Realtime و RLS ساده استفاده کنی، Client مستقیم راحت‌تر است؛ اگر Type-safety پیچیده‌تر می‌خواهی، Prisma روی همان دیتابیس Supabase هم کار می‌کند (Connection String را از Supabase بگیر) |
| امنیت داده | **Row Level Security (RLS)** فعال روی همه جدول‌ها، حتی برای یک کاربر | چون داده مالی حساس (CAC/LTV) نگه می‌داری؛ RLS تضمین می‌کند حتی با انتشار اشتباه یک API Key عمومی، داده لو نرود |
| Auth | **Supabase Auth** (Email/Password یا Magic Link) — یک اکانت برای خودت | نیازی به NextAuth جدا نیست؛ Session و JWT را خود Supabase مدیریت می‌کند و مستقیم با RLS ترکیب می‌شود |
| Export | جدول → CSV (SheetJS)، گزارش → PDF (react-pdf یا Puppeteer) → آپلود در **Supabase Storage** | آرشیو گزارش‌های قبلی هم در همان پلتفرم می‌ماند؛ لینک دانلود امن از Storage گرفته می‌شود |
| Realtime (اختیاری فاز ۲) | **Supabase Realtime** روی جدول `MetricSnapshot` | اگر بعداً تیمت هم وصل شدند، آپدیت زنده‌ی داشبورد بدون Polling دستی |
| Deploy | Vercel (فرانت + API Routes) + **Supabase** (دیتابیس/Auth/Storage) | صفر هزینه‌ی DevOps، مناسب یک پروژه‌ی شخصی؛ هر دو Free Tier کافی برای استفاده تک‌نفره |

---

## ۲. معماری اطلاعات — ماژول‌ها

هفت ماژول اصلی + یک لایه‌ی گزارش‌دهی مرکزی که از همه‌ی آن‌ها داده می‌کشد:

1. **Prioritization** (اولویت‌بندی بک‌لاگ)
2. **Unit Economics & Financial Health** (اقتصاد واحد)
3. **Metrics Hierarchy & KPI Tracker** (North Star / Leading / Lagging / Guardrail)
4. **Experimentation** (A/B Test Sample Size & Significance)
5. **Funnel & Cohort Analytics**
6. **Pricing & Packaging**
7. **OKR Tracker**
8. **Reporting Dashboard** (مرکزی — ترکیب همه)

هر ماژول باید: یک فرم ورودی، یک موتور محاسبه (Formula Engine)، ذخیره‌سازی نسخه‌به‌نسخه (هر بار محاسبه = یک رکورد تاریخ‌دار)، و یک نمای نموداری داشته باشد.

---

## ۳. مدل داده (Schema پیشنهادی — Prisma)

> **نکته Supabase:** این Schema مستقیم روی Postgres پروژه‌ی Supabase اجرا می‌شود (چه با Prisma Migrate، چه با SQL Editor خود Supabase). هر جدول باید ستون `ownerId String` (برابر با `auth.uid()` کاربر لاگین‌شده) داشته باشد تا Policy زیر رویش قابل تعریف باشد:
> ```sql
> create policy "owner_full_access" on "Project"
>   for all using (auth.uid()::text = "ownerId");
> ```
> این Policy باید روی **همه‌ی جدول‌ها** (نه فقط Project) تکرار شود، وگرنه RLS نیمه‌کاره می‌ماند.

```prisma
model Project {
  id          String   @id @default(cuid())
  ownerId     String   // = auth.uid() از Supabase Auth
  name        String
  createdAt   DateTime @default(now())
  backlogItems     BacklogItem[]
  metricSnapshots  MetricSnapshot[]
  experiments      Experiment[]
  funnels          Funnel[]
  pricingModels    PricingModel[]
  okrs             OKR[]
}

model BacklogItem {
  id          String   @id @default(cuid())
  projectId   String
  title       String
  description String?
  // RICE
  reach       Float?
  impact      Float?   // 0.25 / 0.5 / 1 / 2 / 3
  confidence  Float?   // 0..1 (درصد)
  effort      Float?   // person-months
  riceScore   Float?   // محاسبه‌شده
  // ICE
  iceImpact     Float?
  iceConfidence Float?
  iceEase       Float?
  iceScore      Float?
  // Kano
  kanoCategory  String?  // Must-be / Performance / Attractive / Indifferent / Reverse
  kanoFunctional   Int?   // پاسخ 1-5 پرسش عملکردی
  kanoDysfunctional Int?  // پاسخ 1-5 پرسش ضدعملکردی
  status      String   @default("backlog") // backlog / in-progress / shipped / killed
  createdAt   DateTime @default(now())
  project     Project  @relation(fields: [projectId], references: [id])
}

model MetricSnapshot {
  id          String   @id @default(cuid())
  projectId   String
  date        DateTime @default(now())
  metricName  String   // مثلا "MRR", "Churn Rate", "CAC", "LTV"
  metricType  String   // north-star / leading / lagging / guardrail
  value       Float
  project     Project  @relation(fields: [projectId], references: [id])
}

model Experiment {
  id             String   @id @default(cuid())
  projectId      String
  name           String
  baselineRate   Float    // نرخ تبدیل نسخه فعلی
  mde            Float    // Minimum Detectable Effect (حداقل اثر قابل تشخیص)
  alpha          Float    @default(0.05)
  power          Float    @default(0.8)
  requiredSampleSizePerVariant Int?
  actualConversionControl   Float?
  actualConversionVariant   Float?
  pValue         Float?
  status         String   @default("planned") // planned / running / concluded
  createdAt      DateTime @default(now())
  project        Project  @relation(fields: [projectId], references: [id])
}

model Funnel {
  id          String   @id @default(cuid())
  projectId   String
  name        String
  steps       FunnelStep[]
  project     Project  @relation(fields: [projectId], references: [id])
}

model FunnelStep {
  id          String   @id @default(cuid())
  funnelId    String
  stepOrder   Int
  stepName    String
  userCount   Int
  funnel      Funnel   @relation(fields: [funnelId], references: [id])
}

model CohortEntry {
  id            String   @id @default(cuid())
  projectId     String
  cohortDate    DateTime  // تاریخ عضویت کوهورت (مثلا ماه ثبت‌نام)
  periodIndex   Int       // شماره دوره (0, 1, 2, ...)
  activeUsers   Int
  cohortSize    Int
}

model PricingModel {
  id          String   @id @default(cuid())
  projectId   String
  name        String
  tiers       PricingTier[]
  project     Project  @relation(fields: [projectId], references: [id])
}

model PricingTier {
  id            String   @id @default(cuid())
  pricingModelId String
  tierName      String
  price         Float
  estimatedWTP  Float?    // Willingness to Pay میانگین
  features      String[] // لیست فیچرهای این تیر
}

model OKR {
  id          String   @id @default(cuid())
  projectId   String
  objective   String
  keyResults  KeyResult[]
  quarter     String   // مثلا "2026-Q3"
  project     Project  @relation(fields: [projectId], references: [id])
}

model KeyResult {
  id            String   @id @default(cuid())
  okrId         String
  description   String
  startValue    Float
  targetValue   Float
  currentValue  Float
  keyResult     OKR      @relation(fields: [okrId], references: [id])
}
```

---

## ۴. فرمول‌ها و منطق موتور محاسبه (Formula Engine)

این بخش، هسته‌ی فنی‌ترین قسمت پروژه است. هر فرمول باید به‌صورت یک تابع خالص (Pure Function) در `lib/formulas/` پیاده‌سازی شود تا قابل تست واحد (Unit Test) باشد.

### ۴.۱ اولویت‌بندی

```
RICE = (Reach × Impact × Confidence) / Effort
// Reach: تعداد کاربر در بازه زمانی مشخص (مثلا در ماه)
// Impact: 3=خیلی‌زیاد, 2=زیاد, 1=متوسط, 0.5=کم, 0.25=خیلی‌کم
// Confidence: بین 0 تا 1 (درصد اطمینان)
// Effort: نفر-ماه

ICE = (Impact + Confidence + Ease) / 3
// هرکدام روی مقیاس 1 تا 10

Value_vs_Effort = یک نمودار پراکندگی (Scatterplot) با محورهای Value (Y) و Effort (X)
// دسته‌بندی: Quick Wins (Value بالا/Effort کم) | Big Bets (Value بالا/Effort زیاد)
// | Fill-ins (Value کم/Effort کم) | Time Sinks (Value کم/Effort زیاد)
```

**Kano Model (محاسبه‌ی خودکار دسته‌بندی):**
هر فیچر با دو سوال سنجیده می‌شود: پرسش عملکردی («اگر این فیچر باشد چه حسی داری؟») و ضدعملکردی («اگر نباشد چه حسی داری؟») — هرکدام با ۵ گزینه (دوستش دارم / انتظارش را دارم / خنثی‌ام / قابل‌تحمل است / ازش بدم می‌آید). جدول ترکیب این دو پاسخ، دسته را مشخص می‌کند: Must-be, Performance, Attractive, Indifferent, Reverse, Questionable. این جدول ترکیبی باید به‌صورت یک Lookup Table ثابت در کد پیاده‌سازی شود (۵×۵ = ۲۵ حالت).

اگر داده از چند کاربر جمع شده: 
```
Better(Satisfaction) = (A + O) / (A + O + M + I)
Worse(Dissatisfaction) = -(O + M) / (A + O + M + I)
// A=Attractive count, O=One-dimensional/Performance count,
// M=Must-be count, I=Indifferent count
```

### ۴.۲ اقتصاد واحد (Unit Economics)

```
CAC = هزینه کل فروش و بازاریابی در بازه / تعداد مشتری جدید در همان بازه

LTV = (ARPU × Gross Margin%) / Churn Rate
// روش دوم ساده‌تر: LTV = ARPU × میانگین طول عمر مشتری (به ماه)
// میانگین طول عمر = 1 / Churn Rate

LTV_to_CAC_Ratio = LTV / CAC
// قاعده سرانگشتی صنعت: >3 سالم، <1 بحرانی (هشدار بده اگر زیر ۱ بود)

Payback_Period (ماه) = CAC / (ARPU × Gross Margin%)

Churn_Rate = مشتریان ازدست‌رفته در بازه / مشتریان کل در ابتدای بازه
Retention_Rate = 1 - Churn_Rate

MRR = مجموع درآمد تکرارشونده ماهانه همه مشتریان فعال
ARR = MRR × 12

NRR (Net Revenue Retention) =
  (MRR_ابتدای_دوره + Expansion − Contraction − Churned_Revenue) / MRR_ابتدای_دوره
// >100% یعنی رشد از مشتریان فعلی، بدون نیاز به مشتری جدید

NPS = %Promoters(9-10) − %Detractors(0-6)
```

### ۴.۳ سلسله‌مراتب متریک (North Star / Leading / Lagging / Guardrail)

منطق نرم‌افزاری خاصی ندارد؛ بخش UI باید اجازه دهد هر متریک با یک برچسب (Tag) از این ۴ نوع دسته‌بندی شود، و در داشبورد این چهار گروه در کارت‌های جدا نمایش داده شوند. مهم: هر بار که یک Leading Metric بهبود می‌یابد ولی Guardrail افت می‌کند، سیستم باید هشدار بصری (رنگ قرمز) نشان دهد — این منطق «هشدار متقابل» باید در کد پیاده شود: اگر تغییر درصدی دو متریک هم‌زمان در بازه‌ی مشخص خلاف جهت هم بود و هر دو از یک آستانه (مثلا ۵٪) بیشتر بود، هشدار صادر شود.

### ۴.۴ محاسبه‌گر A/B تست (بخش فنی‌ترین بخش پروژه)

برای مقایسه دو نرخ تبدیل (Two-proportion test)، فرمول اندازه نمونه‌ی لازم به‌ازای هر گروه:

```
n = [ (Z_(1-α/2) + Z_(1-β))² × (p1(1-p1) + p2(1-p2)) ] / (p1 - p2)²

که در آن:
p1 = نرخ تبدیل پایه (Baseline Conversion Rate)
p2 = p1 + MDE (Minimum Detectable Effect؛ کوچک‌ترین تفاوتی که می‌خواهیم بتوانیم تشخیص دهیم)
Z_(1-α/2) = مقدار Z برای سطح اطمینان (معمولا α=0.05 → Z=1.96)
Z_(1-β) = مقدار Z برای توان آزمون (معمولا Power=0.8 → Z=0.84)
```

برای محاسبه p-value پس از پایان تست (Two-proportion z-test):

```
p_pooled = (x1 + x2) / (n1 + n2)
SE = sqrt( p_pooled × (1-p_pooled) × (1/n1 + 1/n2) )
z = (p1_observed − p2_observed) / SE
p_value = از توزیع نرمال استاندارد بر اساس z محاسبه شود (کتابخانه jStat یا simple-statistics در JS)
```

**پیاده‌سازی:** از کتابخانه‌ی `jstat` یا `simple-statistics` در npm استفاده کن تا خودت تابع CDF نرمال را از صفر ننویسی. خروجی UI باید صریح بگوید: «این تست معتبر نیست چون نمونه کافی نیست» اگر Sample Size واقعی کمتر از عدد لازم بود — این یک Guardrail حیاتی است، وگرنه ابزار به تصمیم‌های آماری غلط دامن می‌زند.

### ۴.۵ تحلیل فانل و کوهورت

```
Conversion_Rate_Step[i] = Users[i] / Users[i-1]
Overall_Funnel_Conversion = Users[آخر] / Users[اول]
Drop-off[i] = Users[i-1] - Users[i]

Retention_Rate(cohort, period) = ActiveUsers(cohort, period) / CohortSize(cohort)
```

خروجی کوهورت باید به‌صورت Heatmap (ردیف = تاریخ کوهورت، ستون = شماره دوره، رنگ = درصد Retention) نمایش داده شود — این نمودار باید با D3 یا یک کتابخانه‌ی Heatmap ساخته شود چون Recharts پشتیبانی بومی ندارد.

### ۴.۶ قیمت‌گذاری و بسته‌بندی (Van Westendorp Price Sensitivity Meter)

از کاربران ۴ سوال پرسیده می‌شود:
1. از چه قیمتی این محصول «آنقدر ارزان» است که به کیفیتش شک می‌کنید؟ (Too Cheap)
2. از چه قیمتی این محصول «ارزان» است اما شک ندارید؟ (Cheap/Bargain)
3. از چه قیمتی این محصول «گران» شروع می‌شود اما همچنان می‌خرید؟ (Expensive)
4. از چه قیمتی این محصول «آنقدر گران» است که نمی‌خرید؟ (Too Expensive)

برای هر سوال، منحنی تجمعی (Cumulative Distribution) پاسخ‌ها رسم می‌شود؛ محل تلاقی منحنی‌ها محدوده‌ی قیمت بهینه (Optimal Price Point) و محدوده‌ی قابل‌قبول (Range of Acceptable Prices) را مشخص می‌کند. این ماژول نیاز به یک فرم نظرسنجی ساده + موتور رسم ۴ منحنی تجمعی دارد.

### ۴.۷ OKR Tracker

```
Progress% = (currentValue - startValue) / (targetValue - startValue) × 100
```
رنگ‌بندی خودکار: <30% قرمز، 30-70% زرد، >70% سبز (قابل تنظیم توسط کاربر).

---

## ۵. صفحات و مسیرها (Routes)

```
/                       → داشبورد مرکزی (خلاصه همه ماژول‌ها + کارت‌های KPI)
/projects/[id]          → صفحه یک پروژه خاص
/projects/[id]/backlog  → جدول بک‌لاگ + فیلتر بر اساس RICE/ICE/Kano + نمودار Value vs Effort
/projects/[id]/metrics  → مدیریت North Star / Leading / Lagging / Guardrail + نمودار روند زمانی
/projects/[id]/experiments → لیست تست‌ها + فرم محاسبه Sample Size + ثبت نتیجه و p-value
/projects/[id]/funnels  → ساخت فانل + نمودار Funnel Chart
/projects/[id]/cohorts  → آپلود/ورود داده کوهورت + Heatmap
/projects/[id]/pricing  → Van Westendorp Calculator + جدول تیرهای قیمتی
/projects/[id]/okrs     → مدیریت OKR فصلی
/projects/[id]/reports  → ساخت گزارش قابل Export (PDF/CSV) با انتخاب بازه زمانی و ماژول‌ها
```

---

## ۶. لایه گزارش‌دهی مرکزی (Reporting Dashboard)

داشبورد اصلی باید این کارت‌ها را نشان دهد (قابل شخصی‌سازی/Drag-to-reorder در فاز ۲):

- کارت North Star Metric با نمودار خطی روند ۳۰/۹۰/۳۶۵ روز اخیر
- کارت‌های Guardrail با هشدار رنگی در صورت افت غیرعادی
- جدول Top 5 بک‌لاگ بر اساس RICE
- خلاصه Unit Economics (CAC, LTV, Ratio, Payback) با روند سه‌ماهه
- وضعیت آزمایش‌های در حال اجرا (Running Experiments) با progress bar تا رسیدن به Sample Size لازم
- خلاصه پیشرفت OKR فصل جاری

دکمه «Export Report» باید یک PDF تولید کند شامل: عنوان پروژه، تاریخ، همه‌ی کارت‌های بالا با نمودار (به‌صورت تصویر رندرشده)، و یک بخش خلاصه اجرایی متنی (که می‌تواند دستی نوشته شود یا خالی برای پرکردن).

---

## ۷. الزامات غیرعملکردی (NFRs)

- **کارایی:** چون تک‌کاربره است، بار همزمانی پایین است؛ نیازی به بهینه‌سازی سنگین نیست، اما محاسبات آماری (A/B) باید سمت سرور (Server Action / API Route) انجام شوند تا منطق در کلاینت افشا/تکرار نشود.
- **صحت داده:** هر فرمول باید Unit Test داشته باشد (Jest) با حداقل ۳ سناریو (مقدار نرمال، مقدار مرزی، مقدار نامعتبر مثل تقسیم بر صفر).
- **نسخه‌بندی تاریخی:** هیچ داده‌ای Overwrite نشود؛ هر بار محاسبه یک Snapshot جدید با timestamp ذخیره شود تا بشود روند زمانی رسم کرد.
- **قابلیت توسعه:** طراحی دیتابیس (`Project` به‌عنوان ریشه) از روز اول اجازه می‌دهد چند پروژه/محصول همزمان مدیریت شوند.
- **امنیت حداقلی:** حتی برای تک‌کاربره، همه‌ی جدول‌ها باید Policy از نوع `auth.uid() = owner_id` در RLS داشته باشند و Route ها پشت Supabase Auth باشند — چون داده‌های مالی (CAC/LTV) حساس‌اند و اگر بعداً پروژه Public/Multi-user شود، این پایه از روز اول درست چیده شده.

---

## ۸. ریسک‌ها و نکات مهم (Edge Cases)

- **بزرگ‌ترین ریسک این پروژه، Scope Creep خودت است:** چون همه‌چیز جذاب به‌نظر می‌رسد، وسوسه‌ی اضافه‌کردن ماژول‌های بیشتر (مثلا Competitive Intelligence، Roadmap Gantt) در همان فاز اول بالاست. توصیه: MVP را دقیقاً به ۳ ماژول core محدود کن (پایین را ببین) وگرنه هیچ‌وقت لانچ نمی‌شود.
- **فرمول بدون Guardrail خطرناک است:** مثلا اگر Churn Rate صفر وارد شود، فرمول LTV به بی‌نهایت می‌رود (تقسیم بر صفر) — باید Validation در فرم و Formula Engine باشد.
- **Kano Model نیاز به داده چندنفره دارد:** اگر فقط خودت این فرم را پر کنی، نتیجه‌اش یک نظر شخصی است نه یک Kano واقعی؛ در UI این محدودیت را صریح توضیح بده.
- **A/B Test بدون Sample Size کافی گمراه‌کننده است:** حتما یک Guard در UI بگذار که تا نمونه کافی نرسیده، اجازه‌ی «اعلام برنده» ندهد.

---

## ۹. فازبندی پیشنهادی (MVP در برابر فاز بعد)

**فاز ۱ (MVP — حدود ۲ تا ۳ هفته کار):**
1. Backlog Prioritization (RICE + ICE + Value vs Effort chart)
2. Unit Economics Calculator (CAC, LTV, Payback, Churn, MRR/ARR) با ذخیره تاریخی
3. Metrics Hierarchy ساده (North Star + Leading + Lagging + Guardrail) با نمودار روند
4. داشبورد مرکزی که این سه را نشان دهد

**فاز ۲:**
5. A/B Test Sample Size Calculator + ثبت نتیجه
6. Funnel & Cohort Analytics (شامل Heatmap)

**فاز ۳:**
7. Van Westendorp Pricing Calculator
8. OKR Tracker
9. Export گزارش PDF کامل
10. Kano Model با فرم نظرسنجی چندکاربره

---

## ۱۰. جمع‌بندی و گام بعدی

این بریف کامل است اما عمداً طوری فازبندی شده که فاز ۱ در چند هفته قابل تحویل باشد — ساختن همه‌چیز هم‌زمان بزرگ‌ترین دلیل شکست پروژه‌های شخصی است. پیشنهاد عملی: این فایل را مستقیم به Claude Code بده و از فاز ۱ (سه ماژول اول) شروع کن؛ Schema بالا و فرمول‌های بخش ۴ را عینا به آن بده تا محاسبات را درست پیاده کند.

**معیار موفقیت فاز ۱:** بتوانی یک آیتم بک‌لاگ واقعی را RICE Score بزنی، CAC/LTV واقعی کسب‌وکارت را وارد کنی، و بعد از یک هفته دوباره برگردی و روند تغییرشان را در نمودار ببینی — اگر این سه کار روان انجام شد، فاز ۱ موفق بوده.