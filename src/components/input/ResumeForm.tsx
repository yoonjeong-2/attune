import { useState, type ReactNode } from "react"
import { ChevronDown, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { emptyCareer, type CareerEntry, type ResumeForm as ResumeFormData } from "@/lib/resume"
import { cn } from "@/lib/utils"
import { MonthRangePicker } from "./MonthRangePicker"

/**
 * 내 서류 입력 — 통짜 텍스트 대신 필드 구조.
 * 필수: 경력(회사명·기간·직무·담당업무) + 스킬. 기간은 월 선택 UI(MonthRangePicker).
 * 보조(프로젝트·학력·자격)는 접어두고 필요시 펼침.
 */
export function ResumeForm({
  value,
  onChange,
}: {
  value: ResumeFormData
  onChange: (next: ResumeFormData) => void
}) {
  const [showMore, setShowMore] = useState(() =>
    Boolean(value.projects || value.education || value.certifications)
  )

  function updateCareer(index: number, patch: Partial<CareerEntry>) {
    onChange({
      ...value,
      careers: value.careers.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    })
  }

  return (
    <Card className="gap-5">
      <CardHeader>
        <CardTitle className="text-base">내 서류</CardTitle>
        <CardDescription>이력서·포트폴리오</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        {/* 경력 (필수) */}
        <section className="flex flex-col gap-3">
          <FieldTitle required>경력</FieldTitle>
          <div className="flex flex-col gap-3">
            {value.careers.map((career, i) => (
              <CareerCard
                key={i}
                index={i}
                career={career}
                removable={value.careers.length > 1}
                onPatch={(patch) => updateCareer(i, patch)}
                onRemove={() =>
                  onChange({ ...value, careers: value.careers.filter((_, idx) => idx !== i) })
                }
              />
            ))}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => onChange({ ...value, careers: [...value.careers, emptyCareer()] })}
          >
            <Plus />
            경력 추가
          </Button>
        </section>

        {/* 스킬 (필수) */}
        <section className="flex flex-col gap-2">
          <FieldTitle required htmlFor="resume-skills">
            스킬
          </FieldTitle>
          <Textarea
            id="resume-skills"
            value={value.skills}
            onChange={(e) => onChange({ ...value, skills: e.target.value })}
            placeholder="예: React, TypeScript, Spring Boot, MySQL, AWS …"
            className="min-h-20 resize-y"
          />
        </section>

        {/* 보조 필드 (접힘 · 필요시 펼침) */}
        <section className="border-t border-border pt-4">
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            aria-expanded={showMore}
            className="flex w-full items-center justify-between text-caption font-medium text-text-secondary transition-colors hover:text-foreground"
          >
            <span>선택 입력 · 프로젝트 · 학력 · 자격</span>
            <ChevronDown className={cn("size-4 transition-transform", showMore && "rotate-180")} />
          </button>

          {showMore && (
            <div className="mt-4 flex flex-col gap-4">
              <OptionalField
                id="resume-projects"
                label="프로젝트"
                placeholder="주요 프로젝트와 역할·성과를 적어주세요."
                value={value.projects}
                onChange={(v) => onChange({ ...value, projects: v })}
              />
              <OptionalField
                id="resume-education"
                label="학력"
                placeholder="예: OO대학교 컴퓨터공학과 (2016–2020)"
                value={value.education}
                onChange={(v) => onChange({ ...value, education: v })}
              />
              <OptionalField
                id="resume-cert"
                label="자격"
                placeholder="예: 정보처리기사, AWS SAA …"
                value={value.certifications}
                onChange={(v) => onChange({ ...value, certifications: v })}
              />
            </div>
          )}
        </section>
      </CardContent>
    </Card>
  )
}

/** 필수 표시가 붙는 섹션 제목 (경력 / 스킬) */
function FieldTitle({
  children,
  required,
  htmlFor,
}: {
  children: string
  required?: boolean
  htmlFor?: string
}) {
  return (
    <Label htmlFor={htmlFor} className="text-h3 font-semibold text-foreground">
      {children}
      {required && <span className="ml-1 text-primary">*</span>}
    </Label>
  )
}

/** 경력 한 건 — 회사명·기간(월 선택)·직무·담당업무 */
function CareerCard({
  index,
  career,
  removable,
  onPatch,
  onRemove,
}: {
  index: number
  career: CareerEntry
  removable: boolean
  onPatch: (patch: Partial<CareerEntry>) => void
  onRemove: () => void
}) {
  return (
    <div className="relative rounded-card border border-border bg-surface-subtle p-4">
      {removable && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="이 경력 삭제"
          className="absolute right-3 top-3 text-text-muted transition-colors hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
      <div className="flex flex-col gap-3">
        <Field label="회사명" htmlFor={`career-company-${index}`}>
          <Input
            id={`career-company-${index}`}
            value={career.company}
            onChange={(e) => onPatch({ company: e.target.value })}
            placeholder="예: 카카오"
          />
        </Field>

        <Field label="기간">
          <MonthRangePicker value={career.tenure} onChange={(tenure) => onPatch({ tenure })} />
        </Field>

        <Field label="직무" htmlFor={`career-role-${index}`}>
          <Input
            id={`career-role-${index}`}
            value={career.role}
            onChange={(e) => onPatch({ role: e.target.value })}
            placeholder="예: 백엔드 개발자"
          />
        </Field>

        <Field label="담당업무" htmlFor={`career-work-${index}`}>
          <Textarea
            id={`career-work-${index}`}
            value={career.work}
            onChange={(e) => onPatch({ work: e.target.value })}
            placeholder="맡은 업무와 성과를 적어주세요. 예: 주문 API 설계·개발, 응답속도 40% 개선"
            className="min-h-20 resize-y"
          />
        </Field>
      </div>
    </div>
  )
}

/** 라벨 + 입력 한 줄 */
function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor} className="text-caption text-text-secondary">
        {label}
      </Label>
      {children}
    </div>
  )
}

/** 보조 필드(프로젝트·학력·자격) — textarea 한 칸 */
function OptionalField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label} htmlFor={id}>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-16 resize-y"
      />
    </Field>
  )
}
