/* ======================================================
   ELEMENT REFERENCES
====================================================== */

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");

const track = document.getElementById("carouselTrack");
const container = document.querySelector(".carousel-container");

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const nextStepBtn = document.getElementById("nextStepBtn");
const goPaymentBtn = document.getElementById("goPayment");

/* NAV TABS */
const navItems = document.querySelectorAll(".nav-item");
const paymentNav = document.querySelector('[data-tab="payment"]');

/* ======================================================
   CONFIG
====================================================== */

// const MAX_SELECTION = 3;
const VISIBLE = 2;
const ITEM_WIDTH = 420;

/* ======================================================
   TAB HANDLING (SAFE)
====================================================== */

function activateTab(tabName) {
  document.querySelectorAll(".tab").forEach(tab =>
    tab.classList.remove("active")
  );

  document.getElementById(tabName + "Tab").classList.add("active");

  navItems.forEach(btn => btn.classList.remove("active"));
  document
    .querySelector(`.nav-item[data-tab="${tabName}"]`)
    .classList.add("active");
}

navItems.forEach(btn => {
  btn.addEventListener("click", () => {
    if (!btn.classList.contains("disabled")) {
      activateTab(btn.dataset.tab);
    }
  });
});

/* ======================================================
   SELECTION LIMIT (STEP 1)
====================================================== */

document.querySelectorAll("#step1 .poster input").forEach(input => {
  input.addEventListener("change", () => {
    const checked = step1.querySelectorAll("input:checked");
    // if (checked.length > MAX_SELECTION) {
    //   input.checked = false;
    //   alert(`You can select only ${MAX_SELECTION} events`);
    // }
  });
});

/* ======================================================
   STEP 1 → STEP 2
====================================================== */

function goToStep2() {
  const selected = step1.querySelectorAll("input:checked");
  if (selected.length === 0) {
    alert("Please select at least one event");
    return;
  }

  /* RESET CAROUSEL */
  track.innerHTML = "";
  container.classList.remove("static", "carousel-mode");

  prevBtn.style.display = "none";
  nextBtn.style.display = "none";

  /* BUILD EVENT CARDS */
  selected.forEach(input => {
    const img = input.nextElementSibling.dataset.image;

    const card = document.createElement("div");
    card.className = "poster";

    card.innerHTML = `
      <div class="poster-img" style="background-image:url('${img}')"></div>

      <div class="members-panel">
        <button class="members-btn">Team Details</button>
        <div class="members-card">
          <input placeholder="Team name">
          <input placeholder="Leader name">
          <input placeholder="Registration ID">
          <input placeholder="Phone number">
        </div>

        <button class="members-btn">Member 1</button>
        <div class="members-card">
          <input placeholder="Name">
          <input placeholder="Registration ID">
          <input placeholder="Phone number">
        </div>

        <button class="members-btn">Member 2</button>
        <div class="members-card">
          <input placeholder="Name">
          <input placeholder="Registration ID">
          <input placeholder="Phone number">
        </div>

        <button class="members-btn">Member 3</button>
        <div class="members-card">
          <input placeholder="Name">
          <input placeholder="Registration ID">
          <input placeholder="Phone number">
        </div>
      </div>
    `;

    track.appendChild(card);
  });

  step1.classList.remove("active");
  step2.classList.add("active");

  /* INIT CAROUSEL ONLY IF NEEDED */
  if (selected.length > 2) {
    container.classList.add("carousel-mode");
    initInfiniteCarousel();
  }

  /* UNLOCK PAYMENT TAB */
  paymentNav.classList.remove("disabled");
}

/* ======================================================
   INFINITE CAROUSEL (UNCHANGED LOGIC)
====================================================== */

function initInfiniteCarousel() {
  const originalItems = Array.from(track.children);
  const total = originalItems.length;

  // CLEAN UP OLD CLONES (important if re-init)
  track.querySelectorAll(".clone").forEach(c => c.remove());

  // CLONE LAST & FIRST (VISIBLE = 2)
  originalItems.slice(-VISIBLE).forEach(item => {
    const clone = item.cloneNode(true);
    clone.classList.add("clone");
    track.insertBefore(clone, track.firstChild);
  });

  originalItems.slice(0, VISIBLE).forEach(item => {
    const clone = item.cloneNode(true);
    clone.classList.add("clone");
    track.appendChild(clone);
  });

  const items = Array.from(track.children);
  let index = VISIBLE;            // start at first REAL item
  let animating = false;

  // INITIAL POSITION (NO ANIMATION)
  track.style.transition = "none";
  track.style.transform = `translateX(${-index * ITEM_WIDTH}px)`;
  track.offsetHeight; // force reflow
  track.style.transition = "transform 0.45s ease";

  prevBtn.style.display = "block";
  nextBtn.style.display = "block";

  function move(dir) {
    if (animating) return;
    animating = true;

    index += dir;
    track.style.transform = `translateX(${-index * ITEM_WIDTH}px)`;
  }

  track.addEventListener("transitionend", () => {
    animating = false;

    // MOVED PAST LAST REAL ITEM → JUMP BACK
    if (index >= total + VISIBLE) {
      index = VISIBLE;
      track.style.transition = "none";
      track.style.transform = `translateX(${-index * ITEM_WIDTH}px)`;
      track.offsetHeight;
      track.style.transition = "transform 0.45s ease";
    }

    // MOVED BEFORE FIRST REAL ITEM → JUMP FORWARD
    if (index < VISIBLE) {
      index = total + VISIBLE - 1;
      track.style.transition = "none";
      track.style.transform = `translateX(${-index * ITEM_WIDTH}px)`;
      track.offsetHeight;
      track.style.transition = "transform 0.45s ease";
    }
  });

  nextBtn.onclick = () => move(1);
  prevBtn.onclick = () => move(-1);
}


/* ======================================================
   DROPDOWNS (FIXED — THIS WAS THE MAIN BUG)
====================================================== */

track.addEventListener("click", (e) => {
  if (!e.target.classList.contains("members-btn")) return;

  const panel = e.target.nextElementSibling;
  if (!panel) return;

  track.querySelectorAll(".members-card.open")
    .forEach(p => {
      if (p !== panel) p.classList.remove("open");
    });

  panel.classList.toggle("open");
});

/* ======================================================
   BUTTON WIRES
====================================================== */

nextStepBtn.addEventListener("click", goToStep2);

goPaymentBtn.addEventListener("click", () => {
  activateTab("payment");
});

/* ======================================================
   INIT STATE
====================================================== */

activateTab("events");
step1.classList.add("active");
step2.classList.remove("active");
