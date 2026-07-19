export function Footer() {
  return (
    <footer className="border-t border-slate-200 py-8 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500 sm:px-6 dark:text-slate-500">
        Built as a MERN stack job board demo. &copy; {new Date().getFullYear()} JobBoard.
      </div>
    </footer>
  );
}
