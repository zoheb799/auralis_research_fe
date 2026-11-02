import ReactMarkdown from 'react-markdown'
import remarkBreaks from 'remark-breaks'
import remarkGfm from 'remark-gfm'

interface MarkdownMessageProps {
  content: string
  className?: string
  darkMode?: boolean
}

export function MarkdownMessage({ content, className = '', darkMode = false }: MarkdownMessageProps) {
  const darkModeClasses = darkMode
    ? 'dark:text-slate-200 dark:[&_a]:text-sky-300 dark:[&_blockquote]:text-slate-400 dark:[&_td]:border-slate-700 dark:[&_th]:border-slate-700 dark:[&_th]:bg-slate-800'
    : ''

  return (
    <div className={`min-w-0 break-words text-sm leading-6 text-slate-700 [&_a]:text-sky-700 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-sky-300 [&_blockquote]:pl-3 [&_blockquote]:text-slate-500 [&_h1]:mb-2 [&_h1]:mt-4 [&_h1]:text-lg [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold [&_h3]:mb-1 [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_ol_li]:list-decimal [&_p]:mb-2 [&_p:last-child]:mb-0 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-slate-200 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-slate-200 [&_th]:bg-slate-100 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left [&_th]:font-semibold [&_ul]:my-2 [&_ul]:space-y-1 ${darkModeClasses} ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{content}</ReactMarkdown>
    </div>
  )
}
