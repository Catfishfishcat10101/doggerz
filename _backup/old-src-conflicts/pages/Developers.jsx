// _backup/old-src-conflicts/pages/Developers.jsx
// src/pages/Developers.jsx

import { SOCIAL_LINKS } from "@/app/config/links.js";
import DogAIEngine from "@/components/dog/DogAIEngine.jsx";
import HeroDog from "@/components/dog/renderers/HeroDog.jsx";
import PageShell from "@/components/layout/PageShell.jsx";

function asGithubRepoBase(url) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parsed.hostname !== "github.com" || parts.length < 2) return null;
    return `https://github.com/${parts[0]}/${parts[1]}`;
  } catch {
    return null;
  }
}

function ExternalLink({ href, children }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-emerald-300 underline-offset-2 hover:text-emerald-200 hover:underline"
    >
      {children}
    </a>
  );
}

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-200">
      {children}
    </span>
  );
}

function CommandBlock({ title, commands }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/30">
      <div className="border-b border-zinc-800 px-4 py-3 text-sm font-semibold text-zinc-100">
        {title}
      </div>
      <pre className="whitespace-pre-wrap px-4 py-3 text-xs leading-relaxed text-zinc-200">
        {commands.join("\n")}
      </pre>
    </div>
  );
}

export default function DevelopersPage() {
  const repoBase = asGithubRepoBase(SOCIAL_LINKS.github);
  const issuesUrl = repoBase ? `${repoBase}/issues` : null;
  const pullsUrl = repoBase ? `${repoBase}/pulls` : null;
  const readmeUrl = repoBase ? `${repoBase}#readme` : null;

  return (
    <PageShell mainClassName="px-6 py-10" containerClassName="w-full max-w-5xl">
      <DogAIEngine enableAudio={false} enableWeather={false} />

      <div className="w-full space-y-8">
        <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-zinc-950 to-emerald-950/30 p-8 md:p-10">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge>React + Vite</Badge>
                <Badge>Capacitor Android</Badge>
                <Badge>Firebase</Badge>
                <Badge>Three.js GLB</Badge>
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight md:text-5xl">
                  Developers
                </h1>
                <p className="mt-3 max-w-2xl text-zinc-300">
                  Doggerz renders the shared Jack Russell GLB for branded dog
                  previews and the live yard. Keep dog rendering changes on the
                  GLB path unless a sprite asset is explicitly required.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <ExternalLink href={readmeUrl}>README</ExternalLink>
                <ExternalLink href={issuesUrl}>Issues</ExternalLink>
                <ExternalLink href={pullsUrl}>Pull requests</ExternalLink>
              </div>
            </div>

            <div className="flex shrink-0 justify-center md:w-72">
              <HeroDog
                variant="showcase"
                anim="idle"
                animationPreset="idle-wag"
                className="select-none"
              />
            </div>
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-2">
          <CommandBlock
            title="Local Verification"
            commands={[
              "npm run lint",
              "npm run typecheck",
              "npm run test",
              "npm run build",
              "npm run preflight",
            ]}
          />
          <CommandBlock
            title="Android Release"
            commands={[
              "npm run release:android:build",
              "npm run release:android:bump",
              "npm run release:android:internal",
            ]}
          />
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
          <h2 className="text-lg font-bold">Dog Rendering Contract</h2>
          <div className="mt-4 grid gap-4 text-sm text-zinc-300 md:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
              <div className="font-semibold text-zinc-100">Hero previews</div>
              <p className="mt-2">
                `HeroDog` wraps `BrandDogHero3D`, which loads
                `public/assets/models/dog/jackrussell-doggerz.glb` (served via
                `withBaseUrl(...)`).
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-black/25 p-4">
              <div className="font-semibold text-zinc-100">Live yard</div>
              <p className="mt-2">
                `DogStage` renders `DogStage3D`, which uses `Dog3DScene` and the
                same GLB model.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-6">
          <h2 className="text-lg font-bold">Firebase Environment</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Cloud sync stays disabled unless these Vite variables are present.
            Offline play remains available when Firebase config is missing.
          </p>

          <div className="mt-4 rounded-xl border border-zinc-800 bg-black/40 p-4">
            <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-200">
              {`VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# optional
VITE_FIREBASE_MEASUREMENT_ID=`}
            </pre>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
