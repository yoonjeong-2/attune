/*
 * Vercel 서버리스 함수 — GET /api/health
 * 프론트가 부팅 시 목업 모드/키 여부를 확인하는 데 쓴다.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node"

import { healthBody } from "../server/handleAnalyze.js"

export default function handler(_req: VercelRequest, res: VercelResponse) {
  return res.status(200).json(healthBody())
}
