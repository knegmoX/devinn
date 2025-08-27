import puppeteer, { Browser, Page } from 'puppeteer';
import { logger } from '@/lib/logger';

export interface PuppeteerConfig {
  headless?: boolean;
  timeout?: number;
  userAgent?: string;
  viewport?: {
    width: number;
    height: number;
  };
}

export class PuppeteerService {
  private browser: Browser | null = null;
  private config: PuppeteerConfig;

  constructor(config: PuppeteerConfig = {}) {
    this.config = {
      headless: true,
      timeout: 30000,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      ...config,
    };
  }

  async initialize(): Promise<void> {
    try {
      this.browser = await puppeteer.launch({
        headless: this.config.headless,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
        ],
      });
      logger.info('Puppeteer browser initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Puppeteer browser:', error);
      throw new Error('Failed to initialize browser');
    }
  }

  async createPage(): Promise<Page> {
    if (!this.browser) {
      await this.initialize();
    }

    const page = await this.browser!.newPage();
    
    // Set user agent and viewport
    await page.setUserAgent(this.config.userAgent!);
    await page.setViewport(this.config.viewport!);

    // Set default timeout
    page.setDefaultTimeout(this.config.timeout!);

    // Block unnecessary resources to speed up loading
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (['stylesheet', 'font', 'image'].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    return page;
  }

  async navigateToPage(page: Page, url: string): Promise<void> {
    try {
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: this.config.timeout,
      });
      logger.info(`Successfully navigated to: ${url}`);
    } catch (error) {
      logger.error(`Failed to navigate to ${url}:`, error);
      throw new Error(`Navigation failed: ${url}`);
    }
  }

  async waitForSelector(page: Page, selector: string, timeout?: number): Promise<void> {
    try {
      await page.waitForSelector(selector, {
        timeout: timeout || this.config.timeout,
      });
    } catch (error) {
      logger.error(`Selector not found: ${selector}`, error);
      throw new Error(`Element not found: ${selector}`);
    }
  }

  async extractText(page: Page, selector: string): Promise<string | null> {
    try {
      const element = await page.$(selector);
      if (!element) return null;
      
      const text = await page.evaluate(el => el.textContent?.trim() || '', element);
      return text || null;
    } catch (error) {
      logger.error(`Failed to extract text from ${selector}:`, error);
      return null;
    }
  }

  async extractAttribute(page: Page, selector: string, attribute: string): Promise<string | null> {
    try {
      const element = await page.$(selector);
      if (!element) return null;
      
      const value = await page.evaluate(
        (el, attr) => el.getAttribute(attr),
        element,
        attribute
      );
      return value;
    } catch (error) {
      logger.error(`Failed to extract attribute ${attribute} from ${selector}:`, error);
      return null;
    }
  }

  async extractMultipleTexts(page: Page, selector: string): Promise<string[]> {
    try {
      const elements = await page.$$(selector);
      const texts = await Promise.all(
        elements.map(element =>
          page.evaluate(el => el.textContent?.trim() || '', element)
        )
      );
      return texts.filter(text => text.length > 0);
    } catch (error) {
      logger.error(`Failed to extract multiple texts from ${selector}:`, error);
      return [];
    }
  }

  async scrollToBottom(page: Page): Promise<void> {
    try {
      await page.evaluate(() => {
        return new Promise<void>((resolve) => {
          let totalHeight = 0;
          const distance = 100;
          const timer = setInterval(() => {
            const scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
      });
    } catch (error) {
      logger.error('Failed to scroll to bottom:', error);
    }
  }

  async takeScreenshot(page: Page, path?: string): Promise<Buffer> {
    try {
      if (path) {
        // When path is provided, save to file and return buffer
        const screenshot = await page.screenshot({
          fullPage: true,
          path: path as `${string}.png` | `${string}.jpeg` | `${string}.webp`,
        });
        return Buffer.from(screenshot);
      } else {
        // When no path, just return buffer
        const screenshot = await page.screenshot({
          fullPage: true,
        });
        return Buffer.from(screenshot);
      }
    } catch (error) {
      logger.error('Failed to take screenshot:', error);
      throw new Error('Screenshot failed');
    }
  }

  async closePage(page: Page): Promise<void> {
    try {
      await page.close();
    } catch (error) {
      logger.error('Failed to close page:', error);
    }
  }

  async close(): Promise<void> {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        logger.info('Puppeteer browser closed successfully');
      }
    } catch (error) {
      logger.error('Failed to close browser:', error);
    }
  }

  // Utility method for handling anti-bot measures
  async bypassAntiBot(page: Page): Promise<void> {
    try {
      // Add random delays
      await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));

      // Simulate human-like mouse movements
      await page.mouse.move(
        Math.random() * 1920,
        Math.random() * 1080
      );

      // Execute some JavaScript to make the browser look more human
      await page.evaluateOnNewDocument(() => {
        // Override the `plugins` property to use a custom getter
        Object.defineProperty(navigator, 'plugins', {
          get: () => [1, 2, 3, 4, 5],
        });

        // Override the `languages` property to use a custom getter
        Object.defineProperty(navigator, 'languages', {
          get: () => ['en-US', 'en'],
        });

        // Override the `webdriver` property to remove it
        delete (navigator as any).webdriver;
      });
    } catch (error) {
      logger.error('Failed to bypass anti-bot measures:', error);
    }
  }
}

// Singleton instance
export const puppeteerService = new PuppeteerService();
