const COLOR_ALIASES = {
  blue: '#2f80ed',
  cyan: '#0891b2',
  gray: '#6b7280',
  green: '#2da44e',
  orange: '#f97316',
  pink: '#db2777',
  purple: '#7c3aed',
  red: '#d73a49',
  success: '#2da44e',
  warning: '#f59e0b',
  critical: '#d73a49',
  inactive: '#6b7280',
};

const STYLE_CONFIG = {
  flat: { radius: 4, height: 22, fontSize: 11, uppercase: false, weight: 600 },
  'flat-square': { radius: 0, height: 22, fontSize: 11, uppercase: false, weight: 600 },
  plastic: { radius: 8, height: 22, fontSize: 11, uppercase: false, weight: 600, shine: true },
  'for-the-badge': { radius: 4, height: 28, fontSize: 12, uppercase: true, weight: 700 },
  outline: { radius: 5, height: 24, fontSize: 11, uppercase: false, weight: 700, outline: true },
  social: { radius: 4, height: 22, fontSize: 11, uppercase: false, weight: 600, social: true },
};

function coalesce() {
  for (let i = 0; i < arguments.length; i += 1) {
    if (arguments[i] !== undefined && arguments[i] !== null && arguments[i] !== '') {
      return arguments[i];
    }
  }
  return '';
}

function clampText(value, fallback, maxLength) {
  const text = String(coalesce(value, fallback)).trim();
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

function normalizeColor(value) {
  const color = String(value || '').trim().toLowerCase();
  if (!color) return COLOR_ALIASES.blue;
  if (COLOR_ALIASES[color]) return COLOR_ALIASES[color];
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color)) return color;
  if (/^[0-9a-f]{6}$/i.test(color)) return '#' + color;
  return COLOR_ALIASES.blue;
}

function textWidth(text, size) {
  let wideChars = 0;
  for (let i = 0; i < text.length; i += 1) {
    if (text.charCodeAt(i) > 255) wideChars += 1;
  }
  return Math.ceil(text.length * size * 0.62 + wideChars * size * 0.35);
}

function getReadableTextColor(hexColor) {
  const color = hexColor.replace('#', '');
  const full = color.length === 3
    ? color.split('').map((part) => part + part).join('')
    : color;
  const red = parseInt(full.slice(0, 2), 16);
  const green = parseInt(full.slice(2, 4), 16);
  const blue = parseInt(full.slice(4, 6), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.62 ? '#111827' : '#ffffff';
}

export function normalizeHttpArgs(args) {
  const input = args || {};
  const style = STYLE_CONFIG[input.style] ? input.style : 'flat';
  return {
    label: clampText(coalesce(input.key, input.label), 'icon', 64),
    message: clampText(coalesce(input.value, input.message), 'badge', 64),
    logo: String(input.logo || '').trim().slice(0, 4),
    color: normalizeColor(coalesce(input.bg, input.color)),
    labelColor: normalizeColor(coalesce(input.keyBg, input.labelColor, '#555555')),
    style,
  };
}

export function renderBadgeSvg(input) {
  const options = normalizeHttpArgs(input);
  const config = STYLE_CONFIG[options.style];
  const label = config.uppercase ? options.label.toUpperCase() : options.label;
  const message = config.uppercase ? options.message.toUpperCase() : options.message;
  const logoWidth = options.logo ? 18 : 0;
  const labelPadding = 10;
  const messagePadding = 10;
  const labelWidth = textWidth(label, config.fontSize) + labelPadding * 2 + logoWidth;
  const messageWidth = textWidth(message, config.fontSize) + messagePadding * 2;
  const width = labelWidth + messageWidth;
  const y = Math.round(config.height / 2 + config.fontSize / 2 - 2);
  const labelFill = config.outline || config.social ? '#ffffff' : options.labelColor;
  const messageFill = config.outline || config.social ? '#ffffff' : options.color;
  const border = config.outline ? '<rect x="0.5" y="0.5" width="' + (width - 1) + '" height="' + (config.height - 1) + '" rx="' + config.radius + '" fill="none" stroke="' + escapeXml(options.color) + '"/>' : '';
  const shine = config.shine ? '<path fill="#fff" fill-opacity=".18" d="M' + config.radius + ' 1h' + (width - config.radius * 2) + 'a' + config.radius + ' ' + config.radius + ' 0 0 1 ' + config.radius + ' ' + config.radius + 'v2H0V' + config.radius + 'a' + config.radius + ' ' + config.radius + ' 0 0 1 ' + config.radius + '-' + config.radius + 'z"/>' : '';
  const labelTextColor = config.outline || config.social ? '#374151' : getReadableTextColor(options.labelColor);
  const messageTextColor = config.outline || config.social ? getReadableTextColor('#ffffff') : getReadableTextColor(options.color);
  const divider = config.outline || config.social ? '<line x1="' + labelWidth + '" y1="4" x2="' + labelWidth + '" y2="' + (config.height - 4) + '" stroke="#d1d5db"/>' : '';
  const logo = options.logo
    ? '<text x="10" y="' + y + '" fill="' + escapeXml(labelTextColor) + '" font-size="' + (config.fontSize + 1) + '" font-weight="' + config.weight + '">' + escapeXml(options.logo) + '</text>'
    : '';
  const labelX = options.logo ? 28 : labelPadding;

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + config.height + '" role="img" aria-label="' + escapeXml(options.label + ': ' + options.message) + '">' +
    '<title>' + escapeXml(options.label + ': ' + options.message) + '</title>' +
    '<rect width="' + labelWidth + '" height="' + config.height + '" rx="' + config.radius + '" fill="' + escapeXml(labelFill) + '"/>' +
    '<rect x="' + labelWidth + '" width="' + messageWidth + '" height="' + config.height + '" rx="' + config.radius + '" fill="' + escapeXml(messageFill) + '"/>' +
    '<path fill="' + escapeXml(messageFill) + '" d="M' + (labelWidth - config.radius) + ' 0h' + config.radius + 'v' + config.height + 'h-' + config.radius + 'z"/>' +
    border + divider + shine + logo +
    '<text x="' + labelX + '" y="' + y + '" fill="' + escapeXml(labelTextColor) + '" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="' + config.fontSize + '" font-weight="' + config.weight + '">' + escapeXml(label) + '</text>' +
    '<text x="' + (labelWidth + messagePadding) + '" y="' + y + '" fill="' + escapeXml(messageTextColor) + '" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="' + config.fontSize + '" font-weight="' + config.weight + '">' + escapeXml(message) + '</text>' +
    '</svg>';
}

function badge(r) {
  r.headersOut['Content-Type'] = 'image/svg+xml; charset=utf-8';
  r.headersOut['Cache-Control'] = 'public, max-age=300';
  r.return(200, renderBadgeSvg(r.args || {}));
}

export default { badge };
