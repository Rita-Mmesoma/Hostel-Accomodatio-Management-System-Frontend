import React from 'react';

const Slides = () => {
  return (
    <div className='relative  lg:w-125 md:w-full lg:h-112.5 md:h-100 flex justify-center items-center '>

      <img src="/image1.jpg" className='lg:w-[25rem] md:w-[20rem] lg:h-[25rem] md:h-[20rem] rounded-[50%] border-8 border-white z-1' />

      <img src="/image2.jpg" className='lg:w-40 md:w-32 lg:h-40 md:h-32 rounded-[50%] border-6 border-white z-1 absolute md:right-2 lg:right-0 top-1' /> 

      <img src="/image3.jpg" className='lg:w-60 md:w-48 lg:h-60 md:h-48 rounded-[50%] border-8 border-white z-1 absolute right-0 top-50'  /> 
    </div>
  )
}

export default Slides
