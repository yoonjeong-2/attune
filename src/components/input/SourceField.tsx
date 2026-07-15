import { Link2, TriangleAlert } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { detectInput } from "@/lib/input"
import { cn } from "@/lib/utils"

interface SourceFieldProps {
  /** textarea id (label 연결용) */
  id: string
  /** 카드 제목 — 예: "내 서류" */
  title: string
  /** 제목 아래 보조 설명 */
  description: string
  /** textarea placeholder (§6의 안내 문구) */
  placeholder: string
  /** 이미지 등 미지원 형식일 때 보여줄 fallback 안내 (§6) */
  fallback: string
  value: string
  onChange: (value: string) => void
}

/**
 * 화면 1의 입력 한 칸 (내 서류 / 채용공고 공용).
 * 하나의 textarea 로 텍스트·링크를 모두 받고(§6), 무엇으로 인식했는지 즉시 피드백한다.
 */
export function SourceField({
  id,
  title,
  description,
  placeholder,
  fallback,
  value,
  onChange,
}: SourceFieldProps) {
  const kind = detectInput(value)
  const isUnsupported = kind === "unsupported-image"

  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Label htmlFor={id} className="sr-only">
          {title}
        </Label>
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={isUnsupported}
          className={cn(
            "min-h-48 resize-y leading-relaxed",
            isUnsupported &&
              "border-warning ring-2 ring-warning/25 focus-visible:ring-warning/40"
          )}
        />

        {/* 인식 결과 피드백 */}
        {kind === "link" && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link2 className="size-3.5" />
            링크로 인식했어요. 분석할 때 내용을 불러옵니다.
          </p>
        )}

        {kind === "unsupported-image" && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-xs leading-relaxed text-foreground"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
            <span>{fallback}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
