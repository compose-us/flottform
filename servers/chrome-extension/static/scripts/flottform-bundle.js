var Ht = Object.defineProperty;
var xt = (o, e, t) => e in o ? Ht(o, e, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[e] = t;
var h = (o, e, t) => xt(o, typeof e != "symbol" ? e + "" : e, t);
const D = class D {
  constructor() {
    h(this, "activeConnections");
    this.activeConnections = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    return D.instance || (D.instance = new D()), D.instance;
  }
  addConnection(e, t) {
    this.activeConnections.set(e, t);
  }
  getConnection(e) {
    return this.activeConnections.get(e);
  }
  closeAllConnections() {
    this.activeConnections.forEach((e) => {
      e.close();
    });
  }
  removeConnection(e) {
    this.activeConnections.delete(e);
  }
};
h(D, "instance");
let gt = D;
var Ot = function() {
  return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
}, yt = {}, T = {};
let lt;
const qt = [
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
T.getSymbolSize = function(e) {
  if (!e) throw new Error('"version" cannot be null or undefined');
  if (e < 1 || e > 40) throw new Error('"version" should be in range from 1 to 40');
  return e * 4 + 17;
};
T.getSymbolTotalCodewords = function(e) {
  return qt[e];
};
T.getBCHDigit = function(o) {
  let e = 0;
  for (; o !== 0; )
    e++, o >>>= 1;
  return e;
};
T.setToSJISFunction = function(e) {
  if (typeof e != "function")
    throw new Error('"toSJISFunc" is not a valid function.');
  lt = e;
};
T.isKanjiModeEnabled = function() {
  return typeof lt < "u";
};
T.toSJIS = function(e) {
  return lt(e);
};
var j = {};
(function(o) {
  o.L = { bit: 1 }, o.M = { bit: 0 }, o.Q = { bit: 3 }, o.H = { bit: 2 };
  function e(t) {
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
  o.isValid = function(n) {
    return n && typeof n.bit < "u" && n.bit >= 0 && n.bit < 4;
  }, o.from = function(n, i) {
    if (o.isValid(n))
      return n;
    try {
      return e(n);
    } catch {
      return i;
    }
  };
})(j);
function bt() {
  this.buffer = [], this.length = 0;
}
bt.prototype = {
  get: function(o) {
    const e = Math.floor(o / 8);
    return (this.buffer[e] >>> 7 - o % 8 & 1) === 1;
  },
  put: function(o, e) {
    for (let t = 0; t < e; t++)
      this.putBit((o >>> e - t - 1 & 1) === 1);
  },
  getLengthInBits: function() {
    return this.length;
  },
  putBit: function(o) {
    const e = Math.floor(this.length / 8);
    this.buffer.length <= e && this.buffer.push(0), o && (this.buffer[e] |= 128 >>> this.length % 8), this.length++;
  }
};
var Jt = bt;
function x(o) {
  if (!o || o < 1)
    throw new Error("BitMatrix size must be defined and greater than 0");
  this.size = o, this.data = new Uint8Array(o * o), this.reservedBit = new Uint8Array(o * o);
}
x.prototype.set = function(o, e, t, n) {
  const i = o * this.size + e;
  this.data[i] = t, n && (this.reservedBit[i] = !0);
};
x.prototype.get = function(o, e) {
  return this.data[o * this.size + e];
};
x.prototype.xor = function(o, e, t) {
  this.data[o * this.size + e] ^= t;
};
x.prototype.isReserved = function(o, e) {
  return this.reservedBit[o * this.size + e];
};
var Kt = x, St = {};
(function(o) {
  const e = T.getSymbolSize;
  o.getRowColCoords = function(n) {
    if (n === 1) return [];
    const i = Math.floor(n / 7) + 2, r = e(n), s = r === 145 ? 26 : Math.ceil((r - 13) / (2 * i - 2)) * 2, c = [r - 7];
    for (let a = 1; a < i - 1; a++)
      c[a] = c[a - 1] - s;
    return c.push(6), c.reverse();
  }, o.getPositions = function(n) {
    const i = [], r = o.getRowColCoords(n), s = r.length;
    for (let c = 0; c < s; c++)
      for (let a = 0; a < s; a++)
        c === 0 && a === 0 || // top-left
        c === 0 && a === s - 1 || // bottom-left
        c === s - 1 && a === 0 || i.push([r[c], r[a]]);
    return i;
  };
})(St);
var Et = {};
const Gt = T.getSymbolSize, pt = 7;
Et.getPositions = function(e) {
  const t = Gt(e);
  return [
    // top-left
    [0, 0],
    // top-right
    [t - pt, 0],
    // bottom-left
    [0, t - pt]
  ];
};
var It = {};
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
  const e = {
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
        d === l ? c++ : (c >= 5 && (s += e.N1 + (c - 5)), l = d, c = 1), d = i.get(f, C), d === u ? a++ : (a >= 5 && (s += e.N1 + (a - 5)), u = d, a = 1);
      }
      c >= 5 && (s += e.N1 + (c - 5)), a >= 5 && (s += e.N1 + (a - 5));
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
    return s * e.N2;
  }, o.getPenaltyN3 = function(i) {
    const r = i.size;
    let s = 0, c = 0, a = 0;
    for (let l = 0; l < r; l++) {
      c = a = 0;
      for (let u = 0; u < r; u++)
        c = c << 1 & 2047 | i.get(l, u), u >= 10 && (c === 1488 || c === 93) && s++, a = a << 1 & 2047 | i.get(u, l), u >= 10 && (a === 1488 || a === 93) && s++;
    }
    return s * e.N3;
  }, o.getPenaltyN4 = function(i) {
    let r = 0;
    const s = i.data.length;
    for (let a = 0; a < s; a++) r += i.data[a];
    return Math.abs(Math.ceil(r * 100 / s / 5) - 10) * e.N4;
  };
  function t(n, i, r) {
    switch (n) {
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
        throw new Error("bad maskPattern:" + n);
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
})(It);
var Y = {};
const M = j, J = [
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
], K = [
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
Y.getBlocksCount = function(e, t) {
  switch (t) {
    case M.L:
      return J[(e - 1) * 4 + 0];
    case M.M:
      return J[(e - 1) * 4 + 1];
    case M.Q:
      return J[(e - 1) * 4 + 2];
    case M.H:
      return J[(e - 1) * 4 + 3];
    default:
      return;
  }
};
Y.getTotalCodewordsCount = function(e, t) {
  switch (t) {
    case M.L:
      return K[(e - 1) * 4 + 0];
    case M.M:
      return K[(e - 1) * 4 + 1];
    case M.Q:
      return K[(e - 1) * 4 + 2];
    case M.H:
      return K[(e - 1) * 4 + 3];
    default:
      return;
  }
};
var Ft = {}, Q = {};
const _ = new Uint8Array(512), G = new Uint8Array(256);
(function() {
  let e = 1;
  for (let t = 0; t < 255; t++)
    _[t] = e, G[e] = t, e <<= 1, e & 256 && (e ^= 285);
  for (let t = 255; t < 512; t++)
    _[t] = _[t - 255];
})();
Q.log = function(e) {
  if (e < 1) throw new Error("log(" + e + ")");
  return G[e];
};
Q.exp = function(e) {
  return _[e];
};
Q.mul = function(e, t) {
  return e === 0 || t === 0 ? 0 : _[G[e] + G[t]];
};
(function(o) {
  const e = Q;
  o.mul = function(n, i) {
    const r = new Uint8Array(n.length + i.length - 1);
    for (let s = 0; s < n.length; s++)
      for (let c = 0; c < i.length; c++)
        r[s + c] ^= e.mul(n[s], i[c]);
    return r;
  }, o.mod = function(n, i) {
    let r = new Uint8Array(n);
    for (; r.length - i.length >= 0; ) {
      const s = r[0];
      for (let a = 0; a < i.length; a++)
        r[a] ^= e.mul(i[a], s);
      let c = 0;
      for (; c < r.length && r[c] === 0; ) c++;
      r = r.slice(c);
    }
    return r;
  }, o.generateECPolynomial = function(n) {
    let i = new Uint8Array([1]);
    for (let r = 0; r < n; r++)
      i = o.mul(i, new Uint8Array([1, e.exp(r)]));
    return i;
  };
})(Ft);
const Tt = Ft;
function ht(o) {
  this.genPoly = void 0, this.degree = o, this.degree && this.initialize(this.degree);
}
ht.prototype.initialize = function(e) {
  this.degree = e, this.genPoly = Tt.generateECPolynomial(this.degree);
};
ht.prototype.encode = function(e) {
  if (!this.genPoly)
    throw new Error("Encoder not initialized");
  const t = new Uint8Array(e.length + this.degree);
  t.set(e);
  const n = Tt.mod(t, this.genPoly), i = this.degree - n.length;
  if (i > 0) {
    const r = new Uint8Array(this.degree);
    return r.set(n, i), r;
  }
  return n;
};
var Vt = ht, At = {}, N = {}, ut = {};
ut.isValid = function(e) {
  return !isNaN(e) && e >= 1 && e <= 40;
};
var B = {};
const Pt = "[0-9]+", jt = "[A-Z $%*+\\-./:]+";
let H = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
H = H.replace(/u/g, "\\u");
const Yt = "(?:(?![A-Z0-9 $%*+\\-./:]|" + H + `)(?:.|[\r
]))+`;
B.KANJI = new RegExp(H, "g");
B.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g");
B.BYTE = new RegExp(Yt, "g");
B.NUMERIC = new RegExp(Pt, "g");
B.ALPHANUMERIC = new RegExp(jt, "g");
const Qt = new RegExp("^" + H + "$"), Wt = new RegExp("^" + Pt + "$"), Zt = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
B.testKanji = function(e) {
  return Qt.test(e);
};
B.testNumeric = function(e) {
  return Wt.test(e);
};
B.testAlphanumeric = function(e) {
  return Zt.test(e);
};
(function(o) {
  const e = ut, t = B;
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
    if (!e.isValid(s))
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
  function n(i) {
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
      return n(r);
    } catch {
      return s;
    }
  };
})(N);
(function(o) {
  const e = T, t = Y, n = j, i = N, r = ut, s = 7973, c = e.getBCHDigit(s);
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
    const I = e.getSymbolTotalCodewords(d), p = t.getTotalCodewordsCount(d, y), b = (I - p) * 8;
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
    const I = n.from(y, n.M);
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
    for (; e.getBCHDigit(y) - c >= 0; )
      y ^= s << e.getBCHDigit(y) - c;
    return d << 12 | y;
  };
})(At);
var Bt = {};
const it = T, Lt = 1335, Xt = 21522, mt = it.getBCHDigit(Lt);
Bt.getEncodedBits = function(e, t) {
  const n = e.bit << 3 | t;
  let i = n << 10;
  for (; it.getBCHDigit(i) - mt >= 0; )
    i ^= Lt << it.getBCHDigit(i) - mt;
  return (n << 10 | i) ^ Xt;
};
var vt = {};
const te = N;
function k(o) {
  this.mode = te.NUMERIC, this.data = o.toString();
}
k.getBitsLength = function(e) {
  return 10 * Math.floor(e / 3) + (e % 3 ? e % 3 * 3 + 1 : 0);
};
k.prototype.getLength = function() {
  return this.data.length;
};
k.prototype.getBitsLength = function() {
  return k.getBitsLength(this.data.length);
};
k.prototype.write = function(e) {
  let t, n, i;
  for (t = 0; t + 3 <= this.data.length; t += 3)
    n = this.data.substr(t, 3), i = parseInt(n, 10), e.put(i, 10);
  const r = this.data.length - t;
  r > 0 && (n = this.data.substr(t), i = parseInt(n, 10), e.put(i, r * 3 + 1));
};
var ee = k;
const ne = N, X = [
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
function R(o) {
  this.mode = ne.ALPHANUMERIC, this.data = o;
}
R.getBitsLength = function(e) {
  return 11 * Math.floor(e / 2) + 6 * (e % 2);
};
R.prototype.getLength = function() {
  return this.data.length;
};
R.prototype.getBitsLength = function() {
  return R.getBitsLength(this.data.length);
};
R.prototype.write = function(e) {
  let t;
  for (t = 0; t + 2 <= this.data.length; t += 2) {
    let n = X.indexOf(this.data[t]) * 45;
    n += X.indexOf(this.data[t + 1]), e.put(n, 11);
  }
  this.data.length % 2 && e.put(X.indexOf(this.data[t]), 6);
};
var oe = R;
const ie = N;
function U(o) {
  this.mode = ie.BYTE, typeof o == "string" ? this.data = new TextEncoder().encode(o) : this.data = new Uint8Array(o);
}
U.getBitsLength = function(e) {
  return e * 8;
};
U.prototype.getLength = function() {
  return this.data.length;
};
U.prototype.getBitsLength = function() {
  return U.getBitsLength(this.data.length);
};
U.prototype.write = function(o) {
  for (let e = 0, t = this.data.length; e < t; e++)
    o.put(this.data[e], 8);
};
var re = U;
const se = N, ae = T;
function $(o) {
  this.mode = se.KANJI, this.data = o;
}
$.getBitsLength = function(e) {
  return e * 13;
};
$.prototype.getLength = function() {
  return this.data.length;
};
$.prototype.getBitsLength = function() {
  return $.getBitsLength(this.data.length);
};
$.prototype.write = function(o) {
  let e;
  for (e = 0; e < this.data.length; e++) {
    let t = ae.toSJIS(this.data[e]);
    if (t >= 33088 && t <= 40956)
      t -= 33088;
    else if (t >= 57408 && t <= 60351)
      t -= 49472;
    else
      throw new Error(
        "Invalid SJIS character: " + this.data[e] + `
Make sure your charset is UTF-8`
      );
    t = (t >>> 8 & 255) * 192 + (t & 255), o.put(t, 13);
  }
};
var ce = $, Mt = { exports: {} };
(function(o) {
  var e = {
    single_source_shortest_paths: function(t, n, i) {
      var r = {}, s = {};
      s[n] = 0;
      var c = e.PriorityQueue.make();
      c.push(n, 0);
      for (var a, l, u, C, f, d, y, w, I; !c.empty(); ) {
        a = c.pop(), l = a.value, C = a.cost, f = t[l] || {};
        for (u in f)
          f.hasOwnProperty(u) && (d = f[u], y = C + d, w = s[u], I = typeof s[u] > "u", (I || w > y) && (s[u] = y, c.push(u, y), r[u] = l));
      }
      if (typeof i < "u" && typeof s[i] > "u") {
        var p = ["Could not find a path from ", n, " to ", i, "."].join("");
        throw new Error(p);
      }
      return r;
    },
    extract_shortest_path_from_predecessor_list: function(t, n) {
      for (var i = [], r = n; r; )
        i.push(r), t[r], r = t[r];
      return i.reverse(), i;
    },
    find_path: function(t, n, i) {
      var r = e.single_source_shortest_paths(t, n, i);
      return e.extract_shortest_path_from_predecessor_list(
        r,
        i
      );
    },
    /**
     * A very naive priority queue implementation.
     */
    PriorityQueue: {
      make: function(t) {
        var n = e.PriorityQueue, i = {}, r;
        t = t || {};
        for (r in n)
          n.hasOwnProperty(r) && (i[r] = n[r]);
        return i.queue = [], i.sorter = t.sorter || n.default_sorter, i;
      },
      default_sorter: function(t, n) {
        return t.cost - n.cost;
      },
      /**
       * Add a new item to the queue and ensure the highest priority element
       * is at the front of the queue.
       */
      push: function(t, n) {
        var i = { value: t, cost: n };
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
  o.exports = e;
})(Mt);
var le = Mt.exports;
(function(o) {
  const e = N, t = ee, n = oe, i = re, r = ce, s = B, c = T, a = le;
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
    const b = u(s.NUMERIC, e.NUMERIC, p), m = u(s.ALPHANUMERIC, e.ALPHANUMERIC, p);
    let g, S;
    return c.isKanjiModeEnabled() ? (g = u(s.BYTE, e.BYTE, p), S = u(s.KANJI, e.KANJI, p)) : (g = u(s.BYTE_KANJI, e.BYTE, p), S = []), b.concat(m, g, S).sort(function(F, A) {
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
      case e.NUMERIC:
        return t.getBitsLength(p);
      case e.ALPHANUMERIC:
        return n.getBitsLength(p);
      case e.KANJI:
        return r.getBitsLength(p);
      case e.BYTE:
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
        case e.NUMERIC:
          b.push([
            g,
            { data: g.data, mode: e.ALPHANUMERIC, length: g.length },
            { data: g.data, mode: e.BYTE, length: g.length }
          ]);
          break;
        case e.ALPHANUMERIC:
          b.push([
            g,
            { data: g.data, mode: e.BYTE, length: g.length }
          ]);
          break;
        case e.KANJI:
          b.push([
            g,
            { data: g.data, mode: e.BYTE, length: l(g.data) }
          ]);
          break;
        case e.BYTE:
          b.push([
            { data: g.data, mode: e.BYTE, length: l(g.data) }
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
      for (let v = 0; v < F.length; v++) {
        const P = F[v], z = "" + E + v;
        A.push(z), m[z] = { node: P, lastCount: 0 }, g[z] = {};
        for (let Z = 0; Z < S.length; Z++) {
          const L = S[Z];
          m[L] && m[L].node.mode === P.mode ? (g[L][z] = f(m[L].lastCount + P.length, P.mode) - f(m[L].lastCount, P.mode), m[L].lastCount += P.length) : (m[L] && (m[L].lastCount = P.length), g[L][z] = f(P.length, P.mode) + 4 + e.getCharCountIndicator(P.mode, b));
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
    const g = e.getBestModeForData(p);
    if (m = e.from(b, g), m !== e.BYTE && m.bit < g.bit)
      throw new Error('"' + p + '" cannot be encoded with mode ' + e.toString(m) + `.
 Suggested mode is: ` + e.toString(g));
    switch (m === e.KANJI && !c.isKanjiModeEnabled() && (m = e.BYTE), m) {
      case e.NUMERIC:
        return new t(p);
      case e.ALPHANUMERIC:
        return new n(p);
      case e.KANJI:
        return new r(p);
      case e.BYTE:
        return new i(p);
    }
  }
  o.fromArray = function(b) {
    return b.reduce(function(m, g) {
      return typeof g == "string" ? m.push(I(g, null)) : g.data && m.push(I(g.data, g.mode)), m;
    }, []);
  }, o.fromString = function(b, m) {
    const g = C(b, c.isKanjiModeEnabled()), S = y(g), E = w(S, m), F = a.find_path(E.map, "start", "end"), A = [];
    for (let v = 1; v < F.length - 1; v++)
      A.push(E.table[F[v]].node);
    return o.fromArray(d(A));
  }, o.rawSplit = function(b) {
    return o.fromArray(
      C(b, c.isKanjiModeEnabled())
    );
  };
})(vt);
const W = T, tt = j, he = Jt, ue = Kt, fe = St, de = Et, rt = It, st = Y, ge = Vt, V = At, pe = Bt, me = N, et = vt;
function Ce(o, e) {
  const t = o.size, n = de.getPositions(e);
  for (let i = 0; i < n.length; i++) {
    const r = n[i][0], s = n[i][1];
    for (let c = -1; c <= 7; c++)
      if (!(r + c <= -1 || t <= r + c))
        for (let a = -1; a <= 7; a++)
          s + a <= -1 || t <= s + a || (c >= 0 && c <= 6 && (a === 0 || a === 6) || a >= 0 && a <= 6 && (c === 0 || c === 6) || c >= 2 && c <= 4 && a >= 2 && a <= 4 ? o.set(r + c, s + a, !0, !0) : o.set(r + c, s + a, !1, !0));
  }
}
function we(o) {
  const e = o.size;
  for (let t = 8; t < e - 8; t++) {
    const n = t % 2 === 0;
    o.set(t, 6, n, !0), o.set(6, t, n, !0);
  }
}
function ye(o, e) {
  const t = fe.getPositions(e);
  for (let n = 0; n < t.length; n++) {
    const i = t[n][0], r = t[n][1];
    for (let s = -2; s <= 2; s++)
      for (let c = -2; c <= 2; c++)
        s === -2 || s === 2 || c === -2 || c === 2 || s === 0 && c === 0 ? o.set(i + s, r + c, !0, !0) : o.set(i + s, r + c, !1, !0);
  }
}
function be(o, e) {
  const t = o.size, n = V.getEncodedBits(e);
  let i, r, s;
  for (let c = 0; c < 18; c++)
    i = Math.floor(c / 3), r = c % 3 + t - 8 - 3, s = (n >> c & 1) === 1, o.set(i, r, s, !0), o.set(r, i, s, !0);
}
function nt(o, e, t) {
  const n = o.size, i = pe.getEncodedBits(e, t);
  let r, s;
  for (r = 0; r < 15; r++)
    s = (i >> r & 1) === 1, r < 6 ? o.set(r, 8, s, !0) : r < 8 ? o.set(r + 1, 8, s, !0) : o.set(n - 15 + r, 8, s, !0), r < 8 ? o.set(8, n - r - 1, s, !0) : r < 9 ? o.set(8, 15 - r - 1 + 1, s, !0) : o.set(8, 15 - r - 1, s, !0);
  o.set(n - 8, 8, 1, !0);
}
function Se(o, e) {
  const t = o.size;
  let n = -1, i = t - 1, r = 7, s = 0;
  for (let c = t - 1; c > 0; c -= 2)
    for (c === 6 && c--; ; ) {
      for (let a = 0; a < 2; a++)
        if (!o.isReserved(i, c - a)) {
          let l = !1;
          s < e.length && (l = (e[s] >>> r & 1) === 1), o.set(i, c - a, l), r--, r === -1 && (s++, r = 7);
        }
      if (i += n, i < 0 || t <= i) {
        i -= n, n = -n;
        break;
      }
    }
}
function Ee(o, e, t) {
  const n = new he();
  t.forEach(function(a) {
    n.put(a.mode.bit, 4), n.put(a.getLength(), me.getCharCountIndicator(a.mode, o)), a.write(n);
  });
  const i = W.getSymbolTotalCodewords(o), r = st.getTotalCodewordsCount(o, e), s = (i - r) * 8;
  for (n.getLengthInBits() + 4 <= s && n.put(0, 4); n.getLengthInBits() % 8 !== 0; )
    n.putBit(0);
  const c = (s - n.getLengthInBits()) / 8;
  for (let a = 0; a < c; a++)
    n.put(a % 2 ? 17 : 236, 8);
  return Ie(n, o, e);
}
function Ie(o, e, t) {
  const n = W.getSymbolTotalCodewords(e), i = st.getTotalCodewordsCount(e, t), r = n - i, s = st.getBlocksCount(e, t), c = n % s, a = s - c, l = Math.floor(n / s), u = Math.floor(r / s), C = u + 1, f = l - u, d = new ge(f);
  let y = 0;
  const w = new Array(s), I = new Array(s);
  let p = 0;
  const b = new Uint8Array(o.buffer);
  for (let F = 0; F < s; F++) {
    const A = F < a ? u : C;
    w[F] = b.slice(y, y + A), I[F] = d.encode(w[F]), y += A, p = Math.max(p, A);
  }
  const m = new Uint8Array(n);
  let g = 0, S, E;
  for (S = 0; S < p; S++)
    for (E = 0; E < s; E++)
      S < w[E].length && (m[g++] = w[E][S]);
  for (S = 0; S < f; S++)
    for (E = 0; E < s; E++)
      m[g++] = I[E][S];
  return m;
}
function Fe(o, e, t, n) {
  let i;
  if (Array.isArray(o))
    i = et.fromArray(o);
  else if (typeof o == "string") {
    let l = e;
    if (!l) {
      const u = et.rawSplit(o);
      l = V.getBestVersionForData(u, t);
    }
    i = et.fromString(o, l || 40);
  } else
    throw new Error("Invalid data");
  const r = V.getBestVersionForData(i, t);
  if (!r)
    throw new Error("The amount of data is too big to be stored in a QR Code");
  if (!e)
    e = r;
  else if (e < r)
    throw new Error(
      `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + r + `.
`
    );
  const s = Ee(e, t, i), c = W.getSymbolSize(e), a = new ue(c);
  return Ce(a, e), we(a), ye(a, e), nt(a, t, 0), e >= 7 && be(a, e), Se(a, s), isNaN(n) && (n = rt.getBestMask(
    a,
    nt.bind(null, a, t)
  )), rt.applyMask(n, a), nt(a, t, n), {
    modules: a,
    version: e,
    errorCorrectionLevel: t,
    maskPattern: n,
    segments: i
  };
}
yt.create = function(e, t) {
  if (typeof e > "u" || e === "")
    throw new Error("No input text");
  let n = tt.M, i, r;
  return typeof t < "u" && (n = tt.from(t.errorCorrectionLevel, tt.M), i = V.from(t.version), r = rt.from(t.maskPattern), t.toSJISFunc && W.setToSJISFunction(t.toSJISFunc)), Fe(e, i, n, r);
};
var Nt = {}, ft = {};
(function(o) {
  function e(t) {
    if (typeof t == "number" && (t = t.toString()), typeof t != "string")
      throw new Error("Color should be defined as hex string");
    let n = t.slice().replace("#", "").split("");
    if (n.length < 3 || n.length === 5 || n.length > 8)
      throw new Error("Invalid hex color: " + t);
    (n.length === 3 || n.length === 4) && (n = Array.prototype.concat.apply([], n.map(function(r) {
      return [r, r];
    }))), n.length === 6 && n.push("F", "F");
    const i = parseInt(n.join(""), 16);
    return {
      r: i >> 24 & 255,
      g: i >> 16 & 255,
      b: i >> 8 & 255,
      a: i & 255,
      hex: "#" + n.slice(0, 6).join("")
    };
  }
  o.getOptions = function(n) {
    n || (n = {}), n.color || (n.color = {});
    const i = typeof n.margin > "u" || n.margin === null || n.margin < 0 ? 4 : n.margin, r = n.width && n.width >= 21 ? n.width : void 0, s = n.scale || 4;
    return {
      width: r,
      scale: r ? 4 : s,
      margin: i,
      color: {
        dark: e(n.color.dark || "#000000ff"),
        light: e(n.color.light || "#ffffffff")
      },
      type: n.type,
      rendererOpts: n.rendererOpts || {}
    };
  }, o.getScale = function(n, i) {
    return i.width && i.width >= n + i.margin * 2 ? i.width / (n + i.margin * 2) : i.scale;
  }, o.getImageWidth = function(n, i) {
    const r = o.getScale(n, i);
    return Math.floor((n + i.margin * 2) * r);
  }, o.qrToImageData = function(n, i, r) {
    const s = i.modules.size, c = i.modules.data, a = o.getScale(s, r), l = Math.floor((s + r.margin * 2) * a), u = r.margin * a, C = [r.color.light, r.color.dark];
    for (let f = 0; f < l; f++)
      for (let d = 0; d < l; d++) {
        let y = (f * l + d) * 4, w = r.color.light;
        if (f >= u && d >= u && f < l - u && d < l - u) {
          const I = Math.floor((f - u) / a), p = Math.floor((d - u) / a);
          w = C[c[I * s + p] ? 1 : 0];
        }
        n[y++] = w.r, n[y++] = w.g, n[y++] = w.b, n[y] = w.a;
      }
  };
})(ft);
(function(o) {
  const e = ft;
  function t(i, r, s) {
    i.clearRect(0, 0, r.width, r.height), r.style || (r.style = {}), r.height = s, r.width = s, r.style.height = s + "px", r.style.width = s + "px";
  }
  function n() {
    try {
      return document.createElement("canvas");
    } catch {
      throw new Error("You need to specify a canvas element");
    }
  }
  o.render = function(r, s, c) {
    let a = c, l = s;
    typeof a > "u" && (!s || !s.getContext) && (a = s, s = void 0), s || (l = n()), a = e.getOptions(a);
    const u = e.getImageWidth(r.modules.size, a), C = l.getContext("2d"), f = C.createImageData(u, u);
    return e.qrToImageData(f.data, r, a), t(C, l, u), C.putImageData(f, 0, 0), l;
  }, o.renderToDataURL = function(r, s, c) {
    let a = c;
    typeof a > "u" && (!s || !s.getContext) && (a = s, s = void 0), a || (a = {});
    const l = o.render(r, s, a), u = a.type || "image/png", C = a.rendererOpts || {};
    return l.toDataURL(u, C.quality);
  };
})(Nt);
var Dt = {};
const Te = ft;
function Ct(o, e) {
  const t = o.a / 255, n = e + '="' + o.hex + '"';
  return t < 1 ? n + " " + e + '-opacity="' + t.toFixed(2).slice(1) + '"' : n;
}
function ot(o, e, t) {
  let n = o + e;
  return typeof t < "u" && (n += " " + t), n;
}
function Ae(o, e, t) {
  let n = "", i = 0, r = !1, s = 0;
  for (let c = 0; c < o.length; c++) {
    const a = Math.floor(c % e), l = Math.floor(c / e);
    !a && !r && (r = !0), o[c] ? (s++, c > 0 && a > 0 && o[c - 1] || (n += r ? ot("M", a + t, 0.5 + l + t) : ot("m", i, 0), i = 0, r = !1), a + 1 < e && o[c + 1] || (n += ot("h", s), s = 0)) : i++;
  }
  return n;
}
Dt.render = function(e, t, n) {
  const i = Te.getOptions(t), r = e.modules.size, s = e.modules.data, c = r + i.margin * 2, a = i.color.light.a ? "<path " + Ct(i.color.light, "fill") + ' d="M0 0h' + c + "v" + c + 'H0z"/>' : "", l = "<path " + Ct(i.color.dark, "stroke") + ' d="' + Ae(s, r, i.margin) + '"/>', u = 'viewBox="0 0 ' + c + " " + c + '"', f = '<svg xmlns="http://www.w3.org/2000/svg" ' + (i.width ? 'width="' + i.width + '" height="' + i.width + '" ' : "") + u + ' shape-rendering="crispEdges">' + a + l + `</svg>
`;
  return typeof n == "function" && n(null, f), f;
};
const Pe = Ot, at = yt, kt = Nt, Be = Dt;
function dt(o, e, t, n, i) {
  const r = [].slice.call(arguments, 1), s = r.length, c = typeof r[s - 1] == "function";
  if (!c && !Pe())
    throw new Error("Callback required as last argument");
  if (c) {
    if (s < 2)
      throw new Error("Too few arguments provided");
    s === 2 ? (i = t, t = e, e = n = void 0) : s === 3 && (e.getContext && typeof i > "u" ? (i = n, n = void 0) : (i = n, n = t, t = e, e = void 0));
  } else {
    if (s < 1)
      throw new Error("Too few arguments provided");
    return s === 1 ? (t = e, e = n = void 0) : s === 2 && !e.getContext && (n = t, t = e, e = void 0), new Promise(function(a, l) {
      try {
        const u = at.create(t, n);
        a(o(u, e, n));
      } catch (u) {
        l(u);
      }
    });
  }
  try {
    const a = at.create(t, n);
    i(null, o(a, e, n));
  } catch (a) {
    i(a);
  }
}
at.create;
dt.bind(null, kt.render);
var Le = dt.bind(null, kt.renderToDataURL);
dt.bind(null, function(o, e, t) {
  return Be.render(o, t);
});
const O = 1e3, Rt = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302"]
    }
  ]
};
function ve() {
  return crypto.randomUUID();
}
async function ct(o) {
  return await (await fetch(o)).json();
}
function Ut(o, e) {
  for (const t of o)
    if (JSON.stringify(t) === JSON.stringify(e))
      return !0;
  return !1;
}
class q {
  constructor() {
    h(this, "eventListeners", {});
  }
  on(e, t) {
    const n = this.eventListeners[e] ?? /* @__PURE__ */ new Set();
    n.add(t), this.eventListeners[e] = n;
  }
  off(e, t) {
    const n = this.eventListeners[e];
    n && (n.delete(t), n.size === 0 && delete this.eventListeners[e]);
  }
  emit(e, ...t) {
    const n = this.eventListeners[e] ?? /* @__PURE__ */ new Set();
    for (const i of n)
      i(...t);
  }
}
class $t extends q {
}
class zt extends q {
  constructor({
    flottformApi: t,
    createClientUrl: n,
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
    h(this, "changeState", (t, n) => {
      this.state = t, this.emit(t, n), this.logger.info(`State changed to: ${t}`, n ?? "");
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
      const n = await this.openPeerConnection.createOffer();
      await this.openPeerConnection.setLocalDescription(n);
      const { endpointId: i, hostKey: r } = await this.createEndpoint(t, n);
      this.logger.log("Created endpoint", { endpointId: i, hostKey: r });
      const s = `${t}/${i}`, c = `${t}/${i}/host`, a = /* @__PURE__ */ new Set();
      await this.putHostInfo(c, r, a, n), this.setUpConnectionStateGathering(s), this.setupHostIceGathering(c, r, a, n), this.setupDataChannelForTransfer();
      const l = await this.createClientUrl({ endpointId: i });
      this.changeState("waiting-for-client", {
        qrCode: await Le(l),
        link: l,
        channel: this
      }), this.setupDataChannelListener();
    });
    h(this, "close", () => {
      this.openPeerConnection && (this.openPeerConnection.close(), this.openPeerConnection = null, this.stopPollingForConnection()), this.changeState("disconnected");
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
    h(this, "setupHostIceGathering", (t, n, i, r) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to gather Host ICE candidates");
        return;
      }
      this.openPeerConnection.onicecandidate = async (s) => {
        this.logger.info(
          `onicecandidate - ${this.openPeerConnection.connectionState} - ${s.candidate}`
        ), s.candidate && (Ut(i, s.candidate) || (this.logger.log("host found new ice candidate! Adding it to our list"), i.add(s.candidate), await this.putHostInfo(t, n, i, r)));
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
      }, this.openPeerConnection.oniceconnectionstatechange = async (n) => {
        this.logger.info(
          `oniceconnectionstatechange - ${this.openPeerConnection.iceConnectionState} - ${n}`
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
    h(this, "createEndpoint", async (t, n) => (await fetch(`${t}/create`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ session: n })
    })).json());
    h(this, "fetchIceServers", async (t) => {
      const n = await fetch(`${t}/ice-server-credentials`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!n.ok)
        throw new Error("Fetching Error!");
      const i = await n.json();
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
      const { clientInfo: n } = await ct(t);
      n && this.state === "waiting-for-client" && (this.logger.log("Found a client that wants to connect!"), this.changeState("waiting-for-ice"), await this.openPeerConnection.setRemoteDescription(n.session));
      for (const i of (n == null ? void 0 : n.iceCandidates) ?? [])
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
    h(this, "putHostInfo", async (t, n, i, r) => {
      try {
        if (this.logger.log("Updating host info with new list of ice candidates"), !(await fetch(t, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hostKey: n,
            iceCandidates: [...i],
            session: r
          })
        })).ok)
          throw Error("Could not update host info");
      } catch (s) {
        this.changeState("error", s);
      }
    });
    this.flottformApi = t, this.createClientUrl = n, this.rtcConfiguration = Rt, this.pollTimeForIceInMs = i, this.logger = r, Promise.resolve().then(() => {
      this.changeState("new", { channel: this });
    });
  }
}
class Me extends $t {
  constructor({
    flottformApi: t,
    createClientUrl: n,
    inputField: i,
    pollTimeForIceInMs: r = O,
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
      var n, i, r;
      if (typeof t.data == "string") {
        const s = JSON.parse(t.data);
        s.type === "file-transfer-meta" ? (this.filesMetaData = s.filesQueue, this.currentFile = { index: 0, receivedSize: 0, arrayBuffer: [] }, this.filesTotalSize = s.totalSize, this.emit("receive")) : s.type === "transfer-complete" && (this.emit("done"), (n = this.channel) == null || n.close());
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
      const n = new DataTransfer();
      if (this.inputField.files)
        for (const u of Array.from(this.inputField.files))
          n.items.add(u);
      this.inputField.multiple || (this.logger.warn(
        "The host's input field only supports one file. Incoming files from the client will overwrite any existing file, and only the last file received will remain attached."
      ), n.items.clear());
      const i = ((c = this.filesMetaData[t]) == null ? void 0 : c.name) ?? "no-name", r = ((a = this.filesMetaData[t]) == null ? void 0 : a.type) ?? "application/octet-stream", s = new File((l = this.currentFile) == null ? void 0 : l.arrayBuffer, i, {
        type: r
      });
      n.items.add(s), this.inputField.files = n.files;
    });
    h(this, "registerListeners", () => {
      var t, n, i, r, s, c, a;
      (t = this.channel) == null || t.on("new", () => {
        this.emit("new");
      }), (n = this.channel) == null || n.on("waiting-for-client", (l) => {
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
    this.channel = new zt({
      flottformApi: t,
      createClientUrl: n,
      pollTimeForIceInMs: r,
      logger: s
    }), this.inputField = i, this.logger = s, this.registerListeners();
  }
}
class _t extends q {
  // 128KB buffer threshold (maximum of 4 chunks in the buffer waiting to be sent over the network)
  constructor({
    endpointId: t,
    flottformApi: n,
    pollTimeForIceInMs: i = O,
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
    h(this, "changeState", (t, n) => {
      this.state = t, this.emit(t, n), this.logger.info(`**Client State changed to: ${t}`, n ?? "");
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
      const n = ve(), i = /* @__PURE__ */ new Set(), r = `${this.flottformApi}/${this.endpointId}`, s = `${this.flottformApi}/${this.endpointId}/client`;
      this.changeState("retrieving-info-from-endpoint");
      const { hostInfo: c } = await ct(r);
      await this.openPeerConnection.setRemoteDescription(c.session);
      const a = await this.openPeerConnection.createAnswer();
      await this.openPeerConnection.setLocalDescription(a), this.setUpConnectionStateGathering(r), this.setUpClientIceGathering(s, n, i, a), this.openPeerConnection.ondatachannel = (l) => {
        this.logger.info(`ondatachannel: ${l.channel}`), this.changeState("connected"), this.dataChannel = l.channel, this.dataChannel.bufferedAmountLowThreshold = this.BUFFER_THRESHOLD, this.dataChannel.onbufferedamountlow = () => {
          this.emit("bufferedamountlow");
        }, this.dataChannel.onopen = (u) => {
          this.logger.info(`ondatachannel - onopen: ${u.type}`);
        };
      }, this.changeState("sending-client-info"), await this.putClientInfo(s, n, i, a), this.changeState("connecting-to-host"), this.startPollingForIceCandidates(r);
    });
    h(this, "close", () => {
      this.openPeerConnection && (this.openPeerConnection.close(), this.openPeerConnection = null, this.stopPollingForIceCandidates()), this.changeState("disconnected");
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
    h(this, "setUpClientIceGathering", (t, n, i, r) => {
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
        ), s.candidate && (Ut(i, s.candidate) || (this.logger.log("client found new ice candidate! Adding it to our list"), i.add(s.candidate), await this.putClientInfo(t, n, i, r)));
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
      const { hostInfo: n } = await ct(t);
      for (const i of n.iceCandidates)
        await this.openPeerConnection.addIceCandidate(i);
    });
    h(this, "putClientInfo", async (t, n, i, r) => {
      if (this.logger.log("Updating client info with new list of ice candidates"), !(await fetch(t, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey: n,
          iceCandidates: [...i],
          session: r
        })
      })).ok)
        throw Error("Could not update client info. Did another peer already connect?");
    });
    h(this, "fetchIceServers", async (t) => {
      const n = await fetch(`${t}/ice-server-credentials`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!n.ok)
        throw new Error("Fetching Error!");
      const i = await n.json();
      if (i.success === !1)
        throw new Error(i.message || "Unknown error occurred");
      return i.iceServers;
    });
    this.endpointId = t, this.flottformApi = n, this.rtcConfiguration = Rt, this.pollTimeForIceInMs = i, this.logger = r;
  }
}
class en extends q {
  constructor({
    endpointId: t,
    fileInput: n,
    flottformApi: i,
    pollTimeForIceInMs: r = O,
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
      const n = Array.from(t.files);
      return await Promise.all(n.map(async (i) => await i.arrayBuffer()));
    });
    h(this, "sendFiles", async () => {
      var i;
      const t = this.createMetaData(this.inputField), n = await this.createArrayBuffers(this.inputField);
      if (!t || !n)
        throw new Error("Can't find the files that you want to send!");
      this.filesMetaData = t.filesQueue, this.filesArrayBuffer = n, (i = this.channel) == null || i.sendData(JSON.stringify(t)), this.emit("sending"), this.startSendingFiles();
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
      const n = this.filesArrayBuffer[this.currentFileIndex];
      if (!n)
        throw new Error(`Can't find the ArrayBuffer for the file number ${this.currentFileIndex}`);
      const i = n.byteLength, r = this.filesMetaData[this.currentFileIndex].name;
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
        (l = this.channel) == null || l.sendData(n.slice(C, f)), this.currentChunkIndex++;
      }
      this.currentChunkIndex * this.chunkSize >= i ? (this.logger.log(`File ${r} fully sent. Moving to next file.`), this.currentFileIndex++, this.currentChunkIndex = 0, this.sendNextChunk()) : setTimeout(this.sendNextChunk, 100);
    });
    h(this, "registerListeners", () => {
      var t, n, i, r, s, c, a, l, u, C;
      (t = this.channel) == null || t.on("init", () => {
      }), (n = this.channel) == null || n.on("retrieving-info-from-endpoint", () => {
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
    this.channel = new _t({
      endpointId: t,
      flottformApi: i,
      pollTimeForIceInMs: r,
      logger: s
    }), this.inputField = n, this.logger = s, this.registerListeners();
  }
}
class nn extends q {
  constructor({
    endpointId: t,
    flottformApi: n,
    pollTimeForIceInMs: i = O,
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
      var n;
      this.emit("sending"), (n = this.channel) == null || n.sendData(t), this.emit("done");
    });
    h(this, "registerListeners", () => {
      var t, n, i, r, s, c, a, l, u;
      (t = this.channel) == null || t.on("init", () => {
      }), (n = this.channel) == null || n.on("retrieving-info-from-endpoint", () => {
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
    this.channel = new _t({
      endpointId: t,
      flottformApi: n,
      pollTimeForIceInMs: i,
      logger: r
    }), this.logger = r, this.registerListeners();
  }
}
class Ne extends $t {
  constructor({
    flottformApi: t,
    createClientUrl: n,
    pollTimeForIceInMs: i = O,
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
      var t, n, i, r, s, c, a;
      (t = this.channel) == null || t.on("new", () => {
        this.emit("new");
      }), (n = this.channel) == null || n.on("waiting-for-client", (l) => {
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
    this.channel = new zt({
      flottformApi: t,
      createClientUrl: n,
      pollTimeForIceInMs: i,
      logger: r
    }), this.logger = r, this.registerListeners();
  }
}
const De = () => {
  const o = document.querySelector(
    ".flottform-elements-container-wrapper"
  ), e = document.querySelector(".flottform-opener-triangle");
  o.classList.toggle("flottform-open"), e.classList.toggle("flottform-button-svg-open");
}, ke = (o, e, t) => {
  const n = document.createElement("div");
  n.setAttribute("class", `flottform-root${t ?? ""}`);
  const i = ze(o);
  n.appendChild(i);
  const r = _e(e);
  return n.appendChild(r), n;
}, Re = (o, e) => {
  const t = document.createElement("img");
  t.setAttribute("class", "flottform-qr-code"), t.setAttribute("src", o);
  const n = document.createElement("div");
  return n.setAttribute("class", "flottform-link-offer"), n.innerText = e, {
    createChannelQrCode: t,
    createChannelLinkWithOffer: n
  };
}, on = ({
  flottformAnchorElement: o,
  flottformRootElement: e,
  additionalComponentClass: t,
  flottformRootTitle: n,
  flottformRootDescription: i
}) => {
  const r = e ?? document.querySelector(".flottform-root") ?? ke(n, i, t), s = r.querySelector(".flottform-elements-container"), c = r.querySelector(
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
      const p = new Me({
        flottformApi: a,
        createClientUrl: l,
        inputField: u
      }), {
        flottformItem: b,
        statusInformation: m,
        refreshChannelButton: g,
        flottformStateItemsContainer: S
      } = wt({
        flottformBaseInputHost: p,
        additionalItemClasses: f,
        label: d,
        buttonLabel: y,
        onErrorText: w
      }), E = r.querySelector(".flottform-inputs-list");
      E.appendChild(b), s.appendChild(E), Ue({
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
      const p = new Ne({
        flottformApi: a,
        createClientUrl: l
      }), { flottformItem: b, statusInformation: m, refreshChannelButton: g } = wt({
        flottformBaseInputHost: p,
        additionalItemClasses: f,
        label: d,
        buttonLabel: y,
        onErrorText: w
      }), S = r.querySelector(".flottform-inputs-list");
      S.appendChild(b), s.appendChild(S), $e({
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
}, wt = ({
  flottformBaseInputHost: o,
  additionalItemClasses: e,
  label: t,
  buttonLabel: n,
  onErrorText: i
}) => {
  const r = He(e);
  Ge({ label: t, flottformItem: r });
  const s = xe(), c = qe(n);
  c.addEventListener("click", () => o.start());
  const a = Oe(c);
  r.appendChild(a);
  const l = Je();
  return l.addEventListener("click", () => o.start()), o.on("endpoint-created", ({ link: u, qrCode: C }) => {
    const { createChannelQrCode: f, createChannelLinkWithOffer: d } = Re(C, u), y = Ve();
    a.replaceChildren(f);
    const w = document.createElement("div");
    w.setAttribute("class", "flottform-copy-button-link-wrapper"), w.appendChild(y), w.appendChild(d), a.appendChild(w);
  }), o.on("connected", () => {
    s.innerHTML = "Connected", s.appendChild(l), a.replaceChildren(s);
  }), o.on("error", (u) => {
    s.innerHTML = typeof i == "function" ? i(u) : i ?? `🚨 An error occured (${u.message}). Please try again`, c.innerText = "Retry", a.replaceChildren(s), a.appendChild(c);
  }), { flottformItem: r, statusInformation: s, refreshChannelButton: l, flottformStateItemsContainer: a };
}, Ue = ({
  flottformItem: o,
  statusInformation: e,
  refreshChannelButton: t,
  flottformStateItemsContainer: n,
  flottformFileInputHost: i,
  id: r,
  onSuccessText: s
}) => {
  r && o.setAttribute("id", r), i.on(
    "progress",
    ({ currentFileProgress: c, overallProgress: a, fileIndex: l, totalFileCount: u, fileName: C }) => {
      je(n), Xe(
        n,
        a,
        l,
        u
      );
      const f = Ye(n);
      We(
        l,
        C,
        c,
        f,
        n
      );
    }
  ), i.on("done", () => {
    e.innerHTML = s ?? "✨ You have succesfully downloaded all your files.", e.appendChild(t), n.replaceChildren(e);
  });
}, $e = ({
  flottformItem: o,
  statusInformation: e,
  refreshChannelButton: t,
  flottformTextInputHost: n,
  id: i,
  onSuccessText: r,
  inputField: s
}) => {
  i && o.setAttribute("id", i), n.on("done", (c) => {
    if (e.innerHTML = r ?? "✨ You have succesfully submitted your message", e.appendChild(t), o.replaceChildren(e), s) {
      s.setAttribute("value", c);
      const a = new Event("change");
      s.dispatchEvent(a);
    }
  });
}, ze = (o) => {
  const e = document.createElement("button");
  return e.setAttribute("type", "button"), e.setAttribute("class", "flottform-root-opener-button"), e.innerHTML = `<span>${o ?? "Fill from Another Device"}</span><svg class="flottform-opener-triangle" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5,8.5l6,7l6-7H6.5z"/></svg>`, e.addEventListener("click", () => De()), e;
}, _e = (o) => {
  const e = document.createElement("div");
  e.setAttribute("class", "flottform-elements-container");
  const t = document.createElement("div");
  if (t.setAttribute("class", "flottform-elements-container-wrapper"), o !== "") {
    const i = document.createElement("div");
    i.setAttribute("class", "flottform-root-description"), i.innerText = o ?? "This form is powered by Flottform. Need to add details from another device? Simply click a button below to generate a QR code or link, and easily upload information from your other device.", e.appendChild(i);
  }
  const n = document.createElement("ul");
  return n.setAttribute("class", "flottform-inputs-list"), e.appendChild(n), t.appendChild(e), t;
}, He = (o) => {
  const e = document.createElement("li");
  return e.setAttribute("class", `flottform-item${o ?? ""}`), e;
}, xe = () => {
  const o = document.createElement("div");
  return o.setAttribute("class", "flottform-status-information"), o;
}, Oe = (o) => {
  const e = document.createElement("div");
  return e.setAttribute("class", "flottform-state-items-container"), e.appendChild(o), e;
}, qe = (o) => {
  const e = document.createElement("button");
  return e.setAttribute("type", "button"), e.setAttribute("class", "flottform-button"), e.innerText = o ?? "Get a link", e;
}, Je = () => {
  const o = document.createElement("button");
  return o.setAttribute("type", "button"), o.setAttribute("class", "flottform-refresh-connection-button"), o.setAttribute(
    "title",
    "Click this button to refresh Flottform connection for the input field. Previous connection will be closed"
  ), o.setAttribute(
    "aria-label",
    "Click this button to refresh Flottform connection for the input field. Previous connection will be closed"
  ), o.innerHTML = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2c-5.288 0-9.649 3.914-10.377 9h-3.123l4 5.917 4-5.917h-2.847c.711-3.972 4.174-7 8.347-7 4.687 0 8.5 3.813 8.5 8.5s-3.813 8.5-8.5 8.5c-3.015 0-5.662-1.583-7.171-3.957l-1.2 1.775c1.916 2.536 4.948 4.182 8.371 4.182 5.797 0 10.5-4.702 10.5-10.5s-4.703-10.5-10.5-10.5z"/></svg>', o;
};
let Ke = 1;
const Ge = ({
  label: o,
  flottformItem: e
}) => {
  const t = document.createElement("p"), n = o ?? `File input ${Ke++}`;
  n && (t.innerHTML = n, e.appendChild(t));
}, Ve = () => {
  const o = document.createElement("button");
  return o.setAttribute("class", "flottform-copy-to-clipboard"), o.setAttribute("type", "button"), o.setAttribute("title", "Copy Flottform link to clipboard"), o.setAttribute("aria-label", "Copy Flottform link to clipboard"), o.innerText = "📋", o.addEventListener("click", async () => {
    const e = document.querySelector(".flottform-link-offer").innerText;
    navigator.clipboard.writeText(e).then(() => {
      o.innerText = "✅", setTimeout(() => {
        o.innerText = "📋";
      }, 1e3);
    }).catch((t) => {
      o.innerText = `❌ Failed to copy: ${t}`, setTimeout(() => {
        o.innerText = "📋";
      }, 1e3);
    });
  }), o;
}, je = (o) => {
  o.querySelector(
    ".flottform-status-information"
  ) && (o.innerHTML = "");
}, Ye = (o) => {
  let e = o.querySelector("details");
  if (!e) {
    e = document.createElement("details");
    const t = document.createElement("summary");
    t.innerText = "Details", e.appendChild(t);
    const n = document.createElement("div");
    n.classList.add("details-container"), e.appendChild(n), o.appendChild(e);
  }
  return e;
}, Qe = (o, e) => {
  const t = document.createElement("label");
  t.setAttribute("id", `flottform-status-bar-${o}`), t.classList.add("flottform-progress-bar-label"), t.innerText = `File ${e} progress:`;
  const n = document.createElement("progress");
  return n.setAttribute("id", `flottform-status-bar-${o}`), n.classList.add("flottform-status-bar"), n.setAttribute("max", "100"), n.setAttribute("value", "0"), { currentFileLabel: t, progressBar: n };
}, We = (o, e, t, n, i) => {
  let r = i.querySelector(
    `progress#flottform-status-bar-${o}`
  );
  if (!r) {
    const { currentFileLabel: s, progressBar: c } = Qe(o, e);
    r = c;
    const a = n.querySelector(".details-container");
    a.appendChild(s), a.appendChild(r);
  }
  r.value = t * 100, r.innerText = `${t * 100}%`;
}, Ze = () => {
  const o = document.createElement("label");
  o.setAttribute("id", "flottform-status-bar-overall-progress"), o.classList.add("flottform-progress-bar-label"), o.innerText = "Receiving Files Progress";
  const e = document.createElement("progress");
  return e.setAttribute("id", "flottform-status-bar-overall-progress"), e.classList.add("flottform-status-bar"), e.setAttribute("max", "100"), e.setAttribute("value", "0"), { overallFilesLabel: o, progressBar: e };
}, Xe = (o, e, t, n) => {
  let i = o.querySelector("progress#flottform-status-bar-overall-progress");
  if (!i) {
    const { overallFilesLabel: s, progressBar: c } = Ze();
    i = c, o.appendChild(s), o.appendChild(i);
  }
  const r = o.querySelector(
    "label#flottform-status-bar-overall-progress"
  );
  i.value = e * 100, i.innerText = `${e * 100}%`, r.innerText = `Receiving file ${t + 1} of ${n}`;
};
export {
  gt as ConnectionManager,
  en as FlottformFileInputClient,
  Me as FlottformFileInputHost,
  nn as FlottformTextInputClient,
  Ne as FlottformTextInputHost,
  on as createDefaultFlottformComponent
};
//# sourceMappingURL=flottform-bundle.js.map
