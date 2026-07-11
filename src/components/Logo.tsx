import Image from "next/image";

/**
 * Official transparent logo supplied by the user.
 * The source file is preserved byte-for-byte. Its large transparent canvas is
 * clipped with CSS so the artwork stays crisp and legible in compact nav bars.
 */
export function Logo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <span
      className={`relative inline-block aspect-[328/78] shrink-0 overflow-hidden ${className}`}
      role="img"
      aria-label="البكري أوفرسيز — ELBAKRI OVERSEAS EST. 1982"
    >
      <Image
        src="/brand/elbakri-logo-official.png"
        alt=""
        width={500}
        height={500}
        priority={priority}
        aria-hidden
        className="pointer-events-none absolute left-[-26.22%] top-[-270.5%] h-auto w-[152.44%] max-w-none select-none"
      />
    </span>
  );
}
