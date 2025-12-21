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

export async function fuzz(data: Buffer): Promise<void> {
  // Skip empty or too large inputs
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

    // Iterate through fields and exercise them
    for (const field of fields) {
      try {
        field.getName();

        // Try to get field as different types
        try {
          const textField = form.getTextField(field.getName());
          textField.getText();
          textField.setText('test');
        } catch (e) { /* not a text field */ }

        try {
          const checkBox = form.getCheckBox(field.getName());
          checkBox.isChecked();
        } catch (e) { /* not a checkbox */ }

        try {
          const radioGroup = form.getRadioGroup(field.getName());
          radioGroup.getOptions();
          radioGroup.getSelected();
        } catch (e) { /* not a radio group */ }

        try {
          const dropdown = form.getDropdown(field.getName());
          dropdown.getOptions();
          dropdown.getSelected();
        } catch (e) { /* not a dropdown */ }

        try {
          const optionList = form.getOptionList(field.getName());
          optionList.getOptions();
          optionList.getSelected();
        } catch (e) { /* not an option list */ }

        try {
          const button = form.getButton(field.getName());
        } catch (e) { /* not a button */ }

      } catch (e) {
        // Field access errors are expected
      }
    }

    // Try to flatten the form
    try {
      form.flatten();
    } catch (e) {
      // Flatten errors are expected for malformed forms
    }

  } catch (e) {
    // Expected for malformed PDF data
  }
}
