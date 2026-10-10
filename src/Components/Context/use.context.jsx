import { createContext } from "react";
import { useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext("");

export default function UserProvider({ children }) {
  // to call it only in the intial render
  const [token, setToken] = useState(() => sessionStorage.getItem("token"));
  const [userInfo, setUserInfo] = useState(
    JSON.parse(sessionStorage.getItem("userInfo")),
  );
  const [userInfoLoading, setUserInfoLoading] = useState(
    Boolean(sessionStorage.getItem("token")),
  );
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  async function getUserInfo() {
    if (!token) {
      setUserInfoLoading(false);
      return;
    }

    setUserInfoLoading(true);
    try {
      const config = {
        url: "https://route-posts.routemisr.com/users/profile-data",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      };
      const { data } = await axios.request(config);
      if (data?.data?.user) {
        const profileUser = data.data.user;
        setUserInfo(profileUser);
        sessionStorage.setItem("userInfo", JSON.stringify(profileUser));
      }
    } catch (error) {
      console.log({ error });
    } finally {
      setUserInfoLoading(false);
    }
  }

  async function refreshUnreadNotificationCount() {
    if (!token) {
      setUnreadNotificationCount(0);
      return;
    }

    try {
      const { data } = await axios.request({
        url: "https://route-posts.routemisr.com/notifications/unread-count",
        headers: { Authorization: `Bearer ${token}` },
        method: "GET",
      });
      if (data?.success) {
        const unreadCount = data.data?.unreadCount;
        if (Number.isFinite(unreadCount)) {
          setUnreadNotificationCount(Math.max(0, unreadCount));
        }
      }
    } catch (error) {
      console.log({ error });
    }
  }

  useEffect(() => {
    getUserInfo();
  }, [token]);

  useEffect(() => {
    refreshUnreadNotificationCount();
  }, [token]);

  return (
    <UserContext.Provider
      value={{
        token,
        setToken,
        userInfo,
        setUserInfo,
        userInfoLoading,
        unreadNotificationCount,
        setUnreadNotificationCount,
        refreshUnreadNotificationCount,
      }}>
      {children}
    </UserContext.Provider>
  );
}
