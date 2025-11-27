/**
 * @fileoverview Routes configuration for events
 * @module eventRoutes
 */

// Routes for events module
export const eventRoutes = {
  // List events
  list: '/social-events',

  // Get event by ID
  detail: id => `/social-events/${id}`,

  // Create event
  create: '/social-events/create',

  // Edit event
  edit: id => `/social-events/edit/${id}`
};
