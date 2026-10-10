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
    <footer className="mt-auto border-t border-[#e8e8e6] bg-white px-4 py-4 sm:px-6 sm:py-5">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-1.5 text-[11px] text-[#929298] sm:flex-row sm:items-center sm:justify-between sm:text-xs">
        <span>Social App · {pageLabel}</span>
        <span>Connect with your community.</span>
      </div>
    </footer>
  );
}
