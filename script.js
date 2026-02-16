// 五子棋游戏逻辑
class GomokuGame {
    constructor() {
        this.boardSize = 15;
        this.cellSize = 30;
        this.chessRadius = 12;
        
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.currentPlayer = 1; // 1: 黑棋, 2: 白棋
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.gameOver = false;
        this.moveHistory = [];
        
        this.initCanvas();
        this.bindEvents();
        this.drawBoard();
    }
    
    initCanvas() {
        // 设置画布大小以适应不同屏幕
        const containerSize = Math.min(window.innerWidth * 0.9, 500);
        this.canvas.width = containerSize;
        this.canvas.height = containerSize;
        
        // 重新计算单元格大小
        this.cellSize = containerSize / (this.boardSize - 1);
        this.chessRadius = this.cellSize * 0.4;
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 将像素坐标转换为棋盘坐标
            const col = Math.round(x / this.cellSize);
            const row = Math.round(y / this.cellSize);
            
            // 检查是否在棋盘范围内且位置为空
            if (row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize && this.board[row][col] === 0) {
                this.makeMove(row, col);
            }
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });
    }
    
    makeMove(row, col) {
        // 记录移动历史
        this.moveHistory.push({row, col, player: this.currentPlayer});
        
        // 放置棋子
        this.board[row][col] = this.currentPlayer;
        this.drawChess(row, col, this.currentPlayer);
        
        // 检查是否获胜
        if (this.checkWin(row, col)) {
            this.gameOver = true;
            const winner = this.currentPlayer === 1 ? '黑棋' : '白棋';
            document.getElementById('game-status').textContent = `${winner}获胜！`;
            document.getElementById('current-player').textContent = '游戏结束';
        } else {
            // 切换玩家
            this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
            document.getElementById('current-player').textContent = this.currentPlayer === 1 ? '黑棋' : '白棋';
        }
    }
    
    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver) return;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.row][lastMove.col] = 0;
        
        // 重绘整个棋盘
        this.drawBoard();
        this.redrawAllChess();
        
        // 切换回之前的玩家
        this.currentPlayer = lastMove.player;
        document.getElementById('current-player').textContent = this.currentPlayer === 1 ? '黑棋' : '白棋';
        
        // 清除游戏状态
        this.gameOver = false;
        document.getElementById('game-status').textContent = '';
    }
    
    redrawAllChess() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== 0) {
                    this.drawChess(i, j, this.board[i][j]);
                }
            }
        }
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        const directions = [
            [1, 0],   // 水平
            [0, 1],   // 垂直
            [1, 1],   // 对角线 \
            [1, -1]   // 对角线 /
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1; // 当前棋子
            
            // 正方向计数
            for (let i = 1; i <= 4; i++) {
                const r = row + i * dx;
                const c = col + i * dy;
                
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反方向计数
            for (let i = 1; i <= 4; i++) {
                const r = row - i * dx;
                const c = col - i * dy;
                
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘背景
        this.ctx.fillStyle = '#dcb35c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            // 横线
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize / 2, this.cellSize * i + this.cellSize / 2);
            this.ctx.lineTo(this.canvas.width - this.cellSize / 2, this.cellSize * i + this.cellSize / 2);
            this.ctx.stroke();
            
            // 竖线
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize * i + this.cellSize / 2, this.cellSize / 2);
            this.ctx.lineTo(this.cellSize * i + this.cellSize / 2, this.canvas.height - this.cellSize / 2);
            this.ctx.stroke();
        }
        
        // 绘制天元和星位
        this.drawStars();
    }
    
    drawStars() {
        // 天元位置
        const center = Math.floor(this.boardSize / 2);
        this.drawStar(center, center);
        
        // 四个角落的星位
        const positions = [
            [3, 3], [3, 11], [11, 3], [11, 11]
        ];
        
        for (const [row, col] of positions) {
            this.drawStar(row, col);
        }
    }
    
    drawStar(row, col) {
        this.ctx.fillStyle = '#333';
        this.ctx.beginPath();
        this.ctx.arc(
            col * this.cellSize + this.cellSize / 2,
            row * this.cellSize + this.cellSize / 2,
            3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
    }
    
    drawChess(row, col, player) {
        const x = col * this.cellSize + this.cellSize / 2;
        const y = row * this.cellSize + this.cellSize / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, this.chessRadius, 0, Math.PI * 2);
        
        // 渐变效果
        const gradient = this.ctx.createRadialGradient(
            x - this.chessRadius/3, 
            y - this.chessRadius/3, 
            1,
            x, 
            y, 
            this.chessRadius
        );
        
        if (player === 1) { // 黑棋
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else { // 白棋
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ccc');
            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
        }
        
        this.ctx.fill();
        if (player === 2) { // 白棋边框
            this.ctx.stroke();
        }
    }
    
    restartGame() {
        this.currentPlayer = 1;
        this.board = Array(this.boardSize).fill().map(() => Array(this.boardSize).fill(0));
        this.gameOver = false;
        this.moveHistory = [];
        
        document.getElementById('current-player').textContent = '黑棋';
        document.getElementById('game-status').textContent = '';
        
        this.drawBoard();
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new GomokuGame();
    
    // 响应式调整
    window.addEventListener('resize', () => {
        setTimeout(() => {
            const game = new GomokuGame();
        }, 100);
    });
});