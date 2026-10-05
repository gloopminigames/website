// Toont een stukje HTML (bijv. een Gloopie-SVG) zonder extra opmaak eromheen.
export default function Html({ html, className }: { html: string; className?: string }) {
  return <span className={className} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}
