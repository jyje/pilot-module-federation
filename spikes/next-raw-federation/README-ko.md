# 스파이크 — raw `webpack.container.ModuleFederationPlugin`을 통한 Next.js Module Federation

**Language:** [English](README.md) · [한국어](README-ko.md)

**판정: `PARTIAL` — 무상태(stateless) 연합 컴포넌트에 대해서는 검증되어 채택됨; 독립적으로 빌드된 Next 앱 간 훅 기반 싱글턴 공유는 아직 미해결.**

## 이 스파이크가 존재하는 이유

`spikes/next-latest-federation/` 스파이크(I-006)는 `next@16.2.11`에서
`@module-federation/nextjs-mf@8.8.71`을 무효(`INVALIDATED`)로 판정했다:
어떤 webpack 컴파일도 실행되기 전에 플러그인이 Next 자체의 설정 로딩
단계를 크래시시켰는데, 래퍼의 내부 패치가 Next 15 이후 바뀐 Next 버전별
webpack 내부 구조에 손을 대기 때문이었다. 그 판정은 옳고 변하지 않는다.

하지만 `nextjs-mf`만이 Next에 Module Federation을 붙이는 유일한 방법은
아니다. webpack 5는 `ModuleFederationPlugin`을 일급 내장 기능으로
제공하며(`webpack.container.ModuleFederationPlugin`), Next는 webpack 5의
자체 사본을 내부적으로 번들링한다(확인 완료: `next@16.2.11`은
`webpack@5.98.0`을 번들링하며, `next/dist/compiled/webpack/webpack.js`에
노출되어 있고, 동작하는 `.container.ModuleFederationPlugin`을 가진다).
이 스파이크는 더 좁은 질문을 던진다: Next의 `next.config.js` `webpack()`
훅이 `nextjs-mf`와 그것의 모든 Next 버전별 패치를 우회하고 *raw*
플러그인을 직접 밀어 넣어, `next@16.2.11`에서 동작하는 Remote/Host
federation 쌍을 얻을 수 있는가?

## Given / When / Then

**Given**

- `next@16.2.11`, `react@19.2.8`, `react-dom@19.2.8`, 그 외 의존성 없음.
- 두 개의 일회성 Pages Router 앱, `remote/`(포트 3911, `./Widget` 노출)와
  `host/`(포트 3910, `remotes: { next_remote_spike }`를 선언하고
  `next_remote_spike/Widget`을 동적으로 import).
- `ModuleFederationPlugin`은
  `require('next/dist/compiled/webpack/webpack').webpack.container`에서
  직접 가져왔으며, 별도의 `webpack` devDependency로 설치한 적도
  `@module-federation/nextjs-mf`를 거친 적도 없다.
- 두 앱 모두 `--webpack` CLI 플래그로 레거시 webpack을 강제(Next 16의
  기본 번들러인 Turbopack은 webpack 플러그인을 전혀 지원하지 않음).

**When** — 디버깅 경로, 순서대로, 각 단계의 수정 사항이 다음 단계로
이어짐:

1. `exposes`만 설정한 채 `remote/`에서 `next build --webpack`.
   **결과:** 깨끗하게 컴파일되고 `remoteEntry.js`가 생성되어 서빙됨 —
   이것만으로도 `nextjs-mf`가 도달한 지점보다 더 나아갔다.
2. `remotes`를 설정하고 인덱스 페이지에
   `React.lazy(() => import('next_remote_spike/Widget'))`을 넣은 채
   `host/`에서 `next build --webpack`.
   **결과:** 빌드 실패: `Module not found: Can't resolve
   'next_remote_spike/Widget'` — 컴포넌트가 `ssr: false`/lazy 전용임에도
   Next의 *서버* 컴파일러 패스 역시 import를 정적으로 해석해야 한다.
   `ModuleFederationPlugin`의 동일한 `remotes` 설정을 `isServer`와
   클라이언트 컴파일 양쪽에 적용해 수정.
3. Host가 빌드되고, 브라우저에서 페이지가 로드되지만, remote 위젯이
   전혀 렌더링되지 않는다(`Loading remote widget…`이 콘솔 에러 없이
   무한히 표시됨). 근본 원인: Next는 기본적으로 *모든* Next 앱에 대해
   동일한 청크 로딩 전역 변수(`self.webpackChunk_N_E`)를 하드코딩한다.
   remote의 container 스크립트가 host의 페이지 안에서 실행될 때, 이는
   host 자신의 청크 배열에 push되고, remote의 내부 비동기 청크(이
   경우 593, 19)는 이들에 대한 엔트리가 없는 *host의* 청크-URL
   맵에 의해 "해석"되어 → 소리 없이 멈춘다. 앱마다 고유한 문자열로
   `config.output.uniqueName`을 설정해 수정했으며, 이는 각 앱의 청크
   로딩 전역 변수를 `webpackChunk<uniqueName>`으로 바꾼다.
4. 여전히 멈춘다. 근본 원인: Next는 자신의 webpack 런타임 프렐류드를
   별도의 `webpack-*.js` 청크로 분리하며, 이는 해당 앱의 모든 페이지가
   공유한다. host의 페이지 안에 독립적으로 로드되는 `remoteEntry.js`는
   그 프렐류드를 절대 받지 못하므로, `self.webpackChunk<uniqueName>.push`가
   실제 청크 로딩 핸들러로 패치되는 일이 없다. remote에
   `config.optimization.runtimeChunk = false`를 설정해(일관성을 위해
   host의 클라이언트 컴파일에도) 수정했으며, 이는 런타임을
   `remoteEntry.js` 자체에 인라인시킨다 — 파일이 589바이트에서
   6087바이트로 늘어난 것으로 검증됨.
5. 브라우저에서는 여전히 멈추지만, 콘솔에서 수동으로
   `container.get('./Widget')`을 호출하면 *성공한다*. 근본 원인:
   `remoteEntry.js`는 콘텐츠 해시가 없는 파일명을 가지며, Next는 이를
   `Cache-Control: public, max-age=31536000, immutable`로 서빙한다 —
   브라우저는 한 번 캐시하면 하드 리로드에서조차 절대 재검증하지
   않는다. 캐시가 무력화되기 전까지는 위의 모든 수정 사항이 브라우저에서
   보이지 않았다(이 스파이크 동안 host의 `remotes` URL에
   `?v=<timestamp>` 캐시 버스팅 쿼리 파라미터를 붙여 검증함).
6. 위 모든 것을 적용하면, **무상태 노출 컴포넌트가 실제 브라우저에서,
   실시간으로, origin을 넘어 올바르게 렌더링된다** — 아래 근거 참조.
7. **상태를 가진**(`useState`) 노출 컴포넌트로 반복. **결과:** 크래시:
   `TypeError: Cannot read properties of null (reading 'useState')` —
   전형적인 "두 개의 독립적인 React 사본" 실패다. `shared` 설정을
   선언하지 않았기 때문에 host와 remote가 각자 `react`를 독립적으로
   번들링하고 실행한다.
8. 양쪽 설정에 `shared: { react: { singleton: true, eager: true },
   'react-dom': {...} }`를 추가. **결과:** 로드 즉시 잡히지 않은
   `ScriptExternalLoadError` 클라이언트 사이드 예외.
9. `eager: true`를 제거하고(webpack 기본값인 비동기 shared 소비),
   `next.config.js`의 `headers()`로 remote의 `/_next/static/:path*`에
   `Access-Control-Allow-Origin: *`를 추가(이 증상만을 위한 것이 아니라
   일반적으로 실제 cross-origin MF 요구사항이기도 함). **결과:** 더
   이상 크래시는 없지만 3단계와 동일하게 소리 없이 멈춘다 —
   `container.get()`은 여전히 수동으로는 잘 해석되지만, host의
   컴파일된 번들이 기다리고 있는 페이지 수준의 `React.lazy`/`import()`
   프로미스가 절대 완료되지 않는다. 이 스파이크의 시간 범위 안에서는
   해결하지 못했다.

**Then**

- 1–6단계: 완전히 재현 가능하며, 실제 브라우저(Playwright MCP 브라우저
  패널)에서 각 단계마다 네트워크 요청과 `container.get()` 근거로
  검증했다. **무상태** Next.js 연합 컴포넌트 — Remote가 노출하고, Host가
  `React.lazy`로 소비하며, cross-origin, `next@16.2.11`, webpack
  강제 — 는 `@module-federation/nextjs-mf` 없이, 그것에 의존하지
  않고 **동작한다**.
- 7–9단계: **상태를 가진**(훅을 사용하는) 노출 컴포넌트는 아직 신뢰성
  있게 동작하지 않는다. 이 실패는 host와 remote가 완전히 별개의 Next
  빌드일 때 비동기 shared-React 협상의 프로미스 해결(resolution)에
  국한되어 있다; 이는 `nextjs-mf`가 겪은 어떤 문제의 반복도 아니며,
  풀릴 여지가 있어 보인다(아직 시도하지 않은 후보들: 매칭되는 React
  메이저 버전 사이에서 엘리먼트는 단순한 데이터라는 점에 착안해
  react/react-dom을 host와 `shared`로 협상하는 대신 remote 안에 완전히
  번들링하기; webpack이 생성한 비동기 협상 대신 손으로 작성한 동기식
  shared-scope 핸드셰이크; 또는 노출 컴포넌트를 완전히 무상태로 유지해
  싱글턴 공유 자체의 필요성을 없애기).

## 근거 — 무상태 컴포넌트, 실제 브라우저

- `curl -sI http://127.0.0.1:3911/_next/static/chunks/remoteEntry.js` →
  `200`, `Content-Type: application/javascript`, 본문은 예상된 webpack
  container 부트스트랩으로 시작(`var next_remote_spike;(...).push(...)`).
- Playwright MCP 브라우저 패널로 `http://127.0.0.1:3910/`(프로덕션
  프리뷰, `next start --webpack`, 캐시 버스팅된 remote URL)로 이동:
  페이지 텍스트는 **"Next Host raw-federation spike / Hello from Next
  Remote via raw webpack Module Federation"**을 읽는다 — 노출된
  컴포넌트 자체의 텍스트가, 요청 시점에 다른 origin(3911)에서 실시간으로
  fetch되어(Host 빌드 시점에 인라인된 것이 아니라) Host 자신의 React
  트리 안에서 렌더링되었다.
- 수동 콘솔 검증: `await window.next_remote_spike.get('./Widget')`은
  실제 컴포넌트 팩토리인 `{ default: [Function] }`으로 해석된다.

## 메인 저장소에 채택된 해법

- **`next/remote`와 `next/host`는 실제 Module Federation 합성 모드를
  갖는다**. raw `webpack.container.ModuleFederationPlugin`을 통해
  구현되며(`@module-federation/nextjs-mf`는 절대 사용하지 않음),
  `--webpack`을 강제한다. Federation 전용 노출 컴포넌트는 Monitor의
  **무상태, 완전히 prop으로 제어되는** 변형이다(`selectedId`/확인 상태는
  Host가 소유하고 내려주며, 이는 Host가 이미 composition/context 상태를
  소유하는 방식과 정확히 같다) — 이는 버그로 인해 어쩔 수 없이 택한
  우회책이 아니라, 7–9단계의 미해결 shared-React 협상 문제를 완전히
  피해가며, federation 경계에서 흔히 쓰이는 정당한 아키텍처 선택이다.
- `@module-federation/nextjs-mf`는 여전히 `INVALIDATED`(I-006, 변경
  없음)다. 채택된 이 경로는 이를 사용하지 않고, 그것이 수정되는 것에
  의존하지 않으며, "App Router federation 지원을 주장하지 않는다"는
  정책과도 충돌하지 않는다 — 여기서의 federation 경계는 `next/host`와
  `next/remote` 양쪽 모두 Pages Router 페이지이며, 이는 프로젝트
  계획이 조건부 Federation 경로에 대해 이미 예상했던 그대로다.
- 남아 있는 상태 공유 문제(7–9단계)는 향후 더 풍부한 연합 화면(예:
  Host가 주도하는 확인 상태를 진정으로 공유된 React 인스턴스로 다시
  전달하는 것)을 위한 미해결 이슈(LOG.md I-0xx)로 추적하며, 지금
  채택된 무상태 구현을 막지 않는다.

## 처리

일회성 스파이크 코드(`host/`, `remote/`, `node_modules/`, `.next/`)는
이 판정 이후 프로젝트 정책에 따라 제거된다. 이 README가 보존되는 근거
기록이다. 채택된 구현은 `next/host`와 `next/remote`에 직접 존재한다.
