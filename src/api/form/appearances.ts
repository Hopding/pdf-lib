import { PDFOperator, PDFWidgetAnnotation } from 'src/core';
import PDFFont from 'src/api/PDFFont';
import PDFButton from 'src/api/form/PDFButton';
import PDFCheckBox from 'src/api/form/PDFCheckBox';
import PDFDropdown from 'src/api/form/PDFDropdown';
import PDFField from 'src/api/form/PDFField';
import PDFOptionList from 'src/api/form/PDFOptionList';
import PDFRadioGroup from 'src/api/form/PDFRadioGroup';
import PDFSignature from 'src/api/form/PDFSignature';
import PDFTextField from 'src/api/form/PDFTextField';
import { drawCheckBox } from 'src/api/operations';
import { rgb } from 'src/api/colors';

/*********************** Appearance Provider Types ****************************/

type CheckBoxAppearanceProvider = (
  checkBox: PDFCheckBox,
  widget: PDFWidgetAnnotation,
) => { checked: PDFOperator[]; unchecked: PDFOperator[] };

type RadioGroupAppearanceProvider = (
  radioGroup: PDFRadioGroup,
  widget: PDFWidgetAnnotation,
) => { selected: PDFOperator[]; unselected: PDFOperator[] };

type ButtonAppearanceProvider = (
  button: PDFButton,
  widget: PDFWidgetAnnotation,
  font: PDFFont,
) => PDFOperator[];

type DropdownAppearanceProvider = (
  dropdown: PDFDropdown,
  widget: PDFWidgetAnnotation,
  font: PDFFont,
) => PDFOperator[];

type OptionListAppearanceProvider = (
  optionList: PDFOptionList,
  widget: PDFWidgetAnnotation,
  font: PDFFont,
) => PDFOperator[];

type TextFieldAppearanceProvider = (
  textField: PDFTextField,
  widget: PDFWidgetAnnotation,
  font: PDFFont,
) => PDFOperator[];

type SignatureAppearanceProvider = (
  signature: PDFSignature,
  widget: PDFWidgetAnnotation,
  font: PDFFont,
) => PDFOperator[];

/******************* Appearance Provider Utility Types ************************/

// prettier-ignore
type FieldToAppearanceProvider<T extends PDFField> = 
  T extends PDFCheckBox   ? CheckBoxAppearanceProvider
: T extends PDFRadioGroup ? RadioGroupAppearanceProvider
: T extends PDFButton     ? ButtonAppearanceProvider
: T extends PDFDropdown   ? DropdownAppearanceProvider
: T extends PDFOptionList ? OptionListAppearanceProvider
: T extends PDFTextField  ? TextFieldAppearanceProvider
: T extends PDFSignature  ? SignatureAppearanceProvider
: never;

type AppearanceMapping<T> = { normal: T; rollover?: T; down?: T };

export type AppearanceProviderFor<T extends PDFField> =
  | FieldToAppearanceProvider<T>
  | AppearanceMapping<FieldToAppearanceProvider<T>>;

/********************* Appearance Provider Functions **************************/

export const normalizeProvider = <T extends PDFField>(
  provider: AppearanceProviderFor<T>,
): AppearanceMapping<FieldToAppearanceProvider<T>> => {
  if ('normal' in provider) return provider;
  return { normal: provider };
};

// TODO:
// Would this be cleaner if we refactored the types as follows?
//
//   AppearanceProviderFor<PDFCheckBox> =
//     (checkBox: PDFCheckBox, widget: PDFWidgetAnnotation) =>
//       { checked: PDFOperator[]; unchecked: PDFOperator[] } |
//       {
//         normal: { checked: PDFOperator[]; unchecked: PDFOperator[] },
//         rollover?: { checked: PDFOperator[]; unchecked: PDFOperator[] },
//         down?: { checked: PDFOperator[]; unchecked: PDFOperator[] },
//       }
//
export const defaultCheckBoxAppearanceProvider: AppearanceProviderFor<PDFCheckBox> = {
  normal: (_checkBox, widget) => {
    const { width, height } = widget.getRectangle();
    const black = rgb(0, 0, 0);
    const white = rgb(1, 1, 1);
    const options = {
      x: 0,
      y: 0,
      width,
      height,
      thickness: 1.5,
      borderWidth: 2,
      borderColor: black,
    };
    return {
      checked: drawCheckBox({
        ...options,
        color: white,
        markColor: black,
        filled: true,
      }),
      unchecked: drawCheckBox({
        ...options,
        color: white,
        markColor: black,
        filled: false,
      }),
    };
  },
  down: (_checkBox, widget) => {
    const { width, height } = widget.getRectangle();
    const black = rgb(0, 0, 0);
    const grey = rgb(0.8, 0.8, 0.8);
    const options = {
      x: 0,
      y: 0,
      width,
      height,
      thickness: 1.5,
      borderWidth: 2,
      borderColor: black,
    };
    return {
      checked: drawCheckBox({
        ...options,
        color: grey,
        markColor: black,
        filled: true,
      }),
      unchecked: drawCheckBox({
        ...options,
        color: grey,
        markColor: black,
        filled: false,
      }),
    };
  },
};
