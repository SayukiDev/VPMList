import { describe, expect, it } from 'vitest';
import { compare, parse, pickLatestKey, sortDesc } from '@/utils/semver';

describe('semver', () => {
  it('parses standard versions', () => {
    expect(parse('1.2.3')).toEqual({ major: 1, minor: 2, patch: 3, prerelease: [] });
  });

  it('parses prerelease versions', () => {
    expect(parse('1.0.0-beta.2')).toEqual({
      major: 1,
      minor: 0,
      patch: 0,
      prerelease: ['beta', '2'],
    });
  });

  it('compares numeric components', () => {
    expect(compare('1.0.0', '1.0.10')).toBeLessThan(0);
    expect(compare('2.0.0', '1.99.99')).toBeGreaterThan(0);
    expect(compare('1.0.0', '1.0.0')).toBe(0);
  });

  it('treats release as greater than prerelease', () => {
    expect(compare('1.0.0', '1.0.0-beta')).toBeGreaterThan(0);
    expect(compare('1.0.0-rc.1', '1.0.0')).toBeLessThan(0);
  });

  it('compares prerelease identifiers', () => {
    expect(compare('1.0.0-alpha', '1.0.0-beta')).toBeLessThan(0);
    expect(compare('1.0.0-rc.2', '1.0.0-rc.10')).toBeLessThan(0);
  });

  it('sortDesc returns newest first', () => {
    expect(sortDesc(['1.0.0', '1.0.10', '1.1.0-beta', '1.1.0'])).toEqual([
      '1.1.0',
      '1.1.0-beta',
      '1.0.10',
      '1.0.0',
    ]);
  });

  it('pickLatestKey selects the highest version', () => {
    expect(pickLatestKey({ '1.0.0': {}, '2.0.0': {}, '1.5.0': {} })).toBe('2.0.0');
    expect(pickLatestKey({})).toBeUndefined();
  });
});
