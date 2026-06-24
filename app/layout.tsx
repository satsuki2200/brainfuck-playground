import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const mono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Brainfuck Playground",
  description: "Brainfuck言語の学習・練習用インタプリタ。ステップ実行、テープ可視化、サンプルプログラム付き。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${mono.variable} dark`}>
      <body className="font-mono antialiased">{children}</body>
    </html>
  );
}
