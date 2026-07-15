import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/*
 * 커스텀 타입 스케일(text-display/h1/h2/h3/body/caption/badge)을 tailwind-merge에 등록.
 * 안 하면 twMerge가 이들을 text-<color>로 오인해 text-warning 등과 충돌시켜 크기 클래스를 삭제함.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["display", "h1", "h2", "h3", "body", "caption", "badge"] }],
    },
  },
})

/** Tailwind 클래스 병합 헬퍼 (shadcn/ui 표준) */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
