import heroImage from "@/assets/hero-forest.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt="Snötäckt vinterskog"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/60 via-forest/50 to-forest/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-snow mb-6 animate-fade-in-up text-balance leading-tight">
          Granupphämtning i Trollhättan
        </h1>
        <p className="text-lg md:text-xl lg:text-2xl font-serif italic text-snow/90 max-w-3xl mx-auto mb-4 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          Låt oss ta hand om och återvinna din julgran på rätt sätt – snabbt, smidigt och enkelt!
        </p>
        <p className="text-base md:text-lg text-snow/80 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          Slipp allt jobb med granen efter julen, boka via formuläret nedan och betala i samband med upphämtningen.
        </p>
      </div>

      {/* Decorative bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-background" />
    </section>
  );
};

export default HeroSection;
