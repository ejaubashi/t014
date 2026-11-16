import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const visit = async (page) => {
  await page.addInitScript(() => sessionStorage.setItem("visited", "1"));
  await page.goto("./");
};
const instant = (page) =>
  page.evaluate(() => (document.documentElement.style.scrollBehavior = "auto"));

test("Endi branding, real contact and three transparent design studies", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await visit(page);
  await expect(
    page.getByRole("heading", { name: "ENDI JAUBASHI", level: 1 }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Endi Jaubashi — Creative Web Designer");
  await expect(page.locator(".project")).toHaveCount(3);
  await expect(page.locator("body")).not.toContainText(
    /Surya|Bali|AWWWARDS|OBYS/,
  );
  await expect(page.locator(".contact-mail")).toHaveAttribute(
    "href",
    "mailto:jaubashi@gmail.com",
  );
  await expect(page.locator(".section-heading")).toContainText(
    "not commissioned client work",
  );
  expect(errors).toEqual([]);
});
test("first intro is short, skippable and replay remains available", async ({
  page,
}) => {
  await page.goto("./");
  const skip = page.getByRole("button", { name: "Skip intro" });
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(page.locator(".intro")).toHaveCount(0);
  await expect(page.locator("#main")).toBeFocused();
  await page.getByRole("button", { name: "Replay intro" }).click();
  await expect(skip).toBeVisible();
  await skip.click();
  await expect(page.locator(".intro")).toHaveCount(0);
});
test("default intro finishes without waiting for the full cinematic replay", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".intro")).toHaveCount(0, { timeout: 3500 });
  await expect(page.locator(".hero-portrait")).toBeVisible();
});
test("keyboard preview, case heading, focus handoff and browser-back restoration", async ({
  page,
}) => {
  await visit(page);
  await instant(page);
  const project = page.locator("#project-field-notes");
  await project.scrollIntoViewIfNeeded();
  await project.focus();
  await expect(page.locator(".hover-preview")).toHaveClass(/visible/);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/work\/field-notes\/$/);
  await expect(
    page.getByRole("heading", { name: "Field Notes", level: 1 }),
  ).toBeVisible();
  await expect(page.locator("#main")).toBeFocused();
  await page.goBack();
  await expect(project).toBeFocused();
  await expect(project).toBeInViewport();
});
test("return link targets the selected row and next case study has its own content", async ({
  page,
}) => {
  await visit(page);
  await page.locator("#project-common-ground").click();
  await expect(
    page.getByRole("heading", { name: "Common Ground", exact: true }),
  ).toBeVisible();
  await page.locator(".next-project").click();
  await expect(
    page.getByRole("heading", { name: "Matter in Motion", exact: true }),
  ).toBeVisible();
  await page.locator(".back-link").click();
  await expect(page.locator("#project-matter-in-motion")).toBeFocused();
  await expect(page.locator("#project-matter-in-motion")).toBeInViewport();
});
test("Ctrl-click preserves native new-tab navigation", async ({
  page,
  context,
}) => {
  await visit(page);
  const opened = context.waitForEvent("page");
  await page.locator("#project-field-notes").click({ modifiers: ["Control"] });
  const tab = await opened;
  await tab.waitForLoadState();
  await expect(tab).toHaveURL(/work\/field-notes\/$/);
  await expect(page).toHaveURL(/t014\/$/);
  await tab.close();
});
for (const width of [320, 390, 768, 1440])
  test(`responsive layout and usable project access at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await visit(page);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
    const sizes = await page
      .locator(".masthead nav a")
      .evaluateAll((nodes) =>
        nodes.map((e) => e.getBoundingClientRect().height),
      );
    expect(sizes.every((h) => h >= 44)).toBeTruthy();
    if (width <= 700) {
      const image = page.locator(".project-thumbnail").first();
      await image.scrollIntoViewIfNeeded();
      await expect(image).toBeVisible();
      await expect
        .poll(() => image.locator("img").evaluate((i) => i.naturalWidth))
        .toBeGreaterThan(0);
    }
    await page.locator("#project-common-ground").click();
    await expect(
      page.getByRole("heading", { name: "Common Ground", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  });
test("system reduced-motion preference can change both ways without hiding the heading", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  await expect(page.locator(".intro")).toHaveCount(0);
  for (const value of ["no-preference", "reduce", "no-preference"]) {
    await page.emulateMedia({ reducedMotion: value });
    await expect(page.locator("body")).toHaveClass(/motion-ready/);
    await expect
      .poll(() =>
        page
          .locator(".hero-title span")
          .first()
          .evaluate((e) => getComputedStyle(e).transform),
      )
      .toBe("none");
    expect(await page.locator(".portrait-flight").count()).toBeLessThanOrEqual(
      1,
    );
  }
});
test("visitor motion control persists across a reload", async ({ page }) => {
  await visit(page);
  await page
    .getByRole("button", { name: "Reduce motion", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Enable motion", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Enable motion", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".portrait-flight")).toHaveCount(0);
});
test("portrait expands and decorative surface is removed on route changes", async ({
  page,
}) => {
  await visit(page);
  await instant(page);
  await page.evaluate(() => scrollTo(0, 150));
  await page.waitForTimeout(150);
  const small = await page.locator(".portrait-flight").boundingBox();
  await page.evaluate(() => scrollTo(0, 700));
  await page.waitForTimeout(150);
  const large = await page.locator(".portrait-flight").boundingBox();
  expect(large.width).toBeGreaterThan(small.width * 2);
  await page.locator("#project-field-notes").click();
  await expect(page.locator(".portrait-flight")).toHaveCount(0);
});
test("WebGL unavailable retains the SVG footer and contact links", async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("visited", "1");
    const get = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (type === "webgl") return null;
      return get.call(this, type, ...args);
    };
  });
  await page.goto("./");
  await page.locator(".footer-mark").scrollIntoViewIfNeeded();
  await expect(page.locator(".footer-mark")).toBeVisible();
  await expect(page.locator(".liquid-footer")).toHaveCount(0);
  await expect(page.locator(".contact-mail")).toHaveAttribute(
    "href",
    "mailto:jaubashi@gmail.com",
  );
});
test("liquid footer settles, restarts on movement, and falls back after context loss", async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("visited", "1");
    window.gpuDraws = 0;
    const draw = WebGLRenderingContext.prototype.drawArrays;
    WebGLRenderingContext.prototype.drawArrays = function (...a) {
      window.gpuDraws++;
      return draw.apply(this, a);
    };
  });
  await page.goto("./");
  await page.locator(".footer-mark").scrollIntoViewIfNeeded();
  const canvas = page.locator(".liquid-footer");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  await page.mouse.move(200, 600);
  await page.waitForTimeout(1400);
  let count = await page.evaluate(() => window.gpuDraws);
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.gpuDraws)).toBe(count);
  await page.mouse.move(700, 500, { steps: 5 });
  await expect
    .poll(() => page.evaluate(() => window.gpuDraws))
    .toBeGreaterThan(count);
  await canvas.evaluate((c) =>
    c.getContext("webgl").getExtension("WEBGL_lose_context").loseContext(),
  );
  await expect(page.locator("footer")).not.toHaveClass(/liquid-active/);
  await expect(page.locator(".footer-mark")).toBeVisible();
});
test("stationary project preview stops issuing drawImage calls", async ({
  page,
}) => {
  await page.addInitScript(() => {
    sessionStorage.setItem("visited", "1");
    window.previewDraws = 0;
    const draw = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = function (...a) {
      if (this.canvas.classList.contains("preview-surface"))
        window.previewDraws++;
      return draw.apply(this, a);
    };
  });
  await page.goto("./");
  await page.locator("#project-field-notes").hover();
  await page.waitForTimeout(1300);
  const before = await page.evaluate(() => window.previewDraws);
  expect(before).toBeGreaterThan(0);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.previewDraws)).toBe(before);
});
test("prerendered pages and distinct metadata work without JavaScript", async ({
  browser,
  request,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  for (const [path, title] of [
    ["", "ENDI JAUBASHI"],
    ["work/field-notes/", "Field Notes"],
    ["work/common-ground/", "Common Ground"],
    ["work/matter-in-motion/", "Matter in Motion"],
    ["credits/", "Artwork & credits"],
  ]) {
    const response = await page.goto("http://127.0.0.1:3021/t014/" + path);
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "https://ejaubashi.github.io/t014/" + path,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /share\.png$/,
    );
  }
  const missing = await request.get("missing-page/");
  expect(missing.status()).toBe(404);
  expect(await missing.text()).toContain("A wrong turn.");
  const favicon = await request.get("favicon.svg");
  expect(favicon.status()).toBe(200);
  expect((await request.get("sitemap.xml")).status()).toBe(200);
  await context.close();
});
test("artwork originals, credits and licence files are available", async ({
  page,
  request,
}) => {
  await page.goto("credits/");
  await expect(
    page.getByRole("heading", { name: "Artwork & credits" }),
  ).toBeVisible();
  await expect(page.locator("body")).toContainText("Anders Hoff");
  for (const path of [
    "art/originals/sand-spline-02.png",
    "art/licenses/sand-spline-MIT.txt",
  ])
    expect((await request.get(path)).status()).toBe(200);
  await expect(page.locator("body")).toContainText(
    "800px piece is not described as high-resolution",
  );
});
test("home and case study pass automated axe checks with manual contrast review separated", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.goto("work/field-notes/");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
});

test("failed artwork requests leave usable content and complete shader samplers", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => sessionStorage.setItem("visited", "1"));
  await page.route("**/art/optimized/**", (route) => route.abort());
  await page.goto("./");
  await expect(
    page.getByRole("heading", { name: "ENDI JAUBASHI", level: 1 }),
  ).toBeVisible();
  await page.locator(".footer-mark").scrollIntoViewIfNeeded();
  const canvas = page.locator(".liquid-footer");
  await expect(canvas).toHaveAttribute("data-ready", "true");
  expect(await canvas.evaluate((c) => c.getContext("webgl").getError())).toBe(
    0,
  );
  await expect(page.locator(".contact-mail")).toHaveAttribute(
    "href",
    "mailto:jaubashi@gmail.com",
  );
  expect(errors).toEqual([]);
});
