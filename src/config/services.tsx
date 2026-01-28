import EmailIcon from "@mui/icons-material/Email";
import SmsIcon from "@mui/icons-material/Sms";
import DashboardIcon from "@mui/icons-material/Dashboard";

const SERVICES = {
  slack: {
    name: "Slack",
    icon: <DashboardIcon fontSize="small" />,
    enabled: true,
    status: "healthy",
    path: "/services/slack",
  },
  email: {
    name: "Email",
    icon: <EmailIcon fontSize="small" />,
    enabled: true,
    status: "healthy",
    path: "/services/email-editor",
  },
  sms: {
    name: "SMS",
    icon: <SmsIcon fontSize="small" />,
    enabled: true,
    status: "healthy",
    path: "/services/sms",
  },
};

export default SERVICES;
