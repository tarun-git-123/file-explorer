import React, { createContext, useContext, useState } from 'react';

const FileOperationContext = createContext();

export const FileOperationProvider = ({ children }) => {
    const [fileTree, setFileTree] = useState([]);
    const [selectedPath, setSelectedPath] = useState('/');
    const [openedFiles, setOpenedFiles] = useState([]);
    const [activeFile, setActiveFile] = useState(null);
    const [status, setStatus] = useState(null);
    const [activeFileBackground, setActiveFileBackground] = useState(null);
    const [language, setLanguage] = React.useState('plantext');

    async function getAllFiles() {
        try {
            const data = await fetch(`http://localhost:4000/api/files`);
            const result = await data.json();
            if(result.data){
                setFileTree(result.data);   
            } else {
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
                detectLanguageByPath(filePath);
                setActiveFileBackground("bg-[#3a3b3c] font-light text-white");
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
        };
        const body = {
            path: selectedPath,
            name
        };
        const data = await fetch("http://localhost:4000/api/create-" + type, {
            method: "POST",
            headers: header,
            body: JSON.stringify(body)
        });
        const res = await data.json();
        if (res.data && res.data.relativePath) {
            await getAllFiles();
            await handleFileRead(res.data.relativePath);
            setSelectedPath(res.data.relativePath);
        } else {
            alert(res.error);
        }
    }

    async function handleRenameFile(contextFile){
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
                });
                const result = await data.json();
                if (result.data && result.data.relativePath) {
                    await getAllFiles();
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    async function handleMoveFile(oldPath, newPath){
        try {
            const data = await fetch("http://localhost:4000/api/move", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldPath: oldPath,
                    newPath: newPath
                })
            });
            const result = await data.json();
            if (result.data && result.data.relativePath) {
                await getAllFiles();
                setSelectedPath("/");
            }
        } catch (error) {
            console.log(error);
        }
    }

    async function handleDeleteFile() {
        try {
            const data = await fetch("http://localhost:4000/api/delete", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: selectedPath
                })
            });
            const result = await data.json();
            if (result.data && result.data.relativePath) {
                await getAllFiles();
                setSelectedPath("/");
            }
        } catch (error) {
            console.log(error);
        }
    }

    function handleCopyFilePath(contextFile){
        navigator.clipboard.writeText(contextFile.absolutePath);
    }

    function detectLanguageByPath(selectedPath) {
        if (selectedPath.endsWith(".js")) return setLanguage("javascript");
        if (selectedPath.endsWith(".ts")) return setLanguage("typescript");
        if (selectedPath.endsWith(".html")) return setLanguage("html");
        if (selectedPath.endsWith(".css")) return setLanguage("css");
        if (selectedPath.endsWith(".json")) return setLanguage("json");
        if (selectedPath.endsWith(".php")) return setLanguage("php");
        if (selectedPath.endsWith("")) return setLanguage("plaintext");
    }

    function detectLanguageByName(lang) {
        if (lang==="js") return setLanguage("plaintext");
        if (lang==="ts") return setLanguage("plaintext");
        if (lang==="html") return setLanguage("plaintext");
        if (lang==="css") return setLanguage("plaintext");
        if (lang==="json") return setLanguage("plaintext");
        if (lang==="php") return setLanguage("plaintext");
        if (lang==="") return setLanguage("plaintext");
    }

    return (
        <FileOperationContext.Provider
            value={{
                fileTree,
                selectedPath,
                openedFiles,
                activeFile,
                status,
                activeFileBackground,
                setActiveFileBackground,
                setFileTree,
                setSelectedPath,
                setOpenedFiles,
                setActiveFile,
                setStatus,
                getAllFiles,
                handleFileRead,
                handleFileSave,
                createItem,
                handleRenameFile,
                handleDeleteFile,
                handleCopyFilePath,
                handleMoveFile,
                detectLanguageByPath,
                detectLanguageByName,
                language,
                setLanguage
            }}
        >
            {children}
        </FileOperationContext.Provider>
    );
};

// Hook to use it in components
export const useFileOperation = () => useContext(FileOperationContext);