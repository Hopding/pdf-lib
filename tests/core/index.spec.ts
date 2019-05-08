import { foo } from 'src/core/index';

describe(`foo`, () => {
  it(`return "BAR!"`, () => {
    expect(foo()).toBe('BAR!');
  });
});
