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
import { assertIs } from 'src/utils';

import PDFField from 'src/api/form/PDFField';
import PDFButton from 'src/api/form/PDFButton';
import PDFCheckBox from 'src/api/form/PDFCheckBox';
import PDFDropdown from 'src/api/form/PDFDropdown';
import PDFOptionList from 'src/api/form/PDFOptionList';
import PDFRadioGroup from 'src/api/form/PDFRadioGroup';
import PDFSignature from 'src/api/form/PDFSignature';
import PDFTextField from 'src/api/form/PDFTextField';
import { createPDFAcroFields } from 'src/core/acroform/utils';
import { PDFRef, PDFHexString } from 'src/core';

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
  const parts = fullyQualifiedName.split('.');

  if (parts.length === 0) throw new Error('TODO: FIX ME!');

  if (parts.length === 1) return { nonTerminal: [], terminal: parts[0] };

  return {
    nonTerminal: parts.slice(0, parts.length - 1),
    terminal: parts[parts.length - 1],
  };
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

  private constructor(acroForm: PDFAcroForm, doc: PDFDocument) {
    assertIs(acroForm, 'acroForm', [[PDFAcroForm, 'PDFAcroForm']]);
    assertIs(doc, 'doc', [[PDFDocument, 'PDFDocument']]);

    this.acroForm = acroForm;
    this.doc = doc;
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
    throw new Error('TODO: FIX ME! no such field...');
  }

  getButton(name: string): PDFButton {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFButton) return field;
    throw new Error('TODO: FIX ME! not a button...');
  }

  getCheckBox(name: string): PDFCheckBox {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFCheckBox) return field;
    throw new Error('TODO: FIX ME! not a check box...');
  }

  getDropdown(name: string): PDFDropdown {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFDropdown) return field;
    throw new Error('TODO: FIX ME! not a dropdown...');
  }

  getOptionList(name: string): PDFOptionList {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFOptionList) return field;
    throw new Error('TODO: FIX ME! not an option list...');
  }

  getRadioGroup(name: string): PDFRadioGroup {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFRadioGroup) return field;
    throw new Error('TODO: FIX ME! not a radio group...');
  }

  getSignature(name: string): PDFSignature {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFSignature) return field;
    throw new Error('TODO: FIX ME! not a signature...');
  }

  getTextField(name: string): PDFTextField {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFTextField) return field;
    throw new Error('TODO: FIX ME! not a text field...');
  }

  createRadioGroup(name: string): PDFRadioGroup {
    assertIs(name, 'name', ['string']);
    const nameParts = splitFieldName(name);

    // let nonTerminal: [PDFAcroNonTerminal, PDFRef] | undefined;
    // for (let idx = 0, len = nameParts.nonTerminal.length; idx < len; idx++) {
    //   const namePart = nameParts.nonTerminal[idx];
    //   if (!namePart) throw new Error('TODO: FIX ME! invalid name part...');
    //   nonTerminal = this.findNonTerminal(namePart, nonTerminal?.[0]);
    // }

    const nonTerminal = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    // TODO: Verify that `terminalPart` is not empty

    const acroRadioButton = PDFAcroRadioButton.create(this.doc.context);
    acroRadioButton.setPartialName(nameParts.terminal);
    const acroRadioButtonRef = this.doc.context.register(acroRadioButton.dict);

    if (nonTerminal) {
      // TODO: Make sure a terminal doesn't already exist with this `name`
      nonTerminal[0].addField(acroRadioButtonRef);
      acroRadioButton.setParent(nonTerminal[1]);
    } else {
      this.acroForm.addField(acroRadioButtonRef);
    }

    return PDFRadioGroup.of(acroRadioButton, acroRadioButtonRef, this.doc);
  }

  private findOrCreateNonTerminals(partialNames: string[]) {
    console.log('USING PNs:', partialNames);

    // let nonTerminal: [PDFAcroForm | PDFAcroNonTerminal, PDFRef | undefined] = [
    //   this.acroForm,
    //   this.ref,
    // ];

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
        const x = PDFAcroNonTerminal.create(this.doc.context);
        x.setPartialName(namePart);
        x.setParent(parentRef);
        const xRef = this.doc.context.register(x.dict);

        console.log(
          'Created non-terminal with partial name:',
          namePart,
          PDFHexString.fromText(namePart).toString(),
        );
        parent.addField(xRef);

        nonTerminal = [x, xRef];
      }
    }
    return nonTerminal;
  }

  // TODO: Handle partial nonTerminal matches where I have to create the
  // intermediate nodes
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
}
