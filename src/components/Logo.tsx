import Image from "next/image";

/**
 * Official ELBAKRI OVERSEAS logo.
 * Uses the tightly-trimmed transparent asset (326×78) so height-based sizing is
 * predictable and the artwork keeps its clear space at every size.
 * Height comes from the passed `className` (e.g. "h-8"); width follows aspect.
 */
export function Logo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/brand/elbakri-logo-wordmark.png"
      alt="البكري أوفرسيز"
      width={326}
      height={78}
      priority={priority}
      className={`w-auto select-none ${className}`}
    />
  );
}
