import Link from "next/link";

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
};

export default function DashboardCard({
  title,
  description,
  href,
}: DashboardCardProps) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-md"
    >
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        {description}
      </p>
    </Link>
  );
}