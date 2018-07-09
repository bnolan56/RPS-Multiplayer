// Initialize Firebase
var config = {
  apiKey: "AIzaSyBHVWOR4yH-eRyVE0LVFRvBVBmsv7FGbLA",
  authDomain: "rps-game-bebb1.firebaseapp.com",
  databaseURL: "https://rps-game-bebb1.firebaseio.com",
  projectId: "rps-game-bebb1",
  storageBucket: "rps-game-bebb1.appspot.com",
  messagingSenderId: "1056360380782"
};

firebase.initializeApp(config);

//global variables
var database = firebase.database();
var chatData = database.ref("/chat");
var playersRef = database.ref("players");
var currentTurnRef = database.ref("turn");
var time = new Date().toLocaleString("en-US", {hour: "numeric", minute: "numeric", second: "numeric"});
var username = "Spectator";
var currentPlayers = null;
var currentTurn = null;
var playerNum = false;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;

// creates the players 1 and 2 and starts game
$("#addName").click(function() {
  if ($("#name-input").val() !== "") {
    username = capitalize($("#name-input").val());
    startGame();
  }
});

// an onclick key press for enter
$("#name-input").keypress(function(e) {
  if (e.which === 13 && $("#name-input").val() !== "") {
    username = capitalize($("#name-input").val());
    startGame();
  }
});

// capitalizes usernames
function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
  console.log(name);
}

// addMessage input button sends to firebase (currently messed up)
$("#addMessage").click(function() {

  if ($("#messages-input").val() !== "") {
    var message = $("#messages-input").val();

    chatData.push({
      name: username,
      message: message,
      time: time,
      idNum: playerNum
    });

    $("#messages-input").val("");
  }
});

// message input listener
$("#message-input").keypress(function(e) {

  if (e.which === 13 && $("#message-input").val() !== "") {

    var message = $("#message-input").val();
    chatData.push({
      name: username,
      message: message,
      time: time,
      idNum: playerNum
    });

    $("#message-input").val("");
  }
});

// on click that adds image elements for choice
$(document).on("click", ".img-choice", function() {

  console.log("img has been clicked");
  console.log($(this).attr("id"));

  var playerChoice = $(this).attr("id");
  console.log(playerChoice)

  // adds a child of player choice to player ojbect in firebase
  playerRef.child("choice").set(playerChoice);

  // when the user has picked their choice,it removes options and displays player choice
  $("#player").empty();
  $("#player").html(playerChoice);

  // this increments turns within firebase
  currentTurnRef.transaction(function(turn) {
    return turn + 1;
  });
});

// updates chat with new messages
chatData.orderByChild("time").on("child_added", function(snapshot) {

  // if playerid is 0 or guest it shows in a color, if it is player <num> displays with palyer1 or player 2 color
  if (snapshot.val().idNum === 0) {
    $("#messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + "<span class='timestamp'></span>" + snapshot.val().time + " " + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");

  } else {
    $("#messages").append("<p class=player" + snapshot.val().idNum + "><span>"
    + "<span class='timestamp'></span>" + snapshot.val().time + " " + snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
  }

  // Keeps div scrolled to bottom on each update.
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
});

//
playersRef.on("value", function(snapshot) {

  // length of the 'players' array
  currentPlayers = snapshot.numChildren();

  // checks if the players exist
  playerOneExists = snapshot.child("1").exists();
  playerTwoExists = snapshot.child("2").exists();

  // player data objects
  playerOneData = snapshot.child("1").val();
  playerTwoData = snapshot.child("2").val();

  // if there is player 1, it populates these div ids with text
  if (playerOneExists) {
    $("#player1-name").text(playerOneData.name);
    $("#player1-wins").text("Wins: " + playerOneData.wins);
    $("#player1-losses").text("Losses: " + playerOneData.losses);

  } else {

    // if there is no player 1, empties divs and replaces text wiht Waitinf for Player
    $("#player1-name").text("Waiting for Player 1");
    $("#player1-wins").empty();
    $("#player1-losses").empty();
  }

// if there is player 1, it populates these div ids with text
  if (playerTwoExists) {
    $("#player2-name").text(playerTwoData.name);
    $("#player2-wins").text("Wins: " + playerTwoData.wins);
    $("#player2-losses").text("Losses: " + playerTwoData.losses);

  } else {

    // if there is no player 2, empties win/loss and shows waiting text
    $("#player2-name").text("Waiting for Player 2");
    $("#player2-wins").empty();
    $("#player2-losses").empty();
  }
});

// turn function
currentTurnRef.on("value", function(snapshot) {

  // gets turn from snapshot
  currentTurn = snapshot.val();

  // doesn't do the following unless you're logged in
  if (playerNum) {

    if (currentTurn === 1) {

      // if its the current player's turn, game tells them and shows choices
      if (currentTurn === playerNum) {
        $("#current-turn").html("<p>It's Your Turn!</p>");
        $("#player1").html("<img class='img-choice' id='rock' src='assets/images/rock.png' alt='Rock'/> <img class='img-choice' id='paper' src='assets/images/paper.png' alt='Paper'/> <img class='img-choice' id='scissors' src='assets/images/scissors.png' alt='Scissors'/>");
      } else {

        //  tells other player they're waiting for player one
        $("#current-turn").html("<p>Waiting for " + playerOneData.name + " to choose.</p>");
      }

      // shows border around active player and inactive players
      $("#player1-section").css("border", "3px solid #f49ac1");
      $("#player2-section").css("border", "1px solid #000");

    } else if (currentTurn === 2) {

      // if its the current player's turn (2), game tells them and shows choices
      if (currentTurn === playerNum) {
        $("#current-turn").html("<p>It's Your Turn!</p>");
        $("#player2").html("<img class='img-choice' id='rock' src='assets/images/rock.png' alt='Rock'/> <img class='img-choice' id='paper' src='assets/images/paper.png' alt='Paper'/> <img class='img-choice' id='scissors' src='assets/images/scissors.png' alt='Scissors'/>");
      } else {

        // tells other player they're waiting for player two
        $("#current-turn").html("<p>Waiting for " + playerTwoData.name + " to choose.</p>");

      }

      // shows border around active player and inactive players
      $("#player2-section").css("border", "3px solid #f49ac1");
      $("#player1-section").css("border", "1px solid #000");

    } else if (currentTurn === 3) {

      // gmaeREsults function runs comparing the two player choices
      gameResults(playerOneData.choice, playerTwoData.choice);

      // reveal both player choices
      $("#player1").html(playerOneData.choice);
      $("#player2").html(playerTwoData.choice);

      //  resets turns and empties divs after 4 sec timeout
      var nextTurn = function() {

        $("#player1").empty();
        $("#player2").empty();
        $("#results").empty();

        // check to make sure players didn't leave before timeout (bug with multiple tabs, clears player1 have to force reset not sure how)
        if (playerOneExists && playerTwoExists) {
          currentTurnRef.set(1);
          currentTurn === playerNum;
        }
      };

      //  show results for 4 seconds, then resets
      setTimeout(nextTurn, 4000);

    } else {

      $("#player1-choices").empty();
      $("#player2-choices").empty();
      $("#current-turn").html("<p>Waiting for another player to join.</p");
      $("#player2-section").css("border", "1px solid #ef5350");
      $("#player1-section").css("border", "1px solid #ef5350");
    }
  }
});

// this if statement checks to see if the playes are at 2, if they are it runs the game
playersRef.on("child_added", function(snapshot) {

  if (currentPlayers === 1) {

    // sets turn to 1 and  starts the game
    currentTurnRef.set(1);
  }
});

// this function adds players into the game to start
function startGame() {

  // adds disconnects to the chat
  var chatDataDisc = database.ref("/chat/" + Date.now());

  // looks for players. if a player joins second they are assigned playerNum 2, if not they are assigned 1
  if (currentPlayers < 2) {

    if (playerOneExists) {
      playerNum = 2;
    } else {
      playerNum = 1;
    }

    // creates a unique key based on assigned player number
    playerRef = database.ref("/players/" + playerNum);

    // creates player object in firebase
    playerRef.set({
      name: username,
      wins: 0,
      losses: 0,
    });

    // gets rid of player object when they leave
    playerRef.onDisconnect().remove();

    // iff a user leaves, removes currentTurnRef value to stop game
    currentTurnRef.onDisconnect().remove();

    // sends  message to chat saying player has disconnected. (timestamp from firebase is currently not working)
    chatDataDisc.onDisconnect().set({
      name: username,
      time: time,
      message: "has disconnected.",
      idNum: 0
    });

    // removes name-input box and show current player number
    $("#show-player-num").html("<h5>KONICHIWA " + username + "! You are Player " + playerNum + "</h5>");
  } else {

    // if the game already has two players modal pops up
    $('#modal1').modal('open');
  }
}

// Game results function that displays wins, lossses, or ties result div and increments
function gameResults(player1choice, player2choice) {

  var playerOneWon = function() {
    $("#results").html("<h5>" + playerOneData.name + "</h5><h5>Wins!</h5>");
    if (playerNum === 1) {
      playersRef.child("1").child("wins").set(playerOneData.wins + 1);
      playersRef.child("2").child("losses").set(playerTwoData.losses + 1);
    }
  };

  var playerTwoWon = function() {
    $("#results").html("<h5>" + playerTwoData.name + "</h5><h5>Wins!</h5>");
    if (playerNum === 2) {
      playersRef.child("2").child("wins").set(playerTwoData.wins + 1);
      playersRef.child("1").child("losses").set(playerOneData.losses + 1);
    }
  };

  var tie = function() {
    $("#results").html("<h5>Tie Game!</h5>");
  };

  //if statement compares the unique ids of playerChoice to see who wins
  if (player1choice === 'rock' && player2choice === 'rock') {
    tie();

  } else if (player1choice === 'paper' && player2choice === 'paper') {
    tie();

  } else if (player1choice === 'scissors' && player2choice === 'scissors') {
    tie();

  } else if (player1choice === 'rock' && player2choice === 'paper') {
    playerTwoWon();

  } else if (player1choice === 'rock' && player2choice === 'scissors') {
    playerOneWon();

  } else if (player1choice === 'paper' && player2choice === 'rock') {
    playerOneWon();

  } else if (player1choice === 'paper' && player2choice === 'scissors') {
    playerTwoWon();

  } else if (player1choice === 'scissors' && player2choice === 'rock') {
    playerTwoWon();

  } else if (player1choice === 'scissors' && player2choice === 'paper') {
    playerOneWon();
  }
}

// plays audio for the rpsTheme
$("#rpsTheme").get(0).play();
