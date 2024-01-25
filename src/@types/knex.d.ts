import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      email: string
      session_id?: string
      name: string
      created_at: string
    }
  }
}
