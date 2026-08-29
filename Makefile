.PHONY: site

client:
	pnpm --filter client run dev

server:
	pnpm --filter server run dev

remote-service:
	pnpm --filter remote-service run dev

site:
	cd site && npm run dev
	