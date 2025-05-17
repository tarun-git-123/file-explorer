import { useEffect, useCallback, useState } from 'react';

function useSaveShortcut(handleFileSave) {
    const [zoom, setZoom] = useState(14);

    const handleKeyDown = useCallback((event) => {
        // Save
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            handleFileSave();
        }

        // Zoom In (Ctrl + =)
        if (event.ctrlKey && (event.key === '=' || event.key === '+')) {
            event.preventDefault();
            setZoom(prev => Math.min(prev + 2, 40)); // optional: max zoom limit
        }

        // Zoom Out (Ctrl + -)
        if (event.ctrlKey && event.key === '-') {
            event.preventDefault();
            setZoom(prev => Math.max(prev - 2, 8)); // optional: min zoom limit
        }
    }, [handleFileSave]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    return { zoom, setZoom };
}

export default useSaveShortcut;
