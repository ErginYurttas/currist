"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CurristLogo from "./CurristLogo";
import { supabase } from "../lib/supabase";
import {
  getCurrentUserProfile,
  type UserProfile,
} from "../lib/profile";
import { theme } from "../design/theme";

type HeaderProps = {
  logoHref?: string;
};

export default function Header({
  logoHref = "/dashboard",
}: HeaderProps) {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [authReady, setAuthReady] = useState(false);

  const [languageMenuOpen, setLanguageMenuOpen] =
    useState(false);

  const [userMenuOpen, setUserMenuOpen] =
    useState(false);

  useEffect(() => {
    const loadHeaderUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthReady(true);
        return;
      }

      setEmail(user.email || "");

      try {
        const currentProfile =
          await getCurrentUserProfile();

        setProfile(currentProfile);
      } catch (error) {
        console.error(
          "Header profile could not be loaded.",
          error
        );
      } finally {
        setAuthReady(true);
      }
    };

    void loadHeaderUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout failed.", error);
      return;
    }

    router.push("/login");
    router.refresh();
  };

  const profileInitial =
    profile?.fullName?.trim().charAt(0).toUpperCase() ||
    email.charAt(0).toUpperCase() ||
    "C";

  const isAdmin = profile?.role === "admin";

  return (
    <header
      style={{
        width: "100%",
        height: theme.layout.headerHeight,
        boxSizing: "border-box",
        padding: `0 ${theme.layout.pageHorizontalPadding}px`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 20,
        borderBottom: `1px solid ${theme.colors.border}`,
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily,
        position: "relative",
        zIndex: 1000,
      }}
    >
      <CurristLogo href={logoHref} />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 10,
          minWidth: 0,
        }}
      >
        {/* LANGUAGE MENU */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => {
              setLanguageMenuOpen(
                (currentValue) => !currentValue
              );
              setUserMenuOpen(false);
            }}
            aria-expanded={languageMenuOpen}
            style={{
              minHeight: 40,
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: `1px solid ${theme.colors.borderSoft}`,
              borderRadius: 10,
              background: languageMenuOpen
                ? theme.colors.surfaceSoft
                : theme.colors.background,
              color: theme.colors.text,
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            🇬🇧 EN {languageMenuOpen ? "▲" : "▼"}
          </button>

          {languageMenuOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: 0,
                width: 210,
                padding: 6,
                display: "flex",
                flexDirection: "column",
                border: `1px solid ${theme.colors.borderSoft}`,
                borderRadius: 10,
                background: theme.colors.background,
                boxShadow:
                  "0 18px 45px rgba(0, 0, 0, 0.4)",
                zIndex: 16000,
              }}
            >
              <button
                type="button"
                onClick={() =>
                  setLanguageMenuOpen(false)
                }
                style={languageItemStyle}
              >
                🇬🇧 EN
              </button>

              {[
                ["🇩🇪", "DE"],
                ["🇫🇷", "FR"],
                ["🇪🇸", "ES"],
                ["🇹🇷", "TR"],
                ["🇷🇺", "RU"],
                ["🇨🇳", "中文"],
              ].map(([flag, label]) => (
                <button
                  key={label}
                  type="button"
                  disabled
                  style={disabledLanguageItemStyle}
                >
                  <span>
                    {flag} {label}
                  </span>

                  <span style={{ fontSize: 10 }}>
                    Coming Soon
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* USER MENU */}
        {authReady && email && (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => {
                setUserMenuOpen(
                  (currentValue) => !currentValue
                );
                setLanguageMenuOpen(false);
              }}
              aria-expanded={userMenuOpen}
              style={{
                minHeight: 40,
                padding: "5px 10px 5px 6px",
                display: "flex",
                alignItems: "center",
                gap: 9,
                border: `1px solid ${theme.colors.borderSoft}`,
                borderRadius: 10,
                background: userMenuOpen
                  ? theme.colors.surfaceSoft
                  : theme.colors.background,
                color: theme.colors.text,
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              <span
                style={{
                  width: 30,
                  height: 30,
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "50%",
                  background: "#1e40af",
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {profileInitial}
              </span>

              <span
                style={{
                  maxWidth: 150,
                  overflow: "hidden",
                  fontSize: 13,
                  fontWeight: 700,
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {profile?.fullName || "Signed in"}
              </span>

              <span
                style={{
                  color: theme.colors.textSecondary,
                  fontSize: 10,
                }}
              >
                {userMenuOpen ? "▲" : "▼"}
              </span>
            </button>

            {userMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 260,
                  padding: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                  border: `1px solid ${theme.colors.borderSoft}`,
                  borderRadius: 12,
                  background: theme.colors.background,
                  color: theme.colors.text,
                  boxShadow:
                    "0 18px 45px rgba(0, 0, 0, 0.4)",
                  zIndex: 16000,
                }}
              >
                <div
                  style={{
                    padding: "6px 8px 10px",
                  }}
                >
                  <strong
                    style={{
                      display: "block",
                      fontSize: 13,
                    }}
                  >
                    {profile?.fullName || "Signed in"}
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: 4,
                      overflow: "hidden",
                      color: theme.colors.textSecondary,
                      fontSize: 11,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {email}
                  </span>
                </div>

                <div
                  style={{
                    padding: "0 8px 10px",
                    display: "flex",
                    gap: 7,
                  }}
                >
                  <span style={planBadgeStyle}>
                    {(profile?.plan || "basic").toUpperCase()}
                  </span>

                  {isAdmin && (
                    <span style={adminBadgeStyle}>
                      ADMIN
                    </span>
                  )}
                </div>

                <div style={dividerStyle} />

                <Link
  href="/profile"
  onClick={() => setUserMenuOpen(false)}
  style={menuItemStyle}
>
  Profile
</Link>

<Link
  href="/dashboard"
  onClick={() => setUserMenuOpen(false)}
  style={menuItemStyle}
>
  My Projects
</Link>

<Link
  href="/tool"
  onClick={() => setUserMenuOpen(false)}
  style={menuItemStyle}
>
  Workspace
</Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={() =>
                      setUserMenuOpen(false)
                    }
                    style={{
                      ...menuItemStyle,
                      color: "#fdba74",
                      fontWeight: 700,
                    }}
                  >
                    Admin Dashboard
                  </Link>
                )}

                <div
                  style={{
                    ...dividerStyle,
                    margin: "6px 0",
                  }}
                />

                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    void handleLogout();
                  }}
                  style={{
                    ...menuItemStyle,
                    border: "none",
                    color: "#fca5a5",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

const languageItemStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 38,
  padding: "9px 10px",
  border: "none",
  borderRadius: 8,
  background: "transparent",
  color: theme.colors.text,
  fontFamily: "inherit",
  textAlign: "left",
  cursor: "pointer",
};

const disabledLanguageItemStyle: React.CSSProperties = {
  ...languageItemStyle,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  color: theme.colors.textMuted,
  cursor: "not-allowed",
};

const menuItemStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 38,
  boxSizing: "border-box",
  padding: "9px 10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  borderRadius: 8,
  background: "transparent",
  color: theme.colors.text,
  fontFamily: "inherit",
  fontSize: 13,
  textAlign: "left",
  textDecoration: "none",
};

const planBadgeStyle: React.CSSProperties = {
  padding: "3px 8px",
  borderRadius: theme.radius.pill,
  background: "#1e3a8a",
  color: "#bfdbfe",
  fontSize: 10,
  fontWeight: 800,
};

const adminBadgeStyle: React.CSSProperties = {
  padding: "3px 8px",
  borderRadius: theme.radius.pill,
  background: "#7c2d12",
  color: "#fed7aa",
  fontSize: 10,
  fontWeight: 800,
};

const dividerStyle: React.CSSProperties = {
  height: 1,
  margin: "0 0 6px",
  background: theme.colors.borderSoft,
};