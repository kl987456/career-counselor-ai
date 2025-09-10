// src/app/layout.tsx
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata = {
  title: "AI Career Chat",
  description: "Chat with AI for career guidance",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
