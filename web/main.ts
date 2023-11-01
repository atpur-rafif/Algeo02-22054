import { exec } from "child_process";
import express from "express"
import { resolve } from "path"
import http from "http"

import connectLivereload from "connect-livereload"

const STATIC = "./page"
const EXE = "./bin/main"

const app = express();
const server = http.createServer(app);

app.use(connectLivereload());
app.get("/api", (req, res) => {
    exec(resolve(__dirname, EXE), (e, stdout) => {
        res.send(stdout);
    });
});

app.use(express.static(resolve(__dirname, STATIC)));
server.listen(80, () => {
    console.log("Serving at http://localhost:80");
});