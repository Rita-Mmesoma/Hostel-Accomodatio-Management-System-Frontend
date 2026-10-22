import { Link } from 'react-router-dom'

const ActionCard = ({ to, label, desc, icon: Icon }) => {
  return (
    <Link
      to={to}
      className='bg-white border border-stone-200 rounded-2xl p-5 hover:border-green-700 transition-colors'
    >
      <div className='w-10 h-10 rounded-xl bg-green-50 text-green-800 flex items-center justify-center mb-4'>
        <Icon size={19} />
      </div>
      <p className='font-semibold mb-1'>{label}</p>
      <p className='text-sm text-gray-500'>{desc}</p>
    </Link>
  )
}

export default ActionCard