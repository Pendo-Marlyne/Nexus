import { jsPDF } from 'jspdf'
import { Button } from '../ui/button'

interface ExportReportButtonProps {
  title: string
  sections: Array<{ heading: string; lines: string[] }>
}

export function ExportReportButton({ title, sections }: ExportReportButtonProps) {
  const exportPdf = () => {
    const doc = new jsPDF()
    let y = 14
    doc.setFontSize(16)
    doc.text(title, 14, y)
    y += 8
    doc.setFontSize(10)
    sections.forEach((section) => {
      doc.setFontSize(12)
      doc.text(section.heading, 14, y)
      y += 6
      doc.setFontSize(10)
      section.lines.forEach((line) => {
        doc.text(`- ${line}`, 16, y)
        y += 5
      })
      y += 4
      if (y > 270) {
        doc.addPage()
        y = 14
      }
    })
    doc.save('helix-analytics-report.pdf')
  }

  return <Button onClick={exportPdf}>Export to PDF</Button>
}

