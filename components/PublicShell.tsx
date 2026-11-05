import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

/** Moldura das páginas públicas (indexáveis): Como jogar e Sobre. */
export default function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav className="top">
        <Link href="/" className="brand">{SITE_NAME}</Link>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Link href="/como-jogar" className="ghost">Como jogar</Link>
          <Link href="/sobre" className="ghost">Sobre</Link>
          <Link href="/entrar" className="ghost">Entrar</Link>
        </div>
      </nav>
      <main className="wrap prose">{children}</main>
      <footer className="foot">
        <span>{SITE_NAME}. Projeto independente de jogo de palavras.</span>
        <span style={{ display: "flex", gap: 16 }}><Link href="/">Início</Link><Link href="/como-jogar">Como jogar</Link><Link href="/sobre">Sobre</Link></span>
      </footer>
    </>
  );
}
