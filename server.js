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
    const id = socket.handshake.query.id;
    socket.join(id)
    const room = socket.handshake.query.room;
    console.log(room)
    
    // console.log(io.sockets.server.engine.clientsCount);  
  socket.on("sendMessage", ({msg, room})=>{
      console.log(`getMessage/${room}`)
      console.log(msg)
      io.emit(`getMessage/${room}`,{msg})
  })
});



