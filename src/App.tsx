import { Navigate, Route, Routes } from "react-router-dom";
import {
  ModuleRegistry,
  AllCommunityModule,
  PaginationModule,
  ClientSideRowModelModule,
  TooltipModule,
} from "ag-grid-community";

import Login from "./layouts/login/login";
import PublicRoute from "./routes/public-route";
import PrivateRoute from "./routes/private-route";
import Dashboard from "./layouts/dashboard";
import Services from "./layouts/dashboard/services";
import Slack from "./layouts/dashboard/services/slack";
import ServiceGuard from "./routes/service-guard";
import EmailComposer from "./layouts/dashboard/services/email";
import SMS from "./layouts/dashboard/services/SMS";
import MultipleNotification from "./layouts/dashboard/services/multiple-notification";
import WebhookConfigPage from "./webhook";

export default function App() {
  ModuleRegistry.registerModules([
    AllCommunityModule,
    TooltipModule,
    PaginationModule,
    ClientSideRowModelModule,
  ]);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Login />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/webhook-config" element={<WebhookConfigPage />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/email-editor" element={<EmailComposer />} />
        <Route path="/services/sms" element={<SMS />} />
        <Route
          path="/services/multiple-notification"
          element={<MultipleNotification />}
        />
        <Route element={<ServiceGuard service="slack" />}>
          <Route path="/services/slack" element={<Slack />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
