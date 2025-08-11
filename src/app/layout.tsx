import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

// 追加：Google Fonts
import { Dela_Gothic_One, Noto_Sans_JP } from "next/font/google";

const dela = Dela_Gothic_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dela",
});

const noto = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "Sharpath",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      {/* 本文はNoto、フォント変数を全体に付与 */}
      <body className={`${noto.className} ${noto.variable} ${dela.variable}`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}