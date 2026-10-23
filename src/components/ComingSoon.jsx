const ComingSoon = ({ title }) => {
  return (
    <div className='bg-white border border-stone-200 rounded-2xl p-8 text-center max-w-lg mx-auto'>
      <h2 className='text-xl font-semibold mb-2'>{title}</h2>
      <p className='text-gray-500'>This page is coming soon.</p>
    </div>
  )
}

export default ComingSoon