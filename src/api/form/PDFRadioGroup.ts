import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFField, {
  FieldAppearanceOptions,
  assertFieldAppearanceOptions,
} from 'src/api/form/PDFField';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultRadioGroupAppearanceProvider,
} from 'src/api/form/appearances';
import { rgb } from 'src/api/colors';
import { degrees } from 'src/api/rotations';

import {
  PDFName,
  PDFRef,
  PDFHexString,
  PDFDict,
  PDFWidgetAnnotation,
  PDFAcroRadioButton,
  AcroButtonFlags,
} from 'src/core';
import { assertIs, assertOrUndefined, assertIsOneOf } from 'src/utils';

/**
 * Represents a radio group field of a [[PDFForm]].
 *
 * [[PDFRadioGroup]] fields are collections of radio buttons. The purpose of a
 * radio group is to enable users to select one option from a set of mutually
 * exclusive choices. Each choice in a radio group is represented by a radio
 * button. Radio buttons each have two states: `on` and `off`. At most one
 * radio button in a group may be in the `on` state at any time. Users can
 * click on a radio button to select it (and thereby automatically deselect any
 * other radio button that might have already been selected). Some radio
 * groups allow users to toggle a selected radio button `off` by clicking on
 * it (see [[PDFRadioGroup.isOffToggleable]]).
 *
 * Note that some radio groups allow multiple radio buttons to be in the `on`
 * state at the same type **if** they represent the same underlying value (see
 * [[PDFRadioGroup.isMutuallyExclusive]]).
 */
export default class PDFRadioGroup extends PDFField {
  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFForm.getOptionList]] method, which will create an
   * > instance of [[PDFOptionList]] for you.
   *
   * Create an instance of [[PDFOptionList]] from an existing acroRadioButton
   * and ref
   *
   * @param acroRadioButton The underlying `PDFAcroRadioButton` for this
   *                        radio group.
   * @param ref The unique reference for this radio group.
   * @param doc The document to which this radio group will belong.
   */
  static of = (
    acroRadioButton: PDFAcroRadioButton,
    ref: PDFRef,
    doc: PDFDocument,
  ) => new PDFRadioGroup(acroRadioButton, ref, doc);

  /** The low-level PDFAcroRadioButton wrapped by this radio group. */
  readonly acroField: PDFAcroRadioButton;

  private constructor(
    acroRadioButton: PDFAcroRadioButton,
    ref: PDFRef,
    doc: PDFDocument,
  ) {
    super(acroRadioButton, ref, doc);

    assertIs(acroRadioButton, 'acroRadioButton', [
      [PDFAcroRadioButton, 'PDFAcroRadioButton'],
    ]);

    this.acroField = acroRadioButton;
  }

  /**
   * Get the list of available options for this radio group. Each option is
   * represented by a radio button. These radio buttons are displayed at
   * various locations in the document, potentially on different pages (though
   * typically they are stacked horizontally or vertically on the same page).
   * For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * const options = radioGroup.getOptions()
   * console.log('Radio Group options:', options)
   * ```
   * @returns The options for this radio group.
   */
  getOptions(): string[] {
    const exportValues = this.acroField.getExportValues();
    if (exportValues) {
      const exportOptions = new Array<string>(exportValues.length);
      for (let idx = 0, len = exportValues.length; idx < len; idx++) {
        exportOptions[idx] = exportValues[idx].decodeText();
      }
      return exportOptions;
    }

    const onValues = this.acroField.getOnValues();
    const onOptions = new Array<string>(onValues.length);
    for (let idx = 0, len = onOptions.length; idx < len; idx++) {
      onOptions[idx] = onValues[idx].decodeText();
    }
    return onOptions;
  }

  /**
   * Get the selected option for this radio group. The selected option is
   * represented by the radio button in this group that is turned on. At most
   * one radio button in a group can be selected. If no buttons in this group
   * are selected, `undefined` is returned.
   * For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * const selected = radioGroup.getSelected()
   * console.log('Selected radio button:', selected)
   * ```
   * @returns The selected option for this radio group.
   */
  getSelected(): string | undefined {
    const value = this.acroField.getValue();
    if (value === PDFName.of('Off')) return undefined;
    const exportValues = this.acroField.getExportValues();
    if (exportValues) {
      const onValues = this.acroField.getOnValues();
      for (let idx = 0, len = onValues.length; idx < len; idx++) {
        if (onValues[idx] === value) return exportValues[idx].decodeText();
      }
    }
    return value.decodeText();
  }

  // // TODO: Figure out why this seems to crash Acrobat. Maybe it's because we
  // //       aren't removing the widget reference from the page's Annots?
  // removeOption(option: string) {
  //   assertIs(option, 'option', ['string']);
  //   // TODO: Assert is valid `option`!

  //   const onValues = this.acroField.getOnValues();
  //   const exportValues = this.acroField.getExportValues();
  //   if (exportValues) {
  //     for (let idx = 0, len = exportValues.length; idx < len; idx++) {
  //       if (exportValues[idx].decodeText() === option) {
  //         this.acroField.removeWidget(idx);
  //         this.acroField.removeExportValue(idx);
  //       }
  //     }
  //   } else {
  //     for (let idx = 0, len = onValues.length; idx < len; idx++) {
  //       const value = onValues[idx];
  //       if (value.decodeText() === option) {
  //         this.acroField.removeWidget(idx);
  //         this.acroField.removeExportValue(idx);
  //       }
  //     }
  //   }
  // }

  /**
   * Select an option for this radio group. This operation is analogous to a
   * human user clicking one of the radio buttons in this group via a PDF
   * reader to toggle it on. This method will update the underlying state of
   * the radio group to indicate which option has been selected. PDF libraries
   * and readers will be able to extract this value from the saved document and
   * determine which option was selected.
   *
   * For example:
   * ```js
   * const radioGroup = form.getRadioGroup('best.superhero.radioGroup')
   * radioGroup.select('One Punch Man')
   * ```
   *
   * This method will mark this radio group as dirty, causing its appearance
   * streams to be updated when either [[PDFDocument.save]] or
   * [[PDFForm.updateFieldAppearances]] is called. The updated appearance
   * streams will display a dot inside the widget of this check box field
   * that represents the selected option.
   *
   * @param option The option to be selected.
   */
  select(option: string) {
    assertIs(option, 'option', ['string']);

    const validOptions = this.getOptions();
    assertIsOneOf(option, 'option', validOptions);

    this.markAsDirty();

    const onValues = this.acroField.getOnValues();
    const exportValues = this.acroField.getExportValues();
    if (exportValues) {
      for (let idx = 0, len = exportValues.length; idx < len; idx++) {
        if (exportValues[idx].decodeText() === option) {
          this.acroField.setValue(onValues[idx]);
        }
      }
    } else {
      for (let idx = 0, len = onValues.length; idx < len; idx++) {
        const value = onValues[idx];
        if (value.decodeText() === option) this.acroField.setValue(value);
      }
    }
  }

  /**
   * Clear any selected option for this dropdown. This will result in all
   * radio buttons in this group being toggled off. This method will update
   * the underlying state of the dropdown to indicate that no radio buttons
   * have been selected.
   * For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * radioGroup.clear()
   * ```
   * This method will mark this radio group as dirty. See
   * [[PDFRadioGroup.select]] for more details about what this means.
   */
  clear() {
    this.markAsDirty();
    this.acroField.setValue(PDFName.of('Off'));
  }

  /**
   * Returns `true` if users can click on radio buttons in this group to toggle
   * them off. The alternative is that once a user clicks on a radio button
   * to select it, the only way to deselect it is by selecting on another radio
   * button in the group. See [[PDFRadioGroup.enableOffToggling]] and
   * [[PDFRadioGroup.disableOffToggling]]. For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * if (radioGroup.isOffToggleable()) console.log('Off toggling is enabled')
   * ```
   */
  isOffToggleable() {
    return !this.acroField.hasFlag(AcroButtonFlags.NoToggleToOff);
  }

  /**
   * Allow users to click on selected radio buttons in this group to toggle
   * them off. For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * radioGroup.enableOffToggling()
   * ```
   * > **NOTE:** This feature is documented in the PDF specification
   * > (Table 226). However, most PDF readers do not respect this option and
   * > prevent users from toggling radio buttons off even when it is enabled.
   * > At the time of this writing (9/6/2020) Mac's Preview software did
   * > respect the option. Adobe Acrobat, Foxit Reader, and Google Chrome did
   * > not.
   */
  enableOffToggling() {
    this.acroField.setFlagTo(AcroButtonFlags.NoToggleToOff, false);
  }

  /**
   * Prevent users from clicking on selected radio buttons in this group to
   * toggle them off. Clicking on a selected radio button will have no effect.
   * The only way to deselect a selected radio button is to click on a
   * different radio button in the group. For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * radioGroup.disableOffToggling()
   * ```
   */
  disableOffToggling() {
    this.acroField.setFlagTo(AcroButtonFlags.NoToggleToOff, true);
  }

  /**
   * Returns `true` if the radio buttons in this group are mutually exclusive.
   * This means that when the user selects a radio button, only that specific
   * button will be turned on. Even if other radio buttons in the group
   * represent the same value, they will not be enabled. The alternative to
   * this is that clicking a radio button will select that button along with
   * any other radio buttons in the group that share the same value. See
   * [[PDFRadioGroup.enableMutualExclusion]] and
   * [[PDFRadioGroup.disableMutualExclusion]].
   * For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * if (radioGroup.isMutuallyExclusive()) console.log('Mutual exclusion is enabled')
   * ```
   */
  isMutuallyExclusive() {
    return !this.acroField.hasFlag(AcroButtonFlags.RadiosInUnison);
  }

  /**
   * When the user clicks a radio button in this group it will be selected. In
   * addition, any other radio buttons in this group that share the same
   * underlying value will also be selected. For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * radioGroup.enableMutualExclusion()
   * ```
   * Note that this option must be enabled prior to adding options to the
   * radio group. It does not currently apply retroactively to existing
   * radio buttons in the group.
   */
  enableMutualExclusion() {
    this.acroField.setFlagTo(AcroButtonFlags.RadiosInUnison, false);
  }

  /**
   * When the user clicks a radio button in this group only it will be selected.
   * No other radio buttons in the group will be selected, even if they share
   * the same underlying value. For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * radioGroup.disableMutualExclusion()
   * ```
   * Note that this option must be disabled prior to adding options to the
   * radio group. It does not currently apply retroactively to existing
   * radio buttons in the group.
   */
  disableMutualExclusion() {
    this.acroField.setFlagTo(AcroButtonFlags.RadiosInUnison, true);
  }

  /**
   * Add a new radio button to this group on the specified page. For example:
   * ```js
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const radioGroup = form.createRadioGroup('best.gundam')
   *
   * const options = {
   *   x: 50,
   *   width: 25,
   *   height: 25,
   *   textColor: rgb(1, 0, 0),
   *   backgroundColor: rgb(0, 1, 0),
   *   borderColor: rgb(0, 0, 1),
   *   borderWidth: 2,
   *   rotate: degrees(90),
   * }
   *
   * radioGroup.addOptionToPage('Exia', page, { ...options, y: 50 })
   * radioGroup.addOptionToPage('Dynames', page, { ...options, y: 110 })
   * ```
   * This will create a new radio button widget for this radio group field.
   * @param option The option that the radio button widget represents.
   * @param page The page to which the radio button widget should be added.
   * @param options The options to be used when adding the radio button widget.
   */
  addOptionToPage(
    option: string,
    page: PDFPage,
    options?: FieldAppearanceOptions,
  ) {
    assertIs(option, 'option', ['string']);
    assertIs(page, 'page', [[PDFPage, 'PDFPage']]);
    assertFieldAppearanceOptions(options);

    // Create a widget for this radio button
    const widget = this.createWidget({
      x: options?.x ?? 0,
      y: options?.y ?? 0,
      width: options?.width ?? 50,
      height: options?.height ?? 50,
      textColor: options?.textColor ?? rgb(0, 0, 0),
      backgroundColor: options?.backgroundColor ?? rgb(1, 1, 1),
      borderColor: options?.borderColor ?? rgb(0, 0, 0),
      borderWidth: options?.borderWidth ?? 1,
      rotate: options?.rotate ?? degrees(0),
      hidden: options?.hidden,
      page: page.ref,
    });
    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    const apStateValue = this.acroField.addWidgetWithOpt(
      widgetRef,
      PDFHexString.fromText(option),
      !this.isMutuallyExclusive(),
    );

    // Set appearance streams for widget
    widget.setAppearanceState(PDFName.of('Off'));
    this.updateWidgetAppearance(widget, apStateValue);

    // Add widget to the given page
    page.node.addAnnot(widgetRef);
  }

  /**
   * Returns `true` if any of this group's radio button widgets do not have an
   * appearance stream for their current state. For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * if (radioGroup.needsAppearancesUpdate()) console.log('Needs update')
   * ```
   * @returns Whether or not this radio group needs an appearance update.
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
   * Update the appearance streams for each of this group's radio button widgets
   * using the default appearance provider for radio groups. For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * radioGroup.defaultUpdateAppearances()
   * ```
   */
  defaultUpdateAppearances() {
    this.updateAppearances();
  }

  // rg.updateAppearances((field: any, widget: any) => {
  //   assert(field === rg);
  //   assert(widget instanceof PDFWidgetAnnotation);
  //   return { on: [...rectangle, ...circle], off: [...rectangle, ...circle] };
  // });

  /**
   * Update the appearance streams for each of this group's radio button widgets
   * using the given appearance provider. If no `provider` is passed, the
   * default appearance provider for radio groups will be used. For example:
   * ```js
   * const radioGroup = form.getRadioGroup('some.radioGroup.field')
   * radioGroup.updateAppearances((field, widget) => {
   *   ...
   *   return {
   *     normal: { on: drawRadioButton(...), off: drawRadioButton(...) },
   *     down: { on: drawRadioButton(...), off: drawRadioButton(...) },
   *   }
   * })
   * ```
   * @param provider Optionally, the appearance provider to be used for
   *                 generating the contents of the appearance streams.
   */
  updateAppearances(provider?: AppearanceProviderFor<PDFRadioGroup>) {
    assertOrUndefined(provider, 'provider', [Function]);

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];
      const onValue = widget.getOnValue();
      if (!onValue) continue;
      this.updateWidgetAppearance(widget, onValue, provider);
    }
  }

  private updateWidgetAppearance(
    widget: PDFWidgetAnnotation,
    onValue: PDFName,
    provider?: AppearanceProviderFor<PDFRadioGroup>,
  ) {
    const apProvider = provider ?? defaultRadioGroupAppearanceProvider;
    const appearances = normalizeAppearance(apProvider(this, widget));
    this.updateOnOffWidgetAppearance(widget, onValue, appearances);
  }
}
