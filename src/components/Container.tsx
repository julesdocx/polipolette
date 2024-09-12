import Link from 'next/link'

export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="container">
      <main>{children}</main>
    </div>
  )
}
