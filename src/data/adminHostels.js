// Builds beds for a room from a list of statuses
const makeBeds = (roomId, statuses) =>
  statuses.map((status, i) => ({
    id: `${roomId}-b${i + 1}`,
    label: `Corner ${i + 1}`,
    status, // 'available' | 'pending' | 'allocated'
    studentName: status === 'available' ? '' : ['Chidinma O.', 'Emeka N.', 'Ada U.', 'Tunde B.'][i % 4],
    regNo: status === 'available' ? '' : `2025/43${6055 + i * 13}`,
    expiresIn: status === 'pending' ? '31h' : '',
  }))

const makeRoom = (id, number, statuses, active = true) => ({
  id,
  number,
  active,
  beds: makeBeds(id, statuses),
})

export const adminHostels = [
  {
    id: 'h1',
    name: 'Hall 1',
    active: true,
    rooms: [
      makeRoom('r1', 'A101', ['allocated', 'allocated', 'allocated', 'allocated']),
      makeRoom('r2', 'A102', ['allocated', 'allocated', 'pending', 'available']),
      makeRoom('r3', 'A103', ['available', 'available', 'available', 'available', 'available', 'available']),
      makeRoom('r4', 'A104', ['available', 'available', 'available', 'available'], false),
    ],
  },
  {
    id: 'h2',
    name: 'Hall 2',
    active: true,
    rooms: [
      makeRoom('r5', 'B201', ['allocated', 'allocated', 'allocated', 'pending']),
      makeRoom('r6', 'B202', ['allocated', 'allocated', 'allocated', 'allocated']),
      makeRoom('r7', 'B203', ['allocated', 'allocated', 'available', 'allocated']),
    ],
  },
  {
    id: 'h3',
    name: 'Hall 3',
    active: false,
    rooms: [
      makeRoom('r8', 'C301', ['available', 'available', 'available', 'available']),
      makeRoom('r9', 'C302', ['available', 'available', 'available', 'available']),
    ],
  },
]

// Counts beds in a list of rooms. A bed is "taken" when it is allocated or pending.
export const getStats = (rooms) => {
  let totalBeds = 0
  let takenBeds = 0

  rooms.forEach((room) => {
    totalBeds += room.beds.length
    room.beds.forEach((bed) => {
      if (bed.status !== 'available') takenBeds += 1
    })
  })

  const percent = totalBeds === 0 ? 0 : Math.round((takenBeds / totalBeds) * 100)
  return { totalBeds, takenBeds, percent }
}

// Works out a room's status label
export const getRoomStatus = (room) => {
  if (!room.active) return 'Inactive'
  const { totalBeds, takenBeds } = getStats([room])
  if (totalBeds > 0 && takenBeds === totalBeds) return 'Full'
  return 'Available'
}