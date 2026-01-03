#!/bin/bash
# 로컬 개발을 위해 SQLite로 스키마 복원하는 스크립트

echo "⚠️  Prisma 스키마를 SQLite로 복원합니다..."

# schema.prisma를 SQLite로 변경
sed -i '' 's/provider = "postgresql"/provider = "sqlite"/' prisma/schema.prisma

echo "✅ 스키마가 SQLite로 복원되었습니다."
echo "📝 Prisma 클라이언트 재생성:"
echo "   npx prisma generate"

