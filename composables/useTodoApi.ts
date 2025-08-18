// composables/useTodoApi.js
export const useTodoApi = () => {
  const apiUrl = 'https://localhost:7012/api/todo'; // Replace with your actual API route

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Failed to fetch todos');
      return await res.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  // Add a new todo
  const addTodo = async (todo:any) => {
    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo),
      });
      if (!res.ok) throw new Error('Failed to add todo');
      return await res.json();
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Delete a todo by id
  const deleteTodo = async (id:any) => {
    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete todo');
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  return {
    fetchTodos,
    addTodo,
    deleteTodo,
  };
};
