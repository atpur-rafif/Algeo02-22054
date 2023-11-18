import { clsx, type ClassValue } from "clsx"
import { useEffect, useRef, useState } from "react"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function useGridTiling(size: {
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
        if(container.current) observer.observe(container.current)

        return () => observer.disconnect()
    }, [])

    return {dimension, container} as const
}

