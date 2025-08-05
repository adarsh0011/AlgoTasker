# 🚀 Installation Guide

**Step 1: Clone the Repository**

**Clone the project**

git clone https://github.com/yourusername/algotasker.git <br>
cd algotasker<br>

**Verify project structure**

ls -la (Should show: frontend/ backend/ README.md)

Step 2: Backend Setup

# Navigate to backend directory

cd backend

# Initialize Node.js project

npm init -y

# Install production dependencies

npm install express mongoose cors dotenv bcryptjs jsonwebtoken moment

# Install development dependencies

npm install -D nodemon

# Create directory structure

mkdir controllers models routes middleware config utils

Step 3: Frontend Setup

# Navigate to frontend directory

cd ../frontend

# Create React application

npx create-react-app . --template javascript

# Install UI dependencies

npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material @mui/x-date-pickers

# Install utility dependencies

npm install axios recharts d3 date-fns react-router-dom

Step 4: Database Setup

# Start MongoDB service

sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running

mongo --eval "db.adminCommand('ismaster')"

Step 5: Environment Configuration
Create environment files with your specific configurations:
Backend (.env)

MONGODB_URI=mongodb://localhost:27017/algotasker
JWT_SECRET=your_super_secret_jwt_key_here
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:3000

Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
REACT_APP_APP_NAME=AlgoTasker

⚙️ Configuration
Database Configuration
MongoDB connection is configured in backend/server.js:
mongoose.connect(process.env.MONGODB_URI, {
useNewUrlParser: true,
useUnifiedTopology: true,
});

CORS Configuration
app.use(cors({
origin: process.env.CORS_ORIGIN,
credentials: true
}));

JWT Configuration
const token = jwt.sign(
{ userId: user.\_id },
process.env.JWT_SECRET,
{ expiresIn: '7d' }
);

🎮 Usage
Starting the Application

Start MongoDB

sudo systemctl start mongod

Start Backend Server
cd backend
npm run dev

# Server will run on http://localhost:5000

Start Frontend Application
cd frontend
npm start

# Application will open at http://localhost:3000
