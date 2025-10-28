import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function HomePage() {
  const [, setLocation] = useLocation();
  const [slug, setSlug] = useState("");

  const goToDashboard = () => {
    const trimmed = slug.trim();
    if (trimmed) {
      setLocation(`/${trimmed}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-6">
      <div className="text-center max-w-xl">
        <h1 className="text-3xl font-semibold">NGX Metrics Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Bem-vindo! Use os atalhos abaixo para acessar as páginas principais
          ou informe o seu identificador para abrir o dashboard do cliente.
        </p>
      </div>

      <div className="flex gap-4">
        <Link href="/ngx/login" className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent">
          Ir para Login
        </Link>
        <Link href="/ngx/admin" className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent">
          Ir para Admin
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          className="w-64 rounded-md border px-3 py-2 bg-background"
          placeholder="Digite o slug do cliente (ex: loja-x)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <button
          className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent"
          onClick={goToDashboard}
        >
          Ver dashboard
        </button>
      </div>
    </div>
  );
}