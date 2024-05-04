import { filter, firstValueFrom, fromEvent, map } from 'rxjs'
import { createRandomHex } from '$lib/crypto.js'
import type { Channel } from '$lib/@types/channels.js'
import type { GetSortedFilteredItemsOptions } from '$lib/@types/common.js'
import type { Tag } from '$lib/@types/metadata.js'
import type { InvoicePayment, TransactionPayment } from '$lib/@types/payments.js'
import type { Prism } from '$lib/@types/prisms'

const worker = new Worker(new URL('./db.worker.ts', import.meta.url), {
  type: 'module'
})

const messages$ = fromEvent<MessageEvent>(worker, 'message')

export const updateChannels = async (channels: Channel[]): Promise<void> => {
  const id = createRandomHex()

  const complete = firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw new Error(message.data.error)
        }
      })
    )
  )

  worker.postMessage({ id, type: 'update_channels', channels })

  return complete
}

export const updateTransactions = async (transactions: TransactionPayment[]): Promise<void> => {
  const id = createRandomHex()

  const complete = firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw new Error(message.data.error)
        }
      })
    )
  )

  worker.postMessage({ id, type: 'update_transactions', transactions })

  return complete
}

export const updateAddresses = async (): Promise<void> => {
  const id = createRandomHex()

  const complete = firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw new Error(message.data.error)
        }
      })
    )
  )

  worker.postMessage({ id, type: 'update_addresses' })

  return complete
}

export const updateInvoices = async (): Promise<void> => {
  const id = createRandomHex()

  const complete = firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw new Error(message.data.error)
        }
      })
    )
  )

  worker.postMessage({ id, type: 'update_invoices' })

  return complete
}

//this is a {} in the logs, but i need prisms[] here?
//this is to save to the database.  i can get multiple prisms.
//so yea i am passing a wrong parameter to this updatePrisms.  
//i need to pass prism.prisms to this.  
export const updatePrisms = async (prisms: Prism[]): Promise<void> => {
  console.log("helpers.ts/updatePrisms() called with " + JSON.stringify(prisms))
  const id = createRandomHex() //does this id need to be created?
  //should i not use prism_id here?

  //its going to here.

  const complete = firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          console.log("is this erroring out?")
          throw new Error(message.data.error)
        }
      })
    )
  )

  console.log("before worker.postMessage update_prisms id: " + id + " prisms: " + JSON.stringify(prisms))

  worker.postMessage({ id, type: 'update_prisms', prisms })

  console.log("after worker.postMessage update_prisms")
  return complete
}

export const updateTableItems = async (table: string, data: unknown[]): Promise<void> => {
  const id = createRandomHex()

  const complete = firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw new Error(message.data.error)
        }
      })
    )
  )

  worker.postMessage({ id, type: 'update_table_items', table, data })

  return complete
}

export const bulkPut = async (table: string, data: unknown[]): Promise<void> => {
  const id = createRandomHex()

  const complete = firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw new Error(message.data.error)
        }
      })
    )
  )

  worker.postMessage({ id, type: 'bulk_put', table, data })

  return complete
}

export const getLastPaidInvoice = async (walletId: string): Promise<InvoicePayment> => {
  const id = createRandomHex()

  const complete = firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw new Error(message.data.error)
        }

        return message.data.result
      })
    )
  )

  worker.postMessage({ id, type: 'get_lastpay_index', walletId })

  return complete as Promise<InvoicePayment>
}

export const getAllTags = (): Promise<Tag[]> => {
  const id = createRandomHex()

  const complete = firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          throw new Error(message.data.error)
        }

        return message.data.result
      })
    )
  )

  worker.postMessage({ id, type: 'get_all_tags' })

  return complete as Promise<Tag[]>
}

export const getSortedFilteredItems = async (
  options: GetSortedFilteredItemsOptions
): Promise<unknown[]> => {
  console.log("getSortedFilteredItems()")
  const { limit, sort, filters, tags, lastItem, table, lastItemKey } = options
  const id = createRandomHex()

  console.log('limit:', JSON.stringify(limit));
  console.log('sort:', JSON.stringify(sort));
  console.log('filters:', JSON.stringify(filters));
  console.log('tags:', JSON.stringify(tags));
  console.log('lastItem:', JSON.stringify(lastItem));
  console.log('table:', JSON.stringify(table));
  console.log('lastItemKey:', JSON.stringify(lastItemKey));
  console.log('id = ' + JSON.stringify(id))  

  const complete = firstValueFrom(
    messages$.pipe(
      filter(message => message.data.id === id),
      map(message => {
        if (message.data.error) {
          console.log("error in firstValueFrom " + message.data.error)
          throw new Error(message.data.error)
        }

        console.log("return message.data.result")
        return message.data.result
      })
    )
  )

  console.log("before worker.postMessage")
  worker.postMessage({
    id,
    type: 'get_filtered_sorted_items',
    limit,
    sort,
    filters,
    tags,
    table,
    lastItem,
    lastItemKey
  })
  console.log("after worker.postMessage")

  //its going after this
  return complete as Promise<unknown[]>
}
