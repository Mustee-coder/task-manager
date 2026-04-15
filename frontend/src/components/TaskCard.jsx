import React from "react";

const TaskCard = ({
  task,
  editingTaskId,
  setEditingTaskId,
  editTitle,
  setEditTitle,
  editDescription,
  setEditDescription,
  handleUpdate,
  handleDelete,
  toggleComplete,
}) => {
  const isEditing = editingTaskId === task._id;

  return (
    <div className="p-4 rounded-lg bg-base-100 flex flex-col gap-2">

      {/* Top section */}
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          className="checkbox checkbox-success mt-1"
          checked={task.completed}
          onChange={() => toggleComplete(task)}
        />

        <div className="flex-1 space-y-1">
          {isEditing ? (
            <input
              className="input input-sm input-bordered w-full"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          ) : (
            <h2
              className={`font-bold ${
                task.completed ? "line-through text-gray-400" : ""
              }`}
            >
              {task.title}
            </h2>
          )}

          {isEditing ? (
            <textarea
              className="textarea textarea-sm textarea-bordered w-full"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          ) : (
            <p className="text-sm text-gray-500">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex justify-between items-center mt-2">
        <small className="text-gray-400">
          {new Date(task.createdAt).toLocaleString()}
        </small>

        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                onClick={() =>
                  handleUpdate(task._id, {
                    title: editTitle,
                    description: editDescription,
                  })
                }
                className="btn btn-xs btn-primary"
              >
                Save
              </button>
              <button
                onClick={() => setEditingTaskId(null)}
                className="btn btn-xs btn-ghost"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setEditingTaskId(task._id);
                  setEditTitle(task.title);
                  setEditDescription(task.description);
                }}
                className="btn btn-xs btn-warning"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task._id)}
                className="btn btn-xs btn-error"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;