import { execSync, spawn } from "child_process";
import express from "express"
import { resolve } from "path"
import http from "http"

import connectLivereload from "connect-livereload"
import multer, { diskStorage } from "multer";
import { readdirSync, mkdirSync, existsSync, readFileSync, unlinkSync } from "fs"
import { WebSocketServer } from "ws";

const PAGE = "./page"
const DATASET = "./dataset"
const UPLOAD = "./upload"
const EXE = "./bin/main"

const MARK_END = "\0"

const datasetPath = resolve(__dirname, DATASET)
if(!existsSync(datasetPath)) mkdirSync(datasetPath);

const uploadPath = resolve(__dirname, UPLOAD)
if(!existsSync(uploadPath)) mkdirSync(uploadPath);
else { readdirSync(uploadPath).forEach(f => unlinkSync(resolve(uploadPath, f)))}

const exePath = resolve(__dirname, EXE)

const app = express();
const server = http.createServer(app);

const getExt = (f: string) => f.substring(f.lastIndexOf(".") + 1, f.length)
const exts = new Set(["png", "jpg", "bmp", "jpeg"])
const imageFilter: multer.Options["fileFilter"] = (_, file, cb) => {
    cb(null, exts.has(getExt(file.originalname)))
}

const getLastLine = (str: string) => {
    const splitted = str.trim().split("\n")
    const last = splitted[splitted.length - 1].trim()
    return last;
} 

const uploadDataset = multer({
    storage: diskStorage({
        destination: datasetPath,
        filename(_, file, callback) {
            callback(null, file.originalname)
        },
    }),
    fileFilter: imageFilter
}).single("image")

const uploadTarget = multer({
    storage: diskStorage({
        destination: uploadPath,
        filename(_, file, callback) {
            const ext = getExt(file.originalname)
            const newName = (new Date()).getTime().toString() + (Math.floor(Math.random() * 1000)) + "." + ext
            callback(null, newName)
        }
    }),
    fileFilter: imageFilter
}).single("image")

type cacheValidationListener = (msg: string) => void
const cacheValidation = new (class{
    status: {
        color: "IDLE" | "RUNNING",
        texture: "IDLE" | "RUNNING"
    } = {
        color: "IDLE",
        texture: "IDLE"
    }
    colorStatus: "IDLE" | "RUNNING" = "IDLE"
    progress: number = 0
    listener: {
        color: cacheValidationListener[],
        texture: cacheValidationListener[]
    } = {
        color: [],
        texture: []
    }

    clearCache() {
        readdirSync(datasetPath).forEach(f => {
            if (f.includes("_cache_")) {
                unlinkSync(resolve(datasetPath, f));
            }
        })
    }

    revalidate(cbirType: "color" | "texture", force?: boolean){
        if(this.status[cbirType] == "RUNNING") return
        if(force) this.clearCache()

        this.status[cbirType] = "RUNNING"
        const p = spawn(exePath, [cbirType, datasetPath])

        p.stdout.setEncoding("utf-8")

        p.stdout.on("data", (data: string) => {
            data = getLastLine(data.trim())
            this.listener[cbirType].forEach(fn => fn(data))
        })

        p.on("close", () => {
            this.status[cbirType] = "IDLE"
            this.listener[cbirType].forEach(fn => fn(MARK_END))
            this.listener[cbirType] = []
        })
    }

    startListen(fn: cacheValidationListener, type: "color" | "texture"){
        this.listener[type].push(fn)
    }
})()

app.use(connectLivereload());

app.get("/dataset", async (_, res) => {
    let files = readdirSync(resolve(__dirname, DATASET))
    if(!files) files = [];
    res.send(files)
})

app.post("/dataset", uploadDataset, (_, res) => {
    res.send({})
})

app.use(express.static(resolve(__dirname, PAGE)));
app.use("/dataset", express.static(resolve(__dirname, DATASET)));

app.post("/cbir", uploadTarget, async (req, res) => {
    res.json({ filename: req.file.filename } )
})

app.get("*", (_, res) => {
    res.sendFile(resolve(__dirname, "page", "index.html"))
})

const wss = new WebSocketServer({
    server: server
})

wss.addListener("connection", (client) => {
    client.addEventListener("message", async ({data}) => {
        const { method, filename, force } = await JSON.parse(data as string)
        if(!(method == "color" || method == "texture")) return
        cacheValidation.startListen((msg) => {
            if(msg == MARK_END) {
                const p = spawn(exePath, [method, datasetPath, resolve(uploadPath, filename)])

                let stdout = ""
                p.stdout.setEncoding("utf-8")
                p.stdout.on("data", (data: string) => {
                    stdout += data;
                    client.send(JSON.stringify({
                        msg: getLastLine(data),
                        finished: false
                    }))
                })

                p.on("close", () => {
                    const data = {}
                    unlinkSync(resolve(uploadPath, filename))
                    stdout.split("\n").forEach(l => {
                        if(!l.trim()) return
                        const [_, filename, result] = (/\ (.+)\:\ ([0-9\.]+)/gm).exec(l)
                        data[filename] = parseFloat(result)
                    })
                    client.send(JSON.stringify({
                        msg: data,
                        finished: true
                    }))
                })
            } else client.send(JSON.stringify({msg, finished: false}))
        }, method)
        cacheValidation.revalidate(method, force)
    })
})

server.listen(80, () => {
    console.log("Serving at http://localhost:80");
});