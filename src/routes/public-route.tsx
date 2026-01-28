import { Navigate, Outlet } from "react-router-dom";

import { isAuthenticated } from "../utility/auth";

const PublicRoute = () => {
  return !isAuthenticated() ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default PublicRoute;
