import isArray from 'lodash/isArray';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import {
  PDFArray,
  PDFDictionary,
  PDFIndirectReference,
  PDFName,
  PDFNumber,
  PDFObject,
  PDFStream,
} from 'core/pdf-objects';
import { PDFContentStream, PDFPageTree } from 'core/pdf-structures';
import {
  isIdentity,
  isInstance,
  optional,
  validate,
  validateArr,
} from 'utils/validate';

import PDFObjectIndex from 'core/pdf-document/PDFObjectIndex';

class PDFPage extends PDFDictionary {
  /** @hidden */
  static readonly INHERITABLE_ENTRIES = [
    'Resources',
    'MediaBox',
    'CropBox',
    'Rotate',
  ];

  static create = (
    index: PDFObjectIndex,
    size: [number, number],
    resources?: PDFDictionary,
  ) => {
    validate(size, isArray, 'size must be an array of 2 numbers.');
    validate(size.length, isIdentity(2), 'size tuple must have two elements.');
    validate(size[0], isNumber, 'size tuple entries must be Numbers.');
    validate(size[1], isNumber, 'size tuple entries must be Numbers.');
    validate(
      resources,
      optional(isInstance(PDFDictionary)),
      'resources must be a PDFDictionary',
    );

    const mediaBox = [0, 0, size[0], size[1]];
    const page = new PDFPage(
      {
        Type: PDFName.from('Page'),
        // TODO: Convert this to use PDFRectangle
        MediaBox: PDFArray.fromArray(mediaBox.map(PDFNumber.fromNumber), index),
      },
      index,
    );
    if (resources) page.set('Resources', resources);
    return page;
  };

  static fromDict = (dict: PDFDictionary) => {
    validate(dict, isInstance(PDFDictionary), '"dict" must be a PDFDictionary');
    return new PDFPage(dict.map, dict.index);
  };

  autoNormalizeCTM = true;

  /** @hidden */
  get Parent() {
    return this.index.lookup(this.get('Parent')) as PDFPageTree;
  }

  /** @hidden */
  get Resources() {
    return this.index.lookup(this.get('Resources')) as PDFDictionary;
  }

  /** @hidden */
  get Contents() {
    return this.index.lookup(this.get('Contents')) as PDFArray<
      PDFContentStream | PDFIndirectReference<PDFContentStream>
    >;
  }

  /**
   * Converts the `Contents` entry in this PDFPage to a [[PDFArray]], if it
   * exists and is not already a direct [[PDFArray]]. Therefore, this method
   * only has an effect if `Contents` is a `PDFIndirectReference<PDFStream>` or
   * `PDFIndirectReference<PDFArray<PDFStream>>`.
   */
  normalizeContents = () => {
    const actualContents = this.getMaybe('Contents');
    if (actualContents instanceof PDFIndirectReference) {
      const lookedUpContents = this.index.lookup(actualContents);
      if (lookedUpContents instanceof PDFArray) {
        this.set('Contents', lookedUpContents.clone());
      } else {
        this.set('Contents', PDFArray.fromArray([actualContents], this.index));
      }
    }
    return this;
  };

  /**
   * Ensures that content streams added to the [[PDFPage]] after calling
   * [[normalizeCTM]] will be working in the default Content Transformation
   * Matrix.
   *
   * This can be useful in cases where PDFs are being modified that
   * have existing content streams which modify the CTM outside without
   * resetting their changes (with the Q and q operators).
   *
   * Works by wrapping any existing content streams for this page in two new
   * content streams that contain a single operator each: `q` and `Q`,
   * respectively.
   *
   * Note that the `Contents` entry in this [[PDFPage]] must be a PDFArray.
   * Calling [[normalizeContents]] first will ensure that this is the case.
   *
   * @param pdfDoc The document containing this PDFPage, to which the two new
   *               [[PDFContentStream]]s will be added
   *
   * @returns Returns this [[PDFPage]] instance.
   */
  normalizeCTM = (): PDFPage => {
    const contents = this.getMaybe('Contents') as PDFArray | void;

    if (!contents) return this;

    const {
      pushGraphicsStateContentStream,
      popGraphicsStateContentStream,
    } = this.index;
    if (
      pushGraphicsStateContentStream &&
      popGraphicsStateContentStream &&
      contents.array[0] !== pushGraphicsStateContentStream
    ) {
      contents.array.unshift(pushGraphicsStateContentStream);
      contents.array.push(popGraphicsStateContentStream);
    }

    return this;
  };

  /** @hidden */
  normalizeResources = ({
    Font,
    XObject,
  }: {
    Font?: boolean;
    XObject?: boolean;
  }) => {
    if (!this.getMaybe('Resources')) {
      this.set('Resources', PDFDictionary.from(new Map(), this.index));
    }

    if (Font && !this.Resources.getMaybe('Font')) {
      this.Resources.set('Font', PDFDictionary.from(new Map(), this.index));
    }
    if (XObject && !this.Resources.getMaybe('XObject')) {
      this.Resources.set('XObject', PDFDictionary.from(new Map(), this.index));
    }
  };

  // TODO: Consider allowing *insertion* of content streams so order can be changed
  /**
   * Add one or more content streams to the page.
   *
   * Note that this method does
   * **not** directly accept [[PDFContentStream]](s) as its arguments. Instead,
   * it accepts references to the content streams in the form of
   * [[PDFIndirectReference]] objects. To obtain a reference for a
   * [[PDFContentStream]], you must call the [[PDFDocument.register]] method
   * with the [[PDFContentStream]].
   *
   * @param contentStreams The content stream(s) to be added to the page.
   */
  addContentStreams = (
    ...contentStreams: Array<PDFIndirectReference<PDFContentStream>>
  ) => {
    validateArr(
      contentStreams,
      isInstance(PDFIndirectReference),
      '"contentStream" must be of type PDFIndirectReference<PDFContentStream>',
    );

    this.normalizeContents();
    if (this.autoNormalizeCTM) this.normalizeCTM();

    if (!this.getMaybe('Contents')) {
      this.set('Contents', PDFArray.fromArray(contentStreams, this.index));
    } else {
      this.Contents.push(...contentStreams);
    }

    return this;
  };

  /**
   * Adds a font dictionary to the page.
   *
   * Note that this method does **not** directly accept font
   * [[PDFDictionary]](s) as its arguments. Instead, it accepts references to
   * the font dictionaries in the form of [[PDFIndirectReference]] objects.
   *
   * The first element of the tuples returned by the
   * [[PDFDocument.embedStandardFont]] and [[PDFDocument.embedFont]] methods
   * is a [[PDFIndirectReference]] to a font dictionary that can be passed as
   * the `fontDict` parameter of this method.
   *
   * @param key      The name by which the font dictionary will be referenced.
   * @param fontDict The font dictionary to be added to the page.
   */
  addFontDictionary = (
    key: string, // TODO: Allow PDFName objects to be passed too
    fontDict: PDFIndirectReference<PDFDictionary>, // Allow PDFDictionaries as well
  ) => {
    validate(key, isString, '"key" must be a string');
    validate(
      fontDict,
      isInstance(PDFIndirectReference),
      '"fontDict" must be an instance of PDFIndirectReference',
    );

    this.normalizeResources({ Font: true });
    const Font = this.index.lookup(this.Resources.get('Font')) as PDFDictionary;
    Font.set(key, fontDict);

    return this;
  };

  /**
   * **Note:** This method is an alias for [[addXObject]]. It exists because its
   * name is more descriptive and familiar than `addXObject` is.
   *
   * Adds an image object to the page.
   *
   * Note that this method does **not** directly accept a [[PDFStream]] object
   * as its argument. Instead, it accepts a reference to the [[PDFStream]] in
   * the form of a [[PDFIndirectReference]] object.
   *
   * The first element of the tuples returned by the
   * [[PDFDocument.embedPNG]] and [[PDFDocument.embedJPG]] methods
   * is a [[PDFIndirectReference]] to a [[PDFStream]] that can be passed as
   * the `imageObject` parameter of this method.
   *
   * @param key         The name by which the image object will be referenced.
   * @param imageObject The image object to be added to the page.
   */
  addImageObject = (
    key: string,
    imageObject: PDFIndirectReference<PDFStream>,
  ) => {
    this.addXObject(key, imageObject);
    return this;
  };

  /**
   * Adds an XObject to the page.
   *
   * Note that this method does **not** directly accept a [[PDFStream]] object
   * as its argument. Instead, it accepts a reference to the [[PDFStream]] in
   * the form of a [[PDFIndirectReference]] object.
   *
   * @param key     The name by which the XObject will be referenced.
   * @param xObject The XObject to be added to the page.
   */
  addXObject = (key: string, xObject: PDFIndirectReference<PDFStream>) => {
    validate(key, isString, '"key" must be a string');
    validate(
      xObject,
      isInstance(PDFIndirectReference),
      '"xObject" must be an instance of PDFIndirectReference',
    );

    this.normalizeResources({ XObject: true });
    const XObject = this.index.lookup(
      this.Resources.get('XObject'),
    ) as PDFDictionary;
    XObject.set(key, xObject);

    return this;
  };

  clone = () =>
    PDFPage.fromDict(PDFDictionary.from(new Map(this.map), this.index));
}

export default PDFPage;
