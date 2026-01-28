import { Box, CssBaseline, useMediaQuery, useTheme } from "@mui/material";
import { useState } from "react";
import { useLocation } from "react-router";

import { COLLAPSED_WIDTH, DRAWER_WIDTH } from "src/utility/constants";

import Sidebar from "./dashboard/sidebar";
import TopBar from "./dashboard/topbar";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const isMobile = useMediaQuery("(max-width:768px)");
  const theme = useTheme();
  const location = useLocation();

  const [open, setOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleToggle = () => {
    isMobile ? setMobileOpen(!mobileOpen) : setOpen(!open);
  };

  const smsEditor = location?.pathname === "/services/sms" && "14px";
  const emailEditor = location?.pathname === "/services/email-editor" && "36px";
  const slackEditor = location?.pathname === "/services/slack" && "50px";
  const services = location?.pathname === "/services" && "0px";
  const finalMarginTop =
    services || smsEditor || slackEditor || emailEditor || "56px";

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <CssBaseline />

      <TopBar onMenuClick={handleToggle} />

      <Sidebar open={open} mobileOpen={mobileOpen} onToggle={handleToggle} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 2,
          ml: isMobile
            ? 0
            : open
              ? `${DRAWER_WIDTH}px`
              : `${COLLAPSED_WIDTH}px`,
          transition: theme.transitions.create("margin-left", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.standard,
          }),
          marginTop: isMobile ? "10%" : finalMarginTop,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default DashboardLayout;
