import { useNavigate } from 'react-router-dom'
import { clearLogin } from '../api/auth'

const SignOut = () => {
  const navigate = useNavigate()
  const isAdmin = localStorage.getItem('role') === 'admin'

  const handleSignOut = () => {
    clearLogin()
    navigate(isAdmin ? '/adminlogin' : '/')
  }

  return (
    <div className='flex justify-center items-center min-h-[70vh]'>
      <div className='bg-white shadow-xl rounded-lg p-8 w-full max-w-sm text-center'>
        <h2 className='text-xl font-semibold mb-2'>Sign out?</h2>
        <p className='text-gray-500 mb-6'>
          {isAdmin
            ? "You'll need to enter your email and password again to get back in."
            : "You'll need to verify your RRR again to get back into your account."}
        </p>

        <button
          onClick={handleSignOut}
          className='w-full py-3 rounded-lg bg-green-800 text-white font-semibold hover:bg-green-900 transition-colors cursor-pointer mb-3'
        >
          Yes, sign me out
        </button>

        <button
          onClick={() => navigate(-1)}
          className='w-full py-3 rounded-lg border border-stone-200 text-gray-600 font-semibold hover:bg-stone-50 cursor-pointer'
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

export default SignOut