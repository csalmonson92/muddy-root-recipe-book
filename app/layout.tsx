import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import ServiceWorkerRegister from "./sw-register";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#f6efd9",
  viewportFit: "cover",
};

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;
  return {
    title: "The Muddy Root Recipe Book",
    description: "Create, save, and browse favorite Muddy Root recipes.",
    manifest: "/manifest.webmanifest",
    appleWebApp: { capable: true, title: "Muddy Root", statusBarStyle: "default" },
    icons: { icon: "/muddy-root-logo.png", apple: "/muddy-root-logo.png" },
    openGraph: { title: "The Muddy Root Recipe Book", description: "Create, save, and browse favorite Muddy Root recipes.", images: [image] },
    twitter: { card: "summary_large_image", title: "The Muddy Root Recipe Book", description: "Create, save, and browse favorite Muddy Root recipes.", images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}<ServiceWorkerRegister /></body></html>;
}
