import { exec } from "child_process";
import express from "express"
import { resolve } from "path"
import http from "http"

import connectLivereload from "connect-livereload"
import multer, { diskStorage } from "multer";
import { readdirSync, mkdirSync, existsSync } from "fs"

const PAGE = "./page"
const DATASET = "./dataset"
const UPLOAD = "./upload"
const EXE = "./bin/main"

const app = express();
const upload = multer({
    storage: diskStorage({
        destination: resolve(__dirname, DATASET),
        filename(_, file, callback) {
            callback(null, file.originalname)
        },
    }),
    fileFilter(_, file, cb){
        cb(null, file.mimetype.startsWith("image"))
    }
}).any()

app.use(connectLivereload());
app.get("/api", (req, res) => {
    exec(resolve(__dirname, EXE), (e, stdout) => {
        res.send(stdout);
    });
});

app.get("/dataset", async (req, res) => {
    let files = readdirSync(resolve(__dirname, DATASET))
    if(!files) files = [];
    res.send(files)
})

const datasetPath = resolve(__dirname, DATASET)
if(!existsSync(datasetPath)) mkdirSync(resolve(__dirname, DATASET));
app.post("/dataset", upload, (req, res) => {
    res.send({})
})

app.use(express.static(resolve(__dirname, PAGE)));
app.use("/dataset", express.static(resolve(__dirname, DATASET)));

const server = http.createServer(app);
server.listen(80, () => {
    console.log("Serving at http://localhost:80");
});