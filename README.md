# AlgoTasker

A Smart Task Scheduling System

# 🎯 Overview

AlgoTasker is an intelligent task scheduling system that automatically organizes your to-do list using classic CPU scheduling algorithms. <br>
It provides real-time visualization of how different algorithms (Shortest Job First, Priority Scheduling, and Round Robin) handle your tasks, helping you understand which approach works best for your workflow.

# 🎨 Key Highlights

**Smart Scheduling:** Automatically schedules tasks based on urgency, estimated time, and due dates <br>
**Algorithm Visualization:** Interactive Gantt charts and comparison tools <br>
**Real-time Analytics:** Performance metrics and algorithm comparisons <br>
**Responsive Design:** Works seamlessly on desktop and mobile devices <br>
**Professional UI:** Clean, modern interface using Material-UI <br>

# ✨ Features

**🔐 Authentication System**

**Secure Registration/Login:** JWT-based authentication <br>
**User Management:** Individual user accounts with isolated task data <br>
**Session Management:** Automatic token refresh and logout<br>

**📝 Task Management**

**CRUD Operations:** Create, read, update, and delete tasks <br>
**Smart Prioritization:** Automatic urgency calculation based on due dates and priority<br>
**Task Categories:** Pending, In-Progress, and Completed states<br>
**Detailed Task Info:** Title, description, priority (1-5), estimated time, due date<br>

**🧮 Scheduling Algorithms**

**Shortest Job First (SJF):** Schedules shortest tasks first to minimize wait time<br>
**Priority Scheduling:** Orders tasks by urgency and priority levels<br>
**Round Robin:** Time-sliced execution with configurable quantum<br>
**Algorithm Comparison:** Side-by-side performance analysis<br>

**📊 Visualization & Analytics**

**Interactive Gantt Charts:** D3.js powered timeline visualization<br>
**Performance Metrics:** Average wait time, turnaround time calculations<br>
**Comparison Dashboard:** Bar charts comparing algorithm efficiency<br>
**Task Statistics:** Overview of completed, pending, and overdue tasks<br>

**🎨 User Interface**

**Material-UI Design:** Professional, responsive components<br>
**Dark/Light Theme:** Customizable appearance<br>
**Mobile Responsive:** Optimized for all screen sizes<br>
**Intuitive Navigation:** Easy-to-use interface with clear workflows<br>

# 🛠 Tech Stack

**Frontend** <br>

React.js 18.x - UI Framework <br>
Material-UI 5.x - Component Library<br>
React Router 6.x - Client-side routing<br>
Recharts 2.x - Chart visualization<br>
D3.js 7.x - Advanced data visualization<br>
Axios 1.x - HTTP client<br>
Date-fns 2.x - Date manipulation<br>

**Backend**<br>
Node.js 18.x - Runtime environment<br>
Express.js 4.x - Web framework<br>
MongoDB 6.x - NoSQL database<br>
Mongoose 7.x - MongoDB ODM<br>
JWT - Authentication<br>
bcryptjs - Password hashing<br>
CORS - Cross-origin requests<br>

**Development Tools**<br>
Nodemon - Auto-restart development server<br>
Git - Version control<br>
npm - Package management<br>
ESLint - Code linting<br>
Prettier - Code formatting<br>

# 📁 Project Structure

algotasker/<br>
├── frontend/ <br>
│ ├── public/ <br>
│ │ ├── index.html <br>
│ │ └── favicon.ico <br>
│ ├── src/ <br>
│ │ ├── components/ <br>
│ │ │ ├── Navbar.js <br>
│ │ │ └── GanttChart.js <br>
│ │ ├── pages/ <br>
│ │ │ ├── Login.js <br>
│ │ │ ├── Register.js <br>
│ │ │ ├── Dashboard.js <br>
│ │ │ ├── TaskManager.js <br>
│ │ │ └── AlgorithmVisualizer.js <br>
│ │ ├── context/ <br>
│ │ │ └── AuthContext.js <br>
│ │ ├── utils/ <br>
│ │ │ └── api.js <br>
│ │ ├── App.js <br>
│ │ └── index.js <br>
│ ├── package.json <br>
│ └── .env <br>
├── backend/ <br>
│ ├── controllers/ <br>
│ ├── models/ <br>
│ │ ├── User.js <br>
│ │ └── Task.js <br>
│ ├── routes/ <br>
│ │ ├── auth.js <br>
│ │ ├── tasks.js <br>
│ │ └── schedule.js <br>
│ ├── middleware/ <br>
│ │ └── auth.js <br>
│ ├── utils/ <br>
│ │ └── schedulingAlgorithms.js <br>
│ ├── server.js <br>
│ ├── package.json <br>
│ ├── .env <br>
│ └── test-api.js <br>
├── README.md <br>
└── .gitignore <br>

# 🤝 Contributing

We welcome contributions to AlgoTasker!

# 📄 License

This project is licensed under the MIT License - see the [LICENSE](<[AlgoTasker/LICENSE](https://github.com/adarsh0011/AlgoTasker/blob/main/LICENSE)>) file for detail
