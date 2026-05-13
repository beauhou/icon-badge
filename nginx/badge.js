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

function textLength(text) {
  return /[a-zA-Z.+\-_#*/@0-9]/.test(text) ? 7 * text.length : 11 * text.length;
}

export function normalizeHttpArgs(args) {
  const input = args || {};
  return {
    label: clampText(firstFilled(input.key, input.label), 'Key', 64),
    message: clampText(firstFilled(input.value, input.message), 'Value', 64),
    color: normalizeColor(firstFilled(input.bg, input.color), '#ff4500'),
    labelColor: normalizeColor(firstFilled(input.keyBg, input.labelColor), '#333333'),
    radius: normalizeRadius(input.radius),
  };
}

export function renderBadgeSvg(input) {
  const options = normalizeHttpArgs(input);
  const key = escapeXml(options.label);
  const value = escapeXml(options.message);
  const lenKey = textLength(options.label);
  const lenValue = textLength(options.message);
  const leftWidth = lenKey + 11;
  const rightWidth = lenValue + 11;
  const width = leftWidth + rightWidth;
  const keyTextX = lenKey * 5 + 55;
  const valueTextX = lenValue * 5 + 165 + lenKey * 10;

  return '<!-- This is build by svg tool, see more here: https://github.com/HammCn/svg-badge-tool -->' +
    '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="20" role="img" aria-label="' + key + ': ' + value + '">' +
    '<title>' + key + ': ' + value + '</title>' +
    '<linearGradient id="b" x2="0" y2="100%"><stop offset="0" stop-color="#bbb" stop-opacity=".1"/><stop offset="1" stop-opacity=".1"/></linearGradient>' +
    '<clipPath id="a"><rect width="' + width + '" height="20" rx="' + options.radius + '" fill="#fff"/></clipPath>' +
    '<g clip-path="url(#a)"><path fill="' + options.labelColor + '" d="M0 0h' + leftWidth + 'v20H0z"/><path fill="' + options.color + '" d="M' + leftWidth + ' 0h' + rightWidth + 'v20H' + leftWidth + 'z"/><path fill="url(#b)" d="M0 0h' + width + 'v20H0z"/></g>' +
    '<g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="110">' +
    '<text x="' + keyTextX + '" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="' + (lenKey * 10) + '">' + key + '</text>' +
    '<text x="' + keyTextX + '" y="140" transform="scale(.1)" textLength="' + (lenKey * 10) + '">' + key + '</text>' +
    '<text x="' + valueTextX + '" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="' + (lenValue * 10) + '">' + value + '</text>' +
    '<text x="' + valueTextX + '" y="140" transform="scale(.1)" textLength="' + (lenValue * 10) + '">' + value + '</text>' +
    '<animateMotion from="0, -50" to="0, 0" dur="0.3s" fill="freeze"/>' +
    '</g></svg>';
}

function badge(r) {
  r.headersOut['Content-Type'] = 'image/svg+xml; charset=utf-8';
  r.headersOut['Cache-Control'] = 'public, max-age=300';
  r.return(200, renderBadgeSvg(r.args || {}));
}

function indexOrBadge(r) {
  if (firstFilled(r.args.key, r.args.label, r.args.value, r.args.message)) {
    badge(r);
    return;
  }
  r.internalRedirect('/index.html');
}

export default { badge, indexOrBadge };
