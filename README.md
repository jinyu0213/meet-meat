# Meeting-Date Reservation SNS (약속온)

Next.js 14 · TypeScript · Prisma · Tailwind CSS 로 제작한 1:1 약속 예약 SNS 프로토타입입니다. 친구와 서로의 캘린더를 공유하고, 댓글·DM·미팅 제안까지 한 곳에서 경험할 수 있습니다.

## ✨ 주요 기능

- **Landing / Auth**: 커스텀 ID+비밀번호 가입, 모의 휴대폰(6자리 코드) 인증, 로그인/로그아웃
- **피드**: 내/친구의 최근 캘린더 변경 및 약속 제안 히스토리
- **프로필 & 캘린더**: 월달력, 날짜별 상태(OPEN/CLOSED/BUSY/NONE), 메모, 댓글, 약속 제안
- **친구 관리**: 검색, 친구 요청/수락/거절, 친구 목록·보낸/받은 요청
- **메시지(DM)**: 1:1 대화, 일반 메시지, 제안 수락/거절 시스템 메시지
- **설정**: 표시 이름·소개·아바타 URL 수정, “친구만 약속 제안 허용” 토글

## 🧱 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **DB / ORM**: Prisma + SQLite
- **Auth**: 커스텀 세션 쿠키 + Prisma Session 모델
- **Mobile**: PWA (Progressive Web App) 지원

## ⚙️ 환경 변수

루트에 `.env` 파일을 생성하고 아래 내용을 채워주세요. (예시 파일을 직접 만들 수 없다면 수동으로 작성해주세요.)

```
DATABASE_URL="file:./dev.db"
```

## 🚀 실행 방법

```bash
# 1. 의존성 설치
npm install

# 2. 데이터베이스 마이그레이션/생성
npx prisma migrate dev --name init

# 3. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속 후, 회원가입 → 인증코드 `000000` 입력 → 서비스 이용이 가능합니다.

## 📱 모바일 앱으로 설치하기 (PWA)

이 프로젝트는 **PWA(Progressive Web App)**로 설정되어 있어 모바일에서 앱처럼 설치할 수 있습니다.

### 아이콘 생성 (최초 1회)

1. 브라우저에서 `http://localhost:3000/generate-icons.html` 접속
2. "192x192 다운로드" 및 "512x512 다운로드" 버튼 클릭
3. 다운로드된 파일을 `public/` 폴더에 `icon-192.png`, `icon-512.png`로 저장

### 모바일에서 설치

**iOS (Safari):**
1. Safari에서 사이트 접속
2. 하단 공유 버튼(□↑) 클릭
3. "홈 화면에 추가" 선택
4. 앱 아이콘 확인 후 "추가" 클릭

**Android (Chrome):**
1. Chrome에서 사이트 접속
2. 주소창 아래 "설치" 배너가 나타나면 클릭
3. 또는 메뉴(⋮) → "앱 설치" 선택

설치 후 홈 화면에서 일반 앱처럼 실행할 수 있습니다!

## 📁 주요 디렉터리

```
app/                # App Router 페이지
├── auth/           # 로그인/회원가입/휴대폰 인증 페이지
├── feed/           # 활동 피드
├── friends/        # 친구 관리/검색
├── messages/       # DM
├── profile/[id]/   # 사용자 프로필 & 캘린더
└── settings/       # 프로필 설정
components/         # UI 컴포넌트 (캘린더, 아바타, 폼 등)
lib/                # Prisma, 인증/세션, 서버 액션, 유틸/상수/검증 스키마
prisma/schema.prisma# 전체 데이터 모델 정의
```

## ✅ 시나리오 체크리스트

1. `/auth/signup` 에서 ID/비밀번호/휴대폰 입력 → `/auth/verify-phone` 으로 이동
2. 인증 페이지에서 `000000` 입력 → 자동 로그인 후 `/feed` 이동
3. `/profile/{username}` 에서 날짜 상태/메모 편집, 댓글 작성, 약속 제안
4. 친구 검색/요청 후 상대가 수락하면 약속 제안 버튼 활성화
5. `/messages` 에서 DM + 약속 제안 수락/거절 처리 → 캘린더 BUSY 반영

## 🧪 개발 메모

- Prisma Client 생성: `npx prisma generate`
- DB 초기화: `npx prisma migrate dev`
- 세션 만료: 14일, `meeting_session` 쿠키로 관리

필요한 추가 기능이나 개선점은 언제든지 Issue/PR 로 제안해주세요! 감사합니다. 😊
