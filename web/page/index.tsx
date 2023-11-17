import { createRoot } from "react-dom/client"
import Cbir from "./route/Cbir"
import Dataset from "./route/Dataset"
import Camera  from "./route/Camera"
import { RouterProvider, createBrowserRouter } from "react-router-dom"
import Root from "./route/Root"

export const wsURL = `ws${window.location.protocol.endsWith("s") ? "s" : ""}://${window.location.host}`

const router = createBrowserRouter([{
    path: "/",
    element: <Root />,
    children: [
        {
            path: "",
            element: <Cbir />
        },
        {
            path: "/dataset",
            element: <Dataset />
        },
        {
            path: "/camera",
            element: <Camera />
        }
    ]
}])

function App(){
    return <RouterProvider router={router} />
}

const root = createRoot(document.getElementById("root") as HTMLElement)
root.render(<App />)