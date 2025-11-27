import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import useSpriteLoader from '../useSpriteLoader.jsx';

function TestComponent({ src, cleanliness }) {
  const { imageLoaded, imageFailed, inferredStage, lqipDataUrl } = useSpriteLoader(src, cleanliness);
  return (
    <div>
      <div>loaded:{String(imageLoaded)}</div>
      <div>failed:{String(imageFailed)}</div>
      <div>stage:{inferredStage}</div>
      <div data-testid="lqip">{lqipDataUrl}</div>
    </div>
  );
}

// Mock Image to control load / error behavior
class MockImageSuccess {
  constructor() {
    setTimeout(() => {
      if (this.onload) this.onload();
    }, 0);
  }
  set src(v) {
    this._src = v;
  }
}

class MockImageFail {
  constructor() {
    setTimeout(() => {
      if (this.onerror) this.onerror(new Error('mock-fail'));
    }, 0);
  }
  set src(v) {
    this._src = v;
  }
}

describe('useSpriteLoader', () => {
  let OriginalImage;

  beforeEach(() => {
    OriginalImage = global.Image;
    // clear monitor
    if (global.window) global.window.__DOGGERZ_MONITOR__ = [];
  });
  afterEach(() => {
    global.Image = OriginalImage;
    if (global.window) global.window.__DOGGERZ_MONITOR__ = [];
  });

  it('reports loaded=true and emits success telemetry', async () => {
    global.Image = MockImageSuccess;
    render(<TestComponent src="ok.png" cleanliness="FRESH" />);
    await waitFor(() => expect(screen.getByText(/^loaded:/)).toHaveTextContent('loaded:true'));
    // monitor should have a success event
    expect(window.__DOGGERZ_MONITOR__).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ eventType: 'sprite_load_success' }),
      ])
    );
    const lqip = screen.getByTestId('lqip').textContent;
    expect(lqip).toMatch(/^data:image\/svg\+xml/);
  });

  it('reports failed=true and emits failed telemetry', async () => {
    global.Image = MockImageFail;
    render(<TestComponent src="fail.png" cleanliness="DIRTY" />);
    await waitFor(() => expect(screen.getByText(/^failed:/)).toHaveTextContent('failed:true'));
    expect(window.__DOGGERZ_MONITOR__).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ eventType: 'sprite_load_failed' }),
      ])
    );
  });
});
