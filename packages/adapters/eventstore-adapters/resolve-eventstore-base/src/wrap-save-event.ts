import {
  AdapterState,
  AdapterImplementation,
  EventForSave,
  IAdapterOptions,
  IEventFromDatabase
} from './types'

import throwWhenDisposed from './throw-when-disposed'
import connectOnDemand from './connect-on-demand'

function wrapSaveEvent<
  AdapterConnection extends any,
  AdapterOptions extends IAdapterOptions,
  EventFromDatabase extends IEventFromDatabase
>(
  state: AdapterState<AdapterConnection, AdapterOptions>,
  implementation: AdapterImplementation<
    AdapterConnection,
    AdapterOptions,
    EventFromDatabase
  >,
  method: (
    state: AdapterState<AdapterConnection, AdapterOptions>,
    event: EventForSave
  ) => Promise<void>
): (event: EventForSave) => Promise<void> {
  return async (event: EventForSave) => {
    throwWhenDisposed(state)
    await connectOnDemand(state, implementation)
    const connection = state.connection
    if (connection == null) {
      throw new Error('Bad connection')
    }
    if (
      typeof implementation.isFrozen === 'function' &&
      (await implementation.isFrozen(connection))
    ) {
      throw new Error('Event store is frozen')
    }
    return method(state, event)
  }
}

export default wrapSaveEvent
