"use client";

import type { CSSProperties, FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type AccountType = "individual" | "company";

export default function AuthForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [accountType, setAccountType] =
    useState<AccountType>("individual");
  const [companyName, setCompanyName] = useState("");
  const [country, setCountry] = useState("");
  const [profession, setProfession] = useState("");

  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);

  const [signInLoading, setSignInLoading] = useState(false);
  const [signUpLoading, setSignUpLoading] = useState(false);

  const [signInError, setSignInError] = useState("");
  const [signUpError, setSignUpError] = useState("");
  const [signUpMessage, setSignUpMessage] = useState("");

  async function handleSignIn(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSignInError("");

    const normalizedEmail = signInEmail
      .trim()
      .toLowerCase();

    if (!normalizedEmail) {
      setSignInError("Please enter your email address.");
      return;
    }

    if (!signInPassword) {
      setSignInError("Please enter your password.");
      return;
    }

    try {
      setSignInLoading(true);

      const { error } =
        await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: signInPassword,
        });

      if (error) {
        throw error;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setSignInError(
        error instanceof Error
          ? error.message
          : "Sign in failed. Please try again."
      );
    } finally {
      setSignInLoading(false);
    }
  }

  async function handleSignUp(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSignUpError("");
    setSignUpMessage("");

    const normalizedFullName = fullName.trim();
    const normalizedCompanyName = companyName.trim();
    const normalizedCountry = country.trim();
    const normalizedProfession = profession.trim();
    const normalizedEmail = signUpEmail
      .trim()
      .toLowerCase();

    if (!normalizedFullName) {
      setSignUpError("Please enter your full name.");
      return;
    }

    if (
      accountType === "company" &&
      !normalizedCompanyName
    ) {
      setSignUpError("Please enter your company name.");
      return;
    }

    if (!normalizedCountry) {
      setSignUpError("Please enter your country.");
      return;
    }

    if (!normalizedProfession) {
      setSignUpError("Please enter your profession.");
      return;
    }

    if (!normalizedEmail) {
      setSignUpError("Please enter your email address.");
      return;
    }

    if (signUpPassword.length < 6) {
      setSignUpError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    if (!termsAccepted) {
      setSignUpError(
        "You must accept the Terms of Service and Privacy Policy."
      );
      return;
    }

    try {
      setSignUpLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
  password: signUpPassword,
  options: {
    emailRedirectTo: `${window.location.origin}/login`,
    data: {
      full_name: normalizedFullName,
      account_type: accountType,
      company_name:
        accountType === "company"
          ? normalizedCompanyName
          : null,
      country: normalizedCountry,
      profession: normalizedProfession,
    },
  },
});

      if (error) {
        throw error;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
        return;
      }

      setSignUpMessage(
        "Your account has been created. Please check your email and confirm your account."
      );

      setSignUpPassword("");
    } catch (error) {
      setSignUpError(
        error instanceof Error
          ? error.message
          : "Account creation failed. Please try again."
      );
    } finally {
      setSignUpLoading(false);
    }
  }

  return (
    <div style={styles.pageShell}>
      

      <section style={styles.authArea}>
        

        <div style={styles.formsGrid}>
          <form
            onSubmit={handleSignIn}
            style={styles.formCard}
          >
            <div style={styles.formHeadingArea}>
              

              <div>
                <h3 style={styles.formTitle}>Sign In</h3>
                <p style={styles.formDescription}>
                  Continue working on your saved projects.
                </p>
              </div>
            </div>

            <label style={styles.field}>
              <span style={styles.label}>
                Email Address
              </span>

              <input
                type="email"
                value={signInEmail}
                onChange={(event) =>
                  setSignInEmail(event.target.value)
                }
                placeholder="name@example.com"
                autoComplete="email"
                disabled={signInLoading}
                style={styles.input}
              />
            </label>

            <label style={styles.field}>
              <span style={styles.label}>Password</span>

              <input
                type="password"
                value={signInPassword}
                onChange={(event) =>
                  setSignInPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={signInLoading}
                style={styles.input}
              />
            </label>

            {signInError && (
              <div style={styles.errorMessage}>
                {signInError}
              </div>
            )}

            <button
              type="submit"
              disabled={signInLoading}
              style={{
                ...styles.primaryButton,
                ...(signInLoading
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {signInLoading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <form
            onSubmit={handleSignUp}
            style={styles.formCard}
          >
            <div style={styles.formHeadingArea}>
              

              <div>
                <h3 style={styles.formTitle}>
                  Create Account
                </h3>

                <p style={styles.formDescription}>
                  Start building your Currist workspace.
                </p>
              </div>
            </div>

            <div style={styles.twoColumnGrid}>
              <label style={styles.field}>
                <span style={styles.label}>Full Name</span>

                <input
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Your full name"
                  autoComplete="name"
                  disabled={signUpLoading}
                  style={styles.input}
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>
                  Profession
                </span>

                <input
                  type="text"
                  value={profession}
                  onChange={(event) =>
                    setProfession(event.target.value)
                  }
                  placeholder="Electrical Engineer"
                  disabled={signUpLoading}
                  style={styles.input}
                />
              </label>
            </div>

            <div style={styles.field}>
              <span style={styles.label}>Account Type</span>

              <div style={styles.accountTypeGrid}>
                <button
                  type="button"
                  onClick={() =>
                    setAccountType("individual")
                  }
                  disabled={signUpLoading}
                  style={{
                    ...styles.accountTypeButton,
                    ...(accountType === "individual"
                      ? styles.accountTypeButtonActive
                      : {}),
                  }}
                >
                  <span style={styles.accountTypeTitle}>
                    Individual
                  </span>

                  <span style={styles.accountTypeText}>
                    Independent engineer or professional
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAccountType("company")
                  }
                  disabled={signUpLoading}
                  style={{
                    ...styles.accountTypeButton,
                    ...(accountType === "company"
                      ? styles.accountTypeButtonActive
                      : {}),
                  }}
                >
                  <span style={styles.accountTypeTitle}>
                    Company
                  </span>

                  <span style={styles.accountTypeText}>
                    Engineering company or project team
                  </span>
                </button>
              </div>
            </div>

            {accountType === "company" && (
              <label style={styles.field}>
                <span style={styles.label}>
                  Company Name
                </span>

                <input
                  type="text"
                  value={companyName}
                  onChange={(event) =>
                    setCompanyName(event.target.value)
                  }
                  placeholder="Company name"
                  autoComplete="organization"
                  disabled={signUpLoading}
                  style={styles.input}
                />
              </label>
            )}

            <div style={styles.twoColumnGrid}>
              <label style={styles.field}>
                <span style={styles.label}>Country</span>

                <input
                  type="text"
                  value={country}
                  onChange={(event) =>
                    setCountry(event.target.value)
                  }
                  placeholder="Türkiye"
                  autoComplete="country-name"
                  disabled={signUpLoading}
                  style={styles.input}
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>
                  Email Address
                </span>

                <input
                  type="email"
                  value={signUpEmail}
                  onChange={(event) =>
                    setSignUpEmail(event.target.value)
                  }
                  placeholder="name@example.com"
                  autoComplete="email"
                  disabled={signUpLoading}
                  style={styles.input}
                />
              </label>
            </div>

            <label style={styles.field}>
              <span style={styles.label}>Password</span>

              <input
                type="password"
                value={signUpPassword}
                onChange={(event) =>
                  setSignUpPassword(event.target.value)
                }
                placeholder="Minimum 6 characters"
                autoComplete="new-password"
                disabled={signUpLoading}
                style={styles.input}
              />
            </label>

            <label style={styles.termsRow}>
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(event) =>
                  setTermsAccepted(event.target.checked)
                }
                disabled={signUpLoading}
                style={styles.checkbox}
              />

              <span style={styles.termsText}>
                I agree to the Terms of Service and
                Privacy Policy.
              </span>
            </label>

            {signUpError && (
              <div style={styles.errorMessage}>
                {signUpError}
              </div>
            )}

            {signUpMessage && (
              <div style={styles.successMessage}>
                {signUpMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={signUpLoading}
              style={{
                ...styles.primaryButton,
                ...(signUpLoading
                  ? styles.disabledButton
                  : {}),
              }}
            >
              {signUpLoading
                ? "Creating account..."
                : "Create Account"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div style={styles.feature}>
      <div style={styles.featureIcon}>✓</div>
      <span>{text}</span>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  pageShell: {
  width: "100%",
  margin: "0",
  display: "block",
  boxSizing: "border-box",
},

  introduction: {
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "32px",
  border: "1px solid #1e293b",
  borderRadius: "18px",
  background:
    "linear-gradient(160deg, #0f172a 0%, #111c33 60%, #172554 100%)",
  color: "#f8fafc",
},

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "13px",
  },

  logo: {
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "14px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "21px",
    fontWeight: 800,
  },

  brandName: {
    fontSize: "21px",
    fontWeight: 800,
  },

  brandCaption: {
    marginTop: "3px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  introContent: {
    marginTop: "70px",
  },

  eyebrow: {
    marginBottom: "20px",
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: 800,
    letterSpacing: "0.14em",
  },

  mainHeading: {
    margin: 0,
    fontSize: "clamp(36px, 4vw, 58px)",
    lineHeight: 1.08,
    letterSpacing: "-0.045em",
  },

  introText: {
    maxWidth: "520px",
    margin: "25px 0 0",
    color: "#cbd5e1",
    fontSize: "16px",
    lineHeight: 1.75,
  },

  features: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginTop: "38px",
  },

  feature: {
    display: "flex",
    alignItems: "center",
    gap: "11px",
    color: "#e2e8f0",
    fontSize: "14px",
  },

  featureIcon: {
    width: "24px",
    height: "24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    border: "1px solid rgba(96, 165, 250, 0.4)",
    borderRadius: "50%",
    background: "rgba(37, 99, 235, 0.15)",
    color: "#60a5fa",
    fontSize: "12px",
    fontWeight: 800,
  },

  introFooter: {
    marginTop: "50px",
    color: "#64748b",
    fontSize: "12px",
  },

  authArea: {
  padding: "0",
  background: "transparent",
  color: "#f8fafc",
},

  authHeader: {
    marginBottom: "30px",
  },

  authTitle: {
    margin: 0,
    fontSize: "31px",
    letterSpacing: "-0.03em",
  },

  authDescription: {
    margin: "9px 0 0",
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  formsGrid: {
    display: "grid",
    gridTemplateColumns:
      "minmax(280px, 0.72fr) minmax(440px, 1.28fr)",
    gap: "22px",
    alignItems: "start",
  },

  formCard: {
    display: "flex",
    flexDirection: "column",
    gap: "17px",
    padding: "25px",
    border: "1px solid #1e293b",
    borderRadius: "18px",
    background: "#0f172a",
  },

    formHeadingArea: {
    marginBottom: "5px",
    },

  

  formTitle: {
    margin: 0,
    fontSize: "21px",
  },

  formDescription: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#cbd5e1",
    fontSize: "12px",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    minHeight: "46px",
    padding: "0 13px",
    border: "1px solid #334155",
    borderRadius: "10px",
    outline: "none",
    background: "#020617",
    color: "#f8fafc",
    fontSize: "14px",
    boxSizing: "border-box",
  },

  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "13px",
  },

  accountTypeGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(2, minmax(0, 1fr))",
    gap: "11px",
  },

  accountTypeButton: {
    minHeight: "74px",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "4px",
    border: "1px solid #334155",
    borderRadius: "11px",
    background: "#020617",
    textAlign: "left",
    cursor: "pointer",
  },

  accountTypeButtonActive: {
    border: "1px solid #3b82f6",
    background: "#172554",
  },

  accountTypeTitle: {
    color: "#f8fafc",
    fontSize: "13px",
    fontWeight: 800,
  },

  accountTypeText: {
    color: "#64748b",
    fontSize: "11px",
    lineHeight: 1.45,
  },

  termsRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: "9px",
    cursor: "pointer",
  },

  checkbox: {
    width: "16px",
    height: "16px",
    marginTop: "1px",
  },

  termsText: {
    color: "#94a3b8",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  errorMessage: {
    padding: "11px 12px",
    border: "1px solid #7f1d1d",
    borderRadius: "10px",
    background: "rgba(127, 29, 29, 0.2)",
    color: "#fca5a5",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  successMessage: {
    padding: "11px 12px",
    border: "1px solid #166534",
    borderRadius: "10px",
    background: "rgba(22, 101, 52, 0.2)",
    color: "#86efac",
    fontSize: "12px",
    lineHeight: 1.5,
  },

  primaryButton: {
    minHeight: "47px",
    marginTop: "2px",
    border: "none",
    borderRadius: "10px",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },
};