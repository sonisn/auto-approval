import { Locator, Page } from "@playwright/test";

/*
    Represents Duplicate Person Modal Window when navigated from Search Result.
 */
export class DuplicatePersonModal {
  private readonly page: Page;
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

  hasNoDataDisplayed = async () => {
    await this.page.waitForLoadState("load");
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForLoadState("domcontentloaded");

    // Wait for the table to be present and stable
    await this.page.waitForSelector(
      "baps-ui-duplicate-person-list table tbody tr:first-child td",
      {
        state: "visible",
        timeout: 35_000,
      }
    );
    await this.tableFirstRowContent.waitFor({
      state: "attached",
      timeout: 35_000,
    });
    // await this.page.waitForTimeout(35_000);

    // Now check the actual state
    if ((await this.tableFirstRowContent.count()) === 1) {
      return (
        (await this.tableFirstRowContent.textContent()) === "No data to display"
      );
    } else if ((await this.tableFirstRowContent.count()) === 5) {
      return false;
    } else {
      throw new Error("Unexpected number of rows in duplicate person modal");
    }
  };

  closeDuplicatePersonModal = async () => {
    await this.closeBtn.click();
  };
}
