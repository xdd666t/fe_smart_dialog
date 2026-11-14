import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@rspress/core';
import { pluginPlayground } from '@rspress/plugin-playground';
import { pluginTypeDoc } from '@rspress/plugin-typedoc';

const DOCS_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(DOCS_DIR, '..');
const CSS_ENTRY = path.resolve(ROOT_DIR, 'src/styles/smart-dialog.css');

function cleanGeneratedApiPlugin(relativeOutDirs: string[]) {
  return {
    name: 'fsd-clean-generated-api',
    async config(config: { root?: string }) {
      const baseRoot = config.root ?? DOCS_DIR;
      await Promise.all(
        relativeOutDirs.map((rel) =>
          fs.rm(path.join(baseRoot, rel), { recursive: true, force: true }),
        ),
      );
      return config;
    },
  };
}

function mirrorApiToLocalePlugin(sourceRel: string, targetRel: string) {
  return {
    name: 'fsd-mirror-api-locale',
    async config(config: { root?: string }) {
      const baseRoot = config.root ?? DOCS_DIR;
      const srcDir = path.join(baseRoot, sourceRel);
      const destDir = path.join(baseRoot, targetRel);
      const exists = await fs
        .access(srcDir)
        .then(() => true)
        .catch(() => false);
      if (exists) {
        await fs.cp(srcDir, destDir, { recursive: true });
      }
      return config;
    },
  };
}

function buildLocaleSidebar(prefix: '' | '/en') {
  const isEn = prefix === '/en';
  return {
    [`${prefix}/guide/`]: [
      {
        text: isEn ? 'Getting Started' : '快速上手',
        items: [
          {
            text: isEn ? 'Installation & Setup' : '安装与快速开始',
            link: `${prefix}/guide/getting-started`,
          },
          {
            text: isEn ? 'Vanilla TS / React / Vue' : 'Vanilla TS / React / Vue 集成',
            link: `${prefix}/guide/frameworks`,
          },
          {
            text: isEn ? 'Architecture & Layer Stack' : '架构与五层栈模型',
            link: `${prefix}/guide/concepts`,
          },
        ],
      },
      {
        text: isEn ? 'Advanced & Migration' : '进阶与迁移',
        items: [
          {
            text: isEn ? 'Lifecycle & History Binding' : '页面绑定与路由生命周期',
            link: `${prefix}/guide/lifecycle-routing`,
          },
          {
            text: isEn ? 'Theming & CSS Tokens' : '主题、暗黑模式与 CSS 变量',
            link: `${prefix}/guide/theming-styling`,
          },
          {
            text: isEn ? 'Migrate from Flutter' : '从 flutter_smart_dialog 迁移',
            link: `${prefix}/guide/migration-flutter`,
          },
        ],
      },
    ],
    [`${prefix}/features/`]: [
      {
        text: isEn ? 'Core Dialog Types' : '核心能力教程',
        items: [
          {
            text: isEn ? 'Custom Dialog & System Modal' : 'Custom 自定义弹窗与原生顶层',
            link: `${prefix}/features/custom-dialog`,
          },
          {
            text: isEn ? 'Attach & Spotlight Guide' : 'Attach 锚点定位与聚光灯引导',
            link: `${prefix}/features/attach-spotlight`,
          },
          {
            text: isEn ? 'Notify, Loading & Toast' : 'Notify 通知 / Loading 加载 / Toast 提示',
            link: `${prefix}/features/toast-loading-notify`,
          },
        ],
      },
      {
        text: isEn ? 'Guides & Reference' : '相关指南',
        items: [
          {
            text: isEn ? 'Architecture & Layer Stack' : '五层栈与 tag / keepSingle 机制',
            link: `${prefix}/guide/concepts`,
          },
          {
            text: isEn ? 'Lifecycle & History Binding' : '页面绑定与返回关闭控制',
            link: `${prefix}/guide/lifecycle-routing`,
          },
          {
            text: isEn ? 'Theming & CSS Tokens' : '主题定制与 CSS Token',
            link: `${prefix}/guide/theming-styling`,
          },
        ],
      },
    ],
  };
}

export default defineConfig({
  root: DOCS_DIR,
  outDir: path.resolve(DOCS_DIR, 'doc_build'),
  themeDir: path.resolve(DOCS_DIR, 'theme'),
  globalStyles: path.resolve(DOCS_DIR, 'styles/docs.css'),
  base: process.env.DOCS_BASE ?? '/',
  route: {
    extensions: ['.md', '.mdx'],
    exclude: ['rspress.config.ts', 'components/**', 'theme/**', 'styles/**', 'doc_build/**'],
  },
  title: 'fe-smart-dialog',
  description:
    'Zero-dependency frontend dialog solution (Custom, Attach, Notify, Loading, Toast) for Vanilla TS, React, and Vue 3.',
  lang: 'zh',
  locales: [
    {
      lang: 'zh',
      label: '简体中文',
      title: 'fe-smart-dialog',
      description: '零依赖全能前端弹窗库，完整复刻 flutter_smart_dialog 五层栈与锚点体系。',
    },
    {
      lang: 'en',
      label: 'English',
      title: 'fe-smart-dialog',
      description: 'Zero-dependency frontend dialog solution inspired by flutter_smart_dialog.',
    },
  ],
  themeConfig: {
    darkMode: true,
    enableScrollToTop: true,
    enableContentAnimation: false,
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/xdd666t/fe_smart_dialog',
      },
    ],
    footer: {
      message: 'MIT Licensed · Built with fe-smart-dialog & Rspress',
    },
    locales: [
      {
        lang: 'zh',
        label: '简体中文',
        nav: [
          { text: '快速开始', link: '/guide/getting-started', activeMatch: '/guide/' },
          { text: '核心功能', link: '/features/custom-dialog', activeMatch: '/features/' },
          { text: 'API 参考', link: '/api/', activeMatch: '/api/' },
          { text: 'Flutter 迁移', link: '/guide/migration-flutter' },
        ],
        sidebar: buildLocaleSidebar(''),
      },
      {
        lang: 'en',
        label: 'English',
        nav: [
          { text: 'Guide', link: '/en/guide/getting-started', activeMatch: '/en/guide/' },
          { text: 'Features', link: '/en/features/custom-dialog', activeMatch: '/en/features/' },
          { text: 'API Reference', link: '/en/api/', activeMatch: '/en/api/' },
          { text: 'Flutter Migration', link: '/en/guide/migration-flutter' },
        ],
        sidebar: buildLocaleSidebar('/en'),
      },
    ],
  },
  plugins: [
    cleanGeneratedApiPlugin(['zh/api', 'en/api']),
    pluginTypeDoc({
      entryPoints: [
        path.resolve(ROOT_DIR, 'src/index.ts'),
        path.resolve(ROOT_DIR, 'src/react/index.ts'),
        path.resolve(ROOT_DIR, 'src/vue/index.ts'),
      ],
      outDir: 'zh/api',
      setup(app) {
        app.options.setValue('tsconfig', path.resolve(ROOT_DIR, 'tsconfig.json'));
      },
    }),
    mirrorApiToLocalePlugin('zh/api', 'en/api'),
    pluginPlayground({
      defaultDirection: 'horizontal',
      editorPosition: 'left',
      include: [
        ['fe-smart-dialog', 'fe-smart-dialog'],
        ['fe-smart-dialog/react', 'fe-smart-dialog/react'],
      ],
    }),
  ],
  builderConfig: {
    performance: {
      buildCache: false,
    },
    resolve: {
      alias: {
        'fe-smart-dialog/react$': path.resolve(ROOT_DIR, 'src/react/index.ts'),
        'fe-smart-dialog/vue$': path.resolve(ROOT_DIR, 'src/vue/index.ts'),
        'fe-smart-dialog/style.css$': CSS_ENTRY,
        'fe-smart-dialog$': path.resolve(ROOT_DIR, 'src/index.ts'),
      },
    },
    tools: {
      rspack: (config, { rspack }) => {
        config.plugins ??= [];
        config.plugins.push(
          new rspack.NormalModuleReplacementPlugin(
            /^\.\/smart-dialog\.css$/,
            (resource) => {
              const issuer = resource.contextInfo?.issuer?.replace(/\\/g, '/') ?? '';
              if (issuer.includes('src/styles/inject')) {
                resource.request = `${CSS_ENTRY}?fsd-raw`;
              }
            },
          ),
        );
        config.module ??= {};
        config.module.rules ??= [];
        config.module.rules.unshift({
          test: /src[\\/]styles[\\/]smart-dialog\.css$/,
          resourceQuery: /fsd-raw/,
          type: 'asset/source',
        });
      },
    },
  },
});
