export class GameConfigGenerator {
    static generate(gameType, temperature, history = []) {
        // Temperature logic:
        // Low (0 - 0.3): Classic rules
        // Medium (0.4 - 0.7): Variations (speed, size, difficulty)
        // High (0.8 - 1.0): Creative/Crazy features (obstacles, randomness)

        let config = {
            temperature: temperature,
            theme: this.getRandomTheme(temperature),
            id: Math.random().toString(36).substr(2, 9)
        };

        // Avoid repetition by checking history if needed (handled in script.js)
        
        if (gameType === 'xo') {
            this.setupXOConfig(config, temperature);
        } else if (gameType === 'snake') {
            this.setupSnakeConfig(config, temperature);
        } else if (gameType === 'pong') {
            this.setupPongConfig(config, temperature);
        } else if (gameType === 'math') {
            this.setupMathConfig(config, temperature);
        } else if (gameType === 'sudoku') {
            this.setupSudokuConfig(config, temperature);
        } else if (gameType === 'mario' || gameType === 'platformer') {
            this.setupPlatformerConfig(config, temperature);
        } else if (gameType === 'racing') {
            this.setupRacingConfig(config, temperature);
        } else if (gameType === 'shooter') {
            this.setupShooterConfig(config, temperature);
        } else {
            this.setupGenericConfig(config, temperature);
        }

        return config;
    }

    static getRandomTheme(temp) {
        const themes = ['classic', 'neon', 'pastel', 'dark', 'retro', 'cyberpunk', 'ocean'];
        if (temp > 0.7) return themes[Math.floor(Math.random() * themes.length)];
        return themes[0]; // Classic by default
    }

    static setupXOConfig(config, temp) {
        if (temp <= 0.3) {
            config.size = 3;
            config.winLength = 3;
            config.timeLimit = 30;
            config.randomBlockers = false;
            config.description = "Classic 3x3 Tic Tac Toe. Standard rules.";
        } else if (temp <= 0.7) {
            config.size = 4;
            config.winLength = 4;
            config.timeLimit = 15;
            config.randomBlockers = false;
            config.description = "Bigger 4x4 board. Connect 4 to win! Faster 15s time limit.";
        } else {
            config.size = 5 + Math.floor(Math.random() * 2);
            config.winLength = 4;
            config.timeLimit = 5 + Math.floor(Math.random() * 5);
            config.randomBlockers = true;
            config.description = `${config.size}x${config.size} board with random obstacles! Connect 4. Hyper-speed ${config.timeLimit}s turns!`;
        }
    }

    static setupSnakeConfig(config, temp) {
        config.speed = temp <= 0.3 ? 150 : (temp <= 0.7 ? 80 : 50);
        config.obstacles = temp > 0.7;
        config.randomFoodBehavior = temp > 0.6;
        config.wallsTeleport = temp > 0.8;
        config.description = temp > 0.8 ? "Warp Snake: Walls teleport you to the other side! Chaos mode." : 
                             (temp > 0.4 ? "High-speed Snake challenge!" : "Classic Snake experience.");
    }

    static setupPongConfig(config, temp) {
        config.ballSpeed = 4 + (temp * 8);
        config.aiSpeed = 3 + (temp * 6);
        config.paddleHeight = 80 - (temp * 40);
        config.crazyMode = temp > 0.7;
        config.description = temp > 0.7 ? "Intergalactic Pong: Warped physics and shrinking paddles!" : "Standard Pong match.";
    }

    static setupMathConfig(config, temp) {
        config.fallSpeed = 0.5 + (temp * 2);
        config.spawnRate = 3000 - (temp * 2000);
        config.maxNum = 10 + (temp * 90);
        config.operations = temp <= 0.3 ? ['+', '-'] : (temp <= 0.7 ? ['+', '-', '*'] : ['+', '-', '*', '/']);
        config.description = `Math Challenge: Level ${Math.floor(temp * 10)}. Solve ${config.operations.join(', ')} fast!`;
    }

    static setupSudokuConfig(config, temp) {
        config.filledCells = Math.max(10, 40 - Math.floor(temp * 30));
        config.description = temp > 0.7 ? "Expert Sudoku: Pure logic, no mistakes allowed." : "Brain-training Sudoku.";
    }

    static setupPlatformerConfig(config, temp) {
        config.gravity = 0.5;
        config.jumpStrength = -10;
        config.speed = 4 + (temp * 6);
        config.enemySpawnRate = 0.005 + (temp * 0.02);
        config.description = "Platforming adventure! Avoid enemies and reach for the high score.";
    }

    static setupRacingConfig(config, temp) {
        config.carSpeed = 5 + (temp * 10);
        config.obstacleDensity = 0.02 + (temp * 0.06);
        config.description = "Adrenaline Racing: Dodge traffic and stay on the road!";
    }

    static setupShooterConfig(config, temp) {
        config.playerSpeed = 5 + (temp * 5);
        config.enemySpeed = 2 + (temp * 6);
        config.fireRate = 500 - (temp * 400);
        config.description = temp > 0.7 ? "Space Siege: Bullet hell mode engaged!" : "Alien Defense Shooter.";
    }

    static setupGenericConfig(config, temp) {
        // More variety for generic games
        const modes = ['dodge', 'collect', 'survive'];
        config.mode = modes[Math.floor(temp * (modes.length - 0.1))];
        config.speed = 3 + (temp * 7);
        config.difficulty = temp;
        
        const modeDescs = {
            'dodge': 'Dodge the incoming meteorites!',
            'collect': 'Gather as many power-crystals as you can!',
            'survive': 'Survive the relentless pursuit of the space-drones!'
        };
        config.description = modeDescs[config.mode] || "A mysterious challenge awaits!";
    }
}

