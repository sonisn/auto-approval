import "tsconfig-paths";
import { LoginPage } from "@pom/login.page";
import { DashboardPage } from "@pom/dashboard.page";
import { SearchPersonPage } from "@pom/search-person.page";
import { DuplicatePersonModal } from "@pom/duplicate-person.modal";
import { EditPersonModal } from "@pom/edit-person.modal";
import { chromium } from "@playwright/test";
import logger from "./misc";

// Load .env file for Local Run
require("dotenv").config();

/*
    Starting point for the Script, as we use playwright API not as a test, launch browser using API.
    This script is specially purposed to Auto Approve all the records passed from an Accounting team.
    If a record is pending for approval, and a duplicate record is found or no edit permission, skips those records
    and update the clean records.
 */

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let totalRecordsApproved = 0;
  try {
    await page.goto("https://mis.na.baps.org/");
    const logInPage = new LoginPage(page);
    await logInPage.NavigateToLoginPage();
    await logInPage.LoginWithBapsSSO();
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToSearchPerson();
    const searchPersonPage = new SearchPersonPage(page);
    await searchPersonPage.clearPersonStatus();
    await searchPersonPage.selectPendingPersonStatus();
    await searchPersonPage.clickSearch();
    await searchPersonPage.selectMaxRecords();
    const totalRecords = await searchPersonPage.getNumberOfRecords();
    logger.info(`Total Records to be processed: ${totalRecords}`);

    for (let rowNumber = 1; rowNumber <= totalRecords; rowNumber++) {
      const misID = await searchPersonPage.resultTable
        .locator(
          searchPersonPage.resultRowLocator.replace(
            "{rowNumber}",
            rowNumber.toString()
          )
        )
        .locator(searchPersonPage.misIdColumnLocator)
        .innerText();
      const firstName = await searchPersonPage.resultTable
        .locator(
          searchPersonPage.resultRowLocator.replace(
            "{rowNumber}",
            rowNumber.toString()
          )
        )
        .locator(searchPersonPage.firstNameColumnLocator)
        .innerText();
      const lastName = await searchPersonPage.resultTable
        .locator(
          searchPersonPage.resultRowLocator.replace(
            "{rowNumber}",
            rowNumber.toString()
          )
        )
        .locator(searchPersonPage.lastNameColumnLocator)
        .innerText();
      logger.info(
        `Working on MIS ID: ${misID}, First Name: ${firstName}, Last Name: ${lastName}`
      );
      await searchPersonPage.clickDuplicatePerson(rowNumber);
      const duplicatePersonModal = new DuplicatePersonModal(page);
      if (await duplicatePersonModal.hasNoDataDisplayed()) {
        logger.info(
          `No duplicate found hence approving record with MIS ID: ${misID}`
        );
        await duplicatePersonModal.closeDuplicatePersonModal();
        await searchPersonPage.clickEditPerson(rowNumber);
        const editPersonModal = new EditPersonModal(page);
        if (await editPersonModal.noEditPermissionDisplayed()) {
          await editPersonModal.closeEditPersonModal();
          logger.info(
            `Person with MIS ID: ${misID} can't approve as it has no edit permission.`
          );
        } else {
          await editPersonModal.clickApprove();
          await editPersonModal.savePerson();
          await editPersonModal.closeEditPersonModal();
          totalRecordsApproved++;
        }
      } else {
        await duplicatePersonModal.closeDuplicatePersonModal();
        logger.info(
          `Duplicate found hence skipping approving record with MIS ID: ${misID}`
        );
      }
    }
    await dashboardPage.logout();
    logger.info(`Total Records Approved: ${totalRecordsApproved}`);
    logger.info(
      `Total Records Skipped: ${totalRecords - totalRecordsApproved}`
    );
  } catch (error) {
    logger.error(`Error: ${error}`);
    logger.debug("Taking screenshot of the error");
    await page.screenshot({
      path: "screenshots/error.png",
      timeout: 3_000,
      fullPage: false,
      animations: "disabled",
    });
  } finally {
    await browser.close();
  }
})();
