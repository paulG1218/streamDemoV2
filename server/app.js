import express from "express";
import ViteExpress from "vite-express";
import morgan from "morgan";
import session from "express-session";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import handlers from "./handlers.js"
import socketHandlers from "./socketHandlers.js";

const app = express();
const httpServer = createServer(app)
const port = "8000";

const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })
ViteExpress.config({ printViteDevServerHost: true, app: app});

io.on("connection", socketHandlers.handleSocket);

app.use(morgan("dev"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({ secret: "ssshhhhh", saveUninitialized: true, resave: false })
);

app.post("/api/static", handlers.staticAIResponse)
app.post("/api/streaming", handlers.streamingAIResponse)

httpServer.listen(port, () => {
  console.log(`Server and Socket.IO are both listening on http://localhost:${port}`);
});

ViteExpress.bind(app, httpServer)