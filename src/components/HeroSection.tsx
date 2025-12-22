import heroImage from "@/assets/hero-team.jpg";
const HeroSection = () => {
  return <section className="relative min-h-[45vh] md:min-h-[50vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Teamet som hämtar granar" className="w-full h-full object-cover object-top" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest/50 via-forest/40 to-forest/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-snow mb-6 animate-fade-in-up text-balance leading-tight">
          Granupphämtning i Trollhättan
        </h1>
        
        
      </div>

      {/* Decorative bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-background" />
    </section>;
};
export default HeroSection;