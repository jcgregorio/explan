export default async function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    '../dst/prod/standalone/index.html': 'play/index.html',
  });
  eleventyConfig.addPassthroughCopy('src/images/');

  return {
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  };
}
