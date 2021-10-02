import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFFont from 'src/api/PDFFont';
import PDFImage from 'src/api/PDFImage';
import { ImageAlignment } from 'src/api/image/alignment';
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
import { degrees } from 'src/api/rotations';

import {
  PDFRef,
  PDFStream,
  PDFAcroPushButton,
  PDFWidgetAnnotation,
} from 'src/core';
import { assertIs, assertOrUndefined, assertPositive } from 'src/utils';

/**
 * Represents a button field of a [[PDFForm]].
 *
 * [[PDFButton]] fields are interactive controls that users can click with their
 * mouse. This type of [[PDFField]] is not stateful. The purpose of a button
 * is to perform an action when the user clicks on it, such as opening a print
 * modal or resetting the form. Buttons are typically rectangular in shape and
 * have a text label describing the action that they perform when clicked.
 */
export default class PDFButton extends PDFField {
  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFForm.getButton]] method, which will create an
   * > instance of [[PDFButton]] for you.
   *
   * Create an instance of [[PDFButton]] from an existing acroPushButton and ref
   *
   * @param acroPushButton The underlying `PDFAcroPushButton` for this button.
   * @param ref The unique reference for this button.
   * @param doc The document to which this button will belong.
   */
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

  /**
   * Display an image inside the bounds of this button's widgets. For example:
   * ```js
   * const pngImage = await pdfDoc.embedPng(...)
   * const button = form.getButton('some.button.field')
   * button.setImage(pngImage, ImageAlignment.Center)
   * ```
   * This will update the appearances streams for each of this button's widgets.
   * @param image The image that should be displayed.
   * @param alignment The alignment of the image.
   */
  setImage(image: PDFImage, alignment = ImageAlignment.Center) {
    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const streamRef = this.createImageAppearanceStream(
        widget,
        image,
        alignment,
      );
      this.updateWidgetAppearances(widget, { normal: streamRef });
    }

    this.markAsClean();
  }

  /**
   * Set the font size for this field. Larger font sizes will result in larger
   * text being displayed when PDF readers render this button. Font sizes may
   * be integer or floating point numbers. Supplying a negative font size will
   * cause this method to throw an error.
   *
   * For example:
   * ```js
   * const button = form.getButton('some.button.field')
   * button.setFontSize(4)
   * button.setFontSize(15.7)
   * ```
   *
   * > This method depends upon the existence of a default appearance
   * > (`/DA`) string. If this field does not have a default appearance string,
   * > or that string does not contain a font size (via the `Tf` operator),
   * > then this method will throw an error.
   *
   * @param fontSize The font size to be used when rendering text in this field.
   */
  setFontSize(fontSize: number) {
    assertPositive(fontSize, 'fontSize');
    this.acroField.setFontSize(fontSize);
    this.markAsDirty();
  }

  /**
   * Show this button on the specified page with the given text. For example:
   * ```js
   * const ubuntuFont = await pdfDoc.embedFont(ubuntuFontBytes)
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const button = form.createButton('some.button.field')
   *
   * button.addToPage('Do Stuff', page, {
   *   x: 50,
   *   y: 75,
   *   width: 200,
   *   height: 100,
   *   textColor: rgb(1, 0, 0),
   *   backgroundColor: rgb(0, 1, 0),
   *   borderColor: rgb(0, 0, 1),
   *   borderWidth: 2,
   *   rotate: degrees(90),
   *   font: ubuntuFont,
   * })
   * ```
   * This will create a new widget for this button field.
   * @param text The text to be displayed for this button widget.
   * @param page The page to which this button widget should be added.
   * @param options The options to be used when adding this button widget.
   */
  addToPage(
    // TODO: This needs to be optional, e.g. for image buttons
    text: string,
    page: PDFPage,
    options?: FieldAppearanceOptions,
  ) {
    assertOrUndefined(text, 'text', ['string']);
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
      hidden: options?.hidden,
      page: page.ref,
    });
    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    this.acroField.addWidget(widgetRef);

    // Set appearance streams for widget
    const font = options?.font ?? this.doc.getForm().getDefaultFont();
    this.updateWidgetAppearance(widget, font);

    // Add widget to the given page
    page.node.addAnnot(widgetRef);
  }

  /**
   * Returns `true` if this button has been marked as dirty, or if any of this
   * button's widgets do not have an appearance stream. For example:
   * ```js
   * const button = form.getButton('some.button.field')
   * if (button.needsAppearancesUpdate()) console.log('Needs update')
   * ```
   * @returns Whether or not this button needs an appearance update.
   */
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

  /**
   * Update the appearance streams for each of this button's widgets using
   * the default appearance provider for buttons. For example:
   * ```js
   * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const button = form.getButton('some.button.field')
   * button.defaultUpdateAppearances(helvetica)
   * ```
   * @param font The font to be used for creating the appearance streams.
   */
  defaultUpdateAppearances(font: PDFFont) {
    assertIs(font, 'font', [[PDFFont, 'PDFFont']]);
    this.updateAppearances(font);
  }

  /**
   * Update the appearance streams for each of this button's widgets using
   * the given appearance provider. If no `provider` is passed, the default
   * appearance provider for buttons will be used. For example:
   * ```js
   * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const button = form.getButton('some.button.field')
   * button.updateAppearances(helvetica, (field, widget, font) => {
   *   ...
   *   return {
   *     normal: drawButton(...),
   *     down: drawButton(...),
   *   }
   * })
   * ```
   * @param font The font to be used for creating the appearance streams.
   * @param provider Optionally, the appearance provider to be used for
   *                 generating the contents of the appearance streams.
   */
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
