import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBadgeUrl,
  buildEmbedCodes,
  normalizeBadgeOptions,
  renderBadgeSvg,
  svgToDataUri,
} from './badge-core.js';

test('normalizes missing options into a usable default badge', () => {
  const options = normalizeBadgeOptions({});

  assert.equal(options.label, 'icon');
  assert.equal(options.message, 'badge');
  assert.equal(options.color, '#2f80ed');
  assert.equal(options.style, 'flat');
});

test('renders svg badge with escaped text and selected style', () => {
  const svg = renderBadgeSvg({
    label: 'docs',
    message: '<ready>',
    color: 'success',
    logo: '✓',
    style: 'for-the-badge',
  });

  assert.match(svg, /^<svg /);
  assert.match(svg, /DOCS/);
  assert.match(svg, /&lt;READY&gt;/);
  assert.match(svg, /#2da44e/);
});

test('builds direct svg url from relative base path', () => {
  const url = buildBadgeUrl('/icon-badge.svg', {
    label: 'build',
    message: 'passing',
    color: 'success',
    style: 'flat-square',
  });

  assert.equal(
    url,
    '/icon-badge.svg?label=build&message=passing&color=success&style=flat-square',
  );
});

test('builds markdown and html embed snippets', () => {
  const snippets = buildEmbedCodes('/icon-badge.svg', {
    label: 'api',
    message: 'v1',
    color: 'blue',
    style: 'outline',
  });

  assert.equal(
    snippets.markdown,
    '![api: v1](/icon-badge.svg?label=api&message=v1&color=blue&style=outline)',
  );
  assert.match(snippets.html, /^<img src="\/icon-badge\.svg\?/);
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
