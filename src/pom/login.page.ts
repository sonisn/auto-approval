import {Locator, Page} from "@playwright/test";


export class LoginPage {
    page: Page
    private readonly loginWithBapsSSOBtn: Locator;
    private readonly loginWithBapsSSOUserName: Locator;
    private readonly loginWithBapsSSOPassword: Locator;
    private readonly signInBtn: Locator;

    constructor(page: Page) {
        this.page = page;
        this.loginWithBapsSSOBtn = this.page.getByRole('button', { name: 'Click here to login with BAPS' })
        this.loginWithBapsSSOUserName = this.page.locator('#userName');
        this.loginWithBapsSSOPassword = this.page.locator('#password');
        this.signInBtn = this.page.getByRole('button', { name: 'Sign In' })
    }

    async NavigateToLoginPage() {
        await this.loginWithBapsSSOBtn.click();
        await this.page.waitForLoadState("load");
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");
    }

    async LoginWithBapsSSO() {
        const userName = process.env.USERNAME;
        const password = process.env.PASSWORD;
        await this.loginWithBapsSSOUserName.fill(userName);
        await this.loginWithBapsSSOPassword.fill(password);
        await this.signInBtn.click();
    }

}