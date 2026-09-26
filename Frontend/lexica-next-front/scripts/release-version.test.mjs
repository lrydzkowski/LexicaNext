import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { getAppVersion } from './release-version.mjs';

test('local builds without release metadata display Development', () => {
  assert.equal(getAppVersion(), 'Development');
  assert.equal(getAppVersion('', 'false'), 'Development');
});

test('release tags retain their date and time in the display label', () => {
  assert.equal(getAppVersion('20260725-105102', 'true'), '2026.07.25-105102');
  assert.equal(getAppVersion('20240229-000000'), '2024.02.29-000000');
  assert.equal(getAppVersion('20000229-235959'), '2000.02.29-235959');
});

test('required release metadata cannot fall back to Development', () => {
  for (const tag of [undefined, '']) {
    assert.throws(() => getAppVersion(tag, 'true'), /LEXICA_RELEASE_TAG is required/);
  }
});

test('malformed tags fail for both local and release builds', () => {
  const tags = [
    'Development',
    '2026.07.25-105102',
    '20260725-10510',
    '20260725-1051020',
    '20260725-105102\n',
    ' 20260725-105102',
    '00000725-105102',
    '20260025-105102',
    '20261325-105102',
    '20260700-105102',
    '20260431-105102',
    '20260229-105102',
    '21000229-105102',
    '20260725-240000',
    '20260725-106000',
    '20260725-105160',
  ];
  for (const tag of tags) {
    for (const required of ['true', 'false']) {
      assert.throws(() => getAppVersion(tag, required), /valid YYYYMMDD-HHmmss/, tag);
    }
  }
});

test('invalid requirement flags cannot disable validation', () => {
  for (const required of ['', 'TRUE', '1', 'yes']) {
    assert.throws(() => getAppVersion(undefined, required), /LEXICA_REQUIRE_RELEASE_TAG/);
  }
});

test('CI validation fails before publication without a valid VERSION_TAG', () => {
  const script = fileURLToPath(new URL('./validate-release-version.mjs', import.meta.url));
  for (const tag of ['', '20260229-120000']) {
    const result = spawnSync(process.execPath, [script], {
      env: { ...process.env, VERSION_TAG: tag },
      encoding: 'utf8',
      windowsHide: true,
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /LEXICA_RELEASE_TAG/);
  }
  const result = spawnSync(process.execPath, [script], {
    env: { ...process.env, VERSION_TAG: '20260725-105102' },
    encoding: 'utf8',
    windowsHide: true,
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /2026.07.25-105102/);
});
