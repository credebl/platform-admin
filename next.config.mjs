import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();
/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["dev-org-logo.s3.ap-south-1.amazonaws.com", "sovio-logo-bucket.s3.ap-south-1.amazonaws.com","prod-org-logo.s3.ap-south-1.amazonaws.com"],
  },
};

export default withNextIntl(nextConfig);
