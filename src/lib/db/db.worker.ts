import type { Channel } from '$lib/@types/channels.js'
import { db } from './index.js'
import type { Filter, GetSortedFilteredItemsOptions, ValueOf } from '$lib/@types/common.js'
import type { Collection } from 'dexie'
import type TagFilters from '$lib/components/TagFilters.svelte'

import type {
  AddressPayment,
  InvoicePayment,
  Payment,
  TransactionPayment
} from '$lib/@types/payments.js'
import type { Prism } from '$lib/@types/prisms.js'

type MessageBase = {
  id: string
}

type UpdateChannelsMessage = MessageBase & {
  type: 'update_channels'
  channels: Channel[]
}

type UpdateTransactionsMessage = MessageBase & {
  type: 'update_transactions'
  transactions: TransactionPayment[]
}

type UpdateAddressesMessage = MessageBase & {
  type: 'update_addresses'
}

type UpdateInvoicesMessage = MessageBase & {
  type: 'update_invoices'
}

type UpdatePrismsMessage = MessageBase & {
  type: 'update_prisms',
  prisms: Prism[]
}

type UpdateTableItemsMessage = MessageBase & {
  type: 'update_table_items'
  table: string
  data: unknown[]
}

type BulkPutMessage = MessageBase & {
  type: 'bulk_put'
  table: string
  data: unknown[]
}

type GetLastPayMessage = MessageBase & {
  type: 'get_lastpay_index'
  walletId: string
}

type GetSortedFilteredItemsMessage = MessageBase & {
  type: 'get_filtered_sorted_items'
} & GetSortedFilteredItemsOptions

type GetAllTagsMessage = MessageBase & {
  type: 'get_all_tags'
}

type Message =
  | UpdateChannelsMessage
  | UpdateTransactionsMessage
  | UpdateTableItemsMessage
  | GetLastPayMessage
  | GetAllTagsMessage
  | GetSortedFilteredItemsMessage
  | BulkPutMessage
  | UpdateAddressesMessage
  | UpdateInvoicesMessage
  | UpdatePrismsMessage

onmessage = async (message: MessageEvent<Message>) => {
  switch (message.data.type) {
    case 'update_channels': {
      try {
        await Promise.all(
          message.data.channels.map(async channel => {
            // need to update channels as old channels lose data after 100 blocks of being close
            // so we don't want to overwrite data we already have as it is useful
            await db.channels
              .where({ id: channel.id, walletId: channel.walletId })
              .modify(channel)
              .then(async updated => {
                if (!updated) {
                  await db.channels.add(channel)
                }
              })
          })
        )

        self.postMessage({ id: message.data.id })
      } catch (error) {
        const { message: errMsg } = error as Error
        self.postMessage({ id: message.data.id, error: errMsg })
      }

      return
    }
    case 'update_transactions': {
      try {
        const { transactions } = message.data

        if (transactions.length) {
          await Promise.all(
            transactions.map(async transaction => {
              // CLN replaced(?) transaction has a block height of 0
              if (transaction.data.blockHeight === 0) {
                await db.payments.delete(transaction.id)
                return
              }

              //does this transaction object have .id already?  yes clearly
              //
              return db.payments.update(transaction.id, transaction).then(updated => {
                !updated && db.payments.put(transaction)
              })
            })
          )
        }

        self.postMessage({ id: message.data.id })
      } catch (error) {
        const { message: errMsg } = error as Error
        self.postMessage({ id: message.data.id, error: errMsg })
      }

      return
    }
    case 'update_addresses': {
      try {
        const unconfirmedAddresses = (await db.payments
          .where({ type: 'address' })
          .filter(({ data }) => !(data as AddressPayment['data']).txid)
          .toArray()) as AddressPayment[]

        for (const address of unconfirmedAddresses) {
          try {
            const transaction = await db.payments
              .where({ type: 'transaction' })
              .filter(
                transaction =>
                  !!(transaction.data as TransactionPayment['data']).outputs.find(
                    output => output.address === address.id
                  )
              )
              .first()

            if (transaction) {
              const updated: AddressPayment = {
                ...address,
                data: { ...address.data, txid: transaction.id }
              }
              await db.payments.put(updated)
            }
          } catch (error) {
            //
          }
        }

        self.postMessage({ id: message.data.id })
      } catch (error) {
        const { message: errMsg } = error as Error
        self.postMessage({ id: message.data.id, error: errMsg })
      }

      return
    }
    case 'update_invoices': {
      try {
        const invoicesWaitingWithFallback = (await db.payments
          .where({ type: 'invoice', status: 'waiting' })
          .filter(({ data }) => !(data as InvoicePayment['data']).fallbackAddress)
          .toArray()) as InvoicePayment[]

        for (const invoice of invoicesWaitingWithFallback) {
          try {
            const transaction = (await db.payments
              .where({ type: 'transaction' })
              .filter(
                transaction =>
                  !!(transaction.data as TransactionPayment['data']).outputs.find(
                    ({ address }) => address === invoice.data.fallbackAddress
                  )
              )
              .first()) as TransactionPayment

            if (transaction) {
              const updated: InvoicePayment = {
                ...invoice,
                status: transaction.data.blockHeight ? 'complete' : 'pending'
              }

              await db.payments.put(updated)
            }
          } catch (error) {
            //
          }
        }

        self.postMessage({ id: message.data.id })
      } catch (error) {
        const { message: errMsg } = error as Error
        self.postMessage({ id: message.data.id, error: errMsg })
      }

      return
    }
    case 'update_prisms': {
      console.log("db.worker update_prisms: " + JSON.stringify(message.data))
      try {
        //start here: hold up, is this supposed to be 1 prism or many?
        //do i need to make a new domain type matching prismListResponse?
        //do i need the dto vs domain anymore?
        // maybe to follow their pattern?

        const prisms = message.data.prisms

        console.log("prisms variable = " + JSON.stringify(prisms))
        //why is this message.data the Prism: = list instead of an array of prisms???
        console.log("prisms.length " + prisms.length)

        if (prisms.length) {
          await Promise.all(
            prisms.map(async prism => {
              console.log("iterating prism: " + JSON.stringify(prism))
              console.log("prism.id for this one is: " + prism.id)
              // CLN replaced(?) transaction has a block height of 0
              // if (transaction.data.blockHeight === 0) {
              //   await db.payments.delete(transaction.id)
              //   return
              // }

              /*message.data.channels.map(async channel => {
                // need to update channels as old channels lose data after 100 blocks of being close
                // so we don't want to overwrite data we already have as it is useful
                await db.channels
                  .where({ id: channel.id, walletId: channel.walletId })
                  .modify(channel)
                  .then(async updated => {
                    if (!updated) {
                      await db.channels.add(channel)
                    }
                  }*/

              //todo do i need to store the members
              return db.prisms.update(prism.id, prism).then(updated => {
                !updated && db.prisms.put(prism)
              })
            })
          )
        }

      } catch (error) {
        //
      }
    }
    case 'bulk_put': {
      try {
        // eslint-disable-next-line
        // @ts-ignore
        await db[message.data.table].bulkPut(message.data.data)
        self.postMessage({ id: message.data.id })
      } catch (error) {
        const { message: errMsg } = error as Error
        self.postMessage({ id: message.data.id, error: errMsg })
      }

      return
    }
    case 'update_table_items': {
      try {
        const table = message.data.table
        const { data } = message.data

        /**
         * Try to update item in db so as to not overwrite
         * any metadata that may be there. if item is new and
         * cannot be updated, then put in the db.
         */
        await Promise.all(
          data.map(val =>
            // eslint-disable-next-line
            // @ts-ignore
            db[table].update(val.id, val).then(updated => {
              if (!updated) {
                // eslint-disable-next-line
                // @ts-ignore
                return db[table].put(val)
              }
            })
          )
        )

        self.postMessage({ id: message.data.id })
      } catch (error) {
        const { message: errMsg } = error as Error
        self.postMessage({ id: message.data.id, error: errMsg })
      }

      return
    }
    case 'get_lastpay_index': {
      const { id, walletId } = message.data
      try {
        const lastPaidInvoice = await db.payments
          .orderBy('data.payIndex')
          .filter(payment => payment.walletId === walletId)
          .reverse()
          .first()

        self.postMessage({ id, result: lastPaidInvoice })
      } catch (error) {
        const { message: errMsg } = error as Error
        self.postMessage({ id, error: errMsg })
      }

      return
    }
    case 'get_all_tags': {
      const tags = await db.tags.toArray()
      self.postMessage({ id: message.data.id, result: tags })

      return
    }
    case 'get_filtered_sorted_items': {
      console.log('db.worker.ts get_filtered_sorted_items message.data = '+ JSON.stringify(message.data))

      const { limit, sort, filters, tags, lastItem, table, lastItemKey } = message.data

      let collection: Collection<Payment>

      if (lastItem) {
        const keys = sort.key.split('.')

        // eslint-disable-next-line
        // @ts-ignore
        const lastItemVal = keys.reduce((final, key) => final[key], lastItem)

        if (sort.direction === 'asc') {
          // eslint-disable-next-line
          // @ts-ignore
          collection = db[table]
            .where(sort.key)
            // eslint-disable-next-line
            // @ts-ignore
            .aboveOrEqual(lastItemVal)
            // eslint-disable-next-line
            // @ts-ignore
            .filter(fastForward(lastItem, lastItemKey || sort.key, filter(filters, tags)))
        } else {
          // eslint-disable-next-line
          // @ts-ignore
          collection = db[table]
            .where(sort.key)
            // eslint-disable-next-line
            // @ts-ignore
            .belowOrEqual(lastItemVal)
            // eslint-disable-next-line
            // @ts-ignore
            .filter(fastForward(lastItem, lastItemKey || sort.key, filter(filters, tags)))
        }
      } else {
        // eslint-disable-next-line
        // @ts-ignore
        collection = db[table].orderBy(sort.key).filter(filter(filters, tags))
      }

      if (sort.direction === 'desc') {
        collection.reverse()
      }

      const items = await collection.limit(limit).toArray()

      self.postMessage({ id: message.data.id, result: items.length === 1 && lastItem ? [] : items })
      return
    }
  }
}

// A helper function we will use below.
// It will prevent the same results to be returned again for next page.
const fastForward = <T>(lastRow: T, idProp: keyof T, otherCriterion: (item: T) => boolean) => {
  let fastForwardComplete = false
  return (item: T) => {
    if (fastForwardComplete) return otherCriterion(item)

    if (typeof idProp === 'string') {
      const keys = idProp.split('.')

      // eslint-disable-next-line
      // @ts-ignore
      const itemVal = keys.reduce((endVal, val) => endVal[val], item)

      // eslint-disable-next-line
      // @ts-ignore
      const lastRowVal = keys.reduce((endVal, val) => endVal[val], lastRow)

      if (itemVal === lastRowVal) {
        fastForwardComplete = true
      }
    } else {
      if (item[idProp] === lastRow[idProp]) {
        fastForwardComplete = true
      }
    }

    return false
  }
}

const filter = (filters: Filter[], tags: TagFilters) => (item: unknown) => {
  if (tags.length) {
    // eslint-disable-next-line
    // @ts-ignore
    if (!item.metadata || !item.metadata.tags.length) return false
    // eslint-disable-next-line
    // @ts-ignore
    const validTag = item.metadata.tags.some(tag => tags.includes(tag))
    if (!validTag) return false
  }

  return filters.every(filter => {
    const { type, key } = filter
    const keys = key.split('.')

    // eslint-disable-next-line
    // @ts-ignore
    let valueToTest: ValueOf<typeof item> = item[keys[0]]

    if (keys.length > 1) {
      // eslint-disable-next-line
      // @ts-ignore
      valueToTest = keys.slice(1).reduce((acc, key) => {
        // eslint-disable-next-line
        // @ts-ignore
        const res = acc ? acc[key] : acc
        return res
      }, valueToTest)
    }

    if (type === 'exists' && filter.applied && !valueToTest) return false

    if (type === 'one-of') {
      const applied = filter.values.filter(({ applied }) => applied)

      if (applied.length && !applied.some(({ value }) => value === valueToTest)) {
        return false
      }
    }

    if (type === 'amount-range') {
      const {
        values: { gt, lt }
      } = filter

      if (gt && (valueToTest as number) <= gt) return false
      if (lt && (valueToTest as number) >= lt) return false
    }

    if (type === 'date-range') {
      const {
        values: { gt, lt }
      } = filter

      if (gt && (valueToTest as number) <= new Date(gt).getTime() / 1000) return false
      if (lt && (valueToTest as number) >= new Date(lt).getTime() / 1000) return false
    }

    return true
  })
}

export {}
