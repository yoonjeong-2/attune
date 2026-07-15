/*
 * 아카이브 저장 스토어 (더미 · 세션 한정).
 * - 실제 DB 없이 모듈 상태로 보관 → 라우트 이동엔 유지되지만 새로고침하면 초기화(더미만 남음).
 * - 더미 카드(DUMMY_ARCHIVE)는 그대로 두고, 저장한 카드를 앞에 쌓는다.
 */
import { useSyncExternalStore } from "react"

import { DUMMY_ARCHIVE, type ArchiveRecord } from "@/lib/archive"

let saved: ArchiveRecord[] = []
// useSyncExternalStore는 참조 동일성으로 리렌더를 판단 → 스냅샷을 캐시하고 저장 시에만 새로 만든다.
let snapshot: ArchiveRecord[] = DUMMY_ARCHIVE
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return snapshot
}

/** 새 분석을 목록 맨 앞에 저장 */
export function addSavedRecord(rec: ArchiveRecord) {
  saved = [rec, ...saved]
  snapshot = [...saved, ...DUMMY_ARCHIVE]
  listeners.forEach((l) => l())
}

/** 저장 카드 id 생성 — 더미의 숫자 id("1"~)와 겹치지 않게 접두사 */
let seq = 0
export function nextSavedId() {
  seq += 1
  return `saved-${seq}`
}

/** 더미 + 세션 저장분을 합친 목록 (저장한 게 앞). 목록·상세 화면 공통 사용. */
export function useArchiveRecords() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
