import { GameFactory } from './GameFactory.js';
import { GameConfigGenerator } from './GameConfigGenerator.js';

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');
    const tempSlider = document.getElementById('temperature-slider');
    const tempValue = document.getElementById('temp-value');
    const playBtn = document.getElementById('play-btn');
    const restartBtn = document.getElementById('restart-btn');
    const gameRendererContainer = document.getElementById('game-renderer');
    const scoreValue = document.getElementById('score-value');

    let currentGame = null;
    let selectedGameType = null;
    let gameHistory = [];

    // Initialize Game Factory
    const gameFactory = new GameFactory();

    // Event Listeners
    tempSlider.addEventListener('input', (e) => {
        tempValue.textContent = e.target.value;
    });

    const handleSendMessage = () => {
        const text = chatInput.value.trim();
        if (!text) return;

        appendMessage('user', text);
        chatInput.value = '';

        processCommand(text);
    };

    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSendMessage();
    });

    playBtn.addEventListener('click', () => {
        if (selectedGameType) {
            startGame(selectedGameType);
        } else {
            appendBotMessageAsync("I'm ready! Just tell me what game you want to play. Try 'Create Snake' or 'XO'.");
        }
    });

    restartBtn.addEventListener('click', () => {
        if (currentGame) {
            currentGame.restart();
            appendBotMessageAsync('Game reset! Show me what you got.');
        }
    });

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-message`;
        msgDiv.textContent = text;
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return msgDiv;
    }

    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = '<span></span><span></span><span></span>';
        chatHistory.appendChild(typingDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        return typingDiv;
    }

    function appendBotMessageAsync(text, callback) {
        const indicator = showTypingIndicator();
        
        // Random typing delay between 800ms and 1500ms
        const typingDelay = Math.floor(Math.random() * 700) + 800;
        
        setTimeout(() => {
            indicator.remove();
            appendMessage('bot', text);
            if (callback) callback();
        }, typingDelay);
    }

    function getDynamicResponse(gameType, temp, isRepeat) {
        const typeName = gameType === 'generic' ? 'surprise mini-game' : gameType.toUpperCase();
        
        if (isRepeat) {
            const repeatResponses = [
                `Back for more ${typeName}? I'll spice it up even more this time!`,
                `${typeName} again? You must be a pro! Let's try a new variation.`,
                `Repeating ${typeName}, huh? Let's see if you can handle this version!`
            ];
            return repeatResponses[Math.floor(Math.random() * repeatResponses.length)];
        }

        if (temp <= 0.3) {
            const responses = [
                `Generating a classic ${typeName} game. Ready to play?`,
                `Setting up a standard ${typeName} challenge for you.`,
                `Classic ${typeName} mode engaged. Let's go!`
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        } else if (temp <= 0.7) {
            const responses = [
                `Spicing up the ${typeName}! Adding some variations...`,
                `Preparing a fast-paced ${typeName} experience.`,
                `Let's see how you handle this version of ${typeName}!`
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        } else {
            const responses = [
                `Pure chaos mode! Generating a crazy ${typeName} game!`,
                `You asked for it... Turning the creativity to max for this ${typeName}!`,
                `Warning: Highly unpredictable ${typeName} game incoming!`
            ];
            return responses[Math.floor(Math.random() * responses.length)];
        }
    }

    function processCommand(text) {
        const lowerText = text.toLowerCase();
        const availableGames = ['xo', 'snake', 'sudoku', 'pong', 'math', 'mario', 'racing', 'shooter'];
        
        let detectedType = null;
        
        if (lowerText.includes('surprise') || lowerText.includes('random') || lowerText.includes('anything')) {
            // Pick a game that wasn't the last one played
            const filtered = availableGames.filter(g => g !== gameHistory[gameHistory.length - 1]);
            detectedType = filtered[Math.floor(Math.random() * filtered.length)];
        } else if (lowerText.includes('xo') || lowerText.includes('tic tac toe')) {
            detectedType = 'xo';
        } else if (lowerText.includes('snake')) {
            detectedType = 'snake';
        } else if (lowerText.includes('sudoku')) {
            detectedType = 'sudoku';
        } else if (lowerText.includes('pong')) {
            detectedType = 'pong';
        } else if (lowerText.includes('math')) {
            detectedType = 'math';
        } else if (lowerText.includes('mario') || lowerText.includes('platformer') || lowerText.includes('jump')) {
            detectedType = 'mario';
        } else if (lowerText.includes('racing') || lowerText.includes('car')) {
            detectedType = 'racing';
        } else if (lowerText.includes('shooter') || lowerText.includes('shoot')) {
            detectedType = 'shooter';
        } else {
            detectedType = 'generic';
        }

        const isRepeat = gameHistory.includes(detectedType);
        selectedGameType = detectedType;
        
        const temp = parseFloat(tempSlider.value);
        const response = getDynamicResponse(detectedType, temp, isRepeat);
        
        appendBotMessageAsync(response, () => {
            startGame(detectedType);
        });
    }

    function startGame(type) {
        const temperature = parseFloat(tempSlider.value);
        
        // Stop current game if any
        if (currentGame) {
            currentGame.destroy();
        }

        gameRendererContainer.innerHTML = ''; // Clear container

        // Generate Config based on Temperature and History
        const config = GameConfigGenerator.generate(type, temperature, gameHistory);
        
        // Update history
        gameHistory.push(type);
        if (gameHistory.length > 5) gameHistory.shift();

        // Create Game
        try {
            currentGame = gameFactory.createGame(type, gameRendererContainer, config, updateScore);
            
            // Update UI
            restartBtn.disabled = false;
            scoreValue.textContent = '0';
            
            // Start playing
            currentGame.start();
            
            // Display game description
            if (config.description) {
                appendBotMessageAsync(`Mode: ${config.description}`);
            }
        } catch (error) {
            console.error("Failed to start game:", error);
            if (type !== 'generic') {
                startGame('generic');
            }
        }
    }


    function updateScore(score) {
        scoreValue.textContent = score;
    }
});
