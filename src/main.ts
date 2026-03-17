/**
 * MIS Auto Approval
 *
 * Automates the approval of pending person records in the BAPS MIS system.
 * For each pending record, the script:
 *   1. Checks for duplicate persons — skips if duplicates exist
 *   2. Checks for edit permissions  — skips if no permission
 *   3. Approves and saves the record
 *
 * Designed to run headless in GitHub Actions (weekly schedule) or locally.
 */

import "tsconfig-paths";
import { chromium } from "@playwright/test";
import { LoginPage } from "@pom/login.page";
import { DashboardPage } from "@pom/dashboard.page";
import { SearchPersonPage } from "@pom/search-person.page";
import { DuplicatePersonModal } from "@pom/duplicate-person.modal";
import { EditPersonModal } from "@pom/edit-person.modal";
import logger from "./misc";

// Load .env file for local runs (no-op in CI where env vars are injected)
require("dotenv").config();

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  let totalRecordsApproved = 0;

  try {
    // ── Authentication ──────────────────────────────────────────────
    await page.goto("https://mis.na.baps.org/");
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLoginPage();
    await loginPage.loginWithBapsSSO();

    // ── Navigate to Search Person ───────────────────────────────────
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigateToSearchPerson();

    // ── Search for Pending Records ──────────────────────────────────
    const searchPersonPage = new SearchPersonPage(page);
    await searchPersonPage.clearPersonStatus();
    await searchPersonPage.selectPendingPersonStatus();
    await searchPersonPage.clickSearch();
    await searchPersonPage.selectMaxRecords();

    const totalRecords = await searchPersonPage.getNumberOfRecords();
    logger.info(`Total Records to be processed: ${totalRecords}`);

    // ── Process Each Pending Record ─────────────────────────────────
    for (let rowNumber = 1; rowNumber <= totalRecords; rowNumber++) {
      const misID = await searchPersonPage.getMisId(rowNumber);
      const firstName = await searchPersonPage.getFirstName(rowNumber);
      const lastName = await searchPersonPage.getLastName(rowNumber);
      logger.info(
        `Working on MIS ID: ${misID}, First Name: ${firstName}, Last Name: ${lastName}`
      );

      // Step 1: Check for duplicates
      await searchPersonPage.clickDuplicatePerson(rowNumber);
      const duplicatePersonModal = new DuplicatePersonModal(page);

      if (!(await duplicatePersonModal.hasNoDataDisplayed())) {
        // Duplicates found — skip this record
        await duplicatePersonModal.closeDuplicatePersonModal();
        logger.info(
          `Duplicate found — skipping record with MIS ID: ${misID}`
        );
        continue;
      }

      // No duplicates — proceed to edit
      await duplicatePersonModal.closeDuplicatePersonModal();

      // Step 2: Check edit permissions
      await searchPersonPage.clickEditPerson(rowNumber);
      const editPersonModal = new EditPersonModal(page);

      if (await editPersonModal.noEditPermissionDisplayed()) {
        // No edit permission — skip this record
        await editPersonModal.closeEditPersonModal();
        logger.info(
          `No edit permission — skipping record with MIS ID: ${misID}`
        );
        continue;
      }

      // Step 3: Approve and save
      await editPersonModal.clickApprove();
      await editPersonModal.savePerson();
      await editPersonModal.closeEditPersonModal();
      totalRecordsApproved++;
    }

    // ── Summary & Logout ────────────────────────────────────────────
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
