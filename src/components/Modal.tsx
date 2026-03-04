import React, { ReactNode } from 'react'

import { Card } from './ui/card'
import Image from 'next/image'

interface ModalProps {
  children: ReactNode
  title?: string
  closePopup: () => void
  className?: string
  showCloseButton?: boolean
}

const Modal: React.FC<ModalProps> = ({
  children,
  title,
  closePopup,
  className,
  showCloseButton = true,
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
      <Card
        className={`relative m-4 rounded-lg border p-4 shadow-md ${className}`}
      >
        {showCloseButton && (
          <Image
            src={'/images/closeBlack.svg'}
            alt="close_icon"
            width={24}
            height={24}
            className="absolute right-3 top-3"
            onClick={closePopup}
          />
        )}
        <div className="text-md 2xl:text-lg">{title}</div>
        {children}
      </Card>
    </div>
)

export default Modal
