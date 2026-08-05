"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

import { theme } from "../design/theme";
import Header from "../components/Header";


type ProfileForm = {
  full_name: string;
  account_type: "individual" | "company";
  company_name: string;
  country: string;
  profession: string;
};

const emptyForm: ProfileForm = {
  full_name: "",
  account_type: "individual",
  company_name: "",
  country: "",
  profession: "",
};

export default function ProfilePage() {
  const router = useRouter();

  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);
      setMessage(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.replace("/login");
        return;
      }

      setEmail(user.email ?? "");

      const { data, error: profileError } = await supabase
        .from("profiles")
        .select(
          "full_name, account_type, company_name, country, profession"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        setMessage({
          type: "error",
          text: profileError.message,
        });

        setLoading(false);
        return;
      }

      if (data) {
        setForm({
          full_name: data.full_name ?? "",
          account_type:
            data.account_type === "company" ? "company" : "individual",
          company_name: data.company_name ?? "",
          country: data.country ?? "",
          profession: data.profession ?? "",
        });
      }

      setLoading(false);
    }

    void loadProfile();
  }, [router]);

  function updateField<K extends keyof ProfileForm>(
    field: K,
    value: ProfileForm[K]
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));

    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setMessage(null);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setSaving(false);
      router.replace("/login");
      return;
    }

    const normalizedCompanyName =
      form.account_type === "company"
        ? form.company_name.trim() || null
        : null;

    const { data: updatedProfile, error: saveError } = await supabase
        .from("profiles")
        .update({
        full_name: form.full_name.trim() || null,
        account_type: form.account_type,
        company_name: normalizedCompanyName,
        country: form.country.trim() || null,
        profession: form.profession.trim() || null,
         })
        .eq("id", user.id)
        .select("id")
        .maybeSingle();

    if (saveError) {
      setMessage({
        type: "error",
        text: saveError.message,
      });

      setSaving(false);
      return;
    }

    if (!updatedProfile) {
    setMessage({
    type: "error",
    text: "Profile record could not be found.",
    });

    setSaving(false);
    return;
    }

    setMessage({
      type: "success",
      text: "Profile updated successfully.",
    });

    setSaving(false);
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={loadingCardStyle}>Loading profile...</div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      
    <Header logoHref="/dashboard" />

      <div style={pageContainerStyle}>
        

        <section style={profileCardStyle}>
          <div style={headerStyle}>
            <div>
              <div style={eyebrowStyle}>ACCOUNT SETTINGS</div>

              <h1 style={titleStyle}>Your Profile</h1>

              <p style={descriptionStyle}>
                Keep your personal and professional information up to date.
              </p>
            </div>

            <div style={avatarStyle}>
              {getInitials(form.full_name, email)}
            </div>
          </div>

          <div style={emailBoxStyle}>
            <span style={emailLabelStyle}>Signed-in email</span>
            <strong style={emailValueStyle}>{email || "-"}</strong>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={formGridStyle}>
              <label style={fieldStyle}>
                <span style={labelStyle}>Full Name</span>

                <input
                  type="text"
                  value={form.full_name}
                  onChange={(event) =>
                    updateField("full_name", event.target.value)
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  style={inputStyle}
                />
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>Account Type</span>

                <select
                  value={form.account_type}
                  onChange={(event) =>
                    updateField(
                      "account_type",
                      event.target.value as
                        | "individual"
                        | "company"
                    )
                  }
                  style={inputStyle}
                >
                  <option value="individual">Individual</option>
                  <option value="company">Company</option>
                </select>
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>Company Name</span>

                <input
                  type="text"
                  value={form.company_name}
                  disabled={form.account_type !== "company"}
                  onChange={(event) =>
                    updateField("company_name", event.target.value)
                  }
                  placeholder={
                    form.account_type === "company"
                      ? "Enter company name"
                      : "Available for company accounts"
                  }
                  autoComplete="organization"
                  style={{
                    ...inputStyle,
                    opacity:
                      form.account_type === "company" ? 1 : 0.55,
                    cursor:
                      form.account_type === "company"
                        ? "text"
                        : "not-allowed",
                  }}
                />
              </label>

              <label style={fieldStyle}>
                <span style={labelStyle}>Country</span>

                <input
                  type="text"
                  value={form.country}
                  onChange={(event) =>
                    updateField("country", event.target.value)
                  }
                  placeholder="Enter your country"
                  autoComplete="country-name"
                  style={inputStyle}
                />
              </label>

              <label
                style={{
                  ...fieldStyle,
                  gridColumn: "1 / -1",
                }}
              >
                <span style={labelStyle}>Profession</span>

                <input
                  type="text"
                  value={form.profession}
                  onChange={(event) =>
                    updateField("profession", event.target.value)
                  }
                  placeholder="For example: Electrical Engineer"
                  autoComplete="organization-title"
                  style={inputStyle}
                />
              </label>
            </div>

            {message && (
              <div
                style={{
                  ...messageStyle,
                  borderColor:
                    message.type === "success"
                      ? "#166534"
                      : "#991b1b",
                  background:
                    message.type === "success"
                      ? "rgba(22, 101, 52, 0.22)"
                      : "rgba(127, 29, 29, 0.22)",
                  color:
                    message.type === "success"
                      ? "#86efac"
                      : "#fca5a5",
                }}
              >
                {message.text}
              </div>
            )}

            <div style={actionsStyle}>
              

              <button
                type="submit"
                disabled={saving}
                style={{
                  ...primaryButtonStyle,
                  opacity: saving ? 0.65 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function getInitials(fullName: string, email: string) {
  const normalizedName = fullName.trim();

  if (normalizedName) {
    return normalizedName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  return email.charAt(0).toUpperCase() || "?";
}

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  padding: 0,
  background: theme.colors.background,
  color: theme.colors.text,
  fontFamily: theme.typography.fontFamily,
};

const pageContainerStyle: React.CSSProperties = {
  width: "min(900px, calc(100% - 40px))",
  margin: "0 auto",
  padding: "48px 0 60px",
};



const profileCardStyle: React.CSSProperties = {
  border: "1px solid #334155",
  borderRadius: 20,
  padding: 30,
  background: "rgba(30, 41, 59, 0.96)",
  boxShadow: "0 24px 70px rgba(0, 0, 0, 0.3)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 24,
  marginBottom: 26,
};

const eyebrowStyle: React.CSSProperties = {
  marginBottom: 8,
  color: "#60a5fa",
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: "0.12em",
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  color: "#f8fafc",
  fontSize: 30,
};

const descriptionStyle: React.CSSProperties = {
  margin: "9px 0 0",
  color: "#94a3b8",
  fontSize: 14,
};

const avatarStyle: React.CSSProperties = {
  width: 60,
  height: 60,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 18,
  background: "linear-gradient(135deg, #2563eb, #4f46e5)",
  color: "#ffffff",
  fontSize: 21,
  fontWeight: 800,
  boxShadow: "0 10px 25px rgba(37, 99, 235, 0.3)",
};

const emailBoxStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 26,
  padding: "13px 15px",
  border: "1px solid #334155",
  borderRadius: 11,
  background: "#0f172a",
};

const emailLabelStyle: React.CSSProperties = {
  color: "#64748b",
  fontSize: 12,
};

const emailValueStyle: React.CSSProperties = {
  color: "#cbd5e1",
  fontSize: 13,
  wordBreak: "break-word",
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 18,
};

const fieldStyle: React.CSSProperties = {
  display: "block",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  marginBottom: 8,
  color: "#cbd5e1",
  fontSize: 13,
  fontWeight: 700,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #475569",
  borderRadius: 10,
  padding: "11px 13px",
  background: "#0f172a",
  color: "#e2e8f0",
  outline: "none",
};

const messageStyle: React.CSSProperties = {
  marginTop: 20,
  padding: "11px 13px",
  border: "1px solid",
  borderRadius: 9,
  fontSize: 13,
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  marginTop: 24,
  paddingTop: 20,
  borderTop: "1px solid #334155",
};

const primaryButtonStyle: React.CSSProperties = {
  border: "1px solid #2563eb",
  borderRadius: 9,
  padding: "10px 16px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 800,
};

const secondaryButtonStyle: React.CSSProperties = {
  border: "1px solid #475569",
  borderRadius: 9,
  padding: "10px 16px",
  background: "#0f172a",
  color: "#cbd5e1",
  fontWeight: 700,
  cursor: "pointer",
};

const loadingCardStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 500,
  margin: "100px auto",
  padding: 30,
  border: "1px solid #334155",
  borderRadius: 16,
  background: "#1e293b",
  color: "#94a3b8",
  textAlign: "center",
};