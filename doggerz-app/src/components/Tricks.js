import React from "react";
import { useDispatch, useSelector} from "react-redux";
import { learnTrick } from "../redux/dogSlice";
import { div } from "framer-motion/client";

const Tricks = () => {
  const dispatch = useDispatch();
  const tricks = useSelector(state => state.dog.tricks);

  return (
    <div>
      <h3>Teach a Trick</h3>
      {trickOptions.map((trick) => (
        <button key={trick} onClick={() => dispatch(learnTrick(trick))}>
          Teach {trick}
        </button>
      ))}
      <h4>Learned Tricks</h4>
      <ul>{tricks.map((t, i) => <li key={i}>{t}</li>)}</ul>
      </div>
      );
};

export default Tricks;
    