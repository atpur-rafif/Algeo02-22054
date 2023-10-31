import { exec } from "child_process";
import express from "express"
import { resolve } from "path"
import http from "http"

import livereload from "livereload"
import connectLivereload from "connect-livereload"

const STATIC = "./page"
const EXE = "./bin/main"

const app = express();
const server = http.createServer(app);

if(true){
    const livereloadPort = 35729;
    app.use(connectLivereload({ port: livereloadPort }));
    const livereloadServer = livereload.createServer({ port: livereloadPort }, () => {
        const fnOut = (socket: WebSocket) => {
            const fnIn = ({ data }: any) => {
                if(JSON.parse(data).command === "hello"){
                    livereloadServer.refresh(".")
                    socket.removeEventListener("message", fnIn)
                }
            }
           socket.addEventListener("message", fnIn)
           livereloadServer.server.removeListener("connection", fnOut)
        }
        livereloadServer.server.addListener("connection", fnOut)
    })
    livereloadServer.watch(resolve(__dirname, STATIC))
}

app.get("/api", (req, res) => {
    exec(resolve(__dirname, EXE), (e, stdout) => {
        res.send(stdout);
    });
});

app.use(express.static(resolve(__dirname, STATIC)));
server.listen(80, () => {
    console.log("Serving at http://localhost:80");
});