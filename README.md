# 👑 Xadrez 3D - Premium Edition

Um jogo de xadrez tridimensional de alto padrão visual e técnico, projetado para rodar nativamente e de forma extremamente fluida diretamente no navegador de internet. Conta com inteligência artificial adaptativa de 5 níveis de dificuldade, sintetizador de som procedural em tempo real, múltiplos temas visuais e um modo online multiplayer integrado ao Firebase.

---

## ✨ Recursos de Destaque (Features)

* **Visual Premium Tridimensional (WebGL):** Gráficos modernos de alta fidelidade baseados em Three.js, luzes com mapeamento de sombras realistas, névoa volumétrica suave e câmera orbital fluida.
* **Modo Online Multiplayer (Firebase):** Sistema de pareamento de salas rápido via código de 4 dígitos. Movimentos, capturas, en passant, promoções e turnos são sincronizados em tempo real através do *Firebase Realtime Database*.
* **Inteligência Artificial Inteligente:** Motor de IA rodando o algoritmo *Minimax com Poda Alpha-Beta*, PST (Piece-Square Tables) e ordenação otimizada de movimentos (MVV-LVA). Oferece 5 níveis de dificuldade: *Fácil, Médio, Difícil, Muito Difícil* e *Profissional*.
* **Som Procedural Sintetizado (Web Audio API):** Efeitos sonoros gerados matematicamente em tempo real (impacto de peças, capturas de vidro/metal, aviso sonoro de xeque e fanfarra de vitória), garantindo zero dependência de arquivos de áudio externos e carregamento instantâneo.
* **Três Temas Visuais Exclusivos:**
  1. **Clássico (Preto & Branco):** Mármore de Carrara branco polido contra obsidiana preta espelhada sobre uma moldura de madeira de ébano.
  2. **Realeza (Ouro & Prata):** Peças escovadas em ouro e prata metálicos refletindo focos intensos de holofote.
  3. **Cyber (Futurista Neon):** Peças de vidro neon ciano brilhante contra rosa elétrico vibrante projetando luz no tabuleiro cibernético.
* **Suporte Bilíngue Dinâmico:** Interface totalmente traduzida e chaveável entre **Português (Brasil)** e **Inglês** em tempo real com um único clique.
* **Layout Clean & Glassmorphism:** Interface de jogo minimalista que esconde menus secundários. Timers e status ficam em barras flutuantes no topo/rodapé, e o histórico de jogadas e peças capturadas ficam recolhidos em gavetas retráteis que deslizam pelas laterais.
* **Simulador de Conexão (Mock Mode Fallback):** Caso o Firebase esteja offline ou com chaves sandbox, a aplicação executa um sistema de simulação de multiplayer local integrado à IA de xadrez para testar o pareamento de salas e jogadas remotas.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando os padrões mais modernos de desenvolvimento web nativo (sem frameworks pesados ou processos de build complexos):

* **HTML5 & CSS3 Avançado:** Estrutura semântica e estilização premium baseada em Glassmorphism (`backdrop-filter`) e design 100% responsivo para telas móveis e desktop.
* **JavaScript Moderno (ES6):** Módulos limpos com escopos isolados autoexecutáveis (IIFE).
* **Three.js (WebGL Library):** Renderização tridimensional, câmera orbital física (`OrbitControls`), gerador de partículas nas capturas e modelagem procedural das peças (`LatheGeometry` e `ExtrudeGeometry`).
* **Chess.js:** Motor de regras lógicas oficial do xadrez (validação de movimentos legais, roque, en passant, promoção de peão, xeque, xeque-mate e regras de empate).
* **Firebase compat SDK (v9):** Biblioteca oficial para conexões síncronas de baixo atraso em tempo real.

---

## 🚀 Como Executar o Jogo

Como a aplicação é 100% nativa e não requer compilação ou gerenciadores de pacotes (`npm`, `yarn`):

1. **Baixe ou clone este repositório** no seu computador.
2. Abra a pasta do projeto e dê um **duplo clique no arquivo `index.html`** (ou arraste-o diretamente para o seu navegador de internet de preferência).
3. O jogo iniciará imediatamente em tela cheia!

---

## ⚙️ Configuração do Firebase Multiplayer

O jogo já vem integrado de fábrica com um banco de dados real padrão para facilidade de testes, mas você pode usar o seu próprio projeto gratuito do Firebase a qualquer momento:

1. No Console do Firebase, crie um projeto e ative o **Realtime Database** em *Modo de Teste*.
2. Registre um aplicativo web (`</>`) nas configurações do projeto para obter suas chaves.
3. Insira suas credenciais diretamente no arquivo [js/game.js](file:///c:/Users/i5/OneDrive/Documentos/xadrez-3d/js/game.js#L320-L328) modificando o objeto `firebaseConfig`, ou cole-as na interface do jogo no menu **Multijogador Online** -> **Configurar Firebase Customizado ⚙️**.

---

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](file:///c:/Users/i5/OneDrive/Documentos/xadrez-3d/LICENSE) para mais detalhes.
