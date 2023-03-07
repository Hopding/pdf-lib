import { PNG } from '../../src/utils/png';

describe(`PNG`, () => {
  it(`can load images with alpha values greater than 1`, () => {
    // This Uint8Array contains a PNG image composed of a single pixel. It was
    // generated with the following code in a browser:
    // ```
    // const ctx = c.getContext('2d');
    // ctx.fillStyle = 'rgba(255, 120, 80, 0.5)';
    // ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // ```
    // The pixel has the following values: R=255, G=120, B=80, A=128
    //
    // prettier-ignore
    const input = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1,
      0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84,
      24, 87, 99, 248, 95, 17, 208, 0, 0, 6, 137, 2, 72, 25, 58, 220, 62, 0, 0,
      0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]);

    const pngImage = PNG.load(input);

    expect(pngImage.rgbChannel).toEqual(new Uint8Array([255, 120, 80]));
    expect(pngImage.alphaChannel).toEqual(new Uint8Array([128]));
  });
});
