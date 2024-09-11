import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid"
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "./ui/pagination"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const TablePagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  setRowsPerPage,
  rowsPerPage
}: {
  currentPage: number,
  totalPages: number,
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>,
  setRowsPerPage: React.Dispatch<React.SetStateAction<number>>,
  rowsPerPage: number
}) => {
  return (
    <div className='flex items-center gap-4'>
      <div className='hidden md:flex items-center gap-2 text-nowrap flex-nowrap text-sm font-medium'>
        Rows per page
        <Select
          value={rowsPerPage.toString()}
          defaultValue={rowsPerPage.toString()}
          onValueChange={(value) => setRowsPerPage(parseInt(value))}
        >
          <SelectTrigger className='h-8'>
            <SelectValue placeholder={rowsPerPage.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='10'>10</SelectItem>
            <SelectItem value='20'>20</SelectItem>
            <SelectItem value='30'>30</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <span className='text-sm text-muted-foreground text-nowrap font-medium'>
        Page {currentPage} of {totalPages}
      </span>
      <Pagination>
        <PaginationContent>
          <PaginationItem className='cursor-pointer'>
            <PaginationLink
              className='size-8'
              disabled={currentPage === 1}
              isActive={true}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronDoubleLeftIcon className='h-4 w-4' />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem className='cursor-pointer'>
            <PaginationLink
              className='size-8'
              disabled={currentPage === 1}
              isActive={true}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeftIcon className='h-4 w-4' />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem className='cursor-pointer'>
            <PaginationLink
              className='size-8'
              disabled={currentPage === totalPages}
              isActive={true}
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRightIcon className='h-4 w-4' />
            </PaginationLink>
          </PaginationItem>
          <PaginationItem className='cursor-pointer'>
            <PaginationLink
              className='size-8'
              disabled={currentPage === totalPages}
              isActive={true}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronDoubleRightIcon className='h-4 w-4' />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export default TablePagination;
