import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed

  // Fetch tasks on load
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      let response;
      if (editingTask) {
        // UPDATE existing task
        response = await fetch(`http://localhost:5000/api/tasks/${editingTask._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            priority,
            dueDate: dueDate || null
          })
        });
      } else {
        // CREATE new task
        response = await fetch('http://localhost:5000/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            priority,
            dueDate: dueDate || null
          })
        });
      }

      const savedTask = await response.json();
      
      if (editingTask) {
        // Update the task in the list
        setTasks(tasks.map(task => task._id === editingTask._id ? savedTask : task));
        setEditingTask(null);
      } else {
        // Add new task to the list
        setTasks([savedTask, ...tasks]);
      }
      
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const toggleComplete = async (task) => {
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...task, 
          completed: !task.completed 
        })
      });
      const updatedTask = await response.json();
      // Update the task in the list immediately
      setTasks(tasks.map(t => t._id === task._id ? updatedTask : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(task => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const editTask = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setPriority(task.priority);
    setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#00ff88';
      default: return '#00ffff';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.completed).length,
    active: tasks.filter(t => !t.completed).length
  };

  if (loading) {
    return (
      <div className="app">
        <div className="bg-gradient"></div>
        <div className="loading">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="bg-gradient"></div>
      <div className="noise"></div>

      <div className="container">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <span className="logo-icon">✓</span>
            <span className="logo-text">Task Flow</span>
            <span className="logo-badge">PRODUCTIVITY</span>
          </div>
          <div className="stats">
            <span className="stat">{stats.completed}/{stats.total} done</span>
          </div>
        </header>

        {/* Hero */}
        <div className="hero">
          <h1 className="hero-title">
            <span className="gradient-text">Task Manager</span>
          </h1>
          <p className="hero-subtitle">Organize your tasks, boost productivity</p>
        </div>

        {/* Task Form */}
        <form className="task-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              required
            />
          </div>
          <div className="form-row">
            <textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="textarea"
              rows="2"
            />
          </div>
          <div className="form-row form-grid">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} className="select">
              <option value="low">🟢 Low Priority</option>
              <option value="medium">🟡 Medium Priority</option>
              <option value="high">🔴 High Priority</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn">
              {editingTask ? '✏️ UPDATE TASK' : '+ ADD TASK'}
            </button>
          </div>
          {editingTask && (
            <button type="button" className="btn-cancel" onClick={cancelEdit}>
              Cancel Edit
            </button>
          )}
        </form>

        {/* Filter Tabs */}
        <div className="filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
            All Tasks ({stats.total})
          </button>
          <button className={`filter-btn ${filter === 'active' ? 'active' : ''}`} onClick={() => setFilter('active')}>
            Active ({stats.active})
          </button>
          <button className={`filter-btn ${filter === 'completed' ? 'active' : ''}`} onClick={() => setFilter('completed')}>
            Completed ({stats.completed})
          </button>
        </div>

        {/* Task List */}
        <div className="tasks-container">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <p>No tasks yet. Add your first task above!</p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className={`task-card ${task.completed ? 'completed' : ''}`}>
                <div className="task-checkbox" onClick={() => toggleComplete(task)}>
                  {task.completed ? (
                    <div className="checkbox-tick">✓</div>
                  ) : (
                    <div className="checkbox-empty"></div>
                  )}
                </div>
                <div className="task-content">
                  <h3 className="task-title">{task.title}</h3>
                  {task.description && <p className="task-desc">{task.description}</p>}
                  <div className="task-meta">
                    <span className="task-priority" style={{ background: getPriorityColor(task.priority) }}>
                      {task.priority}
                    </span>
                    {task.dueDate && (
                      <span className="task-date">
                        📅 {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    <span className="task-date">
                      🕒 {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="task-actions">
                  <button className="edit-btn" onClick={() => editTask(task)}>✏️</button>
                  <button className="delete-btn" onClick={() => deleteTask(task._id)}>🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Progress Bar */}
        {stats.total > 0 && (
          <div className="progress-section">
            <div className="progress-label">
              <span>Progress</span>
              <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(stats.completed / stats.total) * 100}%` }}></div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="footer">
          <p>Task Management System</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
