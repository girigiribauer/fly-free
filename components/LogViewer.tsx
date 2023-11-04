import { useState } from 'react'

export type LogViewerProps = {
  logs: string[]
}

export const LogViewer = ({ logs }: LogViewerProps) => {
  const [expaneded, setExpaneded] = useState<boolean>(false)

  return (
    <code
      style={{
        position: 'fixed',
        right: 0,
        bottom: 0,
        zIndex: 100,
        width: expaneded ? '100%' : '50px',
        height: expaneded ? '100%' : '50px',
        background: expaneded ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
      }}
      onClick={() => setExpaneded(!expaneded)}>
      <pre
        style={{
          width: '100%',
          height: '100%',
          overflowX: 'auto',
          overflowY: 'scroll',
          margin: 0,
          padding: '1rem',
          boxSizing: 'border-box',
          fontSize: '6px',
          textWrap: 'wrap',
        }}>
        {logs.join('\n')}
      </pre>
    </code>
  )
}
