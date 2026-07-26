<div align="center">

# jyje/pilot-module-federation

로그인과 전역 내비게이션을 유지한 채, 팀 소유 마이크로 프론트엔드를 HTTP Module Federation으로 독립 배포하는 AI 플랫폼 셸입니다.

[English](README.md) / [한국어](README-ko.md)

</div>

## 상태

`v0.0.1` 파일럿입니다. Vue와 Next 모두 Host 소유 Deployments, 독립 Observability·Governance HTTP Remote 토폴로지를 구현합니다.

## 목표 아키텍처

```text
AI Platform Shell (Vue Host)
├── 로그인 세션, 테넌트, 권한 컨텍스트
├── 고정 Header와 mission-rail Sidebar
├── URL 라우팅, Remote 로딩, 오류 폴백과 재시도
└── Federation route outlet
    ├── Deployments     — MLOps 팀
    ├── Observability   — SRE 팀
    └── Governance      — Security 팀

Fastify API
└── 동일 origin의 /api 세션 및 도메인 API
```

Shell은 모든 화면에 공통인 사용자 경험을 소유합니다. 각 Remote는 자기 도메인 UI와 로컬 상태를 소유하며 독립적으로 빌드·배포합니다. Remote는 Host의 소스, 라우터, store를 import하지 않습니다.

## 디자인 시스템

프로젝트 루트의 [DESIGN.md](DESIGN.md)는 디자인 레퍼런스입니다. 실제 크로스 프레임워크 계약은 [`packages/design-tokens/src/platform.css`](packages/design-tokens/src/platform.css)에 있습니다. 두 Host와 네 개 Remote는 이 파일에서 시맨틱 색상, Manrope/JetBrains Mono 역할, 간격, 반응형 지표 레이아웃, 포커스 링, 모션 감소 동작, Shell 레이아웃, 도메인 표면 표현을 함께 가져옵니다. 프레임워크별 primitive 구현은 독립적으로 유지하되, 액션은 모두 높이 36px·가로 여백 12px·반경 6px과 같은 Flight Deck 주색을 사용하며 팀마다 별도 테마 색으로 바꾸지 않습니다.

## 로그인과 세션

프런트엔드만으로는 공유 세션과 서버 측 인가를 검증할 수 없으므로, 이 파일럿에는 TypeScript Fastify 백엔드를 둡니다.

- 로컬 사용자는 표시 이름, 이메일, 비어 있지 않은 임의의 비밀번호를 입력합니다.
- Fastify는 결정적인 데모 세션을 만들고 서명된 `HttpOnly`, `SameSite=Lax` 쿠키를 반환합니다.
- Host는 `GET /api/auth/session`을 읽어 사용자·테넌트·권한만 담긴 `PlatformContext`를 Remote에 전달합니다.
- Remote는 동일 origin의 `/api/*`를 호출해 같은 쿠키 세션을 사용합니다. 비밀번호, bearer token, refresh token, session token은 받지 않습니다.
- 도메인 API는 매 요청마다 테넌트와 권한을 검사합니다. Sidebar 노출 여부는 UX일 뿐, 보안 인가가 아닙니다.

개발 시에는 각 Vite 서버가 `/api`를 Fastify로 프록시합니다. 배포 시에는 Shell과 API를 하나의 origin으로 제공해 cross-origin cookie 문제를 피합니다.

## 저장소 구성

```text
apps/api/                 Fastify 세션 및 도메인 API
vue/host/                 Vue Platform Shell
vue/observability/        SRE Federation Remote
vue/governance/           Security Federation Remote
next/host/                shadcn/ui 기반 Next.js Host
next/remote/              Next.js Observability HTTP Remote
next/governance/          Next.js Governance HTTP Remote
packages/contracts/       프레임워크 중립 플랫폼 계약
packages/fixtures/        결정적인 도메인 fixture
packages/design-tokens/   공유 시맨틱 CSS 변수
```

Deployments는 각 Host에 통합합니다. Observability와 Governance는 두 트랙 모두에서 독립 Remote 배포 단위로 유지합니다.

## 설계와 실행 계획

경계 모델, 로그인 흐름, API 표면, Remote 수명주기, 구현 순서는 영어 [설계 문서](PLAN.md)에 있습니다. 실행 체크리스트는 [TASK.md](TASK.md)입니다.

브라우저 스크린샷, 콘솔 근거, cookie-session API 결과는 영어 [검증 README](docs/validation/README.md)에 기록합니다.

## 개발

```bash
pnpm install
pnpm dev
```

`pnpm dev`는 Fastify, Vue Host, Vue Remote 2개를 실행합니다. Vue 대신 Next Host와 Remote 2개를 실행하려면 아래 명령을 사용합니다.

```bash
pnpm dev:next
```

두 트랙을 함께 실행하려면 `pnpm dev:all`을 사용합니다.

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## 런타임 경계

모든 Remote는 런타임 HTTP 에셋입니다. Vue Host/Remote는 `3000/3001/3002`, Next Host/Remote는 `4000/4001/4002`를 사용합니다. Host는 iframe을 쓰거나 Remote 소스를 디스크에서 import하지 않습니다.
