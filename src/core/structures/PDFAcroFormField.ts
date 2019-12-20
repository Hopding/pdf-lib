import {
    PDFArray,
    PDFContext,
    PDFDict,
    PDFName,
    PDFNumber,
    PDFObject,
    PDFString,
} from 'src/core';
import { DictMap } from 'src/core/objects/PDFDict';

const acroFormFieldTypes: Array<PDFObject|undefined> = [
    PDFName.Btn,
    PDFName.Ch,
    PDFName.Tx,
    PDFName.Sig,
];


class PDFAcroFormField extends PDFDict {
    static fromMapWithContext(
        dict: DictMap,
        context: PDFContext,
    ): PDFAcroFormField {
        const ft = PDFName.of('FT');
        const hasValidFieldType = dict.has(ft) && acroFormFieldTypes.includes(dict.get(ft));
        if (!hasValidFieldType) {
            throw new Error('Invalid PDFAcroFormField Type');
        }
        return new PDFAcroFormField(dict, context);
    }

    FT(): PDFName {
        return this.lookup(PDFName.of('FT'), PDFName);
    }

    Parent(): PDFDict | undefined {
        return this.lookupMaybe(PDFName.of('Parent'), PDFDict);
    }

    Kids(): PDFArray | undefined {
        return this.lookupMaybe(PDFName.of('Kids'), PDFArray);
    }

    T(): PDFString | undefined {
        return this.lookupMaybe(PDFName.of('T'), PDFString);
    }

    TU(): PDFString | undefined {
        return this.lookupMaybe(PDFName.of('TU'), PDFString);
    }

    TM(): PDFString | undefined {
        return this.lookupMaybe(PDFName.of('TM'), PDFString);
    }

    Ff(): PDFNumber | undefined {
        return this.lookupMaybe(PDFName.of('Ff'), PDFNumber);
    }

    V(): PDFObject | undefined {
        return this.lookup(PDFName.of('V'));
    }

    DV(): PDFObject | undefined {
        return this.lookup(PDFName.of('DV'));
    }

    AA(): PDFDict | undefined {
        return this.lookupMaybe(PDFName.of('AA'), PDFDict);
    }
}

export default PDFAcroFormField;
