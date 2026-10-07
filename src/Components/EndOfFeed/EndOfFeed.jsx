import { useState } from "react";
import { ArrowRight, Check, Clock3, Sparkles } from "lucide-react";

export default function EndOfFeed({ onKeepScrolling }) {
  const [isDone, setIsDone] = useState(false);

  if (isDone) {
    return (
      <section className="feed-end-enter relative isolate my-2 overflow-hidden rounded-3xl border border-[#e9e6f3] bg-gradient-to-br from-white via-[#fbfaff] to-[#f2efff] px-5 py-8 text-center shadow-[0_12px_40px_rgba(60,45,100,0.07)] sm:px-8 sm:py-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 -z-10 size-44 rounded-full bg-violet-200/30 blur-3xl"
        />

        <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-[#e9e6f3] bg-white text-[#74708c] shadow-sm">
          <Check size={21} aria-hidden="true" />
        </div>

        <h2 className="mt-4 text-lg font-semibold tracking-tight text-[#24222d] sm:text-xl">
          You’re all set
        </h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm leading-6 text-[#777482]">
          Thanks for stopping by. Your feed will be here when you’re ready.
        </p>
      </section>
    );
  }

  return (
    <section className="feed-end-enter relative isolate my-2 overflow-hidden rounded-3xl border border-[#e9e6f3] bg-gradient-to-br from-white via-[#fbfaff] to-[#f2efff] px-5 py-8 text-center shadow-[0_12px_40px_rgba(60,45,100,0.07)] sm:px-8 sm:py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 -top-16 -z-10 size-44 rounded-full bg-violet-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -left-12 -z-10 size-44 rounded-full bg-indigo-200/30 blur-3xl"
      />

      <div className="mx-auto grid size-12 place-items-center rounded-2xl border border-[#ece8f7] bg-white text-[#7664b5] shadow-[0_4px_14px_rgba(70,55,120,0.08)]">
        <Sparkles size={21} aria-hidden="true" />
      </div>

      <div className="feed-end-copy">
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8274ad]">
          Feed complete
        </p>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-[#24222d] sm:text-2xl">
          You’re all caught up! <span aria-hidden="true">🎉</span>
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#777482] sm:text-[15px]">
          Got a little more time to scroll?
        </p>
      </div>

      <div className="mt-6 flex flex-col justify-center gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={() => {
            onKeepScrolling((prev) => prev + 1);
          }}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#16161a] px-5 text-sm font-semibold  shadow-[0_6px_16px_rgba(41,36,58,0.16)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_9px_20px_rgba(41,36,58,0.2)] focus:outline-none focus:ring-4 focus:ring-violet-900/15 active:translate-y-0 border-[#16161a] bg-[#16161a] text-white hover:bg-[#303036]">
          Keep scrolling
          <ArrowRight size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setIsDone(true)}
          className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#e7e4ee] bg-white/80 px-5 text-sm font-medium text-[#5e5b69] transition duration-200 hover:border-[#d8d3e5] hover:bg-white hover:text-[#29243a] focus:outline-none focus:ring-4 focus:ring-violet-900/10">
          <Clock3 size={15} aria-hidden="true" />
          I’m done
        </button>
      </div>

      <p className="mt-5 text-[11px] text-[#9996a3]">
        Take your time. There’s always more to discover.
      </p>
    </section>
  );
}
