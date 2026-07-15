import { describe, expect, it } from "vitest"

import { pickMockCase, pickMockDomain } from "./mocks"

describe("pickMockDomain", () => {
  it("'기획'/'PM'은 기획, '개발'은 개발, 그 외는 fallback", () => {
    expect(pickMockDomain("기획 높음", "개발")).toBe("기획")
    expect(pickMockDomain("PM 지원자", "개발")).toBe("기획")
    expect(pickMockDomain("백엔드 개발 2년", "기획")).toBe("개발")
    expect(pickMockDomain("아무 관련 없는 텍스트", "개발")).toBe("개발")
  })
})

describe("pickMockCase", () => {
  it("'높음'/'보통'/'낮음' 키워드로 케이스 선택, 그 외는 fallback", () => {
    expect(pickMockCase("기획 높음", "보통")).toBe("높음")
    expect(pickMockCase("낮음 케이스", "높음")).toBe("낮음")
    expect(pickMockCase("보통 정도", "높음")).toBe("보통")
    expect(pickMockCase("키워드 없음", "보통")).toBe("보통")
  })
})
