import { test, expect } from "@playwright/test";
import { SwipeHelper } from "../../helpers/touchHelpers";

test.describe.configure({ mode: "serial" });

test("should not change tab when swiping on a user-configured exception card", async ({ page }) => {
  const dashboardPath = "/exceptions";
  await page.goto(dashboardPath);
  await expect(page).toHaveURL(dashboardPath + "/0");

  const exceptionCard = page.locator("hui-entities-card");
  const mdCard = page.locator("hui-markdown-card");

  const consoleLogs: string[] = [];
  page.on("console", (message) => {
    consoleLogs.push(message.text());
  });

  // Sanity: swipe on a non-exception card still navigates.
  await SwipeHelper.swipeLeft(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/1");
  await SwipeHelper.swipeRight(mdCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  // Swiping on the user-configured exception card must NOT change the tab.
  await SwipeHelper.swipeLeft(exceptionCard);
  await expect(page).toHaveURL(dashboardPath + "/0");
  await SwipeHelper.swipeRight(exceptionCard);
  await expect(page).toHaveURL(dashboardPath + "/0");

  let matches = 0;
  const regexp = /.*Ignoring touch on user exception "hui-entities-card".*/;
  for (const log of consoleLogs) {
    if (regexp.test(log)) { matches++; }
  }
  expect(matches).toBe(2);
});
