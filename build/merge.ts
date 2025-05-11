// Script that merges the HTML file and the JS file
// into a single file.
//
// Does this for all 4 combinations of
//
// [dev, prod] x [standalone, extension]
//
import * as fs from 'fs';

const Targets = ['standalone', 'extension'] as const;
const Modes = ['dev', 'prod'];

const targetToFilename: Record<(typeof Targets)[number], string> = {
  standalone: 'page.js',
  extension: 'vscodeext.js',
};

const data = fs.readFileSync('./index.html', 'utf8');
const [before, after] = data.split(
  '<script type="module" src="./dst/dev/page.js"></script>'
);

Targets.forEach((target) => {
  Modes.forEach((mode) => {
    const targetFilename = targetToFilename[target];
    const script = fs.readFileSync(`./dst/${mode}/${targetFilename}`, 'utf8');

    const dir = `./dst/${mode}/${target}/`;
    fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(
      `./dst/${mode}/${target}/index.html`,
      `${before}
    <script type="module">
      ${script}
    </script>
    ${after}
    `
    );
  });
});
