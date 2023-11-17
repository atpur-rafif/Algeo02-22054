import { useEffect, useRef, useState } from "react"
import { wsURL } from ".."
import { OutputViewData, getProgress } from "./Cbir"
const method = "color"

export default function Camera(){
    const videoRef = useRef<HTMLVideoElement>()
    const canvasRef = useRef<HTMLCanvasElement>()
    const [previewImage, setImagePreview] = useState<string>(null)
    const [progress, setProgress] = useState<number>(0)
    const [output, setOutput] = useState<[string, number][]>(null)

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
            formData.append("type", method)

            const { filename } = await (await fetch("/cbir", {
                method: "POST",
                body: formData
            })).json()
            
            const wsc = new WebSocket(wsURL)
            wsc.addEventListener("open", () => {
                wsc.send(JSON.stringify({
                    method, filename,
                    force: false,
                }))
            })

            wsc.addEventListener("message", async ({ data: raw }) => {
                const { msg, finished, time } = await JSON.parse(raw)
                if (finished) {
                    const result = Object.entries(msg as Record<string, number>).sort(([_1, v1], [_2, v2]) => {
                        return v2 - v1
                    }) as any
                    setOutput(result)
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

    useEffect(() => {
        console.log(output)
    }, [output])


    return <div className="flex w-full h-full items-center justify-center">
        <div className="max-w-[75vw] max-h-[75vh] flex flex-col items-center justify-center">
            <video className="bg-black max-w-[50vw] max-h-[50vw]" ref={videoRef} />
            <canvas className="border-2 hidden" ref={canvasRef} />
            <div className="w-full max-w-[50vw] h-5 bg-white border-2 transition-all" >
                <div className="bg-blue-300 h-full" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="flex flex-row">
                {/* <img src={previewImage} className="max-w-[100px] max-h-[100px]" /> */}
                {output ? output.slice(0, 3).map(([name, value]) => {
                    return <img className="max-w-[10vw] max-h-[10vh]" src={`/dataset/${name}`} />
                }) : null}
            </div>
        </div>
    </div>
}