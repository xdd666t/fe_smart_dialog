import { NotifyType } from '../config/enums';
import { SmartNotifyStyle } from '../types/params';

const SVG_NS = 'http://www.w3.org/2000/svg';

function createSvgIcon(paths: string[], className: string): SVGSVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('class', className);

  for (const d of paths) {
    const path = document.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }
  return svg;
}

export function createDefaultToastWidget(msg: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'fsd-toast';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.textContent = msg;
  return el;
}

export function createDefaultLoadingWidget(msg: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'fsd-loading';
  wrapper.setAttribute('role', 'status');
  wrapper.setAttribute('aria-live', 'polite');

  const spinner = document.createElementNS(SVG_NS, 'svg');
  spinner.setAttribute('viewBox', '0 0 24 24');
  spinner.setAttribute('fill', 'none');
  spinner.setAttribute('aria-hidden', 'true');
  spinner.setAttribute('class', 'fsd-loading-spinner');

  const track = document.createElementNS(SVG_NS, 'circle');
  track.setAttribute('cx', '12');
  track.setAttribute('cy', '12');
  track.setAttribute('r', '9.5');
  track.setAttribute('stroke', 'currentColor');
  track.setAttribute('stroke-opacity', '0.22');
  track.setAttribute('stroke-width', '2.75');

  const arc = document.createElementNS(SVG_NS, 'path');
  arc.setAttribute('d', 'M21.5 12a9.5 9.5 0 0 0-9.5-9.5');
  arc.setAttribute('stroke', 'currentColor');
  arc.setAttribute('stroke-width', '2.75');
  arc.setAttribute('stroke-linecap', 'round');

  spinner.appendChild(track);
  spinner.appendChild(arc);
  wrapper.appendChild(spinner);

  if (msg.length > 0) {
    const text = document.createElement('div');
    text.className = 'fsd-loading-text';
    text.textContent = msg;
    wrapper.appendChild(text);
  }

  return wrapper;
}

function createNotifyCard(type: NotifyType, msg: string): HTMLElement {
  const card = document.createElement('div');
  card.className = `fsd-notify fsd-notify--${type}`;
  card.setAttribute('data-fsd-notify-type', type);
  card.setAttribute('role', 'status');
  card.setAttribute('aria-live', 'polite');

  let iconPaths: string[];
  switch (type) {
    case NotifyType.success:
      iconPaths = ['M20 6L9 17l-5-5'];
      break;
    case NotifyType.failure:
      iconPaths = ['M18 6L6 18', 'M6 6l12 12'];
      break;
    case NotifyType.warning:
      iconPaths = [
        'M12 9v4',
        'M12 17h.01',
        'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z',
      ];
      break;
    case NotifyType.alert:
      iconPaths = [
        'M12 16v-4',
        'M12 8h.01',
        'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
      ];
      break;
    case NotifyType.error:
      iconPaths = [
        'M15 9l-6 6',
        'M9 9l6 6',
        'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
      ];
      break;
  }

  card.appendChild(createSvgIcon(iconPaths, 'fsd-notify-icon'));

  const text = document.createElement('div');
  text.className = 'fsd-notify-text';
  text.textContent = msg;
  card.appendChild(text);

  return card;
}

export function createDefaultNotifyStyle(): SmartNotifyStyle {
  return new SmartNotifyStyle({
    successBuilder: (msg) => createNotifyCard(NotifyType.success, msg),
    failureBuilder: (msg) => createNotifyCard(NotifyType.failure, msg),
    warningBuilder: (msg) => createNotifyCard(NotifyType.warning, msg),
    alertBuilder: (msg) => createNotifyCard(NotifyType.alert, msg),
    errorBuilder: (msg) => createNotifyCard(NotifyType.error, msg),
  });
}
