import AuthForm from "../components/AuthForm";
import CurristLogo from "../components/CurristLogo";
import { theme } from "../design/theme";

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: theme.colors.background,
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily,
      }}
    >
      <header
        style={{
          height: theme.layout.headerHeight,
          padding: `0 ${theme.layout.pageHorizontalPadding}px`,
          display: "flex",
          alignItems: "center",
          borderBottom: `1px solid ${theme.colors.border}`,
        }}
      >
        <CurristLogo href="/" />
      </header>

      <div
        style={{
          width: "min(1120px, calc(100% - 40px))",
          margin: "0 auto",
          padding: "48px 0 60px",
        }}
      >
        <AuthForm />
      </div>
    </main>
  );
}