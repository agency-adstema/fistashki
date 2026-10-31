import Image from "next/image";

export function PopularBurgersTitle() {
  return (
    <div className="flex items-center justify-center gap-2 sm:justify-start sm:gap-3">
      <div className="relative h-11 w-12 shrink-0 sm:h-12 sm:w-14">
        <Image
          src="/images/crown-logo.png?v=3"
          alt=""
          fill
          unoptimized
          className="object-contain object-left"
          sizes="56px"
          priority
        />
      </div>

      <h2 className="flex flex-col text-left text-xl font-black uppercase leading-none tracking-tight sm:text-2xl lg:text-3xl">
        <span className="text-black">NAJPOPULARNIJI</span>
        <span className="mt-0.5 text-[#F6A300]">BURGERI</span>
      </h2>

      <svg
        viewBox="0 0 40 12"
        className="hidden h-3 w-10 shrink-0 sm:block"
        aria-hidden
      >
        <path
          d="M2 6 L14 6 M18 6 L30 6 M34 6 L38 6"
          stroke="#F6A300"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
