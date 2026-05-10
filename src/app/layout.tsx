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
  const c = await cookies();
  const hasMember = Boolean(c.get("hyetas_member_id")?.value);

  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body className="min-h-dvh font-body text-slate-100 antialiased hyetas-bg">
        <div className={hasMember ? "pb-20" : ""}>{children}</div>
        {hasMember ? <BottomNav /> : null}
      </body>
    </html>
  );
}
