var _t = Object.defineProperty;
var zt = (o, n, t) => n in o ? _t(o, n, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[n] = t;
var h = (o, n, t) => zt(o, typeof n != "symbol" ? n + "" : n, t);
var Ht = function() {
  return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
}, Ct = {}, T = {};
let ct;
const xt = [
  0,
  // Not used
  26,
  44,
  70,
  100,
  134,
  172,
  196,
  242,
  292,
  346,
  404,
  466,
  532,
  581,
  655,
  733,
  815,
  901,
  991,
  1085,
  1156,
  1258,
  1364,
  1474,
  1588,
  1706,
  1828,
  1921,
  2051,
  2185,
  2323,
  2465,
  2611,
  2761,
  2876,
  3034,
  3196,
  3362,
  3532,
  3706
];
T.getSymbolSize = function(n) {
  if (!n) throw new Error('"version" cannot be null or undefined');
  if (n < 1 || n > 40) throw new Error('"version" should be in range from 1 to 40');
  return n * 4 + 17;
};
T.getSymbolTotalCodewords = function(n) {
  return xt[n];
};
T.getBCHDigit = function(o) {
  let n = 0;
  for (; o !== 0; )
    n++, o >>>= 1;
  return n;
};
T.setToSJISFunction = function(n) {
  if (typeof n != "function")
    throw new Error('"toSJISFunc" is not a valid function.');
  ct = n;
};
T.isKanjiModeEnabled = function() {
  return typeof ct < "u";
};
T.toSJIS = function(n) {
  return ct(n);
};
var V = {};
(function(o) {
  o.L = { bit: 1 }, o.M = { bit: 0 }, o.Q = { bit: 3 }, o.H = { bit: 2 };
  function n(t) {
    if (typeof t != "string")
      throw new Error("Param is not a string");
    switch (t.toLowerCase()) {
      case "l":
      case "low":
        return o.L;
      case "m":
      case "medium":
        return o.M;
      case "q":
      case "quartile":
        return o.Q;
      case "h":
      case "high":
        return o.H;
      default:
        throw new Error("Unknown EC Level: " + t);
    }
  }
  o.isValid = function(e) {
    return e && typeof e.bit < "u" && e.bit >= 0 && e.bit < 4;
  }, o.from = function(e, i) {
    if (o.isValid(e))
      return e;
    try {
      return n(e);
    } catch {
      return i;
    }
  };
})(V);
function wt() {
  this.buffer = [], this.length = 0;
}
wt.prototype = {
  get: function(o) {
    const n = Math.floor(o / 8);
    return (this.buffer[n] >>> 7 - o % 8 & 1) === 1;
  },
  put: function(o, n) {
    for (let t = 0; t < n; t++)
      this.putBit((o >>> n - t - 1 & 1) === 1);
  },
  getLengthInBits: function() {
    return this.length;
  },
  putBit: function(o) {
    const n = Math.floor(this.length / 8);
    this.buffer.length <= n && this.buffer.push(0), o && (this.buffer[n] |= 128 >>> this.length % 8), this.length++;
  }
};
var Ot = wt;
function H(o) {
  if (!o || o < 1)
    throw new Error("BitMatrix size must be defined and greater than 0");
  this.size = o, this.data = new Uint8Array(o * o), this.reservedBit = new Uint8Array(o * o);
}
H.prototype.set = function(o, n, t, e) {
  const i = o * this.size + n;
  this.data[i] = t, e && (this.reservedBit[i] = !0);
};
H.prototype.get = function(o, n) {
  return this.data[o * this.size + n];
};
H.prototype.xor = function(o, n, t) {
  this.data[o * this.size + n] ^= t;
};
H.prototype.isReserved = function(o, n) {
  return this.reservedBit[o * this.size + n];
};
var qt = H, yt = {};
(function(o) {
  const n = T.getSymbolSize;
  o.getRowColCoords = function(e) {
    if (e === 1) return [];
    const i = Math.floor(e / 7) + 2, r = n(e), s = r === 145 ? 26 : Math.ceil((r - 13) / (2 * i - 2)) * 2, c = [r - 7];
    for (let a = 1; a < i - 1; a++)
      c[a] = c[a - 1] - s;
    return c.push(6), c.reverse();
  }, o.getPositions = function(e) {
    const i = [], r = o.getRowColCoords(e), s = r.length;
    for (let c = 0; c < s; c++)
      for (let a = 0; a < s; a++)
        c === 0 && a === 0 || // top-left
        c === 0 && a === s - 1 || // bottom-left
        c === s - 1 && a === 0 || i.push([r[c], r[a]]);
    return i;
  };
})(yt);
var bt = {};
const Jt = T.getSymbolSize, dt = 7;
bt.getPositions = function(n) {
  const t = Jt(n);
  return [
    // top-left
    [0, 0],
    // top-right
    [t - dt, 0],
    // bottom-left
    [0, t - dt]
  ];
};
var St = {};
(function(o) {
  o.Patterns = {
    PATTERN000: 0,
    PATTERN001: 1,
    PATTERN010: 2,
    PATTERN011: 3,
    PATTERN100: 4,
    PATTERN101: 5,
    PATTERN110: 6,
    PATTERN111: 7
  };
  const n = {
    N1: 3,
    N2: 3,
    N3: 40,
    N4: 10
  };
  o.isValid = function(i) {
    return i != null && i !== "" && !isNaN(i) && i >= 0 && i <= 7;
  }, o.from = function(i) {
    return o.isValid(i) ? parseInt(i, 10) : void 0;
  }, o.getPenaltyN1 = function(i) {
    const r = i.size;
    let s = 0, c = 0, a = 0, l = null, u = null;
    for (let C = 0; C < r; C++) {
      c = a = 0, l = u = null;
      for (let f = 0; f < r; f++) {
        let d = i.get(C, f);
        d === l ? c++ : (c >= 5 && (s += n.N1 + (c - 5)), l = d, c = 1), d = i.get(f, C), d === u ? a++ : (a >= 5 && (s += n.N1 + (a - 5)), u = d, a = 1);
      }
      c >= 5 && (s += n.N1 + (c - 5)), a >= 5 && (s += n.N1 + (a - 5));
    }
    return s;
  }, o.getPenaltyN2 = function(i) {
    const r = i.size;
    let s = 0;
    for (let c = 0; c < r - 1; c++)
      for (let a = 0; a < r - 1; a++) {
        const l = i.get(c, a) + i.get(c, a + 1) + i.get(c + 1, a) + i.get(c + 1, a + 1);
        (l === 4 || l === 0) && s++;
      }
    return s * n.N2;
  }, o.getPenaltyN3 = function(i) {
    const r = i.size;
    let s = 0, c = 0, a = 0;
    for (let l = 0; l < r; l++) {
      c = a = 0;
      for (let u = 0; u < r; u++)
        c = c << 1 & 2047 | i.get(l, u), u >= 10 && (c === 1488 || c === 93) && s++, a = a << 1 & 2047 | i.get(u, l), u >= 10 && (a === 1488 || a === 93) && s++;
    }
    return s * n.N3;
  }, o.getPenaltyN4 = function(i) {
    let r = 0;
    const s = i.data.length;
    for (let a = 0; a < s; a++) r += i.data[a];
    return Math.abs(Math.ceil(r * 100 / s / 5) - 10) * n.N4;
  };
  function t(e, i, r) {
    switch (e) {
      case o.Patterns.PATTERN000:
        return (i + r) % 2 === 0;
      case o.Patterns.PATTERN001:
        return i % 2 === 0;
      case o.Patterns.PATTERN010:
        return r % 3 === 0;
      case o.Patterns.PATTERN011:
        return (i + r) % 3 === 0;
      case o.Patterns.PATTERN100:
        return (Math.floor(i / 2) + Math.floor(r / 3)) % 2 === 0;
      case o.Patterns.PATTERN101:
        return i * r % 2 + i * r % 3 === 0;
      case o.Patterns.PATTERN110:
        return (i * r % 2 + i * r % 3) % 2 === 0;
      case o.Patterns.PATTERN111:
        return (i * r % 3 + (i + r) % 2) % 2 === 0;
      default:
        throw new Error("bad maskPattern:" + e);
    }
  }
  o.applyMask = function(i, r) {
    const s = r.size;
    for (let c = 0; c < s; c++)
      for (let a = 0; a < s; a++)
        r.isReserved(a, c) || r.xor(a, c, t(i, a, c));
  }, o.getBestMask = function(i, r) {
    const s = Object.keys(o.Patterns).length;
    let c = 0, a = 1 / 0;
    for (let l = 0; l < s; l++) {
      r(l), o.applyMask(l, i);
      const u = o.getPenaltyN1(i) + o.getPenaltyN2(i) + o.getPenaltyN3(i) + o.getPenaltyN4(i);
      o.applyMask(l, i), u < a && (a = u, c = l);
    }
    return c;
  };
})(St);
var j = {};
const N = V, q = [
  // L  M  Q  H
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  2,
  2,
  1,
  2,
  2,
  4,
  1,
  2,
  4,
  4,
  2,
  4,
  4,
  4,
  2,
  4,
  6,
  5,
  2,
  4,
  6,
  6,
  2,
  5,
  8,
  8,
  4,
  5,
  8,
  8,
  4,
  5,
  8,
  11,
  4,
  8,
  10,
  11,
  4,
  9,
  12,
  16,
  4,
  9,
  16,
  16,
  6,
  10,
  12,
  18,
  6,
  10,
  17,
  16,
  6,
  11,
  16,
  19,
  6,
  13,
  18,
  21,
  7,
  14,
  21,
  25,
  8,
  16,
  20,
  25,
  8,
  17,
  23,
  25,
  9,
  17,
  23,
  34,
  9,
  18,
  25,
  30,
  10,
  20,
  27,
  32,
  12,
  21,
  29,
  35,
  12,
  23,
  34,
  37,
  12,
  25,
  34,
  40,
  13,
  26,
  35,
  42,
  14,
  28,
  38,
  45,
  15,
  29,
  40,
  48,
  16,
  31,
  43,
  51,
  17,
  33,
  45,
  54,
  18,
  35,
  48,
  57,
  19,
  37,
  51,
  60,
  19,
  38,
  53,
  63,
  20,
  40,
  56,
  66,
  21,
  43,
  59,
  70,
  22,
  45,
  62,
  74,
  24,
  47,
  65,
  77,
  25,
  49,
  68,
  81
], J = [
  // L  M  Q  H
  7,
  10,
  13,
  17,
  10,
  16,
  22,
  28,
  15,
  26,
  36,
  44,
  20,
  36,
  52,
  64,
  26,
  48,
  72,
  88,
  36,
  64,
  96,
  112,
  40,
  72,
  108,
  130,
  48,
  88,
  132,
  156,
  60,
  110,
  160,
  192,
  72,
  130,
  192,
  224,
  80,
  150,
  224,
  264,
  96,
  176,
  260,
  308,
  104,
  198,
  288,
  352,
  120,
  216,
  320,
  384,
  132,
  240,
  360,
  432,
  144,
  280,
  408,
  480,
  168,
  308,
  448,
  532,
  180,
  338,
  504,
  588,
  196,
  364,
  546,
  650,
  224,
  416,
  600,
  700,
  224,
  442,
  644,
  750,
  252,
  476,
  690,
  816,
  270,
  504,
  750,
  900,
  300,
  560,
  810,
  960,
  312,
  588,
  870,
  1050,
  336,
  644,
  952,
  1110,
  360,
  700,
  1020,
  1200,
  390,
  728,
  1050,
  1260,
  420,
  784,
  1140,
  1350,
  450,
  812,
  1200,
  1440,
  480,
  868,
  1290,
  1530,
  510,
  924,
  1350,
  1620,
  540,
  980,
  1440,
  1710,
  570,
  1036,
  1530,
  1800,
  570,
  1064,
  1590,
  1890,
  600,
  1120,
  1680,
  1980,
  630,
  1204,
  1770,
  2100,
  660,
  1260,
  1860,
  2220,
  720,
  1316,
  1950,
  2310,
  750,
  1372,
  2040,
  2430
];
j.getBlocksCount = function(n, t) {
  switch (t) {
    case N.L:
      return q[(n - 1) * 4 + 0];
    case N.M:
      return q[(n - 1) * 4 + 1];
    case N.Q:
      return q[(n - 1) * 4 + 2];
    case N.H:
      return q[(n - 1) * 4 + 3];
    default:
      return;
  }
};
j.getTotalCodewordsCount = function(n, t) {
  switch (t) {
    case N.L:
      return J[(n - 1) * 4 + 0];
    case N.M:
      return J[(n - 1) * 4 + 1];
    case N.Q:
      return J[(n - 1) * 4 + 2];
    case N.H:
      return J[(n - 1) * 4 + 3];
    default:
      return;
  }
};
var Et = {}, Y = {};
const _ = new Uint8Array(512), K = new Uint8Array(256);
(function() {
  let n = 1;
  for (let t = 0; t < 255; t++)
    _[t] = n, K[n] = t, n <<= 1, n & 256 && (n ^= 285);
  for (let t = 255; t < 512; t++)
    _[t] = _[t - 255];
})();
Y.log = function(n) {
  if (n < 1) throw new Error("log(" + n + ")");
  return K[n];
};
Y.exp = function(n) {
  return _[n];
};
Y.mul = function(n, t) {
  return n === 0 || t === 0 ? 0 : _[K[n] + K[t]];
};
(function(o) {
  const n = Y;
  o.mul = function(e, i) {
    const r = new Uint8Array(e.length + i.length - 1);
    for (let s = 0; s < e.length; s++)
      for (let c = 0; c < i.length; c++)
        r[s + c] ^= n.mul(e[s], i[c]);
    return r;
  }, o.mod = function(e, i) {
    let r = new Uint8Array(e);
    for (; r.length - i.length >= 0; ) {
      const s = r[0];
      for (let a = 0; a < i.length; a++)
        r[a] ^= n.mul(i[a], s);
      let c = 0;
      for (; c < r.length && r[c] === 0; ) c++;
      r = r.slice(c);
    }
    return r;
  }, o.generateECPolynomial = function(e) {
    let i = new Uint8Array([1]);
    for (let r = 0; r < e; r++)
      i = o.mul(i, new Uint8Array([1, n.exp(r)]));
    return i;
  };
})(Et);
const It = Et;
function lt(o) {
  this.genPoly = void 0, this.degree = o, this.degree && this.initialize(this.degree);
}
lt.prototype.initialize = function(n) {
  this.degree = n, this.genPoly = It.generateECPolynomial(this.degree);
};
lt.prototype.encode = function(n) {
  if (!this.genPoly)
    throw new Error("Encoder not initialized");
  const t = new Uint8Array(n.length + this.degree);
  t.set(n);
  const e = It.mod(t, this.genPoly), i = this.degree - e.length;
  if (i > 0) {
    const r = new Uint8Array(this.degree);
    return r.set(e, i), r;
  }
  return e;
};
var Kt = lt, Ft = {}, v = {}, ht = {};
ht.isValid = function(n) {
  return !isNaN(n) && n >= 1 && n <= 40;
};
var B = {};
const Tt = "[0-9]+", Gt = "[A-Z $%*+\\-./:]+";
let z = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
z = z.replace(/u/g, "\\u");
const Vt = "(?:(?![A-Z0-9 $%*+\\-./:]|" + z + `)(?:.|[\r
]))+`;
B.KANJI = new RegExp(z, "g");
B.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
B.BYTE = new RegExp(Vt, "g");
B.NUMERIC = new RegExp(Tt, "g");
B.ALPHANUMERIC = new RegExp(Gt, "g");
const jt = new RegExp("^" + z + "$"), Yt = new RegExp("^" + Tt + "$"), Qt = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
B.testKanji = function(n) {
  return jt.test(n);
};
B.testNumeric = function(n) {
  return Yt.test(n);
};
B.testAlphanumeric = function(n) {
  return Qt.test(n);
};
(function(o) {
  const n = ht, t = B;
  o.NUMERIC = {
    id: "Numeric",
    bit: 1,
    ccBits: [10, 12, 14]
  }, o.ALPHANUMERIC = {
    id: "Alphanumeric",
    bit: 2,
    ccBits: [9, 11, 13]
  }, o.BYTE = {
    id: "Byte",
    bit: 4,
    ccBits: [8, 16, 16]
  }, o.KANJI = {
    id: "Kanji",
    bit: 8,
    ccBits: [8, 10, 12]
  }, o.MIXED = {
    bit: -1
  }, o.getCharCountIndicator = function(r, s) {
    if (!r.ccBits) throw new Error("Invalid mode: " + r);
    if (!n.isValid(s))
      throw new Error("Invalid version: " + s);
    return s >= 1 && s < 10 ? r.ccBits[0] : s < 27 ? r.ccBits[1] : r.ccBits[2];
  }, o.getBestModeForData = function(r) {
    return t.testNumeric(r) ? o.NUMERIC : t.testAlphanumeric(r) ? o.ALPHANUMERIC : t.testKanji(r) ? o.KANJI : o.BYTE;
  }, o.toString = function(r) {
    if (r && r.id) return r.id;
    throw new Error("Invalid mode");
  }, o.isValid = function(r) {
    return r && r.bit && r.ccBits;
  };
  function e(i) {
    if (typeof i != "string")
      throw new Error("Param is not a string");
    switch (i.toLowerCase()) {
      case "numeric":
        return o.NUMERIC;
      case "alphanumeric":
        return o.ALPHANUMERIC;
      case "kanji":
        return o.KANJI;
      case "byte":
        return o.BYTE;
      default:
        throw new Error("Unknown mode: " + i);
    }
  }
  o.from = function(r, s) {
    if (o.isValid(r))
      return r;
    try {
      return e(r);
    } catch {
      return s;
    }
  };
})(v);
(function(o) {
  const n = T, t = j, e = V, i = v, r = ht, s = 7973, c = n.getBCHDigit(s);
  function a(f, d, y) {
    for (let w = 1; w <= 40; w++)
      if (d <= o.getCapacity(w, y, f))
        return w;
  }
  function l(f, d) {
    return i.getCharCountIndicator(f, d) + 4;
  }
  function u(f, d) {
    let y = 0;
    return f.forEach(function(w) {
      const I = l(w.mode, d);
      y += I + w.getBitsLength();
    }), y;
  }
  function C(f, d) {
    for (let y = 1; y <= 40; y++)
      if (u(f, y) <= o.getCapacity(y, d, i.MIXED))
        return y;
  }
  o.from = function(d, y) {
    return r.isValid(d) ? parseInt(d, 10) : y;
  }, o.getCapacity = function(d, y, w) {
    if (!r.isValid(d))
      throw new Error("Invalid QR Code version");
    typeof w > "u" && (w = i.BYTE);
    const I = n.getSymbolTotalCodewords(d), p = t.getTotalCodewordsCount(d, y), b = (I - p) * 8;
    if (w === i.MIXED) return b;
    const m = b - l(w, d);
    switch (w) {
      case i.NUMERIC:
        return Math.floor(m / 10 * 3);
      case i.ALPHANUMERIC:
        return Math.floor(m / 11 * 2);
      case i.KANJI:
        return Math.floor(m / 13);
      case i.BYTE:
      default:
        return Math.floor(m / 8);
    }
  }, o.getBestVersionForData = function(d, y) {
    let w;
    const I = e.from(y, e.M);
    if (Array.isArray(d)) {
      if (d.length > 1)
        return C(d, I);
      if (d.length === 0)
        return 1;
      w = d[0];
    } else
      w = d;
    return a(w.mode, w.getLength(), I);
  }, o.getEncodedBits = function(d) {
    if (!r.isValid(d) || d < 7)
      throw new Error("Invalid QR Code version");
    let y = d << 12;
    for (; n.getBCHDigit(y) - c >= 0; )
      y ^= s << n.getBCHDigit(y) - c;
    return d << 12 | y;
  };
})(Ft);
var At = {};
const ot = T, Pt = 1335, Wt = 21522, gt = ot.getBCHDigit(Pt);
At.getEncodedBits = function(n, t) {
  const e = n.bit << 3 | t;
  let i = e << 10;
  for (; ot.getBCHDigit(i) - gt >= 0; )
    i ^= Pt << ot.getBCHDigit(i) - gt;
  return (e << 10 | i) ^ Wt;
};
var Bt = {};
const Zt = v;
function D(o) {
  this.mode = Zt.NUMERIC, this.data = o.toString();
}
D.getBitsLength = function(n) {
  return 10 * Math.floor(n / 3) + (n % 3 ? n % 3 * 3 + 1 : 0);
};
D.prototype.getLength = function() {
  return this.data.length;
};
D.prototype.getBitsLength = function() {
  return D.getBitsLength(this.data.length);
};
D.prototype.write = function(n) {
  let t, e, i;
  for (t = 0; t + 3 <= this.data.length; t += 3)
    e = this.data.substr(t, 3), i = parseInt(e, 10), n.put(i, 10);
  const r = this.data.length - t;
  r > 0 && (e = this.data.substr(t), i = parseInt(e, 10), n.put(i, r * 3 + 1));
};
var Xt = D;
const te = v, Z = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  " ",
  "$",
  "%",
  "*",
  "+",
  "-",
  ".",
  "/",
  ":"
];
function k(o) {
  this.mode = te.ALPHANUMERIC, this.data = o;
}
k.getBitsLength = function(n) {
  return 11 * Math.floor(n / 2) + 6 * (n % 2);
};
k.prototype.getLength = function() {
  return this.data.length;
};
k.prototype.getBitsLength = function() {
  return k.getBitsLength(this.data.length);
};
k.prototype.write = function(n) {
  let t;
  for (t = 0; t + 2 <= this.data.length; t += 2) {
    let e = Z.indexOf(this.data[t]) * 45;
    e += Z.indexOf(this.data[t + 1]), n.put(e, 11);
  }
  this.data.length % 2 && n.put(Z.indexOf(this.data[t]), 6);
};
var ee = k;
const ne = v;
function R(o) {
  this.mode = ne.BYTE, typeof o == "string" ? this.data = new TextEncoder().encode(o) : this.data = new Uint8Array(o);
}
R.getBitsLength = function(n) {
  return n * 8;
};
R.prototype.getLength = function() {
  return this.data.length;
};
R.prototype.getBitsLength = function() {
  return R.getBitsLength(this.data.length);
};
R.prototype.write = function(o) {
  for (let n = 0, t = this.data.length; n < t; n++)
    o.put(this.data[n], 8);
};
var oe = R;
const ie = v, re = T;
function U(o) {
  this.mode = ie.KANJI, this.data = o;
}
U.getBitsLength = function(n) {
  return n * 13;
};
U.prototype.getLength = function() {
  return this.data.length;
};
U.prototype.getBitsLength = function() {
  return U.getBitsLength(this.data.length);
};
U.prototype.write = function(o) {
  let n;
  for (n = 0; n < this.data.length; n++) {
    let t = re.toSJIS(this.data[n]);
    if (t >= 33088 && t <= 40956)
      t -= 33088;
    else if (t >= 57408 && t <= 60351)
      t -= 49472;
    else
      throw new Error(
        "Invalid SJIS character: " + this.data[n] + `
Make sure your charset is UTF-8`
      );
    t = (t >>> 8 & 255) * 192 + (t & 255), o.put(t, 13);
  }
};
var se = U, Lt = { exports: {} };
(function(o) {
  var n = {
    single_source_shortest_paths: function(t, e, i) {
      var r = {}, s = {};
      s[e] = 0;
      var c = n.PriorityQueue.make();
      c.push(e, 0);
      for (var a, l, u, C, f, d, y, w, I; !c.empty(); ) {
        a = c.pop(), l = a.value, C = a.cost, f = t[l] || {};
        for (u in f)
          f.hasOwnProperty(u) && (d = f[u], y = C + d, w = s[u], I = typeof s[u] > "u", (I || w > y) && (s[u] = y, c.push(u, y), r[u] = l));
      }
      if (typeof i < "u" && typeof s[i] > "u") {
        var p = ["Could not find a path from ", e, " to ", i, "."].join("");
        throw new Error(p);
      }
      return r;
    },
    extract_shortest_path_from_predecessor_list: function(t, e) {
      for (var i = [], r = e; r; )
        i.push(r), t[r], r = t[r];
      return i.reverse(), i;
    },
    find_path: function(t, e, i) {
      var r = n.single_source_shortest_paths(t, e, i);
      return n.extract_shortest_path_from_predecessor_list(
        r,
        i
      );
    },
    /**
     * A very naive priority queue implementation.
     */
    PriorityQueue: {
      make: function(t) {
        var e = n.PriorityQueue, i = {}, r;
        t = t || {};
        for (r in e)
          e.hasOwnProperty(r) && (i[r] = e[r]);
        return i.queue = [], i.sorter = t.sorter || e.default_sorter, i;
      },
      default_sorter: function(t, e) {
        return t.cost - e.cost;
      },
      /**
       * Add a new item to the queue and ensure the highest priority element
       * is at the front of the queue.
       */
      push: function(t, e) {
        var i = { value: t, cost: e };
        this.queue.push(i), this.queue.sort(this.sorter);
      },
      /**
       * Return the highest priority element in the queue.
       */
      pop: function() {
        return this.queue.shift();
      },
      empty: function() {
        return this.queue.length === 0;
      }
    }
  };
  o.exports = n;
})(Lt);
var ae = Lt.exports;
(function(o) {
  const n = v, t = Xt, e = ee, i = oe, r = se, s = B, c = T, a = ae;
  function l(p) {
    return unescape(encodeURIComponent(p)).length;
  }
  function u(p, b, m) {
    const g = [];
    let S;
    for (; (S = p.exec(m)) !== null; )
      g.push({
        data: S[0],
        index: S.index,
        mode: b,
        length: S[0].length
      });
    return g;
  }
  function C(p) {
    const b = u(s.NUMERIC, n.NUMERIC, p), m = u(s.ALPHANUMERIC, n.ALPHANUMERIC, p);
    let g, S;
    return c.isKanjiModeEnabled() ? (g = u(s.BYTE, n.BYTE, p), S = u(s.KANJI, n.KANJI, p)) : (g = u(s.BYTE_KANJI, n.BYTE, p), S = []), b.concat(m, g, S).sort(function(F, A) {
      return F.index - A.index;
    }).map(function(F) {
      return {
        data: F.data,
        mode: F.mode,
        length: F.length
      };
    });
  }
  function f(p, b) {
    switch (b) {
      case n.NUMERIC:
        return t.getBitsLength(p);
      case n.ALPHANUMERIC:
        return e.getBitsLength(p);
      case n.KANJI:
        return r.getBitsLength(p);
      case n.BYTE:
        return i.getBitsLength(p);
    }
  }
  function d(p) {
    return p.reduce(function(b, m) {
      const g = b.length - 1 >= 0 ? b[b.length - 1] : null;
      return g && g.mode === m.mode ? (b[b.length - 1].data += m.data, b) : (b.push(m), b);
    }, []);
  }
  function y(p) {
    const b = [];
    for (let m = 0; m < p.length; m++) {
      const g = p[m];
      switch (g.mode) {
        case n.NUMERIC:
          b.push([
            g,
            { data: g.data, mode: n.ALPHANUMERIC, length: g.length },
            { data: g.data, mode: n.BYTE, length: g.length }
          ]);
          break;
        case n.ALPHANUMERIC:
          b.push([
            g,
            { data: g.data, mode: n.BYTE, length: g.length }
          ]);
          break;
        case n.KANJI:
          b.push([
            g,
            { data: g.data, mode: n.BYTE, length: l(g.data) }
          ]);
          break;
        case n.BYTE:
          b.push([
            { data: g.data, mode: n.BYTE, length: l(g.data) }
          ]);
      }
    }
    return b;
  }
  function w(p, b) {
    const m = {}, g = { start: {} };
    let S = ["start"];
    for (let E = 0; E < p.length; E++) {
      const F = p[E], A = [];
      for (let M = 0; M < F.length; M++) {
        const P = F[M], $ = "" + E + M;
        A.push($), m[$] = { node: P, lastCount: 0 }, g[$] = {};
        for (let W = 0; W < S.length; W++) {
          const L = S[W];
          m[L] && m[L].node.mode === P.mode ? (g[L][$] = f(m[L].lastCount + P.length, P.mode) - f(m[L].lastCount, P.mode), m[L].lastCount += P.length) : (m[L] && (m[L].lastCount = P.length), g[L][$] = f(P.length, P.mode) + 4 + n.getCharCountIndicator(P.mode, b));
        }
      }
      S = A;
    }
    for (let E = 0; E < S.length; E++)
      g[S[E]].end = 0;
    return { map: g, table: m };
  }
  function I(p, b) {
    let m;
    const g = n.getBestModeForData(p);
    if (m = n.from(b, g), m !== n.BYTE && m.bit < g.bit)
      throw new Error('"' + p + '" cannot be encoded with mode ' + n.toString(m) + `.
 Suggested mode is: ` + n.toString(g));
    switch (m === n.KANJI && !c.isKanjiModeEnabled() && (m = n.BYTE), m) {
      case n.NUMERIC:
        return new t(p);
      case n.ALPHANUMERIC:
        return new e(p);
      case n.KANJI:
        return new r(p);
      case n.BYTE:
        return new i(p);
    }
  }
  o.fromArray = function(b) {
    return b.reduce(function(m, g) {
      return typeof g == "string" ? m.push(I(g, null)) : g.data && m.push(I(g.data, g.mode)), m;
    }, []);
  }, o.fromString = function(b, m) {
    const g = C(b, c.isKanjiModeEnabled()), S = y(g), E = w(S, m), F = a.find_path(E.map, "start", "end"), A = [];
    for (let M = 1; M < F.length - 1; M++)
      A.push(E.table[F[M]].node);
    return o.fromArray(d(A));
  }, o.rawSplit = function(b) {
    return o.fromArray(
      C(b, c.isKanjiModeEnabled())
    );
  };
})(Bt);
const Q = T, X = V, ce = Ot, le = qt, he = yt, ue = bt, it = St, rt = j, fe = Kt, G = Ft, de = At, ge = v, tt = Bt;
function pe(o, n) {
  const t = o.size, e = ue.getPositions(n);
  for (let i = 0; i < e.length; i++) {
    const r = e[i][0], s = e[i][1];
    for (let c = -1; c <= 7; c++)
      if (!(r + c <= -1 || t <= r + c))
        for (let a = -1; a <= 7; a++)
          s + a <= -1 || t <= s + a || (c >= 0 && c <= 6 && (a === 0 || a === 6) || a >= 0 && a <= 6 && (c === 0 || c === 6) || c >= 2 && c <= 4 && a >= 2 && a <= 4 ? o.set(r + c, s + a, !0, !0) : o.set(r + c, s + a, !1, !0));
  }
}
function me(o) {
  const n = o.size;
  for (let t = 8; t < n - 8; t++) {
    const e = t % 2 === 0;
    o.set(t, 6, e, !0), o.set(6, t, e, !0);
  }
}
function Ce(o, n) {
  const t = he.getPositions(n);
  for (let e = 0; e < t.length; e++) {
    const i = t[e][0], r = t[e][1];
    for (let s = -2; s <= 2; s++)
      for (let c = -2; c <= 2; c++)
        s === -2 || s === 2 || c === -2 || c === 2 || s === 0 && c === 0 ? o.set(i + s, r + c, !0, !0) : o.set(i + s, r + c, !1, !0);
  }
}
function we(o, n) {
  const t = o.size, e = G.getEncodedBits(n);
  let i, r, s;
  for (let c = 0; c < 18; c++)
    i = Math.floor(c / 3), r = c % 3 + t - 8 - 3, s = (e >> c & 1) === 1, o.set(i, r, s, !0), o.set(r, i, s, !0);
}
function et(o, n, t) {
  const e = o.size, i = de.getEncodedBits(n, t);
  let r, s;
  for (r = 0; r < 15; r++)
    s = (i >> r & 1) === 1, r < 6 ? o.set(r, 8, s, !0) : r < 8 ? o.set(r + 1, 8, s, !0) : o.set(e - 15 + r, 8, s, !0), r < 8 ? o.set(8, e - r - 1, s, !0) : r < 9 ? o.set(8, 15 - r - 1 + 1, s, !0) : o.set(8, 15 - r - 1, s, !0);
  o.set(e - 8, 8, 1, !0);
}
function ye(o, n) {
  const t = o.size;
  let e = -1, i = t - 1, r = 7, s = 0;
  for (let c = t - 1; c > 0; c -= 2)
    for (c === 6 && c--; ; ) {
      for (let a = 0; a < 2; a++)
        if (!o.isReserved(i, c - a)) {
          let l = !1;
          s < n.length && (l = (n[s] >>> r & 1) === 1), o.set(i, c - a, l), r--, r === -1 && (s++, r = 7);
        }
      if (i += e, i < 0 || t <= i) {
        i -= e, e = -e;
        break;
      }
    }
}
function be(o, n, t) {
  const e = new ce();
  t.forEach(function(a) {
    e.put(a.mode.bit, 4), e.put(a.getLength(), ge.getCharCountIndicator(a.mode, o)), a.write(e);
  });
  const i = Q.getSymbolTotalCodewords(o), r = rt.getTotalCodewordsCount(o, n), s = (i - r) * 8;
  for (e.getLengthInBits() + 4 <= s && e.put(0, 4); e.getLengthInBits() % 8 !== 0; )
    e.putBit(0);
  const c = (s - e.getLengthInBits()) / 8;
  for (let a = 0; a < c; a++)
    e.put(a % 2 ? 17 : 236, 8);
  return Se(e, o, n);
}
function Se(o, n, t) {
  const e = Q.getSymbolTotalCodewords(n), i = rt.getTotalCodewordsCount(n, t), r = e - i, s = rt.getBlocksCount(n, t), c = e % s, a = s - c, l = Math.floor(e / s), u = Math.floor(r / s), C = u + 1, f = l - u, d = new fe(f);
  let y = 0;
  const w = new Array(s), I = new Array(s);
  let p = 0;
  const b = new Uint8Array(o.buffer);
  for (let F = 0; F < s; F++) {
    const A = F < a ? u : C;
    w[F] = b.slice(y, y + A), I[F] = d.encode(w[F]), y += A, p = Math.max(p, A);
  }
  const m = new Uint8Array(e);
  let g = 0, S, E;
  for (S = 0; S < p; S++)
    for (E = 0; E < s; E++)
      S < w[E].length && (m[g++] = w[E][S]);
  for (S = 0; S < f; S++)
    for (E = 0; E < s; E++)
      m[g++] = I[E][S];
  return m;
}
function Ee(o, n, t, e) {
  let i;
  if (Array.isArray(o))
    i = tt.fromArray(o);
  else if (typeof o == "string") {
    let l = n;
    if (!l) {
      const u = tt.rawSplit(o);
      l = G.getBestVersionForData(u, t);
    }
    i = tt.fromString(o, l || 40);
  } else
    throw new Error("Invalid data");
  const r = G.getBestVersionForData(i, t);
  if (!r)
    throw new Error("The amount of data is too big to be stored in a QR Code");
  if (!n)
    n = r;
  else if (n < r)
    throw new Error(
      `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + r + `.
`
    );
  const s = be(n, t, i), c = Q.getSymbolSize(n), a = new le(c);
  return pe(a, n), me(a), Ce(a, n), et(a, t, 0), n >= 7 && we(a, n), ye(a, s), isNaN(e) && (e = it.getBestMask(
    a,
    et.bind(null, a, t)
  )), it.applyMask(e, a), et(a, t, e), {
    modules: a,
    version: n,
    errorCorrectionLevel: t,
    maskPattern: e,
    segments: i
  };
}
Ct.create = function(n, t) {
  if (typeof n > "u" || n === "")
    throw new Error("No input text");
  let e = X.M, i, r;
  return typeof t < "u" && (e = X.from(t.errorCorrectionLevel, X.M), i = G.from(t.version), r = it.from(t.maskPattern), t.toSJISFunc && Q.setToSJISFunction(t.toSJISFunc)), Ee(n, i, e, r);
};
var Mt = {}, ut = {};
(function(o) {
  function n(t) {
    if (typeof t == "number" && (t = t.toString()), typeof t != "string")
      throw new Error("Color should be defined as hex string");
    let e = t.slice().replace("#", "").split("");
    if (e.length < 3 || e.length === 5 || e.length > 8)
      throw new Error("Invalid hex color: " + t);
    (e.length === 3 || e.length === 4) && (e = Array.prototype.concat.apply([], e.map(function(r) {
      return [r, r];
    }))), e.length === 6 && e.push("F", "F");
    const i = parseInt(e.join(""), 16);
    return {
      r: i >> 24 & 255,
      g: i >> 16 & 255,
      b: i >> 8 & 255,
      a: i & 255,
      hex: "#" + e.slice(0, 6).join("")
    };
  }
  o.getOptions = function(e) {
    e || (e = {}), e.color || (e.color = {});
    const i = typeof e.margin > "u" || e.margin === null || e.margin < 0 ? 4 : e.margin, r = e.width && e.width >= 21 ? e.width : void 0, s = e.scale || 4;
    return {
      width: r,
      scale: r ? 4 : s,
      margin: i,
      color: {
        dark: n(e.color.dark || "#000000ff"),
        light: n(e.color.light || "#ffffffff")
      },
      type: e.type,
      rendererOpts: e.rendererOpts || {}
    };
  }, o.getScale = function(e, i) {
    return i.width && i.width >= e + i.margin * 2 ? i.width / (e + i.margin * 2) : i.scale;
  }, o.getImageWidth = function(e, i) {
    const r = o.getScale(e, i);
    return Math.floor((e + i.margin * 2) * r);
  }, o.qrToImageData = function(e, i, r) {
    const s = i.modules.size, c = i.modules.data, a = o.getScale(s, r), l = Math.floor((s + r.margin * 2) * a), u = r.margin * a, C = [r.color.light, r.color.dark];
    for (let f = 0; f < l; f++)
      for (let d = 0; d < l; d++) {
        let y = (f * l + d) * 4, w = r.color.light;
        if (f >= u && d >= u && f < l - u && d < l - u) {
          const I = Math.floor((f - u) / a), p = Math.floor((d - u) / a);
          w = C[c[I * s + p] ? 1 : 0];
        }
        e[y++] = w.r, e[y++] = w.g, e[y++] = w.b, e[y] = w.a;
      }
  };
})(ut);
(function(o) {
  const n = ut;
  function t(i, r, s) {
    i.clearRect(0, 0, r.width, r.height), r.style || (r.style = {}), r.height = s, r.width = s, r.style.height = s + "px", r.style.width = s + "px";
  }
  function e() {
    try {
      return document.createElement("canvas");
    } catch {
      throw new Error("You need to specify a canvas element");
    }
  }
  o.render = function(r, s, c) {
    let a = c, l = s;
    typeof a > "u" && (!s || !s.getContext) && (a = s, s = void 0), s || (l = e()), a = n.getOptions(a);
    const u = n.getImageWidth(r.modules.size, a), C = l.getContext("2d"), f = C.createImageData(u, u);
    return n.qrToImageData(f.data, r, a), t(C, l, u), C.putImageData(f, 0, 0), l;
  }, o.renderToDataURL = function(r, s, c) {
    let a = c;
    typeof a > "u" && (!s || !s.getContext) && (a = s, s = void 0), a || (a = {});
    const l = o.render(r, s, a), u = a.type || "image/png", C = a.rendererOpts || {};
    return l.toDataURL(u, C.quality);
  };
})(Mt);
var Nt = {};
const Ie = ut;
function pt(o, n) {
  const t = o.a / 255, e = n + '="' + o.hex + '"';
  return t < 1 ? e + " " + n + '-opacity="' + t.toFixed(2).slice(1) + '"' : e;
}
function nt(o, n, t) {
  let e = o + n;
  return typeof t < "u" && (e += " " + t), e;
}
function Fe(o, n, t) {
  let e = "", i = 0, r = !1, s = 0;
  for (let c = 0; c < o.length; c++) {
    const a = Math.floor(c % n), l = Math.floor(c / n);
    !a && !r && (r = !0), o[c] ? (s++, c > 0 && a > 0 && o[c - 1] || (e += r ? nt("M", a + t, 0.5 + l + t) : nt("m", i, 0), i = 0, r = !1), a + 1 < n && o[c + 1] || (e += nt("h", s), s = 0)) : i++;
  }
  return e;
}
Nt.render = function(n, t, e) {
  const i = Ie.getOptions(t), r = n.modules.size, s = n.modules.data, c = r + i.margin * 2, a = i.color.light.a ? "<path " + pt(i.color.light, "fill") + ' d="M0 0h' + c + "v" + c + 'H0z"/>' : "", l = "<path " + pt(i.color.dark, "stroke") + ' d="' + Fe(s, r, i.margin) + '"/>', u = 'viewBox="0 0 ' + c + " " + c + '"', f = '<svg xmlns="http://www.w3.org/2000/svg" ' + (i.width ? 'width="' + i.width + '" height="' + i.width + '" ' : "") + u + ' shape-rendering="crispEdges">' + a + l + `</svg>
`;
  return typeof e == "function" && e(null, f), f;
};
const Te = Ht, st = Ct, vt = Mt, Ae = Nt;
function ft(o, n, t, e, i) {
  const r = [].slice.call(arguments, 1), s = r.length, c = typeof r[s - 1] == "function";
  if (!c && !Te())
    throw new Error("Callback required as last argument");
  if (c) {
    if (s < 2)
      throw new Error("Too few arguments provided");
    s === 2 ? (i = t, t = n, n = e = void 0) : s === 3 && (n.getContext && typeof i > "u" ? (i = e, e = void 0) : (i = e, e = t, t = n, n = void 0));
  } else {
    if (s < 1)
      throw new Error("Too few arguments provided");
    return s === 1 ? (t = n, n = e = void 0) : s === 2 && !n.getContext && (e = t, t = n, n = void 0), new Promise(function(a, l) {
      try {
        const u = st.create(t, e);
        a(o(u, n, e));
      } catch (u) {
        l(u);
      }
    });
  }
  try {
    const a = st.create(t, e);
    i(null, o(a, n, e));
  } catch (a) {
    i(a);
  }
}
st.create;
ft.bind(null, vt.render);
var Pe = ft.bind(null, vt.renderToDataURL);
ft.bind(null, function(o, n, t) {
  return Ae.render(o, t);
});
const x = 1e3, Dt = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302"]
    }
  ]
};
function Be() {
  return crypto.randomUUID();
}
async function at(o) {
  return await (await fetch(o)).json();
}
function kt(o, n) {
  for (const t of o)
    if (JSON.stringify(t) === JSON.stringify(n))
      return !0;
  return !1;
}
class O {
  constructor() {
    h(this, "eventListeners", {});
  }
  on(n, t) {
    const e = this.eventListeners[n] ?? /* @__PURE__ */ new Set();
    e.add(t), this.eventListeners[n] = e;
  }
  off(n, t) {
    const e = this.eventListeners[n];
    e && (e.delete(t), e.size === 0 && delete this.eventListeners[n]);
  }
  emit(n, ...t) {
    const e = this.eventListeners[n] ?? /* @__PURE__ */ new Set();
    for (const i of e)
      i(...t);
  }
}
class Rt extends O {
}
class Ut extends O {
  constructor({
    flottformApi: t,
    createClientUrl: e,
    pollTimeForIceInMs: i,
    logger: r
  }) {
    super();
    h(this, "flottformApi");
    h(this, "createClientUrl");
    h(this, "rtcConfiguration");
    h(this, "pollTimeForIceInMs");
    h(this, "logger");
    h(this, "state", "new");
    h(this, "channelNumber", 0);
    h(this, "openPeerConnection", null);
    h(this, "dataChannel", null);
    h(this, "pollForIceTimer", null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h(this, "changeState", (t, e) => {
      this.state = t, this.emit(t, e), this.logger.info(`State changed to: ${t}`, e ?? "");
    });
    h(this, "start", async () => {
      this.openPeerConnection && this.close();
      const t = (this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)).toString().replace(/\/$/, "");
      try {
        this.rtcConfiguration.iceServers = await this.fetchIceServers(t);
      } catch (u) {
        this.logger.error(u);
      }
      this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration), this.dataChannel = this.createDataChannel();
      const e = await this.openPeerConnection.createOffer();
      await this.openPeerConnection.setLocalDescription(e);
      const { endpointId: i, hostKey: r } = await this.createEndpoint(t, e);
      this.logger.log("Created endpoint", { endpointId: i, hostKey: r });
      const s = `${t}/${i}`, c = `${t}/${i}/host`, a = /* @__PURE__ */ new Set();
      await this.putHostInfo(c, r, a, e), this.setUpConnectionStateGathering(s), this.setupHostIceGathering(c, r, a, e), this.setupDataChannelForTransfer();
      const l = await this.createClientUrl({ endpointId: i });
      this.changeState("waiting-for-client", {
        qrCode: await Pe(l),
        link: l,
        channel: this
      }), this.setupDataChannelListener();
    });
    h(this, "close", () => {
      this.openPeerConnection && (this.openPeerConnection.close(), this.openPeerConnection = null), this.changeState("disconnected");
    });
    h(this, "setupDataChannelListener", () => {
      if (this.dataChannel == null) {
        this.changeState(
          "error",
          "dataChannel is null. Unable to setup the listeners for the data channel"
        );
        return;
      }
      this.dataChannel.onmessage = (t) => {
        this.emit("receiving-data", t);
      };
    });
    h(this, "setupHostIceGathering", (t, e, i, r) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to gather Host ICE candidates");
        return;
      }
      this.openPeerConnection.onicecandidate = async (s) => {
        this.logger.info(
          `onicecandidate - ${this.openPeerConnection.connectionState} - ${s.candidate}`
        ), s.candidate && (kt(i, s.candidate) || (this.logger.log("host found new ice candidate! Adding it to our list"), i.add(s.candidate), await this.putHostInfo(t, e, i, r)));
      }, this.openPeerConnection.onicegatheringstatechange = async (s) => {
        this.logger.info(
          `onicegatheringstatechange - ${this.openPeerConnection.iceGatheringState} - ${s}`
        );
      }, this.openPeerConnection.onicecandidateerror = async (s) => {
        this.logger.error("peerConnection.onicecandidateerror", s);
      };
    });
    h(this, "setUpConnectionStateGathering", (t) => {
      if (this.openPeerConnection === null) {
        this.changeState(
          "error",
          "openPeerConnection is null. Unable to poll for the client's details"
        );
        return;
      }
      this.startPollingForConnection(t), this.openPeerConnection.onconnectionstatechange = () => {
        this.logger.info(`onconnectionstatechange - ${this.openPeerConnection.connectionState}`), this.openPeerConnection.connectionState === "connected" && this.stopPollingForConnection(), this.openPeerConnection.connectionState === "disconnected" && this.startPollingForConnection(t), this.openPeerConnection.connectionState === "failed" && (this.stopPollingForConnection(), this.changeState("error", { message: "connection-failed" }));
      }, this.openPeerConnection.oniceconnectionstatechange = async (e) => {
        this.logger.info(
          `oniceconnectionstatechange - ${this.openPeerConnection.iceConnectionState} - ${e}`
        ), this.openPeerConnection.iceConnectionState === "failed" && (this.logger.log("Failed to find a possible connection path"), this.changeState("error", { message: "connection-impossible" }));
      };
    });
    h(this, "stopPollingForConnection", async () => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), this.pollForIceTimer = null;
    });
    h(this, "startPollingForConnection", async (t) => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), await this.pollForConnection(t), this.pollForIceTimer = setTimeout(() => {
        this.startPollingForConnection(t);
      }, this.pollTimeForIceInMs);
    });
    h(this, "createEndpoint", async (t, e) => (await fetch(`${t}/create`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ session: e })
    })).json());
    h(this, "fetchIceServers", async (t) => {
      const e = await fetch(`${t}/ice-server-credentials`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!e.ok)
        throw new Error("Fetching Error!");
      const i = await e.json();
      if (i.success === !1)
        throw new Error(i.message || "Unknown error occurred");
      return i.iceServers;
    });
    h(this, "pollForConnection", async (t) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to retrieve Client's details");
        return;
      }
      this.logger.log("polling for client ice candidates", this.openPeerConnection.iceGatheringState);
      const { clientInfo: e } = await at(t);
      e && this.state === "waiting-for-client" && (this.logger.log("Found a client that wants to connect!"), this.changeState("waiting-for-ice"), await this.openPeerConnection.setRemoteDescription(e.session));
      for (const i of (e == null ? void 0 : e.iceCandidates) ?? [])
        await this.openPeerConnection.addIceCandidate(i);
    });
    h(this, "setupDataChannelForTransfer", () => {
      if (this.dataChannel === null) {
        this.changeState("error", "dataChannel is null. Unable to setup a Data Channel");
        return;
      }
      this.dataChannel.onopen = () => {
        this.logger.log("data channel opened"), this.changeState("waiting-for-data");
      }, this.dataChannel.onclose = () => {
        this.logger.log("data channel closed");
      }, this.dataChannel.onerror = (t) => {
        this.logger.log("channel.onerror", t), this.changeState("error", { message: "file-transfer" });
      };
    });
    h(this, "createDataChannel", () => {
      if (this.openPeerConnection === null)
        return this.changeState("error", "openPeerConnection is null. Unable to create a new Data Channel"), null;
      this.channelNumber++;
      const t = `data-channel-${this.channelNumber}`;
      return this.openPeerConnection.createDataChannel(t);
    });
    h(this, "putHostInfo", async (t, e, i, r) => {
      try {
        if (this.logger.log("Updating host info with new list of ice candidates"), !(await fetch(t, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hostKey: e,
            iceCandidates: [...i],
            session: r
          })
        })).ok)
          throw Error("Could not update host info");
      } catch (s) {
        this.changeState("error", s);
      }
    });
    this.flottformApi = t, this.createClientUrl = e, this.rtcConfiguration = Dt, this.pollTimeForIceInMs = i, this.logger = r, Promise.resolve().then(() => {
      this.changeState("new", { channel: this });
    });
  }
}
class Le extends Rt {
  constructor({
    flottformApi: t,
    createClientUrl: e,
    inputField: i,
    pollTimeForIceInMs: r = x,
    logger: s = console
  }) {
    super();
    h(this, "channel", null);
    h(this, "inputField");
    h(this, "logger");
    h(this, "filesMetaData", []);
    h(this, "filesTotalSize", 0);
    h(this, "receivedDataSize", 0);
    h(this, "currentFile", null);
    h(this, "link", "");
    h(this, "qrCode", "");
    h(this, "start", () => {
      var t;
      (t = this.channel) == null || t.start();
    });
    h(this, "close", () => {
      var t;
      (t = this.channel) == null || t.close();
    });
    h(this, "getLink", () => (this.link === "" && this.logger.error(
      "Flottform is currently establishing the connection. Link is unavailable for now!"
    ), this.link));
    h(this, "getQrCode", () => (this.qrCode === "" && this.logger.error(
      "Flottform is currently establishing the connection. qrCode is unavailable for now!"
    ), this.qrCode));
    h(this, "handleIncomingData", (t) => {
      var e, i, r;
      if (typeof t.data == "string") {
        const s = JSON.parse(t.data);
        s.type === "file-transfer-meta" ? (this.filesMetaData = s.filesQueue, this.currentFile = { index: 0, receivedSize: 0, arrayBuffer: [] }, this.filesTotalSize = s.totalSize, this.emit("receive")) : s.type === "transfer-complete" && (this.emit("done"), (e = this.channel) == null || e.close());
      } else if (t.data instanceof ArrayBuffer && this.currentFile) {
        this.currentFile.arrayBuffer.push(t.data), this.currentFile.receivedSize += t.data.byteLength, this.receivedDataSize += t.data.byteLength;
        const s = (i = this.filesMetaData[this.currentFile.index]) == null ? void 0 : i.name, c = (r = this.filesMetaData[this.currentFile.index]) == null ? void 0 : r.size, a = (this.currentFile.receivedSize / c).toFixed(
          2
        ), l = (this.receivedDataSize / this.filesTotalSize).toFixed(2);
        this.emit("progress", {
          fileIndex: this.currentFile.index,
          totalFileCount: this.filesMetaData.length,
          fileName: s,
          currentFileProgress: parseFloat(a),
          overallProgress: parseFloat(l)
        }), this.currentFile.receivedSize === c && (this.appendFileToInputField(this.currentFile.index), this.currentFile = {
          index: this.currentFile.index + 1,
          receivedSize: 0,
          arrayBuffer: []
        });
      }
    });
    h(this, "appendFileToInputField", (t) => {
      var c, a, l;
      if (!this.inputField) {
        this.logger.warn("No input field provided!!");
        return;
      }
      const e = new DataTransfer();
      if (this.inputField.files)
        for (const u of Array.from(this.inputField.files))
          e.items.add(u);
      this.inputField.multiple || (this.logger.warn(
        "The host's input field only supports one file. Incoming files from the client will overwrite any existing file, and only the last file received will remain attached."
      ), e.items.clear());
      const i = ((c = this.filesMetaData[t]) == null ? void 0 : c.name) ?? "no-name", r = ((a = this.filesMetaData[t]) == null ? void 0 : a.type) ?? "application/octet-stream", s = new File((l = this.currentFile) == null ? void 0 : l.arrayBuffer, i, {
        type: r
      });
      e.items.add(s), this.inputField.files = e.files;
    });
    h(this, "registerListeners", () => {
      var t, e, i, r, s, c, a;
      (t = this.channel) == null || t.on("new", () => {
        this.emit("new");
      }), (e = this.channel) == null || e.on("waiting-for-client", (l) => {
        this.emit("webrtc:waiting-for-client", l);
        const { qrCode: u, link: C } = l;
        this.emit("endpoint-created", { link: C, qrCode: u }), this.link = C, this.qrCode = u;
      }), (i = this.channel) == null || i.on("waiting-for-ice", () => {
        this.emit("webrtc:waiting-for-ice");
      }), (r = this.channel) == null || r.on("waiting-for-data", () => {
        this.emit("webrtc:waiting-for-file"), this.emit("connected");
      }), (s = this.channel) == null || s.on("receiving-data", (l) => {
        this.handleIncomingData(l);
      }), (c = this.channel) == null || c.on("disconnected", () => {
        this.emit("disconnected");
      }), (a = this.channel) == null || a.on("error", (l) => {
        this.emit("error", l);
      });
    });
    this.channel = new Ut({
      flottformApi: t,
      createClientUrl: e,
      pollTimeForIceInMs: r,
      logger: s
    }), this.inputField = i, this.logger = s, this.registerListeners();
  }
}
class $t extends O {
  // 128KB buffer threshold (maximum of 4 chunks in the buffer waiting to be sent over the network)
  constructor({
    endpointId: t,
    flottformApi: e,
    pollTimeForIceInMs: i = x,
    logger: r = console
  }) {
    super();
    h(this, "flottformApi");
    h(this, "endpointId");
    h(this, "rtcConfiguration");
    h(this, "pollTimeForIceInMs");
    h(this, "logger");
    h(this, "state", "init");
    h(this, "openPeerConnection", null);
    h(this, "dataChannel", null);
    h(this, "pollForIceTimer", null);
    h(this, "BUFFER_THRESHOLD", 128 * 1024);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h(this, "changeState", (t, e) => {
      this.state = t, this.emit(t, e), this.logger.info(`**Client State changed to: ${t}`, e ?? "");
    });
    h(this, "start", async () => {
      this.openPeerConnection && this.close();
      const t = (this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)).toString().replace(/\/$/, "");
      try {
        this.rtcConfiguration.iceServers = await this.fetchIceServers(t);
      } catch (l) {
        this.logger.error(l);
      }
      this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration);
      const e = Be(), i = /* @__PURE__ */ new Set(), r = `${this.flottformApi}/${this.endpointId}`, s = `${this.flottformApi}/${this.endpointId}/client`;
      this.changeState("retrieving-info-from-endpoint");
      const { hostInfo: c } = await at(r);
      await this.openPeerConnection.setRemoteDescription(c.session);
      const a = await this.openPeerConnection.createAnswer();
      await this.openPeerConnection.setLocalDescription(a), this.setUpConnectionStateGathering(r), this.setUpClientIceGathering(s, e, i, a), this.openPeerConnection.ondatachannel = (l) => {
        this.logger.info(`ondatachannel: ${l.channel}`), this.changeState("connected"), this.dataChannel = l.channel, this.dataChannel.bufferedAmountLowThreshold = this.BUFFER_THRESHOLD, this.dataChannel.onbufferedamountlow = () => {
          this.emit("bufferedamountlow");
        }, this.dataChannel.onopen = (u) => {
          this.logger.info(`ondatachannel - onopen: ${u.type}`);
        };
      }, this.changeState("sending-client-info"), await this.putClientInfo(s, e, i, a), this.changeState("connecting-to-host"), this.startPollingForIceCandidates(r);
    });
    h(this, "close", () => {
      this.openPeerConnection && (this.openPeerConnection.close(), this.openPeerConnection = null), this.changeState("disconnected");
    });
    // sendData = (data: string | Blob | ArrayBuffer | ArrayBufferView) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h(this, "sendData", (t) => {
      if (this.dataChannel == null) {
        this.changeState("error", "dataChannel is null. Unable to send the file to the Host!");
        return;
      } else if (!this.canSendMoreData()) {
        this.logger.warn("Data channel is full! Cannot send data at the moment");
        return;
      }
      this.dataChannel.send(t);
    });
    h(this, "canSendMoreData", () => this.dataChannel && this.dataChannel.bufferedAmount < this.dataChannel.bufferedAmountLowThreshold);
    h(this, "setUpClientIceGathering", (t, e, i, r) => {
      if (this.openPeerConnection === null) {
        this.changeState(
          "error",
          "openPeerConnection is null. Unable to gather Client ICE candidates"
        );
        return;
      }
      this.openPeerConnection.onicecandidate = async (s) => {
        this.logger.info(
          `onicecandidate - ${this.openPeerConnection.connectionState} - ${s.candidate}`
        ), s.candidate && (kt(i, s.candidate) || (this.logger.log("client found new ice candidate! Adding it to our list"), i.add(s.candidate), await this.putClientInfo(t, e, i, r)));
      }, this.openPeerConnection.onicegatheringstatechange = async () => {
        this.logger.info(`onicegatheringstatechange - ${this.openPeerConnection.iceGatheringState}`);
      }, this.openPeerConnection.onicecandidateerror = (s) => {
        this.logger.error(`onicecandidateerror - ${this.openPeerConnection.connectionState}`, s);
      };
    });
    h(this, "setUpConnectionStateGathering", (t) => {
      if (this.openPeerConnection === null) {
        this.changeState(
          "error",
          "openPeerConnection is null. Unable to gather Client ICE candidates"
        );
        return;
      }
      this.openPeerConnection.onconnectionstatechange = () => {
        this.logger.info(`onconnectionstatechange - ${this.openPeerConnection.connectionState}`), this.openPeerConnection.connectionState === "connected" && (this.stopPollingForIceCandidates(), this.state === "connecting-to-host" && this.changeState("connected")), this.openPeerConnection.connectionState === "disconnected" && this.startPollingForIceCandidates(t), this.openPeerConnection.connectionState === "failed" && (this.stopPollingForIceCandidates(), this.state !== "done" && this.changeState("disconnected"));
      }, this.openPeerConnection.oniceconnectionstatechange = () => {
        this.logger.info(
          `oniceconnectionstatechange - ${this.openPeerConnection.iceConnectionState}`
        ), this.openPeerConnection.iceConnectionState === "failed" && (this.logger.log("Failed to find a possible connection path"), this.changeState("connection-impossible"));
      };
    });
    h(this, "stopPollingForIceCandidates", async () => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), this.pollForIceTimer = null;
    });
    h(this, "startPollingForIceCandidates", async (t) => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), await this.pollForConnection(t), this.pollForIceTimer = setTimeout(this.startPollingForIceCandidates, this.pollTimeForIceInMs);
    });
    h(this, "pollForConnection", async (t) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to retrieve Host's details");
        return;
      }
      this.logger.log("polling for host ice candidates", this.openPeerConnection.iceGatheringState);
      const { hostInfo: e } = await at(t);
      for (const i of e.iceCandidates)
        await this.openPeerConnection.addIceCandidate(i);
    });
    h(this, "putClientInfo", async (t, e, i, r) => {
      if (this.logger.log("Updating client info with new list of ice candidates"), !(await fetch(t, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey: e,
          iceCandidates: [...i],
          session: r
        })
      })).ok)
        throw Error("Could not update client info. Did another peer already connect?");
    });
    h(this, "fetchIceServers", async (t) => {
      const e = await fetch(`${t}/ice-server-credentials`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!e.ok)
        throw new Error("Fetching Error!");
      const i = await e.json();
      if (i.success === !1)
        throw new Error(i.message || "Unknown error occurred");
      return i.iceServers;
    });
    this.endpointId = t, this.flottformApi = e, this.rtcConfiguration = Dt, this.pollTimeForIceInMs = i, this.logger = r;
  }
}
class Xe extends O {
  constructor({
    endpointId: t,
    fileInput: e,
    flottformApi: i,
    pollTimeForIceInMs: r = x,
    logger: s = console
  }) {
    super();
    h(this, "channel", null);
    h(this, "inputField");
    h(this, "chunkSize", 16384);
    // 16 KB chunks
    h(this, "filesMetaData", []);
    h(this, "filesArrayBuffer", []);
    h(this, "currentFileIndex", 0);
    h(this, "currentChunkIndex", 0);
    h(this, "allFilesSent", !1);
    h(this, "logger");
    h(this, "start", () => {
      var t;
      (t = this.channel) == null || t.start();
    });
    h(this, "close", () => {
      var t;
      (t = this.channel) == null || t.close();
    });
    h(this, "createMetaData", (t) => {
      if (!t.files) return null;
      const i = Array.from(t.files).map((r) => ({
        name: r.name,
        type: r.type,
        // We're dividing each file into chuncks no matter what the type of the file.
        size: r.size
      }));
      return {
        type: "file-transfer-meta",
        filesQueue: i,
        totalSize: i.reduce((r, s) => r + s.size, 0)
      };
    });
    h(this, "createArrayBuffers", async (t) => {
      if (!t.files) return null;
      const e = Array.from(t.files);
      return await Promise.all(e.map(async (i) => await i.arrayBuffer()));
    });
    h(this, "sendFiles", async () => {
      var i;
      const t = this.createMetaData(this.inputField), e = await this.createArrayBuffers(this.inputField);
      if (!t || !e)
        throw new Error("Can't find the files that you want to send!");
      this.filesMetaData = t.filesQueue, this.filesArrayBuffer = e, (i = this.channel) == null || i.sendData(JSON.stringify(t)), this.emit("sending"), this.startSendingFiles();
    });
    h(this, "startSendingFiles", () => {
      this.sendNextChunk();
    });
    h(this, "sendNextChunk", async () => {
      var s, c, a, l;
      const t = this.filesMetaData.length;
      if (this.allFilesSent || this.currentFileIndex >= t) {
        this.logger.log("All files are sent"), (s = this.channel) == null || s.sendData(JSON.stringify({ type: "transfer-complete" })), this.allFilesSent = !0, (c = this.channel) == null || c.off("bufferedamountlow", this.startSendingFiles), this.emit("done");
        return;
      }
      const e = this.filesArrayBuffer[this.currentFileIndex];
      if (!e)
        throw new Error(`Can't find the ArrayBuffer for the file number ${this.currentFileIndex}`);
      const i = e.byteLength, r = this.filesMetaData[this.currentFileIndex].name;
      for (; this.currentChunkIndex * this.chunkSize < i; ) {
        if (!((a = this.channel) != null && a.canSendMoreData())) {
          this.logger.log("Buffer is full. Pausing sending chunks!");
          break;
        }
        const u = (this.currentChunkIndex * this.chunkSize / i).toFixed(2);
        this.emit("progress", {
          fileIndex: this.currentFileIndex,
          fileName: r,
          progress: parseFloat(u)
        });
        const C = this.currentChunkIndex * this.chunkSize, f = Math.min((this.currentChunkIndex + 1) * this.chunkSize, i);
        (l = this.channel) == null || l.sendData(e.slice(C, f)), this.currentChunkIndex++;
      }
      this.currentChunkIndex * this.chunkSize >= i ? (this.logger.log(`File ${r} fully sent. Moving to next file.`), this.currentFileIndex++, this.currentChunkIndex = 0, this.sendNextChunk()) : setTimeout(this.sendNextChunk, 100);
    });
    h(this, "registerListeners", () => {
      var t, e, i, r, s, c, a, l, u, C;
      (t = this.channel) == null || t.on("init", () => {
      }), (e = this.channel) == null || e.on("retrieving-info-from-endpoint", () => {
      }), (i = this.channel) == null || i.on("sending-client-info", () => {
      }), (r = this.channel) == null || r.on("connecting-to-host", () => {
      }), (s = this.channel) == null || s.on("connected", () => {
        this.emit("connected");
      }), (c = this.channel) == null || c.on("connection-impossible", () => {
        this.emit("webrtc:connection-impossible");
      }), (a = this.channel) == null || a.on("done", () => {
        this.emit("done");
      }), (l = this.channel) == null || l.on("disconnected", () => {
        this.emit("disconnected");
      }), (u = this.channel) == null || u.on("error", (f) => {
        this.emit("error", f);
      }), (C = this.channel) == null || C.on("bufferedamountlow", this.startSendingFiles);
    });
    this.channel = new $t({
      endpointId: t,
      flottformApi: i,
      pollTimeForIceInMs: r,
      logger: s
    }), this.inputField = e, this.logger = s, this.registerListeners();
  }
}
class tn extends O {
  constructor({
    endpointId: t,
    flottformApi: e,
    pollTimeForIceInMs: i = x,
    logger: r = console
  }) {
    super();
    h(this, "channel", null);
    h(this, "logger");
    h(this, "start", () => {
      var t;
      (t = this.channel) == null || t.start();
    });
    h(this, "close", () => {
      var t;
      (t = this.channel) == null || t.close();
    });
    h(this, "sendText", (t) => {
      var e;
      this.emit("sending"), (e = this.channel) == null || e.sendData(t), this.emit("done");
    });
    h(this, "registerListeners", () => {
      var t, e, i, r, s, c, a, l, u;
      (t = this.channel) == null || t.on("init", () => {
      }), (e = this.channel) == null || e.on("retrieving-info-from-endpoint", () => {
      }), (i = this.channel) == null || i.on("sending-client-info", () => {
      }), (r = this.channel) == null || r.on("connecting-to-host", () => {
      }), (s = this.channel) == null || s.on("connected", () => {
        this.emit("connected");
      }), (c = this.channel) == null || c.on("connection-impossible", () => {
        this.emit("webrtc:connection-impossible");
      }), (a = this.channel) == null || a.on("done", () => {
        this.emit("done");
      }), (l = this.channel) == null || l.on("disconnected", () => {
        this.emit("disconnected");
      }), (u = this.channel) == null || u.on("error", (C) => {
        this.emit("error", C);
      });
    });
    this.channel = new $t({
      endpointId: t,
      flottformApi: e,
      pollTimeForIceInMs: i,
      logger: r
    }), this.logger = r, this.registerListeners();
  }
}
class Me extends Rt {
  constructor({
    flottformApi: t,
    createClientUrl: e,
    pollTimeForIceInMs: i = x,
    logger: r = console
  }) {
    super();
    h(this, "channel", null);
    h(this, "logger");
    h(this, "link", "");
    h(this, "qrCode", "");
    h(this, "start", () => {
      var t;
      (t = this.channel) == null || t.start();
    });
    h(this, "close", () => {
      var t;
      (t = this.channel) == null || t.close();
    });
    h(this, "getLink", () => (this.link === "" && this.logger.error(
      "Flottform is currently establishing the connection. Link is unavailable for now!"
    ), this.link));
    h(this, "getQrCode", () => (this.qrCode === "" && this.logger.error(
      "Flottform is currently establishing the connection. qrCode is unavailable for now!"
    ), this.qrCode));
    h(this, "handleIncomingData", (t) => {
      this.emit("receive"), this.emit("done", t.data);
    });
    h(this, "registerListeners", () => {
      var t, e, i, r, s, c, a;
      (t = this.channel) == null || t.on("new", () => {
        this.emit("new");
      }), (e = this.channel) == null || e.on("waiting-for-client", (l) => {
        this.emit("webrtc:waiting-for-client", l);
        const { qrCode: u, link: C } = l;
        this.emit("endpoint-created", { link: C, qrCode: u }), this.link = C, this.qrCode = u;
      }), (i = this.channel) == null || i.on("waiting-for-ice", () => {
        this.emit("webrtc:waiting-for-ice");
      }), (r = this.channel) == null || r.on("waiting-for-data", () => {
        this.emit("webrtc:waiting-for-data"), this.emit("connected");
      }), (s = this.channel) == null || s.on("receiving-data", (l) => {
        this.handleIncomingData(l);
      }), (c = this.channel) == null || c.on("disconnected", () => {
        this.emit("disconnected");
      }), (a = this.channel) == null || a.on("error", (l) => {
        this.emit("error", l);
      });
    });
    this.channel = new Ut({
      flottformApi: t,
      createClientUrl: e,
      pollTimeForIceInMs: i,
      logger: r
    }), this.logger = r, this.registerListeners();
  }
}
const Ne = () => {
  const o = document.querySelector(
    ".flottform-elements-container-wrapper"
  ), n = document.querySelector(".flottform-opener-triangle");
  o.classList.toggle("flottform-open"), n.classList.toggle("flottform-button-svg-open");
}, ve = (o, n, t) => {
  const e = document.createElement("div");
  e.setAttribute("class", `flottform-root${t ?? ""}`);
  const i = Ue(o);
  e.appendChild(i);
  const r = $e(n);
  return e.appendChild(r), e;
}, De = (o, n) => {
  const t = document.createElement("img");
  t.setAttribute("class", "flottform-qr-code"), t.setAttribute("src", o);
  const e = document.createElement("div");
  return e.setAttribute("class", "flottform-link-offer"), e.innerText = n, {
    createChannelQrCode: t,
    createChannelLinkWithOffer: e
  };
}, en = ({
  flottformAnchorElement: o,
  flottformRootElement: n,
  additionalComponentClass: t,
  flottformRootTitle: e,
  flottformRootDescription: i
}) => {
  const r = n ?? document.querySelector(".flottform-root") ?? ve(e, i, t), s = r.querySelector(".flottform-elements-container"), c = r.querySelector(
    ".flottform-elements-container-wrapper"
  );
  return c.appendChild(s), r.appendChild(c), o.appendChild(r), {
    flottformRoot: r,
    getAllFlottformItems: () => {
      const a = r.querySelector(".flottform-inputs-list");
      return a ? a.childNodes : (console.error("No element with class .flottform-inputs-list found"), null);
    },
    createFileItem: ({
      flottformApi: a,
      createClientUrl: l,
      inputField: u,
      id: C,
      additionalItemClasses: f,
      label: d,
      buttonLabel: y,
      onErrorText: w,
      onSuccessText: I
    }) => {
      const p = new Le({
        flottformApi: a,
        createClientUrl: l,
        inputField: u
      }), {
        flottformItem: b,
        statusInformation: m,
        refreshChannelButton: g,
        flottformStateItemsContainer: S
      } = mt({
        flottformBaseInputHost: p,
        additionalItemClasses: f,
        label: d,
        buttonLabel: y,
        onErrorText: w
      }), E = r.querySelector(".flottform-inputs-list");
      E.appendChild(b), s.appendChild(E), ke({
        flottformItem: b,
        statusInformation: m,
        refreshChannelButton: g,
        flottformStateItemsContainer: S,
        flottformFileInputHost: p,
        id: C,
        onSuccessText: I
      });
    },
    createTextItem: ({
      flottformApi: a,
      createClientUrl: l,
      inputField: u,
      id: C,
      additionalItemClasses: f,
      label: d,
      buttonLabel: y,
      onErrorText: w,
      onSuccessText: I
    }) => {
      const p = new Me({
        flottformApi: a,
        createClientUrl: l
      }), { flottformItem: b, statusInformation: m, refreshChannelButton: g } = mt({
        flottformBaseInputHost: p,
        additionalItemClasses: f,
        label: d,
        buttonLabel: y,
        onErrorText: w
      }), S = r.querySelector(".flottform-inputs-list");
      S.appendChild(b), s.appendChild(S), Re({
        flottformItem: b,
        statusInformation: m,
        refreshChannelButton: g,
        flottformTextInputHost: p,
        id: C,
        onSuccessText: I,
        inputField: u
      });
    }
  };
}, mt = ({
  flottformBaseInputHost: o,
  additionalItemClasses: n,
  label: t,
  buttonLabel: e,
  onErrorText: i
}) => {
  const r = _e(n);
  Je({ label: t, flottformItem: r });
  const s = ze(), c = xe(e);
  c.addEventListener("click", () => o.start());
  const a = He(c);
  r.appendChild(a);
  const l = Oe();
  return l.addEventListener("click", () => o.start()), o.on("endpoint-created", ({ link: u, qrCode: C }) => {
    const { createChannelQrCode: f, createChannelLinkWithOffer: d } = De(C, u), y = Ke();
    a.replaceChildren(f);
    const w = document.createElement("div");
    w.setAttribute("class", "flottform-copy-button-link-wrapper"), w.appendChild(y), w.appendChild(d), a.appendChild(w);
  }), o.on("connected", () => {
    s.innerHTML = "Connected", s.appendChild(l), a.replaceChildren(s);
  }), o.on("error", (u) => {
    s.innerHTML = typeof i == "function" ? i(u) : i ?? `🚨 An error occured (${u.message}). Please try again`, c.innerText = "Retry", a.replaceChildren(s), a.appendChild(c);
  }), { flottformItem: r, statusInformation: s, refreshChannelButton: l, flottformStateItemsContainer: a };
}, ke = ({
  flottformItem: o,
  statusInformation: n,
  refreshChannelButton: t,
  flottformStateItemsContainer: e,
  flottformFileInputHost: i,
  id: r,
  onSuccessText: s
}) => {
  r && o.setAttribute("id", r), i.on(
    "progress",
    ({ currentFileProgress: c, overallProgress: a, fileIndex: l, totalFileCount: u, fileName: C }) => {
      Ge(e), We(
        e,
        a,
        l,
        u
      );
      const f = Ve(e);
      Ye(
        l,
        C,
        c,
        f,
        e
      );
    }
  ), i.on("done", () => {
    n.innerHTML = s ?? "✨ You have succesfully downloaded all your files.", n.appendChild(t), e.replaceChildren(n);
  });
}, Re = ({
  flottformItem: o,
  statusInformation: n,
  refreshChannelButton: t,
  flottformTextInputHost: e,
  id: i,
  onSuccessText: r,
  inputField: s
}) => {
  i && o.setAttribute("id", i), e.on("done", (c) => {
    if (n.innerHTML = r ?? "✨ You have succesfully submitted your message", n.appendChild(t), o.replaceChildren(n), s) {
      s.setAttribute("value", c);
      const a = new Event("change");
      s.dispatchEvent(a);
    }
  });
}, Ue = (o) => {
  const n = document.createElement("button");
  return n.setAttribute("type", "button"), n.setAttribute("class", "flottform-root-opener-button"), n.innerHTML = `<span>${o ?? "Fill from Another Device"}</span><svg class="flottform-opener-triangle" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5,8.5l6,7l6-7H6.5z"/></svg>`, n.addEventListener("click", () => Ne()), n;
}, $e = (o) => {
  const n = document.createElement("div");
  n.setAttribute("class", "flottform-elements-container");
  const t = document.createElement("div");
  if (t.setAttribute("class", "flottform-elements-container-wrapper"), o !== "") {
    const i = document.createElement("div");
    i.setAttribute("class", "flottform-root-description"), i.innerText = o ?? "This form is powered by Flottform. Need to add details from another device? Simply click a button below to generate a QR code or link, and easily upload information from your other device.", n.appendChild(i);
  }
  const e = document.createElement("ul");
  return e.setAttribute("class", "flottform-inputs-list"), n.appendChild(e), t.appendChild(n), t;
}, _e = (o) => {
  const n = document.createElement("li");
  return n.setAttribute("class", `flottform-item${o ?? ""}`), n;
}, ze = () => {
  const o = document.createElement("div");
  return o.setAttribute("class", "flottform-status-information"), o;
}, He = (o) => {
  const n = document.createElement("div");
  return n.setAttribute("class", "flottform-state-items-container"), n.appendChild(o), n;
}, xe = (o) => {
  const n = document.createElement("button");
  return n.setAttribute("type", "button"), n.setAttribute("class", "flottform-button"), n.innerText = o ?? "Get a link", n;
}, Oe = () => {
  const o = document.createElement("button");
  return o.setAttribute("type", "button"), o.setAttribute("class", "flottform-refresh-connection-button"), o.setAttribute(
    "title",
    "Click this button to refresh Flottform connection for the input field. Previous connection will be closed"
  ), o.setAttribute(
    "aria-label",
    "Click this button to refresh Flottform connection for the input field. Previous connection will be closed"
  ), o.innerHTML = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2c-5.288 0-9.649 3.914-10.377 9h-3.123l4 5.917 4-5.917h-2.847c.711-3.972 4.174-7 8.347-7 4.687 0 8.5 3.813 8.5 8.5s-3.813 8.5-8.5 8.5c-3.015 0-5.662-1.583-7.171-3.957l-1.2 1.775c1.916 2.536 4.948 4.182 8.371 4.182 5.797 0 10.5-4.702 10.5-10.5s-4.703-10.5-10.5-10.5z"/></svg>', o;
};
let qe = 1;
const Je = ({
  label: o,
  flottformItem: n
}) => {
  const t = document.createElement("p"), e = o ?? `File input ${qe++}`;
  e && (t.innerHTML = e, n.appendChild(t));
}, Ke = () => {
  const o = document.createElement("button");
  return o.setAttribute("class", "flottform-copy-to-clipboard"), o.setAttribute("type", "button"), o.setAttribute("title", "Copy Flottform link to clipboard"), o.setAttribute("aria-label", "Copy Flottform link to clipboard"), o.innerText = "📋", o.addEventListener("click", async () => {
    const n = document.querySelector(".flottform-link-offer").innerText;
    navigator.clipboard.writeText(n).then(() => {
      o.innerText = "✅", setTimeout(() => {
        o.innerText = "📋";
      }, 1e3);
    }).catch((t) => {
      o.innerText = `❌ Failed to copy: ${t}`, setTimeout(() => {
        o.innerText = "📋";
      }, 1e3);
    });
  }), o;
}, Ge = (o) => {
  o.querySelector(
    ".flottform-status-information"
  ) && (o.innerHTML = "");
}, Ve = (o) => {
  let n = o.querySelector("details");
  if (!n) {
    n = document.createElement("details");
    const t = document.createElement("summary");
    t.innerText = "Details", n.appendChild(t);
    const e = document.createElement("div");
    e.classList.add("details-container"), n.appendChild(e), o.appendChild(n);
  }
  return n;
}, je = (o, n) => {
  const t = document.createElement("label");
  t.setAttribute("id", `flottform-status-bar-${o}`), t.classList.add("flottform-progress-bar-label"), t.innerText = `File ${n} progress:`;
  const e = document.createElement("progress");
  return e.setAttribute("id", `flottform-status-bar-${o}`), e.classList.add("flottform-status-bar"), e.setAttribute("max", "100"), e.setAttribute("value", "0"), { currentFileLabel: t, progressBar: e };
}, Ye = (o, n, t, e, i) => {
  let r = i.querySelector(
    `progress#flottform-status-bar-${o}`
  );
  if (!r) {
    const { currentFileLabel: s, progressBar: c } = je(o, n);
    r = c;
    const a = e.querySelector(".details-container");
    a.appendChild(s), a.appendChild(r);
  }
  r.value = t * 100, r.innerText = `${t * 100}%`;
}, Qe = () => {
  const o = document.createElement("label");
  o.setAttribute("id", "flottform-status-bar-overall-progress"), o.classList.add("flottform-progress-bar-label"), o.innerText = "Receiving Files Progress";
  const n = document.createElement("progress");
  return n.setAttribute("id", "flottform-status-bar-overall-progress"), n.classList.add("flottform-status-bar"), n.setAttribute("max", "100"), n.setAttribute("value", "0"), { overallFilesLabel: o, progressBar: n };
}, We = (o, n, t, e) => {
  let i = o.querySelector("progress#flottform-status-bar-overall-progress");
  if (!i) {
    const { overallFilesLabel: s, progressBar: c } = Qe();
    i = c, o.appendChild(s), o.appendChild(i);
  }
  const r = o.querySelector(
    "label#flottform-status-bar-overall-progress"
  );
  i.value = n * 100, i.innerText = `${n * 100}%`, r.innerText = `Receiving file ${t + 1} of ${e}`;
};
export {
  Xe as FlottformFileInputClient,
  Le as FlottformFileInputHost,
  tn as FlottformTextInputClient,
  Me as FlottformTextInputHost,
  en as createDefaultFlottformComponent
};
//# sourceMappingURL=flottform-bundle.js.map
