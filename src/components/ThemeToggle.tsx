import { useState } from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

/**
 * 라이트/다크 토글 (CLAUDE.md §9). 기본은 라이트(§12) — 초기 다크 여부는
 * index.html 인라인 스크립트가 localStorage를 보고 <html>.dark 로 이미 반영해 둔다.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  )

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle("dark", next)
    try {
      localStorage.setItem("theme", next ? "dark" : "light")
    } catch {
      /* localStorage 불가 환경 무시 */
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={dark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={dark ? "라이트 모드" : "다크 모드"}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  )
}
