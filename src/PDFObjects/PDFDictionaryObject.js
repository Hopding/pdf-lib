import { charCode, isString } from '../utils';
import PDFNameObject from './PDFNameObject';
import PDFString from './PDFString';

/*
Represents a PDF Dictionary Object.

From PDF 1.7 Specification, "7.3.7 Dictionary Objects"
(http://www.adobe.com/content/dam/Adobe/en/devnet/acrobat/pdfs/PDF32000_2008.pdf):
  A dictionary object is an associative table containing pairs of objects, known as the dictionary’s entries. The first element of each entry is the key and the second element is the value. The key shall be a name (unlike dictionary keys in PostScript, which may be objects of any type). The value may be any kind of object, including another dictionary. A dictionary entry whose value is null (see 7.3.9, "Null Object") shall be treated the same as if the entry does not exist. (This differs from PostScript, where null behaves like any other object as the value of a dictionary entry.) The number of entries in a dictionary shall be subject to an implementation limit; see Annex C. A dictionary may have zero entries.

  The entries in a dictionary represent an associative table and as such shall be unordered even though an arbitrary order may be imposed upon them when written in a file. That ordering shall be ignored.
  Multiple entries in the same dictionary shall not have the same key.

  A dictionary shall be written as a sequence of key-value pairs enclosed in double angle brackets (<<...>>) (using LESS-THAN SIGNs (3Ch) and GREATER-THAN SIGNs (3Eh)).

  EXAMPLE:
    << /Type /Example
       /Subtype /DictionaryExample
       /Version 0.01
       /IntegerItem 12
       /StringItem (a string)
       /Subdictionary << /Item1 0.4
                         /Item2 true
                         /LastItem (not!)
                         /VeryLastItem (OK)
                      >>
    >>
*/
class PDFDictionaryObject {
  /**
   * `object` should be an object literal whose keys are strings, and
   *          whose values are one of:
   *            PDFDictionaryObject
   *          | PDFArrayObject
   *          | PDFNameObject
   *          | PDFIndirectObject
   *          | PDFStreamObject
   * The string keys should not contain leading slashes. The keys will be
   * converted to valid PDFNameObjects when the `toString()` method is called.
   */
  constructor(object) {
    this.object = object;
  }

  toString = () =>
    Object.keys(this.object).reduce(
      (dict, key) =>
        dict.concat(PDFNameObject(key))
            .concat(' ')
            .concat(
                isString(this.object[key])           ? PDFString(this.object[key])
              : this.object[key].isPDFIndirectObject ? this.object[key].toIndirectRef()
              : this.object[key])
            .concat('\n'),
      '<<\n',
    ) + '>>';
}

export default (...args) => new PDFDictionaryObject(...args);
