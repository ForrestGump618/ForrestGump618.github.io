import { describe, expect, it } from "bun:test";
import { resolveHeaderCovers } from "./headerCover";

describe("headerCover", () => {
  it("shourld return coverUrls when provided", async () => {
    const options = {
      coverUrls: ["cover1.jpg", "cover2.jpg"],
      fallbackCovers: ["fallback1.jpg", "fallback2.jpg"],
    };
    const result = await resolveHeaderCovers(options);
    expect(result).toEqual(["cover1.jpg", "cover2.jpg"]);
  });

  it("should trim and filter out invalid coverUrls", async () => {
    const options = {
      coverUrls: ["  cover1.jpg  ", "", "   ", "cover2.jpg"],
      fallbackCovers: ["fallback1.jpg", "fallback2.jpg"],
    };
    const result = await resolveHeaderCovers(options);
    expect(result).toEqual(["cover1.jpg", "cover2.jpg"]);
  });

  it("should return covers from config when coverUrls is empty", async () => {
    const options = {
      coverUrls: [],
      fallbackCovers: ["fallback1.jpg", "fallback2.jpg"],
    };
    const result = await resolveHeaderCovers(options);
    expect(result).toEqual([
      "https://example.com/cover1.jpg",
      "https://example.com/cover2.jpg",
      "https://example.com/cover3.jpg",
    ]);
  });
});
