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
import { drawCheckBox, rotateInPlace } from 'src/api/operations';
import { rgb } from 'src/api/colors';
import { reduceRotation, adjustDimsForRotation } from '../rotations';

/*********************** Appearance Provider Types ****************************/

type CheckBoxAppearanceProvider = (
  checkBox: PDFCheckBox,
  widget: PDFWidgetAnnotation,
) => AppearanceOrMapping<{
  checked: PDFOperator[];
  unchecked: PDFOperator[];
}>;

type RadioGroupAppearanceProvider = (
  radioGroup: PDFRadioGroup,
  widget: PDFWidgetAnnotation,
) => AppearanceOrMapping<{
  selected: PDFOperator[];
  unselected: PDFOperator[];
}>;

type ButtonAppearanceProvider = (
  button: PDFButton,
  widget: PDFWidgetAnnotation,
  font: PDFFont,
) => AppearanceOrMapping<PDFOperator[]>;

type DropdownAppearanceProvider = (
  dropdown: PDFDropdown,
  widget: PDFWidgetAnnotation,
  font: PDFFont,
) => AppearanceOrMapping<PDFOperator[]>;

type OptionListAppearanceProvider = (
  optionList: PDFOptionList,
  widget: PDFWidgetAnnotation,
  font: PDFFont,
) => AppearanceOrMapping<PDFOperator[]>;

type TextFieldAppearanceProvider = (
  textField: PDFTextField,
  widget: PDFWidgetAnnotation,
  font: PDFFont,
) => AppearanceOrMapping<PDFOperator[]>;

type SignatureAppearanceProvider = (
  signature: PDFSignature,
  widget: PDFWidgetAnnotation,
  font: PDFFont,
) => AppearanceOrMapping<PDFOperator[]>;

/******************* Appearance Provider Utility Types ************************/

type AppearanceMapping<T> = { normal: T; rollover?: T; down?: T };

type AppearanceOrMapping<T> = T | AppearanceMapping<T>;

// prettier-ignore
export type AppearanceProviderFor<T extends PDFField> = 
  T extends PDFCheckBox   ? CheckBoxAppearanceProvider
: T extends PDFRadioGroup ? RadioGroupAppearanceProvider
: T extends PDFButton     ? ButtonAppearanceProvider
: T extends PDFDropdown   ? DropdownAppearanceProvider
: T extends PDFOptionList ? OptionListAppearanceProvider
: T extends PDFTextField  ? TextFieldAppearanceProvider
: T extends PDFSignature  ? SignatureAppearanceProvider
: never;

/********************* Appearance Provider Functions **************************/

export const normalizeAppearance = <T>(
  appearance: T | AppearanceMapping<T>,
): AppearanceMapping<T> => {
  if ('normal' in appearance) return appearance;
  return { normal: appearance };
};

export const defaultCheckBoxAppearanceProvider: AppearanceProviderFor<PDFCheckBox> = (
  _checkBox,
  widget,
) => {
  const rectangle = widget.getRectangle();
  const rotation = reduceRotation(
    widget.getAppearanceCharacteristics()?.getRotation(),
  );
  const { width, height } = adjustDimsForRotation(rectangle, rotation);

  const rotate = rotateInPlace({ ...rectangle, rotation });

  const black = rgb(0, 0, 0);
  const white = rgb(1, 1, 1);
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
    normal: {
      checked: [
        ...rotate,
        ...drawCheckBox({
          ...options,
          color: white,
          markColor: black,
          filled: true,
        }),
      ],
      unchecked: [
        ...rotate,
        ...drawCheckBox({
          ...options,
          color: white,
          markColor: black,
          filled: false,
        }),
      ],
    },
    down: {
      checked: [
        ...rotate,
        ...drawCheckBox({
          ...options,
          color: grey,
          markColor: black,
          filled: true,
        }),
      ],
      unchecked: [
        ...rotate,
        ...drawCheckBox({
          ...options,
          color: grey,
          markColor: black,
          filled: false,
        }),
      ],
    },
  };
};
