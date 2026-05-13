const COLOR_ALIASES = {
  black: '#333333',
  blue: '#2f80ed',
  cyan: '#0891b2',
  gray: '#6b7280',
  green: '#2da44e',
  orange: '#ff4500',
  pink: '#db2777',
  purple: '#7c3aed',
  red: '#d73a49',
  success: '#2da44e',
  warning: '#f59e0b',
  critical: '#d73a49',
  inactive: '#6b7280',
};

function firstFilled() {
  for (let i = 0; i < arguments.length; i += 1) {
    const value = arguments[i];
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return undefined;
}

function clampText(value, fallback, maxLength) {
  const text = String(firstFilled(value, fallback)).trim();
  return text.slice(0, maxLength || 64);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function normalizeColor(value, fallback) {
  const color = String(value || '').trim().toLowerCase();
  const defaultColor = fallback || '#ff4500';
  if (!color) return defaultColor;
  if (COLOR_ALIASES[color]) return COLOR_ALIASES[color];
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color)) return color;
  if (/^[0-9a-f]{6}$/i.test(color)) return '#' + color;
  return defaultColor;
}

function normalizeRadius(value) {
  const radius = parseInt(value, 10);
  if (Number.isNaN(radius)) return 3;
  return Math.max(0, Math.min(radius, 10));
}

function normalizeStyle(value) {
  return ['classic', 'flat', 'pill', 'outline'].indexOf(value) >= 0 ? value : 'classic';
}

function textLength(text) {
  return /[a-zA-Z.+\-_#*/@0-9]/.test(text) ? 7 * text.length : 11 * text.length;
}

function normalizeHttpArgs(args) {
  const input = args || {};
  return {
    label: clampText(firstFilled(input.key, input.label), 'Key', 64),
    message: clampText(firstFilled(input.value, input.message), 'Value', 64),
    color: normalizeColor(firstFilled(input.bg, input.color), '#ff4500'),
    labelColor: normalizeColor(firstFilled(input.keyBg, input.labelColor), '#333333'),
    radius: normalizeRadius(input.radius),
    style: normalizeStyle(input.style),
  };
}

function normalizeModeArgs(mode, input) {
  const args = input || {};
  if (mode === 'label') {
    return {
      key: firstFilled(args.label, args.key),
      value: firstFilled(args.message, args.value),
      bg: firstFilled(args.bg, args.color),
      keyBg: firstFilled(args.keyBg, args.labelColor),
      radius: args.radius,
      style: firstFilled(args.style, 'flat'),
    };
  }
  if (mode === 'status') {
    return {
      key: firstFilled(args.name, args.key, args.label),
      value: firstFilled(args.status, args.value, args.message),
      bg: firstFilled(args.bg, args.color),
      keyBg: firstFilled(args.keyBg, args.labelColor),
      radius: args.radius,
      style: firstFilled(args.style, 'pill'),
    };
  }
  if (mode === 'tech') {
    return {
      key: firstFilled(args.name, args.key, args.label),
      value: firstFilled(args.version, args.value, args.message),
      bg: firstFilled(args.bg, args.color),
      keyBg: firstFilled(args.keyBg, args.labelColor),
      radius: args.radius,
      style: firstFilled(args.style, 'outline'),
    };
  }
  return Object.assign({}, args, { style: firstFilled(args.style, 'classic') });
}

function renderBadgeSvg(input) {
  const options = normalizeHttpArgs(input);
  const key = escapeXml(options.label);
  const value = escapeXml(options.message);
  const lenKey = textLength(options.label);
  const lenValue = textLength(options.message);
  const leftWidth = lenKey + 11;
  const rightWidth = lenValue + 11;
  const width = leftWidth + rightWidth;
  const keyTextX = Math.round(leftWidth / 2);
  const valueTextX = Math.round(leftWidth + rightWidth / 2);
  const styleRadius = options.style === 'flat' ? 0 : options.style === 'pill' ? 10 : options.radius;
  const isOutline = options.style === 'outline';
  const leftFill = isOutline ? '#ffffff' : options.labelColor;
  const rightFill = isOutline ? '#ffffff' : options.color;
  const textFill = isOutline ? '#1f2937' : '#ffffff';
  const highlight = isOutline ? '' : '<path fill="url(#b)" d="M0 0h' + width + 'v20H0z"/>';
  const border = isOutline ? '<rect x="0.5" y="0.5" width="' + (width - 1) + '" height="19" rx="' + styleRadius + '" fill="none" stroke="' + options.color + '"/>' : '';
  const divider = isOutline ? '<line x1="' + leftWidth + '" y1="4" x2="' + leftWidth + '" y2="16" stroke="#d1d5db"/>' : '';

  return '<!-- This is build by svg tool, see more here: https://github.com/HammCn/svg-badge-tool -->' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="20" role="img" aria-label="' + key + ': ' + value + '" data-style="' + options.style + '" style="user-select:text;-webkit-user-select:text">' +
    '<title>' + key + ': ' + value + '</title>' +
    '<linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>' +
    '<clipPath id="a"><rect width="' + width + '" height="20" rx="' + styleRadius + '" fill="#fff"/></clipPath>' +
    '<g clip-path="url(#a)"><path fill="' + leftFill + '" d="M0 0h' + leftWidth + 'v20H0z"/><path fill="' + rightFill + '" d="M' + leftWidth + ' 0h' + rightWidth + 'v20H' + leftWidth + 'z"/>' + highlight + '</g>' +
    border + divider +
    '<g fill="' + textFill + '" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" style="user-select:text;-webkit-user-select:text">' +
    '<text x="' + keyTextX + '" y="15" fill="#010101" fill-opacity=".3" style="user-select:none;pointer-events:none">' + key + '</text>' +
    '<text x="' + keyTextX + '" y="14">' + key + '</text>' +
    '<text x="' + valueTextX + '" y="15" fill="#010101" fill-opacity=".3" style="user-select:none;pointer-events:none">' + value + '</text>' +
    '<text x="' + valueTextX + '" y="14">' + value + '</text>' +
    '</g></svg>';
}

function badge(r) {
  r.headersOut['Content-Type'] = 'image/svg+xml; charset=utf-8';
  r.headersOut['Cache-Control'] = 'public, max-age=300';
  r.return(200, renderBadgeSvg(r.args || {}));
}

function modeBadge(mode) {
  return function handleModeBadge(r) {
    r.headersOut['Content-Type'] = 'image/svg+xml; charset=utf-8';
    r.headersOut['Cache-Control'] = 'public, max-age=300';
    r.return(200, renderBadgeSvg(normalizeModeArgs(mode, r.args || {})));
  };
}

function indexOrBadge(r) {
  if (firstFilled(r.args.key, r.args.label, r.args.value, r.args.message)) {
    badge(r);
    return;
  }
  r.internalRedirect('/index.html');
}

export default {
  badge,
  indexOrBadge,
  kv: modeBadge('kv'),
  label: modeBadge('label'),
  status: modeBadge('status'),
  tech: modeBadge('tech'),
  normalizeHttpArgs,
  renderBadgeSvg,
};
