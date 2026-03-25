import PDFImage from './PDFImage';

export default class PDFSvg {
  svg: string;
  images: Record<string, PDFImage>;
  constructor(svg: string, images: Record<string, PDFImage> = {}) {
    this.svg = svg;
    this.images = images;
  }
}
