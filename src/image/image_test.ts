import { PngMetadata } from '../vendor/png-metadata/src/png-metadata';
import { assert } from '@esm-bundle/chai';

describe('PngMetadata', () => {
  it('can determine an empty file is not a PNG', () => {
    assert.isFalse(PngMetadata.isPNG(new Uint8Array()));
  });

  it('can determine if a file in a PNG', (done) => {
    const img = document.createElement('img');
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(async (blob: Blob | null) => {
        assert.isNotNull(blob);
        const bin = new Uint8Array(await blob.arrayBuffer());
        assert.isTrue(PngMetadata.isPNG(bin));
        done();
      });
    };
    img.src = './src/image/testdata/simple.png';
    document.body.appendChild(img);
  });
});
