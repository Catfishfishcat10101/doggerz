import dogReducer, { adoptFromMemorial } from '@/redux/dogSlice.js';

describe('dogSlice adoptFromMemorial', () => {
  it('adopts from memorial and updates state', () => {
    const initial = dogReducer(undefined, { type: '@@INIT' });
    const payload = {
      name: 'MemoryPup',
      statsSnapshot: { hunger: 10, happiness: 80 },
      journal: [{ id: 'j1', timestamp: 123, summary: 'Saved memory' }],
    };

    const next = dogReducer(initial, adoptFromMemorial(payload));
    expect(next.name).toBe('MemoryPup');
    expect(next.stats.hunger).toBe(10);
    expect(next.stats.happiness).toBe(80);
    expect(next.adoptedAt).toBeDefined();
    expect(next.deceasedAt).toBeNull();
    // The reducer may prepend an auto-generated ADOPT entry, so ensure the
    // payload journal entry exists somewhere in the entries list.
    const hasPayloadEntry = Array.isArray(next.journal?.entries) && next.journal.entries.some(e => e.summary === 'Saved memory');
    expect(hasPayloadEntry).toBe(true);
  });
});
