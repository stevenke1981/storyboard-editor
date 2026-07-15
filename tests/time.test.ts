import { describe, expect, it } from "vitest";
import { buildShotTimeRanges, formatDuration, projectDuration } from "../src/utils/time";
import { demoProject } from "../src/data/demoProject";

describe("time helpers", () => {
  it("formats duration", () => {
    expect(formatDuration(65_432, true)).toBe("01:05.432");
  });

  it("builds contiguous shot ranges", () => {
    const ranges = buildShotTimeRanges(demoProject.shots);
    expect(ranges[0].startMs).toBe(0);
    expect(ranges[1].startMs).toBe(ranges[0].endMs);
  });

  it("sums enabled shots", () => {
    expect(projectDuration(demoProject)).toBe(16_000);
  });
});
