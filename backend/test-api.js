const axios = require("axios");

const API_BASE = "http://localhost:5000";

const testAPI = async () => {
  try {
    console.log("Testing AlgoTasker API...\n");

    // Test 1: Register user
    console.log("1. Testing user registration...");
    const registerData = {
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    };

    const registerResponse = await axios.post(
      `${API_BASE}/api/auth/register`,
      registerData
    );
    console.log("✅ Registration successful");
    const token = registerResponse.data.token;

    // Test 2: Create task
    console.log("2. Testing task creation...");
    const taskData = {
      title: "Test Task",
      description: "This is a test task",
      priority: 4,
      estimatedTime: 3,
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
    };

    const taskResponse = await axios.post(`${API_BASE}/api/tasks`, taskData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ Task creation successful");

    // Test 3: Get tasks
    console.log("3. Testing task retrieval...");
    const tasksResponse = await axios.get(`${API_BASE}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(`✅ Retrieved ${tasksResponse.data.length} tasks`);

    // Test 4: Test scheduling algorithm
    console.log("4. Testing SJF algorithm...");
    const scheduleResponse = await axios.get(`${API_BASE}/api/schedule/sjf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log("✅ SJF algorithm executed successfully");

    console.log("\n🎉 All API tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error.response?.data || error.message);
  }
};

testAPI();
