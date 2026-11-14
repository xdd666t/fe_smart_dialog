import { describe, expect, it, vi } from 'vitest';
import { SmartBackType, SmartDialog } from '../../src';

function dispatchEscapeKey(): KeyboardEvent {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    bubbles: true,
    cancelable: true,
  });
  window.dispatchEvent(event);
  return event;
}

describe('Back Handling (Esc / History) & Native <dialog> System Mode', () => {
  it('closes dialog on Escape key and obeys SmartBackType & onBack', async () => {
    const firstOnDismiss = vi.fn();
    void SmartDialog.show({
      tag: 'normal-esc',
      backType: SmartBackType.normal,
      useAnimation: false,
      onDismiss: firstOnDismiss,
      builder: () => 'Normal Esc',
    });

    dispatchEscapeKey();
    await Promise.resolve();
    expect(firstOnDismiss).toHaveBeenCalledTimes(1);

    // SmartBackType.block blocks back dismissal
    const blockedOnDismiss = vi.fn();
    void SmartDialog.show({
      tag: 'blocked-esc',
      backType: SmartBackType.block,
      useAnimation: false,
      onDismiss: blockedOnDismiss,
      builder: () => 'Blocked Esc',
    });

    dispatchEscapeKey();
    await Promise.resolve();
    expect(blockedOnDismiss).not.toHaveBeenCalled();
    expect(SmartDialog.checkExist({ tag: 'blocked-esc' })).toBe(true);

    // SmartBackType.ignore ignores SmartDialog interception (leaves dialog open)
    await SmartDialog.dismiss({ tag: 'blocked-esc' });
    const ignoreOnDismiss = vi.fn();
    void SmartDialog.show({
      tag: 'ignore-esc',
      backType: SmartBackType.ignore,
      useAnimation: false,
      onDismiss: ignoreOnDismiss,
      builder: () => 'Ignore Esc',
    });
    dispatchEscapeKey();
    await Promise.resolve();
    expect(ignoreOnDismiss).not.toHaveBeenCalled();
    await SmartDialog.dismiss({ tag: 'ignore-esc' });

    // Custom onBack returning true consumes event and prevents dismiss
    let allowBack = false;
    void SmartDialog.show({
      tag: 'custom-onback',
      useAnimation: false,
      onBack: () => !allowBack,
      builder: () => 'Custom onBack',
    });

    dispatchEscapeKey();
    await Promise.resolve();
    expect(SmartDialog.checkExist({ tag: 'custom-onback' })).toBe(true);

    allowBack = true;
    dispatchEscapeKey();
    await Promise.resolve();
    expect(SmartDialog.checkExist({ tag: 'custom-onback' })).toBe(false);
  });

  it('blocks Esc dismissal while loading with backType: SmartBackType.block', async () => {
    SmartDialog.config.loading.leastLoadingTime = 0;

    void SmartDialog.show({
      tag: 'underlying-dialog',
      useAnimation: false,
      builder: () => 'Underlying',
    });
    void SmartDialog.showLoading({
      backType: SmartBackType.block,
      useAnimation: false,
      msg: 'Blocking Load',
    });

    dispatchEscapeKey();
    await Promise.resolve();

    expect(SmartDialog.config.loading.isExist).toBe(true);
    expect(SmartDialog.checkExist({ tag: 'underlying-dialog' })).toBe(true);

    await SmartDialog.dismiss({ status: undefined, force: true });
    await SmartDialog.dismiss({ force: true });
  });

  it('useSystem: true renders native <dialog> top-layer modal and rejects incompatible flags', async () => {
    await expect(
      SmartDialog.show({
        useSystem: true,
        permanent: true,
        builder: () => 'Invalid',
      }),
    ).rejects.toThrow(/useSystem/);

    await expect(
      SmartDialog.show({
        useSystem: true,
        tag: 'invalid-tag',
        builder: () => 'Invalid',
      }),
    ).rejects.toThrow(/useSystem/);

    await expect(
      SmartDialog.show({
        useSystem: true,
        keepSingle: true,
        builder: () => 'Invalid',
      }),
    ).rejects.toThrow(/useSystem/);

    const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    const closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close');

    const sysPromise = SmartDialog.show<string>({
      useSystem: true,
      useAnimation: false,
      ariaLabel: 'System Modal',
      builder: () => {
        const el = document.createElement('div');
        el.id = 'sys-content';
        el.textContent = 'Native Dialog';
        return el;
      },
    });

    const dialogEl = document.querySelector('dialog.fsd-native-dialog') as HTMLDialogElement;
    expect(dialogEl).not.toBeNull();
    expect(showModalSpy).toHaveBeenCalledTimes(1);
    expect(dialogEl.querySelector('#sys-content')).not.toBeNull();

    // Native <dialog> cancel event triggers dismiss
    dialogEl.dispatchEvent(new Event('cancel', { cancelable: true }));
    await sysPromise;
    expect(closeSpy).toHaveBeenCalled();
    expect(document.querySelector('dialog.fsd-native-dialog')).toBeNull();
  });
});
