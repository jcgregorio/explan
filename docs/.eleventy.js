// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function (eleventyConfig) {
  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
}
