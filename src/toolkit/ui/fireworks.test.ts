import { describe, expect, test } from "bun:test";
import { FIREWORK_HUES, spawnBurst, stepParticle } from "./fireworks";

describe("spawnBurst", () => {
  test("生成指定数量粒子且全部落在点击点", () => {
    const particles = spawnBurst(120, 80, () => 0.5, 20);
    expect(particles).toHaveLength(20);
    for (const p of particles) {
      expect(p.x).toBe(120);
      expect(p.y).toBe(80);
      expect(p.life).toBeGreaterThan(0);
      expect(FIREWORK_HUES).toContain(p.hue);
    }
  });

  test("速度方向覆盖四周（随机源取极值时角度不同）", () => {
    const angles = [0, 0.25, 0.5, 0.75].map((r) => spawnBurst(0, 0, () => r, 1)[0]);
    const signs = new Set(angles.map((p) => `${Math.sign(p.vx)},${Math.sign(p.vy)}`));
    expect(signs.size).toBeGreaterThan(1);
  });
});

describe("stepParticle", () => {
  test("重力使垂直速度随时间增加", () => {
    const p = spawnBurst(0, 0, () => 0.5, 1)[0];
    p.vx = 0;
    p.vy = 0;
    stepParticle(p, 0.1);
    expect(p.vy).toBeGreaterThan(0);
    expect(p.y).toBeGreaterThan(0);
  });

  test("寿命耗尽后返回 false", () => {
    const p = spawnBurst(0, 0, () => 0.5, 1)[0];
    expect(stepParticle(p, p.ttl + 0.01)).toBe(false);
  });

  test("存活粒子寿命递减且位移有限", () => {
    const p = spawnBurst(10, 10, () => 0.5, 1)[0];
    const alive = stepParticle(p, 0.016);
    expect(alive).toBe(true);
    expect(p.life).toBeLessThan(p.ttl);
    expect(Math.abs(p.x - 10)).toBeLessThan(20);
  });
});
