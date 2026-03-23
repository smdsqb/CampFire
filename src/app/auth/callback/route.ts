import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const { origin } = url
  const next = url.searchParams.get('next')

  const safeNext = next && next.startsWith('/') ? next : '/'
  return NextResponse.redirect(`${origin}${safeNext}`)
}
