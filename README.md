# 🛠️ PM Toolkit — جعبه ابزار مدیر محصول

یک اپلیکیشن تحت وب مدرن و همه‌کاره برای **مدیران محصول** که ابزارهای ضروری روزمره را در یک داشبورد واحد گرد هم می‌آورد. ساخته شده با **Next.js 14 (App Router)**، **Supabase** و **TypeScript**.

---

## ✨ قابلیت‌ها

| ابزار | توضیح |
|---|---|
| **📊 داشبورد مرکزی** | نمای کلی پروژه، KPIهای کلیدی، خلاصه بک‌لاگ و اقتصاد واحد |
| **📋 اولویت‌بندی بک‌لاگ** | امتیازدهی RICE و ICE، نمودار پراکندگی، فیلتر Kano |
| **🧪 آزمایشات A/B** | ماشین حساب حجم نمونه، آزمون Z برای معناداری آماری |
| **📈 تحلیل قیف و Cohort** | طراحی قیف با نمودار میله‌ای، ماتریس Cohort با درصد retention |
| **💰 اقتصاد واحد** | محاسبه CAC، LTV، نسبت LTV/CAC، دوره بازگشت سرمایه، ARR |
| **🎯 OKRها** | مدیریت اهداف و نتایج کلیدی با نوار پیشرفت رنگی |
| **📐 قیمت‌گذاری** | منحنی Van Westendorp، تحلیل Kano با ابعاد Better/Worse |
| **📏 سلسله‌مراتب متریک‌ها** | ثبت و پایش North Star، Leading، Lagging و Guardrailها |
| **📄 مرکز گزارشات** | خروجی CSV، پرینت و PDF با layout حرفه‌ای |
| **🔐 احراز هویت** | ورود / ثبت‌نام ایمیل-رمز با Supabase Auth + محافظت از مسیرها |

---

## 🧱 معماری داده (فایربیس / Supabase)

- **8 جدول** شامل `Project`، `BacklogItem`، `MetricSnapshot`، `Experiment`، `Funnel`، `CohortEntry`، `PricingSettings`، `OKR`
- **RLS Policies** برای ایزوله‌سازی کامل داده بین کاربران
- **Fallback به localStorage** — در صورت عدم دسترسی به Supabase، اپلیکیشن به صورت آفلاین کار می‌کند
- **ایزوله‌سازی بین کاربران** در localStorage: کلیدهای ذخیره‌سازی با `userId` namespace مجزا می‌شوند

---

## ⚙️ تکنولوژی‌ها

| لایه | فناوری |
|---|---|
| **فریم‌ورک** | Next.js 14 (App Router) |
| **زبان** | TypeScript |
| **دیتابیس و auth** | Supabase (Postgres + RLS) |
| **ذخیره‌ساز جایگزین** | localStorage |
| **رندر** | Client-side rendering (CSR) |
| **فونت‌ها** | Vazirmatn (بدنه)، Space Grotesk (عناوین)، IBM Plex Mono (اعداد) |
| **آیکون‌ها** | Lucide React |
| **استایل** | Tailwind CSS v4 |
| **جهت** | راست‌به‌چپ (RTL) |

---

## 🚀 شروع کار

### ۱. پیش‌نیازها

- Node.js ≥ 18
- npm / yarn / pnpm

### ۲. نصب

```bash
git clone https://github.com/Behrad-Mahdavi/PmToolKit.git
cd PmToolKit
npm install
```

### ۳. تنظیم متغیرهای محیطی

یک فایل `.env` در ریشه پروژه با محتوای زیر بسازید:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### ۴. ایجاد جداول در Supabase

محتوای فایل `supabase_schema.sql` را در **SQL Editor** سوپابیس اجرا کنید تا ۸ جدول و RLS policies ایجاد شوند.

### ۵. اجرا

```bash
npm run dev
```

مرورگر را در [http://localhost:3000](http://localhost:3000) باز کنید.

---

## 🌐 مستندات API و فرمول‌ها

| فرمول | توضیح |
|---|---|
| **RICE** | Reach × Impact × Confidence / Effort |
| **ICE** | Impact × Confidence × Ease |
| **CAC** | Total Marketing Cost / New Customers |
| **LTV** | ARPU × Gross Margin % / Churn Rate |
| **LTV/CAC** | نسبت LTV به CAC (سالم: > 3x) |
| **Payback** | CAC / (ARPU × Gross Margin %) |
| **ARR** | MRR × 12 |
| **Van Westendorp** | ۴ منحنی تابع قیمت برای تعیین محدوده قیمت بهینه |
| **Kano Better/Worse** | Better = (Attractive + Performance) / Total, Worse = (Performance + Must‑Be) / Total |

---

## 📁 ساختار پروژه

```
src/
├── app/
│   ├── auth/                 # صفحه ورود / ثبت‌نام
│   ├── projects/[id]/
│   │   ├── backlog/          # اولویت‌بندی بک‌لاگ
│   │   ├── analytics/        # قیف و Cohort
│   │   ├── experiments/      # آزمایشات A/B
│   │   ├── metrics/          # متریک‌ها و KPI
│   │   ├── okrs/             # OKRها
│   │   ├── pricing/          # قیمت‌گذاری
│   │   ├── reports/          # گزارشات
│   │   └── unit-economics/   # اقتصاد واحد
│   ├── layout.tsx            # لایه اصلی با AuthProvider
│   └── page.tsx              # داشبورد مرکزی
├── components/
│   ├── AuthProvider.tsx      # محافظ احراز هویت
│   ├── Sidebar.tsx           # نوار کناری
│   └── ConfidenceStrip.tsx   # نوار اطمینان متریک
├── lib/
│   ├── pmStore.ts            # تمام توابع ذخیره‌سازی (Supabase + localStorage)
│   ├── supabase.ts           # کلاینت Supabase
│   └── formulas.ts           # همه فرمول‌های محاسباتی
└── supabase_schema.sql       # اسکیمای دیتابیس
```

---

## 🤝 مشارکت

درخواست‌های Pull و Issue با استقبال پذیرفته می‌شوند.

---

## 📄 مجوز

MIT
