import { Camera, Database, Home, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export let setNavbarInfo: React.Dispatch<React.SetStateAction<JSX.Element>> = null

const navbar: {
    name: string,
    path: string,
    icon: JSX.Element
}[] = [
    {
        name: "Home",
        path: "/",
        icon: <Home />
    },
    {
        name: "Dataset",
        path: "/dataset",
        icon: <Database />
    },
    {
        name: "Camera",
        path: "/camera",
        icon: <Camera />
    },
    {
        name: "Info",
        path: "/info",
        icon: <Info />
    }
]

export default function(){
    const [info, setInfo] = useState<JSX.Element>(<></>)

    useEffect(() => {
        setNavbarInfo = setInfo
    })

    return <div className="w-screen h-screen flex flex-col justify-center items-center">
        <div className="flex-shrink-0 transition-all group relative bg-blue-300 grid grid-rows-[0fr] hover:grid-rows-[1fr] w-full border-b-2 border-white">
            <div className="overflow-hidden w-full">
                <ul className="p-7 flex flex-row justify-center items-center gap-16 text-lg">
                    {navbar.map(({ name, path, icon }) => {
                        return <li className="hover:text-white transition-colors" key={path}>
                            <a className="flex flex-row items-center justify-center gap-2" href={path}>
                                {icon}
                                <p>{name}</p>
                            </a>
                        </li>
                    })}
                </ul>
            </div>
            <div className="absolute z-30 left-1/2 -translate-x-1/2 bg-blue-300 rounded-b-lg w-1/2 min-h-[1.5rem] border-2 border-t-0 border-white group-hover:opacity-0">
                <div className="group-hover:opacity-0">{info}</div>
            </div>
        </div>
        <Outlet />
    </div>
}