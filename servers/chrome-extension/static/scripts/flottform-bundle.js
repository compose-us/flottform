var gt = Object.defineProperty;
var pt = (r, o, t) => o in r ? gt(r, o, { enumerable: !0, configurable: !0, writable: !0, value: t }) : r[o] = t;
var u = (r, o, t) => pt(r, typeof o != "symbol" ? o + "" : o, t);
const q = class q {
  constructor() {
    u(this, "activeConnections");
    this.activeConnections = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    return q.instance || (q.instance = new q()), q.instance;
  }
  addConnection(o, t) {
    this.activeConnections.set(o, t);
  }
  getConnection(o) {
    return this.activeConnections.get(o);
  }
  closeAllConnections() {
    this.activeConnections.forEach((o) => {
      o.close();
    });
  }
  removeConnection(o) {
    this.activeConnections.delete(o);
  }
};
u(q, "instance");
let Te = q;
var H = {}, Z, Ae;
function mt() {
  return Ae || (Ae = 1, Z = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), Z;
}
var X = {}, U = {}, Be;
function z() {
  if (Be) return U;
  Be = 1;
  let r;
  const o = [
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
    return o[e];
  }, U.getBCHDigit = function(t) {
    let e = 0;
    for (; t !== 0; )
      e++, t >>>= 1;
    return e;
  }, U.setToSJISFunction = function(e) {
    if (typeof e != "function")
      throw new Error('"toSJISFunc" is not a valid function.');
    r = e;
  }, U.isKanjiModeEnabled = function() {
    return typeof r < "u";
  }, U.toSJIS = function(e) {
    return r(e);
  }, U;
}
var ee = {}, ve;
function Ee() {
  return ve || (ve = 1, function(r) {
    r.L = { bit: 1 }, r.M = { bit: 0 }, r.Q = { bit: 3 }, r.H = { bit: 2 };
    function o(t) {
      if (typeof t != "string")
        throw new Error("Param is not a string");
      switch (t.toLowerCase()) {
        case "l":
        case "low":
          return r.L;
        case "m":
        case "medium":
          return r.M;
        case "q":
        case "quartile":
          return r.Q;
        case "h":
        case "high":
          return r.H;
        default:
          throw new Error("Unknown EC Level: " + t);
      }
    }
    r.isValid = function(e) {
      return e && typeof e.bit < "u" && e.bit >= 0 && e.bit < 4;
    }, r.from = function(e, n) {
      if (r.isValid(e))
        return e;
      try {
        return o(e);
      } catch {
        return n;
      }
    };
  }(ee)), ee;
}
var te, Le;
function Ct() {
  if (Le) return te;
  Le = 1;
  function r() {
    this.buffer = [], this.length = 0;
  }
  return r.prototype = {
    get: function(o) {
      const t = Math.floor(o / 8);
      return (this.buffer[t] >>> 7 - o % 8 & 1) === 1;
    },
    put: function(o, t) {
      for (let e = 0; e < t; e++)
        this.putBit((o >>> t - e - 1 & 1) === 1);
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(o) {
      const t = Math.floor(this.length / 8);
      this.buffer.length <= t && this.buffer.push(0), o && (this.buffer[t] |= 128 >>> this.length % 8), this.length++;
    }
  }, te = r, te;
}
var ne, Me;
function wt() {
  if (Me) return ne;
  Me = 1;
  function r(o) {
    if (!o || o < 1)
      throw new Error("BitMatrix size must be defined and greater than 0");
    this.size = o, this.data = new Uint8Array(o * o), this.reservedBit = new Uint8Array(o * o);
  }
  return r.prototype.set = function(o, t, e, n) {
    const i = o * this.size + t;
    this.data[i] = e, n && (this.reservedBit[i] = !0);
  }, r.prototype.get = function(o, t) {
    return this.data[o * this.size + t];
  }, r.prototype.xor = function(o, t, e) {
    this.data[o * this.size + t] ^= e;
  }, r.prototype.isReserved = function(o, t) {
    return this.reservedBit[o * this.size + t];
  }, ne = r, ne;
}
var ie = {}, Re;
function yt() {
  return Re || (Re = 1, function(r) {
    const o = z().getSymbolSize;
    r.getRowColCoords = function(e) {
      if (e === 1) return [];
      const n = Math.floor(e / 7) + 2, i = o(e), s = i === 145 ? 26 : Math.ceil((i - 13) / (2 * n - 2)) * 2, c = [i - 7];
      for (let a = 1; a < n - 1; a++)
        c[a] = c[a - 1] - s;
      return c.push(6), c.reverse();
    }, r.getPositions = function(e) {
      const n = [], i = r.getRowColCoords(e), s = i.length;
      for (let c = 0; c < s; c++)
        for (let a = 0; a < s; a++)
          c === 0 && a === 0 || // top-left
          c === 0 && a === s - 1 || // bottom-left
          c === s - 1 && a === 0 || n.push([i[c], i[a]]);
      return n;
    };
  }(ie)), ie;
}
var oe = {}, Ne;
function bt() {
  if (Ne) return oe;
  Ne = 1;
  const r = z().getSymbolSize, o = 7;
  return oe.getPositions = function(e) {
    const n = r(e);
    return [
      // top-left
      [0, 0],
      // top-right
      [n - o, 0],
      // bottom-left
      [0, n - o]
    ];
  }, oe;
}
var re = {}, De;
function St() {
  return De || (De = 1, function(r) {
    r.Patterns = {
      PATTERN000: 0,
      PATTERN001: 1,
      PATTERN010: 2,
      PATTERN011: 3,
      PATTERN100: 4,
      PATTERN101: 5,
      PATTERN110: 6,
      PATTERN111: 7
    };
    const o = {
      N1: 3,
      N2: 3,
      N3: 40,
      N4: 10
    };
    r.isValid = function(n) {
      return n != null && n !== "" && !isNaN(n) && n >= 0 && n <= 7;
    }, r.from = function(n) {
      return r.isValid(n) ? parseInt(n, 10) : void 0;
    }, r.getPenaltyN1 = function(n) {
      const i = n.size;
      let s = 0, c = 0, a = 0, l = null, h = null;
      for (let f = 0; f < i; f++) {
        c = a = 0, l = h = null;
        for (let g = 0; g < i; g++) {
          let d = n.get(f, g);
          d === l ? c++ : (c >= 5 && (s += o.N1 + (c - 5)), l = d, c = 1), d = n.get(g, f), d === h ? a++ : (a >= 5 && (s += o.N1 + (a - 5)), h = d, a = 1);
        }
        c >= 5 && (s += o.N1 + (c - 5)), a >= 5 && (s += o.N1 + (a - 5));
      }
      return s;
    }, r.getPenaltyN2 = function(n) {
      const i = n.size;
      let s = 0;
      for (let c = 0; c < i - 1; c++)
        for (let a = 0; a < i - 1; a++) {
          const l = n.get(c, a) + n.get(c, a + 1) + n.get(c + 1, a) + n.get(c + 1, a + 1);
          (l === 4 || l === 0) && s++;
        }
      return s * o.N2;
    }, r.getPenaltyN3 = function(n) {
      const i = n.size;
      let s = 0, c = 0, a = 0;
      for (let l = 0; l < i; l++) {
        c = a = 0;
        for (let h = 0; h < i; h++)
          c = c << 1 & 2047 | n.get(l, h), h >= 10 && (c === 1488 || c === 93) && s++, a = a << 1 & 2047 | n.get(h, l), h >= 10 && (a === 1488 || a === 93) && s++;
      }
      return s * o.N3;
    }, r.getPenaltyN4 = function(n) {
      let i = 0;
      const s = n.data.length;
      for (let a = 0; a < s; a++) i += n.data[a];
      return Math.abs(Math.ceil(i * 100 / s / 5) - 10) * o.N4;
    };
    function t(e, n, i) {
      switch (e) {
        case r.Patterns.PATTERN000:
          return (n + i) % 2 === 0;
        case r.Patterns.PATTERN001:
          return n % 2 === 0;
        case r.Patterns.PATTERN010:
          return i % 3 === 0;
        case r.Patterns.PATTERN011:
          return (n + i) % 3 === 0;
        case r.Patterns.PATTERN100:
          return (Math.floor(n / 2) + Math.floor(i / 3)) % 2 === 0;
        case r.Patterns.PATTERN101:
          return n * i % 2 + n * i % 3 === 0;
        case r.Patterns.PATTERN110:
          return (n * i % 2 + n * i % 3) % 2 === 0;
        case r.Patterns.PATTERN111:
          return (n * i % 3 + (n + i) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + e);
      }
    }
    r.applyMask = function(n, i) {
      const s = i.size;
      for (let c = 0; c < s; c++)
        for (let a = 0; a < s; a++)
          i.isReserved(a, c) || i.xor(a, c, t(n, a, c));
    }, r.getBestMask = function(n, i) {
      const s = Object.keys(r.Patterns).length;
      let c = 0, a = 1 / 0;
      for (let l = 0; l < s; l++) {
        i(l), r.applyMask(l, n);
        const h = r.getPenaltyN1(n) + r.getPenaltyN2(n) + r.getPenaltyN3(n) + r.getPenaltyN4(n);
        r.applyMask(l, n), h < a && (a = h, c = l);
      }
      return c;
    };
  }(re)), re;
}
var G = {}, ke;
function nt() {
  if (ke) return G;
  ke = 1;
  const r = Ee(), o = [
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
      case r.L:
        return o[(n - 1) * 4 + 0];
      case r.M:
        return o[(n - 1) * 4 + 1];
      case r.Q:
        return o[(n - 1) * 4 + 2];
      case r.H:
        return o[(n - 1) * 4 + 3];
      default:
        return;
    }
  }, G.getTotalCodewordsCount = function(n, i) {
    switch (i) {
      case r.L:
        return t[(n - 1) * 4 + 0];
      case r.M:
        return t[(n - 1) * 4 + 1];
      case r.Q:
        return t[(n - 1) * 4 + 2];
      case r.H:
        return t[(n - 1) * 4 + 3];
      default:
        return;
    }
  }, G;
}
var se = {}, O = {}, Ue;
function Et() {
  if (Ue) return O;
  Ue = 1;
  const r = new Uint8Array(512), o = new Uint8Array(256);
  return function() {
    let e = 1;
    for (let n = 0; n < 255; n++)
      r[n] = e, o[e] = n, e <<= 1, e & 256 && (e ^= 285);
    for (let n = 255; n < 512; n++)
      r[n] = r[n - 255];
  }(), O.log = function(e) {
    if (e < 1) throw new Error("log(" + e + ")");
    return o[e];
  }, O.exp = function(e) {
    return r[e];
  }, O.mul = function(e, n) {
    return e === 0 || n === 0 ? 0 : r[o[e] + o[n]];
  }, O;
}
var qe;
function It() {
  return qe || (qe = 1, function(r) {
    const o = Et();
    r.mul = function(e, n) {
      const i = new Uint8Array(e.length + n.length - 1);
      for (let s = 0; s < e.length; s++)
        for (let c = 0; c < n.length; c++)
          i[s + c] ^= o.mul(e[s], n[c]);
      return i;
    }, r.mod = function(e, n) {
      let i = new Uint8Array(e);
      for (; i.length - n.length >= 0; ) {
        const s = i[0];
        for (let a = 0; a < n.length; a++)
          i[a] ^= o.mul(n[a], s);
        let c = 0;
        for (; c < i.length && i[c] === 0; ) c++;
        i = i.slice(c);
      }
      return i;
    }, r.generateECPolynomial = function(e) {
      let n = new Uint8Array([1]);
      for (let i = 0; i < e; i++)
        n = r.mul(n, new Uint8Array([1, o.exp(i)]));
      return n;
    };
  }(se)), se;
}
var ae, ze;
function Ft() {
  if (ze) return ae;
  ze = 1;
  const r = It();
  function o(t) {
    this.genPoly = void 0, this.degree = t, this.degree && this.initialize(this.degree);
  }
  return o.prototype.initialize = function(e) {
    this.degree = e, this.genPoly = r.generateECPolynomial(this.degree);
  }, o.prototype.encode = function(e) {
    if (!this.genPoly)
      throw new Error("Encoder not initialized");
    const n = new Uint8Array(e.length + this.degree);
    n.set(e);
    const i = r.mod(n, this.genPoly), s = this.degree - i.length;
    if (s > 0) {
      const c = new Uint8Array(this.degree);
      return c.set(i, s), c;
    }
    return i;
  }, ae = o, ae;
}
var ce = {}, le = {}, ue = {}, _e;
function it() {
  return _e || (_e = 1, ue.isValid = function(o) {
    return !isNaN(o) && o >= 1 && o <= 40;
  }), ue;
}
var R = {}, $e;
function ot() {
  if ($e) return R;
  $e = 1;
  const r = "[0-9]+", o = "[A-Z $%*+\\-./:]+";
  let t = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  t = t.replace(/u/g, "\\u");
  const e = "(?:(?![A-Z0-9 $%*+\\-./:]|" + t + `)(?:.|[\r
]))+`;
  R.KANJI = new RegExp(t, "g"), R.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), R.BYTE = new RegExp(e, "g"), R.NUMERIC = new RegExp(r, "g"), R.ALPHANUMERIC = new RegExp(o, "g");
  const n = new RegExp("^" + t + "$"), i = new RegExp("^" + r + "$"), s = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return R.testKanji = function(a) {
    return n.test(a);
  }, R.testNumeric = function(a) {
    return i.test(a);
  }, R.testAlphanumeric = function(a) {
    return s.test(a);
  }, R;
}
var He;
function _() {
  return He || (He = 1, function(r) {
    const o = it(), t = ot();
    r.NUMERIC = {
      id: "Numeric",
      bit: 1,
      ccBits: [10, 12, 14]
    }, r.ALPHANUMERIC = {
      id: "Alphanumeric",
      bit: 2,
      ccBits: [9, 11, 13]
    }, r.BYTE = {
      id: "Byte",
      bit: 4,
      ccBits: [8, 16, 16]
    }, r.KANJI = {
      id: "Kanji",
      bit: 8,
      ccBits: [8, 10, 12]
    }, r.MIXED = {
      bit: -1
    }, r.getCharCountIndicator = function(i, s) {
      if (!i.ccBits) throw new Error("Invalid mode: " + i);
      if (!o.isValid(s))
        throw new Error("Invalid version: " + s);
      return s >= 1 && s < 10 ? i.ccBits[0] : s < 27 ? i.ccBits[1] : i.ccBits[2];
    }, r.getBestModeForData = function(i) {
      return t.testNumeric(i) ? r.NUMERIC : t.testAlphanumeric(i) ? r.ALPHANUMERIC : t.testKanji(i) ? r.KANJI : r.BYTE;
    }, r.toString = function(i) {
      if (i && i.id) return i.id;
      throw new Error("Invalid mode");
    }, r.isValid = function(i) {
      return i && i.bit && i.ccBits;
    };
    function e(n) {
      if (typeof n != "string")
        throw new Error("Param is not a string");
      switch (n.toLowerCase()) {
        case "numeric":
          return r.NUMERIC;
        case "alphanumeric":
          return r.ALPHANUMERIC;
        case "kanji":
          return r.KANJI;
        case "byte":
          return r.BYTE;
        default:
          throw new Error("Unknown mode: " + n);
      }
    }
    r.from = function(i, s) {
      if (r.isValid(i))
        return i;
      try {
        return e(i);
      } catch {
        return s;
      }
    };
  }(le)), le;
}
var xe;
function Pt() {
  return xe || (xe = 1, function(r) {
    const o = z(), t = nt(), e = Ee(), n = _(), i = it(), s = 7973, c = o.getBCHDigit(s);
    function a(g, d, T) {
      for (let F = 1; F <= 40; F++)
        if (d <= r.getCapacity(F, T, g))
          return F;
    }
    function l(g, d) {
      return n.getCharCountIndicator(g, d) + 4;
    }
    function h(g, d) {
      let T = 0;
      return g.forEach(function(F) {
        const L = l(F.mode, d);
        T += L + F.getBitsLength();
      }), T;
    }
    function f(g, d) {
      for (let T = 1; T <= 40; T++)
        if (h(g, T) <= r.getCapacity(T, d, n.MIXED))
          return T;
    }
    r.from = function(d, T) {
      return i.isValid(d) ? parseInt(d, 10) : T;
    }, r.getCapacity = function(d, T, F) {
      if (!i.isValid(d))
        throw new Error("Invalid QR Code version");
      typeof F > "u" && (F = n.BYTE);
      const L = o.getSymbolTotalCodewords(d), y = t.getTotalCodewordsCount(d, T), B = (L - y) * 8;
      if (F === n.MIXED) return B;
      const P = B - l(F, d);
      switch (F) {
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
    }, r.getBestVersionForData = function(d, T) {
      let F;
      const L = e.from(T, e.M);
      if (Array.isArray(d)) {
        if (d.length > 1)
          return f(d, L);
        if (d.length === 0)
          return 1;
        F = d[0];
      } else
        F = d;
      return a(F.mode, F.getLength(), L);
    }, r.getEncodedBits = function(d) {
      if (!i.isValid(d) || d < 7)
        throw new Error("Invalid QR Code version");
      let T = d << 12;
      for (; o.getBCHDigit(T) - c >= 0; )
        T ^= s << o.getBCHDigit(T) - c;
      return d << 12 | T;
    };
  }(ce)), ce;
}
var he = {}, Oe;
function Tt() {
  if (Oe) return he;
  Oe = 1;
  const r = z(), o = 1335, t = 21522, e = r.getBCHDigit(o);
  return he.getEncodedBits = function(i, s) {
    const c = i.bit << 3 | s;
    let a = c << 10;
    for (; r.getBCHDigit(a) - e >= 0; )
      a ^= o << r.getBCHDigit(a) - e;
    return (c << 10 | a) ^ t;
  }, he;
}
var fe = {}, de, Je;
function At() {
  if (Je) return de;
  Je = 1;
  const r = _();
  function o(t) {
    this.mode = r.NUMERIC, this.data = t.toString();
  }
  return o.getBitsLength = function(e) {
    return 10 * Math.floor(e / 3) + (e % 3 ? e % 3 * 3 + 1 : 0);
  }, o.prototype.getLength = function() {
    return this.data.length;
  }, o.prototype.getBitsLength = function() {
    return o.getBitsLength(this.data.length);
  }, o.prototype.write = function(e) {
    let n, i, s;
    for (n = 0; n + 3 <= this.data.length; n += 3)
      i = this.data.substr(n, 3), s = parseInt(i, 10), e.put(s, 10);
    const c = this.data.length - n;
    c > 0 && (i = this.data.substr(n), s = parseInt(i, 10), e.put(s, c * 3 + 1));
  }, de = o, de;
}
var ge, Ve;
function Bt() {
  if (Ve) return ge;
  Ve = 1;
  const r = _(), o = [
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
    this.mode = r.ALPHANUMERIC, this.data = e;
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
      let s = o.indexOf(this.data[i]) * 45;
      s += o.indexOf(this.data[i + 1]), n.put(s, 11);
    }
    this.data.length % 2 && n.put(o.indexOf(this.data[i]), 6);
  }, ge = t, ge;
}
var pe, Ke;
function vt() {
  if (Ke) return pe;
  Ke = 1;
  const r = _();
  function o(t) {
    this.mode = r.BYTE, typeof t == "string" ? this.data = new TextEncoder().encode(t) : this.data = new Uint8Array(t);
  }
  return o.getBitsLength = function(e) {
    return e * 8;
  }, o.prototype.getLength = function() {
    return this.data.length;
  }, o.prototype.getBitsLength = function() {
    return o.getBitsLength(this.data.length);
  }, o.prototype.write = function(t) {
    for (let e = 0, n = this.data.length; e < n; e++)
      t.put(this.data[e], 8);
  }, pe = o, pe;
}
var me, Ge;
function Lt() {
  if (Ge) return me;
  Ge = 1;
  const r = _(), o = z();
  function t(e) {
    this.mode = r.KANJI, this.data = e;
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
      let i = o.toSJIS(this.data[n]);
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
  }, me = t, me;
}
var Ce = { exports: {} }, je;
function Mt() {
  return je || (je = 1, function(r) {
    var o = {
      single_source_shortest_paths: function(t, e, n) {
        var i = {}, s = {};
        s[e] = 0;
        var c = o.PriorityQueue.make();
        c.push(e, 0);
        for (var a, l, h, f, g, d, T, F, L; !c.empty(); ) {
          a = c.pop(), l = a.value, f = a.cost, g = t[l] || {};
          for (h in g)
            g.hasOwnProperty(h) && (d = g[h], T = f + d, F = s[h], L = typeof s[h] > "u", (L || F > T) && (s[h] = T, c.push(h, T), i[h] = l));
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
        var i = o.single_source_shortest_paths(t, e, n);
        return o.extract_shortest_path_from_predecessor_list(
          i,
          n
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(t) {
          var e = o.PriorityQueue, n = {}, i;
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
    r.exports = o;
  }(Ce)), Ce.exports;
}
var Ye;
function Rt() {
  return Ye || (Ye = 1, function(r) {
    const o = _(), t = At(), e = Bt(), n = vt(), i = Lt(), s = ot(), c = z(), a = Mt();
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
      const B = h(s.NUMERIC, o.NUMERIC, y), P = h(s.ALPHANUMERIC, o.ALPHANUMERIC, y);
      let b, M;
      return c.isKanjiModeEnabled() ? (b = h(s.BYTE, o.BYTE, y), M = h(s.KANJI, o.KANJI, y)) : (b = h(s.BYTE_KANJI, o.BYTE, y), M = []), B.concat(P, b, M).sort(function(E, S) {
        return E.index - S.index;
      }).map(function(E) {
        return {
          data: E.data,
          mode: E.mode,
          length: E.length
        };
      });
    }
    function g(y, B) {
      switch (B) {
        case o.NUMERIC:
          return t.getBitsLength(y);
        case o.ALPHANUMERIC:
          return e.getBitsLength(y);
        case o.KANJI:
          return i.getBitsLength(y);
        case o.BYTE:
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
          case o.NUMERIC:
            B.push([
              b,
              { data: b.data, mode: o.ALPHANUMERIC, length: b.length },
              { data: b.data, mode: o.BYTE, length: b.length }
            ]);
            break;
          case o.ALPHANUMERIC:
            B.push([
              b,
              { data: b.data, mode: o.BYTE, length: b.length }
            ]);
            break;
          case o.KANJI:
            B.push([
              b,
              { data: b.data, mode: o.BYTE, length: l(b.data) }
            ]);
            break;
          case o.BYTE:
            B.push([
              { data: b.data, mode: o.BYTE, length: l(b.data) }
            ]);
        }
      }
      return B;
    }
    function F(y, B) {
      const P = {}, b = { start: {} };
      let M = ["start"];
      for (let p = 0; p < y.length; p++) {
        const E = y[p], S = [];
        for (let m = 0; m < E.length; m++) {
          const A = E[m], C = "" + p + m;
          S.push(C), P[C] = { node: A, lastCount: 0 }, b[C] = {};
          for (let I = 0; I < M.length; I++) {
            const w = M[I];
            P[w] && P[w].node.mode === A.mode ? (b[w][C] = g(P[w].lastCount + A.length, A.mode) - g(P[w].lastCount, A.mode), P[w].lastCount += A.length) : (P[w] && (P[w].lastCount = A.length), b[w][C] = g(A.length, A.mode) + 4 + o.getCharCountIndicator(A.mode, B));
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
      const b = o.getBestModeForData(y);
      if (P = o.from(B, b), P !== o.BYTE && P.bit < b.bit)
        throw new Error('"' + y + '" cannot be encoded with mode ' + o.toString(P) + `.
 Suggested mode is: ` + o.toString(b));
      switch (P === o.KANJI && !c.isKanjiModeEnabled() && (P = o.BYTE), P) {
        case o.NUMERIC:
          return new t(y);
        case o.ALPHANUMERIC:
          return new e(y);
        case o.KANJI:
          return new i(y);
        case o.BYTE:
          return new n(y);
      }
    }
    r.fromArray = function(B) {
      return B.reduce(function(P, b) {
        return typeof b == "string" ? P.push(L(b, null)) : b.data && P.push(L(b.data, b.mode)), P;
      }, []);
    }, r.fromString = function(B, P) {
      const b = f(B, c.isKanjiModeEnabled()), M = T(b), p = F(M, P), E = a.find_path(p.map, "start", "end"), S = [];
      for (let m = 1; m < E.length - 1; m++)
        S.push(p.table[E[m]].node);
      return r.fromArray(d(S));
    }, r.rawSplit = function(B) {
      return r.fromArray(
        f(B, c.isKanjiModeEnabled())
      );
    };
  }(fe)), fe;
}
var Qe;
function Nt() {
  if (Qe) return X;
  Qe = 1;
  const r = z(), o = Ee(), t = Ct(), e = wt(), n = yt(), i = bt(), s = St(), c = nt(), a = Ft(), l = Pt(), h = Tt(), f = _(), g = Rt();
  function d(p, E) {
    const S = p.size, m = i.getPositions(E);
    for (let A = 0; A < m.length; A++) {
      const C = m[A][0], I = m[A][1];
      for (let w = -1; w <= 7; w++)
        if (!(C + w <= -1 || S <= C + w))
          for (let v = -1; v <= 7; v++)
            I + v <= -1 || S <= I + v || (w >= 0 && w <= 6 && (v === 0 || v === 6) || v >= 0 && v <= 6 && (w === 0 || w === 6) || w >= 2 && w <= 4 && v >= 2 && v <= 4 ? p.set(C + w, I + v, !0, !0) : p.set(C + w, I + v, !1, !0));
    }
  }
  function T(p) {
    const E = p.size;
    for (let S = 8; S < E - 8; S++) {
      const m = S % 2 === 0;
      p.set(S, 6, m, !0), p.set(6, S, m, !0);
    }
  }
  function F(p, E) {
    const S = n.getPositions(E);
    for (let m = 0; m < S.length; m++) {
      const A = S[m][0], C = S[m][1];
      for (let I = -2; I <= 2; I++)
        for (let w = -2; w <= 2; w++)
          I === -2 || I === 2 || w === -2 || w === 2 || I === 0 && w === 0 ? p.set(A + I, C + w, !0, !0) : p.set(A + I, C + w, !1, !0);
    }
  }
  function L(p, E) {
    const S = p.size, m = l.getEncodedBits(E);
    let A, C, I;
    for (let w = 0; w < 18; w++)
      A = Math.floor(w / 3), C = w % 3 + S - 8 - 3, I = (m >> w & 1) === 1, p.set(A, C, I, !0), p.set(C, A, I, !0);
  }
  function y(p, E, S) {
    const m = p.size, A = h.getEncodedBits(E, S);
    let C, I;
    for (C = 0; C < 15; C++)
      I = (A >> C & 1) === 1, C < 6 ? p.set(C, 8, I, !0) : C < 8 ? p.set(C + 1, 8, I, !0) : p.set(m - 15 + C, 8, I, !0), C < 8 ? p.set(8, m - C - 1, I, !0) : C < 9 ? p.set(8, 15 - C - 1 + 1, I, !0) : p.set(8, 15 - C - 1, I, !0);
    p.set(m - 8, 8, 1, !0);
  }
  function B(p, E) {
    const S = p.size;
    let m = -1, A = S - 1, C = 7, I = 0;
    for (let w = S - 1; w > 0; w -= 2)
      for (w === 6 && w--; ; ) {
        for (let v = 0; v < 2; v++)
          if (!p.isReserved(A, w - v)) {
            let k = !1;
            I < E.length && (k = (E[I] >>> C & 1) === 1), p.set(A, w - v, k), C--, C === -1 && (I++, C = 7);
          }
        if (A += m, A < 0 || S <= A) {
          A -= m, m = -m;
          break;
        }
      }
  }
  function P(p, E, S) {
    const m = new t();
    S.forEach(function(v) {
      m.put(v.mode.bit, 4), m.put(v.getLength(), f.getCharCountIndicator(v.mode, p)), v.write(m);
    });
    const A = r.getSymbolTotalCodewords(p), C = c.getTotalCodewordsCount(p, E), I = (A - C) * 8;
    for (m.getLengthInBits() + 4 <= I && m.put(0, 4); m.getLengthInBits() % 8 !== 0; )
      m.putBit(0);
    const w = (I - m.getLengthInBits()) / 8;
    for (let v = 0; v < w; v++)
      m.put(v % 2 ? 17 : 236, 8);
    return b(m, p, E);
  }
  function b(p, E, S) {
    const m = r.getSymbolTotalCodewords(E), A = c.getTotalCodewordsCount(E, S), C = m - A, I = c.getBlocksCount(E, S), w = m % I, v = I - w, k = Math.floor(m / I), x = Math.floor(C / I), ht = x + 1, Ie = k - x, ft = new a(Ie);
    let j = 0;
    const K = new Array(I), Fe = new Array(I);
    let Y = 0;
    const dt = new Uint8Array(p.buffer);
    for (let $ = 0; $ < I; $++) {
      const W = $ < v ? x : ht;
      K[$] = dt.slice(j, j + W), Fe[$] = ft.encode(K[$]), j += W, Y = Math.max(Y, W);
    }
    const Q = new Uint8Array(m);
    let Pe = 0, N, D;
    for (N = 0; N < Y; N++)
      for (D = 0; D < I; D++)
        N < K[D].length && (Q[Pe++] = K[D][N]);
    for (N = 0; N < Ie; N++)
      for (D = 0; D < I; D++)
        Q[Pe++] = Fe[D][N];
    return Q;
  }
  function M(p, E, S, m) {
    let A;
    if (Array.isArray(p))
      A = g.fromArray(p);
    else if (typeof p == "string") {
      let k = E;
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
    if (!E)
      E = C;
    else if (E < C)
      throw new Error(
        `
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: ` + C + `.
`
      );
    const I = P(E, S, A), w = r.getSymbolSize(E), v = new e(w);
    return d(v, E), T(v), F(v, E), y(v, S, 0), E >= 7 && L(v, E), B(v, I), isNaN(m) && (m = s.getBestMask(
      v,
      y.bind(null, v, S)
    )), s.applyMask(m, v), y(v, S, m), {
      modules: v,
      version: E,
      errorCorrectionLevel: S,
      maskPattern: m,
      segments: A
    };
  }
  return X.create = function(E, S) {
    if (typeof E > "u" || E === "")
      throw new Error("No input text");
    let m = o.M, A, C;
    return typeof S < "u" && (m = o.from(S.errorCorrectionLevel, o.M), A = l.from(S.version), C = s.from(S.maskPattern), S.toSJISFunc && r.setToSJISFunction(S.toSJISFunc)), M(E, A, m, C);
  }, X;
}
var we = {}, ye = {}, We;
function rt() {
  return We || (We = 1, function(r) {
    function o(t) {
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
    r.getOptions = function(e) {
      e || (e = {}), e.color || (e.color = {});
      const n = typeof e.margin > "u" || e.margin === null || e.margin < 0 ? 4 : e.margin, i = e.width && e.width >= 21 ? e.width : void 0, s = e.scale || 4;
      return {
        width: i,
        scale: i ? 4 : s,
        margin: n,
        color: {
          dark: o(e.color.dark || "#000000ff"),
          light: o(e.color.light || "#ffffffff")
        },
        type: e.type,
        rendererOpts: e.rendererOpts || {}
      };
    }, r.getScale = function(e, n) {
      return n.width && n.width >= e + n.margin * 2 ? n.width / (e + n.margin * 2) : n.scale;
    }, r.getImageWidth = function(e, n) {
      const i = r.getScale(e, n);
      return Math.floor((e + n.margin * 2) * i);
    }, r.qrToImageData = function(e, n, i) {
      const s = n.modules.size, c = n.modules.data, a = r.getScale(s, i), l = Math.floor((s + i.margin * 2) * a), h = i.margin * a, f = [i.color.light, i.color.dark];
      for (let g = 0; g < l; g++)
        for (let d = 0; d < l; d++) {
          let T = (g * l + d) * 4, F = i.color.light;
          if (g >= h && d >= h && g < l - h && d < l - h) {
            const L = Math.floor((g - h) / a), y = Math.floor((d - h) / a);
            F = f[c[L * s + y] ? 1 : 0];
          }
          e[T++] = F.r, e[T++] = F.g, e[T++] = F.b, e[T] = F.a;
        }
    };
  }(ye)), ye;
}
var Ze;
function Dt() {
  return Ze || (Ze = 1, function(r) {
    const o = rt();
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
    r.render = function(i, s, c) {
      let a = c, l = s;
      typeof a > "u" && (!s || !s.getContext) && (a = s, s = void 0), s || (l = e()), a = o.getOptions(a);
      const h = o.getImageWidth(i.modules.size, a), f = l.getContext("2d"), g = f.createImageData(h, h);
      return o.qrToImageData(g.data, i, a), t(f, l, h), f.putImageData(g, 0, 0), l;
    }, r.renderToDataURL = function(i, s, c) {
      let a = c;
      typeof a > "u" && (!s || !s.getContext) && (a = s, s = void 0), a || (a = {});
      const l = r.render(i, s, a), h = a.type || "image/png", f = a.rendererOpts || {};
      return l.toDataURL(h, f.quality);
    };
  }(we)), we;
}
var be = {}, Xe;
function kt() {
  if (Xe) return be;
  Xe = 1;
  const r = rt();
  function o(n, i) {
    const s = n.a / 255, c = i + '="' + n.hex + '"';
    return s < 1 ? c + " " + i + '-opacity="' + s.toFixed(2).slice(1) + '"' : c;
  }
  function t(n, i, s) {
    let c = n + i;
    return typeof s < "u" && (c += " " + s), c;
  }
  function e(n, i, s) {
    let c = "", a = 0, l = !1, h = 0;
    for (let f = 0; f < n.length; f++) {
      const g = Math.floor(f % i), d = Math.floor(f / i);
      !g && !l && (l = !0), n[f] ? (h++, f > 0 && g > 0 && n[f - 1] || (c += l ? t("M", g + s, 0.5 + d + s) : t("m", a, 0), a = 0, l = !1), g + 1 < i && n[f + 1] || (c += t("h", h), h = 0)) : a++;
    }
    return c;
  }
  return be.render = function(i, s, c) {
    const a = r.getOptions(s), l = i.modules.size, h = i.modules.data, f = l + a.margin * 2, g = a.color.light.a ? "<path " + o(a.color.light, "fill") + ' d="M0 0h' + f + "v" + f + 'H0z"/>' : "", d = "<path " + o(a.color.dark, "stroke") + ' d="' + e(h, l, a.margin) + '"/>', T = 'viewBox="0 0 ' + f + " " + f + '"', L = '<svg xmlns="http://www.w3.org/2000/svg" ' + (a.width ? 'width="' + a.width + '" height="' + a.width + '" ' : "") + T + ' shape-rendering="crispEdges">' + g + d + `</svg>
`;
    return typeof c == "function" && c(null, L), L;
  }, be;
}
var et;
function Ut() {
  if (et) return H;
  et = 1;
  const r = mt(), o = Nt(), t = Dt(), e = kt();
  function n(i, s, c, a, l) {
    const h = [].slice.call(arguments, 1), f = h.length, g = typeof h[f - 1] == "function";
    if (!g && !r())
      throw new Error("Callback required as last argument");
    if (g) {
      if (f < 2)
        throw new Error("Too few arguments provided");
      f === 2 ? (l = c, c = s, s = a = void 0) : f === 3 && (s.getContext && typeof l > "u" ? (l = a, a = void 0) : (l = a, a = c, c = s, s = void 0));
    } else {
      if (f < 1)
        throw new Error("Too few arguments provided");
      return f === 1 ? (c = s, s = a = void 0) : f === 2 && !s.getContext && (a = c, c = s, s = void 0), new Promise(function(d, T) {
        try {
          const F = o.create(c, a);
          d(i(F, s, a));
        } catch (F) {
          T(F);
        }
      });
    }
    try {
      const d = o.create(c, a);
      l(null, i(d, s, a));
    } catch (d) {
      l(d);
    }
  }
  return H.create = o.create, H.toCanvas = n.bind(null, t.render), H.toDataURL = n.bind(null, t.renderToDataURL), H.toString = n.bind(null, function(i, s, c) {
    return e.render(i, c);
  }), H;
}
var qt = Ut();
const J = 1e3, st = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302"]
    }
  ]
};
function zt() {
  return crypto.randomUUID();
}
async function Se(r) {
  return await (await fetch(r)).json();
}
function at(r, o) {
  for (const t of r)
    if (JSON.stringify(t) === JSON.stringify(o))
      return !0;
  return !1;
}
class V {
  constructor() {
    u(this, "eventListeners", {});
  }
  on(o, t) {
    const e = this.eventListeners[o] ?? /* @__PURE__ */ new Set();
    e.add(t), this.eventListeners[o] = e;
  }
  off(o, t) {
    const e = this.eventListeners[o];
    e && (e.delete(t), e.size === 0 && delete this.eventListeners[o]);
  }
  emit(o, ...t) {
    const e = this.eventListeners[o] ?? /* @__PURE__ */ new Set();
    for (const n of e)
      n(...t);
  }
}
class ct extends V {
}
class lt extends V {
  constructor({
    flottformApi: t,
    createClientUrl: e,
    pollTimeForIceInMs: n,
    logger: i
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
      try {
        this.rtcConfiguration.iceServers = await this.fetchIceServers(t);
      } catch (h) {
        this.logger.error(h);
      }
      this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration), this.dataChannel = this.createDataChannel();
      const e = await this.openPeerConnection.createOffer();
      await this.openPeerConnection.setLocalDescription(e);
      const { endpointId: n, hostKey: i } = await this.createEndpoint(t, e);
      this.logger.log("Created endpoint", { endpointId: n, hostKey: i });
      const s = `${t}/${n}`, c = `${t}/${n}/host`, a = /* @__PURE__ */ new Set();
      await this.putHostInfo(c, i, a, e), this.setUpConnectionStateGathering(s), this.setupHostIceGathering(c, i, a, e), this.setupDataChannelForTransfer();
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
      const { clientInfo: e } = await Se(t);
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
    this.flottformApi = t, this.createClientUrl = e, this.rtcConfiguration = st, this.pollTimeForIceInMs = n, this.logger = i, Promise.resolve().then(() => {
      this.changeState("new", { channel: this });
    });
  }
}
class _t extends ct {
  constructor({
    flottformApi: t,
    createClientUrl: e,
    inputField: n,
    pollTimeForIceInMs: i = J,
    logger: s = console
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
        const s = (n = this.filesMetaData[this.currentFile.index]) == null ? void 0 : n.name, c = (i = this.filesMetaData[this.currentFile.index]) == null ? void 0 : i.size, a = (this.currentFile.receivedSize / c).toFixed(
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
    u(this, "appendFileToInputField", (t) => {
      var c, a, l;
      if (!this.inputField) {
        this.logger.warn("No input field provided!!");
        return;
      }
      const e = new DataTransfer();
      if (this.inputField.files)
        for (const h of Array.from(this.inputField.files))
          e.items.add(h);
      this.inputField.multiple || (this.logger.warn(
        "The host's input field only supports one file. Incoming files from the client will overwrite any existing file, and only the last file received will remain attached."
      ), e.items.clear());
      const n = ((c = this.filesMetaData[t]) == null ? void 0 : c.name) ?? "no-name", i = ((a = this.filesMetaData[t]) == null ? void 0 : a.type) ?? "application/octet-stream", s = new File((l = this.currentFile) == null ? void 0 : l.arrayBuffer, n, {
        type: i
      });
      e.items.add(s), this.inputField.files = e.files;
    });
    u(this, "registerListeners", () => {
      var t, e, n, i, s, c, a;
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
      }), (c = this.channel) == null || c.on("disconnected", () => {
        this.emit("disconnected");
      }), (a = this.channel) == null || a.on("error", (l) => {
        this.emit("error", l);
      });
    });
    this.channel = new lt({
      flottformApi: t,
      createClientUrl: e,
      pollTimeForIceInMs: i,
      logger: s
    }), this.inputField = n, this.logger = s, this.registerListeners();
  }
}
class ut extends V {
  // 128KB buffer threshold (maximum of 4 chunks in the buffer waiting to be sent over the network)
  constructor({
    endpointId: t,
    flottformApi: e,
    pollTimeForIceInMs: n = J,
    logger: i = console
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
      this.openPeerConnection && this.close();
      const t = (this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)).toString().replace(/\/$/, "");
      try {
        this.rtcConfiguration.iceServers = await this.fetchIceServers(t);
      } catch (l) {
        this.logger.error(l);
      }
      this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration);
      const e = zt(), n = /* @__PURE__ */ new Set(), i = `${this.flottformApi}/${this.endpointId}`, s = `${this.flottformApi}/${this.endpointId}/client`;
      this.changeState("retrieving-info-from-endpoint");
      const { hostInfo: c } = await Se(i);
      await this.openPeerConnection.setRemoteDescription(c.session);
      const a = await this.openPeerConnection.createAnswer();
      await this.openPeerConnection.setLocalDescription(a), this.setUpConnectionStateGathering(i), this.setUpClientIceGathering(s, e, n, a), this.openPeerConnection.ondatachannel = (l) => {
        this.logger.info(`ondatachannel: ${l.channel}`), this.changeState("connected"), this.dataChannel = l.channel, this.dataChannel.bufferedAmountLowThreshold = this.BUFFER_THRESHOLD, this.dataChannel.onbufferedamountlow = () => {
          this.emit("bufferedamountlow");
        }, this.dataChannel.onopen = (h) => {
          this.logger.info(`ondatachannel - onopen: ${h.type}`);
        };
      }, this.changeState("sending-client-info"), await this.putClientInfo(s, e, n, a), this.changeState("connecting-to-host"), this.startPollingForIceCandidates(i);
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
      const { hostInfo: e } = await Se(t);
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
    this.endpointId = t, this.flottformApi = e, this.rtcConfiguration = st, this.pollTimeForIceInMs = n, this.logger = i;
  }
}
class un extends V {
  constructor({
    endpointId: t,
    fileInput: e,
    flottformApi: n,
    pollTimeForIceInMs: i = J,
    logger: s = console
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
      var s, c, a, l;
      const t = this.filesMetaData.length;
      if (this.allFilesSent || this.currentFileIndex >= t) {
        this.logger.log("All files are sent"), (s = this.channel) == null || s.sendData(JSON.stringify({ type: "transfer-complete" })), this.allFilesSent = !0, (c = this.channel) == null || c.off("bufferedamountlow", this.startSendingFiles), this.emit("done");
        return;
      }
      const e = this.filesArrayBuffer[this.currentFileIndex];
      if (!e)
        throw new Error(`Can't find the ArrayBuffer for the file number ${this.currentFileIndex}`);
      const n = e.byteLength, i = this.filesMetaData[this.currentFileIndex].name;
      for (; this.currentChunkIndex * this.chunkSize < n; ) {
        if (!((a = this.channel) != null && a.canSendMoreData())) {
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
      var t, e, n, i, s, c, a, l, h, f;
      (t = this.channel) == null || t.on("init", () => {
      }), (e = this.channel) == null || e.on("retrieving-info-from-endpoint", () => {
      }), (n = this.channel) == null || n.on("sending-client-info", () => {
      }), (i = this.channel) == null || i.on("connecting-to-host", () => {
      }), (s = this.channel) == null || s.on("connected", () => {
        this.emit("connected");
      }), (c = this.channel) == null || c.on("connection-impossible", () => {
        this.emit("webrtc:connection-impossible");
      }), (a = this.channel) == null || a.on("done", () => {
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
      pollTimeForIceInMs: i,
      logger: s
    }), this.inputField = e, this.logger = s, this.registerListeners();
  }
}
class hn extends V {
  constructor({
    endpointId: t,
    flottformApi: e,
    pollTimeForIceInMs: n = J,
    logger: i = console
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
      var t, e, n, i, s, c, a, l, h;
      (t = this.channel) == null || t.on("init", () => {
      }), (e = this.channel) == null || e.on("retrieving-info-from-endpoint", () => {
      }), (n = this.channel) == null || n.on("sending-client-info", () => {
      }), (i = this.channel) == null || i.on("connecting-to-host", () => {
      }), (s = this.channel) == null || s.on("connected", () => {
        this.emit("connected");
      }), (c = this.channel) == null || c.on("connection-impossible", () => {
        this.emit("webrtc:connection-impossible");
      }), (a = this.channel) == null || a.on("done", () => {
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
      pollTimeForIceInMs: n,
      logger: i
    }), this.logger = i, this.registerListeners();
  }
}
class $t extends ct {
  constructor({
    flottformApi: t,
    createClientUrl: e,
    pollTimeForIceInMs: n = J,
    logger: i = console
  }) {
    super();
    u(this, "channel", null);
    u(this, "logger");
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
      this.emit("receive"), this.emit("done", t.data);
    });
    u(this, "registerListeners", () => {
      var t, e, n, i, s, c, a;
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
      }), (c = this.channel) == null || c.on("disconnected", () => {
        this.emit("disconnected");
      }), (a = this.channel) == null || a.on("error", (l) => {
        this.emit("error", l);
      });
    });
    this.channel = new lt({
      flottformApi: t,
      createClientUrl: e,
      pollTimeForIceInMs: n,
      logger: i
    }), this.logger = i, this.registerListeners();
  }
}
const Ht = () => {
  const r = document.querySelector(
    ".flottform-elements-container-wrapper"
  ), o = document.querySelector(".flottform-opener-triangle");
  r.classList.toggle("flottform-open"), o.classList.toggle("flottform-button-svg-open");
}, xt = (r, o, t) => {
  const e = document.createElement("div");
  e.setAttribute("class", `flottform-root${t ?? ""}`);
  const n = Kt(r);
  e.appendChild(n);
  const i = Gt(o);
  return e.appendChild(i), e;
}, Ot = (r, o) => {
  const t = document.createElement("img");
  t.setAttribute("class", "flottform-qr-code"), t.setAttribute("src", r);
  const e = document.createElement("div");
  return e.setAttribute("class", "flottform-link-offer"), e.innerText = o, {
    createChannelQrCode: t,
    createChannelLinkWithOffer: e
  };
}, fn = ({
  flottformAnchorElement: r,
  flottformRootElement: o,
  additionalComponentClass: t,
  flottformRootTitle: e,
  flottformRootDescription: n
}) => {
  const i = o ?? document.querySelector(".flottform-root") ?? xt(e, n, t), s = i.querySelector(".flottform-elements-container"), c = i.querySelector(
    ".flottform-elements-container-wrapper"
  );
  return c.appendChild(s), i.appendChild(c), r.appendChild(i), {
    flottformRoot: i,
    getAllFlottformItems: () => {
      const a = i.querySelector(".flottform-inputs-list");
      return a ? a.childNodes : (console.error("No element with class .flottform-inputs-list found"), null);
    },
    createFileItem: ({
      flottformApi: a,
      createClientUrl: l,
      inputField: h,
      id: f,
      additionalItemClasses: g,
      label: d,
      buttonLabel: T,
      onErrorText: F,
      onSuccessText: L
    }) => {
      const y = new _t({
        flottformApi: a,
        createClientUrl: l,
        inputField: h
      }), {
        flottformItem: B,
        statusInformation: P,
        refreshChannelButton: b,
        flottformStateItemsContainer: M
      } = tt({
        flottformBaseInputHost: y,
        additionalItemClasses: g,
        label: d,
        buttonLabel: T,
        onErrorText: F
      }), p = i.querySelector(".flottform-inputs-list");
      p.appendChild(B), s.appendChild(p), Jt({
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
      flottformApi: a,
      createClientUrl: l,
      inputField: h,
      id: f,
      additionalItemClasses: g,
      label: d,
      buttonLabel: T,
      onErrorText: F,
      onSuccessText: L
    }) => {
      const y = new $t({
        flottformApi: a,
        createClientUrl: l
      }), { flottformItem: B, statusInformation: P, refreshChannelButton: b } = tt({
        flottformBaseInputHost: y,
        additionalItemClasses: g,
        label: d,
        buttonLabel: T,
        onErrorText: F
      }), M = i.querySelector(".flottform-inputs-list");
      M.appendChild(B), s.appendChild(M), Vt({
        flottformItem: B,
        statusInformation: P,
        refreshChannelButton: b,
        flottformTextInputHost: y,
        id: f,
        onSuccessText: L,
        inputField: h
      });
    }
  };
}, tt = ({
  flottformBaseInputHost: r,
  additionalItemClasses: o,
  label: t,
  buttonLabel: e,
  onErrorText: n
}) => {
  const i = jt(o);
  en({ label: t, flottformItem: i });
  const s = Yt(), c = Wt(e);
  c.addEventListener("click", () => r.start());
  const a = Qt(c);
  i.appendChild(a);
  const l = Zt();
  return l.addEventListener("click", () => r.start()), r.on("endpoint-created", ({ link: h, qrCode: f }) => {
    const { createChannelQrCode: g, createChannelLinkWithOffer: d } = Ot(f, h), T = tn();
    a.replaceChildren(g);
    const F = document.createElement("div");
    F.setAttribute("class", "flottform-copy-button-link-wrapper"), F.appendChild(T), F.appendChild(d), a.appendChild(F);
  }), r.on("connected", () => {
    s.innerHTML = "Connected", s.appendChild(l), a.replaceChildren(s);
  }), r.on("error", (h) => {
    s.innerHTML = typeof n == "function" ? n(h) : n ?? `🚨 An error occured (${h.message}). Please try again`, c.innerText = "Retry", a.replaceChildren(s), a.appendChild(c);
  }), { flottformItem: i, statusInformation: s, refreshChannelButton: l, flottformStateItemsContainer: a };
}, Jt = ({
  flottformItem: r,
  statusInformation: o,
  refreshChannelButton: t,
  flottformStateItemsContainer: e,
  flottformFileInputHost: n,
  id: i,
  onSuccessText: s
}) => {
  i && r.setAttribute("id", i), n.on(
    "progress",
    ({ currentFileProgress: c, overallProgress: a, fileIndex: l, totalFileCount: h, fileName: f }) => {
      nn(e), cn(
        e,
        a,
        l,
        h
      );
      const g = on(e);
      sn(
        l,
        f,
        c,
        g,
        e
      );
    }
  ), n.on("done", () => {
    o.innerHTML = s ?? "✨ You have succesfully downloaded all your files.", o.appendChild(t), e.replaceChildren(o);
  });
}, Vt = ({
  flottformItem: r,
  statusInformation: o,
  refreshChannelButton: t,
  flottformTextInputHost: e,
  id: n,
  onSuccessText: i,
  inputField: s
}) => {
  n && r.setAttribute("id", n), e.on("done", (c) => {
    if (o.innerHTML = i ?? "✨ You have succesfully submitted your message", o.appendChild(t), r.replaceChildren(o), s) {
      s.setAttribute("value", c);
      const a = new Event("change");
      s.dispatchEvent(a);
    }
  });
}, Kt = (r) => {
  const o = document.createElement("button");
  return o.setAttribute("type", "button"), o.setAttribute("class", "flottform-root-opener-button"), o.innerHTML = `<span>${r ?? "Fill from Another Device"}</span><svg class="flottform-opener-triangle" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5,8.5l6,7l6-7H6.5z"/></svg>`, o.addEventListener("click", () => Ht()), o;
}, Gt = (r) => {
  const o = document.createElement("div");
  o.setAttribute("class", "flottform-elements-container");
  const t = document.createElement("div");
  if (t.setAttribute("class", "flottform-elements-container-wrapper"), r !== "") {
    const n = document.createElement("div");
    n.setAttribute("class", "flottform-root-description"), n.innerText = r ?? "This form is powered by Flottform. Need to add details from another device? Simply click a button below to generate a QR code or link, and easily upload information from your other device.", o.appendChild(n);
  }
  const e = document.createElement("ul");
  return e.setAttribute("class", "flottform-inputs-list"), o.appendChild(e), t.appendChild(o), t;
}, jt = (r) => {
  const o = document.createElement("li");
  return o.setAttribute("class", `flottform-item${r ?? ""}`), o;
}, Yt = () => {
  const r = document.createElement("div");
  return r.setAttribute("class", "flottform-status-information"), r;
}, Qt = (r) => {
  const o = document.createElement("div");
  return o.setAttribute("class", "flottform-state-items-container"), o.appendChild(r), o;
}, Wt = (r) => {
  const o = document.createElement("button");
  return o.setAttribute("type", "button"), o.setAttribute("class", "flottform-button"), o.innerText = r ?? "Get a link", o;
}, Zt = () => {
  const r = document.createElement("button");
  return r.setAttribute("type", "button"), r.setAttribute("class", "flottform-refresh-connection-button"), r.setAttribute(
    "title",
    "Click this button to refresh Flottform connection for the input field. Previous connection will be closed"
  ), r.setAttribute(
    "aria-label",
    "Click this button to refresh Flottform connection for the input field. Previous connection will be closed"
  ), r.innerHTML = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2c-5.288 0-9.649 3.914-10.377 9h-3.123l4 5.917 4-5.917h-2.847c.711-3.972 4.174-7 8.347-7 4.687 0 8.5 3.813 8.5 8.5s-3.813 8.5-8.5 8.5c-3.015 0-5.662-1.583-7.171-3.957l-1.2 1.775c1.916 2.536 4.948 4.182 8.371 4.182 5.797 0 10.5-4.702 10.5-10.5s-4.703-10.5-10.5-10.5z"/></svg>', r;
};
let Xt = 1;
const en = ({
  label: r,
  flottformItem: o
}) => {
  const t = document.createElement("p"), e = r ?? `File input ${Xt++}`;
  e && (t.innerHTML = e, o.appendChild(t));
}, tn = () => {
  const r = document.createElement("button");
  return r.setAttribute("class", "flottform-copy-to-clipboard"), r.setAttribute("type", "button"), r.setAttribute("title", "Copy Flottform link to clipboard"), r.setAttribute("aria-label", "Copy Flottform link to clipboard"), r.innerText = "📋", r.addEventListener("click", async () => {
    const o = document.querySelector(".flottform-link-offer").innerText;
    navigator.clipboard.writeText(o).then(() => {
      r.innerText = "✅", setTimeout(() => {
        r.innerText = "📋";
      }, 1e3);
    }).catch((t) => {
      r.innerText = `❌ Failed to copy: ${t}`, setTimeout(() => {
        r.innerText = "📋";
      }, 1e3);
    });
  }), r;
}, nn = (r) => {
  r.querySelector(
    ".flottform-status-information"
  ) && (r.innerHTML = "");
}, on = (r) => {
  let o = r.querySelector("details");
  if (!o) {
    o = document.createElement("details");
    const t = document.createElement("summary");
    t.innerText = "Details", o.appendChild(t);
    const e = document.createElement("div");
    e.classList.add("details-container"), o.appendChild(e), r.appendChild(o);
  }
  return o;
}, rn = (r, o) => {
  const t = document.createElement("label");
  t.setAttribute("id", `flottform-status-bar-${r}`), t.classList.add("flottform-progress-bar-label"), t.innerText = `File ${o} progress:`;
  const e = document.createElement("progress");
  return e.setAttribute("id", `flottform-status-bar-${r}`), e.classList.add("flottform-status-bar"), e.setAttribute("max", "100"), e.setAttribute("value", "0"), { currentFileLabel: t, progressBar: e };
}, sn = (r, o, t, e, n) => {
  let i = n.querySelector(
    `progress#flottform-status-bar-${r}`
  );
  if (!i) {
    const { currentFileLabel: s, progressBar: c } = rn(r, o);
    i = c;
    const a = e.querySelector(".details-container");
    a.appendChild(s), a.appendChild(i);
  }
  i.value = t * 100, i.innerText = `${t * 100}%`;
}, an = () => {
  const r = document.createElement("label");
  r.setAttribute("id", "flottform-status-bar-overall-progress"), r.classList.add("flottform-progress-bar-label"), r.innerText = "Receiving Files Progress";
  const o = document.createElement("progress");
  return o.setAttribute("id", "flottform-status-bar-overall-progress"), o.classList.add("flottform-status-bar"), o.setAttribute("max", "100"), o.setAttribute("value", "0"), { overallFilesLabel: r, progressBar: o };
}, cn = (r, o, t, e) => {
  let n = r.querySelector("progress#flottform-status-bar-overall-progress");
  if (!n) {
    const { overallFilesLabel: s, progressBar: c } = an();
    n = c, r.appendChild(s), r.appendChild(n);
  }
  const i = r.querySelector(
    "label#flottform-status-bar-overall-progress"
  );
  n.value = o * 100, n.innerText = `${o * 100}%`, i.innerText = `Receiving file ${t + 1} of ${e}`;
};
export {
  Te as ConnectionManager,
  un as FlottformFileInputClient,
  _t as FlottformFileInputHost,
  hn as FlottformTextInputClient,
  $t as FlottformTextInputHost,
  fn as createDefaultFlottformComponent
};
//# sourceMappingURL=flottform-bundle.js.map
