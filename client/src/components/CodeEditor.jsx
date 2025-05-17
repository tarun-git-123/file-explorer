import React, { useEffect, useRef, useState } from 'react'
import Editor from "@monaco-editor/react";
import useTheme from "../hooks/useTheme";
import useSaveShortcut from "../hooks/useSaveShortcut";
import { useFileOperation } from '../FileOperationContext';

const CodeEditor = () => {
    const [indentSpaces, setIndentSpaces] = useState("4");
    const editorRef = useRef(null);
    const { isDarkMode, toggleTheme } = useTheme();
    const { openedFiles, setOpenedFiles, activeFile, setActiveFile, selectedPath, setSelectedPath, handleFileSave, language, setLanguage, detectLanguageByPath} = useFileOperation();
    const { zoom,setZoom } = useSaveShortcut(handleFileSave); // save file when ctrl+s is pressed
    const updateActiveFileContent = (newContent) => {
        if (!activeFile) return;
        setActiveFile(prev => ({ ...prev, content: newContent }));
        setOpenedFiles(prev =>
            prev.map(file =>
                file.path === activeFile.path ? { ...file, content: newContent } : file
            )
        );
    };

    function closeTab(path) {
        setOpenedFiles(prev => {
            const updated = prev.filter(file => file.path !== path);
            if (activeFile?.path === path) {
                setActiveFile(updated[updated.length - 1] || null);
                setSelectedPath(updated[updated.length - 1]?.path || "/");
                detectLanguageByPath(updated[updated.length - 1]?.path || "/");
            }
            return updated;
        });
    }

    const handleEditorDidMount = (editor) => {
        editorRef.current = editor;
    };
    
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.focus();
        }
    }, [activeFile]);
    return (
        <>
            {activeFile && activeFile.path && 
            <div className="w-[80%] bg-[#111111] flex-1 border-l-2 border-l-[#2e2e2e] flex flex-col">
                <div className="flex bg-[#1a1a1a] border-b border-gray-700 text-sm">
                    {openedFiles.map((file) => (
                        <div
                            key={file.path} title={file.path}
                            className={`px-4 py-[12px] cursor-pointer ${file.path === activeFile?.path ? "bg-[#252525] text-white" : "text-gray-400"}`}
                            onClick={() => { setActiveFile(file); setSelectedPath(file.path); detectLanguageByPath(file.path); }}
                        >
                            {file.path.split("\\").pop()}
                            <span
                                className="ml-2 text-red-400"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    closeTab(file.path);
                                }}
                            >
                                ×
                            </span>
                        </div>
                    ))}
                </div>

                <Editor
                    height="90%"
                    language={language}
                    value={activeFile?.content}
                    path={activeFile?.path}
                    theme={`vs-${isDarkMode ? "dark" : "light"}`}
                    options={{
                        tabSize: indentSpaces,
                        insertSpaces: true,
                        detectIndentation: false,
                        autoIndent: "full",
                        fontSize: zoom,
                    }}
                    onMount={handleEditorDidMount}
                    onChange={(value) => updateActiveFileContent(value)}
                />

                <div className="bg-[#1a1a1a] text-white h-[50px] text-[13px] flex items-center justify-end border-t border-gray-700">
                    <label className="bg-[#1a1a1a] text-white mx-3 w-[auto] p-1">Zoom in/out: <span className="text-red">ctrl</span> + <span className="text-red">+</span> / <span className="text-red">-</span></label>
                    <label>
                        Language:
                        <select value={language} onChange={(e) => setLanguage(e.target.value)} className="bg-[#1a1a1a] text-white mx-3 w-[auto] border border-gray-700 rounded-md p-1">
                            <option value="plaintext">Plaintext</option>
                            <option value="javascript">JavaScript</option>
                            <option value="php">PHP</option>
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="json">JSON</option>
                        </select>
                    </label>

                    <label> Indent Spaces:
                        <select value={indentSpaces} className="bg-[#1a1a1a] text-white mx-3 w-[auto] border border-gray-700 rounded-md p-1" onChange={(e) => setIndentSpaces(e.target.value)}>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                        </select>
                    </label>
                    <div title={isDarkMode ? "Light Mode" : "Dark Mode"} className="p-2 text-xl flex justify-center items-center cursor-pointer mr-5" onClick={toggleTheme}>{isDarkMode ? "🌞" : "🌜"}</div>
                </div>
            </div>
            || <div className="w-[80%] bg-[#111111] flex-1 border-l-2 border-l-[#2e2e2e] flex flex-col"></div>
            }
        </>
    )
}

export default CodeEditor