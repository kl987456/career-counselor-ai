// src/app/layout.tsx
import "./globals.css";
import { Providers } from "@/components/Providers";
import { ReactNode } from "react";

export const metadata = {
  title: "AI Career Counselor Chat",
  description: "Chat with AI for career guidance",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="bg-gray-100 text-black dark:bg-gray-900 dark:text-white transition-colors duration-500">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
