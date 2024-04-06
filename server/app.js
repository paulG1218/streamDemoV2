import express from "express";
import ViteExpress from "vite-express";
import morgan from "morgan";
import session from "express-session";
import { createServer } from "http";
import { Server } from "socket.io";
import handlers from "./handlers.js"
import socketHandlers from "./socketHandlers.js";

const app = express();
const httpServer = createServer(app)
const port = "8000";
const socketPort = "9000"
const io = new Server(httpServer, {
    cors: {
      origin: "*", // or "*" to allow any origin
      methods: ["GET", "POST"]
    }
  })
ViteExpress.config({ printViteDevServerHost: true });

io.on("connection", (socket) => {
    console.log(`Connected with: ${socket.id}`)
    
    socket.on("audio_data", socketHandlers.reciveStatic)
});

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({ secret: "ssshhhhh", saveUninitialized: true, resave: false })
);

// app.post("/api/static", handlers.staticTranscription)

httpServer.listen(socketPort, () => {console.log(`Socket is listening on http://localhost:${socketPort}`)})

ViteExpress.listen(app, port, () =>
  console.log(`Server is listening on http://localhost:${port}`)
);