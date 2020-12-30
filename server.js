const express = require("express");
const shuffle = require("lodash").shuffle;
const app = express();
const controller = require("./controllers/checkWinner");
const logic = require("./controllers/logic");
const http = require("http").createServer(app);
global.io = require("socket.io")(http, {
  // cors: {
  //   origin: "https://gamescenter-ds.herokuapp.com",
  //   methods: ["GET", "POST"],
  // },
   cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 5050;

app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});

http.listen(port);

io.on("connection", (socket) => {
  socket.on("sendMessage", ({ msg, room }) => {
    io.to(room).emit("getMessage", { msg });
  });

  // disconnect
  socket.on("disconnect", () => {
    if (socket.user) {
      io.to(socket.user.room).emit("userLeave", { userId: socket.user.id });
      io.to(socket.user.room).emit("gameResult", { result: "OPPONENTLEFT" });
    }
  });

  // createLobby
  socket.on("createRoom", ({ room, player }) => {
    socket.join(room);
    socket.user = player;
    socket.user.room = room;
    if (room !== "" && room) {
      io.to(room).emit("getPlayers", { player });
    }
  });

  // restart
  socket.on("restart", ({ room }) => {
    io.to(room).emit("restart");
  });

  // starting game
  socket.on("gameStarted", ({ room, players }) => {
    io.to(room).emit("gameStarted", { players: shuffle(players) });
  });

  // TicTacToe Cell
  socket.on("TicTacToeCellTaken", ({ room, id, userId, players, grid }) => {
    playerIndex = players.findIndex((p) => p.id === userId);
    playerIndex === 1 ? (playerIndex = 0) : playerIndex++;
    symbol = playerIndex === 0 ? "X" : "O";

    io.to(room).emit("TicTacToeCellTaken", { id, symbol });

    io.to(room).emit("changeTurn", { player: players[playerIndex] });

    grid[id].taken = true;
    grid[id].symbol = symbol;
    const result = controller.checkWinTicTacToe(grid);
    if (result) {
      if (result === "DRAW") {
        io.to(room).emit("gameResult", { result: result });
      } else {
        const winner = result === "X" ? players[1] : players[0];
        io.to(room).emit("gameResult", { result: "FINISHED", winner: winner });
      }
    }
  });

  // ConnectFour Cell
  socket.on(
    "ConnectFourCellTaken",
    ({ room, grid, cellId, userId, color, players, gravitation }) => {
      playerIndex = players.findIndex((p) => p.id === userId);
      playerIndex === 1 ? (playerIndex = 0) : playerIndex++;

      io.to(room).emit("changeTurn", { player: players[playerIndex] });

      // gravitation
      if (gravitation) {
        cellId = logic.connectFourGravitation(grid, cellId, color);
      }
      grid[cellId].taken = true;
      grid[cellId].color = color;
      io.to(room).emit("ConnectFourCellTaken", { id: cellId });

      const result = controller.checkWinConnectFour(grid);
      if (result) {
        if (result === "DRAW") {
          io.to(room).emit("gameResult", { result: result });
        } else {
          const winner = result === "GREEN" ? players[0] : players[1];
          io.to(room).emit("gameResult", {
            result: "FINISHED",
            winner: winner,
          });
        }
      }
    }
  );
  // connectFour Gravitation
  socket.on("changeGravitation", ({ room, value }) => {
    io.to(room).emit("changeGravitation", { value: value });
  });

  // checkers
  socket.on("updateGrid", ({ updatedGrid, room, players, userId }) => {
    playerIndex = players.findIndex((p) => p.id === userId);
    playerIndex === 1 ? (playerIndex = 0) : playerIndex++;
    io.to(room).emit("changeTurn", { player: players[playerIndex] });

    // check Winners

    io.to(room).emit("updateGrid", { room: room, updatedGrid: updatedGrid });
    const result = controller.checkWinCheckers(updatedGrid);
    if (result) {
      const winner = result === "WHITE" ? players[0] : players[1];
      io.to(room).emit("gameResult", {
        result: "FINISHED",
        winner: winner,
      });
    }
  });
});
