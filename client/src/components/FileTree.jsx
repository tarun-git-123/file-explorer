import React, { useEffect, useState } from "react";
import RenderTree from "./renderTree";

const FileTree = ({tree,selectedPath, setSelectedPath, handleFileClick }) => {
    return (
        <div className="p-2 font-extralight">
            {tree && tree.map((file,index) => (
                <RenderTree file={file} key={index} selectedPath={selectedPath} setSelectedPath={setSelectedPath} handleFileClick={handleFileClick}/>
            ))}
        </div>
    );
};

export default FileTree;
