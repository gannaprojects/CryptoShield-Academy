import { useState } from 'react'
import { BackLink, Callout, ConfirmDialog, Icon, Pill, TextField } from '../components/ui'
import { challenges, sampleReport } from '../data/challenges'
import { actions, isReportComplete, REPORT_FIELDS, SEVERITIES, useStore, type Report, type ReportDraft } from '../lib/store'

const EMPTY: ReportDraft = { title: '', component: '', summary: '', evidence: '', steps: '', impact: '', severity: '', justification: '', remediation: '', verification: '' }
const BODY_FIELDS = REPORT_FIELDS.filter((f) => f.key !== 'title' && f.key !== 'component')
const SECTIONS = BODY_FIELDS.map((f) => ({ ...f, label: f.key === 'steps' ? 'Reproduction steps' : f.label }))

export function toMarkdown(r: ReportDraft): string {
  return [
    `# ${r.title || 'Untitled report'}`,
    '',
    `- **Affected component:** ${r.component || 'Not provided'}`,
    `- **Severity:** ${r.severity || 'Not rated'}`,
    '',
    ...SECTIONS.flatMap((s) => [`## ${s.label}`, '', r[s.key] || '_Not provided._', '']),
  ].join('\n')
}

function download(r: ReportDraft) {
  const url = URL.createObjectURL(new Blob([toMarkdown(r)], { type: 'text/markdown' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: `${r.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'report'}.md` })
  a.click()
  URL.revokeObjectURL(url)
}

/** Readable report. User text is rendered as plain text by React, so any HTML typed into a field is shown, not executed. */
export function ReportView({ report: r }: { report: ReportDraft }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{r.title || 'Untitled report'}</h2>
      <dl className="grid gap-2 text-sm sm:grid-cols-[auto_1fr] sm:gap-x-4">
        <dt className="font-semibold">Affected component</dt>
        <dd>{r.component || 'Not provided'}</dd>
        <dt className="font-semibold">Severity</dt>
        <dd>{r.severity || 'Not rated'}</dd>
      </dl>
      {SECTIONS.map((s) => (
        <section key={s.key}>
          <h3 className="font-semibold">{s.label}</h3>
          <p className={`mt-1 text-sm whitespace-pre-wrap ${r[s.key] ? 'text-slate-700' : 'text-slate-500 italic'}`}>{r[s.key] || 'Not provided.'}</p>
        </section>
      ))}
    </div>
  )
}

export default function Reports({ mode, arg }: { mode?: string; arg?: string }) {
  const { reports } = useStore()
  const report = reports.find((r) => r.id === arg)
  if (mode === 'new') return <Editor key={`new-${arg}`} challengeId={arg} />
  if (mode === 'example') return <Viewer report={sampleReport} example />
  if (mode === 'edit' && report) return <Editor key={report.id} existing={report} />
  if (mode === 'view' && report) return <Viewer report={report} id={report.id} />
  return <List reports={reports} notFound={!!mode} />
}

function DeleteDialog({ report, onDone }: { report: Report | null; onDone: (deleted: boolean) => void }) {
  return (
    <ConfirmDialog
      open={!!report}
      title="Delete this report?"
      confirmLabel="Delete report"
      onCancel={() => onDone(false)}
      onConfirm={() => (actions.deleteReport(report!.id), onDone(true))}
    >
      <p>"{report?.title}" will be permanently removed from this browser. This cannot be undone.</p>
    </ConfirmDialog>
  )
}

function List({ reports, notFound }: { reports: Report[]; notFound: boolean }) {
  const [pending, setPending] = useState<Report | null>(null)
  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="h1">Reports</h1>
          <p className="muted mt-2 max-w-2xl">Write a short vulnerability report: what you found, the evidence, the impact, and the fix.</p>
        </div>
        <a href="#/reports/new" className="btn btn-primary shrink-0">
          <Icon name="doc" className="h-4 w-4" /> New report
        </a>
      </header>
      {notFound && <Callout tone="warning" title="That report was not found in this browser. It may have been deleted." />}
      <Callout tone="info" title="Drafts are saved in this browser on this device only.">
        <p>There is no account and nothing is uploaded. Clearing your browser data removes your drafts. Do not put real passwords, keys, or personal data in a report.</p>
      </Callout>

      <section aria-labelledby="my-reports" className="space-y-3">
        <h2 id="my-reports" className="h2">My reports</h2>
        {reports.length === 0 ? (
          <div className="card text-center">
            <p className="font-semibold">You have no saved reports yet.</p>
            <p className="muted mt-1 text-sm">Start a new report, or open one from a challenge with "Write a Finding" to have the scenario details filled in for you.</p>
          </div>
        ) : (
          <ul className="grid gap-4">
            {reports.map((r) => (
              <li key={r.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">{r.title}</p>
                  <p className="mt-2 flex flex-wrap gap-2">
                    <Pill tone="blue">Severity: {r.severity || 'not rated'}</Pill>
                    {isReportComplete(r) ? <Pill tone="green" icon="check">All fields filled in</Pill> : <Pill tone="amber">Draft: some fields empty</Pill>}
                    <Pill>Saved {new Date(r.updatedAt).toLocaleString()}</Pill>
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <a href={`#/reports/view/${r.id}`} className="btn">Preview</a>
                  <a href={`#/reports/edit/${r.id}`} className="btn">Edit</a>
                  <button type="button" className="btn" onClick={() => setPending(r)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="example" className="card flex flex-col gap-3 border-violet-200 bg-violet-50/40 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="example" className="h2">Example report</h2>
          <p className="muted mt-1 text-sm">A complete sample finding about a fictional application, to show the level of detail to aim for.</p>
        </div>
        <a href="#/reports/example" className="btn shrink-0">Read the example</a>
      </section>
      <DeleteDialog report={pending} onDone={() => setPending(null)} />
    </div>
  )
}

function Viewer({ report, id, example }: { report: ReportDraft; id?: string; example?: boolean }) {
  const [pending, setPending] = useState(false)
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink href="#/reports">All reports</BackLink>
      <h1 className="h1 print:hidden">{example ? 'Example report' : 'Report preview'}</h1>
      {example && (
        <div className="print:hidden">
          <Callout tone="lavender" title="This is an example. The application and all details are fictional." />
        </div>
      )}
      <div className="card">
        <ReportView report={report} />
      </div>
      <div className="flex flex-wrap gap-2 print:hidden">
        {id && <a href={`#/reports/edit/${id}`} className="btn">Edit</a>}
        <button type="button" className="btn" onClick={() => download(report)}>Download as Markdown</button>
        <button type="button" className="btn" onClick={() => print()}>Print or save as PDF</button>
        {id && <button type="button" className="btn" onClick={() => setPending(true)}>Delete</button>}
      </div>
      {id && <DeleteDialog report={pending ? { ...(report as Report), id } : null} onDone={(deleted) => (setPending(false), deleted && (location.hash = '#/reports'))} />}
    </div>
  )
}

function Editor({ existing, challengeId }: { existing?: Report; challengeId?: string }) {
  const challenge = challenges.find((c) => c.id === challengeId && c.finding)
  const [draft, setDraft] = useState<ReportDraft>(() => existing ?? { ...EMPTY, ...challenge?.finding, challengeId: challenge?.id })
  const [id, setId] = useState(existing?.id)
  const [saved, setSaved] = useState(false)
  const [titleError, setTitleError] = useState('')
  const [preview, setPreview] = useState(false)
  const set = (patch: Partial<ReportDraft>) => (setDraft({ ...draft, ...patch }), setSaved(false))
  const linked = challenges.find((c) => c.id === draft.challengeId)

  const save = () => {
    if (!draft.title.trim()) return setTitleError('Give the report a title so you can find it later.')
    setTitleError('')
    setId(actions.saveReport(draft, id))
    setSaved(true)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackLink href="#/reports">All reports</BackLink>
      <header>
        <h1 className="h1">{existing ? 'Edit report' : 'New report'}</h1>
        <p className="muted mt-2">Fill in what you can and save. You can come back and edit a draft at any time on this device.</p>
      </header>
      {linked && (
        <Callout tone="teal" title={`Linked to the challenge "${linked.title}"`}>
          <p>
            Some scenario details were filled in for you. <a className="link" href={`#/challenges/${linked.id}`}>Back to the challenge</a>
          </p>
        </Callout>
      )}

      <form className="card space-y-5" onSubmit={(e) => (e.preventDefault(), save())} noValidate>
        {REPORT_FIELDS.slice(0, 6).map((f) => (
          <TextField key={f.key} label={f.label} hint={f.hint} multiline={f.multiline} rows={4} value={draft[f.key]} onChange={(v) => set({ [f.key]: v })} error={f.key === 'title' ? titleError : undefined} />
        ))}
        <div>
          <label htmlFor="severity" className="label">Severity</label>
          <select id="severity" className="input max-w-xs" value={draft.severity} onChange={(e) => set({ severity: e.target.value as ReportDraft['severity'] })}>
            <option value="">Choose a severity</option>
            {SEVERITIES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        {REPORT_FIELDS.slice(6).map((f) => (
          <TextField key={f.key} label={f.label} hint={f.hint} multiline rows={4} value={draft[f.key]} onChange={(v) => set({ [f.key]: v })} />
        ))}

        <div className="rounded-xl border border-slate-200 p-4">
          <h2 className="font-semibold">Completeness checklist</h2>
          <p className="muted mt-1 text-sm">Shows which fields have content. It does not judge quality.</p>
          <ul className="mt-3 grid gap-1 text-sm sm:grid-cols-2">
            {[...REPORT_FIELDS.map((f) => ({ label: f.label, ok: draft[f.key].trim() !== '' })), { label: 'Severity', ok: draft.severity !== '' }].map((c) => (
              <li key={c.label} className="flex items-start gap-2">
                <Icon name={c.ok ? 'check' : 'x'} className={`mt-0.5 h-4 w-4 ${c.ok ? 'text-green-700' : 'text-slate-500'}`} />
                <span>{c.label}: {c.ok ? 'filled in' : 'empty'}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="submit" className="btn btn-primary">{id ? 'Save changes' : 'Save draft'}</button>
          <button type="button" className="btn" aria-expanded={preview} onClick={() => setPreview(!preview)}>{preview ? 'Hide preview' : 'Preview'}</button>
          {id && <a href={`#/reports/view/${id}`} className="btn">Open saved report (download or print)</a>}
        </div>
        <div role="status">
          {saved && <Callout tone="success" title="Saved in this browser." />}
        </div>
      </form>

      {preview && (
        <section aria-label="Report preview" className="card">
          <ReportView report={draft} />
        </section>
      )}
    </div>
  )
}
