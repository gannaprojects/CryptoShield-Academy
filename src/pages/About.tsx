import { Callout } from '../components/ui'

const MAPPING = [
  ['Vulnerability Assessment', 'Identify insecure cryptographic practices.', 'Challenges 1, 2, 3 and 5'],
  ['Application Security', 'Protect sensitive information.', 'Lessons 1 and 4, AES-GCM lab'],
  ['Authentication', 'Understand password storage.', 'Lesson 5, Challenge 4'],
  ['Cloud Security', 'Understand key access and least privilege.', 'Lesson 7, Challenge 5'],
  ['Log Analysis', 'Understand useful security events and avoid logging secrets.', 'Lessons 6 and 7, Challenge 6'],
  ['Reporting', 'Document evidence, impact, and remediation.', 'Lesson 8, Reports page, Challenge 8'],
  ['Security Awareness', 'Explain technical concepts clearly.', 'Every lesson and its misconception box'],
]

const REFERENCES = [
  ['OWASP Cryptographic Storage Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html'],
  ['OWASP Password Storage Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html'],
  ['OWASP Key Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Key_Management_Cheat_Sheet.html'],
]

export default function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="h1">About the Project</h1>
        <p className="muted mt-2">
          CryptoShield Academy is a student educational project. It connects cryptography with summer training in Penetration Testing and Application Security.
        </p>
      </header>

      <Callout tone="info" title="What this project is, and is not">
        <p>
          The project is inspired by training topics at the National Telecommunication Institute (NTI). It is an independent student project: it is not an official NTI website and NTI has not endorsed it.
        </p>
        <p>
          The training topics are listed below. The cryptographic algorithms shown on this site were chosen by the author to apply cryptography as an extension of that training; this is not a record of algorithms taught in the course.
        </p>
      </Callout>

      <section className="card space-y-3">
        <h2 className="h2">How the training maps to this site</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th scope="col" className="py-2 pr-4">Training topic</th>
                <th scope="col" className="py-2 pr-4">Cryptography connection</th>
                <th scope="col" className="py-2">Where to find it</th>
              </tr>
            </thead>
            <tbody>
              {MAPPING.map(([topic, link, where]) => (
                <tr key={topic} className="border-b border-slate-100 align-top">
                  <th scope="row" className="py-2 pr-4 font-semibold">{topic}</th>
                  <td className="py-2 pr-4 text-slate-700">{link}</td>
                  <td className="muted py-2">{where}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="h2">Why it is built as lessons and practice</h2>
        <p className="text-slate-700">
          The format, a short explanation followed by a hands-on task and a written finding, comes from the author's experience of producing OWASP Top 10 training material for a freelance client. This site follows the same idea: see a weakness, try it, then explain the fix in your own words.
        </p>
      </section>

      <section className="card space-y-3">
        <h2 className="h2">Honest limits</h2>
        <ul className="list-inside list-disc space-y-1 text-slate-700">
          <li>This is a learning tool, not a production-grade secure vault. Do not use it to protect real secrets.</li>
          <li>Caesar and Vigenère are historical ciphers, shown only for teaching.</li>
          <li>Everything runs in your browser. There is no server, no account, and no analytics.</li>
          <li>Progress and report drafts are saved in this browser on this device. Lab inputs, keys, and messages are never saved.</li>
          <li>Scores are for self-study. Answers are part of the page, so the scoring is not suitable for formal examinations.</li>
          <li>It offers no certificate and makes no certification claim.</li>
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="h2">Learning references</h2>
        <p className="muted text-sm">Official OWASP cheat sheets for further reading. These links open the OWASP website.</p>
        <ul className="space-y-2">
          {REFERENCES.map(([name, url]) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noopener noreferrer" className="link">{name}</a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
