class Bird {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = canvas.width / 3;
        this.y = canvas.height / 2;
        this.radius = 15;
        this.velocity = 0;
        this.gravity = 0.25;
        this.lift = -6;
    }

    update() {
        this.velocity += this.gravity;
        this.y += this.velocity;
    }

    jump() {
        this.velocity = this.lift;
    }

    draw(ctx) {
        ctx.save();
        
        // 飞机主体 - 银灰色
        ctx.fillStyle = '#808080';
        ctx.beginPath();
        // 机身
        ctx.moveTo(this.x - 20, this.y);
        ctx.lineTo(this.x + 20, this.y);
        ctx.lineTo(this.x + 15, this.y + 5);
        ctx.lineTo(this.x - 15, this.y + 5);
        ctx.closePath();
        ctx.fill();

        // 机翼 - 深灰色
        ctx.fillStyle = '#606060';
        ctx.beginPath();
        // 主翼
        ctx.moveTo(this.x - 15, this.y);
        ctx.lineTo(this.x + 5, this.y);
        ctx.lineTo(this.x, this.y - 15);
        ctx.lineTo(this.x - 20, this.y - 10);
        ctx.closePath();
        ctx.fill();

        // 尾翼
        ctx.beginPath();
        ctx.moveTo(this.x - 15, this.y);
        ctx.lineTo(this.x - 20, this.y - 8);
        ctx.lineTo(this.x - 15, this.y - 8);
        ctx.closePath();
        ctx.fill();

        // 驾驶舱 - 深蓝色
        ctx.fillStyle = '#000080';
        ctx.beginPath();
        ctx.arc(this.x + 5, this.y - 2, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

class Pipe {
    constructor(canvas) {
        this.canvas = canvas;
        this.width = 50;
        this.gap = 150;
        this.x = canvas.width;
        this.topHeight = Math.random() * (canvas.height - this.gap - 100) + 50;
        this.bottomY = this.topHeight + this.gap;
        this.speed = 2;
    }

    update() {
        this.x -= this.speed;
    }

    draw(ctx) {
        ctx.fillStyle = '#00FF00';
        // 上方管道
        ctx.fillRect(this.x, 0, this.width, this.topHeight);
        // 下方管道
        ctx.fillRect(this.x, this.bottomY, this.width, this.canvas.height - this.bottomY);
    }

    offscreen() {
        return this.x + this.width < 0;
    }

    hits(bird) {
        // 调整碰撞箱大小
        const hitBox = {
            width: 40,  // 飞机宽度
            height: 20  // 飞机高度
        };
        
        if (bird.y - hitBox.height/2 < this.topHeight || 
            bird.y + hitBox.height/2 > this.bottomY) {
            if (bird.x + hitBox.width/2 > this.x && 
                bird.x - hitBox.width/2 < this.x + this.width) {
                return true;
            }
        }
        return false;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 400;
        this.canvas.height = 600;
        
        this.bird = new Bird(this.canvas);
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        this.frameCount = 0;

        this.scoreElement = document.getElementById('score');
        this.gameOverElement = document.getElementById('gameOver');

        this.setupEventListeners();
        this.gameLoop();
    }

    setupEventListeners() {
        const handleClick = () => {
            if (this.gameOver) {
                this.reset();
            } else {
                this.bird.jump();
            }
        };

        // 支持触摸和鼠标点击
        this.canvas.addEventListener('click', handleClick);
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleClick();
        });
    }

    reset() {
        this.bird = new Bird(this.canvas);
        this.pipes = [];
        this.score = 0;
        this.gameOver = false;
        this.frameCount = 0;
        this.scoreElement.textContent = `得分: ${this.score}`;
        this.gameOverElement.classList.add('hidden');
    }

    update() {
        if (this.gameOver) return;

        this.bird.update();

        // 每120帧添加新管道
        this.frameCount++;
        if (this.frameCount % 120 === 0) {
            this.pipes.push(new Pipe(this.canvas));
        }

        // 更新管道
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            this.pipes[i].update();

            // 检查碰撞
            if (this.pipes[i].hits(this.bird)) {
                this.gameOver = true;
            }

            // 计分
            if (this.pipes[i].x + this.pipes[i].width < this.bird.x && !this.pipes[i].scored) {
                this.score++;
                this.pipes[i].scored = true;
                this.scoreElement.textContent = `得分: ${this.score}`;
            }

            // 移除屏幕外的管道
            if (this.pipes[i].offscreen()) {
                this.pipes.splice(i, 1);
            }
        }

        // 检查是否撞到地面或天花板
        if (this.bird.y > this.canvas.height || this.bird.y < 0) {
            this.gameOver = true;
        }

        if (this.gameOver) {
            this.gameOverElement.classList.remove('hidden');
        }
    }

    draw() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制管道
        this.pipes.forEach(pipe => pipe.draw(this.ctx));

        // 绘制小鸟
        this.bird.draw(this.ctx);
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 当页面加载完成后启动游戏
window.onload = () => {
    new Game();
}; 