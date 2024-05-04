export type Settings = {
  language: Language
  fiatDenomination: FiatDenomination
  notifications: boolean
  tiles: Record<Tile, boolean>
  lavaLamp: boolean
}

export type Tile =
  | 'wallets'
  | 'payments'
  | 'utxos'
  | 'channels'
  | 'offers'
  | 'forwards'
  // | 'accounting'
  // | 'charts'
  // | 'trades'
  | 'prisms'
  | 'settings'

export type Language =
  | 'en'
  | 'en-AU'
  | 'en-US'
  | 'en-GB'
  | 'zh-CN'
  | 'es'
  | 'hi'
  | 'ar'
  | 'bn'
  | 'fr'
  | 'pt'
  | 'ru'
  | 'ja'
  | 'id'
  | 'de'
  | 'te'
  | 'tr'
  | 'ta'
  | 'ko'

export enum BitcoinDenomination {
  btc = 'btc',
  sats = 'sats',
  msats = 'msats'
}

// https://www.statista.com/statistics/1189498/share-of-global-payments-by-currency/
export enum FiatDenomination {
  'none' = 'none',
  'usd' = 'usd',
  'eur' = 'eur',
  'gbp' = 'gbp',
  'cny' = 'cny',
  'jpy' = 'jpy',
  'cad' = 'cad',
  'aud' = 'aud',
  'hkd' = 'hkd',
  'sgd' = 'sgd',
  'sek' = 'sek',
  'chf' = 'chf',
  'thb' = 'thb',
  'pln' = 'pln',
  'nok' = 'nok',
  'myr' = 'myr',
  'dkk' = 'dkk',
  'zar' = 'zar',
  'nzd' = 'nzd',
  'mxn' = 'mxn',
  'rub' = 'rub'
}

export type Denomination = BitcoinDenomination | FiatDenomination

export type BitcoinExchangeRates = Record<FiatDenomination, number>
