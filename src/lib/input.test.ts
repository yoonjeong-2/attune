import { describe, expect, it } from "vitest"

import { detectInput, isAnalyzable, toSourceInput } from "@/lib/input"

describe("detectInput", () => {
  it("빈 문자열/공백은 empty", () => {
    expect(detectInput("")).toBe("empty")
    expect(detectInput("   ")).toBe("empty")
  })

  it("공백이 있는 일반 텍스트는 text", () => {
    expect(detectInput("백엔드 개발자 2년차")).toBe("text")
  })

  it("지원되는 링크(노션·깃허브)는 link", () => {
    expect(detectInput("https://notion.so/my-resume")).toBe("link")
    expect(detectInput("https://github.com/user")).toBe("link")
  })

  it("이미지·PDF 확장자와 구글드라이브는 unsupported-image", () => {
    expect(detectInput("https://example.com/resume.pdf")).toBe("unsupported-image")
    expect(detectInput("https://drive.google.com/file/d/abc")).toBe("unsupported-image")
  })
})

describe("isAnalyzable", () => {
  it("text/link만 분석 가능, empty/이미지는 불가", () => {
    expect(isAnalyzable("text")).toBe(true)
    expect(isAnalyzable("link")).toBe(true)
    expect(isAnalyzable("empty")).toBe(false)
    expect(isAnalyzable("unsupported-image")).toBe(false)
  })
})

describe("toSourceInput", () => {
  it("앞뒤 공백을 트림하고 kind를 함께 판별", () => {
    expect(toSourceInput("  https://notion.so/x  ")).toEqual({ raw: "https://notion.so/x", kind: "link" })
    expect(toSourceInput("안녕 세상")).toEqual({ raw: "안녕 세상", kind: "text" })
  })
})
