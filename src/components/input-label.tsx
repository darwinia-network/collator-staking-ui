export default function InputLabel({ label, bold }: { label: string; bold?: boolean }) {
  return <span className={`text-xs text-white ${bold ? "font-bold" : "font-light"}`}>{label}</span>;
}
