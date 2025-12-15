This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## API Integration

This app talks to the QuickComm backend under the `/api` prefix. An axios-backed service is implemented at `app/services/api.ts`.

- Base URL: `process.env.NEXT_PUBLIC_API_URL` (defaults to `http://localhost:4000/api`)
- Socket URL: `process.env.NEXT_PUBLIC_SOCKET_URL` (defaults to `http://localhost:4000`)

Available service groups:
- `authApi` — `/auth/login`, `/auth/register`, `/auth/profile`
- `customerApi` — `/orders`, `/orders/my`, `/orders/:id`
- `storeApi` — `/store/orders`, store actions `/store/orders/:id/accept`, `/store/orders/:id/packing`, `/store/orders/:id/packed`
- `deliveryApi` — `/delivery/orders/unassigned`, `/delivery/orders/:id/accept`, `/delivery/orders/:id/status`, `/delivery/orders/my`
- `adminApi` — `/admin/orders`, `/admin/delivery-partners`, `/admin/live-stats`, `/admin/stores/:id`

Auth token (JWT) is read from `localStorage.token` and attached to requests automatically.

