export type DemoCategoryId =
  | 'dialog'
  | 'attach'
  | 'notify'
  | 'loading'
  | 'toast'
  | 'other';

export interface DemoContext {
  log: (message: string) => void;
}

export interface DemoFrameworkSnippets {
  vanilla?: string;
  react?: string;
  vue?: string;
}

export interface DemoParamDoc {
  name: string;
  type: string;
  defaultVal?: string;
  description: string;
}

export interface DemoEntry {
  id: string;
  className: string;
  category: DemoCategoryId;
  route: string;
  label: string;
  badge?: string;
  description: string;
  summaryPoints?: string[];
  keyParams?: DemoParamDoc[];
  docPath?: string;
  code: string;
  frameworkSnippets?: DemoFrameworkSnippets;
  tags?: string[];
  mount: (stage: HTMLElement, ctx: DemoContext) => (() => void) | void;
}

export interface DemoCategoryMeta {
  id: DemoCategoryId;
  label: string;
}
