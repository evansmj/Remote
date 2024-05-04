import { fromEvent, type BehaviorSubject, firstValueFrom, filter, map } from 'rxjs'
import type { ConnectionStatus } from '../interfaces.js'
import { createRandomHex } from '$lib/crypto.js'
import type { CommandoRequest, LnWebSocketOptions } from 'lnmessage/dist/types.js'
import type { Forward } from '$lib/@types/forwards.js'
import type { InvoicePayment, Network, TransactionPayment } from '$lib/@types/payments.js'
import type { Channel } from '$lib/@types/channels.js'
import type { Utxo } from '$lib/@types/utxos.js'

import type {
  ListAccountEventsResponse,
  ListForwardsResponse,
  ListTransactionsResponse,
  ListfundsResponse,
  Pay,
  PrismResponse,
  RawInvoice,
  SocketWrapper
} from './types.js'
import type { Prism } from '$lib/@types/prisms.js'

export const coreLnWorker = new Worker(
  new URL('$lib/wallets/coreln/coreln.worker.ts', import.meta.url),
  {
    type: 'module'
  }
)

const messages$ = fromEvent<MessageEvent>(coreLnWorker, 'message')

export const createSocket = async (
  connectionOptions: LnWebSocketOptions,
  connectionStatusUpdates$: BehaviorSubject<ConnectionStatus>
): Promise<SocketWrapper> => {
  const initId = createRandomHex()
  const socketId = createRandomHex()

  const initProm = firstValueFrom(messages$.pipe(filter(message => message.data.id === initId)))
  coreLnWorker.postMessage({ id: initId, type: 'init', data: connectionOptions, socketId })

  messages$
    .pipe(
      filter(
        message => message.data.id === 'connectionStatus$' && message.data.socketId === socketId
      ),
      map(({ data }) => data.result)
    )
    .subscribe(status => connectionStatusUpdates$.next(status as ConnectionStatus))

  await initProm

  const socket = {
    id: socketId,
    connect: async () => {
      const id = createRandomHex()
      coreLnWorker.postMessage({ id, type: 'connect', socketId })

      return firstValueFrom(
        messages$.pipe(
          filter(message => message.data.id === id),
          map(message => message.data.result as boolean)
        )
      )
    },
    disconnect: async () => {
      const id = createRandomHex()
      coreLnWorker.postMessage({ id, type: 'disconnect', socketId })

      return firstValueFrom(
        messages$.pipe(
          filter(message => message.data.id === id),
          map(() => undefined)
        )
      )
    },
    commando: async (request: CommandoRequest) => {
      const id = createRandomHex()
      coreLnWorker.postMessage({ id, type: 'commando', data: request, socketId })

      return firstValueFrom(
        messages$.pipe(
          filter(message => message.data.id === id),
          map(message => {
            if (message.data.error) {
              throw message.data.error
            }

            return message.data.result
          })
        )
      )
    }
  }

  return socket
}

export const formatPayments = async (
  invoices: RawInvoice[],
  pays: Pay[],
  walletId: string,
  network: Network
): Promise<InvoicePayment[]> => {
  const id = createRandomHex()

  coreLnWorker.postMessage({ id, type: 'format_payments', invoices, pays, walletId, network })

  return firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => message.data.result as InvoicePayment[])
    )
  )
}

export const formatForwards = async (
  forwards: ListForwardsResponse['forwards'],
  walletId: string
): Promise<Forward[]> => {
  const id = createRandomHex()

  coreLnWorker.postMessage({ id, type: 'format_forwards', forwards, walletId })

  return firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => message.data.result as Forward[])
    )
  )
}

export const formatTransactions = async (
  transactions: ListTransactionsResponse['transactions'],
  accountEvents: ListAccountEventsResponse | null,
  network: Network,
  walletId: string
): Promise<TransactionPayment[]> => {
  const id = createRandomHex()

  coreLnWorker.postMessage({
    id,
    type: 'format_transactions',
    transactions,
    accountEvents,
    network,
    walletId
  })

  return firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw message.data.error
        }

        return message.data.result as TransactionPayment[]
      })
    )
  )
}

export const getChannels = async (params: {
  rune: string
  version: number
  walletId: string
  socketId: string
  channel?: { id: string; peerId: string }
}): Promise<Channel[]> => {
  const id = createRandomHex()
  const { rune, version, walletId, channel, socketId } = params

  coreLnWorker.postMessage({
    id,
    type: 'get_channels',
    rune,
    version,
    walletId,
    channel,
    socketId
  })

  return firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw message.data.error
        }

        return message.data.result as Channel[]
      })
    )
  )
}

export const formatUtxos = async (
  outputs: ListfundsResponse['outputs'],
  accountEvents: ListAccountEventsResponse | null,
  walletId: string
): Promise<Utxo[]> => {
  const id = createRandomHex()

  coreLnWorker.postMessage({
    id,
    type: 'format_utxos',
    outputs,
    accountEvents,
    walletId
  })

  return firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw message.data.error
        }

        return message.data.result as Utxo[]
      })
    )
  )
}

export const getPrisms = async (params: {
  rune: string
  walletId: string
  socketId: string
}): Promise<Prism[]> => {
  console.log("worker.ts getPrisms called*********")
  const id = createRandomHex()
  const { rune, socketId } = params

  coreLnWorker.postMessage({
    id,
    type: 'get_prisms',
    rune,
    socketId
  })

  console.log("after coreLnWorker.postMessage")

  return firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw message.data.error
        }
        //here is where it gets mapped.  
        const formattedPrisms = message.data.result.map((responsePrism: PrismResponse) => {
          const { prism_id, prism_members, timestamp } = responsePrism
          return {
            id: prism_id,
            prism_members: prism_members,
            timestamp: timestamp
          } as Prism
        })
        console.log("formattedPrisms = " + JSON.stringify(formattedPrisms))
        return formattedPrisms
      })
    )
  )
}
