export function generateId(prefix = ''): string {
    return `${prefix}${crypto.randomUUID().replace(/-/g, '')}`.slice(0, 20);
}