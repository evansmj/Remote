import type { BehaviorSubject, Observable, Subject } from 'rxjs'

import type {
  CommandoRequest,
  JsonRpcErrorResponse,
  JsonRpcRequest,
  JsonRpcSuccessResponse,
  LnWebSocketOptions
} from 'lnmessage/dist/types'

import type {
  BlocksInterface,
  ChannelsInterface,
  Connection,
  Info,
  OffersInterface,
  InvoicesInterface,
  RpcCall,
  TransactionsInterface,
  UtxosInterface,
  ForwardsInterface,
  SignaturesInterface,
  NetworkInterface,
  PrismsInterface
} from '../interfaces.js'
import type { Wallet } from '$lib/@types/wallets.js'

export type CommandoMsgs = Observable<
  (JsonRpcSuccessResponse | JsonRpcErrorResponse) & {
    reqId: string
  }
>

export type SocketWrapper = {
  id: string
  connect: () => Promise<boolean>
  disconnect: () => void
  commando: (request: CommandoRequest) => Promise<unknown>
}

export interface CorelnConnectionInterface extends Connection {
  socket: SocketWrapper | null
  lnmessageOptions: LnWebSocketOptions
  walletId: Wallet['id']
  info: Info
  rune: string
  destroy$: Subject<void>
  updateToken: (token: string) => void
  connect: () => Promise<Info | null>
  disconnect: () => void
  connectionStatus$: BehaviorSubject<
    'connected' | 'connecting' | 'waiting_reconnect' | 'disconnected'
  >
  rpc: RpcCall
  signatures: SignaturesInterface
  offers: OffersInterface
  invoices: InvoicesInterface
  utxos: UtxosInterface
  channels: ChannelsInterface
  transactions: TransactionsInterface
  blocks: BlocksInterface
  forwards: ForwardsInterface
  network: NetworkInterface
  prisms: PrismsInterface
}

export interface GetinfoResponse {
  /**
   * The addresses we announce to the world
   */
  address: Address[]
  /**
   * The fun alias this node will advertize
   */
  alias: string
  /**
   * The addresses we are listening on
   */
  binding?: Binding[]
  /**
   * The highest block height we've learned
   */
  blockheight: number
  /**
   * The favorite RGB color this node will advertize
   */
  color: string
  /**
   * Total routing fees collected by this node
   */
  fees_collected_msat: number
  /**
   * The public key unique to this node
   */
  id: string
  /**
   * Identifies where you can find the configuration and other related files
   */
  'lightning-dir': string
  /**
   * represents the type of network on the node are working (e.g: `bitcoin`, `testnet`, or
   * `regtest`)
   */
  network: 'bitcoin' | 'regtest' | 'testnet'
  /**
   * The total count of channels in normal state
   */
  num_active_channels: number
  /**
   * The total count of channels waiting for opening or closing transactions to be mined
   */
  num_inactive_channels: number
  /**
   * The total count of peers, connected or with channels
   */
  num_peers: number
  /**
   * The total count of channels being opened
   */
  num_pending_channels: number
  /**
   * Identifies what bugs you are running into
   */
  version: string
  /**
   * Bitcoind is not up-to-date with network.
   */
  warning_bitcoind_sync?: string
  /**
   * Lightningd is still loading latest blocks from bitcoind.
   */
  warning_lightningd_sync?: string
}

export enum GenesisBlockhash {
  regtest = '0f9188f13cb7b2c71f2a335e3a4fc328bf5beb436012afca590b1a11466e2206',
  mainnet = '000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f',
  testnet = '000000000933ea01ad0ee984209779baaec3ced90fa3f408719526f8d77f4943'
}

export type Address = {
  /**
   * port number
   */
  port: number
  /**
   * Type of connection
   */
  type: AddressType
  address: string
}

/**
 * Type of connection
 */
export enum AddressType {
  DNS = 'dns',
  Ipv4 = 'ipv4',
  Ipv6 = 'ipv6',
  Torv2 = 'torv2',
  Torv3 = 'torv3',
  Websocket = 'websocket'
}

export type Binding = {
  /**
   * address in expected format for **type**
   */
  address?: string
  /**
   * port number
   */
  port?: number
  /**
   * socket filename (only if **type** is "local socket")
   */
  socket?: string
  /**
   * Type of connection
   */
  type: BindingType
}

/**
 * Type of connection
 */
export enum BindingType {
  Ipv4 = 'ipv4',
  Ipv6 = 'ipv6',
  LocalSocket = 'local socket',
  Torv2 = 'torv2',
  Torv3 = 'torv3'
}

export type InvoiceResponse = {
  /**
   * the bolt11 string
   */
  bolt11: string
  /**
   * UNIX timestamp of when invoice expires
   */
  expires_at: number
  /**
   * the hash of the *payment_preimage* which will prove payment
   */
  payment_hash: string
  /**
   * the *payment_secret* to place in the onion
   */
  payment_secret: string
  /**
   * even using all possible channels, there's not enough incoming capacity to pay this
   * invoice.
   */
  warning_capacity?: string
  /**
   * there would be enough incoming capacity, but some channels are dead-ends (no other public
   * channels from those peers), so there isn't.
   */
  warning_deadends?: string
  /**
   * there is sufficient capacity, but not in a single channel, so the payer will have to use
   * multi-part payments.
   */
  warning_mpp?: string
  /**
   * there would be enough incoming capacity, but some channels are offline, so there isn't.
   */
  warning_offline?: string
  /**
   * there would be enough incoming capacity, but some channels are unannounced and
   * *exposeprivatechannels* is *false*, so there isn't.
   */
  warning_private_unused?: string
}

export type PayResponse = {
  /**
   * Amount the recipient received
   */
  amount_msat: string | number
  /**
   * Total amount we sent (including fees)
   */
  amount_sent_msat: string | number
  /**
   * the UNIX timestamp showing when this payment was initiated
   */
  created_at: number
  /**
   * the final destination of the payment
   */
  destination: string
  /**
   * how many attempts this took
   */
  parts: number
  /**
   * the hash of the *payment_preimage* which will prove payment
   */
  payment_hash: string
  /**
   * the proof of payment: SHA256 of this **payment_hash**
   */
  payment_preimage: string
  /**
   * status of payment
   */
  status: PaymentStatus
  /**
   * Not all parts of a multi-part payment have completed
   */
  warning_partial_completion?: string
}

/**
 * status of payment
 */
export enum PaymentStatus {
  Complete = 'complete',
  Failed = 'failed',
  Pending = 'pending'
}

export type ListpaysResponse = {
  pays: Pay[]
}

export type Pay = {
  /**
   * the bolt11 string (if pay supplied one)
   */
  bolt11?: string
  /**
   * the bolt12 string (if supplied for pay: **experimental-offers** only).
   */
  bolt12?: string
  /**
   * the UNIX timestamp showing when this payment was initiated
   */
  created_at: number
  /**
   * the description matching the bolt11 description hash (if pay supplied one)
   */
  description?: string
  /**
   * the final destination of the payment if known
   */
  destination?: string
  preimage: string
  amount_msat: string | number
  amount_sent_msat: string | number
  /**
   * the label, if given to sendpay
   */
  label?: string
  /**
   * the hash of the *payment_preimage* which will prove payment
   */
  payment_hash: string
  /**
   * status of the payment
   */
  status: PaymentStatus
}

export type KeysendResponse = {
  /**
   * Amount the recipient received
   */
  amount_msat: string
  /**
   * Total amount we sent (including fees)
   */
  amount_sent_msat: string
  /**
   * the UNIX timestamp showing when this payment was initiated
   */
  created_at: number
  /**
   * the final destination of the payment
   */
  destination?: string
  /**
   * how many attempts this took
   */
  parts: number
  /**
   * the hash of the *payment_preimage* which will prove payment
   */
  payment_hash: string
  /**
   * the proof of payment: SHA256 of this **payment_hash**
   */
  payment_preimage: string
  /**
   * status of payment
   */
  status: PaymentStatus
  /**
   * Not all parts of a multi-part payment have completed
   */
  warning_partial_completion?: string
}

export type ListfundsResponse = {
  channels: Channel[]
  outputs: Output[]
}

export type Channel = {
  /**
   * total channel value
   */
  amount_msat: string | number
  /**
   * whether the channel peer is connected
   */
  connected: boolean
  /**
   * the 0-based index of the output in the funding transaction
   */
  funding_output: number
  /**
   * funding transaction id
   */
  funding_txid: string
  /**
   * available satoshis on our node’s end of the channel
   */
  our_amount_msat: string | number
  /**
   * the peer with which the channel is opened
   */
  peer_id: string
  /**
   * the channel state, in particular "CHANNELD_NORMAL" means the channel can be used normally
   */
  state: State
}

/**
 * the channel state, in particular "CHANNELD_NORMAL" means the channel can be used normally
 */
export enum State {
  AwaitingUnilateral = 'AWAITING_UNILATERAL',
  ChanneldAwaitingLockin = 'CHANNELD_AWAITING_LOCKIN',
  ChanneldNormal = 'CHANNELD_NORMAL',
  ChanneldShuttingDown = 'CHANNELD_SHUTTING_DOWN',
  ClosingdComplete = 'CLOSINGD_COMPLETE',
  ClosingdSigexchange = 'CLOSINGD_SIGEXCHANGE',
  DualopendAwaitingLockin = 'DUALOPEND_AWAITING_LOCKIN',
  DualopendOpenInit = 'DUALOPEND_OPEN_INIT',
  FundingSpendSeen = 'FUNDING_SPEND_SEEN',
  Onchain = 'ONCHAIN',
  Openingd = 'OPENINGD'
}

export type Output = {
  /**
   * the bitcoin address of the output
   */
  address: string
  /**
   * the amount of the output
   */
  amount_msat: string
  /**
   * the index within *txid*
   */
  output: number
  /**
   * the redeemscript, only if it's p2sh-wrapped
   */
  redeemscript?: string
  /**
   * the scriptPubkey of the output
   */
  scriptpubkey: string
  status: OutputStatus
  /**
   * the ID of the spendable transaction
   */
  txid: string
  reserved: boolean
  reserved_to_block?: number
  blockheight?: number
}

export enum OutputStatus {
  Confirmed = 'confirmed',
  Spent = 'spent',
  Unconfirmed = 'unconfirmed'
}

export type ListinvoicesResponse = {
  invoices: RawInvoice[]
}

export type RawInvoice = {
  /**
   * the amount required to pay this invoice
   */
  amount_msat?: number | string
  /**
   * the BOLT11 string (always present unless *bolt12* is)
   */
  bolt11?: string
  /**
   * the BOLT12 string (always present unless *bolt11* is)
   */
  bolt12?: string
  /**
   * description used in the invoice
   */
  description: string
  /**
   * UNIX timestamp of when it will become / became unpayable
   */
  expires_at: number
  /**
   * unique label supplied at invoice creation
   */
  label: string
  /**
   * the *id* of our offer which created this invoice (**experimental-offers** only).
   */
  local_offer_id?: string
  /**
   * the optional *payer_note* from invoice_request which created this invoice
   * (**experimental-offers** only).
   */
  payer_note?: string
  /**
   * the hash of the *payment_preimage* which will prove payment
   */
  payment_hash: string
  /**
   * Whether it's paid, unpaid or unpayable
   */
  status: InvoiceStatus
  amount_received_msat?: string | number
  pay_index?: number
  paid_at?: number
  payment_preimage?: string
}

/**
 * Whether it's paid, unpaid or unpayable
 */
export enum InvoiceStatus {
  Expired = 'expired',
  Paid = 'paid',
  Unpaid = 'unpaid'
}

export type ErrorResponse = {
  code: number
  message: string
}

export type WaitInvoiceResponse = RawInvoice
export type WaitAnyInvoiceResponse = RawInvoice

export type SignMessageResponse = {
  /** (hex): The signature (always 128 characters) */
  signature: string
  /** (hex): The recovery id (0, 1, 2 or 3) (always 2 characters) */
  recid: string
  /** signature and recid encoded in a style compatible with lnd’s SignMessageRequest */
  zbase: string
}

export type IncomeEvent = {
  account: string
  tag:
    | 'deposit'
    | 'withdrawal'
    | 'onchain_fee'
    | 'invoice'
    | 'invoice_fee'
    | 'routed'
    | 'delayed_to_us'
    | string
  credit_msat: number | string
  debit_msat: number | string
  currency: string
  timestamp: number
  description?: string
  outpoint?: string
  txid?: string
  payment_id?: string
  fee_amount?: string
}

export type BkprListIncomeResponse = {
  income_events: IncomeEvent[]
}

export type BkprListBalancesResponse = {
  accounts: {
    account: 'wallet' | string
    peer_id?: string
    we_opened?: boolean
    account_closed?: boolean
    account_resolved?: boolean
    resolved_at_block?: number
    balances: [
      {
        balance_msat: number
        coin_type: string
      }
    ]
  }[]
}

export type ChannelAPY = {
  account: 'net' | string
  routed_out_msat: number | string
  routed_in_msat: number | string
  lease_fee_paid_msat: number | string
  lease_fee_earned_msat: number | string
  pushed_out_msat: number | string
  pushed_in_msat: number | string
  our_start_balance_msat: number | string
  channel_start_balance_msat: number | string
  fees_out_msat: number | string
  fees_in_msat: number | string
  utilization_out: string
  utilization_out_initial?: string
  utilization_in: string
  utilization_in_initial?: string
  apy_out: string
  apy_out_initial: string
  apy_in: string
  apy_in_initial: string
  apy_total: string
  apy_total_initial: string
  apy_lease?: string
}

export type BkprChannelsAPYResponse = {
  channels_apy: ChannelAPY[]
}

export type FetchInvoiceResponse = {
  /**The BOLT12 invoice we fetched */
  invoice: string
  changes: {
    /**extra characters appended to the description field. */
    description_appended?: string
    /**a completely replaced description field */
    description?: string
    /**The vendor from the offer, which is missing in the invoice */
    vendor_removed?: string
    /**a completely replaced vendor field */
    vendor?: string
    /**the amount, if different from the offer amount multiplied by any quantity (or the offer had no amount, or was not in BTC). */
    amount_msat?: string
  }
  /**Only for recurring invoices if the next period is under the recurrence_limit: */
  next_period?: {
    /**the index of the next period to fetchinvoice */
    counter: number
    /**UNIX timestamp that the next period starts */
    starttime: number
    /**UNIX timestamp that the next period ends */
    endtime: number
    /**UNIX timestamp of the earliest time that the next invoice can be fetched */
    paywindow_start: number
    /**UNIX timestamp of the latest time that the next invoice can be fetched */
    paywindow_end: number
  }
}

export type SendInvoiceResponse = {
  label: string
  description: string
  payment_hash: string
  status: string
  expires_at: number
  amount_msat?: string
  bolt12?: string
  pay_index?: number
  amount_received_msat?: string
  paid_at?: number
  payment_preimage?: string
}

export type OfferSummaryCommon = {
  /**whether this can still be used */
  active: boolean
  /**whether this expires as soon as it’s paid */
  single_use: boolean
  /**the bolt12 encoding of the offer */
  bolt12: string
  /**True if an associated invoice has been paid */
  used: boolean
  /**the (optional) user-specified label */
  label?: string
}

export type OfferSummary = OfferSummaryCommon & {
  /**the id of this offer (merkle hash of non-signature fields) */
  offer_id: string
}

export type InvoiceRequestSummary = OfferSummaryCommon & {
  /**the id of this offer (merkle hash of non-signature fields) */
  invreq_id: string
}

export type ListOffersResponse = {
  offers: OfferSummary[]
}

export type ListInvoiceRequestsResponse = {
  invoicerequests: InvoiceRequestSummary[]
}

export type CreatePayOfferResponse = OfferSummary & { created: boolean }
export type CreateWithdrawOfferResponse = InvoiceRequestSummary

type PeerChannel = {
  state: State
  opener: 'local' | 'remote'
  features: Array<'option_static_remotekey' | 'option_anchor_outputs' | 'option_zeroconf'>
  scratch_txid?: string
  feerate?: {
    perkw: number
    perkb: number
  }
  fee_base_msat: number
  owner?: string
  short_channel_id?: string
  channel_id: string
  funding_txid: string
  funding_outnum: number
  initial_feerate?: string
  last_feerate?: string
  next_feerate?: string
  next_fee_step?: number
  inflight?: Array<{
    funding_txid: string
    funding_outnum: number
    feerate: string
    total_funding_msat: string
    our_funding_msat: string
    scratch_txid: string
    close_to?: string
  }>
  private?: boolean
  closer?: 'local' | 'remote'
  our_reserve_msat: string
  their_reserve_msat: string
  funding?: {
    local_funds_msat: string
    remote_funds_msat: string
    pushed_msat?: string
    fee_paid_msat?: string
    fee_rcvd_msat?: string
    to_us_msat?: string
    min_to_us_msat?: string
    max_to_us_msat?: string
    total_msat?: string
    fee_base_msat?: string
    fee_proportional_millionths?: number
    dust_limit_msat?: string
    max_total_htlc_in_msat?: string
    their_reserve_msat?: string
    our_reserve_msat?: string
  }
  state_changes?: {
    timestamp: string
    old_state: State
    new_state: State
    cause: Cause
    message: string
  }[]
  close_to?: string
  close_to_addr?: string
  to_us_msat: string
  total_msat: string
  spendable_msat: string
  receivable_msat: string
  fee_proportional_millionths: number
  in_payments_offered: number // of incoming payment attempts
  in_offered_msat: string //  (msat, optional): Total amount of incoming payment attempts
  in_payments_fulfilled: number //  (u64, optional): Number of successful incoming payment attempts
  in_fulfilled_msat: string //(msat, optional): Total amount of successful incoming payment attempts
  out_payments_offered: number //  (u64, optional): Number of outgoing payment attempts
  out_offered_msat: string //  (msat, optional): Total amount of outgoing payment attempts
  out_payments_fulfilled: number //  (u64, optional): Number of successful outgoing payment attempts
  out_fulfilled_msat: string // (msat, optional): Total amount of successful outgoing payment attempts
  htlcs: HTLC[]
  minimum_htlc_out_msat?: number
  maximum_htlc_out_msat?: number
  their_to_self_delay?: number
  our_to_self_delay?: number
}

export type ClosedChannel = {
  channel_id: string
  opener: string
  private: boolean
  total_local_commitments: number
  total_remote_commitments: number
  total_htlcs_sent: number
  funding_txid: string
  funding_outnum: number
  leased: boolean
  total_msat: string
  final_to_us_msat: string
  min_to_us_msat: string
  max_to_us_msat: string
  close_cause: string
  peer_id?: string
  short_channel_id?: string
  closer?: string
  funding_fee_paid_msat?: string
  funding_fee_rcvd_msat?: string
  funding_pushed_msat?: string
  last_commitment_txid?: string
  last_commitment_fee_msat?: string
}

type HTLC = {
  direction: 'in' | 'out'
  id: number
  amount_msat: string
  expiry: number
  payment_hash: string
  local_trimmed?: boolean
  state: HTLCState
}

type HTLCState =
  | 'SENT_ADD_HTLC'
  | 'SENT_ADD_COMMIT'
  | 'RCVD_ADD_REVOCATION'
  | 'RCVD_ADD_ACK_COMMIT'
  | 'SENT_ADD_ACK_REVOCATION'
  | 'RCVD_REMOVE_HTLC'
  | 'RCVD_REMOVE_COMMIT'
  | 'SENT_REMOVE_REVOCATION'
  | 'SENT_REMOVE_ACK_COMMIT'
  | 'RCVD_REMOVE_ACK_REVOCATION'
  | 'RCVD_ADD_HTLC'
  | 'RCVD_ADD_COMMIT'
  | 'SENT_ADD_REVOCATION'
  | 'SENT_ADD_ACK_COMMIT'
  | 'RCVD_ADD_ACK_REVOCATION'
  | 'SENT_REMOVE_HTLC'
  | 'SENT_REMOVE_COMMIT'
  | 'RCVD_REMOVE_REVOCATION'
  | 'RCVD_REMOVE_ACK_COMMIT'
  | 'SENT_REMOVE_ACK_REVOCATION'

type PeerLog =
  | {
      type: 'SKIPPED'
      num_skipped: number
    }
  | {
      type: 'BROKEN' | 'UNUSUAL' | 'INFO' | 'DEBUG' | 'IO_IN' | 'IO_OUT'
      time: string
      source: string
      log: string
      node_id: string
      data?: string
    }

type Peer = {
  id: string // The unique id of the peer
  connected: boolean // A boolean value showing the connection status
  netaddr?: string[] // A list of network addresses the node is listening on
  features?: string // Bit flags showing supported features (BOLT #9)
  log?: Array<PeerLog> // Only present if level is set. List logs related to the peer at the specified level
  num_channels?: number // added v23.02
  channels: Array<PeerChannel> // An array of objects describing channels with the peer.
}

export type ListPeersResponse = {
  peers: Peer[]
}

type ListPeerChannel = {
  peer_id: string
  peer_connected: boolean
  state: State
  opener: 'local' | 'remote'
  features: Array<'option_static_remotekey' | 'option_anchor_outputs' | 'option_zeroconf'>
  scratch_txid?: string
  channel_type?: {
    bits: number[]
    names: string[]
  }
  feerate?: {
    perkw: number
    perkb: number
  }
  owner?: string
  short_channel_id?: string
  channel_id: string
  funding_txid: string
  funding_outnum: number
  initial_feerate?: string
  last_feerate?: string
  next_feerate?: string
  next_fee_step?: number
  inflight?: Array<{
    funding_txid: string
    funding_outnum: number
    feerate: string
    total_funding_msat: string
    our_funding_msat: string
    scratch_txid: string
    close_to?: string
  }>
  private?: boolean
  closer?: 'local' | 'remote'
  funding?: {
    local_funds_msat: string
    remote_funds_msat: string
    pushed_msat?: string
    fee_paid_msat?: string
    fee_rcvd_msat?: string
    to_us_msat?: string
    min_to_us_msat?: string
    max_to_us_msat?: string
    total_msat?: string
    fee_base_msat?: string
    fee_proportional_millionths?: number
    dust_limit_msat?: string
    max_total_htlc_in_msat?: string
    their_reserve_msat?: string
    our_reserve_msat?: string
  }
  close_to?: string
  close_to_addr?: string
  to_us_msat: string
  min_to_us_msat?: string
  max_to_us_msat?: string
  fee_base_msat?: string
  total_msat: string
  spendable_msat: string
  receivable_msat: string
  dust_limit_msat?: string
  max_total_htlc_in_msat?: string
  their_reserve_msat?: string
  minimum_htlc_in_msat?: string
  minimum_htlc_out_msat?: number
  maximum_htlc_out_msat?: number
  their_to_self_delay?: number
  our_to_self_delay?: number
  our_reserve_msat?: string
  max_accepted_htlcs?: number
  state_changes?: {
    timestamp: string
    old_state: State
    new_state: State
    cause: Cause
    message: string
  }[]
  status: string[]
  fee_proportional_millionths: number
  in_payments_offered: number // of incoming payment attempts
  in_offered_msat: string //  (msat, optional): Total amount of incoming payment attempts
  in_payments_fulfilled: number //  (u64, optional): Number of successful incoming payment attempts
  in_fulfilled_msat: string //(msat, optional): Total amount of successful incoming payment attempts
  out_payments_offered: number //  (u64, optional): Number of outgoing payment attempts
  out_offered_msat: string //  (msat, optional): Total amount of outgoing payment attempts
  out_payments_fulfilled: number //  (u64, optional): Number of successful outgoing payment attempts
  out_fulfilled_msat: string // (msat, optional): Total amount of successful outgoing payment attempts
  htlcs: HTLC[]
}

type Cause = 'unknown' | 'local' | 'user' | 'remote' | 'protocol' | 'onchain'

export type ListPeerChannelsResponse = {
  channels: ListPeerChannel[]
}

type InputOutputType =
  | 'theirs'
  | 'deposit'
  | 'withdraw'
  | 'channel_funding'
  | 'channel_mutual_close'
  | 'channel_unilateral_close'
  | 'channel_sweep'
  | 'channel_htlc_success'
  | 'channel_htlc_timeout'
  | 'channel_penalty'
  | 'channel_unilateral_cheat'

type Transaction = {
  hash: string
  rawtx: string
  blockheight: number
  txindex: number
  locktime: number
  version: number
  inputs: {
    txid: string
    index: number
    sequence: number
    type?: InputOutputType
    channel?: string
  }[]
  outputs: {
    index: number
    amount_msat: string
    scriptPubKey: string
    type?: InputOutputType
    channel?: string
  }[]
}

export type ListTransactionsResponse = {
  transactions: Transaction[]
}

export type NewAddrResponse = {
  bech32: string
}

export type WithdrawResponse = {
  /** the fully signed bitcoin transaction */
  tx: string
  /** the transaction id of tx */
  txid: string
  /** the PSBT representing the unsigned transaction */
  psbt: string
}

type Forward = {
  in_channel: string
  in_htlc_id: number
  out_channel: string
  out_htlc_id: number
  in_msat: number
  out_msat: number
  fee_msat: number
  status: 'settled' | 'offered' | 'failed' | 'local_failed'
  style: 'tlv' | 'legacy'
  received_time: number
  resolved_time: number
}

export type ListForwardsResponse = {
  forwards: Forward[]
}

export type FundChannelResponse = {
  tx: string
  txid: string
  outnum: number
  channel_id: string
  close_to: string
  mindepth?: number
}

export type ChainEvent = {
  account: 'wallet'
  type: 'chain'
  tag: 'deposit' | 'withdrawal'
  credit_msat: string
  debit_msat: string
  timestamp: number
  outpoint: string
  blockheight: number
  txid?: string
}

export type ChannelOpenEvent = {
  account: string
  type: 'chain'
  tag: 'channel_open'
  timestamp: number
  outpoint: string
  credit_msat: string
  debit_msat: string
  blockheight: number
}

export type ChannelCloseEvent = {
  account: string
  type: 'chain'
  tag: 'channel_close'
  timestamp: number
  outpoint: string
  txid: string
  credit_msat: string
  debit_msat: string
  blockheight: number
}

export type HTLCEvent = {
  account: string
  blockheight: number
  credit_msat: string
  currency: string
  debit_msat: string
  outpoint: string
  tag: 'htlc_tx' | 'htlc_timeout'
  timestamp: number
  type: 'chain'
}

export type ToThemEvent = {
  account: string
  origin: string
  type: 'chain'
  tag: 'to_them'
  timestamp: number
  outpoint: string
  txid: string
  credit_msat: string
  debit_msat: string
  blockheight: number
}

export type ToWalletEvent = {
  account: string
  type: 'chain'
  tag: 'to_wallet'
  timestamp: number
  outpoint: string
  txid: string
  credit_msat: string
  debit_msat: string
  blockheight: number
}

export type ChannelPushEvent = {
  account: string
  type: 'channel'
  tag: 'pushed'
  timestamp: number
  credit_msat: string
  debit_msat: string
}

export type OnchainFeeEvent = {
  account: 'wallet'
  type: 'onchain_fee'
  tag: 'onchain_fee'
  txid: string
  timestamp: number
  outpoint: string
  credit_msat: string
  debit_msat: string
}

export type ChannelInvoiceEvent = {
  account: string
  type: 'channel'
  tag: 'invoice'
  description: string
  payment_id: string
  part_id: 0
  timestamp: number
  credit_msat: string
  debit_msat: string
}

export type DelayedToUsEvent = {
  account: string
  blockheight: number
  credit_msat: string
  currency: string
  debit_msat: string
  outpoint: string
  tag: 'delayed_to_us'
  timestamp: number
  type: 'chain'
}

export type ListAccountEventsResponse = {
  events: (
    | ChainEvent
    | ChannelOpenEvent
    | ChannelCloseEvent
    | ChannelPushEvent
    | OnchainFeeEvent
    | ChannelInvoiceEvent
    | ToThemEvent
    | ToWalletEvent
    | DelayedToUsEvent
    | HTLCEvent
  )[]
}

export type NodeBaseResponse = { nodeid: string }

export type NodeFullResponse = NodeBaseResponse & {
  last_timestamp: number
  alias: string
  color: string
  features: string
  addresses: [
    {
      type: string
      address: string
      port: number
    }
  ]
}

export type ListNodesResponse = {
  nodes: (NodeBaseResponse | NodeFullResponse)[]
}

export type PrismListResponse = {
  prisms: PrismResponse[]
}

export type PrismResponse = {
  prism_id: string,
  prism_members: PrismMemberResponse[],
  timestamp: number
}

export type PrismMemberResponse = {
  "member_id": string,
  "label": string,
  "destination": string,
  "split": number,
  "fees_incurred_by": string,
  "payout_threshold": string
}

export type LNResponse =
  | InvoiceResponse
  | ListinvoicesResponse
  | ListfundsResponse
  | ListpaysResponse
  | PayResponse
  | GetinfoResponse
  | KeysendResponse
  | WaitInvoiceResponse
  | WaitAnyInvoiceResponse
  | SignMessageResponse
  | BkprListIncomeResponse
  | FetchInvoiceResponse
  | SendInvoiceResponse
  | ListOffersResponse
  | ListInvoiceRequestsResponse
  | CreatePayOfferResponse
  | CreateWithdrawOfferResponse
  | ListNodesResponse
  | ListPeersResponse
  | ListPeerChannelsResponse
  | ListTransactionsResponse
  | NewAddrResponse
  | WithdrawResponse
  | ListForwardsResponse
  | FundChannelResponse
  | ListNodesResponse
  | PrismListResponse

export type RpcRequest = (req: JsonRpcRequest & { rune: string }) => Promise<unknown>

export type CoreLnError = { code: number; message: string }
