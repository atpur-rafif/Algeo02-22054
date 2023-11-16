import { createRoot } from "react-dom/client"
import Cbir from "./route/Cbir"
import Dataset from "./route/Dataset"

export const wsURL = `ws${window.location.protocol.endsWith("s") ? "s" : ""}://${window.location.host}`

function App(){
    return <div className="w-screen h-screen">
        <Cbir />
    </div>
}

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(<App />)