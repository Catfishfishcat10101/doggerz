export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/10 text-white/70">
      <div className="mx-auto max-w-6xl px-4 h-12 flex items-center justify-between text-xs">
        <span>© {new Date().getFullYear()} Doggerz</span>
        <a
          href="https://firebase.google.com/support/privacy"
          className="hover:text-white"
          target="_blank"
          rel="noreferrer"
        >
          Firebase Privacy
        </a>
      </div>
    </footer>
  );
}