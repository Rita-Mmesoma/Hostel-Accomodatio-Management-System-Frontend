const Logo = ({text}) => {
  return (
    <div className='flex flex-col items-center gap-4'>
      <h1 className='text-white text-xl md:text-2xl font-bold'>{text}</h1>
      <img src="/logo.jpg" className='w-28 md:w-40 drop-shadow-xl' />
    </div>
  )
}

export default Logo