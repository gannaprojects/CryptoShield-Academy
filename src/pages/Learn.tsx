import { useId, useState } from 'react'
import { BackLink, Callout, Icon, Pill, ProgressBar } from '../components/ui'
import { lessons, type Lesson, type QuizQuestion } from '../data/lessons'
import { actions, useStore } from '../lib/store'

export default function Learn({ id }: { id?: string }) {
  const { progress } = useStore()
  const lesson = lessons.find((l) => l.id === id)
  if (lesson) return <LessonView key={lesson.id} lesson={lesson} done={progress.lessons.includes(lesson.id)} />

  const done = lessons.filter((l) => progress.lessons.includes(l.id)).length
  return (
    <div className="space-y-6">
      <header>
        <h1 className="h1">Learn</h1>
        <p className="muted mt-2 max-w-2xl">Eight short lessons. Each one has an example, a common misconception, and a quick knowledge check. Take them in order or jump to what you need.</p>
      </header>
      {id && <Callout tone="warning" title="That lesson was not found. Choose one from the list below." />}
      <div className="card">
        <ProgressBar value={done} max={lessons.length} label="Lessons completed" />
      </div>
      <ol className="grid gap-4 md:grid-cols-2">
        {lessons.map((l, i) => (
          <li key={l.id}>
            <a href={`#/learn/${l.id}`} className="card flex h-full items-start gap-4 no-underline hover:border-blue-300">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold text-slate-900">{l.title}</span>
                <span className="muted mt-1 block text-sm">{l.objective}</span>
                <span className="mt-3 flex flex-wrap gap-2">
                  <Pill>About {l.minutes} min</Pill>
                  {progress.lessons.includes(l.id) ? <Pill tone="green" icon="check">Completed</Pill> : <Pill>Not completed</Pill>}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}

function LessonView({ lesson, done }: { lesson: Lesson; done: boolean }) {
  const i = lessons.indexOf(lesson)
  const prev = lessons[i - 1]
  const next = lessons[i + 1]
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <BackLink href="#/learn">All lessons</BackLink>
      <header>
        <p className="muted text-sm font-semibold">
          Lesson {i + 1} of {lessons.length} · about {lesson.minutes} minutes
        </p>
        <h1 className="h1 mt-1">{lesson.title}</h1>
      </header>

      <Callout tone="info" title="Learning objective">
        <p>{lesson.objective}</p>
      </Callout>

      <section className="card space-y-3">
        <h2 className="h2">Explanation</h2>
        {lesson.explanation.map((p) => (
          <p key={p} className="leading-relaxed text-slate-700">{p}</p>
        ))}
      </section>

      <section className="card space-y-3">
        <h2 className="h2">Example: {lesson.example.title}</h2>
        {lesson.example.code && <pre className="code overflow-x-auto">{lesson.example.code}</pre>}
        <p className="text-slate-700">{lesson.example.text}</p>
      </section>

      <Callout tone="warning" title="Common misconception">
        <p><strong>Myth:</strong> {lesson.misconception.myth}</p>
        <p><strong>Reality:</strong> {lesson.misconception.reality}</p>
      </Callout>

      <Callout tone="teal" title={`Connection to Training: ${lesson.training.topic}`}>
        <p>{lesson.training.text}</p>
      </Callout>

      <section className="card space-y-5">
        <h2 className="h2">Knowledge check</h2>
        {lesson.quiz.map((q) => (
          <Quiz key={q.question} q={q} />
        ))}
      </section>

      <section className="card flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        {lesson.lab && (
          <a href={`#/lab/${lesson.lab.tab}`} className="btn">
            <Icon name="flask" className="h-4 w-4" /> {lesson.lab.label}
          </a>
        )}
        {lesson.link && (
          <a href={lesson.link.href} className="btn">
            <Icon name="doc" className="h-4 w-4" /> {lesson.link.label}
          </a>
        )}
        <button type="button" className="btn btn-primary" disabled={done} onClick={() => actions.completeLesson(lesson.id)}>
          <Icon name="check" className="h-4 w-4" /> {done ? 'Completed' : 'Mark as Completed'}
        </button>
        <span role="status" className="text-sm font-medium text-green-800">{done && 'Saved in this browser.'}</span>
      </section>

      <nav aria-label="Lesson navigation" className="flex flex-wrap justify-between gap-3">
        {prev ? <a href={`#/learn/${prev.id}`} className="btn"><Icon name="arrow" className="h-4 w-4 rotate-180" /> {prev.title}</a> : <span />}
        {next ? <a href={`#/learn/${next.id}`} className="btn">{next.title} <Icon name="arrow" className="h-4 w-4" /></a> : <a href="#/challenges" className="btn">Go to Challenges <Icon name="arrow" className="h-4 w-4" /></a>}
      </nav>
    </article>
  )
}

function Quiz({ q }: { q: QuizQuestion }) {
  const name = useId()
  const [picked, setPicked] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const correct = picked === q.answer
  return (
    <fieldset>
      <legend className="font-semibold">{q.question}</legend>
      <div className="mt-2 grid gap-2">
        {q.options.map((o, i) => (
          <label key={o} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 has-checked:border-blue-500 has-checked:bg-blue-50">
            <input type="radio" name={name} checked={picked === i} onChange={() => (setPicked(i), setChecked(false))} className="h-4 w-4 accent-blue-600" />
            {o}
          </label>
        ))}
      </div>
      <button type="button" className="btn mt-3" disabled={picked === null} onClick={() => setChecked(true)}>
        Check answer
      </button>
      <div role="status" className="mt-3">
        {checked && (
          <Callout tone={correct ? 'success' : 'warning'} title={correct ? 'Correct' : 'Not quite. Try another option'}>
            {correct && <p>{q.explanation}</p>}
          </Callout>
        )}
      </div>
    </fieldset>
  )
}
