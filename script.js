const gameContainer = document.getElementById('gameContainer');
const paddle = document.getElementById('paddle');
const scoreBoard = document.getElementById('scoreBoard');
const pauseOverlay = document.getElementById('pauseOverlay');

let paddleX = (gameContainer.offsetWidth - paddle.offsetWidth) / 2;
let balls = [];
let score = 0;
let level = 1;
let isPaused = false;
let animationFrameId;
let powerUp;
let obstacles = [];
const ballCount = 1;  // Number of balls

document.addEventListener('mousemove', (event) => {
    const containerRect = gameContainer.getBoundingClientRect();
    paddleX = event.clientX - containerRect.left - paddle.offsetWidth / 2;
    if (paddleX < 0) paddleX = 0;
    if (paddleX > gameContainer.offsetWidth - paddle.offsetWidth) paddleX = gameContainer.offsetWidth - paddle.offsetWidth;
    paddle.style.left = `${paddleX}px`;
});

document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        togglePause();
    }
});

function createBall(type = 'normal') {
    const ball = document.createElement('div');
    ball.classList.add('ball');
    gameContainer.appendChild(ball);

    let speedY = 2 + level;
    let speedX = (Math.random() - 0.5) * 4; // Random initial X speed

    if (type === 'fast') {
        speedY *= 1.5;
        ball.style.backgroundColor = '#00f';
    } else if (type === 'slow') {
        speedY *= 0.5;
        ball.style.backgroundColor = '#ff0';
    } else {
        ball.style.backgroundColor = '#f00';
    }

    const ballObj = {
        element: ball,
        x: Math.random() * (gameContainer.offsetWidth - ball.offsetWidth),
        y: 0,
        speedY: speedY,
        speedX: speedX,
        type: type
    };
    balls.push(ballObj);
}

function createPowerUp() {
    const powerUpElement = document.createElement('div');
    powerUpElement.classList.add('power-up');
    gameContainer.appendChild(powerUpElement);
    powerUp = {
        element: powerUpElement,
        x: Math.random() * (gameContainer.offsetWidth - powerUpElement.offsetWidth),
        y: Math.random() * (gameContainer.offsetHeight - powerUpElement.offsetHeight),
        type: Math.random() > 0.5 ? 'increasePaddle' : 'extraPoints'
    };
    powerUpElement.style.left = `${powerUp.x}px`;
    powerUpElement.style.top = `${powerUp.y}px`;
}

function createObstacle() {
    const obstacleElement = document.createElement('div');
    obstacleElement.classList.add('obstacle');
    gameContainer.appendChild(obstacleElement);
    const obstacle = {
        element: obstacleElement,
        x: Math.random() * (gameContainer.offsetWidth - obstacleElement.offsetWidth),
        y: Math.random() * (gameContainer.offsetHeight / 2)
    };
    obstacles.push(obstacle);
    obstacleElement.style.left = `${obstacle.x}px`;
    obstacleElement.style.top = `${obstacle.y}px`;
}

function gameLoop() {
    if (!isPaused) {
        balls.forEach((ball, index) => {
            ball.y += ball.speedY;
            ball.x += ball.speedX;

            // Ball collision with walls
            if (ball.x <= 0 || ball.x >= gameContainer.offsetWidth - ball.element.offsetWidth) {
                ball.speedX = -ball.speedX;
            }

            // Ball collision with paddle
            if (
                ball.y + ball.element.offsetHeight >= gameContainer.offsetHeight - paddle.offsetHeight &&
                ball.x + ball.element.offsetWidth >= paddleX &&
                ball.x <= paddleX + paddle.offsetWidth
            ) {
                ball.speedY = -ball.speedY;
                score += 10;
                scoreBoard.innerText = `Score: ${score} | Level: ${level}`;
            }

            // Ball hits the bottom
            if (ball.y >= gameContainer.offsetHeight - ball.element.offsetHeight) {
                alert('Game Over!');
                resetGame();
            }

            ball.element.style.top = `${ball.y}px`;
            ball.element.style.left = `${ball.x}px`;

            // Ball collision with obstacles
            obstacles.forEach(obstacle => {
                if (
                    ball.x + ball.element.offsetWidth >= obstacle.x &&
                    ball.x <= obstacle.x + obstacle.element.offsetWidth &&
                    ball.y + ball.element.offsetHeight >= obstacle.y &&
                    ball.y <= obstacle.y + obstacle.element.offsetHeight
                ) {
                    ball.speedY = -ball.speedY;
                }
            });
        });

        // Level up
        if (score >= level * 100) {
            level++;
            scoreBoard.innerText = `Score: ${score} | Level: ${level}`;
            createBall();  // Add new ball on each level up
            if (level % 2 === 0) {
                createObstacle();
            }
        }

        // Power-up collision with paddle
        if (powerUp) {
            if (
                powerUp.y + 20 >= gameContainer.offsetHeight - paddle.offsetHeight &&
                powerUp.x + 20 >= paddleX &&
                powerUp.x <= paddleX + paddle.offsetWidth
            ) {
                if (powerUp.type === 'increasePaddle') {
                    paddle.style.width = '200px';
                    setTimeout(() => {
                        paddle.style.width = '100px';
                    }, 5000);
                } else if (powerUp.type === 'extraPoints') {
                    score += 50;
                    scoreBoard.innerText = `Score: ${score} | Level: ${level}`;
                }
                gameContainer.removeChild(powerUp.element);
                powerUp = null;
            }
        }

        if (!powerUp && Math.random() < 0.01) {
            createPowerUp();
        }
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

function resetGame() {
    balls.forEach(ball => gameContainer.removeChild(ball.element));
    balls = [];
    obstacles.forEach(obstacle => gameContainer.removeChild(obstacle.element));
    obstacles = [];
    score = 0;
    level = 1;
    scoreBoard.innerText = `Score: ${score} | Level: ${level}`;
    for (let i = 0; i < ballCount; i++) {
        createBall();
    }
}

function togglePause() {
    isPaused = !isPaused;
    pauseOverlay.style.visibility = isPaused ? 'visible' : 'hidden';
    if (!isPaused) {
        gameLoop();
    } else {
        cancelAnimationFrame(animationFrameId);
    }
}

resetGame();
gameLoop();
