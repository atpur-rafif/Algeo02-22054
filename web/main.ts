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
else { readdirSync(uploadPath).forEach(f => unlinkSync(resolve(uploadPath, f))) }

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

const getDataset = () => {
    let files = readdirSync(resolve(__dirname, DATASET))
    if(!files) files = [];
    files = files.filter(file => exts.has(getExt(file)))
    return files
}

type CacheManagerListener = (msg: string) => void
type CacheManagerStatus = "IDLE" | "RUNNING"
class CacheManager{
    type: string
    cachePath: string
    cacheStatusPath: string
    status: CacheManagerStatus = "IDLE"
    listener: CacheManagerListener[] = []

    constructor(cbirType: "color" | "texture"){
        this.type = cbirType
        this.cachePath = resolve(datasetPath, `__cache_${this.type}__.json`)
        this.cacheStatusPath = resolve(datasetPath, `__cache_${this.type}_status__.json`)
    }

    clearCache(){
        if(existsSync(this.cachePath)) unlinkSync(this.cachePath)
        if(existsSync(this.cacheStatusPath)) unlinkSync(this.cacheStatusPath)
    }

    checkStale(){
        try {
            const file = readFileSync(resolve(datasetPath, `__cache_${this.type}_status__.json`), "utf-8")
            const json: string[] = JSON.parse(file)

            const dataset = new Set(getDataset())
            json.forEach(file => {
                dataset.delete(file)
            })

            return dataset.size != 0
        } catch (error) {
            return true
        }
    }

    // Return true if need revalidation, and false if cache fresh
    revalidate(): boolean{
        if(!this.checkStale()) return false
        if(this.status == "RUNNING") return true

        this.status = "RUNNING"
        const p = spawn(exePath, [this.type, datasetPath])

        p.stdout.setEncoding("utf-8")

        p.stdout.on("data", (data: string) => {
            data = getLastLine(data.trim())
            this.listener.forEach(fn => fn(data))
        })

        p.on("close", () => {
            this.status = "IDLE"
            this.listener.forEach(fn => fn(MARK_END))
            this.listener = []
        })

        return true;
    }

    startListen(fn: CacheManagerListener){
        this.listener.push(fn)
    }
}

const cacheManager = {
    color: new CacheManager("color"),
    texture: new CacheManager("texture")
}

const clearAllCache = () => {
    cacheManager.color.clearCache()
    cacheManager.texture.clearCache()
}

app.use(connectLivereload());

app.get("/api/dataset", async (_, res) => {
   res.send(getDataset())
})

app.get("/api/dataset/count", async (_, res) => {
    res.send({
        count: getDataset().length
    })
})

app.delete("/api/dataset", (_, res) => {
    clearAllCache()
    readdirSync(datasetPath).forEach(f => unlinkSync(resolve(datasetPath, f)))
    res.send({})
})

app.delete("/api/dataset/cache", (_, res) => {
    clearAllCache()
    res.send({})
})

app.post("/api/dataset", uploadDataset, (_, res) => {
    res.send({})
})

app.use(express.static(resolve(__dirname, PAGE)));
app.use("/dataset", express.static(resolve(__dirname, DATASET)));

app.post("/api/cbir", uploadTarget, async (req, res) => {
    res.json({ filename: req.file?.filename } )
})

app.get("*", (_, res) => {
    res.sendFile(resolve(__dirname, "page", "index.html"))
})

const wss = new WebSocketServer({
    server: server
})

wss.addListener("connection", (client) => {
    client.addEventListener("message", async ({data}) => {
        const { type, filename, force } = await JSON.parse(data as string)
        if(!(type == "color" || type == "texture")) return

        const start = performance.now()

        const compareProcess = () => {
            const p = spawn(exePath, [type, datasetPath, resolve(uploadPath, filename)])

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
                const end = performance.now()

                const data = {}
                unlinkSync(resolve(uploadPath, filename))
                stdout.split("\n").forEach(l => {
                    if (!l.trim()) return
                    const match = (/([^\s]+)\:\ ([0-9\.]+)/gm).exec(l)
                    if(match){
                        const [_, filename, result] = match
                        data[filename] = parseFloat(result)
                    }
                })
                client.send(JSON.stringify({
                    msg: data,
                    finished: true,
                    time: Math.floor(end - start)
                }))
            })
        }

        const cm = cacheManager[type] as CacheManager
        if(cm.revalidate()){
            cm.startListen((msg) => {
                if(msg == MARK_END) compareProcess()
                else client.send(JSON.stringify({ msg, finished: false }))
            })
        } else {
            compareProcess()
        }
    })
})

server.listen(8080, () => {
    console.log("Serving at http://localhost:8080");
});