"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcroChoiceFlags = exports.AcroTextFlags = exports.AcroButtonFlags = exports.AcroFieldFlags = void 0;
var flag = function (bitIndex) { return 1 << bitIndex; };
/** From PDF spec table 221 */
var AcroFieldFlags;
(function (AcroFieldFlags) {
    /**
     * If set, the user may not change the value of the field. Any associated
     * widget annotations will not interact with the user; that is, they will not
     * respond to mouse clicks or change their appearance in response to mouse
     * motions. This flag is useful for fields whose values are computed or
     * imported from a database.
     */
    AcroFieldFlags[AcroFieldFlags["ReadOnly"] = flag(1 - 1)] = "ReadOnly";
    /**
     * If set, the field shall have a value at the time it is exported by a
     * submit-form action (see 12.7.5.2, "Submit-Form Action").
     */
    AcroFieldFlags[AcroFieldFlags["Required"] = flag(2 - 1)] = "Required";
    /**
     * If set, the field shall not be exported by a submit-form action
     * (see 12.7.5.2, "Submit-Form Action").
     */
    AcroFieldFlags[AcroFieldFlags["NoExport"] = flag(3 - 1)] = "NoExport";
})(AcroFieldFlags = exports.AcroFieldFlags || (exports.AcroFieldFlags = {}));
/** From PDF spec table 226 */
var AcroButtonFlags;
(function (AcroButtonFlags) {
    /**
     * (Radio buttons only) If set, exactly one radio button shall be selected at
     * all times; selecting the currently selected button has no effect. If clear,
     * clicking the selected button deselects it, leaving no button selected.
     */
    AcroButtonFlags[AcroButtonFlags["NoToggleToOff"] = flag(15 - 1)] = "NoToggleToOff";
    /**
     * If set, the field is a set of radio buttons; if clear, the field is a check
     * box. This flag may be set only if the Pushbutton flag is clear.
     */
    AcroButtonFlags[AcroButtonFlags["Radio"] = flag(16 - 1)] = "Radio";
    /**
     * If set, the field is a pushbutton that does not retain a permanent value.
     */
    AcroButtonFlags[AcroButtonFlags["PushButton"] = flag(17 - 1)] = "PushButton";
    /**
     * If set, a group of radio buttons within a radio button field that use the
     * same value for the on state will turn on and off in unison; that is if one
     * is checked, they are all checked. If clear, the buttons are mutually
     * exclusive (the same behavior as HTML radio buttons).
     */
    AcroButtonFlags[AcroButtonFlags["RadiosInUnison"] = flag(26 - 1)] = "RadiosInUnison";
})(AcroButtonFlags = exports.AcroButtonFlags || (exports.AcroButtonFlags = {}));
/** From PDF spec table 228 */
var AcroTextFlags;
(function (AcroTextFlags) {
    /**
     * If set, the field may contain multiple lines of text; if clear, the field's
     * text shall be restricted to a single line.
     */
    AcroTextFlags[AcroTextFlags["Multiline"] = flag(13 - 1)] = "Multiline";
    /**
     * If set, the field is intended for entering a secure password that should
     * not be echoed visibly to the screen. Characters typed from the keyboard
     * shall instead be echoed in some unreadable form, such as asterisks or
     * bullet characters.
     * > NOTE   To protect password confidentiality, readers should never store
     * >        the value of the text field in the PDF file if this flag is set.
     */
    AcroTextFlags[AcroTextFlags["Password"] = flag(14 - 1)] = "Password";
    /**
     * If set, the text entered in the field represents the pathname of a file
     * whose contents shall be submitted as the value of the field.
     */
    AcroTextFlags[AcroTextFlags["FileSelect"] = flag(21 - 1)] = "FileSelect";
    /**
     * If set, text entered in the field shall not be spell-checked.
     */
    AcroTextFlags[AcroTextFlags["DoNotSpellCheck"] = flag(23 - 1)] = "DoNotSpellCheck";
    /**
     * If set, the field shall not scroll (horizontally for single-line fields,
     * vertically for multiple-line fields) to accommodate more text than fits
     * within its annotation rectangle. Once the field is full, no further text
     * shall be accepted for interactive form filling; for non-interactive form
     * filling, the filler should take care not to add more character than will
     * visibly fit in the defined area.
     */
    AcroTextFlags[AcroTextFlags["DoNotScroll"] = flag(24 - 1)] = "DoNotScroll";
    /**
     * May be set only if the MaxLen entry is present in the text field dictionary
     * (see Table 229) and if the Multiline, Password, and FileSelect flags are
     * clear. If set, the field shall be automatically divided into as many
     * equally spaced positions, or combs, as the value of MaxLen, and the text
     * is laid out into those combs.
     */
    AcroTextFlags[AcroTextFlags["Comb"] = flag(25 - 1)] = "Comb";
    /**
     * If set, the value of this field shall be a rich text string
     * (see 12.7.3.4, "Rich Text Strings"). If the field has a value, the RV
     * entry of the field dictionary (Table 222) shall specify the rich text
     * string.
     */
    AcroTextFlags[AcroTextFlags["RichText"] = flag(26 - 1)] = "RichText";
})(AcroTextFlags = exports.AcroTextFlags || (exports.AcroTextFlags = {}));
/** From PDF spec table 230 */
var AcroChoiceFlags;
(function (AcroChoiceFlags) {
    /**
     * If set, the field is a combo box; if clear, the field is a list box.
     */
    AcroChoiceFlags[AcroChoiceFlags["Combo"] = flag(18 - 1)] = "Combo";
    /**
     * If set, the combo box shall include an editable text box as well as a
     * drop-down list; if clear, it shall include only a drop-down list. This
     * flag shall be used only if the Combo flag is set.
     */
    AcroChoiceFlags[AcroChoiceFlags["Edit"] = flag(19 - 1)] = "Edit";
    /**
     * If set, the field's option items shall be sorted alphabetically. This flag
     * is intended for use by writers, not by readers. Conforming readers shall
     * display the options in the order in which they occur in the Opt array
     * (see Table 231).
     */
    AcroChoiceFlags[AcroChoiceFlags["Sort"] = flag(20 - 1)] = "Sort";
    /**
     * If set, more than one of the field's option items may be selected
     * simultaneously; if clear, at most one item shall be selected.
     */
    AcroChoiceFlags[AcroChoiceFlags["MultiSelect"] = flag(22 - 1)] = "MultiSelect";
    /**
     * If set, text entered in the field shall not be spell-checked. This flag
     * shall not be used unless the Combo and Edit flags are both set.
     */
    AcroChoiceFlags[AcroChoiceFlags["DoNotSpellCheck"] = flag(23 - 1)] = "DoNotSpellCheck";
    /**
     * If set, the new value shall be committed as soon as a selection is made
     * (commonly with the pointing device). In this case, supplying a value for
     * a field involves three actions: selecting the field for fill-in,
     * selecting a choice for the fill-in value, and leaving that field, which
     * finalizes or "commits" the data choice and triggers any actions associated
     * with the entry or changing of this data. If this flag is on, then
     * processing does not wait for leaving the field action to occur, but
     * immediately proceeds to the third step.
     *
     * This option enables applications to perform an action once a selection is
     * made, without requiring the user to exit the field. If clear, the new
     * value is not committed until the user exits the field.
     */
    AcroChoiceFlags[AcroChoiceFlags["CommitOnSelChange"] = flag(27 - 1)] = "CommitOnSelChange";
})(AcroChoiceFlags = exports.AcroChoiceFlags || (exports.AcroChoiceFlags = {}));
//# sourceMappingURL=flags.js.map