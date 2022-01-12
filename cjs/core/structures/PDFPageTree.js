"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var PDFArray_1 = tslib_1.__importDefault(require("../objects/PDFArray"));
var PDFDict_1 = tslib_1.__importDefault(require("../objects/PDFDict"));
var PDFName_1 = tslib_1.__importDefault(require("../objects/PDFName"));
var PDFNumber_1 = tslib_1.__importDefault(require("../objects/PDFNumber"));
var PDFPageLeaf_1 = tslib_1.__importDefault(require("./PDFPageLeaf"));
var errors_1 = require("../errors");
var PDFPageTree = /** @class */ (function (_super) {
    tslib_1.__extends(PDFPageTree, _super);
    function PDFPageTree() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    PDFPageTree.prototype.Parent = function () {
        return this.lookup(PDFName_1.default.of('Parent'));
    };
    PDFPageTree.prototype.Kids = function () {
        return this.lookup(PDFName_1.default.of('Kids'), PDFArray_1.default);
    };
    PDFPageTree.prototype.Count = function () {
        return this.lookup(PDFName_1.default.of('Count'), PDFNumber_1.default);
    };
    PDFPageTree.prototype.pushTreeNode = function (treeRef) {
        var Kids = this.Kids();
        Kids.push(treeRef);
    };
    PDFPageTree.prototype.pushLeafNode = function (leafRef) {
        var Kids = this.Kids();
        this.insertLeafKid(Kids.size(), leafRef);
    };
    /**
     * Inserts the given ref as a leaf node of this page tree at the specified
     * index (zero-based). Also increments the `Count` of each page tree in the
     * hierarchy to accomodate the new page.
     *
     * Returns the ref of the PDFPageTree node into which `leafRef` was inserted,
     * or `undefined` if it was inserted into the root node (the PDFPageTree upon
     * which the method was first called).
     */
    PDFPageTree.prototype.insertLeafNode = function (leafRef, targetIndex) {
        var Kids = this.Kids();
        var Count = this.Count().asNumber();
        if (targetIndex > Count) {
            throw new errors_1.InvalidTargetIndexError(targetIndex, Count);
        }
        var leafsRemainingUntilTarget = targetIndex;
        for (var idx = 0, len = Kids.size(); idx < len; idx++) {
            if (leafsRemainingUntilTarget === 0) {
                // Insert page and return
                this.insertLeafKid(idx, leafRef);
                return undefined;
            }
            var kidRef = Kids.get(idx);
            var kid = this.context.lookup(kidRef);
            if (kid instanceof PDFPageTree) {
                if (kid.Count().asNumber() > leafsRemainingUntilTarget) {
                    // Dig in
                    return (kid.insertLeafNode(leafRef, leafsRemainingUntilTarget) || kidRef);
                }
                else {
                    // Move on
                    leafsRemainingUntilTarget -= kid.Count().asNumber();
                }
            }
            if (kid instanceof PDFPageLeaf_1.default) {
                // Move on
                leafsRemainingUntilTarget -= 1;
            }
        }
        if (leafsRemainingUntilTarget === 0) {
            // Insert page at the end and return
            this.insertLeafKid(Kids.size(), leafRef);
            return undefined;
        }
        // Should never get here if `targetIndex` is valid
        throw new errors_1.CorruptPageTreeError(targetIndex, 'insertLeafNode');
    };
    /**
     * Removes the leaf node at the specified index (zero-based) from this page
     * tree. Also decrements the `Count` of each page tree in the hierarchy to
     * account for the removed page.
     *
     * If `prune` is true, then intermediate tree nodes will be removed from the
     * tree if they contain 0 children after the leaf node is removed.
     */
    PDFPageTree.prototype.removeLeafNode = function (targetIndex, prune) {
        if (prune === void 0) { prune = true; }
        var Kids = this.Kids();
        var Count = this.Count().asNumber();
        if (targetIndex >= Count) {
            throw new errors_1.InvalidTargetIndexError(targetIndex, Count);
        }
        var leafsRemainingUntilTarget = targetIndex;
        for (var idx = 0, len = Kids.size(); idx < len; idx++) {
            var kidRef = Kids.get(idx);
            var kid = this.context.lookup(kidRef);
            if (kid instanceof PDFPageTree) {
                if (kid.Count().asNumber() > leafsRemainingUntilTarget) {
                    // Dig in
                    kid.removeLeafNode(leafsRemainingUntilTarget, prune);
                    if (prune && kid.Kids().size() === 0)
                        Kids.remove(idx);
                    return;
                }
                else {
                    // Move on
                    leafsRemainingUntilTarget -= kid.Count().asNumber();
                }
            }
            if (kid instanceof PDFPageLeaf_1.default) {
                if (leafsRemainingUntilTarget === 0) {
                    // Remove page and return
                    this.removeKid(idx);
                    return;
                }
                else {
                    // Move on
                    leafsRemainingUntilTarget -= 1;
                }
            }
        }
        // Should never get here if `targetIndex` is valid
        throw new errors_1.CorruptPageTreeError(targetIndex, 'removeLeafNode');
    };
    PDFPageTree.prototype.ascend = function (visitor) {
        visitor(this);
        var Parent = this.Parent();
        if (Parent)
            Parent.ascend(visitor);
    };
    /** Performs a Post-Order traversal of this page tree */
    PDFPageTree.prototype.traverse = function (visitor) {
        var Kids = this.Kids();
        for (var idx = 0, len = Kids.size(); idx < len; idx++) {
            var kidRef = Kids.get(idx);
            var kid = this.context.lookup(kidRef);
            if (kid instanceof PDFPageTree)
                kid.traverse(visitor);
            visitor(kid, kidRef);
        }
    };
    PDFPageTree.prototype.insertLeafKid = function (kidIdx, leafRef) {
        var Kids = this.Kids();
        this.ascend(function (node) {
            var newCount = node.Count().asNumber() + 1;
            node.set(PDFName_1.default.of('Count'), PDFNumber_1.default.of(newCount));
        });
        Kids.insert(kidIdx, leafRef);
    };
    PDFPageTree.prototype.removeKid = function (kidIdx) {
        var Kids = this.Kids();
        var kid = Kids.lookup(kidIdx);
        if (kid instanceof PDFPageLeaf_1.default) {
            this.ascend(function (node) {
                var newCount = node.Count().asNumber() - 1;
                node.set(PDFName_1.default.of('Count'), PDFNumber_1.default.of(newCount));
            });
        }
        Kids.remove(kidIdx);
    };
    PDFPageTree.withContext = function (context, parent) {
        var dict = new Map();
        dict.set(PDFName_1.default.of('Type'), PDFName_1.default.of('Pages'));
        dict.set(PDFName_1.default.of('Kids'), context.obj([]));
        dict.set(PDFName_1.default.of('Count'), context.obj(0));
        if (parent)
            dict.set(PDFName_1.default.of('Parent'), parent);
        return new PDFPageTree(dict, context);
    };
    PDFPageTree.fromMapWithContext = function (map, context) {
        return new PDFPageTree(map, context);
    };
    return PDFPageTree;
}(PDFDict_1.default));
exports.default = PDFPageTree;
//# sourceMappingURL=PDFPageTree.js.map