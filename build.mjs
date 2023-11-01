import * as esbuild from 'esbuild'
import chokidar from 'chokidar'
import cpy from "cpy"
import livereload from "livereload"
import { parse, relative, resolve } from 'path';
import { exec, fork } from 'child_process';

const watch = process.argv.findIndex(v => v == '-w') != -1;

const livereloadServer = {
    server: watch ? livereload.createServer() : null,
    reload(){
        console.log("\x1b[32mReload browser...\x1b[0m")
        this.server.refresh(".")
    }
}

const tailwindCommand = "./node_modules/.bin/tailwindcss -i ./web/page/index.css -o ./dist/page/index.css --silent"
const tailwindProcess = exec(`${tailwindCommand} ${watch ? "--watch" : ""}`)
tailwindProcess.stderr.on("data", (e) => {
    e = e.replace("\n", "").trim()
    if(!e) return;

    if(e == "Rebuilding..."){
        if(watch) console.log("\x1b[32mRebuilding tailwind...\x1b[0m")
        return;
    }

    if(e.includes("Done in")){
        if(watch) livereloadServer.reload()
    } else {
        console.error(e)
    }
})

const server = {
    process: null,
    respawn(){
        if(this.process != null) this.process.kill();

        this.process = fork("./dist/main.js")
        this.process.on("message", (m) => console.log(m))
        this.process.on("spawn", () => livereloadServer.reload())
        console.log("\x1b[32mServer reloaded..\x1b[0m")
    }
}


const contextFrontend = await esbuild.context({
    entryPoints: ["./web/page/index.tsx"],
    bundle: true,
    outfile: "./dist/page/index.js",
    plugins: [
        {
            name: "Frontend-reload",
            setup(build){
                build.onEnd(() => {
                    if(watch) livereloadServer.reload()
                })
            }
        }
    ]
})

const contextBackend = await esbuild.context({
    entryPoints: ["./web/main.ts"],
    format: "cjs",
    outdir: "./dist",
    platform: "node",
    packages: "external",
    platform: "node",
    bundle: true,
    plugins: [
        {
            name: "Backend-reload",
            setup(build){
                build.onEnd(() => {
                    if(watch) server.respawn()
                })
            }
        }
    ]
})

const ignoreCopy = "ts|tsx|css"
await cpy(["./web/**/*", `!./web/**/*.(${ignoreCopy})`], "./dist")

if(watch){
    await contextFrontend.watch();
    await contextBackend.watch();
    
    chokidar.watch("./web/**/*", { ignored: new RegExp(`(.*)\.(${ignoreCopy})`), }).on("change", async (path) => {
        const { dir } = parse(path);
        const to = resolve("./dist", relative("./web", dir));
        await cpy([path], to, {
            overwrite: true
        });
        livereloadServer.reload();
    })
} else {
    await contextFrontend.rebuild();
    await contextBackend.rebuild();
    contextBackend.dispose();
    contextFrontend.dispose();
}