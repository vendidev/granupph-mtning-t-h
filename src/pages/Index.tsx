import HeroSection from "@/components/HeroSection";
import BookingForm from "@/components/BookingForm";
import FAQSection from "@/components/FAQSection";
import Footer from "@/components/Footer";
const Index = () => {
  return <main className="min-h-screen flex flex-col">
      <HeroSection />

      {/* Booking Section */}
      <section id="booking" className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-3">
                Boka via formuläret
              </h2>
              <p className="text-foreground text-base mb-4">Fyll i dina uppgifter nedan för att boka, och betala senast vid upphämtningen.</p>
              <div className="bg-primary text-primary-foreground rounded-lg px-6 py-3 inline-block">
                <p className="text-lg md:text-xl font-semibold">Pris: 99 kr/gran</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl shadow-card p-6 md:p-8 border border-border/50">
              <BookingForm />
            </div>
          </div>
        </div>
      </section>

      <FAQSection />

      <Footer />
    </main>;
};
export default Index;