import {
  parse as parseHtml,
  HTMLElement,
  Attributes,
} from 'node-html-better-parser';
import { Color, colorString } from './colors';
import { Degrees, degreesToRadians } from './rotations';
import PDFPage from './PDFPage';
import { PDFPageDrawSVGElementOptions } from './PDFPageOptions';
import { LineCapStyle, LineJoinStyle } from './operators';

interface Position {
  x: number;
  y: number;
}

interface Constraints {
  width?: number;
  height?: number;
}

type PDFPageDrawSVGElementOptionsRequireds = PDFPageDrawSVGElementOptions &
  Position;

interface SVGViewBox {
  xMin: number;
  yMin: number;
  width: number;
  height: number;
}

interface SVGSizeConverter {
  x: (real: number) => number;
  y: (real: number) => number;
}

type SVGStyle = Record<string, string>;

interface SVGAttributes {
  width: number;
  height: number;
  x: number;
  y: number;
  fill?: Color;
  fillOpacity?: number;
  stroke?: Color;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeLineCap?: LineCapStyle;
  strokeLineJoin?: LineJoinStyle;
  rotate?: Degrees;
  scale?: number;
  skewX?: Degrees;
  skewY?: Degrees;
  viewBox?: SVGViewBox;
  converter?: SVGSizeConverter;
  cx: number;
  cy: number;
  r: number;
  rx: number;
  ry: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  d: string;
  src: string;
  fontFamily?: string;
  fontSize?: number;
}

export type SVGElement = HTMLElement & {
  svgAttributes: SVGAttributes;
};

interface SVGElementToDrawMap {
  [cmd: string]: (a: SVGElement) => Promise<void>;
}

const StrokeLineCapMap: Record<string, LineCapStyle> = {
  'butt': LineCapStyle.Butt,
  'round': LineCapStyle.Round,
  'square': LineCapStyle.Projecting,
};

const StrokeLineJoinMap: Record<string, LineJoinStyle> = {
  'bevel': LineJoinStyle.Bevel,
  'miter': LineJoinStyle.Miter,
  'round': LineJoinStyle.Round,
};

const runnersToPage = (
  page: PDFPage,
  options: PDFPageDrawSVGElementOptionsRequireds,
): SVGElementToDrawMap => ({
  async text(element) {
    page.drawText(element.childNodes[0].text, {
      x: options.x + element.svgAttributes.x,
      y: options.y - element.svgAttributes.y,
      font:
        options.fonts && element.svgAttributes.fontFamily
          ? options.fonts[element.svgAttributes.fontFamily]
          : undefined,
      size: element.svgAttributes.fontSize,
      color: element.svgAttributes.fill,
      opacity: element.svgAttributes.fillOpacity,
    });
  },
  async line(element) {
    page.drawLine({
      start: {
        x: options.x + element.svgAttributes.x1,
        y: options.y - element.svgAttributes.y1,
      },
      end: {
        x: options.x + element.svgAttributes.x2,
        y: options.y - element.svgAttributes.y2,
      },
      thickness: element.svgAttributes.strokeWidth,
      color: element.svgAttributes.stroke,
      opacity: element.svgAttributes.strokeOpacity,
      lineCap: element.svgAttributes.strokeLineCap,
    });
  },
  async path(element) {
    page.drawSvgPath(element.svgAttributes.d, {
      x: options.x + element.svgAttributes.x,
      y: options.y - element.svgAttributes.y,
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
    page.drawImage(await page.doc.embedPng(element.svgAttributes.src), {
      x: options.x + element.svgAttributes.x,
      y: options.y - element.svgAttributes.y,
      width: element.svgAttributes.width,
      height: element.svgAttributes.height,
      opacity: element.svgAttributes.fillOpacity,
      xSkew: element.svgAttributes.skewX,
      ySkew: element.svgAttributes.skewY,
      rotate: element.svgAttributes.rotate,
    });
  },
  async rect(element) {
    if (!element.svgAttributes.fill && !element.svgAttributes.stroke) return;
    page.drawRectangle({
      x: options.x + element.svgAttributes.x,
      y: options.y - element.svgAttributes.y,
      width: element.svgAttributes.width,
      height: element.svgAttributes.height,
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
      x: options.x + element.svgAttributes.x + element.svgAttributes.cx,
      y: options.y - element.svgAttributes.y - element.svgAttributes.cy,
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
    page.drawCircle({
      x: options.x + element.svgAttributes.x + element.svgAttributes.cx,
      y: options.y - element.svgAttributes.y - element.svgAttributes.cy,
      size: element.svgAttributes.r,
      borderColor: element.svgAttributes.stroke,
      borderWidth: element.svgAttributes.strokeWidth,
      borderOpacity: element.svgAttributes.strokeOpacity,
      borderLineCap: element.svgAttributes.strokeLineCap,
      color: element.svgAttributes.fill,
      opacity: element.svgAttributes.fillOpacity,
    });
  },
});

const transform = (
  { x, y }: Position,
  name: string,
  args: number[],
): Position => {
  let angle;
  let tempResult;
  switch (name) {
    case 'scale':
      x = x * args[0];
      y = y * (args.length > 1 ? args[1] : args[0]);
      break;
    case 'translate':
      x = x + args[0];
      y = y + args[1] || 0;
      break;
    case 'rotate':
      if (args.length === 1) {
        angle = degreesToRadians(args[0]);
        x = Math.cos(angle) * x - Math.sin(angle) * y;
        y = Math.sin(angle) * x + Math.cos(angle) * y;
      } else {
        tempResult = transform({ x, y }, 'translate', [args[1], args[2]]);
        tempResult = transform(tempResult, 'rotate', [args[0]]);
        tempResult = transform(tempResult, 'translate', [
          -args[1],
          -(args[2] || 0),
        ]);
        x = tempResult.x;
        y = tempResult.y;
      }
      break;
    case 'skewX':
      angle = degreesToRadians(args[0]);
      x = x + Math.tan(angle) * y;
      break;
    case 'skewY':
      angle = degreesToRadians(args[0]);
      y = Math.tan(angle) * x + y;
      break;
  }
  return { x, y };
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

const parseColor = (color: string): Color | undefined => {
  if (!color || color.length === 0) return undefined;
  if (['none', 'transparent'].includes(color)) return undefined;
  return colorString(color);
}

const parseAttributes = (
  element: HTMLElement,
  parentElement?: SVGElement,
  constraints?: Constraints,
): SVGAttributes => {
  const attributes = element.attributes;
  const style = parseStyles(attributes.style);

  const widthRaw = styleOrAttribute(attributes, style, 'width', '');
  const heightRaw = styleOrAttribute(attributes, style, 'height', '');
  const fillRaw = parseColor(styleOrAttribute(attributes, style, 'fill'));
  const fillOpacityRaw = styleOrAttribute(attributes, style, 'fill-opacity');
  const strokeRaw = parseColor(styleOrAttribute(attributes, style, 'stroke'));
  const strokeOpacityRaw = styleOrAttribute(
    attributes,
    style,
    'stroke-opacity',
  );
  const strokeLineCapRaw = styleOrAttribute(attributes, style, 'stroke-linecap');
  const strokeLineJoinRaw = styleOrAttribute(attributes, style, 'stroke-linejoin');
  const strokeWidthRaw = styleOrAttribute(attributes, style, 'stroke-width');
  const fontFamilyRaw = styleOrAttribute(attributes, style, 'font-family');
  const fontSizeRaw = styleOrAttribute(attributes, style, 'font-size');

  const box =
    (parentElement && parentElement.svgAttributes) || ({} as SVGAttributes);

  let width: number | undefined;
  if (widthRaw && parseFloat(widthRaw)) {
    width = parseFloat(widthRaw);
    if (widthRaw.includes('%')) {
      width = (box.width || 0) * (width / 100.0);
    }
  } else if (box.width) {
    width = box.width;
  }

  let height: number | undefined;
  if (heightRaw && parseFloat(heightRaw)) {
    height = parseFloat(heightRaw);
    if (heightRaw.includes('%')) {
      height = (box.height || 0) * (height / 100.0);
    }
  } else if (box.height) {
    height = box.height;
  }

  let x = typeof attributes.x !== 'undefined' ? parseFloat(attributes.x) : 0;
  let y = typeof attributes.y !== 'undefined' ? parseFloat(attributes.y) : 0;

  let x1 = typeof attributes.x !== 'undefined' ? parseFloat(attributes.x1) : 0;
  let y1 = typeof attributes.y !== 'undefined' ? parseFloat(attributes.y1) : 0;

  let x2 = typeof attributes.x !== 'undefined' ? parseFloat(attributes.x2) : 0;
  let y2 = typeof attributes.y !== 'undefined' ? parseFloat(attributes.y2) : 0;

  let cx = typeof attributes.cx !== 'undefined' ? parseFloat(attributes.cx) : 0;
  let cy = typeof attributes.cy !== 'undefined' ? parseFloat(attributes.cy) : 0;

  let r = typeof attributes.r !== 'undefined' ? parseFloat(attributes.r) : 0;
  let rx = typeof attributes.rx !== 'undefined' ? parseFloat(attributes.rx) : 0;
  let ry = typeof attributes.ry !== 'undefined' ? parseFloat(attributes.ry) : 0;

  const fill = fillRaw || box.fill;
  const fillOpacity =
    typeof fillOpacityRaw !== 'undefined'
      ? parseFloat(fillOpacityRaw)
      : box.fillOpacity;
  const stroke = strokeRaw || box.stroke;
  const strokeOpacity =
    typeof strokeOpacityRaw !== 'undefined'
      ? parseFloat(strokeOpacityRaw)
      : box.strokeOpacity;
  const strokeLineCap = StrokeLineCapMap[strokeLineCapRaw] || box.strokeLineCap;
  const strokeLineJoin = StrokeLineJoinMap[strokeLineJoinRaw] || box.strokeLineJoin;
  const strokeWidth =
    typeof strokeWidthRaw !== 'undefined'
      ? parseFloat(strokeWidthRaw)
      : box.strokeWidth;
  const fontFamily = fontFamilyRaw || box.fontFamily;
  const fontSize =
    typeof fontSizeRaw !== 'undefined' ? parseFloat(fontSizeRaw) : box.fontSize;

  if (attributes.transform) {
    const regexTransform = /(\w+)\((.+?)\)/g;
    let parsed = regexTransform.exec(attributes.transform);
    while (parsed !== null) {
      const [, name, rawArgs] = parsed;
      const args = (rawArgs || '')
        .split(/\s*,\s*|\s+/)
        .filter((value) => value.length > 0)
        .map((value) => parseFloat(value));

      const result = transform({ x, y }, name, args);
      x = result.x;
      y = result.y;

      parsed = regexTransform.exec(attributes.transform);
    }
  }

  if (box.converter) {
    x = box.converter.x(x);
    y = box.converter.y(y);

    x1 = box.converter.x(x1);
    y1 = box.converter.y(y1);

    x2 = box.converter.x(x2);
    y2 = box.converter.y(y2);

    cx = box.converter.x(cx);
    cy = box.converter.y(cy);

    r = box.converter.x(r);
    rx = box.converter.x(rx);
    ry = box.converter.y(ry);
  }

  if (constraints?.width) {
    const constraintsConverterX = (xReal: number) =>
      (xReal * (width || 0)) / (constraints.width || 1);
    x = constraintsConverterX(x);
    x1 = constraintsConverterX(x1);
    x2 = constraintsConverterX(x2);
    cx = constraintsConverterX(cx);
    r = constraintsConverterX(r);
    rx = constraintsConverterX(rx);
  }
  if (constraints?.height) {
    const constraintsConverterY = (yReal: number) =>
      (yReal * (height || 0)) / (constraints.height || 1);
    y = constraintsConverterY(y);
    y1 = constraintsConverterY(y1);
    y2 = constraintsConverterY(y2);
    cy = constraintsConverterY(cy);
    ry = constraintsConverterY(ry);
  }

  let viewBox;
  let converter;

  if (['g', 'svg'].includes(element.tagName)) {
    viewBox = (attributes.viewBox || '')
      .split(/\s*,\s*|\s+/)
      .filter((value) => value.length > 0)
      .map((value) => parseFloat(value))
      .reduce<SVGViewBox>(
        (pos, value, i) => {
          if (i === 0) pos.xMin = value;
          if (i === 1) pos.yMin = value;
          if (i === 2) pos.width = value;
          if (i === 3) pos.height = value;
          return pos;
        },
        {
          xMin: 0,
          yMin: 0,
          width: width || 0,
          height: height || 0,
        },
      );

    if (!width) {
      width = viewBox.width;
    }
    if (!height) {
      height = viewBox.height;
    }

    const boxXmin = viewBox.xMin;
    const boxYmin = viewBox.yMin;
    const boxWidth = viewBox.width;
    const boxHeight = viewBox.height;

    converter = {
      x: (xReal: number) =>
        x + ((xReal - boxXmin) * (width || 0)) / (boxWidth - boxXmin),
      y: (yReal: number) =>
        y + ((yReal - boxYmin) * (height || 0)) / (boxHeight - boxYmin),
    };
  }

  if (element.tagName === 'text' && fontSize) {
    y += fontSize;
  }

  return {
    width: width || 0,
    height: width || 0,
    x,
    y,
    fill,
    fillOpacity,
    stroke,
    strokeWidth,
    strokeOpacity,
    strokeLineCap,
    strokeLineJoin,
    cx,
    cy,
    r,
    rx,
    ry,
    x1,
    y1,
    x2,
    y2,
    d: attributes.d,
    src: attributes.src,
    fontFamily,
    fontSize,
    viewBox,
    converter,
  };
};

const parseSvgElement = (
  element: string | HTMLElement,
  parentElement?: SVGElement,
  constraints?: Constraints,
): SVGElement => {
  const htmlElement =
    typeof element === 'string'
      ? (parseHtml(element).firstChild as HTMLElement)
      : element;
  return Object.assign({}, htmlElement, {
    svgAttributes: parseAttributes(htmlElement, parentElement, constraints),
  }) as SVGElement;
};

const parse = (
  svg: string | SVGElement,
  constraints?: Constraints,
): SVGElement[] => {
  const ret: SVGElement[] = [];
  const parentElement =
    typeof svg === 'string'
      ? parseSvgElement(svg, undefined, constraints)
      : svg;
  for (const childNode of parentElement.childNodes) {
    if (childNode.nodeType !== 1) continue;
    const element = parseSvgElement(childNode as HTMLElement, parentElement);
    if (['g', 'svg'].includes(element.tagName)) {
      ret.push(...parse(element));
    } else {
      ret.push(element);
    }
  }

  return ret;
};

export const drawSvg = async (
  page: PDFPage,
  svg: string,
  options: PDFPageDrawSVGElementOptionsRequireds,
) => {
  const elements = parse(svg, options);
  const runners = runnersToPage(page, options);
  for (let i = 0; i < elements.length; i++) {
    const c = elements[i];
    if (typeof runners[c.tagName] === 'function') {
      await runners[c.tagName](c);
    }
  }
};
