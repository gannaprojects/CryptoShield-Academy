import { useState } from 'react'
import { BackLink, Callout, CopyButton, Icon, Pill, TextField } from '../components/ui'
import { challenges, sampleReport, type Challenge, type Question } from '../data/challenges'
import { actions, isReportComplete, POINTS_PER_CHALLENGE, summarize, useStore, type ChallengeStatus } from '../lib/store'
import { ReportView } from './Reports'

export function StatusPill({ status }: { status?: ChallengeStatus }) {
  if (status === 'solved') return <Pill tone="green" icon="check">Solved</Pill>
  if (status === 'reviewed') return <Pill tone="violet" icon="book">Reviewed</Pill>
  if (status === 'in-progress') return <Pill tone="amber" icon="flag">In Progress</Pill>
  return <Pill>Not Started</Pill>
}

export default function Challenges({ id }: { id?: string }) {
  const store = useStore()
  const status = (c: Challenge) => store.progress.challenges[c.id]
  const challenge = challenges.find((c) => c.id === id)
  if (challenge) {
    return challenge.selfReview ? <ReportChallenge key={challenge.id} c={challenge} status={status(challenge)} /> : <ChallengeView key={challenge.id} c={challenge} status={status(challenge)} />
  }

  const s = summarize(store)
  return (
    <div className="space-y-6">
      <header>
        <h1 className="h1">Challenges</h1>
        <p className="muted mt-2 max-w-2xl">Eight guided challenges using fictional data. Nothing here requires testing a real website.</p>
      </header>
      {id && <Callout tone="warning" title="That challenge was not found. Choose one from the list below." />}
      <Callout tone="info" title={`Score: ${s.points} of ${challenges.length * POINTS_PER_CHALLENGE} points`}>
        <p>
          Each challenge gives {POINTS_PER_CHALLENGE} points once, when you solve it. Hints are free. If you reveal a solution before solving, the challenge is marked "Reviewed" and gives no points. Scores are for self-study only.
        </p>
      </Callout>
      <ol className="grid gap-4 md:grid-cols-2">
        {challenges.map((c, i) => (
          <li key={c.id}>
            <a href={`#/challenges/${c.id}`} className="card flex h-full flex-col gap-3 no-underline hover:border-blue-300">
              <span className="flex items-start justify-between gap-3">
                <span className="font-semibold text-slate-900">{i + 1}. {c.title}</span>
                <StatusPill status={status(c)} />
              </span>
              <span className="muted flex-1 text-sm">{c.objective}</span>
              <span className="flex flex-wrap gap-2">
                <Pill tone="blue">{c.difficulty}</Pill>
                <Pill>About {c.minutes} min</Pill>
                <Pill>{c.topic}</Pill>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Header({ c, status }: { c: Challenge; status?: ChallengeStatus }) {
  return (
    <>
      <BackLink href="#/challenges">All challenges</BackLink>
      <header className="space-y-3">
        <h1 className="h1">{c.title}</h1>
        <div className="flex flex-wrap gap-2">
          <StatusPill status={status} />
          <Pill tone="blue">Difficulty: {c.difficulty}</Pill>
          <Pill>About {c.minutes} min</Pill>
          <Pill>Training topic: {c.topic}</Pill>
        </div>
      </header>
      <Callout tone="info" title="Learning objective">
        <p>{c.objective}</p>
      </Callout>
      <section className="card space-y-4">
        <h2 className="h2">Scenario</h2>
        {c.scenario.map((p) => <p key={p} className="text-slate-700">{p}</p>)}
        {c.data.length > 0 && (
          <dl className="space-y-3">
            {c.data.map((d) => (
              <div key={d.label}>
                <dt className="label">{d.label} <span className="font-normal text-slate-500">(fictional)</span></dt>
                {/* Supplied data is rendered as inert text, never as markup or script. */}
                <dd className={d.code ? 'space-y-2' : 'text-sm text-slate-700'}>
                  {d.code ? <><pre className="code overflow-x-auto">{d.value}</pre><CopyButton text={d.value} /></> : d.value}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {c.lab && (
          <a href={`#/lab/${c.lab.tab}`} className="btn">
            <Icon name="flask" className="h-4 w-4" /> {c.lab.label}
          </a>
        )}
      </section>
    </>
  )
}

function Hints({ c }: { c: Challenge }) {
  const [shown, setShown] = useState(0)
  return (
    <section className="card space-y-3">
      <h2 className="h2">Hints</h2>
      <p className="muted text-sm">Hints do not reduce your points.</p>
      <div role="status" className="space-y-3">
        {c.hints.slice(0, shown).map((h, i) => (
          <Callout key={h} tone="lavender" title={`Hint ${i + 1}`}><p>{h}</p></Callout>
        ))}
      </div>
      {shown < c.hints.length && (
        <button type="button" className="btn" onClick={() => (setShown(shown + 1), actions.setChallenge(c.id, 'in-progress'))}>
          Show hint {shown + 1} of {c.hints.length}
        </button>
      )}
    </section>
  )
}

const normalize = (v: string) => v.trim().replace(/\s+/g, ' ').toUpperCase()
const isCorrect = (q: Question, v: string) => (q.type === 'choice' ? v === String(q.answer) : q.answers.some((a) => normalize(a) === normalize(v)))

function ChallengeView({ c, status }: { c: Challenge; status?: ChallengeStatus }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Record<string, boolean> | null>(null)
  const [incomplete, setIncomplete] = useState(false)
  const set = (id: string, v: string) => (setValues({ ...values, [id]: v }), setResults(null))

  const check = () => {
    const missing = c.questions.some((q) => !(values[q.id] ?? '').trim())
    setIncomplete(missing)
    if (missing) return setResults(null)
    const r = Object.fromEntries(c.questions.map((q) => [q.id, isCorrect(q, values[q.id])]))
    setResults(r)
    actions.setChallenge(c.id, Object.values(r).every(Boolean) ? 'solved' : 'in-progress')
  }
  const right = results ? Object.values(results).filter(Boolean).length : 0
  const allRight = results !== null && right === c.questions.length
  const finished = status === 'solved' || status === 'reviewed'

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Header c={c} status={status} />

      <form className="card space-y-5" onSubmit={(e) => (e.preventDefault(), check())} noValidate>
        <h2 className="h2">Your answers</h2>
        {c.questions.map((q) => (
          <div key={q.id} className="space-y-2">
            {q.type === 'choice' ? (
              <fieldset>
                <legend className="label">{q.label}</legend>
                <div className="grid gap-2">
                  {q.options.map((o, i) => (
                    <label key={o} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 has-checked:border-blue-500 has-checked:bg-blue-50">
                      <input type="radio" name={`${c.id}-${q.id}`} checked={values[q.id] === String(i)} onChange={() => set(q.id, String(i))} className="h-4 w-4 accent-blue-600" />
                      {o}
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <TextField label={q.label} value={values[q.id] ?? ''} onChange={(v) => set(q.id, v)} hint={q.hint ?? (q.type === 'text' ? 'Upper and lower case are treated the same.' : undefined)} inputMode={q.type === 'number' ? 'numeric' : 'text'} autoComplete="off" />
            )}
            {results && (
              <p className={`flex items-start gap-2 text-sm font-medium ${results[q.id] ? 'text-green-800' : 'text-red-700'}`}>
                <Icon name={results[q.id] ? 'check' : 'x'} className="mt-0.5 h-4 w-4" />
                <span>{results[q.id] ? `Correct. ${q.explanation}` : 'Not correct yet. Check this answer and try again.'}</span>
              </p>
            )}
          </div>
        ))}
        <button type="submit" className="btn btn-primary">Check answers</button>
        <div role="status">
          {incomplete && <Callout tone="warning" title="Please answer every question before checking." />}
          {results && !allRight && <Callout tone="warning" title={`${right} of ${c.questions.length} correct. Your answers are still here: adjust them and check again.`} />}
          {allRight && status === 'solved' && <Callout tone="success" title={`Solved! ${POINTS_PER_CHALLENGE} points. Points are awarded once per challenge.`} />}
          {allRight && status === 'reviewed' && (
            <Callout tone="info" title="All correct.">
              <p>This challenge stays marked "Reviewed" because the solution was revealed before it was solved, so no points are added.</p>
            </Callout>
          )}
        </div>
      </form>

      <Hints c={c} />

      <section className="card space-y-3">
        <h2 className="h2">Solution</h2>
        {finished ? (
          c.solution.map((p) => <p key={p} className="text-slate-700">{p}</p>)
        ) : (
          <>
            <p className="muted text-sm">Revealing the solution marks this challenge as "Reviewed" instead of "Solved", and it will not earn points.</p>
            <button type="button" className="btn" onClick={() => actions.setChallenge(c.id, 'reviewed')}>Reveal solution</button>
          </>
        )}
      </section>

      <NextSteps c={c} />
    </article>
  )
}

function NextSteps({ c }: { c: Challenge }) {
  const next = challenges[challenges.findIndex((x) => x.id === c.id) + 1]
  return (
    <section className="card flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {c.finding && (
        <a href={`#/reports/new/${c.id}`} className="btn btn-primary" onClick={() => actions.setChallenge(c.id, 'in-progress')}>
          <Icon name="doc" className="h-4 w-4" /> Write a Finding
        </a>
      )}
      {next ? (
        <a href={`#/challenges/${next.id}`} className="btn">Next: {next.title} <Icon name="arrow" className="h-4 w-4" /></a>
      ) : (
        <a href="#/progress" className="btn">View My Progress <Icon name="arrow" className="h-4 w-4" /></a>
      )}
    </section>
  )
}

/** The reporting challenge has no auto-graded answer: credit comes from a visible checklist plus self-review. */
function ReportChallenge({ c, status }: { c: Challenge; status?: ChallengeStatus }) {
  const { reports } = useStore()
  const linked = reports.filter((r) => r.challengeId === c.id)
  const complete = linked.some(isReportComplete)
  const [checks, setChecks] = useState(() => c.selfReview!.map(() => false))
  const ready = complete && checks.every(Boolean)

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <Header c={c} status={status} />

      <section className="card space-y-3">
        <h2 className="h2">Step 1: Write your finding</h2>
        <p className="muted text-sm">The report form opens with the scenario details filled in. Save it, then come back here.</p>
        <a href={`#/reports/new/${c.id}`} className="btn btn-primary" onClick={() => actions.setChallenge(c.id, 'in-progress')}>
          <Icon name="doc" className="h-4 w-4" /> Write a Finding
        </a>
        {linked.length > 0 && (
          <ul className="space-y-1 text-sm">
            {linked.map((r) => (
              <li key={r.id}>
                <a className="link" href={`#/reports/edit/${r.id}`}>Edit "{r.title}"</a> {isReportComplete(r) ? '(all fields filled in)' : '(some fields are still empty)'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <Hints c={c} />

      <section className="card space-y-4">
        <h2 className="h2">Step 2: Completion checklist</h2>
        <p className="muted text-sm">
          This site cannot judge the quality of free text, and does not pretend to. You earn the {POINTS_PER_CHALLENGE} points when every item below is ticked. The first item is checked automatically; the rest are your own honest self-review against the sample report.
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-3 rounded-xl border border-slate-200 px-3 py-2">
            <Icon name={complete ? 'check' : 'x'} className={`mt-0.5 h-4 w-4 ${complete ? 'text-green-700' : 'text-slate-500'}`} />
            <span>
              <strong>{complete ? 'Done: ' : 'Not yet: '}</strong>I saved a report for this challenge with every field filled in, including a severity.
            </span>
          </li>
          {c.selfReview!.map((item, i) => (
            <li key={item}>
              <label className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50 has-checked:border-blue-500 has-checked:bg-blue-50">
                <input type="checkbox" checked={checks[i]} onChange={(e) => setChecks(checks.map((v, j) => (j === i ? e.target.checked : v)))} className="mt-0.5 h-4 w-4 accent-blue-600" />
                {item}
              </label>
            </li>
          ))}
        </ul>
        <details className="rounded-xl border border-slate-200 p-4">
          <summary className="cursor-pointer font-semibold">Show the sample report for self-review</summary>
          <p className="muted my-3 text-sm">This is one reasonable answer, not the only one. A different severity can be correct if your justification supports it.</p>
          <ReportView report={sampleReport} />
        </details>
        <button type="button" className="btn btn-primary" disabled={!ready || status === 'solved'} onClick={() => actions.setChallenge(c.id, 'solved')}>
          {status === 'solved' ? 'Completion credit claimed' : 'Claim completion credit'}
        </button>
        <div role="status">
          {status === 'solved' && <Callout tone="success" title={`Completed! ${POINTS_PER_CHALLENGE} points. Points are awarded once per challenge.`} />}
        </div>
      </section>

      <NextSteps c={{ ...c, finding: undefined }} />
    </article>
  )
}
