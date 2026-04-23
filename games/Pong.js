import { BaseGame } from './BaseGame.js';

export class Pong extends BaseGame {
    constructor(container, config, onScoreUpdate) {
        super(container, config, onScoreUpdate);
        this.canvasWidth = 600;
        this.canvasHeight = 400;
        
        // Temperature configurations
        this.ballSpeedX = config.ballSpeed || 4;
        this.ballSpeedY = config.ballSpeed || 4;
        this.baseSpeed = config.ballSpeed || 4;
        this.paddleHeight = config.paddleHeight || 80;
        this.paddleWidth = 10;
        this.aiSpeed = config.aiSpeed || 3;
        this.crazyMode = config.crazyMode || false;
        
        // Entities
        this.player = { x: 10, y: this.canvasHeight / 2 - this.paddleHeight / 2, score: 0 };
        this.ai = { x: this.canvasWidth - 20, y: this.canvasHeight / 2 - this.paddleHeight / 2, score: 0 };
        this.ball = { x: this.canvasWidth / 2, y: this.canvasHeight / 2, size: 8 };
        
        this.keys = { ArrowUp: false, ArrowDown: false, w: false, s: false };
        
        this.animationFrameId = null;
        this.lastRenderTime = 0;
    }

    start() {
        super.start();
        
        this.container.innerHTML = '';
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.ctx = this.canvas.getContext('2d');
        
        // Make the canvas scale properly
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';
        this.container.appendChild(this.canvas);
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        
        this.resetBall();
        
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    destroy() {
        super.destroy();
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    }

    handleKeyDown(e) {
        if (this.keys.hasOwnProperty(e.key) || this.keys.hasOwnProperty(e.key.toLowerCase())) {
            e.preventDefault();
            this.keys[e.key] !== undefined ? this.keys[e.key] = true : this.keys[e.key.toLowerCase()] = true;
        }
    }

    handleKeyUp(e) {
        if (this.keys.hasOwnProperty(e.key) || this.keys.hasOwnProperty(e.key.toLowerCase())) {
            this.keys[e.key] !== undefined ? this.keys[e.key] = false : this.keys[e.key.toLowerCase()] = false;
        }
    }

    resetBall() {
        this.ball.x = this.canvasWidth / 2;
        this.ball.y = this.canvasHeight / 2;
        this.ballSpeedX = (Math.random() > 0.5 ? 1 : -1) * this.baseSpeed;
        this.ballSpeedY = (Math.random() > 0.5 ? 1 : -1) * this.baseSpeed;
    }

    gameLoop(currentTime) {
        if (!this.isActive) return;
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
        this.update();
        this.render();
    }

    update() {
        // Player movement
        if (this.keys.ArrowUp || this.keys.w) this.player.y -= 6;
        if (this.keys.ArrowDown || this.keys.s) this.player.y += 6;
        
        // Player bounds
        this.player.y = Math.max(0, Math.min(this.canvasHeight - this.paddleHeight, this.player.y));

        // AI movement
        const aiCenter = this.ai.y + this.paddleHeight / 2;
        if (aiCenter < this.ball.y - 10) {
            this.ai.y += this.aiSpeed;
        } else if (aiCenter > this.ball.y + 10) {
            this.ai.y -= this.aiSpeed;
        }
        
        // AI bounds
        this.ai.y = Math.max(0, Math.min(this.canvasHeight - this.paddleHeight, this.ai.y));

        // Ball movement
        this.ball.x += this.ballSpeedX;
        this.ball.y += this.ballSpeedY;

        // Top/Bottom collision
        if (this.ball.y <= 0 || this.ball.y >= this.canvasHeight) {
            this.ballSpeedY *= -1;
            // Crazy mode physics mixup
            if (this.crazyMode) this.ballSpeedY += (Math.random() * 2 - 1);
        }

        // Paddle collision function
        const collides = (paddle) => {
            return this.ball.x - this.ball.size < paddle.x + this.paddleWidth &&
                   this.ball.x + this.ball.size > paddle.x &&
                   this.ball.y + this.ball.size > paddle.y &&
                   this.ball.y - this.ball.size < paddle.y + this.paddleHeight;
        };

        if (collides(this.player)) {
            this.ballSpeedX = Math.abs(this.ballSpeedX); // Bounce right
            let deltaY = this.ball.y - (this.player.y + this.paddleHeight / 2);
            this.ballSpeedY = deltaY * 0.15;
            if (this.crazyMode) this.ballSpeedX *= 1.1; // Speed up
        }
        
        if (collides(this.ai)) {
            this.ballSpeedX = -Math.abs(this.ballSpeedX); // Bounce left
            let deltaY = this.ball.y - (this.ai.y + this.paddleHeight / 2);
            this.ballSpeedY = deltaY * 0.15;
            if (this.crazyMode) this.ballSpeedX *= 1.1; // Speed up
        }

        // Scoring
        if (this.ball.x < 0) {
            this.ai.score++;
            this.checkWin();
            this.resetBall();
        } else if (this.ball.x > this.canvasWidth) {
            this.player.score++;
            this.updateScore(10); // Update global UI score
            this.checkWin();
            this.resetBall();
        }
    }

    checkWin() {
        if (this.player.score >= 5) {
            this.isActive = false;
            this.createGameOverOverlay('You Win! AI Defeated!', () => this.restart());
        } else if (this.ai.score >= 5) {
            this.isActive = false;
            this.createGameOverOverlay('You Lose! AI Wins!', () => this.restart());
        }
    }

    render() {
        // Background
        this.ctx.fillStyle = '#FAF3F0'; // var(--bg-dark)
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        // Center line
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.setLineDash([10, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvasWidth / 2, 0);
        this.ctx.lineTo(this.canvasWidth / 2, this.canvasHeight);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Paddles
        this.ctx.fillStyle = '#DBC4F0'; // User: Primary/Lavender
        this.ctx.fillRect(this.player.x, this.player.y, this.paddleWidth, this.paddleHeight);
        
        this.ctx.fillStyle = '#FFCACC'; // AI: Secondary/Pink
        this.ctx.fillRect(this.ai.x, this.ai.y, this.paddleWidth, this.paddleHeight);

        // Ball
        this.ctx.fillStyle = '#444444'; // Dark ball for contrast
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Local Scores
        this.ctx.font = '40px Outfit, sans-serif';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillText(this.player.score, this.canvasWidth / 4, 60);
        this.ctx.fillText(this.ai.score, 3 * this.canvasWidth / 4, 60);
    }
}
