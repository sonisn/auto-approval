/**
 * Edit Person Modal
 *
 * Opened from search results to modify a person's record.
 * Used by the auto-approval flow to set the approval status and save.
 * Some records may display a "no edit permission" warning, in which
 * case the record must be skipped.
 */
import { Locator, Page } from "@playwright/test";

export class EditPersonModal {
  private readonly page: Page;

  // --- Locators ---
  private readonly closeBtn: Locator;
  private readonly noEditPermission: Locator;
  private readonly saveBtn: Locator;
  private readonly cancelBtn: Locator;
  private readonly personStatusRadioGroup: Locator;
  private readonly approveRadioBtn =
    "mat-radio-button:nth-child(1) div.mat-radio-container";

  constructor(page: Page) {
    this.page = page;
    this.closeBtn = this.page.locator("baps-ui-person-edit button.close");
    this.noEditPermission = this.page.locator(
      "baps-ui-person-edit p.text-danger"
    );
    this.saveBtn = this.page.getByRole("button", { name: "Save" });
    this.cancelBtn = this.page.getByRole("button", { name: "Cancel" });
    this.personStatusRadioGroup = this.page.getByRole("radiogroup").nth(2);
  }

  // --- Permission Check ---

  /**
   * Checks if the modal shows a "no edit permission" warning.
   * Waits for the modal content to load before checking visibility.
   */
  async noEditPermissionDisplayed(): Promise<boolean> {
    await this.page.waitForLoadState("load");
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForLoadState("domcontentloaded");
    // Allow time for the permission check to render
    await this.page.waitForTimeout(7_000);
    return await this.noEditPermission.isVisible();
  }

  // --- Approval Actions ---

  /** Selects the "Approve" radio button in the person status group. */
  async clickApprove() {
    await this.personStatusRadioGroup
      .locator(this.approveRadioBtn)
      .click();
  }

  /** Saves the current changes to the person record. */
  async savePerson() {
    await this.saveBtn.click();
  }

  /** Cancels the current edit without saving. */
  async cancelPerson() {
    await this.cancelBtn.click();
  }

  /** Closes the edit person modal. */
  async closeEditPersonModal() {
    await this.closeBtn.click();
  }
}
