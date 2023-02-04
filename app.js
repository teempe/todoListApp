const express = require('express');
const hbs = require('express-handlebars');
const { JsonRepository } = require('./repository/jsonRepository');

const repo = new JsonRepository();

const app = express();

app.use(express.static('public'));
app.use(express.json());

app.engine('.hbs', hbs.engine({extname: '.hbs'}));
app.set('view engine', '.hbs');

app.get('/', async (req, res) => {
    console.log('get / route');

    const tasks = await repo.getAll();
    console.log(tasks);
    res.render('todolist', { 
        tasks,
        filter: {
            all: true,
            active: false,
            completed: false,
        }
     });
});

app.get('/:filter', async (req, res) => {
    const { filter } = req.params;
    const tasks = await repo.getAll();

    switch (filter) {
        case 'active':
            const activeTasks = tasks.filter(task => !task.isFinished);
            res.render('todolist', { 
                tasks: activeTasks,
                filter: {
                    all: false,
                    active: true,
                    completed: false,
                }
             })
            break;
        case 'completed':
            const completedTasks = tasks.filter(task => task.isFinished);
            res.render('todolist', { 
                tasks: completedTasks,
                filter: {
                    all: false,
                    active: false,
                    completed: true,
                }
             })
            break;
    } 
});

app.post('/', async (req, res) => {
    console.log('post / route');
    console.log('ADD', req.body);

    const { description } = req.body;
    const result = await repo.addTask(description, false);
    res.json(result);
});

app.put('/', async (req, res) => {
    console.log('put / route');
    console.log('UPDATE', req.body);

    const { id, description, isFinished } = req.body;
    const result = await repo.updateTask(Number(id), description, isFinished);
    res.json({ updated: result })
});

app.delete('/', async (req, res) => {
    console.log('delete / route');
    console.log('DELETE', req.body);

    const { id, description, isFinished } = req.body;
    const result = await repo.deleteTask(Number(id));
    res.json({ deleted: result })
})

app.listen(3000, 'localhost', () => console.log('Server is listening on port 3000'));