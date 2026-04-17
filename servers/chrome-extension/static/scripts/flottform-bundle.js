var gt = Object.defineProperty;
var pt = (o, r, t) => r in o ? gt(o, r, { enumerable: !0, configurable: !0, writable: !0, value: t }) : o[r] = t;
var u = (o, r, t) => pt(o, typeof r != "symbol" ? r + "" : r, t);
const q = class q {
  constructor() {
    u(this, "activeConnections");
    this.activeConnections = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    return q.instance || (q.instance = new q()), q.instance;
  }
  addConnection(r, t) {
    this.activeConnections.set(r, t);
  }
  getConnection(r) {
    return this.activeConnections.get(r);
  }
  closeAllConnections() {
    this.activeConnections.forEach((r) => {
      r.close();
    });
  }
  removeConnection(r) {
    this.activeConnections.delete(r);
  }
};
u(q, "instance");
let Ae = q;
var H = {}, X, Be;
function mt() {
  return Be || (Be = 1, X = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), X;
}
var ee = {}, U = {}, ve;
function z() {
  if (ve) return U;
  ve = 1;
  let o;
  const r = [
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
  return U.getSymbolSize = function(e) {
    if (!e) throw new Error('"version" cannot be null or undefined');
    if (e < 1 || e > 40) throw new Error('"version" should be in range from 1 to 40');
    return e * 4 + 17;
  }, U.getSymbolTotalCodewords = function(e) {
    return r[e];
  }, U.getBCHDigit = function(t) {
    let e = 0;
    for (; t !== 0; )
      e++, t >>>= 1;
    return e;
  }, U.setToSJISFunction = function(e) {
    if (typeof e != "function")
      throw new Error('"toSJISFunc" is not a valid function.');
    o = e;
  }, U.isKanjiModeEnabled = function() {
    return typeof o < "u";
  }, U.toSJIS = function(e) {
    return o(e);
  }, U;
}
var te = {}, Le;
function Ee() {
  return Le || (Le = 1, function(o) {
    o.L = { bit: 1 }, o.M = { bit: 0 }, o.Q = { bit: 3 }, o.H = { bit: 2 };
    function r(t) {
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
    }, o.from = function(e, n) {
      if (o.isValid(e))
        return e;
      try {
        return r(e);
      } catch {
        return n;
      }
    };
  }(te)), te;
}
var ne, Me;
function Ct() {
  if (Me) return ne;
  Me = 1;
  function o() {
    this.buffer = [], this.length = 0;
  }
  return o.prototype = {
    get: function(r) {
      const t = Math.floor(r / 8);
      return (this.buffer[t] >>> 7 - r % 8 & 1) === 1;
    },
    put: function(r, t) {
      for (let e = 0; e < t; e++)
        this.putBit((r >>> t - e - 1 & 1) === 1);
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(r) {
      const t = Math.floor(this.length / 8);
      this.buffer.length <= t && this.buffer.push(0), r && (this.buffer[t] |= 128 >>> this.length % 8), this.length++;
    }
  }, ne = o, ne;
}
var ie, Re;
function wt() {
  if (Re) return ie;
  Re = 1;
  function o(r) {
    if (!r || r < 1)
      throw new Error("BitMatrix size must be defined and greater than 0");
    this.size = r, this.data = new Uint8Array(r * r), this.reservedBit = new Uint8Array(r * r);
  }
  return o.prototype.set = function(r, t, e, n) {
    const i = r * this.size + t;
    this.data[i] = e, n && (this.reservedBit[i] = !0);
  }, o.prototype.get = function(r, t) {
    return this.data[r * this.size + t];
  }, o.prototype.xor = function(r, t, e) {
    this.data[r * this.size + t] ^= e;
  }, o.prototype.isReserved = function(r, t) {
    return this.reservedBit[r * this.size + t];
  }, ie = o, ie;
}
var oe = {}, Ne;
function yt() {
  return Ne || (Ne = 1, function(o) {
    const r = z().getSymbolSize;
    o.getRowColCoords = function(e) {
      if (e === 1) return [];
      const n = Math.floor(e / 7) + 2, i = r(e), s = i === 145 ? 26 : Math.ceil((i - 13) / (2 * n - 2)) * 2, a = [i - 7];
      for (let c = 1; c < n - 1; c++)
        a[c] = a[c - 1] - s;
      return a.push(6), a.reverse();
    }, o.getPositions = function(e) {
      const n = [], i = o.getRowColCoords(e), s = i.length;
      for (let a = 0; a < s; a++)
        for (let c = 0; c < s; c++)
          a === 0 && c === 0 || // top-left
          a === 0 && c === s - 1 || // bottom-left
          a === s - 1 && c === 0 || n.push([i[a], i[c]]);
      return n;
    };
  }(oe)), oe;
}
var re = {}, De;
function bt() {
  if (De) return re;
  De = 1;
  const o = z().getSymbolSize, r = 7;
  return re.getPositions = function(e) {
    const n = o(e);
    return [
      // top-left
      [0, 0],
      // top-right
      [n - r, 0],
      // bottom-left
      [0, n - r]
    ];
  }, re;
}
var se = {}, ke;
function St() {
  return ke || (ke = 1, function(o) {
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
    const r = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    o.isValid = function(n) {
      return n != null && n !== "" && !isNaN(n) && n >= 0 && n <= 7;
    }, o.from = function(n) {
      return o.isValid(n) ? parseInt(n, 10) : void 0;
    }, o.getPenaltyN1 = function(n) {
      const i = n.size;
      let s = 0, a = 0, c = 0, l = null, h = null;
      for (let f = 0; f < i; f++) {
        a = c = 0, l = h = null;
        for (let g = 0; g < i; g++) {
          let d = n.get(f, g);
          d === l ? a++ : (a >= 5 && (s += r.N1 + (a - 5)), l = d, a = 1), d = n.get(g, f), d === h ? c++ : (c >= 5 && (s += r.N1 + (c - 5)), h = d, c = 1);
        }
        a >= 5 && (s += r.N1 + (a - 5)), c >= 5 && (s += r.N1 + (c - 5));
      }
      return s;
    }, o.getPenaltyN2 = function(n) {
      const i = n.size;
      let s = 0;
      for (let a = 0; a < i - 1; a++)
        for (let c = 0; c < i - 1; c++) {
          const l = n.get(a, c) + n.get(a, c + 1) + n.get(a + 1, c) + n.get(a + 1, c + 1);
          (l === 4 || l === 0) && s++;
        }
      return s * r.N2;
    }, o.getPenaltyN3 = function(n) {
      const i = n.size;
      let s = 0, a = 0, c = 0;
      for (let l = 0; l < i; l++) {
        a = c = 0;
        for (let h = 0; h < i; h++)
          a = a << 1 & 2047 | n.get(l, h), h >= 10 && (a === 1488 || a === 93) && s++, c = c << 1 & 2047 | n.get(h, l), h >= 10 && (c === 1488 || c === 93) && s++;
      }
      return s * r.N3;
    }, o.getPenaltyN4 = function(n) {
      let i = 0;
      const s = n.data.length;
      for (let c = 0; c < s; c++) i += n.data[c];
      return Math.abs(Math.ceil(i * 100 / s / 5) - 10) * r.N4;
    };
    function t(e, n, i) {
      switch (e) {
        case o.Patterns.PATTERN000:
          return (n + i) % 2 === 0;
        case o.Patterns.PATTERN001:
          return n % 2 === 0;
        case o.Patterns.PATTERN010:
          return i % 3 === 0;
        case o.Patterns.PATTERN011:
          return (n + i) % 3 === 0;
        case o.Patterns.PATTERN100:
          return (Math.floor(n / 2) + Math.floor(i / 3)) % 2 === 0;
        case o.Patterns.PATTERN101:
          return n * i % 2 + n * i % 3 === 0;
        case o.Patterns.PATTERN110:
          return (n * i % 2 + n * i % 3) % 2 === 0;
        case o.Patterns.PATTERN111:
          return (n * i % 3 + (n + i) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + e);
      }
    }
    o.applyMask = function(n, i) {
      const s = i.size;
      for (let a = 0; a < s; a++)
        for (let c = 0; c < s; c++)
          i.isReserved(c, a) || i.xor(c, a, t(n, c, a));
    }, o.getBestMask = function(n, i) {
      const s = Object.keys(o.Patterns).length;
      let a = 0, c = 1 / 0;
      for (let l = 0; l < s; l++) {
        i(l), o.applyMask(l, n);
        const h = o.getPenaltyN1(n) + o.getPenaltyN2(n) + o.getPenaltyN3(n) + o.getPenaltyN4(n);
        o.applyMask(l, n), h < c && (c = h, a = l);
      }
      return a;
    };
  }(se)), se;
}
var G = {}, Ue;
function it() {
  if (Ue) return G;
  Ue = 1;
  const o = Ee(), r = [
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
  ], t = [
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
  return G.getBlocksCount = function(n, i) {
    switch (i) {
      case o.L:
        return r[(n - 1) * 4 + 0];
      case o.M:
        return r[(n - 1) * 4 + 1];
      case o.Q:
        return r[(n - 1) * 4 + 2];
      case o.H:
        return r[(n - 1) * 4 + 3];
      default:
        return;
    }
  }, G.getTotalCodewordsCount = function(n, i) {
    switch (i) {
      case o.L:
        return t[(n - 1) * 4 + 0];
      case o.M:
        return t[(n - 1) * 4 + 1];
      case o.Q:
        return t[(n - 1) * 4 + 2];
      case o.H:
        return t[(n - 1) * 4 + 3];
      default:
        return;
    }
  }, G;
}
var ae = {}, O = {}, qe;
function Ft() {
  if (qe) return O;
  qe = 1;
  const o = new Uint8Array(512), r = new Uint8Array(256);
  return function() {
    let e = 1;
    for (let n = 0; n < 255; n++)
      o[n] = e, r[e] = n, e <<= 1, e & 256 && (e ^= 285);
    for (let n = 255; n < 512; n++)
      o[n] = o[n - 255];
  }(), O.log = function(e) {
    if (e < 1) throw new Error("log(" + e + ")");
    return r[e];
  }, O.exp = function(e) {
    return o[e];
  }, O.mul = function(e, n) {
    return e === 0 || n === 0 ? 0 : o[r[e] + r[n]];
  }, O;
}
var ze;
function Et() {
  return ze || (ze = 1, function(o) {
    const r = Ft();
    o.mul = function(e, n) {
      const i = new Uint8Array(e.length + n.length - 1);
      for (let s = 0; s < e.length; s++)
        for (let a = 0; a < n.length; a++)
          i[s + a] ^= r.mul(e[s], n[a]);
      return i;
    }, o.mod = function(e, n) {
      let i = new Uint8Array(e);
      for (; i.length - n.length >= 0; ) {
        const s = i[0];
        for (let c = 0; c < n.length; c++)
          i[c] ^= r.mul(n[c], s);
        let a = 0;
        for (; a < i.length && i[a] === 0; ) a++;
        i = i.slice(a);
      }
      return i;
    }, o.generateECPolynomial = function(e) {
      let n = new Uint8Array([1]);
      for (let i = 0; i < e; i++)
        n = o.mul(n, new Uint8Array([1, r.exp(i)]));
      return n;
    };
  }(ae)), ae;
}
var ce, _e;
function It() {
  if (_e) return ce;
  _e = 1;
  const o = Et();
  function r(t) {
    this.genPoly = void 0, this.degree = t, this.degree && this.initialize(this.degree);
  }
  return r.prototype.initialize = function(e) {
    this.degree = e, this.genPoly = o.generateECPolynomial(this.degree);
  }, r.prototype.encode = function(e) {
    if (!this.genPoly)
      throw new Error("Encoder not initialized");
    const n = new Uint8Array(e.length + this.degree);
    n.set(e);
    const i = o.mod(n, this.genPoly), s = this.degree - i.length;
    if (s > 0) {
      const a = new Uint8Array(this.degree);
      return a.set(i, s), a;
    }
    return i;
  }, ce = r, ce;
}
var le = {}, ue = {}, he = {}, $e;
function ot() {
  return $e || ($e = 1, he.isValid = function(r) {
    return !isNaN(r) && r >= 1 && r <= 40;
  }), he;
}
var R = {}, He;
function rt() {
  if (He) return R;
  He = 1;
  const o = "[0-9]+", r = "[A-Z $%*+\\-./:]+";
  let t = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  t = t.replace(/u/g, "\\u");
  const e = "(?:(?![A-Z0-9 $%*+\\-./:]|" + t + `)(?:.|[\r
]))+`;
  R.KANJI = new RegExp(t, "g"), R.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), R.BYTE = new RegExp(e, "g"), R.NUMERIC = new RegExp(o, "g"), R.ALPHANUMERIC = new RegExp(r, "g");
  const n = new RegExp("^" + t + "$"), i = new RegExp("^" + o + "$"), s = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return R.testKanji = function(c) {
    return n.test(c);
  }, R.testNumeric = function(c) {
    return i.test(c);
  }, R.testAlphanumeric = function(c) {
    return s.test(c);
  }, R;
}
var xe;
function _() {
  return xe || (xe = 1, function(o) {
    const r = ot(), t = rt();
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
    }, o.getCharCountIndicator = function(i, s) {
      if (!i.ccBits) throw new Error("Invalid mode: " + i);
      if (!r.isValid(s))
        throw new Error("Invalid version: " + s);
      return s >= 1 && s < 10 ? i.ccBits[0] : s < 27 ? i.ccBits[1] : i.ccBits[2];
    }, o.getBestModeForData = function(i) {
      return t.testNumeric(i) ? o.NUMERIC : t.testAlphanumeric(i) ? o.ALPHANUMERIC : t.testKanji(i) ? o.KANJI : o.BYTE;
    }, o.toString = function(i) {
      if (i && i.id) return i.id;
      throw new Error("Invalid mode");
    }, o.isValid = function(i) {
      return i && i.bit && i.ccBits;
    };
    function e(n) {
      if (typeof n != "string")
        throw new Error("Param is not a string");
      switch (n.toLowerCase()) {
        case "numeric":
          return o.NUMERIC;
        case "alphanumeric":
          return o.ALPHANUMERIC;
        case "kanji":
          return o.KANJI;
        case "byte":
          return o.BYTE;
        default:
          throw new Error("Unknown mode: " + n);
      }
    }
    o.from = function(i, s) {
      if (o.isValid(i))
        return i;
      try {
        return e(i);
      } catch {
        return s;
      }
    };
  }(ue)), ue;
}
var Oe;
function Pt() {
  return Oe || (Oe = 1, function(o) {
    const r = z(), t = it(), e = Ee(), n = _(), i = ot(), s = 7973, a = r.getBCHDigit(s);
    function c(g, d, T) {
      for (let I = 1; I <= 40; I++)
        if (d <= o.getCapacity(I, T, g))
          return I;
    }
    function l(g, d) {
      return n.getCharCountIndicator(g, d) + 4;
    }
    function h(g, d) {
      let T = 0;
      return g.forEach(function(I) {
        const L = l(I.mode, d);
        T += L + I.getBitsLength();
      }), T;
    }
    function f(g, d) {
      for (let T = 1; T <= 40; T++)
        if (h(g, T) <= o.getCapacity(T, d, n.MIXED))
          return T;
    }
    o.from = function(d, T) {
      return i.isValid(d) ? parseInt(d, 10) : T;
    }, o.getCapacity = function(d, T, I) {
      if (!i.isValid(d))
        throw new Error("Invalid QR Code version");
      typeof I > "u" && (I = n.BYTE);
      const L = r.getSymbolTotalCodewords(d), y = t.getTotalCodewordsCount(d, T), B = (L - y) * 8;
      if (I === n.MIXED) return B;
      const P = B - l(I, d);
      switch (I) {
        case n.NUMERIC:
          return Math.floor(P / 10 * 3);
        case n.ALPHANUMERIC:
          return Math.floor(P / 11 * 2);
        case n.KANJI:
          return Math.floor(P / 13);
        case n.BYTE:
        default:
          return Math.floor(P / 8);
      }
    }, o.getBestVersionForData = function(d, T) {
      let I;
      const L = e.from(T, e.M);
      if (Array.isArray(d)) {
        if (d.length > 1)
          return f(d, L);
        if (d.length === 0)
          return 1;
        I = d[0];
      } else
        I = d;
      return c(I.mode, I.getLength(), L);
    }, o.getEncodedBits = function(d) {
      if (!i.isValid(d) || d < 7)
        throw new Error("Invalid QR Code version");
      let T = d << 12;
      for (; r.getBCHDigit(T) - a >= 0; )
        T ^= s << r.getBCHDigit(T) - a;
      return d << 12 | T;
    };
  }(le)), le;
}
var fe = {}, Ve;
function Tt() {
  if (Ve) return fe;
  Ve = 1;
  const o = z(), r = 1335, t = 21522, e = o.getBCHDigit(r);
  return fe.getEncodedBits = function(i, s) {
    const a = i.bit << 3 | s;
    let c = a << 10;
    for (; o.getBCHDigit(c) - e >= 0; )
      c ^= r << o.getBCHDigit(c) - e;
    return (a << 10 | c) ^ t;
  }, fe;
}
var de = {}, ge, Je;
function At() {
  if (Je) return ge;
  Je = 1;
  const o = _();
  function r(t) {
    this.mode = o.NUMERIC, this.data = t.toString();
  }
  return r.getBitsLength = function(e) {
    return 10 * Math.floor(e / 3) + (e % 3 ? e % 3 * 3 + 1 : 0);
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(e) {
    let n, i, s;
    for (n = 0; n + 3 <= this.data.length; n += 3)
      i = this.data.substr(n, 3), s = parseInt(i, 10), e.put(s, 10);
    const a = this.data.length - n;
    a > 0 && (i = this.data.substr(n), s = parseInt(i, 10), e.put(s, a * 3 + 1));
  }, ge = r, ge;
}
var pe, Ke;
function Bt() {
  if (Ke) return pe;
  Ke = 1;
  const o = _(), r = [
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
  function t(e) {
    this.mode = o.ALPHANUMERIC, this.data = e;
  }
  return t.getBitsLength = function(n) {
    return 11 * Math.floor(n / 2) + 6 * (n % 2);
  }, t.prototype.getLength = function() {
    return this.data.length;
  }, t.prototype.getBitsLength = function() {
    return t.getBitsLength(this.data.length);
  }, t.prototype.write = function(n) {
    let i;
    for (i = 0; i + 2 <= this.data.length; i += 2) {
      let s = r.indexOf(this.data[i]) * 45;
      s += r.indexOf(this.data[i + 1]), n.put(s, 11);
    }
    this.data.length % 2 && n.put(r.indexOf(this.data[i]), 6);
  }, pe = t, pe;
}
var me, Ge;
function vt() {
  if (Ge) return me;
  Ge = 1;
  const o = _();
  function r(t) {
    this.mode = o.BYTE, typeof t == "string" ? this.data = new TextEncoder().encode(t) : this.data = new Uint8Array(t);
  }
  return r.getBitsLength = function(e) {
    return e * 8;
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(t) {
    for (let e = 0, n = this.data.length; e < n; e++)
      t.put(this.data[e], 8);
  }, me = r, me;
}
var Ce, je;
function Lt() {
  if (je) return Ce;
  je = 1;
  const o = _(), r = z();
  function t(e) {
    this.mode = o.KANJI, this.data = e;
  }
  return t.getBitsLength = function(n) {
    return n * 13;
  }, t.prototype.getLength = function() {
    return this.data.length;
  }, t.prototype.getBitsLength = function() {
    return t.getBitsLength(this.data.length);
  }, t.prototype.write = function(e) {
    let n;
    for (n = 0; n < this.data.length; n++) {
      let i = r.toSJIS(this.data[n]);
      if (i >= 33088 && i <= 40956)
        i -= 33088;
      else if (i >= 57408 && i <= 60351)
        i -= 49472;
      else
        throw new Error(
          "Invalid SJIS character: " + this.data[n] + `
Make sure your charset is UTF-8`
        );
      i = (i >>> 8 & 255) * 192 + (i & 255), e.put(i, 13);
    }
  }, Ce = t, Ce;
}
var we = { exports: {} }, Ye;
function Mt() {
  return Ye || (Ye = 1, function(o) {
    var r = {
      single_source_shortest_paths: function(t, e, n) {
        var i = {}, s = {};
        s[e] = 0;
        var a = r.PriorityQueue.make();
        a.push(e, 0);
        for (var c, l, h, f, g, d, T, I, L; !a.empty(); ) {
          c = a.pop(), l = c.value, f = c.cost, g = t[l] || {};
          for (h in g)
            g.hasOwnProperty(h) && (d = g[h], T = f + d, I = s[h], L = typeof s[h] > "u", (L || I > T) && (s[h] = T, a.push(h, T), i[h] = l));
        }
        if (typeof n < "u" && typeof s[n] > "u") {
          var y = ["Could not find a path from ", e, " to ", n, "."].join("");
          throw new Error(y);
        }
        return i;
      },
      extract_shortest_path_from_predecessor_list: function(t, e) {
        for (var n = [], i = e; i; )
          n.push(i), t[i], i = t[i];
        return n.reverse(), n;
      },
      find_path: function(t, e, n) {
        var i = r.single_source_shortest_paths(t, e, n);
        return r.extract_shortest_path_from_predecessor_list(
          i,
          n
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(t) {
          var e = r.PriorityQueue, n = {}, i;
          t = t || {};
          for (i in e)
            e.hasOwnProperty(i) && (n[i] = e[i]);
          return n.queue = [], n.sorter = t.sorter || e.default_sorter, n;
        },
        default_sorter: function(t, e) {
          return t.cost - e.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(t, e) {
          var n = { value: t, cost: e };
          this.queue.push(n), this.queue.sort(this.sorter);
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
    o.exports = r;
  }(we)), we.exports;
}
var Qe;
function Rt() {
  return Qe || (Qe = 1, function(o) {
    const r = _(), t = At(), e = Bt(), n = vt(), i = Lt(), s = rt(), a = z(), c = Mt();
    function l(y) {
      return unescape(encodeURIComponent(y)).length;
    }
    function h(y, B, P) {
      const b = [];
      let M;
      for (; (M = y.exec(P)) !== null; )
        b.push({
          data: M[0],
          index: M.index,
          mode: B,
          length: M[0].length
        });
      return b;
    }
    function f(y) {
      const B = h(s.NUMERIC, r.NUMERIC, y), P = h(s.ALPHANUMERIC, r.ALPHANUMERIC, y);
      let b, M;
      return a.isKanjiModeEnabled() ? (b = h(s.BYTE, r.BYTE, y), M = h(s.KANJI, r.KANJI, y)) : (b = h(s.BYTE_KANJI, r.BYTE, y), M = []), B.concat(P, b, M).sort(function(F, S) {
        return F.index - S.index;
      }).map(function(F) {
        return {
          data: F.data,
          mode: F.mode,
          length: F.length
        };
      });
    }
    function g(y, B) {
      switch (B) {
        case r.NUMERIC:
          return t.getBitsLength(y);
        case r.ALPHANUMERIC:
          return e.getBitsLength(y);
        case r.KANJI:
          return i.getBitsLength(y);
        case r.BYTE:
          return n.getBitsLength(y);
      }
    }
    function d(y) {
      return y.reduce(function(B, P) {
        const b = B.length - 1 >= 0 ? B[B.length - 1] : null;
        return b && b.mode === P.mode ? (B[B.length - 1].data += P.data, B) : (B.push(P), B);
      }, []);
    }
    function T(y) {
      const B = [];
      for (let P = 0; P < y.length; P++) {
        const b = y[P];
        switch (b.mode) {
          case r.NUMERIC:
            B.push([
              b,
              { data: b.data, mode: r.ALPHANUMERIC, length: b.length },
              { data: b.data, mode: r.BYTE, length: b.length }
            ]);
            break;
          case r.ALPHANUMERIC:
            B.push([
              b,
              { data: b.data, mode: r.BYTE, length: b.length }
            ]);
            break;
          case r.KANJI:
            B.push([
              b,
              { data: b.data, mode: r.BYTE, length: l(b.data) }
            ]);
            break;
          case r.BYTE:
            B.push([
              { data: b.data, mode: r.BYTE, length: l(b.data) }
            ]);
        }
      }
      return B;
    }
    function I(y, B) {
      const P = {}, b = { start: {} };
      let M = ["start"];
      for (let p = 0; p < y.length; p++) {
        const F = y[p], S = [];
        for (let m = 0; m < F.length; m++) {
          const A = F[m], C = "" + p + m;
          S.push(C), P[C] = { node: A, lastCount: 0 }, b[C] = {};
          for (let E = 0; E < M.length; E++) {
            const w = M[E];
            P[w] && P[w].node.mode === A.mode ? (b[w][C] = g(P[w].lastCount + A.length, A.mode) - g(P[w].lastCount, A.mode), P[w].lastCount += A.length) : (P[w] && (P[w].lastCount = A.length), b[w][C] = g(A.length, A.mode) + 4 + r.getCharCountIndicator(A.mode, B));
          }
        }
        M = S;
      }
      for (let p = 0; p < M.length; p++)
        b[M[p]].end = 0;
      return { map: b, table: P };
    }
    function L(y, B) {
      let P;
      const b = r.getBestModeForData(y);
      if (P = r.from(B, b), P !== r.BYTE && P.bit < b.bit)
        throw new Error('"' + y + '" cannot be encoded with mode ' + r.toString(P) + `.
 Suggested mode is: ` + r.toString(b));
      switch (P === r.KANJI && !a.isKanjiModeEnabled() && (P = r.BYTE), P) {
        case r.NUMERIC:
          return new t(y);
        case r.ALPHANUMERIC:
          return new e(y);
        case r.KANJI:
          return new i(y);
        case r.BYTE:
          return new n(y);
      }
    }
    o.fromArray = function(B) {
      return B.reduce(function(P, b) {
        return typeof b == "string" ? P.push(L(b, null)) : b.data && P.push(L(b.data, b.mode)), P;
      }, []);
    }, o.fromString = function(B, P) {
      const b = f(B, a.isKanjiModeEnabled()), M = T(b), p = I(M, P), F = c.find_path(p.map, "start", "end"), S = [];
      for (let m = 1; m < F.length - 1; m++)
        S.push(p.table[F[m]].node);
      return o.fromArray(d(S));
    }, o.rawSplit = function(B) {
      return o.fromArray(
        f(B, a.isKanjiModeEnabled())
      );
    };
  }(de)), de;
}
var We;
function Nt() {
  if (We) return ee;
  We = 1;
  const o = z(), r = Ee(), t = Ct(), e = wt(), n = yt(), i = bt(), s = St(), a = it(), c = It(), l = Pt(), h = Tt(), f = _(), g = Rt();
  function d(p, F) {
    const S = p.size, m = i.getPositions(F);
    for (let A = 0; A < m.length; A++) {
      const C = m[A][0], E = m[A][1];
      for (let w = -1; w <= 7; w++)
        if (!(C + w <= -1 || S <= C + w))
          for (let v = -1; v <= 7; v++)
            E + v <= -1 || S <= E + v || (w >= 0 && w <= 6 && (v === 0 || v === 6) || v >= 0 && v <= 6 && (w === 0 || w === 6) || w >= 2 && w <= 4 && v >= 2 && v <= 4 ? p.set(C + w, E + v, !0, !0) : p.set(C + w, E + v, !1, !0));
    }
  }
  function T(p) {
    const F = p.size;
    for (let S = 8; S < F - 8; S++) {
      const m = S % 2 === 0;
      p.set(S, 6, m, !0), p.set(6, S, m, !0);
    }
  }
  function I(p, F) {
    const S = n.getPositions(F);
    for (let m = 0; m < S.length; m++) {
      const A = S[m][0], C = S[m][1];
      for (let E = -2; E <= 2; E++)
        for (let w = -2; w <= 2; w++)
          E === -2 || E === 2 || w === -2 || w === 2 || E === 0 && w === 0 ? p.set(A + E, C + w, !0, !0) : p.set(A + E, C + w, !1, !0);
    }
  }
  function L(p, F) {
    const S = p.size, m = l.getEncodedBits(F);
    let A, C, E;
    for (let w = 0; w < 18; w++)
      A = Math.floor(w / 3), C = w % 3 + S - 8 - 3, E = (m >> w & 1) === 1, p.set(A, C, E, !0), p.set(C, A, E, !0);
  }
  function y(p, F, S) {
    const m = p.size, A = h.getEncodedBits(F, S);
    let C, E;
    for (C = 0; C < 15; C++)
      E = (A >> C & 1) === 1, C < 6 ? p.set(C, 8, E, !0) : C < 8 ? p.set(C + 1, 8, E, !0) : p.set(m - 15 + C, 8, E, !0), C < 8 ? p.set(8, m - C - 1, E, !0) : C < 9 ? p.set(8, 15 - C - 1 + 1, E, !0) : p.set(8, 15 - C - 1, E, !0);
    p.set(m - 8, 8, 1, !0);
  }
  function B(p, F) {
    const S = p.size;
    let m = -1, A = S - 1, C = 7, E = 0;
    for (let w = S - 1; w > 0; w -= 2)
      for (w === 6 && w--; ; ) {
        for (let v = 0; v < 2; v++)
          if (!p.isReserved(A, w - v)) {
            let k = !1;
            E < F.length && (k = (F[E] >>> C & 1) === 1), p.set(A, w - v, k), C--, C === -1 && (E++, C = 7);
          }
        if (A += m, A < 0 || S <= A) {
          A -= m, m = -m;
          break;
        }
      }
  }
  function P(p, F, S) {
    const m = new t();
    S.forEach(function(v) {
      m.put(v.mode.bit, 4), m.put(v.getLength(), f.getCharCountIndicator(v.mode, p)), v.write(m);
    });
    const A = o.getSymbolTotalCodewords(p), C = a.getTotalCodewordsCount(p, F), E = (A - C) * 8;
    for (m.getLengthInBits() + 4 <= E && m.put(0, 4); m.getLengthInBits() % 8 !== 0; )
      m.putBit(0);
    const w = (E - m.getLengthInBits()) / 8;
    for (let v = 0; v < w; v++)
      m.put(v % 2 ? 17 : 236, 8);
    return b(m, p, F);
  }
  function b(p, F, S) {
    const m = o.getSymbolTotalCodewords(F), A = a.getTotalCodewordsCount(F, S), C = m - A, E = a.getBlocksCount(F, S), w = m % E, v = E - w, k = Math.floor(m / E), x = Math.floor(C / E), ht = x + 1, Ie = k - x, ft = new c(Ie);
    let Y = 0;
    const K = new Array(E), Pe = new Array(E);
    let Q = 0;
    const dt = new Uint8Array(p.buffer);
    for (let $ = 0; $ < E; $++) {
      const Z = $ < v ? x : ht;
      K[$] = dt.slice(Y, Y + Z), Pe[$] = ft.encode(K[$]), Y += Z, Q = Math.max(Q, Z);
    }
    const W = new Uint8Array(m);
    let Te = 0, N, D;
    for (N = 0; N < Q; N++)
      for (D = 0; D < E; D++)
        N < K[D].length && (W[Te++] = K[D][N]);
    for (N = 0; N < Ie; N++)
      for (D = 0; D < E; D++)
        W[Te++] = Pe[D][N];
    return W;
  }
  function M(p, F, S, m) {
    let A;
    if (Array.isArray(p))
      A = g.fromArray(p);
    else if (typeof p == "string") {
      let k = F;
      if (!k) {
        const x = g.rawSplit(p);
        k = l.getBestVersionForData(x, S);
      }
      A = g.fromString(p, k || 40);
    } else
      throw new Error("Invalid data");
    const C = l.getBestVersionForData(A, S);
    if (!C)
      throw new Error("The amount of data is too big to be stored in a QR Code");
    if (!F)
      F = C;
    else if (F < C)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + C + `.
`
      );
    const E = P(F, S, A), w = o.getSymbolSize(F), v = new e(w);
    return d(v, F), T(v), I(v, F), y(v, S, 0), F >= 7 && L(v, F), B(v, E), isNaN(m) && (m = s.getBestMask(
      v,
      y.bind(null, v, S)
    )), s.applyMask(m, v), y(v, S, m), {
      modules: v,
      version: F,
      errorCorrectionLevel: S,
      maskPattern: m,
      segments: A
    };
  }
  return ee.create = function(F, S) {
    if (typeof F > "u" || F === "")
      throw new Error("No input text");
    let m = r.M, A, C;
    return typeof S < "u" && (m = r.from(S.errorCorrectionLevel, r.M), A = l.from(S.version), C = s.from(S.maskPattern), S.toSJISFunc && o.setToSJISFunction(S.toSJISFunc)), M(F, A, m, C);
  }, ee;
}
var ye = {}, be = {}, Ze;
function st() {
  return Ze || (Ze = 1, function(o) {
    function r(t) {
      if (typeof t == "number" && (t = t.toString()), typeof t != "string")
        throw new Error("Color should be defined as hex string");
      let e = t.slice().replace("#", "").split("");
      if (e.length < 3 || e.length === 5 || e.length > 8)
        throw new Error("Invalid hex color: " + t);
      (e.length === 3 || e.length === 4) && (e = Array.prototype.concat.apply([], e.map(function(i) {
        return [i, i];
      }))), e.length === 6 && e.push("F", "F");
      const n = parseInt(e.join(""), 16);
      return {
        r: n >> 24 & 255,
        g: n >> 16 & 255,
        b: n >> 8 & 255,
        a: n & 255,
        hex: "#" + e.slice(0, 6).join("")
      };
    }
    o.getOptions = function(e) {
      e || (e = {}), e.color || (e.color = {});
      const n = typeof e.margin > "u" || e.margin === null || e.margin < 0 ? 4 : e.margin, i = e.width && e.width >= 21 ? e.width : void 0, s = e.scale || 4;
      return {
        width: i,
        scale: i ? 4 : s,
        margin: n,
        color: {
          dark: r(e.color.dark || "#000000ff"),
          light: r(e.color.light || "#ffffffff")
        },
        type: e.type,
        rendererOpts: e.rendererOpts || {}
      };
    }, o.getScale = function(e, n) {
      return n.width && n.width >= e + n.margin * 2 ? n.width / (e + n.margin * 2) : n.scale;
    }, o.getImageWidth = function(e, n) {
      const i = o.getScale(e, n);
      return Math.floor((e + n.margin * 2) * i);
    }, o.qrToImageData = function(e, n, i) {
      const s = n.modules.size, a = n.modules.data, c = o.getScale(s, i), l = Math.floor((s + i.margin * 2) * c), h = i.margin * c, f = [i.color.light, i.color.dark];
      for (let g = 0; g < l; g++)
        for (let d = 0; d < l; d++) {
          let T = (g * l + d) * 4, I = i.color.light;
          if (g >= h && d >= h && g < l - h && d < l - h) {
            const L = Math.floor((g - h) / c), y = Math.floor((d - h) / c);
            I = f[a[L * s + y] ? 1 : 0];
          }
          e[T++] = I.r, e[T++] = I.g, e[T++] = I.b, e[T] = I.a;
        }
    };
  }(be)), be;
}
var Xe;
function Dt() {
  return Xe || (Xe = 1, function(o) {
    const r = st();
    function t(n, i, s) {
      n.clearRect(0, 0, i.width, i.height), i.style || (i.style = {}), i.height = s, i.width = s, i.style.height = s + "px", i.style.width = s + "px";
    }
    function e() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    o.render = function(i, s, a) {
      let c = a, l = s;
      typeof c > "u" && (!s || !s.getContext) && (c = s, s = void 0), s || (l = e()), c = r.getOptions(c);
      const h = r.getImageWidth(i.modules.size, c), f = l.getContext("2d"), g = f.createImageData(h, h);
      return r.qrToImageData(g.data, i, c), t(f, l, h), f.putImageData(g, 0, 0), l;
    }, o.renderToDataURL = function(i, s, a) {
      let c = a;
      typeof c > "u" && (!s || !s.getContext) && (c = s, s = void 0), c || (c = {});
      const l = o.render(i, s, c), h = c.type || "image/png", f = c.rendererOpts || {};
      return l.toDataURL(h, f.quality);
    };
  }(ye)), ye;
}
var Se = {}, et;
function kt() {
  if (et) return Se;
  et = 1;
  const o = st();
  function r(n, i) {
    const s = n.a / 255, a = i + '="' + n.hex + '"';
    return s < 1 ? a + " " + i + '-opacity="' + s.toFixed(2).slice(1) + '"' : a;
  }
  function t(n, i, s) {
    let a = n + i;
    return typeof s < "u" && (a += " " + s), a;
  }
  function e(n, i, s) {
    let a = "", c = 0, l = !1, h = 0;
    for (let f = 0; f < n.length; f++) {
      const g = Math.floor(f % i), d = Math.floor(f / i);
      !g && !l && (l = !0), n[f] ? (h++, f > 0 && g > 0 && n[f - 1] || (a += l ? t("M", g + s, 0.5 + d + s) : t("m", c, 0), c = 0, l = !1), g + 1 < i && n[f + 1] || (a += t("h", h), h = 0)) : c++;
    }
    return a;
  }
  return Se.render = function(i, s, a) {
    const c = o.getOptions(s), l = i.modules.size, h = i.modules.data, f = l + c.margin * 2, g = c.color.light.a ? "<path " + r(c.color.light, "fill") + ' d="M0 0h' + f + "v" + f + 'H0z"/>' : "", d = "<path " + r(c.color.dark, "stroke") + ' d="' + e(h, l, c.margin) + '"/>', T = 'viewBox="0 0 ' + f + " " + f + '"', L = '<svg xmlns="http://www.w3.org/2000/svg" ' + (c.width ? 'width="' + c.width + '" height="' + c.width + '" ' : "") + T + ' shape-rendering="crispEdges">' + g + d + `</svg>
`;
    return typeof a == "function" && a(null, L), L;
  }, Se;
}
var tt;
function Ut() {
  if (tt) return H;
  tt = 1;
  const o = mt(), r = Nt(), t = Dt(), e = kt();
  function n(i, s, a, c, l) {
    const h = [].slice.call(arguments, 1), f = h.length, g = typeof h[f - 1] == "function";
    if (!g && !o())
      throw new Error("Callback required as last argument");
    if (g) {
      if (f < 2)
        throw new Error("Too few arguments provided");
      f === 2 ? (l = a, a = s, s = c = void 0) : f === 3 && (s.getContext && typeof l > "u" ? (l = c, c = void 0) : (l = c, c = a, a = s, s = void 0));
    } else {
      if (f < 1)
        throw new Error("Too few arguments provided");
      return f === 1 ? (a = s, s = c = void 0) : f === 2 && !s.getContext && (c = a, a = s, s = void 0), new Promise(function(d, T) {
        try {
          const I = r.create(a, c);
          d(i(I, s, c));
        } catch (I) {
          T(I);
        }
      });
    }
    try {
      const d = r.create(a, c);
      l(null, i(d, s, c));
    } catch (d) {
      l(d);
    }
  }
  return H.create = r.create, H.toCanvas = n.bind(null, t.render), H.toDataURL = n.bind(null, t.renderToDataURL), H.toString = n.bind(null, function(i, s, a) {
    return e.render(i, a);
  }), H;
}
var qt = Ut();
const V = 1e3, j = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302"]
    }
  ]
};
function zt() {
  return typeof crypto.randomUUID == "function" ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(
    /[018]/g,
    (o) => (+o ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +o / 4).toString(16)
  );
}
async function Fe(o) {
  return await (await fetch(o)).json();
}
function at(o, r) {
  for (const t of o)
    if (JSON.stringify(t) === JSON.stringify(r))
      return !0;
  return !1;
}
class J {
  constructor() {
    u(this, "eventListeners", {});
  }
  on(r, t) {
    const e = this.eventListeners[r] ?? /* @__PURE__ */ new Set();
    e.add(t), this.eventListeners[r] = e;
  }
  off(r, t) {
    const e = this.eventListeners[r];
    e && (e.delete(t), e.size === 0 && delete this.eventListeners[r]);
  }
  emit(r, ...t) {
    const e = this.eventListeners[r] ?? /* @__PURE__ */ new Set();
    for (const n of e)
      n(...t);
  }
}
class ct extends J {
}
class lt extends J {
  constructor({
    flottformApi: t,
    createClientUrl: e,
    rtcConfiguration: n,
    pollTimeForIceInMs: i,
    logger: s
  }) {
    super();
    u(this, "flottformApi");
    u(this, "createClientUrl");
    u(this, "rtcConfiguration");
    u(this, "pollTimeForIceInMs");
    u(this, "logger");
    u(this, "state", "new");
    u(this, "channelNumber", 0);
    u(this, "openPeerConnection", null);
    u(this, "dataChannel", null);
    u(this, "pollForIceTimer", null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    u(this, "changeState", (t, e) => {
      this.state = t, this.emit(t, e), this.logger.info(`State changed to: ${t}`, e ?? "");
    });
    u(this, "start", async () => {
      this.openPeerConnection && this.close();
      const t = (this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)).toString().replace(/\/$/, "");
      this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration), this.dataChannel = this.createDataChannel();
      const e = await this.openPeerConnection.createOffer();
      await this.openPeerConnection.setLocalDescription(e);
      const { endpointId: n, hostKey: i } = await this.createEndpoint(t, e);
      this.logger.log("Created endpoint", { endpointId: n, hostKey: i });
      const s = `${t}/${n}`, a = `${t}/${n}/host`, c = /* @__PURE__ */ new Set();
      await this.putHostInfo(a, i, c, e), this.setUpConnectionStateGathering(s), this.setupHostIceGathering(a, i, c, e), this.setupDataChannelForTransfer();
      const l = await this.createClientUrl({ endpointId: n });
      this.changeState("waiting-for-client", {
        qrCode: await qt.toDataURL(l),
        link: l,
        channel: this
      }), this.setupDataChannelListener();
    });
    u(this, "close", () => {
      this.openPeerConnection && (this.openPeerConnection.close(), this.openPeerConnection = null, this.stopPollingForConnection()), this.changeState("disconnected");
    });
    u(this, "setupDataChannelListener", () => {
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
    u(this, "setupHostIceGathering", (t, e, n, i) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to gather Host ICE candidates");
        return;
      }
      this.openPeerConnection.onicecandidate = async (s) => {
        this.logger.info(
          `onicecandidate - ${this.openPeerConnection.connectionState} - ${s.candidate}`
        ), s.candidate && (at(n, s.candidate) || (this.logger.log("host found new ice candidate! Adding it to our list"), n.add(s.candidate), await this.putHostInfo(t, e, n, i)));
      }, this.openPeerConnection.onicegatheringstatechange = async (s) => {
        this.logger.info(
          `onicegatheringstatechange - ${this.openPeerConnection.iceGatheringState} - ${s}`
        );
      }, this.openPeerConnection.onicecandidateerror = async (s) => {
        this.logger.error("peerConnection.onicecandidateerror", s);
      };
    });
    u(this, "setUpConnectionStateGathering", (t) => {
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
    u(this, "stopPollingForConnection", async () => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), this.pollForIceTimer = null;
    });
    u(this, "startPollingForConnection", async (t) => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), await this.pollForConnection(t), this.pollForIceTimer = setTimeout(() => {
        this.startPollingForConnection(t);
      }, this.pollTimeForIceInMs);
    });
    u(this, "createEndpoint", async (t, e) => (await fetch(`${t}/create`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ session: e })
    })).json());
    u(this, "fetchIceServers", async (t) => {
      const e = await fetch(`${t}/ice-server-credentials`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!e.ok)
        throw new Error("Fetching Error!");
      const n = await e.json();
      if (n.success === !1)
        throw new Error(n.message || "Unknown error occurred");
      return n.iceServers;
    });
    u(this, "pollForConnection", async (t) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to retrieve Client's details");
        return;
      }
      this.logger.log("polling for client ice candidates", this.openPeerConnection.iceGatheringState);
      const { clientInfo: e } = await Fe(t);
      e && this.state === "waiting-for-client" && (this.logger.log("Found a client that wants to connect!"), this.changeState("waiting-for-ice"), await this.openPeerConnection.setRemoteDescription(e.session));
      for (const n of (e == null ? void 0 : e.iceCandidates) ?? [])
        await this.openPeerConnection.addIceCandidate(n);
    });
    u(this, "setupDataChannelForTransfer", () => {
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
    u(this, "createDataChannel", () => {
      if (this.openPeerConnection === null)
        return this.changeState("error", "openPeerConnection is null. Unable to create a new Data Channel"), null;
      this.channelNumber++;
      const t = `data-channel-${this.channelNumber}`;
      return this.openPeerConnection.createDataChannel(t);
    });
    u(this, "putHostInfo", async (t, e, n, i) => {
      try {
        if (this.logger.log("Updating host info with new list of ice candidates"), !(await fetch(t, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hostKey: e,
            iceCandidates: [...n],
            session: i
          })
        })).ok)
          throw Error("Could not update host info");
      } catch (s) {
        this.changeState("error", s);
      }
    });
    this.flottformApi = t, this.createClientUrl = e, this.rtcConfiguration = n, this.pollTimeForIceInMs = i, this.logger = s, Promise.resolve().then(() => {
      this.changeState("new", { channel: this });
    });
  }
}
class _t extends ct {
  constructor({
    flottformApi: t,
    createClientUrl: e,
    inputField: n,
    rtcConfiguration: i = j,
    pollTimeForIceInMs: s = V,
    logger: a = console
  }) {
    super();
    u(this, "channel", null);
    u(this, "inputField");
    u(this, "logger");
    u(this, "filesMetaData", []);
    u(this, "filesTotalSize", 0);
    u(this, "receivedDataSize", 0);
    u(this, "currentFile", null);
    u(this, "link", "");
    u(this, "qrCode", "");
    u(this, "start", () => {
      var t;
      (t = this.channel) == null || t.start();
    });
    u(this, "close", () => {
      var t;
      (t = this.channel) == null || t.close();
    });
    u(this, "getLink", () => (this.link === "" && this.logger.error(
      "Flottform is currently establishing the connection. Link is unavailable for now!"
    ), this.link));
    u(this, "getQrCode", () => (this.qrCode === "" && this.logger.error(
      "Flottform is currently establishing the connection. qrCode is unavailable for now!"
    ), this.qrCode));
    u(this, "handleIncomingData", (t) => {
      var e, n, i;
      if (typeof t.data == "string") {
        const s = JSON.parse(t.data);
        s.type === "file-transfer-meta" ? (this.filesMetaData = s.filesQueue, this.currentFile = { index: 0, receivedSize: 0, arrayBuffer: [] }, this.filesTotalSize = s.totalSize, this.emit("receive")) : s.type === "transfer-complete" && (this.emit("done"), (e = this.channel) == null || e.close());
      } else if (t.data instanceof ArrayBuffer && this.currentFile) {
        this.currentFile.arrayBuffer.push(t.data), this.currentFile.receivedSize += t.data.byteLength, this.receivedDataSize += t.data.byteLength;
        const s = (n = this.filesMetaData[this.currentFile.index]) == null ? void 0 : n.name, a = (i = this.filesMetaData[this.currentFile.index]) == null ? void 0 : i.size, c = (this.currentFile.receivedSize / a).toFixed(
          2
        ), l = (this.receivedDataSize / this.filesTotalSize).toFixed(2);
        this.emit("progress", {
          fileIndex: this.currentFile.index,
          totalFileCount: this.filesMetaData.length,
          fileName: s,
          currentFileProgress: parseFloat(c),
          overallProgress: parseFloat(l)
        }), this.currentFile.receivedSize === a && (this.appendFileToInputField(this.currentFile.index), this.currentFile = {
          index: this.currentFile.index + 1,
          receivedSize: 0,
          arrayBuffer: []
        });
      }
    });
    u(this, "appendFileToInputField", (t) => {
      var a, c, l;
      const e = ((a = this.filesMetaData[t]) == null ? void 0 : a.name) ?? "no-name", n = ((c = this.filesMetaData[t]) == null ? void 0 : c.type) ?? "application/octet-stream", i = new File((l = this.currentFile) == null ? void 0 : l.arrayBuffer, e, {
        type: n
      });
      if (this.emit("single-file-transferred", i), !this.inputField) {
        this.logger.warn(
          "No input field provided!! You can listen to the 'single-file-transferred' event to handle the newly received file!"
        );
        return;
      }
      const s = new DataTransfer();
      if (this.inputField.files)
        for (const h of Array.from(this.inputField.files))
          s.items.add(h);
      this.inputField.multiple || (this.logger.warn(
        "The host's input field only supports one file. Incoming files from the client will overwrite any existing file, and only the last file received will remain attached."
      ), s.items.clear()), s.items.add(i), this.inputField.files = s.files;
    });
    u(this, "registerListeners", () => {
      var t, e, n, i, s, a, c;
      (t = this.channel) == null || t.on("new", () => {
        this.emit("new");
      }), (e = this.channel) == null || e.on("waiting-for-client", (l) => {
        this.emit("webrtc:waiting-for-client", l);
        const { qrCode: h, link: f } = l;
        this.emit("endpoint-created", { link: f, qrCode: h }), this.link = f, this.qrCode = h;
      }), (n = this.channel) == null || n.on("waiting-for-ice", () => {
        this.emit("webrtc:waiting-for-ice");
      }), (i = this.channel) == null || i.on("waiting-for-data", () => {
        this.emit("webrtc:waiting-for-file"), this.emit("connected");
      }), (s = this.channel) == null || s.on("receiving-data", (l) => {
        this.handleIncomingData(l);
      }), (a = this.channel) == null || a.on("disconnected", () => {
        this.emit("disconnected");
      }), (c = this.channel) == null || c.on("error", (l) => {
        this.emit("error", l);
      });
    });
    this.channel = new lt({
      flottformApi: t,
      createClientUrl: e,
      rtcConfiguration: i,
      pollTimeForIceInMs: s,
      logger: a
    }), this.inputField = n, this.logger = a, this.registerListeners();
  }
}
class ut extends J {
  // 128KB buffer threshold (maximum of 4 chunks in the buffer waiting to be sent over the network)
  constructor({
    endpointId: t,
    flottformApi: e,
    rtcConfiguration: n,
    pollTimeForIceInMs: i = V,
    logger: s = console
  }) {
    super();
    u(this, "flottformApi");
    u(this, "endpointId");
    u(this, "rtcConfiguration");
    u(this, "pollTimeForIceInMs");
    u(this, "logger");
    u(this, "state", "init");
    u(this, "openPeerConnection", null);
    u(this, "dataChannel", null);
    u(this, "pollForIceTimer", null);
    u(this, "BUFFER_THRESHOLD", 128 * 1024);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    u(this, "changeState", (t, e) => {
      this.state = t, this.emit(t, e), this.logger.info(`**Client State changed to: ${t}`, e ?? "");
    });
    u(this, "start", async () => {
      this.openPeerConnection && this.close(), (this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)).toString().replace(/\/$/, ""), this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration);
      const t = zt(), e = /* @__PURE__ */ new Set(), n = `${this.flottformApi}/${this.endpointId}`, i = `${this.flottformApi}/${this.endpointId}/client`;
      this.changeState("retrieving-info-from-endpoint");
      const { hostInfo: s } = await Fe(n);
      await this.openPeerConnection.setRemoteDescription(s.session);
      const a = await this.openPeerConnection.createAnswer();
      await this.openPeerConnection.setLocalDescription(a), this.setUpConnectionStateGathering(n), this.setUpClientIceGathering(i, t, e, a), this.openPeerConnection.ondatachannel = (c) => {
        this.logger.info(`ondatachannel: ${c.channel}`), this.changeState("connected"), this.dataChannel = c.channel, this.dataChannel.bufferedAmountLowThreshold = this.BUFFER_THRESHOLD, this.dataChannel.onbufferedamountlow = () => {
          this.emit("bufferedamountlow");
        }, this.dataChannel.onopen = (l) => {
          this.logger.info(`ondatachannel - onopen: ${l.type}`);
        };
      }, this.changeState("sending-client-info"), await this.putClientInfo(i, t, e, a), this.changeState("connecting-to-host"), this.startPollingForIceCandidates(n);
    });
    u(this, "close", () => {
      this.openPeerConnection && (this.openPeerConnection.close(), this.openPeerConnection = null, this.stopPollingForIceCandidates()), this.changeState("disconnected");
    });
    // sendData = (data: string | Blob | ArrayBuffer | ArrayBufferView) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    u(this, "sendData", (t) => {
      if (this.dataChannel == null) {
        this.changeState("error", "dataChannel is null. Unable to send the file to the Host!");
        return;
      } else if (!this.canSendMoreData()) {
        this.logger.warn("Data channel is full! Cannot send data at the moment");
        return;
      }
      this.dataChannel.send(t);
    });
    u(this, "canSendMoreData", () => this.dataChannel && this.dataChannel.bufferedAmount < this.dataChannel.bufferedAmountLowThreshold);
    u(this, "setUpClientIceGathering", (t, e, n, i) => {
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
        ), s.candidate && (at(n, s.candidate) || (this.logger.log("client found new ice candidate! Adding it to our list"), n.add(s.candidate), await this.putClientInfo(t, e, n, i)));
      }, this.openPeerConnection.onicegatheringstatechange = async () => {
        this.logger.info(`onicegatheringstatechange - ${this.openPeerConnection.iceGatheringState}`);
      }, this.openPeerConnection.onicecandidateerror = (s) => {
        this.logger.error(`onicecandidateerror - ${this.openPeerConnection.connectionState}`, s);
      };
    });
    u(this, "setUpConnectionStateGathering", (t) => {
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
    u(this, "stopPollingForIceCandidates", async () => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), this.pollForIceTimer = null;
    });
    u(this, "startPollingForIceCandidates", async (t) => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), await this.pollForConnection(t), this.pollForIceTimer = setTimeout(this.startPollingForIceCandidates, this.pollTimeForIceInMs);
    });
    u(this, "pollForConnection", async (t) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to retrieve Host's details");
        return;
      }
      this.logger.log("polling for host ice candidates", this.openPeerConnection.iceGatheringState);
      const { hostInfo: e } = await Fe(t);
      for (const n of e.iceCandidates)
        await this.openPeerConnection.addIceCandidate(n);
    });
    u(this, "putClientInfo", async (t, e, n, i) => {
      if (this.logger.log("Updating client info with new list of ice candidates"), !(await fetch(t, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey: e,
          iceCandidates: [...n],
          session: i
        })
      })).ok)
        throw Error("Could not update client info. Did another peer already connect?");
    });
    u(this, "fetchIceServers", async (t) => {
      const e = await fetch(`${t}/ice-server-credentials`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!e.ok)
        throw new Error("Fetching Error!");
      const n = await e.json();
      if (n.success === !1)
        throw new Error(n.message || "Unknown error occurred");
      return n.iceServers;
    });
    this.endpointId = t, this.flottformApi = e, this.rtcConfiguration = n, this.pollTimeForIceInMs = i, this.logger = s;
  }
}
class un extends J {
  constructor({
    endpointId: t,
    fileInput: e,
    flottformApi: n,
    rtcConfiguration: i = j,
    pollTimeForIceInMs: s = V,
    logger: a = console
  }) {
    super();
    u(this, "channel", null);
    u(this, "inputField");
    u(this, "chunkSize", 16384);
    // 16 KB chunks
    u(this, "filesMetaData", []);
    u(this, "filesArrayBuffer", []);
    u(this, "currentFileIndex", 0);
    u(this, "currentChunkIndex", 0);
    u(this, "allFilesSent", !1);
    u(this, "logger");
    u(this, "start", () => {
      var t;
      (t = this.channel) == null || t.start();
    });
    u(this, "close", () => {
      var t;
      (t = this.channel) == null || t.close();
    });
    u(this, "createMetaData", (t) => {
      if (!t.files) return null;
      const n = Array.from(t.files).map((i) => ({
        name: i.name,
        type: i.type,
        // We're dividing each file into chuncks no matter what the type of the file.
        size: i.size
      }));
      return {
        type: "file-transfer-meta",
        filesQueue: n,
        totalSize: n.reduce((i, s) => i + s.size, 0)
      };
    });
    u(this, "createArrayBuffers", async (t) => {
      if (!t.files) return null;
      const e = Array.from(t.files);
      return await Promise.all(e.map(async (n) => await n.arrayBuffer()));
    });
    u(this, "sendFiles", async () => {
      var n;
      const t = this.createMetaData(this.inputField), e = await this.createArrayBuffers(this.inputField);
      if (!t || !e)
        throw new Error("Can't find the files that you want to send!");
      this.filesMetaData = t.filesQueue, this.filesArrayBuffer = e, (n = this.channel) == null || n.sendData(JSON.stringify(t)), this.emit("sending"), this.startSendingFiles();
    });
    u(this, "startSendingFiles", () => {
      this.sendNextChunk();
    });
    u(this, "sendNextChunk", async () => {
      var s, a, c, l;
      const t = this.filesMetaData.length;
      if (this.allFilesSent || this.currentFileIndex >= t) {
        this.logger.log("All files are sent"), (s = this.channel) == null || s.sendData(JSON.stringify({ type: "transfer-complete" })), this.allFilesSent = !0, (a = this.channel) == null || a.off("bufferedamountlow", this.startSendingFiles), this.emit("done");
        return;
      }
      const e = this.filesArrayBuffer[this.currentFileIndex];
      if (!e)
        throw new Error(`Can't find the ArrayBuffer for the file number ${this.currentFileIndex}`);
      const n = e.byteLength, i = this.filesMetaData[this.currentFileIndex].name;
      for (; this.currentChunkIndex * this.chunkSize < n; ) {
        if (!((c = this.channel) != null && c.canSendMoreData())) {
          this.logger.log("Buffer is full. Pausing sending chunks!");
          break;
        }
        const h = (this.currentChunkIndex * this.chunkSize / n).toFixed(2);
        this.emit("progress", {
          fileIndex: this.currentFileIndex,
          fileName: i,
          progress: parseFloat(h)
        });
        const f = this.currentChunkIndex * this.chunkSize, g = Math.min((this.currentChunkIndex + 1) * this.chunkSize, n);
        (l = this.channel) == null || l.sendData(e.slice(f, g)), this.currentChunkIndex++;
      }
      this.currentChunkIndex * this.chunkSize >= n ? (this.logger.log(`File ${i} fully sent. Moving to next file.`), this.currentFileIndex++, this.currentChunkIndex = 0, this.sendNextChunk()) : setTimeout(this.sendNextChunk, 100);
    });
    u(this, "registerListeners", () => {
      var t, e, n, i, s, a, c, l, h, f;
      (t = this.channel) == null || t.on("init", () => {
      }), (e = this.channel) == null || e.on("retrieving-info-from-endpoint", () => {
      }), (n = this.channel) == null || n.on("sending-client-info", () => {
      }), (i = this.channel) == null || i.on("connecting-to-host", () => {
      }), (s = this.channel) == null || s.on("connected", () => {
        this.emit("connected");
      }), (a = this.channel) == null || a.on("connection-impossible", () => {
        this.emit("webrtc:connection-impossible");
      }), (c = this.channel) == null || c.on("done", () => {
        this.emit("done");
      }), (l = this.channel) == null || l.on("disconnected", () => {
        this.emit("disconnected");
      }), (h = this.channel) == null || h.on("error", (g) => {
        this.emit("error", g);
      }), (f = this.channel) == null || f.on("bufferedamountlow", this.startSendingFiles);
    });
    this.channel = new ut({
      endpointId: t,
      flottformApi: n,
      rtcConfiguration: i,
      pollTimeForIceInMs: s,
      logger: a
    }), this.inputField = e, this.logger = a, this.registerListeners();
  }
}
class hn extends J {
  constructor({
    endpointId: t,
    flottformApi: e,
    rtcConfiguration: n = j,
    pollTimeForIceInMs: i = V,
    logger: s = console
  }) {
    super();
    u(this, "channel", null);
    u(this, "logger");
    u(this, "start", () => {
      var t;
      (t = this.channel) == null || t.start();
    });
    u(this, "close", () => {
      var t;
      (t = this.channel) == null || t.close();
    });
    u(this, "sendText", (t) => {
      var e;
      this.emit("sending"), (e = this.channel) == null || e.sendData(t), this.emit("done");
    });
    u(this, "registerListeners", () => {
      var t, e, n, i, s, a, c, l, h;
      (t = this.channel) == null || t.on("init", () => {
      }), (e = this.channel) == null || e.on("retrieving-info-from-endpoint", () => {
      }), (n = this.channel) == null || n.on("sending-client-info", () => {
      }), (i = this.channel) == null || i.on("connecting-to-host", () => {
      }), (s = this.channel) == null || s.on("connected", () => {
        this.emit("connected");
      }), (a = this.channel) == null || a.on("connection-impossible", () => {
        this.emit("webrtc:connection-impossible");
      }), (c = this.channel) == null || c.on("done", () => {
        this.emit("done");
      }), (l = this.channel) == null || l.on("disconnected", () => {
        this.emit("disconnected");
      }), (h = this.channel) == null || h.on("error", (f) => {
        this.emit("error", f);
      });
    });
    this.channel = new ut({
      endpointId: t,
      flottformApi: e,
      rtcConfiguration: n,
      pollTimeForIceInMs: i,
      logger: s
    }), this.logger = s, this.registerListeners();
  }
}
class $t extends ct {
  constructor({
    flottformApi: t,
    createClientUrl: e,
    inputField: n = void 0,
    rtcConfiguration: i = j,
    pollTimeForIceInMs: s = V,
    logger: a = console
  }) {
    super();
    u(this, "channel", null);
    u(this, "logger");
    u(this, "link", "");
    u(this, "qrCode", "");
    u(this, "inputField");
    u(this, "start", () => {
      var t;
      (t = this.channel) == null || t.start();
    });
    u(this, "close", () => {
      var t;
      (t = this.channel) == null || t.close();
    });
    u(this, "getLink", () => (this.link === "" && this.logger.error(
      "Flottform is currently establishing the connection. Link is unavailable for now!"
    ), this.link));
    u(this, "getQrCode", () => (this.qrCode === "" && this.logger.error(
      "Flottform is currently establishing the connection. qrCode is unavailable for now!"
    ), this.qrCode));
    u(this, "handleIncomingData", (t) => {
      if (this.emit("receive"), this.emit("done", t.data), this.inputField) {
        this.inputField.value = t.data;
        const e = new Event("change");
        this.inputField.dispatchEvent(e);
      }
    });
    u(this, "registerListeners", () => {
      var t, e, n, i, s, a, c;
      (t = this.channel) == null || t.on("new", () => {
        this.emit("new");
      }), (e = this.channel) == null || e.on("waiting-for-client", (l) => {
        this.emit("webrtc:waiting-for-client", l);
        const { qrCode: h, link: f } = l;
        this.emit("endpoint-created", { link: f, qrCode: h }), this.link = f, this.qrCode = h;
      }), (n = this.channel) == null || n.on("waiting-for-ice", () => {
        this.emit("webrtc:waiting-for-ice");
      }), (i = this.channel) == null || i.on("waiting-for-data", () => {
        this.emit("webrtc:waiting-for-data"), this.emit("connected");
      }), (s = this.channel) == null || s.on("receiving-data", (l) => {
        this.handleIncomingData(l);
      }), (a = this.channel) == null || a.on("disconnected", () => {
        this.emit("disconnected");
      }), (c = this.channel) == null || c.on("error", (l) => {
        this.emit("error", l);
      });
    });
    this.channel = new lt({
      flottformApi: t,
      createClientUrl: e,
      rtcConfiguration: i,
      pollTimeForIceInMs: s,
      logger: a
    }), this.logger = a, this.inputField = n, this.registerListeners();
  }
}
const Ht = () => {
  const o = document.querySelector(
    ".flottform-elements-container-wrapper"
  ), r = document.querySelector(".flottform-opener-triangle");
  o.classList.toggle("flottform-open"), r.classList.toggle("flottform-button-svg-open");
}, xt = (o, r, t) => {
  const e = document.createElement("div");
  e.setAttribute("class", `flottform-root${t ?? ""}`);
  const n = Kt(o);
  e.appendChild(n);
  const i = Gt(r);
  return e.appendChild(i), e;
}, Ot = (o, r) => {
  const t = document.createElement("img");
  t.setAttribute("class", "flottform-qr-code"), t.setAttribute("src", o);
  const e = document.createElement("div");
  return e.setAttribute("class", "flottform-link-offer"), e.innerText = r, {
    createChannelQrCode: t,
    createChannelLinkWithOffer: e
  };
}, fn = ({
  flottformAnchorElement: o,
  flottformRootElement: r,
  additionalComponentClass: t,
  flottformRootTitle: e,
  flottformRootDescription: n
}) => {
  const i = r ?? document.querySelector(".flottform-root") ?? xt(e, n, t), s = i.querySelector(".flottform-elements-container"), a = i.querySelector(
    ".flottform-elements-container-wrapper"
  );
  return a.appendChild(s), i.appendChild(a), o.appendChild(i), {
    flottformRoot: i,
    getAllFlottformItems: () => {
      const c = i.querySelector(".flottform-inputs-list");
      return c ? c.childNodes : (console.error("No element with class .flottform-inputs-list found"), null);
    },
    createFileItem: ({
      flottformApi: c,
      createClientUrl: l,
      inputField: h,
      id: f,
      additionalItemClasses: g,
      label: d,
      buttonLabel: T,
      onErrorText: I,
      onSuccessText: L
    }) => {
      const y = new _t({
        flottformApi: c,
        createClientUrl: l,
        inputField: h
      }), {
        flottformItem: B,
        statusInformation: P,
        refreshChannelButton: b,
        flottformStateItemsContainer: M
      } = nt({
        flottformBaseInputHost: y,
        additionalItemClasses: g,
        label: d,
        buttonLabel: T,
        onErrorText: I
      }), p = i.querySelector(".flottform-inputs-list");
      p.appendChild(B), s.appendChild(p), Vt({
        flottformItem: B,
        statusInformation: P,
        refreshChannelButton: b,
        flottformStateItemsContainer: M,
        flottformFileInputHost: y,
        id: f,
        onSuccessText: L
      });
    },
    createTextItem: ({
      flottformApi: c,
      createClientUrl: l,
      inputField: h,
      id: f,
      additionalItemClasses: g,
      label: d,
      buttonLabel: T,
      onErrorText: I,
      onSuccessText: L
    }) => {
      const y = new $t({
        flottformApi: c,
        createClientUrl: l,
        inputField: h
      }), { flottformItem: B, statusInformation: P, refreshChannelButton: b } = nt({
        flottformBaseInputHost: y,
        additionalItemClasses: g,
        label: d,
        buttonLabel: T,
        onErrorText: I
      }), M = i.querySelector(".flottform-inputs-list");
      M.appendChild(B), s.appendChild(M), Jt({
        flottformItem: B,
        statusInformation: P,
        refreshChannelButton: b,
        flottformTextInputHost: y,
        id: f,
        onSuccessText: L
      });
    }
  };
}, nt = ({
  flottformBaseInputHost: o,
  additionalItemClasses: r,
  label: t,
  buttonLabel: e,
  onErrorText: n
}) => {
  const i = jt(r);
  en({ label: t, flottformItem: i });
  const s = Yt(), a = Wt(e);
  a.addEventListener("click", () => o.start());
  const c = Qt(a);
  i.appendChild(c);
  const l = Zt();
  return l.addEventListener("click", () => o.start()), o.on("endpoint-created", ({ link: h, qrCode: f }) => {
    const { createChannelQrCode: g, createChannelLinkWithOffer: d } = Ot(f, h), T = tn();
    c.replaceChildren(g);
    const I = document.createElement("div");
    I.setAttribute("class", "flottform-copy-button-link-wrapper"), I.appendChild(T), I.appendChild(d), c.appendChild(I);
  }), o.on("connected", () => {
    s.innerHTML = "Connected", s.appendChild(l), c.replaceChildren(s);
  }), o.on("error", (h) => {
    s.innerHTML = typeof n == "function" ? n(h) : n ?? `🚨 An error occured (${h.message}). Please try again`, a.innerText = "Retry", c.replaceChildren(s), c.appendChild(a);
  }), { flottformItem: i, statusInformation: s, refreshChannelButton: l, flottformStateItemsContainer: c };
}, Vt = ({
  flottformItem: o,
  statusInformation: r,
  refreshChannelButton: t,
  flottformStateItemsContainer: e,
  flottformFileInputHost: n,
  id: i,
  onSuccessText: s
}) => {
  i && o.setAttribute("id", i), n.on(
    "progress",
    ({ currentFileProgress: a, overallProgress: c, fileIndex: l, totalFileCount: h, fileName: f }) => {
      nn(e), cn(
        e,
        c,
        l,
        h
      );
      const g = on(e);
      sn(
        l,
        f,
        a,
        g,
        e
      );
    }
  ), n.on("done", () => {
    r.innerHTML = s ?? "✨ You have succesfully downloaded all your files.", r.appendChild(t), e.replaceChildren(r);
  });
}, Jt = ({
  flottformItem: o,
  statusInformation: r,
  refreshChannelButton: t,
  flottformTextInputHost: e,
  id: n,
  onSuccessText: i
}) => {
  n && o.setAttribute("id", n), e.on("done", (s) => {
    if (r.innerHTML = i ?? "✨ You have succesfully submitted your message", r.appendChild(t), o.replaceChildren(r), inputField) {
      inputField.setAttribute("value", s);
      const a = new Event("change");
      inputField.dispatchEvent(a);
    }
  });
}, Kt = (o) => {
  const r = document.createElement("button");
  return r.setAttribute("type", "button"), r.setAttribute("class", "flottform-root-opener-button"), r.innerHTML = `<span>${o ?? "Fill from Another Device"}</span><svg class="flottform-opener-triangle" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5,8.5l6,7l6-7H6.5z"/></svg>`, r.addEventListener("click", () => Ht()), r;
}, Gt = (o) => {
  const r = document.createElement("div");
  r.setAttribute("class", "flottform-elements-container");
  const t = document.createElement("div");
  if (t.setAttribute("class", "flottform-elements-container-wrapper"), o !== "") {
    const n = document.createElement("div");
    n.setAttribute("class", "flottform-root-description"), n.innerText = o ?? "This form is powered by Flottform. Need to add details from another device? Simply click a button below to generate a QR code or link, and easily upload information from your other device.", r.appendChild(n);
  }
  const e = document.createElement("ul");
  return e.setAttribute("class", "flottform-inputs-list"), r.appendChild(e), t.appendChild(r), t;
}, jt = (o) => {
  const r = document.createElement("li");
  return r.setAttribute("class", `flottform-item${o ?? ""}`), r;
}, Yt = () => {
  const o = document.createElement("div");
  return o.setAttribute("class", "flottform-status-information"), o;
}, Qt = (o) => {
  const r = document.createElement("div");
  return r.setAttribute("class", "flottform-state-items-container"), r.appendChild(o), r;
}, Wt = (o) => {
  const r = document.createElement("button");
  return r.setAttribute("type", "button"), r.setAttribute("class", "flottform-button"), r.innerText = o ?? "Get a link", r;
}, Zt = () => {
  const o = document.createElement("button");
  return o.setAttribute("type", "button"), o.setAttribute("class", "flottform-refresh-connection-button"), o.setAttribute(
    "title",
    "Click this button to refresh Flottform connection for the input field. Previous connection will be closed"
  ), o.setAttribute(
    "aria-label",
    "Click this button to refresh Flottform connection for the input field. Previous connection will be closed"
  ), o.innerHTML = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2c-5.288 0-9.649 3.914-10.377 9h-3.123l4 5.917 4-5.917h-2.847c.711-3.972 4.174-7 8.347-7 4.687 0 8.5 3.813 8.5 8.5s-3.813 8.5-8.5 8.5c-3.015 0-5.662-1.583-7.171-3.957l-1.2 1.775c1.916 2.536 4.948 4.182 8.371 4.182 5.797 0 10.5-4.702 10.5-10.5s-4.703-10.5-10.5-10.5z"/></svg>', o;
};
let Xt = 1;
const en = ({
  label: o,
  flottformItem: r
}) => {
  const t = document.createElement("p"), e = o ?? `File input ${Xt++}`;
  e && (t.innerHTML = e, r.appendChild(t));
}, tn = () => {
  const o = document.createElement("button");
  return o.setAttribute("class", "flottform-copy-to-clipboard"), o.setAttribute("type", "button"), o.setAttribute("title", "Copy Flottform link to clipboard"), o.setAttribute("aria-label", "Copy Flottform link to clipboard"), o.innerText = "📋", o.addEventListener("click", async () => {
    const r = document.querySelector(".flottform-link-offer").innerText;
    navigator.clipboard.writeText(r).then(() => {
      o.innerText = "✅", setTimeout(() => {
        o.innerText = "📋";
      }, 1e3);
    }).catch((t) => {
      o.innerText = `❌ Failed to copy: ${t}`, setTimeout(() => {
        o.innerText = "📋";
      }, 1e3);
    });
  }), o;
}, nn = (o) => {
  o.querySelector(
    ".flottform-status-information"
  ) && (o.innerHTML = "");
}, on = (o) => {
  let r = o.querySelector("details");
  if (!r) {
    r = document.createElement("details");
    const t = document.createElement("summary");
    t.innerText = "Details", r.appendChild(t);
    const e = document.createElement("div");
    e.classList.add("details-container"), r.appendChild(e), o.appendChild(r);
  }
  return r;
}, rn = (o, r) => {
  const t = document.createElement("label");
  t.setAttribute("id", `flottform-status-bar-${o}`), t.classList.add("flottform-progress-bar-label"), t.innerText = `File ${r} progress:`;
  const e = document.createElement("progress");
  return e.setAttribute("id", `flottform-status-bar-${o}`), e.classList.add("flottform-status-bar"), e.setAttribute("max", "100"), e.setAttribute("value", "0"), { currentFileLabel: t, progressBar: e };
}, sn = (o, r, t, e, n) => {
  let i = n.querySelector(
    `progress#flottform-status-bar-${o}`
  );
  if (!i) {
    const { currentFileLabel: s, progressBar: a } = rn(o, r);
    i = a;
    const c = e.querySelector(".details-container");
    c.appendChild(s), c.appendChild(i);
  }
  i.value = t * 100, i.innerText = `${t * 100}%`;
}, an = () => {
  const o = document.createElement("label");
  o.setAttribute("id", "flottform-status-bar-overall-progress"), o.classList.add("flottform-progress-bar-label"), o.innerText = "Receiving Files Progress";
  const r = document.createElement("progress");
  return r.setAttribute("id", "flottform-status-bar-overall-progress"), r.classList.add("flottform-status-bar"), r.setAttribute("max", "100"), r.setAttribute("value", "0"), { overallFilesLabel: o, progressBar: r };
}, cn = (o, r, t, e) => {
  let n = o.querySelector("progress#flottform-status-bar-overall-progress");
  if (!n) {
    const { overallFilesLabel: s, progressBar: a } = an();
    n = a, o.appendChild(s), o.appendChild(n);
  }
  const i = o.querySelector(
    "label#flottform-status-bar-overall-progress"
  );
  n.value = r * 100, n.innerText = `${r * 100}%`, i.innerText = `Receiving file ${t + 1} of ${e}`;
};
export {
  Ae as ConnectionManager,
  un as FlottformFileInputClient,
  _t as FlottformFileInputHost,
  hn as FlottformTextInputClient,
  $t as FlottformTextInputHost,
  fn as createDefaultFlottformComponent
};
//# sourceMappingURL=flottform-bundle.js.map
