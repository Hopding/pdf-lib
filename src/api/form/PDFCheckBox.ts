import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultCheckBoxAppearanceProvider,
} from 'src/api/form/appearances';
import { rgb } from 'src/api/colors';
import { degrees } from 'src/api/rotations';
import PDFField, {
  FieldAppearanceOptions,
  assertFieldAppearanceOptions,
} from 'src/api/form/PDFField';

import {
  PDFName,
  PDFRef,
  PDFDict,
  PDFAcroCheckBox,
  PDFWidgetAnnotation,
} from 'src/core';
import { assertIs, assertOrUndefined } from 'src/utils';

/**
 * Represents a check box field of a [[PDFForm]].
 *
 * [[PDFCheckBox]] fields are interactive boxes that users can click with their
 * mouse. This type of [[PDFField]] has two states: `on` and `off`. The purpose
 * of a check box is to enable users to select from one or more options, where
 * each option is represented by a single check box. Check boxes are typically
 * square in shape and display a check mark when they are in the `on` state.
 */
export default class PDFCheckBox extends PDFField {
  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFForm.getCheckBox]] method, which will create an
   * > instance of [[PDFCheckBox]] for you.
   *
   * Create an instance of [[PDFCheckBox]] from an existing acroCheckBox and ref
   *
   * @param acroCheckBox The underlying `PDFAcroCheckBox` for this check box.
   * @param ref The unique reference for this check box.
   * @param doc The document to which this check box will belong.
   */
  static of = (acroCheckBox: PDFAcroCheckBox, ref: PDFRef, doc: PDFDocument) =>
    new PDFCheckBox(acroCheckBox, ref, doc);

  /** The low-level PDFAcroCheckBox wrapped by this check box. */
  readonly acroField: PDFAcroCheckBox;

  private constructor(
    acroCheckBox: PDFAcroCheckBox,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    super(acroCheckBox, ref, doc);

    assertIs(acroCheckBox, 'acroCheckBox', [
      [PDFAcroCheckBox, 'PDFAcroCheckBox'],
    ]);

    this.acroField = acroCheckBox;
  }

  /**
   * Mark this check box. This operation is analogous to a human user clicking
   * a check box to fill it in a PDF reader. This method will update the
   * underlying state of the check box field to indicate it has been selected.
   * PDF libraries and readers will be able to extract this value from the
   * saved document and determine that it was selected.
   *
   * For example:
   * ```js
   * const checkBox = form.getCheckBox('some.checkBox.field')
   * checkBox.check()
   * ```
   *
   * This method will mark this check box as dirty, causing its appearance
   * streams to be updated when either [[PDFDocument.save]] or
   * [[PDFForm.updateFieldAppearances]] is called. The updated appearance
   * streams will display a check mark inside the widgets of this check box
   * field.
   */
  check() {
    const onValue = this.acroField.getOnValue() ?? PDFName.of('Yes');
    this.markAsDirty();
    this.acroField.setValue(onValue);
  }

  /**
   * Clears this check box. This operation is analogous to a human user clicking
   * a check box to unmark it in a PDF reader. This method will update the
   * underlying state of the check box field to indicate it has been deselected.
   * PDF libraries and readers will be able to extract this value from the
   * saved document and determine that it was not selected.
   *
   * For example:
   * ```js
   * const checkBox = form.getCheckBox('some.checkBox.field')
   * checkBox.uncheck()
   * ```
   *
   * This method will mark this check box as dirty. See [[PDFCheckBox.check]]
   * for more details about what this means.
   */
  uncheck() {
    this.markAsDirty();
    this.acroField.setValue(PDFName.of('Off'));
  }

  /**
   * Returns `true` if this check box is selected (either by a human user via
   * a PDF reader, or else programmatically via software). For example:
   * ```js
   * const checkBox = form.getCheckBox('some.checkBox.field')
   * if (checkBox.isChecked()) console.log('check box is selected')
   * ```
   * @returns Whether or not this check box is selected.
   */
  isChecked(): boolean {
    const onValue = this.acroField.getOnValue();
    return !!onValue && onValue === this.acroField.getValue();
  }

  /**
   * Show this check box on the specified page. For example:
   * ```js
   * const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const checkBox = form.createCheckBox('some.checkBox.field')
   *
   * checkBox.addToPage(page, {
   *   x: 50,
   *   y: 75,
   *   width: 25,
   *   height: 25,
   *   textColor: rgb(1, 0, 0),
   *   backgroundColor: rgb(0, 1, 0),
   *   borderColor: rgb(0, 0, 1),
   *   borderWidth: 2,
   *   rotate: degrees(90),
   * })
   * ```
   * This will create a new widget for this check box field.
   * @param page The page to which this check box widget should be added.
   * @param options The options to be used when adding this check box widget.
   */
  addToPage(page: PDFPage, options?: FieldAppearanceOptions) {
    assertIs(page, 'page', [[PDFPage, 'PDFPage']]);
    assertFieldAppearanceOptions(options);

    if (!options) options = {};

    if (!('textColor' in options)) options.textColor = rgb(0, 0, 0);
    if (!('backgroundColor' in options)) options.backgroundColor = rgb(1, 1, 1);
    if (!('borderColor' in options)) options.borderColor = rgb(0, 0, 0);
    if (!('borderWidth' in options)) options.borderWidth = 1;

    // Create a widget for this check box
    const widget = this.createWidget({
      x: options.x ?? 0,
      y: options.y ?? 0,
      width: options.width ?? 50,
      height: options.height ?? 50,
      textColor: options.textColor,
      backgroundColor: options.backgroundColor,
      borderColor: options.borderColor,
      borderWidth: options.borderWidth ?? 0,
      rotate: options.rotate ?? degrees(0),
      hidden: options.hidden,
      page: page.ref,
    });
    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    this.acroField.addWidget(widgetRef);

    // Set appearance streams for widget
    widget.setAppearanceState(PDFName.of('Off'));
    this.updateWidgetAppearance(widget, PDFName.of('Yes'));

    // Add widget to the given page
    page.node.addAnnot(widgetRef);
  }

  /**
   * Returns `true` if any of this check box's widgets do not have an
   * appearance stream for its current state. For example:
   * ```js
   * const checkBox = form.getCheckBox('some.checkBox.field')
   * if (checkBox.needsAppearancesUpdate()) console.log('Needs update')
   * ```
   * @returns Whether or not this check box needs an appearance update.
   */
  needsAppearancesUpdate(): boolean {
    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const state = widget.getAppearanceState();
      const normal = widget.getAppearances()?.normal;

      if (!(normal instanceof PDFDict)) return true;
      if (state && !normal.has(state)) return true;
    }

    return false;
  }

  /**
   * Update the appearance streams for each of this check box's widgets using
   * the default appearance provider for check boxes. For example:
   * ```js
   * const checkBox = form.getCheckBox('some.checkBox.field')
   * checkBox.defaultUpdateAppearances()
   * ```
   */
  defaultUpdateAppearances() {
    this.updateAppearances();
  }

  /**
   * Update the appearance streams for each of this check box's widgets using
   * the given appearance provider. If no `provider` is passed, the default
   * appearance provider for check boxs will be used. For example:
   * ```js
   * const checkBox = form.getCheckBox('some.checkBox.field')
   * checkBox.updateAppearances((field, widget) => {
   *   ...
   *   return {
   *     normal: { on: drawCheckBox(...), off: drawCheckBox(...) },
   *     down: { on: drawCheckBox(...), off: drawCheckBox(...) },
   *   }
   * })
   * ```
   * @param provider Optionally, the appearance provider to be used for
   *                 generating the contents of the appearance streams.
   */
  updateAppearances(provider?: AppearanceProviderFor<PDFCheckBox>) {
    assertOrUndefined(provider, 'provider', [Function]);

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const onValue = widget.getOnValue() ?? PDFName.of('Yes');
      if (!onValue) continue;
      this.updateWidgetAppearance(widget, onValue, provider);
    }
    this.markAsClean();
  }

  private updateWidgetAppearance(
    widget: PDFWidgetAnnotation,
    onValue: PDFName,
    provider?: AppearanceProviderFor<PDFCheckBox>,
  ) {
    const apProvider = provider ?? defaultCheckBoxAppearanceProvider;
    const appearances = normalizeAppearance(apProvider(this, widget));
    this.updateOnOffWidgetAppearance(widget, onValue, appearances);
  }
}
