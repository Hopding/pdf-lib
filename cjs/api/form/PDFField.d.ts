import PDFDocument from "../PDFDocument";
import PDFFont from "../PDFFont";
import { AppearanceMapping } from "./appearances";
import { Color } from "../colors";
import { Rotation } from "../rotations";
import { PDFRef, PDFWidgetAnnotation, PDFOperator, PDFName, PDFDict, PDFAcroTerminal } from "../../core";
import { ImageAlignment } from '../image';
import PDFImage from '../PDFImage';
export interface FieldAppearanceOptions {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    textColor?: Color;
    backgroundColor?: Color;
    borderColor?: Color;
    borderWidth?: number;
    rotate?: Rotation;
    font?: PDFFont;
    hidden?: boolean;
}
export declare const assertFieldAppearanceOptions: (options?: FieldAppearanceOptions | undefined) => void;
/**
 * Represents a field of a [[PDFForm]].
 *
 * This class is effectively abstract. All fields in a [[PDFForm]] will
 * actually be an instance of a subclass of this class.
 *
 * Note that each field in a PDF is represented by a single field object.
 * However, a given field object may be rendered at multiple locations within
 * the document (across one or more pages). The rendering of a field is
 * controlled by its widgets. Each widget causes its field to be displayed at a
 * particular location in the document.
 *
 * Most of the time each field in a PDF has only a single widget, and thus is
 * only rendered once. However, if a field is rendered multiple times, it will
 * have multiple widgets - one for each location it is rendered.
 *
 * This abstraction of field objects and widgets is defined in the PDF
 * specification and dictates how PDF files store fields and where they are
 * to be rendered.
 */
export default class PDFField {
    /** The low-level PDFAcroTerminal wrapped by this field. */
    readonly acroField: PDFAcroTerminal;
    /** The unique reference assigned to this field within the document. */
    readonly ref: PDFRef;
    /** The document to which this field belongs. */
    readonly doc: PDFDocument;
    protected constructor(acroField: PDFAcroTerminal, ref: PDFRef, doc: PDFDocument);
    /**
     * Get the fully qualified name of this field. For example:
     * ```js
     * const fields = form.getFields()
     * fields.forEach(field => {
     *   const name = field.getName()
     *   console.log('Field name:', name)
     * })
     * ```
     * Note that PDF fields are structured as a tree. Each field is the
     * descendent of a series of ancestor nodes all the way up to the form node,
     * which is always the root of the tree. Each node in the tree (except for
     * the form node) has a partial name. Partial names can be composed of any
     * unicode characters except a period (`.`). The fully qualified name of a
     * field is composed of the partial names of all its ancestors joined
     * with periods. This means that splitting the fully qualified name on
     * periods and taking the last element of the resulting array will give you
     * the partial name of a specific field.
     * @returns The fully qualified name of this field.
     */
    getName(): string;
    /**
     * Returns `true` if this field is read only. This means that PDF readers
     * will not allow users to interact with the field or change its value. See
     * [[PDFField.enableReadOnly]] and [[PDFField.disableReadOnly]].
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * if (field.isReadOnly()) console.log('Read only is enabled')
     * ```
     * @returns Whether or not this is a read only field.
     */
    isReadOnly(): boolean;
    /**
     * Prevent PDF readers from allowing users to interact with this field or
     * change its value. The field will not respond to mouse or keyboard input.
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * field.enableReadOnly()
     * ```
     * Useful for fields whose values are computed, imported from a database, or
     * prefilled by software before being displayed to the user.
     */
    enableReadOnly(): void;
    /**
     * Allow users to interact with this field and change its value in PDF
     * readers via mouse and keyboard input. For example:
     * ```js
     * const field = form.getField('some.field')
     * field.disableReadOnly()
     * ```
     */
    disableReadOnly(): void;
    /**
     * Returns `true` if this field must have a value when the form is submitted.
     * See [[PDFField.enableRequired]] and [[PDFField.disableRequired]].
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * if (field.isRequired()) console.log('Field is required')
     * ```
     * @returns Whether or not this field is required.
     */
    isRequired(): boolean;
    /**
     * Require this field to have a value when the form is submitted.
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * field.enableRequired()
     * ```
     */
    enableRequired(): void;
    /**
     * Do not require this field to have a value when the form is submitted.
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * field.disableRequired()
     * ```
     */
    disableRequired(): void;
    /**
     * Returns `true` if this field's value should be exported when the form is
     * submitted. See [[PDFField.enableExporting]] and
     * [[PDFField.disableExporting]].
     * For example:
     * ```js
     * const field = form.getField('some.field')
     * if (field.isExported()) console.log('Exporting is enabled')
     * ```
     * @returns Whether or not this field's value should be exported.
     */
    isExported(): boolean;
    /**
     * Indicate that this field's value should be exported when the form is
     * submitted in a PDF reader. For example:
     * ```js
     * const field = form.getField('some.field')
     * field.enableExporting()
     * ```
     */
    enableExporting(): void;
    /**
     * Indicate that this field's value should **not** be exported when the form
     * is submitted in a PDF reader. For example:
     * ```js
     * const field = form.getField('some.field')
     * field.disableExporting()
     * ```
     */
    disableExporting(): void;
    /** @ignore */
    needsAppearancesUpdate(): boolean;
    /** @ignore */
    defaultUpdateAppearances(_font: PDFFont): void;
    protected markAsDirty(): void;
    protected markAsClean(): void;
    protected isDirty(): boolean;
    protected createWidget(options: {
        x: number;
        y: number;
        width: number;
        height: number;
        textColor?: Color;
        backgroundColor?: Color;
        borderColor?: Color;
        borderWidth: number;
        rotate: Rotation;
        caption?: string;
        hidden?: boolean;
        page?: PDFRef;
    }): PDFWidgetAnnotation;
    protected updateWidgetAppearanceWithFont(widget: PDFWidgetAnnotation, font: PDFFont, { normal, rollover, down }: AppearanceMapping<PDFOperator[]>): void;
    protected updateOnOffWidgetAppearance(widget: PDFWidgetAnnotation, onValue: PDFName, { normal, rollover, down, }: AppearanceMapping<{
        on: PDFOperator[];
        off: PDFOperator[];
    }>): void;
    protected updateWidgetAppearances(widget: PDFWidgetAnnotation, { normal, rollover, down }: AppearanceMapping<PDFRef | PDFDict>): void;
    private createAppearanceStream;
    /**
     * Create a FormXObject of the supplied image and add it to context.
     * The FormXObject size is calculated based on the widget (including
     * the alignment).
     * @param widget The widget that should display the image.
     * @param alignment The alignment of the image.
     * @param image The image that should be displayed.
     * @returns The ref for the FormXObject that was added to the context.
     */
    protected createImageAppearanceStream(widget: PDFWidgetAnnotation, image: PDFImage, alignment: ImageAlignment): PDFRef;
    private createAppearanceDict;
}
//# sourceMappingURL=PDFField.d.ts.map