import { describe, it, expect } from 'vitest';

// Simple test to ensure the package builds and exports work
describe('@bluvo/react', () => {
  it('should export useBluvoFlow', async () => {
    // Dynamic import to avoid issues with React in test environment
    const module = await import('../index');
    expect(module.useBluvoFlow).toBeDefined();
    expect(typeof module.useBluvoFlow).toBe('function');
  });

  it('should export useFlowMachine', async () => {
    const module = await import('../index');
    expect(module.useFlowMachine).toBeDefined();
    expect(typeof module.useFlowMachine).toBe('function');
  });

  it('should export useWithdrawMachine', async () => {
    const module = await import('../index');
    expect(module.useWithdrawMachine).toBeDefined();
    expect(typeof module.useWithdrawMachine).toBe('function');
  });
});