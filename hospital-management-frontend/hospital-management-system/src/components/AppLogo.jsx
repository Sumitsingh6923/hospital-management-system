function AppLogo({ size = "md", showText = false, className = "" }) {
  return (
    <span className={`app-logo app-logo-${size} ${className}`}>
      <span className="app-logo-mark" aria-hidden="true">
        <span className="app-logo-shield">
          <span className="app-logo-cross app-logo-cross-vertical" />
          <span className="app-logo-cross app-logo-cross-horizontal" />
          <span className="app-logo-heartbeat" />
        </span>
      </span>
      {showText && (
        <span className="app-logo-text">
          <span className="app-logo-name">CareDesk</span>
          <span className="app-logo-tagline">Hospital Management</span>
        </span>
      )}
    </span>
  );
}

export default AppLogo;
