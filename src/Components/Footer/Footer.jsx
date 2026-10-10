import { useLocation } from "react-router";

function getPageLabel(pathname) {
  if (pathname === "/") return "Home";
  if (pathname === "/notifications") return "Notifications";
  if (pathname === "/settings") return "Settings";
  if (pathname === "/my-profile") return "Your profile";
  if (pathname.startsWith("/profile/")) return "Community profile";
  if (pathname.startsWith("/posts/postDetails/")) return "Post details";
  return "Social App";
}

export default function Footer() {
  const { pathname } = useLocation();
  const pageLabel = getPageLabel(pathname);

  return (
    <footer className="mt-auto border-t border-[#e8e8e6] bg-white px-3 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-5 sm:pb-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-1.5 text-center text-[11px] leading-5 text-[#929298] sm:flex-row sm:justify-between sm:text-left sm:text-xs">
        <span className="max-w-full break-words">Social App · {pageLabel}</span>
        <span className="max-w-full break-words">Connect with your community.</span>
      </div>
    </footer>
  );
}
