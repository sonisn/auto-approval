/**
 * Login Page
 *
 * Handles authentication via BAPS SSO.
 * Credentials are sourced from environment variables (USERNAME / PASSWORD),
 * set locally via .env or injected through GitHub Actions secrets.
 */
import { Locator, Page } from "@playwright/test";

export class LoginPage {
  page: Page;

  // --- Locators ---
  private readonly loginWithBapsSSOBtn: Locator;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginWithBapsSSOBtn = this.page.getByRole("button", {
      name: "Click here to login with BAPS",
    });
    this.usernameInput = this.page.locator("#userName");
    this.passwordInput = this.page.locator("#password");
    this.signInBtn = this.page.getByRole("button", { name: "Sign In" });
  }

  // --- Actions ---

  /** Clicks the BAPS SSO button and waits for the login form to fully load. */
  async navigateToLoginPage() {
    await this.loginWithBapsSSOBtn.waitFor({ state: "visible" });
    await this.loginWithBapsSSOBtn.isEnabled();
    await this.loginWithBapsSSOBtn.click();
    await this.waitForPageLoad();
  }

  /** Fills credentials and submits the login form, then waits for post-login navigation. */
  async loginWithBapsSSO() {
    const userName = process.env.USERNAME;
    const password = process.env.PASSWORD;

    // The SSO login page can be slow, especially on GitHub Actions runners
    await this.waitForPageLoad();

    // Ensure all form elements are interactive before filling
    await this.usernameInput.waitFor({ state: "visible" });
    await this.passwordInput.waitFor({ state: "visible" });
    await this.signInBtn.waitFor({ state: "visible" });
    await this.usernameInput.isEnabled();
    await this.passwordInput.isEnabled();
    await this.signInBtn.isEnabled();

    await this.usernameInput.fill(userName);
    await this.passwordInput.fill(password);
    await this.signInBtn.click();

    // Post-login navigation can take up to 60s on slow connections
    await this.page.waitForLoadState("load", { timeout: 60_000 });
    await this.page.waitForLoadState("networkidle", { timeout: 60_000 });
    await this.page.waitForLoadState("domcontentloaded", { timeout: 60_000 });
  }

  // --- Helpers ---

  /** Waits for all page load states to settle. */
  private async waitForPageLoad() {
    await this.page.waitForLoadState("load");
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForLoadState("domcontentloaded");
  }
}
