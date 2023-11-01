import { createRoot } from "react-dom/client"
import { Button } from "@/components/ui/button"

function App(){
    return <div className="w-screen h-screen flex items-center justify-center">
        <Button>This is a button</Button>
    </div>
}

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(<App />)
