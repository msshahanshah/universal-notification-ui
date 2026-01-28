import { Navigate, Outlet } from "react-router-dom";

import { isAuthenticated } from "../utility/auth";
import DashboardLayout from "src/layouts/dashboard-layout";

const PrivateRoute = () => {
  return isAuthenticated() ? (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  ) : (
    <Navigate to="/" replace />
  );
};
export default PrivateRoute;
