function fallbackUUID(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    return Array.from(bytes, b => b.toString(16).padStart(2, '0'))
        .join('')
        .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

export function generateId(prefix = ''): string {
    const uuid = typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : fallbackUUID();
    return `${prefix}${uuid.replace(/-/g, '')}`.slice(0, 20);
}