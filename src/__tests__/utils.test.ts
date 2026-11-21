import { describe, expect, it } from "vitest";

import { getDictionary } from "@/lib/i18n";
import { formatCompactNumber, formatDuration, formatRelativeTime } from "@/lib/utils";

function dictionaryKeys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, nested]) =>
    dictionaryKeys(nested, prefix ? `${prefix}.${key}` : key),
  );
}

describe("formatDuration", () => {
  it.each([
    [0, "00:00"],
    [65.9, "01:05"],
    [3600, "01:00:00"],
    [-5, "00:00"],
    [Number.NaN, "00:00"],
  ])("formats %s seconds", (input, expected) => {
    expect(formatDuration(input)).toBe(expected);
  });
});

describe("formatCompactNumber", () => {
  it.each([
    [842, "842"],
    [1_250, "1.3K"],
    [3_400_000, "3.4M"],
    [1_100_000_000, "1.1B"],
    [-1_250, "-1.3K"],
    [Number.POSITIVE_INFINITY, "0"],
  ])("formats %s", (input, expected) => {
    expect(formatCompactNumber(input)).toBe(expected);
  });
});

describe("formatRelativeTime", () => {
  const now = Date.parse("2026-11-21T12:00:00.000Z");

  it("formats relative units against a deterministic clock", () => {
    expect(formatRelativeTime("2026-11-21T11:42:00.000Z", now)).toBe("18M AGO");
    expect(formatRelativeTime("2026-11-19T12:00:00.000Z", now)).toBe("2D AGO");
    expect(formatRelativeTime("2026-11-21T12:00:01.000Z", now)).toBe("JUST NOW");
    expect(formatRelativeTime("not-a-date", now)).toBe("UNKNOWN");
  });
});

describe("locale dictionaries", () => {
  it("keeps English and Persian dictionary keys in parity", () => {
    expect(dictionaryKeys(getDictionary("en"))).toEqual(dictionaryKeys(getDictionary("fa")));
  });
});
