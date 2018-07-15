/* tslint:disable:ban-types */
import forEach from 'lodash/forEach';

// Need this for React Native Android.
// Need to import the minified version because it is ES5 not ES6 - which is
// required to us "uglify" for minification.
import 'proxy-polyfill/proxy.min.js'; // Need this for React Native Android

import { isInstance, validate } from 'utils/validate';

const EMPTY_ARR = [] as any[];

export interface ITypedArrayProxyConfig {
  methods?: Function[];
  set?: (k: string | number | symbol, v: any) => void;
  get?: (k: string | number | symbol) => any;
}

// TODO: See if this can be refined/simplified at all...
export const typedArrayProxy = <T extends Function>(
  obj: any,
  type: T,
  config: ITypedArrayProxyConfig = {},
) => {
  forEach(config.methods, (val: Function, key) => {
    obj[key] = new Proxy(obj[key], {
      apply: (target, thisArg, elements) =>
        val((args: any) => target.apply(thisArg, args), elements),
    });
  });

  return new Proxy(obj, {
    set: (target, property, value, receiver) => {
      if (!(property in EMPTY_ARR)) {
        validate(
          value,
          isInstance(type),
          `Typed Array Proxy elements must be of type ${type.name}`,
        );
      }
      if (config.set) config.set(property, value);
      target[property] = value;
      return true;
    },
    get: (target, property, receiver) => {
      if (config.get && config.get(property)) {
        return config.get(property)(target[property]);
      }
      return target[property];
    },
  });
};
