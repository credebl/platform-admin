import Image from 'next/image'
import React from 'react'
/* eslint-disable no-unused-vars */
interface PaginationProps {
  currentPage: number
  totalItems: number
  pageSize: number
  hasNextPage: boolean
  hasPreviousPage: boolean
  nextPage: number | null
  previousPage: number | null
  lastPage: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  hasNextPage,
  hasPreviousPage,
  nextPage,
  previousPage,
  onPageChange,
}) => {
  const handlePreviousPage = (): void => {
    if (hasPreviousPage && previousPage !== null) {
      onPageChange(previousPage)
    }
  }

  const handleNextPage = (): void => {
    if (hasNextPage && nextPage !== null) {
      onPageChange(nextPage)
    }
  }

  const firstValue = (currentPage - 1) * pageSize
  const startIndex = Math.max(0, firstValue + 1)
  const endIndex = Math.min(currentPage * pageSize, totalItems)

  return (
    <>
      <div className="text-sm text-grayText">
        show <span className="font-bold">{startIndex}-{endIndex} &nbsp;</span>
        of <span className="font-bold">{totalItems}</span>
      </div>
      <div className="flex gap-2">
        {hasPreviousPage ? (
          <Image
            src={'/images/pagination/darkArrowLessThan.svg'}
            width={10}
            height={16}
            alt="lessthan_icon"
            onClick={handlePreviousPage}
            className="mx-2 my-1"
            style={{ cursor: hasPreviousPage ? 'pointer' : 'not-allowed' }}
          />
        ) : (
          <Image
            src={'/images/pagination/grayArrow.svg'}
            width={10}
            height={16}
            alt="lessthan_icon"
            onClick={handlePreviousPage}
            className="mx-2 my-1"
            style={{ cursor: hasPreviousPage ? 'pointer' : 'not-allowed' }}
          />
        )}

        <div
          className={`px-3 py-1 ${!hasPreviousPage && 'hidden'} cursor-pointer`}
          onClick={handlePreviousPage}
        >{`${previousPage}`}</div>

        <div className="rounded-full border bg-primary-900 px-3 py-1 text-custom-900 cursor-pointer">
          {currentPage}
        </div>
        <div
          className={`px-3 py-1 ${!hasNextPage && 'hidden'} cursor-pointer`}
          onClick={handleNextPage}
        >{`${nextPage}`}</div>

        {hasNextPage ? (
          <Image
            src={'/images/pagination/darkArrow.svg'}
            width={10}
            height={16}
            alt="lessthan_icon"
            onClick={handleNextPage}
            className="mx-2 my-1"
            style={{ cursor: hasNextPage ? 'pointer' : 'not-allowed' }}
          />
        ) : (
          <Image
            src={'/images/pagination/greaterThanDarkArrow.svg'}
            width={10}
            height={16}
            alt="lessthan_icon"
            onClick={handleNextPage}
            className="mx-2 my-1"
            style={{ cursor: hasNextPage ? 'pointer' : 'not-allowed' }}
          />
        )}
      </div>
    </>
  )
}

export default Pagination
