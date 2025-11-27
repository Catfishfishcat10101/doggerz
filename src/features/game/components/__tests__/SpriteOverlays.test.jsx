import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpriteOverlays from '../SpriteOverlays.jsx';

describe('SpriteOverlays', () => {
  it('renders cleanliness overlay and flees for FLEAS', () => {
    const { container } = render(
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <SpriteOverlays cleanlinessTier={'FLEAS'} inferredStage={'puppy'} baseSize={200} />
      </div>
    );

    // Expect overlay element present
    const overlay = container.querySelector('.mix-blend-multiply');
    expect(overlay).toBeTruthy();

    // Expect fleas (six) by class name
    const fleas = container.getElementsByClassName('bg-black/80');
    expect(fleas.length).toBeGreaterThanOrEqual(6);
  });

  it('renders nothing for FRESH', () => {
    const { container } = render(
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        <SpriteOverlays cleanlinessTier={'FRESH'} inferredStage={'adult'} baseSize={200} />
      </div>
    );

    const overlay = container.querySelector('.mix-blend-multiply');
    expect(overlay).toBeNull();
  });
});
