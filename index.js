// TASK: import helper functions from utils
// TASK: import initialData,
import { initialData } from "./initialData.js";
import { getTasks, saveTasks, createNewTask, patchTask, putTask, deleteTask } from "./utils/taskFunctions.js";

/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true')
  } else {
    console.log('Data already exists in localStorage');
  }
}

// TASK: Get elements from the DOM✔️😶‍🌫️
const elements = {
headerBoardName: document.getElementById('header-board-name'),
sideBarDiv: document.getElementById('side-bar-div'),
hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
showSideBarBtn: document.getElementById('show-side-bar-btn'),
columnDivs: document.querySelectorAll('.column-div'),
filterDiv: document.getElementById('filterDiv'),
themeSwitch: document.getElementById('switch'),

createNewTaskBtn: document.getElementById('add-new-task-btn'),
cancelAddTaskBtn: document.getElementById('cancel-add-task-btn'),
modalWindow: document.getElementById('new-task-modal-window'),

editTaskModal: document.querySelector('.edit-task-modal-window'),
saveTaskChangesBtn: document.getElementById('save-task-changes-btn'),
cancelEditBtn: document.getElementById('cancel-edit-btn'),
deleteTaskBtn: document.getElementById('delete-task-btn')
}

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS ✔️
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"))
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard
    styleActiveBoard(activeBoard)
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs ✔️❌
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs ✔️
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
 
  const filteredTasks = tasks.filter(task => task.board === boardName);
  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click",() => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  console.log(getTasks())
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs❓
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click", () => toggleModal(false, elements.editTaskModal));

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener('submit',  (event) => {
    addTask(event)
  });
}

// Toggles tasks modal
// Task: Fix bugs✔️
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object❓
    const task = {
      title: document.getElementById('title-input').value,
      description: document.getElementById('desc-input').value,
      status: document.getElementById('select-input').value
    };
    const newTask = createNewTask(task);
    if (newTask) {
      addTaskToUI(newTask);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      event.target.reset();
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
 if(show){
  elements.sideBarDiv.style.display = 'block'
  localStorage.setItem('showSideBar', 'true')
  elements.showSideBarBtn.style.display = 'none'
}else{
  elements.sideBarDiv.style.display = 'none'
  localStorage.setItem('showSideBar', 'false')
  elements.showSideBarBtn.style.display = 'block'
}

 
}

function toggleTheme() {
 if(elements.themeSwitch.checked){
  document.body.classList.add('light-theme')
  localStorage.setItem('light-theme', 'enabled')
  document.getElementById('side-logo-div').innerHTML = `<img id="logo" src="./assets/logo-light.svg" alt="light-theme">`
 } else{
  document.body.classList.remove('light-theme')
  localStorage.setItem('light-theme', 'disabled') 
  document.getElementById('side-logo-div').innerHTML = `<img id="logo" src="./assets/logo-dark.svg" alt="dark-theme">`
 }
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById('edit-task-title-input').value = task.title
  document.getElementById('edit-task-desc-input').value = task.description
  document.getElementById('edit-select-status').value = task.status

  // Get button elements from the task modal
  const saveTaskChangesBtn = document.getElementById('save-task-changes-btn') 
 const deleteTaskBtn = document.getElementById('delete-task-btn')

  // Call saveTaskChanges upon click of Save Changes button
 
saveTaskChangesBtn.addEventListener('click',() => saveTaskChanges(task.id))
  // Delete task using a helper function and close the task modal
deleteTaskBtn.addEventListener('click', () => {
    deleteTask(task.id);
    refreshTasksUI();
    toggleModal(false,elements.editTaskModal);
 })
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updatedTitle = document.getElementById('edit-task-title-input').value;
  const updatedDesc = document.getElementById('edit-task-desc-input').value;
  const updatedStatus = document.getElementById('edit-select-status').value;
  // Create an object with the updated task details
const updates = {
  id: taskId,
  title: updatedTitle,
  description: updatedDesc,
  status: updatedStatus,
};
  // Update task using a helper functoin
 patchTask(taskId, updates);

  // Close the modal and refresh the UI to reflect the changes
toggleModal(false,elements.editTaskModal);
refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData()
  setupEventListeners();
//checking the sidebar
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
//checking the theme
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  elements.themeSwitch.checked = isLightTheme;
  document.body.classList.toggle('light-theme', isLightTheme);
  //checking the logo
  const logoDiv = document.getElementById('side-logo-div');
  const logoSrc = isLightTheme ? './assets/logo-light.svg' : './assets/logo-dark.svg';
  const logoAlt = isLightTheme ? 'light-theme' : 'dark-theme';
  logoDiv.innerHTML = `<img id="logo" src="${logoSrc}" alt="${logoAlt}">`;

  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
  
}