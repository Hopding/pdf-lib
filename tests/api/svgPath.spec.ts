import { svgPathToOperators } from '../../src/api/svgPath';

// Test paths adapted from https://svgwg.org/svg2-draft/paths.html
describe(`svgPathToOperators`, () => {
  it(`can map triangle paths to PDF operators`, () => {
    const operators = svgPathToOperators('M 100 100 L 300 100 L 200 300 z');
    expect(operators.length).toBe(4);
    expect(operators.toString()).toBe('100 100 m,300 100 l,200 300 l,h');
  });

  it(`can map relative triangle paths to PDF operators`, () => {
    const operators = svgPathToOperators('m 100 100 l 200 0 l -100 200 z');
    expect(operators.length).toBe(4);
    expect(operators.toString()).toBe('100 100 m,300 100 l,200 300 l,h');
  });

  it(`can map triangle decimal paths to PDF operators`, () => {
    const operators = svgPathToOperators('M 50.5 100 L 250.5 100 150.5 300 z');
    expect(operators.length).toBe(4);
    expect(operators.toString()).toBe('50.5 100 m,250.5 100 l,150.5 300 l,h');
  });

  it(`can map rectangle with lines paths to PDF operators`, () => {
    const operators = svgPathToOperators('M 50 50 V 100 H 100 v -100 h -50 Z');
    expect(operators.length).toBe(6);
    expect(operators.toString()).toBe(
      '50 50 m,50 100 l,100 100 l,100 0 l,50 0 l,h',
    );
  });

  it(`can map bezier curve paths to PDF operators`, () => {
    const operators = svgPathToOperators(
      'M100,200 C100,100 250,100 250,200 S400,300 400,200',
    );
    expect(operators.length).toBe(3);
    expect(operators.toString()).toBe(
      '100 200 m,100 100 250 100 250 200 c,250 300 400 300 400 200 c',
    );
  });

  it(`can map relative bezier curve paths to PDF operators`, () => {
    const operators = svgPathToOperators(
      'M100,200 c0,-100 150,-100 150,0 s150,100 150,0',
    );
    expect(operators.length).toBe(3);
    expect(operators.toString()).toBe(
      '100 200 m,100 100 250 100 250 200 c,250 300 400 300 400 200 c',
    );
  });

  it(`can map quadratic curve paths to PDF operators`, () => {
    const operators = svgPathToOperators('M200,300 Q400,50 600,300 T1000,300');
    expect(operators.length).toBe(3);
    expect(operators.toString()).toBe(
      '200 300 m,400 50 600 300 v,800 550 1000 300 v',
    );
  });

  it(`can map relative quadratic curve paths to PDF operators`, () => {
    const operators = svgPathToOperators('M200,300 q200,-250 400,0 t400,0');
    expect(operators.length).toBe(3);
    expect(operators.toString()).toBe(
      '200 300 m,400 50 600 300 v,800 550 1000 300 v',
    );
  });

  it(`can map arc paths to PDF operators`, () => {
    const operators = svgPathToOperators(
      'M300,200 h-150 a150,150 0 1,0 150,-150 z',
    );
    expect(operators.length).toBe(6);
    expect(operators.toString()).toBe(
      '300 200 m,150 200 l,150 282.8427124746191 217.15728752538098 350 300 350 c,382.84271247461896 350 450 282.842712474619 450 200.00000000000003 c,450 117.15728752538101 382.84271247461896 50.00000000000003 300 50.00000000000002 c,h',
    );
  });

  it(`can map relative arc paths to PDF operators`, () => {
    const operators = svgPathToOperators(
      'M300,200 h-150 A150,150 0 1,0 300,50 z',
    );
    expect(operators.length).toBe(6);
    expect(operators.toString()).toBe(
      '300 200 m,150 200 l,150 282.8427124746191 217.15728752538098 350 300 350 c,382.84271247461896 350 450 282.842712474619 450 200.00000000000003 c,450 117.15728752538101 382.84271247461896 50.00000000000003 300 50.00000000000002 c,h',
    );
  });

  it(`can map cubic bezier paths to PDF operators`, () => {
    const operators = svgPathToOperators(
      'm 100 100 S 200,100 200,200 200,200 100,200 T 0,250',
    );
    expect(operators.length).toBe(4);
    expect(operators.toString()).toBe(
      '100 100 m,100 100 200 100 200 200 c,200 300 200 200 100 200 c,0 200 0 250 v',
    );
  });

  it(`can map dashed line paths to PDF operators`, () => {
    const operators = svgPathToOperators(
      'M 0,25 5,25 M 10,25 15,25 M 20,25 25,25',
    );
    expect(operators.length).toBe(6);
    expect(operators.toString()).toBe(
      '0 25 m,5 25 l,10 25 m,15 25 l,20 25 m,25 25 l',
    );
  });

  it(`can map relative dashed line paths to PDF operators`, () => {
    const operators = svgPathToOperators('m 0,25 5,0 m 5,0 5,0 m 5,0 5,0');
    expect(operators.length).toBe(6);
    expect(operators.toString()).toBe(
      '0 25 m,5 25 l,10 25 m,15 25 l,20 25 m,25 25 l',
    );
  });

  it(`can map paths with odd inputs to PDF operators`, () => {
    const operators = svgPathToOperators('M 0,25 5,25 m 5-0 5..0 m 5,0 5,0');
    expect(operators.length).toBe(6);
    expect(operators.toString()).toBe(
      '0 25 m,5 25 l,10 25 m,15 25 l,20 25 m,25 25 l',
    );
  });

  it(`can map paths that reset cubic bezier control points to PDF operators`, () => {
    const operators = svgPathToOperators(
      'M100 100 S200,100 200,200 M95 105 s100,0 100,100',
    );
    expect(operators.length).toBe(4);
    expect(operators.toString()).toBe(
      '100 100 m,100 100 200 100 200 200 c,95 105 m,95 105 195 105 195 205 c',
    );
  });

  it(`can map paths that reset quadratic bezier control points to PDF operators`, () => {
    const operators = svgPathToOperators(
      'M100 100 T100,200 200,200 M90,120 t0,100 100,0',
    );
    expect(operators.length).toBe(6);
    expect(operators.toString()).toBe(
      '100 100 m,100 100 100 200 v,100 300 200 200 v,90 120 m,90 120 90 220 v,90 320 190 220 v',
    );
  });

  it(`correctly updates control points for T command`, () => {
    // See https://github.com/Hopding/pdf-lib/issues/1443
    const operators = svgPathToOperators(
      'M 10,25 Q 30,0 50,25 Q 70,50 90,25 T 130,25 T 170,25',
    );
    expect(operators.length).toBe(5);
    expect(operators.toString()).toBe(
      '10 25 m,30 0 50 25 v,70 50 90 25 v,110 0 130 25 v,150 50 170 25 v'
    );
  });
});
