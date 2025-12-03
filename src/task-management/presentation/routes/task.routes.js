// src/task-management/presentation/routes/task.routes.js

export const taskRoutes = [
  {
    path: '/organizer/tasks',
    name: 'OrganizerTasks',
    component: () => import('../views/TaskManagementView.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: 'ORGANIZER',
      title: 'Task Management'
    }
  },
  {
    path: '/host/progress',
    name: 'HostProgress',
    component: () => import('../views/TaskProgressView.vue'),
    meta: {
      requiresAuth: true,
      requiresRole: 'HOST',
      title: 'Event Progress'
    }
  }
];
