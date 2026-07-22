import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // proxy.ts (Next 16's renamed middleware) doesn't reliably inline
  // NEXT_PUBLIC_* vars the way regular Client/Server Components do —
  // explicitly listing them here forces Next to make them available there too.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
};

export default nextConfig;
