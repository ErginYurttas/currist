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

type CapacityPanelProps = {
  stats: CapacityStats | null;
  loading: boolean;
  error: string | null;
};

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, unitIndex);

  return `${value.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

export default function CapacityPanel({
  stats,
  loading,
  error,
}: CapacityPanelProps) {
  if (loading) {
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
        <h2 style={{ marginTop: 0 }}>Capacity & Growth</h2>

        <p style={{ marginBottom: 0, color: "#94a3b8" }}>
          Loading capacity statistics...
        </p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        style={{
          marginTop: 24,
          border: "1px solid #7f1d1d",
          borderRadius: 14,
          padding: 24,
          background: "#1e293b",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Capacity & Growth</h2>

        <p style={{ marginBottom: 0, color: "#fca5a5" }}>
          {error}
        </p>
      </section>
    );
  }

  if (!stats) {
    return null;
  }

  const growthValue = Number(stats.project_growth_percent ?? 0);

  const cards = [
    {
      label: "Total Project Data",
      value: formatBytes(Number(stats.total_project_data_bytes ?? 0)),
      detail: "Approximate JSON document size",
    },
    {
      label: "Average Project Size",
      value: formatBytes(Number(stats.average_project_data_bytes ?? 0)),
      detail: "Average stored project document",
    },
    {
      label: "Largest Project",
      value: formatBytes(Number(stats.largest_project_data_bytes ?? 0)),
      detail: "Largest project currently stored",
    },
    {
      label: "Projects in Last 30 Days",
      value: Number(stats.projects_last_30_days ?? 0).toLocaleString(),
      detail: `${growthValue >= 0 ? "+" : ""}${growthValue.toFixed(
        2
      )}% versus previous 30 days`,
    },
    {
      label: "Average Projects per User",
      value: Number(stats.average_projects_per_user ?? 0).toFixed(2),
      detail: `${Number(
        stats.users_without_projects ?? 0
      ).toLocaleString()} users have no projects`,
    },
    {
      label: "Maximum Projects per User",
      value: Number(stats.maximum_projects_per_user ?? 0).toLocaleString(),
      detail: "Highest project count owned by one user",
    },
  ];

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
      <div style={{ marginBottom: 20 }}>
        <h2
          style={{
            marginTop: 0,
            marginBottom: 8,
            fontSize: 20,
          }}
        >
          Capacity & Growth
        </h2>

        <p
          style={{
            margin: 0,
            color: "#94a3b8",
            lineHeight: 1.6,
          }}
        >
          Database growth indicators calculated from Currist project data.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {cards.map((card) => (
          <div
            key={card.label}
            style={{
              padding: 18,
              border: "1px solid #334155",
              borderRadius: 12,
              background: "#0f172a",
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
              {card.label}
            </div>

            <div
              style={{
                marginBottom: 8,
                fontSize: 26,
                fontWeight: 800,
              }}
            >
              {card.value}
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {card.detail}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}