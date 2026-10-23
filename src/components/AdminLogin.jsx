import { useState } from 'react'
import { Link, useNavigate  } from 'react-router-dom'
import { loginAdmin, saveLogin, clearLogin } from '../api/auth'
import { Spinner } from './ui/Loader'


const inputClass = 'border w-full outline-none text-md border-gray-300 p-3 rounded-md focus:border-green-700'

const AdminLogin = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      clearLogin() // remove any old session before trying again
      const res = await loginAdmin(email.trim(), password)

      saveLogin(res, 'admin')
      navigate('/admin/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className='bg-white shadow-xl w-[90vw] max-w-94 md:h-110 h-110 flex justify-center items-center rounded-lg'>

      <form onSubmit={handleLogin} className='flex flex-col w-[90%] h-[90%] justify-center items-center'>
        <div className='mb-3 w-full'>
            <label className='block mb-1 text-lg font-medium'>Email</label>
            <input
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              type="email" 
              required 
              className={inputClass}
              placeholder='you@unn.edu.ng'
            />
        </div>

        <div className='mb-8 w-full '>
            <label className='block mb-1 text-lg font-medium'>Password</label>
            <input 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              type="password" 
              required 
              className={inputClass}
              placeholder='Password'
            />  
        </div>

        {error && (
          <p className='bg-red-50 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm'>{error}</p>
        )}

        <button
          type='submit'
          disabled={loading}
          className='w-full h-10 bg-green-600 mb-3 text-white font-bold rounded-2xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2'
        >
          {loading && <Spinner size={16} />}
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className='text-[13px]'>Not a staff? <Link to="/" className='text-green-600'>Login as student</Link></p>
      </form>
    </div>
    </div>
  )
}

export default AdminLogin
