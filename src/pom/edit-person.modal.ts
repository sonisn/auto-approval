import {Locator, Page} from "@playwright/test";


export class EditPersonModal {
    private readonly page: Page;
    private readonly closeBtn: Locator;
    private readonly noEditPermission: Locator;
    private readonly saveBtn: Locator;
    private readonly cancelBtn: Locator;
    private readonly personStatusRadioGroup: Locator;
    private readonly personStatusApprove = "mat-radio-button:nth-child(1) div.mat-radio-container"

    constructor(page: Page) {
        this.page = page;
        this.closeBtn = this.page.locator('baps-ui-person-edit button.close');
        this.noEditPermission = this.page.locator('baps-ui-person-edit p.text-danger');
        this.saveBtn = this.page.getByRole("button", { name: "Save" });
        this.cancelBtn = this.page.getByRole("button", { name: "Cancel" });
        this.personStatusRadioGroup = this.page.getByRole("radiogroup").nth(2);
    };

    closeEditPersonModal = async () => {
        await this.closeBtn.click();
    };

    noEditPermissionDisplayed = async () => {
        await this.page.waitForLoadState("load");
        await this.page.waitForLoadState("networkidle");
        await this.page.waitForLoadState("domcontentloaded");
        await this.page.waitForTimeout(7000);
        return await this.noEditPermission.isVisible();
    }

    clickApprove = async () => {
        await this.personStatusRadioGroup.locator(this.personStatusApprove).click();
    }

    savePerson = async () => {
        await this.saveBtn.click();
    }

    cancelPerson = async () => {
        await this.cancelBtn.click();
    }

}