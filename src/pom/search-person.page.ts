import {Locator, Page} from "@playwright/test";


enum SearchResultColumns {
    SR = 0,
    MIS_ID = 1,
    NAME = 2,
    PHONE_EMAIL = 3,
    ADDRESS = 4,
    RELATION = 5,
    ACTION = 6
}

/*
    Represents Search functionality on Search Person Page.
 */
export class SearchPersonPage {
    private readonly page: Page;
    private readonly personStatusList: Locator;
    private readonly personStatusPendingItem: Locator;
    private readonly searchResetBtn: Locator;
    private readonly searchBtn: Locator;
    private readonly selectRecordsDisplay: Locator;
    private readonly totalRecordsText: Locator;
    readonly resultTable: Locator;
    readonly resultRowLocator = "datatable-row-wrapper:nth-child({rowNumber})";
    readonly misIdColumnLocator = "datatable-body-cell:nth-child(2) span.person-status-pending";
    readonly firstNameColumnLocator = "datatable-body-cell:nth-child(3) span:nth-child(1)";
    readonly lastNameColumnLocator = "datatable-body-cell:nth-child(3) span:nth-child(2)";
    readonly actionColumnLocator = "datatable-body-cell:nth-child(7)";
    private readonly duplicatePersonBtn = "i.las.la-users";
    private readonly editPersonBtn = "i.las.la-edit";

    constructor(page: Page) {
        this.page = page;
        this.personStatusList = this.page.getByRole('listbox').filter({ hasText: 'Person Status' }).locator('span').first();
        this.personStatusPendingItem = this.page.getByRole('option', { name: 'Pending' });
        this.searchResetBtn =  this. page.getByRole('button', { name: 'Reset' });
        this.searchBtn =  this. page.getByRole('button', { name: 'Search' });
        this.selectRecordsDisplay = this.page.getByRole('listbox').filter({ hasText: '10'}).getByRole('combobox');
        this.totalRecordsText = this.page.locator('div.head-toolbar > div.record-text > p:has-text("TOTAL RECORDS:")');
        this.resultTable = this.page.locator('ngx-datatable datatable-body.datatable-body');
    }

    resetSearch = async () => {
        await this.searchResetBtn.click();
    }

    clickSearch = async () => {
        await this.searchBtn.click();
    }

    clearPersonStatus = async () => {
        await this.page.locator('div.ng-placeholder:has-text("Person Status")')
            .locator('..')
            .locator('..')
            .locator('span[title="Clear all"]')
            .click();
    }

    selectPendingPersonStatus  = async () => {
          await this.personStatusList.click();
          await this.personStatusPendingItem.click();
          await this.page.getByText('Search Reset Export').click();
    }

    selectMaxRecords = async () => {
        await this.selectRecordsDisplay.click();
        await this.page.getByRole('option').filter({ hasText: '200' }) .click();
    }

    getNumberOfRecords = async () => {
        const text = await this.totalRecordsText.innerText();
        return parseInt(text.split(': ')[1]);
    }

    clickDuplicatePerson = async (rowNumber: number) => {
        await this.resultTable.locator(this.resultRowLocator.replace('{rowNumber}', rowNumber.toString()))
            .locator(this.actionColumnLocator)
            .locator(this.duplicatePersonBtn)
            .click()
    }
    clickEditPerson = async (rowNumber: number) => {
        await this.resultTable.locator(this.resultRowLocator.replace('{rowNumber}', rowNumber.toString()))
            .locator(this.actionColumnLocator)
            .locator(this.editPersonBtn)
            .click()
    }
}