import {Locator, Page} from "@playwright/test";


/*
    Represents Login Page.
 */
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
        await this.loginWithBapsSSOBtn.waitFor({ state: "visible" });
        await this.loginWithBapsSSOBtn.isEnabled();
        await this.loginWithBapsSSOBtn.click();
        // Wait for the login page to fully load.
        await this.page.waitForLoadState("load");
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");
    }

    async LoginWithBapsSSO() {
        // Store Username and Password in GitHub Action Secret and Read to here to user for login.
        const userName = process.env.USERNAME;
        const password = process.env.PASSWORD;
        // Login Page takes a while to fully load and processed and especially on Github Actions.
        // Wait for the login page to fully load.
        await this.page.waitForLoadState("load");
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");
        // Wait for the login page to be visible.
        await this.loginWithBapsSSOUserName.waitFor({ state: "visible" });
        await this.loginWithBapsSSOPassword.waitFor({ state: "visible" });
        await this.signInBtn.waitFor({ state: "visible" });
        // Check they're enabled for interactions.
        await this.loginWithBapsSSOUserName.isEnabled();
        await this.loginWithBapsSSOPassword.isEnabled();
        await this.signInBtn.isEnabled();
        await this.loginWithBapsSSOUserName.fill(userName);
        await this.loginWithBapsSSOPassword.fill(password);
        await this.signInBtn.click();
    }

}