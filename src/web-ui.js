
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



function toggleInfo() {
    var infoBox = document.getElementById("sliderInfoBox");
    if (infoBox) {
        infoBox.setAttribute("id", "sliderInfoBoxShow");
    } else {
        infoBox = document.getElementById("sliderInfoBoxShow");
        infoBox.setAttribute("id", "sliderInfoBox");
    }
}



function toggleMenu() {
    var menu;
    if ((menu = document.getElementById("slider-menu"))) {
        menu.setAttribute("id", "slider-menu-collapsed");
    } else if ((menu = document.getElementById("slider-menu-collapsed"))) {
        menu.setAttribute("id", "slider-menu");
    }
}



function updateSSAAMenuItem(value) {

    let text = "<span>SSAA: " + value + "</span>";

    if (value === 1) {
        text += " <small>(default)</small>";
    }

    document.getElementById("SSAA").innerHTML = text;

}



window.onload = function() { init(); };
