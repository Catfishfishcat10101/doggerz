//src/features/game/scene/Scene.jsx
export default function Scene({ children }) {
  return (
    <div style={{ minHeight: 280, display: 'grid', placeItems: 'center', border: '1px dashed #333' }}>
      <em>Scene stub</em>
      {children}
    </div>
  );
}
