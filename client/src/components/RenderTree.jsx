import React, { useEffect, useRef, useState } from 'react';
import useFileIcon from '../hooks/useFileIcon';
import { useFileOperation } from '../FileOperationContext';

const RenderTree = ({ file,onContextMenu }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isActive, setIsActive] = useState(null);
    const {selectedPath, setSelectedPath, handleFileRead, activeFileBackground, setActiveFileBackground} = useFileOperation();
    const hasChildren = file.isDirectory && file.children?.length > 0;

    const toggleFolder = () => {
        if (file.isDirectory) {
            setIsOpen(!isOpen);
        }else{
            handleFileRead(file.relativePath)
        }
        
        setSelectedPath(file.relativePath);
        setActiveFileBackground("bg-[#3a3b3c] font-light text-white");
    };

    const isSelected = file.relativePath === selectedPath;

    return (
        <div>
            <div
                className={`cursor-pointer px-1 py-[2px] rounded ${isSelected ? activeFileBackground : 'hover:bg-[#69626257]'
                    }`}
                onClick={toggleFolder}
                onContextMenu={(e)=>onContextMenu(file,e)}
            >
                <span className='mr-1 text-[14px]'>
                    {file.isDirectory ? (isOpen ? '📂' : '📁') : useFileIcon(file.name)}
                </span>
                {file.name}
            </div>

            {isOpen && hasChildren && (
                <ul className='pl-4'>
                    {file.children.map((item) => (
                        <li key={item.absolutePath}>
                            <RenderTree file={item}
                            onContextMenu={onContextMenu}
                        />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RenderTree;
