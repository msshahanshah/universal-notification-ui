import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  Typography,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { useLocation, useNavigate } from "react-router-dom";

import COLORS from "src/utility/colors";
// import SlackIcon from "src/assets/icons/SlackIcon";
// import Mail from "src/assets/icons/Mail";
// import Sms from "src/assets/icons/Sms";
import { Mail, MessageSquare, SlackIcon } from "lucide-react";

const serviceTabs = [
  { label: "Slack", path: "/services/slack", icon: SlackIcon },
  { label: "Email", path: "/services/email", icon: Mail },
  { label: "SMS", path: "/services/sms", icon: MessageSquare },
];

const Sidebar = ({
  open,
  onToggle,
  mobileOpen,
}: {
  open: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const isActive = (path: string) => location.pathname.includes(path);
  const isServicesActive = isActive("/services");

  const getItemStyles = (path: string) => ({
    gap: 1.5,
    borderRadius: 2,
    mx: 1,
    mt: 1,
    px: 1.5,
    color: COLORS.WHITE,
    minHeight: 44,
    justifyContent: "center",
    backgroundColor: isActive(path)
      ? "hsla(220, 80%, 55%, 0.25)"
      : "transparent",
    "&:hover": {
      backgroundColor: "hsla(220, 80%, 55%, 0.35)",
    },
  });

  const drawerContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "hsla(220, 35%, 3%, 0.4)",
      }}
    >
      {/* TOP */}
      <List>
        {/* Dashboard */}
        <ListItemButton
          onClick={() => navigate("/dashboard")}
          sx={getItemStyles("/dashboard")}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              justifyContent: "center",
              color: isActive("/dashboard") ? "#4fc3f7" : COLORS.WHITE,
            }}
          >
            <HomeRoundedIcon fontSize="small" />
          </ListItemIcon>
          {open && <ListItemText primary="Dashboard" />}
        </ListItemButton>

        {/* Services Parent */}
        <ListItemButton
          onClick={() => navigate("/services/slack")}
          sx={getItemStyles("/services")}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              justifyContent: "center",
              color: isServicesActive ? "#4fc3f7" : COLORS.WHITE,
            }}
          >
            <MiscellaneousServicesIcon fontSize="small" />
          </ListItemIcon>
          {open && <ListItemText primary="Services" />}
        </ListItemButton>

        {/* Services Sub Tabs */}
        {open && (
          <Collapse in={isServicesActive} timeout="auto" unmountOnExit>
            <List disablePadding>
              {serviceTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <ListItemButton
                    key={tab.path}
                    onClick={() => navigate(tab.path)}
                    sx={{
                      ml: 4,
                      mr: 1,
                      mt: 0.5,
                      minHeight: 36,
                      borderRadius: 2,
                      color: COLORS.WHITE,
                      backgroundColor: isActive(tab.path)
                        ? "hsla(220, 80%, 55%, 0.25)"
                        : "transparent",
                      "&:hover": {
                        backgroundColor: "hsla(220, 80%, 55%, 0.35)",
                      },
                    }}
                  >
                    <Icon size={20} className="service-icon" />
                    <ListItemText
                      primary={tab.label}
                      primaryTypographyProps={{
                        fontSize: 13,
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        )}
      </List>

      {/* BOTTOM */}
      <List sx={{ mt: "auto" }}>
        <ListItemButton
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          sx={getItemStyles("/logout")}
        >
          <ListItemIcon sx={{ color: COLORS.WHITE }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {open && <ListItemText primary="Logout" />}
        </ListItemButton>
      </List>
    </div>
  );

  /* Mobile */
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onToggle}
        ModalProps={{
          BackdropProps: {
            sx: { backgroundColor: "rgba(0,0,0,0.15)" },
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  /* Desktop */
  return (
    <Drawer
      variant="permanent"
      sx={{
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          overflowX: "hidden",
          backgroundColor: COLORS.SIDEBAR_BG_COLOR,
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          width: "auto",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: 16,
          gap: 6,
        }}
      >
        {open && (
          <Typography sx={{ color: COLORS.WHITE, fontSize: 18 }}>
            Universal Notifier
          </Typography>
        )}
        <IconButton onClick={onToggle} sx={{ color: COLORS.WHITE }}>
          <MenuIcon />
        </IconButton>
      </div>

      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
