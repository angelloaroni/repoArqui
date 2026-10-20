export default function DataTable({ columns, rows, emptyMessage = "Aún no hay registros." }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => <th key={column.key}>{column.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="empty-cell" colSpan={columns.length}>{emptyMessage}</td></tr>
          ) : rows.map((row) => (
            <tr key={row.id ?? JSON.stringify(row)}>
              {columns.map((column) => (
                <td key={column.key}>
                  {column.render ? column.render(row[column.key], row) : (row[column.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

