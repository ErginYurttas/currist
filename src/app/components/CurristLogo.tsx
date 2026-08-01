import Link from "next/link";

type CurristLogoProps = {
  href?: string;
  size?: number;
};

export default function CurristLogo({
  href = "/",
  size = 25,
}: CurristLogoProps) {
  return (
    <Link
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 11,
        color: "#ffffff",
        textDecoration: "none",
        fontSize: 24,
        fontWeight: 700,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        style={{
          display: "block",
          flexShrink: 0,
        }}
      >
        <path
          d="M5.5 3.5H18.5C20.157 3.5 21.5 4.843 21.5 6.5V9H17.5V7.5H8V17.5H17.5V16H21.5V18.5C21.5 20.157 20.157 21.5 18.5 21.5H5.5C3.843 21.5 2.5 20.157 2.5 18.5V6.5C2.5 4.843 3.843 3.5 5.5 3.5Z"
          fill="#4FC3F7"
        />

        <rect
          x="15.5"
          y="10.5"
          width="7"
          height="4"
          rx="1"
          fill="#4FC3F7"
        />
      </svg>

      <span>Currist</span>
    </Link>
  );
}