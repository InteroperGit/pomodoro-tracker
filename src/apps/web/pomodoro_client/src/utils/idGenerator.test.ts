import { describe, it, expect } from 'vitest';
import { generateId } from './idGenerator.ts';

describe('generateId', () => {
    it('returns a string', () => {
        expect(typeof generateId()).toBe('string');
    });

    it('returns at most 20 characters', () => {
        expect(generateId().length).toBeLessThanOrEqual(20);
    });

    it('returns at most 20 characters with a prefix', () => {
        expect(generateId('pfx-').length).toBeLessThanOrEqual(20);
    });

    it('starts with the given prefix', () => {
        expect(generateId('abc')).toMatch(/^abc/);
    });

    it('generates unique values', () => {
        const ids = new Set(Array.from({ length: 100 }, () => generateId()));
        expect(ids.size).toBe(100);
    });
});
