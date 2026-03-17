/**
 * Dashboard Page
 *
 * Provides navigation across the MIS application after login.
 * Handles the sidebar menu, which may be collapsed on smaller viewports.
 */
import { Locator, Page } from "@playwright/test";

export class DashboardPage {
  private readonly page: Page;

  // --- Locators ---
  private readonly menuToggleBtn: Locator;
  private readonly managePerson: Locator;
  private readonly searchPerson: Locator;
  private readonly searchResetBtn: Locator;
  private readonly logoutBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.menuToggleBtn = this.page
      .getByRole("button")
      .filter({ hasText: /^$/ })
      .first();
    this.managePerson = this.page
      .locator("a")
      .filter({ hasText: "Manage Person" });
    this.searchPerson = this.page.getByRole("link", {
      name: "Search Person ",
    });
    this.searchResetBtn = this.page.getByRole("button", { name: "Reset" });
    this.logoutBtn = this.page.locator("i.las.la-sign-out-alt.logout-icon");
  }

  // --- Navigation ---

  /**
   * Navigates to the Search Person page.
   * If the sidebar menu is collapsed, expands it first before clicking through.
   * Resets any existing search filters after navigation.
   */
  async navigateToSearchPerson() {
    if (await this.searchPerson.isVisible()) {
      await this.searchPerson.click();
    } else {
      // Sidebar is collapsed — expand it first
      await this.menuToggleBtn.click();
      await this.managePerson.click();
      await this.searchPerson.click();
    }
    await this.searchResetBtn.click();
  }

  /** Logs the current user out of the MIS application. */
  async logout() {
    await this.logoutBtn.click();
  }
}
