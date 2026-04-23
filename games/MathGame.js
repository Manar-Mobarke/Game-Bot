import { BaseGame } from './BaseGame.js';

export class MathGame extends BaseGame {
    constructor(container, config, onScoreUpdate) {
        super(container, config, onScoreUpdate);
        this.canvasWidth = 600;
        this.canvasHeight = 500;
        
        // Temperature configurations
        this.fallSpeed = config.fallSpeed || 1;
        this.spawnRate = config.spawnRate || 2000;
        this.operations = config.operations || ['+', '-'];
        this.maxNum = config.maxNum || 10;
        this.crazyMode = config.crazyMode || false;
        
        this.meteors = [];
        this.animationFrameId = null;
        this.lastSpawnTime = 0;
        this.lastRenderTime = 0;
    }

    start() {
        super.start();
        this.meteors = [];
        this.lastSpawnTime = performance.now();
        this.lastRenderTime = performance.now();
        
        this.container.innerHTML = '';
        
        // Wrapper for canvas and input
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '16px';
        
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.style.maxWidth = '100%';
        this.canvas.style.height = 'auto';
        
        this.inputArea = document.createElement('div');
        this.inputArea.style.display = 'flex';
        this.inputArea.style.gap = '8px';
        
        this.input = document.createElement('input');
        this.input.type = 'number';
        this.input.placeholder = 'Type answer...';
        this.input.className = 'math-input';
        // Add basic inline styles to avoid needing style.css edits
        this.input.style.padding = '12px 24px';
        this.input.style.fontSize = '1.5rem';
        this.input.style.borderRadius = '24px';
        this.input.style.border = '2px solid var(--primary)';
        this.input.style.background = 'var(--bg-dark)';
        this.input.style.color = 'var(--text-main)';
        this.input.style.outline = 'none';
        this.input.style.textAlign = 'center';
        
        this.inputArea.appendChild(this.input);
        
        wrapper.appendChild(this.canvas);
        wrapper.appendChild(this.inputArea);
        this.container.appendChild(wrapper);
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.input.addEventListener('keydown', this.handleKeyDown);
        
        // Focus input automatically
        setTimeout(() => this.input.focus(), 100);
        
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
    }

    destroy() {
        super.destroy();
        if (this.input) {
            this.input.removeEventListener('keydown', this.handleKeyDown);
        }
        if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    }

    handleKeyDown(e) {
        if (e.key === 'Enter') {
            const answer = parseInt(this.input.value);
            if (!isNaN(answer)) {
                this.checkAnswer(answer);
            }
            this.input.value = '';
        }
    }

    checkAnswer(answer) {
        // Find the lowest meteor that matches the answer
        let hitIndex = -1;
        let lowestY = -1;
        
        for (let i = 0; i < this.meteors.length; i++) {
            if (this.meteors[i].answer === answer) {
                if (this.meteors[i].y > lowestY) {
                    lowestY = this.meteors[i].y;
                    hitIndex = i;
                }
            }
        }
        
        if (hitIndex !== -1) {
            // Destroy meteor
            this.meteors.splice(hitIndex, 1);
            this.updateScore(10);
            if (this.crazyMode) {
                this.fallSpeed += 0.05; // Gets faster!
            }
        }
    }

    generateEquation() {
        const op = this.operations[Math.floor(Math.random() * this.operations.length)];
        let num1, num2, answer;
        let text = '';
        
        if (op === '+') {
            num1 = Math.floor(Math.random() * this.maxNum) + 1;
            num2 = Math.floor(Math.random() * this.maxNum) + 1;
            answer = num1 + num2;
            text = `${num1} + ${num2}`;
        } else if (op === '-') {
            num1 = Math.floor(Math.random() * this.maxNum) + 1;
            num2 = Math.floor(Math.random() * this.maxNum) + 1;
            // Ensure positive answers for simplicity
            if (num1 < num2) [num1, num2] = [num2, num1];
            answer = num1 - num2;
            text = `${num1} - ${num2}`;
        } else if (op === '*') {
            num1 = Math.floor(Math.random() * (this.maxNum / 2)) + 1;
            num2 = Math.floor(Math.random() * 10) + 1;
            answer = num1 * num2;
            text = `${num1} × ${num2}`;
        }
        
        return { text, answer };
    }

    spawnMeteor() {
        const { text, answer } = this.generateEquation();
        // Keep away from the extreme edges
        const x = Math.random() * (this.canvasWidth - 150) + 75;
        this.meteors.push({
            x: x,
            y: -30,
            text: text,
            answer: answer,
            color: this.crazyMode ? `hsl(${Math.random() * 360}, 80%, 75%)` : '#FFCACC', // var(--secondary)
            speedMultiplier: this.crazyMode ? (Math.random() * 0.5 + 0.8) : 1
        });
    }

    gameLoop(currentTime) {
        if (!this.isActive) return;
        this.animationFrameId = requestAnimationFrame(this.gameLoop.bind(this));
        
        const deltaTime = currentTime - this.lastRenderTime;
        this.lastRenderTime = currentTime;
        
        // Spawn logic
        if (currentTime - this.lastSpawnTime > this.spawnRate) {
            this.spawnMeteor();
            this.lastSpawnTime = currentTime;
            if (this.crazyMode) {
                // Randomize spawn rate
                this.lastSpawnTime -= Math.random() * (this.spawnRate / 2);
            }
        }

        this.update(deltaTime);
        this.render();
    }

    update(deltaTime) {
        // Move meteors
        // standardize speed based on 60fps (approx 16ms per frame)
        const timeScale = deltaTime / 16.66;
        
        for (let i = 0; i < this.meteors.length; i++) {
            this.meteors[i].y += this.fallSpeed * this.meteors[i].speedMultiplier * timeScale;
            
            // Check if meteor hit the bottom
            if (this.meteors[i].y > this.canvasHeight) {
                this.gameOver();
                return;
            }
        }
    }

    gameOver() {
        this.isActive = false;
        cancelAnimationFrame(this.animationFrameId);
        if (this.input) {
            this.input.blur();
            this.input.disabled = true;
        }
        this.createGameOverOverlay(`City Destroyed! Score: ${this.score}`, () => this.restart());
    }

    render() {
        // Background
        this.ctx.fillStyle = '#FAF3F0'; // var(--bg-dark)
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Draw City at the bottom
        this.ctx.fillStyle = '#D4E2D4'; // var(--bg-darker)
        this.ctx.fillRect(0, this.canvasHeight - 40, this.canvasWidth, 40);
        
        // City skyline details
        this.ctx.fillStyle = '#c5d7c5';
        this.ctx.fillRect(50, this.canvasHeight - 60, 40, 20);
        this.ctx.fillRect(150, this.canvasHeight - 80, 50, 40);
        this.ctx.fillRect(300, this.canvasHeight - 90, 60, 50);
        this.ctx.fillRect(450, this.canvasHeight - 70, 40, 30);
        this.ctx.fillRect(520, this.canvasHeight - 50, 30, 10);

        // Draw Meteors
        for (let m of this.meteors) {
            // Asteroid body
            this.ctx.beginPath();
            this.ctx.arc(m.x, m.y, 25, 0, Math.PI * 2);
            this.ctx.fillStyle = m.color;
            this.ctx.fill();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = 'rgba(0,0,0,0.05)';
            this.ctx.stroke();
            
            // Fire tail
            this.ctx.beginPath();
            this.ctx.moveTo(m.x - 20, m.y - 10);
            this.ctx.lineTo(m.x, m.y - 60);
            this.ctx.lineTo(m.x + 20, m.y - 10);
            this.ctx.fillStyle = 'rgba(219, 196, 240, 0.4)'; // var(--primary) transparent
            this.ctx.fill();

            // Text
            this.ctx.font = 'bold 18px Outfit, sans-serif';
            this.ctx.fillStyle = '#444444'; // var(--text-main)
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(m.text, m.x, m.y);
        }
    }
}
