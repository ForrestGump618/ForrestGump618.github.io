import { describe, expect, it } from "bun:test";
import { defineCovers } from "./coversConfig";

describe("defineCovers", () => {
  it("should remove empty and null URLs", () => {
    const urls = [
      "https://example.com/image1.jpg",
      "  ", // empty after trim
      null, // null value
      "https://example.com/image2.jpg",
      undefined, // undefined value
    ];
    const expected = ["https://example.com/image1.jpg", "https://example.com/image2.jpg"];
    // eslint-disable-next-line no-unsafe-type-assertion
    const result = defineCovers(urls as unknown as string[]);
    expect(result.urls).toEqual(expected);
  });
  it("should trim URLs and remove duplicates", () => {
    const urls = [
      " https://example.com/image1.jpg ",
      "https://example.com/image2.jpg",
      "https://example.com/image1.jpg", // duplicate
      "   ", // empty after trim
      null, // null value
      undefined, // undefined value
    ];
    const expected = ["https://example.com/image1.jpg", "https://example.com/image2.jpg"];
    // eslint-disable-next-line no-unsafe-type-assertion
    const result = defineCovers(urls as unknown as string[]);
    expect(result.urls).toEqual(expected);
  });
});
