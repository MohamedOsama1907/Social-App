import { createContext } from "react";
import { useState, useEffect } from "react";
import axios from "axios";

export const UserContext = createContext("");

export default function UserProvider({ children }) {
  const [token, setToken] = useState(sessionStorage.getItem("token"));
  const [userInfo, setUserInfo] = useState(
    JSON.parse(sessionStorage.getItem("userInfo")),
  );
  const [userInfoLoading, setUserInfoLoading] = useState(
    Boolean(sessionStorage.getItem("token")),
  );

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
  useEffect(() => {
    getUserInfo();
  }, [token]);

  return (
    <UserContext.Provider
      value={{
        token,
        setToken,
        userInfo,
        setUserInfo,
        userInfoLoading,
      }}>
      {children}
    </UserContext.Provider>
  );
}
