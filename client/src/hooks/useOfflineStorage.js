import { useState, useEffect } from "react";

// Simple offline storage hook using localStorage
// In production, consider using IndexedDB for better performance
export const useOfflineStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Hook for managing offline tasks
export const useOfflineTasks = () => {
  const [offlineTasks, setOfflineTasks] = useOfflineStorage(
    "offline-tasks",
    []
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineTasks();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addOfflineTask = (task) => {
    const taskWithId = {
      ...task,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      synced: false,
    };

    setOfflineTasks((prev) => [...prev, taskWithId]);
    return taskWithId;
  };

  const removeOfflineTask = (taskId) => {
    setOfflineTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const syncOfflineTasks = async () => {
    if (!isOnline || offlineTasks.length === 0) return;

    const unsyncedTasks = offlineTasks.filter((task) => !task.synced);

    for (const task of unsyncedTasks) {
      try {
        // This would be your API call to sync the task
        // await syncTaskToServer(task);

        // Mark as synced
        setOfflineTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, synced: true } : t))
        );
      } catch (error) {
        console.error("Failed to sync task:", error);
      }
    }

    // Remove synced tasks after successful sync
    setTimeout(() => {
      setOfflineTasks((prev) => prev.filter((task) => !task.synced));
    }, 1000);
  };

  return {
    offlineTasks,
    isOnline,
    addOfflineTask,
    removeOfflineTask,
    syncOfflineTasks,
  };
};
