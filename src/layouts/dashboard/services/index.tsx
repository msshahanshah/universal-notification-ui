import { Box, Typography } from "@mui/material";
import { useNavigate } from "react-router";

import SERVICES from "src/config/services";

import { IntegrationGrid } from "./IntegrationGrid";
import { IntegrationCard } from "./IntegrationCard/integration-card";

import "./index.css";
const Services = () => {
  const wValue = "100%";
  const hValue = "100%";

  const navigate = useNavigate();

  return (
    <Box
      sx={{
        width: wValue,
        padding: 2,
        display: "flex"
      }}
    >
      <div className="services-container">
        <Typography variant="h6" sx={{ mt: 4, mb: 4 }}>
          All Services
        </Typography>

        <IntegrationGrid>
          {Object.values(SERVICES).map(
            ({ name, enabled, icon, status, path }) => {
              return (
                <IntegrationCard
                  key={name}
                  name={name}
                  icon={icon}
                  enabled={enabled}
                  status={status as "healthy" | "error"}
                  onToggle={() => {}}
                  onSettingsClick={() => navigate(path)}
                />
              );
            },
          )}
        </IntegrationGrid>
      </div>
    </Box>
  );
};

export default Services;
