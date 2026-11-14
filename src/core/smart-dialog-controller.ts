/**
 * Controller passed to `SmartDialog.show*` to programmatically refresh dialog contents.
 */
export class SmartDialogController {
  private _callback: (() => void) | null = null;

  /**
   * Re-evaluates the dialog builder / refreshes the rendered UI in place.
   */
  refresh(): void {
    this._callback?.();
  }

  /** @internal */
  _setListener(callback: (() => void) | null): void {
    this._callback = callback;
  }

  /** @internal */
  _dismiss(): void {
    this._callback = null;
  }
}
