import TaskItem from './TaskItem';

function TaskList({ tasks, onUpdate, onDeleteRequest }) {
  if (tasks.length === 0) {
    return <p className="task-list__empty">No tasks yet — add one above to get started.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem key={task._id} task={task} onUpdate={onUpdate} onDeleteRequest={onDeleteRequest} />
      ))}
    </ul>
  );
}

export default TaskList;
