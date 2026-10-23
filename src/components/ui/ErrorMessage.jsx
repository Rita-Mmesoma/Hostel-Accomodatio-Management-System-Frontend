const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className='bg-red-50 text-red-700 rounded-xl p-6 text-center'>
      <p className='mb-3'>{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className='px-4 py-2 rounded-lg bg-red-600 text-white font-semibold cursor-pointer'
        >
          Try again
        </button>
      )}
    </div>
  )
}

export default ErrorMessage