#!/usr/bin/env bash
# add-api-ok-route.sh
set -euo pipefail

# Detect Next.js router
if [ -d "src/app" ]; then
  ROUTER="src/app"
elif [ -d "src/pages" ]; then
  ROUTER="src/pages"
elif [ -d "app" ]; then
  ROUTER="app"
elif [ -d "pages" ]; then
  ROUTER="pages"
else
  echo "❌ Neither app/, pages/, src/app/, nor src/pages/ exists here. Run this from your Next.js project root."
  exit 1
fi

mkdir -p "${ROUTER}/api/ok"

if [[ "$ROUTER" == *"app"* ]]; then
  cat > "${ROUTER}/api/ok/route.ts" <<'TS'
import { NextResponse } from "next/server";

export function GET() {
  const must = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET",
    "NEXT_PUBLIC_R2_PUBLIC_BASE",
  ];
  const missing = must.filter((k) => !process.env[k]);
  return NextResponse.json({
    env: process.env.VERCEL_ENV,       // "preview" | "production" | "development"
    ok: missing.length === 0,
    missing,
  });
}
TS
else
  cat > "${ROUTER}/api/ok.ts" <<'TS'
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const must = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET",
    "NEXT_PUBLIC_R2_PUBLIC_BASE",
  ];
  const missing = must.filter((k) => !process.env[k]);
  res.status(200).json({
    env: process.env.VERCEL_ENV,
    ok: missing.length === 0,
    missing,
  });
}
TS
fi

# Commit and deploy
git add "${ROUTER}/api/ok/route.ts" "${ROUTER}/api/ok.ts" 2>/dev/null || true
git commit -m "chore: add /api/ok env sanity route" || true

# If you're on Vercel-linked project, this will deploy preview; use --prod for production
vercel --confirm || true

echo "✅ Route added. Open: https://<your-deployment-domain>/api/ok"
