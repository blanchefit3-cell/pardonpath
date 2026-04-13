import { describe, it, expect } from "vitest";
import {
  findProvidersNearPostalCode,
  findProvidersByProvince,
  findProvidersByCity,
  getProviderById,
  getAllProvinces,
  getProviderStatistics,
} from "./rcmp-locator";

describe("RCMP Fingerprint Provider Locator", () => {
  it("should find providers near a postal code", () => {
    const providers = findProvidersNearPostalCode("M5G 2K4", 50); // Toronto postal code
    expect(providers.length).toBeGreaterThan(0);
    expect(providers[0].distance).toBeLessThanOrEqual(50);
  });

  it("should find providers by province", () => {
    const providers = findProvidersByProvince("ON");
    expect(providers.length).toBeGreaterThan(0);
    expect(providers.every(p => p.province === "ON")).toBe(true);
  });

  it("should find providers by city", () => {
    const providers = findProvidersByCity("Toronto", "ON");
    expect(providers.length).toBeGreaterThan(0);
    expect(providers.every(p => p.city === "Toronto")).toBe(true);
  });

  it("should get provider by ID", () => {
    const provider = getProviderById("rcmp-on-001");
    expect(provider).toBeDefined();
    expect(provider?.name).toBe("RCMP Toronto Fingerprint Bureau");
    expect(provider?.province).toBe("ON");
  });

  it("should return undefined for non-existent provider ID", () => {
    const provider = getProviderById("non-existent-id");
    expect(provider).toBeUndefined();
  });

  it("should get all provinces", () => {
    const provinces = getAllProvinces();
    expect(provinces.length).toBeGreaterThan(0);
    expect(provinces).toContain("ON");
    expect(provinces).toContain("BC");
    expect(provinces).toContain("AB");
  });

  it("should get provider statistics", () => {
    const stats = getProviderStatistics();
    expect(stats.totalProviders).toBeGreaterThan(0);
    expect(stats.byAccreditation.rcmp).toBeGreaterThan(0);
    expect(stats.byProvince.ON).toBeGreaterThan(0);
  });

  it("should sort providers by distance", () => {
    const providers = findProvidersNearPostalCode("M5G 2K4", 500);
    if (providers.length > 1) {
      for (let i = 0; i < providers.length - 1; i++) {
        expect((providers[i].distance || 0) <= (providers[i + 1].distance || 0)).toBe(true);
      }
    }
  });

  it("should filter by max distance", () => {
    const providersNear = findProvidersNearPostalCode("M5G 2K4", 20);
    const providersFar = findProvidersNearPostalCode("M5G 2K4", 500);

    expect(providersNear.length).toBeLessThanOrEqual(providersFar.length);
    expect(providersNear.every(p => (p.distance || 0) <= 20)).toBe(true);
  });

  it("should have required fields for all providers", () => {
    const providers = findProvidersByProvince("ON");
    expect(providers.every(p => p.id && p.name && p.address && p.city && p.province && p.phone)).toBe(true);
  });

  it("should have valid accreditation types", () => {
    const providers = findProvidersByProvince("ON");
    const validAccreditations = ["rcmp", "provincial", "private"];
    expect(providers.every(p => validAccreditations.includes(p.accreditation))).toBe(true);
  });
});
