import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFFont from 'src/api/PDFFont';
import { PDFAcroPushButton } from 'src/core/acroform';
import { assertIs } from 'src/utils';
import { PDFOperator, PDFContentStream, PDFRef } from 'src/core';
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

    this.acroField = acroPushButton;
  }

  // TODO: Have default width and height
  addToPage(
    text: string,
    font: PDFFont,
    page: PDFPage,
    options: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
  ) {
    const { x, y, width, height } = options;

    // Create a widget for this button
    const widget = PDFWidgetAnnotation.create(this.doc.context, this.ref);
    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    this.acroField.addWidget(widgetRef);

    // Set widget properties
    widget.setRectangle({ x, y, width, height });
    widget.getOrCreateAppearanceCharacteristics().setCaptions({ normal: text });

    // Set appearance streams for widget
    this.updateWidgetAppearance(widget, font);

    // Add widget to the given page
    const { Annots } = page.node.normalizedEntries();
    Annots.push(widgetRef);
  }

  updateAppearances(
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFButton>,
  ) {
    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      this.updateWidgetAppearance(widget, font, provider);
    }
  }

  private updateWidgetAppearance(
    widget: PDFWidgetAnnotation,
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFButton>,
  ) {
    const apProvider = provider ?? defaultButtonAppearanceProvider;

    const { normal, rollover, down } = normalizeAppearance(
      apProvider(this, widget, font),
    );

    widget.setNormalAppearance(
      this.createAppearanceStream(widget, normal, font),
    );

    if (rollover) {
      widget.setRolloverAppearance(
        this.createAppearanceStream(widget, rollover, font),
      );
    } else {
      widget.removeRolloverAppearance();
    }

    if (down) {
      widget.setDownAppearance(this.createAppearanceStream(widget, down, font));
    } else {
      widget.removeDownAppearance();
    }
  }

  private createAppearanceStream(
    widget: PDFWidgetAnnotation,
    appearance: PDFOperator[],
    font: PDFFont,
  ): PDFRef {
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
