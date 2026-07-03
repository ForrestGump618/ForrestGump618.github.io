/**
 * satteri 插件 PoC 测试脚本
 *
 * 验证 3 个自定义 satteri 插件在两条管线中的行为：
 * 1. mdxToJs（.mdx 管线）— 期望 mdxJsxFlowElement/mdxJsxTextElement 被正确编译为 JSX
 * 2. markdownToHtml（.md 管线）— 验证 mdxJsx 节点是否被丢弃/报错/保留
 *
 * 运行：bun run scripts/satteri-poc-test.mjs
 */

import { mdxToJs, markdownToHtml, defineMdastPlugin } from "satteri";

import spoiler from "../src/satteri-plugins/spoiler.mjs";
import noteDirective from "../src/satteri-plugins/note-directive.mjs";
import spanDirective from "../src/satteri-plugins/span-directive.mjs";

const SEP = "=".repeat(70);

function banner(title) {
  console.log(`\n${SEP}\n${title}\n${SEP}`);
}

// ============================================================
// 测试 1：note-directive 在 mdxToJs 管线
// ============================================================
banner("测试 1: note-directive (mdxToJs) — :::info 容器指令 → <Note>");

try {
  const result = mdxToJs(":::info\n这是一条提示\n:::", {
    features: { directive: true },
    mdastPlugins: [noteDirective()],
  });
  console.log("✅ mdxToJs 成功");
  console.log("输出代码片段（前 500 字符）:");
  console.log(result.code.slice(0, 500));
  console.log("\n...是否包含 Note 组件:", result.code.includes("Note"));
  console.log(
    '是否包含 type="info":',
    result.code.includes('"info"') || result.code.includes("'info'"),
  );
} catch (e) {
  console.log("❌ mdxToJs 失败:", e.message);
}

// ============================================================
// 测试 2：span-directive 在 mdxToJs 管线
// ============================================================
banner("测试 2: span-directive (mdxToJs) — :span[文本]{.red} → <span>");

try {
  const result = mdxToJs("这是 :span[红色文字]{.text .red} 的效果", {
    features: { directive: true },
    mdastPlugins: [spanDirective()],
  });
  console.log("✅ mdxToJs 成功");
  console.log("输出代码片段（前 500 字符）:");
  console.log(result.code.slice(0, 500));
  console.log("\n...是否包含 <span>:", result.code.includes("span"));
  console.log(
    "是否包含 class:",
    result.code.includes("class") || result.code.includes("className"),
  );
} catch (e) {
  console.log("❌ mdxToJs 失败:", e.message);
}

// ============================================================
// 测试 3：spoiler 在 mdxToJs 管线
// ============================================================
banner("测试 3: spoiler (mdxToJs) — !!隐藏!! → <Spoiler>");

try {
  const result = mdxToJs("这是一段文字，接着是行内语法：!!隐藏内容!!。", {
    mdastPlugins: [spoiler({ title: "..." })],
  });
  console.log("✅ mdxToJs 成功");
  console.log("输出代码片段（前 500 字符）:");
  console.log(result.code.slice(0, 500));
  console.log("\n...是否包含 Spoiler:", result.code.includes("Spoiler"));
} catch (e) {
  console.log("❌ mdxToJs 失败:", e.message);
}

// ============================================================
// 测试 4：spoiler 在 markdownToHtml 管线（.md 文件场景，关键风险点）
// ============================================================
banner("测试 4: spoiler (markdownToHtml) — .md 文件中的 !!隐藏!! 语法");

try {
  const result = markdownToHtml("这是一段文字，接着是行内语法：!!隐藏内容!!。", {
    mdastPlugins: [spoiler({ title: "..." })],
  });
  console.log("✅ markdownToHtml 成功");
  console.log("HTML 输出:", result.html);
  console.log("\n...是否包含 Spoiler:", result.html.includes("Spoiler"));
  console.log("是否包含 <details>:", result.html.includes("<details>"));
  console.log(
    "!!隐藏内容!! 是否被保留:",
    result.html.includes("!!") || result.html.includes("隐藏内容"),
  );
} catch (e) {
  console.log("❌ markdownToHtml 失败:", e.message);
  console.log("(这证实了 .md 管线不支持 mdxJsxTextElement 注入)");
}

// ============================================================
// 测试 5：note-directive 在 markdownToHtml 管线
// ============================================================
banner("测试 5: note-directive (markdownToHtml) — .md 文件中的 :::info");

try {
  const result = markdownToHtml(":::info\n这是一条提示\n:::", {
    features: { directive: true },
    mdastPlugins: [noteDirective()],
  });
  console.log("✅ markdownToHtml 成功");
  console.log("HTML 输出:", result.html);
  console.log("\n...是否包含 Note:", result.html.includes("Note"));
} catch (e) {
  console.log("❌ markdownToHtml 失败:", e.message);
}

// ============================================================
// 测试 6：spoiler 用 rawHtml 回退方案（.md 管线替代方案）
// ============================================================
banner("测试 6: spoiler rawHtml 回退方案 (markdownToHtml) — 用 { rawHtml } 替代 JSX");

const spoilerRawHtml = defineMdastPlugin({
  name: "spoiler-rawhtml",
  text(node, ctx) {
    const value = node.value;
    if (typeof value !== "string" || !value.includes("!!")) return;

    // 简化版：只处理第一对 !!...!!
    const open = value.indexOf("!!");
    if (open === -1) return;
    if (open > 0 && value[open - 1] === "\\") return;

    const close = value.indexOf("!!", open + 2);
    if (close === -1) return;

    const before = value.slice(0, open);
    const content = value.slice(open + 2, close);
    const after = value.slice(close + 2);

    // 用 rawHtml 返回完整 HTML 片段
    const html = `${before}<details class="spoiler"><summary>...</summary>${content}</details>${after}`;
    ctx.replaceNode(node, { rawHtml: html });
  },
});

try {
  const result = markdownToHtml("这是一段文字，接着是行内语法：!!隐藏内容!!。", {
    mdastPlugins: [spoilerRawHtml],
  });
  console.log("✅ rawHtml 回退方案成功");
  console.log("HTML 输出:", result.html);
  console.log("\n...是否包含 <details>:", result.html.includes("<details>"));
  console.log("是否包含 隐藏内容:", result.html.includes("隐藏内容"));
} catch (e) {
  console.log("❌ rawHtml 回退方案失败:", e.message);
}

// ============================================================
// 测试 7：directive feature 开关验证
// ============================================================
banner("测试 7: directive feature 验证 — 不开启 directive 时 :::info 的行为");

try {
  const result = markdownToHtml(":::info\n这是一条提示\n:::", {
    features: { directive: false },
    mdastPlugins: [noteDirective()],
  });
  console.log("HTML 输出:", result.html);
  console.log("(directive 关闭时，:::info 不被解析为 directive 节点)");
} catch (e) {
  console.log("结果:", e.message);
}

console.log(`\n${SEP}\n测试完成\n${SEP}`);
