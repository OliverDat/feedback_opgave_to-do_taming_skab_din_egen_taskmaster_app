const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const taskList = document.getElementById('task-list');

// Henter opgaver fra serveren og viser dem på siden.
function hentTasks() {
    fetch('/api/tasks')
        .then(response => response.json())
        .then(tasks => {
            taskList.innerHTML = '';

            tasks.forEach(task => {
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';

                const text = document.createElement('span');
                text.textContent = task.description;

                const deleteButton = document.createElement('button');
                deleteButton.className = 'delete-button';
                deleteButton.textContent = 'Slet';
                deleteButton.addEventListener('click', () => deleteTask(task.id));

                taskItem.appendChild(text);
                taskItem.appendChild(deleteButton);
                taskList.appendChild(taskItem);
            });
        })
        .catch(error => console.error('Error fetching tasks:', error));
}

// Sender en ny opgave til serveren og opdaterer opgavelisten.
function addTask(description) {
    fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description })
    })
        .then(response => response.json())
        .then(() => {
            input.value = '';
            hentTasks();
        })
        .catch(error => console.error('Error adding task:', error));
}

// Sletter en opgave fra serveren og opdaterer opgavelisten.
function deleteTask(id) {
    fetch(`/api/tasks/${id}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error('Sletning fejlede');
            hentTasks();
        })
        .catch(error => console.error('Error deleting task:', error));
}

// Forhindrer sidens genindlæsning og opretter en opgave ved formular-submit.
form.addEventListener('submit', event => {
    event.preventDefault();          // stopper at siden genindlæses
    const description = input.value.trim();
    if (description) {
        addTask(description);
    }
});

hentTasks();   // hent opgaver når siden loader