import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "полянка — место, где можно быть собой",
  description:
    "Твой тихий уголок: мысли, маленькие дела, любимые блюда и личная полка.",
  icons: { icon: "/icon.svg", apple: "/icon.png" },
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
