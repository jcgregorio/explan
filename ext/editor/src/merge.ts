// Script that merges the HTML file and the JS file
// into a single file.
import * as fs from 'fs';

const data = fs.readFileSync('../../dst/merged.html', 'utf8');
const [before, after] = data.split(
  '<div id="extensions"></div>'
);

const script = fs.readFileSync('./out/bridge.js', 'utf8');

fs.writeFileSync(
  './out/index.html',
  `${before}
<script type="module">
  ${script}
</script>
${after}
`
);