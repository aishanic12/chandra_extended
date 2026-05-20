import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Providers from "@/app/providers";

export const metadata: Metadata = {
  title: "Chandra | L3 Digital Cloud Engineer",
  description:
    "A cinematic operational intelligence demo for Chandra, an L3 human-supervised AI Digital Worker."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
