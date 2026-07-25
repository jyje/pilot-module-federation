# Microsoft Playwright MCP 실사용 QA — `v0.1.0`

**Language:** [English](playwright-mcp-v0.1.0.md) · [한국어](playwright-mcp-v0.1.0-ko.md)

**날짜:** 2026-07-25
**도구:** `@playwright/mcp@0.0.78` (프로젝트 범위 `playwright-project` 서버), 프로덕션 프리뷰(`vite preview` / `next start`), Node `v22.22.3`.
**범위:** 대상 화면 8개 전부 — {Vue, Next} × {Remote standalone, Standalone baseline, Host+Federation, Host+iframe}.

## 방법

각 화면을 데스크톱(`1440×900`), 태블릿(`768×1024`), 모바일(`390×844`)에서 확인했다:

- 접근성 스냅샷(랜드마크 role, 레이블이 있는 컨트롤, alert/live region).
- 키보드 전용 상호작용: 모든 컨트롤을 `Tab`으로 순회하고, `Enter`로 활성화하고, `ArrowDown`/`Enter`로 Select 드롭다운을 조작하고, `ArrowLeft`/`ArrowRight`로 합성 탭을 전환(roving tabindex이며, ARIA Tabs 패턴대로 `Enter`가 아니다).
- `focus-visible`의 계산된 스타일을 프레임워크마다 최소 한 번씩 확인.
- 콘솔 메시지(모든 심각도).
- 합성된 화면들의 네트워크 요청(remote entry / 청크 / CORS).
- 세 breakpoint 전부에서 반응형 스크린샷 리뷰.
- Remote 중단 → 폴백 → 재시도: 이번 패스에서는 대화형으로 재현하지 않았음(이 MCP 서버의 도구 표면은 네트워크 라우트 가로채기를 노출하지 않음). 대신 이 정확한 시나리오를 {Vue, Next} × {iframe, Federation}에 대해 다루는 `e2e/remote-recovery.spec.ts`를 이번 패스 마지막에 다시 실행했다 — `4/4` 통과.

도구에 대한 참고: Claude Code Browser 패널의 `computer` 도구로 키보드 활성화를 테스트하려던 초기 시도는 위양성(false negative)을 냈다(`Enter`/`Space`/`ArrowRight`가 버튼을 활성화하지 않는 것처럼 보였고, 이는 Radix/reka-ui 자체의 잘 검증된 Tabs primitive에서도 마찬가지였다). 실제 Playwright MCP 서버로 전환하자 즉시 해결되었다 — 이는 Browser 패널의 키 디스패치 한계로 확인되었으며 애플리케이션 결함이 아니다. 아래의 모든 키보드 관련 발견은 Playwright MCP를 통한 것이다.

## 발견 사항

### 이번 패스에서 발견하고 수정한 결함

1. **모든 iframe 컨텍스트 동기화에서 발생하는 `DataCloneError`(Vue Host).** Vue Host를 iframe 모드로 전환하면 렌더링마다 `Failed to execute 'postMessage' on 'Window': #<Object> could not be cloned`가 발생했다. 근본 원인: `IframePanel.vue`가 Host의 `context`(Vue `ref`로 감싼 객체이므로 reactive `Proxy`)를 `postContextToRemote`에 그대로 전달했는데, `postMessage`가 사용하는 structured-clone 알고리즘은 Vue reactive Proxy를 복제할 수 없다. `vue/host/src/lib/hostFrameAdapter.ts`에서 수정: `postContextToRemote`가 이제 전송 전에 세 필드를 새로운 plain object로 복사한다. 검증: 수정 후 동일한 상호작용에서 콘솔 에러가 2건에서 0건으로 줄었다; `vue-host` 단위 테스트 `48/48`이 여전히 통과한다(기존 테스트는 plain-object fixture를 사용했기 때문에 이 문제를 전혀 잡아내지 못했다 — 실제 브라우저에서만 발견되는 결함 유형).
2. **연합된 컴포넌트 스타일이 소리 없이 깨짐(Next Host, Federation 모드).** `768px`에서 `REPLICAS`와 `P95 LATENCY` 레이블 사이에 간격이 **전혀 없이**(의도한 `32px` 대신 `gap: normal`) 렌더링되었다. 원인은 `next/host`의 Tailwind 빌드가 `next/host` 자체 소스만 스캔하기 때문이다 — `next/remote`의 컴포넌트 소스는 전혀 보지 못하므로, 연합된 컴포넌트에서만 사용되는(즉 `next/host` 내부에서 독립적으로 사용된 적 없는) Tailwind 유틸리티 클래스는 origin 경계를 넘어 JS가 로드된 뒤에도 아무 규칙 없이 컴파일된다. Module Federation은 JS를 전달할 뿐 CSS는 전달하지 않는다. `next/host/app/globals.css`에 `@source` 디렉티브를 추가해 `next/remote`의 `components/`와 `app/` 디렉터리를 가리키게 함으로써 수정했고, 이제 `next/host`의 Tailwind 빌드는 연합된 컴포넌트가 사용할 수 있는 모든 유틸리티 클래스를 선제적으로 포함한다. 이는 이 클래스 하나에 국한된 문제가 아니라, Module Federation을 유틸리티 우선 CSS 프레임워크와 함께 쓰는 누구에게나 해당하는 실질적이고 일반화 가능한 발견이며 수정 코드에도 인라인으로 문서화했다.
3. **프레임워크 간 breakpoint 불일치(Next Host / Next Standalone).** 2단 → 1단 레이아웃 붕괴가 Next에서는 `768px`(Tailwind의 기본 `md:` breakpoint)에서, Vue에서는 `900px`(`docs/design-direction.md`에 맞춘 커스텀 `@media` 규칙)에서 일어났다. 정확히 `768×1024`—이 보고서 자체의 태블릿 breakpoint—에서 두 트랙이 동일한 시나리오에 대해 서로 다른 레이아웃을 보였다. `next/host/app/page.tsx`와 `next/standalone/app/page.tsx`에서 `md:grid-cols-…`를 `min-[900px]:grid-cols-…`로 바꿔 Vue의 임계값에 정확히 맞춰 수정했다. `768×1024`에서 시각적으로 검증: 이제 두 트랙 모두 1단 스택 레이아웃을 보인다.

세 수정 사항 모두 실사용 환경에서 검증했으며(전후 스크린샷, 콘솔 메시지 수, 계산된 스타일 확인) 기존 자동화 스위트로도 커버된다: `pnpm lint && pnpm typecheck && pnpm test && pnpm build`가 모두 통과하고(단위/컴포넌트 테스트 `237/237`), 수정 후 `pnpm e2e`는 `16/16` 통과한다.

### 결함이 아닌 항목(확인했으나 조치 불필요)

- **`favicon.ico` 누락**이 여섯 개 앱 전부에서 발생(모든 페이지 로드 시 `404`). 존재는 하지만 사소한 문제이며, 여섯 개 스캐폴드 어디에도 `favicon.ico`가 설정되어 있지 않다. 심각도 낮음, 외견상 문제일 뿐이며 범위 내 기능적/접근성 요구사항에 영향을 주지 않아 수정하지 않고 기록만 남긴다.
- **iframe 모드 방문 후 Federation 모드로 다시 전환할 때 `[ Federation Runtime ]: The remote "vue_remote" is already registered` 경고**가 발생. 이는 `loadFederatedMonitor`의 `force: true` 재등록이 의도한 대로 일으키는 예상된 부작용이다(해당 함수 자체의 주석에 문서화되어 있으며, 장애 이후 재시도가 동작하도록 하기 위해 존재한다). 콘솔 노이즈일 뿐 기능적 결함이 아니며, Federation 모드는 그 직후에도 정상적으로 계속 동작했다.

### 접근성

- 8개 화면 전부에서 올바른 랜드마크 구조가 노출되었다: `main`, `region "Model deployment monitor"`, `list "Deployment pulse rail"`, `group "Deployment context"`, `tab`/`[selected]` 상태를 가진 `tablist "Composition mode"`, 저하된 배포와 사용 불가능한 Remote 상태에 대한 `alert`.
- 모든 pulse-rail 버튼은 아이콘 글리프에만 의존하지 않고 설명적인 `aria-label`(예: `"Model X — degraded — 2/4 replicas"`)을 갖는다.
- `focus-visible`은 두 프레임워크에서 동일하게 확인되었다: `2px solid hsl(var(--platform-accent))`에 `2px` 오프셋(Vue Remote와 Next Remote의 계산된 스타일로 검증) — 공유된 `@pilot/design-tokens` 규칙이 프레임워크와 무관하게 픽셀 단위로 동일하게 렌더링된다.
- 사소하고 차단 요소는 아닌 관찰 사항 하나: 이벤트 원장 패널(`"Standalone event ledger"` / `"Host event ledger"`)이 두 프레임워크 모두에서 랜드마크 role이 아니라 평범한 `generic`으로 노출된다. 현재 디자인 스펙에서 요구하지 않으며, 향후 개선 가능 항목으로 기록만 해 둔다.

### 키보드 흐름

전체 키보드 전용 흐름을 모든 화면에서 처음부터 끝까지 실행해 정상 동작을 확인했다:

- **Select 컨트롤**(Cluster/Model/Environment): `Enter`로 리스트박스를 열고, `ArrowDown`으로 선택을 이동하고, `Enter`로 확정하며 닫힘 — shadcn-vue와 shadcn/ui에서 동일하게 동작.
- **합성 탭**: `ArrowLeft`/`ArrowRight`로 Federation ↔ iframe 전환(roving tabindex — `Enter`는 탭 전환에 올바른 키가 아니며 여기서는 애초에 동작이 예상되지 않았다).
- **Pulse-rail 선택**: `Tab`으로 각 노드에 도달하고, `Enter`로 선택하면 Monitor 뷰가 갱신되며, 합성 모드에서는 Host의 이벤트 원장에 소스가 태그된 올바른 이벤트(`iframe` 또는 `federation`)를 전송한다.
- **확인(Acknowledge)**: `Tab` + `Enter`로 저하된 배포 알림을 해제하고 `alert-acknowledged`를 원장에 전송한다.

이는 `e2e/*.spec.ts`와 동일한 상호작용 경로를 실행했지만 `page.click()` 대신 실제 키보드 입력을 사용했으며, 이 프로젝트가 단언(assertion)이 아니라 실사용 환경에서 키보드 전용 조작 가능성을 처음으로 검증한 사례다.

### 콘솔 / 네트워크

- 위 세 가지 수정 이후 모든 화면에서 에러 0건(이전에는 Vue Host iframe 모드에서 컨텍스트가 바뀔 때마다 `DataCloneError`가 발생했다).
- Federation 모드의 크로스 오리진 청크(`remoteEntry.js`와 컴포넌트 자체의 비동기 청크)는 두 프레임워크 모두에서 CORS 실패 없이 전부 `200`을 반환했다.
- iframe 모드의 프레임 문서는 자신의 정확한 origin에서 로드되었고 mixed-content나 CORS 경고가 없었다.

### 반응형 (`1440×900` / `768×1024` / `390×844`)

- 시각적으로 빡빡해 보였던 화면 하나에서 명시적으로 `document.documentElement.scrollWidth`를 확인했으며, 어떤 breakpoint에서도 어떤 화면에서도 가로 오버플로가 발견되지 않았다.
- 두 트랙 모두 이제 동일한 `900px` 임계값에서 2단 합성 레이아웃을 1단으로 붕괴시킨다(결함 3번 참조).
- `390px`에서도 모든 텍스트가 읽을 수 있는 상태를 유지했으며, 유일하게 줄바꿈되는 것은 의도적으로 줄바꿈되도록 설계된 페이지 상단의 짧은 설명 문구뿐이다.

## 판정

`v0.1.0` 게이트 항목 "해결되지 않은 콘솔, 네트워크, CORS, 접근성, 반응형 결함이 남아 있지 않아야 한다"는 이번 패스에서 실행한 8개 화면과 3개 breakpoint에 대해 **충족**되었다. 두 항목은 명시적으로 이 보고서의 범위 밖으로 남겨 `TASK.md`에서 별도로 추적한다: 전용 키보드 흐름 *자동화* E2E 스펙(이번 패스는 수동 실사용이었고 스크립트화되지 않았다), 그리고 `130%` README 스크린샷 캡처 패스(이 QA 패스와는 별개의, 프레젠테이션 중심 작업).
