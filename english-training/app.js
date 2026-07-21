(() => {
  "use strict";

  const DATA = window.SHUNEI_DATA;
  const appEl = document.getElementById("app");
  const STORAGE_KEY = "shunei-diagnosis-last";

  const LEVEL_LABELS = {
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級",
  };

  const SKILL_LABELS = {
    grammar: "文法",
    vocab: "語彙",
    compose: "作文",
    reading: "読解",
  };

  const CEFR_COPY = {
    A1: {
      title: "基礎スタート",
      desc: "簡単な日常表現の土台があります。短文の瞬間英作文で「主語＋動詞」を自動化しましょう。",
      advice: "初級の瞬間英作文を毎日5〜10問。be動詞と一般動詞の区別を意識してください。",
    },
    A2: {
      title: "日常会話の入口",
      desc: "身近な話題の基本文は作れます。過去形・疑問文・頻度表現を瞬発で出す練習が効きます。",
      advice: "初級〜中級の瞬間英作文で、時制の切り替えを素早く行うトレーニングを。",
    },
    B1: {
      title: "自立した運用",
      desc: "完了形や条件・受動態など、やや複雑な構文まで手が届きます。精度と速度を両立させましょう。",
      advice: "中級の瞬間英作文と、接続詞・関係詞を含む文の言い換え練習がおすすめです。",
    },
    B2: {
      title: "実務・議論レベル",
      desc: "抽象的な内容や仮定法も扱えます。ニュアンスの差を意識した表現の幅を広げましょう。",
      advice: "上級の瞬間英作文で、同じ意味の複数表現を意識しながらスピードを上げてください。",
    },
  };

  const state = {
    route: "home",
    compose: null,
    diagnosis: null,
  };

  function normalize(text) {
    return String(text || "")
      .trim()
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/[“”]/g, '"')
      .replace(/[！!？?。．.、,；;：:]/g, "")
      .replace(/\s+/g, " ");
  }

  function isComposeMatch(input, answers) {
    const n = normalize(input);
    if (!n) return false;
    return answers.some((a) => normalize(a) === n);
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function sample(arr, n) {
    return shuffle(arr).slice(0, Math.min(n, arr.length));
  }

  function clearTimer() {
    if (state.compose && state.compose.timerId) {
      clearInterval(state.compose.timerId);
      state.compose.timerId = null;
    }
  }

  function setRoute(route, options = {}) {
    clearTimer();
    state.route = route;
    if (route === "home") {
      state.compose = null;
      state.diagnosis = null;
    }
    if (route === "compose" && !options.resume) {
      state.compose = null;
    }
    if (route === "diagnosis" && !options.resume) {
      state.diagnosis = null;
    }
    render();
    appEl.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function mountTemplate(id) {
    const tpl = document.getElementById(id);
    appEl.replaceChildren(tpl.content.cloneNode(true));
  }

  function bindRouteButtons(root = appEl) {
    root.querySelectorAll("[data-route]").forEach((btn) => {
      btn.addEventListener("click", () => setRoute(btn.getAttribute("data-route")));
    });
  }

  /* ---------- Home ---------- */
  function renderHome() {
    mountTemplate("tpl-home");
    bindRouteButtons();
  }

  /* ---------- Compose ---------- */
  function renderComposeSetup() {
    mountTemplate("tpl-compose-setup");
    bindRouteButtons();
    const form = document.getElementById("compose-setup-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const level = String(fd.get("level") || "beginner");
      const count = Number(fd.get("count") || 5);
      const useTimer = fd.get("timer") === "on";
      const pool = DATA.compose[level] || DATA.compose.beginner;
      state.compose = {
        level,
        useTimer,
        items: sample(pool, count),
        index: 0,
        results: [],
        answered: false,
        timerLeft: 60,
        timerId: null,
      };
      setRoute("compose-play", { resume: true });
    });
  }

  function updateComposeProgress() {
    const c = state.compose;
    const total = c.items.length;
    const current = c.index + 1;
    const label = document.getElementById("compose-progress-label");
    const bar = document.getElementById("compose-progress-bar");
    if (label) label.textContent = `${current} / ${total}`;
    if (bar) bar.style.width = `${(c.index / total) * 100}%`;
  }

  function startComposeTimer() {
    const c = state.compose;
    const el = document.getElementById("compose-timer");
    if (!c.useTimer) {
      if (el) el.hidden = true;
      return;
    }
    clearTimer();
    c.timerLeft = 60;
    el.hidden = false;
    el.textContent = String(c.timerLeft);
    el.classList.remove("warn");
    c.timerId = setInterval(() => {
      c.timerLeft -= 1;
      el.textContent = String(Math.max(0, c.timerLeft));
      if (c.timerLeft <= 10) el.classList.add("warn");
      if (c.timerLeft <= 0) {
        clearTimer();
        if (!c.answered) submitComposeAnswer(true);
      }
    }, 1000);
  }

  function showComposeQuestion() {
    const c = state.compose;
    const item = c.items[c.index];
    c.answered = false;
    const ja = document.getElementById("compose-ja");
    const hint = document.getElementById("compose-hint");
    const input = document.getElementById("compose-input");
    const feedback = document.getElementById("compose-feedback");
    const nextWrap = document.getElementById("compose-next-wrap");
    const form = document.getElementById("compose-answer-form");

    ja.textContent = item.ja;
    ja.classList.remove("prompt-ja");
    void ja.offsetWidth;
    ja.classList.add("prompt-ja");

    hint.hidden = true;
    hint.textContent = `ヒント：${item.hint}`;
    feedback.hidden = true;
    nextWrap.hidden = true;
    form.hidden = false;
    input.value = "";
    input.disabled = false;
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) submitBtn.disabled = false;
    input.focus();
    updateComposeProgress();
    startComposeTimer();
  }

  function submitComposeAnswer(timedOut = false) {
    const c = state.compose;
    if (!c || c.answered) return;
    c.answered = true;
    clearTimer();

    const item = c.items[c.index];
    const input = document.getElementById("compose-input");
    const feedback = document.getElementById("compose-feedback");
    const nextWrap = document.getElementById("compose-next-wrap");
    const form = document.getElementById("compose-answer-form");
    const user = timedOut ? input.value : input.value;
    const ok = !timedOut && isComposeMatch(user, item.answers);

    c.results.push({
      ja: item.ja,
      user: user.trim(),
      ok,
      model: item.answers[0],
      timedOut,
    });

    input.disabled = true;
    form.querySelector('button[type="submit"]').disabled = true;
    feedback.hidden = false;
    feedback.className = `feedback ${ok ? "ok" : "ng"}`;
    feedback.innerHTML = ok
      ? `<strong>正解！</strong><p class="model">模範：${escapeHtml(item.answers[0])}</p>`
      : `<strong>${timedOut ? "時間切れ" : "不正解"}</strong>
         <p class="model">あなたの答え：${escapeHtml(user.trim() || "（未入力）")}</p>
         <p class="model">模範：${escapeHtml(item.answers[0])}</p>`;

    const bar = document.getElementById("compose-progress-bar");
    if (bar) bar.style.width = `${((c.index + 1) / c.items.length) * 100}%`;

    nextWrap.hidden = false;
    const nextBtn = document.getElementById("compose-next-btn");
    nextBtn.textContent = c.index >= c.items.length - 1 ? "結果を見る" : "次の問題へ";
    nextBtn.focus();
  }

  function renderComposePlay() {
    if (!state.compose) {
      renderComposeSetup();
      return;
    }
    mountTemplate("tpl-compose-play");
    const form = document.getElementById("compose-answer-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitComposeAnswer(false);
    });
    document.getElementById("compose-hint-btn").addEventListener("click", () => {
      const hint = document.getElementById("compose-hint");
      hint.hidden = false;
    });
    document.getElementById("compose-next-btn").addEventListener("click", () => {
      const c = state.compose;
      if (c.index >= c.items.length - 1) {
        setRoute("compose-result", { resume: true });
        return;
      }
      c.index += 1;
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = false;
      showComposeQuestion();
    });
    showComposeQuestion();
  }

  function renderComposeResult() {
    if (!state.compose) {
      renderComposeSetup();
      return;
    }
    mountTemplate("tpl-compose-result");
    bindRouteButtons();
    const c = state.compose;
    const correct = c.results.filter((r) => r.ok).length;
    const total = c.results.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    document.getElementById("compose-score").textContent = `${pct}%`;
    document.getElementById("compose-score-caption").textContent =
      `${LEVEL_LABELS[c.level] || c.level} · ${correct} / ${total} 問正解`;

    const list = document.getElementById("compose-review");
    list.innerHTML = c.results
      .map(
        (r, i) => `<li>
          <p class="ja">${i + 1}. ${escapeHtml(r.ja)}</p>
          <p class="meta"><span class="${r.ok ? "ok-tag" : "ng-tag"}">${r.ok ? "正解" : r.timedOut ? "時間切れ" : "不正解"}</span>
          · あなた：${escapeHtml(r.user || "—")} · 模範：${escapeHtml(r.model)}</p>
        </li>`
      )
      .join("");
  }

  /* ---------- Diagnosis ---------- */
  function renderDiagnosisIntro() {
    mountTemplate("tpl-diagnosis-intro");
    bindRouteButtons();
    const lastEl = document.getElementById("diagnosis-last");
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const last = JSON.parse(raw);
        lastEl.hidden = false;
        lastEl.textContent = `前回の結果：${last.cefr}（${last.score}%） · ${last.date}`;
      }
    } catch (_) {
      /* ignore */
    }
    document.getElementById("diagnosis-start").addEventListener("click", () => {
      state.diagnosis = {
        items: [...DATA.diagnosis],
        index: 0,
        results: [],
        answered: false,
      };
      setRoute("diagnosis-play", { resume: true });
    });
  }

  function updateDiagProgress() {
    const d = state.diagnosis;
    const total = d.items.length;
    document.getElementById("diag-progress-label").textContent = `${d.index + 1} / ${total}`;
    document.getElementById("diag-progress-bar").style.width = `${(d.index / total) * 100}%`;
    const item = d.items[d.index];
    document.getElementById("diag-skill").textContent = SKILL_LABELS[item.skill] || item.skill;
  }

  function lockDiagUi() {
    document.querySelectorAll(".choice-btn").forEach((b) => {
      b.disabled = true;
    });
    const input = document.getElementById("diag-compose-input");
    const submit = document.getElementById("diag-compose-submit");
    if (input) input.disabled = true;
    if (submit) submit.disabled = true;
  }

  function finishDiagAnswer({ ok, user, item }) {
    const d = state.diagnosis;
    if (d.answered) return;
    d.answered = true;
    d.results.push({
      id: item.id,
      skill: item.skill,
      level: item.level,
      ok,
      user,
    });

    const feedback = document.getElementById("diag-feedback");
    feedback.hidden = false;
    feedback.className = `feedback ${ok ? "ok" : "ng"}`;
    const model =
      item.type === "mc"
        ? item.choices[item.correct]
        : item.answers[0];
    feedback.innerHTML = ok
      ? `<strong>正解</strong><p class="model">${escapeHtml(item.explanation || "")}</p>`
      : `<strong>不正解</strong>
         <p class="model">正解例：${escapeHtml(model)}</p>
         <p class="model">${escapeHtml(item.explanation || "")}</p>`;

    document.getElementById("diag-progress-bar").style.width =
      `${((d.index + 1) / d.items.length) * 100}%`;

    const nextWrap = document.getElementById("diag-next-wrap");
    nextWrap.hidden = false;
    const nextBtn = document.getElementById("diag-next-btn");
    nextBtn.textContent = d.index >= d.items.length - 1 ? "結果を見る" : "次へ";
    nextBtn.focus();
  }

  function showDiagQuestion() {
    const d = state.diagnosis;
    const item = d.items[d.index];
    d.answered = false;

    document.getElementById("diag-prompt").textContent = item.prompt;
    document.getElementById("diag-feedback").hidden = true;
    document.getElementById("diag-next-wrap").hidden = true;

    const area = document.getElementById("diag-answer-area");
    if (item.type === "mc") {
      area.innerHTML = `<div class="choices-grid" role="group" aria-label="選択肢">
        ${item.choices
          .map(
            (c, i) =>
              `<button type="button" class="choice-btn" data-index="${i}">${escapeHtml(c)}</button>`
          )
          .join("")}
      </div>`;
      area.querySelectorAll(".choice-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (d.answered) return;
          const idx = Number(btn.getAttribute("data-index"));
          const ok = idx === item.correct;
          area.querySelectorAll(".choice-btn").forEach((b, i) => {
            if (i === item.correct) b.classList.add("correct");
            if (i === idx && !ok) b.classList.add("wrong");
          });
          lockDiagUi();
          finishDiagAnswer({ ok, user: item.choices[idx], item });
        });
      });
    } else {
      area.innerHTML = `<form class="answer-form" id="diag-compose-form">
        <label class="sr-only" for="diag-compose-input">英作文</label>
        <textarea id="diag-compose-input" rows="3" placeholder="Type your English here…" required></textarea>
        <div class="form-actions">
          <button type="submit" class="btn primary" id="diag-compose-submit">答え合わせ</button>
        </div>
      </form>`;
      const form = document.getElementById("diag-compose-form");
      const input = document.getElementById("diag-compose-input");
      input.focus();
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (d.answered) return;
        const user = input.value;
        const ok = isComposeMatch(user, item.answers);
        lockDiagUi();
        finishDiagAnswer({ ok, user: user.trim(), item });
      });
    }
    updateDiagProgress();
  }

  function renderDiagnosisPlay() {
    if (!state.diagnosis) {
      renderDiagnosisIntro();
      return;
    }
    mountTemplate("tpl-diagnosis-play");
    document.getElementById("diag-next-btn").addEventListener("click", () => {
      const d = state.diagnosis;
      if (d.index >= d.items.length - 1) {
        setRoute("diagnosis-result", { resume: true });
        return;
      }
      d.index += 1;
      showDiagQuestion();
    });
    showDiagQuestion();
  }

  function scoreToCefr(pct, results) {
    const hardOk = results.filter((r) => (r.level === "B2" || r.level === "B1") && r.ok).length;
    if (pct >= 85 && hardOk >= 4) return "B2";
    if (pct >= 70) return "B1";
    if (pct >= 45) return "A2";
    return "A1";
  }

  function renderDiagnosisResult() {
    if (!state.diagnosis) {
      renderDiagnosisIntro();
      return;
    }
    mountTemplate("tpl-diagnosis-result");
    bindRouteButtons();

    const d = state.diagnosis;
    const correct = d.results.filter((r) => r.ok).length;
    const total = d.results.length;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    const cefr = scoreToCefr(pct, d.results);
    const copy = CEFR_COPY[cefr];

    document.getElementById("diag-cefr").textContent = cefr;
    document.getElementById("diag-level-title").textContent = copy.title;
    document.getElementById("diag-level-desc").textContent = copy.desc;
    document.getElementById("diag-score").textContent = `${pct}%（${correct}/${total}）`;
    document.getElementById("diag-advice").innerHTML =
      `<strong>おすすめの次の一歩</strong>${escapeHtml(copy.advice)}`;

    const skills = ["grammar", "vocab", "compose", "reading"];
    const bars = document.getElementById("diag-skills");
    bars.innerHTML = skills
      .map((skill) => {
        const subset = d.results.filter((r) => r.skill === skill);
        if (!subset.length) return "";
        const ok = subset.filter((r) => r.ok).length;
        const sp = Math.round((ok / subset.length) * 100);
        return `<div class="skill-row">
          <span>${SKILL_LABELS[skill]}</span>
          <div class="bar"><i data-w="${sp}"></i></div>
          <span class="pct">${sp}%</span>
        </div>`;
      })
      .join("");

    requestAnimationFrame(() => {
      bars.querySelectorAll("i[data-w]").forEach((el) => {
        el.style.width = `${el.getAttribute("data-w")}%`;
      });
    });

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          cefr,
          score: pct,
          date: new Date().toLocaleDateString("ja-JP"),
        })
      );
    } catch (_) {
      /* ignore */
    }
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function render() {
    switch (state.route) {
      case "home":
        renderHome();
        break;
      case "compose":
        renderComposeSetup();
        break;
      case "compose-play":
        renderComposePlay();
        break;
      case "compose-result":
        renderComposeResult();
        break;
      case "diagnosis":
        renderDiagnosisIntro();
        break;
      case "diagnosis-play":
        renderDiagnosisPlay();
        break;
      case "diagnosis-result":
        renderDiagnosisResult();
        break;
      default:
        renderHome();
    }
  }

  document.getElementById("nav-home").addEventListener("click", () => setRoute("home"));
  document.querySelectorAll(".topnav [data-route]").forEach((btn) => {
    btn.addEventListener("click", () => setRoute(btn.getAttribute("data-route")));
  });

  render();
})();
