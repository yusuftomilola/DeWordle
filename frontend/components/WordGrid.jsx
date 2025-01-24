import React from 'react';

function WordGrid() {
  
  const inputs = Array.from({ length: 25 });

  return (
    <div className="mt-[150px]">
      <div className="grid grid-cols-5 gap-2 sm:overflow-auto gap-x-2 gap-y-2 md:gap-x-2 bg-[#FFFF] p-4">
        {inputs.map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            className="h-[55px] w-[55px] md:h-[70px] md:w-[70px] rounded-[5px] bg-[#939B9F4D] text-center"
          />
        ))}
      </div>
    </div>
  );
}

export default WordGrid;
