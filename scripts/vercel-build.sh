#!/bin/bash
# Vercel 빌드 스크립트 - 에러 핸들링 포함

set -e  # 에러 발생 시 중단

echo "🔍 DATABASE_URL 확인 중..."
node scripts/check-db-type.js

echo "🗄️  데이터베이스 스키마 푸시 중 (Prisma Client 자동 생성 포함)..."
# prisma db push는 자동으로 generate도 실행함
npx prisma db push --accept-data-loss

echo "🏗️  Next.js 빌드 중..."
next build

