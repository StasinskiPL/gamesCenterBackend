const express = require('express');
const app = express();
const http = require('http').createServer(app);
global.io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
      }
});

const port = process.env.PORT || 5050;

const lobbyRouter = require("./routes/lobby");

app.use(express.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    next();
  });


app.use("/lobby",lobbyRouter);

http.listen(port)


io.on('connection', (socket) => {
    
  socket.on("sendMessage", ({msg, room})=>{
    console.log(msg)
      io.emit(`getMessage/${room}`,{msg})
  })

  socket.on("createRoom", ({room, player})=>{
    socket.join(room);
    console.log(player)
    io.to(room).emit("getPlayers",{player})
  })
});



