import { describe, it, expect } from 'vitest';
import { escapeHtml } from './html.ts';

describe('escapeHtml', () => {
    it('returns empty string for null', () => {
        expect(escapeHtml(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
        expect(escapeHtml(undefined)).toBe('');
    });

    it('returns plain text unchanged', () => {
        expect(escapeHtml('hello world')).toBe('hello world');
    });

    it('escapes &', () => {
        expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('escapes <', () => {
        expect(escapeHtml('<div>')).toBe('&lt;div&gt;');
    });

    it('escapes >', () => {
        expect(escapeHtml('a > b')).toBe('a &gt; b');
    });

    it('escapes double quotes', () => {
        expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    });

    it("escapes single quotes", () => {
        expect(escapeHtml("it's")).toBe("it&#039;s");
    });

    it('escapes all special characters in one string', () => {
        expect(escapeHtml('<a href="test" data-x=\'y\'>a & b</a>'))
            .toBe('&lt;a href=&quot;test&quot; data-x=&#039;y&#039;&gt;a &amp; b&lt;/a&gt;');
    });
});
