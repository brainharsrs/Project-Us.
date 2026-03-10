const bookShell = document.getElementById("bookShell");
const book = document.getElementById("book");
const pageViewport = document.getElementById("pageViewport");
const pageTrack = document.getElementById("pageTrack");
const pageCounter = document.getElementById("pageCounter");
const pageDots = document.getElementById("pageDots");
const pages = Array.from(document.querySelectorAll(".page"));

const totalPages = pages.length;
let currentPage = 0;
let startX = 0;
let startY = 0;
let isPointerDown = false;
let pointerId = null;

function openBook() {
  book.classList.add("open");
}

function closeBook() {
  book.classList.remove("open");
}

function setPage(index) {
  currentPage = Math.max(0, Math.min(totalPages - 1, index));
  pageTrack.style.transform = `translateX(-${currentPage * 100}%)`;
  pageCounter.textContent = `Pagina ${currentPage + 1} de ${totalPages}`;

  const dots = pageDots.querySelectorAll(".dot");
  dots.forEach((dot, dotIndex) => {
    dot.classList.toggle("active", dotIndex === currentPage);
  });
}

function nextPage() {
  setPage(currentPage + 1);
}

function prevPage() {
  setPage(currentPage - 1);
}

function buildDots() {
  for (let i = 0; i < totalPages; i += 1) {
    const dot = document.createElement("span");
    dot.className = "dot";
    if (i === 0) {
      dot.classList.add("active");
    }
    pageDots.appendChild(dot);
  }
}

function isBookOpen() {
  return book.classList.contains("open");
}

bookShell.addEventListener("mouseenter", openBook);
bookShell.addEventListener("mouseleave", closeBook);
bookShell.addEventListener("focusin", openBook);
bookShell.addEventListener("focusout", (event) => {
  if (!bookShell.contains(event.relatedTarget)) {
    closeBook();
  }
});

bookShell.addEventListener("touchstart", openBook, { passive: true });
document.addEventListener(
  "touchstart",
  (event) => {
    if (!bookShell.contains(event.target)) {
      closeBook();
    }
  },
  { passive: true }
);

pageViewport.addEventListener("pointerdown", (event) => {
  if (!isBookOpen()) {
    return;
  }

  isPointerDown = true;
  pointerId = event.pointerId;
  startX = event.clientX;
  startY = event.clientY;
  pageViewport.setPointerCapture(pointerId);
});

pageViewport.addEventListener("pointerup", (event) => {
  if (!isPointerDown) {
    return;
  }

  const deltaX = event.clientX - startX;
  const deltaY = event.clientY - startY;

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 55) {
    if (deltaX < 0) {
      nextPage();
    } else {
      prevPage();
    }
  }

  isPointerDown = false;
  if (pointerId !== null && pageViewport.hasPointerCapture(pointerId)) {
    pageViewport.releasePointerCapture(pointerId);
  }
  pointerId = null;
});

pageViewport.addEventListener("pointercancel", () => {
  isPointerDown = false;
  pointerId = null;
});

window.addEventListener("keydown", (event) => {
  if (!isBookOpen()) {
    return;
  }

  if (event.key === "ArrowRight") {
    nextPage();
  }

  if (event.key === "ArrowLeft") {
    prevPage();
  }
});

buildDots();
setPage(0);