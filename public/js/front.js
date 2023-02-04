const inputNewTask = document.querySelector('input.new-todo');
const checkboxes = document.querySelectorAll('input[data-id].toggle');
const descriptionLabels = document.querySelectorAll('label[data-id');
const delButtons = document.querySelectorAll('button[data-id].destroy');
const filterActive = document.querySelector('a[href="/active"]');
const filterCompleted = document.querySelector('a[href="/completed"]');
const filterAll = document.querySelector('a[href="/"]');
const selectAll = document.querySelector('label[for="toggle-all"]');
const clearButton = document.querySelector('button.clear-completed');
const counter = document.querySelector('span.todo-count');


const countItemsLeft = () => {
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
            inputNewTask.value = '';
            await fetchData(data, 'POST', '/#');
            window.location.reload();
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
    const checkCompleted = (task, isChecked) => {
        const taskId = task.attributes['data-id'].value;
        const checkbox = document.querySelector(`input[data-id="${taskId}"].toggle`);
        checkbox.dispatchEvent(new Event('click'));
        checkbox.checked = isChecked;
    }

    if (allTasks.every(isCompleted)) {
        for (task of allTasks) {
            checkCompleted(task, false);
        }
    } else {
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
                inputNode.value = '';
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

// const filterAllTasks = async event => {
//     event.target.classList.add('selected');
//     filterActive.classList.remove('selected');
//     filterCompleted.classList.remove('selected');
// }

// const filterActiveTasks = async event => {
//     event.target.classList.add('selected');
//     filterAll.classList.remove('selected');
//     filterCompleted.classList.remove('selected');
// }

// const filterCompletedTasks = async event => {
//     event.target.classList.add('selected');
//     filterAll.classList.remove('selected');
//     filterActive.classList.remove('selected');
// }

const deleteSelectedTasks = async event => {
    const isCompleted = task => task.classList.contains('completed');

    [ ...document.querySelectorAll('li[data-id]') ]
        .filter(isCompleted)
        .forEach(task => {
            const taskId = task.attributes['data-id'].value;
            const delBtn = document.querySelector(`button[data-id="${taskId}"].destroy`);
            delBtn.dispatchEvent(new Event('click')); 
        });
}


inputNewTask.addEventListener('keypress', addNewTask);
checkboxes.forEach(checkbox => checkbox.addEventListener('click', toggleTaskCompleted));
descriptionLabels.forEach(label => label.addEventListener('click', editTaskDescription));
delButtons.forEach(btn => btn.addEventListener('click', deleteTask));

// filterAll.addEventListener('click', filterAll);
// filterActive.addEventListener('click', filterActiveTasks);
// filterCompleted.addEventListener('click', filterCompletedTasks);

selectAll.addEventListener('click', toggleSelection);

clearButton.addEventListener('click', deleteSelectedTasks);

countItemsLeft();