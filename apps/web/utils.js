function startFpsTracker(id) {
  const element = document.getElementById(id);

  const moveTo = (xCoord) =>
    (element.style.transform = `translateX(${xCoord}px)`);

  let xCoord = 0;
  const delta = 7;

  const slideRight = (timestamp) => {
    moveTo(xCoord);
    xCoord += delta;

    if (xCoord > 100) {
      requestAnimationFrame(slideLeft);
    } else {
      requestAnimationFrame(slideRight);
    }
  };

  const slideLeft = (timestamp) => {
    moveTo(xCoord);
    xCoord -= delta;

    if (xCoord < -100) {
      requestAnimationFrame(slideRight);
    } else {
      requestAnimationFrame(slideLeft);
    }
  };

  requestAnimationFrame(slideRight);
}
