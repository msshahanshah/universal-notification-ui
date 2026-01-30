// src/routes/ServiceGuard.tsx
import { Navigate, Outlet } from "react-router-dom";
import SERVICES from "src/config/services";

type Props = {
  service: keyof typeof SERVICES;
};

export default function ServiceGuard({ service }: Props) {
  console.log("service", service);
  console.log("SERVICES[service]", SERVICES[service]);
  const isAllowed = SERVICES[service]?.enabled;
  console.log("isAllowed", isAllowed);

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
