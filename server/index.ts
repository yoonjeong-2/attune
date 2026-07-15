/*
 * 얇은 서버 계층 — 로컬 개발용 Express (CLAUDE.md §8).
 * - POST /api/analyze : 입력(서류/공고) → [변환] → [Claude 분석] → 구조화 결과
 * - GET  /api/health  : 상태 확인
 * 실제 처리 로직은 handleAnalyze.ts 한 곳에 있고(§6-3), Vercel 배포 시엔
 * api/*.ts 서버리스 함수가 같은 코어를 재사용한다 — 두 진입점이 갈라지지 않게.
 */
import "dotenv/config"
import cors from "cors"
import express from "express"

import { hasApiKey } from "./analyze"
import { handleAnalyze, healthBody } from "./handleAnalyze"

const app = express()
const PORT = Number(process.env.PORT) || 8787

app.use(cors())
app.use(express.json({ limit: "1mb" }))

app.get("/api/health", (_req, res) => {
  res.json(healthBody())
})

app.post("/api/analyze", async (req, res) => {
  const { status, body } = await handleAnalyze(req.body ?? {})
  res.status(status).json(body)
})

app.listen(PORT, () => {
  const mode = process.env.USE_MOCK === "true"
    ? "목업 모드"
    : hasApiKey()
      ? "분석 준비됨"
      : "ANTHROPIC_API_KEY 없음 (.env 설정 필요)"
  console.log(`[server] http://localhost:${PORT}  ·  ${mode}`)
})
