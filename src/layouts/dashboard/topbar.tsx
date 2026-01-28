import {
  AppBar,
  Toolbar,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import COLORS from "src/utility/colors";

const TopBar = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const isMobile = useMediaQuery("(max-width:768px)");

  if (!isMobile) return null;

  return (
    <AppBar
      position="fixed"
      sx={{ backgroundColor: "white", boxShadow: "none" }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          onClick={onMenuClick}
          sx={{ color: COLORS.DARK_DESATURATED_BLUE }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
