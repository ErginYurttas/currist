"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import CapacityPanel from "./components/CapacityPanel";
import UsersTable from "./components/UsersTable";
import SystemAdvisor from "./components/SystemAdvisor";
import {
  getCurrentUserProfile,
  type UserProfile,
} from "../lib/profile";


type AdminUser = {
  user_id: string;
  email: string | null;
  plan: string | null;
  role: string | null;
  email_verified: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  project_count: number;
};

type CapacityStats = {
  total_users: number;
  total_projects: number;
  projects_last_30_days: number;
  projects_previous_30_days: number;
  project_growth_percent: number;
  average_projects_per_user: number;
  maximum_projects_per_user: number;
  users_without_projects: number;
  total_project_data_bytes: number;
  average_project_data_bytes: number;
  largest_project_data_bytes: number;
};

export default function AdminPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState(0);
  const [verifiedUsers, setVerifiedUsers] = useState(0);
  const [pendingUsers, setPendingUsers] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalProjects, setTotalProjects] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [capacityStats, setCapacityStats] =
  useState<CapacityStats | null>(null);

const [capacityLoading, setCapacityLoading] = useState(true);

const [capacityError, setCapacityError] =
  useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

        async function checkAdminAccess() {
      setUsersLoading(true);
      setUsersError(null);
      setStatsLoading(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          window.location.href = "/";
          return;
        }

        const currentProfile = await getCurrentUserProfile();

        if (!isMounted) {
          return;
        }

        if (currentProfile.role !== "admin") {
          setAccessDenied(true);
          return;
        }

        setProfile(currentProfile);

        const { data: statsData, error: statsError } =
          await supabase.rpc("get_admin_stats");

        if (statsError) {
          console.error("Admin statistics failed:", statsError);
        } else if (isMounted) {
          const stats = statsData?.[0];

          setRegisteredUsers(Number(stats?.registered_users ?? 0));
          setVerifiedUsers(Number(stats?.verified_users ?? 0));
          setPendingUsers(Number(stats?.pending_users ?? 0));
          setTotalAdmins(Number(stats?.admin_users ?? 0));
          setTotalProjects(Number(stats?.total_projects ?? 0));
        }

        if (isMounted) {
          setStatsLoading(false);
        }

        const { data: usersData, error: adminUsersError } =
          await supabase.rpc("get_admin_users");

        if (adminUsersError) {
  console.warn("Admin users RPC failed:", {
    message: adminUsersError.message,
    code: adminUsersError.code,
    details: adminUsersError.details,
    hint: adminUsersError.hint,
  });

  if (isMounted) {
    setUsersError(
      adminUsersError.message || "Admin users could not be loaded."
    );
  }
} else if (isMounted) {
          setAdminUsers(
            (usersData ?? []).map((adminUser: AdminUser) => ({
              ...adminUser,
              project_count: Number(adminUser.project_count ?? 0),
            }))
          );

          setUsersError(null);
        }

        if (isMounted) {
          setUsersLoading(false);
        }

        const { data: capacityData, error: capacityRpcError } =
  await supabase.rpc("get_admin_capacity_stats");

if (capacityRpcError) {
  console.warn("Admin capacity RPC failed:", {
    message: capacityRpcError.message,
    code: capacityRpcError.code,
    details: capacityRpcError.details,
    hint: capacityRpcError.hint,
  });

  if (isMounted) {
    setCapacityError(
      capacityRpcError.message || "Capacity statistics could not be loaded."
    );
    setCapacityLoading(false);
  }
} else if (isMounted) {
  const capacity = capacityData?.[0];

  if (capacity) {
    setCapacityStats({
      total_users: Number(capacity.total_users ?? 0),
      total_projects: Number(capacity.total_projects ?? 0),
      projects_last_30_days: Number(
        capacity.projects_last_30_days ?? 0
      ),
      projects_previous_30_days: Number(
        capacity.projects_previous_30_days ?? 0
      ),
      project_growth_percent: Number(
        capacity.project_growth_percent ?? 0
      ),
      average_projects_per_user: Number(
        capacity.average_projects_per_user ?? 0
      ),
      maximum_projects_per_user: Number(
        capacity.maximum_projects_per_user ?? 0
      ),
      users_without_projects: Number(
        capacity.users_without_projects ?? 0
      ),
      total_project_data_bytes: Number(
        capacity.total_project_data_bytes ?? 0
      ),
      average_project_data_bytes: Number(
        capacity.average_project_data_bytes ?? 0
      ),
      largest_project_data_bytes: Number(
        capacity.largest_project_data_bytes ?? 0
      ),
    });
  }

  setCapacityError(null);
  setCapacityLoading(false);
}

      } catch (error) {
        console.error("Admin access check failed:", error);

        if (isMounted) {
        setAccessDenied(true);
        setStatsLoading(false);
        setUsersLoading(false);
        setCapacityLoading(false);
        setCapacityError("Capacity statistics could not be loaded.");
      }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    checkAdminAccess();

    

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        Checking admin access...
      </main>
    );
  }

  if (accessDenied || !profile) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: 24,
          background: "#0f172a",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 520,
            padding: 28,
            border: "1px solid #7f1d1d",
            borderRadius: 14,
            background: "#1e293b",
            textAlign: "center",
          }}
        >
          <div
            style={{
              marginBottom: 10,
              color: "#fca5a5",
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: 0.8,
            }}
          >
            403
          </div>

          <h1
            style={{
              marginTop: 0,
              marginBottom: 10,
            }}
          >
            Access Denied
          </h1>

          <p
            style={{
              marginTop: 0,
              marginBottom: 20,
              color: "#cbd5e1",
              lineHeight: 1.6,
            }}
          >
            This page is available only to Currist administrators.
          </p>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/";
            }}
            style={{
              border: "1px solid #475569",
              borderRadius: 8,
              padding: "9px 14px",
              background: "#334155",
              color: "#f8fafc",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Back to Currist
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 32,
        background: "#0f172a",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <button
          type="button"
          onClick={() => {
            window.location.href = "/";
          }}
          style={{
            marginBottom: 24,
            border: "1px solid #475569",
            borderRadius: 8,
            padding: "8px 12px",
            background: "#1e293b",
            color: "#f8fafc",
            cursor: "pointer",
          }}
        >
          ← Back to Currist
        </button>

        <div
          style={{
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 8,
            }}
          >
            <h1
              style={{
                margin: 0,
                fontSize: 30,
              }}
            >
              Admin Dashboard
            </h1>

            <span
              style={{
                padding: "3px 8px",
                borderRadius: 999,
                background: "#78350f",
                color: "#fef3c7",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.6,
              }}
            >
              ADMIN
            </span>
          </div>

          <p
            style={{
              margin: 0,
              color: "#94a3b8",
            }}
          >
            Signed in as {profile.fullName || "Administrator"}
          </p>
        </div>

            <div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 16,
    marginBottom: 24,
  }}
>
  <div
    style={{
      padding: 20,
      border: "1px solid #334155",
      borderRadius: 14,
      background: "#1e293b",
    }}
  >
    <div
      style={{
        marginBottom: 8,
        color: "#94a3b8",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      Registered Users
    </div>

    <div
      style={{
        fontSize: 30,
        fontWeight: 800,
      }}
    >
      {statsLoading ? "..." : registeredUsers}
    </div>
  </div>

  <div
  style={{
    padding: 20,
    border: "1px solid #334155",
    borderRadius: 14,
    background: "#1e293b",
  }}
>
  <div
    style={{
      marginBottom: 8,
      color: "#94a3b8",
      fontSize: 13,
      fontWeight: 700,
    }}
  >
    Verified Users
  </div>

  <div
    style={{
      fontSize: 30,
      fontWeight: 800,
    }}
  >
    {statsLoading ? "..." : verifiedUsers}
  </div>
</div>

<div
  style={{
    padding: 20,
    border: "1px solid #334155",
    borderRadius: 14,
    background: "#1e293b",
  }}
>
  <div
    style={{
      marginBottom: 8,
      color: "#94a3b8",
      fontSize: 13,
      fontWeight: 700,
    }}
  >
    Pending Verification
  </div>

  <div
    style={{
      fontSize: 30,
      fontWeight: 800,
    }}
  >
    {statsLoading ? "..." : pendingUsers}
  </div>
</div>

  <div
    style={{
      padding: 20,
      border: "1px solid #334155",
      borderRadius: 14,
      background: "#1e293b",
    }}
  >
    <div
      style={{
        marginBottom: 8,
        color: "#94a3b8",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      Total Projects
    </div>

    <div
      style={{
        fontSize: 30,
        fontWeight: 800,
      }}
    >
      {statsLoading ? "..." : totalProjects}
    </div>
  </div>

  <div
    style={{
      padding: 20,
      border: "1px solid #334155",
      borderRadius: 14,
      background: "#1e293b",
    }}
  >
    <div
      style={{
        marginBottom: 8,
        color: "#94a3b8",
        fontSize: 13,
        fontWeight: 700,
      }}
    >
      Admin Users
    </div>

    <div
      style={{
        fontSize: 30,
        fontWeight: 800,
      }}
    >
      {statsLoading ? "..." : totalAdmins}
    </div>
  </div>
</div>

        <section
          style={{
            border: "1px solid #334155",
            borderRadius: 14,
            padding: 24,
            background: "#1e293b",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 10,
              fontSize: 20,
            }}
          >
            Welcome Admin
          </h2>

          <p
            style={{
              margin: 0,
              color: "#cbd5e1",
              lineHeight: 1.6,
            }}
          >
            The admin dashboard is protected by an authenticated profile role
            check.
          </p>
        </section>

     <CapacityPanel
  stats={capacityStats}
  loading={capacityLoading}
  error={capacityError}
/>

<SystemAdvisor
  stats={capacityStats}
  loading={capacityLoading}
  error={capacityError}
/>

<UsersTable
  users={adminUsers}
  loading={usersLoading}
  error={usersError}
/>

      </div>
    </main>
  );
}