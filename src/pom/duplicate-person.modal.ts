/**
 * Duplicate Person Modal
 *
 * Opened from the search results to check if a pending person
 * already exists in the system. The modal displays a table that either
 * shows "No data to display" (1 cell) or matching duplicate rows (5 cells per row).
 */
import { Locator, Page } from "@playwright/test";

export class DuplicatePersonModal {
  private readonly page: Page;

  // --- Locators ---
  private readonly tableFirstRowContent: Locator;
  private readonly closeBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tableFirstRowContent = this.page.locator(
      "baps-ui-duplicate-person-list table tbody tr:first-child td"
    );
    this.closeBtn = this.page.locator(
      "baps-ui-duplicate-person-list button.close"
    );
  }

  // --- Actions ---

  /**
   * Checks whether the duplicate table shows "No data to display".
   *
   * Waits for the modal content to fully load (including a fixed timeout to
   * allow the server-side duplicate search to complete), then inspects the
   * table structure:
   *  - 1 cell  → "No data to display" message → returns true (no duplicates)
   *  - 5 cells → duplicate record found       → returns false
   *  - Other   → unexpected state             → throws an error
   */
  async hasNoDataDisplayed(): Promise<boolean> {
    await this.page.waitForLoadState("load");
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForLoadState("domcontentloaded");

    // The duplicate search runs server-side and can be slow;
    // wait for results to populate before inspecting the table
    await this.page.waitForTimeout(35_000);

    const cellCount = await this.tableFirstRowContent.count();

    if (cellCount === 1) {
      return (
        (await this.tableFirstRowContent.textContent()) ===
        "No data to display"
      );
    } else if (cellCount === 5) {
      return false;
    } else {
      throw new Error(
        `Unexpected number of cells (${cellCount}) in duplicate person modal`
      );
    }
  }

  /** Closes the duplicate person modal. */
  async closeDuplicatePersonModal() {
    await this.closeBtn.click();
  }
}
