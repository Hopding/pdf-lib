/**
 * A PDF entity, like images or fonts, which needs to be embedded into the document before save.
 */
export default interface Embeddable {
  embed: () => Promise<void>;
}
