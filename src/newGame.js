
import { spawnFood } from './food.js';
import { Snake } from './snake.js';
import { Population } from './ai-nn.js';



export default function newGame(game) {

    // Clear / reset stuff
    game.state.gameOver = false;
    game.state.firstTurn = true;
    game.foodArray = [];
    game.snakes = [];
    game.results.winner = null;
    game.results.draw = false;
    game.scoresNeverNeedDrawing = false;

    // Create the first bit of food. Put in switch (gameMode) if >1 food is needed.
    spawnFood(game);

    // Create new snakes based off the game mode
    switch (game.settings.gameMode.toLowerCase()) {

        /* === GAMEMODE EXAMPLE === //
        case "name of game mode" :
            game.snakes = [
                new Snake({
                    name:       // Name of the snake (shown on end screen).
                    color:      // CSS color string (default "black").
                    direction:  // NESW starting orientation (default 'S').
                    speed:      // Game speed number. Higher = slower. (default 200).
                    controls:   // Array can include ["arrows", "IKJL", "WASD", "touch"].
                    coords:     // REQUIRED array of {x,y} of head -> tail segments.
                    ai: {       // Default ai specified with empty object {}, or options:
                        lazy,          // Don't bother to go to far food? (Default false).
                        suicideOnWin,  // Suicide when it knows it'll win? (Default true).
                        avoidance = {  // Prefer to turn away from... (default all true):
                            walls, snakes, tubes
                        }
                    }
                })
            ];
        break;
        // === END OF EXAMPLE === */

        case "single player" :
            game.snakes = [
                new Snake({
                    name: "Player 1",
                    color: "black",
                    controls: ["arrows", "WASD", "touch"],
                    coords: [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}]
                })
            ];
        break;

        case "single player vs ai" :
            game.snakes = [
                new Snake({
                    name: "Player 1",
                    color: "black",
                    controls: ["arrows", "WASD", "touch"],
                    coords: [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}]
                }),
                new Snake({
                    name: "AI",
                    color: "purple",
                    ai: {},  // Default AI requires an object but no arguments.
                    coords: [{x: 20, y: 7}, {x: 20, y: 6}, {x: 20, y: 5}]
                })
            ];
        break;

        case "two player" :
            game.snakes = [
                new Snake({
                    name: "Player 1",
                    color: "black",
                    controls: ["WASD"],
                    coords: [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}]
                }),
                new Snake({
                    name: "Player 2",
                    color: "purple",
                    controls: ["arrows"],
                    coords: [{x: 20, y: 7}, {x: 20, y: 6}, {x: 20, y: 5}]
                })
            ];
        break;

        case "three player" :
            game.snakes = [
                new Snake({
                    name: "Player 1",
                    color: "black",
                    controls: ["WASD"],
                    coords: [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}]
                }),
                new Snake({
                    name: "Player 2",
                    color: "purple",
                    controls: ["IJKL"],
                    coords: [{x: 15, y: 7}, {x: 15, y: 6}, {x: 15, y: 5}]
                }),
                new Snake({
                    name: "Player 3",
                    color: "darkBlue",
                    controls: ["arrows"],
                    coords: [{x: 20, y: 7}, {x: 20, y: 6}, {x: 20, y: 5}]
                })
            ];
        break;

        case "ai vs ai" :
            game.snakes = [
                new Snake({
                    name: "Regular AI",
                    color: "black",
                    speed: 20,
                    coords: [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}],
                    ai: {}
                }),
                new Snake({
                    name: "Lazy AI",
                    color: "purple",
                    speed: 20,
                    coords: [{x: 20, y: 7}, {x: 20, y: 6}, {x: 20, y: 5}],
                    ai: {lazy: true}
                })
            ];
        break;

        case "crazy ai" :
        // Crazy lots of snakes
            for (var s = 1; s <= 40; s++) {
                game.snakes.push(new Snake({
                    name: "AI " + s,
                    color: '#'+(Math.random() * 0xFFFFFF << 0).toString(16),
                    speed: 20,
                    coords: [{
                        x: Math.floor((Math.random() * 26) + 2),
                        y: Math.floor((Math.random() * 26) + 2)
                    }],
                    ai: {suicideOnWin: false}
                }));
            }
            game.scoresNeverNeedDrawing = true;
        break;
            
        case "neuroevolution ai" :
            game.settings.autoRepeat = true;
            //game.settings.skipRender = true;
            game.ai = game.ai || {};
            game.ai.population = game.ai.population || new Population();
            game.ai.popIndexA = game.ai.popIndexA || 0;
            game.ai.popIndexB = game.ai.popIndexB || 0;
            if (game.ai.popIndexB >= game.ai.population.chromosomes.length) {
                game.ai.popIndexA += 1;
                game.ai.popIndexB = 0;
            }
            if (game.ai.popIndexA >= game.ai.population.chromosomes.length) {
                // Training round over
                game.ai.popIndexA = 0;
                game.ai.popIndexB = 0;
            }
            /*
            let g = game.ai.population.genCounter,
                a = game.ai.popIndexA,
                b = game.ai.popIndexB;
            console.log("Generation: " + g + " | A: " + a + " | B: " + b);
            */
            let chromoA = game.ai.population.chromosomes[game.ai.popIndexA];
            let chromoB = game.ai.population.chromosomes[game.ai.popIndexB];
            game.snakes = [
                new Snake({
                    color: chromoA.color,
                    ai: {chromosome: chromoA},
                    speed: 0,
                    coords: [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}]
                }),
                new Snake({
                    color: chromoB.color,
                    ai: {chromosome: chromoB},
                    speed: 0,
                    coords: [{x: 20, y: 7}, {x: 20, y: 6}, {x: 20, y: 5}]
                })
            ];
            game.ai.popIndexB++;
            game.scoresNeverNeedDrawing = true;
        break;

        default: console.error(
            "There is no \"" + game.settings.gameMode + "\" game mode"
        );

    }

    game.state.onlyAI = true;
    game.snakes.forEach(function(snake) {
       if (!snake.ai) {
           game.state.onlyAI = false;
       }
    });

    if (game.highScores[game.settings.gameMode] === undefined) {
        game.highScores[game.settings.gameMode] = 0;
        localStorage.setItem("snakeHighScores", JSON.stringify(game.highScores));
    }

    game.updateInterval = 1;
    if (typeof game.gameLoop !== "undefined") {
        clearInterval(game.gameLoop);
    }
    game.gameLoop = setInterval(game.mainLoopFunc, 1);

}
