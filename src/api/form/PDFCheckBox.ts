import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import { PDFAcroCheckBox } from 'src/core/acroform';
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import {
  PDFName,
  PDFOperator,
  PDFContentStream,
  PDFDict,
  PDFRef,
} from 'src/core';
import { PDFWidgetAnnotation } from 'src/core/annotation';
import {
  AppearanceProviderFor,
  normalizeAppearance,
  defaultCheckBoxAppearanceProvider,
} from 'src/api/form/appearances';

/**
 * Represents a check box field of a [[PDFForm]].
 */
export default class PDFCheckBox extends PDFField {
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

  addToPage(
    page: PDFPage,
    options: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
  ) {
    const { x, y, width, height } = options;

    // Create a widget for this check box
    const widget = PDFWidgetAnnotation.create(this.doc.context, this.ref);
    const widgetRef = this.doc.context.register(widget.dict);

    // Add widget to this field
    this.acroField.addWidget(widgetRef);

    // Set widget properties
    widget.setAppearanceState(PDFName.of('Off'));
    widget.setRectangle({ x, y, width, height });

    // Set appearance streams for widget
    this.updateWidgetAppearance(widget, PDFName.of('Yes'));

    // Add widget to the given page
    const { Annots } = page.node.normalizedEntries();
    Annots.push(widgetRef);
  }

  updateAppearances(provider?: AppearanceProviderFor<PDFCheckBox>) {
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
    provider?: AppearanceProviderFor<PDFCheckBox>,
  ) {
    const apProvider = provider ?? defaultCheckBoxAppearanceProvider;

    const { normal, rollover, down } = normalizeAppearance(
      apProvider(this, widget),
    );

    widget.setNormalAppearance(
      this.createAppearanceDict(widget, onValue, normal),
    );

    if (rollover) {
      widget.setRolloverAppearance(
        this.createAppearanceDict(widget, onValue, rollover),
      );
    } else {
      widget.removeRolloverAppearance();
    }

    if (down) {
      widget.setDownAppearance(
        this.createAppearanceDict(widget, onValue, down),
      );
    } else {
      widget.removeDownAppearance();
    }
  }

  private createAppearanceDict(
    widget: PDFWidgetAnnotation,
    onValue: PDFName,
    appearance: { checked: PDFOperator[]; unchecked: PDFOperator[] },
  ): PDFDict {
    const { context } = this.acroField.dict;
    const { width, height } = widget.getRectangle();

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
