import { CodeXml } from 'lucide-react'
import Link from 'next/link'

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-lg font-bold font-headline"
    >
      <CodeXml className="h-6 w-6 text-primary" />
      <span>w3Develops</span>
    </Link>
  )
}
