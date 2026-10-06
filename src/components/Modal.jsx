export default function Modal({ title, onClose, children, footer }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-5"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[460px] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-[18px]">
          <h2 className="text-base font-semibold tracking-[-0.01em]">{title}</h2>
          <button
            className="cursor-pointer border-none bg-transparent px-1 text-[22px] leading-none text-slate-500 transition hover:text-slate-900"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="p-5">{children}</div>
        {footer ? (
          <footer className="flex justify-end gap-2.5 border-t border-slate-200 px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  )
}
