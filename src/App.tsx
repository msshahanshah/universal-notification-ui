import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  ModuleRegistry,
  AllCommunityModule,
  PaginationModule,
  ClientSideRowModelModule,
} from "ag-grid-community";
import { TooltipModule } from "ag-grid-community";

import Login from "./layouts/login/login";
import PublicRoute from "./routes/public-route";
import PrivateRoute from "./routes/private-route";
import Dashboard from "./layouts/dashboard";
import ServicesAccordion from "./layouts/dashboard/services/demo/ServicesAccordion";
import Services1 from "./layouts/dashboard/services/demo/services";
import Services from "./layouts/dashboard/services";
import Slack from "./layouts/dashboard/services/slack";
import ServiceGuard from "./routes/service-guard";
import EmailComposer from "./layouts/dashboard/services/email";
import SMS from "./layouts/dashboard/services/SMS";

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
        <Route path="/services" element={<Services />} />
        <Route path="/services/demo1" element={<Services1 />} />
        <Route path="/services/demo2" element={<ServicesAccordion />} />
        <Route path="/services/email-editor" element={<EmailComposer />} />
        <Route path="/services/sms" element={<SMS />} />
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
