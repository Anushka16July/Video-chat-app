const express = require("express");
const app = express();
const server = require("http").Server(app);
app.set("view engine","ejs");
app.use(express.static("public"));

const {v4:uuidv4} = require("uuid");

const io = require("socket.io")(server,{
    cors: { //cors-- cross origin resource sharing
        origin:'*' 
    }
});

/*

Browsers, these days, do not allow sharing the data from
one port to another port. This means that if your client is
running on a different port, and the server is running on a
different port, then the browser will block the sharing of the
data.
To avoid such error, we set its origin to *, which means that
we are letting the browser know to allow sharing data from
all the ports, instead of blocking it.
*/


const {ExpressPeerServer} = require("peer");
const peerServer = ExpressPeerServer(server,{
    debug:true
});

app.use("/peerjs", peerServer);

app.get("/",(req,res)=>{
    res.redirect(`${uuidv4()}`)
})

app.get("/:room",(req,res)=>{
    res.render("index", {roomId:req.params.room})
})

io.on("connection",(socket)=>{
   socket.on("join-room", (roomId, userId, userName)=>{
    socket.join(roomId);
    socket.on('message',(message)=>{
        io.to(roomId).emit("createMessage", message, userName)
    })
   })
})


server.listen(3030)
