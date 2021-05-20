import PDFBuilder from 'src/api/PDFBuilder';
import { assertIs } from 'src/utils';

export interface PdfTableOptions {
  // The default text size
  textSize?: number;
  topMargin?: number;
  leftMargin?: number;
  rightMargin?: number;
  bottomMargin?: number;
  // table width
  width?: number;
  // table headers
  data?: (string | null)[][];
}

/**
 * Helper class to create a new table with a [[PDFBuilder]].
 */
export default class PdfTable {
  /**
   * Create an instance of [[PdfTable]].
   *
   * @param doc The document to which the table will belong.
   * @param options Options of the table.
   */
  static async create(
    data: (string | null)[][],
    builder: PDFBuilder,
    options: PdfTableOptions = {},
  ) {
    assertIs(builder, 'builder', [[PDFBuilder, 'PDFBuilder']]);
    const newTable = new PdfTable(data, builder, options);
    await newTable.draw();
    return newTable;
  }
  /** The document to which this builder belongs. */
  readonly builder: PDFBuilder;

  private textSize: number = 10;
  private topMargin: number = 1;
  private leftMargin: number = 1;
  private rightMargin: number = 1;
  private bottomMargin: number = 1;
  private width?: number;
  private data: (string | null)[][] = [];
  private table?: any[] = [];

  /**
   * Creer un PdfTable
   * @function constructor
   * @param data - table of text
   */
  private constructor(
    data: (string | null)[][],
    builder: PDFBuilder,
    options: PdfTableOptions,
  ) {
    this.topMargin = options.topMargin ? options.topMargin : this.topMargin;
    this.leftMargin = options.leftMargin ? options.leftMargin : this.leftMargin;
    this.rightMargin = options.rightMargin
      ? options.rightMargin
      : this.rightMargin;
    this.bottomMargin = options.bottomMargin
      ? options.bottomMargin
      : this.bottomMargin;
    this.textSize = builder.getDefaultSize()
      ? builder.getDefaultSize()
      : this.textSize;
    this.width = builder.getWidth() ? builder.getWidth() : options.width;
    this.data = data ? data : this.data;
    this.builder = builder;
  }

  /**
   * Calculate the parameters of each column
   */
  getColParam(row: (string | null)[]) {
    const cols = [];
    const nbCols = row.length;
    for (const cell of row) {
      const cellWidth = this.width! / nbCols;
      cols.push({
        textWidth: cellWidth - this.leftMargin - this.rightMargin,
        cellWidth,
        text: cell,
        lines: [''],
        textSize: 0,
        lineHeight: 0,
      });
    }
    return cols;
  }

  /**
   * Calculate the parameters of the table
   */
  buildTable() {
    const lineHeight =
      this.builder.getFont().heightAtSize(this.textSize) +
      this.builder.getInterLine();
    this.table = this.data.map((textRow) => {
      const row = {
        cols: this.getColParam(textRow),
        textHeight: 0,
        cellHeight: 0,
      };
      for (const col of row.cols) {
        col.lines = this.builder.breakTextIntoLines(col.text, this.textSize, {
          width: col.textWidth,
        });
        col.textSize = this.textSize;
        col.lineHeight = lineHeight;
        row.textHeight = Math.max(
          row.textHeight,
          col.lines.length * lineHeight,
        );
      }
      row.cellHeight = row.textHeight + this.topMargin + this.bottomMargin;
      return row;
    });
  }

  /**
   * Design the table
   */
  async draw() {
    if (!this.data[0]) {
      return;
    }
    this.buildTable();
    const saveX = this.builder.getPage().getX();
    let y = this.builder.getPage().getY();
    for (const row of this.table!) {
      if (
        this.builder.getPage().getY() - row.cellHeight <
        this.builder.getBottomMargin()
      ) {
        await this.builder.addPage();
      }
      this.builder.getPage().moveDown(row.cellHeight);
      let x = saveX;
      y = y - row.cellHeight;
      for (const col of row.cols) {
        col.x = x;
        col.y = y;
        this.builder.getPage().drawRectangle({
          x,
          y,
          width: col.cellWidth,
          height: row.cellHeight,
          borderWidth: 1,
          opacity: 0.0,
        });
        if (col.text) {
          const textX = x + this.leftMargin;
          const textY = y + row.cellHeight - this.topMargin;
          this.builder.getPage().moveTo(textX, textY);
          for (const line of col.lines) {
            await this.builder.drawTextLine(line, { textSize: col.textSize });
          }
        }
        x = x + col.cellWidth;
      }
    }
    this.builder.getPage().moveTo(saveX, y);
  }
}
