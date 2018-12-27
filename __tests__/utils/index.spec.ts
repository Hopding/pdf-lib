import {
  arrayToString,
  trimArrayAndRemoveComments,
  typedArrayFor,
  contiguousGroups,
  mapIntoContiguousGroups,
} from 'utils';

describe(`trimArrayAndRemoveComments`, () => {
  it(`removes leading PDF comments from its input`, () => {
    const input = typedArrayFor(
      '% I am a comment!\n%I am a comment too!\nThis is not a comment. \n ',
    );
    const res = trimArrayAndRemoveComments(input);
    expect(res).toEqual(typedArrayFor('This is not a comment. \n '));
  });

  it(`removes leading whitespace and PDF comments from its input`, () => {
    const input = typedArrayFor(
      '   \n  %I am a comment too!\nThis is not a comment. \n ',
    );
    const res = trimArrayAndRemoveComments(input);
    expect(res).toEqual(typedArrayFor('This is not a comment. \n '));
  });

  it(`removes leading whitespace from its input`, () => {
    const input = typedArrayFor('   \n \nThis is not a comment. \n ');
    const res = trimArrayAndRemoveComments(input);
    expect(res).toEqual(typedArrayFor('This is not a comment. \n '));
  });

  it(`returns its input when there are no leading PDF comments or whitespace`, () => {
    const input = typedArrayFor('This is not a comment. \n ');
    const res = trimArrayAndRemoveComments(input);
    expect(res).toEqual(typedArrayFor('This is not a comment. \n '));
  });

  it(`returns its input when the comment's newline is missing`, () => {
    const input = typedArrayFor('% This is not a complete comment');
    const res = trimArrayAndRemoveComments(input);
    expect(res).toEqual(typedArrayFor('% This is not a complete comment'));
  });

  it(`handles "\\n" and "\\r" EOL markers`, () => {
    const input = typedArrayFor('% First\n%Second\r% Third\r\nFoo');
    const res = trimArrayAndRemoveComments(input);
    expect(res).toEqual(typedArrayFor('Foo'));
  });
});

describe(`mapIntoContiguousGroups`, () => {
  it(`maps an array of objects into contiguous sections of numbers`, () => {
    const arr = [
      { x: -3 },
      { x: 3 },
      { x: 1 },
      { x: 2 },
      { x: 3 },
      { x: 7 },
      { x: 9 },
      { x: 20 },
    ];
    const res = mapIntoContiguousGroups(
      arr,
      (obj) => obj.x,
      (obj) => obj.x ** 2,
    );
    expect(res).toEqual([
      [(-3) ** 2],
      [3 ** 2],
      [1 ** 2, 2 ** 2, 3 ** 2],
      [7 ** 2],
      [9 ** 2],
      [20 ** 2],
    ]);
  });
});

describe(`contiguousGroups`, () => {
  it(`groups an array of objects into contiguous sections`, () => {
    const arr = [
      { x: -3 },
      { x: 3 },
      { x: 1 },
      { x: 2 },
      { x: 3 },
      { x: 7 },
      { x: 9 },
      { x: 20 },
    ];
    const res = contiguousGroups(arr, (obj) => obj.x);
    expect(res).toEqual([
      [{ x: -3 }],
      [{ x: 3 }],
      [{ x: 1 }, { x: 2 }, { x: 3 }],
      [{ x: 7 }],
      [{ x: 9 }],
      [{ x: 20 }],
    ]);
  });
});
