/* eslint-disable no-trailing-spaces */
import puppeteer, { type HTTPResponse, type Browser, type Page, type ElementHandle } from 'puppeteer'
// import { writeFileSync } from 'fs'

export class PuppetterAdapter {
  page: Page = null as any
  async openBrowser (): Promise<Browser | null> {
    try {
      console.log('Opening the browser')
      const browser = await puppeteer.launch({
        headless: false,
        args: ['--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true
      })
      return browser
    } catch (error) {
      if (error && error instanceof Error) {
        console.log(`Failing opening browser - ${error.message}`)
        throw error
      }
    }
    return null
  }

  async waitFor (selectorName: string): Promise<void> {
    await this.page.waitForSelector(selectorName)
  }

  async querySelector (selectorName: string, elementHandled?: ElementHandle): Promise<ElementHandle | null> {
    if (elementHandled) {
      return await elementHandled.$(selectorName)
    } else {
      return await this.page.$(selectorName)
    }
  }

  async querySelectorAll (selectorName: string, elementHandled?: ElementHandle): Promise<ElementHandle[] | null> {
    if (elementHandled) {
      return await elementHandled.$$(selectorName)
    } else {
      return await this.page.$$(selectorName)
    }
  }

  async handleElements <R = any>(selectorName: string, prepData: (data: Element[]) => any, elementHandled?: ElementHandle): Promise<R> {
    return new Promise((resolve, reject) => {
      if (elementHandled) {
        elementHandled.$$eval(selectorName, prepData).then(data => { resolve(data as R) }).catch(error => { reject(error) })
      } else {
        this.page.$$eval(selectorName, prepData).then(data => { resolve(data as R) }).catch(error => { reject(error) })
      }
    })
  }

  async openPage (url: string, browser: Browser, options: PuppetterAdapter.Options): Promise<void> {
    const page = await browser.newPage()
    await page.setViewport(options.browserSize)
    await page.goto(url)
    this.page = page
  }
}

export namespace PuppetterAdapter {
  export type Options = {
    browserSize: {
      width: number
      height: number
    }
  }
}
