# explan

Project planning software.

## npm incantations

This was the incantation that I found that works to install esbuild and eslint with TypeScript linting.

    npm install --save-exact --save-dev @eslint/js @tsconfig/recommended eslint globals typescript typescript-eslint esbuild @web/test-runner @esm-bundle/chai @web/dev-server-esbuild @web/test-runner-puppeteer

Tests are working, at least for:

    npx web-test-runner ./src/stats/cdf/triangular/triangular_test.ts --puppeteer --verbose

Add `--watch` to have it run continuously.
