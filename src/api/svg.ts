import {
  parse as parseHtml,
  HTMLElement,
  Attributes,
  Node,
  NodeType,
} from 'node-html-better-parser';
import { Color, colorString } from './colors';
import { Degrees, degreesToRadians, RotationTypes } from './rotations';
import PDFPage from './PDFPage';
import { PDFPageDrawSVGElementOptions } from './PDFPageOptions';
import { LineCapStyle, LineJoinStyle } from './operators';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

type Box = Position & Size

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
  fontSize?: number;
}
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
}

export type SVGElement = HTMLElement & {
  svgAttributes: InheritedAttributes & SVGAttributes
}

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

// TODO: Improve type system to require the correct props for each tagName.
/** methods to draw SVGElements onto a PDFPage */
const runnersToPage = (
  page: PDFPage,
  options: PDFPageDrawSVGElementOptions,
): SVGElementToDrawMap => ({
  async text(element) {
    page.drawText(element.childNodes[0].text, {
      x: element.svgAttributes.x,
      y: element.svgAttributes.y,
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
        x: element.svgAttributes.x1!,
        y: element.svgAttributes.y1!,
      },
      end: {
        x: element.svgAttributes.x2!,
        y: element.svgAttributes.y2!,
      },
      thickness: element.svgAttributes.strokeWidth,
      color: element.svgAttributes.stroke,
      opacity: element.svgAttributes.strokeOpacity,
      lineCap: element.svgAttributes.strokeLineCap,
    });
  },
  async path(element) {
    page.drawSvgPath(element.svgAttributes.d!, {
      x: element.svgAttributes.x,
      y: element.svgAttributes.y,
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
    page.drawImage(await page.doc.embedPng(element.svgAttributes.src!), {
      x: element.svgAttributes.x,
      y: element.svgAttributes.y,
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
      x: element.svgAttributes.x,
      y: element.svgAttributes.y,
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
    return runnersToPage(page, options).ellipse(element)
  },
});

const transform = (
  converter: SVGSizeConverter,
  name: string,
  args: number[],
): SVGSizeConverter => {
  switch (name) {
    case 'scaleX': return transform(converter, 'scale', [args[0], 0])
    case 'scaleY': return transform(converter, 'scale', [0, args[0]])
    case 'scale':
      const [xScale, yScale = xScale] = args
      return {
        point: (x: number, y: number) => {
          const pt = converter.point(x, y);
          return {
            x: pt.x * xScale,
            y: pt.y * yScale
          }
        },
        size: (w: number, h: number) => {
          const size = converter.size(w, h);
          return {
            width: size.width * xScale,
            height: size.height * yScale
          }
        }
      }
    case 'translateX': return transform(converter, 'translate', [args[0], 0])
    case 'translateY': return transform(converter, 'translate', [0, args[0]])
    case 'translate':
      const [dx, dy = dx] = args
      return {
        point: (x: number, y: number) => {
          const pt = converter.point(x, y)
          return {
            x: pt.x + dx,
            y: pt.y + dy
          }
        },
        size: converter.size
      }
    case 'rotate': {
      if(args.length>1) {
        const [a, x, y = x] = args
        let tempResult = transform(converter, 'translate', [-x, -y]);
        tempResult = transform(tempResult, 'rotate', [a]);
        return transform(tempResult, 'translate', [x, y])
      }
      else {
        const [a] = args
        const angle = degreesToRadians(a);
        return {
          point: (x, y) => {
            const pt = converter.point(x, y);
            return {
              x: pt.x*Math.cos(angle) - pt.y * Math.sin(angle),
              y: pt.y*Math.cos(angle) + pt.x * Math.sin(angle)
            }
          },
          size: (w, h) => {
            const size = converter.size(w, h);
            return {
              width: size.width*Math.cos(angle) - size.height * Math.sin(angle),
              height: size.height*Math.cos(angle) + size.width*Math.sin(angle)
            }
          }
        }
      }
    }
    case 'skewX': {
      const angle = degreesToRadians(args[0]);
      return {
        point: (x: number, y: number) => {
          const pt = converter.point(x, y);
          return {
            x: (1 + pt.x) * Math.tan(angle),
            y: pt.y
          }
        },
        size: converter.size
      }
    }
    case 'skewY': {
      const angle = degreesToRadians(args[0]);
      return {
        point: (x: number, y: number) => {
          const pt = converter.point(x, y);
          return {
            x: pt.x,
            y: (1 + pt.y) * Math.tan(angle)
          }
        },
        size: converter.size
      }
    }
    default: {
      console.log('transformation unsupported:', name)
      return converter
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

const parseColor = (color: string): Color | undefined => {
  if (!color || color.length === 0) return undefined;
  if (['none', 'transparent'].includes(color)) return undefined;
  return colorString(color);
}

type ParsedAttributes = {
  inherited: InheritedAttributes
  converter: SVGSizeConverter
  tagName: string
  svgAttributes: SVGAttributes
}

const parseAttributes = (
  element: HTMLElement,
  inherited: InheritedAttributes,
  converter: SVGSizeConverter
): ParsedAttributes => {
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

  const width = parseFloatValue(widthRaw, inherited.width)
  const height = parseFloatValue(heightRaw, inherited.height)
  const x = parseFloatValue(attributes.x, inherited.width)
  const y = parseFloatValue(attributes.y, inherited.height)
  const x1 = parseFloatValue(attributes.x1, inherited.width)
  const x2 = parseFloatValue(attributes.x2, inherited.width)
  const y1 = parseFloatValue(attributes.y1, inherited.height)
  const y2 = parseFloatValue(attributes.y2, inherited.height)
  const cx = parseFloatValue(attributes.cx, inherited.width)
  const cy = parseFloatValue(attributes.cy, inherited.height)
  const rx = parseFloatValue(attributes.rx || attributes.r, inherited.width)
  const ry = parseFloatValue(attributes.ry || attributes.r, inherited.height)

  const newInherited: InheritedAttributes = {
    fontFamily: fontFamilyRaw || inherited.fontFamily,
    fontSize: parseFloatValue(fontSizeRaw) ?? inherited.fontSize,
    fill: fillRaw || inherited.fill,
    fillOpacity: parseFloatValue(fillOpacityRaw) ?? inherited.fillOpacity,
    stroke: strokeRaw || inherited.stroke,
    strokeWidth: parseFloatValue(strokeWidthRaw) ?? inherited.strokeWidth,
    strokeOpacity: parseFloatValue(strokeOpacityRaw) ?? inherited.strokeOpacity,
    strokeLineCap: StrokeLineCapMap[strokeLineCapRaw] || inherited.strokeLineCap,
    strokeLineJoin: StrokeLineJoinMap[strokeLineJoinRaw] || inherited.strokeLineJoin,
    width: width || inherited.width,
    height: height || inherited.height,
  }

  const svgAttributes: SVGAttributes = {
    src: attributes.src
  }

  let newConverter = converter

  let transformList = attributes.transform || '';
  if(element.tagName === 'g' || element.tagName === 'svg') {
    // Handle transformations set as direct attributes
    ['translate', 'translateX', 'translateY', 'skewX', 'skewY', 'rotate', 'scale', 'scaleX', 'scaleY'].forEach(name => {
      if(attributes[name]) transformList = attributes[name] + ' ' + transformList
    })
  } else {
    // skewX, skewY, rotate and scale are handled by the pdf-lib
    (['skewX', 'skewY', 'rotate'] as const).forEach(name => {
      if(attributes[name]) svgAttributes[name] = { angle: parseInt(attributes[name].match(/\d+\.?\d*/)![0], 10), type: RotationTypes.Degrees }
    })
    if(attributes.scale) svgAttributes.scale = parseInt(attributes.scale.match(/\d+\.?\d*/)![0], 10)
  }
  // Convert x/y as if it was a translation
  if(x || y) {
    transformList = `translate(${x || 0} ${y || 0}) ` + transformList
  }
  // Apply the transformations
  if (attributes.transform) {
    const regexTransform = /(\w+)\((.+?)\)/g;
    let parsed = regexTransform.exec(attributes.transform);
    while (parsed !== null) {
      const [, name, rawArgs] = parsed;
      const args = (rawArgs || '')
        .split(/\s*,\s*|\s+/)
        .filter((value) => value.length > 0)
        .map((value) => parseFloat(value));

      newConverter = transform(newConverter, name, args);
      parsed = regexTransform.exec(attributes.transform);
    }
  }

  if(x || y) {
    const { x: newX, y: newY } = newConverter.point(x || 0, y || 0)
    svgAttributes.x = newX
    svgAttributes.y = newY
  }
  if(cx || cy) {
    const { x, y } = newConverter.point(cx || 0, cy || 0)
    svgAttributes.cx = x
    svgAttributes.cy = y
  }
  if(rx || ry) {
    const { x, y } = newConverter.point(rx || 0, ry || 0)
    svgAttributes.rx = x
    svgAttributes.ry = y
  }
  if(x1 || y1) {
    const { x, y } = newConverter.point(x1 || 0, y1 || 0)
    svgAttributes.x1 = x
    svgAttributes.y1 = y
  }
  if(x2 || y2) {
    const { x, y } = newConverter.point(x2 || 0, y2 || 0)
    svgAttributes.x2 = x
    svgAttributes.y2 = y
  }
  if(width || height) {
    const size = converter.size(width || inherited.width, height || inherited.height)
    svgAttributes.width = size.width
    svgAttributes.height = size.height
  }
  // We convert all the points from the path
  if(attributes.d) {
    attributes.d.replace(/\d+\.?\d*(,|\s)+\d+\.?\d*/g, elt => {
      const [xReal,, yReal] = elt.split(/(,|\s)+/).map(d => parseFloatValue(d))
      const { x, y } = converter.point(xReal || 0, yReal || 0)
      return x + ','+ y
    })
  }
  if(attributes.viewBox) {
    const viewBox = parseViewBox(attributes.viewBox)!
    const size = {
      width: width || inherited.width,
      height: height || inherited.height
    }
    const localConverter = getConverterWithAspectRatio(size, viewBox, attributes.preserveAspectRatio)
    newConverter = {
      point: (x: number, y: number) => {
        const { x: localX, y: localY } = localConverter.point(x, y)
        return localConverter.point(localX, localY)
      },
      size: (width: number, height: number) => {
        const { width: localWidth, height: localHeight } = localConverter.size(width, height)
        return localConverter.size(localWidth, localHeight)
      }
    }
  }
  return {
    inherited: newInherited, svgAttributes, converter: newConverter, tagName: element.tagName
  }
};

function getConverter(box: Size, viewBox: Box): SVGSizeConverter {
  const { width, height } = box
  const { x: xMin, y: yMin, width: viewWidth, height: viewHeight } = viewBox
  const converter = {
    point: (xReal: number, yReal: number) => ({
      x: (xReal - xMin) / viewWidth * (width || 0),
      y: (yReal - yMin) / viewHeight * (height || 0)
    }),
    size: (wReal: number, hReal: number) => ({
      width: wReal / viewWidth * (width || 0),
      height: hReal / viewHeight * (height || 0)
    })
  }
  return converter
}

function getConverterWithAspectRatio (size: Size, viewBox: Box, preserveAspectRatio?: string) {
  if(preserveAspectRatio === 'none') return getConverter(size, viewBox)

  const fittingWidth = Math.min(viewBox.height * size.width / size.height, viewBox.width)
  const fittingHeight = Math.min(viewBox.width * size.height / size.width, viewBox.height)
  const dx = viewBox.width - fittingWidth
  const dy = viewBox.height - fittingHeight
  const ratioConverter = getConverter(size, { ...viewBox, width: fittingWidth, height: fittingHeight })
  switch(preserveAspectRatio) {
    case 'xMinYMin': return ratioConverter
    case 'xMidYMin': return transform(ratioConverter, 'translate', [dx / 2, 0])
    case 'xMaxYMin': return transform(ratioConverter, 'translate', [dx, dy / 2])
    case 'xMinYMid': return transform(ratioConverter, 'translate', [0, dy])
    case 'xMaxYMid': return transform(ratioConverter, 'translate', [dx, dy / 2])
    case 'xMinYMax': return transform(ratioConverter, 'translate', [0, dy])
    case 'xMidYMax': return transform(ratioConverter, 'translate', [dx / 2, dy])
    case 'xMaxYMax': return transform(ratioConverter, 'translate', [dx, dy])
    case 'xMidYMid':
    default: return transform(ratioConverter, 'translate', [dx / 2, dy / 2])
  }
}

function parseHTMLNode(node: Node, inherited: InheritedAttributes, converter: SVGSizeConverter): SVGElement[] {
  if(node.nodeType === NodeType.COMMENT_NODE) return []
  else if(node.nodeType === NodeType.TEXT_NODE) return []
  else if(node.tagName === 'g' || node.tagName === 'svg') {
    return parseGroupNode(node as HTMLElement & { tagName: 'svg' | 'g' }, inherited, converter)
  } else {
    const attributes = parseAttributes(node, inherited, converter)
    const svgAttributes = { ...attributes.inherited, ...attributes.svgAttributes }
    Object.assign(node, { svgAttributes })
    return [node as SVGElement]
  }
}

function parseGroupNode(node: HTMLElement & { tagName: 'svg' | 'g' }, inherited: InheritedAttributes, converter: SVGSizeConverter): SVGElement[] {
  const attributes = parseAttributes(node, inherited, converter)
  const result: SVGElement[] = []
  node.childNodes.forEach(node => result.push(...parseHTMLNode(node, attributes.inherited, attributes.converter)))
  return result
}

function parseFloatValue(value?: string, reference = 1) {
  if(!value) return undefined
  const v = parseFloat(value)
  if(isNaN(v)) return undefined
  if(value.endsWith('%')) return v * reference / 100
  return v
}

function parseViewBox(viewBox?: string): Box | undefined {
  if(!viewBox) return
  const [xViewBox = 0, yViewBox = 0, widthViewBox = 1, heightViewBox = 1] = (viewBox || '').split(' ').map(val => parseFloatValue(val))
  return {
    x: xViewBox,
    y: yViewBox,
    width: widthViewBox,
    height: heightViewBox
  }
}

const defaultConverter: SVGSizeConverter = {
  point: (x: number, y: number) => ({ x, y }),
  size: (width: number, height: number) => ({ width, height })
}

const parse = (
  svg: string,
  options: PDFPageDrawSVGElementOptions,
): SVGElement[] => {
  const htmlElement = parseHtml(svg).firstChild as HTMLElement

  // If provided, we use the options to overwrite the x, y, width, height attributes form the svg
  const attrs = htmlElement.attributes
  const viewBox = parseViewBox(attrs.viewBox)
  const position = {
    x: options.x ?? parseFloatValue(attrs.x) ?? 0,
    y: options.y ?? parseFloatValue(attrs.y) ?? 0,
  }
  const size = {
    width: options.width ?? parseFloatValue(attrs.width) ?? (viewBox && viewBox.width) ?? 1,
    height: options.height ?? parseFloatValue(attrs.height) ?? (viewBox && viewBox.height) ?? 1
  }
  htmlElement.setAttribute('width', undefined)
  htmlElement.setAttribute('height', undefined)
  
  const converter = (position.x || position.y) ? transform(defaultConverter, 'translate', [position.x, position.y]) : defaultConverter
  return parseHTMLNode(htmlElement, size, converter)
};

export const drawSvg = async (
  page: PDFPage,
  svg: string,
  options: PDFPageDrawSVGElementOptions,
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
