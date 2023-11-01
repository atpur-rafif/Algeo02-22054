import React from "react"
import { createRoot } from "react-dom/client"
import Button from "./components/Button"

function App(){
    return <div>
        <Button></Button>
    </div>
}

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(<App />)
