/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  // Off because every data hook fetches directly in a useEffect with no
  // request-dedup layer (no SWR/React Query) — Strict Mode's deliberate
  // double-invoke of mount effects was doubling every fetch-on-mount call
  // in dev (e.g. opening a dialog with an options dropdown). Production
  // builds never double-invoke regardless of this flag; this only affects
  // `next dev`.
  reactStrictMode: false,
};

export default nextConfig;
