import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { trpcRouter } from '#/integrations/trpc/router'
import { createAPIFileRoute } from '@tanstack/react-start/api'

function handler({ request }: { request: Request }) {
  return fetchRequestHandler({
    req: request,
    router: trpcRouter,
    endpoint: '/api/trpc',
  })
}

export const APIRoute = createAPIFileRoute('/api/trpc/$')({
  GET: handler,
  POST: handler,
})
