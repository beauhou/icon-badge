import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeHttpArgs, renderBadgeSvg } from './badge.js';

test('normalizes hamm style key value bg query args', () => {
  const options = normalizeHttpArgs({
    key: 'Lang',
    value: 'Java17',
    bg: 'green',
  });

  assert.equal(options.label, 'Lang');
  assert.equal(options.message, 'Java17');
  assert.equal(options.color, '#2da44e');
});

test('renders escaped svg for direct nginx response', () => {
  const svg = renderBadgeSvg({
    key: 'ORM',
    value: '<JPA>',
    bg: 'purple',
    style: 'flat-square',
  });

  assert.match(svg, /^<svg /);
  assert.match(svg, /ORM/);
  assert.match(svg, /&lt;JPA&gt;/);
  assert.match(svg, /#7c3aed/);
});
