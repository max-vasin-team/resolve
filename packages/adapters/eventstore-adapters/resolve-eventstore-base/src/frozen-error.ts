const EventstoreFrozenError: {
  new (message?: string): Error
  is: (error: any) => boolean
} = function (this: Error, message?: string): void {
  Error.call(this)
  this.message = message ?? 'Event store is frozen'
  this.name = 'EventstoreFrozenError'
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, EventstoreFrozenError)
  } else {
    this.stack = new Error().stack
  }
} as any

void ((EventstoreFrozenError as any).is = (error: any): boolean =>
  error != null && error.name === 'EventstoreFrozenError')

EventstoreFrozenError.prototype = Object.create(Error.prototype, {
  constructor: { enumerable: true, value: EventstoreFrozenError },
})

export default EventstoreFrozenError
