import { expect, type Locator } from "@playwright/test";

function attributeValue(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

export async function selectValue(trigger: Locator, value: string) {
  await trigger.click();
  await expect(trigger.page().getByRole("listbox")).toBeVisible();
  const option = trigger.page().locator(`[role="option"][data-select-value="${attributeValue(value)}"]`);
  await expect(option).toBeVisible();
  await option.click();
  await expect(trigger).toHaveAttribute("data-value", value);
}
