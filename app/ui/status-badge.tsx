type Props = {
  status: "PENDING" | "BORROWED" | "RETURNED";
  overdue?: boolean;
};

const config = {
  PENDING: { label: "รออนุมัติ", className: "bg-amber-100 text-amber-700" },
  BORROWED: { label: "กำลังยืม", className: "bg-sky-100 text-sky-700" },
  RETURNED: { label: "คืนแล้ว", className: "bg-green-100 text-green-700" },
};

export default function StatusBadge({ status, overdue }: Props) {
  if (overdue) {
    return (
      <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
        เกินกำหนดคืน
      </span>
    );
  }

  const c = config[status];

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${c.className}`}>
      {c.label}
    </span>
  );
}