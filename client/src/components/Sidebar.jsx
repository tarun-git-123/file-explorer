import React, { useEffect, useState } from "react";
import RenderTree from "./renderTree";
import { useFileOperation } from '../FileOperationContext';

const Sidebar = () => {
    const [contextMenu, setContextMenu] = useState(null);
    const [contextFile, setContextFile] = useState(null);

    const {fileTree, getAllFiles,selectedPath,setSelectedPath, createItem, handleRenameFile, handleDeleteFile,handleCopyFilePath} = useFileOperation();
    
    function handleGlobalContextMenu(file, e) {
        e.preventDefault();
        setContextFile(file);
        setContextMenu({
            mouseX: e.pageX,
            mouseY: e.pageY,
        });
        setSelectedPath(file.relativePath);
    }

    useEffect(() => {
        getAllFiles();

        const handleClickOutside = (e) => {
            setContextFile(null);
            setContextMenu(null);
        }

        const handleDoubleClickOutside = (e) => {
            setSelectedPath("/");
        }

        document.addEventListener("click", handleClickOutside);
        document.addEventListener("dblclick", handleDoubleClickOutside);
        return () => {
            document.removeEventListener("click", handleClickOutside);
            document.removeEventListener("dblclick", handleDoubleClickOutside);
        };
    }, []);
    
    return (
        <>
            <aside className="w-[20%] bg-[#1e1e1e] p-2">
                <div className="w-[100%] mb-2">
                    <div className="flex items-center justify-between pt-[2px]">
                        <span className="font-semibold">EXPLORER</span>
                        <div className="space-x-1">
                            <button onClick={() => createItem("folder")} className="bg-gray-700 px-2 py-1 rounded text-xs">+📁</button>
                            <button onClick={() => createItem("file")} className="bg-gray-700 px-2 py-1 rounded text-xs">+📄</button>
                        </div>
                    </div>
                    <div className="h-[1px] bg-gray-700 my-2"></div>
                    <input className="w-full bg-gray-700 px-2 py-2 rounded text-sm" value={`Path: ${selectedPath}`} onChange={ (e) => handleCopyFilePath(e.target.value)}/>
                </div>
                {fileTree && fileTree.length > 0 &&
                    fileTree.map((file, index) => (
                        <RenderTree file={file} key={index} onContextMenu={handleGlobalContextMenu}/>
                    ))
                }

                {    
                    contextMenu && contextFile &&
                    <ul className="bg-white text-black w-[200px] py-2 rounded-md text-sm z-50 absolute" 
                        style={{
                            top: contextMenu.mouseY,
                            left: contextMenu.mouseX
                        }}>
                        <li className='mb-1 cursor-pointer hover:bg-[#ccc] pl-5 py-1 mt-2' onClick={() => createItem("file")}>Create file</li>
                        <li className='mb-1 cursor-pointer hover:bg-[#ccc] pl-5 py-1 mt-2' onClick={() => createItem("folder")}>Create folder</li>
                        <li className='mb-1 cursor-pointer hover:bg-[#ccc] pl-5 py-1 mt-2' onClick={()=>handleRenameFile(contextFile)}>Rename</li>
                        <li className='mb-1 cursor-pointer hover:bg-[#ccc] pl-5 py-1' onClick={handleDeleteFile}>Delete</li>
                        <li className='mb-1 cursor-pointer hover:bg-[#ccc] pl-5 py-1' onClick={()=>handleCopyFilePath(contextFile)}>Copy file path</li>
                    </ul>
                }
           </aside> 
        </>
    );
};

export default Sidebar;
