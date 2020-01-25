import {
    DictMap,
    PDFContext,
    PDFDict,
    PDFName,
    PDFSignature
} from 'src/index';

describe('PDFAcroField', () => {
    let context: PDFContext;
    let dict: DictMap;

    beforeEach(() => {
        context = PDFContext.create();
        dict = new Map([[PDFName.FT, PDFName.Btn]]);
    });

    describe('can return the field lock dictionary', () => {
        it('when it is defined', () => {
            const fieldLockDict = PDFDict.fromMapWithContext(new Map(), context);
            dict.set(PDFName.Lock, fieldLockDict);
            const signatureDict = PDFDict.fromMapWithContext(dict, context);
            const signature = PDFSignature.fromDict(signatureDict);
            expect(signature.Lock()).toEqual(fieldLockDict);
        });

        it('when it is undefined', () => {
            const signatureDict = PDFDict.fromMapWithContext(dict, context);
            const signature = PDFSignature.fromDict(signatureDict);
            expect(signature.Lock()).toBe(undefined);
        });
    });

    describe('can return the seed value', () => {
        it('when it is defined', () => {
            const seedValueDict = PDFDict.fromMapWithContext(new Map(), context);
            dict.set(PDFName.SV, seedValueDict);
            const signatureDict = PDFDict.fromMapWithContext(dict, context);
            const signature = PDFSignature.fromDict(signatureDict);
            expect(signature.SV()).toEqual(seedValueDict);
        });

        it('when it is undefined', () => {
            const signatureDict = PDFDict.fromMapWithContext(dict, context);
            const signature = PDFSignature.fromDict(signatureDict);
            expect(signature.SV()).toBe(undefined);
        });
    });
});