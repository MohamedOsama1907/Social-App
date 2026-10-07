import { useContext, useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router";
import { House, Bell, CircleUserRound, Settings, LogOut } from "lucide-react";
import logoImage from "../../assets/looogo.png";
import { UserContext } from "../../Components/Context/use.context";

export default function NavBar() {
  const { setToken, userInfo } = useContext(UserContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  function logOut() {
    setToken(null);
    sessionStorage.removeItems("token");
    navigate("/login");
  }
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className="z-100 fixed top-0 left-0 right-0 h-16 lg:h-18 flex items-center justify-between px-4 lg:px-6 border-b border-[#16161a]/8 bg-white shadow-md">
        {/* Logo */}
        <Link
          to={"/"}
          className="flex items-center space-x-3 shrink-0"
          onClick={() => {
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}>
          <img
            loading="lazy"
            src={logoImage}
            alt="logo image"
            className="object-contain w-8 lg:w-10"
          />
          <h1 className="hidden sm:block text-[19px] lg:text-2xl font-semibold whitespace-nowrap">
            Social App
          </h1>
        </Link>

        {/* Home + Notifications — grouped as the primary, high-frequency nav */}
        <ul className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-5">
          <li className="relative group">
            <NavLink
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              to={"/"}
              end
              className={({ isActive }) =>
                `flex items-center justify-center w-11 h-11 rounded-lg transition-colors duration-150 ${
                  isActive
                    ? "text-[#16161a] bg-[#eeeeec] border border-[#16161a]/10"
                    : "text-[#6b6c72] hover:bg-[#f2f2f1] hover:text-[#16161a]"
                }`
              }>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-0.75 rounded-t bg-[#16161a]" />
                  )}
                  <House size={22} className="shrink-0" />
                </>
              )}
            </NavLink>
            <span className="toolTip">Home</span>
          </li>

          <li className="relative group">
            <NavLink
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              to={"/notifications"}
              className={({ isActive }) =>
                `flex items-center justify-center w-11 h-11 rounded-lg transition-colors duration-150 ${
                  isActive
                    ? "text-[#16161a] bg-[#eeeeec] border border-[#16161a]/10"
                    : "text-[#6b6c72] hover:bg-[#f2f2f1] hover:text-[#16161a]"
                }`
              }>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-0.75 rounded-t bg-[#16161a]" />
                  )}
                  <Bell size={22} className="shrink-0" />
                </>
              )}
            </NavLink>
            <span className="toolTip">Notifications</span>
          </li>
          <li className="relative group">
            <NavLink
              onClick={() => {
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
              to={"/settings"}
              className={({ isActive }) =>
                `flex items-center justify-center w-11 h-11 rounded-lg transition-colors duration-150 ${
                  isActive
                    ? "text-[#16161a] bg-[#eeeeec] border border-[#16161a]/10"
                    : "text-[#6b6c72] hover:bg-[#f2f2f1] hover:text-[#16161a]"
                }`
              }>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-0.75 rounded-t bg-[#16161a]" />
                  )}
                  <Settings size={22} className="shrink-0" />
                </>
              )}
            </NavLink>
            <span className="toolTip">Settings</span>
          </li>
        </ul>

        {/* Account: avatar trigger + flyout menu */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-expanded={menuOpen}
            aria-haspopup="true"
            aria-label="Account menu"
            className={`flex items-center justify-center rounded-full transition-colors duration-150 cursor-pointer ${
              menuOpen ? "ring-2 ring-[#16161a]/15" : ""
            }`}>
            <div className="w-9 h-9 rounded-full bg-[#eeeeec] border border-[#16161a]/10 flex items-center justify-center text-xs font-semibold text-[#16161a] shrink-0 overflow-hidden">
              <img
                loading="lazy"
                src={
                  userInfo?.photo ||
                  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                }
                alt={
                  userInfo?.name
                    ? `${userInfo.name}'s profile image`
                    : "Profile image"
                }
                className="w-full h-full object-cover"
              />
            </div>
          </button>
          {!menuOpen && <span className="toolTip">Account</span>}

          {/* Flyout menu — opens below the avatar */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#16161a]/10 bg-white shadow-[0_1px_2px_rgba(15,15,16,0.04),0_16px_40px_-12px_rgba(15,15,16,0.18)] overflow-hidden">
              {/* User summary */}
              <Link to={`/my-profile`}>
                <div
                  className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-200"
                  onClick={() => setMenuOpen(false)}>
                  <div className="w-9 h-9 rounded-full bg-[#eeeeec] border border-[#16161a]/10 flex items-center justify-center text-xs font-semibold text-[#16161a] shrink-0 overflow-hidden">
                    <img
                      loading="lazy"
                      src={
                        userInfo?.photo ||
                        "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                      }
                      alt={
                        userInfo?.name
                          ? `${userInfo.name}'s profile image`
                          : "Profile image"
                      }
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-[#16161a] truncate">
                      {userInfo?.name || "Your account"}
                    </p>
                    <p className="text-xs text-[#9a9ba1] truncate">
                      {userInfo?.username ? `@${userInfo.username}` : ""}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Menu items */}
              <div className="py-1.5">
                <Link
                  to={"/my-profile"}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#16161a] hover:bg-[#f2f2f1] transition-colors duration-150">
                  <CircleUserRound size={20} className="text-[#6b6c72]" />
                  Profile
                </Link>
              </div>

              {/* Logout — visually separated */}
              <div className="border-t border-gray-200 py-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logOut();
                  }}
                  className="logoutBtn border-0 rounded-0 cursor-pointer flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#c0393f] hover:bg-[#fbecec] transition-colors duration-150">
                  <LogOut size={18} className="shrink-0" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Spacer so fixed header doesn't overlap page content */}
      <div className="h-16" aria-hidden="true" />
    </>
  );
}
