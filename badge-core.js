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

const DEFAULT_COLOR = '#ff4500';
const DEFAULT_LEFT_COLOR = '#333333';

function firstFilled(...values) {
  return values.find((value) => value !== undefined && value !== null && String(value).trim() !== '');
}

function clampText(value, fallback, maxLength = 64) {
  const text = String(firstFilled(value, fallback)).trim();
  return text.slice(0, maxLength);
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function normalizeColor(value, fallback = DEFAULT_COLOR) {
  const color = String(value ?? '').trim().toLowerCase();
  if (!color) return fallback;
  if (COLOR_ALIASES[color]) return COLOR_ALIASES[color];
  if (/^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(color)) return color;
  if (/^[0-9a-f]{6}$/i.test(color)) return `#${color}`;
  return fallback;
}

function normalizeRadius(value) {
  const radius = Number.parseInt(value, 10);
  if (Number.isNaN(radius)) return 3;
  return Math.max(0, Math.min(radius, 10));
}

function textLength(text) {
  return /[a-zA-Z.+\-_#*/@0-9]/.test(text) ? 7 * text.length : 11 * [...text].length;
}

export function normalizeBadgeOptions(input = {}) {
  return {
    label: clampText(firstFilled(input.key, input.label), 'Key'),
    message: clampText(firstFilled(input.value, input.message), 'Value'),
    color: normalizeColor(firstFilled(input.bg, input.color)),
    labelColor: normalizeColor(firstFilled(input.keyBg, input.labelColor), DEFAULT_LEFT_COLOR),
    radius: normalizeRadius(input.radius),
  };
}

export function renderBadgeSvg(input = {}) {
  const options = normalizeBadgeOptions(input);
  const key = escapeXml(options.label);
  const value = escapeXml(options.message);
  const lenKey = textLength(options.label);
  const lenValue = textLength(options.message);
  const leftWidth = lenKey + 11;
  const rightWidth = lenValue + 11;
  const width = leftWidth + rightWidth;
  const keyTextX = Math.round(leftWidth / 2);
  const valueTextX = Math.round(leftWidth + rightWidth / 2);

  return `<!-- This is build by svg tool, see more here: https://github.com/HammCn/svg-badge-tool -->
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="20" role="img" aria-label="${key}: ${value}" style="user-select:text;-webkit-user-select:text">
  <title>${key}: ${value}</title>
  <linearGradient id="b" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="a">
    <rect width="${width}" height="20" rx="${options.radius}" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#a)">
    <path fill="${options.labelColor}" d="M0 0h${leftWidth}v20H0z"/>
    <path fill="${options.color}" d="M${leftWidth} 0h${rightWidth}v20H${leftWidth}z"/>
    <path fill="url(#b)" d="M0 0h${width}v20H0z"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11" style="user-select:text;-webkit-user-select:text">
    <text x="${keyTextX}" y="15" fill="#010101" fill-opacity=".3" style="user-select:none;pointer-events:none">${key}</text>
    <text x="${keyTextX}" y="14">${key}</text>
    <text x="${valueTextX}" y="15" fill="#010101" fill-opacity=".3" style="user-select:none;pointer-events:none">${value}</text>
    <text x="${valueTextX}" y="14">${value}</text>
  </g>
</svg>`;
}

export function buildBadgeUrl(basePath, input = {}) {
  return buildHttpBadgeUrl(basePath, input);
}

export function buildHttpBadgeUrl(basePath, input = {}) {
  const options = normalizeBadgeOptions(input);
  const params = new URLSearchParams();
  params.set('key', options.label);
  params.set('value', options.message);
  if (input.bg || input.color) params.set('bg', input.bg || input.color);
  if (input.keyBg || input.labelColor) params.set('keyBg', input.keyBg || input.labelColor);
  if (input.radius !== undefined && input.radius !== '') params.set('radius', String(options.radius));
  return `${basePath.replace(/\?$/, '')}?${params.toString()}`;
}

export function buildEmbedCodes(basePath, input = {}) {
  const options = normalizeBadgeOptions(input);
  const url = buildHttpBadgeUrl(basePath, input);
  const alt = `${options.label}: ${options.message}`;
  const svg = renderBadgeSvg(options);
  const dataUri = svgToDataUri(svg);
  return {
    url,
    markdown: `![${alt}](${url})`,
    html: `<img src="${url}" alt="${alt}">`,
    dataUri,
    markdownDataUri: `![${alt}](${dataUri})`,
    htmlDataUri: `<img src="${dataUri}" alt="${alt}">`,
    svg,
  };
}

export function optionsFromSearch(search = '') {
  const params = new URLSearchParams(search);
  return normalizeBadgeOptions({
    key: params.get('key'),
    label: params.get('label'),
    value: params.get('value'),
    message: params.get('message'),
    bg: params.get('bg'),
    color: params.get('color'),
    keyBg: params.get('keyBg'),
    labelColor: params.get('labelColor'),
    radius: params.get('radius'),
  });
}

export function svgToDataUri(svg) {
  if (typeof btoa === 'function') {
    const encoded = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${encoded}`;
  }
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}
