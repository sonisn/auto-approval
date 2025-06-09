import {Locator, Page} from "@playwright/test";


export class DuplicatePersonModal {
    private readonly page: Page;
    private readonly tableFirstRowContent: Locator;
    private readonly closeBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.tableFirstRowContent = this.page.locator('baps-ui-duplicate-person-list table tbody tr:first-child td')
        this.closeBtn = this.page.locator('baps-ui-duplicate-person-list button.close')
    }

    hasNoDataDisplayed = async () => {
        await this.page.waitForLoadState("load");
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");
        await this.page.waitForTimeout(5000);
        if (await this.tableFirstRowContent.count() === 1) {
            return await this.tableFirstRowContent.textContent() === 'No data to display';
        } else if (await this.tableFirstRowContent.count() === 5) {
            return false;
        }
    }

    closeDuplicatePersonModal = async () => {
        await this.closeBtn.click();
    }
}