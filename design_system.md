# 디자인 시스템 가이드 — 공고 맞춤 이력서 진단

> 이 문서는 색상·타이포그래피·간격 등 UI의 시각 규칙을 정의합니다.
> Claude Code는 화면을 만들 때 이 토큰과 규칙을 따라 일관성을 유지해주세요.
> 임의의 색·폰트·크기를 새로 만들지 말고, 여기 정의된 값만 사용합니다.

---

## 1. 색상 (Color)

### 1-1. 메인 컬러 — 파랑+보라 (Indigo Violet)
AI가 분석·진단하는 서비스의 성격을 드러내는, 신뢰감 있는 파랑에 세련된
보라를 더한 톤. 버튼·링크·강조·포커스 등 "조작 가능한 요소"에 사용.

| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-primary`        | `#5B5BD6` | 메인 (버튼, 주요 강조) |
| `--color-primary-hover`  | `#4A45B0` | 호버·눌림 상태 |
| `--color-primary-active` | `#3D3A94` | 액티브(더 진한 눌림) |
| `--color-primary-text`   | `#4A45B0` | 옅은 배경 위 메인색 텍스트/링크 |
| `--color-primary-bg`     | `#EEEDFB` | 메인색의 옅은 배경 (배지·태그·하이라이트) |
| `--color-primary-bg-strong` | `#DEDCF7` | 옅은 배경의 한 단계 진한 버전 |

### 1-2. 의미색 (Semantic) — 메인과 반드시 구분해서 사용
분석 결과의 의미를 나타내는 색. 메인 컬러(보라)와 겹치지 않게 별도 유지.

**강점 (초록 계열)**
| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-success`      | `#1D9E75` | 강점 아이콘·강조 |
| `--color-success-text` | `#1D7A46` | 옅은 배경 위 강점 텍스트 |
| `--color-success-bg`   | `#E9F7EF` | 강점 카드·태그 배경 |
| `--color-success-accent` | `#1D9E75` | 강점 카드 좌측 액센트 바 |

**보완점 (주황 계열)**
| 토큰 | HEX | 용도 |
|------|-----|------|
| `--color-warning`      | `#EF9F27` | 보완점 아이콘·강조 |
| `--color-warning-text` | `#B5641A` | 옅은 배경 위 보완점 텍스트 |
| `--color-warning-bg`   | `#FDF0E3` | 보완점 카드·태그 배경 |
| `--color-warning-accent` | `#EF9F27` | 보완점 카드 좌측 액센트 바 |

**severity 배지 (보완점의 3단계 구분)**
| 단계 | 텍스트색 | 배경색 |
|------|---------|--------|
| 치명적 미스매치 | `#C0392B` | `#FCE9E6` |
| 보완 권장       | `#B5641A` | `#FDF0E3` |
| 강화 제안       | `#5A6270` | `#EEF0F3` (중립·회색톤) |

### 1-3. 중립색 (Neutral) — 텍스트·배경·보더
| 토큰 | HEX | 용도 |
|------|-----|------|
| `--text-primary`   | `#1A1A22` | 본문·제목 (거의 검정, 살짝 보라 기운) |
| `--text-secondary` | `#5A5A66` | 보조 설명 |
| `--text-muted`     | `#9494A0` | 힌트·비활성 |
| `--surface-page`   | `#FFFFFF` | 페이지 배경 (라이트 기본) |
| `--surface-card`   | `#FFFFFF` | 카드 배경 |
| `--surface-subtle` | `#F7F7FA` | 은은한 섹션 배경 |
| `--border`         | `#EAEAF0` | 기본 하airline 보더 |
| `--border-strong`  | `#D8D8E0` | 호버·강조 보더 |

### 1-4. 다크 모드 (옵션 — 라이트가 기본)
다크 모드는 토글로 지원. 메인색은 배경이 어두우므로 살짝 밝게 조정.
| 토큰 | 라이트 | 다크 |
|------|--------|------|
| `--color-primary`  | `#5B5BD6` | `#8280E8` |
| `--text-primary`   | `#1A1A22` | `#EDEDF2` |
| `--surface-page`   | `#FFFFFF` | `#15151C` |
| `--surface-card`   | `#FFFFFF` | `#1E1E27` |
| `--border`         | `#EAEAF0` | `#2C2C38` |
> 나머지 의미색(강점·보완점)은 다크에서 배경만 어둡게, 텍스트는 밝게 조정.

---

## 2. 타이포그래피 (Typography)

### 2-1. 서체 규칙 (매우 중요)
- **한글: Pretendard** — 자간 -4% (피그마 기준. CSS로는 `letter-spacing: -0.04em`)
- **영문·숫자: Poppins** — 자간 조정 없음 (`letter-spacing: normal`)
- 한글과 영문이 섞인 문장에서도 각 문자에 해당 서체가 적용되도록
  `font-family`에 Poppins를 먼저, Pretendard를 뒤에 두어 폴백 구성.
  (Poppins에 없는 한글은 자동으로 Pretendard로 렌더됨)

```css
/* 기본 폰트 스택 */
--font-base: 'Poppins', 'Pretendard', -apple-system, sans-serif;

/* 한글 자간은 전역 기본으로 -0.04em, 숫자·영문 위주 요소는 개별로 normal 처리 */
body { letter-spacing: -0.04em; }
/* 숫자/영문만 들어가는 요소(예: 점수, 영문 라벨)에는 .ls-normal 유틸 적용 */
.ls-normal { letter-spacing: normal; }
```

> 웹폰트 로드: Pretendard·Poppins 모두 CDN으로 로드 가능.
> Pretendard: jsdelivr, Poppins: Google Fonts. Claude Code가 링크를 넣어줌.

### 2-2. 타입 스케일
| 역할 | 크기 | 굵기 | 비고 |
|------|------|------|------|
| Display (적합도 히어로) | 32px | 700 | 화면의 주인공 |
| H1 (페이지 타이틀)      | 24px | 600 | |
| H2 (섹션 제목)          | 18px | 600 | "공고 핵심 요구" 등 |
| H3 (카드 제목)          | 16px | 600 | 강점·보완점 항목 제목 |
| Body (본문)             | 15px | 400 | 근거·설명 |
| Caption (보조)          | 13px | 400 | 태그·힌트 |
| Badge (배지)            | 12px | 500 | severity·연결 태그 |
- 줄 간격(line-height): 본문 1.6, 제목 1.3.
- 굵기는 400 / 500 / 600 / 700만 사용 (그 외 사용 금지).

---

## 3. 간격·모양 (Spacing & Shape)

### 3-1. 간격 스케일 (8px 기반)
| 토큰 | 값 |
|------|-----|
| `--space-xs` | 4px |
| `--space-sm` | 8px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 40px |
| `--space-2xl` | 64px |
- 섹션과 섹션 사이는 `--space-xl`(40px) 이상으로 넉넉히.
- 카드 내부 패딩은 `--space-lg`(24px) 기본.

### 3-2. 모서리 (Radius)
| 토큰 | 값 | 용도 |
|------|-----|------|
| `--radius-sm` | 8px | 버튼, 배지, 입력창 |
| `--radius-md` | 12px | 카드 |
| `--radius-lg` | 20px | 히어로 영역 등 큰 블록 |

### 3-3. 그림자 (Shadow) — "가볍게 떠 있는" 느낌
토스 원칙 참고: 무겁지 않게, 은은하게.
| 토큰 | 값 |
|------|-----|
| `--shadow-sm` | `0 1px 2px rgba(26,26,34,0.04)` |
| `--shadow-md` | `0 4px 16px rgba(26,26,34,0.06)` |
> 진한 테두리보다 은은한 그림자로 카드를 띄운다. 그림자는 절제해서 사용.

---

## 4. 컴포넌트 규칙 (핵심만)

- **버튼(주요):** 배경 `--color-primary`, 텍스트 흰색, `--radius-sm`,
  패딩 `12px 20px`, 호버 시 `--color-primary-hover`.
- **버튼(보조):** 배경 투명, 보더 `--border-strong`, 텍스트 `--text-primary`.
- **강점 카드:** 좌측 `--color-success-accent` 액센트 바(4px),
  배경 `--surface-card`, "연결된 공고 요구" 태그는 `--color-success-bg`.
- **보완점 카드:** 좌측 `--color-warning-accent` 액센트 바(4px),
  severity 배지는 3단계 색 규칙 적용. 상세는 아코디언으로 펼침.
- **적합도 히어로:** 배경은 메인색 옅은 톤(`--color-primary-bg`) 또는 흰색,
  적합도 텍스트는 Display 크기, 총평은 Body. 게이지는 3단계.
- **태그/배지:** 배경은 각 색의 `-bg`, 텍스트는 각 색의 `-text`.
  (배경 위 텍스트는 항상 같은 색 계열의 진한 톤 사용, 검정 금지)

---

## 5. 원칙 요약 (한 줄)

- 메인은 파랑+보라(`#5B5BD6`), 강점은 초록, 보완점은 주황 — 절대 안 섞음.
- 한글 Pretendard(자간 -4%) + 영문·숫자 Poppins(자간 normal).
- 라이트 모드 기본, 넉넉한 여백, 은은한 그림자로 가볍게.
- 색·폰트·크기·간격은 이 문서의 토큰만 사용.
