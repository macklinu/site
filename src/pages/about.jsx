import Image from 'next/future/image'
import Head from 'next/head'
import Link from 'next/link'
import clsx from 'clsx'

import { Container } from '@/components/Container'
import { Prose } from '@/components/Prose'
import { TwitterIcon, GitHubIcon, LinkedInIcon } from '@/components/SocialIcons'
import portraitImage from '@/images/snow.jpg'
import { SocialLinks } from '@/lib/social'

function SocialLink({ className, href, children, icon: Icon }) {
  return (
    <li className={clsx(className, 'flex')}>
      <Link
        href={href}
        className="group flex text-sm font-medium text-zinc-800 transition hover:text-brand-500 dark:text-zinc-200 dark:hover:text-brand-500"
      >
        <Icon className="h-6 w-6 flex-none fill-zinc-500 transition group-hover:fill-brand-500" />
        <span className="ml-4">{children}</span>
      </Link>
    </li>
  )
}

export default function About() {
  return (
    <>
      <Head>
        <title>About - Mackie Underdown</title>
        <meta
          name="description"
          content="I’m Mackie Underdown. I live in Detroit and make software and music."
        />
      </Head>
      <Container className="mt-16 sm:mt-32">
        <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:grid-rows-[auto_1fr] lg:gap-y-12">
          <div className="lg:pl-20">
            <div className="max-w-xs px-2.5 lg:max-w-none">
              <Image
                src={portraitImage}
                alt=""
                sizes="(min-width: 1024px) 32rem, 20rem"
                className="aspect-square rotate-3 rounded-2xl bg-zinc-100 object-cover dark:bg-zinc-800"
              />
            </div>
          </div>
          <div className="lg:order-first lg:row-span-2">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-800 dark:text-zinc-100 sm:text-5xl">
              I’m Mackie Underdown. I live in Detroit and make software for the
              web.
            </h1>
            <Prose className="mt-6 space-y-7 text-base text-zinc-600 dark:text-zinc-400">
              <p>
                I studied a mix of music, engineering, and art in college, but I
                have spent my professional career working in the tech industry.
              </p>
              <p>
                I have experience with Android and full-stack web engineering
                (Node.js, TypeScript, React, and Ruby on Rails), with job
                experiences ranging from startups in San Francisco to large
                companies in Detroit and throughout the United States. In
                addition, I have also contributed to various open source
                software projects, such as maintaining a couple of widely used
                ESLint plugins for a period of time
                <sup>
                  <Link href="https://github.com/jest-community/eslint-plugin-jest">
                    [1]
                  </Link>
                </sup>
                <sup>
                  <Link href="https://github.com/xjamundx/eslint-plugin-promise">
                    [2]
                  </Link>
                </sup>
                .
              </p>
              <p>
                Besides working with code, I enjoy playing music – guitar, bass,
                piano, and producing in Ableton Live. I also love to play
                basketball and video games.
              </p>
            </Prose>
          </div>
          <div className="lg:pl-20">
            <ul role="list">
              <SocialLink href={SocialLinks.Twitter} icon={TwitterIcon}>
                Follow on Twitter
              </SocialLink>
              <SocialLink
                href={SocialLinks.GitHub}
                icon={GitHubIcon}
                className="mt-4"
              >
                Follow on GitHub
              </SocialLink>
              <SocialLink
                href={SocialLinks.LinkedIn}
                icon={LinkedInIcon}
                className="mt-4"
              >
                Follow on LinkedIn
              </SocialLink>
            </ul>
          </div>
        </div>
      </Container>
    </>
  )
}
