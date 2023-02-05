const inputNewTask = document.querySelector('input.new-todo');
const checkboxes = document.querySelectorAll('input[data-id].toggle');
const descriptionLabels = document.querySelectorAll('label[data-id');
const delButtons = document.querySelectorAll('button[data-id].destroy');
const selectAll = document.querySelector('label[for="toggle-all"]');
const clearButton = document.querySelector('button.clear-completed');
const counter = document.querySelector('span.todo-count');

/**
 * Counts items left (uncompleted) and presents result on page.
 */
const countItemsLeft = () => {
    // number of tasks marked as completed
    const notCompletedItems = [ ...document.querySelectorAll('li[data-id]') ]
            .filter(task => !task.classList.contains('completed'))
            .length;
    
    const message = `<strong>${notCompletedItems}</strong> ${notCompletedItems > 1 ? 'items' : 'item'} left`;
    counter.innerHTML = message;
}

/**
 * Fetches data in JSON format to BE with given method to given path.
 * @param {Object} data - Object containing data to send.
 * @param {String} method - HTTP method ex. 'GET', 'POST'...
 * @param {String} path - path 
 * @returns {Object} - response
 */
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

/**
 * Gather task data: id, decription, isFinished
 * @param {String} taskId 
 * @returns {Object} - task details
 */
const getTaskDetails = taskId => {
    return {
        id: taskId,
        description: document.querySelector(`label[data-id="${taskId}"]`).innerText,
        isFinished: document.querySelector(`li[data-id="${taskId}"]`).classList.contains('completed'),
    }
}

/**
 * Returns all html elements related to task with given id.
 * @param {String} taskId 
 * @returns {Object} 
 */
const getTaskElements = taskId => {
    return {
        listElement: document.querySelector(`li[data-id="${taskId}"]`),
        completedCheck: document.querySelector(`input[data-id="${taskId}"].toggle`),
        descriptionLabel: document.querySelector(`label[data-id="${taskId}"]`),
        editInput: document.querySelector(`input[data-id="${taskId}"].edit`),
        deleteButton: document.querySelectorAll(`button[data-id="${taskId}"].destroy`),
    }
}

/**
 * Adds new task.
 * Fetches data to BE to store.
 * If witing data finish with success, will relaod page to show current tasks list.
 * @param {*} event 
 */
const addNewTask = async event => {
    if (event.key === 'Enter') {
        if (event.target.value !== '') {
            const data = {
                description: inputNewTask.value,
            }
            inputNewTask.value = '';    // empty value attribute to avoid fetch every time Enter is pressed
            const res = await fetchData(data, 'POST', '/');
            if (res) {
                window.location.reload();
            }
        }
    }
}

/**
 * Toggle marking task as completed.
 * Fetches data to BE to store.
 * @param {String} taskId 
 */
const toggleTaskCompleted = async taskId => {
    const { listElement } = getTaskElements(taskId);
    
    listElement.classList.toggle('completed');

    const data = getTaskDetails(taskId);
    await fetchData(data, 'PUT', '/');

    // reload counter after changes
    countItemsLeft();
}

/**
 * Selects all tasks on list as completed.
 * If all are already marked as completed, unmark them all.
 * @param {*} event 
 */
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
        // if only some (or none) tasks are marked as completeted, filter out these which are not and check them
        for (task of allTasks.filter(isNotCompleted)) {
            checkCompleted(task, true);
        }
    }
}

/**
 * Edits task description, and fetches data to BE to store.
 * @param {String} taskId 
 */
const editTaskDescription = async taskId => {
    const { listElement, descriptionLabel, editInput } = getTaskElements(taskId);

    listElement.classList.add('editing');
    editInput.value = descriptionLabel.innerText;

    editInput.addEventListener('keypress', async event => {
        if (event.key === 'Enter') {
            descriptionLabel.innerText = editInput.value;
            listElement.classList.remove('editing');

            if (editInput.value !== '') {
                const data = getTaskDetails(taskId);
                await fetchData(data, 'PUT', '/');
                editInput.value = '';   // empty value attribute to avoid fetch every time Enter is pressed
            }
        }
    }); 
}

/**
 * Removes task from list and fetches changes to BE to store.
 * If deletion on BE side ends with success, will remove item from page.
 * @param {String} taskId 
 */
const deleteTask = async taskId => {
    const { listElement } = getTaskElements(taskId);

    const data = getTaskDetails(taskId);
    const res = await fetchData(data, 'DELETE', '/');
    const result = await res.json();
    if (result.deleted) {
        listElement.remove();
        countItemsLeft();
    }
}

/**
 * Clears out from list all tasks marked as completed.
 * @param {*} event 
 */
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

// Event listeners for updating tasks list
inputNewTask.addEventListener('keypress', addNewTask);

checkboxes.forEach(checkbox => checkbox.addEventListener('click', async event => {
    const taskId = event.target.attributes['data-id'].value;
    await toggleTaskCompleted(taskId);
}));

descriptionLabels.forEach(label => label.addEventListener('click', async event => {
    const taskId = event.target.attributes['data-id'].value;
    await editTaskDescription(taskId);
}));

delButtons.forEach(btn => btn.addEventListener('click', async event => {
    const taskId = event.target.attributes['data-id'].value;
    await deleteTask(taskId);
}));

// Event listener for marking/unmarking all tasks as completed
selectAll.addEventListener('click', toggleSelection);

// Event listener to clear from list all completed tasks
clearButton.addEventListener('click', deleteSelectedTasks);

// initialize items counter
countItemsLeft();