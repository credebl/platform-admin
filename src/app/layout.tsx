import Script from "next/script";
import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sovio-verifier",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <>
    <html lang="en">
      <body className="overflow-y-scroll">{children}</body>
    </html>
    <Script src={process.env.NEXT_PUBLIC_RAZORPAY_UI_SCRIPT}/>
    </>
  );
}
