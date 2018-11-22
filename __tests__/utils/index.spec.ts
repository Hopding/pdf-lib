import {
  arrayToString,
  trimArrayAndRemoveComments,
  typedArrayFor,
} from 'utils';

describe(`trimArrayAndRemoveComments`, () => {
  it(`removes leading PDF comments from its input`, () => {
    const input = typedArrayFor('% I am a comment!\n%I am a comment too!\nThis is not a comment. \n ');
    const res = trimArrayAndRemoveComments(input);
    expect(res).toEqual(typedArrayFor('This is not a comment. \n '));
  });

  it(`removes leading whitespace and PDF comments from its input`, () => {
    const input = typedArrayFor('   \n  %I am a comment too!\nThis is not a comment. \n ');
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
});
