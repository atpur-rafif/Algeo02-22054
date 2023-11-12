import { createRoot } from "react-dom/client"

function App(){
    return <div className="w-screen h-screen flex justify-center">
        Hello
    </div>
}

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(<App />)
