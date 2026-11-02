# TERMO COM MAETHOR E AMIGOS

Jogo de adivinhar palavras (Next.js 16 + TypeScript) para jogar com os amigos.

## Rodar

```bash
npm install
npm run dev   # http://localhost:3000
```

## O que já existe

- Tela inicial com os três modos (só "Jogar solo" está ativo) e modal "Como jogar" que abre toda vez que o jogo é aberto.
- Modo solo em `/jogo`: 4, 5 ou 6 letras, 6 tentativas, teclado virtual e físico, animação, estatísticas locais.
- Dicionário real: o palpite só é aceito se a palavra existir.

## Dicionário

Duas listas por tamanho em `public/dict/`:

- `valid-N.json`: todas as palavras aceitas como palpite (sem acento, minúsculas).
- `common-N.json`: subconjunto de palavras comuns (no léxico e com frequência alta).

Em `lib/game.ts`, `SECRET_MODE` define o sorteio da palavra secreta: `"all"` (qualquer palavra do dicionário, padrão atual) ou `"common"` (só comuns).

Para regenerar os arquivos (fonte: https://github.com/fserb/pt-br, licença MIT em `scripts/LICENSE-fserb-pt-br.txt`):

```bash
mkdir -p data && cd data
curl -LO https://raw.githubusercontent.com/fserb/pt-br/master/lexico
curl -LO https://raw.githubusercontent.com/fserb/pt-br/master/icf
curl -L -o conj "https://raw.githubusercontent.com/fserb/pt-br/master/conjuga%C3%A7%C3%B5es"
cd .. && python3 scripts/build-dict.py
```

O léxico não traz vários plurais e femininos (ex.: "livros", "outra"). O script os recupera derivando a flexão de uma palavra do léxico e exigindo que ela apareça no corpus de frequência.

## Próximos passos

1. Desafio por link (palavra codificada no link, sem backend).
2. Salas online em tempo real com Supabase.

## Supabase (desafio por link)

1. No SQL Editor, rode `supabase/migrations/001_desafios.sql`.
2. Em Authentication > Providers, ative **Email**, **Google** (precisa de Client ID/Secret do Google Cloud) e, em Authentication > Sign In / Providers, **Allow anonymous sign-ins** (jogar só com apelido).
3. Em Authentication > URL Configuration, coloque a URL do site (ex.: `http://localhost:3000` e a da Vercel) em Site URL e Redirect URLs.
4. Copie `.env.example` para `.env.local` e preencha as chaves (Project Settings > API). A `service_role` fica só no servidor e nunca pode ter o prefixo `NEXT_PUBLIC_`.

A palavra secreta fica nas tabelas `challenges` e `plays`, que não têm policy de RLS: o navegador não consegue lê-las. Quem avalia os palpites são as rotas em `app/api/challenges`.

## Salas online

1. Rode também `supabase/migrations/002_salas.sql` (cria as tabelas e liga o Realtime em `rooms` e `room_players`).
2. **Corrida:** todos adivinham a mesma palavra. **Duelo:** cada jogador escolhe a palavra do próximo (em anel). Até 8 jogadores, rodadas de 5 minutos, placar acumulado.
3. Pontuação por rodada: `7 − tentativas` para quem acerta, 0 para quem não acerta. Constantes em `lib/rooms.ts` (`ROUND_MS`, `MAX_PLAYERS`).
4. Só `rooms` e `room_players` são legíveis pelo navegador, e guardam apenas cores. Palavras e palpites com letras ficam em `room_secrets` e `room_plays` (sem policy).
5. Se o Realtime não estiver ativo, a sala atualiza sozinha a cada 5 segundos.

## Limite de rodadas e limpeza

1. Rode `supabase/migrations/003_limite_e_limpeza.sql`.
2. O criador escolhe 1, 3, 5 ou 10 rodadas ao criar a sala. Ao fim da última, aparece o campeão (ou o empate) e a sala não aceita mais rodadas.
3. Salas e desafios por link são apagados 24 horas depois da última atividade, em cascata (jogadores, palavras e palpites juntos). A função `limpar_expirados()` roda a cada 30 minutos via `pg_cron` (o SQL tenta ativá-lo; se falhar, ative em Database > Extensions) e também sempre que alguém cria uma sala ou desafio.

## Perfil, estatísticas e sessão

1. Rode `supabase/migrations/004_historico.sql` (tabela `game_results` com RLS: cada jogador só lê e grava as próprias partidas).
2. **Login:** o site pede login ao entrar (`components/AuthGate.tsx`). A sessão fica salva no navegador e vale **7 dias** a partir do último login; depois disso pede login de novo. O servidor também recusa sessões mais antigas que isso (`lib/server.ts`). Para mudar o prazo, ajuste `SESSION_DAYS` em `lib/session.ts` e o `7` em `lib/server.ts`.
3. **Estatísticas:** cada partida (solo, desafio e sala) é salva no aparelho na hora (`localStorage`, por conta) e enviada à conta; ao entrar em outro aparelho, o histórico volta no sync. O perfil fica em `/perfil`.
4. Os resultados são registrados pelo próprio navegador, então servem como estatística pessoal, não como ranking à prova de trapaça.
