export default class EightBallGame {
    constructor() {
        this.numbered_balls_on_table = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
        this.turn = 'player1';
        this.sides = {
            'player1': '?',
            'player2': '?'
        };
        this.pocketingOccurred = false;

        this.state = 'notstarted';
        this.timer = 0;
        this.ticker = undefined;
        gui.setupGameHud();
        setTimeout(this.startTurn, 2000);
    }
}

EightBallGame.prototype.startTurn = function (gui) {
    if (this.state == 'gameover') {
    return;
    }
    // enable movement
    this.timer = 30;
    this.state = 'turn';
    gui.updateTurn(this.turn);
    gui.updateBalls(this.numbered_balls_on_table, this.sides.player1, this.sides.player2);

    this.tickTimer();
}

EightBallGame.prototype.whiteBallEnteredHole = function (gui) {
    gui.log("White ball pocketed by " + this.turn + "!");
}

EightBallGame.prototype.coloredBallEnteredHole = function (name, gui) {
    if (typeof name === 'undefined') return;
    var ballno = 0;
    for (var i = 0; i < this.numbered_balls_on_table.length; i++) {
        if (name == this.numbered_balls_on_table[i] + 'ball') {
            ballno = this.numbered_balls_on_table[i];
            this.numbered_balls_on_table.splice(i, 1);
            break;
        }
    }
    if (ballno == 0) {
        return;
    }

    if (ballno == 8) {
        if (this.numbered_balls_on_table.length > 1) {
            gui.log("Game over! 8 ball pocketed too early by " + this.turn);
            this.turn = this.turn == 'player1' ? 'player2': 'player1';
        }

        this.pocketingOccurred = true;

        // Win!
        this.endGame();
    } else {
        if (this.sides.player1 == '?' || this.sides.player2 == '?') {
            this.sides[this.turn] = ballno < 8 ? 'solid' : 'striped';
            this.sides[this.turn == 'player1' ? 'player2' : 'player1'] = ballno > 8 ? 'solid' : 'striped';
            this.pocketingOccurred = true;
        } else {
            if ((this.sides[this.turn] == 'solid' && ballno < 8) || (this.sides[this.turn] == 'striped' && ballno > 8)) {
            // another turn
                this.pocketingOccurred = true;
            } else {
                this.pocketingOccurred = false;
                gui.log(this.turn + " pocketed opponent's ball!");
            }
        }
    }
}

EightBallGame.prototype.tickTimer = function (gui) {
    gui.UpdateTimer(this.timer);
    if (this.timer == 0) {
        gui.log(this.turn + " ran out of time");
        this.state = "outoftime";
        this.switchSides();
    } else {
        this.timer--;
        this.ticker = setTimeout(this.tickTimer, 1000);
    }
}

EightBallGame.prototype.switchSides = function () {
    this.turn = this.turn == 'player1' ? 'player2': 'player1';

    setTimeout(this.startTurn, 1000);
}

EightBallGame.prototype.endGame = function (gui) {
    this.state = 'gameover';
    var winner = this.turn == 'player1' ? 'Player 1' : 'Player 2';
    clearTimeout(this.ticker);
    gui.showEndGame(winner);
}

EightBallGame.prototype.hitButtonClicked = function (strength, game) {
    if (game.balls[0].rigidBody.sleepState == CANNON.Body.SLEEPING && this.state == 'turn') {
        game.ballHit(strength);
        clearTimeout(this.ticker);
        this.state = 'turnwaiting';
        var x = setInterval(function() {
            if (game.balls[0].rigidBody.sleepState != CANNON.Body.SLEEPING) return;
            for (var i=1;i<game.balls.length;i++) {
                if (game.balls[i].rigidBody.sleepState != CANNON.Body.SLEEPING && this.numbered_balls_on_table.indexOf(Number(game.balls[i].name.split('ball')[0])) > -1) {
                    return;
                }
            }

            if (this.pocketingOccurred) {
                setTimeout(this.startTurn, 1000);
            } else {
                this.switchSides();
            }

            this.pocketingOccurred = false;

            clearInterval(x);
        }, 30);
    }
}