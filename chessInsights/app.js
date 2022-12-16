const express = require("express");
let ejs = require('ejs');
const app = express();

let archiveLinks = [];
let gameYear = [];
let gameMonth = [];
let gameEachMonth = [];
let gameAmount = [];
let gm = 0;

// avatar, playerLink, name, username, followers, country, last_online, joined,
let info = [];

// link to your fist game
let yourFirstGame = "";
// check-mate resigned timeout abandoned
let winWhite = [0, 0, 0, 0];
let winBlack = [0, 0, 0, 0];

// check-mate resigned timeout abandoned agreed
let loseBlack = [0, 0, 0, 0, 0];
let loseWhite = [0, 0, 0, 0, 0];

// stalemate repetition timevsinsufficient insufficient
let drawNames = [
  "timevsinsufficient",
  "repetition",
  "stalemate",
  "insufficient",
];

let rating = [
  [],
  [],
  [],
];
let drawWhite = [0];
let drawBlack = [0];

//          
// stats [[rapid- [best: rating,date,], [win,loss,draw]], [bullet- [best: rating,date,]], [blitz]- [best: rating,date,]]
let stats = [
  [],
  [],
  []
];
//  tactics [ [highest- [rating,date]], [lowest- [rating,date]]]
let tactics = [
  [],
  []
];
// [total-attempts, score]
let puzzleRush = [];

let statsQueryName = ["chess_rapid", "chess_bullet", "chess_blitz"];

app.set("view-engine", "ejs");
app.use(express.static(__dirname + '/public'));

app.get("/", function (request, response) {
  var a = 3;
  response.render("fetch.ejs", {val: a});
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.post("/", function (req, res) {});

app.get("/get", async (req, res) => {
  rating = [
    [],
    [],
    [],
  ];
  fetch("https://api.chess.com/pub/player/dawitmng/games/archives")
  .then((response) => response.json())
  .then((data) => {
    archiveLinks = data.archives;
    // archiveLinks.length
    for (let x = 0; x < archiveLinks.length; x++) {
      gameYear.push(archiveLinks[x].split("/")[7]);
      gameMonth.push(archiveLinks[x].split("/")[8]);
      fetchGames(x);
    }
    let timer = setInterval(sendRating, 10000)
      function sendRating() {
        res.send(rating)
        clearInterval(timer);
      }
  });
});

function fetchGames(x) {
  fetch(archiveLinks[x])
    .then((response) => response.json())
    .then((data) => {
      let gamesData = data.games;
      if (x == 0) {
        yourFirstGame = gamesData[0].url;
      } // check-mate resigned timeout abandoned
      // gamesData.length

      for (let i = 0; i < gamesData.length; i++) {
        let gamesDataWhite = gamesData[i].white;
        let gamesDataBlack = gamesData[i].black;
        if (gamesDataWhite.username == "DawitMng") {
          if (gamesData[i].time_class == "rapid"){
            rating[0].push(gamesDataWhite.rating);
          } else if (gamesData[i].time_class == "bullet"){
            rating[1].push(gamesDataWhite.rating);
          } else if (gamesData[i].time_class == "blitz") {
            rating[2].push(gamesDataWhite.rating);
          }
           
          if (gamesDataWhite.result == "win") {
            if (gamesDataBlack.result == "checkmated") {
              winWhite[0] += 1;
            } else if (gamesDataBlack.result == "resigned") {
              winWhite[1] += 1;
            } else if (gamesDataBlack.result == "timeout") {
              winWhite[2] += 1;
            } else if (gamesDataBlack.result == "abandoned") {
              winWhite[3] += 1;
            }
          } else if (drawNames.includes(gamesDataBlack.result)) {
            drawWhite[0] += 1;
          } else {
            if (gamesDataWhite.result == "checkmated") {
              loseWhite[0] += 1;
            } else if (gamesDataWhite.result == "resigned") {
              loseWhite[1] += 1;
            } else if (gamesDataWhite.result == "timeout") {
              loseWhite[2] += 1;
            } else if (gamesDataWhite.result == "abandoned") {
              loseWhite[3] += 1;
            }
            else {
              loseWhite[4] += 1;
            }
          }
        } else if (gamesDataBlack.username == "DawitMng") {

          if (gamesData[i].time_class == "rapid"){
            rating[0].push(gamesDataBlack.rating);
          } else if (gamesData[i].time_class == "bullet"){
            rating[1].push(gamesDataBlack.rating);
          } else if (gamesData[i].time_class == "blitz") {
            rating[2].push(gamesDataBlack.rating);
          }

          if (gamesDataBlack.result == "win") {
            if (gamesDataWhite.result == "checkmated") {
              winBlack[0] += 1;
            } else if (gamesDataWhite.result == "resigned") {
              winBlack[1] += 1;
            } else if (gamesDataWhite.result == "timeout") {
              winBlack[2] += 1;
            } else if (gamesDataWhite.result == "abandoned") {
              winBlack[3] += 1;
            }
          } else if (drawNames.includes(gamesDataWhite.result)) {
            drawBlack[0] += 1;
          } else {
            if (gamesDataBlack.result == "checkmated") {
              loseBlack[0] += 1;
            } else if (gamesDataBlack.result == "resigned") {
              loseBlack[1] += 1;
            } else if (gamesDataBlack.result == "timeout") {
              loseBlack[2] += 1;
            } else if (gamesDataBlack.result == "abandoned") {
              loseBlack[3] += 1;
            }
            else {
              loseBlack[4] += 1;
            }
          }
        }
      }
      gameEachMonth.push(gamesData.length);
      gm += gamesData.length;
    });
}
function fetchStats(){
  fetch("https://api.chess.com/pub/player/dawitmng/stats")
  .then((response) => response.json())
  .then((data) => {
    
    for (let i = 0; i < 3; i++) {
      if (i < 1) {
        let t = data.tactics;
        let pz = data.puzzle_rush;
        tactics[0].push(t.highest.rating)
        tactics[0].push(t.highest.date)
        tactics[1].push(t.lowest.rating)
        tactics[1].push(t.lowest.date)

        puzzleRush.push(pz.best.total_attempts)
        puzzleRush.push(pz.best.score)
      }
      let strName = statsQueryName[i];
      stats[i][0] = (data[strName].last.rating)
      stats[i][1] = (data[strName].last.date)

      stats[i][2] = (data[strName].best.rating)
      stats[i][3] = (data[strName].best.date)
      
      stats[i][4] = (data[strName].record.win)
      stats[i][5] = (data[strName].record.loss)
      stats[i][6] = (data[strName].record.draw)
    }
    
  })
}
let myInterval = setInterval(doneFetch, 10000);

function doneFetch() {

  console.log(rating[0].length, rating[1].length, rating[2].length);

  // console.log(stats);
  // console.log(tactics, " :tactics");
  // console.log(puzzleRush, " :puzzleRush");
  gameAmount.push(gm);
  clearInterval(myInterval);
  console.log(gameAmount, " :gameAmount");
  console.log(gameMonth, " :gameMonth");
  console.log(gameYear, " :gameYear");
  console.log(gameEachMonth, " :gameEachMonth");
  console.log(yourFirstGame, " :your first game");
  console.log(" ");

  console.log(winWhite, " : win as white");
  console.log(winBlack, " : win as black");
  console.log(loseBlack, " :lose as black");
  console.log(loseWhite, " :lose as white");
  console.log(drawWhite, " :draw as white");
  console.log(drawBlack, " :draw as black");
} 

function fetchInfo() {
  fetch("https://api.chess.com/pub/player/dawitmng")
  .then((response) => response.json())
  .then((data) => {
    // avatar, playerLink, name, username, followers, last_online, joined,
    info.push(data.avatar, data.url, data.name, data.username, data.followers, data.last_online, data.joined)
    console.log(info);
  })
}
app.listen(3000, function () {
  // fetchInfo();
  // fetchStats();
});

