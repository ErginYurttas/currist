export const theme = {
  colors: {
    background: "#0f172a",
    backgroundSoft: "#17335f",

    surface: "#111827",
    surfaceSoft: "#162033",
    surfaceTransparent: "rgba(15, 23, 42, 0.78)",

    border: "#1e293b",
    borderSoft: "#334155",

    primary: "#4fc3f7",
    primaryHover: "#38bdf8",

    text: "#ffffff",
    textSecondary: "#94a3b8",
    textMuted: "#64748b",

    success: "#22c55e",
    warning: "#f59e0b",
    danger: "#ef4444",
  },

  gradients: {
    page: "radial-gradient(circle at top left, #17335f 0%, #0f172a 45%, #0f172a 100%)",
  },

  radius: {
    small: 8,
    input: 12,
    button: 12,
    card: 22,
    pill: 999,
  },

  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  layout: {
    headerHeight: 72,
    pageHorizontalPadding: 28,

    pagePaddingDesktop: "48px 24px",
    pagePaddingTablet: "32px 20px",
    pagePaddingMobile: "24px 16px",

    contentWidth: 1120,
    wideContentWidth: 1280,
  },

  typography: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

    titleSize: 32,
    sectionTitleSize: 24,
    bodySize: 16,
    smallSize: 14,
  },

  shadow: {
    card: "0 24px 60px rgba(2, 6, 23, 0.32)",
  },

  transition: {
    fast: "150ms ease",
    normal: "220ms ease",
  },
} as const;

export type CurristTheme = typeof theme;