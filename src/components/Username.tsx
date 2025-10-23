import React, { useRef } from 'react'
import { useUser } from '../contexts/UserContext.tsx'

function Username() {
  const { username, setUsername } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRef.current?.value.trim()) {
      setUsername(inputRef.current.value.trim());
      inputRef.current.value = ''; // clear input after setting
    }
  }


  return (
    <div className="p-4 flex justify-center items-center  h-screen">
      <div className='p-4 bg-gray-100 rounded-md border-2 border-black'>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Enter username"
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-500 text-white rounded"
          >
            Save
          </button>
        </form>
        {username && <p className="mt-2">Current username: {username}</p>}
      </div>
    </div>
  )
}

export default Username;