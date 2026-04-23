import { BaseGame } from './BaseGame.js';
import { GameRenderer } from '../GameRenderer.js';

export class Platformer extends BaseGame {
    constructor(container, config, onScoreUpdate) {
        super(container, config, onScoreUpdate);
        this.canvas = null;
        this.ctx = null;
        this.player = {
            x: 50,
            y: 300,
            width: 30,
            height: 30,
            dy: 0,
            isJumping: false
        };
        this.platforms = [];
        this.enemies = [];
        this.animationId = null;
        this.lastSpawn = 0;
    }

    start() {
        super.start();
        this.canvas = GameRenderer.createCanvas(this.container, 600, 400);
        this.ctx = this.canvas.getContext('2d');
        this.platforms = [
            { x: 0, y: 350, width: 600, height: 50 } // Ground
        ];
        this.enemies = [];
        this.player.y = 320;
        this.player.dy = 0;
        this.score = 0;
        
        window.addEventListener('keydown', this.handleInput.bind(this));
        this.gameLoop();
    }

    handleInput(e) {
        if (!this.isActive) return;
        if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.player.isJumping) {
            this.player.dy = this.config.jumpStrength;
            this.player.isJumping = true;
        }
    }

    gameLoop(timestamp) {
        if (!this.isActive) return;

        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    update() {
        // Player gravity
        this.player.dy += this.config.gravity;
        this.player.y += this.player.dy;

        // Ground collision
        if (this.player.y + this.player.height > 350) {
            this.player.y = 350 - this.player.height;
            this.player.dy = 0;
            this.player.isJumping = false;
        }

        // Spawn obstacles/enemies
        if (Math.random() < this.config.enemySpawnRate) {
            this.enemies.push({
                x: 600,
                y: 320,
                width: 30,
                height: 30,
                color: '#e74c3c'
            });
        }

        // Move enemies
        this.enemies.forEach((enemy, index) => {
            enemy.x -= this.config.speed;
            
            // Collision check
            if (
                this.player.x < enemy.x + enemy.width &&
                this.player.x + this.player.width > enemy.x &&
                this.player.y < enemy.y + enemy.height &&
                this.player.y + this.player.height > enemy.y
            ) {
                this.gameOver();
            }

            // Score and removal
            if (enemy.x + enemy.width < 0) {
                this.enemies.splice(index, 1);
                this.updateScore(10);
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw sky
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, 600, 400);

        // Draw Ground
        this.ctx.fillStyle = '#2ecc71';
        this.ctx.fillRect(0, 350, 600, 50);

        // Draw Player
        this.ctx.fillStyle = '#f1c40f';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        // Add eyes to player
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(this.player.x + 20, this.player.y + 5, 5, 5);

        // Draw Enemies
        this.enemies.forEach(enemy => {
            this.ctx.fillStyle = enemy.color;
            this.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
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
        window.removeEventListener('keydown', this.handleInput.bind(this));
    }
}
