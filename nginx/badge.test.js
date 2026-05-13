import test from 'node:test';
import assert from 'node:assert/strict';
import badgeModule from './badge.js';

test('normalizes hamm style key value bg query args', () => {
  const options = badgeModule.normalizeHttpArgs({
    key: 'Lang',
    value: 'Java17',
    bg: 'green',
  });

  assert.equal(options.label, 'Lang');
  assert.equal(options.message, 'Java17');
  assert.equal(options.color, '#2da44e');
});

test('renders escaped svg for direct nginx response', () => {
  const svg = badgeModule.renderBadgeSvg({
    key: 'ORM',
    value: '<JPA>',
    bg: 'purple',
  });

  assert.match(svg, /^<!-- This is build by svg tool/);
  assert.match(svg, /height="20"/);
  assert.match(svg, /ORM/);
  assert.match(svg, /&lt;JPA&gt;/);
  assert.match(svg, /#7c3aed/);
  assert.match(svg, /user-select:text/);
  assert.match(svg, /pointer-events:none/);
  assert.doesNotMatch(svg, /transform="scale\(\.1\)"/);
  assert.doesNotMatch(svg, /textLength=/);
  assert.doesNotMatch(svg, /animateMotion/);
});

test('default export exposes root router and badge handler', async () => {
  const module = await import('./badge.js');

  assert.equal(typeof module.default.badge, 'function');
  assert.equal(typeof module.default.indexOrBadge, 'function');
  assert.equal(typeof module.default.normalizeHttpArgs, 'function');
  assert.equal(typeof module.default.renderBadgeSvg, 'function');
  assert.equal(typeof module.default.kv, 'function');
  assert.equal(typeof module.default.label, 'function');
  assert.equal(typeof module.default.status, 'function');
  assert.equal(typeof module.default.tech, 'function');
});
