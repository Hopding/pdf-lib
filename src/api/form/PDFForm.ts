import PDFDocument from 'src/api/PDFDocument';
import {
  PDFAcroForm,
  PDFAcroField,
  PDFAcroCheckBox,
  PDFAcroComboBox,
  PDFAcroListBox,
  PDFAcroRadioButton,
  PDFAcroSignature,
  PDFAcroText,
  PDFAcroPushButton,
  PDFAcroNonTerminal,
} from 'src/core/acroform';
import { assertIs, Cache } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import PDFButton from 'src/api/form/PDFButton';
import PDFCheckBox from 'src/api/form/PDFCheckBox';
import PDFDropdown from 'src/api/form/PDFDropdown';
import PDFOptionList from 'src/api/form/PDFOptionList';
import PDFRadioGroup from 'src/api/form/PDFRadioGroup';
import PDFSignature from 'src/api/form/PDFSignature';
import PDFTextField from 'src/api/form/PDFTextField';
import { createPDFAcroFields } from 'src/core/acroform/utils';
import { PDFRef, PDFDict, PDFStream } from 'src/core';
import { NoSuchFieldError, UnexpectedFieldTypeError } from 'src/api/errors';
import { PDFFont } from '..';
import { StandardFonts } from '../StandardFonts';

const convertToPDFField = (
  field: PDFAcroField,
  ref: PDFRef,
  doc: PDFDocument,
): PDFField | undefined => {
  if (field instanceof PDFAcroPushButton) return PDFButton.of(field, ref, doc);
  if (field instanceof PDFAcroCheckBox) return PDFCheckBox.of(field, ref, doc);
  if (field instanceof PDFAcroComboBox) return PDFDropdown.of(field, ref, doc);
  if (field instanceof PDFAcroListBox) return PDFOptionList.of(field, ref, doc);
  if (field instanceof PDFAcroText) return PDFTextField.of(field, ref, doc);
  if (field instanceof PDFAcroRadioButton) {
    return PDFRadioGroup.of(field, ref, doc);
  }
  if (field instanceof PDFAcroSignature) {
    return PDFSignature.of(field, ref, doc);
  }
  return undefined;
};

const splitFieldName = (fullyQualifiedName: string) => {
  if (fullyQualifiedName.length === 0) {
    throw new Error('PDF field names must not be empty strings');
  }

  const parts = fullyQualifiedName.split('.');

  for (let idx = 0, len = parts.length; idx < len; idx++) {
    if (parts[idx] === '') {
      throw new Error(
        `Periods in PDF field names must be separated by at least one character: "${fullyQualifiedName}"`,
      );
    }
  }

  if (parts.length === 1) return { nonTerminal: [], terminal: parts[0] };

  return {
    nonTerminal: parts.slice(0, parts.length - 1),
    terminal: parts[parts.length - 1],
  };
};

const addFieldToParent = (
  [parent, parentRef]: [PDFAcroForm] | [PDFAcroNonTerminal, PDFRef],
  [field, fieldRef]: [PDFAcroField, PDFRef],
  partialName: string,
) => {
  const entries = parent.normalizedEntries();
  const fields = createPDFAcroFields(
    'Kids' in entries ? entries.Kids : entries.Fields,
  );
  for (let idx = 0, len = fields.length; idx < len; idx++) {
    if (fields[idx][0].getPartialName() === partialName) {
      throw new Error('TODO: FIX ME!!! Duplicate field name');
    }
  }
  parent.addField(fieldRef);
  field.setParent(parentRef);
};

/**
 * Represents the form of a [[PDFDocument]].
 */
export default class PDFForm {
  static of = (acroForm: PDFAcroForm, doc: PDFDocument) =>
    new PDFForm(acroForm, doc);

  /** The low-level PDFAcroForm wrapped by this form. */
  readonly acroForm: PDFAcroForm;

  /** The document to which this form belongs. */
  readonly doc: PDFDocument;

  private readonly dirtyFields: Set<PDFRef>;
  private readonly defaultFontCache: Cache<PDFFont>;

  private constructor(acroForm: PDFAcroForm, doc: PDFDocument) {
    assertIs(acroForm, 'acroForm', [[PDFAcroForm, 'PDFAcroForm']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroForm = acroForm;
    this.doc = doc;

    this.dirtyFields = new Set();
    this.defaultFontCache = Cache.populatedBy(this.computeDefaultFont);
  }

  getFields(): PDFField[] {
    const allFields = this.acroForm.getAllFields();

    const fields: PDFField[] = [];
    for (let idx = 0, len = allFields.length; idx < len; idx++) {
      const [acroField, ref] = allFields[idx];
      const field = convertToPDFField(acroField, ref, this.doc);
      if (field) fields.push(field);
    }

    return fields;
  }

  getFieldMaybe(name: string): PDFField | undefined {
    assertIs(name, 'name', ['string']);
    const fields = this.getFields();
    for (let idx = 0, len = fields.length; idx < len; idx++) {
      const field = fields[idx];
      if (field.getName() === name) return field;
    }
    return undefined;
  }

  getField(name: string): PDFField {
    assertIs(name, 'name', ['string']);
    const field = this.getFieldMaybe(name);
    if (field) return field;
    throw new NoSuchFieldError(name);
  }

  getButton(name: string): PDFButton {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFButton) return field;
    throw new UnexpectedFieldTypeError(name, PDFButton, field);
  }

  getCheckBox(name: string): PDFCheckBox {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFCheckBox) return field;
    throw new UnexpectedFieldTypeError(name, PDFCheckBox, field);
  }

  getDropdown(name: string): PDFDropdown {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFDropdown) return field;
    throw new UnexpectedFieldTypeError(name, PDFDropdown, field);
  }

  getOptionList(name: string): PDFOptionList {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFOptionList) return field;
    throw new UnexpectedFieldTypeError(name, PDFOptionList, field);
  }

  getRadioGroup(name: string): PDFRadioGroup {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFRadioGroup) return field;
    throw new UnexpectedFieldTypeError(name, PDFRadioGroup, field);
  }

  getSignature(name: string): PDFSignature {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFSignature) return field;
    throw new UnexpectedFieldTypeError(name, PDFSignature, field);
  }

  getTextField(name: string): PDFTextField {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFTextField) return field;
    throw new UnexpectedFieldTypeError(name, PDFTextField, field);
  }

  createButton(name: string): PDFButton {
    assertIs(name, 'name', ['string']);

    const nameParts = splitFieldName(name);
    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const button = PDFAcroPushButton.create(this.doc.context);
    button.setPartialName(nameParts.terminal);
    const buttonRef = this.doc.context.register(button.dict);

    addFieldToParent(parent, [button, buttonRef], nameParts.terminal);

    return PDFButton.of(button, buttonRef, this.doc);
  }

  createCheckBox(name: string): PDFCheckBox {
    assertIs(name, 'name', ['string']);

    const nameParts = splitFieldName(name);
    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const checkBox = PDFAcroCheckBox.create(this.doc.context);
    checkBox.setPartialName(nameParts.terminal);
    const checkBoxRef = this.doc.context.register(checkBox.dict);

    addFieldToParent(parent, [checkBox, checkBoxRef], nameParts.terminal);

    return PDFCheckBox.of(checkBox, checkBoxRef, this.doc);
  }

  createDropdown(name: string): PDFDropdown {
    assertIs(name, 'name', ['string']);

    const nameParts = splitFieldName(name);
    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const comboBox = PDFAcroComboBox.create(this.doc.context);
    comboBox.setPartialName(nameParts.terminal);
    const comboBoxRef = this.doc.context.register(comboBox.dict);

    addFieldToParent(parent, [comboBox, comboBoxRef], nameParts.terminal);

    return PDFDropdown.of(comboBox, comboBoxRef, this.doc);
  }

  createOptionList(name: string): PDFOptionList {
    assertIs(name, 'name', ['string']);

    const nameParts = splitFieldName(name);
    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const listBox = PDFAcroListBox.create(this.doc.context);
    listBox.setPartialName(nameParts.terminal);
    const listBoxRef = this.doc.context.register(listBox.dict);

    addFieldToParent(parent, [listBox, listBoxRef], nameParts.terminal);

    return PDFOptionList.of(listBox, listBoxRef, this.doc);
  }

  createRadioGroup(name: string): PDFRadioGroup {
    assertIs(name, 'name', ['string']);
    const nameParts = splitFieldName(name);

    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const radioButton = PDFAcroRadioButton.create(this.doc.context);
    radioButton.setPartialName(nameParts.terminal);
    const radioButtonRef = this.doc.context.register(radioButton.dict);

    addFieldToParent(parent, [radioButton, radioButtonRef], nameParts.terminal);

    return PDFRadioGroup.of(radioButton, radioButtonRef, this.doc);
  }

  createTextField(name: string): PDFTextField {
    assertIs(name, 'name', ['string']);
    const nameParts = splitFieldName(name);

    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const text = PDFAcroText.create(this.doc.context);
    text.setPartialName(nameParts.terminal);
    const textRef = this.doc.context.register(text.dict);

    addFieldToParent(parent, [text, textRef], nameParts.terminal);

    return PDFTextField.of(text, textRef, this.doc);
  }

  updateDirtyFieldAppearances(font?: PDFFont) {
    font = font ?? this.defaultFontCache.access();

    const fields = this.getFields();

    for (let idx = 0, len = fields.length; idx < len; idx++) {
      const field = fields[idx];
      if (this.dirtyFields.has(field.ref)) {
        field.defaultUpdateAppearances(font);
      }
    }
  }

  foo(field: PDFField) {
    if (field instanceof PDFCheckBox || field instanceof PDFRadioGroup) {
      const widgets = field.acroField.getWidgets();
      for (let idx = 0, len = widgets.length; idx < len; idx++) {
        const widget = field.acroField.getWidgets()[idx];
        const value = field.acroField.getValue();
        const normal = widget.getAppearances()?.normal;
        if (normal instanceof PDFDict) {
          if (normal.lookup(value) instanceof PDFStream) return true;
        }
      }
    }
    return false;
  }

  markFieldAsDirty(fieldRef: PDFRef) {
    this.dirtyFields.add(fieldRef);
  }

  markFieldAsClean(fieldRef: PDFRef) {
    this.dirtyFields.delete(fieldRef);
  }

  private findOrCreateNonTerminals(partialNames: string[]) {
    let nonTerminal: [PDFAcroForm] | [PDFAcroNonTerminal, PDFRef] = [
      this.acroForm,
    ];
    for (let idx = 0, len = partialNames.length; idx < len; idx++) {
      const namePart = partialNames[idx];
      if (!namePart) throw new Error('TODO: FIX ME! invalid name part...');
      const [parent, parentRef] = nonTerminal;
      const res = this.findNonTerminal(namePart, parent);

      if (res) {
        nonTerminal = res;
      } else {
        const node = PDFAcroNonTerminal.create(this.doc.context);
        node.setPartialName(namePart);
        node.setParent(parentRef);
        const nodeRef = this.doc.context.register(node.dict);
        parent.addField(nodeRef);
        nonTerminal = [node, nodeRef];
      }
    }
    return nonTerminal;
  }

  private findNonTerminal(
    partialName: string,
    parent: PDFAcroForm | PDFAcroNonTerminal,
  ): [PDFAcroNonTerminal, PDFRef] | undefined {
    const fields =
      parent instanceof PDFAcroForm
        ? this.acroForm.getFields()
        : createPDFAcroFields(parent.Kids());

    for (let idx = 0, len = fields.length; idx < len; idx++) {
      const [field, ref] = fields[idx];
      if (field.getPartialName() === partialName) {
        if (field instanceof PDFAcroNonTerminal) return [field, ref];
        throw new Error('TODO: FIX ME! Found field, but is not a non-terminal');
      }
    }

    return undefined;
  }

  private computeDefaultFont = (): PDFFont =>
    this.doc.embedStandardFont(StandardFonts.Helvetica);
}
