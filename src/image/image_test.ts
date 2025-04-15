import { Chunk, PngMetadata } from '../vendor/png-metadata/src/png-metadata';
import { assert } from '@esm-bundle/chai';

describe('PngMetadata', () => {
  it('can determine an empty file is not a PNG', () => {
    assert.isFalse(PngMetadata.isPNG(new Uint8Array()));
  });

  const loadImageAsBlob = () =>
    new Promise<Blob>(function (resolve) {
      const img = document.createElement('img');
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(async (blob: Blob | null) => {
          assert.isNotNull(blob);
          resolve(blob);
        });
      };
      img.src = './src/image/testdata/simple.png';
      document.body.appendChild(img);
    });

  it('can determine if a file in a PNG', async () => {
    const blob = await loadImageAsBlob();
    const bin = new Uint8Array(await blob.arrayBuffer());
    assert.isTrue(PngMetadata.isPNG(bin));
  });

  it('can read chunks of a PNG', async () => {
    const blob = await loadImageAsBlob();
    const bin = new Uint8Array(await blob.arrayBuffer());
    const chunks = PngMetadata.splitChunks(bin);
    assert.deepEqual(
      chunks.map((chunk: Chunk) => chunk.type),
      ['IHDR', 'sRGB', 'IDAT', 'IEND']
    );
  });
});
