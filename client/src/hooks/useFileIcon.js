const useFileIcon = (file) => {
    let ext = file.split('.').pop();

    switch(ext){
        case 'php':
            return '🐘';
        case 'js':
            return '/*';
        case 'css':
            return '#';
        case 'html':
            return '<>';
        case 'json':
            return '{}';
        case 'txt':
            return '📝';
        case 'jsx':
            return '⚛️';
        default:
            return '📄';
    }
};

export default useFileIcon;