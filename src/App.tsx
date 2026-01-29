import React, { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";

import Login from "./layouts/login/login";
import PublicRoute from "./routes/public-route";
import PrivateRoute from "./routes/private-route";
import Dashboard from "./layouts/dashboard";
import Services from "./layouts/dashboard/services";
import Slack from "./layouts/dashboard/services/slack";
import SMS from "./layouts/dashboard/services/SMS";
import EmailComposer from "./layouts/dashboard/services/email";

export default function App() {
  ModuleRegistry.registerModules([AllCommunityModule]);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<Login />} />
      </Route>
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/email-editor" element={<EmailComposer />} />
        <Route path="/services/sms" element={<SMS />} />
        <Route path="/services/slack" element={<Slack />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
      {/* Fallback */}
      <Route path="*" element={<Login />} />
    </Routes>
  );
}
