import { describe, expect, it, vi } from 'vitest';
import {
  Alignment,
  AttachAdjustParam,
  Offset,
  SmartAllDialogType,
  SmartAttachAlignmentType,
  SmartDialog,
  SmartStatus,
} from '../../src';

describe('Navigation (bindPage / observer) & Attach Dialogs', () => {
  it('hides bindPage dialog on route push and restores on pop; destroys on route remove', async () => {
    SmartDialog.observer.didPush('/home', null);

    void SmartDialog.show({
      tag: 'home-modal',
      bindPage: true,
      useAnimation: false,
      builder: () => {
        const el = document.createElement('div');
        el.id = 'home-modal-el';
        el.textContent = 'Home Only';
        return el;
      },
    });

    expect(
      (
        document.querySelector(
          '.fsd-overlay[data-fsd-layer="custom"]',
        ) as HTMLElement
      ).classList.contains('fsd-overlay--offstage'),
    ).toBe(false);

    // Push detail route -> dialog hidden (not destroyed)
    SmartDialog.observer.didPush('/detail', '/home');
    expect(SmartDialog.checkExist({ tag: 'home-modal' })).toBe(true);
    expect(
      (
        document.querySelector(
          '.fsd-overlay[data-fsd-layer="custom"]',
        ) as HTMLElement
      ).classList.contains('fsd-overlay--offstage'),
    ).toBe(true);

    // Show non-bindPage dialog on detail -> survives route change
    void SmartDialog.show({
      tag: 'global-modal',
      bindPage: false,
      useAnimation: false,
      builder: () => 'Global',
    });

    // Pop back to /home -> home-modal restored, detail dialog unaffected if bindPage:false
    SmartDialog.observer.didPop('/detail', '/home');
    const overlays = Array.from(
      document.querySelectorAll('.fsd-overlay[data-fsd-layer="custom"]'),
    ) as HTMLElement[];
    expect(overlays[0]!.classList.contains('fsd-overlay--offstage')).toBe(false);
    expect(SmartDialog.checkExist({ tag: 'global-modal' })).toBe(true);

    // Push another dialog on /sub, then pop /sub -> /sub bound dialog dismissed automatically
    SmartDialog.observer.didPush('/sub', '/home');
    void SmartDialog.show({
      tag: 'sub-modal',
      bindPage: true,
      useAnimation: false,
      builder: () => 'Sub Only',
    });
    expect(SmartDialog.checkExist({ tag: 'sub-modal' })).toBe(true);

    SmartDialog.observer.didPop('/sub', '/home');
    // Allow microtask/dismiss promise settlement
    await Promise.resolve();
    expect(SmartDialog.checkExist({ tag: 'sub-modal' })).toBe(false);

    await SmartDialog.dismiss({ status: SmartStatus.allCustom, force: true });
  });

  it('tracks History API pushState and replaceState automatically when initialized', async () => {
    SmartDialog.init({ autoTrackHistory: true });

    void SmartDialog.show({
      tag: 'root-bound',
      bindPage: true,
      useAnimation: false,
      builder: () => 'Root',
    });

    window.history.pushState({ page: 2 }, '', '/step-2');
    expect(
      (
        document.querySelector(
          '.fsd-overlay[data-fsd-layer="custom"]',
        ) as HTMLElement
      ).classList.contains('fsd-overlay--offstage'),
    ).toBe(true);

    void SmartDialog.show({
      tag: 'step2-bound',
      bindPage: true,
      useAnimation: false,
      builder: () => 'Step 2',
    });

    // replaceState off /step-2 removes step2-bound
    window.history.replaceState({ page: 3 }, '', '/step-3');
    await Promise.resolve();
    expect(SmartDialog.checkExist({ tag: 'step2-bound' })).toBe(false);
    expect(SmartDialog.checkExist({ tag: 'root-bound' })).toBe(true);

    await SmartDialog.dismiss({ status: SmartStatus.allCustom, force: true });
  });

  it('positions showAttach using targetElement, alignments, alignmentType, adjustBuilder, and replaceBuilder', async () => {
    const anchor = document.createElement('button');
    anchor.textContent = 'Anchor';
    vi.spyOn(anchor, 'getBoundingClientRect').mockReturnValue({
      left: 200,
      top: 150,
      width: 100,
      height: 40,
      right: 300,
      bottom: 190,
      x: 200,
      y: 150,
      toJSON: () => ({}),
    });
    document.body.appendChild(anchor);

    const adjustedBuilderSpy = vi.fn(
      ({ dismiss }: { dismiss: () => Promise<void> }) => {
        const el = document.createElement('div');
        el.id = 'adjusted-popover';
        el.textContent = 'Adjusted';
        el.onclick = () => void dismiss();
        return el;
      },
    );

    SmartDialog.config.attach.attachAlignmentType =
      SmartAttachAlignmentType.outside;

    void SmartDialog.showAttach({
      targetContext: anchor,
      alignment: Alignment.topCenter,
      useAnimation: false,
      builder: () => {
        const el = document.createElement('div');
        el.id = 'initial-popover';
        el.textContent = 'Initial';
        return el;
      },
      adjustBuilder: () =>
        new AttachAdjustParam({
          alignment: Alignment.bottomCenter,
          builder: adjustedBuilderSpy,
        }),
    });

    expect(
      SmartDialog.checkExist({ dialogTypes: [SmartAllDialogType.attach] }),
    ).toBe(true);
    expect(adjustedBuilderSpy).toHaveBeenCalledTimes(1);
    expect(document.getElementById('adjusted-popover')).not.toBeNull();
    expect(document.getElementById('initial-popover')).toBeNull();

    // Test targetBuilder fallback with no DOM element
    void SmartDialog.showAttach({
      targetBuilder: (offset, size) =>
        new Offset(offset.dx + 40 + size.width, offset.dy + 60),
      alignment: Alignment.bottomRight,
      useAnimation: false,
      builder: () => 'Coordinate Popover',
    });

    expect(document.body.textContent).toContain('Coordinate Popover');

    await SmartDialog.dismiss({ status: SmartStatus.allAttach });
    expect(
      SmartDialog.checkExist({ dialogTypes: [SmartAllDialogType.attach] }),
    ).toBe(false);
  });
});
