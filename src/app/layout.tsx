import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { BottomNav } from "@/components/nav/BottomNav";

export const metadata: Metadata = {
  title: "HYETAS",
  description: "Have you ever seen a man throw a shoe — household load, lifted.",
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Only render the bottom nav once a member has been picked.
  const c = await cookies();
  const hasMember = Boolean(c.get("hyetas_member_id")?.value);

  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-950 text-slate-100 antialiased">
        <div className={hasMember ? "pb-20" : ""}>{children}</div>
        {hasMember ? <BottomNav /> : null}
      </body>
    </html>
  );
}
