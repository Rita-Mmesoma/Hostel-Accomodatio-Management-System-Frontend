const code = '482913' // in the real app this comes from the backend
const hostel = 'Mary Slessor Hall'

const steps = [
  `Go to ${hostel} with your student ID and this code.`,
  'The porter on duty will enter this code to complete your check-in.',
  "Once verified, the code becomes invalid and can't be reused or shared.",
]

const CheckInCode = () => {
  return (
    <div>
      <h2 className='text-xl font-semibold mb-6'>My check-in code</h2>

      <div className='max-w-md mx-auto bg-white border border-stone-200 rounded-3xl shadow-xl overflow-hidden'>

        <div className='bg-green-700 text-center px-6 py-6'>
          <p className='text-sm text-white/70 mb-1'>{hostel} — Room A2, Corner A2-1</p>
          <p className='text-white font-semibold text-lg'>Chidinma Okafor</p>
        </div>

        <div className='relative'>
          <div className='mx-6 border-t-2 border-dashed border-stone-200' />
          <div className='absolute -top-3 -left-3 w-6 h-6 rounded-full bg-stone-50' />
          <div className='absolute -top-3 -right-3 w-6 h-6 rounded-full bg-stone-50' />
        </div>

        <div className='px-6 pt-6 pb-7'>
          <p className='text-center text-sm font-semibold text-gray-500 tracking-wide'>
            SHOW THIS CODE TO THE PORTER
          </p>

          <div className='flex justify-center gap-2 mt-5 mb-3'>
            {code.split('').map((digit, i) => (
              <div
                key={i}
                className='w-11 h-14 rounded-lg border border-stone-200 bg-green-50 text-green-600 text-2xl font-bold flex items-center justify-center'
              >
                {digit}
              </div>
            ))}
          </div>

          <p className='text-center text-sm text-gray-400'>Valid for one check-in only</p>

          <ol className='mt-5 flex flex-col gap-3'>
            {steps.map((step, i) => (
              <li key={i} className='flex gap-3 text-gray-600'>
                <span className='w-6 h-6 shrink-0 rounded-full bg-green-50 text-green-900 text-xs font-bold flex items-center justify-center mt-0.5'>
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

      </div>
    </div>
  )
}

export default CheckInCode