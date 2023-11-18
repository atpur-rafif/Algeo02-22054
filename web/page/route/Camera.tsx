import { cn } from "@/lib/utils"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { useEffect, useRef, useState } from "react"
import { wsURL } from ".."
import { getProgress } from "./Cbir"

export default function Camera(){
    const videoRef = useRef<HTMLVideoElement>()
    const canvasRef = useRef<HTMLCanvasElement>()
    const [previewImage, setImagePreview] = useState<string>(null)
    const [progress, setProgress] = useState<number>(0)
    const [output, setOutput] = useState<[string, number][]>(null)
    const [type, setType] = useState<"color" | "texture">("color")

    const wscRef = useRef<WebSocket>(null)
    const captureLoop = () => {
        const video = videoRef.current
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.drawImage(videoRef.current, 0, 0, video.videoWidth, video.videoHeight)
        setImagePreview(canvas.toDataURL("image/png"))
    }

    useEffect(() => {
        if(!previewImage) return
        if(!wscRef.current) wscRef.current = new WebSocket(wsURL)

        canvasRef.current.toBlob(async (blob) => {
            const formData = new FormData()
            const file = new File([blob], "capture.png")
            formData.append("image", file)
            formData.append("type", type)

            const { filename } = await (await fetch("/api/cbir", {
                method: "POST",
                body: formData
            })).json()
            
            const wsc = new WebSocket(wsURL)
            wsc.addEventListener("open", () => {
                wsc.send(JSON.stringify({
                    type, filename,
                    force: false,
                }))
            })

            wsc.addEventListener("message", async ({ data: raw }) => {
                const { msg, finished } = await JSON.parse(raw)
                if (finished) {
                    const result = Object.entries(msg as Record<string, number>).sort(([_1, v1], [_2, v2]) => {
                        return v2 - v1
                    }) as any
                    if(result.length > 0) setOutput(result)
                    wsc.close()
                    setTimeout(() => {
                        captureLoop()
                    }, 100);
                } else {
                    const prog = getProgress(msg)
                    if (!Number.isNaN(prog)) setProgress(getProgress(msg))
                }
            })
        })
    }, [previewImage])


    useEffect(() => {
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                facingMode: "user"
            }
        }).then((stream) => {
            if(videoRef.current){
                const video = videoRef.current
                video.srcObject = stream
                video.onloadedmetadata = () => video.play()
                video.onplaying = () => {
                    setTimeout(() => {
                        captureLoop()
                    }, 1000);
                }
            }
        })
    }, [])

    return <div className="flex w-full h-full items-center justify-center">
       <div className="max-w-[75vw] max-h-[75vh] flex flex-col items-center justify-center">
            <div className="flex flex-row gap-4">
                <p className={cn("transition-opacity duration-500", type == "color" ? "" : "opacity-0")}>Color</p>
                <SwitchPrimitive.Root
                    defaultChecked={type == "texture"}
                    onCheckedChange={c => setType(c ? "texture" : "color")}
                    className="w-[42px] h-[25px] bg-blue-300 rounded-full relative mb-2"
                    id="airplane-mode"
                >
                    <SwitchPrimitive.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                </SwitchPrimitive.Root>
                <p className={cn("transition-opacity duration-500", type == "texture" ? "" : "opacity-0")}>Texture</p>
            </div>

            <video className="bg-black max-w-[50vw] max-h-[50vw]" ref={videoRef} />
            <canvas className="border-2 hidden" ref={canvasRef} />
            <div className="flex-shrink-0 w-full max-w-[50vw] h-5 bg-white border-2 transition-all" >
                <div className="bg-blue-300 h-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex flex-row flex-shrink-0 h-[10vh]">
                {output ? output.slice(0, 3).map(([name, value]) => {
                    return <img key={name} className="max-w-[10vw] max-h-[10vh]" src={`/dataset/${name}`} />
                }) : null}
            </div>
        </div>
    </div>
}