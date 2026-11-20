# Regras das animações do canal WAIT, WHY ???

Documento de referência. Vale para qualquer vídeo novo. Se um ponto aqui entrar em conflito com um pedido do dono do canal, vale o pedido.
Dois formatos: **A) Ranking curto (Short 6 → 1)** e **B) Vídeo longo "E se…?"**.

---

## 0. Regras gerais (valem para os dois)

1. **O modelo do ranking 2D não muda.** É o modelo que já fazíamos (detetive, selo com número, contador, legendas, câmera deslizando, papel). Só se muda algo se a **pesquisa** mostrar um motivo claro, e o motivo fica anotado no relatório (`pesquisa/`).
2. **Sempre 2D, mão-na-tinta, estilo stickman do canal.** Nada de mundo 3D (testamos e foi reprovado).
3. **Só fatos verificados.** Cada número tem fonte (NASA, NOAA, OMM, WHO, CERN, museus, publicações). Se as fontes discordam, usar "about"/"~" e dizer a ressalva na descrição. Descartar o tema se o número principal for fraco (ex.: "alimentos que não estragam", "animais mais mortais" com hipopótamo/crocodilo).
4. **Inglês, narração de um só narrador, tom constante.** Piadas são fatos pesquisados.
5. **Nunca copiar roteiro, personagem ou cena de outro canal.** A pesquisa serve para o formato, não para o conteúdo.
6. **Publicar é decisão do dono.** Rascunho e agenda podem ser preparados, mas nada vai público sem a aprovação dele (título, horário, privacidade).
7. **Créditos de música em toda descrição** (Kevin MacLeod, CC BY 4.0).
8. Salvar após cada etapa. Commitar e enviar para o branch.

---

## A) Ranking curto (Short 6 → 1)

### A1. Formato
- Vertical **1080×1920, 30 fps** (final). Duração **35–60 s**.
- A voz começa em **0,15 s** na cena. Tempos de palavra da cena = tempo da voz + 0,15 s.
- Sem introdução falada: a **primeira frase já é o gancho**.

### A2. Roteiro
1. **Gancho = paradoxo dito como fato**, sem preparação (10–16 palavras). Ex.: "A lightning bolt is five times hotter than the sun's surface." / "Nothing is faster than light, and one thing gets within a few miles per hour of it."
2. Frase de ponte curta: **"Here are the [coisas], ranked."**
3. **Número seis → um**: "Number six: …", "Five: …", "Four: …", "Three: …", "Two: …", "And number one: …".
4. Cada posição: **nome + número**, no máximo uma frase de explicação (a explicação vai no #4 ou #1 quando há um "por quê", ex.: Vênus mais quente que Mercúrio).
5. **Fecho** liga ao famoso ou ao gancho ("Nothing can ever be colder.").
6. Tamanho: **~70–85 palavras**. Números **por extenso** na fala ("one hundred thirty-four"); na tela viram dígitos.
7. Aproximações ditas com "about"/"just under"; nunca prometer precisão que a fonte não dá.

### A3. Tema
- Dados oficiais, **número que sobe de 6 para 1**, com uma virada no meio (paradoxo/curiosidade).
- Cada posição precisa de **um desenho simples e legível** (um objeto, uma cena).
- Pares/séries funcionam (Hottest → Coldest): segura o público.
- Evitar: números sem consenso, rankings que dependem de onde se mede a base, política/violência real.

### A4. Imagem (o que aparece na tela)
- **Fundo**: um gradiente vertical, uma cor por posição (gancho + #6…#1). Cores acompanham a história (quente→escuro, espaço, gelo).
- **Mundo**: um desenho de tinta por posição, centrado, ~600–900 px de largura na tela. Props animados com leve movimento (ondulação, rotação lenta, brilho).
- **Detetive (host)** fixo no canto inferior esquerdo, cabeça visível, pés fora do quadro.
  - Já em cena no **frame 0** (o primeiro quadro é a capa do Short).
  - Ao chegar em cada posição: **cara de surpresa por 0,6 s** + pulinho de 0,35 s.
  - De 0,6 s a 1,9 s depois da chegada: **gesto** alternando (aponta para o desenho nas posições pares, limpa a testa nas ímpares).
  - **Muda a cada nível** conforme o tema: envelhece (animais), esquenta (suor, vapor, óculos escuros), congela (bafo, gelo). Tremor só nos níveis altos e só se o tema pedir.
- **Selo "#n"** (círculo mostarda) no alto à esquerda (≈128, 470), entra com "pop" no momento da palavra. O **contador** ao lado conta de 0 até o valor em ~0,9 s, começando na palavra do número. Unidade no fim (°F, MPH). Texto customizado quando preciso (ex.: 99,9999991 %).
- **Legendas** no alto (y≈245), **uma a cinco palavras por vez**, máx. ~24 caracteres, fonte Fredoka 80 px, contorno de tinta, **palavra falada em mostarda** com pequeno crescimento. Números sempre em dígitos (134, 2,193, 430,000, 670M).
- **Textura de papel** por cima (multiplicar) em todo o vídeo (`public/stick/paper.png`, gerada por `scripts/paper.py`).
- **Primeiro quadro = capa**: detetive em cena + legenda já na tela no frame 0.

### A5. Câmera
- **Gancho**: câmera fixa no desenho do gancho com leve aproximação (zoom +70) e rotação suave (2,5° → 0,5°).
- **Corte suave** depois do gancho (antes do "Number six"): pulso branco de **0,12 s com no máximo 32 % de opacidade**. **Nunca um quadro 100 % branco.**
- **Entre posições**: deslize **smootherstep de 1,2 s**, chegando **0,08 s antes** da palavra de chegada. Rolagem leve de ±1,6° só durante o deslize.
- **Enquanto segura**: aproximação lenta (+40 de zoom em 3,5 s). Nada de câmera parada por mais de ~4 s.
- Mundo vertical: as posições ficam uma abaixo da outra (1500 de espaçamento); a câmera desce.
- **Final** (opcional por tema): vinheta de cor crescente nas últimas 3 posições e **clarão/fade nos últimos 1,0 s**.

### A6. Áudio
- **Voz**: ElevenLabs, **"Gregory"** (`mggUSQGghJRhKJXslB5H`), modelo `eleven_v4`, **um take só** (nunca regerar para "tentar de novo": cada geração cobra). ~US$ 0,05 por vídeo.
- **Tempos de palavra**: sem modelo de fala disponível, usar `examples/hot/align.py` (pausas do áudio + sílabas) e conferir. Gerar legendas com `captions.py` (+ `merges.json` para números em dígitos).
- **Música**: Kevin MacLeod "Investigations" (ranking), cortada no tamanho do vídeo, fade de 0,25 s no início e 1,2 s no fim, corte de graves (<60 Hz) e vale em 2,6 kHz para abrir espaço à voz.
- **Níveis**: música **−15 dB abaixo da voz** (razão 0,18); efeitos **≤ 30 % da voz** (≈ −10,5 dB), picos ≤ 0,5× o pico da voz; sem compressão no bus; **−14 LUFS**, pico real **≤ −1,5 dBTP**.
- **Efeitos** (sintetizados em `audio/synth.py`): pop no selo, "plop" no pulinho, whoosh em cada deslize, ticks durante a contagem, "ting" ao fechar o valor, flash_poof no corte, riser + tímpano no clarão final. Efeitos de tema: rachadura de raio, crepitar de calor etc.

### A7. Pipeline (passo a passo)
1. Pesquisar e **verificar** os 6 números (WebSearch), anotar fontes e ressalvas.
2. Escrever `examples/<nome>/script.txt`.
3. Gerar a voz (ElevenLabs), baixar o MP3 (host `elevenlabsusercontent.com` precisa estar liberado), `examples/<nome>/voice.mp3`.
4. `python examples/hot/align.py voice.wav script.txt words.json -42 0.13` (ajustar até as frases baterem) → `take.json`.
5. `python captions.py take.json 0.15 remotion/src/<nome>/captions.json out.srt merges.json`.
6. Desenhar os 6 props (+1 do gancho) em `remotion/src/rank2d/props.tsx`; criar o tema em `remotion/src/rank2d/themes/<nome>.tsx` (T0 e contadores saem de `auto.tsx` a partir do `take.json`); registrar a composição em `Root.tsx`.
7. Conferir com `node scripts/frames.mjs <Comp> 20 0.5` e folhas de contato com o número do frame.
8. Mixar o áudio (`examples/hot/hot_audio.py` como modelo).
9. Renderizar: `npx remotion render src/index.ts <Comp> out/x.mp4 --muted --concurrency=3 --crf=17 --gl=swangle` e **mixar com ffmpeg** (`-map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k`).
10. **QA**: sem quadro preto/branco (exceto o clarão planejado), −14 LUFS, primeiro quadro forte, contador chega ao valor, legenda sincronizada.
11. Texto de publicação (`publicar-*.txt`): título, descrição, **fontes**, crédito da música, hashtags (#shorts + tema), tradução em português.

### A8. Título e capa (da pesquisa do YouTube)
- **Título**: curto, no presente, com **promessa ou número**, e o paradoxo do gancho: *"A Lightning Bolt Is 5x Hotter Than the Sun's Surface (Hottest Things, Ranked)"*. Padrões que bombam: "The True Story Of X", "X that were based on…", "POV: …", "5 More…" (série).
- **Capa/primeiro quadro**: detetive grande + legenda gravada no topo (como o Anitoria), fundo de cor chapada; poucas palavras, número visível.
- Descrição curta + fontes + hashtags. Séries ("Part 2", "Coldest" depois de "Hottest") seguram o público.

### A9. O que NÃO fazer
- Quadro 100 % branco ou preto, qualquer fade longo que esconda o conteúdo.
- Mexer na câmera/legenda/selo sem motivo da pesquisa.
- Número sem fonte; "o mais X do mundo" sem ressalva quando há disputa.
- Regerar a voz para "tentar de novo".
- Publicar sem aprovação.

---

## B) Vídeo longo "E se…?" (planejado; ainda não produzido)

### B1. Formato
- Horizontal **1920×1080, 30 fps**, mesmo estilo 2D do canal (detetive, papel, legendas), **~2,5 min com o roteiro atual (335 palavras); 3–4 min com cenas extras** (ver `examples/whatif-sun/plano.md`). A pesquisa mostra que os vencedores têm **8–15 min**: aumentar em vídeos futuros.
- Narração única (ElevenLabs "Gregory", um take por capítulo se o texto passar de ~3.000 caracteres), música de fundo contínua (−15 dB), efeitos sutis.

### B2. Premissa e título
- **Premissa com número ou estado extremo**, que dá uma **linha do tempo** natural: "E se o Sol sumisse?" → 8 min 20 s, 1 hora, 1 dia, 1 semana, 1 ano, fundo do mar.
- Título no presente, direto: *"What If the Sun Vanished? Hour by Hour"* / *"What If Your … Were 1000x Faster?"*. Número no título ou na capa.
- **Descrição**: primeira linha **"A premissa é inventada. A ciência é real."** (em inglês, igual ao padrão que funcionou), **capítulos com horário**, **fontes** (NASA, Live Science, PopSci etc.) e **notas científicas** do que é estimativa, uma **pergunta para os comentários**, convite para se inscrever, tags de "what if / stickman animation / animated story".

### B3. Roteiro (estrutura)
1. **Gancho** com a surpresa ("The first thing you'd notice is nothing.").
2. **Explicação** curta do porquê (analogia/real).
3. **Escalada por linha do tempo**: cada capítulo maior ou mais estranho que o anterior (8:20 → 1 h → 1 dia → 1 semana → 1 ano → fundo do mar).
4. **Virada**: a parte que ninguém espera (a vida muda para o fundo do mar).
5. **Fecho** com a piada/ligação ao cotidiano ("you would get eight more minutes of sunshine. Enjoy them.").
- 335 palavras ≈ 2,5 min a ~2,5 palavras/s; ~500 palavras para 3,5 min. Plano completo, descrição, fontes e itens a verificar: `examples/whatif-sun/plano.md`. Cada capítulo com uma afirmação principal e **uma fonte**.
- **Ciência**: só o que tem apoio. Tirar números fracos (ex.: temperatura exata após 1 semana/1 ano).

### B4. Animação (como cada cena é montada)
- **Uma cena por marco do tempo**, mesmo motor 2D: fundo em gradiente, **desenhos de tinta** próprios, detetive reagindo (surpreso, olhando para o céu, com frio, apontando).
- **Relógio grande** na tela com o tempo decorrido (como o contador do ranking), contando até o marco.
- **Nenhuma cena parada por mais de ~8 s**: dentro de cada capítulo, **2–3 "batidas" visuais** (o desenho muda, algo entra/sai, a câmera avança). Aproximação lenta enquanto segura.
- Deslizes de câmera entre capítulos (smootherstep 1,2 s), rolagem leve, corte suave com pulso branco ≤ 32 % **nunca branco total**.
- Legenda palavra a palavra embaixo (no 16:9, parte inferior central), selo/relógio no canto superior.
- Cenas previstas: **sol some com o céu ainda claro** → **noite total, Lua e planetas somem, só estrelas** → **painéis solares apagam, plantas e plâncton** → **lagoa congela, árvores aguentam** → **oceano com gelo por cima e água líquida embaixo** → **fonte quente do fundo do mar com micróbios**.

### B5. Capa (thumbnail) do vídeo longo
- **No máximo 2–5 palavras gigantes**, com **número**: "8 MIN 20 SEC", "SUN GONE", "NO SUN FOR 1 YEAR".
- Fundo preto ou cor chapada saturada; detetive com **reação clara**; um efeito forte (brilho apagando, relógio).
- Texto grande demais é melhor que texto pequeno; testar variações (A/B) quando o canal permitir.

### B6. Qualidade
- Mesmos níveis de áudio do ranking (−14 LUFS, pico ≤ −1,5 dBTP).
- QA frame a frame em folha de contato a cada 20 quadros; sem quadro preto/branco inesperado.
- Fontes e crédito da música em toda descrição.

---

## C) Arquivos de referência
- `pesquisa/pesquisa-youtube-2026-11-20.md` — os 10 vídeos analisados e o que copiar.
- `remotion/src/rank2d/` — molde do ranking 2D (`Rank2D.tsx`, `auto.tsx`, `props.tsx`, `themes/`).
- `examples/hot|fast|cold|whatif-sun/` — roteiros, vozes, legendas, textos de publicação.
- `examples/hot/align.py`, `captions.py`, `examples/hot/hot_audio.py` — alinhamento, legendas e mixagem.
- `README.md` — setup e pipeline original (modelo dos 3 vídeos já postados).
