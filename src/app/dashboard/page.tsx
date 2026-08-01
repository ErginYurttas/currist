"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProjectManager } from "../project/project-manager";
import {
  getCurrentUserProfile,
  type UserProfile,
} from "../lib/profile";
import CurristLogo from "../components/CurristLogo";
import { theme } from "../design/theme";
import { supabase } from "../lib/supabase";

type CloudProjects = Awaited<
  ReturnType<typeof ProjectManager.getCloudProjects>
>;

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      style={{
        width: 18,
        height: 18,
        flexShrink: 0,
      }}
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      style={{
        width: 20,
        height: 20,
        flexShrink: 0,
      }}
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      style={{
        width: 24,
        height: 24,
        flexShrink: 0,
      }}
    >
      <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2h7.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-10Z" />
    </svg>
  );
}

function WorkspaceIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      style={{
        width: 24,
        height: 24,
        flexShrink: 0,
      }}
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M8 9h8" />
      <path d="M8 13h5" />
      <path d="M8 17h7" />
    </svg>
  );
}

function PlansIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      style={{
        width: 24,
        height: 24,
        flexShrink: 0,
      }}
    >
      <path d="M12 3 4 7v5c0 5 3.4 8.7 8 10 4.6-1.3 8-5 8-10V7l-8-4Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LearnIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      style={{
        width: 24,
        height: 24,
        flexShrink: 0,
      }}
    >
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v17H6.5A2.5 2.5 0 0 0 4 22V5.5Z" />
      <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v17h4.5A2.5 2.5 0 0 1 20 22V5.5Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
      style={{
        width: 24,
        height: 24,
        flexShrink: 0,
      }}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<CloudProjects>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState(""); 

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [
  currentProfile,
  cloudProjects,
  sessionResult,
] = await Promise.all([
  getCurrentUserProfile(),
  ProjectManager.getCloudProjects(),
  supabase.auth.getSession(),
]);

        setProfile(currentProfile);
        setProjects(cloudProjects);
        setUserEmail(
  sessionResult.data.session?.user.email || ""
);
      } catch (error) {
        console.error("Dashboard could not be loaded.", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout failed.", error);
    return;
  }

  window.location.href = "/login";
};

  const firstName =
    profile?.fullName?.trim().split(" ")[0] || "Engineer";

  const profileInitial =
    profile?.fullName?.trim().charAt(0).toUpperCase() || "C";

  return (
    <main className="dashboard-page">
      
      <header className="dashboard-header">
  <CurristLogo href="/dashboard" />

  <div className="dashboard-header-actions">
    <Link href="/tool" className="header-link">
      Workspace
    </Link>

    {profile?.role === "admin" && (
      <Link href="/admin" className="header-link">
        Admin
      </Link>
    )}

    <div className="user-menu-wrapper">
  <button
    type="button"
    className="user-menu-button"
    onClick={() =>
      setUserMenuOpen((currentValue) => !currentValue)
    }
    aria-expanded={userMenuOpen}
  >
    <div className="profile-avatar">
      {profileInitial}
    </div>

    <span className="user-menu-name">
      {profile?.fullName || "Currist User"}
    </span>

    <span className="user-menu-arrow">
      {userMenuOpen ? "▲" : "▼"}
    </span>
  </button>

  {userMenuOpen && (
    <div className="user-menu-dropdown">
      <div className="user-menu-header">
        <strong>
          {profile?.fullName || "Currist User"}
        </strong>

        <span>{userEmail}</span>
      </div>

      <div className="user-menu-badges">
        <span className="plan-badge">
          {(profile?.plan || "basic").toUpperCase()}
        </span>

        {profile?.role === "admin" && (
          <span className="admin-badge">
            ADMIN
          </span>
        )}
      </div>

      <div className="user-menu-divider" />

      <Link
        href="/profile"
        className="user-menu-item"
        onClick={() => setUserMenuOpen(false)}
      >
        Profile
      </Link>

      <Link
        href="/tool"
        className="user-menu-item"
        onClick={() => setUserMenuOpen(false)}
      >
        My Workspace
      </Link>

      {profile?.role === "admin" && (
        <Link
          href="/admin"
          className="user-menu-item admin-menu-item"
          onClick={() => setUserMenuOpen(false)}
        >
          Admin Dashboard
        </Link>
      )}

      <div className="user-menu-divider" />

      <button
        type="button"
        className="user-menu-item logout-menu-item"
        onClick={handleLogout}
      >
        Log out
      </button>
    </div>
  )}
</div>

  </div>
</header>

      <div className="dashboard-content">
        <section className="hero-section">
          <div className="hero-glow hero-glow-one" />
          <div className="hero-glow hero-glow-two" />

          <div className="hero-content">
            <div className="status-label">
              <span className="status-dot" />
              Workspace ready
            </div>

            <h1>Welcome back, {firstName}.</h1>

            <p>
              Manage your electrical design projects, continue your
              calculations and keep every structure, panel and load organised
              in one engineering workspace.
            </p>

            <div className="hero-actions">
              <Link
                href="/tool?newProject=true"
                className="primary-button"
              >
                <PlusIcon />
                Create New Project
              </Link>

              <Link href="/tool" className="secondary-button">
                Open Workspace
                <ArrowIcon />
              </Link>
            </div>

            <div className="feature-list">
              <span>✓ Cloud project storage</span>
              <span>✓ Panel and load management</span>
              <span>✓ Engineering workspace</span>
            </div>
          </div>

          
        </section>

        <section className="projects-section">
  <div className="projects-header">
    <div>
      <span className="section-label">Project workspace</span>

      <h2>Projects</h2>

      <p>
        Create a new project or continue working on an existing
        electrical design.
      </p>
    </div>

    <div className="projects-header-actions">
      <span className="project-count">
        {projects.length}{" "}
        {projects.length === 1 ? "project" : "projects"}
      </span>

      <Link
        href="/tool?newProject=true"
        className="new-project-button"
      >
        <PlusIcon />
        New Project
      </Link>
    </div>
  </div>

  {isLoading ? (
    <div className="projects-loading-list">
      {Array.from({ length: 2 }).map((_, index) => (
        <div className="project-row-loading" key={index}>
          <span className="loading-square" />

          <div className="project-loading-content">
            <span className="loading-title" />
            <span className="loading-text" />
          </div>
        </div>
      ))}
    </div>
  ) : projects.length === 0 ? (
    <div className="empty-projects">
      <span className="empty-projects-icon">
        <FolderIcon />
      </span>

      <h3>No projects yet</h3>

      <p>
        Create your first electrical project and start building its
        structures, panels and loads.
      </p>

      <Link
        href="/tool?newProject=true"
        className="new-project-button"
      >
        <PlusIcon />
        Create First Project
      </Link>
    </div>
  ) : (
    <div className="projects-list">
      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/tool?projectId=${project.id}`}
          className="project-row"
        >
          <span className="project-row-icon">
            <FolderIcon />
          </span>

          <div className="project-row-main">
            <strong>
              {project.name || "Untitled Project"}
            </strong>

            <span>
              {project.buildingType || "Building type not selected"}
              {" · "}
              {project.projectCountry || "Country not selected"}
            </span>
          </div>

          <div className="project-row-date">
            <span>Last updated</span>

            <strong>
              {new Date(project.updatedAt).toLocaleDateString(
                "en-GB",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}
            </strong>
          </div>

          <span className="project-row-action">
            Open
            <ArrowIcon />
          </span>
        </Link>
      ))}
    </div>
  )}
</section>

        

        <footer className="dashboard-footer">
          <span>
            © {new Date().getFullYear()} Currist
          </span>

          <span>
            Electrical project design and management platform.
          </span>
        </footer>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .dashboard-page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at 70% -10%,
              rgba(79, 195, 247, 0.08),
              transparent 34%
            ),
            #0f172a;
          color: white;
          font-family: ${theme.typography.fontFamily};
        }

        .dashboard-header {
  width: 100%;
  height: 72px;
  box-sizing: border-box;
  padding: 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  border-bottom: 1px solid #1e293b;
  background: #0f172a;
  position: sticky;
  top: 0;
  z-index: 100;
}

        .brand {
        display: flex;
        align-items: center;
        gap: 11px;
        color: white;
        text-decoration: none;
        font-size: 24px;
        font-weight: 700;
        }

        .brand-symbol {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #334155;
          border-radius: 11px;
          background: #162033;
          font-size: 20px;
        }

        .brand-name,
        .brand-description {
          display: block;
        }

        .brand-name {
          font-size: 20px;
          font-weight: 700;
        }

        .brand-description {
          margin-top: 2px;
          color: #94a3b8;
          font-size: 11px;
        }

        

        .dashboard-header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
}

.header-link {
  min-height: 40px;
  padding: 0 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #334155;
  border-radius: 10px;
  background: #0f172a;
  color: #cbd5e1;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.header-link:hover {
  border-color: #475569;
  background: #1e293b;
  color: #ffffff;
}

.user-menu-wrapper {
  position: relative;
}

.user-menu-button {
  min-height: 42px;
  padding: 5px 10px 5px 6px;
  display: flex;
  align-items: center;
  gap: 9px;
  border: 1px solid #334155;
  border-radius: 10px;
  background: #0f172a;
  color: #ffffff;
  cursor: pointer;
  font-family: inherit;
}

.user-menu-button:hover,
.user-menu-button[aria-expanded="true"] {
  border-color: #475569;
  background: #1e293b;
}

.profile-avatar {
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #1e40af;
  color: #ffffff;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
}

.user-menu-name {
  max-width: 150px;
  overflow: hidden;
  font-size: 13px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu-arrow {
  color: #94a3b8;
  font-size: 10px;
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 1000;
  width: 260px;
  padding: 10px;
  border: 1px solid #334155;
  border-radius: 12px;
  background: #0f172a;
  color: #ffffff;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.4);
}

.user-menu-header {
  padding: 6px 8px 10px;
}

.user-menu-header strong,
.user-menu-header span {
  display: block;
}

.user-menu-header strong {
  font-size: 13px;
}

.user-menu-header span {
  margin-top: 4px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-menu-badges {
  padding: 0 8px 10px;
  display: flex;
  gap: 7px;
}

.plan-badge,
.admin-badge {
  padding: 3px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 800;
}

.plan-badge {
  background: #1e3a8a;
  color: #bfdbfe;
}

.admin-badge {
  background: #7c2d12;
  color: #fed7aa;
}

.user-menu-divider {
  height: 1px;
  margin: 6px 0;
  background: #334155;
}

.user-menu-item {
  width: 100%;
  min-height: 36px;
  padding: 9px 10px;
  display: flex;
  align-items: center;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #ffffff;
  font-family: inherit;
  font-size: 13px;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}

.user-menu-item:hover {
  background: #1e293b;
}

.admin-menu-item {
  color: #fdba74;
  font-weight: 700;
}

.logout-menu-item {
  color: #fca5a5;
  font-weight: 700;
}
        

        

        .dashboard-content {
          width: min(1380px, calc(100% - 40px));
          margin: 0 auto;
          padding: 34px 0 60px;
        }

        .hero-section {
  position: relative;
  overflow: hidden;
  min-height: 280px;
  padding: 42px 48px;
  display: block;
  border: 1px solid #334155;
  border-radius: 20px;
  background:
    linear-gradient(
      130deg,
      rgba(79, 195, 247, 0.08),
      transparent 42%
    ),
    #111c32;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.25);
}

        .hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .hero-glow-one {
          width: 280px;
          height: 280px;
          top: -160px;
          right: 20%;
          background: rgba(79, 195, 247, 0.15);
        }

        .hero-glow-two {
          width: 230px;
          height: 230px;
          left: 15%;
          bottom: -170px;
          background: rgba(56, 189, 248, 0.09);
        }

        .hero-content {
  position: relative;
  z-index: 1;
}

        .status-label {
          width: max-content;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 11px;
          border: 1px solid #334155;
          border-radius: 999px;
          background: rgba(30, 41, 59, 0.78);
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 700;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 13px rgba(34, 197, 94, 0.8);
        }

        .hero-content h1 {
          margin: 22px 0 0;
          max-width: 700px;
          font-size: clamp(34px, 4vw, 54px);
          line-height: 1.08;
          letter-spacing: -1.6px;
        }

        .hero-content > p {
          max-width: 700px;
          margin: 20px 0 0;
          color: #cbd5e1;
          font-size: 16px;
          line-height: 1.75;
        }

        .hero-actions {
          margin-top: 30px;
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .primary-button,
        .secondary-button {
          min-height: 46px;
          padding: 0 18px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 800;
          text-decoration: none;
          transition:
            transform 160ms ease,
            background 160ms ease,
            border-color 160ms ease;
        }

        .primary-button {
          border: 1px solid #4fc3f7;
          background: #4fc3f7;
          color: #082f49;
        }

        .primary-button:hover,
        .secondary-button:hover {
          transform: translateY(-2px);
        }

        .primary-button:hover {
          background: #7dd3fc;
        }

        .secondary-button {
          border: 1px solid #475569;
          background: #1e293b;
          color: white;
        }

        .secondary-button:hover {
          border-color: #64748b;
          background: #263449;
        }

        .feature-list {
          margin-top: 27px;
          display: flex;
          flex-wrap: wrap;
          gap: 10px 24px;
          color: #94a3b8;
          font-size: 12px;
        }

        .workspace-preview {
          padding: 22px;
          border: 1px solid #334155;
          border-radius: 17px;
          background: rgba(15, 23, 42, 0.78);
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.28);
          backdrop-filter: blur(16px);
        }

        .preview-header {
          padding-bottom: 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #334155;
        }

        .preview-header strong {
          display: block;
          margin-top: 6px;
          font-size: 17px;
        }

        .section-label {
          color: #4fc3f7;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .active-badge {
          padding: 6px 10px;
          border: 1px solid rgba(34, 197, 94, 0.28);
          border-radius: 999px;
          background: rgba(34, 197, 94, 0.1);
          color: #86efac;
          font-size: 11px;
          font-weight: 800;
        }

        .statistics-grid {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .statistic-card {
          padding: 15px 13px;
          border: 1px solid #334155;
          border-radius: 11px;
          background: #111c32;
        }

        .statistic-card strong,
        .statistic-card span {
          display: block;
        }

        .statistic-card strong {
          font-size: 20px;
        }

        .statistic-card span {
          margin-top: 6px;
          color: #94a3b8;
          font-size: 10px;
        }

        .workflow-card {
          margin-top: 12px;
          padding: 16px;
          border: 1px solid #334155;
          border-radius: 11px;
          background: #111c32;
        }

        .workflow-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
        }

        .workflow-header span {
          color: #4fc3f7;
          font-size: 11px;
          font-weight: 700;
        }

        .workflow-line {
          height: 5px;
          margin-top: 15px;
          overflow: hidden;
          border-radius: 999px;
          background: #1e293b;
        }

        .workflow-line span {
          width: 76%;
          height: 100%;
          display: block;
          border-radius: inherit;
          background: linear-gradient(90deg, #4fc3f7, #38bdf8);
        }

        .workflow-steps {
          margin-top: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          color: #94a3b8;
          font-size: 10px;
          text-align: center;
        }

        .step-dot {
          width: 8px;
          height: 8px;
          display: block;
          margin: 0 auto 7px;
          border-radius: 50%;
        }

        .completed {
          background: #22c55e;
        }

        .panel-step {
          background: #4fc3f7;
        }

        .load-step {
          background: #38bdf8;
        }

        .sync-message {
          margin-top: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          border: 1px solid #334155;
          border-radius: 10px;
          background: #1e293b;
        }

        .sync-message span {
          color: #94a3b8;
          font-size: 10px;
        }

        .sync-message strong {
          font-size: 11px;
        }

        .dashboard-section {
          margin-top: 46px;
        }

        .section-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 24px;
        }

        .section-heading h2 {
          margin: 7px 0 0;
          font-size: 27px;
          letter-spacing: -0.6px;
        }

        .section-heading p {
          margin: 9px 0 0;
          color: #94a3b8;
          font-size: 13px;
          line-height: 1.6;
        }

        .project-count {
  padding: 7px 10px;
  border: 1px solid #334155;
  border-radius: 999px;
  background: #111c32;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.projects-section {
  margin-top: 46px;
  padding: 26px;
  border: 1px solid #334155;
  border-radius: 18px;
  background: #111827;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
}

.projects-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  padding-bottom: 22px;
  border-bottom: 1px solid #263449;
}

.projects-header h2 {
  margin: 7px 0 0;
  color: #f8fafc;
  font-size: 27px;
  letter-spacing: -0.6px;
}

.projects-header p {
  max-width: 620px;
  margin: 9px 0 0;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
}

.projects-header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.new-project-button {
  min-height: 42px;
  padding: 0 15px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid #4fc3f7;
  border-radius: 10px;
  background: #4fc3f7;
  color: #082f49;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
  transition:
    transform 160ms ease,
    background 160ms ease;
}

.new-project-button:hover {
  transform: translateY(-2px);
  background: #7dd3fc;
}

.projects-list,
.projects-loading-list {
  margin-top: 18px;
  display: grid;
  gap: 10px;
}

.project-row {
  min-height: 86px;
  padding: 15px 16px;
  display: grid;
  grid-template-columns:
    44px minmax(220px, 1fr) minmax(130px, auto) auto;
  align-items: center;
  gap: 16px;
  border: 1px solid #263449;
  border-radius: 13px;
  background: #0f172a;
  color: #f8fafc;
  text-decoration: none;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background 160ms ease;
}

.project-row:hover {
  transform: translateY(-2px);
  border-color: #4fc3f7;
  background: #162033;
}

.project-row-icon {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #334155;
  border-radius: 11px;
  background: #1e293b;
  color: #4fc3f7;
}

.project-row-main {
  min-width: 0;
}

.project-row-main strong,
.project-row-main span {
  display: block;
}

.project-row-main strong {
  overflow: hidden;
  color: #f8fafc;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-row-main span {
  margin-top: 7px;
  overflow: hidden;
  color: #94a3b8;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-row-date {
  text-align: right;
  white-space: nowrap;
}

.project-row-date span,
.project-row-date strong {
  display: block;
}

.project-row-date span {
  color: #64748b;
  font-size: 10px;
}

.project-row-date strong {
  margin-top: 6px;
  color: #cbd5e1;
  font-size: 11px;
}

.project-row-action {
  min-height: 36px;
  padding: 0 11px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  border: 1px solid #334155;
  border-radius: 9px;
  background: #172033;
  color: #cbd5e1;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

.project-row:hover .project-row-action {
  border-color: #4fc3f7;
  color: #ffffff;
}

.empty-projects {
  margin-top: 18px;
  min-height: 270px;
  padding: 34px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px dashed #475569;
  border-radius: 14px;
  background: #0f172a;
  text-align: center;
}

.empty-projects-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #334155;
  border-radius: 13px;
  background: #1e293b;
  color: #4fc3f7;
}

.empty-projects h3 {
  margin: 18px 0 0;
  color: #f8fafc;
  font-size: 19px;
}

.empty-projects p {
  max-width: 470px;
  margin: 10px 0 20px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.7;
}

.project-row-loading {
  min-height: 86px;
  padding: 15px 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #263449;
  border-radius: 13px;
  background: #0f172a;
  animation: pulse 1.4s infinite;
}

.project-loading-content {
  width: 100%;
}

.loading-square,
.loading-title,
.loading-text {
  display: block;
  border-radius: 7px;
  background: #1e293b;
}

.loading-square {
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
}

.loading-title {
  width: min(260px, 55%);
  height: 14px;
}

.loading-text {
  width: min(390px, 72%);
  height: 10px;
  margin-top: 11px;
}

        

        

        .dashboard-footer {
          margin-top: 52px;
          padding: 22px 0 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid #1e293b;
          color: #64748b;
          font-size: 11px;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }

          50% {
            opacity: 0.55;
          }
        }

        @media (max-width: 1050px) {
          .dashboard-header {
            grid-template-columns: 1fr auto;
          }

          .main-navigation {
            display: none;
          }

          .hero-section {
            grid-template-columns: 1fr;
          }

          .workspace-preview {
            width: 100%;
          }

          .project-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          
        }

        @media (max-width: 680px) {
          .dashboard-header {
            padding: 0 16px;
          }

          .profile-text {
            display: none;
          }

          .brand-description {
            display: none;
          }

          .dashboard-content {
            width: min(100% - 24px, 1380px);
            padding-top: 18px;
          }

          .hero-section {
            min-height: auto;
            padding: 27px 20px;
            gap: 34px;
            border-radius: 15px;
          }

          .hero-content h1 {
            font-size: 34px;
          }

          .hero-actions {
            flex-direction: column;
          }

          .primary-button,
          .secondary-button {
            width: 100%;
          }

          .feature-list {
            flex-direction: column;
            gap: 8px;
          }

          .workspace-preview {
            padding: 16px;
          }

          .statistics-grid {
            grid-template-columns: 1fr;
          }

          .section-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .project-grid {
  grid-template-columns: 1fr;
}
          

          .dashboard-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}