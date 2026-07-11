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
  const h = height === "lg" ? "min-h-[68vh]" : "min-h-[42vh] md:min-h-[48vh]";
  return (
    <section className={`relative ${h} w-full overflow-hidden flex items-end`}>
      <Image
        src={image}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
      />
      {/* Stable navy scrim so text stays legible over any photo */}
      <div className="absolute inset-0 bg-gradient-to-t from-midnight/90 via-navy/55 to-navy/20" />
      <div className="relative mx-auto w-full max-w-6xl px-5 pb-10 text-white md:pb-14">
        {eyebrow && (
          <div className="mb-2 text-sm font-bold text-champagne">
            <span className="ltr:inline">{eyebrow}</span>
          </div>
        )}
        <h1 className="text-3xl font-bold leading-tight md:text-5xl">{title}</h1>
        {subtitle && (
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}
