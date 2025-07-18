import React from "react";
import Layout from "../components/common/Layout";
import TaskList from "../components/tasks/TaskList";

const TasksPage = () => {
  return (
    <Layout>
      <TaskList />
    </Layout>
  );
};

export default TasksPage;
