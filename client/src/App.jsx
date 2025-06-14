import React from "react";
import CodeEditor from "./components/CodeEditor";
import Sidebar from "./components/Sidebar";

function App() {
    return (
        <div className="w-full flex h-screen text-white">
            <Sidebar/>
            <CodeEditor/>     
        </div>
    );
}

export default App;
