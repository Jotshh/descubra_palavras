"use client";
import { useEffect } from "react";

const Ex = ({ cls, letter, children }: { cls: string; letter: string; children: React.ReactNode }) => (
  <div className="ex"><div className={`tile ${cls}`}>{letter}</div><p>{children}</p></div>
);

export default function HelpModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div className="ov" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="help-title" onClick={(e) => e.stopPropagation()}>
        <h2 id="help-title">Como jogar</h2>
        <p>Descubra a palavra secreta em até 6 tentativas.</p>
        <h3>Regras</h3>
        <ol>
          <li>Escolha o tamanho da palavra: 4, 5 ou 6 letras.</li>
          <li>Digite um palpite e aperte Enter. Ele precisa ser uma palavra que exista.</li>
          <li>Depois de cada palpite, as letras mudam de cor para mostrar o quanto você chegou perto.</li>
          <li>Acentos e cedilha não contam: “ação” vale como “acao”.</li>
        </ol>
        <h3>As cores</h3>
        <Ex cls="demo-c" letter="T">Letra certa no lugar certo. Marcada com um ponto.</Ex>
        <Ex cls="demo-p" letter="E">A letra existe na palavra, mas em outra posição. Marcada com um losango.</Ex>
        <Ex cls="demo-a" letter="R">A letra não está na palavra. Marcada com um traço.</Ex>
        <h3>Modos</h3>
        <p><b>Palavra do dia:</b> uma de 5 letras por dia, igual para todos. <b>Solo:</b> uma palavra aleatória a cada partida. <b>Desafio:</b> escolha uma palavra e mande o link para um amigo. <b>Sala online:</b> até 8 jogadores, em corrida (mesma palavra para todos) ou duelo (cada um escolhe a palavra do próximo). Cada rodada dura 5 minutos.</p>
        <button className="btn pri" onClick={onClose} autoFocus>Entendi, vamos jogar</button>
      </div>
    </div>
  );
}
