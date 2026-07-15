/*
 * Vercel 서버리스 함수 — POST /api/analyze
 * 로컬 Express(server/index.ts)와 동일한 코어(handleAnalyze)를 재사용한다.
 * Vercel이 JSON 바디를 자동 파싱하고 같은 오리진이라 express.json()·cors 불필요.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node"

import { handleAnalyze } from "../server/handleAnalyze"

// 실제 Claude 분석은 오래 걸릴 수 있어(적응형 사고 + 대용량 출력) 타임아웃을 넉넉히.
// 목업 모드에선 0.6초라 무관하지만, 실제 키로 전환해도 잘리지 않도록 미리 설정.
export const config = { maxDuration: 60 }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed", message: "POST만 허용돼요." })
  }
  const { status, body } = await handleAnalyze(req.body ?? {})
  return res.status(status).json(body)
}
