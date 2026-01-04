// src/pages/Legal.jsx
import Header from "@/components/Header.jsx";
import Footer from "@/components/Footer.jsx";
import { SUPPORT_EMAIL_ACCOUNT_DELETION_URL } from "@/config/links.js";

export default function LegalPage() {
  return (
    <>
      <Header />
      <div className="flex-1 px-6 py-10 flex justify-center">
        <div className="max-w-3xl w-full space-y-8 text-sm text-zinc-300">
          <header>
            <h1 className="text-3xl font-black tracking-tight mb-2">
              Legal &amp; Terms
            </h1>
            <p className="text-xs text-zinc-500">Last updated: 2026-01-02</p>
          </header>

          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">
              1. Terms of Service
            </h2>
            <p>
              Doggerz is provided &quot;as is&quot; for entertainment purposes.
              There is no guarantee of uptime, feature availability, or data
              retention. Game balance, progression rules, and rewards may change
              over time.
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Don&apos;t abuse the service, attack security, or cheat in ways
                that impact other players.
              </li>
              <li>
                You&apos;re responsible for your own device, data usage, and
                connectivity.
              </li>
              <li>
                Accounts that violate these terms or basic community standards
                may be suspended.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">
              2. Privacy
            </h2>
            <p>
              Privacy details live on the <b>Privacy Policy</b> page. If you’re
              looking for what’s stored locally, what’s synced to the cloud, or
              how voice features work, head to <b>/privacy</b>.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">
              3. Account deletion
            </h2>
            <p>
              If you created an account and enabled cloud sync, you can request
              deletion of your cloud account and cloud save from within the app
              in
              <b> Settings → Account &amp; cloud</b>. Local data on your device
              can be removed via Settings as well.
            </p>
            <p>
              If you have trouble deleting your account in-app, contact support
              via
              <a
                className="text-emerald-300 underline-offset-2 hover:text-emerald-200 hover:underline"
                href={SUPPORT_EMAIL_ACCOUNT_DELETION_URL}
              >
                email
              </a>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">
              4. Third-party services
            </h2>
            <p>
              By using Doggerz you also agree to the terms and privacy policies
              of the underlying providers (e.g. Google, Firebase, app stores).
              Their data handling is outside this project&apos;s direct control.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-semibold text-zinc-100 text-base">
              5. Changes
            </h2>
            <p>
              These terms and this privacy summary may change as Doggerz
              evolves. Significant changes will be reflected here and in future
              release notes.
            </p>
          </section>

          <p className="text-xs text-zinc-500">
            This is a high-level summary, not formal legal advice. For
            commercial release on app stores, you&apos;d want a lawyer to review
            and adapt these terms for your specific situation.
          </p>
        </div>
      </div>

      <Footer />
    </>
  );
}
