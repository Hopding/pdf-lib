import {
  arrayToString,
  trimArrayAndRemoveComments,
  typedArrayFor,
} from 'utils';

describe(`trimArrayAndRemoveComments`, () => {
  it(`removes leading PDF comments from its input`, () => {
    const input = typedArrayFor('% I am a comment!\nThis is not a comment.');
    const res = trimArrayAndRemoveComments(input);
    expect(res).toEqual(typedArrayFor('This is not a comment.'));
  });

  it(`returns its input when there are no leading PDF comments`, () => {
    const input = typedArrayFor('This is not a comment.');
    const res = trimArrayAndRemoveComments(input);
    expect(res).toEqual(typedArrayFor('This is not a comment.'));
  });
});
