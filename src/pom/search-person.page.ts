/**
 * Search Person Page
 *
 * Manages the search form, result table, and per-row actions
 * (duplicate check, edit) on the MIS Search Person page.
 */
import { Locator, Page } from "@playwright/test";

/** Column indices in the search results datatable. */
enum SearchResultColumns {
  SR = 0,
  MIS_ID = 1,
  NAME = 2,
  PHONE_EMAIL = 3,
  ADDRESS = 4,
  RELATION = 5,
  ACTION = 6,
}

export class SearchPersonPage {
  private readonly page: Page;

  // --- Search Form Locators ---
  private readonly personStatusList: Locator;
  private readonly personStatusPendingItem: Locator;
  private readonly searchBtn: Locator;
  private readonly searchResetBtn: Locator;
  private readonly selectRecordsDisplay: Locator;

  // --- Result Table Locators ---
  private readonly totalRecordsText: Locator;
  readonly resultTable: Locator;

  /** Row selector template — replace `{rowNumber}` with the 1-based row index. */
  readonly resultRowLocator =
    "datatable-row-wrapper:nth-child({rowNumber})";

  /** Cell selectors for extracting data from a result row. */
  readonly misIdColumnLocator =
    "datatable-body-cell:nth-child(2) span.person-status-pending";
  readonly firstNameColumnLocator =
    "datatable-body-cell:nth-child(3) span:nth-child(1)";
  readonly lastNameColumnLocator =
    "datatable-body-cell:nth-child(3) span:nth-child(2)";

  /** Action column and its buttons. */
  private readonly actionColumnLocator =
    "datatable-body-cell:nth-child(7)";
  private readonly duplicatePersonBtn = "i.las.la-users";
  private readonly editPersonBtn = "i.las.la-edit";

  constructor(page: Page) {
    this.page = page;
    this.personStatusList = this.page
      .getByRole("listbox")
      .filter({ hasText: "Person Status" })
      .locator("span")
      .first();
    this.personStatusPendingItem = this.page.getByRole("option", {
      name: "Pending",
    });
    this.searchBtn = this.page.getByRole("button", { name: "Search" });
    this.searchResetBtn = this.page.getByRole("button", { name: "Reset" });
    this.selectRecordsDisplay = this.page
      .getByRole("listbox")
      .filter({ hasText: "10" })
      .getByRole("combobox");
    this.totalRecordsText = this.page.locator(
      'div.head-toolbar > div.record-text > p:has-text("TOTAL RECORDS:")'
    );
    this.resultTable = this.page.locator(
      "ngx-datatable datatable-body.datatable-body"
    );
  }

  // --- Search Actions ---

  /** Clears any pre-selected person status filters. */
  async clearPersonStatus() {
    await this.page
      .locator('div.ng-placeholder:has-text("Person Status")')
      .locator("..")
      .locator("..")
      .locator('span[title="Clear all"]')
      .click();
  }

  /** Selects "Pending" from the person status dropdown. */
  async selectPendingPersonStatus() {
    await this.personStatusList.click();
    await this.personStatusPendingItem.click();
    // Click away from the dropdown to close it
    await this.page.getByText("Search Reset Export").click();
  }

  /** Submits the search form. */
  async clickSearch() {
    await this.searchBtn.click();
  }

  /** Resets all search filters. */
  async resetSearch() {
    await this.searchResetBtn.click();
  }

  /** Switches the results display to show up to 200 records per page. */
  async selectMaxRecords() {
    await this.selectRecordsDisplay.click();
    await this.page.getByRole("option").filter({ hasText: "200" }).click();
  }

  // --- Result Table Helpers ---

  /** Parses the "TOTAL RECORDS: N" text to return the record count. */
  async getNumberOfRecords(): Promise<number> {
    const text = await this.totalRecordsText.innerText();
    return parseInt(text.split(": ")[1]);
  }

  /** Returns a locator for a specific row in the results table. */
  private getRowLocator(rowNumber: number): Locator {
    return this.resultTable.locator(
      this.resultRowLocator.replace("{rowNumber}", rowNumber.toString())
    );
  }

  /** Extracts the MIS ID from the given result row. */
  async getMisId(rowNumber: number): Promise<string> {
    return this.getRowLocator(rowNumber)
      .locator(this.misIdColumnLocator)
      .innerText();
  }

  /**
   * Extracts the first name from the given result row.
   * Uses .first() because some rows contain extra spans (e.g., aliases),
   * which would cause a strict mode violation.
   */
  async getFirstName(rowNumber: number): Promise<string> {
    return this.getRowLocator(rowNumber)
      .locator(this.firstNameColumnLocator)
      .first()
      .innerText();
  }

  /**
   * Extracts the last name from the given result row.
   * Uses .first() for the same reason as getFirstName().
   */
  async getLastName(rowNumber: number): Promise<string> {
    return this.getRowLocator(rowNumber)
      .locator(this.lastNameColumnLocator)
      .first()
      .innerText();
  }

  // --- Row Actions ---

  /** Opens the duplicate-person modal for the given result row. */
  async clickDuplicatePerson(rowNumber: number) {
    await this.getRowLocator(rowNumber)
      .locator(this.actionColumnLocator)
      .locator(this.duplicatePersonBtn)
      .click();
  }

  /** Opens the edit-person modal for the given result row. */
  async clickEditPerson(rowNumber: number) {
    await this.getRowLocator(rowNumber)
      .locator(this.actionColumnLocator)
      .locator(this.editPersonBtn)
      .click();
  }
}
