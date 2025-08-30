import React from "react";

const Loader = () => {
  return (
    <div className="relative flex items-center justify-center w-20 h-20 animate-spin">
      <div className="absolute w-full h-full border-4 border-transparent rounded-full border-t-white/30 border-r-white/30 border-b-white/30 border-l-purple-500"></div>
    </div>
  );
};

export default Loader;
