import { Info } from "lucide-react"

export default function() {

    return (
        <div className="flex-grow w-full h-full">
            <div className="flex flex-col h-[16rem] mx-12 items-center bg-blue-300 mt-6 py-6 rounded-xl">
                <p className="font-semibold text-3xl mb-1">iCBIR - Image Retriever</p>
                <p className="text mb-4"><i>by</i>  Frontend: Prolog / Backend: Haskell</p>
                <img src="/FotoAlgeo.jpg" className="max-w-[20rem] max-h-[20rem] rounded-xl hover:max-w-[26rem] hover:max-h-[26rem] transition-all duration-300"/>
            </div>
        </div>
    )
}