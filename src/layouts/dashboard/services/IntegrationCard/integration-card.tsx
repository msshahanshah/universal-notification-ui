import "./integration-card.css";

export type IntegrationCardProps = {
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  status: "healthy" | "error";
  onToggle: (value: boolean) => void;
  onSettingsClick: () => void;
};

export const IntegrationCard = ({
  name,
  icon,
  enabled,
  status,
  onToggle,
  onSettingsClick,
}: IntegrationCardProps) => {
  return (
    <div className={`integration-card ${enabled ? "active" : ""}`}>
      <div className="card-header">
        <div className="icon">{icon}</div>
        <label className="switch">
          <input
            data-testid={`services-${name ? name?.toLocaleLowerCase() : ""}`}
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
          />
          <span className="slider" />
        </label>
      </div>

      <h4 className="title">{name}</h4>

      <div className="status">
        <span className={`dot ${status}`} />
        {status === "healthy" ? "Healthy" : "Error"}
      </div>

      <button className="settings-btn" onClick={onSettingsClick}>
        Send ➤
      </button>
    </div>
  );
};
