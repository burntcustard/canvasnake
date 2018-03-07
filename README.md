# Canvasnake
A snake versus snake game, with single player, local multiplayer, player vs AI, and AI vs AI game modes. Made from scratch with vanilla JavaScript and HTML canvas. v0.2 can be played online: [burnt.io/canvasnake](http://burnt.io/canvasnake/)

![Game screenshot](https://i.imgur.com/kOTDnbk.png)

The project was originally developed for a module in my 2nd year of study at Brighton University. The version that was submitted for that can be found here https://github.com/burntcustard/canvasnake/tree/v0.1.

Since then, the code has been refactored from ~1800 lines in one file, to several modules, with the aim of making it more readable, and more accomodating to multiple AIs that can play against each other. The v0.2 release with these improvements can be found here:

For my final year module, CI342 Applied Intelligent Systems, v0.2 is being used as a base for further development. The plan is to replace the primitive AI currently in the game with a snake that uses [neuroevolution](https://en.wikipedia.org/wiki/Neuroevolution) to figure out how to play the game itself, with minimal user input or prior knowledge.

**Due to it's use of ES6 modules ([import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import) and [export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)) an up-to-date version of Chrome, Edge, or Firefox** (with the dom.moduleScripts.enabled flag set)**, is required to run the game.**
