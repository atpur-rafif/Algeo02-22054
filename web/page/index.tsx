import { createRoot } from "react-dom/client"
import Dataset from "./route/Dataset"

function App(){
    return <div className="w-screen h-screen">
        <Dataset />
    </div>
}

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(<App />)