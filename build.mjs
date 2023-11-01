import * as esbuild from 'esbuild'
import chokidar from 'chokidar'
import cpy from "cpy"
import livereload from "livereload"
import { parse, relative, resolve } from 'path';
import { fork } from 'child_process';

const watch = process.argv.findIndex(v => v == '-w') != -1;

const livereloadServer = {
    server: watch ? livereload.createServer() : null,
    reload(){
        if(server) this.server.refresh(".")
    }
}

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

await cpy(["./web/**/*.html", "!./web/**/*.(ts|tsx)"], "./dist")

const contextFrontend = await esbuild.context({
    entryPoints: ["./web/page/index.tsx"],
    bundle: true,
    outfile: "./dist/page/index.js",
    plugins: [
        {
            name: "Frontend-reload",
            setup(build){
                build.onEnd(() => {
                    livereloadServer.reload()
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
                    server.respawn()
                })
            }
        }
    ]
})

if(watch){
    await contextFrontend.watch();
    await contextBackend.watch();
    chokidar.watch("./web/**/*", { ignored: /(.*)\.(ts|tsx)/, }).on("change", async (path) => {
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