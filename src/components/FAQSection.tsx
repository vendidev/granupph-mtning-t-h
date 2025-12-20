import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Vad kostar det att få granen hämtad?",
    answer: "Priset beror på granens storlek. Kontakta oss för prisuppgifter. Betalning sker enkelt vid upphämtningen.",
  },
  {
    question: "Vilka områden hämtar ni ifrån?",
    answer: "Vi hämtar granar inom hela Trollhättans kommun. Om du är osäker på om vi hämtar från din adress, ange den i formuläret så hör vi av oss.",
  },
  {
    question: "Hur ska jag förbereda granen för upphämtning?",
    answer: "Ställ granen utanför vid en lättillgänglig plats, t.ex. vid garageuppfarten eller entrén. Ta gärna bort eventuella dekorationer i förväg.",
  },
  {
    question: "Måste jag vara hemma vid upphämtningen?",
    answer: "Nej, du behöver inte vara hemma. Ställ bara ut granen på överenskommen plats. Om betalning inte skett i förväg måste dock någon kunna ta emot oss.",
  },
  {
    question: "Vad händer med granarna efter upphämtning?",
    answer: "Alla granar återvinns på ett miljövänligt sätt. De flisas och används som bränsle eller kompost.",
  },
  {
    question: "Kan ni hämta flera granar samtidigt?",
    answer: "Ja absolut! Ange bara antalet granar i formuläret under 'Annan information'.",
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
          
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-lg border border-border/50 px-4"
              >
                <AccordionTrigger className="text-left font-medium hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
