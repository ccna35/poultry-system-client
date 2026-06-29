import SurfaceCard from "@/components/common/SurfaceCard"

type TableColumn<Row> = {
  key: string
  title: string
  render: (row: Row) => React.ReactNode
}

type DataTableProps<Row> = {
  title: string
  actionLabel?: string
  rows: Row[]
  columns: TableColumn<Row>[]
  emptyText: string
}

function DataTable<Row>({
  title,
  actionLabel,
  rows,
  columns,
  emptyText,
}: DataTableProps<Row>) {
  return (
    <SurfaceCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#EDF1EA] px-5 py-4 sm:px-6">
        <h3 className="font-heading text-lg font-semibold text-slate-900">
          {title}
        </h3>
        {actionLabel ? (
          <span className="text-sm font-medium text-[#6E8F68]">
            {actionLabel}
          </span>
        ) : null}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-right text-sm">
          <thead className="bg-[#FBFCF8] text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-5 py-3 font-medium sm:px-6">
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="border-t border-[#EDF1EA] text-slate-700"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-5 py-3 align-top sm:px-6"
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-5 py-10 text-center text-slate-400 sm:px-6"
                  colSpan={columns.length}
                >
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </SurfaceCard>
  )
}

export default DataTable
