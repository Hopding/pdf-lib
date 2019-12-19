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
    PDFName.of('Btn'),
    PDFName.of('Ch'),
    PDFName.of('Tx'),
    PDFName.of('Sig')
];

export type PDFAcroFormFieldValue = PDFArray | PDFName | PDFNumber | PDFString | PDFDict;


class PDFAcroFormField extends PDFDict {
    static fromMapWithContext(
        dict: DictMap,
        context: PDFContext,
    ): PDFAcroFormField {
        const ft = PDFName.of('ft');
        const hasValidFieldType = dict.has(ft) && acroFormFieldTypes.includes(dict.get(ft));
        if (!hasValidFieldType) {
            throw new Error('Invalid PDFAcroFormField Type');
        }
        return new PDFAcroFormField(dict, context);
    }

    FT(): PDFName {
        return this.lookup(PDFName.of('FT'), PDFName);
    }

    Parent(): PDFDict {
        return this.lookup(PDFName.of('Parent'), PDFDict);
    }

    Kids(): PDFArray | undefined {
        return this.lookupMaybe(PDFName.of('Kids'), PDFArray);
    }

    T(): PDFString | undefined {
        return this.lookupMaybe(PDFName.of('T'), PDFString);
    }

    TM(): PDFString | undefined {
        return this.lookupMaybe(PDFName.of('M'), PDFString);
    }

    Ff(): PDFNumber | undefined {
        return this.lookupMaybe(PDFName.of('Ff'), PDFNumber);
    }

    V(): PDFAcroFormFieldValue | undefined {
        return this.lookupMaybe(PDFName.of('V'),  PDFArray || PDFName || PDFNumber || PDFString || PDFDict);
    }

    DV(): PDFAcroFormFieldValue | undefined {
        return this.lookupMaybe(PDFName.of('DV'),  PDFArray || PDFName || PDFNumber || PDFString || PDFDict);
    }

    AA(): PDFDict | undefined {
        return this.lookupMaybe(PDFName.of('AA'), PDFDict);
    }
}

export default PDFAcroFormField;
