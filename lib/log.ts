export const log = {
    info: (...args: unknown[]) => console.log('  ✓', ...args),
    warn: (...args: unknown[]) => console.warn('  ⚠', ...args),
    error: (...args: unknown[]) => console.error('  ✗', ...args),
    step: (...args: unknown[]) => console.log('\n▶', ...args),
    dim: (...args: unknown[]) => console.log('   ', ...args),
}