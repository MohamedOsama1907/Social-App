import { Link, NavLink } from "react-router";
import logoImage from "../../Assets/looogo.png";
import { Bell, CircleUserRound, House, LogOut, Settings } from "lucide-react";
import { useContext } from "react";
import { UserContext } from "../Context/use.context";

export default function Sidebar() {
  const { setToken, setUserInfo } = useContext(UserContext);
  const { userInfo } = useContext(UserContext);

  function logOut() {
    setToken(null);
    localStorage.removeItem("token");
    setUserInfo(null);
    localStorage.removeItem("userInfo");
    // window.location.reload();
  }
  return (
    <aside className="shrink-0 fixed flex flex-col justify-between top-0 left-0 bottom-0 w-19 lg:w-64 max-h-screen p-4 shadow-lg bg-white transition-[width] duration-200">
      <div className="flex flex-col space-y-8 font-medium">
        {/* Logo */}
        <div className="logo flex items-center justify-center lg:justify-start space-x-0 lg:space-x-3 border-b pb-6 border-gray-200">
          <Link to={"/"}>
            <img loading="lazy"
              src={logoImage}
              alt="logo image"
              className="object-contain w-9 lg:w-14"
            />
          </Link>
          <h1 className="hidden lg:block text-[22px] font-semibold whitespace-nowrap">
            Social App
          </h1>
        </div>

        {/* Nav */}
        <ul className="flex flex-col space-y-1 text-[#6b6c72] text-[15px]">
          <li className="relative group">
            <NavLink
              to={"/"}
              className={({ isActive }) =>
                ` linkStyle ${
                  isActive
                    ? "text-[#16161a] bg-[#eeeeec] border border-[#16161a]/10"
                    : "hover:bg-[#f2f2f1] hover:text-[#16161a]"
                }`
              }>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-0.75 h-4.5 rounded-r bg-[#16161a]" />
                  )}
                  <House size={20} className="shrink-0" />
                  <span className="hidden lg:inline">Home</span>
                </>
              )}
            </NavLink>
            <span className="toolTip">Home</span>
          </li>

          <li className="relative group">
            <NavLink
              to={"/notifications"}
              className={({ isActive }) =>
                ` linkStyle ${
                  isActive
                    ? "text-[#16161a] bg-[#eeeeec] border border-[#16161a]/10"
                    : "hover:bg-[#f2f2f1] hover:text-[#16161a]"
                }`
              }>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-0.75 h-4.5 rounded-r bg-[#16161a]" />
                  )}
                  <Bell size={20} className="shrink-0" />
                  <span className="hidden lg:inline">Notifications</span>
                </>
              )}
            </NavLink>
            <span className="toolTip">Notifications</span>
          </li>

          <li className="relative group">
            <NavLink
              to={"/profile"}
              className={({ isActive }) =>
                ` linkStyle ${
                  isActive
                    ? "text-[#16161a] bg-[#eeeeec] border border-[#16161a]/10"
                    : "hover:bg-[#f2f2f1] hover:text-[#16161a]"
                }`
              }>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-0.75 h-4.5 rounded-r bg-[#16161a]" />
                  )}
                  <CircleUserRound size={20} className="shrink-0" />
                  <span className="hidden lg:inline">Profile</span>
                </>
              )}
            </NavLink>
            <span className="toolTip">Profile</span>
          </li>

          <li className="relative group">
            <NavLink
              to={"/settings"}
              className={({ isActive }) =>
                ` linkStyle ${
                  isActive
                    ? "text-[#16161a] bg-[#eeeeec] border border-[#16161a]/10"
                    : "hover:bg-[#f2f2f1] hover:text-[#16161a]"
                }`
              }>
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute -left-4 top-1/2 -translate-y-1/2 w-0.75 h-4.5 rounded-r bg-[#16161a]" />
                  )}
                  <Settings size={20} className="shrink-0" />
                  <span className="hidden lg:inline">Settings</span>
                </>
              )}
            </NavLink>
            <span className="toolTip">Settings</span>
          </li>
        </ul>
      </div>

      {/* Footer: avatar + logout */}
      <div className="flex flex-col space-y-3 border-t border-gray-200 pt-4">
        <NavLink to={"/profile"} className="flex items-center justify-center lg:justify-start space-x-0 lg:space-x-3 px-0 lg:px-2 py-1">
          <div className="w-8 h-8 rounded-full bg-[#eeeeec] border border-[#16161a]/10 flex items-center justify-center text-xs font-semibold text-[#16161a] shrink-0 overflow-hidden">
            <img loading="lazy" src={userInfo.photo} alt={userInfo.name} className="w-full" />
          </div>
          <div className="hidden lg:block leading-tight overflow-hidden">
            <p className="text-sm font-semibold text-[#16161a] truncate">
              {userInfo.name}
            </p>
            <p className="text-xs text-[#9a9ba1] truncate">@{userInfo.username}</p>
          </div>
        </NavLink>

        <div className="relative group">
          <button
            className="logoutBtn cursor-pointer flex items-center justify-center lg:justify-start space-x-0 lg:space-x-4 w-full px-3 lg:px-4 py-3 lg:py-2 rounded-[10px] text-[#c0393f] hover:bg-[#fbecec] transition-colors duration-150"
            onClick={logOut}>
            <LogOut size={20} className="shrink-0" />
            <span className="hidden lg:inline">Logout</span>
          </button>
          <span className="toolTip">Log out</span>
        </div>
      </div>
    </aside>
  );
}
