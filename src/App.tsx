import { Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/AppLayout"
import InputPage from "@/pages/InputPage"
import AnalyzingPage from "@/pages/AnalyzingPage"
import ResultPage from "@/pages/ResultPage"
import ArchivePage from "@/pages/ArchivePage"
import ArchiveDetailPage from "@/pages/ArchiveDetailPage"

/**
 * 3개 화면 라우팅 (CLAUDE.md §7).
 * 재진입은 별도 화면이 아니라 결과 화면의 버튼 → 입력 화면으로 돌아가는 "흐름"으로 처리한다.
 *
 *   /            화면 1 · 입력       (2단계 — 완성)
 *   /analyzing   화면 2 · 분석 중    (5단계)
 *   /result      화면 3 · 결과       (4단계)
 */
export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<InputPage />} />
        <Route path="/analyzing" element={<AnalyzingPage />} />
        <Route path="/result" element={<ResultPage />} />
        {/* 아카이브 (분석 기록 목록) */}
        <Route path="/archive" element={<ArchivePage />} />
        {/* 아카이브 상세 (저장된 분석 다시 보기) */}
        <Route path="/archive/:id" element={<ArchiveDetailPage />} />
        {/* 알 수 없는 경로는 입력 화면으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
