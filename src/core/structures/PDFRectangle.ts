import { PDFArray, PDFNumber } from 'src/core';

class PDFRectangle {
    static fromArray(array: PDFArray) {
        return new PDFRectangle(array);
    }

    readonly array: PDFArray;

    protected constructor(array: PDFArray) {
        this.array = array;
    }

    getNormalized(): PDFRectangle {
        const normalized = this.array.clone(this.array.context);

        if (normalized.lookup(0, PDFNumber) > normalized.lookup(2, PDFNumber)) {
          normalized.set(0, this.array.lookup(2, PDFNumber));
          normalized.set(2, this.array.lookup(0, PDFNumber));
        }


        if (normalized.lookup(1, PDFNumber) > normalized.lookup(3, PDFNumber)) {
            normalized.set(1, this.array.lookup(3, PDFNumber));
            normalized.set(3, this.array.lookup(1, PDFNumber));
        }
        return PDFRectangle.fromArray(normalized);
    }

    lowerLeftX(): number {
        return this.array.lookup(0, PDFNumber).value();
    }

    lowerLeftY(): number {
        return this.array.lookup(1, PDFNumber).value();
    }

    upperRightX(): number {
        return this.array.lookup(2, PDFNumber).value();
    }

    upperRightY(): number {
        return this.array.lookup(3, PDFNumber).value();
    }
}

export default PDFRectangle;
