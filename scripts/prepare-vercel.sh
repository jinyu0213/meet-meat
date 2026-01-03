#!/bin/bash
# Vercel 배포 전에 PostgreSQL로 스키마 변경하는 스크립트

echo "⚠️  Prisma 스키마를 PostgreSQL로 변경합니다..."

# schema.prisma 백업
cp prisma/schema.prisma prisma/schema.prisma.backup

# SQLite → PostgreSQL 변경
sed -i '' 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

echo "✅ 스키마가 PostgreSQL로 변경되었습니다."
echo "📝 변경사항을 커밋하고 푸시하세요:"
echo "   git add prisma/schema.prisma"
echo "   git commit -m 'Switch to PostgreSQL for Vercel'"
echo "   git push"

