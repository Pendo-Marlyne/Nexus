import { useMemo, useState, type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu'

export interface DataTableColumn<T> {
  key: keyof T & string
  title: string
  sortable?: boolean
  render?: (row: T) => ReactNode
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[]
  columns: DataTableColumn<T>[]
  pageSize?: number
  rowActions?: (row: T) => ReactNode
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pageSize = 10,
  rowActions,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [page, setPage] = useState(1)
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([])

  const visibleColumns = columns.filter((column) => !hiddenColumns.includes(column.key))

  const sorted = useMemo(() => {
    if (!sortKey) return data
    return [...data].sort((a, b) => {
      const left = a[sortKey]
      const right = b[sortKey]
      if (left === right) return 0
      if (left == null) return 1
      if (right == null) return -1
      const result = String(left).localeCompare(String(right), undefined, { numeric: true })
      return sortAsc ? result : -result
    })
  }, [data, sortAsc, sortKey])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border p-3">
        <strong>Table</strong>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Columns</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {columns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.key}
                checked={!hiddenColumns.includes(column.key)}
                onCheckedChange={(checked) =>
                  setHiddenColumns((prev) =>
                    checked ? prev.filter((item) => item !== column.key) : [...prev, column.key]
                  )
                }
              >
                {column.title}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            {visibleColumns.map((column) => (
              <th key={column.key} className="px-3 py-2 text-left">
                <button
                  type="button"
                  className="inline-flex items-center gap-1"
                  onClick={() => {
                    if (!column.sortable) return
                    if (sortKey === column.key) setSortAsc((value) => !value)
                    else {
                      setSortKey(column.key)
                      setSortAsc(true)
                    }
                  }}
                >
                  {column.title}
                  {sortKey === column.key ? sortAsc ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" /> : null}
                </button>
              </th>
            ))}
            {rowActions ? <th className="px-3 py-2 text-left">Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {paginated.map((row, index) => (
            <tr key={index} className="border-t border-border">
              {visibleColumns.map((column) => (
                <td key={column.key} className="px-3 py-2">
                  {column.render ? column.render(row) : String(row[column.key] ?? '')}
                </td>
              ))}
              {rowActions ? <td className="px-3 py-2">{rowActions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-border p-3">
        <span>
          Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

