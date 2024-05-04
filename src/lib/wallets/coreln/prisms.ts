import type { Prism } from '$lib/@types/prisms.js';
import type { PrismsInterface } from '../interfaces.ts';
import handleError from './error';
import type { CoreLnError, CorelnConnectionInterface } from './types';
import { getPrisms } from './worker';

class Prisms implements PrismsInterface {
  connection: CorelnConnectionInterface

  constructor(connection: CorelnConnectionInterface) {
    this.connection = connection
  }

  public async get(): Promise<Prism[]> {
    console.log("prisms.ts get() called !!!!!!!!!!!!!")
    try {
      const prisms = await getPrisms({
        rune: this.connection.rune,
        walletId: this.connection.walletId,
        socketId: this.connection.socket!.id
      })

      //this returns Prism[].  does PrismListResponse get converted above?
      return prisms
    } catch (error) {
      const context = 'get (prisms)'

      const connectionError = handleError(error as CoreLnError, context, this.connection.walletId)

      this.connection.errors$.next(connectionError)
      throw connectionError
    }
  }
}

export default Prisms
