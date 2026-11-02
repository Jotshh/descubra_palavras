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
