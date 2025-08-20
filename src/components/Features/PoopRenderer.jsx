import React from "react";
export default function PoopRenderer({ poops=[] }) {
  return (
    <div>
      {poops.map(p => (
        <div key={p.id} style={{position:"absolute",left:p.x,top:p.y}}>💩</div>
      ))}
    </div>
  );
}