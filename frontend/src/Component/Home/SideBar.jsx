import { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Home.css";

export default function SideBar() {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <aside
      className={`sidebar ${
        collapsed ? "sidebar-collapsed" : "sidebar-expanded"
      }`}
    >
      {/* Header */}
      {/* <div className="sidebar-header">
        <div className="brand-mark">W</div>

        {!collapsed && (
          <div className="brand-text">
            <span className="brand-name">WeakToPeak</span>

            <span className="brand-subtitle">
              Adaptive Assessment
            </span>
          </div>
        )}

        <button
          type="button"
          className="sidebar-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={
            collapsed
              ? "Expand sidebar"
              : "Collapse sidebar"
          }
        >
          {collapsed ? "→" : "←"}
        </button>
      </div> */}

      <div className="sidebar-header">
        <div className="brand-logo-wrapper">
          <div className="brand-mark">W</div>

          <button
            type="button"
            className="sidebar-toggle"
            onClick={() => setCollapsed((prev) => !prev)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? "→" : "←"}
          </button>
        </div>

        {!collapsed && (
          <div className="brand-text">
            <span className="brand-name">WeakToPeak</span>

            <span className="brand-subtitle">Adaptive Assessment</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="sidebar-navigation">
        <div className="sidebar-section">
          {!collapsed && <p className="sidebar-section-title">ASSESSMENT</p>}

          <NavLink
            to="/Home"
            end
            title={collapsed ? "New Test" : undefined}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">+</span>

            {!collapsed && <span className="sidebar-link-text">New Test</span>}
          </NavLink>

          <NavLink
            to="/performance"
            title={collapsed ? "Performance" : undefined}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">◔</span>

            {!collapsed && (
              <span className="sidebar-link-text">Performance</span>
            )}
          </NavLink>

          <NavLink
            to="/history"
            title={collapsed ? "Test History" : undefined}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">▤</span>

            {!collapsed && (
              <span className="sidebar-link-text">Test History</span>
            )}
          </NavLink>
        </div>

        <div className="sidebar-section">
          {!collapsed && <p className="sidebar-section-title">PREFERENCES</p>}

          <NavLink
            to="/settings"
            title={collapsed ? "Settings" : undefined}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            <span className="sidebar-link-icon">⚙</span>

            {!collapsed && <span className="sidebar-link-text">Settings</span>}
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="sidebar-footer">
          <div className="footer-line"></div>

          <p>
            Spot weakness.
            <br />
            Reach peak.
          </p>
        </div>
      )}
    </aside>
  );
}
