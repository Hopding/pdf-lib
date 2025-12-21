// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import PDFDocument from '../src/api/PDFDocument';
import PDFTextField from '../src/api/form/PDFTextField';
import PDFCheckBox from '../src/api/form/PDFCheckBox';
import PDFRadioGroup from '../src/api/form/PDFRadioGroup';
import PDFDropdown from '../src/api/form/PDFDropdown';
import PDFOptionList from '../src/api/form/PDFOptionList';
import PDFButton from '../src/api/form/PDFButton';
import PDFSignature from '../src/api/form/PDFSignature';

export async function fuzz(data: Buffer): Promise<void> {
  // Skip empty or too large inputs (1MB matches pdf_form.options max_len)
  if (data.length === 0 || data.length > 1024 * 1024) {
    return;
  }

  try {
    const pdfDoc = await PDFDocument.load(data, {
      ignoreEncryption: true,
      throwOnInvalidObject: false,
      updateMetadata: false,
    });

    // Access the form
    const form = pdfDoc.getForm();

    // Get all fields
    const fields = form.getFields();

    // Iterate through fields using instanceof for type-specific logic
    for (const field of fields) {
      field.getName();

      if (field instanceof PDFTextField) {
        field.getText();
        field.setText('test');
        field.getMaxLength();
        field.isMultiline();
        field.isPassword();
        field.isFileSelector();
        field.isRichFormatted();
      } else if (field instanceof PDFCheckBox) {
        field.isChecked();
        field.check();
        field.uncheck();
      } else if (field instanceof PDFRadioGroup) {
        field.getOptions();
        field.getSelected();
      } else if (field instanceof PDFDropdown) {
        field.getOptions();
        field.getSelected();
        field.isEditable();
        field.isMultiselect();
      } else if (field instanceof PDFOptionList) {
        field.getOptions();
        field.getSelected();
        field.isMultiselect();
      } else if (field instanceof PDFButton) {
        field.isReadOnly();
      } else if (field instanceof PDFSignature) {
        field.isReadOnly();
      }
    }

    // Try to flatten the form
    form.flatten();

  } catch (e) {
    // Expected for malformed PDF data
  }
}
