declare class Cache<T> {
    static readonly populatedBy: <T_1>(populate: () => T_1) => Cache<T_1>;
    private readonly populate;
    private value;
    private constructor();
    getValue(): T | undefined;
    access(): T;
    invalidate(): void;
}
export default Cache;
//# sourceMappingURL=Cache.d.ts.map