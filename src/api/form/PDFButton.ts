import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFFont from 'src/api/PDFFont';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultButtonAppearanceProvider,
} from 'src/api/form/appearances';
import PDFField, {
  FieldAppearanceOptions,
  assertFieldAppearanceOptions,
} from 'src/api/form/PDFField';
import { rgb } from 'src/api/colors';
import {
  degrees,
  adjustDimsForRotation,
  reduceRotation,
} from 'src/api/rotations';

import {
  PDFRef,
  PDFStream,
  PDFAcroPushButton,
  PDFWidgetAnnotation,
} from 'src/core';
import { assertIs, assertOrUndefined, addRandomSuffix } from 'src/utils';
import { PDFImage } from '..';
import { drawImage, rotateInPlace } from '../operations';

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

  setImage(image: PDFImage) {
    // Create appearance stream with image, ignoring caption property
    const { context } = this.acroField.dict;

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];

      ////////////
      const rectangle = widget.getRectangle();
      const ap = widget.getAppearanceCharacteristics();
      const bs = widget.getBorderStyle();

      const borderWidth = bs?.getWidth() ?? 1;
      const rotation = reduceRotation(ap?.getRotation());
      const { width, height } = adjustDimsForRotation(rectangle, rotation);

      const rotate = rotateInPlace({ ...rectangle, rotation });

      const imageDims = image.scaleToFit(width, height);

      const drawingArea = {
        x: 0 + borderWidth / 2,
        y: 0 + borderWidth / 2,
        width: width - borderWidth,
        height: height - borderWidth,
      };

      // Support borders on images and maybe other properties
      const options = {
        x: drawingArea.x + (drawingArea.width / 2 - imageDims.width / 2),
        y: drawingArea.y + (drawingArea.height / 2 - imageDims.height / 2),
        width: imageDims.width,
        height: imageDims.height,
        //
        rotate: degrees(0),
        xSkew: degrees(0),
        ySkew: degrees(0),
      };

      const imageName = addRandomSuffix('Image', 10);
      const appearance = [...rotate, ...drawImage(imageName, options)];
      ////////////

      const Resources = { XObject: { [imageName]: image.ref } };
      const stream = context.formXObject(appearance, {
        Resources,
        BBox: context.obj([0, 0, width, height]),
        Matrix: context.obj([1, 0, 0, 1, 0, 0]),
      });
      const streamRef = context.register(stream);

      this.updateWidgetAppearances(widget, { normal: streamRef });
    }

    this.markAsClean();
  }

  addToPage(
    // TODO: This needs to be optional, e.g. for image buttons
    text: string,
    font: PDFFont,
    page: PDFPage,
    options?: FieldAppearanceOptions,
  ) {
    assertOrUndefined(text, 'text', ['string']);
    assertOrUndefined(font, 'font', [[PDFFont, 'PDFFont']]);
    assertOrUndefined(page, 'page', [[PDFPage, 'PDFPage']]);
    assertFieldAppearanceOptions(options);

    // Create a widget for this button
    const widget = this.createWidget({
      x: (options?.x ?? 0) - (options?.borderWidth ?? 0) / 2,
      y: (options?.y ?? 0) - (options?.borderWidth ?? 0) / 2,
      width: options?.width ?? 100,
      height: options?.height ?? 50,
      textColor: options?.textColor ?? rgb(0, 0, 0),
      backgroundColor: options?.backgroundColor ?? rgb(0.75, 0.75, 0.75),
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

  needsAppearancesUpdate(): boolean {
    if (this.isDirty()) return true;

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const hasAppearances =
        widget.getAppearances()?.normal instanceof PDFStream;
      if (!hasAppearances) return true;
    }

    return false;
  }

  defaultUpdateAppearances(font: PDFFont) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    this.updateAppearances(font);
  }

  updateAppearances(
    font: PDFFont,
    provider?: AppearanceProviderFor<PDFButton>,
  ) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    assertOrUndefined(provider, 'provider', [Function]);

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
