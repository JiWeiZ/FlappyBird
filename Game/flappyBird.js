var game = {
    speed: 30, //游戏进行的速度，每秒刷新多少次
    moveSpeed: 4, //管道和地面的移动速度
    screenWidth: 384, //屏幕宽度
    screenHeight: 512, //屏幕高度
    backgroundHeight: 448, //背景高度
    pipeInterval: 189, //左右管道的间距
    groundInterval: 18,
    numOfGrounds: null,
    state: 0,
    over: function() {
        playSound(sound.hit, "../sounds/hit.mp3");
        playSound(sound.dead, "../sounds/die.mp3");
        this.state = 2;
        score.update();
    },
    restart: function() {
        ctx.font = "bold 40px HarlemNights"; //绘制字体还原
        ctx.fillStyle = "#FFFFFF";
        bird.X = 165;
        bird.Y = 210;
        bird.vy = 0;
        score.value = 0;
        game.state = 0;
        movingPipes.init();
    }
}

game.numOfGrounds = Math.ceil(game.screenWidth / game.groundInterval) + 1;

var bird = {
    width: 46, //小鸟宽度
    height: 32, //小鸟高度
    X: 165, //小鸟横坐标
    Y: 210, //小鸟纵坐标
    vy: 0, //初始下落速度
    jumpVelocity: 9, //向上跳跃的高度
    gravity: 1, //下落加速度
    state: 0, //小鸟的状态，用于控制翅膀的摆动
    jump: function() {
        this.vy = -this.jumpVelocity;
    },
    fall: function() {
        this.vy += this.gravity;
        this.Y += this.vy;
    },
    flap: function() {
        if (this.state == 0 || this.state == 1 || this.state == 2) {
            ctx.drawImage(birdImg, 0, 0, birdImg.width / 3, birdImg.height, bird.X, bird.Y, bird.width, bird.height);
            this.state++;
        } else if (this.state == 3 || this.state == 4 || this.state == 5) {
            ctx.drawImage(birdImg, birdImg.width / 3, 0, birdImg.width / 3, birdImg.height, bird.X, bird.Y, bird.width, bird.height);
            this.state++;
        } else if (this.state == 6 || this.state == 7 || this.state == 8) {
            ctx.drawImage(birdImg, birdImg.width * 2 / 3, 0, birdImg.width / 3, birdImg.height, bird.X, bird.Y, bird.width, bird.height);
            this.state++;
            if (this.state == 8) { this.state = 0; }
        }
    },
    draw: function() {
        switch (game.state) {
            case 0:
                this.flap();
                break;
            case 1:
                ctx.save();
                ctx.translate(bird.X + bird.width / 2, bird.Y + bird.height / 2);
                if (bird.vy <= 6) {
                    ctx.rotate(-Math.PI / 6);
                } else if (bird.vy > 6 && bird.vy <= 10) {
                    ctx.rotate(Math.PI / 6);
                } else if (bird.vy > 10 && bird.vy <= 14) {
                    ctx.rotate(Math.PI / 3);
                } else if (bird.vy > 14) {
                    ctx.rotate(Math.PI / 2);
                }
                ctx.translate(-bird.X - bird.width / 2, -bird.Y - bird.height / 2);
                this.flap();
                ctx.restore();
                break;
            case 2:
                ctx.save();
                ctx.translate(bird.X + bird.width / 2, bird.Y + bird.height / 2);
                ctx.rotate(Math.PI / 2);
                ctx.translate(-bird.X - bird.width / 2, -bird.Y - bird.height / 2);
                ctx.drawImage(birdImg, birdImg.width / 3, 0, birdImg.width / 3, birdImg.height, bird.X, bird.Y, bird.width, bird.height);
                ctx.restore();
                break;
        }
    },
    check: function() {
        for (let i = 0; i < 2; i++) {
            if (this.X + this.width > pipes[i].location && this.X + this.width < pipes[i].location + pipes[i].width + this.width) {
                if (this.Y < pipes[i].heightDown || this.Y + this.height > game.backgroundHeight - pipes[i].heightUp) {
                    game.over();
                }
            }
        }
        if (this.Y + this.height >= game.backgroundHeight) {
            game.over();
        }
        if (this.X >= pipes[0].location + pipes[0].width - game.moveSpeed / 2 &&
            this.X < pipes[0].location + pipes[0].width + game.moveSpeed / 2) {
            score.value++;
            playSound(sound.score, "../sounds/point.mp3");
        }
    }
}

var Pipe = function(location) {
    var pipeSpan = 100; //上下管道的间距
    this.location = location; //管道X轴的位置
    this.width = 69; //管道宽度
    this.heightUp = (function() { return Math.ceil(Math.random() * 216 + 56); })(); //下方管道的高度，从56到272
    this.heightDown = game.backgroundHeight - this.heightUp - pipeSpan; //上方管道的高度
}

Pipe.prototype = {
    constructor: Pipe,
    draw: function() {
        locationYUp = game.backgroundHeight - this.heightUp; //下方管道的Y轴坐标
        locationYDown = 0; //上方管道的Y轴坐标

        // 绘制下方的管道
        ctx.drawImage(
            pipeUpImg, //管道的图片
            0, //源图片起点横坐标
            0, //源图片起点纵坐标
            pipeUpImg.width, //源图片截取宽度
            this.heightUp * 2, //源图片截取高度，因为游戏中的管道缩小了一半，所以乘2
            this.location, //管道的横坐标
            locationYUp, //下方管道的纵坐标
            this.width, //管道宽度
            this.heightUp); //下方管道高度

        // 绘制上方的管道
        ctx.drawImage(
            pipeDownImg,
            0,
            pipeDownImg.height - this.heightDown * 2,
            pipeDownImg.width,
            this.heightDown * 2,
            this.location,
            locationYDown,
            this.width,
            this.heightDown);
    }
}

var movingPipes = {
    init: function() {
        pipes = [];
        for (let i = 0; i < 3; i++) {
            var pipe = new Pipe(game.screenWidth + i * game.pipeInterval);
            pipes.push(pipe);
        }
    },
    draw: function() {
        if (pipes[0].location <= -pipes[0].width) {
            var pipe = new Pipe(pipes[2].location + game.pipeInterval);
            pipes.shift(pipes[0]);
            pipes.push(pipe);
        }
        for (let i = 0; i < 3; i++) {
            pipes[i].location -= game.moveSpeed;
            pipes[i].draw();
        }
    },
    drawEnd: function() {
        for (let i = 0; i < 3; i++) {
            pipes[i].draw();
        }
    }
}

var Ground = function(location) {
    this.location = location
    this.width = 18;
    this.height = 64;
}

Ground.prototype = {
    constructor: Ground,
    draw: function() {
        ctx.drawImage(groundImg, 0, 0, groundImg.width, groundImg.height, this.location, game.backgroundHeight, this.width, this.height);
    }
}

var movingGrounds = {
    init: function() {
        grounds = [];
        for (let i = 0; i < game.numOfGrounds; i++) {
            var ground = new Ground(i * game.groundInterval);
            grounds.push(ground);
        }
    },
    draw: function() {
        if (grounds[0].location <= -grounds[0].width) {
            var ground = new Ground(grounds[game.numOfGrounds - 1].location + game.groundInterval);
            grounds.shift(grounds[0]);
            grounds.push(ground);
        }
        for (let i = 0; i < game.numOfGrounds; i++) {
            grounds[i].location -= game.moveSpeed;
            grounds[i].draw();
        }
    },
    drawEnd: function() {
        for (let i = 0; i < game.numOfGrounds; i++) {
            grounds[i].draw();
        }
    }
}

var tip = {
    draw: function() {
        ctx.drawImage(tipImg, bird.X - 60, bird.Y + 45, tipImg.width / 2, tipImg.height / 2);
    }
}

var board = {
    draw: function() {
        ctx.drawImage(boardImg, 50, 110, boardImg.width / 2, boardImg.height / 2);
        ctx.fillText(score.value, 200, 225);
        ctx.fillText(score.highest, 200, 275);
    }
}

var score = {
    value: 0,
    highest: 0,
    draw: function() {
        ctx.fillText(this.value, 20, 50);
    },
    update: function() {
        if (this.value > this.highest) {
            this.highest = this.value;
        }
    }
}

var sound = {};
sound.fly = document.querySelector('#flysound');
sound.score = document.querySelector('#scoresound');
sound.hit = document.querySelector('#hitsound');
sound.dead = document.querySelector('#deadsound');
sound.swooshing = document.querySelector('#swooshingsound');

function playSound(sound, src) {
    if (src != null && typeof sound != undefined) {
        sound.src = src;
    }
}

function init() {
    canvas = document.querySelector("canvas");
    ctx = canvas.getContext("2d"); //初始化canvas

    birdImg = new Image();
    birdImg.src = "../images/bird.png";

    pipeUpImg = new Image();
    pipeUpImg.src = "../images/pipeUp.png";

    pipeDownImg = new Image();
    pipeDownImg.src = "../images/pipeDown.png";

    groundImg = new Image();
    groundImg.src = "../images/ground.png";

    tipImg = new Image();
    tipImg.src = "../images/space_tip.png"

    boardImg = new Image();
    boardImg.src = "../images/scoreboard.png"

    movingPipes.init();
    movingGrounds.init();
    window.addEventListener("keydown", keyDownEvent);
    canvas.addEventListener("mousedown", mouseDownEvent);
    canvas.addEventListener("mousemove", mouseMoveEvent);
    setInterval(run, 1000 / game.speed);
}

function run() {
    if (game.state == 0) {
        game.restart();
        ctx.clearRect(0, 0, game.screenWidth, game.screenHeight);
        movingGrounds.draw();
        bird.draw();
        tip.draw();
    } else if (game.state == 1) {
        ctx.clearRect(0, 0, game.screenWidth, game.screenHeight);
        ctx.font = "bold 40px HarlemNights"; //绘制字体还原
        ctx.fillStyle = "#FFFFFF";
        movingGrounds.draw();
        movingPipes.draw();
        bird.fall();
        bird.draw();
        bird.check();
        score.draw();
    } else if (game.state == 2) {
        if (bird.Y + bird.height < game.backgroundHeight) {
            bird.fall();
        } else {
            bird.vy = 0;
        }
        ctx.clearRect(0, 0, game.screenWidth, game.screenHeight);
        ctx.font = "bold 40px HarlemNights"; //绘制字体还原
        ctx.fillStyle = "#000";
        movingGrounds.drawEnd();
        movingPipes.drawEnd();
        bird.draw();
        board.draw();
    }
}

function keyDownEvent() {
    if (game.state == 0) {
        playSound(sound.swooshing, "../sounds/swooshing.mp3");
        game.state = 1;
        bird.jump();
    } else if (game.state == 1) {
        bird.jump();
        playSound(sound.swooshing, "../sounds/swooshing.mp3");
    }
}

function mouseMoveEvent(ev) {
    var mx;
    var my;
    if (ev.layerX) { //ff
        mx = ev.layerX;
        my = ev.layerY;
    } else if (ev.offsetX) { //opera
        mx = ev.layerX;
        my = ev.layerY;
    }
    if (game.state == 0) {
        canvas.classList.remove("pointer");
        canvas.classList.add("arrow");
        if (mx > 138 && mx < 242 && my > 340 && my < 375) {
            canvas.classList.remove("arrow");
            canvas.classList.add("pointer");
        } else {
            canvas.classList.remove("pointer");
            canvas.classList.add("arrow");
        }
    } else if (game.state == 1) {
        canvas.classList.remove("pointer");
        canvas.classList.add("arrow");
    } else if (game.state == 2) {
        if (mx > 51 + 14 && mx < 51 + 89 && my > 318 && my < 356) {
            canvas.classList.remove("arrow");
            canvas.classList.add("pointer");
        } else {
            canvas.classList.remove("pointer");
            canvas.classList.add("arrow");
        }
    }
}

function mouseDownEvent(ev) {
    var mx;
    var my;
    if (ev.layerX) { //ff
        mx = ev.layerX;
        my = ev.layerY;
    } else if (ev.offsetX) { //opera
        mx = ev.layerX;
        my = ev.layerY;
    }
    if (game.state == 0) {
        bird.jump();
        playSound(sound.swooshing, "../sounds/swooshing.mp3");
        game.state = 1;
    } else if (game.state == 1) {
        bird.jump();
        playSound(sound.swooshing, "../sounds/swooshing.mp3");
    } else if (game.state == 2) {
        if (mx > 51 + 14 && mx < 51 + 89 && my > 318 && my < 356) {
            game.restart();
            playSound(sound.swooshing, "../sounds/swooshing.mp3");
        }
    }
}

window.onload = init();