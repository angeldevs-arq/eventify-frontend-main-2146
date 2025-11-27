/**
 * @class Event
 * @description Entity class representing an event
 */
export class Event {

  constructor( { id = '',
                 title = '',
                 date = '',
                 customer = '',
                 location = '',
                 status = 'pending' //default in the options
               }  = {} ) {
    this.id = id;
    this.title = title;
    this.date = date;
    this.customer = customer;
    this.location = location;
    this.status = status;
  }

  /**
   * Checks if the event is active
   * @returns {boolean} True if the event is active
   */
  isActive() {
    return this.status.toLowerCase() === 'active';
  }

  /**
   * Checks if the event is pending confirmation
   * @returns {boolean} True if the event is pending
   */
  isPending() {
    return this.status.toLowerCase() === 'pending';
  }

  isCancelled() {
    return this.status.toLowerCase() === 'cancelled';
  }

  /**
   * Converts the Event instance to a plain JavaScript object
   * @returns {Object} Plain object representation of the event
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      date: this.date,
      customer: this.customer,
      location: this.location,
      status: this.status
    };
  }
}
