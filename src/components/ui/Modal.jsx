const Modal = ({ title, onClose, children }) => {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Dark overlay: clicking it closes the modal */}
      <div className='absolute inset-0 bg-black/40' onClick={onClose} />

      <div className='relative bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md'>
        <h2 className='text-lg font-bold text-stone-900 mb-4'>{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default Modal