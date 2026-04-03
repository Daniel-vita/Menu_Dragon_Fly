# DragonFly - Configurazione Supabase

## Variabili d'ambiente

Crea un file `.env.local` nella root del progetto:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Setup Supabase

1. Crea un progetto su [supabase.com](https://supabase.com)
2. Vai su **SQL Editor** ed esegui il contenuto di `docs/supabase-schema.sql`
3. Vai su **Authentication > Settings** e abilita email/password
4. Crea un utente admin:
   - Vai su **Authentication > Users** e crea un utente
   - Poi in **SQL Editor** esegui:
     ```sql
     INSERT INTO public.admins (user_id)
     VALUES ('uuid-del-tuo-utente');
     ```
5. Copia `URL` e `anon key` da **Settings > API** nel tuo `.env.local`

## Run locale

```bash
npm install
npm run dev
```

## Route

- `/` - Menu pubblico
- `/peppoo7` - Login admin e pannello gestione menu

## Checklist post-migrazione

- [ ] Schema SQL eseguito su Supabase
- [ ] Utente admin creato e inserito in `admins`
- [ ] Variabili d'ambiente configurate
- [ ] Menu pubblico caricato da Supabase (o fallback locale se DB vuoto)
- [ ] Login admin funzionante
- [ ] Salvataggio modifiche menu funzionante
