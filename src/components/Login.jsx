import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginStudent, saveLogin, clearLogin } from '../api/auth'
import { Spinner } from './ui/Loader'


const inputClass = 'border w-full outline-none text-md border-gray-300 p-3 rounded-md focus:border-green-700'

const Login = () => {
  const [registrationNo, setRegistrationNo] = useState('')
  const [rrr, setRrr] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const cleanRegNo = registrationNo.trim()
    const cleanRrr = rrr.trim()

    try { 
      clearLogin()
      const res = await loginStudent(cleanRegNo, cleanRrr)

      saveLogin(res, 'student', { registrationNo: cleanRegNo, rrr: cleanRrr })

      navigate('/dashboard')
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

          <div className='mb-3 w-full '>
              <label className='block mb-1 text-lg font-medium'>Reg Number</label>
              <input 
                value={registrationNo}
                onChange={(e) => setRegistrationNo(e.target.value)}
                type="text" 
                required 
                className={inputClass}
                placeholder='Reg Number' 
              />
          </div>

          <div className='mb-8 w-full '>
              <label className='block mb-1 text-lg font-medium'>RRR</label>
              <input 
              value={rrr}
              onChange={(e) => setRrr(e.target.value)}
              type="text" 
              required 
              className={inputClass}
              placeholder='School Fees RRR' 
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

          <p className='text-[13px]'>Not a staff? <Link to="/adminlogin" className='text-green-600'>Login as an admin</Link></p>
        </form>
      </div>
      </div>
    )
}

export default Login
