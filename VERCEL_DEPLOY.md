# Vercel 배포 가이드

## ⚠️ 중요: 데이터베이스 설정

Vercel은 **읽기 전용 파일 시스템**을 사용하므로 SQLite 파일 기반 DB를 사용할 수 없습니다.

### 해결 방법: PostgreSQL 사용 (권장)

1. **Vercel Postgres** 사용 (가장 쉬움)
   - Vercel 대시보드 → 프로젝트 → Storage → Create Database → Postgres 선택
   - 자동으로 `POSTGRES_PRISMA_URL` 환경 변수가 설정됩니다

2. **외부 PostgreSQL 서비스** 사용
   - [Supabase](https://supabase.com) (무료 티어 제공)
   - [Neon](https://neon.tech) (무료 티어 제공)
   - [Railway](https://railway.app) (무료 티어 제공)

### 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수를 설정하세요:

```
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
```

### Prisma 스키마 변경 (PostgreSQL 사용 시)

`prisma/schema.prisma` 파일을 다음과 같이 수정:

```prisma
datasource db {
  provider = "postgresql"  // sqlite → postgresql로 변경
  url      = env("DATABASE_URL")
}
```

### 마이그레이션 실행

로컬에서 마이그레이션을 생성하고 푸시:

```bash
# 1. 스키마 변경 후
npx prisma migrate dev --name init

# 2. 마이그레이션 파일 커밋
git add prisma/migrations
git commit -m "Add initial migration"
git push
```

Vercel 빌드 시 자동으로 `prisma migrate deploy`가 실행됩니다.

## 🔧 빌드 설정

`package.json`과 `vercel.json`에 빌드 명령이 이미 설정되어 있습니다:

```json
{
  "build": "prisma generate && prisma migrate deploy && next build"
}
```

## ✅ 배포 체크리스트

- [ ] PostgreSQL 데이터베이스 생성 및 연결
- [ ] `DATABASE_URL` 환경 변수 설정
- [ ] Prisma 스키마를 PostgreSQL로 변경
- [ ] 마이그레이션 파일 생성 및 커밋
- [ ] Vercel에 배포
- [ ] 로그인 기능 테스트

## 🐛 문제 해결

### "Application error" 발생 시

1. **Vercel 로그 확인**
   - Vercel 대시보드 → 프로젝트 → Deployments → 최신 배포 → Functions 탭
   - 에러 메시지 확인

2. **환경 변수 확인**
   - `DATABASE_URL`이 올바르게 설정되었는지 확인
   - Vercel 대시보드 → Settings → Environment Variables

3. **Prisma 클라이언트 생성 확인**
   - 빌드 로그에서 `prisma generate`가 실행되었는지 확인

4. **데이터베이스 연결 확인**
   - PostgreSQL 데이터베이스가 실행 중인지 확인
   - 연결 문자열이 올바른지 확인

