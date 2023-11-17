import { cn, useGridTiling } from "@/lib/utils"
import * as SliderPrimitive from "@radix-ui/react-slider"
import { Upload, X, XIcon } from "lucide-react"
import { DragEventHandler, FormEventHandler, useEffect, useRef, useState } from "react"
import { wsURL } from ".."
import { setNavbarInfo } from "./Root"

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

type OutputViewData = {
    target: string,
    result: [string, number][],
    resetter: () => void;
    time: number
}

function OutputView({target, result, time, resetter} : OutputViewData){
    const {container, dimension} = useGridTiling({ width: 250, height: 250 })
    const [currentPage, setCurrentPage] = useState<number>(0)

    const paginationSize =  dimension.col * dimension.row - 1
    const maxPage = Math.ceil(result.length / paginationSize) - 1

    return <div className="absolute flex flex-col w-[75vw] h-[75vh]">
        <div ref={container} className="flex-grow grid overflow-hidden gap-2" style={{
            gridTemplateColumns: `repeat(${dimension.col}, 1fr)`,
            gridTemplateRows: `repeat(${dimension.row}, 1fr)`
        }}>

            <div className="bg-white w-full h-full overflow-hidden flex justify-center items-center rounded-br-xl flex-col relative">
                <img className="object-contain max-w-[200px] max-h-[200px]" src={target} />
                <button onClick={resetter}>
                    <XIcon className="bg-red-500 text-white absolute top-0 right-0" />
                </button>
                <div>Found {result.length} match in {time}ms</div>
            </div>
            {
                paginationSize > 0 ? result.slice(currentPage * paginationSize, (currentPage + 1) * paginationSize).map(([path, value]) => {
                    return <div key={path} className="overflow-hidden flex flex-col justify-center items-center">
                        <img className="object-contain max-w-[200px] max-h-[200px]" src={`/dataset/${path}`} />
                        <div>{`${path} (${Math.floor(value * 100)}%)`}</div>
                    </div>
                }) : null
            }
        </div>
        <div className="flex-shrink-0 flex flex-col">
            <div className="h-fit flex-grow bg-white px-16 flex flex-col cursor-grab active:cursor-grabbing">
                <SliderPrimitive.Root
                    className="relative flex-grow h-full"
                    min={0}
                    max={maxPage}
                    defaultValue={[currentPage]}
                    onValueChange={([value]) => setCurrentPage(value)}
                >
                    <SliderPrimitive.Track className="relative h-full">
                        <SliderPrimitive.Range />
                    </SliderPrimitive.Track>
                    <SliderPrimitive.Thumb className="outline-none h-full" >
                        <div className="w-32 h-full bg-blue-300 text-center">{(currentPage + 1) + "/" + (maxPage + 1)}</div>
                    </SliderPrimitive.Thumb>
                    <div className="opacity-0 pointer-events-none">{currentPage}</div>
                </SliderPrimitive.Root>
            </div>
        </div>
    </div>
}

export default function(){
    const [image, setImage] = useState<File>()
    const [previewImage, setPreviewImage] = useState<string>()
    const [pageState, setPageState] = useState<"input" | "loading" | "output">("input")
    const [progress, setProgress] = useState<number>(0)
    const [msg, setMsg] = useState<string>("")

    const [outputViewData, setOutputViewData] = useState<OutputViewData>(null)

    useEffect(() => {
        (async () => {
            const res = await fetch("/api/dataset/count")
            const { count } = await res.json()
            if(count == 0) setNavbarInfo(<p className="text-red-500 w-full text-center">Dataset Empty!</p>)
        })()
    }, [])

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
        e.currentTarget.value = null
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

    const resetter = () => {
        setImage(null)
        setPreviewImage(null)
        setPageState("input")
        setProgress(0)
        setMsg("")
    }

    const wscRef = useRef<WebSocket>()
    const cbirHandler = async (method: string) => {
        setOutputViewData(null)
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
            const { msg, finished, time } = await JSON.parse(raw)
            if(finished){
                const result = Object.entries(msg as Record<string, number>).filter(([_, v]) => v >= 0.6).sort(([_1, v1], [_2, v2]) => {
                    return v2 - v1
                }) as any
                setOutputViewData({
                    result, time, resetter,
                    target: previewImage,
                })
            } else {
                const prog = getProgress(msg)
                if(!Number.isNaN(prog)) setProgress(getProgress(msg))
                setMsg(msg)
            }
        })
    }

    useEffect(() => {
        if(outputViewData != null) setPageState("output")
    }, [outputViewData])

    return <div className="w-full h-full flex flex-row justify-center items-center">

        <div className={cn(
            "flex flex-col bg-blue-300 rounded-md items-center justify-center",
        )}>

            <div className={cn(
                "transition-all overflow-hidden",
                pageState == "input" ? "max-w-[100vw] max-h-[100vh] duration-1000 delay-500 m-5" : "max-w-0 max-h-0 duration-0"
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

                <div className="flex flex-row justify-center items-center relative">
                    <div className={cn(
                        "flex relative max-w-[50vw] max-h-[50vh] group transition-dimension duration-500 justify-center items-center",
                        previewImage ? "" : "max-h-[0px] max-w-[0px]"
                    )}>
                        <button onClick={resetter} className={cn("absolute top-0 right-0 hidden group-hover:block", previewImage ? "" : "hidden")}>
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
                "transition-dimension overflow-hidden duration-1000 flex flex-col gap-2 whitespace-nowrap",
                pageState == "loading" ? "max-w-[100vw] max-h-[100vh] m-5" : "max-w-0 max-h-0 delay-300"
            )}>
                <div className={cn(
                    "w-96 max-w-[50vw] h-5 bg-white border-2 transition-all",
                    pageState == "loading" ? "" : "w-0 h-0 delay-100 border-0 duration-700"
                )}>
                    <div className="bg-blue-300 h-full" style={{ width: `${progress}%` }}></div>
                </div>
                <div className={cn(
                    "overflow-hidden w-96 max-w-[50vw] text-ellipsis transition-opacity",
                    pageState == "loading" ? "" : "hidden"
                )}>{msg}</div>
            </div>

            <div
                className={cn(
                    "transition-all overflow-hidden flex flex-col gap-2 whitespace-nowrap w-[75vw] h-[75vh] relative duration-700",
                    pageState == "output" ? "delay-500" : "w-0 h-0 opacity-0"
                )}>
                {outputViewData ?
                    (outputViewData.result.length == 0 ?
                        <div className="flex flex-col w-full h-full justify-center items-center">
                            <div className="relative">
                                <button onClick={resetter} className="absolute top-0 right-0">
                                    <XIcon className="text-white bg-red-600" />
                                </button>
                                <img className="max-w-[40vw] max-h-[40vh] rounded-lg" src="/chicken.webp" />
                            </div>
                            <p>Nobody here but us chickens</p>
                        </div> :
                        <OutputView {...outputViewData} />)
                    : null}
            </div>

        </div>
    </div>
}