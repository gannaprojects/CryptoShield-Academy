// Local-only persistence for progress and report drafts. Lab inputs, keys and plaintext never come through here.
import { useSyncExternalStore } from 'react'
import { challenges } from '../data/challenges'
import { lessons } from '../data/lessons'
import { randomId } from './crypto'

export type ChallengeStatus = 'in-progress' | 'solved' | 'reviewed'
export const SEVERITIES = ['Informational', 'Low', 'Medium', 'High', 'Critical'] as const

export interface Progress {
  lessons: string[]
  challenges: Record<string, ChallengeStatus>
}

export const REPORT_FIELDS = [
  { key: 'title', label: 'Report title', hint: 'A short name for the problem, e.g. "Sensitive notes stored in plaintext".', multiline: false },
  { key: 'component', label: 'Affected component', hint: 'Which part of the application is affected?', multiline: false },
  { key: 'summary', label: 'Summary', hint: 'Two or three sentences: what is wrong and why it matters.', multiline: true },
  { key: 'evidence', label: 'Evidence', hint: 'What did you observe that shows the problem exists?', multiline: true },
  { key: 'steps', label: 'Reproduction steps within the provided lab', hint: 'Numbered steps another person could follow in this lab.', multiline: true },
  { key: 'impact', label: 'Security impact', hint: 'What could go wrong, for whom, and under which conditions?', multiline: true },
  { key: 'justification', label: 'Severity justification', hint: 'Explain the rating using exposure conditions, not just the missing control.', multiline: true },
  { key: 'remediation', label: 'Recommended remediation', hint: 'A specific fix the developers can act on.', multiline: true },
  { key: 'verification', label: 'Verification steps after remediation', hint: 'How would you confirm the fix works?', multiline: true },
] as const

export type ReportTextKey = (typeof REPORT_FIELDS)[number]['key']
export type ReportDraft = Record<ReportTextKey, string> & { severity: (typeof SEVERITIES)[number] | ''; challengeId?: string }
export type Report = ReportDraft & { id: string; updatedAt: string }

export const isReportComplete = (r: ReportDraft) => r.severity !== '' && REPORT_FIELDS.every((f) => r[f.key].trim() !== '')

const PROGRESS_KEY = 'cryptoshield.progress.v1'
const REPORTS_KEY = 'cryptoshield.reports.v1'

function load<T>(key: string, isValid: (v: unknown) => boolean, fallback: T): T {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? 'null')
    return isValid(v) ? (v as T) : fallback
  } catch {
    return fallback // storage blocked or corrupted: start fresh rather than crash
  }
}

const emptyProgress = (): Progress => ({ lessons: [], challenges: {} })

let state = {
  progress: load<Progress>(
    PROGRESS_KEY,
    (v) => !!v && Array.isArray((v as Progress).lessons) && typeof (v as Progress).challenges === 'object',
    emptyProgress(),
  ),
  reports: load<Report[]>(REPORTS_KEY, Array.isArray, []),
}
const listeners = new Set<() => void>()

function update(next: Partial<typeof state>) {
  state = { ...state, ...next }
  try {
    if (next.progress) localStorage.setItem(PROGRESS_KEY, JSON.stringify(state.progress))
    if (next.reports) localStorage.setItem(REPORTS_KEY, JSON.stringify(state.reports))
  } catch {
    // storage unavailable: progress still works for this page session
  }
  listeners.forEach((l) => l())
}

export const useStore = () =>
  useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  )

export const actions = {
  completeLesson(id: string) {
    if (!state.progress.lessons.includes(id)) update({ progress: { ...state.progress, lessons: [...state.progress.lessons, id] } })
  },
  /** Solved and Reviewed are final until progress is reset, so points can never be earned twice or after a reveal. */
  setChallenge(id: string, status: ChallengeStatus) {
    const current = state.progress.challenges[id]
    if (current === 'solved' || current === 'reviewed' || current === status) return
    update({ progress: { ...state.progress, challenges: { ...state.progress.challenges, [id]: status } } })
  },
  saveReport(draft: ReportDraft, id?: string): string {
    const report: Report = { ...draft, id: id ?? randomId(), updatedAt: new Date().toISOString() }
    update({ reports: id ? state.reports.map((r) => (r.id === id ? report : r)) : [report, ...state.reports] })
    return report.id
  },
  deleteReport(id: string) {
    update({ reports: state.reports.filter((r) => r.id !== id) })
  },
  /** Clears lessons and challenges only. Reports are deleted separately. */
  resetProgress() {
    update({ progress: emptyProgress() })
  },
}

export const POINTS_PER_CHALLENGE = 10

export function summarize({ progress, reports }: typeof state) {
  const statuses = challenges.map((c) => progress.challenges[c.id])
  const solved = statuses.filter((s) => s === 'solved').length
  const lessonsDone = lessons.filter((l) => progress.lessons.includes(l.id)).length
  const nextLesson = lessons.find((l) => !progress.lessons.includes(l.id))
  const nextChallenge = challenges.find((c) => !['solved', 'reviewed'].includes(progress.challenges[c.id]))
  const next = nextLesson
    ? { label: `Lesson: ${nextLesson.title}`, href: `#/learn/${nextLesson.id}` }
    : nextChallenge
      ? { label: `Challenge: ${nextChallenge.title}`, href: `#/challenges/${nextChallenge.id}` }
      : reports.length === 0
        ? { label: 'Write your first report', href: '#/reports/new' }
        : { label: 'Everything is complete. Revisit the Crypto Lab to keep experimenting', href: '#/lab' }
  return {
    lessonsDone,
    solved,
    reviewed: statuses.filter((s) => s === 'reviewed').length,
    points: solved * POINTS_PER_CHALLENGE,
    reports: reports.length,
    started: lessonsDone > 0 || statuses.some(Boolean) || reports.length > 0,
    next,
  }
}
