import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "The Muddy Root Recipe Book",
    description: "Create, save, and browse favorite Muddy Root recipes.",
    icons: { icon: "/muddy-root-logo.png" },
    openGraph: { title: "The Muddy Root Recipe Book", description: "Create, save, and browse favorite Muddy Root recipes.", images: [image] },
    twitter: { card: "summary_large_image", title: "The Muddy Root Recipe Book", description: "Create, save, and browse favorite Muddy Root recipes.", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
