/**
 * js/game.js
 * Central 3D Game Loop and Event Coordinator with Firebase Online Multiplayer
 */

const ChessGame3D = (() => {
    // 1. Language localization system
    const i18n = {
        pt: {
            title: "Xadrez 3D - Edição Premium",
            loading: "Preparando tabuleiro tridimensional...",
            promoteTitle: "Promover Peão",
            promoteDesc: "Escolha a peça para a qual deseja promover:",
            queen: "Dama",
            rook: "Torre",
            bishop: "Bispo",
            knight: "Cavalo",
            gameSettings: "Ajustes da Partida",
            gameMode: "Modo de Jogo",
            vsAI: "Contra Inteligência Artificial",
            vsPlayer: "2 Jogadores (Local)",
            vsOnline: "Multijogador Online",
            difficulty: "Dificuldade da IA",
            easy: "Fácil",
            medium: "Médio",
            hard: "Difícil",
            veryHard: "Muito Difícil",
            professional: "Profissional",
            soundEffects: "Efeitos Sonoros",
            theme: "Tema Visual",
            themeClassic: "Clássico (Preto & Branco)",
            themeMetallic: "Realeza",
            themeCyber: "Cyber",
            restart: "Reiniciar Jogo",
            undo: "Desfazer Jogada",
            turn: "Vez de:",
            white: "Brancas",
            black: "Pretas",
            viewPreset: "Câmera",
            viewWhite: "Brancas",
            viewBlack: "Pretas",
            viewTop: "Superior",
            rotateCameraToggle: "Rotacionar Câmera",
            capturedPieces: "Peças Capturadas",
            capturedTitle: "Capturadas",
            moveHistory: "Histórico",
            check: "XEQUE!",
            checkmate: "XEQUE-MATE! Fim de jogo.",
            draw: "Empate!",
            stalemate: "Empate por Afogamento (Stalemate)!",
            insufficientMaterial: "Empate por Falta de Peças!",
            threefoldRepetition: "Empate por Repetição Tripla!",
            fiftyMoves: "Empate pela Regra dos 50 Movimentos!",
            aiThinking: "IA pensando...",
            startMatch: "INICIAR PARTIDA",
            onlineLobby: "Sala Multiplayer Online",
            createRoom: "Criar Nova Sala",
            waitingPlayer2: "Aguardando segundo jogador entrar...",
            roomCodeLabel: "Sala:",
            cancelLobby: "Cancelar",
            player2Connected: "Jogador 2 Conectado!",
            connectedRoom: "Conectado à sala!",
            invalidRoom: "Sala inválida, cheia ou inexistente!",
            opponentDisconnected: "Oponente se desconectou!",
            mockModeAlert: "Firebase offline. Rodando em Modo Demonstração Local!",
            roleWhiteLabel: "BRANCAS (VOCÊ)",
            roleBlackLabel: "PRETAS (VOCÊ)",
            configureFirebase: "Configurar Firebase Customizado",
            firebaseConfigTitle: "Configurar Firebase",
            firebaseConfigDesc: "Insira as credenciais do seu Realtime Database para jogar online em tempo real:",
            saveFirebase: "Salvar e Conectar",
            clearFirebase: "Restaurar Padrão",
            closeFirebase: "Voltar",
            fbConnected: "Firebase Conectado com sucesso!",
            fbCleared: "Credenciais padrão restauradas."
        },
        en: {
            title: "3D Chess - Premium Edition",
            loading: "Preparing three-dimensional board...",
            promoteTitle: "Promote Pawn",
            promoteDesc: "Choose which piece to promote your pawn to:",
            queen: "Queen",
            rook: "Rook",
            bishop: "Bishop",
            knight: "Knight",
            gameSettings: "Game Settings",
            gameMode: "Game Mode",
            vsAI: "Against AI",
            vsPlayer: "2 Players (Local)",
            vsOnline: "Online Multiplayer",
            difficulty: "AI Difficulty",
            easy: "Easy",
            medium: "Medium",
            hard: "Hard",
            veryHard: "Very Hard",
            professional: "Professional",
            soundEffects: "Sound Effects",
            theme: "Visual Theme",
            themeClassic: "Classic (Black & White)",
            themeMetallic: "Royalty",
            themeCyber: "Cyber",
            restart: "Restart Game",
            undo: "Undo Move",
            turn: "Turn:",
            white: "White",
            black: "Black",
            viewPreset: "Camera",
            viewWhite: "White",
            viewBlack: "Black",
            viewTop: "Top-Down",
            rotateCameraToggle: "Rotate Camera",
            capturedPieces: "Captured Pieces",
            capturedTitle: "Captured",
            moveHistory: "History",
            check: "CHECK!",
            checkmate: "CHECKMATE! Game Over.",
            draw: "Draw!",
            stalemate: "Stalemate!",
            insufficientMaterial: "Draw - Insufficient Material!",
            threefoldRepetition: "Draw - Threefold Repetition!",
            fiftyMoves: "Draw - 50-Move Rule!",
            aiThinking: "AI is thinking...",
            startMatch: "START MATCH",
            onlineLobby: "Online Multiplayer Room",
            createRoom: "Create New Room",
            waitingPlayer2: "Waiting for player 2 to join...",
            roomCodeLabel: "Room:",
            cancelLobby: "Cancel",
            player2Connected: "Player 2 Connected!",
            connectedRoom: "Connected to room!",
            invalidRoom: "Invalid, full, or non-existent room!",
            opponentDisconnected: "Opponent disconnected!",
            mockModeAlert: "Firebase offline. Running in Local Demo Mode!",
            roleWhiteLabel: "WHITE (YOU)",
            roleBlackLabel: "BLACK (YOU)",
            configureFirebase: "Configure Custom Firebase",
            firebaseConfigTitle: "Configure Firebase",
            firebaseConfigDesc: "Enter your Realtime Database credentials to play online in real-time:",
            saveFirebase: "Save and Connect",
            clearFirebase: "Restore Default",
            closeFirebase: "Back",
            fbConnected: "Firebase Connected successfully!",
            fbCleared: "Default credentials restored."
        }
    };

    let activeLang = 'pt'; // Default is Brazilian Portuguese

    // 2. Synthesized Sound System using Web Audio API
    const AudioSynth = (() => {
        let audioCtx = null;
        let soundEnabled = true;

        function init() {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (audioCtx.state === 'suspended') {
                audioCtx.resume();
            }
        }

        function setEnabled(enabled) {
            soundEnabled = enabled;
            if (enabled) init();
        }

        function playMove() {
            if (!soundEnabled) return;
            init();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(140, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.08);

            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        }

        function playCapture() {
            if (!soundEnabled) return;
            init();
            const osc1 = audioCtx.createOscillator();
            const osc2 = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(260, audioCtx.currentTime);
            osc1.frequency.linearRampToValueAtTime(80, audioCtx.currentTime + 0.2);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
            
            gain.gain.setValueAtTime(0.35, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            
            osc1.start();
            osc2.start();
            osc1.stop(audioCtx.currentTime + 0.2);
            osc2.stop(audioCtx.currentTime + 0.2);
        }

        function playCheck() {
            if (!soundEnabled) return;
            init();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.setValueAtTime(160, audioCtx.currentTime + 0.12);
            
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.3, audioCtx.currentTime + 0.12);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.35);
        }

        function playVictory() {
            if (!soundEnabled) return;
            init();
            const now = audioCtx.currentTime;
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C-E-G-C-E-G-C arpeggio
            
            notes.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                
                osc.type = 'sine';
                osc.frequency.value = freq;
                
                gain.gain.setValueAtTime(0.0, now);
                gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.35);
                
                osc.start(now + idx * 0.07);
                osc.stop(now + idx * 0.07 + 0.35);
            });
        }

        return { playMove, playCapture, playCheck, playVictory, setEnabled };
    })();

    // 3. Core 3D Fields
    let scene, camera, renderer, controls;
    let clock;
    
    // Chess logic instance
    let chess = null;
    let gameMode = 'ai'; // 'ai', 'player', 'online'
    let difficulty = 2; // 1-5
    let currentTheme = 'classic'; // 'classic', 'metallic', 'cyber'
    let autoRotateCamera = false;
    let playerColor = 'w'; // human is white by default

    // Game stats
    let turnStartTime = Date.now();
    let timerInterval = null;
    let isAILinking = false;

    // Piece tracking
    let boardPieces3D = Array(8).fill(null).map(() => Array(8).fill(null)); // 8x8 mesh arrays
    
    // Active interactions
    let selectedCell = null; // {file, rank}
    let validMoves = []; // array of {file, rank, verboseMove}
    let raycaster = new THREE.Raycaster();
    let mouse = new THREE.Vector2();

    // Particle pool for captures
    let particles = [];

    // Animation queues
    let activeAnimations = []; // array of animation objects: { mesh, startPos, endPos, progress, speed, type }

    // Start Screen variables
    let tempGameMode = 'ai';
    let tempDifficulty = 2;
    let tempTheme = 'classic';

    // =======================================================
    // 4. MULTIPLAYER INTEGRATION (FIREBASE & MOCK ENGINE)
    // =======================================================
    let database = null;
    let roomCode = null;
    let isMultiplayerOnline = false;
    let onlineRole = 'w'; // 'w' (White) or 'b' (Black)
    let isFirebaseActive = false;
    let mockLobbyTimeout = null;

    /**
     * Initialize Firebase Connection
     */
    function initFirebase() {
        if (typeof firebase === 'undefined') {
            console.warn("Firebase compat SDK is not loaded. Falling back to local Mock Mode.");
            isFirebaseActive = false;
            return false;
        }

        // Standard Sandbox Database Credentials
        let firebaseConfig = {
            apiKey: "AIzaSyC9WC0F1rpNKTxnqBWoYioNYkq6AGSRRaY",
            authDomain: "xadrez3d.firebaseapp.com",
            databaseURL: "https://xadrez3d-default-rtdb.firebaseio.com",
            projectId: "xadrez3d",
            storageBucket: "xadrez3d.firebasestorage.app",
            messagingSenderId: "153616702528",
            appId: "1:153616702528:web:4cf3ec1215cefc2b9453a5"
        };

        // Try to load custom configuration
        const customConfigStr = localStorage.getItem('chess_3d_firebase_config');
        if (customConfigStr) {
            try {
                const customConfig = JSON.parse(customConfigStr);
                if (customConfig.databaseURL && customConfig.apiKey) {
                    firebaseConfig = {
                        apiKey: customConfig.apiKey,
                        authDomain: `${customConfig.projectId}.firebaseapp.com`,
                        databaseURL: customConfig.databaseURL,
                        projectId: customConfig.projectId,
                        storageBucket: `${customConfig.projectId}.appspot.com`,
                        messagingSenderId: "1234567890",
                        appId: customConfig.appId || "1:1234567890:web:abcdef123456"
                    };
                    console.log("Loaded custom Firebase configuration:", firebaseConfig.databaseURL);
                }
            } catch (e) {
                console.error("Error parsing custom Firebase config:", e);
            }
        }

        try {
            // If already initialized, we delete/rebuild the app to support dynamic credentials changes!
            if (firebase.apps.length) {
                firebase.app().delete().then(() => {
                    firebase.initializeApp(firebaseConfig);
                    database = firebase.database();
                }).catch(() => {
                    // Fallback
                    database = firebase.database();
                });
            } else {
                firebase.initializeApp(firebaseConfig);
                database = firebase.database();
            }
            // Set active ONLY if it's not the sandbox key
            isFirebaseActive = firebaseConfig.apiKey !== "AIzaSyAs-SANDBOX-KEY-FOR-EASY-TESTING";
            console.log("Firebase initialized successfully! Active:", isFirebaseActive);
            return isFirebaseActive;
        } catch (err) {
            console.warn("Firebase Database initialization failed. Falling back to Mock Mode:", err);
            isFirebaseActive = false;
            return false;
        }
    }

    /**
     * Create Private Game Room (matchmaking)
     */
    function createOnlineRoom() {
        // Generate random 4-digit code
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        
        // Show lobby waiting overlay
        document.getElementById('online-lobby-wait').classList.remove('hidden');
        document.getElementById('lobby-code-display').innerText = code;
        document.getElementById('lobby-status-detail').innerText = i18n[activeLang]['waitingPlayer2'];

        if (isFirebaseActive && database) {
            // Write to Firebase Realtime Database
            const roomRef = database.ref('rooms/' + code);
            roomRef.set({
                status: 'waiting',
                turn: 'w',
                fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
                lastMove: '',
                players: {
                    w: 'p1_' + Math.random().toString(36).substring(2, 6)
                }
            });

            // Listen for opponent connection
            roomRef.on('value', (snapshot) => {
                const data = snapshot.val();
                if (data && data.status === 'playing' && data.players && data.players.b) {
                    roomCode = code;
                    isMultiplayerOnline = true;
                    onlineRole = 'w';
                    playerColor = 'w';
                    
                    // Detach lobby listeners
                    roomRef.off('value');
                    
                    showAlertBanner(i18n[activeLang]['player2Connected']);
                    startMatch();
                }
            });
        } else {
            // MOCK MODE: Simulate Player 2 joining after 4 seconds!
            console.log("Mock Mode: Simulating multiplayer room creation.");
            showAlertBanner(i18n[activeLang]['mockModeAlert'], 4000);
            
            mockLobbyTimeout = setTimeout(() => {
                roomCode = code;
                isMultiplayerOnline = true;
                onlineRole = 'w';
                playerColor = 'w';
                
                showAlertBanner(i18n[activeLang]['player2Connected']);
                startMatch();
            }, 4000);
        }
    }

    /**
     * Join Existing Room via 4-digit code
     */
    function joinOnlineRoom(code) {
        if (!code || code.length !== 4) {
            showAlertBanner(i18n[activeLang]['invalidRoom']);
            return;
        }

        if (isFirebaseActive && database) {
            const roomRef = database.ref('rooms/' + code);
            roomRef.once('value').then((snapshot) => {
                const data = snapshot.val();
                if (data && data.status === 'waiting' && data.players && !data.players.b) {
                    // Room is available! Join as Black ('b')
                    roomCode = code;
                    isMultiplayerOnline = true;
                    onlineRole = 'b';
                    playerColor = 'b';

                    roomRef.update({
                        status: 'playing',
                        'players/b': 'p2_' + Math.random().toString(36).substring(2, 6)
                    }).then(() => {
                        showAlertBanner(i18n[activeLang]['connectedRoom']);
                        startMatch();
                    });
                } else {
                    showAlertBanner(i18n[activeLang]['invalidRoom']);
                }
            }).catch(err => {
                console.error("Join room failed:", err);
                showAlertBanner(i18n[activeLang]['invalidRoom']);
            });
        } else {
            // MOCK MODE: Instantly connect to mock room as Black!
            console.log("Mock Mode: Simulating joining multiplayer room.");
            showAlertBanner(i18n[activeLang]['mockModeAlert'], 4000);
            
            roomCode = code;
            isMultiplayerOnline = true;
            onlineRole = 'b';
            playerColor = 'b';
            
            showAlertBanner(i18n[activeLang]['connectedRoom']);
            startMatch();
            
            // In Mock Online mode as Black, trigger White's initial simulated move in 3 seconds!
            setTimeout(() => {
                triggerMockOpponentMove();
            }, 3000);
        }
    }

    /**
     * Cancel matchmaking waiting lobby
     */
    function cancelOnlineLobby() {
        const code = document.getElementById('lobby-code-display').innerText;
        document.getElementById('online-lobby-wait').classList.add('hidden');

        if (isFirebaseActive && database && code !== '----') {
            database.ref('rooms/' + code).remove();
            database.ref('rooms/' + code).off();
        }

        if (mockLobbyTimeout) {
            clearTimeout(mockLobbyTimeout);
            mockLobbyTimeout = null;
        }
        
        roomCode = null;
        isMultiplayerOnline = false;
        AudioSynth.playMove();
    }

    /**
     * Remote Database Listener for opponent movements
     */
    let firebaseMoveRef = null;
    function bindFirebaseMoveListener() {
        if (!isFirebaseActive || !database || !roomCode) return;

        // Clean up previous listeners
        if (firebaseMoveRef) firebaseMoveRef.off();

        firebaseMoveRef = database.ref('rooms/' + roomCode + '/lastMove');
        firebaseMoveRef.on('value', (snapshot) => {
            const mv = snapshot.val();
            if (mv && mv.from && mv.to) {
                // If it is the opponent's turn in Chess.js, execute the move locally!
                const activeColor = chess.turn();
                if (activeColor !== onlineRole) {
                    const fromIndices = getIndicesFromChessSquare(mv.from);
                    const toIndices = getIndicesFromChessSquare(mv.to);
                    
                    const finalMove = {
                        from: mv.from,
                        to: mv.to
                    };
                    if (mv.promotion) finalMove.promotion = mv.promotion;

                    processMoveExecution(finalMove, fromIndices, toIndices);
                }
            }
        });

        // Listen for room deletion/disconnection
        database.ref('rooms/' + roomCode + '/status').on('value', (snapshot) => {
            if (snapshot.exists() && snapshot.val() === 'disconnected') {
                showAlertBanner(i18n[activeLang]['opponentDisconnected'], 5000);
                returnToMenu();
            }
        });
    }

    /**
     * MOCK ONLINE MODE: Triggers a simulated opponent move using ChessAI after 2 seconds
     */
    function triggerMockOpponentMove() {
        if (chess.game_over() || isAILinking) return;

        isAILinking = true;
        const timerDisp = document.getElementById('turn-timer');
        const prevTimerText = timerDisp.innerText;
        timerDisp.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${i18n[activeLang]['aiThinking']}`;

        // Opponent plays at Medium (2) difficulty in mock mode
        ChessAI.getBestMove(chess, 2).then(bestMove => {
            isAILinking = false;
            timerDisp.innerText = prevTimerText;

            if (bestMove) {
                const fromIndices = getIndicesFromChessSquare(bestMove.from);
                const toIndices = getIndicesFromChessSquare(bestMove.to);
                processMoveExecution(bestMove, fromIndices, toIndices);
            }
        });
    }

    // =======================================================
    // 5. CORE INTERACTION FLOWS
    // =======================================================

    /**
     * Set up UI Text Translations
     */
    function applyLocalization(lang) {
        activeLang = lang;
        document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';

        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.getAttribute('data-i18n');
            if (i18n[lang][key]) {
                if (elem.tagName === 'INPUT' && elem.placeholder) {
                    elem.placeholder = i18n[lang][key];
                } else {
                    elem.innerHTML = i18n[lang][key];
                }
            }
        });

        const flag = lang === 'pt' ? '🇧🇷' : '🇺🇸';
        document.querySelector('.flag-icon').textContent = flag;
        document.getElementById('lang-label').textContent = lang.toUpperCase();

        document.title = i18n[lang]['title'];

        updateMoveHistoryUI();
        updateCapturedPiecesUI();
    }

    /**
     * Three.js Init
     */
    function initThree() {
        const canvas = document.getElementById('three-canvas');
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0a0f);
        scene.fog = new THREE.FogExp2(0x0a0a0f, 0.04);

        clock = new THREE.Clock();

        camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 50);
        setCameraPreset('white');

        renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.toneMapping = THREE.ToneMapping;
        renderer.toneMappingExposure = 1.0;

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxPolarAngle = Math.PI / 2 - 0.05;
        controls.minDistance = 4.5;
        controls.maxDistance = 16;
        controls.target.set(0, 0, 0);

        setupLights();

        window.addEventListener('resize', onWindowResize);
    }

    /**
     * Scene Lights configuration depending on visual themes
     */
    function setupLights() {
        const existingLights = [];
        scene.traverse(obj => {
            if (obj.isLight) existingLights.push(obj);
        });
        existingLights.forEach(light => scene.remove(light));

        const ambientLight = new THREE.HemisphereLight(0xffffff, 0x111122, 0.35);
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xfff7e6, 2.5);
        spotLight.position.set(4, 8, 4);
        spotLight.angle = Math.PI / 4;
        spotLight.penumbra = 0.8;
        spotLight.castShadow = true;
        spotLight.shadow.mapSize.width = 2048;
        spotLight.shadow.mapSize.height = 2048;
        spotLight.shadow.camera.near = 0.5;
        spotLight.shadow.camera.far = 25;
        spotLight.shadow.bias = -0.0005;
        scene.add(spotLight);

        const bluePoint = new THREE.PointLight(0x00a8ff, 1.2, 10);
        bluePoint.position.set(-5, 3, -5);
        scene.add(bluePoint);

        const redPoint = new THREE.PointLight(0xff007f, 1.0, 10);
        redPoint.position.set(5, 2, -5);
        scene.add(redPoint);

        if (currentTheme === 'cyber') {
            scene.background.set(0x050508);
            scene.fog.color.set(0x050508);
            ambientLight.color.set(0x112233);
            ambientLight.intensity = 0.25;
            spotLight.intensity = 0.8;
            bluePoint.intensity = 3.5;
            redPoint.intensity = 3.0;
        } else if (currentTheme === 'metallic') {
            scene.background.set(0x0d0e12);
            scene.fog.color.set(0x0d0e12);
            ambientLight.color.set(0xffffff);
            ambientLight.intensity = 0.4;
            spotLight.intensity = 3.5;
            spotLight.color.set(0xffffff);
            bluePoint.intensity = 0.8;
            redPoint.intensity = 0.6;
        } else {
            scene.background.set(0x0a0a0f);
            scene.fog.color.set(0x0a0a0f);
            ambientLight.color.set(0xfff5e6);
            ambientLight.intensity = 0.35;
            spotLight.intensity = 2.8;
            bluePoint.intensity = 0.5;
            redPoint.intensity = 0.4;
        }
    }

    /**
     * Camera View Presets
     */
    function setCameraPreset(preset) {
        if (!camera) return;

        let targetPos = new THREE.Vector3();
        switch (preset) {
            case 'black':
                targetPos.set(0, 6.2, -9.0);
                break;
            case 'top':
                targetPos.set(0, 11.0, 0.01);
                break;
            case 'white':
            default:
                targetPos.set(0, 6.2, 9.0);
                break;
        }

        activeAnimations.push({
            type: 'camera',
            startPos: camera.position.clone(),
            endPos: targetPos,
            progress: 0,
            speed: 2.2
        });
    }

    /**
     * 3D Particles Generator
     */
    function spawnCaptureParticles(position) {
        const count = currentTheme === 'cyber' ? 24 : 12;
        const size = currentTheme === 'cyber' ? 0.05 : 0.07;
        const particleGeom = new THREE.BoxGeometry(size, size, size);
        
        let color = 0xd4af37;
        if (currentTheme === 'cyber') {
            color = Math.random() > 0.5 ? 0x00f0ff : 0xff007f;
        } else if (currentTheme === 'metallic') {
            color = 0xcccccc;
        }

        const material = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.95
        });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(particleGeom, material);
            mesh.position.copy(position);
            mesh.position.y += 0.2;

            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 2.5 + 1.2;
            const velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * 3.5 + 1.5,
                Math.sin(angle) * speed
            );

            scene.add(mesh);
            particles.push({
                mesh: mesh,
                velocity: velocity,
                life: 1.0,
                decay: Math.random() * 1.2 + 1.0
            });
        }
    }

    function updateParticles(delta) {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.life -= delta * p.decay;

            if (p.life <= 0) {
                scene.remove(p.mesh);
                p.mesh.geometry.dispose();
                p.mesh.material.dispose();
                particles.splice(i, 1);
            } else {
                p.velocity.y -= delta * 9.8;
                p.mesh.position.addScaledVector(p.velocity, delta);
                p.mesh.rotation.x += delta * 6;
                p.mesh.rotation.y += delta * 4;
                p.mesh.scale.setScalar(p.life);
                p.mesh.material.opacity = p.life;
            }
        }
    }

    /**
     * Syncs Chess.js models to 3D pieces
     */
    function rebuildPieces3D() {
        for (let file = 0; file < 8; file++) {
            for (let rank = 0; rank < 8; rank++) {
                if (boardPieces3D[file][rank]) {
                    scene.remove(boardPieces3D[file][rank]);
                    boardPieces3D[file][rank] = null;
                }
            }
        }

        const board = chess.board();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const item = board[r][c];
                if (item) {
                    const pieceMesh = ChessPieces.createPieceMesh(item.type, item.color, currentTheme);
                    const cellPos = ChessBoard3D.getCellPosition(c, r);
                    pieceMesh.position.copy(cellPos);

                    if (item.type === 'n') {
                        pieceMesh.rotation.y = item.color === 'w' ? 0 : Math.PI;
                    }

                    scene.add(pieceMesh);
                    boardPieces3D[c][r] = pieceMesh;
                }
            }
        }
    }

    /**
     * Raycasting Mouse Click selection
     */
    function onCanvasClick(event) {
        const isMenuOpen = !document.getElementById('start-screen').classList.contains('hidden');
        if (isMenuOpen || isAILinking || chess.game_over()) return;

        // If Online Mode, block selection if it is not our turn!
        if (isMultiplayerOnline && chess.turn() !== onlineRole) return;

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const boardObj = scene.getObjectByName("chessboard");
        if (!boardObj) return;

        const clickableTiles = [];
        boardObj.traverse(child => {
            if (child.name && child.name.startsWith("tile_")) {
                clickableTiles.push(child);
            }
        });

        const intersects = raycaster.intersectObjects(clickableTiles);

        if (intersects.length > 0) {
            const clickedTile = intersects[0].object;
            const { file, rank } = clickedTile.userData;
            handleCellSelection(file, rank);
        } else {
            clearSelection();
        }
    }

    /**
     * Interactive Cell click routing
     */
    function handleCellSelection(file, rank) {
        const pendingMove = validMoves.find(mv => mv.file === file && mv.rank === rank);

        if (pendingMove) {
            executeUserMove(pendingMove.verboseMove);
            return;
        }

        const piece = chess.board()[rank][file];
        const activeColor = chess.turn();

        if (piece && piece.color === activeColor) {
            if (gameMode === 'ai' && piece.color !== playerColor) {
                clearSelection();
                return;
            }

            selectedCell = { file, rank };
            ChessBoard3D.clearHighlights();
            ChessBoard3D.highlightSelected(file, rank, currentTheme);

            const rawMoves = chess.moves({ square: getChessSquareName(file, rank), verbose: true });
            
            validMoves = rawMoves.map(mv => {
                const dest = getIndicesFromChessSquare(mv.to);
                return {
                    file: dest.file,
                    rank: dest.rank,
                    capture: mv.captured !== undefined || mv.flags.includes('e'),
                    verboseMove: mv
                };
            });

            ChessBoard3D.highlightValidMoves(validMoves, currentTheme);
            AudioSynth.playMove();
        } else {
            clearSelection();
        }
    }

    function clearSelection() {
        selectedCell = null;
        validMoves = [];
        ChessBoard3D.clearHighlights();
        reapplyCheckHighlight();
    }

    function reapplyCheckHighlight() {
        if (chess && chess.in_check()) {
            const kingPos = findKingSquare(chess.turn());
            if (kingPos) {
                ChessBoard3D.highlightCheck(kingPos.file, kingPos.rank);
            }
        }
    }

    /**
     * Executes the finalized user move and sets off slide animation & engine turn cycle
     */
    function executeUserMove(moveObj) {
        const fromIndices = getIndicesFromChessSquare(moveObj.from);
        const toIndices = getIndicesFromChessSquare(moveObj.to);

        if (moveObj.flags.includes('p')) {
            showPromotionModal(moveObj, (promoPiece) => {
                const finalMove = {
                    from: moveObj.from,
                    to: moveObj.to,
                    promotion: promoPiece
                };
                processMoveExecution(finalMove, fromIndices, toIndices);
            });
        } else {
            processMoveExecution(moveObj, fromIndices, toIndices);
        }
    }

    /**
     * Central execution pipeline: updates Chess.js state, plays sound, triggers animations
     */
    function processMoveExecution(moveObj, fromIdx, toIdx) {
        const turnColorBefore = chess.turn();
        clearSelection();

        // 1. Commit move in Chess.js
        const result = chess.move(moveObj);
        if (!result) return;

        // Enable Undo button (Only in non-online modes!)
        document.getElementById('undo-btn').disabled = isMultiplayerOnline || chess.history().length === 0;

        // 2. Perform 3D animations and captures
        const pieceMesh = boardPieces3D[fromIdx.file][fromIdx.rank];
        
        const existingAnimIdx = activeAnimations.findIndex(a => a.mesh === pieceMesh);
        if (existingAnimIdx !== -1) {
            activeAnimations.splice(existingAnimIdx, 1);
        }

        if (result.flags.includes('k') || result.flags.includes('q')) {
            animateCastlingRook(result.flags, toIdx.rank);
        }

        if (result.flags.includes('e')) {
            const captureRank = result.color === 'w' ? toIdx.rank + 1 : toIdx.rank - 1;
            const capturedRookMesh = boardPieces3D[toIdx.file][captureRank];
            if (capturedRookMesh) {
                animateCapturedPiece(capturedRookMesh, toIdx.file, captureRank);
            }
        }

        const targetPieceMesh = boardPieces3D[toIdx.file][toIdx.rank];
        if (targetPieceMesh && !result.flags.includes('e')) {
            animateCapturedPiece(targetPieceMesh, toIdx.file, toIdx.rank);
        }

        const targetPos = ChessBoard3D.getCellPosition(toIdx.file, toIdx.rank);
        
        activeAnimations.push({
            type: 'move',
            mesh: pieceMesh,
            startPos: pieceMesh.position.clone(),
            endPos: targetPos,
            progress: 0,
            speed: 3.2,
            pieceType: result.piece,
            color: result.color,
            from: fromIdx,
            to: toIdx
        });

        // 3. Map meshes position grid
        boardPieces3D[toIdx.file][toIdx.rank] = pieceMesh;
        boardPieces3D[fromIdx.file][fromIdx.rank] = null;

        if (result.flags.includes('p')) {
            pieceMesh.userData.promoteTo = result.promotion;
        }

        if (result.captured) {
            AudioSynth.playCapture();
        } else {
            AudioSynth.playMove();
        }

        // 4. Update UI logs
        updateGameStateUI();

        // 5. Synchronize with Firebase Realtime Database in Multiplayer
        if (isMultiplayerOnline && turnColorBefore === onlineRole) {
            if (isFirebaseActive && database && roomCode) {
                database.ref('rooms/' + roomCode).update({
                    fen: chess.fen(),
                    turn: chess.turn(),
                    lastMove: {
                        from: result.from,
                        to: result.to,
                        promotion: result.promotion || ''
                    }
                });
            } else {
                // MOCK MODE: Trigger White's/Black's simulated opponent reply!
                setTimeout(() => {
                    triggerMockOpponentMove();
                }, 2000);
            }
        }
    }

    /**
     * Slides Rook in Castling moves
     */
    function animateCastlingRook(castleFlag, rank) {
        const isKingside = castleFlag.includes('k');
        const fromFile = isKingside ? 7 : 0;
        const toFile = isKingside ? 5 : 3;

        const rookMesh = boardPieces3D[fromFile][rank];
        if (!rookMesh) return;

        const targetPos = ChessBoard3D.getCellPosition(toFile, rank);

        activeAnimations.push({
            type: 'slide_only',
            mesh: rookMesh,
            startPos: rookMesh.position.clone(),
            endPos: targetPos,
            progress: 0,
            speed: 3.2
        });

        boardPieces3D[toFile][rank] = rookMesh;
        boardPieces3D[fromFile][rank] = null;
    }

    /**
     * Slides captured piece off the board and bursts particles
     */
    function animateCapturedPiece(mesh, file, rank) {
        boardPieces3D[file][rank] = null;
        spawnCaptureParticles(mesh.position);

        const sideOffsetDir = mesh.name.startsWith('w') ? -1 : 1;
        const offBoardPos = new THREE.Vector3(sideOffsetDir * 5.2, -0.4, (Math.random() - 0.5) * 3);

        activeAnimations.push({
            type: 'capture_fall',
            mesh: mesh,
            startPos: mesh.position.clone(),
            endPos: offBoardPos,
            progress: 0,
            speed: 2.0
        });
    }

    /**
     * Promotion Selection Modal
     */
    let activePromoCallback = null;
    function showPromotionModal(moveObj, callback) {
        activePromoCallback = callback;
        const modal = document.getElementById('promotion-modal');
        modal.classList.remove('hidden');
    }

    function selectPromotion(pieceLetter) {
        document.getElementById('promotion-modal').classList.add('hidden');
        if (activePromoCallback) {
            activePromoCallback(pieceLetter);
            activePromoCallback = null;
        }
    }

    /**
     * Next turn states cycling
     */
    function cycleTurn() {
        ChessBoard3D.clearHighlights();
        
        if (chess.game_over()) {
            handleGameOver();
            return;
        }

        if (chess.in_check()) {
            AudioSynth.playCheck();
            const kingPos = findKingSquare(chess.turn());
            if (kingPos) {
                ChessBoard3D.highlightCheck(kingPos.file, kingPos.rank);
                showAlertBanner(i18n[activeLang]['check']);
            }
        }

        if (autoRotateCamera) {
            if (gameMode === 'player') {
                setCameraPreset(chess.turn() === 'w' ? 'white' : 'black');
            }
        }

        const activeColor = chess.turn();

        // Vs. AI Turn triggers
        if (gameMode === 'ai' && activeColor !== playerColor) {
            triggerAIMove();
        }
    }

    /**
     * Executes the minimax AI decision
     */
    function triggerAIMove() {
        isAILinking = true;
        const timerDisp = document.getElementById('turn-timer');
        const prevTimerText = timerDisp.innerText;
        timerDisp.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> ${i18n[activeLang]['aiThinking']}`;

        ChessAI.getBestMove(chess, difficulty).then(bestMove => {
            isAILinking = false;
            timerDisp.innerText = prevTimerText;

            if (bestMove) {
                const fromIndices = getIndicesFromChessSquare(bestMove.from);
                const toIndices = getIndicesFromChessSquare(bestMove.to);
                processMoveExecution(bestMove, fromIndices, toIndices);
            }
        });
    }

    /**
     * Game Over visual alerts handling
     */
    function handleGameOver() {
        let msg = "";
        if (chess.in_checkmate()) {
            AudioSynth.playVictory();
            const loserColor = chess.turn();
            const winnerText = loserColor === 'w' ? i18n[activeLang]['black'] : i18n[activeLang]['white'];
            msg = `${i18n[activeLang]['checkmate']} (${winnerText})`;
        } else if (chess.in_stalemate()) {
            msg = i18n[activeLang]['stalemate'];
        } else if (chess.in_draw()) {
            if (chess.insufficient_material()) {
                msg = i18n[activeLang]['insufficientMaterial'];
            } else if (chess.in_threefold_repetition()) {
                msg = i18n[activeLang]['threefoldRepetition'];
            } else {
                msg = i18n[activeLang]['draw'];
            }
        }

        showAlertBanner(msg, 6000);
        document.getElementById('hint-text').innerHTML = `<i class="fa-solid fa-trophy"></i> <strong>${msg}</strong>`;

        if (isMultiplayerOnline && isFirebaseActive && database && roomCode) {
            database.ref('rooms/' + roomCode + '/status').set('finished');
        }
    }

    function showAlertBanner(text, duration = 2000) {
        const banner = document.getElementById('alert-banner');
        const bannerText = document.getElementById('alert-text');
        
        bannerText.innerText = text;
        banner.classList.remove('hidden');

        if (banner.userData && banner.userData.timeout) {
            clearTimeout(banner.userData.timeout);
        }

        const timeout = setTimeout(() => {
            banner.classList.add('hidden');
        }, duration);

        banner.userData = { timeout };
    }

    /**
     * Chess coordinates math lookups
     */
    function getChessSquareName(fileIdx, rankIdx) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        return files[fileIdx] + ranks[rankIdx];
    }

    function getIndicesFromChessSquare(squareName) {
        const fileChar = squareName.charAt(0);
        const rankChar = squareName.charAt(1);
        
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
        return {
            file: files.indexOf(fileChar),
            rank: ranks.indexOf(rankChar)
        };
    }

    function findKingSquare(colorKey) {
        const board = chess.board();
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = board[r][c];
                if (piece && piece.type === 'k' && piece.color === colorKey) {
                    return { file: c, rank: r };
                }
            }
        }
        return null;
    }

    /**
     * UI panels syncing
     */
    function updateGameStateUI() {
        const badge = document.getElementById('current-player');
        const activeColor = chess.turn();

        if (activeColor === 'w') {
            badge.className = "player-badge white-badge";
            badge.innerHTML = `<i class="fa-solid fa-circle"></i> <span data-i18n="white">${i18n[activeLang]['white']}</span>`;
        } else {
            badge.className = "player-badge black-badge";
            badge.innerHTML = `<i class="fa-solid fa-circle"></i> <span data-i18n="black">${i18n[activeLang]['black']}</span>`;
        }

        turnStartTime = Date.now();
        updateMoveHistoryUI();
        updateCapturedPiecesUI();
    }

    function startTimerTick() {
        if (timerInterval) clearInterval(timerInterval);
        
        timerInterval = setInterval(() => {
            const isMenuOpen = !document.getElementById('start-screen').classList.contains('hidden');
            if (isMenuOpen || chess.game_over() || isAILinking) return;

            const elapsed = Math.floor((Date.now() - turnStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            
            document.getElementById('turn-timer').innerText = `${minutes}:${seconds}`;
        }, 1000);
    }

    function updateMoveHistoryUI() {
        const listContainer = document.getElementById('moves-list');
        listContainer.innerHTML = "";

        const movesHistory = chess.history({ verbose: true });
        
        for (let i = 0; i < movesHistory.length; i += 2) {
            const moveNum = Math.floor(i / 2) + 1;
            const whiteMove = movesHistory[i];
            const blackMove = movesHistory[i + 1];

            const li = document.createElement('li');
            
            const numSpan = document.createElement('span');
            numSpan.className = "move-num";
            numSpan.innerText = `${moveNum}.`;
            li.appendChild(numSpan);

            const whiteSpan = document.createElement('span');
            whiteSpan.className = "move-white";
            whiteSpan.innerText = whiteMove.san;
            whiteSpan.addEventListener('click', () => jumpToMoveHistoryIndex(i));
            li.appendChild(whiteSpan);

            if (blackMove) {
                const blackSpan = document.createElement('span');
                blackSpan.className = "move-black";
                blackSpan.innerText = blackMove.san;
                blackSpan.addEventListener('click', () => jumpToMoveHistoryIndex(i + 1));
                li.appendChild(blackSpan);
            }

            listContainer.appendChild(li);
        }

        const container = document.getElementById('move-history-container');
        container.scrollTop = container.scrollHeight;
    }

    const UNICODE_PIECES = {
        w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
        b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
    };

    function updateCapturedPiecesUI() {
        const blackCapturedPane = document.getElementById('captured-by-black'); 
        const whiteCapturedPane = document.getElementById('captured-by-white'); 

        blackCapturedPane.innerHTML = "";
        whiteCapturedPane.innerHTML = "";

        const initialCounts = {
            w: { p: 8, r: 2, n: 2, b: 2, q: 1 },
            b: { p: 8, r: 2, n: 2, b: 2, q: 1 }
        };

        const activeCounts = {
            w: { p: 0, r: 0, n: 0, b: 0, q: 0 },
            b: { p: 0, r: 0, n: 0, b: 0, q: 0 }
        };

        chess.board().forEach(row => {
            row.forEach(piece => {
                if (piece && piece.type !== 'k') {
                    activeCounts[piece.color][piece.type]++;
                }
            });
        });

        const caps = { w: [], b: [] };

        ['w', 'b'].forEach(col => {
            Object.keys(initialCounts[col]).forEach(type => {
                const diff = initialCounts[col][type] - activeCounts[col][type];
                for (let i = 0; i < diff; i++) {
                    caps[col].push({ type, color: col });
                }
            });
        });

        caps['w'].forEach(item => {
            const span = document.createElement('span');
            span.className = `captured-icon cap-white`;
            span.innerHTML = UNICODE_PIECES['w'][item.type];
            blackCapturedPane.appendChild(span);
        });

        caps['b'].forEach(item => {
            const span = document.createElement('span');
            span.className = `captured-icon cap-black`;
            span.innerHTML = UNICODE_PIECES['b'][item.type];
            whiteCapturedPane.appendChild(span);
        });
    }

    function jumpToMoveHistoryIndex(moveIdx) {
        if (isMultiplayerOnline) return; // Block revert in online matches

        const currentMovesCount = chess.history().length;
        const diff = currentMovesCount - (moveIdx + 1);
        
        if (diff > 0 && confirm(activeLang === 'pt' ? `Voltar ${diff} jogadas para esta posição?` : `Revert ${diff} moves to this position?`)) {
            for (let i = 0; i < diff; i++) {
                chess.undo();
            }
            rebuildPieces3D();
            updateGameStateUI();
            clearSelection();
            cycleTurn();
        }
    }

    /**
     * Return to main start menu
     */
    function returnToMenu() {
        if (confirm(activeLang === 'pt' ? "Deseja encerrar esta partida e voltar ao menu?" : "Do you want to end this match and return to menu?")) {
            // Terminate Firebase listeners
            if (isMultiplayerOnline && isFirebaseActive && database && roomCode) {
                database.ref('rooms/' + roomCode).update({ status: 'disconnected' });
                database.ref('rooms/' + roomCode).off();
                if (firebaseMoveRef) firebaseMoveRef.off();
            }

            // Close drawers
            document.getElementById('captured-drawer').classList.remove('open');
            document.getElementById('toggle-captured-btn').classList.remove('active');
            document.getElementById('history-drawer').classList.remove('open');
            document.getElementById('toggle-history-btn').classList.remove('active');

            // Hide Game HUDs
            document.getElementById('top-hud').classList.add('hidden');
            document.getElementById('bottom-hud').classList.add('hidden');
            document.getElementById('hint-bar').classList.add('hidden');
            document.getElementById('alert-banner').classList.add('hidden');

            // Hide waiting sub-cards
            document.getElementById('online-lobby-wait').classList.add('hidden');

            // Show start screen
            document.getElementById('start-screen').classList.remove('hidden');

            // Reset lobby variables
            roomCode = null;
            isMultiplayerOnline = false;

            // Slow down Orbit controls for elegant menu look
            controls.autoRotate = true;
            controls.autoRotateSpeed = 0.5;
            
            AudioSynth.playMove();
        }
    }

    /**
     * Start Match Launch pipeline
     */
    function startMatch() {
        gameMode = tempGameMode;
        difficulty = tempDifficulty;
        currentTheme = tempTheme;

        chess = new (window.Chess || Chess)();
        
        setTheme(tempTheme);

        // Hide start screen overlay
        document.getElementById('start-screen').classList.add('hidden');

        // Show clean HUD bars
        document.getElementById('top-hud').classList.remove('hidden');
        document.getElementById('bottom-hud').classList.remove('hidden');
        document.getElementById('hint-bar').classList.remove('hidden');

        // Configure Multiplayer Role Badges
        const roleBadge = document.getElementById('online-role-badge');
        const undoBtn = document.getElementById('undo-btn');
        const restartBtn = document.getElementById('restart-btn');

        if (isMultiplayerOnline) {
            roleBadge.classList.remove('hidden');
            if (onlineRole === 'w') {
                roleBadge.className = "role-white";
                roleBadge.innerText = i18n[activeLang]['roleWhiteLabel'] + ` (Sala: ${roomCode})`;
                setCameraPreset('white');
            } else {
                roleBadge.className = "role-black";
                roleBadge.innerText = i18n[activeLang]['roleBlackLabel'] + ` (Sala: ${roomCode})`;
                setCameraPreset('black');
            }
            
            // Disable Undo/Restart buttons in Online mode to maintain competitive fairness!
            undoBtn.disabled = true;
            restartBtn.style.display = "none";

            // Bind Firebase listeners if active
            bindFirebaseMoveListener();
        } else {
            roleBadge.classList.add('hidden');
            restartBtn.style.display = "flex";
            undoBtn.disabled = true;
            setCameraPreset('white');
        }

        clearSelection();
        rebuildPieces3D();
        updateGameStateUI();

        controls.autoRotate = false;
        turnStartTime = Date.now();

        showAlertBanner(activeLang === 'pt' ? "Partida Iniciada!" : "Match Started!");
        document.getElementById('hint-text').innerHTML = `<i class="fa-solid fa-info-circle"></i> ${i18n[activeLang]['title']}`;

        if (gameMode === 'ai' && playerColor === 'b') {
            triggerAIMove();
        }
    }

    /**
     * Complete Game Restart
     */
    function restartGame() {
        if (isMultiplayerOnline) return;

        chess = new (window.Chess || Chess)();
        
        clearSelection();
        rebuildPieces3D();
        updateGameStateUI();
        
        turnStartTime = Date.now();
        document.getElementById('undo-btn').disabled = true;

        showAlertBanner(activeLang === 'pt' ? "Partida Reiniciada!" : "Game Restarted!");
        document.getElementById('hint-text').innerHTML = `<i class="fa-solid fa-info-circle"></i> ${i18n[activeLang]['title']}`;
        
        setCameraPreset(playerColor === 'w' ? 'white' : 'black');
        
        if (gameMode === 'ai' && playerColor === 'b') {
            triggerAIMove();
        }
    }

    /**
     * Undo Last Move
     */
    function undoLastMove() {
        if (isMultiplayerOnline || chess.history().length === 0 || isAILinking) return;

        if (gameMode === 'ai') {
            if (chess.history().length >= 2) {
                chess.undo();
                chess.undo();
            } else {
                chess.undo();
            }
        } else {
            chess.undo();
        }

        rebuildPieces3D();
        updateGameStateUI();
        clearSelection();
        
        if (chess.history().length === 0) {
            document.getElementById('undo-btn').disabled = true;
        }

        AudioSynth.playMove();
        showAlertBanner(activeLang === 'pt' ? "Jogada Desfeita" : "Move Undone");
    }

    /**
     * Theme visual swapping
     */
    function setTheme(themeName) {
        currentTheme = themeName;
        document.body.className = `theme-${themeName}`;

        setupLights();
        ChessBoard3D.createBoard(scene, themeName);
        rebuildPieces3D();

        if (selectedCell) {
            ChessBoard3D.highlightSelected(selectedCell.file, selectedCell.rank, currentTheme);
            ChessBoard3D.highlightValidMoves(validMoves, currentTheme);
        }
        reapplyCheckHighlight();
    }

    /**
     * Quick theme cycler button
     */
    function cycleThemeQuick() {
        let nextTheme = 'classic';
        if (currentTheme === 'classic') nextTheme = 'metallic';
        else if (currentTheme === 'metallic') nextTheme = 'cyber';
        
        tempTheme = nextTheme;
        setTheme(nextTheme);
        AudioSynth.playMove();
    }

    /**
     * Primary Animation loop
     */
    function animate() {
        requestAnimationFrame(animate);

        let delta = clock.getDelta();
        if (delta > 0.05) delta = 0.05; 

        updateParticles(delta);
        updateActiveAnimations(delta);
        ChessBoard3D.animateHighlights(delta);

        if (controls) controls.update();

        if (renderer && scene && camera) {
            renderer.render(scene, camera);
        }
    }

    function updateActiveAnimations(delta) {
        for (let i = activeAnimations.length - 1; i >= 0; i--) {
            const anim = activeAnimations[i];
            anim.progress += delta * anim.speed;

            if (anim.progress >= 1.0) {
                anim.progress = 1.0;
                
                if (anim.type === 'move' || anim.type === 'slide_only') {
                    anim.mesh.position.copy(anim.endPos);
                    
                    if (anim.type === 'move') {
                        applyLandingBounce(anim.mesh);
                    }

                    if (anim.mesh.userData.promoteTo) {
                        const promo = anim.mesh.userData.promoteTo;
                        const pieceColor = anim.mesh.name.charAt(0);
                        
                        const newPieceMesh = ChessPieces.createPieceMesh(promo, pieceColor, currentTheme);
                        newPieceMesh.position.copy(anim.mesh.position);
                        
                        scene.add(newPieceMesh);
                        scene.remove(anim.mesh);
                        
                        boardPieces3D[anim.to.file][anim.to.rank] = newPieceMesh;
                    }

                    if (anim.type === 'move') {
                        setTimeout(() => {
                            cycleTurn();
                        }, 500);
                    }
                } else if (anim.type === 'camera') {
                    camera.position.copy(anim.endPos);
                } else if (anim.type === 'capture_fall') {
                    scene.remove(anim.mesh);
                    anim.mesh.traverse(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) {
                            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                            else child.material.dispose();
                        }
                    });
                }

                activeAnimations.splice(i, 1);
            } else {
                const t = anim.progress;
                const easeOutQuad = t * (2 - t);

                if (anim.type === 'move') {
                    const x = THREE.MathUtils.lerp(anim.startPos.x, anim.endPos.x, easeOutQuad);
                    const z = THREE.MathUtils.lerp(anim.startPos.z, anim.endPos.z, easeOutQuad);
                    
                    const height = 0.8 * Math.sin(t * Math.PI);
                    const y = THREE.MathUtils.lerp(anim.startPos.y, anim.endPos.y, easeOutQuad) + height;

                    anim.mesh.position.set(x, y, z);
                    
                    anim.mesh.rotation.z = Math.sin(t * Math.PI) * 0.15 * (anim.endPos.x - anim.startPos.x);
                    anim.mesh.rotation.x = Math.sin(t * Math.PI) * 0.15 * (anim.endPos.z - anim.startPos.z);
                } else if (anim.type === 'slide_only' || anim.type === 'capture_fall') {
                    anim.mesh.position.lerpVectors(anim.startPos, anim.endPos, easeOutQuad);
                    if (anim.type === 'capture_fall') {
                        anim.mesh.rotation.x += delta * 4;
                        anim.mesh.rotation.y += delta * 6;
                        anim.mesh.scale.setScalar(1.0 - t);
                    }
                } else if (anim.type === 'camera') {
                    camera.position.lerpVectors(anim.startPos, anim.endPos, easeOutQuad);
                }
            }
        }
    }

    function applyLandingBounce(mesh) {
        const startY = mesh.position.y;
        
        activeAnimations.push({
            type: 'slide_only',
            mesh: mesh,
            startPos: new THREE.Vector3(mesh.position.x, startY + 0.15, mesh.position.z),
            endPos: new THREE.Vector3(mesh.position.x, startY, mesh.position.z),
            progress: 0,
            speed: 5.5
        });
    }

    function onWindowResize() {
        if (camera && renderer) {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }

    /**
     * UI Event bindings
     */
    function bindEvents() {
        document.getElementById('three-canvas').addEventListener('click', onCanvasClick);

        document.getElementById('lang-btn').addEventListener('click', () => {
            applyLocalization(activeLang === 'pt' ? 'en' : 'pt');
        });

        // ================= START SCREEN MENU HANDLERS =================
        
        // Mode Selection
        document.querySelectorAll('.start-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.start-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                tempGameMode = btn.getAttribute('data-mode');
                
                // Show/Hide sub-steps dynamically
                const diffStep = document.getElementById('start-difficulty-step');
                const onlineStep = document.getElementById('start-online-step');
                const themeStep = document.getElementById('start-theme-step');
                const startBtn = document.getElementById('start-match-btn');

                if (tempGameMode === 'ai') {
                    diffStep.classList.remove('hidden');
                    onlineStep.classList.add('hidden');
                    themeStep.classList.remove('hidden');
                    startBtn.style.display = "flex";
                } else if (tempGameMode === 'player') {
                    diffStep.classList.add('hidden');
                    onlineStep.classList.add('hidden');
                    themeStep.classList.remove('hidden');
                    startBtn.style.display = "flex";
                } else if (tempGameMode === 'online') {
                    diffStep.classList.add('hidden');
                    onlineStep.classList.remove('hidden');
                    themeStep.classList.remove('hidden');
                    startBtn.style.display = "none"; // start match button hidden; triggered by connecting!
                }
                AudioSynth.playMove();
            });
        });

        // Difficulty Selection
        document.querySelectorAll('.start-diff-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.start-diff-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                tempDifficulty = parseInt(btn.getAttribute('data-diff'));
                AudioSynth.playMove();
            });
        });

        // Theme Selection
        document.querySelectorAll('.start-theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.start-theme-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                tempTheme = btn.getAttribute('data-theme');
                AudioSynth.playMove();
            });
        });

        // INICIAR PARTIDA (Local or Vs AI)
        document.getElementById('start-match-btn').addEventListener('click', () => {
            startMatch();
        });

        // ================= ONLINE PRIVATE ROOM HANDLERS =================
        document.getElementById('online-create-btn').addEventListener('click', () => {
            createOnlineRoom();
            AudioSynth.playMove();
        });

        document.getElementById('online-join-btn').addEventListener('click', () => {
            const codeInput = document.getElementById('room-code-input');
            const code = codeInput.value.trim();
            joinOnlineRoom(code);
            AudioSynth.playMove();
        });

        document.getElementById('lobby-cancel-btn').addEventListener('click', () => {
            cancelOnlineLobby();
        });

        // Block non-numeric characters inside code inputs
        document.getElementById('room-code-input').addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        });

        // ================= CUSTOM FIREBASE CONFIG HANDLERS =================
        document.getElementById('open-firebase-config-btn').addEventListener('click', () => {
            const modal = document.getElementById('firebase-config-modal');
            
            // Load current saved values
            const customConfigStr = localStorage.getItem('chess_3d_firebase_config');
            if (customConfigStr) {
                try {
                    const customConfig = JSON.parse(customConfigStr);
                    document.getElementById('fb-database-url').value = customConfig.databaseURL || '';
                    document.getElementById('fb-api-key').value = customConfig.apiKey || '';
                    document.getElementById('fb-project-id').value = customConfig.projectId || '';
                    document.getElementById('fb-app-id').value = customConfig.appId || '';
                } catch (e) {
                    console.error(e);
                }
            } else {
                document.getElementById('fb-database-url').value = '';
                document.getElementById('fb-api-key').value = '';
                document.getElementById('fb-project-id').value = '';
                document.getElementById('fb-app-id').value = '';
            }

            modal.classList.remove('hidden');
            AudioSynth.playMove();
        });

        document.getElementById('close-firebase-btn').addEventListener('click', () => {
            document.getElementById('firebase-config-modal').classList.add('hidden');
            AudioSynth.playMove();
        });

        document.getElementById('save-firebase-btn').addEventListener('click', () => {
            const dbUrl = document.getElementById('fb-database-url').value.trim();
            const apiKey = document.getElementById('fb-api-key').value.trim();
            const projectId = document.getElementById('fb-project-id').value.trim();
            const appId = document.getElementById('fb-app-id').value.trim();

            if (!dbUrl || !apiKey || !projectId) {
                showAlertBanner(activeLang === 'pt' ? "Por favor preencha URL, API Key e Project ID!" : "Please fill URL, API Key and Project ID!");
                return;
            }

            const config = {
                databaseURL: dbUrl,
                apiKey: apiKey,
                projectId: projectId,
                appId: appId
            };

            localStorage.setItem('chess_3d_firebase_config', JSON.stringify(config));
            initFirebase();

            document.getElementById('firebase-config-modal').classList.add('hidden');
            showAlertBanner(i18n[activeLang]['fbConnected']);
            AudioSynth.playVictory();
        });

        document.getElementById('clear-firebase-btn').addEventListener('click', () => {
            localStorage.removeItem('chess_3d_firebase_config');
            initFirebase();

            document.getElementById('fb-database-url').value = '';
            document.getElementById('fb-api-key').value = '';
            document.getElementById('fb-project-id').value = '';
            document.getElementById('fb-app-id').value = '';

            document.getElementById('firebase-config-modal').classList.add('hidden');
            showAlertBanner(i18n[activeLang]['fbCleared']);
            AudioSynth.playMove();
        });

        // ================= IN-GAME FLOATING HUD HANDLERS =================

        // Return to Menu (House button)
        document.getElementById('menu-btn').addEventListener('click', () => {
            returnToMenu();
        });

        // Undo
        document.getElementById('undo-btn').addEventListener('click', () => {
            undoLastMove();
        });

        // Restart Match
        document.getElementById('restart-btn').addEventListener('click', () => {
            if (confirm(activeLang === 'pt' ? "Deseja reiniciar a partida?" : "Do you want to restart the match?")) {
                restartGame();
            }
        });

        // Quick Theme Toggle
        document.getElementById('quick-theme-btn').addEventListener('click', () => {
            cycleThemeQuick();
        });

        // Auto-Rotate Toggle Pill
        document.getElementById('quick-rotate-btn').addEventListener('click', () => {
            autoRotateCamera = !autoRotateCamera;
            document.getElementById('quick-rotate-btn').classList.toggle('active', autoRotateCamera);
            AudioSynth.playMove();
        });

        // Slide Drawers Toggles
        document.getElementById('toggle-captured-btn').addEventListener('click', () => {
            const drawer = document.getElementById('captured-drawer');
            const isOpen = drawer.classList.toggle('open');
            document.getElementById('toggle-captured-btn').classList.toggle('active', isOpen);
            
            if (isOpen) {
                document.getElementById('history-drawer').classList.remove('open');
                document.getElementById('toggle-history-btn').classList.remove('active');
            }
            AudioSynth.playMove();
        });

        document.getElementById('toggle-history-btn').addEventListener('click', () => {
            const drawer = document.getElementById('history-drawer');
            const isOpen = drawer.classList.toggle('open');
            document.getElementById('toggle-history-btn').classList.toggle('active', isOpen);
            
            if (isOpen) {
                document.getElementById('captured-drawer').classList.remove('open');
                document.getElementById('toggle-captured-btn').classList.remove('active');
            }
            AudioSynth.playMove();
        });

        // Drawers close buttons
        document.querySelectorAll('.drawer-close').forEach(btn => {
            btn.addEventListener('click', () => {
                const drawerType = btn.getAttribute('data-drawer');
                if (drawerType === 'captured') {
                    document.getElementById('captured-drawer').classList.remove('open');
                    document.getElementById('toggle-captured-btn').classList.remove('active');
                } else {
                    document.getElementById('history-drawer').classList.remove('open');
                    document.getElementById('toggle-history-btn').classList.remove('active');
                }
                AudioSynth.playMove();
            });
        });

        // Sound toggle switch
        const soundToggle = document.getElementById('sound-toggle');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                AudioSynth.setEnabled(e.target.checked);
            });
        }

        // Promotion Modal buttons selections
        document.querySelectorAll('.promo-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                selectPromotion(btn.getAttribute('data-piece'));
            });
        });
    }

    /**
     * Start the Chess Core Loop
     */
    function launch() {
        chess = new (window.Chess || Chess)();

        // Initialize Firebase SDK
        initFirebase();

        // 3D Scene Initialization
        initThree();
        ChessBoard3D.createBoard(scene, currentTheme);
        rebuildPieces3D();
        bindEvents();

        applyLocalization('pt');

        // Elegant starting rotation on main start menu
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;

        // Hide screen loader
        setTimeout(() => {
            const loader = document.getElementById('loader-screen');
            loader.style.opacity = 0;
            setTimeout(() => loader.style.display = "none", 400);
            
            startTimerTick();
        }, 1200);

        animate();
    }

    return {
        launch
    };
})();

// Automatic Boot execution when DOM loaded
window.addEventListener('DOMContentLoaded', () => {
    ChessGame3D.launch();
});
