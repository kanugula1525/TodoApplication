const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
module.exports = app;
let db = null;
const dbPath = path.join(__dirname, "todoApplication.db");

const initializationDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializationDBAndServer();

// API 1
app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  let { search_q = "", priority, status } = request.query;

  switch (true) {
    // scenario 1
    case (request.query.priority !== undefined) &
      (request.query.status !== undefined):
      getTodosQuery = ` 
      SELECT * FROM todo
      WHERE status = '${status}'
      ANd priority = '${priority}';
      `;
      break;
    // scenario 2
    case request.query.priority !== undefined:
      getTodosQuery = `
        SELECT * FROM todo
        WHERE priority = '${priority}';
        `;
      break;
    // scenario 3
    case request.query.status !== undefined:
      getTodosQuery = `
        SELECT * FROM todo
        WHERE status = '${status}';
        `;
      break;
    // scenario 4
    case request.query.search_q !== undefined:
      getTodosQuery = `
        SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%';
        `;
      break;
    default:
      getTodosQuery = `
        SELECT * FROM todo;
        `;
  }

  data = await db.all(getTodosQuery);
  response.send(data);
});

// API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT * FROM todo
    WHERE todo.id=${todoId};
    `;
  const dbResponse = await db.get(getTodoQuery);
  response.send(dbResponse);
});

// API 3
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoDetails = `
    INSERT INTO todo(id,todo,priority,status)
    values(
        ${id},
        '${todo}',
        '${priority}',
        '${status}'
        );`;
  const dbResponse = await db.run(postTodoDetails);
  const todoId = dbResponse.lastID;
  response.send("Todo Successfully Added");
});

// API 4
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let { todo, priority, status } = request.body;
  let putTodoQuery = " ";
  let property = "";

  switch (true) {
    case request.body.todo !== undefined:
      putTodoQuery = `
          UPDATE todo
          SET todo='${todo}'
          WHERE id=${todoId};
          `;
      property = "Todo";
      break;
    case request.body.priority !== undefined:
      putTodoQuery = `
          UPDATE todo
          SET priority='${priority}'
          WHERE id=${todoId};
          `;
      property = "Priority";
      break;
    case request.body.status !== undefined:
      putTodoQuery = `
          UPDATE todo
          SET status='${status}'
          WHERE id=${todoId};
          `;
      property = "Status";
      break;
  }

  await db.run(putTodoQuery);
  response.send(`${property} Updated`);
});

// API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM todo
    WHERE id=${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
