import PDFDocument from 'src/api/PDFDocument';
import PDFPage from 'src/api/PDFPage';
import PDFField from 'src/api/form/PDFField';
import PDFButton from 'src/api/form/PDFButton';
import PDFCheckBox from 'src/api/form/PDFCheckBox';
import PDFDropdown from 'src/api/form/PDFDropdown';
import PDFOptionList from 'src/api/form/PDFOptionList';
import PDFRadioGroup from 'src/api/form/PDFRadioGroup';
import PDFSignature from 'src/api/form/PDFSignature';
import PDFTextField from 'src/api/form/PDFTextField';
import {
  NoSuchFieldError,
  UnexpectedFieldTypeError,
  FieldAlreadyExistsError,
  InvalidFieldNamePartError,
} from 'src/api/errors';
import PDFFont from 'src/api/PDFFont';
import { StandardFonts } from 'src/api/StandardFonts';
import { rotateInPlace } from 'src/api/operations';
import {
  drawObject,
  popGraphicsState,
  pushGraphicsState,
  translate,
} from 'src/api/operators';
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
  PDFDict,
  PDFOperator,
  PDFRef,
  createPDFAcroFields,
  PDFName,
  PDFWidgetAnnotation,
} from 'src/core';
import { assertIs, Cache, assertOrUndefined } from 'src/utils';

export interface FlattenOptions {
  updateFieldAppearances: boolean;
}

/**
 * Represents the interactive form of a [[PDFDocument]].
 *
 * Interactive forms (sometimes called _AcroForms_) are collections of fields
 * designed to gather information from a user. A PDF document may contains any
 * number of fields that appear on various pages, all of which make up a single,
 * global interactive form spanning the entire document. This means that
 * instances of [[PDFDocument]] shall contain at most one [[PDFForm]].
 *
 * The fields of an interactive form are represented by [[PDFField]] instances.
 */
export default class PDFForm {
  /**
   * > **NOTE:** You probably don't want to call this method directly. Instead,
   * > consider using the [[PDFDocument.getForm]] method, which will create an
   * > instance of [[PDFForm]] for you.
   *
   * Create an instance of [[PDFForm]] from an existing acroForm and embedder
   *
   * @param acroForm The underlying `PDFAcroForm` for this form.
   * @param doc The document to which the form will belong.
   */
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
    this.defaultFontCache = Cache.populatedBy(this.embedDefaultFont);
  }

  /**
   * Returns `true` if this [[PDFForm]] has XFA data. Most PDFs with form
   * fields do not use XFA as it is not widely supported by PDF readers.
   *
   * > `pdf-lib` does not support creation, modification, or reading of XFA
   * > fields.
   *
   * For example:
   * ```js
   * const form = pdfDoc.getForm()
   * if (form.hasXFA()) console.log('PDF has XFA data')
   * ```
   * @returns Whether or not this form has XFA data.
   */
  hasXFA(): boolean {
    return this.acroForm.dict.has(PDFName.of('XFA'));
  }

  /**
   * Disconnect the XFA data from this [[PDFForm]] (if any exists). This will
   * force readers to fallback to standard fields if the [[PDFDocument]]
   * contains any. For example:
   *
   * For example:
   * ```js
   * const form = pdfDoc.getForm()
   * form.deleteXFA()
   * ```
   */
  deleteXFA(): void {
    this.acroForm.dict.delete(PDFName.of('XFA'));
  }

  /**
   * Get all fields contained in this [[PDFForm]]. For example:
   * ```js
   * const form = pdfDoc.getForm()
   * const fields = form.getFields()
   * fields.forEach(field => {
   *   const type = field.constructor.name
   *   const name = field.getName()
   *   console.log(`${type}: ${name}`)
   * })
   * ```
   * @returns An array of all fields in this form.
   */
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

  /**
   * Get the field in this [[PDFForm]] with the given name. For example:
   * ```js
   * const form = pdfDoc.getForm()
   * const field = form.getFieldMaybe('Page1.Foo.Bar[0]')
   * if (field) console.log('Field exists!')
   * ```
   * @param name A fully qualified field name.
   * @returns The field with the specified name, if one exists.
   */
  getFieldMaybe(name: string): PDFField | undefined {
    assertIs(name, 'name', ['string']);
    const fields = this.getFields();
    for (let idx = 0, len = fields.length; idx < len; idx++) {
      const field = fields[idx];
      if (field.getName() === name) return field;
    }
    return undefined;
  }

  /**
   * Get the field in this [[PDFForm]] with the given name. For example:
   * ```js
   * const form = pdfDoc.getForm()
   * const field = form.getField('Page1.Foo.Bar[0]')
   * ```
   * If no field exists with the provided name, an error will be thrown.
   * @param name A fully qualified field name.
   * @returns The field with the specified name.
   */
  getField(name: string): PDFField {
    assertIs(name, 'name', ['string']);
    const field = this.getFieldMaybe(name);
    if (field) return field;
    throw new NoSuchFieldError(name);
  }

  /**
   * Get the button field in this [[PDFForm]] with the given name. For example:
   * ```js
   * const form = pdfDoc.getForm()
   * const button = form.getButton('Page1.Foo.Button[0]')
   * ```
   * An error will be thrown if no field exists with the provided name, or if
   * the field exists but is not a button.
   * @param name A fully qualified button name.
   * @returns The button with the specified name.
   */
  getButton(name: string): PDFButton {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFButton) return field;
    throw new UnexpectedFieldTypeError(name, PDFButton, field);
  }

  /**
   * Get the check box field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const form = pdfDoc.getForm()
   * const checkBox = form.getCheckBox('Page1.Foo.CheckBox[0]')
   * checkBox.check()
   * ```
   * An error will be thrown if no field exists with the provided name, or if
   * the field exists but is not a check box.
   * @param name A fully qualified check box name.
   * @returns The check box with the specified name.
   */
  getCheckBox(name: string): PDFCheckBox {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFCheckBox) return field;
    throw new UnexpectedFieldTypeError(name, PDFCheckBox, field);
  }

  /**
   * Get the dropdown field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const form = pdfDoc.getForm()
   * const dropdown = form.getDropdown('Page1.Foo.Dropdown[0]')
   * const options = dropdown.getOptions()
   * dropdown.select(options[0])
   * ```
   * An error will be thrown if no field exists with the provided name, or if
   * the field exists but is not a dropdown.
   * @param name A fully qualified dropdown name.
   * @returns The dropdown with the specified name.
   */
  getDropdown(name: string): PDFDropdown {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFDropdown) return field;
    throw new UnexpectedFieldTypeError(name, PDFDropdown, field);
  }

  /**
   * Get the option list field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const form = pdfDoc.getForm()
   * const optionList = form.getOptionList('Page1.Foo.OptionList[0]')
   * const options = optionList.getOptions()
   * optionList.select(options[0])
   * ```
   * An error will be thrown if no field exists with the provided name, or if
   * the field exists but is not an option list.
   * @param name A fully qualified option list name.
   * @returns The option list with the specified name.
   */
  getOptionList(name: string): PDFOptionList {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFOptionList) return field;
    throw new UnexpectedFieldTypeError(name, PDFOptionList, field);
  }

  /**
   * Get the radio group field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const form = pdfDoc.getForm()
   * const radioGroup = form.getRadioGroup('Page1.Foo.RadioGroup[0]')
   * const options = radioGroup.getOptions()
   * radioGroup.select(options[0])
   * ```
   * An error will be thrown if no field exists with the provided name, or if
   * the field exists but is not a radio group.
   * @param name A fully qualified radio group name.
   * @returns The radio group with the specified name.
   */
  getRadioGroup(name: string): PDFRadioGroup {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFRadioGroup) return field;
    throw new UnexpectedFieldTypeError(name, PDFRadioGroup, field);
  }

  /**
   * Get the signature field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const form = pdfDoc.getForm()
   * const signature = form.getSignature('Page1.Foo.Signature[0]')
   * ```
   * An error will be thrown if no field exists with the provided name, or if
   * the field exists but is not a signature.
   * @param name A fully qualified signature name.
   * @returns The signature with the specified name.
   */
  getSignature(name: string): PDFSignature {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFSignature) return field;
    throw new UnexpectedFieldTypeError(name, PDFSignature, field);
  }

  /**
   * Get the text field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const form = pdfDoc.getForm()
   * const textField = form.getTextField('Page1.Foo.TextField[0]')
   * textField.setText('Are you designed to act or to be acted upon?')
   * ```
   * An error will be thrown if no field exists with the provided name, or if
   * the field exists but is not a text field.
   * @param name A fully qualified text field name.
   * @returns The text field with the specified name.
   */
  getTextField(name: string): PDFTextField {
    assertIs(name, 'name', ['string']);
    const field = this.getField(name);
    if (field instanceof PDFTextField) return field;
    throw new UnexpectedFieldTypeError(name, PDFTextField, field);
  }

  /**
   * Create a new button field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const button = form.createButton('cool.new.button')
   *
   * button.addToPage('Do Stuff', font, page)
   * ```
   * An error will be thrown if a field already exists with the provided name.
   * @param name The fully qualified name for the new button.
   * @returns The new button field.
   */
  createButton(name: string): PDFButton {
    assertIs(name, 'name', ['string']);

    const nameParts = splitFieldName(name);
    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const button = PDFAcroPushButton.create(this.doc.context);
    button.setPartialName(nameParts.terminal);

    addFieldToParent(parent, [button, button.ref], nameParts.terminal);

    return PDFButton.of(button, button.ref, this.doc);
  }

  /**
   * Create a new check box field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const checkBox = form.createCheckBox('cool.new.checkBox')
   *
   * checkBox.addToPage(page)
   * ```
   * An error will be thrown if a field already exists with the provided name.
   * @param name The fully qualified name for the new check box.
   * @returns The new check box field.
   */
  createCheckBox(name: string): PDFCheckBox {
    assertIs(name, 'name', ['string']);

    const nameParts = splitFieldName(name);
    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const checkBox = PDFAcroCheckBox.create(this.doc.context);
    checkBox.setPartialName(nameParts.terminal);

    addFieldToParent(parent, [checkBox, checkBox.ref], nameParts.terminal);

    return PDFCheckBox.of(checkBox, checkBox.ref, this.doc);
  }

  /**
   * Create a new dropdown field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const dropdown = form.createDropdown('cool.new.dropdown')
   *
   * dropdown.addToPage(font, page)
   * ```
   * An error will be thrown if a field already exists with the provided name.
   * @param name The fully qualified name for the new dropdown.
   * @returns The new dropdown field.
   */
  createDropdown(name: string): PDFDropdown {
    assertIs(name, 'name', ['string']);

    const nameParts = splitFieldName(name);
    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const comboBox = PDFAcroComboBox.create(this.doc.context);
    comboBox.setPartialName(nameParts.terminal);

    addFieldToParent(parent, [comboBox, comboBox.ref], nameParts.terminal);

    return PDFDropdown.of(comboBox, comboBox.ref, this.doc);
  }

  /**
   * Create a new option list field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const optionList = form.createOptionList('cool.new.optionList')
   *
   * optionList.addToPage(font, page)
   * ```
   * An error will be thrown if a field already exists with the provided name.
   * @param name The fully qualified name for the new option list.
   * @returns The new option list field.
   */
  createOptionList(name: string): PDFOptionList {
    assertIs(name, 'name', ['string']);

    const nameParts = splitFieldName(name);
    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const listBox = PDFAcroListBox.create(this.doc.context);
    listBox.setPartialName(nameParts.terminal);

    addFieldToParent(parent, [listBox, listBox.ref], nameParts.terminal);

    return PDFOptionList.of(listBox, listBox.ref, this.doc);
  }

  /**
   * Create a new radio group field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const radioGroup = form.createRadioGroup('cool.new.radioGroup')
   *
   * radioGroup.addOptionToPage('is-dog', page, { y: 0 })
   * radioGroup.addOptionToPage('is-cat', page, { y: 75 })
   * ```
   * An error will be thrown if a field already exists with the provided name.
   * @param name The fully qualified name for the new radio group.
   * @returns The new radio group field.
   */
  createRadioGroup(name: string): PDFRadioGroup {
    assertIs(name, 'name', ['string']);
    const nameParts = splitFieldName(name);

    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const radioButton = PDFAcroRadioButton.create(this.doc.context);
    radioButton.setPartialName(nameParts.terminal);

    addFieldToParent(
      parent,
      [radioButton, radioButton.ref],
      nameParts.terminal,
    );

    return PDFRadioGroup.of(radioButton, radioButton.ref, this.doc);
  }

  /**
   * Create a new text field in this [[PDFForm]] with the given name.
   * For example:
   * ```js
   * const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
   * const page = pdfDoc.addPage()
   *
   * const form = pdfDoc.getForm()
   * const textField = form.createTextField('cool.new.textField')
   *
   * textField.addToPage(font, page)
   * ```
   * An error will be thrown if a field already exists with the provided name.
   * @param name The fully qualified name for the new radio group.
   * @returns The new radio group field.
   */
  createTextField(name: string): PDFTextField {
    assertIs(name, 'name', ['string']);
    const nameParts = splitFieldName(name);

    const parent = this.findOrCreateNonTerminals(nameParts.nonTerminal);

    const text = PDFAcroText.create(this.doc.context);
    text.setPartialName(nameParts.terminal);

    addFieldToParent(parent, [text, text.ref], nameParts.terminal);

    return PDFTextField.of(text, text.ref, this.doc);
  }

  /**
   * Flatten all fields in this [[PDFForm]].
   *
   * Flattening a form field will take the current appearance for each of that
   * field's widgets and make them part of their page's content stream. All form
   * fields and annotations associated are then removed. Note that once a form
   * has been flattened its fields can no longer be accessed or edited.
   *
   * This operation is often used after filling form fields to ensure a
   * consistent appearance across different PDF readers and/or printers.
   * Another common use case is to copy a template document with form fields
   * into another document. In this scenario you would load the template
   * document, fill its fields, flatten it, and then copy its pages into the
   * recipient document - the filled fields will be copied over.
   *
   * For example:
   * ```js
   * const form = pdfDoc.getForm();
   * form.flatten();
   * ```
   */
  flatten(options: FlattenOptions = { updateFieldAppearances: true }) {
    if (options.updateFieldAppearances) {
      this.updateFieldAppearances();
    }

    const fields = this.getFields();

    for (let i = 0, lenFields = fields.length; i < lenFields; i++) {
      const field = fields[i];
      const widgets = field.acroField.getWidgets();

      for (let j = 0, lenWidgets = widgets.length; j < lenWidgets; j++) {
        const widget = widgets[j];
        const page = this.findWidgetPage(widget);
        const widgetRef = this.findWidgetAppearanceRef(field, widget);

        const xObjectKey = page.node.newXObject('FlatWidget', widgetRef);

        const rectangle = widget.getRectangle();
        const operators = [
          pushGraphicsState(),
          translate(rectangle.x, rectangle.y),
          ...rotateInPlace({ ...rectangle, rotation: 0 }),
          drawObject(xObjectKey),
          popGraphicsState(),
        ].filter(Boolean) as PDFOperator[];

        page.pushOperators(...operators);
      }

      this.removeField(field);
    }
  }

  /**
   * Remove a field from this [[PDFForm]].
   *
   * For example:
   * ```js
   * const form = pdfDoc.getForm();
   * const ageField = form.getFields().find(x => x.getName() === 'Age');
   * form.removeField(ageField);
   * ```
   */
  removeField(field: PDFField) {
    const widgets = field.acroField.getWidgets();
    const pages: Set<PDFPage> = new Set();

    for (let i = 0, len = widgets.length; i < len; i++) {
      const widget = widgets[i];
      const widgetRef = this.findWidgetAppearanceRef(field, widget);

      const page = this.findWidgetPage(widget);
      pages.add(page);

      page.node.removeAnnot(widgetRef);
    }

    pages.forEach((page) => page.node.removeAnnot(field.ref));
    this.acroForm.removeField(field.acroField);
    const fieldKids = field.acroField.normalizedEntries().Kids;
    const kidsCount = fieldKids.size();
    for (let childIndex = 0; childIndex < kidsCount; childIndex++) {
      const child = fieldKids.get(childIndex);
      if (child instanceof PDFRef) {
        this.doc.context.delete(child);
      }
    }
    this.doc.context.delete(field.ref);
  }

  /**
   * Update the appearance streams for all widgets of all fields in this
   * [[PDFForm]]. Appearance streams will only be created for a widget if it
   * does not have any existing appearance streams, or the field's value has
   * changed (e.g. by calling [[PDFTextField.setText]] or
   * [[PDFDropdown.select]]).
   *
   * For example:
   * ```js
   * const courier = await pdfDoc.embedFont(StandardFonts.Courier)
   * const form = pdfDoc.getForm()
   * form.updateFieldAppearances(courier)
   * ```
   *
   * **IMPORTANT:** The default value for the `font` parameter is
   * [[StandardFonts.Helvetica]]. Note that this is a WinAnsi font. This means
   * that encoding errors will be thrown if any fields contain text with
   * characters outside the WinAnsi character set (the latin alphabet).
   *
   * Embedding a custom font and passing that as the `font`
   * parameter allows you to generate appearance streams with non WinAnsi
   * characters (assuming your custom font supports them).
   *
   * > **NOTE:** The [[PDFDocument.save]] method will call this method to
   * > update appearances automatically if a form was accessed via the
   * > [[PDFDocument.getForm]] method prior to saving.
   *
   * @param font Optionally, the font to use when creating new appearances.
   */
  updateFieldAppearances(font?: PDFFont) {
    assertOrUndefined(font, 'font', [[PDFFont, 'PDFFont']]);

    font = font ?? this.getDefaultFont();

    const fields = this.getFields();

    for (let idx = 0, len = fields.length; idx < len; idx++) {
      const field = fields[idx];
      if (field.needsAppearancesUpdate()) {
        field.defaultUpdateAppearances(font);
      }
    }
  }

  /**
   * Mark a field as dirty. This will cause its appearance streams to be
   * updated by [[PDFForm.updateFieldAppearances]].
   * ```js
   * const form = pdfDoc.getForm()
   * const field = form.getField('foo.bar')
   * form.markFieldAsDirty(field.ref)
   * ```
   * @param fieldRef The reference to the field that should be marked.
   */
  markFieldAsDirty(fieldRef: PDFRef) {
    assertOrUndefined(fieldRef, 'fieldRef', [[PDFRef, 'PDFRef']]);
    this.dirtyFields.add(fieldRef);
  }

  /**
   * Mark a field as dirty. This will cause its appearance streams to not be
   * updated by [[PDFForm.updateFieldAppearances]].
   * ```js
   * const form = pdfDoc.getForm()
   * const field = form.getField('foo.bar')
   * form.markFieldAsClean(field.ref)
   * ```
   * @param fieldRef The reference to the field that should be marked.
   */
  markFieldAsClean(fieldRef: PDFRef) {
    assertOrUndefined(fieldRef, 'fieldRef', [[PDFRef, 'PDFRef']]);
    this.dirtyFields.delete(fieldRef);
  }

  /**
   * Returns `true` is the specified field has been marked as dirty.
   * ```js
   * const form = pdfDoc.getForm()
   * const field = form.getField('foo.bar')
   * if (form.fieldIsDirty(field.ref)) console.log('Field is dirty')
   * ```
   * @param fieldRef The reference to the field that should be checked.
   * @returns Whether or not the specified field is dirty.
   */
  fieldIsDirty(fieldRef: PDFRef): boolean {
    assertOrUndefined(fieldRef, 'fieldRef', [[PDFRef, 'PDFRef']]);
    return this.dirtyFields.has(fieldRef);
  }

  getDefaultFont() {
    return this.defaultFontCache.access();
  }

  private findWidgetPage(widget: PDFWidgetAnnotation): PDFPage {
    const pageRef = widget.P();
    let page = this.doc.getPages().find((x) => x.ref === pageRef);
    if (page === undefined) {
      const widgetRef = this.doc.context.getObjectRef(widget.dict);
      if (widgetRef === undefined) {
        throw new Error('Could not find PDFRef for PDFObject');
      }

      page = this.doc.findPageForAnnotationRef(widgetRef);

      if (page === undefined) {
        throw new Error(`Could not find page for PDFRef ${widgetRef}`);
      }
    }

    return page;
  }

  private findWidgetAppearanceRef(
    field: PDFField,
    widget: PDFWidgetAnnotation,
  ): PDFRef {
    let refOrDict = widget.getNormalAppearance();

    if (
      refOrDict instanceof PDFDict &&
      (field instanceof PDFCheckBox || field instanceof PDFRadioGroup)
    ) {
      const value = field.acroField.getValue();
      const ref = refOrDict.get(value) ?? refOrDict.get(PDFName.of('Off'));

      if (ref instanceof PDFRef) {
        refOrDict = ref;
      }
    }

    if (!(refOrDict instanceof PDFRef)) {
      const name = field.getName();
      throw new Error(`Failed to extract appearance ref for: ${name}`);
    }

    return refOrDict;
  }

  private findOrCreateNonTerminals(partialNames: string[]) {
    let nonTerminal: [PDFAcroForm] | [PDFAcroNonTerminal, PDFRef] = [
      this.acroForm,
    ];
    for (let idx = 0, len = partialNames.length; idx < len; idx++) {
      const namePart = partialNames[idx];
      if (!namePart) throw new InvalidFieldNamePartError(namePart);
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
        throw new FieldAlreadyExistsError(partialName);
      }
    }

    return undefined;
  }

  private embedDefaultFont = (): PDFFont =>
    this.doc.embedStandardFont(StandardFonts.Helvetica);
}

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
      throw new FieldAlreadyExistsError(partialName);
    }
  }
  parent.addField(fieldRef);
  field.setParent(parentRef);
};
