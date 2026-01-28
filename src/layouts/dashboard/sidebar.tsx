import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MiscellaneousServicesIcon from "@mui/icons-material/MiscellaneousServices";
import { useLocation, useNavigate } from "react-router-dom";

import COLORS from "src/utility/colors";

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

  const isActive = (path: string) => location.pathname?.includes(path);

  const getItemStyles = (path: string) => ({
    gap: 1.5,
    borderRadius: 2,
    mx: 1,
    mt: 1,
    px: 1.5,
    color: COLORS.WHITE,

    backgroundColor: isActive(path)
      ? "hsla(220, 80%, 55%, 0.25)"
      : "transparent",

    "&:hover": {
      backgroundColor: "hsla(220, 80%, 55%, 0.35)",
    },
    justifyContent: "center",
    minHeight: 44,
  });

  const drawerContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "hsla(220, 35%, 3%, 0.4) !important",
      }}
    >
      {/* TOP SECTION */}
      <List>
        <ListItemButton
          onClick={() => navigate("/dashboard")}
          sx={getItemStyles("/dashboard")}
        >
          <ListItemIcon
            sx={{
              minWidth: 0, // 🔥 remove MUI default spacing
              justifyContent: "center",
              color: isActive("/dashboard")
                ? "#4fc3f7" // active icon pop
                : COLORS.WHITE,
            }}
          >
            <HomeRoundedIcon fontSize="small" />
          </ListItemIcon>
          {open && <ListItemText primary="Dashboard" />}
        </ListItemButton>
        <ListItemButton
          onClick={() => navigate("/services")}
          sx={getItemStyles("/services")}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              justifyContent: "center",
              color: isActive("/services") ? "#4fc3f7" : COLORS.WHITE,
            }}
          >
            <MiscellaneousServicesIcon fontSize="small" />
          </ListItemIcon>
          {open && <ListItemText primary="Services" />}
        </ListItemButton>
      </List>

      {/* BOTTOM SECTION */}
      <List sx={{ marginTop: "auto" }}>
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

  // Mobile Drawer
  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onToggle}
        ModalProps={{
          BackdropProps: {
            sx: {
              backgroundColor: "rgba(0,0,0,0.15)",
            },
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  // Desktop Drawer
  return (
    <Drawer
      variant="permanent"
      sx={{
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          overflowX: "hidden",
          transition: (theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.standard,
            }),
          backgroundColor: COLORS.SIDEBAR_BG_COLOR,
          width: "auto",
        },
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          margin: 16,
          marginLeft: open ? 16 : 16,
          gap: 5,
        }}
      >
        {open && (
          <Typography variant="h6" sx={{ color: COLORS.WHITE, fontSize: 18 }}>
            Universal Notifier
          </Typography>
        )}
        <IconButton onClick={onToggle} sx={{ color: COLORS.WHITE, border: 'none' }}>
          <MenuIcon />
        </IconButton>
      </div>

      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
