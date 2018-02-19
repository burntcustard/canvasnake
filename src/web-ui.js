

var canvasnakeRunning = false;


function removeQr(event) {
    event.preventDefault();
    var qrContainer = document.getElementById("qrContainer");
    //console.log("Hiding QR container because It's being poked");
    qrContainer.removeEventListener("touchstart", removeQr, false);
    qrContainer.removeEventListener("click", removeQr, false);
    qrContainer.setAttribute("id", "qrContainerHid");
    if (!canvasnakeRunning) {
        canvasnakeRunning = true;
        window.canvasnake();
    }
}



// Start game when the page loads and...
// Show the QR code when the link in the tab is clicked
function init() {
    var qrContainerHid = document.getElementById("qrContainerHid");
    if (qrContainerHid) qrContainerHid.setAttribute("id", "qrContainer");
    var qrContainer = document.getElementById("qrContainer");
    if (qrContainer) qrContainer.addEventListener("touchstart", removeQr);
    if (qrContainer) qrContainer.addEventListener("click", removeQr);
}



function shareScore() {
    var twitter = "https://twitter.com/home/?status=";
    //https://twitter.com/share?url=https%3A%2F%2Fdev.twitter.com%2Fweb%2Ftweet-button
    var tweetScore = "I scored "+localStorage.highScore+" at tiny.cc/canvasnake!";
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

window.onload = function() { init(); };