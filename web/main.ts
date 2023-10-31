import { exec } from "child_process";
import express from "express"
import { resolve } from "path"


const STATIC = "./page"
const EXE = "./bin/main"

const app = express();
app.use(express.static(resolve(__dirname, STATIC)));

app.get("/api", (req, res) => {
    exec(resolve(__dirname, EXE), (e, stdout) => {
        res.send(stdout);
    });
});

app.listen(80, () => {
    console.log("Serving at http://localhost:80");
});