import { PDFOperator, PDFWidgetAnnotation } from "../../core";
import PDFFont from "../PDFFont";
import PDFButton from "./PDFButton";
import PDFCheckBox from "./PDFCheckBox";
import PDFDropdown from "./PDFDropdown";
import PDFField from "./PDFField";
import PDFOptionList from "./PDFOptionList";
import PDFRadioGroup from "./PDFRadioGroup";
import PDFSignature from "./PDFSignature";
import PDFTextField from "./PDFTextField";
/*********************** Appearance Provider Types ****************************/
declare type CheckBoxAppearanceProvider = (checkBox: PDFCheckBox, widget: PDFWidgetAnnotation) => AppearanceOrMapping<{
    on: PDFOperator[];
    off: PDFOperator[];
}>;
declare type RadioGroupAppearanceProvider = (radioGroup: PDFRadioGroup, widget: PDFWidgetAnnotation) => AppearanceOrMapping<{
    on: PDFOperator[];
    off: PDFOperator[];
}>;
declare type ButtonAppearanceProvider = (button: PDFButton, widget: PDFWidgetAnnotation, font: PDFFont) => AppearanceOrMapping<PDFOperator[]>;
declare type DropdownAppearanceProvider = (dropdown: PDFDropdown, widget: PDFWidgetAnnotation, font: PDFFont) => AppearanceOrMapping<PDFOperator[]>;
declare type OptionListAppearanceProvider = (optionList: PDFOptionList, widget: PDFWidgetAnnotation, font: PDFFont) => AppearanceOrMapping<PDFOperator[]>;
declare type TextFieldAppearanceProvider = (textField: PDFTextField, widget: PDFWidgetAnnotation, font: PDFFont) => AppearanceOrMapping<PDFOperator[]>;
declare type SignatureAppearanceProvider = (signature: PDFSignature, widget: PDFWidgetAnnotation, font: PDFFont) => AppearanceOrMapping<PDFOperator[]>;
/******************* Appearance Provider Utility Types ************************/
export declare type AppearanceMapping<T> = {
    normal: T;
    rollover?: T;
    down?: T;
};
declare type AppearanceOrMapping<T> = T | AppearanceMapping<T>;
export declare type AppearanceProviderFor<T extends PDFField> = T extends PDFCheckBox ? CheckBoxAppearanceProvider : T extends PDFRadioGroup ? RadioGroupAppearanceProvider : T extends PDFButton ? ButtonAppearanceProvider : T extends PDFDropdown ? DropdownAppearanceProvider : T extends PDFOptionList ? OptionListAppearanceProvider : T extends PDFTextField ? TextFieldAppearanceProvider : T extends PDFSignature ? SignatureAppearanceProvider : never;
/********************* Appearance Provider Functions **************************/
export declare const normalizeAppearance: <T>(appearance: T | AppearanceMapping<T>) => AppearanceMapping<T>;
export declare const defaultCheckBoxAppearanceProvider: AppearanceProviderFor<PDFCheckBox>;
export declare const defaultRadioGroupAppearanceProvider: AppearanceProviderFor<PDFRadioGroup>;
export declare const defaultButtonAppearanceProvider: AppearanceProviderFor<PDFButton>;
export declare const defaultTextFieldAppearanceProvider: AppearanceProviderFor<PDFTextField>;
export declare const defaultDropdownAppearanceProvider: AppearanceProviderFor<PDFDropdown>;
export declare const defaultOptionListAppearanceProvider: AppearanceProviderFor<PDFOptionList>;
export {};
//# sourceMappingURL=appearances.d.ts.map