import { BaseGame } from './BaseGame.js';
import { GameRenderer } from '../GameRenderer.js';

export class Shooter extends BaseGame {
    constructor(container, config, onScoreUpdate) {
        super(container, config, onScoreUpdate);
        this.canvas = null;
        this.ctx = null;
        this.player = {
            x: 275,
            y: 350,
            width: 40,
            height: 40
        };
        this.bullets = [];
        this.enemies = [];
        this.animationId = null;
        this.lastFireTime = 0;
        this.keys = {};
    }

    start() {
        super.start();
        this.canvas = GameRenderer.createCanvas(this.container, 600, 400);
        this.ctx = this.canvas.getContext('2d');
        this.bullets = [];
        this.enemies = [];
        this.score = 0;
        
        window.addEventListener('keydown', this.handleKeyDown.bind(this));
        window.addEventListener('keyup', this.handleKeyUp.bind(this));
        this.gameLoop();
    }

    handleKeyDown(e) { this.keys[e.code] = true; }
    handleKeyUp(e) { this.keys[e.code] = false; }

    gameLoop(timestamp) {
        if (!this.isActive) return;

        this.update(timestamp);
        this.draw();
        this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(timestamp) {
        // Player movement
        if (this.keys['ArrowLeft'] && this.player.x > 0) this.player.x -= this.config.playerSpeed;
        if (this.keys['ArrowRight'] && this.player.x < 600 - this.player.width) this.player.x += this.config.playerSpeed;

        // Shooting
        if (this.keys['Space'] && timestamp - this.lastFireTime > this.config.fireRate) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 10
            });
            this.lastFireTime = timestamp;
        }

        // Bullets update
        this.bullets.forEach((b, i) => {
            b.y -= 7;
            if (b.y < 0) this.bullets.splice(i, 1);
        });

        // Enemies update
        if (Math.random() < 0.02) {
            this.enemies.push({
                x: Math.random() * (600 - 30),
                y: -30,
                width: 30,
                height: 30
            });
        }

        this.enemies.forEach((en, i) => {
            en.y += this.config.enemySpeed;
            
            // Player collision
            if (
                this.player.x < en.x + en.width &&
                this.player.x + this.player.width > en.x &&
                this.player.y < en.y + en.height &&
                this.player.y + this.player.height > en.y
            ) {
                this.gameOver();
            }

            // Bullet collision
            this.bullets.forEach((b, bi) => {
                if (
                    b.x < en.x + en.width &&
                    b.x + b.width > en.x &&
                    b.y < en.y + en.height &&
                    b.y + b.height > en.y
                ) {
                    this.enemies.splice(i, 1);
                    this.bullets.splice(bi, 1);
                    this.updateScore(20);
                }
            });

            if (en.y > 400) this.enemies.splice(i, 1);
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, 600, 400);
        
        // Background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, 600, 400);

        // Player
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + 20, this.player.y);
        this.ctx.lineTo(this.player.x, this.player.y + 40);
        this.ctx.lineTo(this.player.x + 40, this.player.y + 40);
        this.ctx.fill();

        // Bullets
        this.ctx.fillStyle = '#ffff00';
        this.bullets.forEach(b => this.ctx.fillRect(b.x, b.y, b.width, b.height));

        // Enemies
        this.ctx.fillStyle = '#ff0000';
        this.enemies.forEach(en => {
            this.ctx.fillRect(en.x, en.y, en.width, en.height);
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(en.x + 5, en.y + 5, 5, 5);
            this.ctx.fillRect(en.x + 20, en.y + 5, 5, 5);
            this.ctx.fillStyle = '#ff0000';
        });
    }

    gameOver() {
        this.isActive = false;
        cancelAnimationFrame(this.animationId);
        this.createGameOverOverlay('Base Destroyed!', this.restart.bind(this));
    }

    destroy() {
        super.destroy();
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.handleKeyDown.bind(this));
        window.removeEventListener('keyup', this.handleKeyUp.bind(this));
    }
}
