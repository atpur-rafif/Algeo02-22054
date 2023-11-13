import { createRoot } from "react-dom/client"
import Cbir from "./route/Cbir"

function App(){
    return <div className="w-screen h-screen">
        <Cbir />
    </div>
}

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(<App />)