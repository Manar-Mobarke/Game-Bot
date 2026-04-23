import { BaseGame } from './BaseGame.js';
import { GameRenderer } from '../GameRenderer.js';

export class GenericGame extends BaseGame {
    constructor(container, config, onScoreUpdate) {
        super(container, config, onScoreUpdate);
        this.canvas = null;
        this.ctx = null;
        this.player = {
            x: 300,
            y: 200,
            radius: 15,
            color: '#3498db'
        };
        this.entities = [];
        this.animationId = null;
        this.keys = {};
        this.mode = config.mode || 'dodge';
        this.theme = config.theme || 'classic';
        
        this.colors = {
            classic: { bg: '#2c3e50', player: '#3498db', obstacle: '#e74c3c', collect: '#f1c40f' },
            neon: { bg: '#000', player: '#0ff', obstacle: '#f0f', collect: '#0f0' },
            pastel: { bg: '#FDFCF0', player: '#A0C4FF', obstacle: '#FFADAD', collect: '#CAFFBF' },
            dark: { bg: '#1a1a1a', player: '#ffffff', obstacle: '#444444', collect: '#888888' },
            retro: { bg: '#333', player: '#0f0', obstacle: '#f00', collect: '#ff0' }
        };

        this.handleKeyDownBound = this.handleKeyDown.bind(this);
        this.handleKeyUpBound = this.handleKeyUp.bind(this);
    }

    start() {
        super.start();
        this.canvas = GameRenderer.createCanvas(this.container, 600, 400);
        this.ctx = this.canvas.getContext('2d');
        this.entities = [];
        this.score = 0;
        
        window.removeEventListener('keydown', this.handleKeyDownBound);
        window.removeEventListener('keyup', this.handleKeyUpBound);
        window.addEventListener('keydown', this.handleKeyDownBound);
        window.addEventListener('keyup', this.handleKeyUpBound);
        
        if (this.animationId) cancelAnimationFrame(this.animationId);
        this.gameLoop();
    }

    handleKeyDown(e) { this.keys[e.code] = true; }
    handleKeyUp(e) { this.keys[e.code] = false; }

    gameLoop() {
        if (!this.isActive) return;

        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    update() {
        const speed = 5;
        if (this.keys['ArrowLeft'] && this.player.x > 15) this.player.x -= speed;
        if (this.keys['ArrowRight'] && this.player.x < 585) this.player.x += speed;
        if (this.keys['ArrowUp'] && this.player.y > 15) this.player.y -= speed;
        if (this.keys['ArrowDown'] && this.player.y < 385) this.player.y += speed;

        const spawnRate = 0.02 + (this.config.temperature * 0.05);

        // Spawn entities based on mode
        if (Math.random() < spawnRate) {
            if (this.mode === 'dodge') {
                this.spawnObstacle();
            } else if (this.mode === 'collect') {
                this.spawnCollectible();
            } else if (this.mode === 'survive') {
                this.spawnEnemy();
            }
        }

        this.entities.forEach((ent, i) => {
            if (this.mode === 'dodge') {
                ent.y += ent.speed;
                if (ent.y > 420) {
                    this.entities.splice(i, 1);
                    this.updateScore(5);
                }
            } else if (this.mode === 'collect') {
                // Collectibles stay until picked up or timeout
                ent.timer--;
                if (ent.timer <= 0) this.entities.splice(i, 1);
            } else if (this.mode === 'survive') {
                // Follow player
                const dx = this.player.x - ent.x;
                const dy = this.player.y - ent.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                ent.x += (dx/dist) * ent.speed;
                ent.y += (dy/dist) * ent.speed;
            }
            
            // Collision
            const dx = this.player.x - ent.x;
            const dy = this.player.y - ent.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.radius + ent.size / 2) {
                if (ent.type === 'obstacle' || ent.type === 'enemy') {
                    this.gameOver();
                } else if (ent.type === 'collectible') {
                    this.entities.splice(i, 1);
                    this.updateScore(50);
                }
            }
        });

        if (this.mode === 'survive') {
            this.updateScore(0.1); // Constant score for survival
        }
    }

    spawnObstacle() {
        this.entities.push({
            type: 'obstacle',
            x: Math.random() * 600,
            y: -20,
            size: 20 + Math.random() * 20,
            speed: 2 + Math.random() * this.config.speed
        });
    }

    spawnCollectible() {
        this.entities.push({
            type: 'collectible',
            x: 20 + Math.random() * 560,
            y: 20 + Math.random() * 360,
            size: 15,
            timer: 200 + Math.random() * 300
        });
    }

    spawnEnemy() {
        if (this.entities.length > 5 + (this.config.temperature * 10)) return;
        const side = Math.floor(Math.random() * 4);
        let x, y;
        if (side === 0) { x = Math.random() * 600; y = -20; }
        else if (side === 1) { x = 620; y = Math.random() * 400; }
        else if (side === 2) { x = Math.random() * 600; y = 420; }
        else { x = -20; y = Math.random() * 400; }
        
        this.entities.push({
            type: 'enemy',
            x: x,
            y: y,
            size: 20,
            speed: 1 + Math.random() * 2
        });
    }

    draw() {
        const themeColors = this.colors[this.theme] || this.colors.classic;
        this.ctx.clearRect(0, 0, 600, 400);
        
        // Background
        this.ctx.fillStyle = themeColors.bg;
        this.ctx.fillRect(0, 0, 600, 400);

        // Player
        this.ctx.fillStyle = themeColors.player;
        this.ctx.beginPath();
        this.ctx.arc(this.player.x, this.player.y, this.player.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Entities
        this.entities.forEach(ent => {
            if (ent.type === 'obstacle' || ent.type === 'enemy') {
                this.ctx.fillStyle = themeColors.obstacle;
                this.ctx.fillRect(ent.x - ent.size/2, ent.y - ent.size/2, ent.size, ent.size);
            } else {
                this.ctx.fillStyle = themeColors.collect;
                this.ctx.beginPath();
                this.ctx.moveTo(ent.x, ent.y - ent.size/2);
                this.ctx.lineTo(ent.x + ent.size/2, ent.y);
                this.ctx.lineTo(ent.x, ent.y + ent.size/2);
                this.ctx.lineTo(ent.x - ent.size/2, ent.y);
                this.ctx.closePath();
                this.ctx.fill();
            }
        });
    }

    gameOver() {
        this.isActive = false;
        cancelAnimationFrame(this.animationId);
        this.createGameOverOverlay('Game Over!', this.restart.bind(this));
    }

    destroy() {
        super.destroy();
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.handleKeyDownBound);
        window.removeEventListener('keyup', this.handleKeyUpBound);
    }
}

