export type PrismBinding = {
  id: string,
  offer_id: string,
  prism_id: string,
  timestamp: number,
  member_outlays: MemberOutlay[]
}

export type MemberOutlay = {
  member_id: string,
  outlay_msat: number
}
