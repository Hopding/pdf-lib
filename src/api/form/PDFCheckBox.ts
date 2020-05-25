import PDFDocument from 'src/api/PDFDocument';
import { PDFAcroCheckBox } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import { PDFName, PDFOperator, PDFContentStream, PDFDict } from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeProvider,
  defaultCheckBoxAppearanceProvider,
} from 'src/api/form/appearances';

/**
 * Represents a check box field of a [[PDFForm]].
 */
export default class PDFCheckBox extends PDFField {
  static of = (acroCheckBox: PDFAcroCheckBox, doc: PDFDocument) =>
    new PDFCheckBox(acroCheckBox, doc);

  /** The low-level PDFAcroCheckBox wrapped by this check box. */
  readonly acroField: PDFAcroCheckBox;

  /** The document to which this check box belongs. */
  readonly doc: PDFDocument;

  private constructor(acroCheckBox: PDFAcroCheckBox, doc: PDFDocument) {
    super(acroCheckBox, doc);

    assertIs(acroCheckBox, 'acroCheckBox', [
      [PDFAcroCheckBox, 'PDFAcroCheckBox'],
    ]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroField = acroCheckBox;
    this.doc = doc;
  }

  // TODO: Allow supplying `AppearanceProvider` and updating APs
  check() {
    const onValue = this.acroField.getOnValue();
    if (!onValue) throw new Error('TODO: FIX ME!');
    this.acroField.setValue(onValue);
  }

  // TODO: Allow supplying `AppearanceProvider` and updating APs
  uncheck() {
    this.acroField.setValue(PDFName.of('Off'));
  }

  isChecked(): boolean {
    const onValue = this.acroField.getOnValue();
    return !!onValue && onValue === this.acroField.getValue();
  }

  updateAppearances(provider?: AppearanceProviderFor<PDFCheckBox>) {
    const apProvider = normalizeProvider(
      provider ?? defaultCheckBoxAppearanceProvider,
    );

    const widgets = this.acroField.getWidgets();
    for (let idx = 0, len = widgets.length; idx < len; idx++) {
      const widget = widgets[idx];

      const normalOps = apProvider.normal(this, widget);
      const normalDict = this.createAppearanceDict(widget, normalOps);
      if (normalDict) widget.setNormalAppearance(normalDict);

      if (apProvider.rollover) {
        const rolloverOps = apProvider.rollover(this, widget);
        const rolloverDict = this.createAppearanceDict(widget, rolloverOps);
        if (rolloverDict) widget.setRolloverAppearance(rolloverDict);
      }

      if (apProvider.down) {
        const downOps = apProvider.down(this, widget);
        const downDict = this.createAppearanceDict(widget, downOps);
        if (downDict) widget.setDownAppearance(downDict);
      }
    }
  }

  private createAppearanceDict(
    widget: PDFWidgetAnnotation,
    appearance: { checked: PDFOperator[]; unchecked: PDFOperator[] },
  ): PDFDict | undefined {
    const { context } = this.acroField.dict;
    const { width, height } = widget.getRectangle();
    const onValue = widget.getOnValue();

    if (!onValue) return undefined;

    const xObjectDict = context.obj({
      Type: 'XObject',
      Subtype: 'Form',
      BBox: context.obj([0, 0, width, height]),
      Matrix: context.obj([1, 0, 0, 1, 0, 0]),
    });

    const onStream = PDFContentStream.of(xObjectDict, appearance.checked);
    const onStreamRef = context.register(onStream);

    const offStream = PDFContentStream.of(xObjectDict, appearance.unchecked);
    const offStreamRef = context.register(offStream);

    const appearanceDict = context.obj({});
    appearanceDict.set(onValue, onStreamRef);
    appearanceDict.set(PDFName.of('Off'), offStreamRef);

    return appearanceDict;
  }
}
