import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroField, AcroFieldFlags } from 'src/core/acroform';
import { assertIs, assertMultiple } from 'src/utils';
import {
  PDFRef,
  PDFWidgetAnnotation,
  PDFOperator,
  PDFName,
  PDFDict,
  MethodNotImplementedError,
} from 'src/core';
import { PDFFont } from '..';
import { AppearanceMapping } from './appearances';
import { Color, colorToComponents, setFillingColor } from '../colors';
import { Rotation, toDegrees, rotateRectangle } from '../rotations';

// TODO: Should fields always have refs? What about the PDFForm?
// TODO: Note in documentation that a single field can actually be rendered
//       in multiple locations and pages of a single document.

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
}

/**
 * Represents a field of a [[PDFForm]].
 */
export default class PDFField {
  /** The low-level PDFAcroField wrapped by this field. */
  readonly acroField: PDFAcroField;

  /** The unique reference assigned to this radio group within the document. */
  readonly ref: PDFRef;

  /** The document to which this field belongs. */
  readonly doc: PDFDocument;

  protected constructor(
    acroField: PDFAcroField,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    assertIs(acroField, 'acroField', [[PDFAcroField, 'PDFAcroField']]);
    assertIs(ref, 'ref', [[PDFRef, 'PDFRef']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroField;
    this.ref = ref;
    this.doc = doc;
  }

  /**
   * Returns the fully qualified name of this field as a string.
   */
  getName(): string {
    return this.acroField.getFullyQualifiedName() ?? '';
  }

  isReadOnly(): boolean {
    return this.acroField.hasFlag(AcroFieldFlags.ReadOnly);
  }

  setReadOnly(readOnly: boolean) {
    this.acroField.setFlagTo(AcroFieldFlags.ReadOnly, readOnly);
  }

  isRequired(): boolean {
    return this.acroField.hasFlag(AcroFieldFlags.Required);
  }

  setRequired(required: boolean) {
    this.acroField.setFlagTo(AcroFieldFlags.Required, required);
  }

  isExported(): boolean {
    return !this.acroField.hasFlag(AcroFieldFlags.NoExport);
  }

  setExported(exported: boolean) {
    this.acroField.setFlagTo(AcroFieldFlags.NoExport, !exported);
  }

  needsAppearancesUpdate(): boolean {
    throw new MethodNotImplementedError(
      this.constructor.name,
      'needsAppearancesUpdate',
    );
  }

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
    backgroundColor: Color;
    borderColor?: Color;
    borderWidth: number;
    rotate: Rotation;
    caption?: string;
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
    ac.setBackgroundColor(colorToComponents(backgroundColor));
    ac.setRotation(degreesAngle);
    if (caption) ac.setCaptions({ normal: caption });
    if (borderColor) ac.setBorderColor(colorToComponents(borderColor));

    const bs = widget.getOrCreateBorderStyle();
    if (borderWidth !== undefined) bs.setWidth(borderWidth);

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

  private updateWidgetAppearances(
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

  private createAppearanceStream(
    widget: PDFWidgetAnnotation,
    appearance: PDFOperator[],
    font?: PDFFont,
  ): PDFRef {
    const { context } = this.acroField.dict;
    const { width, height } = widget.getRectangle();

    const Resources = font && { Font: { [font.name]: font.ref } };
    const stream = context.formXObject(appearance, {
      Resources,
      BBox: context.obj([0, 0, width, height]),
      Matrix: context.obj([1, 0, 0, 1, 0, 0]),
    });
    const streamRef = context.register(stream);

    return streamRef;
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
