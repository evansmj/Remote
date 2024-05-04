export type Prism = {
  id: string,
  prism_members: Member[],
  timestamp: number,
  outlay_factor: number
}

export type Member = {
  member_id: string,
  label: string,
  destination: string,
  split: number,
  fees_incurred_by: string,
  payout_threshold_msat: number
}

