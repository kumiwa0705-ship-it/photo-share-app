import type { Metadata } from "next";
import { Shippori_Mincho, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import ConfigureAmplify from "./amplify-config";


const shipporiMincho = Shippori_Mincho({
  variable: "--font-heading",
  weight: ["400", "700"],
  subsets: ["latin"],
});

const zenMaruGothic = Zen_Maru_Gothic({
  variable: "--font-body",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Photo Share",
  description: "写真アルバムアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${shipporiMincho.variable} ${zenMaruGothic.variable}`}>
        <ConfigureAmplify />
        {children}
      </body>
    </html>
  );
}