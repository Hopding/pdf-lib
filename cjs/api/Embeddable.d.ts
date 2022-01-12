/**
 * A PDF entity, like images or fonts, which needs to be embedded into the
 * document before saving.
 */
export default interface Embeddable {
    embed: () => Promise<void>;
}
//# sourceMappingURL=Embeddable.d.ts.map