import React from "react";

const TaskManagerLogo = () => {
  return (
    <div className="flex items-center gap-2 cursor-pointer">
      {/* Circle with checkmark */}
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 text-green-400"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 11.586l6.293-6.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </div>

      {/* Text */}
      <span className="text-xl font-bold text-blue-600">
        TaskManager
      </span>
    </div>
  );
};

export default TaskManagerLogo;