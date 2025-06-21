import logo from './logo.svg';
import React, { useState, useEffect } from 'react';
import './App.css';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import TaskStats from './components/TaskStats';
import TaskCategories from './components/TaskCategories';

function App() {
  const [tasks, setTasks] = useState(JSON.parse(localStorage.getItem('tasks')) || []);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [currentSort, setCurrentSort] = useState('default');
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const addTask = (text, priority, dueDate) => {
    const newTask = {
      id: Date.now(),
      text,
      completed: false,
      priority,
      dueDate,
      createdAt: new Date().toISOString()
    };
    setTasks([...tasks, newTask]);
  };

  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id, updatedTask) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updatedTask } : task
    ));
  };

  const clearCompletedTasks = () => {
    setTasks(tasks.filter(task => !task.completed));
  };

  const reorderTasks = (draggedId, targetId) => {
    const draggedIndex = tasks.findIndex(task => task.id === draggedId);
    const targetIndex = tasks.findIndex(task => task.id === targetId);
    
    const newTasks = [...tasks];
    const [movedTask] = newTasks.splice(draggedIndex, 1);
    newTasks.splice(targetIndex, 0, movedTask);
    
    setTasks(newTasks);
  };

  // Filter and sort tasks
  let filteredTasks = [...tasks];
  if (currentFilter === 'active') {
    filteredTasks = filteredTasks.filter(task => !task.completed);
  } else if (currentFilter === 'completed') {
    filteredTasks = filteredTasks.filter(task => task.completed);
  }
  
  if (currentSort === 'priority') {
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  } else if (currentSort === 'date') {
    filteredTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else {
    filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length;
  const mediumPriorityTasks = tasks.filter(task => task.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(task => task.priority === 'low').length;

  return (
    <div className={`app-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="container">
        <header className="app-header">
          <div className="header-top">
            <h1>Task Tracker</h1>
            <div className="header-controls">
              <span className="date-display">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <button 
                className="theme-toggle" 
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
          
          <TaskForm addTask={addTask} />
        </header>

        <div className="main-content">
          <div className="tasks-container">
            <TaskList 
              tasks={filteredTasks}
              toggleTaskStatus={toggleTaskStatus}
              deleteTask={deleteTask}
              updateTask={updateTask}
              setCurrentFilter={setCurrentFilter}
              currentFilter={currentFilter}
              setCurrentSort={setCurrentSort}
              currentSort={currentSort}
              clearCompletedTasks={clearCompletedTasks}
              totalTasks={totalTasks}
              reorderTasks={reorderTasks}
            />
          </div>
          
          <div className="sidebar">
            <TaskStats 
              totalTasks={totalTasks}
              completedTasks={completedTasks}
              pendingTasks={pendingTasks}
            />
            
            <TaskCategories 
              highPriorityTasks={highPriorityTasks}
              mediumPriorityTasks={mediumPriorityTasks}
              lowPriorityTasks={lowPriorityTasks}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
