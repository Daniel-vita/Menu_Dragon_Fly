import React from 'react';

type AdminAccessGateProps = {
  isAuthReady: boolean;
  isSupabaseReady: boolean;
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onLogin: () => void;
  onOpenRecovery: () => void;
  isLoading: boolean;
};

export const AdminAccessGate = ({
  isAuthReady,
  isSupabaseReady,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onOpenRecovery,
  isLoading,
}: AdminAccessGateProps) => (
  <div className="fixed inset-0 z-[85] bg-black/75 backdrop-blur-sm flex items-center justify-center px-4">
    <div className="w-full max-w-md rounded-2xl border border-gold/25 bg-wood-dark p-6 md:p-7 card-shadow">
      <h2 className="vintage-title text-2xl text-gold mb-3">Accesso Admin</h2>
      <p className="text-beige/80 text-sm leading-relaxed mb-5">
        Inserisci email e password per entrare nel pannello di gestione menu.
      </p>

      {isSupabaseReady ? (
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="Email admin"
            className="w-full rounded-xl border border-gold/35 bg-wood-dark/60 px-3 py-2.5 text-sm text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/45"
            autoComplete="email"
          />
          <input
            type="password"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border border-gold/35 bg-wood-dark/60 px-3 py-2.5 text-sm text-beige placeholder:text-beige/40 focus:outline-none focus:ring-2 focus:ring-gold/45"
            autoComplete="current-password"
          />
          <button
            onClick={onLogin}
            className="w-full rounded-xl bg-gold text-wood-dark py-3 font-semibold uppercase tracking-wider text-sm hover:bg-accent-orange transition-colors"
            disabled={isLoading}
          >
            {isLoading ? 'Accesso...' : 'Accedi'}
          </button>
          <button
            onClick={onOpenRecovery}
            className="w-full rounded-xl border border-gold/35 text-gold py-3 font-semibold uppercase tracking-wider text-sm hover:bg-gold/10 transition-colors"
            disabled={isLoading}
          >
            Reimposta Password
          </button>
          {!isAuthReady && (
            <p className="text-xs text-beige/45">Connessione a Supabase in corso, puoi comunque provare il login.</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-red-300/35 bg-red-500/10 px-4 py-3 text-sm text-red-100">
          Login non disponibile: Supabase non configurato.
        </div>
      )}

      <p className="mt-4 text-xs text-beige/55">
        Se non hai mai impostato la password, premi "Reimposta Password" e usa il link email ricevuto.
      </p>
    </div>
  </div>
);
