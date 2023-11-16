import { DragEventHandler, FormEventHandler, MouseEventHandler, useCallback, useEffect, useRef, useState } from "react"
import { Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { wsURL } from ".."

function FileToBase64(file: File): Promise<string>{
    return new Promise((resolve) => {
        const fileReader = new FileReader()

        fileReader.addEventListener("load", () => {
            resolve(fileReader.result as string)
        })

        fileReader.readAsDataURL(file)
    })
}

const getProgress = (out: string) => {
    try {
        const [_, a, b] = (/\(([0-9]+)\/([0-9]+)\)/gm).exec(out)
        const f = parseFloat(a) / parseFloat(b)
        return Math.floor(f * 100)
    } catch (_) {
        return NaN
    }
}

export default function(){
    const [image, setImage] = useState<File>()
    const [previewImage, setPreviewImage] = useState<string>()
    const [pageState, setPageState] = useState<"input" | "loading" | "output">("input")
    const [progress, setProgress] = useState<number>(0)
    const [msg, setMsg] = useState<string>("")

    const checkImage = (file: File) => {
        if (!file) return
        if (!file.type.startsWith("image")) return

        setImage(file)
    }

    const dropHandler: DragEventHandler<HTMLDivElement> = (e) => {
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        checkImage(file)
    }

    const fileHandler: FormEventHandler<HTMLInputElement> = (e) => {
        e.preventDefault()
        const file = e.currentTarget.files[0]
        checkImage(file)
    }

    useEffect(() => {
        if(!image) setPreviewImage(null)
        else {
            FileToBase64(image).then((base64) => {
                setPreviewImage(base64)
            })
        }
    }, [image])

    const wscRef = useRef<WebSocket>()
    const cbirHandler = async (method: string) => {
        setPageState("loading")
        setMsg("Uploading...")
        setProgress(0)

        const formData = new FormData()
        formData.append("image", image)

        formData.append("type", method)
        const { filename } = await (await fetch("/cbir", {
            method: "POST",
            body: formData
        })).json()

        wscRef.current = new WebSocket(wsURL)
        wscRef.current.addEventListener("open", () => {
            wscRef.current.send(JSON.stringify({
                method, filename,
                force: false
            }))
        })

        wscRef.current.addEventListener("message", async ({data: raw}) => {
            const { msg, finished }: { msg: string, finished: boolean} = await JSON.parse(raw)
            if(finished){
                setPageState("output")
            } else {
                const prog = getProgress(msg)
                if(!Number.isNaN(prog)) setProgress(getProgress(msg))
                setMsg(msg)
            }
        })
    }

    return <div className="w-full h-full flex flex-row justify-center items-center">

        <div className="flex flex-col bg-blue-300 p-5 rounded-md items-center justify-center">

            <div className={cn(
                "transition-dimension overflow-hidden",
                pageState == "input" ? "max-w-[100vw] max-h-[100vh] duration-1000" : "max-w-0 max-h-0 duration-0"
            )}>

                <label htmlFor="inp-file">
                    <div
                        onDragOver={(e) => {
                            e.preventDefault()
                            e.currentTarget.setAttribute("data-dragged", "")
                        }}
                        onDragLeave={e => e.currentTarget.removeAttribute("data-dragged")}
                        onDrop={dropHandler}
                        data-dragged={previewImage}
                        className={cn(
                            "flex flex-col justify-center items-center overflow-hidden",
                            "w-40 h-40 cursor-pointer transition-dimension",
                            "data-[dragged]:text-white hover:text-white",
                            previewImage ? "opacity-0 h-[0px] w-[0px] duration-0" : ""
                        )}
                    >
                        <Upload className="w-1/2 h-1/2" />
                        <p className="text-xs whitespace-nowrap">Upload or Drop Here</p>
                    </div>
                    <input id="inp-file" type="file" onInput={fileHandler} hidden />
                </label>

                <div className="flex flex-row relative">
                    <div className={cn(
                        "flex relative max-w-[50vw] max-h-[50vh] group transition-dimension",
                        previewImage ? "" : "max-h-[0px] max-w-[0px]"
                    )}>
                        <button onClick={() => setImage(null)} className={cn("absolute top-0 right-0 hidden group-hover:block", previewImage ? "" : "hidden")}>
                            <X className="bg-red-500 text-white" />
                        </button>
                        <img className="object-scale-down max-w-[inherit] max-h-[inherit]" src={previewImage} />
                    </div>
                </div>

                <div className={cn(
                    "transition-opacity flex flex-row gap-2 w-full",
                    previewImage ? "opacity-100 delay-75 mt-4 duration-300" : "opacity-0 h-0 duration-0"
                )}>
                    <button onClick={() => cbirHandler("color")} className="transition-colors flex-grow hover:bg-white border-2 rounded-l-full p-2 pl-4">
                        Color
                    </button>
                    <button onClick={() => cbirHandler("texture")} className="transition-colors flex-grow hover:bg-white border-2 rounded-r-full p-2 pr-4">
                        Texture
                    </button>
                </div>

            </div>

            <div className={cn(
                "transition-dimension overflow-hidden duration-1000 flex flex-col gap-2",
                pageState == "loading" ? "max-w-[100vw] max-h-[100vh]" : "max-w-0 max-h-0"
            )}>
                <div className="w-96 max-w-[50vw] h-5 bg-white border-2">
                    <div className="bg-blue-300 h-full" style={{width: `${progress}%`}}></div>
                </div>
                <div className="whitespace-nowrap overflow-hidden w-96 max-w-[50vw] text-ellipsis">{msg}</div>
            </div>

        </div>

    </div>
}