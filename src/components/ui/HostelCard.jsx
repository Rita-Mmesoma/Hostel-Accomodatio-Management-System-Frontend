import { Spinner } from './Loader'

const formatFee = (fee) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
  }).format(Number(fee))

// "MALE" -> "Male"
const formatGender = (gender) =>
  gender ? gender.charAt(0) + gender.slice(1).toLowerCase() : ''

const HostelCard = ({ id, name, gender, description, imageUrl, accommodationFee }) => {
  return (
    <div className='bg-white border border-stone-200 rounded-2xl overflow-hidden flex flex-col'>

      <div className='relative h-40 bg-linear-to-br from-green-600 to-green-800'>
        {imageUrl && (
          <img src={imageUrl} alt={name} className='w-full h-full object-cover' />
        )}
        <span className='absolute bottom-3 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold bg-black/50 text-white'>
          <span className='w-1.5 h-1.5 rounded-full bg-current' />
          {formatGender(gender)}
        </span>
      </div>

      <div className='p-5 flex flex-col gap-3 flex-1'>
        <h3 className='text-lg font-semibold'>{name}</h3>

        {description && <p className='text-sm text-gray-500'>{description}</p>}

        <div className='flex justify-between items-center text-sm mt-auto'>
          <span className='text-gray-500'>Accommodation fee</span>
          <span className='font-semibold'>{formatFee(accommodationFee)}</span>
        </div>

       <button
          onClick={() => onApply(id)}
          disabled={disabled}
          className='w-full py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed'
        >
          {applying && <Spinner size={16} />}
          {applying ? 'Applying...' : 'Apply for this hostel'}
        </button>

      </div>
    </div>
  )
}

export default HostelCard