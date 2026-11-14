import { describe, expect, it, vi } from 'vitest';
import {
  SmartAllDialogType,
  SmartAwaitOverType,
  SmartDialog,
  SmartDialogController,
  SmartStatus,
} from '../../src';

describe('Dialog Lifecycle & Queue State Machine', () => {
  it('shows and dismisses custom dialogs and propagates results', async () => {
    const onDismiss = vi.fn();

    const p = SmartDialog.show<{ ok: boolean }>({
      useAnimation: false,
      onDismiss,
      builder: ({ dismiss }) => {
        const btn = document.createElement('button');
        btn.id = 'confirm-btn';
        btn.textContent = 'Confirm';
        btn.onclick = () => void dismiss({ ok: true });
        return btn;
      },
    });

    expect(SmartDialog.checkExist()).toBe(true);
    expect(SmartDialog.config.custom.isExist).toBe(true);

    (document.getElementById('confirm-btn') as HTMLButtonElement).click();
    const res = await p;

    expect(res).toEqual({ ok: true });
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(SmartDialog.checkExist()).toBe(false);
    expect(SmartDialog.config.custom.isExist).toBe(false);
  });

  it('enforces FIFO for tagged dismiss and LIFO for untagged dismiss', async () => {
    const closed: string[] = [];

    const p1 = SmartDialog.show<string>({
      tag: 'dup',
      useAnimation: false,
      onDismiss: () => closed.push('first-dup'),
      builder: () => 'first-dup',
    });
    const p2 = SmartDialog.show<string>({
      tag: 'dup',
      useAnimation: false,
      onDismiss: () => closed.push('second-dup'),
      builder: () => 'second-dup',
    });
    const p3 = SmartDialog.show<string>({
      useAnimation: false,
      onDismiss: () => closed.push('top-untagged'),
      builder: () => 'top-untagged',
    });

    // Untagged single dismiss closes LIFO top dialog first
    await SmartDialog.dismiss({ result: 'r3' });
    expect(await p3).toBe('r3');
    expect(closed).toEqual(['top-untagged']);

    // Tagged single dismiss closes FIFO first matching tag
    await SmartDialog.dismiss({ tag: 'dup', result: 'r1' });
    expect(await p1).toBe('r1');
    expect(closed).toEqual(['top-untagged', 'first-dup']);

    // Remaining tagged dialog is dismissed last
    await SmartDialog.dismiss({ result: 'r2' });
    expect(await p2).toBe('r2');
    expect(closed).toEqual(['top-untagged', 'first-dup', 'second-dup']);
  });

  it('protects permanent dialogs against mask, allCustom, and allDialog unless tag or force', async () => {
    const permDismissed = vi.fn();
    const normalDismissed = vi.fn();

    void SmartDialog.show({
      tag: 'pinned',
      permanent: true,
      clickMaskDismiss: true,
      useAnimation: false,
      onDismiss: permDismissed,
      builder: () => 'Pinned Dialog',
    });

    const normalP = SmartDialog.show({
      useAnimation: false,
      onDismiss: normalDismissed,
      builder: () => 'Normal Dialog',
    });

    // Click mask on pinned doesn't dismiss it; dismiss({ status: allDialog }) stops at permanent
    await SmartDialog.dismiss({ status: SmartStatus.allDialog });
    await normalP;

    expect(normalDismissed).toHaveBeenCalledTimes(1);
    expect(permDismissed).not.toHaveBeenCalled();
    expect(SmartDialog.checkExist({ tag: 'pinned' })).toBe(true);

    // Mask click on permanent still blocked
    const mask = document.querySelector('.fsd-mask') as HTMLElement;
    mask.click();
    expect(permDismissed).not.toHaveBeenCalled();

    // Without force, even explicit tag does NOT dismiss permanent (matches Flutter)
    await SmartDialog.dismiss({ tag: 'pinned' });
    expect(permDismissed).not.toHaveBeenCalled();
    expect(SmartDialog.checkExist({ tag: 'pinned' })).toBe(true);

    // Force dismiss closes permanent
    await SmartDialog.dismiss({ tag: 'pinned', force: true });
    expect(permDismissed).toHaveBeenCalledTimes(1);
    expect(SmartDialog.checkExist()).toBe(false);
  });

  it('allCustom/allDialog preserves permanent dialog until force: true', async () => {
    const order: string[] = [];

    void SmartDialog.show({
      useAnimation: false,
      onDismiss: () => order.push('bottom'),
      builder: () => 'bottom',
    });
    void SmartDialog.show({
      tag: 'barrier',
      permanent: true,
      useAnimation: false,
      onDismiss: () => order.push('barrier'),
      builder: () => 'barrier',
    });
    void SmartDialog.show({
      useAnimation: false,
      onDismiss: () => order.push('top'),
      builder: () => 'top',
    });

    await SmartDialog.dismiss({ status: SmartStatus.allCustom });
    expect(order).toEqual(['top', 'bottom']);
    expect(SmartDialog.checkExist({ tag: 'barrier' })).toBe(true);

    await SmartDialog.dismiss({ status: SmartStatus.allCustom, force: true });
    expect(order).toEqual(['top', 'bottom', 'barrier']);
    expect(SmartDialog.checkExist({ tag: 'barrier' })).toBe(false);
  });

  it('keepSingle reuses dialog container, resolves all waiting promises, and invokes latest onDismiss only', async () => {
    const firstDismiss = vi.fn();
    const secondDismiss = vi.fn();

    const p1 = SmartDialog.show<string>({
      keepSingle: true,
      tag: 'single-card',
      useAnimation: false,
      onDismiss: firstDismiss,
      builder: () => {
        const el = document.createElement('div');
        el.id = 'single-content';
        el.textContent = 'Step 1';
        return el;
      },
    });

    const p2 = SmartDialog.show<string>({
      keepSingle: true,
      tag: 'single-card',
      useAnimation: false,
      onDismiss: secondDismiss,
      builder: () => {
        const el = document.createElement('div');
        el.id = 'single-content';
        el.textContent = 'Step 2';
        return el;
      },
    });

    expect(document.querySelectorAll('#single-content')).toHaveLength(1);
    expect(document.getElementById('single-content')?.textContent).toBe('Step 2');

    await SmartDialog.dismiss({ tag: 'single-card', result: 'done' });
    expect(await p1).toBe('done');
    expect(await p2).toBe('done');
    expect(firstDismiss).not.toHaveBeenCalled();
    expect(secondDismiss).toHaveBeenCalledTimes(1);
  });

  it('enforces debounce when enabled and supports SmartDialogController.refresh()', async () => {
    vi.useFakeTimers();
    SmartDialog.config.custom.debounceTime = 300;

    void SmartDialog.show({
      debounce: true,
      useAnimation: false,
      builder: () => 'one',
    });
    const skipped = await SmartDialog.show({
      debounce: true,
      useAnimation: false,
      builder: () => 'two',
    });

    expect(skipped).toBeUndefined();
    expect(document.querySelectorAll('.fsd-overlay')).toHaveLength(1);

    vi.advanceTimersByTime(350);
    await SmartDialog.dismiss({ status: SmartStatus.allCustom, force: true });

    let count = 1;
    const controller = new SmartDialogController();
    void SmartDialog.show({
      controller,
      useAnimation: false,
      builder: () => {
        const el = document.createElement('span');
        el.id = 'counter-node';
        el.textContent = `Count:${count}`;
        return el;
      },
    });

    expect(document.getElementById('counter-node')?.textContent).toBe('Count:1');
    count = 2;
    controller.refresh();
    expect(document.getElementById('counter-node')?.textContent).toBe('Count:2');
    await SmartDialog.dismiss();
  });

  it('supports awaitOverType.none and awaitOverType.dialogAppear', async () => {
    vi.useFakeTimers();

    SmartDialog.config.custom.awaitOverType = SmartAwaitOverType.none;
    let noneResolved = false;
    void SmartDialog.show({
      useAnimation: false,
      builder: () => 'none-await',
    }).then(() => {
      noneResolved = true;
    });

    await vi.advanceTimersByTimeAsync(15);
    expect(noneResolved).toBe(true);
    expect(SmartDialog.checkExist({ dialogTypes: [SmartAllDialogType.custom] })).toBe(true);
    await SmartDialog.dismiss();

    SmartDialog.config.custom.awaitOverType = SmartAwaitOverType.dialogAppear;
    let appearResolved = false;
    void SmartDialog.show({
      animationTime: 200,
      useAnimation: true,
      builder: () => 'appear-await',
    }).then(() => {
      appearResolved = true;
    });

    await vi.advanceTimersByTimeAsync(100);
    expect(appearResolved).toBe(false);
    await vi.advanceTimersByTimeAsync(120);
    expect(appearResolved).toBe(true);

    const dismissPromise = SmartDialog.dismiss({ force: true });
    await vi.advanceTimersByTimeAsync(250);
    await dismissPromise;
  });

  it('respects displayTime auto-dismissal', async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();

    void SmartDialog.show({
      displayTime: 500,
      useAnimation: false,
      onDismiss,
      builder: () => 'Auto Dismiss',
    });

    expect(SmartDialog.checkExist()).toBe(true);
    await vi.advanceTimersByTimeAsync(499);
    expect(SmartDialog.checkExist()).toBe(true);

    await vi.advanceTimersByTimeAsync(5);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(SmartDialog.checkExist()).toBe(false);
  });
});
