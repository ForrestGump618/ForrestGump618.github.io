import { parse, resolve } from "node:path";
import {
  defineMdastPlugin,
  type MdastPluginDefinition,
  type MdastVisitorContext,
  type MdastNode,
} from "satteri";

/**
 * auto-import（satteri 版）：
 * 等价于 astro-auto-import，但通过 satteri mdast 插件 API 注入 mdxjsEsm 导入节点
 *
 * 原理：在 MDAST 树的根级别插入 mdxjsEsm 节点（带 value 字段，satteri 会将其作为
 * ESM import 语句编译），satteri 的 mdxToJs 编译器会将其编译为 JS import 语句。
 *
 * 关键发现：satteri 的 mdxjsEsm 节点只需 value 字段（import 语句字符串），
 * 不需要 data.estree（与 remark/unified 不同）。
 *
 * 限制：satteri 没有 root visitor，因此通过访问第一个块级节点（paragraph/heading等）
 * 获取 parent（root），再用 insertChildAt 在索引 0 处插入导入节点。
 */

type NamedImport = string | [from: string, as: string];
type ImportsConfigItem = string | Record<string, string[] | string>;
type ImportsConfig = ImportsConfigItem[];

const resolveModulePath = (path: string): string => {
  if (path.startsWith(".")) return resolve(path);
  return path;
};

function getDefaultImportName(path: string): string {
  return parse(path).name.replaceAll(/[^\w\d]/g, "");
}

function formatImport(imported: string, module: string): string {
  return `import ${imported} from ${JSON.stringify(module)};`;
}

function formatNamedImports(namedImport: NamedImport[]): string {
  const imports: string[] = [];
  for (const imp of namedImport) {
    if (typeof imp === "string") {
      imports.push(imp);
    } else {
      const [from, as] = imp;
      imports.push(`${from} as ${as}`);
    }
  }
  return `{ ${imports.join(", ")} }`;
}

function processImportsConfig(config: ImportsConfig): string[] {
  const imports: string[] = [];
  for (const option of config) {
    if (typeof option === "string") {
      imports.push(formatImport(getDefaultImportName(option), resolveModulePath(option)));
    } else {
      for (const path in option) {
        const namedImportsOrNamespace = option[path];
        if (typeof namedImportsOrNamespace === "string") {
          imports.push(formatImport(`* as ${namedImportsOrNamespace}`, resolveModulePath(path)));
        } else {
          const importString = formatNamedImports(namedImportsOrNamespace);
          imports.push(formatImport(importString, resolveModulePath(path)));
        }
      }
    }
  }
  return imports;
}

function generateImportsNode(config: ImportsConfig) {
  const imports = processImportsConfig(config);
  const value = imports.join("\n");
  // satteri 的 mdxjsEsm 节点只需 value 字段（import 语句字符串）
  return {
    type: "mdxjsEsm" as const,
    value,
  };
}

export interface SatteriAutoImportOptions {
  /** 仅对 .mdx 文件注入（默认 true，.md 文件不编译 JSX） */
  mdxOnly?: boolean;
}

/**
 * 创建 satteri auto-import 插件
 * @param importsConfig - 与 astro-auto-import 相同的 imports 配置
 * @param options - 选项
 */
export default function satteriAutoImport(
  importsConfig: ImportsConfig,
  options: SatteriAutoImportOptions = {},
): () => MdastPluginDefinition {
  const mdxOnly = options.mdxOnly ?? true;
  // 预生成 importsNode（import 语句字符串只拼接一次）
  const importsNode = generateImportsNode(importsConfig);

  // 返回工厂函数：satteri 每次编译调用一次，确保 injected 状态按文档隔离
  return () => {
    let injected = false;

    function tryInject(node: Readonly<MdastNode>, ctx: MdastVisitorContext): void {
      if (injected) return;
      // 仅对 .mdx 文件注入（.md 文件不编译 JSX）
      if (mdxOnly) {
        const url = ctx.fileURL;
        if (url && !url.pathname.endsWith(".mdx")) return;
      }
      injected = true;
      const parent = ctx.parent(node);
      if (parent) {
        ctx.insertChildAt(parent, 0, importsNode);
      }
    }

    return defineMdastPlugin({
      name: "auto-import",
      // 订阅多种块级节点类型，确保能捕获文档第一个节点
      paragraph(node, ctx) {
        tryInject(node, ctx);
      },
      heading(node, ctx) {
        tryInject(node, ctx);
      },
      code(node, ctx) {
        tryInject(node, ctx);
      },
      blockquote(node, ctx) {
        tryInject(node, ctx);
      },
      list(node, ctx) {
        tryInject(node, ctx);
      },
      thematicBreak(node, ctx) {
        tryInject(node, ctx);
      },
      html(node, ctx) {
        tryInject(node, ctx);
      },
      table(node, ctx) {
        tryInject(node, ctx);
      },
      containerDirective(node, ctx) {
        tryInject(node, ctx);
      },
      math(node, ctx) {
        tryInject(node, ctx);
      },
    });
  };
}
