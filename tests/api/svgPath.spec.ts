import svgPathOperators from 'src/api/svgPath';

// Test paths adapted from https://svgwg.org/svg2-draft/paths.html
describe(`svgPath`, () => {
  it(`can draw triangle`, () => {
    const operators = svgPathOperators('M 100 100 L 300 100 L 200 300 z');
    expect(operators.length).toBe(4);
    expect(operators.toString()).toBe('100 100 m,300 100 l,200 300 l,h');
  });
  it(`can draw relative triangle`, () => {
    const operators = svgPathOperators('m 100 100 l 200 0 l -100 200 z');
    expect(operators.length).toBe(4);
    expect(operators.toString()).toBe('100 100 m,300 100 l,200 300 l,h');
  });
  it(`can draw triangle decimal`, () => {
    const operators = svgPathOperators('M 50.5 100 L 250.5 100 150.5 300 z');
    expect(operators.length).toBe(4);
    expect(operators.toString()).toBe('50.5 100 m,250.5 100 l,150.5 300 l,h');
  });
  it(`can draw rectangle with lines`, () => {
    const operators = svgPathOperators('M 50 50 V 100 H 100 v -100 h -50 Z');
    expect(operators.length).toBe(6);
    expect(operators.toString()).toBe(
      '50 50 m,50 100 l,100 100 l,100 0 l,50 0 l,h',
    );
  });
  it(`can draw bezier curve`, () => {
    const operators = svgPathOperators(
      'M100,200 C100,100 250,100 250,200 S400,300 400,200',
    );
    expect(operators.length).toBe(3);
    expect(operators.toString()).toBe(
      '100 200 m,100 100 250 100 250 200 c,250 300 400 300 400 200 c',
    );
  });
  it(`can draw relative bezier curve`, () => {
    const operators = svgPathOperators(
      'M100,200 c0,-100 150,-100 150,0 s150,100 150,0',
    );
    expect(operators.length).toBe(3);
    expect(operators.toString()).toBe(
      '100 200 m,100 100 250 100 250 200 c,250 300 400 300 400 200 c',
    );
  });
  it(`can draw quadratic curve`, () => {
    const operators = svgPathOperators('M200,300 Q400,50 600,300 T1000,300');
    expect(operators.length).toBe(3);
    expect(operators.toString()).toBe(
      '200 300 m,400 50 600 300 v,800 550 1000 300 v',
    );
  });
  it(`can draw relative quadratic curve`, () => {
    const operators = svgPathOperators('M200,300 q200,-250 400,0 t400,0');
    expect(operators.length).toBe(3);
    expect(operators.toString()).toBe(
      '200 300 m,400 50 600 300 v,800 550 1000 300 v',
    );
  });
  it(`can draw arc`, () => {
    const operators = svgPathOperators(
      'M300,200 h-150 a150,150 0 1,0 150,-150 z',
    );
    expect(operators.length).toBe(6);
    expect(operators.toString()).toBe(
      '300 200 m,150 200 l,150 282.8427124746191 217.15728752538098 350 300 350 c,382.84271247461896 350 450 282.842712474619 450 200.00000000000003 c,450 117.15728752538101 382.84271247461896 50.00000000000003 300 50.00000000000002 c,h',
    );
  });
  it(`can draw relative arc`, () => {
    const operators = svgPathOperators(
      'M300,200 h-150 A150,150 0 1,0 300,50 z',
    );
    expect(operators.length).toBe(6);
    expect(operators.toString()).toBe(
      '300 200 m,150 200 l,150 282.8427124746191 217.15728752538098 350 300 350 c,382.84271247461896 350 450 282.842712474619 450 200.00000000000003 c,450 117.15728752538101 382.84271247461896 50.00000000000003 300 50.00000000000002 c,h',
    );
  });
  it(`can draw cubic bezier`, () => {
    const operators = svgPathOperators(
      'm 100 100 S 200,100 200,200 200,200 100,200 T 0,250',
    );
    expect(operators.length).toBe(4);
    expect(operators.toString()).toBe(
      '100 100 m,100 100 200 100 200 200 c,200 300 200 200 100 200 c,0 200 0 250 v',
    );
  });
});
