import esbuild from 'esbuild';
import fs from 'fs';

const buildSequence = [
  {
    in: './test/test.js',
    out: './dist/test.js',
    minifyHtml: true,
  },
];

function build(buildItem) {
  esbuild
    .build({
      entryPoints: [buildItem.in],
      bundle: true,
      minify: true,
      sourcemap: false,
      outfile: buildItem.out,
    })
    .then(async () => {
      if (!buildItem.minifyHtml) {
        return;
      }
      let js = fs.readFileSync(buildItem.out).toString();
      let checkIfHtml = (str) => {
        return str.includes('<') && (str.includes('</') || str.includes('/>'));
      };
      let processChunk = (ch) => {
        if (checkIfHtml(ch)) {
          let htmlMin = ch.split('\n').join(' ');
          while (htmlMin.includes('  ')) {
            htmlMin = htmlMin.split('  ').join(' ');
          }
          htmlMin = htmlMin.split('> <').join('><');
          return htmlMin.trim();
        }
        return ch;
      };
      let result = js
        .split('`')
        .map((chunk) => processChunk(chunk))
        .join('`')
        .split(`'`)
        .map((chunk) => processChunk(chunk))
        .join(`'`);
      fs.writeFileSync(buildItem.out, result);
    });
}

buildSequence.forEach((buildItem) => {
  build(buildItem);
});