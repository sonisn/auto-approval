import "tsconfig-paths";
import {LoginPage} from "@pom/login.page";
import {DashboardPage} from "@pom/dashboard.page";
import {SearchPersonPage} from "@pom/search-person.page";
import {DuplicatePersonModal} from "@pom/duplicate-person.modal";
import {EditPersonModal} from "@pom/edit-person.modal";
import { chromium} from "@playwright/test"
import logger from "./misc";

require('dotenv').config();


(async () => {
    const browser = await chromium.launch( { headless: true });
    const page = await browser.newPage();
    await page.goto('https://mis.na.baps.org/');
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

    for (let rowNumber = 1; rowNumber <= totalRecords; rowNumber++) {
        const misID = await searchPersonPage.resultTable.locator(searchPersonPage.resultRowLocator.replace('{rowNumber}', rowNumber.toString()))
            .locator(searchPersonPage.misIdColumnLocator)
            .innerText();
        const firstName = await searchPersonPage.resultTable.locator(searchPersonPage.resultRowLocator.replace('{rowNumber}', rowNumber.toString()))
        .locator(searchPersonPage.firstNameColumnLocator)
        .innerText();
        const lastName = await searchPersonPage.resultTable.locator(searchPersonPage.resultRowLocator.replace('{rowNumber}', rowNumber.toString()))
        .locator(searchPersonPage.lastNameColumnLocator)
        .innerText();
        logger.info(`Working on MIS ID: ${misID}, First Name: ${firstName}, Last Name: ${lastName}`);
        await searchPersonPage.clickDuplicatePerson(rowNumber);
        const duplicatePersonModal = new DuplicatePersonModal(page);
        if (await duplicatePersonModal.hasNoDataDisplayed()) {
            logger.info(`No duplicate found hence approving record with MIS ID: ${misID}`);
            await duplicatePersonModal.closeDuplicatePersonModal();
            await searchPersonPage.clickEditPerson(rowNumber);
            const editPersonModal = new EditPersonModal(page);
            if (await editPersonModal.noEditPermissionDisplayed()) {
                await editPersonModal.closeEditPersonModal();
                logger.info(`Person with MIS ID: ${misID} can't approve as it has no edit permission.`);
            } else {
                await editPersonModal.clickApprove();
                await editPersonModal.savePerson();
                await editPersonModal.closeEditPersonModal();
            }
        } else {
            await duplicatePersonModal.closeDuplicatePersonModal();
            logger.info(`No duplicate found hence approving record with MIS ID: ${misID}`);
        }
    }
    await dashboardPage.logout();
    await browser.close();
})();