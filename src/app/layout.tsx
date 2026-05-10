import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/nav/BottomNav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HYETAS",
  description:
    "Have you ever seen a man throw a shoe — household load, lifted.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0b1220",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Read cookie just to keep the original "show nav once a member is picked"
  // signal available if we need it later — but the nav now renders always so
  // the user can never feel "stuck" the way Lisa described after hitting
  // Switch user.
  await cookies();

  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body className="min-h-dvh font-body text-slate-100 antialiased hyetas-bg">
        <div className="pb-24">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
