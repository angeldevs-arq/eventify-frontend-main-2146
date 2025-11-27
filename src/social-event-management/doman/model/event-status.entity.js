/**
 * @class EventStatus
 * @description Value object representing event status
 */
export class EventStatus {
  // Status constants
  static ACTIVE = 'Active';
  static PENDING = 'Pending';
  static CANCELLED = 'Cancelled';

  /**
   * Get all available statuses
   * @returns {string[]} Array of status values
   */
  static getAllStatuses() {
    return [
      EventStatus.ACTIVE,
      EventStatus.PENDING,
      EventStatus.CANCELLED
    ];
  }

  /**
   * Check if a status is valid
   * @param {string} status - Status to validate
   * @returns {boolean} True if status is valid
   */
  static isValid(status) {
    return EventStatus.getAllStatuses()
      .map(s => s.toLowerCase())
      .includes(status.toLowerCase());
  }
}
