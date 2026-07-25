# 크로스 프레임워크 UI-in-UI Module Federation 파일럿 구현 계획

**Language:** [English](2026-07-20_114438-pilot-module-federation.md) · [한국어](2026-07-20_114438-pilot-module-federation-ko.md)

> **Hermes를 위한 안내:** 오너가 `TASK.md`를 승인한 뒤, subagent-driven-development 스킬을 사용해 이 계획을 작업 단위로 구현할 것.

**목표:** Vue 3와 최신 Next.js에서 동일한 UI-in-UI 시나리오를 비교하는 로컬 우선 파일럿을 하나 만든다. 각 프레임워크마다 Host, Remote, 비합성 Standalone 애플리케이션을 두고, Module Federation을 iframe·Web Components·오케스트레이션 대안과 비교해 문서화한다.

**아키텍처:** pnpm 워크스페이스 하나에 여섯 개 애플리케이션을 둔다 — Vue와 Next 각각의 Host, Remote, Standalone. 각 Remote는 직접 미리보기 가능하며 자신의 Host에 임베드될 수 있다. 각 Standalone은 Remote 소스를 import하지 않고 Console과 Monitor를 하나의 앱에 구현한 별도의 비합성 baseline이다. Vue는 Vite Module Federation을 기본 구현으로 사용한다. 최신 Next.js Module Federation은 고위험 호환성 스파이크로 시작하는데, 공식 Next federation 플러그인이 현재 Next 16이나 App Router 지원을 선언하지 않기 때문이다. Next는 항상 iframe과 비합성 Standalone 비교를 포함하며, 스파이크로 증명된 경우에만 Federation을 주장한다.

**기술 스택:** pnpm workspaces, TypeScript, Vue 3, Vite, `@module-federation/vite`, 최신 Next.js, React, Next용 Vercel shadcn/ui, Vue용 shadcn-vue, Vitest, Vue Test Utils, React Testing Library, Playwright Test, Microsoft Playwright MCP.

**버전 상태:** `v0.0.1` Draft. 버전 준비 상태가 푸시를 자동으로 승인하지 않는다. 오너가 별도로 원격 푸시가 지금 가능하다고 말하고 정확한 명령을 승인하기 전까지 푸시는 막혀 있다.

---

## 1. 확정된 제품 시나리오

### 연합(Federated) 사용

**AI Platform Console** Host가 선택된 cluster/model 워크스페이스 안에 **Model Deployment Monitor** Remote를 렌더링한다.

```text
AI Platform Console (Host)
├── 전역 내비게이션
├── cluster와 model 컨텍스트
├── 프레임워크/합성 방식 선택기
└── Model Deployment Monitor (Remote)
    ├── 배포 상태(health)
    ├── replica와 지연 시간 요약
    ├── 이벤트 타임라인
    └── deployment-selected / alert-acknowledged 이벤트
```

### 단독(Standalone) 사용

동일한 Remote가 전용 운영 대시보드로도 실행된다. 운영자는 월보드에서 모니터를 직접 열거나, 배포 URL을 북마크하거나, 전체 플랫폼 콘솔을 사용할 수 없을 때 이를 사용할 수 있다.

### 이 예시가 파일럿에 적합한 이유

- 임베드된 Remote는 더 큰 제품 맥락 안에서도 유용하다.
- 단독 실행되는 Remote는 그 자체로 완결되고 이해 가능한 UI로 남는다.
- Host→Remote 컨텍스트와 Remote→Host 이벤트의 의미가 명확하다.
- 동일한 fixture 데이터와 사용자 흐름을 Vue와 Next 양쪽에서 재현할 수 있어 공정하게 비교할 수 있다.
- 로딩, CORS, 라우팅, 스타일 격리, 장애와 복구가 리뷰어에게 눈으로 보인다.

---

## 2. 근거 기반 프레임워크 제약

2026-07-20 기준 조사 스냅샷:

| 패키지 | 관측된 버전 | 관련 제약 |
| --- | --- | --- |
| `vue` | `3.5.40` | Vue/Vite 트랙에서 지원 |
| `next` | `16.2.11` | 관측된 최신 Next.js |
| `@module-federation/vite` | `1.19.1` | peer 범위가 Vite 5–8 포함 |
| `@module-federation/nextjs-mf` | `8.8.71` | peer 범위가 Next 12–15만 선언 |
| `shadcn` | `4.14.1` | 공식 React/Next CLI와 컴포넌트 |
| `shadcn-vue` | `2.8.0` | 유사한 디자인/컴포넌트 모델을 가진 Vue 포트 |

### Next.js 위험 진술

Module Federation의 Next.js 통합 문서는 현재 다음과 같이 밝히고 있다:

- App Router는 지원하지 않는다.
- Pages Router는 지원한다.
- 지원 대상 Next 버전은 12–15다.
- Next.js 지원은 종료 중/유지보수 모드다.
- 로컬 webpack 내부 구조가 필요하다.

따라서 이 계획은 최신 Next.js 16의 Module Federation이 동작한다고 **약속하지 않는다**. 먼저 최소 스파이크를 수행하고 다음 세 가지 결과 중 하나를 보고한다:

- `VALIDATED`: Next 16, Pages Router, Webpack, `nextjs-mf`가 필요한 클라이언트 사이드 Remote 컴포넌트에서 동작한다.
- `PARTIAL`: Remote가 로드되지만 제약이 너무 좁거나 불안정해 주 비교에 쓰기 어렵다.
- `INVALIDATED`: 최신 Next는 이 플러그인을 신뢰성 있게 쓸 수 없다. Next 트랙은 최신 Next standalone + iframe으로 남고 README에 근거를 기록한다.

Next 15로의 조용한 다운그레이드는 허용하지 않는다. Next 15 호환 변형은 이후 별도 비교로 제안될 수 있다.

### shadcn 명칭 정확성

- Next 애플리케이션은 Vercel의 공식 `shadcn/ui` 도구와 React 컴포넌트를 사용한다.
- Vue 애플리케이션은 `shadcn-vue`를 사용한다. Vercel의 React 컴포넌트는 Vue에서 네이티브로 실행될 수 없기 때문에 만들어진 Vue 포트다.
- 두 트랙은 시각적 토큰과 동일한 컴포넌트 역할을 공유하지만, README는 shadcn-vue를 Vercel의 공식 Vue 패키지라고 불러서는 안 된다.

---

## 3. 구현하고 비교할 합성 방식

| 방식 | Vue 트랙 | 최신 Next 트랙 | 목적 |
| --- | --- | --- | --- |
| Module Federation | 필수 기본 구현 | 호환성 스파이크; 검증된 경우에만 구현 | 런타임 컴포넌트 합성과 독립 아티팩트 |
| iframe | 필수 비교 경로 | 필수 비교 경로 | 강한 문서 격리와 최신 Next의 폴백 |
| Remote 직접 미리보기 | 필수 | 필수 | Remote가 독립적으로 검사 가능하고 유용함을 증명 |
| 비합성 Standalone baseline | 필수 | 필수 | 런타임 합성 경계가 없는 앱 하나와 비교 |
| Web Components | `v0.0.1`에서는 문서화만 | 문서화만 | 프레임워크 중립 대안 |
| single-spa | 문서화만 | 문서화만 | 라우트/parcel 오케스트레이션 대안 |

README는 프레임워크/툴링 지원이 건강하고 UI가 네이티브 DOM 합성을 필요로 할 때 Module Federation을 권장한다. 강한 격리나 지원되지 않는 프레임워크 버전이 더 긴밀한 통합보다 중요할 때는 iframe을 권장한다.

---

## 4. pnpm 모노레포 결정

pnpm 워크스페이스는 다음을 제공한다:

- 여섯 개 애플리케이션과 공유 패키지를 위한 저장소와 lockfile 하나.
- contracts, fixtures, design tokens를 위한 워크스페이스 링크.
- 앱 하나 또는 프레임워크 하나를 위한 필터링된 명령.
- 모든 개발 서버를 위한 재귀/병렬 명령.
- 앱들이 런타임 상태를 공유한다고 가장하지 않으면서도 lint, typecheck, test, build를 중앙에서 오케스트레이션.

이것이 자동으로 "모든 서버가 함께 실행됨"을 의미하지는 않지만, 루트 스크립트가 명시적으로 그렇게 할 수 있다.

계획된 루트 명령:

```json
{
  "scripts": {
    "dev": "pnpm -r --parallel --stream --filter './vue/**' --filter './next/**' dev",
    "dev:composed": "pnpm -r --parallel --stream --filter './vue/host' --filter './vue/remote' --filter './next/host' --filter './next/remote' dev",
    "dev:standalone": "pnpm -r --parallel --stream --filter './vue/standalone' --filter './next/standalone' dev",
    "dev:vue": "pnpm -r --parallel --stream --filter './vue/**' dev",
    "dev:next": "pnpm -r --parallel --stream --filter './next/**' dev",
    "build": "pnpm -r --filter './packages/**' --filter './vue/**' --filter './next/**' build",
    "test": "pnpm -r --filter './packages/**' --filter './vue/**' --filter './next/**' test"
  }
}
```

정확한 pnpm 선택자 문법은 패키지 매니페스트가 존재한 뒤 검증해야 한다. 수용 기준은 관측 가능하다: `pnpm dev`가 네 개의 이름 붙은 서버를 스트리밍되는 접두사 로그와 함께 시작하고, 중단되면 깔끔히 종료된다.

---

## 5. 수정된 저장소 구조

```text
pilot-module-federation/
├── vue/
│   ├── host/                     # Remote를 합성하는 AI Platform Console
│   ├── remote/                   # Model Deployment Monitor MFE + 직접 미리보기
│   └── standalone/               # 비합성 Console + Monitor baseline
├── next/
│   ├── host/                     # Remote를 합성하는 AI Platform Console
│   ├── remote/                   # Model Deployment Monitor + 직접 미리보기
│   └── standalone/               # 비합성 Console + Monitor baseline
├── packages/
│   ├── contracts/                # 프레임워크 중립 TypeScript 계약
│   ├── fixtures/                 # 공유 결정론적 model/deployment 데이터
│   └── design-tokens/            # 공유 CSS 변수와 시맨틱 토큰
├── spikes/
│   └── next-latest-federation/
│       └── README.md             # VALIDATED / PARTIAL / INVALIDATED 근거
├── e2e/
│   ├── vue-federation.spec.ts
│   ├── vue-iframe.spec.ts
│   ├── next-federation.spec.ts   # 스파이크가 검증한 경우에만 존재
│   ├── next-iframe.spec.ts
│   └── standalone-remotes.spec.ts
├── docs/
│   ├── architecture.md
│   ├── comparison.md
│   ├── decisions/
│   │   └── 0001-composition-methods.md
│   └── validation/
│       ├── playwright-mcp-v0.1.0.md
│       └── readme-screenshots.md
├── artifacts/
│   └── screenshots/
│       └── readme/
├── .claude/skills/
├── .mcp.json                     # 프로젝트 범위 Playwright MCP 설정으로 추가됨
├── CLAUDE.md
├── README.md
├── TASK.md
├── 2026-07-20_114438-pilot-module-federation.md
├── package.json
├── pnpm-workspace.yaml
├── playwright.config.ts
└── pnpm-lock.yaml
```

### 포트

| 앱 | 포트 | Standalone URL |
| --- | ---: | --- |
| Vue Host | 4173 | `http://127.0.0.1:4173` |
| Vue Remote | 4174 | `http://127.0.0.1:4174` |
| Vue Standalone | 4175 | `http://127.0.0.1:4175` |
| Next Host | 3000 | `http://127.0.0.1:3000` |
| Next Remote | 3001 | `http://127.0.0.1:3001` |
| Next Standalone | 3002 | `http://127.0.0.1:3002` |

---

## 6. 공유 시나리오 계약

`packages/contracts`는 컴포넌트나 스토어가 아니라 프레임워크 중립 데이터를 정의한다.

```ts
export type FrameworkTrack = 'vue' | 'next'
export type CompositionMode = 'federation' | 'iframe' | 'standalone'
export type Environment = 'production' | 'staging'

export interface DeploymentContext {
  clusterId: string
  modelId: string
  environment: Environment
}

export interface ModelDeployment {
  id: string
  modelName: string
  status: 'healthy' | 'degraded' | 'deploying' | 'paused'
  replicas: { ready: number; desired: number }
  p95LatencyMs: number
}

export type MonitorEvent =
  | { type: 'deployment-selected'; deploymentId: string }
  | { type: 'alert-acknowledged'; deploymentId: string }
  | { type: 'environment-changed'; environment: Environment }
```

소유권 규칙:

- Host가 프레임워크 트랙, 합성 방식, cluster, model, environment를 선택한다.
- Remote가 모니터 탭, 필터, 타임라인 표시, 로컬 프레젠테이션 상태를 소유한다.
- Federation은 타입이 지정된 props/이벤트를 사용한다.
- iframe은 정확한 origin 검사를 거쳐 `postMessage` 위에서 동일한 시맨틱 계약을 사용한다.
- Remote 직접 미리보기는 자신의 URL에서 동등한 컨텍스트를 읽는다.
- 비합성 Standalone은 Remote 소스를 import하지 않고 하나의 애플리케이션 안에서 동일한 컨텍스트와 Monitor 기능을 소유한다.
- 어떤 공유 런타임 스토어도 애플리케이션 경계를 넘지 않는다.

---

## 7. 디자인 시스템 패리티

UI 구현 전에 로컬 `frontend-design` 스킬을 사용할 것.

### 필요한 컴포넌트 역할

두 트랙 모두 프레임워크 네이티브 shadcn 변형으로 동등한 역할을 구현한다:

- Button
- Badge
- Card
- Tabs
- Table 또는 item list
- Alert
- Skeleton
- Tooltip
- Select

### 공유 토큰

`packages/design-tokens`가 시맨틱 CSS 변수를 게시한다. 예:

```css
:root {
  --platform-background: 220 24% 8%;
  --platform-surface: 220 19% 12%;
  --platform-border: 218 16% 24%;
  --platform-foreground: 210 20% 96%;
  --platform-muted: 215 14% 66%;
  --platform-accent: 188 84% 48%;
  --platform-warning: 38 92% 55%;
}
```

최종 팔레트, 타이포그래피, 시그니처 요소는 오너 리뷰가 필요하다. "동일한 디자인"이란 시맨틱 패리티와 알아볼 수 있는 컴포넌트 역할을 뜻하며, 바이트 단위로 동일한 프레임워크 출력을 뜻하지 않는다.

---

## 8. 구현 순서

### 단계 A — 오너 리뷰와 문서 수정

1. 이 수정된 계획과 `TASK.md`를 승인한다.
2. README/CLAUDE의 이름, 버전, 6-앱 범위, 링크를 갱신한다.
3. 초기 로컬 `v0.0.1` 커밋을 승인한다.

### 단계 B — 최고위험 Next 호환성 스파이크

1. 구현 시점의 최신 Next 버전을 확인하고 기록한다.
2. shadcn이나 제품 UI 없이 최소한의 Next Host·Remote 스파이크 앱을 만든다.
3. peer 경고를 숨기지 않고 Pages Router + 로컬 Webpack + `nextjs-mf`를 시도한다.
4. 실제 Remote 렌더링, 브라우저 콘솔, 네트워크 청크, 새로고침을 검증한다.
5. `spikes/next-latest-federation/README.md`에 `VALIDATED`, `PARTIAL`, `INVALIDATED` 중 하나를 기록한다.
6. 판정 후 일회성 스파이크 코드를 삭제하고 근거 문서는 보존한다.

### 단계 C — 워크스페이스와 공유 패키지

1. pnpm 워크스페이스와 루트 스크립트를 만든다.
2. contracts, fixtures, design-token 패키지를 추가한다.
3. 테스트 우선 계약 검증을 추가한다.
4. 앱 하나, composed 전용, standalone 전용, 프레임워크별, 6-서버 명령을 검증한다.

### 단계 D — 프론트엔드 디자인 리뷰

1. AI Platform Console / Model Deployment Monitor를 위한 두 가지 디자인 방향을 만든다.
2. 토큰, 타이포그래피, 반응형 레이아웃, 시그니처 요소를 리뷰한다.
3. 제품 UI 구현 전에 방향 하나를 선택한다.

### 단계 E — Vue 3 트랙

1. Vue Host와 Remote를 스캐폴딩한다.
2. shadcn-vue 컴포넌트를 설치한다.
3. standalone Remote를 만든다.
4. 정확한 origin `postMessage` 계약을 가진 iframe 경로를 만든다.
5. Vite Module Federation Remote 노출과 Host 소비를 구현한다.
6. 로딩, 에러, 타임아웃, 재시도, 라우팅, 이벤트 처리를 추가한다.
7. 별도의 비합성 Standalone Console + Monitor baseline을 만든다.
8. 단위, 빌드, Remote 미리보기, Standalone, iframe, federation 모드를 테스트한다.

### 단계 F — 최신 Next 트랙

1. 공식 shadcn/ui로 최신 Next Host와 Remote를 스캐폴딩한다.
2. standalone Remote를 만든다.
3. 별도의 비합성 Standalone Console + Monitor baseline을 만든다.
4. 정확한 origin `postMessage` 계약을 가진 iframe 경로를 만든다.
5. 단계 B가 `VALIDATED`라면, 증명된 Federation 경로를 만들고 테스트한다.
6. 단계 B가 `PARTIAL` 또는 `INVALIDATED`라면, 불안정한 플러그인 경로를 출시하지 않고 Next 트랙이 왜 다른지 문서화한다.

### 단계 G — 프레임워크 간 비교

1. 동일한 fixture와 시맨틱 이벤트를 사용한다.
2. 설정, 런타임 로딩, 장애 격리, 라우팅, 스타일, 번들 경계, 개발자 경험을 비교한다.
3. Web Components와 single-spa를 문서화된 대안으로 설명한다.
4. 하나의 절대적 승자가 아니라 맥락에 따라 권장한다.

### 단계 H — 자동화 및 MCP 검증

1. 프레임워크 단위/컴포넌트 테스트를 실행한다.
2. 여섯 개 앱을 독립적으로 빌드한다.
3. standalone, iframe, 지원되는 federation 모드에 대해 Playwright Test를 실행한다.
4. 접근성 스냅샷, 상호작용, 콘솔, 네트워크, 장애/복구, 반응형 QA를 위해 Microsoft Playwright MCP를 실행한다.
5. `docs/validation/` 아래에 근거를 기록한다.

### 단계 I — README 스크린샷과 릴리스 리뷰

1. 결정론적인 130% 프레젠테이션 배율로 전체 폭 README 스크린샷을 캡처한다.
2. 캡션, alt 텍스트, 순서, 가독성을 리뷰한다.
3. 비교 표를 측정된 결과로 갱신한다.
4. `v0.1.0` 게이트를 완료한다.
5. 버전 준비 상태와 무관하게, 오너가 별도로 지금 푸시가 가능하다고 말할 때까지 푸시를 막아둔다.

---

## 9. 자동화 검증 매트릭스

| 트랙 | Remote 미리보기 | 비합성 Standalone | iframe | Federation | 장애/복구 |
| --- | --- | --- | --- | --- | --- |
| Vue 3 | 필수 | 필수 | 필수 | 필수 | 필수 |
| 최신 Next | 필수 | 필수 | 필수 | 스파이크에 조건부 | 구현된 모드에 대해 필수 |

필수 루트 명령:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm e2e
```

추가 수용 기준:

- `pnpm dev`가 읽기 쉬운 접두사 로그와 함께 여섯 개 서버를 병렬로 시작한다.
- `pnpm dev:composed`가 Host/Remote 서버 네 개를 시작한다.
- `pnpm dev:standalone`이 비합성 baseline 두 개를 시작한다.
- 각 앱이 단독으로 시작하고 빌드될 수 있다.
- Remote URL이 독립적으로 동작한다.
- 어떤 Host도 Remote 소스 파일을 직접 import하지 않는다.
- iframe 메시지가 `event.origin`과 메시지 형태를 모두 검증한다.
- 명시적으로 설명되지 않는 한 콘솔과 네트워크 에러는 실패로 취급한다.

---

## 10. Playwright MCP와 스크린샷 정책

### MCP 설정

```bash
claude mcp add --scope project playwright -- npx @playwright/mcp@latest
```

생성된 `.mcp.json`을 리뷰한다. 릴리스 근거를 위해 확정된 MCP 버전을 기록하고, 향후 푸시 전에 버전을 고정할지 결정한다.

### MCP 리뷰 대상

- 두 비합성 Standalone baseline을 포함한 여섯 개 애플리케이션 URL
- Vue Host federation 경로
- Vue Host iframe 경로
- Next Host iframe 경로
- 스파이크가 검증한 경우에만 Next Host federation 경로
- 접근성 트리와 랜드마크
- 키보드 흐름과 포커스
- URL과 시맨틱 이벤트 동기화
- 콘솔, 네트워크, remote entry, 청크, CORS
- Remote 서버 중단, 폴백, 재시작, 재시도
- 데스크톱, 태블릿, 모바일 뷰포트

### 130% README 스크린샷

프로덕션 프리뷰에서 Playwright MCP를 사용한다. 가독성을 위해:

1. 반응형 동작을 문서화하는 경우가 아니면 뷰포트를 `1440 × 900`으로 설정한다.
2. 다음을 평가(evaluate)해 캡처 시에만 임시로 130% 페이지 프레젠테이션 배율을 적용한다:

```js
document.documentElement.style.zoom = '1.3'
```

3. 폰트, Remote 청크, 애니메이션이 안정된 뒤에만 캡처한다.
4. 캡처 후 주입한 zoom을 제거한다 — 프로덕션 스타일에 들어가서는 안 된다.
5. README에는 작은 나란히 배치된 썸네일 대신 스크린샷을 전체 폭으로 배치한다.
6. 의미 있는 alt 텍스트를 사용하고, 채워진 삼각형 캡션에 동일한 문구를 반복한다.

예시:

```markdown
![Vue Host에 연합된 Model Deployment Monitor](artifacts/screenshots/readme/vue-federation.png)
▲ Vue Host에 연합된 Model Deployment Monitor
```

필수 README 이미지:

- Host 안에 있는 Vue Federation
- Vue Remote standalone
- Vue 비합성 Standalone baseline
- Vue iframe 비교
- Next Remote standalone
- Next 비합성 Standalone baseline
- Next iframe 비교
- 검증된 경우에만 Next Federation

---

## 11. `v0.1.0` 첫 푸시 게이트

`v0.1.0` 준비도 리뷰는 해당하는 모든 기준을 요구하지만, 이것이 푸시를 자동으로 승인하지는 않는다:

- 오너가 승인한 계획과 디자인 방향
- 독립적으로 동작하는 여섯 개 애플리케이션
- 동작하는 Vue federation과 iframe
- 동작하는 Next iframe
- 정직하게 문서화된 Next federation 판정
- 검증된 공유 contracts, fixtures, design tokens
- 동작하는 루트 병렬 개발 명령
- 전부 통과하는 lint, typecheck, test, build, E2E
- 완료된 Playwright MCP 검증 보고서
- 리뷰된 130% README 스크린샷
- Module Federation, iframe, Web Components, single-spa를 포함하는 README 비교
- 스테이징되지 않은 비밀 정보, 세션 메타데이터, 설명되지 않은 로컬 경로
- 오너가 별도로 지금 원격 푸시가 가능하다고 말하고 정확한 푸시 명령을 승인함

저장소는 릴리스 리뷰가 `v0.1.0`으로 바꾸기 전까지 `v0.0.1`로 유지된다.

---

## 12. 출처

- [Module Federation Next.js 통합](https://module-federation.io/practice/frameworks/next/index.html) — App Router 미지원, Pages Router 지원, Next 12–15 지원, 유지보수/폐기 예정 안내.
- [`@module-federation/nextjs-mf`](https://www.npmjs.com/package/@module-federation/nextjs-mf) — 현재 peer dependency 근거.
- [`@module-federation/vite`](https://github.com/module-federation/vite) — Vite Host/Remote 설정.
- [최신 Next.js 문서](https://nextjs.org/docs) — 현재 Next 버전과 Turbopack/App Router 동작.
- [shadcn/ui](https://ui.shadcn.com/docs) — 공식 React/Next 컴포넌트와 모노레포 지원.
- [shadcn-vue](https://www.shadcn-vue.com/docs/introduction.html) — Vue 포트와 Vue 컴포넌트 카탈로그.
- [pnpm workspaces](https://pnpm.io/workspaces)와 [filtering](https://pnpm.io/filtering) — 워크스페이스 링크와 필터링된 명령.
- [Microsoft Playwright MCP](https://github.com/microsoft/playwright-mcp) — 접근성 트리 기반 브라우저 자동화와 Claude Code 설정.
