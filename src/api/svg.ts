import {
  parse as parseHtml,
  HTMLElement,
  Attributes,
  Node,
  NodeType,
} from 'node-html-better-parser';
import { Color, colorString } from './colors';
import { Degrees, degreesToRadians, RotationTypes, degrees } from './rotations';
import PDFFont from './PDFFont';
import PDFPage from './PDFPage';
import { PDFPageDrawSVGElementOptions } from './PDFPageOptions';
import { LineCapStyle, LineJoinStyle } from './operators';
import { Rectangle, Point, Segment } from 'src/utils/elements';
import { getIntersections } from 'src/utils/intersections';
import { distanceCoords, isEqual, distance } from 'src/utils/maths';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type Box = Position & Size;

interface SVGSizeConverter {
  point: (x: number, y: number) => Position;
  size: (w: number, h: number) => Size;
}

type SVGStyle = Record<string, string>;

type InheritedAttributes = {
  width: number;
  height: number;
  fill?: Color;
  fillOpacity?: number;
  stroke?: Color;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeLineCap?: LineCapStyle;
  strokeLineJoin?: LineJoinStyle;
  fontFamily?: string;
  fontStyle?: string;
  fontWeight?: string;
  fontSize?: number;
  rotation?: Degrees;
};
type SVGAttributes = {
  rotate?: Degrees;
  scale?: number;
  skewX?: Degrees;
  skewY?: Degrees;
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  cx?: number;
  cy?: number;
  r?: number;
  rx?: number;
  ry?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  d?: string;
  src?: string;
  textAnchor?: string;
  preserveAspectRatio?: string;
};

export type SVGElement = HTMLElement & {
  svgAttributes: InheritedAttributes & SVGAttributes;
};

interface SVGElementToDrawMap {
  [cmd: string]: (a: SVGElement) => Promise<void>;
}
/**
 * take an array of T and turn it into an 2D-array where each sub array has n elements
 * ex: [1,2,3,4] -> [[1,2], [3, 4]]
 * @param arr the array of elements
 * @param n the size of each sub array
 */
const groupBy = <T>(arr: T[], n: number) => {
  if (arr.length <= n) return [arr];
  return arr?.reduce((acc, curr, i) => {
    const index = Math.floor(i / n);
    if (i % n) {
      acc[index].push(curr);
    } else {
      acc.push([curr]);
    }
    return acc;
  }, [] as T[][]);
};

const isCoordinateInsideTheRect = (dot: Point, rect: Rectangle) =>
  isEqual(0, distance(dot, rect.orthoProjection(dot)));

const StrokeLineCapMap: Record<string, LineCapStyle> = {
  butt: LineCapStyle.Butt,
  round: LineCapStyle.Round,
  square: LineCapStyle.Projecting,
};

const StrokeLineJoinMap: Record<string, LineJoinStyle> = {
  bevel: LineJoinStyle.Bevel,
  miter: LineJoinStyle.Miter,
  round: LineJoinStyle.Round,
};

const getInnerSegment = (start: Point, end: Point, rect: Rectangle) => {
  const isStartInside = isCoordinateInsideTheRect(start, rect);
  const isEndInside = isCoordinateInsideTheRect(end, rect);
  let resultLineStart = start;
  let resultLineEnd = end;
  // it means that the segment is already inside the rect
  if (isEndInside && isStartInside) return new Segment(start, end);

  const line = new Segment(start, end);
  const intersection = getIntersections([rect, line]);

  // if there's no intersection it means that the line doesn't intersects the svgRect and isn't visible
  if (intersection.length === 0) return;

  if (!isStartInside) {
    // replace the line start point by the nearest intersection
    const nearestPoint = intersection.sort(
      (p1, p2) => distanceCoords(start, p1) - distanceCoords(start, p2),
    )[0];
    resultLineStart = new Point(nearestPoint);
  }

  if (!isEndInside) {
    // replace the line start point by the nearest intersection
    const nearestPoint = intersection.sort(
      (p1, p2) => distanceCoords(end, p1) - distanceCoords(end, p2),
    )[0];
    resultLineEnd = new Point(nearestPoint);
  }

  return new Segment(resultLineStart, resultLineEnd);
};

// TODO: Improve type system to require the correct props for each tagName.
/** methods to draw SVGElements onto a PDFPage */
const runnersToPage = (
  svgRect: Rectangle,
  page: PDFPage,
  options: PDFPageDrawSVGElementOptions,
): SVGElementToDrawMap => ({
  async text(element) {
    const anchor = element.svgAttributes.textAnchor;
    const text = element.text;
    const fontSize = element.svgAttributes.fontSize || 12;

    /** This will find the best font for the provided style in the list */
    function getBestFont(
      style: InheritedAttributes,
      fonts: { [fontName: string]: PDFFont },
    ) {
      const family = style.fontFamily;
      if (!family) return undefined;
      const isBold =
        style.fontWeight === 'bold' || Number(style.fontWeight) >= 700;
      const isItalic = style.fontStyle === 'italic';
      const getFont = (bold: boolean, italic: boolean, family: string) =>
        fonts[family + (bold ? '_bold' : '') + (italic ? '_italic' : '')];
      return (
        getFont(isBold, isItalic, family) ||
        getFont(isBold, false, family) ||
        getFont(false, isItalic, family) ||
        getFont(false, false, family) ||
        Object.keys(fonts).find((fontFamily) => fontFamily.startsWith(family))
      );
    }

    const font =
      options.fonts && getBestFont(element.svgAttributes, options.fonts);
    const textWidth = (font || page.getFont()[0]).widthOfTextAtSize(
      text,
      fontSize,
    );
    const offset =
      anchor === 'middle' ? textWidth / 2 : anchor === 'end' ? textWidth : 0;
    const point = new Point({
      x: (element.svgAttributes.x || 0) - offset,
      y: element.svgAttributes.y || 0,
    });
    // TODO: compute the right font boundaries to know which characters should be drawed
    // this is an workaround to draw text that are just a little outside the viewbox boundaries
    const start = new Point({
      x: element.svgAttributes.x || 0,
      y: element.svgAttributes.y || 0,
    });
    const paddingRect = new Rectangle(
      new Point({
        x: svgRect.start.x - fontSize,
        y: svgRect.start.y + fontSize,
      }),
      new Point({ x: svgRect.end.x + fontSize, y: svgRect.end.y - fontSize }),
    );
    if (isCoordinateInsideTheRect(start, paddingRect)) {
      page.drawText(text, {
        x: point.x,
        y: point.y,
        font,
        size: fontSize,
        color: element.svgAttributes.fill,
        opacity: element.svgAttributes.fillOpacity,
        rotate: element.svgAttributes.rotate,
      });
    }
  },
  async line(element) {
    const start = new Point({
      x: element.svgAttributes.x1!,
      y: element.svgAttributes.y1!,
    });

    const end = new Point({
      x: element.svgAttributes.x2!,
      y: element.svgAttributes.y2!,
    });
    const line = getInnerSegment(start, end, svgRect);
    if (!line) return;

    page.drawLine({
      start: line.A.toCoords(),
      end: line.B.toCoords(),
      thickness: element.svgAttributes.strokeWidth,
      color: element.svgAttributes.stroke,
      opacity: element.svgAttributes.strokeOpacity,
      lineCap: element.svgAttributes.strokeLineCap,
    });
  },
  async path(element) {
    // the path origin coordinate
    const basePoint = new Point({
      x: element.svgAttributes.x || 0,
      y: element.svgAttributes.y || 0,
    });
    const normalizePoint = (p: Point) =>
      new Point({ x: p.x - basePoint.x, y: p.y - basePoint.y });

    /**
     *
     * @param origin is the origin of the current drawing in the page coordinate system
     * @param command the path instruction
     * @param params the instrction params
     * @returns the point where the next instruction starts and the new instruction text
     */
    const handlePath = (origin: Point, command: string, params: number[]) => {
      switch (command) {
        case 'm':
        case 'M': {
          const isLocalInstruction = command === command.toLocaleLowerCase();
          const nextPoint = new Point({
            x: (isLocalInstruction ? origin.x : basePoint.x) + params[0],
            y: (isLocalInstruction ? origin.y : basePoint.y) + params[1],
          });
          return {
            point: nextPoint,
            command: `${command}${params[0]},${params[1]}`,
          };
        }
        case 'v':
        case 'V':
        case 'h':
        case 'H':
        case 'l':
        case 'L': {
          const isLocalInstruction = ['l', 'v', 'h'].includes(command);
          const getNextPoint = () => {
            switch (command.toLocaleLowerCase()) {
              case 'l':
                return new Point({
                  x: (isLocalInstruction ? origin.x : basePoint.x) + params[0],
                  y: (isLocalInstruction ? origin.y : basePoint.y) + params[1],
                });
              case 'v':
                return new Point({
                  x: origin.x,
                  y: (isLocalInstruction ? origin.y : basePoint.y) + params[0],
                });
              case 'h':
                return new Point({
                  x: (isLocalInstruction ? origin.x : basePoint.x) + params[0],
                  y: origin.y,
                });
              default:
                return new Point({
                  x: 0,
                  y: 0,
                });
            }
          };
          const nextPoint = getNextPoint();
          const normalizedNext = normalizePoint(nextPoint);

          let endPoint = new Point({ x: nextPoint.x, y: nextPoint.y });
          let startPoint = new Point({ x: origin.x, y: origin.y });
          const result = getInnerSegment(startPoint, endPoint, svgRect);
          if (!result) {
            return {
              point: nextPoint,
              command: isLocalInstruction
                ? `M${normalizedNext.x},${normalizedNext.y}`
                : `M${nextPoint.x},${nextPoint.y}`,
            };
          }

          // if the point wasn't moved it means that it's inside the rect
          const isStartInside = result.A.isEqual(startPoint);
          const isEndInside = result.B.isEqual(endPoint);

          // the intersection points are referencing the pdf coordinates, it's necessary to convert these points to the path's origin point
          endPoint = normalizePoint(new Point(result.B.toCoords()));
          startPoint = normalizePoint(new Point(result.A.toCoords()));
          const startInstruction = isStartInside
            ? ''
            : `M${startPoint.x},${startPoint.y}`;
          const endInstruction = isEndInside
            ? ''
            : isLocalInstruction
            ? `M${normalizedNext.x},${normalizedNext.y}`
            : `M${nextPoint.x},${nextPoint.y}`;
          return {
            point: nextPoint,
            command: `${startInstruction} L${endPoint.x},${endPoint.y} ${endInstruction} `,
          };
        }
        case 'a':
        case 'A': {
          const isLocalInstruction = command === 'a';
          const [, , , , , x, y] = params;
          const nextPoint = new Point({
            x: (isLocalInstruction ? origin.x : basePoint.x) + x,
            y: (isLocalInstruction ? origin.y : basePoint.y) + y,
          });
          // TODO: implement the code to fit the Elliptical Arc Curve instructions into the viewbox
          return {
            point: nextPoint,
            command: `${command} ${params.map((p) => `${p}`).join()}`,
          };
        }
        case 'c':
        case 'C': {
          const isLocalInstruction = command === 'c';

          let x = 0;
          let y = 0;

          for (
            let pendingParams = params;
            pendingParams.length > 0;
            pendingParams = pendingParams.slice(6)
          ) {
            const [, , , , pendingX, pendingY] = pendingParams;
            x += pendingX;
            y += pendingY;
          }

          const nextPoint = new Point({
            x: (isLocalInstruction ? origin.x : basePoint.x) + x,
            y: (isLocalInstruction ? origin.y : basePoint.y) + y,
          });
          // TODO: implement the code to fit the Cubic Bézier Curve instructions into the viewbox
          return {
            point: nextPoint,
            command: `${command} ${params.map((p) => `${p}`).join()}`,
          };
        }
        case 's':
        case 'S':
          const isLocalInstruction = command === 's';

          let x = 0;
          let y = 0;

          for (
            let pendingParams = params;
            pendingParams.length > 0;
            pendingParams = pendingParams.slice(4)
          ) {
            const [, , pendingX, pendingY] = pendingParams;
            x += pendingX;
            y += pendingY;
          }

          const nextPoint = new Point({
            x: (isLocalInstruction ? origin.x : basePoint.x) + x,
            y: (isLocalInstruction ? origin.y : basePoint.y) + y,
          });

          return {
            point: nextPoint,
            command: `${command} ${params.map((p) => `${p}`).join()}`,
          };
        case 'q':
        case 'Q': {
          const isLocalInstruction = command === 'q';
          const [, , x, y] = params;
          const nextPoint = new Point({
            x: (isLocalInstruction ? origin.x : basePoint.x) + x,
            y: (isLocalInstruction ? origin.y : basePoint.y) + y,
          });
          // TODO: implement the code to fit the Quadratic Bézier Curve instructions into the viewbox
          return {
            point: nextPoint,
            command: `${command} ${params.map((p) => `${p}`).join()}`,
          };
        }
        // TODO: Handle the remaining svg instructions: t,q
        default:
          return {
            point: origin,
            command: `${command} ${params.map((p) => `${p}`).join()}`,
          };
      }
    };

    const commands = element.svgAttributes.d?.match(
      /(v|h|a|l|t|m|q|c|s|z)([0-9,e\s.-]*)/gi,
    );
    let currentPoint = new Point({ x: basePoint.x, y: basePoint.y });
    const newPath = commands
      ?.map((command) => {
        const letter = command.match(/[a-z]/i)?.[0];
        const params = command
          .match(
            /(-?[0-9]+\.[0-9]+(e[+-]?[0-9]+)?)|(-?\.[0-9]+(e[+-]?[0-9]+)?)|(-?[0-9]+)/gi,
          )
          ?.filter((m) => m !== '')
          .map((v) => parseFloat(v));
        if (letter && params) {
          const result = handlePath(currentPoint, letter, params);
          if (result) {
            currentPoint = result.point;
            return result.command;
          }
        }
        return command;
      })
      .join(' ');
    // See https://jsbin.com/kawifomupa/edit?html,output and
    page.drawSvgPath(newPath!, {
      x: element.svgAttributes.x || 0,
      y: element.svgAttributes.y || 0,
      borderColor: element.svgAttributes.stroke,
      borderWidth: element.svgAttributes.strokeWidth,
      borderOpacity: element.svgAttributes.strokeOpacity,
      borderLineCap: element.svgAttributes.strokeLineCap,
      color: element.svgAttributes.fill,
      opacity: element.svgAttributes.fillOpacity,
      scale: element.svgAttributes.scale,
      rotate: element.svgAttributes.rotate,
    });
  },
  async image(element) {
    const { src } = element.svgAttributes;
    if (!src) return;
    const isPng = src.match(/\.png(\?|$)|^data:image\/png;base64/gim);
    const img = isPng
      ? await page.doc.embedPng(src)
      : await page.doc.embedJpg(src);

    const { x, y, width, height } = getFittingRectangle(
      img.width,
      img.height,
      element.svgAttributes.width || img.width,
      element.svgAttributes.height || img.height,
      element.svgAttributes.preserveAspectRatio,
    );
    page.drawImage(img, {
      x: (element.svgAttributes.x || 0) + x,
      y: (element.svgAttributes.y || 0) - y - height,
      width,
      height,
      opacity: element.svgAttributes.fillOpacity,
      xSkew: element.svgAttributes.skewX,
      ySkew: element.svgAttributes.skewY,
      rotate: element.svgAttributes.rotate,
    });
  },
  async rect(element) {
    if (!element.svgAttributes.fill && !element.svgAttributes.stroke) return;
    page.drawRectangle({
      x: element.svgAttributes.x,
      y: element.svgAttributes.y || 0,
      width: element.svgAttributes.width,
      height: element.svgAttributes.height * -1,
      borderColor: element.svgAttributes.stroke,
      borderWidth: element.svgAttributes.strokeWidth,
      borderOpacity: element.svgAttributes.strokeOpacity,
      borderLineCap: element.svgAttributes.strokeLineCap,
      color: element.svgAttributes.fill,
      opacity: element.svgAttributes.fillOpacity,
      xSkew: element.svgAttributes.skewX,
      ySkew: element.svgAttributes.skewY,
      rotate: element.svgAttributes.rotate,
    });
  },
  async ellipse(element) {
    page.drawEllipse({
      x: element.svgAttributes.cx,
      y: element.svgAttributes.cy,
      xScale: element.svgAttributes.rx,
      yScale: element.svgAttributes.ry,
      borderColor: element.svgAttributes.stroke,
      borderWidth: element.svgAttributes.strokeWidth,
      borderOpacity: element.svgAttributes.strokeOpacity,
      borderLineCap: element.svgAttributes.strokeLineCap,
      color: element.svgAttributes.fill,
      opacity: element.svgAttributes.fillOpacity,
      rotate: element.svgAttributes.rotate,
    });
  },
  async circle(element) {
    return runnersToPage(svgRect, page, options).ellipse(element);
  },
});

const transform = (
  converter: SVGSizeConverter,
  name: string,
  args: number[],
): SVGSizeConverter => {
  switch (name) {
    case 'scaleX':
      return transform(converter, 'scale', [args[0], 0]);
    case 'scaleY':
      return transform(converter, 'scale', [0, args[0]]);
    case 'scale':
      const [xScale, yScale = xScale] = args;
      return {
        point: (x: number, y: number) =>
          converter.point(x * xScale, y * yScale),
        size: (w: number, h: number) => converter.size(w * xScale, h * yScale),
      };
    case 'translateX':
      return transform(converter, 'translate', [args[0], 0]);
    case 'translateY':
      return transform(converter, 'translate', [0, args[0]]);
    case 'translate':
      const [dx, dy = dx] = args;
      return {
        point: (x: number, y: number) => converter.point(x + dx, y + dy),
        size: converter.size,
      };
    case 'rotate': {
      if (args.length > 1) {
        const [a, x, y = x] = args;
        let tempResult = transform(converter, 'translate', [x, y]);
        tempResult = transform(tempResult, 'rotate', [a]);
        return transform(tempResult, 'translate', [-x, -y]);
      } else {
        const [a] = args;
        const angle = degreesToRadians(a);
        return {
          point: (x, y) =>
            converter.point(
              x * Math.cos(angle) - y * Math.sin(angle),
              y * Math.cos(angle) + x * Math.sin(angle),
            ),
          size: converter.size,
        };
      }
    }
    case 'matrix': {
      const [scaleX, skewY, skewX, scaleY, translateX, translateY] = args;
      return {
        point: (x: number, y: number) => {
          return converter.point(
            x * scaleX + y * skewX + translateX, 
            x * skewY + y * scaleY + translateY
          );
        },
        size: (w: number, h: number) => converter.size(w * scaleX, h * scaleY), 
      };
    }
    case 'skewX': {
      const angle = degreesToRadians(args[0]);
      return {
        point: (x: number, y: number) =>
          converter.point((1 + x) * Math.tan(angle), y),
        size: converter.size,
      };
    }
    case 'skewY': {
      const angle = degreesToRadians(args[0]);
      return {
        point: (x: number, y: number) =>
          converter.point(x, (1 + y) * Math.tan(angle)),
        size: converter.size,
      };
    }
    default: {
      console.log('transformation unsupported:', name);
      return converter;
    }
  }
};

const styleOrAttribute = (
  attributes: Attributes,
  style: SVGStyle,
  attribute: string,
  def?: string,
): string => {
  const value = style[attribute] || attributes[attribute];
  if (!value && typeof def !== 'undefined') return def;
  return value;
};

const parseStyles = (style: string): SVGStyle => {
  const cssRegex = /([^:\s]+)*\s*:\s*([^;]+)/g;
  const css: SVGStyle = {};
  let match = cssRegex.exec(style);
  while (match != null) {
    css[match[1]] = match[2];
    match = cssRegex.exec(style);
  }
  return css;
};

const parseColor = (
  color: string,
  inherited?: { rgb: Color; alpha?: string },
): { rgb: Color; alpha?: string } | undefined => {
  if (!color || color.length === 0) return undefined;
  if (['none', 'transparent'].includes(color)) return undefined;
  if (color === 'currentColor') return inherited || parseColor('#000000');
  const parsedColor = colorString(color);
  return {
    rgb: parsedColor.rgb,
    alpha: parsedColor.alpha ? parsedColor.alpha + '' : undefined,
  };
};

type ParsedAttributes = {
  inherited: InheritedAttributes;
  converter: SVGSizeConverter;
  tagName: string;
  svgAttributes: SVGAttributes;
};

const parseAttributes = (
  element: HTMLElement,
  inherited: InheritedAttributes,
  converter: SVGSizeConverter,
): ParsedAttributes => {
  const attributes = element.attributes;
  const style = parseStyles(attributes.style);

  const widthRaw = styleOrAttribute(attributes, style, 'width', '');
  const heightRaw = styleOrAttribute(attributes, style, 'height', '');
  const fillRaw = parseColor(styleOrAttribute(attributes, style, 'fill'));
  const fillOpacityRaw = styleOrAttribute(attributes, style, 'fill-opacity');
  const opacityRaw = styleOrAttribute(attributes, style, 'opacity');
  const strokeRaw = parseColor(styleOrAttribute(attributes, style, 'stroke'));
  const strokeOpacityRaw = styleOrAttribute(
    attributes,
    style,
    'stroke-opacity',
  );
  const strokeLineCapRaw = styleOrAttribute(
    attributes,
    style,
    'stroke-linecap',
  );
  const strokeLineJoinRaw = styleOrAttribute(
    attributes,
    style,
    'stroke-linejoin',
  );
  const strokeWidthRaw = styleOrAttribute(attributes, style, 'stroke-width');
  const fontFamilyRaw = styleOrAttribute(attributes, style, 'font-family');
  const fontStyleRaw = styleOrAttribute(attributes, style, 'font-style');
  const fontWeightRaw = styleOrAttribute(attributes, style, 'font-weight');
  const fontSizeRaw = styleOrAttribute(attributes, style, 'font-size');

  const width = parseFloatValue(widthRaw, inherited.width);
  const height = parseFloatValue(heightRaw, inherited.height);
  const x = parseFloatValue(attributes.x, inherited.width);
  const y = parseFloatValue(attributes.y, inherited.height);
  const x1 = parseFloatValue(attributes.x1, inherited.width);
  const x2 = parseFloatValue(attributes.x2, inherited.width);
  const y1 = parseFloatValue(attributes.y1, inherited.height);
  const y2 = parseFloatValue(attributes.y2, inherited.height);
  const cx = parseFloatValue(attributes.cx, inherited.width);
  const cy = parseFloatValue(attributes.cy, inherited.height);
  const rx = parseFloatValue(attributes.rx || attributes.r, inherited.width);
  const ry = parseFloatValue(attributes.ry || attributes.r, inherited.height);

  const newInherited: InheritedAttributes = {
    fontFamily: fontFamilyRaw || inherited.fontFamily,
    fontStyle: fontStyleRaw || inherited.fontStyle,
    fontWeight: fontWeightRaw || inherited.fontWeight,
    fontSize: parseFloatValue(fontSizeRaw) ?? inherited.fontSize,
    fill: fillRaw?.rgb || inherited.fill,
    fillOpacity:
      parseFloatValue(fillOpacityRaw || opacityRaw || fillRaw?.alpha) ??
      inherited.fillOpacity,
    stroke: strokeRaw?.rgb || inherited.stroke,
    strokeWidth: parseFloatValue(strokeWidthRaw) ?? inherited.strokeWidth,
    strokeOpacity:
      parseFloatValue(strokeOpacityRaw || opacityRaw || strokeRaw?.alpha) ??
      inherited.strokeOpacity,
    strokeLineCap:
      StrokeLineCapMap[strokeLineCapRaw] || inherited.strokeLineCap,
    strokeLineJoin:
      StrokeLineJoinMap[strokeLineJoinRaw] || inherited.strokeLineJoin,
    width: width || inherited.width,
    height: height || inherited.height,
    rotation: inherited.rotation,
  };

  const svgAttributes: SVGAttributes = {
    src: attributes.src || attributes['xlink:href'],
    textAnchor: attributes['text-anchor'],
    preserveAspectRatio: attributes.preserveAspectRatio,
  };

  let newConverter = converter;

  let transformList = attributes.transform || '';
  // Handle transformations set as direct attributes
  [
    'translate',
    'translateX',
    'translateY',
    'skewX',
    'skewY',
    'rotate',
    'scale',
    'scaleX',
    'scaleY',
  ].forEach((name) => {
    if (attributes[name]) {
      transformList = attributes[name] + ' ' + transformList;
    }
  });
  // skewX, skewY, rotate and scale are handled by the pdf-lib
  (['skewX', 'skewY', 'rotate'] as const).forEach((name) => {
    if (attributes[name]) {
      const d = attributes[name].match(/-?(\d+\.?|\.)\d*/)?.[0];
      if (d !== undefined) {
        svgAttributes[name] = {
          angle: parseInt(d, 10),
          type: RotationTypes.Degrees,
        };
      }
    }
  });
  if (attributes.scale) {
    const d = attributes.scale.match(/-?(\d+\.?|\.)\d*/)?.[0];
    if (d !== undefined) svgAttributes.scale = parseInt(d, 10);
  }
  // Convert x/y as if it was a translation
  if (x || y) {
    transformList = transformList + `translate(${x || 0} ${y || 0}) `;
  }
  // Apply the transformations
  if (transformList) {
    const regexTransform = /(\w+)\((.+?)\)/g;
    let parsed = regexTransform.exec(transformList);
    while (parsed !== null) {
      const [, name, rawArgs] = parsed;
      const args = (rawArgs || '')
        .split(/\s*,\s*|\s+/)
        .filter((value) => value.length > 0)
        .map((value) => parseFloat(value));
      if (name === 'rotate') {
        // transformations over x and y axis might change the page cood direction
        const { width: xDirection, height: yDirection } = newConverter.size(
          1,
          1,
        );
        // the page Y coord is inverteds so the angle rotation is inverted too
        const pageYDirection = -1;
        newInherited.rotation = degrees(
          pageYDirection * args[0] * Math.sign(xDirection * yDirection) +
            (inherited.rotation?.angle || 0),
        );
        svgAttributes.rotate = newInherited.rotation;
      }
      newConverter = transform(newConverter, name, args);
      parsed = regexTransform.exec(transformList);
    }
  }

  // x and y were already transformed into a translation. The new reference point is now 0,0
  const { x: newX, y: newY } = newConverter.point(0, 0);
  svgAttributes.x = newX;
  svgAttributes.y = newY;

  if (attributes.cx || attributes.cy) {
    const { x: newCX, y: newCY } = newConverter.point(cx || 0, cy || 0);
    svgAttributes.cx = newCX;
    svgAttributes.cy = newCY;
  }
  if (attributes.rx || attributes.ry || attributes.r) {
    const { width: newRX, height: newRY } = newConverter.size(rx || 0, ry || 0);
    svgAttributes.rx = newRX;
    svgAttributes.ry = newRY;
  }
  if (attributes.x1 || attributes.y1) {
    const { x: newX1, y: newY1 } = newConverter.point(x1 || 0, y1 || 0);
    svgAttributes.x1 = newX1;
    svgAttributes.y1 = newY1;
  }
  if (attributes.x2 || attributes.y2) {
    const { x: newX2, y: newY2 } = newConverter.point(x2 || 0, y2 || 0);
    svgAttributes.x2 = newX2;
    svgAttributes.y2 = newY2;
  }
  if (attributes.width || attributes.height) {
    const size = newConverter.size(
      width || inherited.width,
      height || inherited.height,
    );
    svgAttributes.width = size.width;
    svgAttributes.height = size.height;
  }
  // We convert all the points from the path
  if (attributes.d) {
    const { x: xOrigin, y: yOrigin } = newConverter.point(0, 0);

    svgAttributes.d = attributes.d?.replace(
      /(l|m|s|t|q|c|z|a|v|h)([0-9,e\s.-]*)/gi,
      (command) => {
        const letter = command.match(/[a-z]/i)?.[0];
        if (letter?.toLocaleLowerCase() === 'z') return letter;
        // const params = command.match(/([0-9e.-]+)/ig)?.filter(m => m !== '')//.map(v => parseFloat(v))
        const params = command
          .match(
            /(-?[0-9]+\.[0-9]+(e[+-]?[0-9]+)?)|(-?\.[0-9]+(e[+-]?[0-9]+)?)|(-?[0-9]+)/gi,
          )
          ?.filter((m) => m !== ''); // .map(v => parseFloat(v))

        if (!params) return letter || '';
        switch (letter?.toLocaleLowerCase()) {
          case 'm': 
          case 'l': {
            const groupedParams = groupBy<string>(params, 2);
            return groupedParams
              .map((pair, pairIndex) => {
                const [x, y] = pair;
                const xReal = parseFloatValue(x, inherited.width) || 0;
                const yReal = parseFloatValue(y, innerHeight) || 0;
                if (letter === letter.toLowerCase()) {
                  const { width: dx, height: dy } = newConverter.size(xReal, yReal);
                  return (pairIndex > 0 || letter === 'l' ? 'l' : 'm') + [dx, -dy].join(',');
                } else {
                  const { x: xPixel, y: yPixel } = newConverter.point(xReal, yReal);
                  return (pairIndex > 0 || letter === 'L' ? 'L': 'M') + 
                    [xPixel - xOrigin, yPixel - yOrigin].join(',');
                }
              })
              .join(' ');
          }
          case 'v': {
            return params
              .map((value) => {
                const coord = parseFloatValue(value) || 1;
                return letter === letter.toLowerCase()
                  ? 'v' + newConverter.size(1, coord).height * -1
                  : 'V' + (newConverter.point(1, coord).y - yOrigin);
              })
              .join(' ');
          }
          case 'h': {
            return params
              .map((value) => {
                const coord = parseFloatValue(value) || 1;
                return letter === letter.toLowerCase()
                  ? 'h' + newConverter.size(coord, 1).width
                  : 'H' + (newConverter.point(coord, 1).x - xOrigin);
              })
              .join(' ');
          }
          case 'a': {
            const groupedParams = groupBy<string>(params, 7);
            return groupedParams
              .map((p) => {
                const [
                  rxPixel,
                  ryPixel,
                  xAxisRotation = '0',
                  largeArc = '0',
                  sweepFlag = '0',
                  xPixel,
                  yPixel,
                ] = p;
                const realRx = parseFloatValue(rxPixel, inherited.width) || 0;
                const realRy = parseFloatValue(ryPixel, inherited.height) || 0;
                const realX = parseFloatValue(xPixel, inherited.width) || 0;
                const realY = parseFloatValue(yPixel, inherited.height) || 0;
                const { width: newRx, height: newRy } = newConverter.size(
                  realRx,
                  realRy,
                );
                let newRealX;
                let newRealY;
                if (letter === letter.toLowerCase()) {
                  const {
                    width: newWidth,
                    height: newHeight,
                  } = newConverter.size(realX, realY);
                  newRealX = newWidth;
                  newRealY = -newHeight;
                } else {
                  const { x: pX, y: pY } = newConverter.point(realX, realY);
                  newRealX = pX - xOrigin;
                  newRealY = pY - yOrigin;
                }
                return [
                  letter,
                  newRx,
                  newRy,
                  xAxisRotation,
                  largeArc,
                  sweepFlag === '0' ? '1' : '0',
                  newRealX,
                  newRealY,
                ].join(' ');
              })
              .join(' ');
          }
          default: {
            const groupedParams = groupBy<string>(params, 2);
            const result = groupedParams!
              .map(([xString, yString]) => [
                parseFloatValue(xString, inherited.width) || 0,
                parseFloatValue(yString, inherited.height) || 0,
              ])
              .map(([xReal, yReal]) => {
                if (letter === letter!.toLowerCase()) {
                  const { width: dx, height: dy } = newConverter.size(
                    xReal,
                    yReal,
                  );
                  return [dx, -dy].join(',');
                } else {
                  const { x: xPixel, y: yPixel } = newConverter.point(
                    xReal,
                    yReal,
                  );
                  return [xPixel - xOrigin, yPixel - yOrigin].join(',');
                }
              })
              .join(' ');
            return letter + '' + result;
          }
        }
      },
    );
  }
  if (attributes.viewBox) {
    const viewBox = parseViewBox(attributes.viewBox)!;
    const size = {
      width: width || inherited.width,
      height: height || inherited.height,
    };
    const localConverter = getConverterWithAspectRatio(
      size,
      viewBox,
      attributes.preserveAspectRatio,
    );
    const oldConverter = newConverter;
    newConverter = {
      point: (px: number, py: number) => {
        const { x: localX, y: localY } = localConverter.point(px, py);
        return oldConverter.point(localX, localY);
      },
      size: (w: number, h: number) => {
        const { width: localWidth, height: localHeight } = localConverter.size(
          w,
          h,
        );
        return oldConverter.size(localWidth, localHeight);
      },
    };
  }
  // apply the converter only when there's a local fontSize instruction
  if (fontSizeRaw && newInherited.fontSize) {
    newInherited.fontSize = newConverter.size(1, newInherited.fontSize).height;
  }
  if (newInherited.fontFamily) {
    // Handle complex fontFamily like `"Linux Libertine O", serif`
    const inner = newInherited.fontFamily.match(/^"(.*?)"|^'(.*?)'/);
    if (inner) newInherited.fontFamily = inner[1] || inner[2];
  }

  if (newInherited.strokeWidth) {
    const result = newConverter.size(
      newInherited.strokeWidth,
      newInherited.strokeWidth,
    );
    newInherited.strokeWidth = Math.max(
      Math.min(Math.abs(result.width), Math.abs(result.height)),
      1,
    );
  }

  return {
    inherited: newInherited,
    svgAttributes,
    converter: newConverter,
    tagName: element.tagName,
  };
};

const getConverter = (box: Size, viewBox: Box): SVGSizeConverter => {
  const { width, height } = box;
  const { x: xMin, y: yMin, width: viewWidth, height: viewHeight } = viewBox;
  const converter = {
    point: (xReal: number, yReal: number) => ({
      x: ((xReal - xMin) / viewWidth) * (width || 0),
      y: ((yReal - yMin) / viewHeight) * (height || 0),
    }),
    size: (wReal: number, hReal: number) => ({
      width: (wReal / viewWidth) * (width || 0),
      height: (hReal / viewHeight) * (height || 0),
    }),
  };
  return converter;
};

const getConverterWithAspectRatio = (
  size: Size,
  viewBox: Box,
  preserveAspectRatio?: string,
) => {
  const { x, y, width, height } = getFittingRectangle(
    viewBox.width,
    viewBox.height,
    size.width,
    size.height,
    preserveAspectRatio,
  );
  const ratioConverter = getConverter({ width, height }, viewBox);
  // We translate the drawing in the page when the aspect ratio is different, according to the preserveAspectRatio instructions.
  return {
    point: (xReal: number, yReal: number) => {
      const P = ratioConverter.point(xReal, yReal);
      return { x: P.x + x, y: P.y + y };
    },
    size: ratioConverter.size,
  };
};

const getFittingRectangle = (
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number,
  preserveAspectRatio?: string,
) => {
  if (preserveAspectRatio === 'none') {
    return { x: 0, y: 0, width: targetWidth, height: targetHeight };
  }
  const originalRatio = originalWidth / originalHeight;
  const targetRatio = targetWidth / targetHeight;
  const width =
    targetRatio > originalRatio ? originalRatio * targetHeight : targetWidth;
  const height =
    targetRatio >= originalRatio ? targetHeight : targetWidth / originalRatio;
  const dx = targetWidth - width;
  const dy = targetHeight - height;
  const [x, y] = (() => {
    switch (preserveAspectRatio) {
      case 'xMinYMin':
        return [0, 0];
      case 'xMidYMin':
        return [dx / 2, 0];
      case 'xMaxYMin':
        return [dx, dy / 2];
      case 'xMinYMid':
        return [0, dy];
      case 'xMaxYMid':
        return [dx, dy / 2];
      case 'xMinYMax':
        return [0, dy];
      case 'xMidYMax':
        return [dx / 2, dy];
      case 'xMaxYMax':
        return [dx, dy];
      case 'xMidYMid':
      default:
        return [dx / 2, dy / 2];
    }
  })();
  return { x, y, width, height };
};

const parseHTMLNode = (
  node: Node,
  inherited: InheritedAttributes,
  converter: SVGSizeConverter,
): SVGElement[] => {
  if (node.nodeType === NodeType.COMMENT_NODE) return [];
  else if (node.nodeType === NodeType.TEXT_NODE) return [];
  else if (node.tagName === 'g' || node.tagName === 'svg') {
    return parseGroupNode(
      node as HTMLElement & { tagName: 'svg' | 'g' },
      inherited,
      converter,
    );
  } else {
    const attributes = parseAttributes(node, inherited, converter);
    const svgAttributes = {
      ...attributes.inherited,
      ...attributes.svgAttributes,
    };
    Object.assign(node, { svgAttributes });
    return [node as SVGElement];
  }
};

const parseGroupNode = (
  node: HTMLElement & { tagName: 'svg' | 'g' },
  inherited: InheritedAttributes,
  converter: SVGSizeConverter,
): SVGElement[] => {
  const attributes = parseAttributes(node, inherited, converter);
  const result: SVGElement[] = [];
  node.childNodes.forEach((child) =>
    result.push(
      ...parseHTMLNode(child, attributes.inherited, attributes.converter),
    ),
  );
  return result;
};

const parseFloatValue = (value?: string, reference = 1) => {
  if (!value) return undefined;
  const v = parseFloat(value);
  if (isNaN(v)) return undefined;
  if (value.endsWith('%')) return (v * reference) / 100;
  return v;
};

const parseViewBox = (viewBox?: string): Box | undefined => {
  if (!viewBox) return;
  const [xViewBox = 0, yViewBox = 0, widthViewBox = 1, heightViewBox = 1] = (
    viewBox || ''
  )
    .split(' ')
    .map((val) => parseFloatValue(val));
  return {
    x: xViewBox,
    y: yViewBox,
    width: widthViewBox,
    height: heightViewBox,
  };
};

const parse = (
  svg: string,
  { width, height, x, y, fontSize }: PDFPageDrawSVGElementOptions,
  size: Size,
  converter: SVGSizeConverter,
): SVGElement[] => {
  const htmlElement = parseHtml(svg).firstChild as HTMLElement;
  if (width) htmlElement.setAttribute('width', width + '');
  if (height) htmlElement.setAttribute('height', height + '');
  if (x !== undefined) htmlElement.setAttribute('x', x + '');
  if (y !== undefined) htmlElement.setAttribute('y', size.height - y + '');
  if (fontSize) htmlElement.setAttribute('font-size', fontSize + '');
  return parseHTMLNode(htmlElement, size, converter);
};

export const drawSvg = async (
  page: PDFPage,
  svg: string,
  options: PDFPageDrawSVGElementOptions,
) => {
  if (!svg) return;
  const size = page.getSize();
  const firstChild = parseHtml(svg).firstChild as HTMLElement;
  const x =
    options.x !== undefined ? options.x : parseFloat(firstChild.attributes.x);
  const y =
    options.y !== undefined ? options.y : parseFloat(firstChild.attributes.y);

  const attributes = firstChild.attributes;
  const style = parseStyles(attributes.style);

  const widthRaw = styleOrAttribute(attributes, style, 'width', '');
  const heightRaw = styleOrAttribute(attributes, style, 'height', '');

  const width =
    options.width !== undefined ? options.width : parseFloat(widthRaw);
  const height =
    options.height !== undefined ? options.height : parseFloat(heightRaw);

  // it's important to add the viewBox to allow svg resizing through the options
  if (!attributes.viewBox) {
    firstChild.setAttribute(
      'viewBox',
      `0 0 ${widthRaw || width} ${heightRaw || height}`,
    );
  }

  // The y axis of the page is reverted
  const defaultConverter = {
    point: (xP: number, yP: number) => ({ x: xP, y: size.height - yP }),
    size: (w: number, h: number) => ({ width: w, height: h }),
  };
  const svgRect = new Rectangle(
    new Point({ x, y }),
    new Point({ x: x + width, y: y - height }),
  );
  const runners = runnersToPage(svgRect, page, options);
  const elements = parse(firstChild.outerHTML, options, size, defaultConverter);
  elements.forEach((elt) => runners[elt.tagName]?.(elt));
};
