/**
 * Bidi-safe price. Latin numerals are directionally isolated so they never
 * reorder inside the RTL layout. Renders an em dash when the price is unknown.
 */
export function Price({ value, className = "" }: { value: number | null; className?: string }) {
  if (value == null) return <span className={className}>—</span>;
  return (
    <span dir="ltr" className={`ltr ${className}`}>
      {value.toLocaleString("en-US")}
    </span>
  );
}
