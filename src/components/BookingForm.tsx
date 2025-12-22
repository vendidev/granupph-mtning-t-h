import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { TreePine, CheckCircle2, Smartphone, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const bookingSchema = z.object({
  name: z.string().trim().min(2, { message: "Vänligen ange ditt namn" }).max(100),
  email: z.string().trim().email({ message: "Vänligen ange en giltig e-postadress" }),
  phone: z.string().trim().min(8, { message: "Vänligen ange ett giltigt telefonnummer" }).max(20),
  address: z.string().trim().min(5, { message: "Vänligen ange din adress i Trollhättans kommun" }).max(200),
  pickupDate: z.string({ required_error: "Vänligen välj ett datum" }),
  timePreference: z.string().trim().min(1, { message: "Vänligen ange vilken tid som passar dig" }).max(100),
  additionalInfo: z.string().max(500).optional(),
  confirmPayment: z.boolean().refine((val) => val === true, {
    message: "Du måste bekräfta att betalning sker senast vid upphämtning",
  }),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const pickupDates = [
  { value: "2025-01-02", label: "Fredag 2 januari" },
  { value: "2025-01-10", label: "Lördag 10 januari" },
  { value: "2025-01-17", label: "Lördag 17 januari" },
];

const BookingForm = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      pickupDate: "",
      timePreference: "",
      additionalInfo: "",
      confirmPayment: false,
    },
  });

  const onSubmit = async (data: BookingFormData) => {
    setIsLoading(true);
    
    try {
      // Save booking to database
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .insert([
          {
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            pickup_date: data.pickupDate,
            time_preference: data.timePreference,
            additional_info: data.additionalInfo || null,
            confirm_payment: data.confirmPayment,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Send confirmation email via Edge Function
      try {
        await supabase.functions.invoke('send-booking-confirmation', {
          body: {
            id: bookingData.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            address: data.address,
            pickup_date: data.pickupDate,
            time_preference: data.timePreference,
            additional_info: data.additionalInfo || null,
          },
        });
      } catch (emailError) {
        // Log email error but don't fail the booking
        console.error('Error sending confirmation email:', emailError);
      }

      setIsSubmitted(true);
    } catch (error) {
      console.error('Error submitting booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm animate-fade-in-up">
        <div className="text-center py-12 px-4 max-w-2xl mx-auto relative">
          <button
            onClick={() => {
              setIsSubmitted(false);
              form.reset();
            }}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-2"
            aria-label="Stäng bekräftelse"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-3xl md:text-4xl font-serif font-semibold text-foreground mb-6">
            Tack för din bokning!
          </h3>
          <p className="text-lg md:text-xl text-foreground mb-4 max-w-md mx-auto">
            Vi ser framemot att hämta din gran!
          </p>
          <p className="text-lg md:text-xl text-foreground mb-8 max-w-md mx-auto">
            För att underlätta vid upphämtningen går det bra att betala nu till Alexander Foxér Eriksson
          </p>
        <div className="flex items-center justify-center gap-3 mb-3">
          <Smartphone className="w-6 h-6 text-primary" />
          <p className="text-base md:text-lg text-foreground">
            Betala med Swish till <span className="font-semibold">073-852 30 62</span>
          </p>
        </div>
        <div className="mb-8 flex justify-center">
          <img 
            src="/swish-alex.png" 
            alt="Swish QR-kod" 
            className="max-w-[200px] h-auto"
          />
        </div>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => {
            setIsSubmitted(false);
            form.reset();
          }}
        >
          Gör en ny bokning
        </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>För- och efternamn *</FormLabel>
              <FormControl>
                <Input placeholder="Ditt namn" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-postadress *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="din.epost@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefonnummer *</FormLabel>
              <FormControl>
                <Input type="tel" placeholder="070-123 45 67" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bostadsadress (i Trollhättans kommun) *</FormLabel>
              <FormControl>
                <Input placeholder="Gatuadress, postnummer, ort" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="pickupDate"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Vilket datum vill du boka för upphämtning? *</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-2"
                >
                  {pickupDates.map((date) => (
                    <div key={date.value} className="flex items-center space-x-3">
                      <RadioGroupItem value={date.value} id={date.value} />
                      <Label htmlFor={date.value} className="font-normal cursor-pointer">
                        {date.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="timePreference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vilken tid passar dig bäst under dagen? *</FormLabel>
              <FormControl>
                <Input placeholder="T.ex. förmiddag, eftermiddag, eller specifik tid" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Någon annan information som kan vara bra för oss att känna till?</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="T.ex. portkod, var granen står, antal granar..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPayment"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="cursor-pointer">
                  Jag intygar att betalning sker senast vid upphämtning *
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground">
          <p className="font-medium text-foreground mb-1">GDPR-information</p>
          <p className="text-foreground">
            Vi följer dataskyddsförordningen (GDPR) för att säkerställa att dina personuppgifter 
            hanteras på ett tryggt och säkert sätt. All information kommer att raderas i samband 
            med att granupphämtningen avslutats.
          </p>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Skickar...
            </>
          ) : (
            <>
              <TreePine className="w-5 h-5 mr-2" />
              Boka upphämtning
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default BookingForm;
