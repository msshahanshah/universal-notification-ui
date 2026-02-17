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
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");

  const [search, setSearch] = useState("");

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

  // const filteredItems = sidebarItems.filter((item) =>
  //   item.label.toLowerCase().includes(search.toLowerCase()),
  // );

  const q = search.trim().toLowerCase();

  const matchesDashboard = "dashboard".includes(q);
  const matchesServicesWord = "services".includes(q);

  const matchesServiceItems = sidebarItems.some((item) =>
    item.label.toLowerCase().includes(q),
  );

  const isSearchingDashboard = q.length > 0 && "dashboard".includes(q);

  const isSearchingServices =
    q.length > 0 &&
    (sidebarItems.some((item) => item.label.toLowerCase().includes(q)) ||
      "services".includes(q));

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
        backgroundColor: "hsla(220, 35%, 3%, 0.4)",
      }}
    >
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
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.6)" }} />
          <InputBase
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              color: COLORS.WHITE,
              fontSize: 14,
              width: "100%",
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
                color: isActive("/dashboard") ? "#4fc3f7" : COLORS.WHITE,
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
                color: isServicesActive ? "#4fc3f7" : COLORS.WHITE,
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
                      color: COLORS.WHITE,
                      backgroundColor: isDisabled
                        ? "rgba(255, 0, 0, 0.06)" // 👈 ultra-light red
                        : isActive(item.path)
                          ? "hsla(220, 80%, 55%, 0.25)"
                          : "transparent",

                      cursor: isDisabled ? "not-allowed" : "pointer",

                      "&:hover": {
                        backgroundColor: isDisabled
                          ? "rgba(255, 0, 0, 0.08)" // tiny hover change
                          : "hsla(220, 80%, 55%, 0.35)",
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
          <Typography sx={{ color: COLORS.WHITE, fontSize: 18 }}>
            Universal Notifier
          </Typography>
        )}
        <IconButton
          onClick={onToggle}
          sx={{ color: COLORS.WHITE, border: "none" }}
        >
          <MenuIcon />
        </IconButton>
      </div>

      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
