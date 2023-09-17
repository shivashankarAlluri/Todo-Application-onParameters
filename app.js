const express = require("express");
const app = express();
app.use(express.json());
const format = require("date-fns/format");
const isMatch = require("date-fns/isMatch");
const isValid = require("date-fns/isValid");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");
let database = null;
const initializeDBandServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at 3000 port");
    });
  } catch (e) {
    console.log(`database Error at ${e.message}`);
  }
};
initializeDBandServer();
//API 1
const convertDB = (object) => {
  return {
    id: object.id,
    todo: object.todo,
    priority: object.priority,
    status: object.status,
    category: object.category,
    dueDate: object.due_date,
  };
};
const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};
const hasCategory = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hasPriorityandStatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.priority !== undefined
  );
};
const hasCategoryandStatus = (requestQuery) => {
  return (
    requestQuery.status !== undefined && requestQuery.category !== undefined
  );
};
const hasCategoryandPriority = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.category !== undefined
  );
};
const hasSearch = (requestQuery) => {
  return requestQuery.search_q !== undefined;
};
app.get("/todos/", async (request, response) => {
  const { search_q = "", category, status, priority } = request.query;
  switch (true) {
    /*----------has priority and status--------------*/
    case hasPriorityandStatus(request.query):
      if (
        (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") &&
        (status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
      ) {
        const priorityAndStatusQuery = `SELECT * FROM
                    todo WHERE status='${status}' AND priority='${priority}';`;
        const Query = await database.all(priorityAndStatusQuery);
        response.send(Query.map((object) => convertDB(object)));
      } else {
        if (
          status !== "TO DO" &&
          status !== "IN PROGRESS" &&
          status !== "DONE"
        ) {
          response.status(400);
          response.send("Invalid Todo Status");
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      }
      break;
    /*---------------has category and status-------*/
    case hasCategoryandStatus(request.query):
      if (
        (category === "HOME" ||
          category === "LEARNING" ||
          category === "WORK") &&
        (status === "TO DO" || status === "IN PROGRESS" || status === "DONE")
      ) {
        const categoryAndStatusQuery = `SELECT * FROM
                    todo WHERE status='${status}' AND category='${category}';`;
        const categoryStatusQuery = await database.all(categoryAndStatusQuery);
        response.send(categoryStatusQuery.map((object) => convertDB(object)));
      } else {
        if (
          status !== "TO DO" &&
          status !== "IN PROGRESS" &&
          status !== "DONE"
        ) {
          response.status(400);
          response.send("Invalid Todo Status");
        } else {
          response.status(400);
          response.send("Invalid Todo Category");
        }
      }
      break;
    /*---------------has category and priority-----*/
    case hasCategoryandPriority(request.query):
      if (
        (category === "HOME" ||
          category === "LEARNING" ||
          category === "WORK") &&
        (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW")
      ) {
        const categoryAndPriorityQuery = `SELECT * FROM
                    todo WHERE priority='${priority}' AND category='${category}';`;
        const QuerypriorityandCategory = await database.all(
          categoryAndPriorityQuery
        );
        response.send(
          QuerypriorityandCategory.map((object) => convertDB(object))
        );
      } else {
        if (
          category !== "HOME" &&
          category !== "LEARNING" &&
          category !== "WORK"
        ) {
          response.status(400);
          response.send("Invalid Todo Category");
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      }
      break;
    /*---------------has search-------------------*/
    case hasSearch(request.query):
      const searchQuery = `SELECT * FROM todo
        WHERE todo LIKE '%${search_q}%';`;
      const searchData = await database.all(searchQuery);
      response.send(searchData.map((object) => convertDB(object)));
      break;
    /*--------------has status-------------------*/
    case hasStatus(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        const statusQuery = `SELECT * FROM todo
        WHERE status='${status}';`;
        const statusDetails = await database.all(statusQuery);
        response.send(statusDetails.map((object) => convertDB(object)));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    /*----------------has priority -----------------*/
    case hasPriority(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        const priorityQuery = `SELECT * FROM todo
        WHERE priority='${priority}';`;
        const priorityDetails = await database.all(priorityQuery);
        response.send(priorityDetails.map((object) => convertDB(object)));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    /*--------------------has category-----------------*/
    case hasCategory(request.query):
      if (
        category === "HOME" ||
        category === "WORK" ||
        priority === "LEARNING"
      ) {
        const categoryQuery = `SELECT * FROM todo
        WHERE category='${category}';`;
        const categoryDetails = await database.all(categoryQuery);
        response.send(categoryDetails.map((object) => convertDB(object)));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
  }
});
//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const todoQuery = `SELECT * FROM todo
    WHERE id=${todoId};`;
  const idQuery = await database.get(todoQuery);
  response.send(convertDB(idQuery));
});

//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  console.log(isMatch(date, "yyyy-MM-dd"));
  if (isMatch(date, "yyyy-MM-dd")) {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    console.log(formattedDate);
    const Query = `SELECT * FROM todo
    WHERE due_date='${formattedDate}';`;
    const dateQuery = await database.all(Query);
    response.send(dateQuery.map((object) => convertDB(object)));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

//API 4
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "DONE" || status === "IN PROGRESS") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
          const selectedQuery = `INSERT INTO todo
                    (id,todo,priority,status,category,due_date)
                    VALUES
                    (${id},'${todo}','${priority}','${status}','${category}','${formattedDate}');`;
          await database.run(selectedQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});
//API 5
const todoStatus = (body) => {
  return body.status !== undefined;
};
const todoPriority = (body) => {
  return body.priority !== undefined;
};
const todoTodo = (body) => {
  return body.todo !== undefined;
};
const todoCategory = (body) => {
  return body.category !== undefined;
};
const todoDate = (body) => {
  return body.dueDate !== undefined;
};
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateQuery;
  const previousQuery = `SELECT * FROM todo
  WHERE id=${todoId};`;
  const previousTodo = await database.get(previousQuery);
  console.log(previousTodo);
  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
    category = previousTodo.category,
    dueDate = previousTodo.due_date,
  } = request.body;
  switch (true) {
    case todoStatus(request.body):
      if (status === "TO DO" || status === "DONE" || status === "IN PROGRESS") {
        updateQuery = `UPDATE todo
                        SET 
                        todo='${todo}',
                        priority='${priority}',
                        due_date='${dueDate}',
                        status='${status}',
                        category='${category}' 
                        WHERE id=${todoId};`;
        const statusInserted = await database.run(updateQuery);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case todoPriority(request.body):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateQuery = `UPDATE todo
                        SET 
                        todo='${todo}',
                        priority='${priority}',
                        due_date='${dueDate}',
                        status='${status}',
                        category='${category}' 
                        WHERE id=${todoId};`;
        const priorityInserted = await database.run(updateQuery);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case todoTodo(request.body):
      updateQuery = `UPDATE todo
            SET 
            todo='${todo}',
            priority='${priority}',
            due_date='${dueDate}',
            status='${status}',
            category='${category}' 
            WHERE id=${todoId};`;
      const todoInserted = await database.run(updateQuery);
      response.send("Todo Updated");
      break;
    case todoCategory(request.body):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateQuery = `UPDATE todo
                        SET 
                        todo='${todo}',
                        priority='${priority}',
                        due_date='${dueDate}',
                        status='${status}',
                        category='${category}' 
                        WHERE id=${todoId};`;
        const categoryInserted = await database.run(updateQuery);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case todoDate(request.body):
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
        updateQuery = `UPDATE todo
                SET 
                todo='${todo}',
                priority='${priority}',
                due_date='${formattedDate}',
                status='${status}',
                category='${category}' 
                WHERE id=${todoId};`;
        const duedateInserted = await database.run(updateQuery);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});

//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo
    WHERE id=${todoId};`;
  await database.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
