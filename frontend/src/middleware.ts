import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Por enquanto, vamos permitir acesso a todas as rotas
  // A validação de autenticação será feita do lado do cliente
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/login']
} 