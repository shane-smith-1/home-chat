import { Inter } from "next/font/google";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Home Chat",
  description: "Upload quote, get it analzyed, ask questions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* <Toaster position="bottom-center" /> */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}
