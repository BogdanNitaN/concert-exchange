import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/KPI', destination: '/kpi', permanent: true },
      { source: '/KPI/admin', destination: '/kpi/admin', permanent: true },
      { source: "/transport", destination: "/calcul", permanent: true },
      { source: "/calculator", destination: "/calcul", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // previne incarcarea site-ului intr-un iframe (clickjacking)
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // previne MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // controleaza ce informatii de referrer se trimit
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // forteaza HTTPS pe viitor
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // restrictioneaza accesul la camera, microfon, locatie
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
