import { cn } from "@/lib/utils"

/** 공고 핵심 요구 — 필수/우대. 색 없이 회색톤의 얕은 블록(그림자 없음). */
export function JobRequirements({
  mustHave,
  niceToHave,
}: {
  mustHave: string[]
  niceToHave: string[]
}) {
  return (
    <div className="grid gap-6 rounded-card bg-surface-subtle p-5 sm:grid-cols-2">
      <RequirementColumn title="필수" items={mustHave} strong />
      <RequirementColumn title="우대" items={niceToHave} />
    </div>
  )
}

function RequirementColumn({
  title,
  items,
  strong = false,
}: {
  title: string
  items: string[]
  strong?: boolean
}) {
  return (
    <div>
      <p className="mb-2.5 text-caption font-semibold text-text-secondary">{title}</p>
      {items.length === 0 ? (
        <p className="text-body text-text-muted">—</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, i) => (
            <li key={i} className="flex gap-2 text-body text-text-primary">
              <span
                className={cn(
                  "mt-[0.5rem] size-1.5 shrink-0 rounded-full",
                  strong ? "bg-text-secondary" : "bg-text-muted"
                )}
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
