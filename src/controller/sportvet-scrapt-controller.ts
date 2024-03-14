import { type FootballPostgresRepository } from '../../src/infra/repository/db/football-repository'
import { type PuppetterAdapter } from '../../src/infra/adapter/puppetter-adapter'
import { type Football } from 'src/models/football-model'

export class SportingbetScraptController {
  constructor (
    private readonly puppetterAdapter: PuppetterAdapter,
    private readonly footBallRepository: FootballPostgresRepository
  ) {}

  async scrap (url: string, opions: PuppetterAdapter.Options, callback?: (data: any) => void): Promise<void> {
    const browser = await this.puppetterAdapter.openBrowser()
    if (browser === null) return
    await this.puppetterAdapter.openPage(url, browser, opions)
    await this.puppetterAdapter.waitFor('.sport-lobby')
    const spot = await this.puppetterAdapter.querySelector('.sport-lobby')
    if (spot === null) return
    if (typeof spot !== 'undefined') {
      const scraptedAllEvents: any[] = []
      await this.puppetterAdapter.waitFor('ms-widget-slot:nth-child(3) ms-grid ms-event-group ms-event')
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      setTimeout(async () => {
        const events = await this.puppetterAdapter.querySelectorAll('ms-widget-slot:nth-child(3) ms-grid ms-event-group ms-event', spot) ?? []
        for (const event of events) {
          let data = { participant1: { name: '', win: '' }, participant2: { name: '', win: '' } }

          // Getting participants name
          const participants = await this.puppetterAdapter.handleElements('.participants-pair-game .participant', participants => {
            return participants.map(p => p.textContent)
          }, event)
          data = { ...data, participant1: { ...data.participant1, name: participants[0]?.trim() ?? '' }, participant2: { ...data.participant2, name: participants[1]?.trim() ?? '' } }
          //

          // Getting ODDS
          const oddsDataGroups = (await this.puppetterAdapter.querySelectorAll('.grid-group-container ms-option-group', event)) ?? []
          if (oddsDataGroups.length > 0) {
            const odds = await this.puppetterAdapter.handleElements<SportingbetScraptController.OddsType>('.option-value', odds => {
              const data = {
                partOneWin: odds[0].textContent ?? '',
                partTwoWin: odds[2].textContent ?? '',
                draw: odds[1].textContent
              }
              return data
            }, oddsDataGroups[0])

            const extraData = await this.puppetterAdapter.handleElements<SportingbetScraptController.OddsType>('.option-value', odds => {
              const data = {
                over: odds[0].textContent,
                under: odds[1].textContent
              }
              return data
            }, oddsDataGroups[1])
            const { partOneWin, partTwoWin, ...extraDataWithoutWinsData } = { ...odds, ...extraData }
            data = { ...data, participant1: { ...data.participant1, win: partOneWin }, participant2: { ...data.participant2, win: partTwoWin } }
            scraptedAllEvents.push({ ...data, ...extraDataWithoutWinsData })
          }
          //
        }
        for (const matche of scraptedAllEvents as Football[]) {
          await this.footBallRepository.save(matche)
        }
        console.log('Concluded')
        if (callback) {
          callback(scraptedAllEvents)
        }
      }, 5000)
    }
  }
}

export namespace SportingbetScraptController {
  export type OddsType = {
    partOneWin: string
    partTwoWin: string
    draw: string
    over: string
  }
}
