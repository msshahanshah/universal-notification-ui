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
import { useTheme, useColorScheme } from "@mui/material/styles";

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

  const [servicesOpen, setServicesOpen] = useState(isServicesActive);

  const getItemStyles = (path: string) => {
    const active = isActive(path);

    return {
      gap: 1.5,
      borderRadius: 2,
      mx: 1,
      mt: 1,
      px: 1.5,
      minHeight: 44,
      justifyContent: "center",
      bgcolor: active ? "primary.main" : "transparent",

      color: active ? COLORS.WHITE : "text.secondary",

      "&:hover": {
        bgcolor: active ? "primary.main" : "transparent",
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

  const drawerContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: theme.vars?.palette.background.paper,
        color: theme.vars?.palette.text.primary,
      }}
    >
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
            bgColor: "background.default",
            border: `1px solid ${theme.vars?.palette?.divider}`,
          }}
        >
          <SearchIcon
            sx={{ fontSize: 18, color: theme.vars?.palette.text.secondary }}
          />
          <InputBase
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              color: theme.vars?.palette.text.secondary,
              fontSize: 14,
              width: "100%",
              "&::placeholder": {
                color: theme.vars?.palette.text.secondary,
                opacity: 1, // important (default is 0.5 in some browsers)
              },

              "& input::placeholder": {
                color: theme.vars?.palette.text.secondary,
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
              }}
            >
              <HomeRoundedIcon fontSize="small" className="service-icon" />
            </ListItemIcon>
            {open && <ListItemText primary="Dashboard" />}
          </ListItemButton>
        )}

        {/* Services Parent */}
        {showServicesParent && (
          <ListItemButton
            onClick={() => {
              // setServicesOpen((prev) => !prev);
              if (!open) {
                onToggle(); // expand sidebar
              }
              navigate("/services/slack");
            }}
            sx={getItemStyles("/services")}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                justifyContent: "center",
              }}
            >
              <MiscellaneousServicesIcon
                fontSize="small"
                className="service-icon"
              />
            </ListItemIcon>
            {open && <ListItemText primary="Services" />}
          </ListItemButton>
        )}

        {/* Services Sub Tabs */}
        {open && (
          <Collapse
            in={open && (isServicesActive || (isSearching && matchesServiceItems))}
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
                      ...getItemStyles(item.path),
                      ml: 4,
                      mr: 1,
                      mt: 0.5,
                      minHeight: 36,
                      borderRadius: 2,
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
      <Drawer variant="temporary" open={mobileOpen} onClose={onToggle}>
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
          bgcolor: "background.paper",
          backdropFilter: "blur(12px)",
          borderRight: `1px solid ${theme.vars?.palette.divider}`,
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
          sx={{
            color: "text.secondary",
            border: "none",
            background: "transparent",
          }}
        >
          <MenuIcon />
        </IconButton>
      </div>

      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
