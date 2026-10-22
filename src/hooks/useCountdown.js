import { useEffect, useState } from 'react'

const useCountdown = (deadline) => {
  const [remaining, setRemaining] = useState(Math.max(0, deadline - Date.now()))

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining(Math.max(0, deadline - Date.now()))
    }, 1000)

    return () => clearInterval(id)
  }, [deadline])

  const hours = Math.floor(remaining / 3600000)
  const minutes = Math.floor((remaining % 3600000) / 60000)
  const seconds = Math.floor((remaining % 60000) / 1000)

  return { hours, minutes, seconds, remaining }
}

export default useCountdown