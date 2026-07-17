"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

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

type UsersTableProps = {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
};

type EditableUser = AdminUser & {
  draftPlan: string;
  draftRole: string;
};

const validPlans = ["basic", "standard", "advanced"];
const validRoles = ["user", "admin"];

export default function UsersTable({
  users,
  loading,
  error,
}: UsersTableProps) {
  const [editableUsers, setEditableUsers] = useState<EditableUser[]>([]);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [rowMessages, setRowMessages] = useState<
    Record<string, { type: "success" | "error"; text: string }>
  >({});
  const [searchText, setSearchText] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [sortOption, setSortOption] = useState("newest");

  useEffect(() => {
    setEditableUsers(
      users.map((user) => ({
        ...user,
        draftPlan: validPlans.includes(user.plan ?? "")
          ? user.plan!
          : "basic",
        draftRole: validRoles.includes(user.role ?? "")
          ? user.role!
          : "user",
      }))
    );
  }, [users]);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    const users = editableUsers.filter((user) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        (user.email ?? "").toLowerCase().includes(normalizedSearch);

      const matchesPlan =
        planFilter === "all" || user.draftPlan === planFilter;

      const matchesRole =
  roleFilter === "all" || user.draftRole === roleFilter;

const matchesVerification =
  verificationFilter === "all" ||
  (verificationFilter === "verified" && user.email_verified) ||
  (verificationFilter === "not-verified" && !user.email_verified);

return (
  matchesSearch &&
  matchesPlan &&
  matchesRole &&
  matchesVerification
);

     });

    return users.sort((a, b) => {
  switch (sortOption) {
    case "newest":
      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      );

    case "oldest":
      return (
        new Date(a.created_at).getTime() -
        new Date(b.created_at).getTime()
      );

    case "projects":
      return b.project_count - a.project_count;

    case "last-login": {
      const aTime = a.last_sign_in_at
        ? new Date(a.last_sign_in_at).getTime()
        : 0;

      const bTime = b.last_sign_in_at
        ? new Date(b.last_sign_in_at).getTime()
        : 0;

      return bTime - aTime;
    }

    default:
      return 0;
  }
});
  }, [
  editableUsers,
  searchText,
  planFilter,
  roleFilter,
  verificationFilter,
  sortOption,
]);

  function updateDraft(
    userId: string,
    field: "draftPlan" | "draftRole",
    value: string
  ) {
    setEditableUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.user_id === userId
          ? {
              ...user,
              [field]: value,
            }
          : user
      )
    );

    setRowMessages((currentMessages) => {
      const nextMessages = { ...currentMessages };
      delete nextMessages[userId];
      return nextMessages;
    });
  }

  async function saveUser(user: EditableUser) {
    const planChanged = user.draftPlan !== user.plan;
    const roleChanged = user.draftRole !== user.role;

    if (!planChanged && !roleChanged) {
      setRowMessages((currentMessages) => ({
        ...currentMessages,
        [user.user_id]: {
          type: "success",
          text: "No changes.",
        },
      }));

      return;
    }

    const confirmed = window.confirm(
      `Update ${user.email ?? "this user"}?\n\n` +
        `Plan: ${user.plan ?? "-"} → ${user.draftPlan}\n` +
        `Role: ${user.role ?? "-"} → ${user.draftRole}`
    );

    if (!confirmed) {
      return;
    }

    setSavingUserId(user.user_id);

    setRowMessages((currentMessages) => {
      const nextMessages = { ...currentMessages };
      delete nextMessages[user.user_id];
      return nextMessages;
    });

    const { data, error: updateError } = await supabase.rpc(
      "update_admin_user",
      {
        target_user_id: user.user_id,
        new_plan: user.draftPlan,
        new_role: user.draftRole,
      }
    );

    if (updateError) {
      setRowMessages((currentMessages) => ({
        ...currentMessages,
        [user.user_id]: {
          type: "error",
          text: updateError.message,
        },
      }));

      setSavingUserId(null);
      return;
    }

    const updatedUser = Array.isArray(data) ? data[0] : data;

    setEditableUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.user_id === user.user_id
          ? {
              ...currentUser,
              plan: updatedUser?.plan ?? user.draftPlan,
              role: updatedUser?.role ?? user.draftRole,
              draftPlan: updatedUser?.plan ?? user.draftPlan,
              draftRole: updatedUser?.role ?? user.draftRole,
            }
          : currentUser
      )
    );

    setRowMessages((currentMessages) => ({
      ...currentMessages,
      [user.user_id]: {
        type: "success",
        text: "Saved.",
      },
    }));

    setSavingUserId(null);
  }

  function resetUser(user: EditableUser) {
    setEditableUsers((currentUsers) =>
      currentUsers.map((currentUser) =>
        currentUser.user_id === user.user_id
          ? {
              ...currentUser,
              draftPlan: currentUser.plan ?? "basic",
              draftRole: currentUser.role ?? "user",
            }
          : currentUser
      )
    );

    setRowMessages((currentMessages) => {
      const nextMessages = { ...currentMessages };
      delete nextMessages[user.user_id];
      return nextMessages;
    });
  }

  return (
    <section
      style={{
        marginTop: 24,
        border: "1px solid #334155",
        borderRadius: 14,
        padding: 24,
        background: "#1e293b",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 20,
        }}
      >
        <div>
          <h2
            style={{
              marginTop: 0,
              marginBottom: 6,
            }}
          >
            Users
          </h2>

          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            Search users and manage their plans and roles.
          </p>
        </div>

        <div
          style={{
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          Showing {filteredUsers.length} of {editableUsers.length}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 1fr) 180px 180px 180px",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search by email..."
          style={inputStyle}
        />

        <select
          value={planFilter}
          onChange={(event) => setPlanFilter(event.target.value)}
          style={inputStyle}
        >
          <option value="all">All plans</option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="advanced">Advanced</option>
        </select>

        <select
          value={roleFilter}
          onChange={(event) => setRoleFilter(event.target.value)}
          style={inputStyle}
        >
          <option value="all">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>

        <select
  value={verificationFilter}
  onChange={(event) => setVerificationFilter(event.target.value)}
  style={inputStyle}
>
  <option value="all">All verification</option>
  <option value="verified">Verified</option>
  <option value="not-verified">Not verified</option>
</select>

<select
  value={sortOption}
  onChange={(event) => setSortOption(event.target.value)}
  style={inputStyle}
>
  <option value="newest">Newest users</option>
<option value="oldest">Oldest users</option>
<option value="projects">Most projects</option>
<option value="last-login">Last login</option>
</select>

      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p style={{ color: "#ef4444" }}>{error}</p>
      ) : editableUsers.length === 0 ? (
        <p>No users found.</p>
      ) : filteredUsers.length === 0 ? (
        <p>No users match the selected filters.</p>
      ) : (
        <div
          style={{
            overflowX: "auto",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: 1050,
            }}
          >
            <thead>
              <tr>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Plan</th>
                <th style={thStyle}>Role</th>
                <th style={thStyle}>Verified</th>
                <th style={thStyle}>Projects</th>
                <th style={thStyle}>Created</th>
                <th style={thStyle}>Last Login</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => {
                const hasChanges =
                  user.draftPlan !== user.plan ||
                  user.draftRole !== user.role;

                const isSaving = savingUserId === user.user_id;
                const message = rowMessages[user.user_id];

                return (
                  <tr key={user.user_id}>
                    <td style={tdStyle}>{user.email ?? "-"}</td>

                    <td style={tdStyle}>
                      <select
                        value={user.draftPlan}
                        disabled={isSaving}
                        onChange={(event) =>
                          updateDraft(
                            user.user_id,
                            "draftPlan",
                            event.target.value
                          )
                        }
                        style={selectStyle}
                      >
                        <option value="basic">Basic</option>
                        <option value="standard">Standard</option>
                        <option value="advanced">Advanced</option>
                      </select>
                    </td>

                    <td style={tdStyle}>
                      <select
                        value={user.draftRole}
                        disabled={isSaving}
                        onChange={(event) =>
                          updateDraft(
                            user.user_id,
                            "draftRole",
                            event.target.value
                          )
                        }
                        style={selectStyle}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td style={tdStyle}>
                      {user.email_verified ? "✅" : "❌"}
                    </td>

                    <td style={tdStyle}>{user.project_count}</td>

                    <td style={tdStyle}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>

                    <td style={tdStyle}>
                      {user.last_sign_in_at
                      ? new Date(user.last_sign_in_at).toLocaleString()
                      : "-"}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          disabled={!hasChanges || isSaving}
                          onClick={() => saveUser(user)}
                          style={{
                            ...buttonStyle,
                            opacity: !hasChanges || isSaving ? 0.5 : 1,
                            cursor:
                              !hasChanges || isSaving
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          {isSaving ? "Saving..." : "Save"}
                        </button>

                        <button
                          type="button"
                          disabled={!hasChanges || isSaving}
                          onClick={() => resetUser(user)}
                          style={{
                            ...secondaryButtonStyle,
                            opacity: !hasChanges || isSaving ? 0.5 : 1,
                            cursor:
                              !hasChanges || isSaving
                                ? "not-allowed"
                                : "pointer",
                          }}
                        >
                          Reset
                        </button>
                      </div>

                      {message && (
                        <div
                          style={{
                            marginTop: 8,
                            fontSize: 12,
                            color:
                              message.type === "success"
                                ? "#86efac"
                                : "#fca5a5",
                          }}
                        >
                          {message.text}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "12px",
  borderBottom: "1px solid #334155",
  color: "#94a3b8",
  fontSize: 13,
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "12px",
  borderBottom: "1px solid #334155",
  verticalAlign: "top",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  border: "1px solid #475569",
  borderRadius: 8,
  padding: "10px 12px",
  background: "#0f172a",
  color: "#e2e8f0",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 110,
  border: "1px solid #475569",
  borderRadius: 8,
  padding: "8px 10px",
  background: "#0f172a",
  color: "#e2e8f0",
};

const buttonStyle: React.CSSProperties = {
  border: "1px solid #2563eb",
  borderRadius: 8,
  padding: "8px 12px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 700,
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #475569",
  borderRadius: 8,
  padding: "8px 12px",
  background: "#0f172a",
  color: "#cbd5e1",
  fontWeight: 700,
};