
import { spawnFood } from './food.js';
import { Snake } from './snake.js';



export default function newGame(game) {

    var s, name, randomStart; // Variables for dynamic snake generation.

    // Clear / reset stuff
    game.state.gameOver = false;
    game.foodArray = [];
    game.snakes = [];
    game.results.winner = null;
    game.results.draw = false;

    // Create the first bit of food/s. Could be put in switch (gameMode) if more food is needed.
    spawnFood(game);

    // Create new snakes based off the game mode
    switch (game.settings.gameMode) {

        /*** EXAMPLE OF A GAMEMODE ***
        case "name of game mode" :
            snakes = [            // Create array of snakes
                new Snake(
                    "name string",    // Must be "AI 1" or "AI 2" for win recording.
                    "color string",   // Can be any valid CSS color format. null = black.
                    speed int,        // Useful for testing AI. Smaller number = slower.
                    {ai parameters},  // null = {difficulty: "no AI"}.
                    "AI type string",  OR  ["array", "of", "control", "strings"],
                    'direction char', // The starting direction N/E/S/W. Make AWAY from body.
                    [{x: int, y: int}, {x: int, y: int}] // Head coord then body coords.
                )
            ];
        break;
        *** END OF EXAMPLE ***/

        case "singleplayerVsAI" :
            game.snakes = [
                new Snake(
                    "Player 1",
                    null,
                    200,
                    null,
                    ["arrows", "WASD", "touch"],
                    'S',
                    [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}]
                ),
                new Snake(
                    "AI",
                    "purple",
                    200,
                    {avoidance: {walls: true, snakes: true, tubes: true}, lazy: false, suicideOnWin: true},
                    "Normal AI",
                    'S',
                    [{x: 20, y: 7}, {x: 20, y: 6}, {x: 20, y: 5}]
                )
            ];
        break;

        case "2 player" :
            game.snakes = [
                new Snake(
                    "Player 1",
                    null,
                    200,
                    null,
                    ["WASD"],
                    'S',
                    [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}]
                ),
                new Snake(
                    "Player 2",
                    "purple",
                    200,
                    null,
                    ["arrows"],
                    'S',
                    [{x: 20, y: 7}, {x: 20, y: 6}, {x: 20, y: 5}]
                )
            ];
        break;

        case "3 player" :
            game.snakes = [
                new Snake(
                    "Black",
                    null,
                    200,
                    null,
                    ["WASD"],
                    'S',
                    [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}]
                ),
                new Snake(
                    "Purple",
                    "purple",
                    200,
                    null,
                    ["IJKL"],
                    'S',
                    [{x: 15, y: 7}, {x: 15, y: 6}, {x: 15, y: 5}]
                ),
                new Snake(
                    "Blue",
                    "darkBlue",
                    200,
                    null,
                    ["arrows"],
                    'S',
                    [{x: 20, y: 7}, {x: 20, y: 6}, {x: 20, y: 5}]
                )
            ];
        break;

        case "2 AI" :
            game.snakes = [
                new Snake(
                    "AI 1",
                    null,
                    20,
                    {avoidance: {walls: true, snakes: true, tubes: false}, lazy: false, suicideOnWin: true},
                    "Normal AI",
                    'S',
                    [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}]
                ),
                new Snake(
                    "AI 2",
                    "purple",
                    20,
                    {avoidance: {walls: true, snakes: true, tubes: true}, lazy: true, suicideOnWin: true},
                    "Lazy AI",
                    'S',
                    [{x: 20, y: 7}, {x: 20, y: 6}, {x: 20, y: 5}]
                )
            ];
        break;

        case "crazy AI" :
        // Crazy lots of snakes
            for (s = 1; s <= 50; s++) {
                name = ("AI " + s);
                randomStart = {x: Math.floor((Math.random() * 26) + 2), y: Math.floor((Math.random() * 26) + 2)};
                game.snakes.push(new Snake(
                    name,
                    '#'+(Math.random() * 0xFFFFFF << 0).toString(16),
                    20,
                    {avoidance: {walls: true, snakes: true, tubes: true}, lazy: false, suicideOnWin: true},
                    "Normal AI",
                    'S',
                    [randomStart]
                ));
            }
        break;

        case "singleplayer" :
            game.snakes = [
                new Snake(
                    "Player 1",
                    null,
                    200,
                    null,
                    ["arrows","WASD","touch"],
                    'S',
                    [{x: 10, y: 7}, {x: 10, y: 6}, {x: 10, y: 5}]
                )
            ];
        break;

    }

    if (typeof game.gameLoop !== "undefined") {
        clearInterval(game.gameLoop);
    }
    game.gameLoop = setInterval(game.mainLoopFunc, 1);

}
