export class GameRenderer {
    static clearContainer(container) {
        container.innerHTML = '';
    }

    static createGridBoard(container, columns, gap, padding, bgColor, borderRadius, shadow) {
        const boardEl = document.createElement('div');
        boardEl.style.display = 'grid';
        boardEl.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        if (gap) boardEl.style.gap = gap;
        if (padding) boardEl.style.padding = padding;
        if (bgColor) boardEl.style.background = bgColor;
        if (borderRadius) boardEl.style.borderRadius = borderRadius;
        if (shadow) boardEl.style.boxShadow = shadow;
        container.appendChild(boardEl);
        return boardEl;
    }

    static createCanvas(container, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        container.appendChild(canvas);
        return canvas;
    }

    static createGameOverOverlay(container, message, onRestart) {
        const overlay = document.createElement('div');
        overlay.className = 'game-over-overlay';
        
        const text = document.createElement('h2');
        text.textContent = message;
        
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary';
        btn.textContent = 'Play Again';
        btn.onclick = () => {
            overlay.remove();
            onRestart();
        };

        overlay.appendChild(text);
        overlay.appendChild(btn);
        container.appendChild(overlay);
        return overlay;
    }

    static updateScore(scoreElement, score) {
        if (scoreElement) {
            scoreElement.textContent = score;
        }
    }
}
