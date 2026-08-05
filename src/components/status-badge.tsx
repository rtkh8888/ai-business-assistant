type StatusBadgeProps = {
  label: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return <span className={`badge badge-${tone}`}>{label}</span>;
}

