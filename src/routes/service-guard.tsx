import { Navigate, Outlet } from "react-router-dom";
import SERVICES from "src/config/services";

type Props = {
  service: keyof typeof SERVICES;
};

export default function ServiceGuard({ service }: Props) {
  const isAllowed = SERVICES[service]?.enabled;

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
