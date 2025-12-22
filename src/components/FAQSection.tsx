import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Är ni företag?",
    answer: "Nej, vi är inte ett registrerat företag utan två privatpersoner som gör detta på vår fritid eftersom vi själva saknade en motsvarande tjänst. Alla intäkter tas därför upp i våra egna deklarationer.",
  },
  {
    question: "Hur mycket kostar en upphämtningen?",
    answer: "En granupphämtning kostar 100 kr per gran.",
  },
  {
    question: "Hur förbereder jag inför upphämtningen?",
    answer: "Ta bort allt pynt från granen och placera den antingen vid din tomtgräns eller i anslutning till din lägenhet. Om du önskar få din gran upphämtad i hemmet ska det uppges i bokningsformuläret.",
  },
  {
    question: "Hur och när betalar jag?",
    answer: "Betalning sker senast i samband med upphämtningen och görs via Swish.",
  },
  {
    question: "Måste jag vara hemma under upphämtningen?",
    answer: "Nej, ställ ut granen så fixar vi resten.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-8 text-center">
            Vanliga frågor
          </h2>
          
          <Accordion type="single" collapsible className="space-y-3 mb-8">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-lg border border-border/50 px-4"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          
          <div className="text-center">
            <div className="bg-primary text-primary-foreground rounded-lg px-6 py-3 inline-block">
              <p className="text-base md:text-lg font-semibold">Vid frågor, skicka ett sms till: <br /> 073-852 30 62</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
