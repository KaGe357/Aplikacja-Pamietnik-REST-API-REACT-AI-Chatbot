import { test, expect } from "vitest";

test("Username validation - too short", () => {
  const username = "ab";
  const isValid = username.length >= 3 && username.length <= 16;
  expect(isValid).toBe(false);
});

test("Password validation - no digit", () => {
  const password = "Password!@";
  const hasDigit = /\d/.test(password);
  expect(hasDigit).toBe(false);
});

test("Password validation - valid", () => {
  const password = "Pass123!@";
  const hasDigit = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]/.test(password);
  expect(hasDigit).toBe(true);
  expect(hasSpecialChar).toBe(true);
});
