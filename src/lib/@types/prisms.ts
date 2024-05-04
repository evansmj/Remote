export type Prism = {
  id: string,
  prism_members: Member[]
  timestamp: number
}

export type Member = {
  member_id: string,
  label: string,
  destination: string,
  split: number,
  fees_incurred_by: string,
  payout_threshold: string
}

