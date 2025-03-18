import {
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router"
import type { ReactNode } from "react"
import appCss from "../app.css?url"
import icon from "../icon.webp?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Artifex",
      },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: icon },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body className="text-stone-300 bg-stone-800 font-mono">
        {children}
        <Scripts />
      </body>
    </html>
  )
}
