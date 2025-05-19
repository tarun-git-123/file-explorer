import express from 'express';
import cors from 'cors';
import {existsSync, promises as fs } from 'fs';
import path from 'path';

const app = express();
const PORT = 4000;

const ROOT = path.resolve('./sandbox'); // root directory

app.use(cors());
app.use(express.json());

async function getTreeFiles(dirPath, rootPath=ROOT) {
    const dirents = await fs.readdir(dirPath, { withFileTypes: true });
    const result = Promise.all(
        dirents.map(async (dirent) => {
            const res = path.resolve(dirPath, dirent.name);
            const items = {
                name: dirent.name,
                isDirectory: dirent.isDirectory(),
                relativePath: path.relative(rootPath, res),
                absolutePath: res,
                collapsed: dirent.isDirectory()
            }

            if(dirent.isDirectory()){
                items.children = await getTreeFiles(res)
            }

            return items;
        })
    )
    return result
}

// List directory contents
app.get('/api/files', async (req, res) => {
    const dirPath = path.join(ROOT, req.query.path || '');
    try {
        const files = await getTreeFiles(dirPath);
        res.status(200).json({ status: 'success', data: files });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create folder
app.post('/api/create-folder', async (req, res) => {
    const { path: relativePath, name } = req.body;
    const prevPath = path.join(ROOT, relativePath);
    let fullPath = path.join(ROOT, relativePath, name);
    if(existsSync(fullPath)){
        return res.status(400).json({ error: 'Folder already exists' });
    }

    const stat = await fs.stat(prevPath);
    if(stat.isFile()){
        fullPath =path.join(path.dirname(prevPath),name);
    }
    const newRelativePath = path.relative(ROOT, fullPath);

    try {
        await fs.mkdir(fullPath);
        res.json({ statue: 'success' , data: { relativePath: newRelativePath, message: 'Folder created' }});
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create file
app.post('/api/create-file', async (req, res) => {
    const { path: relativePath, name, content } = req.body;
    const prevPath = path.join(ROOT, relativePath);
    let fullPath = path.join(ROOT, relativePath, name);
    
    if(existsSync(fullPath)){
        return res.status(400).json({ error: 'File already exists' });
    }
    const stat = await fs.stat(prevPath);
    if(stat.isFile()){
        fullPath =path.join(path.dirname(prevPath),name);
    }
    const newRelativePath = path.relative(ROOT, fullPath);

    try {
        await fs.writeFile(fullPath, content || '');
        res.json({ message: 'File created', data: { relativePath: newRelativePath } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/update-file
app.put('/api/update-file', async (req, res) => {
    const { path: relativePath, content } = req.body;
    const fullPath = path.join(ROOT, relativePath);

    // Security: prevent path traversal
    if (!fullPath.startsWith(ROOT)) {
        return res.status(400).json({ error: 'Invalid path' });
    }

    try {
        await fs.access(fullPath); // Ensure file exists
        await fs.writeFile(fullPath, content || '');
        res.json({ message: 'File updated', data: { relativePath} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/api/read-file', async (req, res) => {
    const relativePath = req.query.path;
    const fullPath = path.join(ROOT, relativePath);

    if (!fullPath.startsWith(ROOT)) {
        return res.status(400).json({ error: 'Invalid path' });
    }
    try {
        const content = await fs.readFile(fullPath, 'utf-8');
        res.status(200).json({ status: 'success', data:{ content, relativePath} });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Rename file or folder
app.put('/api/rename', async (req, res) => {
    const { oldPath, newName } = req.body;
    const oldFullPath = path.join(ROOT, oldPath);
    const newFullPath = path.join(path.dirname(oldFullPath), newName);
    try {
        await fs.rename(oldFullPath, newFullPath);
        res.status(200).json({statue: 'success', data: { relativePath: path.relative(ROOT, newFullPath) }});
    } catch (err) {
        res.status(500).json({ error: 'Failed to rename' });
    }
});

// move file or folder
app.put('/api/move', async (req, res) => {
    const { oldPath, newPath } = req.body;
    const oldFullPath = path.join(ROOT, oldPath);
    //const newFullPath = path.join(ROOT, newPath);
    try {
        await fs.rename(oldFullPath, newPath);
        res.status(200).json({statue: 'success', data: { relativePath: path.relative(ROOT, newFullPath) }});
    } catch (err) {
        res.status(500).json({ error: 'Failed to move' });
    }
});

// Delete file or folder
app.delete('/api/delete', async (req, res) => {
    const { path: relativePath } = req.body;
    const fullPath = path.join(ROOT, relativePath);
    try {
        const stat = await fs.lstat(fullPath);
        if (stat.isDirectory()) {
            await fs.rmdir(fullPath, { recursive: true });
        } else {
            await fs.unlink(fullPath);
        }
        res.status(200).json({status: 'success', data: { relativePath } });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete file/folder' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});