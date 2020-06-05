import PDFDocument from 'src/api/PDFDocument';
import PDFFont from 'src/api/PDFFont';
import { PDFAcroPushButton } from 'src/core/acroform';
import { assertIs } from 'src/utils';
import {
  // PDFName,
  PDFOperator,
  PDFContentStream,
  // PDFDict,
  PDFRef,
} from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultButtonAppearanceProvider,
} from 'src/api/form/appearances';

import PDFField from 'src/api/form/PDFField';

/**
 * Represents a button field of a [[PDFForm]].
 */
export default class PDFButton extends PDFField {
  static of = (
    acroPushButton: PDFAcroPushButton,
    ref: PDFRef,
    doc: PDFDocument,
  ) => new PDFButton(acroPushButton, ref, doc);

  /** The low-level PDFAcroPushButton wrapped by this button. */
  readonly acroField: PDFAcroPushButton;

  private constructor(
    acroPushButton: PDFAcroPushButton,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    super(acroPushButton, ref, doc);

    assertIs(acroPushButton, 'acroButton', [
      [PDFAcroPushButton, 'PDFAcroPushButton'],
    ]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroPushButton;
  }

  // TODO: Set caption...
  // setText(text: string) {}

  updateAppearances(
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFButton>,
  ) {
    const apProvider = provider ?? defaultButtonAppearanceProvider;

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const { normal, rollover, down } = normalizeAppearance(
        apProvider(this, widget, font),
      );

      const normalStream = this.createAppearanceStream(widget, normal, font);
      if (normalStream) widget.setNormalAppearance(normalStream);

      if (rollover) {
        const rolloverStream = this.createAppearanceStream(
          widget,
          rollover,
          font,
        );
        if (rolloverStream) widget.setRolloverAppearance(rolloverStream);
      } else {
        widget.removeRolloverAppearance();
      }

      if (down) {
        const downStream = this.createAppearanceStream(widget, down, font);
        if (downStream) widget.setDownAppearance(downStream);
      } else {
        widget.removeDownAppearance();
      }
    }
  }

  private createAppearanceStream(
    widget: PDFWidgetAnnotation,
    appearance: PDFOperator[],
    font: PDFFont,
  ): PDFRef | undefined {
    const { context } = this.acroField.dict;
    const { width, height } = widget.getRectangle();

    // TODO: Use `context.formXObject` everywhere
    const xObjectDict = context.obj({
      Type: 'XObject',
      Subtype: 'Form',
      BBox: context.obj([0, 0, width, height]),
      Matrix: context.obj([1, 0, 0, 1, 0, 0]),
      Resources: { Font: { [font.name]: font.ref } },
    });

    const stream = PDFContentStream.of(xObjectDict, appearance);
    const streamRef = context.register(stream);

    return streamRef;
  }
}
