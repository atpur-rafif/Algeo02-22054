import { DragEventHandler, FormEventHandler, useEffect, useState } from "react"
import { Upload, X } from "lucide-react"

function FileToBase64(file: File): Promise<string>{
    return new Promise((resolve) => {
        const fileReader = new FileReader()

        fileReader.addEventListener("load", () => {
            resolve(fileReader.result as string)
        })

        fileReader.readAsDataURL(file)
    })
}

export default function(){
    const [image, setImage] = useState<File>()
    const [previewImage, setPreviewImage] = useState<string>()

    const checkImage = (file: File) => {
        if (!file) return
        if (!file.type.startsWith("image")) return

        setImage(file)
    }

    const dropHandler: DragEventHandler<HTMLLabelElement> = (e) => {
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

    return <div className="w-full h-full flex flex-col justify-center items-center">
        <div className="flex flex-row">
            {previewImage ?
            <div className="flex flex-row">
                <div className="flex relative max-w-[50vw] max-h-[50vh] group border-2">
                    <button onClick={() => setImage(null)} className="absolute top-0 right-0 hidden group-hover:block">
                        <X className="bg-red-500" />
                    </button>
                    <img className="object-scale-down max-w-[inherit] max-h-[inherit]" src={previewImage} />
                </div>
            </div>
                :
                <>
                    <label
                        onDragOver={(e) => {
                            e.preventDefault()
                            e.currentTarget.setAttribute("data-dragged", "")
                        }}
                        onDragLeave={(e) => e.currentTarget.removeAttribute("data-dragged")}
                        onDrop={dropHandler}
                        htmlFor="inp-file"
                        className="bg-blue-300 w-40 h-40 flex flex-col justify-center items-center data-[dragged]:text-white hover:text-white cursor-pointer"
                    >
                        <Upload className="w-1/2 h-1/2" />
                        <p className="text-xs">Upload or Drop Here</p>
                    </label>
                    <input id="inp-file" type="file" onInput={fileHandler} hidden />
                </>
            }
        </div>
        {
            image ? <button>Find</button> : null
        }
    </div>
}