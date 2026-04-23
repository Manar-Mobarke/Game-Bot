import { BaseGame } from './BaseGame.js';

export class Snake extends BaseGame {
    constructor(container, config, onScoreUpdate) {
        super(container, config, onScoreUpdate);
        this.canvasSize = 400;
        this.gridSize = 20;
        
        // Temperature-based variations configured from config object
        this.speed = config.speed || 150; // ms per frame
        this.hasObstacles = config.obstacles || false;
        this.randomFoodBehavior = config.randomFoodBehavior || false;
        
        this.snake = [];
        this.food = null;
        this.obstacles = [];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        this.animationFrameId = null;
        this.lastRenderTime = 0;
        this.foodMoveTime = 0;
    }

    start() {
        super.start();
        this.snake = [
            { x: 5, y: 5 },
            { x: 4, y: 5 },
            { x: 3, y: 5 }
        ];
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.obstacles = [];
        this.lastRenderTime = 0;
        this.foodMoveTime = performance.now();
        
        if (this.hasObstacles) {
            for (let i = 0; i < 10; i++) {
                this.obstacles.push({
                    x: Math.floor(Math.random() * (this.canvasSize / this.gridSize)),
                    y: Math.floor(Math.random() * (this.canvasSize / this.gridSize))
                });
            }
        }
        
        this.spawnFood();
        
        this.container.innerHTML = '';
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasSize;
        this.canvas.height = this.canvasSize;
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
        window.addEventListener('keydown', this.handleKeyDown);
        
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    destroy() {
        super.destroy();
        window.removeEventListener('keydown', this.handleKeyDown);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    }

    handleKeyDown(e) {
        if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
            e.preventDefault();
        }

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                if (this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                if (this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                if (this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                if (this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
                break;
        }
    }

    spawnFood() {
        let valid = false;
        while (!valid) {
            this.food = {
                x: Math.floor(Math.random() * (this.canvasSize / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvasSize / this.gridSize))
            };
            valid = !this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y) &&
                    !this.obstacles.some(obs => obs.x === this.food.x && obs.y === this.food.y);
        }
    }

    gameLoop(currentTime) {
        if (!this.isActive) return;

        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
        
        const secondsSinceLastRender = currentTime - this.lastRenderTime;
        if (secondsSinceLastRender < this.speed) {
            return;
        }
        
        this.lastRenderTime = currentTime;

        // Random food behavior (moves every ~2.5 seconds if high temp)
        if (this.randomFoodBehavior && currentTime - this.foodMoveTime > 2500) {
            this.spawnFood();
            this.foodMoveTime = currentTime;
        }

        this.update();
        this.render();
    }

    update() {
        this.direction = this.nextDirection;
        const head = { x: this.snake[0].x + this.direction.x, y: this.snake[0].y + this.direction.y };
        
        // Wall collision
        if (head.x < 0 || head.x >= this.canvasSize / this.gridSize || 
            head.y < 0 || head.y >= this.canvasSize / this.gridSize) {
            this.gameOver();
            return;
        }

        // Self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        // Obstacle collision
        if (this.obstacles.some(obs => obs.x === head.x && obs.y === head.y)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.updateScore(10);
            this.spawnFood();
            this.foodMoveTime = performance.now(); // reset timer on eat
        } else {
            this.snake.pop();
        }
    }

    gameOver() {
        this.isActive = false;
        cancelAnimationFrame(this.animationFrameId);
        window.removeEventListener('keydown', this.handleKeyDown);
        this.createGameOverOverlay(`Game Over! Score: ${this.score}`, () => this.restart());
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        
        // Draw grid lines
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        for (let i = 0; i <= this.canvasSize; i += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 0);
            this.ctx.lineTo(i, this.canvasSize);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(this.canvasSize, i);
            this.ctx.stroke();
        }

        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) this.ctx.fillStyle = '#C3B1E1'; // Lavender head
            else this.ctx.fillStyle = '#DBC4F0'; // var(--primary) hex value
            this.ctx.fillRect(segment.x * this.gridSize + 1, segment.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
        });

        // Draw food
        this.ctx.fillStyle = '#FFCACC'; // var(--secondary)
        this.ctx.fillRect(this.food.x * this.gridSize + 1, this.food.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);

        // Draw obstacles
        this.ctx.fillStyle = '#D4E2D4'; // var(--bg-darker) hex value
        this.obstacles.forEach(obs => {
            this.ctx.fillRect(obs.x * this.gridSize, obs.y * this.gridSize, this.gridSize, this.gridSize);
        });
    }
}
