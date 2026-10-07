import { Link, useNavigate } from "react-router";
import { Users, ArrowLeft } from "lucide-react";
import { Helmet } from "react-helmet-async";

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>Page Not Found | Social App</title>
      </Helmet>
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f7f7f6] px-4 py-10 sm:px-6">
      <div className="w-full max-w-[480px] overflow-hidden rounded-2xl border border-[#e8e8e6] bg-white p-6 text-center shadow-[0_8px_24px_rgba(22,22,26,0.06)] sm:p-8 lg:p-10">
        {/* Simple social-related icon, sitting above the 404 mark */}
        <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-[#fafaf9] border border-[#e8e8e6] sm:size-12">
          <Users className="size-5 text-[#929298]" aria-hidden="true" />
        </div>

        {/* 404 mark */}
        <p className="text-[56px] font-bold leading-none tracking-[-0.02em] text-[#16161a] sm:text-[64px] lg:text-[72px]">
          404
        </p>

        {/* Heading + description */}
        <h1 className="mt-4 text-lg font-semibold text-[#16161a] sm:text-xl">
          Page Not Found
        </h1>
        <p className="mt-2 text-sm leading-6 text-[#707078] sm:text-base">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or may have
          been moved.
        </p>

        {/* Actions */}
        <div className="mt-7 flex flex-col items-center gap-2.5 sm:mt-8 sm:flex-row sm:justify-center sm:gap-3">
          <Link
            to="/"
            className="w-full rounded-lg bg-[#16161a] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(22,22,26,0.10)] transition-colors duration-150 hover:bg-[#2a2a2e] sm:w-auto sm:px-6">
            Back to Home
          </Link>

          <button
            onClick={()=> navigate(-1)}
            type="button"
            className="flex w-full items-center justify-center cursor-pointer gap-1.5 rounded-lg border border-[#e8e8e6] bg-white px-5 py-2.5 text-sm font-medium text-[#16161a] transition-colors duration-150 hover:bg-[#fafaf9] sm:w-auto sm:px-6">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Go Back
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
