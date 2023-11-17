import { ElementType, useCallback, useEffect, useRef, useState } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import React from "react"
import { useGridTiling } from "@/lib/utils"
import { setNavbarInfo } from "./Root"
import { Folder, RefreshCcw, Trash2 } from "lucide-react"

function makeLazyArray<T, U>(values: T[], fn: (param: T) => U): (() => U)[] {
    return values.map(value => {
        return fn.bind(null, value) as () => U
    })
}

export default function(){
    const {dimension, container} = useGridTiling({ width: 150, height: 150 })
    const [imageDataset, setImageDataset] = useState<string[]>([])
    const [currentPage, setCurrentPage] = useState(0)

    const refreshDataset = async () => {
        const res = await fetch("/api/dataset")
        const data = await res.json()
        setImageDataset(data)
    }

    const imageQueue = useRef(new (class{
        maxCount = 10
        currentCount = 0
        queue: File[] = []
        datasetSetter: React.Dispatch<React.SetStateAction<string[]>>

        preventExit: boolean = false
        unloadListener(){
            return "Program still uploading, are you sure want to exit and stop uploading? (Uploaded file still exist on server)"
        }

        process(){
            if(this.queue.length == 0){
                this.preventExit = false
                window.onbeforeunload = null
                return
            }
            if(this.currentCount == this.maxCount) return
            if(!this.preventExit){
                this.preventExit = true
                window.onbeforeunload = this.unloadListener
            }

            const form = new FormData()
            form.append("image", this.queue.pop())
            fetch("/api/dataset", {
                method: "POST",
                body: form
            }).then(() => {
                this.currentCount--
                this.process()
                refreshDataset()
                setNavbarInfo(<p className="w-full text-center">{`Uploading... (${this.queue.length} remaining)`}</p>)
                if(this.queue.length == 0) setNavbarInfo(null)
            })
            this.currentCount++

            this.process()
        }

        push(...files: File[]){
            // Callstack problem???
            if(this.queue.length == 0) this.queue = files
            else this.queue.push(...files)
            this.process()
        }
    })())

    useEffect(() => {
        refreshDataset()
    }, [])

    const fileInputHandler: React.FormEventHandler<HTMLInputElement>  = useCallback(function (e) {
        imageQueue.current.push(...Array.from(e.currentTarget.files))
    }, [])

    const deleteAllHandler = useCallback(() => {
        if (confirm("Are you sure want to delete all images from dataset?")) {
            fetch("/api/dataset", {
                method: "DELETE"
            }).then(() => {
                refreshDataset()
            })
        }
    }, [])

    const clearCacheHandler = useCallback(() => {
        if (confirm("Are you sure want to clear all cache from dataset?")) {
            fetch("/api/dataset/cache", {
                method: "DELETE"
            }).then(() => {
                alert("Cache cleared")
            })
        }
    }, [])

    useEffect(() => {
        imageQueue.current.datasetSetter = setImageDataset
    })

    const paginationSize = dimension.col * dimension.row
    const page: (() => readonly [string, JSX.Element])[] = [
        () => {
            return ["Upload New", <>
                <label htmlFor="inp-dir" className="w-full h-full flex items-center justify-center cursor-pointer bg-white">
                    <div className="flex flex-col text-sm justify-center items-center">
                        <Folder className="w-16 h-16" />
                        <p>Add New</p>
                        <p>(Folder)</p>
                    </div>
                </label>
                {/* 
                // @ts-expect-error */}
                <input id="inp-dir" hidden type="file" multiple directory="true" webkitdirectory="true" onInput={fileInputHandler} />
            </>] as const
        },
        () => {
            return ["Delete All", <button className="w-full h-full flex items-center justify-center bg-white" onClick={deleteAllHandler}>
                <div className="flex flex-col text-sm justify-center items-center">
                    <Trash2 className="w-16 h-16" />
                    <p>Delete All</p>
                </div>
            </button>]
        },
        () => {
            return ["Delete All", <button className="w-full h-full flex items-center justify-center bg-white" onClick={clearCacheHandler}>
                <div className="flex flex-col text-sm justify-center items-center">
                    <RefreshCcw className="w-16 h-16" />
                    <p>Clear Cache</p>
                </div>
            </button>]
        },
        ...makeLazyArray(imageDataset, (path) => {
            // Create image loader, with loading UI state
            return [path, <div className="max-w-full max-h-full overflow-hidden border-4 border-blue-300">
                <img className="object-contain max-h-[130px] max-w-[130px]" src={"/dataset/" + path} />
                {/* <img className="object-contain max-h-[100px] max-w-[100px]" src="https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D" /> */}
            </div>] as const
        })
    ]
    const maxPage = Math.ceil(page.length / paginationSize) - 1;

    return <div className="w-screen h-screen flex flex-col">
        <div ref={container} className="w-full h-full grid overflow-hidden gap-2 flex-grow p-5" style={{
            gridTemplateColumns: `repeat(${dimension.col}, 1fr)`,
            gridTemplateRows: `repeat(${dimension.row}, 1fr)`
        }}>
            {page.slice(currentPage * paginationSize, (currentPage + 1) * paginationSize).map(fn => {
                const [key, el] = fn()
                return <div className="w-full h-full overflow-hidden flex justify-center items-center bg-white" key={key}>
                    {el}
                </div>
            })}
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