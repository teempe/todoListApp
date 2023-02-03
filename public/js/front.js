const inputNewTask = document.querySelector('input.new-todo');
const checkboxes = document.querySelectorAll('input[data-id].toggle');
const descriptionLabels = document.querySelectorAll('label[data-id');
const delButtons = document.querySelectorAll('button[data-id].destroy');
const filterActive = document.querySelector('a[href="/active"]');
const filterCompleted = document.querySelector('a[href="/completed"]');
const filterAll = document.querySelector('a[href="/"]');


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
}

const selectAllTasks = async (event) => {} //TODO: implement

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

const filterAllTasks = async event => {
    event.target.classList.add('selected');
    filterActive.classList.remove('selected');
    filterCompleted.classList.remove('selected');
}  //TODO: implement

const filterActiveTasks = async event => {
    event.target.classList.add('selected');
    filterAll.classList.remove('selected');
    filterCompleted.classList.remove('selected');
    
}

const filterCompletedTasks = async event => {
    event.target.classList.add('selected');
    filterAll.classList.remove('selected');
    filterActive.classList.remove('selected');
}    //TODO: implement

const deleteSelectedTasks = async (event) => {} //TODO: implement


inputNewTask.addEventListener('keypress', addNewTask);
checkboxes.forEach(checkbox => checkbox.addEventListener('click', toggleTaskCompleted));
descriptionLabels.forEach(label => label.addEventListener('click', editTaskDescription));
delButtons.forEach(btn => btn.addEventListener('click', deleteTask));

filterActive.addEventListener('click', filterActiveTasks);

///////////////////////////////////////////////////////////////////////////////
// labels.forEach(label => label.addEventListener('click', event => {
//     const targetNode = event.target;
//     const taskId = targetNode.attributes['data-id'].value;
//     const inputNode = document.querySelector(`input[data-id="${taskId}"].edit`);
//     const parentNode = document.querySelector(`li[data-id="${taskId}"]`);

//     parentNode.classList.add('editing');
//     // inputNode.setAttribute('value', targetNode.innerText);
//     inputNode.value = targetNode.innerText;

//     inputNode.addEventListener('keypress', async event => {
//         if (event.key === 'Enter') {
//             targetNode.innerText = inputNode.value;
//             // inputNode.removeAttribute('value');
//             parentNode.classList.remove('editing');

//             // await fetch('/', {
//             //     method: 'PUT',
//             //     body: JSON.stringify({
//             //         id: taskId,
//             //         description: targetNode.innerText,
//             //         isFinished: parentNode.classList.contains('completed'),
//             //     }),
//             //     headers: {
//             //         'Content-Type': 'application/json',
//             //     }
//             // });
//             if (inputNode.value !== '') {
//                 const data = {
//                     id: taskId,
//                     description: inputNode.value,
//                     isFinished: parentNode.classList.contains('completed'),
//                 }
//                 await fetchData(data, 'PUT', '/');
//                 inputNode.value = '';
//             }
//         }
//     });   
// }));