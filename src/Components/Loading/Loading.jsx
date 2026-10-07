import { Link } from "react-router";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="flex flex-col items-center gap-3">
        <span className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 rounded-full border-2 sm:border-2 md:border-[3px] border-[#e5e5e3] border-t-[#16161a] animate-spin" />
        <p className="text-[12px] sm:text-[13px] md:text-[13.5px] text-gray-500">
          Loading...
        </p>
      </div>
    </div>
  );
}
