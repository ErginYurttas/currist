"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type AdminUser = {
  user_id: string;
  email: string | null;
  full_name: string | null;
  account_type: string | null;
  company_name: string | null;
  country: string | null;
  profession: string | null;
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
  const [accountTypeFilter, setAccountTypeFilter] = useState("all");
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

    const filtered = editableUsers.filter((user) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        (user.email ?? "").toLowerCase().includes(normalizedSearch) ||
        (user.full_name ?? "").toLowerCase().includes(normalizedSearch) ||
        (user.company_name ?? "").toLowerCase().includes(normalizedSearch) ||
        (user.country ?? "").toLowerCase().includes(normalizedSearch) ||
        (user.profession ?? "").toLowerCase().includes(normalizedSearch);

      const matchesPlan =
        planFilter === "all" || user.draftPlan === planFilter;

      const matchesRole =
        roleFilter === "all" || user.draftRole === roleFilter;

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && user.email_verified) ||
        (verificationFilter === "not-verified" && !user.email_verified);

      const normalizedAccountType = (user.account_type ?? "").toLowerCase();

      const matchesAccountType =
        accountTypeFilter === "all" ||
        normalizedAccountType === accountTypeFilter;

      return (
        matchesSearch &&
        matchesPlan &&
        matchesRole &&
        matchesVerification &&
        matchesAccountType
      );
    });

    return [...filtered].sort((a, b) => {
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

        case "name":
          return (a.full_name ?? a.email ?? "").localeCompare(
            b.full_name ?? b.email ?? ""
          );

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
    accountTypeFilter,
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

    clearRowMessage(userId);
  }

  function clearRowMessage(userId: string) {
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
    clearRowMessage(user.user_id);

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
        text: "User updated successfully.",
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

    clearRowMessage(user.user_id);
  }

  function clearFilters() {
    setSearchText("");
    setPlanFilter("all");
    setRoleFilter("all");
    setVerificationFilter("all");
    setAccountTypeFilter("all");
    setSortOption("newest");
  }

  return (
    <section
      style={{
        marginTop: 24,
        border: "1px solid #334155",
        borderRadius: 18,
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
          marginBottom: 22,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              color: "#f8fafc",
              fontSize: 22,
            }}
          >
            User Management
          </h2>

          <p
            style={{
              margin: "7px 0 0",
              color: "#94a3b8",
              fontSize: 13,
            }}
          >
            Review accounts and manage user plans and roles.
          </p>
        </div>

        <div
          style={{
            padding: "8px 12px",
            border: "1px solid #334155",
            borderRadius: 10,
            background: "#0f172a",
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          Showing{" "}
          <strong style={{ color: "#f8fafc" }}>
            {filteredUsers.length}
          </strong>{" "}
          of{" "}
          <strong style={{ color: "#f8fafc" }}>
            {editableUsers.length}
          </strong>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(240px, 1.6fr) repeat(5, minmax(140px, 1fr)) auto",
          gap: 10,
          marginBottom: 24,
        }}
      >
        <input
          type="search"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Search name, email, company, country..."
          style={inputStyle}
        />

        <select
          value={accountTypeFilter}
          onChange={(event) => setAccountTypeFilter(event.target.value)}
          style={inputStyle}
        >
          <option value="all">All account types</option>
          <option value="individual">Individual</option>
          <option value="company">Company</option>
          <option value="business">Business</option>
        </select>

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
          <option value="name">Name A–Z</option>
          <option value="projects">Most projects</option>
          <option value="last-login">Latest login</option>
        </select>

        <button
          type="button"
          onClick={clearFilters}
          style={secondaryButtonStyle}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div style={emptyStateStyle}>Loading users...</div>
      ) : error ? (
        <div
          style={{
            ...emptyStateStyle,
            color: "#fca5a5",
            borderColor: "#7f1d1d",
          }}
        >
          {error}
        </div>
      ) : editableUsers.length === 0 ? (
        <div style={emptyStateStyle}>No users found.</div>
      ) : filteredUsers.length === 0 ? (
        <div style={emptyStateStyle}>
          No users match the selected filters.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          {filteredUsers.map((user) => {
            const hasChanges =
              user.draftPlan !== user.plan ||
              user.draftRole !== user.role;

            const isSaving = savingUserId === user.user_id;
            const message = rowMessages[user.user_id];

            return (
              <article
                key={user.user_id}
                style={{
                  border: "1px solid #334155",
                  borderRadius: 16,
                  padding: 20,
                  background: "#0f172a",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.16)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(260px, 1.5fr) minmax(210px, 1fr) minmax(210px, 1fr)",
                    gap: 24,
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          width: 46,
                          height: 46,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 14,
                          background: "#1d4ed8",
                          color: "#ffffff",
                          fontSize: 17,
                          fontWeight: 800,
                        }}
                      >
                        {getInitials(user.full_name, user.email)}
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            flexWrap: "wrap",
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              color: "#f8fafc",
                              fontSize: 17,
                            }}
                          >
                            {user.full_name?.trim() || "Unnamed User"}
                          </h3>

                          <StatusBadge verified={user.email_verified} />
                        </div>

                        <div
                          style={{
                            marginTop: 6,
                            color: "#94a3b8",
                            fontSize: 13,
                            wordBreak: "break-word",
                          }}
                        >
                          {user.email ?? "No email address"}
                        </div>

                        <div
                          style={{
                            marginTop: 12,
                            color: "#475569",
                            fontFamily: "monospace",
                            fontSize: 11,
                            wordBreak: "break-all",
                          }}
                        >
                          ID: {user.user_id}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(2, minmax(120px, 1fr))",
                        gap: 10,
                        marginTop: 20,
                      }}
                    >
                      <InfoBox
                        label="Account"
                        value={formatAccountType(user.account_type)}
                      />

                      <InfoBox
                        label="Company"
                        value={
                          user.company_name ||
                          (isIndividualAccount(user.account_type)
                            ? "Individual account"
                            : "Not specified")
                        }
                      />

                      <InfoBox
                        label="Country"
                        value={user.country || "Not specified"}
                      />

                      <InfoBox
                        label="Profession"
                        value={user.profession || "Not specified"}
                      />
                    </div>
                  </div>

                  <div>
                    <SectionLabel>Account controls</SectionLabel>

                    <label style={fieldLabelStyle}>
                      Plan
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
                    </label>

                    <label style={fieldLabelStyle}>
                      Role
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
                    </label>

                    <div
                      style={{
                        display: "flex",
                        gap: 9,
                        flexWrap: "wrap",
                        marginTop: 16,
                      }}
                    >
                      <button
                        type="button"
                        disabled={!hasChanges || isSaving}
                        onClick={() => saveUser(user)}
                        style={{
                          ...buttonStyle,
                          opacity:
                            !hasChanges || isSaving ? 0.5 : 1,
                          cursor:
                            !hasChanges || isSaving
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {isSaving ? "Saving..." : "Save changes"}
                      </button>

                      <button
                        type="button"
                        disabled={!hasChanges || isSaving}
                        onClick={() => resetUser(user)}
                        style={{
                          ...secondaryButtonStyle,
                          opacity:
                            !hasChanges || isSaving ? 0.5 : 1,
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
                          marginTop: 12,
                          padding: "9px 11px",
                          borderRadius: 8,
                          background:
                            message.type === "success"
                              ? "rgba(22, 101, 52, 0.22)"
                              : "rgba(127, 29, 29, 0.22)",
                          color:
                            message.type === "success"
                              ? "#86efac"
                              : "#fca5a5",
                          fontSize: 12,
                        }}
                      >
                        {message.text}
                      </div>
                    )}
                  </div>

                  <div>
                    <SectionLabel>Usage and activity</SectionLabel>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 10,
                      }}
                    >
                      <MetricBox
                        label="Projects"
                        value={String(user.project_count)}
                      />

                      <MetricBox
                        label="Plan"
                        value={capitalize(user.draftPlan)}
                      />
                    </div>

                    <div style={{ marginTop: 16 }}>
                      <ActivityRow
                        label="Registered"
                        value={formatDate(user.created_at)}
                      />

                      <ActivityRow
                        label="Last login"
                        value={
                          user.last_sign_in_at
                            ? formatDateTime(user.last_sign_in_at)
                            : "Never"
                        }
                      />

                      <ActivityRow
                        label="Email"
                        value={
                          user.email_verified
                            ? "Verified"
                            : "Verification pending"
                        }
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StatusBadge({ verified }: { verified: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 8px",
        border: verified
          ? "1px solid #166534"
          : "1px solid #854d0e",
        borderRadius: 999,
        background: verified
          ? "rgba(22, 101, 52, 0.22)"
          : "rgba(133, 77, 14, 0.22)",
        color: verified ? "#86efac" : "#fde68a",
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: verified ? "#22c55e" : "#f59e0b",
        }}
      />

      {verified ? "Verified" : "Pending"}
    </span>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        minWidth: 0,
        padding: 11,
        border: "1px solid #1e293b",
        borderRadius: 10,
        background: "#111c2f",
      }}
    >
      <div
        style={{
          color: "#64748b",
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 6,
          color: "#cbd5e1",
          fontSize: 13,
          lineHeight: 1.4,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MetricBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: 14,
        border: "1px solid #1e293b",
        borderRadius: 12,
        background: "#111c2f",
      }}
    >
      <div
        style={{
          color: "#f8fafc",
          fontSize: 20,
          fontWeight: 800,
        }}
      >
        {value}
      </div>

      <div
        style={{
          marginTop: 4,
          color: "#64748b",
          fontSize: 11,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        marginBottom: 14,
        color: "#64748b",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.09em",
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

function ActivityRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 12,
        padding: "10px 0",
        borderBottom: "1px solid #1e293b",
      }}
    >
      <span
        style={{
          color: "#64748b",
          fontSize: 12,
        }}
      >
        {label}
      </span>

      <span
        style={{
          color: "#cbd5e1",
          fontSize: 12,
          textAlign: "right",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function getInitials(
  fullName: string | null,
  email: string | null
) {
  const name = fullName?.trim();

  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  return email?.charAt(0).toUpperCase() || "?";
}

function formatAccountType(accountType: string | null) {
  if (!accountType) {
    return "Not specified";
  }

  return accountType
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function isIndividualAccount(accountType: string | null) {
  const value = accountType?.toLowerCase() ?? "";

  return value === "individual" || value === "personal";
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  border: "1px solid #475569",
  borderRadius: 9,
  padding: "10px 12px",
  background: "#0f172a",
  color: "#e2e8f0",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  marginTop: 7,
  border: "1px solid #475569",
  borderRadius: 9,
  padding: "9px 11px",
  background: "#111c2f",
  color: "#e2e8f0",
};

const fieldLabelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 13,
  color: "#94a3b8",
  fontSize: 12,
  fontWeight: 700,
};

const buttonStyle: React.CSSProperties = {
  border: "1px solid #2563eb",
  borderRadius: 9,
  padding: "9px 13px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 700,
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #475569",
  borderRadius: 9,
  padding: "9px 13px",
  background: "#0f172a",
  color: "#cbd5e1",
  fontWeight: 700,
  cursor: "pointer",
};

const emptyStateStyle: React.CSSProperties = {
  padding: 28,
  border: "1px dashed #475569",
  borderRadius: 12,
  color: "#94a3b8",
  textAlign: "center",
};