export const Spinner = ({ size = 20, className = '' }) => {
  return (
    <span
      style={{ width: size, height: size }}
      className={`inline-block rounded-full border-2 border-current border-t-transparent animate-spin ${className}`}
    />
  )
}

const Loader = ({ text = 'Loading...' }) => {
  return (
    <div className='flex flex-col items-center justify-center gap-3 py-16 text-green-800'>
      <Spinner size={32} />
      <p className='text-sm text-gray-500'>{text}</p>
    </div>
  )
}

export default Loader