import { useContext } from "react";
import { Navigate } from "react-router";
import { UserContext } from "../Context/use.context";

export default function ProtectedRoute({ children }) {
  const { token } = useContext(UserContext);
  if (!token) {
    return <Navigate to="/login"></Navigate>;
  } else {
    return children;
  }
}
