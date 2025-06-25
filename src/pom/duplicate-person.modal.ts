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
    await this.page
      .locator("baps-ui-duplicate-person-list table tbody")
      .waitFor({
        state: "visible",
        timeout: 30_000,
      });

    // Wait for the table content to stabilize (either show data or "No data to display")
    await this.page.waitForFunction(
      () => {
        const tableBody = document.querySelector(
          "baps-ui-duplicate-person-list table tbody"
        );
        if (!tableBody) return false;

        const rows = tableBody.querySelectorAll("tr");
        if (rows.length === 0) return false;

        // Check if we have either 1 row with "No data to display" or 5 rows with actual data
        if (rows.length === 1) {
          const firstCell = rows[0].querySelector("td");
          return (
            firstCell && firstCell.textContent?.trim() === "No data to display"
          );
        } else if (rows.length === 5) {
          // Check if all 5 rows have some content (not empty)
          return Array.from(rows).every((row) => {
            const cells = row.querySelectorAll("td");
            return cells.length > 0 && cells[0].textContent?.trim() !== "";
          });
        }

        return false;
      },
      { timeout: 30000 }
    );

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
