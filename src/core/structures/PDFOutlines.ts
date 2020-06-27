import PDFDict, { DictMap } from 'src/core/objects/PDFDict';
import PDFName from 'src/core/objects/PDFName';
import PDFNumber from 'src/core/objects/PDFNumber';
import PDFString from 'src/core/objects/PDFString';
import PDFRef from 'src/core/objects/PDFRef';
import PDFContext from 'src/core/PDFContext';
import PDFPage from 'src/api/PDFPage';
import { InvalidTargetIndexError } from 'src/core/errors';

export type OutlineNode = PDFOutlines;

export interface outlineOptions {
  expanded?: boolean;
  page?: PDFPage;
}

class PDFOutlines extends PDFDict {
  static withContext = (
    context: PDFContext,
    options?: outlineOptions,
    title?: string,
    parent?: PDFRef,
  ) => {
    const dict = new Map();
    if (!parent) {
      dict.set(PDFName.Type, PDFName.Outlines);
    } else {
      dict.set(PDFName.Title, title ? PDFString.of(title) : title);
      dict.set(PDFName.Parent, parent);
      dict.set(PDFName.Count, context.obj(0));
    }
    return new PDFOutlines(dict, context, options);
  };

  static fromMapWithContext = (
    map: DictMap,
    context: PDFContext,
    options?: outlineOptions,
  ) => new PDFOutlines(map, context, options);

  readonly children: PDFRef[];
  private readonly options: outlineOptions;

  protected constructor(
    map: DictMap,
    context: PDFContext,
    options: outlineOptions = { expanded: false },
  ) {
    super(map, context);
    this.children = [];
    this.options = options;
  }

  Parent(): PDFOutlines {
    return this.lookupMaybe(PDFName.Parent, PDFDict) as PDFOutlines;
  }

  setParent(parentRef: PDFRef): void {
    this.set(PDFName.Parent, parentRef);
  }

  setTitle(title: string): void {
    this.set(PDFName.Title, PDFString.of(title));
  }

  setExpanded(expanded: boolean): void {
    this.options.expanded = expanded;
  }

  removeChild(targetIndex: number): void {
    this.context.delete(this.children[targetIndex]);
    this.children.splice(targetIndex, 1);
  }

  removeChildren(): void {
    if (this.children.length > 0) {
      for (let idx = this.children.length - 1; idx >= 0; idx--) {
        const childRef = this.children[idx] as PDFRef;
        const child = this.context.lookup(childRef) as PDFOutlines;
        child.removeChildren();
        this.removeChild(idx);
      }
    }
  }

  /**
   * PDFName.Fit is necessary for the link to Dest to work on Apple Preview.
   * Without it, the linking will work on Adobe Acrobat, Chrome, and others,
   * but not on Apple Preview.
   */
  setDest(dest: PDFRef): void {
    this.set(PDFName.Dest, this.context.obj([dest, PDFName.Fit]));
  }

  /**
   * Inserts the given ref of an outline node as a child of this PDFOutlines node at the
   * specified index (zero-based). The `Count` will be recalculated before
   * save.
   *
   * Returns the ref of the parent node.
   */
  insertOutlineItem(
    parentRef: PDFRef,
    outlineRef: PDFRef,
    targetIndex: number,
  ): PDFRef {
    if (targetIndex > this.children.length || targetIndex < 0) {
      throw new InvalidTargetIndexError(targetIndex, this.children.length);
    }
    this.children.splice(targetIndex, 0, outlineRef);
    return parentRef;
  }

  /** Performs a Post-Order traversal of this outlines */
  traverse(visitor: (node: PDFOutlines, ref: PDFRef) => any): void {
    const children = this.children;
    for (let idx = 0, len = children.length; idx < len; idx++) {
      const childRef = children[idx] as PDFRef;
      const child = this.context.lookup(childRef) as PDFOutlines;
      if (child.children.length) child.traverse(visitor);
      visitor(child, childRef);
    }
  }

  /** Performs assignment and calculation before Save.
   * Assigns First, Last, Prev and Next and also updates Count,
   * which is calculated differently than how Pages get calculated
   * (12.3.3 Table 152)
   */
  /**
   * A note of thanks to the developers of https://github.com/foliojs/pdfkit, as
   * this class borrows from:
   *   https://github.com/foliojs/pdfkit/blob/a2abfb4765e6e154fd8e3ffc96ddd6d3fa0cd15d/lib/outline.js
   */
  endOutline(): number {
    /** Count for Outlines is different from Count for Pages.
     * Count for root Outlines is "total number of visible outline items at all levels of the outline."
     * And value cannot be negative. "The entry shall be omitted if there are no open outline items."
     * Count for other Outlines is the total number of its expanded/viewable descendents.
     * So this traverses through all its progenies and
     * adds up all the children/descendents that have expanded view and have children.
     * Ones without a child, their `Count` will be 0.
     * One with children but closed, their `Count` will be "negative and its absolute value is
     * the number of descendants that would be visible if the outline item were opened".
     * (12.3.3 Tables 152-153 and Annex H)
     */
    if (this.children.length > 0) {
      const first = this.children[0];
      const last = this.children[this.children.length - 1];
      this.set(PDFName.First, first);
      this.set(PDFName.Last, last);

      let childrenCount = 0; // Step 1. Initialize `Count` to zero.
      childrenCount = this.children.length; // Step 2. Add to `Count` the number of immediate children.
      for (let idx = 0, len = this.children.length; idx < len; idx++) {
        const childRef = this.children[idx] as PDFRef;
        const child = this.context.lookup(childRef) as PDFOutlines;
        if (idx > 0) {
          child.set(PDFName.Prev, this.children[idx - 1]);
        }
        if (idx < this.children.length - 1) {
          child.set(PDFName.Next, this.children[idx + 1]);
        }
        const childCount = child.endOutline();
        if (childCount > 0) childrenCount += childCount;
      }
      const sign = this.options?.expanded ? 1 : -1;
      this.set(
        PDFName.Count,
        PDFNumber.of((this.children.length + childrenCount) * sign),
      );
      return this.options?.expanded ? this.children.length + childrenCount : 0;
    }
    return 0;
  }
}

export default PDFOutlines;
