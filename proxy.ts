import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const authHeader = request.headers.get('authorization')

  if (authHeader?.startsWith('Basic ')) {
    const decoded = atob(authHeader.slice(6))
    const [username, password] = decoded.split(':')

    if (
      username === process.env.DASHBOARD_USERNAME &&
      password === process.env.DASHBOARD_PASSWORD
    ) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="puppy-evals"' },
  })
}

export const config = {
  matcher: ['/runs/:path*', '/compare/:path*'],
}
