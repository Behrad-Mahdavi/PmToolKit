import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const iranSansX = localFont({
  src: [
    { path: "./public/fonts/IRANSansXFaNum-Thin.ttf", weight: "100" },
    { path: "./public/fonts/IRANSansXFaNum-UltraLight.ttf", weight: "200" },
    { path: "./public/fonts/IRANSansXFaNum-Light.ttf", weight: "300" },
    { path: "./public/fonts/IRANSansXFaNum-Regular.ttf", weight: "400" },
    { path: "./public/fonts/IRANSansXFaNum-Medium.ttf", weight: "500" },
    { path: "./public/fonts/IRANSansXFaNum-DemiBold.ttf", weight: "600" },
    { path: "./public/fonts/IRANSansXFaNum-Bold.ttf", weight: "700" },
    { path: "./public/fonts/IRANSansXFaNum-ExtraBold.ttf", weight: "800" },
    { path: "./public/fonts/IRANSansXFaNum-Black.ttf", weight: "900" },
    { path: "./public/fonts/IRANSansXFaNum-Heavy.ttf", weight: "950" },
    { path: "./public/fonts/IRANSansXFaNum-ExtraBlack.ttf", weight: "1000" },
  ],
  variable: "--font-iransansx",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PM Toolkit — ابزار جامع مدیریت محصول",
  description: "ابزار مهندسی و تحلیل تصمیمات محصول برای Product Manager ها",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`h-full ${iranSansX.variable}`}>
      <body className="min-h-full flex flex-col antialiased font-sans">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
