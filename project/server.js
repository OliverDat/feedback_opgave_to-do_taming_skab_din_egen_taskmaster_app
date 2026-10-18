const express = require('express');
const path = require('node:path');
const fss = require('node:fs');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');

const app = express();
const PORT = 3000;
const tasksFile = path.join(__dirname, 'data', 'tasks.json');

app.use(express.json());
app.set('json spaces', 2);
app.use(express.static(path.join(__dirname, 'public')));

// Læser alle opgaver fra tasks.json og returnerer dem som et array.
function readTasks() {
    const fileContent = fss.readFileSync(tasksFile, 'utf8');
    return JSON.parse(fileContent);
}

// Gemmer den aktuelle liste af opgaver i tasks.json.
function writeTasks(tasks) {
    fss.writeFileSync(
        tasksFile,
        JSON.stringify(tasks, null, 2),
        'utf8'
    );
}

// Henter og returnerer alle opgaver via API'et.
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = readTasks();
        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Fejl ved læsning af opgaver'});
    }
});

// Validerer og opretter en ny opgave via API'et.
app.post('/api/tasks', async (req, res) => {
    try {
        const tasks = readTasks();

        const { description } = req.body;
        if (!description || !description.trim()) {
            return res.status(400).json({ error: 'Beskrivelse mangler' });
        }

        const newTask = {
            id: crypto.randomUUID(),
            description: description.trim(),
        };

        writeTasks([...tasks, newTask]);
        res.status(201).json(newTask);
    } catch (error) {
        console.error(error);
        res.status(500).json({error: 'Fejl ved oprettelse af opgave'});
    }
});

// Finder og sletter en opgave ud fra dens id.
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const tasks = readTasks();

        const updatedTasks = tasks.filter(task => task.id !== taskId);
        writeTasks(updatedTasks);
        res.json({ success: true });   // <-- den manglede
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Fejl ved sletning af opgave' });
    }
});

// Returnerer en 404-fejl, hvis siden eller API-ruten ikke findes.
app.use((req, res) => {
    res.status(404).send("404 - Siden blev ikke fundet");
});

// Starter serveren på den angivne port.
app.listen(PORT, () => {
    console.log(`Serveren kører på http://localhost:${PORT}`);
});