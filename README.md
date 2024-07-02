# explan

Project planning software.

## npm incantations

This was the incantation that I found that works to install esbuild and eslint with TypeScript linting.

    npm install --save-exact --save-dev @eslint/js @tsconfig/recommended eslint globals typescript typescript-eslint esbuild @web/test-runner @esm-bundle/chai @web/dev-server-esbuild @web/test-runner-puppeteer @types/mocha http-server

Tests are working, at least for:

    npx web-test-runner ./src/stats/cdf/triangular/triangular_test.ts --puppeteer --verbose

Add `--watch` to have it run continuously.

## Puppeteer notes

If you are running under WSL you might get 

```
error while loading shared libraries: libgobject-2.0.so.0: cannot open shared object file: No such file or directory
```

In which case you can run the following to install the missing dependencies:    

```
sudo apt install libgtk-3-dev libnotify-dev libgconf-2-4 libnss3 libxss1 libasound2
```