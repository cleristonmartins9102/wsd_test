import { Client } from 'pg'
import { type Football } from '../../../../src/models/football-model'

export class FootballPostgresRepository {
  async save (footballOdds: Football): Promise<any> {
    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'odds',
      password: 'mysecretpassword',
      port: 5432
    })
    try {
      await client.connect()
      const matchText = 'INSERT INTO matches(name, draw, over, under) VALUES($1, $2, $3, $4) RETURNING id'
      const matchValues = [`${footballOdds.participant1.name} X ${footballOdds.participant2.name}`, footballOdds.draw, footballOdds.over ?? null, footballOdds.under ?? null]
      const queryResponse = await client.query(matchText, matchValues)
      const matcheId = queryResponse.rows[0].id
      const participantOneText = 'INSERT INTO football(matche_id, team_name, win) VALUES($1, $2, $3) RETURNING *'
      const participantOneValues = [matcheId, footballOdds.participant2.name, footballOdds.participant2.win]
      await client.query(participantOneText, participantOneValues)
      return matcheId
    } catch (error) {
      console.log(error)
    }
  }
}
