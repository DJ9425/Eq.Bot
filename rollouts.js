(() => {
  "use strict";

  const browser = document.getElementById("trial-browser");
  const taskSelect = document.getElementById("rollout-task");
  const trialSelect = document.getElementById("rollout-trial");
  const status = document.getElementById("rollout-status");
  const grid = document.getElementById("rollout-videos");

  const tasks = {
    "place-object": {
      folder: "place object",
      label: "Place Object",
      example: 1,
      instruction: "Move the white block next to the red bowl into the gray bowl."
    },
    "pack-box": {
      folder: "pack box",
      label: "Pack Box",
      example: 1,
      instruction: "Place the brown toy in the green basin."
    },
    "stack-blocks": {
      folder: "stack blocks",
      label: "Stack Blocks",
      example: 1,
      instruction: "Stack the white block on the red block."
    }
  };
  const policies = [
    { slug: "openvla-oft", file: "oft", label: "OpenVLA-OFT" },
    { slug: "optnet-cnn", file: "cnn", label: "OptNet-CNN" },
    { slug: "optnet-res50", file: "res", label: "OptNet-Res50" },
    { slug: "dirnet", file: "gn", label: "DirNet" }
  ];

  const videoBase = browser.dataset.videoBase.trim().replace(/\/+$/, "");
  const local = !videoBase && window.location.protocol === "file:";
  const allTrials = Boolean(videoBase || local);

  const allowAutoplay = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function clipUrl(task, trial, policy) {
    if (videoBase) {
      const index = String(trial).padStart(2, "0");
      return `${videoBase}/${task}-${index}-${policy.slug}.mp4`;
    }
    if (local) {
      return `../Real-World%20Trial%20Results/${encodeURIComponent(tasks[task].folder)}/${trial}/${policy.file}.mp4`;
    }
    return `videos/${task}/${policy.slug}.mp4`;
  }

  function renderTrial() {
    const task = taskSelect.value;
    const trial = Number(trialSelect.value);
    const { label, instruction } = tasks[task];
    status.textContent = `${label} · Trial ${trial}${allTrials ? " of 10" : ""}. ${instruction}`;
    if (!allTrials) {
      status.textContent += " Selected recordings are available here while the full archive is being prepared for online access.";
    }

    for (const video of grid.querySelectorAll("video")) {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
    grid.replaceChildren();
    for (const policy of policies) {
      const url = clipUrl(task, trial, policy);
      const figure = document.createElement("figure");
      figure.className = "clip";

      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.muted = true;
      video.defaultMuted = true;
      video.autoplay = allowAutoplay;
      video.setAttribute("aria-label", `${label}, trial ${trial}: ${policy.label}`);
      video.src = url;

      const caption = document.createElement("figcaption");
      caption.textContent = policy.label;
      const link = document.createElement("a");
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Open video";
      link.setAttribute("aria-label", `Open ${policy.label} video in a new tab`);
      caption.append(link);
      figure.append(video, caption);
      grid.append(figure);
    }
  }

  function selectTask() {
    const { example } = tasks[taskSelect.value];
    const trials = allTrials ? Array.from({ length: 10 }, (_, i) => i + 1) : [example];
    trialSelect.replaceChildren(...trials.map((index) => new Option(`Trial ${index}`, String(index))));
    trialSelect.value = String(example);
    renderTrial();
  }

  taskSelect.addEventListener("change", selectTask);
  trialSelect.addEventListener("change", renderTrial);
  selectTask();
})();
