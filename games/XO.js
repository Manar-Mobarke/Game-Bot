import { BaseGame } from './BaseGame.js';

export class XO extends BaseGame {
    constructor(container, config, onScoreUpdate) {
        super(container, config, onScoreUpdate);
        this.size = config.size || 3;
        this.winLength = config.winLength || 3;
        this.board = [];
        this.currentPlayer = 'X';
        this.gameOver = false;
    }

    start() {
        super.start();
        this.currentPlayer = 'X';
        this.gameOver = false;
        this.board = Array(this.size * this.size).fill(null);
        
        // Random blockers for high temperature
        if (this.config.randomBlockers) {
            const blockersCount = Math.floor(this.size * this.size * 0.15); // 15% blocked
            for (let i = 0; i < blockersCount; i++) {
                let randomIdx;
                do {
                    randomIdx = Math.floor(Math.random() * this.board.length);
                } while (this.board[randomIdx] !== null);
                this.board[randomIdx] = 'B'; // Blocker
            }
        }
        
        this.renderBoard();
    }

    renderBoard() {
        this.container.innerHTML = '';
        const boardEl = document.createElement('div');
        boardEl.className = 'xo-board';
        boardEl.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;

        this.board.forEach((cell, index) => {
            const cellEl = document.createElement('div');
            cellEl.className = 'xo-cell';
            if (cell === 'B') {
                cellEl.classList.add('filled');
                cellEl.style.background = 'var(--secondary)';
                cellEl.style.cursor = 'not-allowed';
            } else if (cell) {
                cellEl.textContent = cell;
                cellEl.classList.add(cell.toLowerCase(), 'filled');
            } else {
                cellEl.addEventListener('click', () => this.handleMove(index));
            }
            boardEl.appendChild(cellEl);
        });

        this.container.appendChild(boardEl);
    }

    handleMove(index) {
        if (this.gameOver || this.board[index] !== null) return;

        this.board[index] = this.currentPlayer;
        this.renderBoard();

        if (this.checkWin(index, this.currentPlayer)) {
            this.gameOver = true;
            this.updateScore(10);
            this.createGameOverOverlay(`Player ${this.currentPlayer} Wins!`, () => this.restart());
        } else if (!this.board.includes(null)) {
            this.gameOver = true;
            this.createGameOverOverlay('It\'s a Draw!', () => this.restart());
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        }
    }

    checkWin(lastMoveIdx, player) {
        const row = Math.floor(lastMoveIdx / this.size);
        const col = lastMoveIdx % this.size;

        const directions = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal /
            [1, -1]  // Diagonal \
        ];

        for (let [dr, dc] of directions) {
            let count = 1;

            // Check positive direction
            for (let i = 1; i < this.winLength; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r * this.size + c] === player) {
                    count++;
                } else {
                    break;
                }
            }

            // Check negative direction
            for (let i = 1; i < this.winLength; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r >= 0 && r < this.size && c >= 0 && c < this.size && this.board[r * this.size + c] === player) {
                    count++;
                } else {
                    break;
                }
            }

            if (count >= this.winLength) {
                return true;
            }
        }
        return false;
    }
}
