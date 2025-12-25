# Resend Setup Guide

Denna guide visar hur du sätter upp Resend för att skicka bekräftelsemail till kunder som bokar granupphämtning.

## Steg 1: Skapa Resend-konto

1. Gå till [resend.com](https://resend.com) och skapa ett konto (gratis)
2. Verifiera din e-postadress

## Steg 2: Verifiera domän eller använd testdomän

### Alternativ A: Använd Resend's testdomän (för utveckling)
- Resend tillhandahåller `onboarding@resend.dev` som testdomän
- Du kan skicka från denna domän direkt utan verifiering
- **Begränsning:** Kan bara skicka till din egen verifierade e-postadress

### Alternativ B: Verifiera din egen domän (rekommenderat för produktion)
1. I Resend Dashboard, gå till **Domains**
2. Klicka på **Add Domain**
3. Ange din domän (t.ex. `granupphämting.se`)
4. Följ instruktionerna för att lägga till DNS-poster
5. Vänta på verifiering (kan ta några minuter)

## Steg 3: Skapa API-nyckel

1. I Resend Dashboard, gå till **API Keys**
2. Klicka på **Create API Key**
3. Ge nyckeln ett namn (t.ex. "Granupphämtning Production")
4. Välj behörigheter (för e-post behöver du bara "Send emails")
5. **Kopiera API-nyckeln** - du kommer bara se den en gång!

## Steg 4: Konfigurera Supabase Edge Function

### Installera Supabase CLI (om du inte redan har det)

```bash
npm install -g supabase
```

### Logga in på Supabase

```bash
supabase login
```

### Länka ditt projekt

Hitta ditt project reference ID i Supabase Dashboard (t.ex. `eudpvikqhdemlybohjmp`):

```bash
supabase link --project-ref eudpvikqhdemlybohjmp
```

### Sätt environment variables

Sätt Resend API-nyckeln och avsändaradressen:

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
supabase secrets set FROM_EMAIL=noreply@din-domän.com
```

**För testdomän:**
```bash
supabase secrets set FROM_EMAIL=onboarding@resend.dev
```

**För egen domän:**
```bash
supabase secrets set FROM_EMAIL=noreply@granupphämting.se
```

### Deploya Edge Function

```bash
supabase functions deploy send-booking-confirmation
```

## Steg 5: Testa

1. Fyll i bokningsformuläret på webbplatsen
2. Kontrollera att e-postmeddelandet skickas till den angivna e-postadressen
3. Kontrollera Resend Dashboard för att se att e-posten skickades

## Felsökning

### E-posten skickas inte

1. **Kontrollera Supabase Edge Function logs:**
   ```bash
   supabase functions logs send-booking-confirmation
   ```

2. **Kontrollera Resend Dashboard:**
   - Gå till **Emails** i Resend Dashboard
   - Se om det finns några felmeddelanden

3. **Vanliga problem:**
   - API-nyckeln är felaktig → Kontrollera att du kopierade hela nyckeln
   - FROM_EMAIL är inte verifierad → Verifiera domänen i Resend
   - Testdomän kan bara skicka till din egen e-post → Använd din egen e-post för test

### Testa Edge Function manuellt

Du kan testa Edge Function direkt:

```bash
supabase functions invoke send-booking-confirmation --body '{
  "id": "test-123",
  "name": "Test Person",
  "email": "din-email@example.com",
  "phone": "070-123 45 67",
  "address": "Testgatan 1, 461 00 Trollhättan",
  "pickup_date": "2025-01-10",
  "time_preference": "Förmiddag",
  "additional_info": null
}'
```

## Email-innehåll

E-postmeddelandet innehåller:
- ✅ Tack för bokningen
- ✅ Bekräftelse på bokningsdetaljer
- ✅ Tips om att betala nu
- ✅ Swish-information (073-852 30 62 och @swish-alex)

## Nästa steg

När allt fungerar:
1. Verifiera din egen domän i Resend (för produktion)
2. Uppdatera FROM_EMAIL till din egen domän
3. Deploya Edge Function igen med nya inställningar

