import dogReducer, { adoptDog, trainPotty, markTrainingUnlockNotified } from '@/redux/dogSlice.js';

describe('dogSlice training reducers', () => {
  it('adoptDog initializes adoption and training state', () => {
    const initial = dogReducer(undefined, { type: '@@INIT' });
    const payload = { id: 'test-id', name: 'TestPup' };
    const next = dogReducer(initial, adoptDog(payload));
    expect(next.id).toBe('test-id');
    expect(next.name).toBe('TestPup');
    expect(next.training).toBeDefined();
    expect(next.training.potty).toBeDefined();
    expect(next.training.potty.progress).toBe(0);
    expect(next.potty).toBeDefined();
  });

  it('trainPotty increments progress and schedules non-potty unlock when reaching 100%', () => {
    const initial = dogReducer(undefined, { type: '@@INIT' });
    // start from clean state
    const after = dogReducer(initial, trainPotty({ amount: 120 }));
    const potty = after.training.potty;
    expect(potty.progress).toBe(100);
    expect(potty.complete).toBe(true);
    expect(potty.completedAt).toBeDefined();
    expect(after.training.nonPottyUnlockedAt).toBeDefined();
    expect(after.training.nonPottyUnlockNotified).toBe(false);
  });

  it('markTrainingUnlockNotified sets notified flag', () => {
    const initial = dogReducer(undefined, { type: '@@INIT' });
    const afterUnlock = dogReducer(initial, trainPotty({ amount: 120 }));
    const afterNotified = dogReducer(afterUnlock, markTrainingUnlockNotified());
    expect(afterNotified.training.nonPottyUnlockNotified).toBe(true);
  });
});
