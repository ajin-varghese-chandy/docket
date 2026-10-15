/*
 * One footer for both home panels.
 *
 * The dark half continues the left panel's colour and padding; the light half
 * sits on the page background. Both split at the same seam as the panels, and
 * on mobile the dark half becomes the page's single full-width footer.
 */
export default function SiteFooter() {
  return (
    <footer className="max-lg:order-4 lg:col-span-2 lg:grid lg:grid-cols-2">
      <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-1.5 border-t border-white/[0.07] bg-slate-950 px-7 py-4 text-[11.5px] text-slate-500 lg:px-10 xl:px-[52px]">
        <span>© {new Date().getFullYear()} DOCKET</span>
        <span>Payments secured by Razorpay</span>
      </div>
      <div className="hidden items-center border-t border-indigo-100 px-8 py-4 text-[11.5px] text-slate-500 lg:flex">
        <span>Built for freelancers &amp; clients</span>
      </div>
    </footer>
  )
}
