import React from "react";
import { motion } from "framer-motion";
import dogImage from "../asests/dog-pic.jpg"; // replace with your dog image

const Dog = () => {
  return (
    <motion.div
    animate={{y:[0,-10,0]}}
    transition={{ repeat: Infinity, duration: 1.5 }}
    style={{ textAlign: "center" }}
    >
      <img src={dogImage} alt="Virtual Dog" width='150px' />
    </motion.div>
  );
};

export default Dog;
