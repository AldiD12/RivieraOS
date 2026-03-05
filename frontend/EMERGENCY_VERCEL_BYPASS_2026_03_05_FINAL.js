// EMERGENCY VERCEL CACHE BYPASS - 2026-03-05 FINAL ATTEMPT
// This file exists solely to force Vercel to generate a new bundle hash
// Current problematic hash: index-D7eDW5Y-.js
// Expected: index-[NEW_HASH].js

console.log('EMERGENCY CACHE BYPASS ACTIVE');
console.log('Bundle hash MUST change from index-D7eDW5Y-.js');
console.log('CreateProductModal import MUST be resolved');

export const EMERGENCY_CACHE_BYPASS = {
  timestamp: '2026-03-05T' + new Date().toISOString(),
  reason: 'Vercel deployment cache lock preventing new builds',
  expectedOutcome: 'New bundle hash generation',
  criticalIssue: 'CreateProductModal ReferenceError blocking dashboard'
};