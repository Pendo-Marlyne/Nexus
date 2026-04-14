export function ExportButton({ fileName, payload }) {
  const onExport = () => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = fileName
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <button className="btn" onClick={onExport}>
      Export Snapshot
    </button>
  )
}
