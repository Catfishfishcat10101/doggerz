/** @format */

import { describe, expect, it } from "vitest";
import {
  compareVersions,
  formatAppVersion,
  isAbsoluteUrl,
  isVersionAtLeast,
  joinPublicPath,
  normalizeVersionInput,
  parseVersion,
  stripBaseUrl,
  withBaseUrl,
} from "./gameUtils";

describe("gameUtils", () => {
  it("normalizes and parses version strings", () => {
    expect(normalizeVersionInput(" v1.2.3 ")).toBe("1.2.3");

    expect(parseVersion("v2.4.6")).toEqual({
      major: 2,
      minor: 4,
      patch: 6,
      prerelease: "",
      build: "",
    });

    expect(parseVersion("nightly-build")).toEqual({
      major: 0,
      minor: 0,
      patch: 0,
      prerelease: "nightly-build",
    });
  });

  it("compares semantic versions including prereleases", () => {
    expect(compareVersions("1.2.3", "1.2.2")).toBe(1);
    expect(compareVersions("1.2.3", "1.2.3")).toBe(0);
    expect(compareVersions("1.2.3-alpha", "1.2.3")).toBe(-1);
    expect(compareVersions("1.2.3-beta", "1.2.3-alpha")).toBe(1);
  });

  it("formats and evaluates minimum version checks", () => {
    expect(formatAppVersion("1.4.0")).toBe("v1.4.0");
    expect(formatAppVersion("dev")).toBe("dev");
    expect(isVersionAtLeast("1.5.0", "1.4.9")).toBe(true);
    expect(isVersionAtLeast("1.5.0-alpha", "1.5.0")).toBe(false);
  });

  it("handles asset/public path helpers", () => {
    expect(isAbsoluteUrl("https://doggerz.dev/file.png")).toBe(true);
    expect(isAbsoluteUrl("//cdn.example.com/file.png")).toBe(true);
    expect(isAbsoluteUrl("/assets/icons/icon-192.png")).toBe(false);

    expect(withBaseUrl("/assets/icons/icon-192.png")).toBe(
      "/assets/icons/icon-192.png"
    );
    expect(withBaseUrl("assets/icons/icon-192.png")).toBe(
      "/assets/icons/icon-192.png"
    );
    expect(withBaseUrl("https://cdn.example.com/icon-192.png")).toBe(
      "https://cdn.example.com/icon-192.png"
    );

    expect(joinPublicPath("/public/", "/icons/pup.png")).toBe(
      "/public/icons/pup.png"
    );
    expect(stripBaseUrl("/assets/icons/icon-192.png")).toBe(
      "/assets/icons/icon-192.png"
    );
  });
});
