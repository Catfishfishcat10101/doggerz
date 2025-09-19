import { createSlice } from "@reduxjs/toolkit";
const initialState = { pos:{x:288,y:148}, direction:"down", moving:false, happiness:60, xp:0, coins:100, backyardSkin:"default", unlocks:{head:[],neck:[],back:[]}, accessories:{head:null,neck:null,back:null} };
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v)); const uniqPush=(a,id)=>(a.includes(id)?a:[...a,id]);
export const levelFromXP=(xp)=>Math.max(1,Math.floor(xp/100)+1);
const dogSlice=createSlice({ name:"dog", initialState, reducers:{
  loadState(_s,a){const inc=a.payload&&typeof a.payload==="object"?a.payload:{}; return {...initialState,...inc};},
  setPosition(s,a){const {x,y}=a.payload; s.pos.x=x; s.pos.y=y;},
  setDirection(s,a){s.direction=a.payload;},
  setMoving(s,a){s.moving=!!a.payload;},
  setHappiness(s,a){s.happiness=clamp(Math.round(a.payload),0,100);},
  changeHappiness(s,a){s.happiness=clamp(s.happiness+Number(a.payload||0),0,100);},
  addXP(s,a){s.xp+=Number(a.payload||0);},
  tickNeeds(s,a){const dt=Number(a.payload?.dtSec||1); const d=s.moving?0.02:0.05; s.happiness=clamp(s.happiness-d*dt,0,100);},
  setBackyardSkin(s,a){s.backyardSkin=a.payload||"default";},
  earnCoins(s,a){s.coins+=Math.max(0,Number(a.payload||0));},
  spendCoins(s,a){const amt=Math.max(0,Number(a.payload||0)); if(s.coins>=amt) s.coins-=amt;},
  unlockAccessory(s,a){const {slot,id}=a.payload||{}; if(slot&&id&&s.unlocks[slot]) s.unlocks[slot]=uniqPush(s.unlocks[slot],id);},
  equipAccessory(s,a){const {slot,id}=a.payload||{}; if(!(slot in s.accessories)) return; if(id===null){s.accessories[slot]=null; return;} if(s.unlocks[slot]?.includes(id)) s.accessories[slot]=id;},
}});
export const { loadState,setPosition,setDirection,setMoving,setHappiness,changeHappiness,addXP,tickNeeds,setBackyardSkin,earnCoins,spendCoins,unlockAccessory,equipAccessory } = dogSlice.actions;
export const selectPos=(s)=>s.dog.pos; export const selectDirection=(s)=>s.dog.direction; export const selectMoving=(s)=>s.dog.moving; export const selectHappiness=(s)=>s.dog.happiness; export const selectBackyardSkin=(s)=>s.dog.backyardSkin;
export const selectCoins=(s)=>s.dog.coins; export const selectUnlocks=(s)=>s.dog.unlocks; export const selectAccessories=(s)=>s.dog.accessories;
export const selectDog=(s)=>s.dog; export const selectDogLevel=(s)=>levelFromXP(s.dog.xp);
export default dogSlice.reducer;
