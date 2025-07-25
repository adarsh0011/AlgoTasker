// public/serviceWorker.js
const CACHE_NAME = "algotasker-v1.0.0";
const API_CACHE_NAME = "algotasker-api-v1.0.0";

// Assets to cache for offline functionality
const STATIC_ASSETS = [
  "/",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  // Add more static assets as needed
];

// API endpoints to cache
const API_ENDPOINTS = [
  "/api/tasks",
  "/api/auth/me",
  "/api/scheduler/analytics",
];

// Install event - cache static assets
this.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[ServiceWorker] Caching static assets");
        return cache.addAll(STATIC_ASSETS);
      })
      .then(function () {
        console.log("[ServiceWorker] Static assets cached successfully");
        return this.skipWaiting();
      })
      .catch((error) => {
        console.error("[ServiceWorker] Failed to cache static assets:", error);
      })
  );
});

// Activate event - clean up old caches
this.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log("[ServiceWorker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("[ServiceWorker] Claiming clients");
        return this.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
this.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(handleApiRequest(request));
  }
  // Handle static assets
  else if (
    request.destination === "document" ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "image"
  ) {
    event.respondWith(handleStaticAssets(request));
  }
  // Handle navigation requests
  else if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
  }
});

// Handle API requests with Network First strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);

  try {
    // Try network first
    const networkResponse = await fetch(request);

    // Cache successful GET requests
    if (request.method === "GET" && networkResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      const responseClone = networkResponse.clone();

      // Add timestamp to cached response
      const responseWithTimestamp = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: {
          ...Object.fromEntries(responseClone.headers.entries()),
          "sw-cache-timestamp": Date.now().toString(),
        },
      });

      cache.put(request, responseWithTimestamp);
    }

    return networkResponse;
  } catch (error) {
    console.log(
      "[ServiceWorker] Network failed, trying cache for:",
      url.pathname
    );

    // If network fails, try cache for GET requests
    if (request.method === "GET") {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        // Check if cached response is stale (older than 5 minutes)
        const cacheTimestamp = cachedResponse.headers.get("sw-cache-timestamp");
        const isStale =
          cacheTimestamp &&
          Date.now() - parseInt(cacheTimestamp) > 5 * 60 * 1000;

        if (isStale) {
          console.log(
            "[ServiceWorker] Cached data is stale, but returning due to network error"
          );
        }

        return cachedResponse;
      }
    }

    // Return offline page for failed requests
    return new Response(
      JSON.stringify({
        error: "Network error",
        message: "Unable to fetch data. Please check your connection.",
        offline: true,
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle static assets with Cache First strategy
async function handleStaticAssets(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch from network
    const networkResponse = await fetch(request);

    // Cache the response if successful
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error("[ServiceWorker] Failed to fetch static asset:", error);

    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline fallback
    return new Response("Offline", {
      status: 503,
      statusText: "Service Unavailable",
    });
  }
}

// Handle navigation requests
async function handleNavigation(request) {
  try {
    // Try network first for navigation
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // If network fails, return cached index.html for SPA routing
    const cachedResponse = await caches.match("/");
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return basic offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>AlgoTasker - Offline</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 50px;
              background-color: #f5f5f5;
            }
            .offline-container {
              max-width: 400px;
              margin: 0 auto;
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .offline-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 { color: #333; }
            p { color: #666; }
            .retry-btn {
              background: #1976d2;
              color: white;
              border: none;
              padding: 12px 24px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 16px;
              margin-top: 20px;
            }
            .retry-btn:hover {
              background: #1565c0;
            }
          </style>
        </head>
        <body>
          <div class="offline-container">
            <div class="offline-icon">📱</div>
            <h1>AlgoTasker</h1>
            <h2>You're offline</h2>
            <p>Please check your internet connection and try again.</p>
            <button class="retry-btn" onclick="window.location.reload()">
              Retry
            </button>
          </div>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}

// Handle background sync for failed requests
this.addEventListener("sync", (event) => {
  console.log("[ServiceWorker] Background sync:", event.tag);

  if (event.tag === "background-sync-tasks") {
    event.waitUntil(syncTasks());
  }
});

// Sync tasks when connection is restored
async function syncTasks() {
  try {
    // Get pending tasks from IndexedDB or localStorage
    const pendingTasks = await getPendingTasks();

    for (const task of pendingTasks) {
      try {
        const response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${task.token}`,
          },
          body: JSON.stringify(task.data),
        });

        if (response.ok) {
          // Remove from pending list
          await removePendingTask(task.id);
          console.log("[ServiceWorker] Synced task successfully:", task.id);
        }
      } catch (error) {
        console.error("[ServiceWorker] Failed to sync task:", error);
      }
    }
  } catch (error) {
    console.error("[ServiceWorker] Background sync failed:", error);
  }
}

// Helper function to get pending tasks (implement based on your storage strategy)
async function getPendingTasks() {
  // This would typically read from IndexedDB
  // For now, return empty array
  return [];
}

// Helper function to remove pending task
async function removePendingTask(taskId) {
  // This would typically remove from IndexedDB
  console.log("[ServiceWorker] Removing pending task:", taskId);
}

// Handle push notifications
this.addEventListener("push", (event) => {
  console.log("[ServiceWorker] Push received:", event);

  const options = {
    body: event.data ? event.data.text() : "New task reminder",
    icon: "/logo192.png",
    badge: "/logo192.png",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: "explore",
        title: "View Tasks",
        icon: "/logo192.png",
      },
      {
        action: "close",
        title: "Close",
        icon: "/logo192.png",
      },
    ],
  };

  event.waitUntil(this.registration.showNotification("AlgoTasker", options));
});

// Handle notification clicks
this.addEventListener("notificationclick", (event) => {
  console.log("[ServiceWorker] Notification click received:", event);

  event.notification.close();

  if (event.action === "explore") {
    // Open the app and navigate to tasks
    // eslint-disable-next-line no-restricted-globals
    event.waitUntil(self.clients.openWindow("/tasks"));
  } else if (event.action === "close") {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    // eslint-disable-next-line no-restricted-globals
    event.waitUntil(self.clients.openWindow("/"));
  }
});

// Handle messages from the main app
this.addEventListener("message", (event) => {
  console.log("[ServiceWorker] Message received:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    this.skipWaiting();
  }

  if (event.data && event.data.type === "CACHE_TASK") {
    // Cache a specific task for offline access
    cacheTaskForOffline(event.data.task);
  }
});

// Cache specific task data for offline access
async function cacheTaskForOffline(task) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const taskResponse = new Response(JSON.stringify(task), {
      headers: { "Content-Type": "application/json" },
    });

    await cache.put(`/api/tasks/${task._id}`, taskResponse);
    console.log("[ServiceWorker] Cached task for offline:", task._id);
  } catch (error) {
    console.error("[ServiceWorker] Failed to cache task:", error);
  }
}

// Periodic background sync for updating cached data
this.addEventListener("periodicsync", (event) => {
  console.log("[ServiceWorker] Periodic sync:", event.tag);

  if (event.tag === "update-cache") {
    event.waitUntil(updateCachedData());
  }
});

// Update cached data in background
async function updateCachedData() {
  try {
    console.log("[ServiceWorker] Updating cached data...");

    // Update tasks cache
    const tasksResponse = await fetch("/api/tasks");
    if (tasksResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put("/api/tasks", tasksResponse.clone());
    }

    // Update user profile cache
    const userResponse = await fetch("/api/auth/me");
    if (userResponse.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put("/api/auth/me", userResponse.clone());
    }

    console.log("[ServiceWorker] Cache updated successfully");
  } catch (error) {
    console.error("[ServiceWorker] Failed to update cache:", error);
  }
}

// Log service worker lifecycle events
console.log("[ServiceWorker] Service Worker script loaded");

// Handle unhandled promise rejections
this.addEventListener("unhandledrejection", (event) => {
  console.error("[ServiceWorker] Unhandled promise rejection:", event.reason);
  event.preventDefault();
});

// Cleanup function for debugging
function clearAllCaches() {
  return caches.keys().then((cacheNames) => {
    return Promise.all(
      cacheNames.map((cacheName) => {
        console.log("[ServiceWorker] Deleting cache:", cacheName);
        return caches.delete(cacheName);
      })
    );
  });
}

// Export for debugging (available in dev tools)
if (typeof this !== "undefined") {
  this.clearAllCaches = clearAllCaches;
}
