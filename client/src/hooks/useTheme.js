import React, { useState } from 'react'

const useTheme = () => {
    const [isDarkMode, setIsDarkMode] = useState(true);

    function toggleTheme() {
        setIsDarkMode(!isDarkMode);
    }
    return {
        isDarkMode,
        toggleTheme
    }
}

export default useTheme