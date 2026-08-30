"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CurristLogo from "./components/CurristLogo";
import { theme } from "./design/theme";
import Header from "./components/Header";



export default function HomePage() {
  const languageButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 10px",
  border: "none",
  background: "transparent",
  color: theme.colors.text,
  textAlign: "left",
  cursor: "pointer",
  borderRadius: 8,
};

const disabledLanguageButtonStyle: React.CSSProperties = {
  width: "100%",
  padding: "9px 10px",
  border: "none",
  background: "transparent",
  color: theme.colors.textMuted,
  textAlign: "left",
  cursor: "not-allowed",
  borderRadius: 8,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
const [curristJourneyTab, setCurristJourneyTab] = useState<
  "available" | "development" | "vision" | "info"
>("available");
const [expandedFeature, setExpandedFeature] =
  useState<string | null>(null);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <Header logoHref="/" />

      <section
  style={{
    width: `min(${theme.layout.wideContentWidth}px, calc(100% - 40px))`,
    minHeight: `calc(100vh - ${theme.layout.headerHeight}px)`,
    margin: "0 auto",
    padding: "90px 0 70px",
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.1fr) minmax(380px, 0.9fr)",
    alignItems: "center",
    gap: 70,
  }}
>
  <div>
    <h1
      style={{
        maxWidth: 760,
        margin: "24px 0 0",
        color: theme.colors.text,
        fontSize: "clamp(42px, 6vw, 72px)",
        lineHeight: 1.05,
        letterSpacing: -2,
      }}
    >
      Electrical design,
      <br />
      structured from project to panel.
    </h1>

    <p
      style={{
        maxWidth: 690,
        margin: "25px 0 0",
        color: theme.colors.textSecondary,
        fontSize: 18,
        lineHeight: 1.75,
      }}
    >
      Create your electrical load schedule simply and accurately.
    </p>

    <div
      style={{
        marginTop: 34,
        display: "flex",
        flexWrap: "wrap",
        gap: theme.spacing.sm,
      }}
    >
      <a
        href="#pricing"
        style={largePrimaryButtonStyle}
        onClick={(event) => {
          event.preventDefault();

          document.getElementById("pricing")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      >
        Start Designing
      </a>

      <a
        href="#why-currist"
        style={largeSecondaryButtonStyle}
        onClick={(event) => {
          event.preventDefault();

          document.getElementById("why-currist")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }}
      >
        Why Currist?
      </a>
    </div>
  </div>

  <div
    style={{
      padding: theme.spacing.lg,
      border: `1px solid ${theme.colors.borderSoft}`,
      borderRadius: theme.radius.card,
      background: theme.colors.surfaceSoft,
      boxShadow: theme.shadow.card,
    }}
  >
    <div
      style={{
        paddingBottom: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${theme.colors.borderSoft}`,
      }}
    >
      <div>
        <div
          style={{
            color: theme.colors.primary,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 1.3,
            textTransform: "uppercase",
          }}
        >
          Project workspace
        </div>

        <strong
          style={{
            display: "block",
            marginTop: 7,
            color: theme.colors.text,
            fontSize: 18,
          }}
        >
          Office Building Project
        </strong>
      </div>

      <span
        style={{
          padding: "6px 10px",
          borderRadius: theme.radius.pill,
          background: "rgba(34, 197, 94, 0.12)",
          color: "#86efac",
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        Active
      </span>
    </div>

    <div
      style={{
        marginTop: 18,
        padding: 18,
        border: `1px solid ${theme.colors.borderSoft}`,
        borderRadius: theme.radius.input,
        background: theme.colors.background,
      }}
    >
      <div style={treeRowStyle}>
        <span>🇹🇷 🏢</span>
        <strong>Office Project</strong>
        <small>(project)</small>
      </div>

      <div style={{ ...treeRowStyle, marginLeft: 24 }}>
        <span>🏢</span>
        <strong>Main Building</strong>
        <small>(building)</small>
      </div>

      <div style={{ ...treeRowStyle, marginLeft: 48 }}>
        <span>⚡</span>
        <strong>Main Distribution Panel</strong>
        <small>(panel)</small>
      </div>

      <div style={{ ...treeRowStyle, marginLeft: 72 }}>
        <span>💡</span>
        <strong>Lighting Loads</strong>
        <small>(loads)</small>
      </div>

      <div style={{ ...treeRowStyle, marginLeft: 72 }}>
        <span>🔌</span>
        <strong>Socket Loads</strong>
        <small>(loads)</small>
      </div>
    </div>

    <div
      style={{
        marginTop: 14,
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
      }}
    >
      <div style={statCardStyle}>
        <strong style={statNumberStyle}>4</strong>
        <span style={statLabelStyle}>Structures</span>
      </div>

      <div style={statCardStyle}>
        <strong style={statNumberStyle}>12</strong>
        <span style={statLabelStyle}>Panels</span>
      </div>

      <div style={statCardStyle}>
        <strong style={statNumberStyle}>86</strong>
        <span style={statLabelStyle}>Loads</span>
      </div>
    </div>
  </div>
</section>

      <section
        id="why-currist"
        style={{
          padding: "85px 20px",
          borderTop: "1px solid #1e293b",
          background: "#0f172a",
        }}
      >
        <div
          style={{
            width: "min(1280px, 100%)",
            margin: "0 auto",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 900,
              textAlign: "center",
            }}
          >
            <span
              style={{
                color: "#4fc3f7",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              What is Currist?
            </span>

            <h2
              style={{
                margin: "12px 0 0",
                fontSize: 40,
                lineHeight: 1.15,
                letterSpacing: -1,
              }}
            >
              A structured workspace for electrical design.
            </h2>

            <p
              style={{
                margin: "26px 0 0",
                color: "#cbd5e1",
                fontSize: 17,
                lineHeight: 1.8,
              }}
            >
              Currist is an electrical project design and management platform
              that brings project structures, distribution panels and
              electrical loads together in one connected workspace. It helps
              engineers build projects systematically, preserve relationships
              between components and manage project information through a clear
              hierarchy. By providing a shared and structured project model,
              Currist also supports better coordination between electrical and
              mechanical engineering teams throughout the design process.
            </p>

            <div
  style={{
    marginTop: 32,
    padding: 28,
    border: "1px solid #263449",
    borderRadius: 18,
    background: "#111827",
    textAlign: "left",
  }}
>
  <div
    style={{
      maxWidth: 760,
      margin: "0 auto",
      textAlign: "center",
    }}
  >
    <div
      style={{
        color: "#38bdf8",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 1.2,
        textTransform: "uppercase",
      }}
    >
      Currist Journey
    </div>

    <h3
      style={{
        margin: "10px 0 0",
        color: "#f8fafc",
        fontSize: 28,
        lineHeight: 1.25,
      }}
    >
      Building the Future of Electrical Design
    </h3>

    <p
      style={{
        margin: "12px auto 0",
        color: "#94a3b8",
        fontSize: 14,
        lineHeight: 1.7,
      }}
    >
      See what you can use today, what is coming next, and where
      Currist is heading.
    </p>
  </div>

  <div
    style={{
      marginTop: 26,
      display: "flex",
      justifyContent: "center",
      flexWrap: "wrap",
      gap: 10,
    }}
  >
    {[
      {
        id: "available" as const,
        label: "✅ Available Today",
      },
      {
        id: "development" as const,
        label: "🚀 In Development",
      },
      {
        id: "vision" as const,
        label: "🌍 Future Vision",
      },
      {
        id: "info" as const,
        label: "ℹ️ Info",
      },
    ].map((tab) => {
      const isActive = curristJourneyTab === tab.id;

      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => setCurristJourneyTab(tab.id)}
          style={{
            minHeight: 44,
            padding: "0 16px",
            border: isActive
              ? "1px solid #38bdf8"
              : "1px solid #334155",
            borderRadius: 10,
            background: isActive ? "#0369a1" : "#0f172a",
            color: isActive ? "#ffffff" : "#cbd5e1",
            fontSize: 13,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          {tab.label}
        </button>
      );
    })}
  </div>

  <div
    style={{
      marginTop: 24,
      paddingTop: 24,
      borderTop: "1px solid #263449",
    }}
  >
    {curristJourneyTab === "available" && (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              margin: 0,
              color: "#f8fafc",
              fontSize: 21,
            }}
          >
            Available Today
          </h4>

          <p
            style={{
              margin: "8px 0 0",
              color: "#94a3b8",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Core tools already available inside the Currist workspace.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {[
            {
              title: "Structured Project Hierarchy",
              text: "Organize projects, buildings, blocks, floors, rooms, panels and loads in one clear structure.",
            },
            {
              title: "Panel & Load Management",
              text: "Create, edit, copy, reuse and manage electrical panels and their connected loads.",
            },
            {
              title: "Engineering Calculations",
              text: "Review installed power, current, phase distribution, power factor and phase balance.",
            },
            {
              title: "Energy Analyzer Support",
              text: "Assign loads and packaged panel feeders to multiple analyzers within each panel.",
            },
            {
              title: "Professional Excel Export",
              text: "Generate engineering reports, load schedules, phase analysis and cable summaries.",
            },
            {
              title: "Project Recovery",
              text: "Restore supported Currist projects from exported project files.",
            },
            {
              title: "Cloud Project Storage",
              text: "Securely save, reopen, rename and continue user-specific projects.",
            },
            {
              title: "Reusable Engineering Designs",
              text: "Import existing panels and reuse previous designs in new project locations.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                padding: 18,
                border: "1px solid #263449",
                borderRadius: 14,
                background: "#0f172a",
              }}
            >
              <div
                style={{
                  color: "#f8fafc",
                  fontSize: 15,
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                {item.title}
              </div>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#94a3b8",
                  fontSize: 13,
                  lineHeight: 1.65,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}

    {curristJourneyTab === "development" && (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              margin: 0,
              color: "#f8fafc",
              fontSize: 21,
            }}
          >
            In Development
          </h4>

          <p
            style={{
              margin: "8px 0 0",
              color: "#94a3b8",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Features planned for the next stages of Currist.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {[
            {
              title: "Native Currist Project Files",
              text: "Save and transfer complete projects using a dedicated .currist file format.",
            },
            {
              title: "PDF Project Export",
              text: "Generate clear and professional PDF documentation directly from projects.",
            },
            {
              title: "Automatic Local Backup",
              text: "Create additional recovery points to help protect ongoing engineering work.",
            },
            {
              title: "Guided Onboarding",
              text: "Help new users create and structure their first project step by step.",
            },
            {
              title: "Project Duplication",
              text: "Create a reusable copy of an existing project for similar engineering work.",
            },
            {
              title: "Version Migration",
              text: "Support project migration between future Currist data versions.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                padding: 18,
                border: "1px solid #263449",
                borderRadius: 14,
                background: "#0f172a",
              }}
            >
              <div
                style={{
                  color: "#f8fafc",
                  fontSize: 15,
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                {item.title}
              </div>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#94a3b8",
                  fontSize: 13,
                  lineHeight: 1.65,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}

    {curristJourneyTab === "vision" && (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              margin: 0,
              color: "#f8fafc",
              fontSize: 21,
            }}
          >
            Future Vision
          </h4>

          <p
            style={{
              margin: "8px 0 0",
              color: "#94a3b8",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            The long-term direction envisioned for the Currist
            platform.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {[
            {
              title: "Advanced Engineering Tools",
              text: "Expand the workspace with additional calculation and design modules.",
            },
            {
              title: "Team Collaboration",
              text: "Allow engineering teams to work together more effectively on shared projects.",
            },
            {
              title: "Multi-Language Workspace",
              text: "Make Currist accessible to electrical professionals across different regions.",
            },
            {
              title: "BIM & CAD Integration",
              text: "Connect structured Currist project information with wider design workflows.",
            },
            {
              title: "Enterprise Project Management",
              text: "Support larger organizations, complex facilities and extensive project portfolios.",
            },
            {
              title: "Mobile Project Access",
              text: "Provide convenient project review and field access across mobile devices.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                padding: 18,
                border: "1px solid #263449",
                borderRadius: 14,
                background: "#0f172a",
              }}
            >
              <div
                style={{
                  color: "#f8fafc",
                  fontSize: 15,
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                {item.title}
              </div>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#94a3b8",
                  fontSize: 13,
                  lineHeight: 1.65,
                }}
              >
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}

    {curristJourneyTab === "info" && (
      <div>
        <div style={{ marginBottom: 20 }}>
          <h4
            style={{
              margin: 0,
              color: "#f8fafc",
              fontSize: 21,
            }}
          >
            Currist Information
          </h4>

          <p
            style={{
              margin: "8px 0 0",
              color: "#94a3b8",
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Currist is actively developed and continuously improved
            around real electrical engineering workflows.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {[
            {
              label: "Version",
              value: "0.9.5.0",
            },
            {
              label: "Developed By",
              value: "Ergin Yurttaş erginyurttas@gmail.com",
              
            },
            {
              label: "Last Update",
              value: "01 August 2026",
            },
            {
              label: "Platform",
              value: "Next.js · React · TypeScript · Supabase",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                padding: 20,
                border: "1px solid #263449",
                borderRadius: 14,
                background: "#0f172a",
              }}
            >
              <div
                style={{
                  color: "#38bdf8",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {item.label}
              </div>

              <div
                style={{
                  marginTop: 9,
                  color: "#f8fafc",
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1.5,
                }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>

          </div>
        </div>
      </section>

      <section
        style={{
          padding: "85px 20px",
          borderTop: "1px solid #1e293b",
          background: "#111827",
        }}
      >
        <div
          style={{
            width: "min(1280px, 100%)",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.15fr) minmax(0, 0.85fr)",
            alignItems: "center",
            gap: 60,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 18,
            }}
          >
            {[
            {
              icon: "🧩",
              title: "Scattered Information",
              text: "Project data is often spread across multiple spreadsheets, drawings and documents, making information difficult to manage.",
            },
            {
              icon: "🔄",
              title: "Difficult Revisions",
              text: "Even small engineering changes can require updating multiple files, increasing time and the risk of inconsistencies.",
            },
            {
              icon: "🤝",
              title: "Disconnected Teams",
              text: "Electrical project information is frequently shared across different people and tools, making coordination more difficult.",
            },
            {
              icon: "📈",
              title: "Growing Complexity",
              text: "Modern electrical projects demand a structured digital workflow that scales from simple buildings to complex facilities.",
            },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  minHeight: 190,
                  padding: 24,
                  border: "1px solid #263449",
                  borderRadius: 16,
                  background: "#0f172a",
                }}
              >
                <div
                  style={{
                    width: 46,
                    height: 46,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #334155",
                    borderRadius: 12,
                    background: "#172033",
                    fontSize: 22,
                  }}
                >
                  {item.icon}
                </div>

                <h3
                  style={{
                    margin: "20px 0 10px",
                    color: "#f8fafc",
                    fontSize: 18,
                    lineHeight: 1.3,
                  }}
                >
                  {item.title}
                </h3>

                <p
                  style={{
                    margin: 0,
                    color: "#94a3b8",
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          <div>
            <span
              style={{
                color: "#4fc3f7",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              Why Currist?
            </span>

            <h2
              style={{
                margin: "12px 0 0",
                color: "#f8fafc",
                fontSize: 40,
                lineHeight: 1.15,
                letterSpacing: -1,
              }}
            >
              Electrical engineering has outgrown spreadsheets.
            </h2>

            <p
              style={{
                margin: "26px 0 0",
                color: "#cbd5e1",
                fontSize: 17,
                lineHeight: 1.8,
              }}
            >
              Modern electrical projects generate thousands of interconnected components, 
              yet many engineering teams still rely on disconnected spreadsheets, documents 
              and manual coordination.
            </p>

            <p
              style={{
                margin: "18px 0 0",
                color: "#cbd5e1",
                fontSize: 17,
                lineHeight: 1.8,
              }}
            >
              Currist brings project structures, panels, electrical loads and engineering 
              data together in one connected workspace, helping engineers work faster, 
              simplify revisions, improve coordination and stay organized throughout the 
              entire project lifecycle.
            </p>

            
          </div>
        </div>
      </section>

      <section
        id="features"
        style={{
          padding: "90px 20px",
          borderTop: "1px solid #1e293b",
          background: "#0f172a",
        }}
      >
        <div
          style={{
            width: "min(1280px, 100%)",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <span
              style={{
                color: "#4fc3f7",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              Core Features
            </span>

            <h2
              style={{
                margin: "12px 0 0",
                color: "#f8fafc",
                fontSize: 42,
                lineHeight: 1.15,
                letterSpacing: -1,
              }}
            >
              Everything you need to build and manage electrical projects.
            </h2>

            <p
              style={{
                margin: "24px auto 0",
                maxWidth: 680,
                color: "#94a3b8",
                fontSize: 17,
                lineHeight: 1.8,
              }}
            >
              Currist connects project organization, electrical distribution
              and engineering data within one structured workspace.
            </p>
          </div>

          <div
            style={{
              marginTop: 55,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 20,
            }}
          >
            {[
  {
    icon: "🗂️",
    title: "Project Management",
    text: "Create, organize and manage electrical projects from a single workspace.",
    details: [
      "Currist keeps each electrical project inside its own structured workspace. Project identity, country, building type, structures, panels and connected loads remain associated with the same project record.",
      "Saved projects can be reopened from the project dashboard, renamed and continued without rebuilding the project structure from the beginning. This creates a clear separation between different clients, facilities and engineering studies.",
    ],
  },
  {
  icon: "🏢",
  title: "Structure Management",
  text: "Build clear project hierarchies for buildings, floors, rooms and technical areas.",
  details: [
    "Projects can be organized through a hierarchy containing buildings, blocks, floors, rooms and other project locations. This allows every electrical component to be placed in the physical area where it belongs.",
    "The structured hierarchy also makes large projects easier to understand and maintain. Engineers can navigate from the overall project level down to individual rooms, panels and loads while preserving the relationship between each element.",
  ],
},
{
  icon: "⚡",
  title: "Panel Management",
  text: "Create distribution panels and maintain their relationships across the project.",
  details: [
    "Currist supports the creation and management of distribution panels such as MCC, SMDB, DB, LP, UPS DB and packaged panels. Panels can be associated with project structures and connected to upstream supply panels.",
    "Panel information, connected loads, phase configuration, environment, IP rating and analyzer assignments remain part of the project model. Existing panel designs can also be copied or reused where similar electrical arrangements are required.",
  ],
},
{
  icon: "💡",
  title: "Load Management",
  text: "Add, classify and connect electrical loads to the correct panels and structures.",
  details: [
    "Electrical loads can be created with their engineering properties and connected to the appropriate distribution panel. Currist preserves the relationship between each load, its location and its supplying panel.",
    "Load information contributes to installed power, estimated current, phase distribution, power factor and other project summaries. This provides a consistent foundation for reviewing the electrical distribution system as the project grows.",
  ],
},
{
  icon: "☁️",
  title: "Cloud Workspace",
  text: "Save your work securely and continue your projects from different devices.",
  details: [
    "Authenticated users can save their projects to their own cloud workspace. Projects are associated with the signed-in account and can be reopened from the Dashboard whenever work needs to continue.",
    "Cloud storage allows engineers to move between supported computers, tablets and other devices without depending on a single local browser session. Access remains controlled through the user account and project ownership.",
  ],
},
{
  icon: "📊",
  title: "Export and Reporting",
  text: "Prepare organized engineering outputs, schedules and project documentation.",
  details: [
    "Currist can convert structured project information into organized engineering outputs. Project summaries, panel schedules, load information, phase analysis and related data can be prepared from the same project model.",
    "Because reports are generated from connected project data, changes made inside the workspace can be reflected consistently in later exports. This reduces the need to maintain separate and disconnected calculation documents.",
  ],
},
].map((feature) => (
              <div
                key={feature.title}
                style={{
                  minHeight: 245,
                  padding: 28,
                  border: "1px solid #263449",
                  borderRadius: 18,
                  background: "#111827",
                }}
              >
                <div
                  style={{
                    width: 50,
                    height: 50,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #334155",
                    borderRadius: 13,
                    background: "#172033",
                    fontSize: 23,
                  }}
                >
                  {feature.icon}
                </div>

                <h3
                  style={{
                    margin: "23px 0 0",
                    color: "#f8fafc",
                    fontSize: 19,
                    lineHeight: 1.3,
                  }}
                >
                  {feature.title}
                </h3>

                <p
                  style={{
                    margin: "13px 0 0",
                    color: "#94a3b8",
                    fontSize: 15,
                    lineHeight: 1.75,
                  }}
                >
                  {feature.text}
                </p>

                <button
  type="button"
  onClick={() =>
    setExpandedFeature((currentFeature) =>
      currentFeature === feature.title
        ? null
        : feature.title
    )
  }
  aria-expanded={expandedFeature === feature.title}
  style={{
    marginTop: 22,
    padding: 0,
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    border: "none",
    background: "transparent",
    color: "#4fc3f7",
    fontFamily: "inherit",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  }}
>
  {expandedFeature === feature.title
    ? "Show less ↑"
    : "Learn more →"}
</button>

{expandedFeature === feature.title && (
  <div
    style={{
      marginTop: 18,
      paddingTop: 18,
      borderTop: "1px solid #263449",
    }}
  >
    {feature.details.map((paragraph) => (
      <p
        key={paragraph}
        style={{
          margin: "0 0 13px",
          color: "#cbd5e1",
          fontSize: 14,
          lineHeight: 1.75,
        }}
      >
        {paragraph}
      </p>
    ))}
  </div>
)}

              </div>
            ))}
          </div>
        </div>
      </section>

            <section
        id="engineering-capabilities"
        style={{
          padding: "90px 20px",
          borderTop: "1px solid #1e293b",
          background: "#0b1220",
        }}
      >
        <div
          style={{
            width: "min(1280px, 100%)",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              maxWidth: 820,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <span
              style={{
                color: "#4fc3f7",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              Engineering Capabilities
            </span>

            <h2
              style={{
                margin: "12px 0 0",
                color: "#f8fafc",
                fontSize: "clamp(32px, 5vw, 44px)",
                lineHeight: 1.15,
                letterSpacing: -1,
              }}
            >
              Built around real electrical engineering workflows.
            </h2>

            <p
              style={{
                maxWidth: 760,
                margin: "22px auto 0",
                color: "#94a3b8",
                fontSize: 17,
                lineHeight: 1.8,
              }}
            >
              Currist goes beyond project organization by connecting
              electrical calculations, load schedules, panel revisions,
              technical documentation and project delivery within the same
              engineering workspace.
            </p>
          </div>

          <div
            style={{
              margin: "34px auto 0",
              maxWidth: 900,
              padding: "22px 24px",
              border: "1px solid #334155",
              borderRadius: 16,
              background:
                "linear-gradient(130deg, rgba(79, 195, 247, 0.08), transparent 60%), #111827",
              textAlign: "center",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#f8fafc",
                fontSize: 21,
                lineHeight: 1.4,
              }}
            >
              Currist remembers your engineering decisions.
            </strong>

            <p
              style={{
                margin: "10px 0 0",
                color: "#94a3b8",
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              Project structures, panel relationships, connected loads,
              engineering revisions, approval status and technical outputs
              remain connected to the same project model.
            </p>
          </div>

          <div
            style={{
              marginTop: 48,
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(270px, 1fr))",
              gap: 18,
            }}
          >
            {[
              {
                icon: "📋",
                title: "Intelligent Load Schedules",
                text: "Generate professional load schedules directly from the live project model instead of maintaining disconnected spreadsheets.",
                status: "Available",
                statusType: "available",
              },
              {
                icon: "📚",
                title: "Equipment Catalogs",
                text: "Select pumps, fans, AHUs and other supported equipment by manufacturer and model. Electrical properties such as power, voltage and phase configuration can be populated from catalog data.",
                status: "Advanced",
                statusType: "advanced",
              },
              {
                icon: "⚖️",
                title: "Phase Balance",
                text: "Review phase loading across R, S and T and identify unbalanced electrical distribution while the project is being developed.",
                status: "Available",
                statusType: "available",
              },
              {
                icon: "⚡",
                title: "Electrical Analysis",
                text: "Review installed power, estimated current, active and reactive power, apparent power, power factor and phase distribution from the connected project data.",
                status: "Available",
                statusType: "available",
              },
              {
                icon: "🔌",
                title: "Cable Sizing Workflows",
                text: "Use feeder, load and project information as the foundation for cable selection, current-carrying capacity and related engineering checks.",
                status: "Planned",
                statusType: "planned",
              },
              {
                icon: "🧮",
                title: "Reactive Power Compensation",
                text: "Support capacitor-bank planning and reactive power compensation using the electrical characteristics of the project and its connected loads.",
                status: "Planned",
                statusType: "planned",
              },
              {
                icon: "📝",
                title: "Revision History",
                text: "Keep engineering notes and panel revisions together and review what changed during the development of the electrical design.",
                status: "Available",
                statusType: "available",
              },
              {
                icon: "✅",
                title: "Approval Workflow",
                text: "Move panels through engineering review and mark completed designs as approved before manufacturing or final project delivery.",
                status: "Planned",
                statusType: "planned",
              },
              {
                icon: "📧",
                title: "Manufacturer Delivery",
                text: "Prepare approved panel information for direct delivery to panel manufacturers without rebuilding the same technical package in separate documents.",
                status: "Planned",
                statusType: "planned",
              },
              {
                icon: "♻️",
                title: "Reusable Panel Designs",
                text: "Copy and reuse existing panel designs in new project locations while preserving connected engineering information and project consistency.",
                status: "Available",
                statusType: "available",
              },
              {
                icon: "📊",
                title: "Professional Engineering Outputs",
                text: "Prepare load schedules, project summaries, phase analysis, panel information, cable summaries and structured Excel reports from the same project model.",
                status: "Available",
                statusType: "available",
              },
              {
                icon: "☁️",
                title: "Cloud Engineering Workspace",
                text: "Save, reopen and continue user-specific projects across supported computers, tablets and other devices.",
                status: "Available",
                statusType: "available",
              },
            ].map((capability) => {
              const badgeStyle =
                capability.statusType === "available"
                  ? {
                      border: "1px solid rgba(34, 197, 94, 0.28)",
                      background: "rgba(34, 197, 94, 0.1)",
                      color: "#86efac",
                    }
                  : capability.statusType === "advanced"
                    ? {
                        border: "1px solid rgba(168, 85, 247, 0.32)",
                        background: "rgba(126, 34, 206, 0.14)",
                        color: "#d8b4fe",
                      }
                    : {
                        border: "1px solid rgba(245, 158, 11, 0.28)",
                        background: "rgba(245, 158, 11, 0.1)",
                        color: "#fcd34d",
                      };

              return (
                <article
                  key={capability.title}
                  style={{
                    minHeight: 255,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    border: "1px solid #263449",
                    borderRadius: 17,
                    background: "#111827",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 14,
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        border: "1px solid #334155",
                        borderRadius: 13,
                        background: "#172033",
                        fontSize: 22,
                      }}
                    >
                      {capability.icon}
                    </div>

                    <span
                      style={{
                        ...badgeStyle,
                        padding: "4px 8px",
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 0.4,
                      }}
                    >
                      {capability.status}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: "20px 0 0",
                      color: "#f8fafc",
                      fontSize: 18,
                      lineHeight: 1.35,
                    }}
                  >
                    {capability.title}
                  </h3>

                  <p
                    style={{
                      margin: "11px 0 0",
                      color: "#94a3b8",
                      fontSize: 14,
                      lineHeight: 1.75,
                    }}
                  >
                    {capability.text}
                  </p>
                </article>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 28,
              padding: "16px 20px",
              border: "1px solid #334155",
              borderRadius: 14,
              background: "#0f172a",
              color: "#94a3b8",
              fontSize: 13,
              lineHeight: 1.7,
              textAlign: "center",
            }}
          >
            Feature availability may vary by membership plan. During the
            current development period, registered users may be given access
            to selected Advanced capabilities for testing and evaluation.
          </div>
        </div>
      </section>

      <section
        id="pricing"
        style={{
          padding: "90px 20px",
          borderTop: "1px solid #1e293b",
          background: "#0b1220",
        }}
      >
        <div
          style={{
            width: "min(1280px, 100%)",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              maxWidth: 760,
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            <span
              style={{
                color: "#4fc3f7",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1.4,
                textTransform: "uppercase",
              }}
            >
              Pricing
            </span>

            <h2
              style={{
                margin: "12px 0 0",
                color: "#f8fafc",
                fontSize: 42,
                lineHeight: 1.15,
                letterSpacing: -1,
              }}
            >
              Choose the plan that fits your engineering workflow.
            </h2>

            <p
              style={{
                margin: "22px auto 0",
                maxWidth: 680,
                color: "#94a3b8",
                fontSize: 17,
                lineHeight: 1.8,
              }}
            >
              Start with the essentials and move to more advanced engineering
              tools as your projects grow.
            </p>
          </div>

          <div
            style={{
              margin: "38px auto 0",
              maxWidth: 900,
              padding: "16px 20px",
              border: "1px solid #334155",
              borderRadius: 14,
              background: "#111827",
              color: "#94a3b8",
              fontSize: 14,
              lineHeight: 1.7,
              textAlign: "center",
            }}
          >
            <strong
              style={{
                color: "#e2e8f0",
              }}
            >
              Early Development Notice:
            </strong>{" "}
            Currist is currently under active development. Pricing, feature
            availability and package contents shown below are preliminary and
            may change before the official release.
          </div>

          <div
            style={{
              marginTop: 48,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              gap: 22,
              alignItems: "stretch",
            }}
          >
            <article
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 560,
                padding: 30,
                border: "1px solid #263449",
                borderRadius: 20,
                background: "#111827",
              }}
            >
              <span
                style={{
                  color: "#4ade80",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Basic
              </span>

              <h3
                style={{
                  margin: "14px 0 0",
                  color: "#f8fafc",
                  fontSize: 28,
                }}
              >
                Free
              </h3>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#94a3b8",
                  lineHeight: 1.7,
                }}
              >
                Essential tools for small projects and first-time users.
              </p>

              <div
                style={{
                  height: 1,
                  margin: "26px 0",
                  background: "#263449",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gap: 15,
                }}
              >
                {[
                  "Limited projects",
                  "Basic project management",
                  "Limited structures and panels",
                  "Limited export",
                  "Basic engineering workspace",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      gap: 11,
                      color: "#cbd5e1",
                      fontSize: 15,
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      style={{
                        color: "#4ade80",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                href="/login"
                style={{
                  marginTop: "auto",
                  padding: "13px 18px",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  color: "#f8fafc",
                  fontSize: 14,
                  fontWeight: 800,
                  textAlign: "center",
                  textDecoration: "none",
                  background: "#172033",
                }}
              >
                Start Free
              </Link>
            </article>

            <article
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                minHeight: 560,
                padding: 30,
                border: "1px solid #4fc3f7",
                borderRadius: 20,
                background: "#111827",
                boxShadow: "0 0 0 1px rgba(79, 195, 247, 0.12)",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: -14,
                  left: "50%",
                  transform: "translateX(-50%)",
                  padding: "7px 13px",
                  borderRadius: 999,
                  background: "#4fc3f7",
                  color: "#07111f",
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Planned
              </span>

              <span
                style={{
                  color: "#4fc3f7",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Standard
              </span>

              <h3
                style={{
                  margin: "14px 0 0",
                  color: "#f8fafc",
                  fontSize: 28,
                }}
              >
                Coming Soon
              </h3>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#94a3b8",
                  lineHeight: 1.7,
                }}
              >
                A broader workspace for regular and growing projects.
              </p>

              <div
                style={{
                  height: 1,
                  margin: "26px 0",
                  background: "#263449",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gap: 15,
                }}
              >
                {[
                  "More projects and project capacity",
                  "Cloud project storage",
                  "Import and export",
                  "Expanded panel and load limits",
                  "Additional engineering tools",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      gap: 11,
                      color: "#cbd5e1",
                      fontSize: 15,
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      style={{
                        color: "#4fc3f7",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled
                style={{
                  marginTop: "auto",
                  padding: "13px 18px",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  color: "#64748b",
                  fontSize: 14,
                  fontWeight: 800,
                  background: "#172033",
                  cursor: "not-allowed",
                }}
              >
                Coming Soon
              </button>
            </article>

            <article
              style={{
                display: "flex",
                flexDirection: "column",
                minHeight: 560,
                padding: 30,
                border: "1px solid #263449",
                borderRadius: 20,
                background: "#111827",
              }}
            >
              <span
                style={{
                  color: "#c084fc",
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1.2,
                  textTransform: "uppercase",
                }}
              >
                Advanced
              </span>

              <h3
                style={{
                  margin: "14px 0 0",
                  color: "#f8fafc",
                  fontSize: 28,
                }}
              >
                Coming Soon
              </h3>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#94a3b8",
                  lineHeight: 1.7,
                }}
              >
                Advanced engineering and automation tools for larger and more complex projects.
              </p>

              <div
                style={{
                  height: 1,
                  margin: "26px 0",
                  background: "#263449",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gap: 15,
                }}
              >
                {[
                  "Everything in Standard",
                  "Full engineering catalogs",
                  "Automatic load catalog data",
                  "Automatic motor feeder & typical circuit generation",
                  "Cable type and cross-section calculations",
                  "Cable length and voltage-drop calculations",
                  "Advanced engineering reports",
                ].map((item) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      gap: 11,
                      color: "#cbd5e1",
                      fontSize: 15,
                      lineHeight: 1.55,
                    }}
                  >
                    <span
                      style={{
                        color: "#c084fc",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                disabled
                style={{
                  marginTop: "auto",
                  padding: "13px 18px",
                  border: "1px solid #334155",
                  borderRadius: 12,
                  color: "#64748b",
                  fontSize: 14,
                  fontWeight: 800,
                  background: "#172033",
                  cursor: "not-allowed",
                }}
              >
                Coming Soon
              </button>
            </article>
          </div>

          <p
            style={{
              margin: "32px auto 0",
              maxWidth: 850,
              color: "#64748b",
              fontSize: 12,
              lineHeight: 1.7,
              textAlign: "center",
            }}
          >
            Plan limits, calculation capabilities, pricing and included
            features may be revised as Currist continues to be developed and
            tested.
          </p>
        </div>
      </section>

      <section
        style={{
          padding: "85px 20px",
          borderTop: "1px solid #1e293b",
          background: "#0f172a",
        }}
      >
        <div
          style={{
            width: "min(1100px, 100%)",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <span
            style={{
              color: "#4fc3f7",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            Behind Currist
          </span>

          <h2
            style={{
              margin: "12px 0 0",
              color: "#f8fafc",
              fontSize: 40,
              lineHeight: 1.15,
              letterSpacing: -1,
            }}
          >
            Designed around real engineering needs.
          </h2>

          <p
            style={{
              maxWidth: 740,
              margin: "22px auto 0",
              color: "#94a3b8",
              fontSize: 17,
              lineHeight: 1.8,
            }}
          >
            Currist is an independently developed electrical engineering
            platform created to bring project structures, panels, loads and
            engineering information together in one connected workspace.
          </p>

          <div
            style={{
              maxWidth: 760,
              margin: "38px auto 0",
              padding: "30px",
              border: "1px solid #263449",
              borderRadius: 18,
              background: "#111827",
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                margin: "0 auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid #334155",
                borderRadius: 14,
                background: "#172033",
                color: "#4fc3f7",
                fontSize: 19,
                fontWeight: 900,
              }}
            >
              EY
            </div>

            <h3
              style={{
                margin: "18px 0 0",
                color: "#f8fafc",
                fontSize: 23,
              }}
            >
              Ergin Yurttaş
            </h3>

            <p
              style={{
                margin: "7px 0 0",
                color: "#4fc3f7",
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: 0.4,
              }}
            >
              Creator &amp; Development Lead
            </p>

            <p
              style={{
                maxWidth: 620,
                margin: "20px auto 0",
                color: "#cbd5e1",
                fontSize: 15,
                lineHeight: 1.8,
              }}
            >
              The original concept behind Currist and its ongoing development
              are led by Ergin Yurttaş. The platform is being shaped around
              practical electrical engineering workflows and will continue to
              evolve through development, testing and user feedback.
            </p>

            <div
              style={{
                marginTop: 26,
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <a
                href="#"
                aria-label="Currist on LinkedIn"
                style={{
                  minHeight: 42,
                  padding: "0 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  background: "#172033",
                  color: "#e2e8f0",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                LinkedIn
              </a>

              <a
                href="#"
                aria-label="Currist on Instagram"
                style={{
                  minHeight: 42,
                  padding: "0 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  background: "#172033",
                  color: "#e2e8f0",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Instagram
              </a>

              <a
                href="#"
                aria-label="Currist on GitHub"
                style={{
                  minHeight: 42,
                  padding: "0 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #334155",
                  borderRadius: 10,
                  background: "#172033",
                  color: "#e2e8f0",
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: "30px 28px",
          borderTop: "1px solid #1e293b",
          background: "#0b1220",
        }}
      >
        <div
          style={{
            width: "min(1280px, 100%)",
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 20,
          }}
        >
          <div>
            <div
              style={{
                color: "#f8fafc",
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              Currist
            </div>

            <div
              style={{
                marginTop: 5,
                color: "#64748b",
                fontSize: 12,
              }}
            >
              Electrical Engineering Platform
            </div>
          </div>

          <div
            style={{
              color: "#64748b",
              fontSize: 12,
              textAlign: "right",
            }}
          >
            © 2026 Currist. All rights reserved.
          </div>
        </div>
      </footer>

    </main>
  );
}

const navLinkStyle = {
  color: "#cbd5e1",
  textDecoration: "none",
  cursor: "pointer",
};

const primaryButtonStyle = {
  padding: "10px 15px",
  border: "1px solid #4fc3f7",
  borderRadius: 9,
  background: "#4fc3f7",
  color: "#082f49",
  fontSize: 13,
  fontWeight: 800,
  textDecoration: "none",
};

const secondaryButtonStyle = {
  padding: "10px 15px",
  border: "1px solid #334155",
  borderRadius: 9,
  background: "#1e293b",
  color: "white",
  fontSize: 13,
  fontWeight: 700,
  textDecoration: "none",
};

const largePrimaryButtonStyle = {
  minHeight: 50,
  padding: "0 22px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #4fc3f7",
  borderRadius: 10,
  background: "#4fc3f7",
  color: "#082f49",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
};

const largeSecondaryButtonStyle = {
  minHeight: 50,
  padding: "0 22px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #475569",
  borderRadius: 10,
  background: "#1e293b",
  color: "white",
  fontSize: 14,
  fontWeight: 800,
  textDecoration: "none",
};

const treeRowStyle = {
  minHeight: 40,
  padding: "8px 10px",
  display: "flex",
  alignItems: "center",
  gap: 9,
  borderRadius: 8,
  color: "white",
  fontSize: 13,
};

const statCardStyle = {
  padding: 15,
  border: "1px solid #334155",
  borderRadius: 10,
  background: "#0f172a",
};

const statNumberStyle = {
  display: "block",
  fontSize: 21,
};

const statLabelStyle = {
  display: "block",
  marginTop: 5,
  color: "#94a3b8",
  fontSize: 10,
};

const featureCardStyle = {
  minHeight: 220,
  padding: 25,
  border: "1px solid #334155",
  borderRadius: 14,
  background: "#0f172a",
};

const featureIconStyle = {
  width: 46,
  height: 46,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid #334155",
  borderRadius: 11,
  background: "#1e293b",
  fontSize: 21,
};

const featureTitleStyle = {
  margin: "20px 0 0",
  fontSize: 18,
};

const featureTextStyle = {
  margin: "12px 0 0",
  color: "#94a3b8",
  fontSize: 13,
  lineHeight: 1.7,
};