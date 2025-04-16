import { Chunk, PngMetadata } from '../vendor/png-metadata/src/png-metadata';
import { assert } from '@esm-bundle/chai';
import {
  addExplanJSONChunkToPNG,
  b642str,
  getExplanJSONChunkFromPNG,
  str2b64,
} from './image';

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

  it('can add a tEXt chunk to a PNG', async () => {
    const blob = await loadImageAsBlob();
    const bin = new Uint8Array(await blob.arrayBuffer());
    const chunks = PngMetadata.splitChunks(bin);

    const encoder = new TextEncoder();

    const keyword = encoder.encode('explan.json');
    const text = encoder.encode('the data to store in the chunk');
    const ab = new ArrayBuffer(keyword.length + 1 + text.length);
    const data = new Uint8Array(ab);
    data.set(keyword, 0);
    data.set([0], keyword.length);
    data.set(text, keyword.length + 1);

    const textChunk = PngMetadata.createChunk('tEXt', data);
    chunks.splice(chunks.length - 1, 0, textChunk);
    const joinedAsArrayBuffer = PngMetadata.joinChunks(chunks);

    const chunks2 = PngMetadata.splitChunks(
      new Uint8Array(joinedAsArrayBuffer)
    );
    assert.deepEqual(
      chunks2.map((chunk: Chunk) => chunk.type),
      ['IHDR', 'sRGB', 'IDAT', 'tEXt', 'IEND']
    );
  });

  it('roundtrips JSON through PNG', async () => {
    const blob = await loadImageAsBlob();
    const updatedBlob = await addExplanJSONChunkToPNG('{}', blob);
    const ret = await getExplanJSONChunkFromPNG(updatedBlob);
    assert.isTrue(ret.ok);
    assert.equal(ret.value, '{}');
  });
});

describe('Base64 en/decoding', () => {
  const utf8string = '✓ à la mode';

  it('round trips correctly', () => {
    assert.equal(b642str(str2b64(utf8string)), utf8string);
  });

  it('encodes correctly', () => {
    assert.equal(str2b64(utf8string), '4pyTIMOgIGxhIG1vZGU=');
  });
});
