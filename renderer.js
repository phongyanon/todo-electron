const ipc = require('electron').ipcRenderer;

let current_space = 'overview';

ipc.send('getTodo', 'overview');

const newTodoBtn = document.getElementById('new-todo-btn');
const overviewBtn = document.getElementById('overview-btn');
const activeBtn = document.getElementById('active-btn');
const completeBtn = document.getElementById('complete-btn');

const spaceActive = document.getElementById('space-active');
const spaceComplete = document.getElementById('space-complete');

const todoActive = document.getElementById('todo-active');
const todoComplete = document.getElementById('todo-complete');

// child
function onClickCreate(){
    const todoCreated = document.getElementById('todo-created').value;
    ipc.send('actionTodo', {data: todoCreated, action: 'create'});
    window.close();
}
function onClickCancel(){
    window.close();
}

function onClickAction(id, action){
    ipc.send('actionTodo', {id: id, action: action});
}

newTodoBtn.addEventListener('click', () => {
    ipc.send('newTodo', null);
});

overviewBtn.addEventListener('click', () => {
    ipc.send('getTodo', 'overview');
    current_space = 'overview';
});
activeBtn.addEventListener('click', () => {
    ipc.send('getTodo', 'active');
    current_space = 'active';
});
completeBtn.addEventListener('click', () => {
    ipc.send('getTodo', 'complete');
    current_space = 'complete';
});

function createDomTodo(todos, action){
    let result = '';
    for(let i=0; i < todos.length; i++){
        result += `
        <div class="todo-item" id="todo-${todos[i].id}">
            <p>${todos[i].data}</p>
            <button onClick="onClickAction(${todos[i].id}, '${action}')">${action}</button>
            <button onClick="onClickAction(${todos[i].id}, 'delete')">delete</button>  
        </div>
        `;
    }
    return result;
}

ipc.on('overviewReply', (event, args) => {
    spaceActive.style.flexBasis = '50%';
    spaceComplete.style.flexBasis = '50%';
    todoActive.innerHTML = createDomTodo(args.active, 'complete');
    todoComplete.innerHTML = createDomTodo(args.complete, 'active');
});

ipc.on('activeReply', (event, args) => {
    spaceActive.style.flexBasis = '100%';
    spaceComplete.style.flexBasis = '0';
    todoActive.innerHTML = createDomTodo(args, 'complete');
});

ipc.on('completeReply', (event, args) => {
    spaceActive.style.flexBasis = '0';
    spaceComplete.style.flexBasis = '100%';
    todoComplete.innerHTML = createDomTodo(args, 'active');
});

ipc.on('actionReply', (event, args) => {
    ipc.send('getTodo', current_space);
});