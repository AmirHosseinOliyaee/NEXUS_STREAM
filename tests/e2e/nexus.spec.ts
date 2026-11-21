import { expect, test } from "@playwright/test";

test.describe("NEXUS STREAM experience", () => {
  test("home exposes the equalizer and restores neutral ranking", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByRole("switch")).toBeVisible();
    await expect(page.getByRole("slider").first()).toBeVisible();

    const chronoSwitch = page.getByRole("switch");
    await chronoSwitch.click();
    await expect(chronoSwitch).toHaveAttribute("aria-checked", "true");
    await page.getByRole("button", { name: /nuke reset/i }).click();
    await expect(chronoSwitch).toHaveAttribute("aria-checked", "false");
    await expect(page.getByRole("slider").first()).toHaveValue("50");
  });

  test("watch page renders video, emotional timeline, and comment tabs", async ({ page }) => {
    await page.goto("/watch/vid-gpu-graveyard");
    await expect(page.locator("video")).toBeVisible();
    await expect(page.getByRole("slider", { name: /timeline/i })).toBeVisible();
    await expect(page.getByRole("tablist")).toBeVisible();
    await expect(page.getByRole("tab").first()).toBeVisible();
  });

  for (const route of ["/dimension", "/lounge/nexus-alpha", "/profile/netrunner-01", "/studio"]) {
    test(`${route} responds successfully without browser errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.locator("body")).not.toBeEmpty();
      expect(errors).toEqual([]);
    });
  }

  test("locale selector updates document direction", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /switch interface language: fa/i }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await page.getByRole("button", { name: /switch interface language: en/i }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });
});
