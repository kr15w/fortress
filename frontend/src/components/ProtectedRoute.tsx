import { Navigate, Outlet } from "react-router-dom";
import { isAuthenticated } from "@/utils/auth";  // Ensure this function exists and works

const ProtectedRoute = async () => {
  const auth = await isAuthenticated();
  return auth ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
