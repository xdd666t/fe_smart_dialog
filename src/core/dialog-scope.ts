import type { SmartBuilder, SmartContent, SmartDialogRenderContext } from '../types/params';
import type { SmartDialogController } from './smart-dialog-controller';

export interface DialogScopeListener {
  onUpdate: () => void;
}

/**
 * Manages mutable builder/content and controller binding for a single dialog instance.
 */
export class DialogScope {
  private _controller?: SmartDialogController;
  private _builder: SmartBuilder<SmartContent>;
  private _overrideContent?: SmartContent;
  private _listener: DialogScopeListener | null = null;
  private _context: SmartDialogRenderContext;

  constructor(options: {
    controller?: SmartDialogController;
    builder: SmartBuilder<SmartContent>;
    context: SmartDialogRenderContext;
  }) {
    this._controller = options.controller;
    this._builder = options.builder;
    this._context = options.context;
    this.bindController(options.controller);
  }

  get controller(): SmartDialogController | undefined {
    return this._controller;
  }

  get builder(): SmartBuilder<SmartContent> {
    return this._builder;
  }

  setController(controller?: SmartDialogController): void {
    if (this._controller && this._controller !== controller) {
      this._controller._dismiss();
    }
    this._controller = controller;
    this.bindController(controller);
  }

  setBuilder(builder: SmartBuilder<SmartContent>): void {
    this._builder = builder;
    this._overrideContent = undefined;
  }

  setOverrideContent(content?: SmartContent): void {
    this._overrideContent = content;
  }

  setContext(context: SmartDialogRenderContext): void {
    this._context = context;
  }

  setListener(listener: DialogScopeListener | null): void {
    this._listener = listener;
  }

  render(): SmartContent {
    if (this._overrideContent !== undefined) {
      return this._overrideContent;
    }
    return this._builder({
      ...this._context,
      controller: this._controller,
    });
  }

  refresh(): void {
    this._listener?.onUpdate();
  }

  dispose(): void {
    this._listener = null;
    this._controller?._dismiss();
  }

  private bindController(controller?: SmartDialogController): void {
    controller?._setListener(() => {
      this.refresh();
    });
  }
}
