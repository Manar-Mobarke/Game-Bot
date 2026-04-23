import { BaseGame } from './BaseGame.js';
import { GameRenderer } from '../GameRenderer.js';

export class Racing extends BaseGame {
    constructor(container, config, onScoreUpdate) {
        super(container, config, onScoreUpdate);
        this.canvas = null;
        this.ctx = null;
        this.player = {
            x: 275,
            y: 330,
            width: 50,
            height: 60
        };
        this.obstacles = [];
        this.animationId = null;
        this.laneWidth = 100;
        this.numLanes = 3;
        this.roadOffset = 150;
    }

    start() {
        super.start();
        this.canvas = GameRenderer.createCanvas(this.container, 600, 400);
        this.ctx = this.canvas.getContext('2d');
        this.obstacles = [];
        this.score = 0;
        
        window.addEventListener('keydown', this.handleInput.bind(this));
        this.gameLoop();
    }

    handleInput(e) {
        if (!this.isActive) return;
        const speed = 10;
        if (e.code === 'ArrowLeft' && this.player.x > this.roadOffset) {
            this.player.x -= 20;
        }
        if (e.code === 'ArrowRight' && this.player.x < this.roadOffset + (this.numLanes * this.laneWidth) - this.player.width) {
            this.player.x += 20;
        }
    }

    gameLoop() {
        if (!this.isActive) return;

        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    update() {
        // Spawn obstacles
        if (Math.random() < this.config.obstacleDensity) {
            const lane = Math.floor(Math.random() * this.numLanes);
            this.obstacles.push({
                x: this.roadOffset + (lane * this.laneWidth) + 25,
                y: -60,
                width: 50,
                height: 60,
                color: '#e67e22'
            });
        }

        // Move obstacles
        this.obstacles.forEach((obs, index) => {
            obs.y += this.config.carSpeed;

            // Collision
            if (
                this.player.x < obs.x + obs.width &&
                this.player.x + this.player.width > obs.x &&
                this.player.y < obs.y + obs.height &&
                this.player.y + this.player.height > obs.y
            ) {
                this.gameOver();
            }

            // Remove and score
            if (obs.y > 400) {
                this.obstacles.splice(index, 1);
                this.updateScore(10);
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Grass
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, 600, 400);

        // Road
        this.ctx.fillStyle = '#34495e';
        this.ctx.fillRect(this.roadOffset, 0, this.numLanes * this.laneWidth, 400);

        // Lane lines
        this.ctx.strokeStyle = '#fff';
        this.ctx.setLineDash([20, 20]);
        for (let i = 1; i < this.numLanes; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.roadOffset + i * this.laneWidth, 0);
            this.ctx.lineTo(this.roadOffset + i * this.laneWidth, 400);
            this.ctx.stroke();
        }
        this.ctx.setLineDash([]);

        // Player Car
        this.ctx.fillStyle = '#3498db';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        // Windows
        this.ctx.fillStyle = '#ecf0f1';
        this.ctx.fillRect(this.player.x + 5, this.player.y + 10, 40, 15);

        // Obstacle Cars
        this.obstacles.forEach(obs => {
            this.ctx.fillStyle = obs.color;
            this.ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            this.ctx.fillStyle = '#ecf0f1';
            this.ctx.fillRect(obs.x + 5, obs.y + 35, 40, 15);
        });
    }

    gameOver() {
        this.isActive = false;
        cancelAnimationFrame(this.animationId);
        this.createGameOverOverlay('Crashed!', this.restart.bind(this));
    }

    destroy() {
        super.destroy();
        cancelAnimationFrame(this.animationId);
        window.removeEventListener('keydown', this.handleInput.bind(this));
    }
}
