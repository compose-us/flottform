ARG NODE_VERSION

FROM node:${NODE_VERSION} AS runner
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare
RUN pnpm -r install

CMD [ "pnpm", "-r", "--if-present", "--parallel", "run", "dev" ]
