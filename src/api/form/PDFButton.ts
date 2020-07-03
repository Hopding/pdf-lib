import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFFont from 'src/api/PDFFont';
import { PDFAcroPushButton } from 'src/core/acroform';
import { assertIs } from 'src/utils';
import { PDFRef } from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultButtonAppearanceProvider,
} from 'src/api/form/appearances';

import PDFField from 'src/api/form/PDFField';
import { Color, rgb } from '../colors';
import { Rotation, degrees } from '../rotations';

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

  addToPage(
    text: string,
    font: PDFFont,
    page: PDFPage,
    options?: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      color?: Color;
      borderColor?: Color;
      borderWidth?: number;
      rotate?: Rotation;
    },
  ) {
    // const color = options?.color ?? rgb(0, 0, 0);
    // const borderColor = options?.borderColor;
    // const borderWidth = options?.borderWidth ?? 0;
    // const degreesAngle = toDegrees(options?.rotate ?? degrees(0));
    // const x = (options?.x ?? 0) - borderWidth / 2;
    // const y = (options?.y ?? 0) - borderWidth / 2;
    // const width = (options?.width ?? 100) + borderWidth;
    // const height = (options?.height ?? 50) + borderWidth;

    // assertMultiple(degreesAngle, 'degreesAngle', 90);

    // // Create a widget for this button
    // const widget = PDFWidgetAnnotation.create(this.doc.context, this.ref);
    // const widgetRef = this.doc.context.register(widget.dict);

    // // Add widget to this field
    // this.acroField.addWidget(widgetRef);

    // // Set widget properties
    // const rect = rotateRectangle(
    //   { x, y, width, height },
    //   borderWidth,
    //   degreesAngle,
    // );
    // widget.setRectangle(rect);

    // const ac = widget.getOrCreateAppearanceCharacteristics();
    // ac.setCaptions({ normal: text });
    // ac.setBackgroundColor(colorToComponents(color));
    // ac.setRotation(degreesAngle);
    // if (borderColor) ac.setBorderColor(colorToComponents(borderColor));

    // const bs = widget.getOrCreateBorderStyle();
    // if (borderWidth !== undefined) bs.setWidth(borderWidth);

    // // Set appearance streams for widget
    // this.updateWidgetAppearance(widget, font);

    // // Add widget to the given page
    // page.node.addAnnot(widgetRef);

    // Create a widget for this button
    const widget = this.embedWidget({
      x: options?.x ?? 0,
      y: options?.y ?? 0,
      width: options?.width ?? 100,
      height: options?.height ?? 50,
      color: options?.color ?? rgb(0, 0, 0),
      borderColor: options?.borderColor,
      borderWidth: options?.borderWidth ?? 0,
      rotate: options?.rotate ?? degrees(0),
      caption: text,
    });

    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    this.acroField.addWidget(widgetRef);

    // Set appearance streams for widget
    this.updateWidgetAppearance(widget, font);

    // Add widget to the given page
    page.node.addAnnot(widgetRef);
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
    const appearances = normalizeAppearance(apProvider(this, widget, font));
    this.updateWidgetAppearanceWithFont(widget, font, appearances);
  }
}
