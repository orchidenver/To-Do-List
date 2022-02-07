'use strict';
// V A R I A B L E S
const listContainer = document.querySelector('.table__lists');
const createListForm = document.querySelector('#table-form');
const createListInput = document.querySelector('#table-input');
const deleteListBtn = document.querySelector('#delete-list');
const listDisplayContainer = document.querySelector('.tasklist');
const listTitleElement = document.querySelector('.tasklist__title');
const listCountElement = document.querySelector('.tasklist__items');
const tasksContainer = document.querySelector('.tasklist__tasks');
const newTaskForm = document.querySelector('#tasklist-form');
const newTaskInput = document.querySelector('#tasklist-input');
const deleteDoneTasksBtn = document.querySelector('#delete-done-tasks');
const LOCAL_STORAGE_LIST_KEY = 'task.lists';
const LOCAL_STORAGE_SELECTED_LIST_ID_KEY = 'task.selectedListsId';
// Если ЛС пуст - берем пустой массив
let listsArray = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LIST_KEY)) || [];
let selectedListId = localStorage.getItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY);
// F U N C T I O N S
// Rendering lists on screen
function render () {
    removeElementsFromList(listContainer);

    listsArray.forEach(list => {
        listContainer.insertAdjacentHTML('beforeend', `
            <li class="table__list ${
                list.id === selectedListId ? 'table__list-active' : ''
            }" data-listId="${list.id}">${list.title}</li>
        `);  
    });

    // Отображаем данные о списке дел
    const selectedList = listsArray.find(list => list.id === selectedListId);
    if (!selectedListId) {
        listDisplayContainer.style.display = 'none';
    } else {
        listDisplayContainer.style.display = '';
        listTitleElement.textContent = selectedList.title;
        renderTaskCount(selectedList);
        removeElementsFromList(tasksContainer);
        renderTasks(selectedList);
    }
}
// Rendering tasks of the list
function renderTasks (selectedList) {
    selectedList.tasks.forEach(task => {
        tasksContainer.insertAdjacentHTML('beforeend', `
            <div class="tasklist__input">
                <input type="checkbox" id="${task.id}" class="tasklist__task">
                <label for="${task.id}">
                    <span class="custom-checkbox"></span>
                    ${task.title}</label>
            </div>
        `);
        document.querySelector('.tasklist__task').checked = task.complete;
    });
}

// Render task count in the list
function renderTaskCount (selectedList) {
    const incompleteTaskCount = selectedList.tasks.filter(task => !task.complete).length;
    const taskString = incompleteTaskCount === 1 ? 'task' : 'tasks';
    listCountElement.textContent = `${incompleteTaskCount} ${taskString} remaining`;
}
// Adding a list
function addingItem (event, element, func) {
    event.preventDefault();
    const newItemTitle = element.value;
    if (newItemTitle === null || newItemTitle === '') return;
    const newItem = func(newItemTitle);
    element.value = '';
    if (element === createListInput) {
        listsArray.push(newItem)
    } else {
        const selectedList = listsArray.find(list => list.id === selectedListId);
        selectedList.tasks.push(newItem);
    }
    saveToLocalStorage();
    render();
}

function createNewTask (title) {
    return {
        id: Date.now().toString(),
        title: title,
        complete: false,
    };
}

// Creating a new list
function createNewList (title) {
    return {
        id: Date.now().toString(),
        title: title,
        tasks: [],
    };
}

// Saving list to LocalStorage
function saveToLocalStorage () {
    localStorage.setItem(LOCAL_STORAGE_LIST_KEY, JSON.stringify(listsArray));
    localStorage.setItem(LOCAL_STORAGE_SELECTED_LIST_ID_KEY, selectedListId);
}

function removeElementsFromList (list) {
    [...list.children].forEach(child => child.remove());
}

render();

// E V E N T S
createListForm.addEventListener('submit', e => {
    addingItem(e, createListInput, createNewList);
});

newTaskForm.addEventListener('submit', e => {
    addingItem(e, newTaskInput, createNewTask);
});

listContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'li') {
        selectedListId = e.target.dataset.listid;
    }
    saveToLocalStorage();
    render();
});

tasksContainer.addEventListener('click', e => {
    if (e.target.tagName.toLowerCase() === 'input') {
        const selectedList = listsArray.find(list => list.id === selectedListId);
        const selectedTask = selectedList.tasks.find(task => task.id === e.target.id);
        selectedTask.complete = e.target.checked;
        saveToLocalStorage();
        renderTaskCount(selectedList);
    }
});

deleteDoneTasksBtn.addEventListener('click', () => {
    const selectedList = listsArray.find(list => list.id === selectedListId);
    selectedList.tasks = selectedList.tasks.filter(task => !task.complete);
    saveToLocalStorage();
    render();
});

deleteListBtn.addEventListener('click', () => {
    listsArray = listsArray.filter(list => list.id !== selectedListId);
    selectedListId = null;
    saveToLocalStorage();
    render();
});