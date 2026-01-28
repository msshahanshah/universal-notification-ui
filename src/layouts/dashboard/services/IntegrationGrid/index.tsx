type Props = {
  children: React.ReactNode;
};

import "./index.css";

export const IntegrationGrid = ({ children }: Props) => {
  return <div className="integration-grid">{children}</div>;
};
