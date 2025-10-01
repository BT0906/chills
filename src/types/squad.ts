export type SquadVisibility = "open" | "closed" | "private"
export type MemberStatus = "active" | "pending" | "inactive"

export interface Squad {
  id: number
  name: string
  description: string
  course: string
  creator_id: string
  visibility: SquadVisibility
  is_deleted: boolean
  created_at?: string
}

export interface Member {
  id: number
  squad_id: number
  user_id: string
  status: MemberStatus
  joined_at?: string
}

export interface CreateSquadInput {
  name: string
  description: string
  course: string
  creator_id: string
  user_ids: string[]
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}
