# 스파이크 — 최신 Next.js Module Federation (`@module-federation/nextjs-mf`)

**Language:** [English](README.md) · [한국어](README-ko.md)

**판정: `INVALIDATED`**

## Given / When / Then

**Given**

- 구현 시점에 npm에서 해석된 최신 Next.js: `next@16.2.11`.
- `react@19.2.8`, `react-dom@19.2.8`(Next 16.2.11이 선언한 peer 범위).
- `@module-federation/nextjs-mf@8.8.71`, 이 패키지의 `peerDependencies`는
  `next: "^12 || ^13 || ^14 || ^15"`만 선언한다(
  `npm view @module-federation/nextjs-mf peerDependencies --json`으로 확인).
- 공식 Module Federation 문서와 이 패키지 자체의 README는 App Router가
  지원되지 않고, Pages Router는 지원되며, 이 플러그인의 Next.js 지원이
  종료 중/유지보수 모드라고 밝히고 있다.
- `host/`(포트 3900)와 `remote/`(포트 3901) 아래에 두 개의 일회성 최소
  Pages Router 앱을 만들고, 각각 문서화된 기본 예제대로
  `NextFederationPlugin`을 연결했다(`remote`는 `./PulseWidget`을
  노출하고, `host`는 `next/dynamic(..., { ssr: false })`으로 이를
  소비한다).
- 플러그인이 문서화한 설정에 따라, 두 앱 모두에 `webpack@5.109.0`을
  명시적 devDependency로 설치했다.

**When**

1. `remote/`와 `host/`에서 `npm install --legacy-peer-deps`.
2. `NEXT_PRIVATE_LOCAL_WEBPACK=true npx next dev --webpack -p 3901`(remote).
3. `NEXT_PRIVATE_LOCAL_WEBPACK=true npx next build --webpack`(remote, 이후 host).

**Then**

- 1단계는 일반 `npm install`이 `ERESOLVE`로 실패한다(peer 충돌: 설치된
  `next@16.2.11`과 플러그인이 선언한 `^12 || ^13 || ^14 || ^15`).
  진행하려면 `--legacy-peer-deps`가 필요하며, 이 자체가 이 플러그인이
  현재 Next에 대해 유지보수되고 있지 않다는 증거다.
- 2/3단계(`remote`와 `host` 둘 다, `dev --webpack`과 `build --webpack`
  둘 다)는 Next의 설정 로딩 단계에서 동일하게, 즉시 실패한다. **어떤
  webpack 컴파일도, 어떤 HTTP 서버 응답도, 어떤 브라우저 접근도
  이루어지기 전에** 실패한다:

  ```
  ⨯ Failed to load next.config.mjs, see more info here https://nextjs.org/docs/messages/next-config-error
  TypeError: Cannot destructure property 'CachedSource' of 'require(...)' as it is undefined.
      at ignore-listed frames
  ```

- `curl http://localhost:3901/`과
  `curl http://localhost:3901/static/chunks/remoteEntry.js` 둘 다
  `000`을 반환했다(연결이 전혀 성립되지 않음). dev 서버의 Next.js 요청
  핸들러가 설정 에러를 지나 초기화를 끝마치지 못했기 때문이다.

## 정확한 버전과 명령

| 패키지 | 버전 |
| --- | --- |
| `next` | `16.2.11` |
| `react` / `react-dom` | `19.2.8` |
| `@module-federation/nextjs-mf` | `8.8.71` |
| `webpack`(명시적 devDependency) | `5.109.0` |
| Node.js | `v22.22.3` |

```bash
# install (--legacy-peer-deps 없이는 실패)
npm install --legacy-peer-deps

# dev — 설정 로드 단계에서 실패
NEXT_PRIVATE_LOCAL_WEBPACK=true npx next dev --webpack -p 3901

# build — 동일하게 실패
NEXT_PRIVATE_LOCAL_WEBPACK=true npx next build --webpack
```

Next.js 16은 `dev`와 `build` 둘 다 기본적으로 Turbopack을 사용한다;
webpack으로 다시 전환하려면 `--webpack` CLI 플래그가 필요했다(
https://nextjs.org/docs/app/api-reference/turbopack 에 문서화됨).
`next.config.mjs`에도 `NEXT_PRIVATE_LOCAL_WEBPACK=true`를 설정해야
했다 — 설정하지 않으면 `CachedSource` 실패에 도달하기도 전에 플러그인
자체가 명시적 에러(`process.env.NEXT_PRIVATE_LOCAL_WEBPACK is not set to
true, please set it to true, and "npm install webpack"`)를 던진다.

## 근본 원인(현재 확보 가능한 최선의 근거)

`next.config.mjs`가 내보내는 `webpack()` 훅 안에서 이루어지는
`NextFederationPlugin`의 생성이 `require(...)`를 트리거하는데, 이것이
플러그인 내부의 webpack-internals 배선 어딘가에서 `undefined`로
해석되고, 그 뒤 여기서 `CachedSource`를 destructure하려고 시도한다.
이는 `host`와 `remote` 모두, `dev`와 `build` 모두에서 동일하게
발생하며, federation 런타임(remote entry, shared scope, container)의
어떤 부분에도 도달하기 전에 일어난다. 이는 플러그인의 peer 범위가
Next 15에서 끝난다는 사실과 일치한다: Next 16은 내장/컴파일된 webpack
내부 구조를 바꾸었고(Turbopack이 기본 번들러가 되면서 Next 16이 내부
webpack 번들링을 재구성했다), Next 15 이하에서 마지막으로 빌드된
`@module-federation/nextjs-mf@8.8.71`은 더 이상 그것이 기대하는 내부
모듈을 해석하지 못한다. dev 서버가 요청 하나조차 처리하지 못하고
실패하기 때문에 컴포넌트나 런타임 동작 근거(remote 렌더링, 하드
새로고침, 콘솔, 네트워크, Playwright)는 전혀 수집할 수 없었다.

## 판정

**`INVALIDATED`**

- 최신 Next.js(`16.2.11`)는 Pages Router + 로컬 webpack Module
  Federation을 위해 `@module-federation/nextjs-mf@8.8.71`을 사용할 수
  없다. 이 실패는 좁은 런타임 제약이 아니라 하드 설정 로드 크래시이므로,
  건질 만한 축소된 "PARTIAL" 표면이 없다.
- 정책에 따라 통과시키기 위한 Next 15로의 조용한 다운그레이드는
  수행하지 않았다.
- 권장 사항: Next 트랙(`next/host`, `next/remote`, `next/standalone`)은
  **iframe**과 **비합성 Standalone** 합성만 구현한다. 이 저장소에서
  `next@16.2.11` 기준으로는 Next 트랙에 Module Federation을 구현하지
  않는다. Next Host의 합성 선택기는 동작하는 Federation 모드 대신
  근거가 뒷받침된 "이 Next 버전에서는 Federation을 지원하지 않음" 상태를
  보여줘야 한다.
- Next 15 호환 변형은 향후 별도 스파이크로 가능성이 남아 있지만, 이
  파일럿의 주된 비교 범위에서는 계획에 따라 범위 밖이다.

## 처리

일회성 스파이크 코드(`host/`, `remote/`, 설치된 `node_modules/`,
lockfile)는 이 판정 이후 프로젝트 정책에 따라 제거된다. 이 README가
보존되는 근거 기록이다.
