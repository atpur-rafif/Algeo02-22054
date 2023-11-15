import { ElementType, useCallback, useEffect, useRef, useState } from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"
import React from "react"

function useGridTiling(size: {
    width: number,
    height: number
}){
    const container = useRef<HTMLDivElement>()

    const [dimension, setDimension] = useState({
        col: 0,
        row: 0
    })

    useEffect(() => {
        const observer = new ResizeObserver(([{contentRect: {height, width}}]) => {
            setDimension({
                col: Math.floor(width / size.width),
                row: Math.floor(height / size.height)
            })
        })
        observer.observe(container.current)

        return () => observer.disconnect()
    }, [])

    return {dimension, container} as const
}

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
        const res = await fetch("/dataset")
        const data = await res.json()
        setImageDataset(data)
    }

    const imageQueue = useRef(new (class{
        maxCount = 10
        currentCount = 0
        queue: File[] = []
        datasetSetter: React.Dispatch<React.SetStateAction<string[]>>

        process(){
            if(this.queue.length == 0) return
            if(this.currentCount == this.maxCount) return

            const form = new FormData()
            form.append("image", this.queue.pop())
            fetch("/dataset", {
                method: "POST",
                body: form
            }).then(() => {
                this.currentCount--
                this.process()
                refreshDataset()
            })
            this.currentCount++

            this.process()
        }

        push(...files: File[]){
            this.queue.push(...files)
            this.process()
        }
    })())

    useEffect(() => {
        refreshDataset()
    }, [])

    const fileInputHandler: React.FormEventHandler<HTMLInputElement>  = useCallback(function (e) {
        imageQueue.current.push(...Array.from(e.currentTarget.files))
    }, [])

    useEffect(() => {
        imageQueue.current.datasetSetter = setImageDataset
    })


    const paginationSize = dimension.col * dimension.row
    const page: (() => readonly [string, JSX.Element])[] = [
        () => {
            return ["Upload New", <>
                <label htmlFor="inp-dir" className="w-full h-full flex items-center justify-center cursor-pointer bg-white">
                    <div>
                        Add New<br/>(Folder)
                    </div>
                </label>
                {/* 
                // @ts-expect-error */}
                <input id="inp-dir" hidden type="file" multiple directory="true" webkitdirectory="true" onInput={fileInputHandler} />
            </>] as const
        },
        ...makeLazyArray(imageDataset, (path) => {
            // Create image loader, with loading UI state
            return [path, <div className="max-w-full max-h-full overflow-hidden">
                <img className="object-contain max-h-[130px] max-w-[130px]" src={"/dataset/" + path} />
                {/* <img className="object-contain max-h-[100px] max-w-[100px]" src="https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxleHBsb3JlLWZlZWR8MXx8fGVufDB8fHx8fA%3D%3D" /> */}
            </div>] as const
        })
    ]
    const maxPage = Math.ceil(page.length / paginationSize) - 1;

    return <div className="w-full h-full flex flex-col bg-blue-300">
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