ARG NODE_VERSION

FROM node:${NODE_VERSION} AS runner
ENV CI=true
WORKDIR /app
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
RUN corepack enable && corepack prepare
RUN pnpm install --frozen-lockfile

CMD [ "pnpm", "-r", "--if-present", "--parallel", "run", "dev" ]
