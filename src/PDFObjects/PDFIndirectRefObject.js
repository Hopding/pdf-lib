// TODO: Make this an immutable object so it works as object key!
class PDFIndirectRefObject {
  isPDFIndirectRefObject = true;
  objNum = null;
  genNum = null;

  constructor(objNum, genNum) {
    this.objNum = objNum;
    this.genNum = genNum;
  }

  toString = () => `${this.objNum} ${this.genNum} R`;
}

export default (...args) => new PDFIndirectRefObject(...args);
