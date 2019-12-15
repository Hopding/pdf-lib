import {
    PDFArray,
    PDFBool,
    PDFDict,
    PDFName,
    PDFNumber,
    PDFStream,
    PDFString
} from 'src/core';

class PDFAcroForm extends PDFDict {
    get Fields(): PDFArray {
        return this.lookup(PDFName.of('Fields'), PDFArray);
    }

    get NeedsAppearances(): PDFBool {
        return this.lookup(PDFName.of('NeedsAppearances'), PDFBool);
    }

    get SigFlags(): PDFNumber {
        return this.lookup(PDFName.of('SigFlags'), PDFNumber);
    }

    get DR(): PDFDict {
        return this.lookup(PDFName.of('DR'), PDFDict);
    }

    get DA(): PDFString {
        return this.lookup(PDFName.of('DA'), PDFString);
    }

    get Q(): PDFNumber {
        return this.lookup(PDFName.of('Q'), PDFNumber);
    }

    get XFA(): PDFArray | PDFStream {
        return this.lookup(PDFName.of('XFA')) as PDFArray | PDFStream;
    }
}

export default PDFAcroForm;
