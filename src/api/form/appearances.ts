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
import {
  drawCheckBox,
  rotateInPlace,
  drawRadioButton,
  drawButton,
  drawTextField,
  drawOptionList,
} from 'src/api/operations';
import {
  rgb,
  componentsToColor,
  setFillingColor,
  grayscale,
  cmyk,
  Color,
} from 'src/api/colors';
import { reduceRotation, adjustDimsForRotation } from 'src/api/rotations';
import {
  layoutMultilineText,
  layoutCombedText,
  TextPosition,
  layoutSinglelineText,
} from 'src/api/text/layout';
import { TextAlignment } from 'src/api/text/alignment';
import { setFontAndSize } from 'src/api/operators';
import { findLastMatch } from 'src/utils';

/*********************** Appearance Provider Types ****************************/

type CheckBoxAppearanceProvider = (
  checkBox: PDFCheckBox,
  widget: PDFWidgetAnnotation,
) => AppearanceOrMapping<{
  on: PDFOperator[];
  off: PDFOperator[];
}>;

type RadioGroupAppearanceProvider = (
  radioGroup: PDFRadioGroup,
  widget: PDFWidgetAnnotation,
) => AppearanceOrMapping<{
  on: PDFOperator[];
  off: PDFOperator[];
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

export type AppearanceMapping<T> = { normal: T; rollover?: T; down?: T };

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

// Examples:
//   `/Helv 12 Tf` -> ['/Helv 12 Tf', 'Helv', '12']
//   `/HeBo 8.00 Tf` -> ['/HeBo 8 Tf', 'HeBo', '8.00']
const tfRegex = /\/([^\0\t\n\f\r\ ]+)[\0\t\n\f\r\ ]+(\d*\.\d+|\d+)[\0\t\n\f\r\ ]+Tf/;

const getDefaultFontSize = (field: {
  getDefaultAppearance(): string | undefined;
}) => {
  const da = field.getDefaultAppearance() ?? '';
  const daMatch = findLastMatch(da, tfRegex).match ?? [];
  const defaultFontSize = Number(daMatch[2]);
  return isFinite(defaultFontSize) ? defaultFontSize : undefined;
};

// Examples:
//   `0.3 g` -> ['0.3', 'g']
//   `0.3 1 .3 rg` -> ['0.3', '1', '.3', 'rg']
//   `0.3 1 .3 0 k` -> ['0.3', '1', '.3', '0', 'k']
const colorRegex = /(\d*\.\d+|\d+)[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]*(\d*\.\d+|\d+)?[\0\t\n\f\r\ ]+(g|rg|k)/;

const getDefaultColor = (field: {
  getDefaultAppearance(): string | undefined;
}) => {
  const da = field.getDefaultAppearance() ?? '';
  const daMatch = findLastMatch(da, colorRegex).match;

  const [, c1, c2, c3, c4, colorSpace] = daMatch ?? [];

  if (colorSpace === 'g' && c1) {
    return grayscale(Number(c1));
  }
  if (colorSpace === 'rg' && c1 && c2 && c3) {
    return rgb(Number(c1), Number(c2), Number(c3));
  }
  if (colorSpace === 'k' && c1 && c2 && c3 && c4) {
    return cmyk(Number(c1), Number(c2), Number(c3), Number(c4));
  }

  return undefined;
};

const updateDefaultAppearance = (
  field: { setDefaultAppearance(appearance: string): void },
  color: Color,
  font?: PDFFont,
  fontSize: number = 0,
) => {
  const da = [
    setFillingColor(color).toString(),
    setFontAndSize(font?.name ?? 'dummy__noop', fontSize).toString(),
  ].join('\n');
  field.setDefaultAppearance(da);
};

export const defaultCheckBoxAppearanceProvider: AppearanceProviderFor<PDFCheckBox> = (
  checkBox,
  widget,
) => {
  // The `/DA` entry can be at the widget or field level - so we handle both
  const widgetColor = getDefaultColor(widget);
  const fieldColor = getDefaultColor(checkBox.acroField);

  const rectangle = widget.getRectangle();
  const ap = widget.getAppearanceCharacteristics();
  const bs = widget.getBorderStyle();

  const borderWidth = bs?.getWidth() ?? 0;
  const rotation = reduceRotation(ap?.getRotation());
  const { width, height } = adjustDimsForRotation(rectangle, rotation);

  const rotate = rotateInPlace({ ...rectangle, rotation });

  const black = rgb(0, 0, 0);
  const borderColor = componentsToColor(ap?.getBorderColor()) ?? black;
  const normalBackgroundColor = componentsToColor(ap?.getBackgroundColor());
  const downBackgroundColor = componentsToColor(ap?.getBackgroundColor(), 0.8);

  // Update color
  const textColor = widgetColor ?? fieldColor ?? black;
  if (widgetColor) {
    updateDefaultAppearance(widget, textColor);
  } else {
    updateDefaultAppearance(checkBox.acroField, textColor);
  }

  const options = {
    x: 0 + borderWidth / 2,
    y: 0 + borderWidth / 2,
    width: width - borderWidth,
    height: height - borderWidth,
    thickness: 1.5,
    borderWidth,
    borderColor,
    markColor: textColor,
  };

  return {
    normal: {
      on: [
        ...rotate,
        ...drawCheckBox({
          ...options,
          color: normalBackgroundColor,
          filled: true,
        }),
      ],
      off: [
        ...rotate,
        ...drawCheckBox({
          ...options,
          color: normalBackgroundColor,
          filled: false,
        }),
      ],
    },
    down: {
      on: [
        ...rotate,
        ...drawCheckBox({
          ...options,
          color: downBackgroundColor,
          filled: true,
        }),
      ],
      off: [
        ...rotate,
        ...drawCheckBox({
          ...options,
          color: downBackgroundColor,
          filled: false,
        }),
      ],
    },
  };
};

export const defaultRadioGroupAppearanceProvider: AppearanceProviderFor<PDFRadioGroup> = (
  radioGroup,
  widget,
) => {
  // The `/DA` entry can be at the widget or field level - so we handle both
  const widgetColor = getDefaultColor(widget);
  const fieldColor = getDefaultColor(radioGroup.acroField);

  const rectangle = widget.getRectangle();
  const ap = widget.getAppearanceCharacteristics();
  const bs = widget.getBorderStyle();

  const borderWidth = bs?.getWidth() ?? 0;
  const rotation = reduceRotation(ap?.getRotation());
  const { width, height } = adjustDimsForRotation(rectangle, rotation);

  const rotate = rotateInPlace({ ...rectangle, rotation });

  const black = rgb(0, 0, 0);
  const borderColor = componentsToColor(ap?.getBorderColor()) ?? black;
  const normalBackgroundColor = componentsToColor(ap?.getBackgroundColor());
  const downBackgroundColor = componentsToColor(ap?.getBackgroundColor(), 0.8);

  // Update color
  const textColor = widgetColor ?? fieldColor ?? black;
  if (widgetColor) {
    updateDefaultAppearance(widget, textColor);
  } else {
    updateDefaultAppearance(radioGroup.acroField, textColor);
  }

  const options = {
    x: width / 2,
    y: height / 2,
    width: width - borderWidth,
    height: height - borderWidth,
    borderWidth,
    borderColor,
    dotColor: textColor,
  };

  return {
    normal: {
      on: [
        ...rotate,
        ...drawRadioButton({
          ...options,
          color: normalBackgroundColor,
          filled: true,
        }),
      ],
      off: [
        ...rotate,
        ...drawRadioButton({
          ...options,
          color: normalBackgroundColor,
          filled: false,
        }),
      ],
    },
    down: {
      on: [
        ...rotate,
        ...drawRadioButton({
          ...options,
          color: downBackgroundColor,
          filled: true,
        }),
      ],
      off: [
        ...rotate,
        ...drawRadioButton({
          ...options,
          color: downBackgroundColor,
          filled: false,
        }),
      ],
    },
  };
};

export const defaultButtonAppearanceProvider: AppearanceProviderFor<PDFButton> = (
  button,
  widget,
  font,
) => {
  // The `/DA` entry can be at the widget or field level - so we handle both
  const widgetColor = getDefaultColor(widget);
  const fieldColor = getDefaultColor(button.acroField);
  const widgetFontSize = getDefaultFontSize(widget);
  const fieldFontSize = getDefaultFontSize(button.acroField);

  const rectangle = widget.getRectangle();
  const ap = widget.getAppearanceCharacteristics();
  const bs = widget.getBorderStyle();
  const captions = ap?.getCaptions();
  const normalText = captions?.normal ?? '';
  const downText = captions?.down ?? normalText ?? '';

  const borderWidth = bs?.getWidth() ?? 0;
  const rotation = reduceRotation(ap?.getRotation());
  const { width, height } = adjustDimsForRotation(rectangle, rotation);

  const rotate = rotateInPlace({ ...rectangle, rotation });

  const black = rgb(0, 0, 0);

  const borderColor = componentsToColor(ap?.getBorderColor());
  const normalBackgroundColor = componentsToColor(ap?.getBackgroundColor());
  const downBackgroundColor = componentsToColor(ap?.getBackgroundColor(), 0.8);

  const bounds = {
    x: borderWidth,
    y: borderWidth,
    width: width - borderWidth * 2,
    height: height - borderWidth * 2,
  };
  const normalLayout = layoutSinglelineText(normalText, {
    alignment: TextAlignment.Center,
    fontSize: widgetFontSize ?? fieldFontSize,
    font,
    bounds,
  });
  const downLayout = layoutSinglelineText(downText, {
    alignment: TextAlignment.Center,
    fontSize: widgetFontSize ?? fieldFontSize,
    font,
    bounds,
  });

  // Update font size and color
  const fontSize = Math.min(normalLayout.fontSize, downLayout.fontSize);
  const textColor = widgetColor ?? fieldColor ?? black;
  if (widgetColor || widgetFontSize !== undefined) {
    updateDefaultAppearance(widget, textColor, font, fontSize);
  } else {
    updateDefaultAppearance(button.acroField, textColor, font, fontSize);
  }

  const options = {
    x: 0 + borderWidth / 2,
    y: 0 + borderWidth / 2,
    width: width - borderWidth,
    height: height - borderWidth,
    borderWidth,
    borderColor,
    textColor,
    font: font.name,
    fontSize,
  };

  return {
    normal: [
      ...rotate,
      ...drawButton({
        ...options,
        color: normalBackgroundColor,
        textLines: [normalLayout.line],
      }),
    ],
    down: [
      ...rotate,
      ...drawButton({
        ...options,
        color: downBackgroundColor,
        textLines: [downLayout.line],
      }),
    ],
  };
};

export const defaultTextFieldAppearanceProvider: AppearanceProviderFor<PDFTextField> = (
  textField,
  widget,
  font,
) => {
  // The `/DA` entry can be at the widget or field level - so we handle both
  const widgetColor = getDefaultColor(widget);
  const fieldColor = getDefaultColor(textField.acroField);
  const widgetFontSize = getDefaultFontSize(widget);
  const fieldFontSize = getDefaultFontSize(textField.acroField);

  const rectangle = widget.getRectangle();
  const ap = widget.getAppearanceCharacteristics();
  const bs = widget.getBorderStyle();
  const text = textField.getText() ?? '';

  const borderWidth = bs?.getWidth() ?? 0;
  const rotation = reduceRotation(ap?.getRotation());
  const { width, height } = adjustDimsForRotation(rectangle, rotation);

  const rotate = rotateInPlace({ ...rectangle, rotation });

  const black = rgb(0, 0, 0);

  const borderColor = componentsToColor(ap?.getBorderColor());
  const normalBackgroundColor = componentsToColor(ap?.getBackgroundColor());

  let textLines: TextPosition[];
  let fontSize: number;

  const padding = textField.isCombed() ? 0 : 1;
  const bounds = {
    x: borderWidth + padding,
    y: borderWidth + padding,
    width: width - (borderWidth + padding) * 2,
    height: height - (borderWidth + padding) * 2,
  };
  if (textField.isMultiline()) {
    const layout = layoutMultilineText(text, {
      alignment: textField.getAlignment(),
      fontSize: widgetFontSize ?? fieldFontSize,
      font,
      bounds,
    });
    textLines = layout.lines;
    fontSize = layout.fontSize;
  } else if (textField.isCombed()) {
    const layout = layoutCombedText(text, {
      fontSize: widgetFontSize ?? fieldFontSize,
      font,
      bounds,
      cellCount: textField.getMaxLength() ?? 0,
    });
    textLines = layout.cells;
    fontSize = layout.fontSize;
  } else {
    const layout = layoutSinglelineText(text, {
      alignment: textField.getAlignment(),
      fontSize: widgetFontSize ?? fieldFontSize,
      font,
      bounds,
    });
    textLines = [layout.line];
    fontSize = layout.fontSize;
  }

  // Update font size and color
  const textColor = widgetColor ?? fieldColor ?? black;
  if (widgetColor || widgetFontSize !== undefined) {
    updateDefaultAppearance(widget, textColor, font, fontSize);
  } else {
    updateDefaultAppearance(textField.acroField, textColor, font, fontSize);
  }

  const options = {
    x: 0 + borderWidth / 2,
    y: 0 + borderWidth / 2,
    width: width - borderWidth,
    height: height - borderWidth,
    borderWidth: borderWidth ?? 0,
    borderColor,
    textColor,
    font: font.name,
    fontSize,
    color: normalBackgroundColor,
    textLines,
    padding,
  };

  return [...rotate, ...drawTextField(options)];
};

export const defaultDropdownAppearanceProvider: AppearanceProviderFor<PDFDropdown> = (
  dropdown,
  widget,
  font,
) => {
  // The `/DA` entry can be at the widget or field level - so we handle both
  const widgetColor = getDefaultColor(widget);
  const fieldColor = getDefaultColor(dropdown.acroField);
  const widgetFontSize = getDefaultFontSize(widget);
  const fieldFontSize = getDefaultFontSize(dropdown.acroField);

  const rectangle = widget.getRectangle();
  const ap = widget.getAppearanceCharacteristics();
  const bs = widget.getBorderStyle();
  const text = dropdown.getSelected()[0] ?? '';

  const borderWidth = bs?.getWidth() ?? 0;
  const rotation = reduceRotation(ap?.getRotation());
  const { width, height } = adjustDimsForRotation(rectangle, rotation);

  const rotate = rotateInPlace({ ...rectangle, rotation });

  const black = rgb(0, 0, 0);

  const borderColor = componentsToColor(ap?.getBorderColor());
  const normalBackgroundColor = componentsToColor(ap?.getBackgroundColor());

  const padding = 1;
  const bounds = {
    x: borderWidth + padding,
    y: borderWidth + padding,
    width: width - (borderWidth + padding) * 2,
    height: height - (borderWidth + padding) * 2,
  };
  const { line, fontSize } = layoutSinglelineText(text, {
    alignment: TextAlignment.Left,
    fontSize: widgetFontSize ?? fieldFontSize,
    font,
    bounds,
  });

  // Update font size and color
  const textColor = widgetColor ?? fieldColor ?? black;
  if (widgetColor || widgetFontSize !== undefined) {
    updateDefaultAppearance(widget, textColor, font, fontSize);
  } else {
    updateDefaultAppearance(dropdown.acroField, textColor, font, fontSize);
  }

  const options = {
    x: 0 + borderWidth / 2,
    y: 0 + borderWidth / 2,
    width: width - borderWidth,
    height: height - borderWidth,
    borderWidth: borderWidth ?? 0,
    borderColor,
    textColor,
    font: font.name,
    fontSize,
    color: normalBackgroundColor,
    textLines: [line],
    padding,
  };

  return [...rotate, ...drawTextField(options)];
};

export const defaultOptionListAppearanceProvider: AppearanceProviderFor<PDFOptionList> = (
  optionList,
  widget,
  font,
) => {
  // The `/DA` entry can be at the widget or field level - so we handle both
  const widgetColor = getDefaultColor(widget);
  const fieldColor = getDefaultColor(optionList.acroField);
  const widgetFontSize = getDefaultFontSize(widget);
  const fieldFontSize = getDefaultFontSize(optionList.acroField);

  const rectangle = widget.getRectangle();
  const ap = widget.getAppearanceCharacteristics();
  const bs = widget.getBorderStyle();

  const borderWidth = bs?.getWidth() ?? 0;
  const rotation = reduceRotation(ap?.getRotation());
  const { width, height } = adjustDimsForRotation(rectangle, rotation);

  const rotate = rotateInPlace({ ...rectangle, rotation });

  const black = rgb(0, 0, 0);

  const borderColor = componentsToColor(ap?.getBorderColor());
  const normalBackgroundColor = componentsToColor(ap?.getBackgroundColor());

  const options = optionList.getOptions();
  const selected = optionList.getSelected();

  if (optionList.isSorted()) options.sort();

  let text = '';
  for (let idx = 0, len = options.length; idx < len; idx++) {
    text += options[idx];
    if (idx < len - 1) text += '\n';
  }

  const padding = 1;
  const bounds = {
    x: borderWidth + padding,
    y: borderWidth + padding,
    width: width - (borderWidth + padding) * 2,
    height: height - (borderWidth + padding) * 2,
  };
  const { lines, fontSize, lineHeight } = layoutMultilineText(text, {
    alignment: TextAlignment.Left,
    fontSize: widgetFontSize ?? fieldFontSize,
    font,
    bounds,
  });

  const selectedLines: number[] = [];
  for (let idx = 0, len = lines.length; idx < len; idx++) {
    const line = lines[idx];
    if (selected.includes(line.text)) selectedLines.push(idx);
  }

  const blue = rgb(153 / 255, 193 / 255, 218 / 255);

  // Update font size and color
  const textColor = widgetColor ?? fieldColor ?? black;
  if (widgetColor || widgetFontSize !== undefined) {
    updateDefaultAppearance(widget, textColor, font, fontSize);
  } else {
    updateDefaultAppearance(optionList.acroField, textColor, font, fontSize);
  }

  return [
    ...rotate,
    ...drawOptionList({
      x: 0 + borderWidth / 2,
      y: 0 + borderWidth / 2,
      width: width - borderWidth,
      height: height - borderWidth,
      borderWidth: borderWidth ?? 0,
      borderColor,
      textColor,
      font: font.name,
      fontSize,
      color: normalBackgroundColor,
      textLines: lines,
      lineHeight,
      selectedColor: blue,
      selectedLines,
      padding,
    }),
  ];
};
