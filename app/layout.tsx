import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./calendar.css";
export const metadata: Metadata = {
  title: "полянка — место, где можно быть собой",
  description:
    "Твой тихий уголок: мысли, маленькие дела, любимые блюда и личная полка.",
  icons: {
    icon: [
      { url: "/icon-192.png?v=2", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=2", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png?v=2",
  },
  manifest: "/site.webmanifest",
};
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#eeede2",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
