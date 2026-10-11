import { useState } from 'react'
import { Callout, ConfirmDialog, Icon, Pill, ProgressBar, type IconName } from '../components/ui'
import { challenges } from '../data/challenges'
import { actions, summarize, useStore } from '../lib/store'
import { StatusPill } from './Challenges'

export default function Progress() {
  const store = useStore()
  const s = summarize(store)
  const [confirm, setConfirm] = useState(false)
  const [wasReset, setWasReset] = useState(false)
  const solved = (id: string) => store.progress.challenges[id] === 'solved'

  // Badges are computed from real progress every time; nothing is stored or awarded separately.
  const badges: { name: string; rule: string; earned: boolean; icon: IconName }[] = [
    { name: 'First Lesson', rule: 'Complete any lesson.', earned: s.lessonsDone > 0, icon: 'book' },
    { name: 'Classical Cipher Explorer', rule: 'Solve "Decode the Shift" and "Follow the Keyword".', earned: solved('decode-the-shift') && solved('follow-the-keyword'), icon: 'lock' },
    { name: 'Integrity Investigator', rule: 'Solve "Has the File Changed?" and "Detect the Tampered Message".', earned: solved('has-the-file-changed') && solved('detect-tampered-message'), icon: 'flag' },
    { name: 'First Report', rule: 'Save a report.', earned: s.reports > 0, icon: 'doc' },
  ]

  const stats = [
    { label: 'Lessons completed', value: `${s.lessonsDone} of 8` },
    { label: 'Challenges solved', value: `${s.solved} of 8` },
    { label: 'Challenges reviewed', value: String(s.reviewed) },
    { label: 'Points earned', value: `${s.points} of 80` },
    { label: 'Saved reports', value: String(s.reports) },
  ]

  return (
    <div className="space-y-6">
      <header>
        <h1 className="h1">My Progress</h1>
        <p className="muted mt-2 max-w-2xl">Your progress is stored in this browser on this device. It is not linked to an account and will not appear on other devices.</p>
      </header>

      {!s.started && !wasReset && (
        <Callout tone="info" title="Nothing here yet.">
          <p>Complete a lesson or try a challenge and your progress will appear on this page.</p>
        </Callout>
      )}
      <div role="status">{wasReset && <Callout tone="success" title="Lesson and challenge progress was reset. Your reports were not changed." />}</div>

      <section aria-label="Summary" className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((x) => (
          <div key={x.label} className="card p-4 sm:p-5">
            <p className="text-2xl font-bold text-blue-700">{x.value}</p>
            <p className="muted mt-1 text-sm">{x.label}</p>
          </div>
        ))}
      </section>

      <section className="card space-y-4">
        <ProgressBar value={s.lessonsDone} max={8} label="Lessons completed" />
        <ProgressBar value={s.solved} max={8} label="Challenges solved" />
        <p className="muted text-sm">"Reviewed" means you revealed the solution before solving. Reviewed challenges are counted separately and do not earn points.</p>
      </section>

      <section aria-labelledby="next" className="card flex flex-col gap-4 border-blue-200 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="next" className="h2">Recommended next step</h2>
          <p className="mt-1 text-sm">{s.next.label}</p>
        </div>
        <a href={s.next.href} className="btn btn-primary shrink-0">
          Continue <Icon name="arrow" className="h-4 w-4" />
        </a>
      </section>

      <section aria-labelledby="by-challenge" className="card space-y-3">
        <h2 id="by-challenge" className="h2">Challenges</h2>
        <ul className="divide-y divide-slate-200">
          {challenges.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 py-2">
              <a href={`#/challenges/${c.id}`} className="link text-sm">{c.title}</a>
              <StatusPill status={store.progress.challenges[c.id]} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="badges" className="space-y-3">
        <h2 id="badges" className="h2">Badges</h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {badges.map((b) => (
            <li key={b.name} className={`card flex flex-col gap-2 ${b.earned ? 'border-green-300' : 'opacity-80'}`}>
              <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${b.earned ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-500'}`}>
                <Icon name={b.icon} />
              </span>
              <p className="font-semibold">{b.name}</p>
              <p className="muted flex-1 text-sm">{b.rule}</p>
              {b.earned ? <span><Pill tone="green" icon="check">Earned</Pill></span> : <span><Pill>Not earned yet</Pill></span>}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="reset" className="card space-y-3">
        <h2 id="reset" className="h2">Reset progress</h2>
        <p className="muted text-sm">
          Clears completed lessons, challenge statuses, points, and the badges that depend on them. It does <strong>not</strong> delete your saved reports; delete those one by one on the <a href="#/reports" className="link">Reports page</a>.
        </p>
        <button type="button" className="btn" disabled={!s.lessonsDone && !Object.keys(store.progress.challenges).length} onClick={() => setConfirm(true)}>
          Reset lesson and challenge progress
        </button>
      </section>

      <ConfirmDialog
        open={confirm}
        title="Reset your progress?"
        confirmLabel="Reset progress"
        onCancel={() => setConfirm(false)}
        onConfirm={() => (actions.resetProgress(), setConfirm(false), setWasReset(true))}
      >
        <p>Completed lessons, challenge statuses, and points will be cleared in this browser. Your saved reports will be kept. This cannot be undone.</p>
      </ConfirmDialog>
    </div>
  )
}
