const Logo = ({ text, textClass = 'text-white', imgClass = 'w-28 md:w-40' }) => {
  return (
    <div className='flex flex-col items-center gap-4'>
      <h1 className={`${textClass} text-xl md:text-2xl font-bold`}>{text}</h1>
      <img src="/logo.jpg" className={`${imgClass} drop-shadow-xl`} />
    </div>
  )
}

export default Logo