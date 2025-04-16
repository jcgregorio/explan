import { error, ok, Result } from '../result';
import { Chunk, PngMetadata } from '../vendor/png-metadata/src/png-metadata';

// The value below is the TextEncoder encoding of
// "application/vnd.explan.org+json" plus a null. The null is because PNG tEXt
// chunk values are pre-pended with a null terminated string which is the
// keyword, which is used to differentiate tEXt chunks.
const explanJSONKeywordAndNullTerminator = [
  97, 112, 112, 108, 105, 99, 97, 116, 105, 111, 110, 47, 118, 110, 100, 46,
  101, 120, 112, 108, 97, 110, 46, 111, 114, 103, 43, 106, 115, 111, 110, 0,
];

export const addExplanJSONChunkToPNG = async (
  json: string,
  blob: Blob
): Promise<Blob> => {
  const bin = new Uint8Array(await blob.arrayBuffer());
  const chunks = PngMetadata.splitChunks(bin);

  const contentEncoded = new TextEncoder().encode(str2b64(json));

  const data = new Uint8Array(
    new ArrayBuffer(
      explanJSONKeywordAndNullTerminator.length + contentEncoded.length
    )
  );
  data.set(explanJSONKeywordAndNullTerminator, 0);
  data.set(contentEncoded, explanJSONKeywordAndNullTerminator.length);

  const textChunk = PngMetadata.createChunk('tEXt', data);
  chunks.splice(-1, 0, textChunk);
  return new Blob([PngMetadata.joinChunks(chunks)]);
};

export const getExplanJSONChunkFromPNG = async (
  blob: Blob
): Promise<Result<string>> => {
  const chunks = PngMetadata.splitChunks(
    new Uint8Array(await blob.arrayBuffer())
  );

  const matches = chunks
    .filter((chunk: Chunk) => chunk.type === 'tEXt')
    .filter((chunk: Chunk) =>
      chunk.data
        .slice(0, explanJSONKeywordAndNullTerminator.length)
        .every((x: number, index: number) => {
          return x === explanJSONKeywordAndNullTerminator[index];
        })
    );

  if (matches.length === 0) {
    return error(new Error('No tEXt chunks found.'));
  }

  const contentEncoded = matches[0].data.slice(
    explanJSONKeywordAndNullTerminator.length
  );
  return ok(b642str(new TextDecoder().decode(contentEncoded)));
};

// Starting from https://stackoverflow.com/questions/30106476/using-javascripts-atob-to-decode-base64-doesnt-properly-decode-utf-8-strings
export const str2b64 = (str: string): string =>
  btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_match, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  );

export const b642str = (str: string): string =>
  decodeURIComponent(
    Array.prototype.map
      .call(atob(str), function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
