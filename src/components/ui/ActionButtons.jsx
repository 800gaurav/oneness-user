import { Edit, Trash2, Eye, LogIn } from 'lucide-react';

const ActionButtons = ({ 
  onEdit, 
  onDelete, 
  onView, 
  onLogin,
  editTitle = "Edit",
  deleteTitle = "Delete", 
  viewTitle = "View",
  loginTitle = "Login as User"
}) => {
  return (
    <div className="flex space-x-2">
      {onLogin && (
        <button
          onClick={onLogin}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
          title={loginTitle}
        >
          <LogIn size={16} />
        </button>
      )}
      {onView && (
        <button
          onClick={onView}
          className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
          title={viewTitle}
        >
          <Eye size={16} />
        </button>
      )}
      {onEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
          title={editTitle}
        >
          <Edit size={16} />
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          title={deleteTitle}
        >
          <Trash2 size={16} />
        </button>
      )}
    </div>
  );
};

export default ActionButtons;