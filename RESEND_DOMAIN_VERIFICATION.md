# Verifiera domän i Resend

Denna guide visar hur du verifierar din domän i Resend så att du kan skicka email från din egen domän (t.ex. `noreply@granupphamtning.se`).

## Steg 1: Logga in på Resend Dashboard

1. Gå till [resend.com](https://resend.com) och logga in
2. Du kommer till Dashboard

## Steg 2: Lägg till domän

1. I vänstermenyn, klicka på **"Domains"** (eller gå direkt till [resend.com/domains](https://resend.com/domains))
2. Klicka på knappen **"Add Domain"** (eller **"+ Add"**)
3. Ange din domän (t.ex. `granupphamtning.se`)
   - **OBS:** Ange bara domänen, INTE `www.` eller `http://`
   - Exempel: `granupphamtning.se` ✅
   - Inte: `www.granupphamtning.se` ❌
4. Klicka på **"Add Domain"**

## Steg 3: Lägg till DNS-poster

Resend kommer att visa en lista med DNS-poster som du behöver lägga till i din domänregistrator (t.ex. Loopia, One.com, etc.).

### Exempel på DNS-poster:

Du kommer att se något liknande:

```
Type: TXT
Name: @
Value: resend-domain-verification=abc123xyz...

Type: MX
Name: @
Value: feedback-smtp.eu-central-1.amazonses.com
Priority: 10

Type: TXT
Name: resend._domainkey
Value: p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

### Hur du lägger till DNS-poster:

1. **Logga in på din domänregistrator** (t.ex. Loopia, One.com, Namecheap, etc.)
2. Gå till **DNS-inställningar** eller **DNS-hantering**
3. Lägg till varje post som Resend visar:
   - **Type:** Välj rätt typ (TXT, MX, etc.)
   - **Name/Host:** Ange namnet (t.ex. `@` eller `resend._domainkey`)
   - **Value:** Kopiera värdet från Resend
   - **Priority/TTL:** Använd standardvärden om inget annat anges

### Viktiga tips:

- **TXT-poster för verifiering:** Dessa måste läggas till först
- **MX-poster:** Används för att ta emot bounce-meddelanden
- **SPF/DKIM-poster:** För email-autentisering och bättre leverans

## Steg 4: Vänta på verifiering

1. Efter att du lagt till DNS-posterna, gå tillbaka till Resend Dashboard
2. Klicka på din domän
3. Status kommer att visa **"Pending"** eller **"Verifying"**
4. Verifiering kan ta **5-30 minuter** (ibland upp till 24 timmar)
5. När verifieringen är klar kommer status att ändras till **"Verified"** ✅

## Steg 5: Uppdatera Supabase secrets

När din domän är verifierad, uppdatera `FROM_EMAIL` i Supabase:

```bash
supabase secrets set FROM_EMAIL=noreply@granupphamtning.se
```

Eller vilken email-adress du vill använda på din domän:
- `noreply@granupphamtning.se`
- `info@granupphamtning.se`
- `bokning@granupphamtning.se`

## Steg 6: Deploya Edge Function igen

```bash
supabase functions deploy send-booking-confirmation
```

## Felsökning

### Domänen verifieras inte

1. **Kontrollera DNS-poster:**
   - Använd ett verktyg som [mxtoolbox.com](https://mxtoolbox.com) för att kontrollera om DNS-posterna är synliga
   - Sök på din domän och kontrollera TXT-poster

2. **DNS-propagation:**
   - DNS-ändringar kan ta tid att spridas
   - Vänta minst 30 minuter efter att du lagt till posterna

3. **Kontrollera stavning:**
   - Se till att du kopierat DNS-värdena exakt från Resend
   - Kontrollera att inga extra mellanslag eller tecken har lagts till

4. **Kontakta Resend support:**
   - Om problemet kvarstår efter 24 timmar, kontakta Resend support
   - De kan hjälpa dig att felsöka DNS-problemen

### Testa med testdomän först

Om du vill testa funktionaliteten innan din domän är verifierad:

```bash
supabase secrets set FROM_EMAIL=onboarding@resend.dev
```

**Begränsning:** `onboarding@resend.dev` kan bara skicka till din egen verifierade email-adress i Resend-kontot.

## När din domän är verifierad

- ✅ Du kan skicka email från vilken adress som helst på din domän
- ✅ Bättre email-leverans (mindre risk för spam)
- ✅ Professionell avsändaradress
- ✅ Du kan skicka till vilken email-adress som helst

