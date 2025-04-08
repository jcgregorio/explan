// Script that merges the HTML file and the JS file
// into a single file.
import * as fs from 'fs';

const data = fs.readFileSync('./dst/index.html', 'utf8');
const [before, after] = data.split(
  '<script type="module" src="./dst/page.js"></script>'
);

const script = fs.readFileSync('./dst/page.js', 'utf8');

fs.writeFileSync(
  './dst/merged.html',
  `${before}
<script type="module">
  ${script}
</script>
${after}
`
);
