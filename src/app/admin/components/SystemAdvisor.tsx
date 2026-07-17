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

type SystemAdvisorProps = {
  stats: CapacityStats | null;
  loading: boolean;
  error: string | null;
};

type HealthStatus = "healthy" | "warning" | "critical";

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

function getStatusStyles(status: HealthStatus) {
  if (status === "critical") {
    return {
      label: "Critical",
      color: "#fecaca",
      background: "#7f1d1d",
      border: "#991b1b",
    };
  }

  if (status === "warning") {
    return {
      label: "Warning",
      color: "#fef3c7",
      background: "#78350f",
      border: "#92400e",
    };
  }

  return {
    label: "Healthy",
    color: "#bbf7d0",
    background: "#14532d",
    border: "#166534",
  };
}

export default function SystemAdvisor({
  stats,
  loading,
  error,
}: SystemAdvisorProps) {
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
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>
          System Advisor
        </h2>

        <p style={{ margin: 0, color: "#94a3b8" }}>
          Analysing system capacity...
        </p>
      </section>
    );
  }

  if (error || !stats) {
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
        <h2 style={{ marginTop: 0, marginBottom: 8 }}>
          System Advisor
        </h2>

        <p style={{ margin: 0, color: "#fca5a5" }}>
          Capacity data is unavailable, so the advisor could not run.
        </p>
      </section>
    );
  }

  const totalUsers = Number(stats.total_users ?? 0);
  const totalProjects = Number(stats.total_projects ?? 0);
  const totalBytes = Number(stats.total_project_data_bytes ?? 0);
  const averageBytes = Number(stats.average_project_data_bytes ?? 0);
  const largestBytes = Number(stats.largest_project_data_bytes ?? 0);
  const growthPercent = Number(stats.project_growth_percent ?? 0);
  const usersWithoutProjects = Number(stats.users_without_projects ?? 0);

  let status: HealthStatus = "healthy";

  if (
    totalBytes >= 400 * 1024 * 1024 ||
    largestBytes >= 8 * 1024 * 1024 ||
    growthPercent >= 200
  ) {
    status = "critical";
  } else if (
    totalBytes >= 250 * 1024 * 1024 ||
    largestBytes >= 4 * 1024 * 1024 ||
    growthPercent >= 100
  ) {
    status = "warning";
  }

  const statusStyles = getStatusStyles(status);

  const estimatedProjectsAt500Mb =
    averageBytes > 0
      ? Math.floor((500 * 1024 * 1024) / averageBytes)
      : 0;

  const recommendations: string[] = [];

  if (totalBytes < 50 * 1024 * 1024) {
    recommendations.push(
      "Project data usage is currently very low. No immediate database capacity action is required."
    );
  }

  if (growthPercent >= 100) {
    recommendations.push(
      "Project creation increased strongly compared with the previous 30-day period. Continue monitoring monthly growth."
    );
  }

  if (largestBytes >= 4 * 1024 * 1024) {
    recommendations.push(
      "At least one project document is becoming large. Consider splitting large JSON documents or reducing duplicated data."
    );
  }

  if (usersWithoutProjects > 0 && totalUsers > 0) {
    recommendations.push(
      `${usersWithoutProjects} registered user${
        usersWithoutProjects === 1 ? "" : "s"
      } currently have no projects.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "No significant capacity risk has been detected."
    );
  }

  return (
    <section
      style={{
        marginTop: 24,
        border: `1px solid ${statusStyles.border}`,
        borderRadius: 14,
        padding: 24,
        background: "#1e293b",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
          marginBottom: 22,
        }}
      >
        <div>
          <h2
            style={{
              marginTop: 0,
              marginBottom: 8,
              fontSize: 20,
            }}
          >
            System Advisor
          </h2>

          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              lineHeight: 1.6,
            }}
          >
            Automatic assessment based on Currist project growth and stored
            document size.
          </p>
        </div>

        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            borderRadius: 999,
            padding: "7px 12px",
            background: statusStyles.background,
            color: statusStyles.color,
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 0.5,
          }}
        >
          {statusStyles.label}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div
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
            Current Project Data
          </div>

          <div
            style={{
              marginBottom: 6,
              fontSize: 25,
              fontWeight: 800,
            }}
          >
            {formatBytes(totalBytes)}
          </div>

          <div style={{ color: "#64748b", fontSize: 12 }}>
            Stored across {totalProjects.toLocaleString()} project
            {totalProjects === 1 ? "" : "s"}
          </div>
        </div>

        <div
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
            Estimated Projects at 500 MB
          </div>

          <div
            style={{
              marginBottom: 6,
              fontSize: 25,
              fontWeight: 800,
            }}
          >
            {estimatedProjectsAt500Mb > 0
              ? estimatedProjectsAt500Mb.toLocaleString()
              : "—"}
          </div>

          <div style={{ color: "#64748b", fontSize: 12 }}>
            Estimate based on the current average project size
          </div>
        </div>

        <div
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
            Largest Project
          </div>

          <div
            style={{
              marginBottom: 6,
              fontSize: 25,
              fontWeight: 800,
            }}
          >
            {formatBytes(largestBytes)}
          </div>

          <div style={{ color: "#64748b", fontSize: 12 }}>
            Average project: {formatBytes(averageBytes)}
          </div>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #334155",
          paddingTop: 20,
        }}
      >
        <h3
          style={{
            marginTop: 0,
            marginBottom: 12,
            fontSize: 15,
          }}
        >
          Recommendations
        </h3>

        <div
          style={{
            display: "grid",
            gap: 10,
          }}
        >
          {recommendations.map((recommendation) => (
            <div
              key={recommendation}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                color: "#cbd5e1",
                lineHeight: 1.5,
              }}
            >
              <span
                style={{
                  color: statusStyles.color,
                  fontWeight: 800,
                }}
              >
                •
              </span>

              <span>{recommendation}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}