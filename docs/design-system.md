# 디자인 시스템 — 구축 현황 (As-Built Reference)

> **공고 맞춤 이력서 진단** 서비스에 **실제로 구현된** 디자인 시스템을 코드(`src/index.css`, 컴포넌트)에서 추출해 정리한 문서입니다.
> Figma 재현(Variables · Text/Effect Styles · Components) 및 신규 화면 제작의 단일 레퍼런스로 사용합니다.
>
> - 원본 의도 가이드: [`design_system.md`](../design_system.md) (규칙 정의) — 이 문서는 그것을 **현재 코드 기준으로 확정·확장**한 버전입니다.
> - 기준 파일: `src/index.css`(@theme 토큰), `src/components/ui/*`, `src/components/result/*`
> - 모드: **라이트 기본**, `<html>.dark` 토글로 다크. 모든 색 토큰은 라이트/다크 쌍으로 정의.

---

## 0. 원칙 (Foundations)

- **밝고 미니멀** — 넉넉한 여백, 큼직·명확한 타이포, 절제된 색 (토스·당근 톤).
- **색은 의미로만, 최소로** — 아이콘·강조·상태에만. 큰 면적 채색 지양.
  - **보라(primary)** = 조작 가능한 요소(버튼·링크·포커스) + 브랜드/재분석.
  - **초록(success)** = 강점·좋아진 점. **주황(warning)** = 보완점·더 채울 점.
  - **적합도(fit)** = 높음/보통/낮음 상태(보라~회색 계열).
- **폰트 한 종류**, 둥근 모서리, 자간 -4%(한글).
- **정직한 진단 톤** — 판정("충족")보다 관찰("새로 확인됐어요")·격려.
- **브랜드 로고**: `attune` 워드마크(`src/components/Logo.tsx`, `#5B5BDE`). 헤더 좌측 홈 링크, 높이 17px. 라이트/다크 공통 단색.

---

## 1. 색상 (Color)

값은 `HEX`. 표기 `--토큰 : 라이트 / 다크`. Tailwind 유틸은 `bg-*`, `text-*`, `border-*`로 노출(예: `--primary` → `bg-primary` / `text-primary`).

### 1-1. 중립 (Neutral)
| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `surface-page` (`background`) | `#FFFFFF` | `#15151C` | 페이지 배경 |
| `surface-card` (`card`) | `#FFFFFF` | `#1E1E27` | 카드·팝오버 배경 |
| `surface-subtle` | `#F7F7FA` | `#24242F` | 옅은 면(보조 버튼·호버·구역) |
| `text-primary` (`foreground`) | `#1A1A22` | `#EDEDF2` | 본문·제목 |
| `text-secondary` | `#5A5A66` | `#B2B2C0` | 부제·설명 |
| `text-muted` | `#9494A0` | `#7C7C8A` | 캡션·힌트·비활성 |
| `border` (`input`) | `#EAEAF0` | `#2C2C38` | 기본 테두리·구분선 |
| `border-strong` | `#D8D8E0` | `#3B3B48` | 강조 테두리(아웃라인 버튼) |

### 1-2. 메인 — Indigo Violet (조작 요소·브랜드)
| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `primary` | `#5B5BD6` | `#8280E8` | 메인(버튼·주요 강조·포커스 ring) |
| `primary-hover` | `#4A45B0` | `#9694EE` | 호버 |
| `primary-active` | `#3D3A94` | `#6F6DE2` | 눌림(더 진하게) |
| `primary-text` | `#4A45B0` | `#B5B3F2` | 옅은 배경 위 보라 텍스트/링크 |
| `primary-bg` | `#EEEDFB` | `#262552` | 보라 옅은 배경(배지·태그·히어로) |
| `primary-bg-strong` | `#DEDCF7` | `#302F60` | 한 단계 진한 옅은 배경 |
| `primary-foreground` | `#FFFFFF` | `#FFFFFF` | 보라 버튼 위 텍스트 |

### 1-3. 적합도 (Fit) — 높음/보통/낮음
| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `fit-high` | `#5B5BD6` | `#8280E8` | 높음 배지 |
| `fit-high-bg` | `#EEEDFB` | `#262552` | 높음 히어로 배경 |
| `fit-mid` | `#9179D6` | `#AB9CE4` | 보통 배지("어느 정도 맞아요") |
| `fit-mid-bg` | `#F0ECFB` | `#2A2550` | 보통 히어로 배경 |
| `fit-low` | `#8A93A3` | `#9AA2B0` | 낮음 배지(회색 — 자존감 배려) |
| `fit-low-bg` | `#F0F1F5` | `#2A2D34` | 낮음 히어로 배경 |

> 낮음은 **의도적으로 무채색(회색)** — 부정적 인상을 줄이기 위함. 히어로 배경은 `#F1F2F4`로도 사용.

### 1-4. 의미색 — 강점(초록) / 보완점(주황)
| 토큰 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `success` | `#1D9E75` | `#35B98D` | 강점 아이콘·체크·상승(▲)·밑줄 |
| `success-text` | `#1D7A46` | `#74D6AD` | 옅은 배경 위 강점 텍스트 |
| `success-bg` | `#E9F7EF` | `#13322A` | 강점 태그·아이콘 배경 |
| `warning` | `#EF9F27` | `#F0AD4E` | 보완점 아이콘(전구)·강조 |
| `warning-text` | `#B5641A` | `#F2C485` | 옅은 배경 위 보완점 텍스트 |
| `warning-bg` | `#FDF0E3` | `#3A2A16` | 보완점 태그·아이콘 배경 |

### 1-5. Severity 3단계 (보완점 심각도)
| 토큰 | 라이트(text/bg) | 다크(text/bg) | 라벨 |
|---|---|---|---|
| `critical` | `#C0392B` / `#FCE9E6` | `#EF9A8F` / `#3A1E1B` | "꼭 챙겨요"(치명적 미스매치) |
| `recommended` | `#B5641A` / `#FDF0E3` | `#F2C485` / `#3A2A16` | "챙기면 좋아요"(우대 관련) |
| `enhancement` | `#5A6270` / `#EEF0F3` | `#A2A8B4` / `#2A2D34` | "더 돋보이기"(강화 제안) |

### 1-6. shadcn 별칭 (파생 — 위 토큰 참조)
`secondary`·`muted`·`accent` = `surface-subtle` / `destructive` = `critical-text`(`#C0392B`) / `ring` = `primary` / `input`·`border` = `#EAEAF0`. 다크는 참조라 자동 반영.

---

## 2. 타이포그래피 (Typography)

- **폰트**: `Poppins`(영문·숫자) → `Pretendard`(한글) → `-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`. **한 종류로 통일.**
- **자간(letter-spacing)**: 기본 **-0.04em**(한글 -4%). 숫자·영문 전용 요소는 `.ls-normal`(자간 원복) — 예: 매칭 %, 날짜.
- **굵기**: 400(normal) · 500(medium) · 600(semibold) · 700(bold).

| 스타일 | 크기 | line-height | Tailwind | 용도 |
|---|---|---|---|---|
| `display` | 2rem (32px) | 1.3 | `text-display` | 최상위 히어로 |
| `h1` | 1.5rem (24px) | 1.3 | `text-h1` | 페이지 제목 |
| `h2` | 1.125rem (18px) | 1.3 | `text-h2` | 섹션 제목 |
| `h3` | 1rem (16px) | 1.4 | `text-h3` | 소제목·카드 제목 |
| `body` | 0.9375rem (15px) | 1.6 | `text-body` | 본문 |
| `caption` | 0.8125rem (13px) | 1.5 | `text-caption` | 부제·힌트·태그 |
| `badge` | 0.75rem (12px) | 1.4 | `text-badge` | 배지·아주 작은 라벨 |

> 히어로 총평 등 특수 크기는 `text-[1.25rem]`(20px), 재분석 성장 숫자는 `text-[44px]` 등 arbitrary로 예외 처리.

---

## 3. 모서리 (Radius)
| 토큰 | 값 | Tailwind | 용도 |
|---|---|---|---|
| `chip` | 8px | `rounded-chip` | 버튼·인풋·태그 |
| `card` | 12px | `rounded-card` | 카드·박스 |
| `hero` | 20px | `rounded-hero` | 히어로·큰 배너 |
| (full) | 9999px | `rounded-full` | 배지·pill·아이콘 버튼 |
| (md) | 6px | `rounded-md` | 기본 인풋(shadcn) |

## 4. 그림자 (Shadow)
| 토큰 | 값 | 용도 |
|---|---|---|
| `shadow-float` | `0 1px 2px rgba(26,26,34,.04), 0 4px 16px rgba(26,26,34,.06)` | 카드·팝오버·토스트 |
| `shadow-float-hover` | `0 2px 6px rgba(26,26,34,.05), 0 8px 24px rgba(26,26,34,.09)` | 호버 강조 |
| (CTA 전용) | `0 4px 14px rgba(91,91,214,.28)` | 분석하기 그라데이션 버튼 |

## 5. 간격 (Spacing)
- **기준 4px** (Tailwind 스케일: `1`=4px, `2`=8px …). 자주 쓰는 값:
  - 카드 내부 패딩 `p-5`(20px)·`p-6`(24px), 히어로 `p-7`(28px)·`p-8`(32px)
  - 요소 간 `gap-3.5`(14px) · `gap-6`(24px) · 섹션 간 `gap-10`(40px)
  - 결과 상단 카드 ↔ 원문 간격: **첫 분석 80px(`mt-20`)**, 재분석 자세히보기 **44px(`mt-11`)**
- 콘텐츠 최대폭: 입력/결과 단일컬럼 `max-w-2xl`(672px), 하이라이팅 뷰 `max-w-3xl`(768px), 앱 셸 `max-w-5xl`.

---

## 6. 컴포넌트 (Components)

### 6-1. Button (`components/ui/button.tsx`)
- **공통**: `inline-flex items-center gap-2 rounded-chip text-sm font-medium`, focus `ring-2 ring-ring ring-offset-2`, `active:scale-[0.98]`, `disabled:opacity-50`, 아이콘 `size-4`.
- **Variant**
  | variant | 스타일 |
  |---|---|
  | `default` | `bg-primary text-white`, hover `bg-primary-hover`, active `bg-primary-active` |
  | `outline` | `border border-border-strong bg-transparent text-foreground`, hover `bg-surface-subtle` |
  | `secondary` | `bg-surface-subtle text-foreground`, hover `bg-primary-bg` |
  | `ghost` | hover `bg-surface-subtle` |
  | `link` | `text-primary-text underline` |
  | `destructive` | `bg-destructive text-white`, hover `opacity-90` |
- **Size**: `sm` h-36px px-12 · `default` h-40px px-20 · `lg` h-44px px-24 · `icon` 40×40.

### 6-2. 분석하기 CTA (`.btn-analyze` — 그라데이션 주 버튼)
서비스의 대표 버튼. 3상태.
| 상태 | 배경 | 부가 |
|---|---|---|
| 활성(기본) | `linear-gradient(100deg, #5B5BD6, #7B6FE0 55%, #9179D6)` + shadow `0 4px 14px rgba(91,91,214,.28)` | h-48px, `rounded-chip`, 흰 텍스트 600, hover `brightness-1.04`, active `scale-0.99` |
| 분석 중 | 5색 그라데이션 `#5B5BD6,#7B6FE0,#9179D6,#7B6FE0,#5B5BD6` + `background-size:300% 100%` + `animation: analyze-flow 3s linear infinite`(흐름) | 텍스트 "분석하고 있어요…", `cursor-wait` |
| 비활성 | `#F0F0F3` | 텍스트 `#B4B4BC`, `cursor-not-allowed` |
- `@keyframes analyze-flow { background-position 0%→100% }`. `prefers-reduced-motion` 시 흐름 정지.

### 6-3. Input (`components/ui/input.tsx`)
`h-36px, rounded-md, border(#EAEAF0), bg-background(흰색), px-12 py-4, text-sm`, focus `ring-[3px] ring-ring/50 border-ring`. 필드 배경은 흰색 유지, 바깥 카드는 옅은 회색으로 대비.

### 6-4. Card
`rounded-card border border-border bg-card p-5~6`. 클릭형 카드는 hover `shadow-float`. (아카이브 카드 등)

### 6-5. 적합도 히어로 / FitCard
- 컨테이너: `rounded-hero`(또는 `rounded-card`) + 옅은 tint(`fit-*-bg` 또는 `#F4F3FB`), `p-6~8`.
- **배지**: `rounded-full px-3 py-1 text-caption font-semibold text-white bg-fit-{high|mid|low}`.
  - 라벨: 높음 "적합도 높음" · 보통 "어느 정도 맞아요" · 낮음 "조금 더 준비가 필요해요".
- "AI 매칭 {n}%" 캡션(`text-muted`, 숫자 `.ls-normal`).
- 총평: `text-[1.25rem] leading-1.5`, 핵심 구절만 `font-bold text-foreground`, 나머지 `text-secondary`.

### 6-6. Badge / Tag / Chip
`rounded-full px-2.5~3 py-0.5~1 text-badge~caption font-semibold`. 예:
- 적합도 배지(위) · "자격·스킬에서 확인"(`bg-#F2F2F5 text-#6B7280`) · 요구 태그(ReqTag).

### 6-7. ResultSection (섹션 헤더)
`섹션 = 아이콘(size-5, 기본 text-muted / accent로 색 지정) + h2 제목 + (선택)개수`. 카드 박스 없이 제목+내용이 흐르는 구조. **"색은 앞 아이콘에만"** 원칙(강점 초록 Check, 보완점 주황 Lightbulb).

### 6-8. 로딩 단계 (AnalyzingPage)
3단계 스텝. 색은 **브랜드 보라**로 통일(초록은 강점 의미와 겹쳐 배제).
| 상태 | 원 | 아이콘 |
|---|---|---|
| 완료 | `bg-primary-bg`(#EEEDFB) | 보라 Check(`text-primary`) |
| 진행 중 | `bg-primary/10` | 스피너(`text-primary`) |
| 대기 | `#F0F0F3` 빈 원 | — |
텍스트: 완료·진행 `text-foreground`, 대기 `text-muted`.

### 6-9. 하이라이팅 (밑줄 + 각주)
- 강점 근거 구절: `border-b-2` 밑줄(기본 `#9FDBBE`, 활성 `border-success`) + 위첨자 번호(`text-success`).
- 보완점: 밑줄 없이 "더 준비하면 좋아요" 리스트(주황 계열, 경고색 아님).
- 각주 상호작용은 **번호 있는(원문 이어지는) 강점만** hover/클릭, 나머지는 정적.

### 6-10. 충족 현황 (FulfillmentCard) 상태 아이콘
| 상태 | 아이콘 | 색 |
|---|---|---|
| 충족(met) | Check | `text-success` |
| 부분(partial) | Triangle | `text-muted` |
| 미충족/0 | Circle | `text-muted/40`, 요약 숫자 0은 `#9494A0` |

### 6-11. 재분석 성장 카드 / 배너 (ReanalysisResult)
- 배너: `text-[#3D3A94]`(다크 `primary-text`) + RotateCcw, **박스 없이 텍스트만**.
- 성장 히어로: `bg-[#F4F3FB]`(첫 분석 FitCard와 동일 톤), 배지 `bg-fit-mid`, 큰 숫자 `text-[44px] font-bold #3D3A94`, 상승폭 `▲ {n}%` **`text-primary`(#5B5BD6)**.
- "자세히 보기" 토글: 박스 없이 위 `border-t` 구분선 + `text-body font-semibold`(hover 진해짐), 화살표 `text-primary size-6`(펼침 시 회전).

### 6-12. Toast
`fixed bottom-center`, `bg-foreground rounded-full px-4 py-2.5 shadow-float`, `text-background`. 예: "아카이브에 저장됐어요 · 보러가기".

---

## 7. Figma 재현 가이드

Claude Code + Figma MCP로 만들 때 아래 순서를 권장합니다.

1. **Variables — 색상** : 컬렉션 `color` 생성, **모드 2개(`Light`/`Dark`)**. §1 표의 각 토큰을 그대로 변수로(예: `primary`, `primary/bg`, `fit/mid` … 슬래시로 그룹화). 라이트/다크 값을 각 모드에 입력.
2. **Variables — 숫자** : 컬렉션 `radius`(chip 8 / card 12 / hero 20), `spacing`(4·8·12·14·20·24·28·32·40·44·80). 
3. **Text Styles** : §2 표대로 7종(display~badge). 폰트 Poppins/Pretendard, 크기·행간·자간(-4%).
4. **Effect Styles** : §4 그림자 2종(+ CTA 전용 1종).
5. **Components** : §6 순서로. Button(variant×size 조합), Analyze CTA(3상태), Input, Card, Fit Hero(높음/보통/낮음 variant), Badge, ResultSection, 로딩 스텝, 성장 카드. 각 컴포넌트는 위 Variables/Styles를 참조하게 연결.
6. **페이지 구성(선택)** : `Foundations`(색·타입·간격·그림자) / `Components` / `Patterns`(결과·재분석 화면 예시).

> 대안: **Tokens Studio** 플러그인으로 한 번에 임포트하려면 §1~4를 W3C 디자인토큰 JSON으로 뽑아드릴 수 있어요(요청 시 생성). 그러면 색·타입·radius·spacing 변수가 자동 생성됩니다.

---

*이 문서는 `src/index.css`와 컴포넌트 코드에서 추출한 스냅샷입니다. 토큰을 바꾸면 이 문서도 함께 갱신해 주세요.*
