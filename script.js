// The hero is a video player; the progress bar is the career timeline.
(function () {
  var player = document.getElementById('player');
  var bar = document.getElementById('bar');
  var fill = document.getElementById('fill');
  var time = document.getElementById('time');
  var play = document.getElementById('play');
  var marks = Array.prototype.slice.call(bar.querySelectorAll('.mark'));
  var nerds = document.getElementById('nerds');
  var nerdsBtn = document.getElementById('nerds-btn');
  var START = 2007, END = 2026;

  // Marker positions come from data-at (inline style attributes are blocked by the CSP)
  marks.forEach(function (m) { m.style.left = m.dataset.at; });
  function at(m) { return parseFloat(m.dataset.at) / 100; }
  var pos = 0, timer = null;

  function setPos(p) {
    pos = Math.max(0, Math.min(1, p));
    fill.style.width = (pos * 100) + '%';
    time.textContent = Math.round(START + pos * (END - START)) + ' / ' + END;
    marks.forEach(function (m) {
      m.classList.toggle('on', at(m) <= pos + 0.001);
    });
  }

  function stop() {
    clearInterval(timer); timer = null;
    player.classList.remove('playing');
    play.setAttribute('aria-label', 'Play through the timeline');
  }

  // Play: sweep the bar and scroll to each chapter as it is reached
  function start() {
    if (pos >= 1) setPos(0);
    player.classList.add('playing');
    play.setAttribute('aria-label', 'Pause');
    var visited = {};
    timer = setInterval(function () {
      setPos(pos + 0.004);
      marks.forEach(function (m) {
        if (at(m) <= pos && !visited[m.hash]) {
          visited[m.hash] = true;
          var target = document.querySelector(m.hash);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
      if (pos >= 1) stop();
    }, 120);
  }

  play.addEventListener('click', function () { timer ? stop() : start(); });

  // Scrub by clicking the bar; clicking a marker jumps to the chapter
  bar.addEventListener('click', function (e) {
    if (e.target.classList.contains('mark')) { stop(); setPos(at(e.target)); return; }
    stop();
    var r = bar.getBoundingClientRect();
    setPos((e.clientX - r.left) / r.width);
  });

  nerdsBtn.addEventListener('click', function () {
    var open = nerds.hidden;
    nerds.hidden = !open;
    nerdsBtn.setAttribute('aria-pressed', String(open));
  });

  // Fill the bar as the reader scrolls through the page
  window.addEventListener('scroll', function () {
    if (timer) return;
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (max > 0) setPos(h.scrollTop / max);
  }, { passive: true });

  document.getElementById('year').textContent = new Date().getFullYear();
  setPos(0);
})();
