import PDFDocument from 'src/api/PDFDocument';
import PDFFont from 'src/api/PDFFont';
import { AppearanceMapping } from 'src/api/form/appearances';
import { Color, colorToComponents, setFillingColor } from 'src/api/colors';
import {
  Rotation,
  toDegrees,
  rotateRectangle,
  reduceRotation,
  adjustDimsForRotation,
  degrees,
} from 'src/api/rotations';

import {
  PDFRef,
  PDFWidgetAnnotation,
  PDFOperator,
  PDFName,
  PDFDict,
  MethodNotImplementedError,
  AcroFieldFlags,
  PDFAcroTerminal,
  AnnotationFlags,
} from 'src/core';
import {
  addRandomSuffix,
  assertIs,
  assertMultiple,
  assertOrUndefined,
} from 'src/utils';
import { ImageAlignment } from '../image';
import PDFImage from '../PDFImage';
import { drawImage, rotateInPlace } from '../operations';

export interface FieldAppearanceOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  textColor?: Color;
  backgroundColor?: Color;
  borderColor?: Color;
  borderWidth?: number;
  rotate?: Rotation;
  font?: PDFFont;
  hidden?: boolean;
}

export const assertFieldAppearanceOptions = (
  options?: FieldAppearanceOptions,
) => {
  assertOrUndefined(options?.x, 'options.x', ['number']);
  assertOrUndefined(options?.y, 'options.y', ['number']);
  assertOrUndefined(options?.width, 'options.width', ['number']);
  assertOrUndefined(options?.height, 'options.height', ['number']);
  assertOrUndefined(options?.textColor, 'options.textColor', [
    [Object, 'Color'],
  ]);
  assertOrUndefined(options?.backgroundColor, 'options.backgroundColor', [
    [Object, 'Color'],
  ]);
  assertOrUndefined(options?.borderColor, 'options.borderColor', [
    [Object, 'Color'],
  ]);
  assertOrUndefined(options?.borderWidth, 'options.borderWidth', ['number']);
  assertOrUndefined(options?.rotate, 'options.rotate', [[Object, 'Rotation']]);
};

/**
 * Represents a field of a [[PDFForm]].
 *
 * This class is effectively abstract. All fields in a [[PDFForm]] will
 * actually be an instance of a subclass of this class.
 *
 * Note that each field in a PDF is represented by a single field object.
 * However, a given field object may be rendered at multiple locations within
 * the document (across one or more pages). The rendering of a field is
 * controlled by its widgets. Each widget causes its field to be displayed at a
 * particular location in the document.
 *
 * Most of the time each field in a PDF has only a single widget, and thus is
 * only rendered once. However, if a field is rendered multiple times, it will
 * have multiple widgets - one for each location it is rendered.
 *
 * This abstraction of field objects and widgets is defined in the PDF
 * specification and dictates how PDF files store fields and where they are
 * to be rendered.
 */
export default class PDFField {
  /** The low-level PDFAcroTerminal wrapped by this field. */
  readonly acroField: PDFAcroTerminal;

  /** The unique reference assigned to this field within the document. */
  readonly ref: PDFRef;

  /** The document to which this field belongs. */
  readonly doc: PDFDocument;

  protected constructor(
    acroField: PDFAcroTerminal,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    assertIs(acroField, 'acroField', [[PDFAcroTerminal, 'PDFAcroTerminal']]);
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroField;
    this.ref = ref;
    this.doc = doc;
  }

  /**
   * Get the fully qualified name of this field. For example:
   * ```js
   * const fields = form.getFields()
   * fields.forEach(field => {
   *   const name = field.getName()
   *   console.log('Field name:', name)
   * })
   * ```
   * Note that PDF fields are structured as a tree. Each field is the
   * descendent of a series of ancestor nodes all the way up to the form node,
   * which is always the root of the tree. Each node in the tree (except for
   * the form node) has a partial name. Partial names can be composed of any
   * unicode characters except a period (`.`). The fully qualified name of a
   * field is composed of the partial names of all its ancestors joined
   * with periods. This means that splitting the fully qualified name on
   * periods and taking the last element of the resulting array will give you
   * the partial name of a specific field.
   * @returns The fully qualified name of this field.
   */
  getName(): string {
    return this.acroField.getFullyQualifiedName() ?? '';
  }

  /**
   * Returns `true` if this field is read only. This means that PDF readers
   * will not allow users to interact with the field or change its value. See
   * [[PDFField.enableReadOnly]] and [[PDFField.disableReadOnly]].
   * For example:
   * ```js
   * const field = form.getField('some.field')
   * if (field.isReadOnly()) console.log('Read only is enabled')
   * ```
   * @returns Whether or not this is a read only field.
   */
  isReadOnly(): boolean {
    return this.acroField.hasFlag(AcroFieldFlags.ReadOnly);
  }

  /**
   * Prevent PDF readers from allowing users to interact with this field or
   * change its value. The field will not respond to mouse or keyboard input.
   * For example:
   * ```js
   * const field = form.getField('some.field')
   * field.enableReadOnly()
   * ```
   * Useful for fields whose values are computed, imported from a database, or
   * prefilled by software before being displayed to the user.
   */
  enableReadOnly() {
    this.acroField.setFlagTo(AcroFieldFlags.ReadOnly, true);
  }

  /**
   * Allow users to interact with this field and change its value in PDF
   * readers via mouse and keyboard input. For example:
   * ```js
   * const field = form.getField('some.field')
   * field.disableReadOnly()
   * ```
   */
  disableReadOnly() {
    this.acroField.setFlagTo(AcroFieldFlags.ReadOnly, false);
  }

  /**
   * Returns `true` if this field must have a value when the form is submitted.
   * See [[PDFField.enableRequired]] and [[PDFField.disableRequired]].
   * For example:
   * ```js
   * const field = form.getField('some.field')
   * if (field.isRequired()) console.log('Field is required')
   * ```
   * @returns Whether or not this field is required.
   */
  isRequired(): boolean {
    return this.acroField.hasFlag(AcroFieldFlags.Required);
  }

  /**
   * Require this field to have a value when the form is submitted.
   * For example:
   * ```js
   * const field = form.getField('some.field')
   * field.enableRequired()
   * ```
   */
  enableRequired() {
    this.acroField.setFlagTo(AcroFieldFlags.Required, true);
  }

  /**
   * Do not require this field to have a value when the form is submitted.
   * For example:
   * ```js
   * const field = form.getField('some.field')
   * field.disableRequired()
   * ```
   */
  disableRequired() {
    this.acroField.setFlagTo(AcroFieldFlags.Required, false);
  }

  /**
   * Returns `true` if this field's value should be exported when the form is
   * submitted. See [[PDFField.enableExporting]] and
   * [[PDFField.disableExporting]].
   * For example:
   * ```js
   * const field = form.getField('some.field')
   * if (field.isExported()) console.log('Exporting is enabled')
   * ```
   * @returns Whether or not this field's value should be exported.
   */
  isExported(): boolean {
    return !this.acroField.hasFlag(AcroFieldFlags.NoExport);
  }

  /**
   * Indicate that this field's value should be exported when the form is
   * submitted in a PDF reader. For example:
   * ```js
   * const field = form.getField('some.field')
   * field.enableExporting()
   * ```
   */
  enableExporting() {
    this.acroField.setFlagTo(AcroFieldFlags.NoExport, false);
  }

  /**
   * Indicate that this field's value should **not** be exported when the form
   * is submitted in a PDF reader. For example:
   * ```js
   * const field = form.getField('some.field')
   * field.disableExporting()
   * ```
   */
  disableExporting() {
    this.acroField.setFlagTo(AcroFieldFlags.NoExport, true);
  }

  /** @ignore */
  needsAppearancesUpdate(): boolean {
    throw new MethodNotImplementedError(
      this.constructor.name,
      'needsAppearancesUpdate',
    );
  }

  /** @ignore */
  defaultUpdateAppearances(_font: PDFFont) {
    throw new MethodNotImplementedError(
      this.constructor.name,
      'defaultUpdateAppearances',
    );
  }

  protected markAsDirty() {
    this.doc.getForm().markFieldAsDirty(this.ref);
  }

  protected markAsClean() {
    this.doc.getForm().markFieldAsClean(this.ref);
  }

  protected isDirty(): boolean {
    return this.doc.getForm().fieldIsDirty(this.ref);
  }

  protected createWidget(options: {
    x: number;
    y: number;
    width: number;
    height: number;
    textColor?: Color;
    backgroundColor?: Color;
    borderColor?: Color;
    borderWidth: number;
    rotate: Rotation;
    caption?: string;
    hidden?: boolean;
  }): PDFWidgetAnnotation {
    const textColor = options.textColor;
    const backgroundColor = options.backgroundColor;
    const borderColor = options.borderColor;
    const borderWidth = options.borderWidth;
    const degreesAngle = toDegrees(options.rotate);
    const caption = options.caption;
    const x = options.x;
    const y = options.y;
    const width = options.width + borderWidth;
    const height = options.height + borderWidth;
    const hidden = Boolean(options.hidden);

    assertMultiple(degreesAngle, 'degreesAngle', 90);

    // Create a widget for this field
    const widget = PDFWidgetAnnotation.create(this.doc.context, this.ref);

    // Set widget properties
    const rect = rotateRectangle(
      { x, y, width, height },
      borderWidth,
      degreesAngle,
    );
    widget.setRectangle(rect);

    const ac = widget.getOrCreateAppearanceCharacteristics();
    if (backgroundColor) {
      ac.setBackgroundColor(colorToComponents(backgroundColor));
    }
    ac.setRotation(degreesAngle);
    if (caption) ac.setCaptions({ normal: caption });
    if (borderColor) ac.setBorderColor(colorToComponents(borderColor));

    const bs = widget.getOrCreateBorderStyle();
    if (borderWidth !== undefined) bs.setWidth(borderWidth);

    widget.setFlagTo(AnnotationFlags.Print, true);
    widget.setFlagTo(AnnotationFlags.Hidden, hidden);
    widget.setFlagTo(AnnotationFlags.Invisible, false);

    // Set acrofield properties
    if (textColor) {
      const da = this.acroField.getDefaultAppearance() ?? '';
      const newDa = da + '\n' + setFillingColor(textColor).toString();
      this.acroField.setDefaultAppearance(newDa);
    }

    return widget;
  }

  protected updateWidgetAppearanceWithFont(
    widget: PDFWidgetAnnotation,
    font: PDFFont,
    { normal, rollover, down }: AppearanceMapping<PDFOperator[]>,
  ) {
    this.updateWidgetAppearances(widget, {
      normal: this.createAppearanceStream(widget, normal, font),
      rollover: rollover && this.createAppearanceStream(widget, rollover, font),
      down: down && this.createAppearanceStream(widget, down, font),
    });
  }

  protected updateOnOffWidgetAppearance(
    widget: PDFWidgetAnnotation,
    onValue: PDFName,
    {
      normal,
      rollover,
      down,
    }: AppearanceMapping<{ on: PDFOperator[]; off: PDFOperator[] }>,
  ) {
    this.updateWidgetAppearances(widget, {
      normal: this.createAppearanceDict(widget, normal, onValue),
      rollover:
        rollover && this.createAppearanceDict(widget, rollover, onValue),
      down: down && this.createAppearanceDict(widget, down, onValue),
    });
  }

  protected updateWidgetAppearances(
    widget: PDFWidgetAnnotation,
    { normal, rollover, down }: AppearanceMapping<PDFRef | PDFDict>,
  ) {
    widget.setNormalAppearance(normal);

    if (rollover) {
      widget.setRolloverAppearance(rollover);
    } else {
      widget.removeRolloverAppearance();
    }

    if (down) {
      widget.setDownAppearance(down);
    } else {
      widget.removeDownAppearance();
    }
  }

  // // TODO: Do we need to do this...?
  // private foo(font: PDFFont, dict: PDFDict) {
  //   if (!dict.lookup(PDFName.of('DR'))) {
  //     dict.set(PDFName.of('DR'), dict.context.obj({}));
  //   }
  //   const DR = dict.lookup(PDFName.of('DR'), PDFDict);

  //   if (!DR.lookup(PDFName.of('Font'))) {
  //     DR.set(PDFName.of('Font'), dict.context.obj({}));
  //   }
  //   const Font = DR.lookup(PDFName.of('Font'), PDFDict);

  //   Font.set(PDFName.of(font.name), font.ref);
  // }

  private createAppearanceStream(
    widget: PDFWidgetAnnotation,
    appearance: PDFOperator[],
    font?: PDFFont,
  ): PDFRef {
    const { context } = this.acroField.dict;
    const { width, height } = widget.getRectangle();

    // TODO: Do we need to do this...?
    // if (font) {
    //   this.foo(font, widget.dict);
    //   this.foo(font, this.doc.getForm().acroForm.dict);
    // }
    // END TODO

    const Resources = font && { Font: { [font.name]: font.ref } };
    const stream = context.formXObject(appearance, {
      Resources,
      BBox: context.obj([0, 0, width, height]),
      Matrix: context.obj([1, 0, 0, 1, 0, 0]),
    });
    const streamRef = context.register(stream);

    return streamRef;
  }

  /**
   * Create a FormXObject of the supplied image and add it to context.
   * The FormXObject size is calculated based on the widget (including
   * the alignment).
   * @param widget The widget that should display the image.
   * @param alignment The alignment of the image.
   * @param image The image that should be displayed.
   * @returns The ref for the FormXObject that was added to the context.
   */
  protected createImageAppearanceStream(
    widget: PDFWidgetAnnotation,
    image: PDFImage,
    alignment: ImageAlignment,
  ): PDFRef {
    // NOTE: This implementation doesn't handle image borders.
    // NOTE: Acrobat seems to resize the image (maybe even skewing its aspect
    //       ratio) to fit perfectly within the widget's rectangle. This method
    //       does not currently do that. Should there be an option for that?

    const { context } = this.acroField.dict;

    const rectangle = widget.getRectangle();
    const ap = widget.getAppearanceCharacteristics();
    const bs = widget.getBorderStyle();

    const borderWidth = bs?.getWidth() ?? 0;
    const rotation = reduceRotation(ap?.getRotation());

    const rotate = rotateInPlace({ ...rectangle, rotation });

    const adj = adjustDimsForRotation(rectangle, rotation);
    const imageDims = image.scaleToFit(
      adj.width - borderWidth * 2,
      adj.height - borderWidth * 2,
    );

    // Support borders on images and maybe other properties
    const options = {
      x: borderWidth,
      y: borderWidth,
      width: imageDims.width,
      height: imageDims.height,
      //
      rotate: degrees(0),
      xSkew: degrees(0),
      ySkew: degrees(0),
    };

    if (alignment === ImageAlignment.Center) {
      options.x += (adj.width - borderWidth * 2) / 2 - imageDims.width / 2;
      options.y += (adj.height - borderWidth * 2) / 2 - imageDims.height / 2;
    } else if (alignment === ImageAlignment.Right) {
      options.x = adj.width - borderWidth - imageDims.width;
      options.y = adj.height - borderWidth - imageDims.height;
    }

    const imageName = addRandomSuffix('Image', 10);
    const appearance = [...rotate, ...drawImage(imageName, options)];
    ////////////

    const Resources = { XObject: { [imageName]: image.ref } };
    const stream = context.formXObject(appearance, {
      Resources,
      BBox: context.obj([0, 0, rectangle.width, rectangle.height]),
      Matrix: context.obj([1, 0, 0, 1, 0, 0]),
    });

    return context.register(stream);
  }

  private createAppearanceDict(
    widget: PDFWidgetAnnotation,
    appearance: { on: PDFOperator[]; off: PDFOperator[] },
    onValue: PDFName,
  ): PDFDict {
    const { context } = this.acroField.dict;

    const onStreamRef = this.createAppearanceStream(widget, appearance.on);
    const offStreamRef = this.createAppearanceStream(widget, appearance.off);

    const appearanceDict = context.obj({});
    appearanceDict.set(onValue, onStreamRef);
    appearanceDict.set(PDFName.of('Off'), offStreamRef);

    return appearanceDict;
  }
}
