import React, { useState } from "react"

export default function Button(){
    const [count, setCount] = useState(0)
    return <button className="border-black border-2 p-3" onClick={() => setCount(count + 1)}>Count: ({count})</button>
}