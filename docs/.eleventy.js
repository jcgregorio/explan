export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    '../dst/prod/standalone/index.html': 'play/index.html',
  });
  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
}
