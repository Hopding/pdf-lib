import {
  parse as parseHtml,
  HTMLElement,
  Attributes,
  Node,
  NodeType,
} from 'node-html-better-parser';
import { Color, colorString } from './colors';
import { Degrees, degreesToRadians } from './rotations';
import PDFFont from './PDFFont';
import PDFPage from './PDFPage';
import PDFSvg from './PDFSvg';
import { BlendMode, PDFPageDrawSVGElementOptions } from './PDFPageOptions';
import { LineCapStyle, LineJoinStyle, FillRule } from './operators';
import { TransformationMatrix, identityMatrix } from '../types/matrix';
import { Coordinates, Space } from '../types';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type Box = Position & Size;

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
  fillRule?: FillRule;
  strokeLineJoin?: LineJoinStyle;
  fontFamily?: string;
  fontStyle?: string;
  fontWeight?: string;
  fontSize?: number;
  rotation?: Degrees;
  viewBox: Box;
  blendMode?: BlendMode;
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
  strokeWidth?: number;
  dominantBaseline?:
    | 'auto'
    | 'text-bottom'
    | 'alphabetic'
    | 'ideographic'
    | 'middle'
    | 'central'
    | 'mathematical'
    | 'hanging'
    | 'text-top'
    | 'use-script'
    | 'no-change'
    | 'reset-size'
    | 'text-after-edge'
    | 'text-before-edge';
  points?: string;
};

type TransformAttributes = {
  matrix: TransformationMatrix;
  clipSpaces: Space[];
};

export type SVGElement = HTMLElement & {
  svgAttributes: InheritedAttributes & SVGAttributes & TransformAttributes;
};

interface SVGElementToDrawMap {
  [cmd: string]: (a: SVGElement) => void;
}

export const combineMatrix = (
  [a, b, c, d, e, f]: TransformationMatrix,
  [a2, b2, c2, d2, e2, f2]: TransformationMatrix,
): TransformationMatrix => [
  a * a2 + c * b2,
  b * a2 + d * b2,
  a * c2 + c * d2,
  b * c2 + d * d2,
  a * e2 + c * f2 + e,
  b * e2 + d * f2 + f,
];

const applyTransformation = (
  [a, b, c, d, e, f]: TransformationMatrix,
  { x, y }: Coordinates,
): Coordinates => ({
  x: a * x + c * y + e,
  y: b * x + d * y + f,
});

type TransformationName =
  | 'scale'
  | 'scaleX'
  | 'scaleY'
  | 'translate'
  | 'translateX'
  | 'translateY'
  | 'rotate'
  | 'skewX'
  | 'skewY'
  | 'matrix';
export const transformationToMatrix = (
  name: TransformationName,
  args: number[],
): TransformationMatrix => {
  switch (name) {
    case 'scale':
    case 'scaleX':
    case 'scaleY': {
      // [sx 0 0 sy 0 0]
      const [sx, sy = sx] = args;
      return [
        name === 'scaleY' ? 1 : sx,
        0,
        0,
        name === 'scaleX' ? 1 : sy,
        0,
        0,
      ];
    }
    case 'translate':
    case 'translateX':
    case 'translateY': {
      // [1 0 0 1 tx ty]
      const [tx, ty = tx] = args;
      // -ty is necessary because the pdf's y axis is inverted
      return [
        1,
        0,
        0,
        1,
        name === 'translateY' ? 0 : tx,
        name === 'translateX' ? 0 : -ty,
      ];
    }
    case 'rotate': {
      // [cos(a) sin(a) -sin(a) cos(a) 0 0]
      const [a, x = 0, y = 0] = args;
      const t1 = transformationToMatrix('translate', [x, y]);
      const t2 = transformationToMatrix('translate', [-x, -y]);
      // -args[0] -> the '-' operator is necessary because the pdf rotation system is inverted
      const aRadians = degreesToRadians(-a);
      const r: TransformationMatrix = [
        Math.cos(aRadians),
        Math.sin(aRadians),
        -Math.sin(aRadians),
        Math.cos(aRadians),
        0,
        0,
      ];
      // rotation around a point is the combination of: translate * rotate * (-translate)
      return combineMatrix(combineMatrix(t1, r), t2);
    }
    case 'skewY':
    case 'skewX': {
      // [1 tan(a) 0 1 0 0]
      // [1 0 tan(a) 1 0 0]
      // -args[0] -> the '-' operator is necessary because the pdf rotation system is inverted
      const a = degreesToRadians(-args[0]);
      const skew = Math.tan(a);
      const skewX = name === 'skewX' ? skew : 0;
      const skewY = name === 'skewY' ? skew : 0;
      return [1, skewY, skewX, 1, 0, 0];
    }
    case 'matrix': {
      const [a, b, c, d, e, f] = args;
      const r = transformationToMatrix('scale', [1, -1]);
      const m: TransformationMatrix = [a, b, c, d, e, f];
      return combineMatrix(combineMatrix(r, m), r);
    }
    default:
      return identityMatrix;
  }
};

const combineTransformation = (
  matrix: TransformationMatrix,
  name: TransformationName,
  args: number[],
) => combineMatrix(matrix, transformationToMatrix(name, args));

const StrokeLineCapMap: Record<string, LineCapStyle> = {
  butt: LineCapStyle.Butt,
  round: LineCapStyle.Round,
  square: LineCapStyle.Projecting,
};

const FillRuleMap: Record<string, FillRule> = {
  evenodd: FillRule.EvenOdd,
  nonzero: FillRule.NonZero,
};

const StrokeLineJoinMap: Record<string, LineJoinStyle> = {
  bevel: LineJoinStyle.Bevel,
  miter: LineJoinStyle.Miter,
  round: LineJoinStyle.Round,
};

// TODO: Improve type system to require the correct props for each tagName.
/** methods to draw SVGElements onto a PDFPage */
const runnersToPage = (
  page: PDFPage,
  options: PDFPageDrawSVGElementOptions & { images?: PDFSvg['images'] },
): SVGElementToDrawMap => ({
  text(element) {
    const anchor = element.svgAttributes.textAnchor;
    const dominantBaseline = element.svgAttributes.dominantBaseline;
    const text = element.text.trim().replace(/\s/g, ' ');
    const fontSize = element.svgAttributes.fontSize || 12;

    /** This will find the best font for the provided style in the list */
    const getBestFont = (
      style: InheritedAttributes,
      fonts: { [fontName: string]: PDFFont },
    ) => {
      const family = style.fontFamily;
      if (!family) return undefined;
      const isBold =
        style.fontWeight === 'bold' || Number(style.fontWeight) >= 700;
      const isItalic = style.fontStyle === 'italic';
      const getFont = (bold: boolean, italic: boolean, fontFamily: string) =>
        fonts[fontFamily + (bold ? '_bold' : '') + (italic ? '_italic' : '')];
      const key = Object.keys(fonts).find((fontFamily) =>
        fontFamily.startsWith(family),
      );
      return (
        getFont(isBold, isItalic, family) ||
        getFont(isBold, false, family) ||
        getFont(false, isItalic, family) ||
        getFont(false, false, family) ||
        (key ? fonts[key] : undefined)
      );
    };

    const font =
      options.fonts && getBestFont(element.svgAttributes, options.fonts);
    const textWidth = (font || page.getFont()[0]).widthOfTextAtSize(
      text,
      fontSize,
    );

    const textHeight = (font || page.getFont()[0]).heightAtSize(fontSize);
    const overLineHeight = (font || page.getFont()[0]).heightAtSize(fontSize, {
      descender: false,
    });
    const offsetX =
      anchor === 'middle' ? textWidth / 2 : anchor === 'end' ? textWidth : 0;

    let offsetY = 0;
    switch (dominantBaseline) {
      case 'middle':
      case 'central':
        offsetY = overLineHeight - textHeight / 2;
        break;
      case 'mathematical':
        offsetY = fontSize * 0.6; // Mathematical (approximation)
        break;
      case 'hanging':
        offsetY = overLineHeight; // Hanging baseline is at the top
        break;
      case 'text-before-edge':
        offsetY = fontSize; // Top of the text
        break;
      case 'ideographic':
      case 'text-after-edge':
        offsetY = overLineHeight - textHeight; // After edge (similar to text-bottom)
        break;
      case 'text-top':
      case 'text-bottom':
      case 'auto':
      case 'use-script':
      case 'no-change':
      case 'reset-size':
      case 'alphabetic':
      default:
        offsetY = 0; // Default to alphabetic if not specified
        break;
    }
    page.drawText(text, {
      x: -offsetX,
      y: -offsetY,
      font,
      // TODO: the font size should be correctly scaled too
      size: fontSize,
      color: element.svgAttributes.fill,
      opacity: element.svgAttributes.fillOpacity,
      matrix: element.svgAttributes.matrix,
      clipSpaces: element.svgAttributes.clipSpaces,
      blendMode: element.svgAttributes.blendMode || options.blendMode,
    });
  },
  line(element) {
    page.drawLine({
      start: {
        x: element.svgAttributes.x1 || 0,
        y: -element.svgAttributes.y1! || 0,
      },
      end: {
        x: element.svgAttributes.x2! || 0,
        y: -element.svgAttributes.y2! || 0,
      },
      thickness: element.svgAttributes.strokeWidth,
      color: element.svgAttributes.stroke,
      opacity: element.svgAttributes.strokeOpacity,
      lineCap: element.svgAttributes.strokeLineCap,
      matrix: element.svgAttributes.matrix,
      clipSpaces: element.svgAttributes.clipSpaces,
      blendMode: element.svgAttributes.blendMode || options.blendMode,
    });
  },
  path(element) {
    if (!element.svgAttributes.d) return;
    // See https://jsbin.com/kawifomupa/edit?html,output and
    page.drawSvgPath(element.svgAttributes.d, {
      x: 0,
      y: 0,
      borderColor: element.svgAttributes.stroke,
      borderWidth: element.svgAttributes.strokeWidth,
      borderOpacity: element.svgAttributes.strokeOpacity,
      borderLineCap: element.svgAttributes.strokeLineCap,
      color: element.svgAttributes.fill,
      opacity: element.svgAttributes.fillOpacity,
      fillRule: element.svgAttributes.fillRule,
      // drawSvgPath already handle the page y coord correctly, so we can undo the svg parsing correction
      matrix: combineTransformation(
        element.svgAttributes.matrix,
        'scale',
        [1, -1],
      ),
      clipSpaces: element.svgAttributes.clipSpaces,
      blendMode: element.svgAttributes.blendMode || options.blendMode,
    });
  },
  image(element) {
    const { src } = element.svgAttributes;
    if (!(src && options.images?.[src])) return;
    const img = options.images?.[src]!;

    const { x, y, width, height } = getFittingRectangle(
      img.width,
      img.height,
      element.svgAttributes.width || img.width,
      element.svgAttributes.height || img.height,
      element.svgAttributes.preserveAspectRatio,
    );
    page.drawImage(img, {
      x,
      y: -y - height,
      width,
      height,
      opacity: element.svgAttributes.fillOpacity,
      matrix: element.svgAttributes.matrix,
      clipSpaces: element.svgAttributes.clipSpaces,
      blendMode: element.svgAttributes.blendMode || options.blendMode,
    });
  },
  rect(element) {
    if (!element.svgAttributes.fill && !element.svgAttributes.stroke) return;
    page.drawRectangle({
      x: 0,
      y: 0,
      width: element.svgAttributes.width,
      height: element.svgAttributes.height,
      rx: element.svgAttributes.rx,
      ry: element.svgAttributes.ry,
      borderColor: element.svgAttributes.stroke,
      borderWidth: element.svgAttributes.strokeWidth,
      borderOpacity: element.svgAttributes.strokeOpacity,
      borderLineCap: element.svgAttributes.strokeLineCap,
      color: element.svgAttributes.fill,
      opacity: element.svgAttributes.fillOpacity,
      matrix: combineTransformation(
        element.svgAttributes.matrix,
        'translateY',
        [element.svgAttributes.height],
      ),
      clipSpaces: element.svgAttributes.clipSpaces,
      blendMode: element.svgAttributes.blendMode || options.blendMode,
    });
  },
  ellipse(element) {
    page.drawEllipse({
      x: element.svgAttributes.cx || 0,
      y: -(element.svgAttributes.cy || 0),
      xScale: element.svgAttributes.rx,
      yScale: element.svgAttributes.ry,
      borderColor: element.svgAttributes.stroke,
      borderWidth: element.svgAttributes.strokeWidth,
      borderOpacity: element.svgAttributes.strokeOpacity,
      borderLineCap: element.svgAttributes.strokeLineCap,
      color: element.svgAttributes.fill,
      opacity: element.svgAttributes.fillOpacity,
      matrix: element.svgAttributes.matrix,
      clipSpaces: element.svgAttributes.clipSpaces,
      blendMode: element.svgAttributes.blendMode || options.blendMode,
    });
  },
  circle(element) {
    return runnersToPage(page, options).ellipse(element);
  },
});

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
  while (match !== null) {
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
  tagName: string;
  svgAttributes: SVGAttributes;
  matrix: TransformationMatrix;
};

const parseAttributes = (
  element: HTMLElement,
  inherited: InheritedAttributes,
  matrix: TransformationMatrix,
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
  const fillRuleRaw = styleOrAttribute(attributes, style, 'fill-rule');
  const strokeWidthRaw = styleOrAttribute(attributes, style, 'stroke-width');
  const fontFamilyRaw = styleOrAttribute(attributes, style, 'font-family');
  const fontStyleRaw = styleOrAttribute(attributes, style, 'font-style');
  const fontWeightRaw = styleOrAttribute(attributes, style, 'font-weight');
  const fontSizeRaw = styleOrAttribute(attributes, style, 'font-size');
  const blendModeRaw = styleOrAttribute(attributes, style, 'mix-blend-mode');

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
    fillRule: FillRuleMap[fillRuleRaw] || inherited.fillRule,
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
    viewBox:
      element.tagName === 'svg' && element.attributes.viewBox
        ? parseViewBox(element.attributes.viewBox)!
        : inherited.viewBox,
    blendMode: parseBlendMode(blendModeRaw) || inherited.blendMode,
  };

  const svgAttributes: SVGAttributes = {
    src: attributes.src || attributes.href || attributes['xlink:href'],
    textAnchor: attributes['text-anchor'],
    dominantBaseline: attributes[
      'dominant-baseline'
    ] as SVGAttributes['dominantBaseline'],
    preserveAspectRatio: attributes.preserveAspectRatio,
  };

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
    'matrix',
  ].forEach((name) => {
    if (attributes[name]) {
      transformList = attributes[name] + ' ' + transformList;
    }
  });

  // Convert x/y as if it was a translation
  if (x || y) {
    transformList = transformList + `translate(${x || 0} ${y || 0}) `;
  }
  let newMatrix = matrix;
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
      newMatrix = combineTransformation(
        newMatrix,
        name as TransformationName,
        args,
      );
      parsed = regexTransform.exec(transformList);
    }
  }

  svgAttributes.x = x;
  svgAttributes.y = y;

  if (attributes.cx || attributes.cy) {
    svgAttributes.cx = cx;
    svgAttributes.cy = cy;
  }
  if (attributes.rx || attributes.ry || attributes.r) {
    svgAttributes.rx = rx;
    svgAttributes.ry = ry;
  }
  if (attributes.x1 || attributes.y1) {
    svgAttributes.x1 = x1;
    svgAttributes.y1 = y1;
  }
  if (attributes.x2 || attributes.y2) {
    svgAttributes.x2 = x2;
    svgAttributes.y2 = y2;
  }
  if (attributes.width || attributes.height) {
    svgAttributes.width = width ?? inherited.width;
    svgAttributes.height = height ?? inherited.height;
  }

  if (attributes.d) {
    newMatrix = combineTransformation(newMatrix, 'scale', [1, -1]);
    svgAttributes.d = attributes.d;
  }

  if (newInherited.fontFamily) {
    // Handle complex fontFamily like `"Linux Libertine O", serif`
    const inner = newInherited.fontFamily.match(/^"(.*?)"|^'(.*?)'/);
    if (inner) newInherited.fontFamily = inner[1] || inner[2];
  }

  if (newInherited.strokeWidth) {
    svgAttributes.strokeWidth = newInherited.strokeWidth;
  }

  return {
    inherited: newInherited,
    svgAttributes,
    tagName: element.tagName,
    matrix: newMatrix,
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

// this function should reproduce the behavior described here: https://www.w3.org/TR/SVG11/coords.html#ViewBoxAttribute
const getAspectRatioTransformation = (
  matrix: TransformationMatrix,
  originalWidth: number,
  originalHeight: number,
  targetWidth: number,
  targetHeight: number,
  preserveAspectRatioProp = 'xMidYMid',
): {
  clipBox: TransformationMatrix;
  content: TransformationMatrix;
} => {
  const [preserveAspectRatio, meetOrSlice = 'meet'] =
    preserveAspectRatioProp.split(' ');
  const scaleX = targetWidth / originalWidth;
  const scaleY = targetHeight / originalHeight;
  const boxScale = combineTransformation(matrix, 'scale', [scaleX, scaleY]);
  if (preserveAspectRatio === 'none') {
    return {
      clipBox: boxScale,
      content: boxScale,
    };
  }

  const scale =
    meetOrSlice === 'slice'
      ? Math.max(scaleX, scaleY)
      : // since 'meet' is the default value, any value other than 'slice' should be handled as 'meet'
        Math.min(scaleX, scaleY);
  const dx = targetWidth - originalWidth * scale;
  const dy = targetHeight - originalHeight * scale;
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

  const contentTransform = combineTransformation(
    combineTransformation(matrix, 'translate', [x, y]),
    'scale',
    [scale],
  );

  return {
    clipBox: boxScale,
    content: contentTransform,
  };
};

const parseHTMLNode = (
  node: Node,
  inherited: InheritedAttributes,
  matrix: TransformationMatrix,
  clipSpaces: Space[],
): SVGElement[] => {
  if (node.nodeType === NodeType.COMMENT_NODE) return [];
  else if (node.nodeType === NodeType.TEXT_NODE) return [];
  else if (node.tagName === 'g') {
    return parseGroupNode(
      node as HTMLElement & { tagName: 'g' },
      inherited,
      matrix,
      clipSpaces,
    );
  } else if (node.tagName === 'svg') {
    return parseSvgNode(
      node as HTMLElement & { tagName: 'svg' },
      inherited,
      matrix,
      clipSpaces,
    );
  } else {
    if (node.tagName === 'polygon') {
      node.tagName = 'path';
      node.attributes.d = `M${node.attributes.points}Z`;
      delete node.attributes.points;
    }
    const attributes = parseAttributes(node, inherited, matrix);
    const svgAttributes = {
      ...attributes.inherited,
      ...attributes.svgAttributes,
      matrix: attributes.matrix,
      clipSpaces,
    };
    Object.assign(node, { svgAttributes });
    return [node as SVGElement];
  }
};

const parseSvgNode = (
  node: HTMLElement & { tagName: 'svg' },
  inherited: InheritedAttributes,
  matrix: TransformationMatrix,
  clipSpaces: Space[],
): SVGElement[] => {
  // if the width/height aren't set, the svg will have the same dimension as the current drawing space
  /* tslint:disable:no-unused-expression */
  node.attributes.width ??
    node.setAttribute('width', inherited.viewBox.width + '');
  node.attributes.height ??
    node.setAttribute('height', inherited.viewBox.height + '');
  /* tslint:enable:no-unused-expression */
  const attributes = parseAttributes(node, inherited, matrix);
  const result: SVGElement[] = [];
  const viewBox = node.attributes.viewBox
    ? parseViewBox(node.attributes.viewBox)!
    : node.attributes.width && node.attributes.height
      ? parseViewBox(`0 0 ${node.attributes.width} ${node.attributes.height}`)!
      : inherited.viewBox;
  const x = parseFloat(node.attributes.x) || 0;
  const y = parseFloat(node.attributes.y) || 0;

  let newMatrix = combineTransformation(matrix, 'translate', [x, y]);

  const { clipBox: clipBoxTransform, content: contentTransform } =
    getAspectRatioTransformation(
      newMatrix,
      viewBox.width,
      viewBox.height,
      parseFloat(node.attributes.width),
      parseFloat(node.attributes.height),
      node.attributes.preserveAspectRatio,
    );

  const topLeft = applyTransformation(clipBoxTransform, {
    x: 0,
    y: 0,
  });

  const topRight = applyTransformation(clipBoxTransform, {
    x: viewBox.width,
    y: 0,
  });

  const bottomRight = applyTransformation(clipBoxTransform, {
    x: viewBox.width,
    y: -viewBox.height,
  });

  const bottomLeft = applyTransformation(clipBoxTransform, {
    x: 0,
    y: -viewBox.height,
  });

  const baseClipSpace: Space = {
    topLeft,
    topRight,
    bottomRight,
    bottomLeft,
  };

  newMatrix = combineTransformation(contentTransform, 'translate', [
    -viewBox.x,
    -viewBox.y,
  ]);

  node.childNodes.forEach((child) => {
    const parsedNodes = parseHTMLNode(
      child,
      { ...attributes.inherited, viewBox },
      newMatrix,
      [...clipSpaces, baseClipSpace],
    );
    result.push(...parsedNodes);
  });
  return result;
};

const parseGroupNode = (
  node: HTMLElement & { tagName: 'g' },
  inherited: InheritedAttributes,
  matrix: TransformationMatrix,
  clipSpaces: Space[],
): SVGElement[] => {
  const attributes = parseAttributes(node, inherited, matrix);
  const result: SVGElement[] = [];
  node.childNodes.forEach((child) => {
    result.push(
      ...parseHTMLNode(
        child,
        attributes.inherited,
        attributes.matrix,
        clipSpaces,
      ),
    );
  });
  return result;
};

const parseFloatValue = (value?: string, reference = 1) => {
  if (!value) return undefined;
  const v = parseFloat(value);
  if (isNaN(v)) return undefined;
  if (value.endsWith('%')) return (v * reference) / 100;
  return v;
};

const parseBlendMode = (blendMode?: string): BlendMode | undefined => {
  switch (blendMode) {
    case 'normal':
      return BlendMode.Normal;
    case 'multiply':
      return BlendMode.Multiply;
    case 'screen':
      return BlendMode.Screen;
    case 'overlay':
      return BlendMode.Overlay;
    case 'darken':
      return BlendMode.Darken;
    case 'lighten':
      return BlendMode.Lighten;
    case 'color-dodge':
      return BlendMode.ColorDodge;
    case 'color-burn':
      return BlendMode.ColorBurn;
    case 'hard-light':
      return BlendMode.HardLight;
    case 'soft-light':
      return BlendMode.SoftLight;
    case 'difference':
      return BlendMode.Difference;
    case 'exclusion':
      return BlendMode.Exclusion;
    default:
      return undefined;
  }
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
  { width, height, fontSize }: PDFPageDrawSVGElementOptions,
  size: Size,
  matrix: TransformationMatrix,
): SVGElement[] => {
  const htmlElement = parseHtml(svg).firstChild as HTMLElement;
  if (width) htmlElement.setAttribute('width', width + '');
  if (height) htmlElement.setAttribute('height', height + '');
  if (fontSize) htmlElement.setAttribute('font-size', fontSize + '');
  // TODO: what should be the default viewBox?
  return parseHTMLNode(
    htmlElement,
    {
      ...size,
      viewBox: parseViewBox(htmlElement.attributes.viewBox || '0 0 1 1')!,
    },
    matrix,
    [],
  );
};

export const drawSvg = (
  page: PDFPage,
  svg: PDFSvg | string,
  options: PDFPageDrawSVGElementOptions,
) => {
  const pdfSvg = typeof svg === 'string' ? new PDFSvg(svg) : svg;
  if (!pdfSvg.svg) return;
  const size = page.getSize();
  const svgNode = parseHtml(pdfSvg.svg).querySelector('svg');
  if (!svgNode) {
    return console.error('This is not an svg. Ignoring: ' + pdfSvg.svg);
  }

  const attributes = svgNode.attributes;
  const style = parseStyles(attributes.style);

  const widthRaw = styleOrAttribute(attributes, style, 'width', '');
  const heightRaw = styleOrAttribute(attributes, style, 'height', '');

  const width =
    options.width !== undefined ? options.width : parseFloat(widthRaw);
  const height =
    options.height !== undefined ? options.height : parseFloat(heightRaw);

  // it's important to add the viewBox to allow svg resizing through the options
  if (!attributes.viewBox) {
    svgNode.setAttribute(
      'viewBox',
      `0 0 ${widthRaw || width} ${heightRaw || height}`,
    );
  }

  if (options.width || options.height) {
    if (width !== undefined) style.width = width + (isNaN(width) ? '' : 'px');
    if (height !== undefined) {
      style.height = height + (isNaN(height) ? '' : 'px');
    }
    svgNode.setAttribute(
      'style',
      Object.entries(style) // tslint:disable-line
        .map(([key, val]) => `${key}:${val};`)
        .join(''),
    );
  }

  const baseTransformation: TransformationMatrix = [
    1,
    0,
    0,
    1,
    options.x || 0,
    options.y || 0,
  ];

  const elements = parse(svgNode.outerHTML, options, size, baseTransformation);

  const runners = runnersToPage(page, { ...options, images: pdfSvg.images });
  elements.forEach((elt) => {
    // uncomment these lines to draw the clipSpaces
    // elt.svgAttributes.clipSpaces.forEach(space => {
    //   page.drawLine({
    //     start: space.topLeft,
    //     end: space.topRight,
    //     color: parseColor('#000000')?.rgb,
    //     thickness: 1
    //   })

    //   page.drawLine({
    //     start: space.topRight,
    //     end: space.bottomRight,
    //     color: parseColor('#000000')?.rgb,
    //     thickness: 1
    //   })

    //   page.drawLine({
    //     start: space.bottomRight,
    //     end: space.bottomLeft,
    //     color: parseColor('#000000')?.rgb,
    //     thickness: 1
    //   })

    //   page.drawLine({
    //     start: space.bottomLeft,
    //     end: space.topLeft,
    //     color: parseColor('#000000')?.rgb,
    //     thickness: 1
    //   })
    // })
    runners[elt.tagName]?.(elt);
  });
};
