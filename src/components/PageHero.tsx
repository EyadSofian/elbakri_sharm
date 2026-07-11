import Image from "next/image";

type Height = "md" | "lg";

export function PageHero({
  image,
  eyebrow,
  title,
  subtitle,
  height = "md",
  priority = false,
}: {
  image: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  height?: Height;
  priority?: boolean;
}) {
  const h =
    height === "lg"
      ? "min-h-[68svh] md:min-h-[70vh]"
      : "min-h-[320px] sm:min-h-[380px] md:min-h-[46vh]";
  return (
    <section className={`relative isolate flex ${h} w-full items-end overflow-hidden`}>
      <Image
        src={image}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/95 via-navy/50 to-midnight/10" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_30%,rgba(200,155,60,0.16),transparent_36%)]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 pb-8 text-white sm:px-6 sm:pb-10 md:pb-14">
        {eyebrow && (
          <div className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-champagne backdrop-blur">
            {eyebrow}
          </div>
        )}
        <h1 className="max-w-4xl text-[clamp(2.25rem,7vw,4.5rem)] font-extrabold leading-[1.15] text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-sm leading-[1.8] text-white/84 sm:text-base md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
