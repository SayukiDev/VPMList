import { describe, expect, it } from 'vitest';
import { addRepoUrl } from '@/utils/vcc';

describe('addRepoUrl', () => {
  it('builds a vcc:// URL with the encoded listing URL', () => {
    expect(addRepoUrl('https://example.com/index.json')).toBe(
      'vcc://vpm/addRepo?url=https%3A%2F%2Fexample.com%2Findex.json',
    );
  });

  it('escapes query parameters in the listing URL', () => {
    expect(addRepoUrl('https://example.com/index.json?a=1&b=2')).toBe(
      'vcc://vpm/addRepo?url=https%3A%2F%2Fexample.com%2Findex.json%3Fa%3D1%26b%3D2',
    );
  });
});
