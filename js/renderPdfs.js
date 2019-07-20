window.onload = function() {
  var matches = document.querySelectorAll('[data-pdf]');
  for (var idx = 0; idx < matches.length; idx++) {
    var container = matches[idx];
    var width = container.width;
    var height = container.height;
    console.log({ width, height });
    var scale = container.dataset.scale || 1;
    var pdfUrl = container.dataset.pdf;
    renderPdf(container, scale, pdfUrl);
  }
};

pdfjsLib.GlobalWorkerOptions.workerSrc = '/js/pdf.worker.min.js_2.1.266';

function renderPdf(container, scale, pdfUrl) {
  pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
    var promises = [];

    for (var i = 1; i <= pdf.numPages; i++) {
      var promise = pdf.getPage(i).then(function(page) {
        var viewport = page.getViewport({ scale: scale });

        container.style.width = viewport.width + 'px';
        container.style.height = viewport.height + 'px';

        return page.getOperatorList().then(function(opList) {
          var svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
          return svgGfx.getSVG(opList, viewport);
        });
      });

      promises.push(promise);
    }

    Promise.all(promises).then(function(svgs) {
      for (var idx = 0; idx < svgs.length; idx++) {
        container.appendChild(svgs[idx]);
      }
    });
  });
}
