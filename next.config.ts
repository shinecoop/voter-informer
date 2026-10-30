import type { NextConfig } from "next";

const config: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return [{
      source: "/:year/colorado/district:district([1-8])/candidates",
      destination: "/:year/colorado/us-house/district-:district/candidates",
      permanent: true,
    }];
  },
};
export default config;
