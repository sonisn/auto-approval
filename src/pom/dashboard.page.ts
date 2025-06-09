import {Locator, Page} from "@playwright/test";


export class DashboardPage {
    private readonly page: Page;
    private readonly menuItem: Locator;
    private readonly managePerson: Locator;
    private readonly searchPerson: Locator;
    private readonly searchBtn: Locator;
    private readonly searchResetBtn: Locator;
    private readonly logoutBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.menuItem = this.page.getByRole('button').filter({ hasText: /^$/ }).first();
        this.managePerson =  this.page.locator('a').filter({ hasText: 'Manage Person' });
        this.searchPerson =  this.page.getByRole('link', { name: 'Search Person ' });
        this.searchBtn =  this. page.getByRole('button', { name: 'Search' });
        this.searchResetBtn =  this. page.getByRole('button', { name: 'Reset' });
        this.logoutBtn = this.page.locator('i.las.la-sign-out-alt.logout-icon');
    }

    navigateToManagePerson = async () => {
        await this.managePerson.click();
    };

    navigateToSearchPerson = async () => {
        if (await this.searchPerson.isVisible()) {
            await this.searchPerson.click();
        } else {
            await this.menuItem.click();
            await this.managePerson.click();
            await this.searchPerson.click();
        }
        await this.searchResetBtn.click();
    };

    logout = async () => {
        await this.logoutBtn.click();
    };
}