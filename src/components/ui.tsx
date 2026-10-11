import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

const paths = {
  check: 'M5 13l4 4L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 6h16M4 12h16M4 18h16',
  info: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8h.01M11 12h1v4h1',
  warning: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z',
  book: 'M4 19V5a2 2 0 012-2h13v14H6a2 2 0 00-2 2zm0 0a2 2 0 002 2h13',
  flask: 'M9 3h6M10 3v6l-5 9a2 2 0 002 3h10a2 2 0 002-3l-5-9V3',
  flag: 'M5 21V4h11l-2 4 2 4H5',
  doc: 'M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6',
  chart: 'M4 20V10m6 10V4m6 16v-7m5 7H2',
  copy: 'M9 9h11v11H9zM5 15H4V4h11v1',
  arrow: 'M5 12h14m-6-6l6 6-6 6',
  lock: 'M6 11h12v9H6zM8 11V7a4 4 0 018 0v4',
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z',
}
export type IconName = keyof typeof paths

export function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      <path d={paths[name]} />
    </svg>
  )
}

/** Shield-and-key logo. */
export function Logo({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`shrink-0 ${className}`}>
      <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" fill="#2563EB" />
      <g fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
        <circle cx="12" cy="9" r="2.3" />
        <path d="M12 11.3V17m0-2h2.2" />
      </g>
    </svg>
  )
}

const tones = {
  info: { box: 'border-blue-200 bg-blue-50 text-blue-950', icon: 'info' },
  success: { box: 'border-green-300 bg-green-50 text-green-900', icon: 'check' },
  warning: { box: 'border-amber-300 bg-amber-50 text-amber-950', icon: 'warning' },
  error: { box: 'border-red-300 bg-red-50 text-red-900', icon: 'x' },
  teal: { box: 'border-teal-200 bg-teal-50 text-teal-950', icon: 'flag' },
  lavender: { box: 'border-violet-200 bg-violet-50 text-violet-950', icon: 'info' },
} as const

/** A labelled message box. Always pairs colour with an icon and a text title. Errors are announced immediately. */
export function Callout({ tone = 'info', title, children, live }: { tone?: keyof typeof tones; title: string; children?: ReactNode; live?: boolean }) {
  const t = tones[tone]
  return (
    <div role={tone === 'error' ? 'alert' : live ? 'status' : undefined} className={`flex gap-3 rounded-xl border p-4 text-sm ${t.box}`}>
      <Icon name={t.icon} className="mt-0.5 h-5 w-5" />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">{title}</p>
        {children}
      </div>
    </div>
  )
}

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle')
  useEffect(() => {
    if (state === 'idle') return
    const t = setTimeout(() => setState('idle'), 2000)
    return () => clearTimeout(t)
  }, [state])
  const copy = () =>
    navigator.clipboard.writeText(text).then(
      () => setState('copied'),
      () => setState('failed'),
    )
  return (
    <button type="button" className="btn" onClick={copy}>
      <Icon name={state === 'copied' ? 'check' : 'copy'} className="h-4 w-4" />
      <span aria-live="polite">{state === 'copied' ? 'Copied' : state === 'failed' ? 'Copy failed. Select the text instead' : label}</span>
    </button>
  )
}

/** Read-only result box that wraps long values and can be copied. Changes are announced to screen readers. */
export function Output({ label, value, placeholder = 'The result will appear here.' }: { label: string; value: string; placeholder?: string }) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <p className="label mb-0">{label}</p>
        {value && <CopyButton text={value} />}
      </div>
      <div role="status" className={`code max-h-72 min-h-12 overflow-auto ${value ? '' : 'text-slate-500'}`}>
        {value || placeholder}
      </div>
    </div>
  )
}

export function TextField({
  label,
  value,
  onChange,
  hint,
  error,
  multiline,
  mono,
  ...rest
}: {
  label: string
  value: string
  onChange: (v: string) => void
  hint?: string
  error?: string
  multiline?: boolean
  mono?: boolean
  type?: string
  placeholder?: string
  rows?: number
  inputMode?: 'numeric' | 'text'
  autoComplete?: string
}) {
  const id = useId()
  const props = {
    id,
    value,
    className: `input ${mono ? 'font-mono text-sm' : ''} ${error ? 'border-red-600' : ''}`,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': hint || error ? `${id}-help` : undefined,
    spellCheck: false,
    ...rest,
  }
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
      </label>
      {multiline ? <textarea rows={3} {...props} onChange={(e) => onChange(e.target.value)} /> : <input {...props} onChange={(e) => onChange(e.target.value)} />}
      {(hint || error) && (
        <p id={`${id}-help`} className={error ? 'mt-1 text-sm font-medium text-red-700' : 'hint'}>
          {error ? `Error: ${error}` : hint}
        </p>
      )}
    </div>
  )
}

/** Modal confirmation built on the native <dialog>, which handles focus trapping and Escape. */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const id = useId()
  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])
  return (
    <dialog ref={ref} aria-labelledby={id} onClose={onCancel} className="m-auto w-[min(92vw,28rem)] rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-xl backdrop:bg-slate-900/40">
      <h2 id={id} className="h2">
        {title}
      </h2>
      <div className="muted mt-2 text-sm">{children}</div>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button type="button" className="btn" autoFocus onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </dialog>
  )
}

/** Accessible tab list: arrow keys, Home and End move between tabs; only the active tab is in the tab order. */
export function Tabs({ label, tabs, active, onChange }: { label: string; tabs: { id: string; label: string }[]; active: string; onChange: (id: string) => void }) {
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === active)
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key]
    if (next === undefined) return
    e.preventDefault()
    const tab = tabs[(next + tabs.length) % tabs.length]
    onChange(tab.id)
    document.getElementById(`tab-${tab.id}`)?.focus()
  }
  return (
    <div role="tablist" aria-label={label} onKeyDown={onKeyDown} className="flex gap-2 overflow-x-auto p-1">
      {tabs.map((t) => (
        <button
          key={t.id}
          id={`tab-${t.id}`}
          role="tab"
          type="button"
          aria-selected={t.id === active}
          aria-controls={`panel-${t.id}`}
          tabIndex={t.id === active ? 0 : -1}
          onClick={() => onChange(t.id)}
          className={`min-h-11 shrink-0 cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold ${
            t.id === active ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function ProgressBar({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="muted">
          {value} of {max}
        </span>
      </div>
      <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className="h-2.5 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  )
}

export function Pill({ tone = 'slate', icon, children }: { tone?: 'slate' | 'green' | 'amber' | 'blue' | 'violet'; icon?: IconName; children: ReactNode }) {
  const c = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-green-100 text-green-900',
    amber: 'bg-amber-100 text-amber-900',
    blue: 'bg-blue-100 text-blue-900',
    violet: 'bg-violet-100 text-violet-900',
  }[tone]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${c}`}>
      {icon && <Icon name={icon} className="h-3.5 w-3.5" />}
      {children}
    </span>
  )
}

export const BackLink = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} className="link inline-flex items-center gap-1 text-sm print:hidden">
    <Icon name="arrow" className="h-4 w-4 rotate-180" />
    {children}
  </a>
)
