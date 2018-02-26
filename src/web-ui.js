
var canvasnakeRunning = false;



function removeQr(event) {
    event.preventDefault();
    var qrContainer = document.getElementById("qr-container");
    //console.log("Hiding QR container because It's being poked");
    qrContainer.removeEventListener("touchstart", removeQr, false);
    qrContainer.removeEventListener("click", removeQr, false);
    qrContainer.setAttribute("id", "qr-container-hidden");
    if (!canvasnakeRunning) {
        canvasnakeRunning = true;
        window.canvasnake();
    } else if (window.game && window.game.state.gameOver) {
        window.game.newGame(window.game);
    }

}



// Start game when the page loads and...
// Show the QR code when the link in the tab is clicked
function init() {
    var qrContainerHidden = document.getElementById("qr-container-hidden");
    if (qrContainerHidden) qrContainerHidden.setAttribute("id", "qr-container");
    var qrContainer = document.getElementById("qr-container");
    if (qrContainer) qrContainer.addEventListener("touchstart", removeQr);
    if (qrContainer) qrContainer.addEventListener("click", removeQr);
}



function shareScore() {
    var twitter = "https://twitter.com/home/?status=";
    //https://twitter.com/share?url=https%3A%2F%2Fdev.twitter.com%2Fweb%2Ftweet-button
    var tweetScore = "I scored "+localStorage.highScore+" at burnt.io/canvasnake!";
    window.open(twitter+tweetScore,"_blank");
}



function toggleAbout() {
    document.getElementById("about-popout").classList.toggle("hidden");
}



function toggleMenu() {
    document.getElementById("slider-menu").classList.toggle("collapsed");
}



function updateSSAAMenuItem(value) {

    let text = "<span>SSAA:</span> " + value;

    if (value === 1) {
        text += "<small>default</small>";
    }

    document.getElementById("SSAA").innerHTML = text;

}



function incrementSSAA() {
    window.game.settings.ssaa.increment();
}



function toggleAutoRepeat() {
    let s = window.game.settings;
    s.autoRepeat = !s.autoRepeat;
    let text = "<span>Auto-repeat:</span> " + s.autoRepeat;
    document.getElementById("autoRepeat").innerHTML = text;
}



function setGameMode(gameMode) {
    window.game.settings.gameMode = gameMode;
    console.log(gameMode);
    if (window.game.state.running) {
        window.game.newGame(window.game);
    }
}


// Should be 'selectGameMode(+1 or -1 or "Single Player etc")' //
function incrementGameMode() {

    function getIndexOf(collection, node) {
        for (var i = 0; i < collection.length; i++) {
          if (collection[i] === node)
            return i;
        }
        return -1;
    }

    let gameModeButton = document.getElementById("gamemode"),
        options = gameModeButton.parentNode.getElementsByClassName("option"),
        selected = gameModeButton.parentNode.getElementsByClassName("selected")[0],
        index = getIndexOf(options, selected);

    selected.classList.remove("selected");

    if (index < options.length-1) {
        selected = options[index+1];
    } else {
        selected = options[0];
    }
    selected.classList.add("selected");

    setGameMode(selected.innerHTML);

}



window.onload = function() { init(); };
