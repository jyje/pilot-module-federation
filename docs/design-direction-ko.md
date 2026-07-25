# 프론트엔드 디자인 방향

**Language:** [English](design-direction.md) · [한국어](design-direction-ko.md)

## 대상

- **제품:** AI Platform Console과 Model Deployment Monitor
- **사용자:** AI 플랫폼 운영자와 MLOps 엔지니어
- **단일 과업:** 모델 배포가 정상인지 판단하고, 문제가 있는 배포를 찾아내고, cluster/model 맥락을 잃지 않은 채 신호에서 조치로 넘어가는 것.

## 검토한 방향

### A. Flight Deck Ledger — 선택됨

비행기 조종석 계기 위계와 append-only 배포 원장(ledger)을 결합한 컴팩트한 운영 화면.

```text
┌───────────────────────────────────────────────────────────────┐
│ AI PLATFORM / cluster-aurora / production      framework mode │
├───────────────┬───────────────────────────────────────────────┤
│ context       │ deployment pulse rail                         │
│ cluster       │ ●━━━━●━━━━◐━━━━○                               │
│ model         ├───────────────────────────────────────────────┤
│ environment   │ active deployment      operational evidence  │
│ composition   │ replicas / p95 / state  event ledger          │
└───────────────┴───────────────────────────────────────────────┘
```

### B. Blueprint Console — 선택되지 않음

토폴로지 선과 주석 처리된 서비스 경계를 가진 밝은 엔지니어링 시트 스타일 화면. 아키텍처를 설명하기에는 명확하지만, 지속적인 상태 스캐닝과 스크린샷 대비 측면에서는 효과가 떨어진다.

## 토큰 시스템

| 토큰 | Hex | 용도 |
| --- | --- | --- |
| Flight Black | `#090E18` | 페이지 배경 |
| Instrument Panel | `#111827` | 기본 표면 |
| Bulkhead | `#243044` | 테두리와 구조 |
| Telemetry Ice | `#DCE7F5` | 기본 전경색 |
| Signal Teal | `#39D0B6` | 정상/현재 상태 |
| Caution Amber | `#F4B740` | 경고/저하 상태 |
| Fault Coral | `#FF6B6B` | 실패/에러 상태 |

구현 시에는 이 값들을 리터럴로 흩뿌리지 않고 CSS 변수로 매핑해야 한다.

## 타입 역할

- **디스플레이:** Manrope Variable, 제품명과 배포명에 절제해서 사용.
- **본문:** 레이블과 설명 텍스트에 Manrope Variable 사용.
- **유틸리티/데이터:** model ID, cluster 이름, 지연 시간, replica, 포트, 이벤트 타임스탬프에는 JetBrains Mono Variable 사용.

## 레이아웃

- Host: 왼쪽에 컨텍스트 레일, 중앙에 합성 캔버스, 너비에 따라 오른쪽/아래쪽에 Host 소유 이벤트 원장.
- Remote: pulse rail이 먼저, 배포 목록이 두 번째, 선택된 배포 증거가 세 번째.
- Standalone: 런타임 경계 없이 Host 컨텍스트와 Monitor를 결합하되 동일한 정보 순서를 유지.
- Mobile: 컨텍스트는 컴팩트한 상단 시트가 되고, 증거는 pulse rail 아래에 쌓이며, 페이지 가로 오버플로는 없다.

## 시그니처 요소 — 배포 pulse rail

시맨틱한 가로 레일이 배포 진행 상황과 현재 상태를 보여준다. 노드는 실제 라이프사이클 상태를 인코딩하며, 상호작용 가능한 경우 키보드로 접근할 수 있다. 모션은 현재 배포 중인 노드로만 제한되며 `prefers-reduced-motion`에서는 비활성화된다.

## 자체 비판

- 어두운 텔레메트리 화면은 흔한 네온 대시보드로 전락할 위험이 있다. 대응책: 그라데이션 히어로 없음, 후광(glow) 없음, 장식용 차트 없음, 동일한 KPI 카드의 벽 없음.
- 구조는 운영 소유권을 반영해야 한다. Host chrome, Remote root, iframe 경계, Standalone baseline은 주요 액션 레이블에 구현 전문 용어를 노출하지 않으면서도 비교를 위해 눈에 띄게 라벨링되어야 한다.
- shadcn 컴포넌트는 보조적인 primitive로 남는다. pulse rail과 원장 위계가 프로젝트 정체성을 담당한다.
