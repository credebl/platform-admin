import Script from "next/script";
import "./globals.css";
import type { Metadata } from "next";
import StoreProvider from "./StoreProvider";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import SessionCheck from "@/components/SessionCheck";
import PageLayout from "@/components/PageLayout";

export const metadata: Metadata = {
  title: "Platform-Admin",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="overflow-y-scroll">
        <StoreProvider>
          <SessionProviderWrapper>
            <SessionCheck>
              <PageLayout>{children}</PageLayout>
            </SessionCheck>
          </SessionProviderWrapper>
        </StoreProvider>
        <Script src={process.env.NEXT_PUBLIC_RAZORPAY_UI_SCRIPT} />
      </body>
    </html>
  );
}
