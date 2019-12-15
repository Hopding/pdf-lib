import Stream from 'src/core/streams/Stream';

describe(`Stream`, () => {
    it('can get the stream length', () => {
        const bytes = Uint8Array.from([1, 1, 2]);
        const stream = new Stream(bytes, 0, bytes.length);
        expect(stream.length).toEqual(3);
    });

    it('can detect when the stream is empty', () => {
        const stream = new Stream(Uint8Array.from([]), 0, 0);
        expect(stream.isEmpty).toEqual(true);
    });

    describe('can get the bytes from a stream', () => {
        const bytes = Uint8Array.from([1, 1, 2]);

        it('when the current position is at or after the end', () => {
            const stream = new Stream(bytes, 5);
            expect(stream.getByte()).toEqual(-1);
        });

        it('when the current position is before the end', () => {
            const stream = new Stream(bytes, 0);
            for (let pos = 0; pos < bytes.length; pos++) {
                expect(stream.getByte()).toEqual(bytes[pos]);
            }
        });
    });

    it('can get unsigned sixteen bit integers', () => {
        const stream = new Stream(Uint8Array.from([1, 1, 2, 2]));
        expect(stream.getUint16()).toEqual(257);
        expect(stream.getUint16()).toEqual(514);
    });

    it('can get thirty-two bit integers', () => {
        const bytes = Uint8Array.from([1, 1, 1, 1, 2, 2, 2, 2, 255, 255, 255, 255]);
        const stream = new Stream(bytes);
        expect(stream.getInt32()).toEqual(16843009);
        expect(stream.getInt32()).toEqual(33686018);
        expect(stream.getInt32()).toEqual(-1);
    });

    describe('can get the next n bytes', () => {
        let stream:Stream;

        beforeEach(() => {
            stream = new Stream(Uint8Array.from([1, 2, 258]));
        });

        describe('when zero length is specified', () => {
            it('and the values are not clamped', () => {
                const bytes = stream.getBytes(0, false);
                expect(bytes.length).toEqual(stream.length);
                expect(bytes[0]).toEqual(1);
                expect(bytes[1]).toEqual(2);
                expect(bytes[2]).toEqual(2);
            });

            it('and the values are clamped', () => {
                const bytes = stream.getBytes(0, true);
                expect(bytes.length).toEqual(stream.length);
                expect(bytes[0]).toEqual(1);
                expect(bytes[1]).toEqual(2);
                expect(bytes[2]).toEqual(2);
            });
        });

        it('when a non-zero length is specified', () => {
            const bytes = stream.getBytes(2, false);
            expect(bytes.length).toEqual(2);
            expect(bytes[0]).toEqual(1);
            expect(bytes[1]).toEqual(2);
        });
    });

    it('can peek at the next byte', () => {
        const stream = new Stream(Uint8Array.from([1, 2]));
        expect(stream.peekByte()).toEqual(1);
        expect(stream.peekByte()).toEqual(1);
    });

    describe('can peek at the next n bytes', () => {
        let stream:Stream;

        beforeEach(() => {
            stream = new Stream(Uint8Array.from([1, 2, 258]));
        });

        it('when the values are not clamped', () => {
            const peekedBytes = stream.peekBytes(3, false);
            expect(peekedBytes.length).toEqual(3);
            expect(peekedBytes[0]).toEqual(1);
            expect(peekedBytes[1]).toEqual(2);
            expect(peekedBytes[2]).toEqual(2);
        });

        it('when the values are clamped', () => {
            const peekedBytes = stream.peekBytes(3, false);
            expect(peekedBytes.length).toEqual(3);
            expect(peekedBytes[0]).toEqual(1);
            expect(peekedBytes[1]).toEqual(2);
            expect(peekedBytes[2]).toEqual(2);
        });
    });

    it('can skip bytes', () => {
        const stream = new Stream(Uint8Array.from([1, 2]));
        stream.skip(1);
        expect(stream.peekByte()).toEqual(2);
        stream.skip(1);
        expect(stream.peekByte()).toEqual(-1);
    });

    it('can reset the position pointer', () => {
        const stream = new Stream(Uint8Array.from([1, 2]));
        stream.skip(1);
        stream.reset();
        expect(stream.peekByte()).toEqual(1);
    });

    it('can create a substream', () => {
        const stream = new Stream(Uint8Array.from([1, 2, 3]));
        const substream = stream.makeSubStream(1, 4);
        expect(substream.length).toEqual(4);
        expect(substream.peekByte()).toEqual(2);
    });

    it('can decode to bytes', () => {
        const bytes = Uint8Array.from([1, 2, 3]);
        const stream = new Stream(bytes);
        expect(stream.decode()).toEqual(bytes);
    });
});
