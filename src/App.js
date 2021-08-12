import React, { useState, useEffect } from 'react';
import './App.css';
// import { API, Storage } from 'aws-amplify';
import { API} from 'aws-amplify';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';
import { listTodos } from './graphql/queries';
import { createTodo as createTodoMutation, deleteTodo as deleteTodoMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
  const apiData = await API.graphql({ query: listTodos });
  const todosFromAPI = apiData.data.listTodos.items;
  await Promise.all(todosFromAPI.map(async todo => {
    // if (todo.image) {
    //   const image = await Storage.get(todo.image);
    //   todo.image = image;
    // }
    return todo;
  }))
  setTodos(apiData.data.listTodos.items);
}

  async function createTodo() {
  if (!formData.name || !formData.description) return;
  await API.graphql({ query: createTodoMutation, variables: { input: formData } });
  // if (formData.image) {
  //   const image = await Storage.get(formData.image);
  //   formData.image = image;
  // }
  setTodos([ ...todos, formData ]);
  setFormData(initialFormState);
}

  async function deleteTodo({ id }) {
    const newTodosArray = todos.filter(todo => todo.id !== id);
    setTodos(newTodosArray);
    await API.graphql({ query: deleteTodoMutation, variables: { input: { id } }});
  }

  async function onChange(e) {
	// if (!e.target.files[0]) return
	// const file = e.target.files[0];
	// setFormData({ ...formData, image: file.name });
	// await Storage.put(file.name, file);
	fetchTodos();
  }

  return (
    <div className="App">
      <h1>My Notes App</h1>
      <input onChange={e => setFormData({ ...formData, 'name': e.target.value})} placeholder="name" value={formData.name} />
      <input onChange={e => setFormData({ ...formData, 'description': e.target.value})} placeholder="description" value={formData.description} />
      <button onClick={createTodo}>Create note</button>
      <br></br>
      <br></br>
      <br></br>

      <button>shuffle</button>
      <button>oldest first</button>
      <button>least read first</button>
      
      <table border="1"> 
      <div style={{marginBottom: 30}}>
        {
    		  todos.map(todo => (
            <tr>
              <td width="200"><b>{todo.name}</b></td>
              <td width="400">{todo.description}</td>
              <td width="50"><button onClick={() => deleteTodo(todo)}>delete</button></td>
            </tr>
    		  ))
		    }
      </div>
      </table>
      <AmplifySignOut />
    </div>
  );
}

export default withAuthenticator(App);