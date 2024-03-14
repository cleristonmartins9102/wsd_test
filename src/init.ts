import { SportingbetScraptController } from './controller/sportvet-scrapt-controller'
import { PuppetterAdapter } from './infra/adapter/puppetter-adapter'
import { FootballPostgresRepository } from './infra/repository/db/football-repository'

const puppetter = new PuppetterAdapter()
const oddsRepository = new FootballPostgresRepository()
const controller = new SportingbetScraptController(puppetter, oddsRepository)
controller.scrap('https://sports.sportingbet.com/en/sports/football-4', { browserSize: { width: 1680, height: 1240 } }, data => { console.log(data) }).catch(error => { console.log(error) })
