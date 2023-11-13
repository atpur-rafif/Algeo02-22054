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
    const [imageQueue, setImageQueue] = useState<File[]>([])
    const [currentPage, setCurrentPage] = useState(0)

    useEffect(() => {
        ;(async () => {
            const res = await fetch("/dataset")
            const data = await res.json()
            setImageDataset(data)
        })();
    }, [])

    const fileInputHandler: React.FormEventHandler<HTMLInputElement>  = useCallback(function (e) {
        setImageQueue([...imageQueue, ...Array.from(e.currentTarget.files)])
    }, [])

    useEffect(() => {
        console.log(imageQueue)
    }, [imageQueue])

    const paginationSize = dimension.col * dimension.row
    const page: (() => readonly [string, JSX.Element])[] = [
        () => {
            return ["Upload New", <>
                <label htmlFor="inp-dir" className="w-full h-full flex items-center justify-center cursor-pointer">
                    <div>
                        Add New<br/>(Folder)
                    </div>
                </label>
                {/* 
                // @ts-expect-error */}
                <input id="inp-dir" hidden type="file" multiple directory="true" webkitdirectory="true" onInput={fileInputHandler} />
            </>] as const
        },
        ...makeLazyArray(imageQueue, (file) => {
            return [file.name, <div>{file.name}</div>] as const
        }),
        ...makeLazyArray(imageDataset, (path) => {
            // Create image loader, with loading UI state
            return [path, <div>
                <img src={path} />
            </div>] as const
        })
    ]

    return <div className="w-full h-full flex flex-col bg-gray-400">
        <div ref={container} className="w-full h-full grid overflow-hidden gap-2 flex-grow" style={{
            gridTemplateColumns: `repeat(${dimension.col}, 1fr)`,
            gridTemplateRows: `repeat(${dimension.row}, 1fr)`
        }}>
            {page.slice(currentPage * paginationSize, (currentPage + 1) * paginationSize).map(fn => {
                const [key, el] = fn()
                return <div className="w-full h-full overflow-hidden" key={key}>
                    {el}
                </div>
            })}
        </div>
        <div className="flex-shrink-0 flex flex-col">
            <div className="h-fit flex-grow bg-white px-10 flex flex-col cursor-grab active:cursor-grabbing">
                <SliderPrimitive.Root
                    className="relative flex-grow h-full"
                    min={0}
                    max={Math.floor(page.length / paginationSize)}
                    defaultValue={[currentPage]}
                    onValueChange={([value]) => setCurrentPage(value)}
                >
                    <SliderPrimitive.Track className="relative h-full">
                        <SliderPrimitive.Range />
                    </SliderPrimitive.Track>
                    <SliderPrimitive.Thumb className="outline-none h-full" >
                        <div className="w-20 h-full bg-blue-300 text-center">{currentPage}</div>
                    </SliderPrimitive.Thumb>
                    <div className="opacity-0 pointer-events-none">{currentPage}</div>
                </SliderPrimitive.Root>
            </div>
        </div>
    </div>
}