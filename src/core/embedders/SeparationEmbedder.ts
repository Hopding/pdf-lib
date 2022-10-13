import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';

class SeparationEmbedder {
  static for(
    name: string,
    alternateColorSpace: string,
    alternateColorComponents: number[],
  ) {
    return new SeparationEmbedder(
      name,
      alternateColorSpace,
      alternateColorComponents,
    );
  }

  readonly separationName: string;
  private readonly alternateColorSpace: string;
  private readonly alternateColorComponents: number[];

  private constructor(
    separationName: string,
    alternateColorSpace: string,
    alternateColorComponents: number[],
  ) {
    this.separationName = separationName;
    this.alternateColorSpace = alternateColorSpace;
    this.alternateColorComponents = alternateColorComponents;
  }

  embedIntoContext(context: PDFContext, ref?: PDFRef): PDFRef {
    const components = this.alternateColorComponents;
    const colorSpace = context.obj([
      'Separation',
      this.separationName,
      this.alternateColorSpace,
      {
        FunctionType: 2,
        Domain: [0, 1],
        C0: components.map(() => 0),
        C1: components,
        N: 1,
      },
    ]);

    if (ref) {
      context.assign(ref, colorSpace);
      return ref;
    } else {
      return context.register(colorSpace);
    }
  }
}

export default SeparationEmbedder;
