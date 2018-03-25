/* xxxxxxxxxx@flow */
import _ from 'lodash';

import { validate, isInstance } from 'utils/validate';

const EMPTY_ARR = [];

export const typedArrayProxy = <T>(obj: any, type: T, config: Object = {}) => {
  _(config.methods).forEach((val, key) => {
    obj[key] = new Proxy(obj[key], {
      apply: (target, thisArg, elements) =>
        val(args => target.apply(thisArg, args), elements),
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
      if (config.get && config.get[property]) {
        return config.get[property](target[property]);
      }
      return target[property];
    },
  });
};
