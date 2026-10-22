import { Link } from 'react-router-dom'


const AdminLogin = () => {
const handleLogin = (e) => {
    e.preventDefault()
    // login logic goes here later
  }

  return (
    <div>
      <div className='bg-white shadow-xl w-94 md:h-100 h-75 flex justify-center items-center rounded-lg'>

      <form className='flex flex-col w-[90%] h-[90%] justify-center items-center'>

        <div className='mb-3 w-full '>
            <label className='block mb-1 text-lg font-medium'>Staff ID</label>
            <input type="text" required className='border w-full outline-none text-md border-gray-300 p-3 rounded-md' placeholder='Staff ID' />
        </div>

        <div className='mb-8 w-full '>
            <label className='block mb-1 text-lg font-medium'>Email</label>
            <input type="email" required className='border w-full outline-none text-md border-gray-300 p-3 rounded-md' placeholder='Email' />
        </div>

        <button type="submit" className='w-full h-9 bg-green-600 mb-3 text-white font-bold rounded-2xl cursor-pointer'>Login</button>

        <p className='text-[13px]'>Not a staff? <Link to="/login" className='text-green-600'>Login as student</Link></p>
      </form>
    </div>
    </div>
  )
}

export default AdminLogin
