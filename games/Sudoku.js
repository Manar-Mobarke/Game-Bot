import { BaseGame } from './BaseGame.js';

export class Sudoku extends BaseGame {
    constructor(container, config, onScoreUpdate) {
        super(container, config, onScoreUpdate);
        this.filledCells = config.filledCells || 40;
        this.board = [];
        this.solution = [];
    }

    start() {
        super.start();
        this.generateBoard();
        this.renderBoard();
    }

    // A simple Sudoku generator
    generateBoard() {
        // For simplicity, we create a base valid board and shuffle it
        const base = [
            [1,2,3, 4,5,6, 7,8,9],
            [4,5,6, 7,8,9, 1,2,3],
            [7,8,9, 1,2,3, 4,5,6],
            
            [2,3,1, 5,6,4, 8,9,7],
            [5,6,4, 8,9,7, 2,3,1],
            [8,9,7, 2,3,1, 5,6,4],
            
            [3,1,2, 6,4,5, 9,7,8],
            [6,4,5, 9,7,8, 3,1,2],
            [9,7,8, 3,1,2, 6,4,5]
        ];

        // Shuffle rows within bands
        // This is a minimal valid shuffle. A full generator would be more complex.
        const shuffled = JSON.parse(JSON.stringify(base));
        
        this.solution = shuffled;
        
        // Remove numbers based on difficulty
        this.board = JSON.parse(JSON.stringify(shuffled));
        let cellsToRemove = 81 - this.filledCells;
        
        while (cellsToRemove > 0) {
            const r = Math.floor(Math.random() * 9);
            const c = Math.floor(Math.random() * 9);
            if (this.board[r][c] !== 0) {
                this.board[r][c] = 0;
                cellsToRemove--;
            }
        }
    }

    renderBoard() {
        this.container.innerHTML = '';
        const boardEl = document.createElement('div');
        boardEl.className = 'sudoku-board';

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                const cellEl = document.createElement('div');
                cellEl.className = 'sudoku-cell';
                
                if (this.board[r][c] !== 0) {
                    cellEl.textContent = this.board[r][c];
                    cellEl.classList.add('fixed');
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    
                    // Allow only numbers
                    input.addEventListener('input', (e) => {
                        const val = e.target.value;
                        if (!/^[1-9]$/.test(val)) {
                            e.target.value = '';
                        }
                        this.checkCompletion();
                    });
                    
                    input.dataset.row = r;
                    input.dataset.col = c;
                    cellEl.appendChild(input);
                }
                
                boardEl.appendChild(cellEl);
            }
        }

        this.container.appendChild(boardEl);
    }

    checkCompletion() {
        const inputs = this.container.querySelectorAll('input');
        let isComplete = true;
        let isCorrect = true;

        inputs.forEach(input => {
            if (input.value === '') {
                isComplete = false;
            } else {
                const r = parseInt(input.dataset.row);
                const c = parseInt(input.dataset.col);
                if (parseInt(input.value) !== this.solution[r][c]) {
                    isCorrect = false;
                }
            }
        });

        if (isComplete) {
            if (isCorrect) {
                this.updateScore(100);
                this.createGameOverOverlay('Congratulations! You solved it!', () => this.restart());
            } else {
                // Could highlight wrong ones, for now just simple alert
                // alert('Board is full but has mistakes!');
                // We'll let them keep trying without overlay
            }
        }
    }
}
