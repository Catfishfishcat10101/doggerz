// src/components/Features/PottyTrainer.jsx
// ...existing imports...
import { selectBackyardSkin } from "../../redux/dogSlice";
// ...inside component:
const backyardSkin = useSelector(selectBackyardSkin);
// ...then in the Yard (right side) style:
const yardStyle = backyardSkin === "lush"
  ? {
      left: YARD_X_START, height: WORLD_H,
      backgroundImage:
        "linear-gradient(0deg,#99f0ae 0 1px,transparent 1px), linear-gradient(90deg,#99f0ae 0 1px, transparent 1px)",
      backgroundSize: "64px 64px", backgroundColor: "#b7f7c5"
    }
  : {
      left: YARD_X_START, height: WORLD_H,
      backgroundImage:
        "linear-gradient(0deg,#c7f9cc 0 1px,transparent 1px), linear-gradient(90deg,#c7f9cc 0 1px, transparent 1px)",
      backgroundSize: "64px 64px", backgroundColor: "#bbf7d0"
    };
// ...and replace the Yard div with:
<div className="absolute right-0 top-0" style={yardStyle} />
