import React, { useState } from 'react'

const useFileOperation = () => {
    const [fileTree, setFileTree] = useState([]);
    const [selectedPath, setSelectedPath] = useState('/');
    const [openedFiles, setOpenedFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [status, setStatus] = useState(null);

    // get all files
    async function getAllFiles() {
        try {
            const data = await fetch(`http://localhost:4000/api/files`);
            const result = await data.json();
            if(result.data){
                setFileTree(result.data);   
            }else{
                console.log(result.error);
            }
        } catch (error) {
            console.log(error);
        } 
    }

    async function handleFileRead(filePath) {
        const existingFile = openedFiles.find(file => file.path === filePath);
        if (existingFile) {
            setActiveFile(existingFile);
            return;
        }

        try {
            const response = await fetch(`http://localhost:4000/api/read-file?path=${encodeURIComponent(filePath)}`);
            const result = await response.json();

            if (result.data) {
                const newFile = { path: filePath, content: result.data.content };
                setOpenedFiles(prev => [...prev, newFile]);
                setActiveFile(newFile);
            } else {
                setStatus("❌ Error loading file.");
            }
        } catch (err) {
            setStatus("❌ Failed to fetch file: " + err.message);
        }
    }

    async function handleFileSave() {
        if (!activeFile?.path) return;
        try {
            const response = await fetch("http://localhost:4000/api/update-file", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: activeFile.path,
                    content: activeFile.content
                }),
            });

            const result = await response.json();
            if (result.data?.relativePath) {
                setStatus('success');
            } else {
                setStatus('failed');
            }
        } catch {
            setStatus('failed');
        }

        setTimeout(() => setStatus(''), 1500);
    }

    async function createItem(type){
        const name = prompt(`Enter ${type} name`);
        if(!name) return;
        const header = {
            "Content-Type": "application/json",
        }
        const body = {
            path: selectedPath,
            name
        }
        const data = await fetch("http://localhost:4000/api/create-" + type, {
            method: "POST",
            headers: header,
            body: JSON.stringify(body)
        });
        const res = await data.json();
        if (res.data && res.data.relativePath) {
            await getTreeFiles();
            // if (type === "file") {
            //     await handleFileClick(res.data.relativePath);
            // }
            setSelectedPath(res.data.relativePath);
            setIsActive("bg-[#063c8f] font-light text-white");
        }else{
            alert(res.error);
        }
    }

    async function handleRenameFile(){
        const newName = prompt(contextFile.name);
        if(newName){
            try {
                const data = await fetch("http://localhost:4000/api/rename", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        oldPath: selectedPath,
                        newName: newName
                    })
                })
                const result = await data.json();
                if (result.data && result.data.relativePath) {
                    await getTreeFiles();
                    // if(!contextFile.isDirectory){
                    //     setSelectedPath(`${result.data.relativePath}`);
                    // }
                }

            } catch (error) {
                 console.log(error);
            }
        }
    }

    async function handleDeleteFile(){
        try {
            const data = await fetch("http://localhost:4000/api/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: selectedPath
                })
            })
            const result = await data.json();
            if (result.data && result.data.relativePath) {
                await getTreeFiles();
            }
        } catch (error) {
             console.log(error);
        }
    }

    // function handleCopyFilePath(){
    //     navigator.clipboard.writeText(contextFile.absolutePath);
    // }

    return{
        fileTree,
        setFileTree,
        selectedPath,
        setSelectedPath,
        openedFiles,
        setOpenedFiles,
        activeFile,
        setActiveFile,
        status,
        setStatus,
        getAllFiles,
        handleFileRead,
        handleFileSave,
        createItem,
        handleRenameFile,
        handleDeleteFile
    }
}

export default useFileOperation