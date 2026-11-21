/* ============ 瑞士网格 — 逻辑 ============ */
"use strict";

const ITEMS = [
  { id:"reverse", name:"倒序文本",   desc:"REVERSE — 字符与词序反转" },
  { id:"freq",    name:"字频统计",   desc:"FREQUENCY — 出现最多的字" },
  { id:"datespan",name:"日期间隔",   desc:"DATE SPAN — 两日期间的一切数字" },
  { id:"seq",     name:"数列生成",   desc:"SEQUENCE — 等差与等比" },
  { id:"roman",   name:"罗马数字",   desc:"ROMAN — 与阿拉伯数字互转" },
];

/* ---------- 目录 ---------- */
const list = document.getElementById("sgList");
ITEMS.forEach((it, i) => {
  const b = document.createElement("button");
  b.className = "sg-item";
  b.innerHTML = `
    <span class="sg-no">${String(i + 1).padStart(2, "0")}</span>
    <span class="sg-itemtext">
      <span class="sg-item-name">${it.name}</span>
      <span class="sg-item-desc">${it.desc}</span>
    </span>
    <span class="sg-arrow">→</span>`;
  b.addEventListener("click", () => openPanel(it));
  list.appendChild(b);
});

/* ---------- 面板 ---------- */
const panel = document.getElementById("sgPanel");
const ptitle = document.getElementById("sgPtitle");
const pbody = document.getElementById("sgBody");

function openPanel(it) {
  ptitle.textContent = it.name;
  pbody.innerHTML = "";
  RENDER[it.id](pbody);
  panel.hidden = false;
  document.body.style.overflow = "hidden";
}
document.getElementById("sgClose").addEventListener("click", closePanel);
function closePanel() {
  panel.hidden = true;
  document.body.style.overflow = "";
}
document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) closePanel(); });

/* ---------- 控件工厂 ---------- */
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
function field(grid, text, input, full) {
  const f = el("div", "sg-field" + (full ? " full" : ""));
  f.append(el("label", "", text), input);
  grid.appendChild(f);
}
function sgInput(val, ph) {
  const i = el("input", "sg-input");
  i.type = "text"; i.value = val;
  if (ph) i.placeholder = ph;
  return i;
}
function sgSelect(items, idx) {
  const s = el("select", "sg-select");
  items.forEach(([v, l], i) => {
    const o = el("option", "", l);
    o.value = v;
    if (i === idx) o.selected = true;
    s.appendChild(o);
  });
  return s;
}
function sgBtn(text, ghost) { return el("button", "sg-btn" + (ghost ? " ghost" : ""), text); }
function result(body) {
  const r = el("div", "sg-result", "—");
  body.appendChild(r);
  return r;
}

const RENDER = {};

/* ---------- 倒序文本 ---------- */
RENDER.reverse = body => {
  const grid = el("div", "sg-grid");
  const ta = el("textarea", "sg-textarea");
  ta.value = "瑞士网格 Swiss Grid";
  field(grid, "输入文本", ta, true);
  body.appendChild(grid);
  const acts = el("div", "sg-actions");
  const b1 = sgBtn("字符倒序");
  const b2 = sgBtn("词序倒序", true);
  acts.append(b1, b2);
  body.appendChild(acts);
  const out = result(body);
  b1.addEventListener("click", () => {
    out.innerHTML = `<span class="val">${ta.value.split("").reverse().join("")}</span>共 ${ta.value.length} 个字符`;
  });
  b2.addEventListener("click", () => {
    out.innerHTML = `<span class="val">${ta.value.split(/\s+/).reverse().join(" ")}</span>共 ${ta.value.trim().split(/\s+/).length} 个词`;
  });
  b1.click();
};

/* ---------- 字频统计 ---------- */
RENDER.freq = body => {
  const grid = el("div", "sg-grid");
  const ta = el("textarea", "sg-textarea");
  ta.value = "设计是把复杂的问题变简单，把简单的问题变优雅。";
  field(grid, "粘贴文本", ta, true);
  body.appendChild(grid);
  const out = result(body);
  function stat() {
    const t = ta.value;
    if (!t.trim()) { out.textContent = "输入文本后自动统计"; return; }
    const map = {};
    for (const ch of t) {
      if (/\s/.test(ch)) continue;
      map[ch] = (map[ch] || 0) + 1;
    }
    const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const bars = sorted.slice(0, 10).map(([ch, n]) => {
      const pct = n / sorted[0][1] * 100;
      return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:6px">
        <span style="width:34px;font-weight:700">${ch.replace("<", "&lt;")}</span>
        <span style="width:44px;text-align:right">${n}</span>
        <span style="height:12px;background:#111;flex:0 0 ${pct.toFixed(0)}%"></span>
      </div>`;
    }).join("");
    out.innerHTML =
      `<span class="val">「${sorted[0][0].replace("<", "&lt;")}」 × ${sorted[0][1]}</span>` +
      `不重复字符 ${sorted.length} 种 · 总字符 ${t.replace(/\s/g, "").length}<br><br>${bars}`;
  }
  ta.addEventListener("input", stat);
  stat();
};

/* ---------- 日期间隔 ---------- */
RENDER.datespan = body => {
  const grid = el("div", "sg-grid");
  const d1 = el("input", "sg-input");
  d1.type = "date";
  const d2 = el("input", "sg-input");
  d2.type = "date";
  const today = new Date().toISOString().slice(0, 10);
  d1.value = today;
  d2.value = "2027-01-01";
  field(grid, "起始日期", d1);
  field(grid, "结束日期", d2);
  body.appendChild(grid);
  const out = result(body);
  function calc() {
    if (!d1.value || !d2.value) { out.textContent = "选择两个日期"; return; }
    const a = new Date(d1.value + "T00:00:00");
    const b = new Date(d2.value + "T00:00:00");
    const days = Math.abs(Math.round((b - a) / 864e5));
    const weeks = (days / 7).toFixed(1);
    const months = Math.abs((b.getFullYear() - a.getFullYear()) * 12 + b.getMonth() - a.getMonth());
    out.innerHTML =
      `<span class="val">${days.toLocaleString()} 天</span>` +
      `${weeks} 周 · 约 ${months} 个月 · ${(days / 365.2425).toFixed(2)} 年<br>` +
      `工作日约 ${Math.round(days * 5 / 7)} 天 · 周末约 ${days - Math.round(days * 5 / 7)} 天`;
  }
  [d1, d2].forEach(x => x.addEventListener("input", calc));
  calc();
};

/* ---------- 数列生成 ---------- */
RENDER.seq = body => {
  const grid = el("div", "sg-grid");
  const first = sgInput("2");
  const step = sgInput("3");
  const count = sgInput("8");
  const kind = sgSelect([["ari","等差数列"],["geo","等比数列"]], 0);
  field(grid, "首项 a₁", first);
  field(grid, kind.value === "ari" ? "公差 d" : "公比 r", step);
  field(grid, "项数 n", count);
  field(grid, "类型", kind);
  body.appendChild(grid);
  const acts = el("div", "sg-actions");
  const go = sgBtn("生成数列");
  acts.appendChild(go);
  body.appendChild(acts);
  const out = result(body);
  kind.addEventListener("change", () => {
    step.parentElement.querySelector("label").childNodes[1].textContent =
      kind.value === "ari" ? " 公差 d" : " 公比 r";
  });
  go.addEventListener("click", () => {
    const a1 = parseFloat(first.value);
    const d = parseFloat(step.value);
    const n = Math.min(50, Math.max(1, parseInt(count.value) || 1));
    if (isNaN(a1) || isNaN(d)) { out.textContent = "填齐首项与公差/公比"; return; }
    const seq = [a1];
    for (let i = 1; i < n; i++) {
      seq.push(kind.value === "ari" ? seq[i - 1] + d : seq[i - 1] * d);
    }
    const sum = kind.value === "ari"
      ? n * (a1 + seq[n - 1]) / 2
      : (Math.abs(d) === 1 ? null : a1 * (Math.pow(d, n) - 1) / (d - 1));
    out.innerHTML =
      `<span class="val">${seq.map(v => +v.toPrecision(8)).join(", ")}</span>` +
      `末项 a${n} ＝ ${+seq[n - 1].toPrecision(8)}<br>` +
      (sum !== null ? `前 ${n} 项和 S${n} ＝ <span class="red">${+sum.toPrecision(10)}</span>` : "公比为 1 时和 ＝ " + (a1 * n));
  });
  go.click();
};

/* ---------- 罗马数字 ---------- */
RENDER.roman = body => {
  const grid = el("div", "sg-grid");
  const inp = sgInput("2026");
  const dir = sgSelect([["toR","数字 → 罗马字"],["toN","罗马字 → 数字"]], 0);
  field(grid, "输入", inp);
  field(grid, "方向", dir);
  body.appendChild(grid);
  const out = result(body);
  const V = [[1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
             [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
  function toRoman(n) {
    if (!(n >= 1 && n <= 3999)) return null;
    let s = "";
    for (const [v, r] of V) while (n >= v) { s += r; n -= v; }
    return s;
  }
  function fromRoman(s) {
    const M = { I:1, V:5, X:10, L:50, C:100, D:500, M:1000 };
    let n = 0;
    for (let i = 0; i < s.length; i++) {
      const c = M[s[i]], nx = M[s[i + 1]];
      if (!c) return null;
      n += nx && c < nx ? -c : c;
    }
    return n;
  }
  function run() {
    const v = inp.value.trim().toUpperCase();
    if (!v) { out.textContent = "输入内容"; return; }
    if (dir.value === "toR") {
      const n = parseInt(v);
      const r = toRoman(n);
      if (!r) { out.textContent = "范围 1 ~ 3999"; return; }
      out.innerHTML = `<span class="val">${r}</span>${n} ＝ ${r}`;
    } else {
      const n = fromRoman(v);
      if (!n || n < 1) { out.textContent = "不是合法的罗马数字"; return; }
      out.innerHTML = `<span class="val">${n}</span>${v} ＝ ${n}（再转回去：${toRoman(n)}）`;
    }
  }
  inp.addEventListener("input", run);
  dir.addEventListener("change", run);
  run();
};
