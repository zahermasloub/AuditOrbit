import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const tokensPath = path.join(root, "web", "design", "tokens.json");
const cssPath = path.join(root, "web", "app", "tokens.css");

function val(branch, key) {
  return branch?.[key]?.value ?? "";
}

function hexToRgbString(hex) {
  const value = hex.replace(/^#/, "");
  if (value.length !== 3 && value.length !== 6) {
    return hex;
  }
  const chunkSize = value.length === 3 ? 1 : 2;
  const channels = [];
  for (let i = 0; i < value.length; i += chunkSize) {
    const chunk = value.slice(i, i + chunkSize);
    const normalized = chunkSize === 1 ? chunk + chunk : chunk;
    channels.push(parseInt(normalized, 16));
  }
  return channels.join(" ");
}

function hslToRgbString(input) {
  const match = input.match(/hsl\s*\(([^)]+)\)/i);
  if (!match) {
    return input;
  }
  const [hRaw, sRaw, lRaw] = match[1].trim().split(/\s+/);
  const h = parseFloat(hRaw);
  const s = parseFloat((sRaw ?? "").replace("%", "")) / 100;
  const l = parseFloat((lRaw ?? "").replace("%", "")) / 100;
  if (Number.isNaN(h) || Number.isNaN(s) || Number.isNaN(l)) {
    return input;
  }
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = (h / 60) % 6;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hPrime >= 0 && hPrime < 1) {
    r1 = c;
    g1 = x;
  } else if (hPrime >= 1 && hPrime < 2) {
    r1 = x;
    g1 = c;
  } else if (hPrime >= 2 && hPrime < 3) {
    g1 = c;
    b1 = x;
  } else if (hPrime >= 3 && hPrime < 4) {
    g1 = x;
    b1 = c;
  } else if (hPrime >= 4 && hPrime < 5) {
    r1 = x;
    b1 = c;
  } else {
    r1 = c;
    b1 = x;
  }
  const m = l - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  return `${r} ${g} ${b}`;
}

function normalizeColor(raw) {
  const value = (raw ?? "").trim();
  if (!value) {
    return "";
  }
  if (value.startsWith("#")) {
    return hexToRgbString(value);
  }
  if (value.toLowerCase().startsWith("hsl")) {
    return hslToRgbString(value);
  }
  if (value.toLowerCase().startsWith("rgb")) {
    return value
      .slice(value.indexOf("(") + 1, value.lastIndexOf(")"))
      .replace(/,/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  return value;
}

const rawTokens = fs.readFileSync(tokensPath, "utf8");
const tokens = JSON.parse(rawTokens);
const light = tokens?.theme?.light?.color ?? {};
const dark = tokens?.theme?.dark?.color ?? {};
const radius = tokens?.radius ?? {};
const shadow = tokens?.shadow ?? {};
const typography = tokens?.typography ?? {};
const motion = tokens?.motion ?? {};
const fontFamily = typography?.fontFamily ?? {};

let css = fs.readFileSync(cssPath, "utf8");
css = css
  .replace("#{bg}", normalizeColor(val(light, "bg")))
  .replace("#{fg}", normalizeColor(val(light, "fg")))
  .replace("#{muted}", normalizeColor(val(light, "muted")))
  .replace("#{border}", normalizeColor(val(light, "border")))
  .replace("#{card}", normalizeColor(val(light, "card")))
  .replace("#{primary}", normalizeColor(val(light, "primary")))
  .replace("#{success}", normalizeColor(val(light, "success")))
  .replace("#{warning}", normalizeColor(val(light, "warning")))
  .replace("#{danger}", normalizeColor(val(light, "danger")))
  .replace("#{ring}", normalizeColor(val(light, "ring")))
  .replace("#{bg_d}", normalizeColor(val(dark, "bg")))
  .replace("#{fg_d}", normalizeColor(val(dark, "fg")))
  .replace("#{muted_d}", normalizeColor(val(dark, "muted")))
  .replace("#{border_d}", normalizeColor(val(dark, "border")))
  .replace("#{card_d}", normalizeColor(val(dark, "card")))
  .replace("#{primary_d}", normalizeColor(val(dark, "primary")))
  .replace("#{success_d}", normalizeColor(val(dark, "success")))
  .replace("#{warning_d}", normalizeColor(val(dark, "warning")))
  .replace("#{danger_d}", normalizeColor(val(dark, "danger")))
  .replace("#{ring_d}", normalizeColor(val(dark, "ring")))
  .replace("#{r_xs}", radius?.xs?.value ?? "")
  .replace("#{r_sm}", radius?.sm?.value ?? "")
  .replace("#{r_md}", radius?.md?.value ?? "")
  .replace("#{r_lg}", radius?.lg?.value ?? "")
  .replace("#{r_xl}", radius?.xl?.value ?? "")
  .replace("#{r_2xl}", radius?.["2xl"]?.value ?? "")
  .replace("#{sh_sm}", shadow?.sm?.value ?? "")
  .replace("#{sh_md}", shadow?.md?.value ?? "")
  .replace("#{sh_lg}", shadow?.lg?.value ?? "")
  .replace("#{focusRing}", motion?.focusRing?.value ?? "")
  .replace("#{font_ui}", fontFamily?.ui?.value ?? "")
  .replace("#{font_mono}", fontFamily?.mono?.value ?? "");

fs.writeFileSync(cssPath, css);
console.log("tokens.css generated from tokens.json");
