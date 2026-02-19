import { useState } from "react";
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  Typography,
  InputBase,
  Box,
  Collapse,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, MessageSquare, SlackIcon } from "lucide-react";
import { useTheme, alpha, useColorScheme } from "@mui/material/styles";

import COLORS from "src/utility/colors";

const sidebarItems = [
  {
    label: "Slack",
    path: "/services/slack",
    icon: SlackIcon,
    isDisabled: false,
  },
  {
    label: "Email",
    path: "/services/email-editor",
    icon: Mail,
    isDisabled: false,
  },
  {
    label: "SMS",
    path: "/services/sms",
    icon: MessageSquare,
    isDisabled: false,
  },
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
  const { mode, setMode } = useColorScheme();
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const [search, setSearch] = useState("");

  const isActive = (path: string) => location.pathname.includes(path);
  const isServicesActive = isActive("/services");

  const getItemStyles = (path: string) => {
    const active = isActive(path);

    return {
      gap: 1.5,
      borderRadius: 2,
      mx: 1,
      mt: 1,
      px: 1.5,
      color: active ? theme.palette.primary.main : theme.palette.text.secondary,
      minHeight: 44,
      justifyContent: "center",
      backgroundColor: active
        ? alpha(theme.palette.primary.main, 0.15)
        : "transparent",
      "&:hover": {
        backgroundColor: alpha(theme.palette.primary.main, 0.25),
      },
    };
  };

  const q = search.trim().toLowerCase();

  const matchesDashboard = "dashboard".includes(q);
  const matchesServicesWord = "services".includes(q);

  const matchesServiceItems = sidebarItems.some((item) =>
    item.label.toLowerCase().includes(q),
  );

  const isSearching = q.length > 0;

  const showDashboard = !isSearching || matchesDashboard;

  const showServicesParent =
    !isSearching || matchesServicesWord || matchesServiceItems;

  const filteredItems = !isSearching
    ? sidebarItems
    : sidebarItems.filter((item) => item.label.toLowerCase().includes(q));

  console.log("MODE:", theme.palette.mode);
  console.log("PAPER:", theme.palette.background.paper);

  const drawerContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      {/* <div>{mode} Mode Enabled </div>
      <div onClick={() => setMode(mode === "dark" ? "light" : "dark")}>
        Change Mode
      </div> */}
      {/* SEARCH BAR */}
      {open && (
        <Box
          sx={{
            mx: 1.5,
            mt: 1.5,
            mb: 0.5,
            px: 1.5,
            height: 38,
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderRadius: 2,
            backgroundColor:
              mode === "dark"
                ? alpha(theme.palette.common.white, 0.05)
                : alpha(theme.palette.grey[300], 0.4),
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <SearchIcon
            sx={{ fontSize: 18, color: theme.palette.text.secondary }}
          />
          <InputBase
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              color: theme.palette.text.secondary,
              fontSize: 14,
              width: "100%",
              "&::placeholder": {
                color: theme.palette.text.secondary,
                opacity: 1, // important (default is 0.5 in some browsers)
              },

              "& input::placeholder": {
                color: theme.palette.text.secondary,
                opacity: 1,
              },
            }}
          />
        </Box>
      )}

      {/* TOP */}
      <List>
        {/* Dashboard */}
        {showDashboard && (
          <ListItemButton
            onClick={() => navigate("/dashboard")}
            sx={getItemStyles("/dashboard")}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                justifyContent: "center",
                color: isActive("/dashboard")
                  ? theme.palette.text.secondary
                  : theme.palette.text.secondary,
              }}
            >
              <HomeRoundedIcon fontSize="small" />
            </ListItemIcon>
            {open && <ListItemText primary="Dashboard" />}
          </ListItemButton>
        )}

        {/* Services Parent */}
        {showServicesParent && (
          <ListItemButton
            onClick={() => navigate("/services/slack")}
            sx={getItemStyles("/services")}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                justifyContent: "center",
                color: isServicesActive
                  ? theme.palette.primary.main
                  : theme.palette.text.secondary,
              }}
            >
              <MiscellaneousServicesIcon fontSize="small" />
            </ListItemIcon>
            {open && <ListItemText primary="Services" />}
          </ListItemButton>
        )}

        {/* Services Sub Tabs */}
        {open && (
          <Collapse
            in={isServicesActive || (isSearching && matchesServiceItems)}
            timeout="auto"
            unmountOnExit
          >
            <List disablePadding>
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isDisabled = item.isDisabled;
                return (
                  <ListItemButton
                    key={item.path}
                    onClick={() => !isDisabled && navigate(item.path)}
                    sx={{
                      ml: 4,
                      mr: 1,
                      mt: 0.5,
                      minHeight: 36,
                      borderRadius: 2,
                      // color: COLORS.WHITE,
                      backgroundColor: isDisabled
                        ? theme.palette.action.disabledBackground
                        : isActive(item.path)
                          ? alpha(theme.palette.primary.main, 0.15)
                          : "transparent",

                      color: isDisabled
                        ? theme.palette.text.disabled
                        : "text.secondary",

                      "&:hover": {
                        backgroundColor: isDisabled
                          ? theme.palette.action.disabledBackground
                          : alpha(theme.palette.primary.main, 0.25),
                      },
                    }}
                  >
                    <Icon size={18} className="service-icon" />
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: 13,
                      }}
                      style={{ marginLeft: 10 }}
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
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/";
          }}
          sx={getItemStyles("/logout")}
        >
          <ListItemIcon sx={{ color: "text.secondary" }}>
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
            sx: { backgroundColor: theme.palette.background.paper },
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
          backgroundColor: theme.palette.background.paper,
          backdropFilter: "blur(12px)",
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          width: "auto",
        },
      }}
    >
      {/* HEADER */}
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
          <Typography sx={{ color: "text.secondary", fontSize: 18 }}>
            Universal Notifier
          </Typography>
        )}
        <IconButton
          onClick={onToggle}
          sx={{ color: "text.secondary", border: "none",background: "transparent" }}
        >
          <MenuIcon />
        </IconButton>
      </div>

      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
