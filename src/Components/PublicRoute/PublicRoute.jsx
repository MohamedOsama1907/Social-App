import { Navigate } from "react-router";

export default function PublicRoute({ children }) {
  const token = sessionStorage.getItem("token");

  if (token) {
    return <Navigate to="/"  />;
  }

  return children;
}
