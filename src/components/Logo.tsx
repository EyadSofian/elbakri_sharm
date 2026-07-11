import Image from "next/image";

/**
 * Official brand logo — rendered unchanged from /brand/elbakri-logo.png.
 * object-contain guarantees no stretch/crop regardless of the source ratio.
 * NOTE: the approved *transparent* master (elbakri-logo-transparent.png) was not
 * included in the Lovable export; this uses the local logo bitmap as an interim
 * (see reports/missing-or-uncertain-images.md). Do not recolor or redraw.
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
      src="/brand/elbakri-logo-lockup.png"
      alt="البكري أوفرسيز — ELBAKRI OVERSEAS EST. 1982"
      width={1336}
      height={374}
      priority={priority}
      className={`w-auto object-contain ${className}`}
    />
  );
}
