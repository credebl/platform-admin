import React from 'react'
import { FaCheckCircle, FaExclamationCircle, FaTimes } from 'react-icons/fa'
import classNames from 'classnames'

interface AlertProps {
  type: string
  message: string
  closeAlert: () => void
}

const Alert: React.FC<AlertProps> = ({ type, message, closeAlert }) => {
  const alertClasses = classNames(
    'relative rounded border px-4 py-1 shadow-md transition-all duration-300 ease-in-out',
    {
      'border-red-400 bg-red-100 text-red-700': type === 'danger',
      'border-green-400 bg-green-100 text-green-700': type === 'success',
    },
  )

  const iconClasses = classNames('h-6 w-6 mr-2', {
    'text-red-500': type === 'danger',
    'text-green-500': type === 'success',
  })

  const getIcon = () => {
    if (type === 'danger') {
      return <FaExclamationCircle className={iconClasses} />
    }
    if (type === 'success') {
      return <FaCheckCircle className={iconClasses} />
    }
  }

  return (
    <div className="mx-auto mb-4 w-full max-w-2xl">
      <div
        className={alertClasses}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <div className="flex items-center">
          {getIcon()}
          <span className="block flex-1 break-words">{message}</span>
          <button
            className="ml-4 flex items-center justify-center rounded-full p-1 hover:bg-gray-200 focus:outline-none"
            onClick={closeAlert}
            aria-label="Close alert"
          >
            <FaTimes className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Alert
