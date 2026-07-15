import { test, expect } from "@playwright/test";

test("non-destructive shot workflow", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Storyboard Editor", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "新增鏡頭" }).first().click();
  await expect(page.getByRole("listbox")).toContainText("鏡頭");
  await page.getByRole("button", { name: "復原" }).click();
  await page.getByRole("button", { name: "匯出 JSON" }).click();
});
