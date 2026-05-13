import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBadgeUrl,
  buildEmbedCodes,
  buildHttpBadgeUrl,
  normalizeModeOptions,
  normalizeBadgeOptions,
  renderBadgeSvg,
  svgToDataUri,
} from './badge-core.js';

test('normalizes missing options into a Hamm-style default badge', () => {
  const options = normalizeBadgeOptions({});

  assert.equal(options.label, 'Key');
  assert.equal(options.message, 'Value');
  assert.equal(options.color, '#ff4500');
  assert.equal(options.labelColor, '#333333');
  assert.equal(options.radius, 3);
});

test('accepts key value bg aliases for http badge usage', () => {
  const options = normalizeBadgeOptions({
    key: 'Lang',
    value: 'Java17',
    bg: 'green',
  });

  assert.equal(options.label, 'Lang');
  assert.equal(options.message, 'Java17');
  assert.equal(options.color, '#2da44e');
});

test('renders classic 20px svg badge with escaped text', () => {
  const svg = renderBadgeSvg({
    key: 'ORM',
    value: '<JPA>',
    bg: 'purple',
    radius: 6,
  });

  assert.match(svg, /^<!-- This is build by svg tool/);
  assert.match(svg, /height="20"/);
  assert.match(svg, /ORM/);
  assert.match(svg, /&lt;JPA&gt;/);
  assert.match(svg, /#7c3aed/);
  assert.match(svg, /rx="6"/);
  assert.match(svg, /user-select:text/);
  assert.match(svg, /pointer-events:none/);
  assert.doesNotMatch(svg, /transform="scale\(\.1\)"/);
  assert.doesNotMatch(svg, /textLength=/);
  assert.doesNotMatch(svg, /animateMotion/);
});

test('renders different visual styles', () => {
  const flat = renderBadgeSvg({ key: 'Build', value: 'Passing', style: 'flat' });
  const pill = renderBadgeSvg({ key: 'API', value: 'Online', style: 'pill' });
  const outline = renderBadgeSvg({ key: 'Java', value: '17', style: 'outline' });

  assert.match(flat, /data-style="flat"/);
  assert.match(flat, /rx="0"/);
  assert.match(pill, /data-style="pill"/);
  assert.match(pill, /rx="10"/);
  assert.match(outline, /data-style="outline"/);
  assert.match(outline, /stroke=/);
});

test('builds root http badge url', () => {
  const url = buildHttpBadgeUrl('https://svg.example.com', {
    key: 'Lang',
    value: 'Java17',
    bg: 'green',
  });

  assert.equal(url, 'https://svg.example.com?key=Lang&value=Java17&bg=green');
});

test('normalizes route-specific query modes', () => {
  assert.deepEqual(normalizeModeOptions('kv', { key: 'Lang', value: 'Java17' }), {
    key: 'Lang',
    value: 'Java17',
  });
  assert.deepEqual(normalizeModeOptions('label', { label: 'Build', message: 'Passing' }), {
    key: 'Build',
    value: 'Passing',
  });
  assert.deepEqual(normalizeModeOptions('status', { name: 'API', status: 'Online' }), {
    key: 'API',
    value: 'Online',
  });
  assert.deepEqual(normalizeModeOptions('tech', { name: 'Java', version: '17' }), {
    key: 'Java',
    value: '17',
  });
});

test('builds badge url alias with key value params', () => {
  const url = buildBadgeUrl('/badge.svg', {
    label: 'build',
    message: 'passing',
    color: 'success',
  });

  assert.equal(url, '/badge.svg?key=build&value=passing&bg=success');
});

test('builds markdown and html embed snippets', () => {
  const snippets = buildEmbedCodes('/badge.svg', {
    label: 'api',
    message: 'v1',
    color: 'blue',
  });

  assert.equal(snippets.markdown, '![api: v1](/badge.svg?key=api&value=v1&bg=blue)');
  assert.match(snippets.html, /^<img src="\/badge\.svg\?/);
  assert.match(snippets.html, /alt="api: v1"/);
});

test('encodes svg as a portable data uri', () => {
  const uri = svgToDataUri('<svg><text>中文 & ready</text></svg>');

  assert.match(uri, /^data:image\/svg\+xml;base64,/);
  assert.equal(
    Buffer.from(uri.split(',')[1], 'base64').toString('utf8'),
    '<svg><text>中文 & ready</text></svg>',
  );
});
