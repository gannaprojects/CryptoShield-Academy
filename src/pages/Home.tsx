import { Icon, Logo, type IconName } from '../components/ui'
import { summarize, useStore } from '../lib/store'

const FEATURES: { icon: IconName; title: string; text: string; href: string; cta: string; tint: string }[] = [
  { icon: 'book', title: 'Learn the Concepts', text: 'Eight short lessons explain encryption, hashing, encoding, passwords, keys, and reporting in plain language.', href: '#/learn', cta: 'Browse lessons', tint: 'bg-blue-50 text-blue-700' },
  { icon: 'flask', title: 'Practice in Interactive Labs', text: 'Run Caesar, Vigenère, AES-GCM, SHA-256, and Base64 in your browser and see each step.', href: '#/lab', cta: 'Open the lab', tint: 'bg-teal-50 text-teal-700' },
  { icon: 'flag', title: 'Solve Challenges and Write Reports', text: 'Spot insecure practices in fictional applications, then explain the evidence, impact, and fix.', href: '#/challenges', cta: 'See challenges', tint: 'bg-violet-50 text-violet-700' },
]

const PATH = [
  { label: 'Fundamentals', href: '#/learn/basics' },
  { label: 'Classical Ciphers', href: '#/learn/caesar' },
  { label: 'Modern Protection', href: '#/learn/aes-gcm' },
  { label: 'Security Challenges', href: '#/challenges' },
  { label: 'Reporting', href: '#/reports' },
]

const TRAINING = ['Vulnerability Assessment', 'Risk Identification', 'Application Security', 'Authentication and Authorization', 'Sensitive Data Protection', 'Cloud Security and Least Privilege', 'Log Analysis', 'Security Reporting', 'Security Awareness']

export default function Home() {
  const s = summarize(useStore())
  return (
    <div className="space-y-10">
      <section className="card grid items-center gap-8 bg-gradient-to-br from-white via-white to-blue-50 sm:p-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-blue-700">
            <Logo className="h-6 w-6" /> CryptoShield Academy
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Learn Cryptography. Discover Weaknesses. Explain the Fix.</h1>
          <p className="muted mt-4 max-w-2xl text-lg">
            Cryptography protects sensitive data, but only when it is chosen and used correctly. Here you learn the core ideas, try them in a lab, and practise finding and reporting the mistakes that make web applications insecure.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#/learn" className="btn btn-primary">
              <Icon name="book" className="h-4 w-4" /> Start Learning
            </a>
            <a href="#/lab" className="btn">
              <Icon name="flask" className="h-4 w-4" /> Try the Crypto Lab
            </a>
          </div>
          <p className="muted mt-4 text-sm">No account needed. Your progress is saved in this browser on this device.</p>
        </div>
        <Logo className="hidden h-40 w-40 md:block" />
      </section>

      {s.started && (
        <section aria-labelledby="continue" className="card flex flex-col gap-4 border-blue-200 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="continue" className="h2">Continue Learning</h2>
            <p className="muted mt-1 text-sm">
              {s.lessonsDone} of 8 lessons completed · {s.solved} of 8 challenges solved · {s.points} of 80 points
            </p>
            <p className="mt-1 text-sm">Next: {s.next.label}</p>
          </div>
          <a href={s.next.href} className="btn btn-primary shrink-0">
            Continue <Icon name="arrow" className="h-4 w-4" />
          </a>
        </section>
      )}

      <section aria-label="What you can do" className="grid gap-5 md:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card flex flex-col">
            <span className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.tint}`}>
              <Icon name={f.icon} />
            </span>
            <h2 className="h2">{f.title}</h2>
            <p className="muted mt-2 flex-1 text-sm">{f.text}</p>
            <a href={f.href} className="link mt-4 inline-flex items-center gap-1 text-sm">
              {f.cta} <Icon name="arrow" className="h-4 w-4" />
            </a>
          </div>
        ))}
      </section>

      <section aria-labelledby="path" className="card">
        <h2 id="path" className="h2">Your learning path</h2>
        <ol className="mt-4 flex flex-col gap-2 md:flex-row md:items-center">
          {PATH.map((p, i) => (
            <li key={p.label} className="flex items-center gap-2 md:flex-1">
              <a href={p.href} className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-800 no-underline hover:bg-blue-50">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs text-white">{i + 1}</span>
                {p.label}
              </a>
              {i < PATH.length - 1 && <Icon name="arrow" className="hidden h-4 w-4 text-slate-400 md:block" />}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="training" className="card border-teal-200 bg-teal-50/40">
        <h2 id="training" className="h2">Connection to Summer Training</h2>
        <p className="muted mt-2 max-w-3xl text-sm">
          This student project is inspired by summer training in Penetration Testing and Application Security at the National Telecommunication Institute (NTI). The training covered the topics below. CryptoShield Academy applies cryptography as an extension of that training: it shows where cryptographic choices appear inside each topic. It is not an official NTI website and is not endorsed by NTI.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {TRAINING.map((t) => (
            <li key={t} className="rounded-full border border-teal-200 bg-white px-3 py-1 text-sm font-medium text-teal-900">
              {t}
            </li>
          ))}
        </ul>
        <p className="muted mt-4 max-w-3xl text-sm">
          The lesson-and-practice format also builds on the experience of preparing OWASP Top 10 educational material.{' '}
          <a href="#/about" className="link">Read more about the project</a>.
        </p>
      </section>
    </div>
  )
}
