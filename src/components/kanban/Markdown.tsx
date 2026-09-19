import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders card notes. Raw HTML stays disabled (react-markdown's default), so notes can't inject markup. */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-invert prose-headings:font-extrabold prose-headings:tracking-tight prose-a:text-accent-light prose-code:rounded prose-code:bg-white/[0.06] prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: label }) => (
            <a href={href} target="_blank" rel="noreferrer">
              {label}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
