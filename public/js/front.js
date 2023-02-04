const inputNewTask = document.querySelector('input.new-todo');
const checkboxes = document.querySelectorAll('input[data-id].toggle');
const descriptionLabels = document.querySelectorAll('label[data-id');
const delButtons = document.querySelectorAll('button[data-id].destroy');
const selectAll = document.querySelector('label[for="toggle-all"]');
const clearButton = document.querySelector('button.clear-completed');
const counter = document.querySelector('span.todo-count');


const countItemsLeft = () => {
    // number of tasks marked as completed
    const notCompletedItems = [ ...document.querySelectorAll('li[data-id]') ]
            .filter(task => !task.classList.contains('completed'))
            .length;
    
    const message = `<strong>${notCompletedItems}</strong> ${notCompletedItems > 1 ? 'items' : 'item'} left`;
    counter.innerHTML = message;
}

const fetchData = async (data, method, path) => {
    const response = await fetch(path, {
        method: method,
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    });

    return response;
};

const getTaskDetails = taskId => {
    return {
        id: taskId,
        description: document.querySelector(`label[data-id="${taskId}"]`).innerText,
        isFinished: document.querySelector(`li[data-id="${taskId}"]`).classList.contains('completed'),
    }
}

const addNewTask = async event => {
    if (event.key === 'Enter') {
        if (event.target.value !== '') {
            const data = {
                description: inputNewTask.value,
            }
            inputNewTask.value = '';    // empty value attribute to avoid fetch every time Enter is pressed
            await fetchData(data, 'POST', '/#');
            window.location.reload();   // reload view to get current list of tasks from BE
        }
    }
}

const toggleTaskCompleted = async event => {
    const taskId = event.target.attributes['data-id'].value;
    const parentNode = document.querySelector(`li[data-id="${taskId}"]`);
    
    parentNode.classList.toggle('completed');

    const data = getTaskDetails(taskId);
    await fetchData(data, 'PUT', '/');

    countItemsLeft();
}

const toggleSelection = async event => {
    const allTasks = [ ...document.querySelectorAll('li[data-id]') ];

    const isCompleted = task => task.classList.contains('completed');
    const isNotCompleted = task => !task.classList.contains('completed');
    // switch checked attribute for checkbox associated with task list element
    const checkCompleted = (task, isChecked) => {
        const taskId = task.attributes['data-id'].value;
        const checkbox = document.querySelector(`input[data-id="${taskId}"].toggle`);
        checkbox.dispatchEvent(new Event('click')); // fire click event on checkbox (callback will handle marking as completed/active)
        checkbox.checked = isChecked;   // make sure checked poperty is appropriately set
    }

    if (allTasks.every(isCompleted)) {
        // if all items are marked as completed, unmark all of them
        for (task of allTasks) {
            checkCompleted(task, false);
        }
    } else {
        // if only some are marked as completeted, filter out these which are not and check them
        for (task of allTasks.filter(isNotCompleted)) {
            checkCompleted(task, true);
        }
    }
}

const editTaskDescription = async event => {
    const targetNode = event.target;
    const taskId = targetNode.attributes['data-id'].value;
    const inputNode = document.querySelector(`input[data-id="${taskId}"].edit`);
    const parentNode = document.querySelector(`li[data-id="${taskId}"]`);

    parentNode.classList.add('editing');
    inputNode.value = targetNode.innerText;

    inputNode.addEventListener('keypress', async event => {
        if (event.key === 'Enter') {
            targetNode.innerText = inputNode.value;
            parentNode.classList.remove('editing');

            if (inputNode.value !== '') {
                const data = getTaskDetails(taskId);
                await fetchData(data, 'PUT', '/');
                inputNode.value = '';   // empty value attribute to avoid fetch every time Enter is pressed
            }
        }
    }); 
}

const deleteTask = async event => {
    const taskId = event.target.attributes['data-id'].value;
    const parentNode = document.querySelector(`li[data-id="${taskId}"]`);

    const data = getTaskDetails(taskId);
    const res = await fetchData(data, 'DELETE', '/');
    const result = await res.json();
    if (result.deleted) {
        parentNode.remove();
    }
}

const deleteSelectedTasks = async event => {
    const isCompleted = task => task.classList.contains('completed');

    [ ...document.querySelectorAll('li[data-id]') ]
        .filter(isCompleted)    // filter out completed tasks
        .forEach(task => {
            const taskId = task.attributes['data-id'].value;    // get id of task
            const delBtn = document.querySelector(`button[data-id="${taskId}"].destroy`);   // find assiociated del button
            delBtn.dispatchEvent(new Event('click'));   // fire click event (callback will delete task)
        });
}


inputNewTask.addEventListener('keypress', addNewTask);
checkboxes.forEach(checkbox => checkbox.addEventListener('click', toggleTaskCompleted));
descriptionLabels.forEach(label => label.addEventListener('click', editTaskDescription));
delButtons.forEach(btn => btn.addEventListener('click', deleteTask));

selectAll.addEventListener('click', toggleSelection);

clearButton.addEventListener('click', deleteSelectedTasks);

countItemsLeft();