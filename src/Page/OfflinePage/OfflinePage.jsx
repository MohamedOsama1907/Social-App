import { WifiOff, RefreshCw } from "lucide-react";
import { Helmet } from "react-helmet";



export default function OfflinePage() {
  function handleRetry() {
    window.location.reload();
  }

  return (
    <>
      <Helmet>
        <title>Offline | Social App</title>
      </Helmet>
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f7f6] px-4 py-10 sm:px-6">
      <div className="w-full max-w-[440px] overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white p-6 text-center shadow-[0_8px_24px_rgba(22,22,26,0.06)] sm:p-8 lg:p-10">
        {/* Main visual */}
        <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-[#fafaf9] border border-[#e8e8e6] sm:size-[72px] sm:mb-6">
          <WifiOff
            className="size-7 text-[#16161a] sm:size-8"
            aria-hidden="true"
          />
        </div>

        {/* Heading + description */}
        <h1 className="text-lg font-semibold text-[#16161a] sm:text-xl">
          You&apos;re Offline
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#707078] sm:text-base">
          It looks like you&apos;re not connected to the internet. Check your
          connection and try again.
        </p>

        {/* Retry action */}
        <button
          type="button"
          onClick={handleRetry}
          className="group mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-[#16161a] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(22,22,26,0.10)] transition-all duration-150 hover:bg-[#2a2a2e] active:scale-[0.98] sm:mt-8">
          <RefreshCw
            className="size-4 transition-transform duration-500 group-hover:rotate-180"
            aria-hidden="true"
          />
          Try Again
        </button>

        {/* Secondary info */}
        <p className="mt-4 text-xs text-[#929298]">
          Your connection will be checked again when you retry.
        </p>
      </div>
      </div>
    </>
  );
}
