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
  return ['classic', 'solid', 'status', 'tech'].indexOf(value) >= 0 ? value : 'classic';
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
      style: firstFilled(args.style, 'solid'),
    };
  }
  if (mode === 'status') {
    return {
      key: firstFilled(args.name, args.key, args.label),
      value: firstFilled(args.status, args.value, args.message),
      bg: firstFilled(args.bg, args.color),
      keyBg: firstFilled(args.keyBg, args.labelColor),
      radius: args.radius,
      style: firstFilled(args.style, 'status'),
    };
  }
  if (mode === 'tech') {
    return {
      key: firstFilled(args.name, args.key, args.label),
      value: firstFilled(args.version, args.value, args.message),
      bg: firstFilled(args.bg, args.color),
      keyBg: firstFilled(args.keyBg, args.labelColor),
      radius: args.radius,
      style: firstFilled(args.style, 'tech'),
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
  if (options.style === 'solid') {
    const rawText = options.label + ' ' + options.message;
    const text = escapeXml(rawText);
    const solidWidth = textLength(rawText) + 22;
    return '<!-- This is build by svg tool, see more here: https://github.com/HammCn/svg-badge-tool -->' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + solidWidth + '" height="22" role="img" aria-label="' + key + ': ' + value + '" data-style="solid" style="user-select:text;-webkit-user-select:text">' +
      '<title>' + key + ': ' + value + '</title><rect width="' + solidWidth + '" height="22" rx="3" fill="' + options.color + '"/>' +
      '<text x="' + Math.round(solidWidth / 2) + '" y="15" fill="#ffffff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">' + text + '</text></svg>';
  }
  if (options.style === 'status') {
    const statusWidth = lenKey + lenValue + 34;
    return '<!-- This is build by svg tool, see more here: https://github.com/HammCn/svg-badge-tool -->' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + statusWidth + '" height="22" role="img" aria-label="' + key + ': ' + value + '" data-style="status" style="user-select:text;-webkit-user-select:text">' +
      '<title>' + key + ': ' + value + '</title><rect width="' + statusWidth + '" height="22" rx="11" fill="#ffffff" stroke="#d1d5db"/>' +
      '<circle cx="12" cy="11" r="4" fill="' + options.color + '"/>' +
      '<text x="22" y="15" fill="#1f2937" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">' + key + '</text>' +
      '<text x="' + (lenKey + 28) + '" y="15" fill="' + options.color + '" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" font-weight="700">' + value + '</text></svg>';
  }
  if (options.style === 'tech') {
    const techLeftWidth = lenKey + 18;
    const techRightWidth = lenValue + 22;
    const techWidth = techLeftWidth + techRightWidth;
    return '<!-- This is build by svg tool, see more here: https://github.com/HammCn/svg-badge-tool -->' +
      '<svg xmlns="http://www.w3.org/2000/svg" width="' + techWidth + '" height="24" role="img" aria-label="' + key + ': ' + value + '" data-style="tech" style="user-select:text;-webkit-user-select:text">' +
      '<title>' + key + ': ' + value + '</title><rect x="0.5" y="0.5" width="' + (techWidth - 1) + '" height="23" rx="12" fill="#ffffff" stroke="' + options.color + '"/>' +
      '<rect x="' + techLeftWidth + '" y="3" width="' + (techRightWidth - 4) + '" height="18" rx="9" fill="' + options.color + '"/>' +
      '<text x="10" y="16" fill="#1f2937" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">' + key + '</text>' +
      '<text x="' + (techLeftWidth + Math.round((techRightWidth - 4) / 2)) + '" y="16" fill="#ffffff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" font-weight="700">' + value + '</text></svg>';
  }
  const leftWidth = lenKey + 11;
  const rightWidth = lenValue + 11;
  const width = leftWidth + rightWidth;
  const keyTextX = Math.round(leftWidth / 2);
  const valueTextX = Math.round(leftWidth + rightWidth / 2);

  return '<!-- This is build by svg tool, see more here: https://github.com/HammCn/svg-badge-tool -->' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="20" role="img" aria-label="' + key + ': ' + value + '" data-style="' + options.style + '" style="user-select:text;-webkit-user-select:text">' +
    '<title>' + key + ': ' + value + '</title>' +
    '<linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>' +
    '<clipPath id="a"><rect width="' + width + '" height="20" rx="' + options.radius + '" fill="#fff"/></clipPath>' +
    '<g clip-path="url(#a)"><path fill="' + options.labelColor + '" d="M0 0h' + leftWidth + 'v20H0z"/><path fill="' + options.color + '" d="M' + leftWidth + ' 0h' + rightWidth + 'v20H' + leftWidth + 'z"/><path fill="url(#b)" d="M0 0h' + width + 'v20H0z"/></g>' +
    '<g fill="#ffffff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" style="user-select:text;-webkit-user-select:text">' +
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
