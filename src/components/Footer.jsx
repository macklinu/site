import Link from 'next/link'

import { Container } from '@/components/Container'

function NavLink({ href, children }) {
  return (
    <Link
      href={href}
      className="transition hover:text-brand-500 dark:hover:text-brand-400"
    >
      {children}
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="mt-32">
      <Container.Outer>
        <div className="border-zinc-100 dark:border-zinc-700/40 border-t pt-10 pb-16">
          <Container.Inner>
            <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div className="text-zinc-800 dark:text-zinc-200 flex gap-6 text-sm font-medium">
                <NavLink href="/about">About</NavLink>
                <NavLink href="/posts">Posts</NavLink>
                <NavLink href="/projects">Projects</NavLink>
              </div>
              <p className="text-zinc-400 dark:text-zinc-500 text-sm">
                &copy; {new Date().getFullYear()} Mackie Underdown. All rights
                reserved.
              </p>
            </div>
          </Container.Inner>
        </div>
      </Container.Outer>
    </footer>
  )
}
