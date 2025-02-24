var me = Object.defineProperty;
var Ce = (o, r, e) => r in o ? me(o, r, { enumerable: !0, configurable: !0, writable: !0, value: e }) : o[r] = e;
var u = (o, r, e) => Ce(o, typeof r != "symbol" ? r + "" : r, e);
const q = class q {
  constructor() {
    u(this, "activeConnections");
    this.activeConnections = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    return q.instance || (q.instance = new q()), q.instance;
  }
  addConnection(r, e) {
    this.activeConnections.set(r, e);
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
let vt = q;
var $ = {}, et, Lt;
function ye() {
  return Lt || (Lt = 1, et = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), et;
}
var nt = {}, U = {}, Mt;
function K() {
  if (Mt) return U;
  Mt = 1;
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
  return U.getSymbolSize = function(t) {
    if (!t) throw new Error('"version" cannot be null or undefined');
    if (t < 1 || t > 40) throw new Error('"version" should be in range from 1 to 40');
    return t * 4 + 17;
  }, U.getSymbolTotalCodewords = function(t) {
    return r[t];
  }, U.getBCHDigit = function(e) {
    let t = 0;
    for (; e !== 0; )
      t++, e >>>= 1;
    return t;
  }, U.setToSJISFunction = function(t) {
    if (typeof t != "function")
      throw new Error('"toSJISFunc" is not a valid function.');
    o = t;
  }, U.isKanjiModeEnabled = function() {
    return typeof o < "u";
  }, U.toSJIS = function(t) {
    return o(t);
  }, U;
}
var it = {}, Rt;
function Tt() {
  return Rt || (Rt = 1, function(o) {
    o.L = { bit: 1 }, o.M = { bit: 0 }, o.Q = { bit: 3 }, o.H = { bit: 2 };
    function r(e) {
      if (typeof e != "string")
        throw new Error("Param is not a string");
      switch (e.toLowerCase()) {
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
          throw new Error("Unknown EC Level: " + e);
      }
    }
    o.isValid = function(t) {
      return t && typeof t.bit < "u" && t.bit >= 0 && t.bit < 4;
    }, o.from = function(t, n) {
      if (o.isValid(t))
        return t;
      try {
        return r(t);
      } catch {
        return n;
      }
    };
  }(it)), it;
}
var ot, Nt;
function we() {
  if (Nt) return ot;
  Nt = 1;
  function o() {
    this.buffer = [], this.length = 0;
  }
  return o.prototype = {
    get: function(r) {
      const e = Math.floor(r / 8);
      return (this.buffer[e] >>> 7 - r % 8 & 1) === 1;
    },
    put: function(r, e) {
      for (let t = 0; t < e; t++)
        this.putBit((r >>> e - t - 1 & 1) === 1);
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(r) {
      const e = Math.floor(this.length / 8);
      this.buffer.length <= e && this.buffer.push(0), r && (this.buffer[e] |= 128 >>> this.length % 8), this.length++;
    }
  }, ot = o, ot;
}
var rt, Dt;
function be() {
  if (Dt) return rt;
  Dt = 1;
  function o(r) {
    if (!r || r < 1)
      throw new Error("BitMatrix size must be defined and greater than 0");
    this.size = r, this.data = new Uint8Array(r * r), this.reservedBit = new Uint8Array(r * r);
  }
  return o.prototype.set = function(r, e, t, n) {
    const i = r * this.size + e;
    this.data[i] = t, n && (this.reservedBit[i] = !0);
  }, o.prototype.get = function(r, e) {
    return this.data[r * this.size + e];
  }, o.prototype.xor = function(r, e, t) {
    this.data[r * this.size + e] ^= t;
  }, o.prototype.isReserved = function(r, e) {
    return this.reservedBit[r * this.size + e];
  }, rt = o, rt;
}
var st = {}, kt;
function Se() {
  return kt || (kt = 1, function(o) {
    const r = K().getSymbolSize;
    o.getRowColCoords = function(t) {
      if (t === 1) return [];
      const n = Math.floor(t / 7) + 2, i = r(t), s = i === 145 ? 26 : Math.ceil((i - 13) / (2 * n - 2)) * 2, a = [i - 7];
      for (let c = 1; c < n - 1; c++)
        a[c] = a[c - 1] - s;
      return a.push(6), a.reverse();
    }, o.getPositions = function(t) {
      const n = [], i = o.getRowColCoords(t), s = i.length;
      for (let a = 0; a < s; a++)
        for (let c = 0; c < s; c++)
          a === 0 && c === 0 || // top-left
          a === 0 && c === s - 1 || // bottom-left
          a === s - 1 && c === 0 || n.push([i[a], i[c]]);
      return n;
    };
  }(st)), st;
}
var at = {}, Ut;
function Ee() {
  if (Ut) return at;
  Ut = 1;
  const o = K().getSymbolSize, r = 7;
  return at.getPositions = function(t) {
    const n = o(t);
    return [
      // top-left
      [0, 0],
      // top-right
      [n - r, 0],
      // bottom-left
      [0, n - r]
    ];
  }, at;
}
var ct = {}, qt;
function Fe() {
  return qt || (qt = 1, function(o) {
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
    function e(t, n, i) {
      switch (t) {
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
          throw new Error("bad maskPattern:" + t);
      }
    }
    o.applyMask = function(n, i) {
      const s = i.size;
      for (let a = 0; a < s; a++)
        for (let c = 0; c < s; c++)
          i.isReserved(c, a) || i.xor(c, a, e(n, c, a));
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
  }(ct)), ct;
}
var j = {}, Kt;
function re() {
  if (Kt) return j;
  Kt = 1;
  const o = Tt(), r = [
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
  ], e = [
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
  return j.getBlocksCount = function(n, i) {
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
  }, j.getTotalCodewordsCount = function(n, i) {
    switch (i) {
      case o.L:
        return e[(n - 1) * 4 + 0];
      case o.M:
        return e[(n - 1) * 4 + 1];
      case o.Q:
        return e[(n - 1) * 4 + 2];
      case o.H:
        return e[(n - 1) * 4 + 3];
      default:
        return;
    }
  }, j;
}
var lt = {}, H = {}, zt;
function Ie() {
  if (zt) return H;
  zt = 1;
  const o = new Uint8Array(512), r = new Uint8Array(256);
  return function() {
    let t = 1;
    for (let n = 0; n < 255; n++)
      o[n] = t, r[t] = n, t <<= 1, t & 256 && (t ^= 285);
    for (let n = 255; n < 512; n++)
      o[n] = o[n - 255];
  }(), H.log = function(t) {
    if (t < 1) throw new Error("log(" + t + ")");
    return r[t];
  }, H.exp = function(t) {
    return o[t];
  }, H.mul = function(t, n) {
    return t === 0 || n === 0 ? 0 : o[r[t] + r[n]];
  }, H;
}
var _t;
function Te() {
  return _t || (_t = 1, function(o) {
    const r = Ie();
    o.mul = function(t, n) {
      const i = new Uint8Array(t.length + n.length - 1);
      for (let s = 0; s < t.length; s++)
        for (let a = 0; a < n.length; a++)
          i[s + a] ^= r.mul(t[s], n[a]);
      return i;
    }, o.mod = function(t, n) {
      let i = new Uint8Array(t);
      for (; i.length - n.length >= 0; ) {
        const s = i[0];
        for (let c = 0; c < n.length; c++)
          i[c] ^= r.mul(n[c], s);
        let a = 0;
        for (; a < i.length && i[a] === 0; ) a++;
        i = i.slice(a);
      }
      return i;
    }, o.generateECPolynomial = function(t) {
      let n = new Uint8Array([1]);
      for (let i = 0; i < t; i++)
        n = o.mul(n, new Uint8Array([1, r.exp(i)]));
      return n;
    };
  }(lt)), lt;
}
var ut, $t;
function Ae() {
  if ($t) return ut;
  $t = 1;
  const o = Te();
  function r(e) {
    this.genPoly = void 0, this.degree = e, this.degree && this.initialize(this.degree);
  }
  return r.prototype.initialize = function(t) {
    this.degree = t, this.genPoly = o.generateECPolynomial(this.degree);
  }, r.prototype.encode = function(t) {
    if (!this.genPoly)
      throw new Error("Encoder not initialized");
    const n = new Uint8Array(t.length + this.degree);
    n.set(t);
    const i = o.mod(n, this.genPoly), s = this.degree - i.length;
    if (s > 0) {
      const a = new Uint8Array(this.degree);
      return a.set(i, s), a;
    }
    return i;
  }, ut = r, ut;
}
var ht = {}, ft = {}, dt = {}, xt;
function se() {
  return xt || (xt = 1, dt.isValid = function(r) {
    return !isNaN(r) && r >= 1 && r <= 40;
  }), dt;
}
var R = {}, Ht;
function ae() {
  if (Ht) return R;
  Ht = 1;
  const o = "[0-9]+", r = "[A-Z $%*+\\-./:]+";
  let e = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  e = e.replace(/u/g, "\\u");
  const t = "(?:(?![A-Z0-9 $%*+\\-./:]|" + e + `)(?:.|[\r
]))+`;
  R.KANJI = new RegExp(e, "g"), R.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), R.BYTE = new RegExp(t, "g"), R.NUMERIC = new RegExp(o, "g"), R.ALPHANUMERIC = new RegExp(r, "g");
  const n = new RegExp("^" + e + "$"), i = new RegExp("^" + o + "$"), s = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return R.testKanji = function(c) {
    return n.test(c);
  }, R.testNumeric = function(c) {
    return i.test(c);
  }, R.testAlphanumeric = function(c) {
    return s.test(c);
  }, R;
}
var Ot;
function z() {
  return Ot || (Ot = 1, function(o) {
    const r = se(), e = ae();
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
      return e.testNumeric(i) ? o.NUMERIC : e.testAlphanumeric(i) ? o.ALPHANUMERIC : e.testKanji(i) ? o.KANJI : o.BYTE;
    }, o.toString = function(i) {
      if (i && i.id) return i.id;
      throw new Error("Invalid mode");
    }, o.isValid = function(i) {
      return i && i.bit && i.ccBits;
    };
    function t(n) {
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
        return t(i);
      } catch {
        return s;
      }
    };
  }(ft)), ft;
}
var Jt;
function Pe() {
  return Jt || (Jt = 1, function(o) {
    const r = K(), e = re(), t = Tt(), n = z(), i = se(), s = 7973, a = r.getBCHDigit(s);
    function c(g, d, A) {
      for (let I = 1; I <= 40; I++)
        if (d <= o.getCapacity(I, A, g))
          return I;
    }
    function l(g, d) {
      return n.getCharCountIndicator(g, d) + 4;
    }
    function h(g, d) {
      let A = 0;
      return g.forEach(function(I) {
        const L = l(I.mode, d);
        A += L + I.getBitsLength();
      }), A;
    }
    function f(g, d) {
      for (let A = 1; A <= 40; A++)
        if (h(g, A) <= o.getCapacity(A, d, n.MIXED))
          return A;
    }
    o.from = function(d, A) {
      return i.isValid(d) ? parseInt(d, 10) : A;
    }, o.getCapacity = function(d, A, I) {
      if (!i.isValid(d))
        throw new Error("Invalid QR Code version");
      typeof I > "u" && (I = n.BYTE);
      const L = r.getSymbolTotalCodewords(d), w = e.getTotalCodewordsCount(d, A), B = (L - w) * 8;
      if (I === n.MIXED) return B;
      const T = B - l(I, d);
      switch (I) {
        case n.NUMERIC:
          return Math.floor(T / 10 * 3);
        case n.ALPHANUMERIC:
          return Math.floor(T / 11 * 2);
        case n.KANJI:
          return Math.floor(T / 13);
        case n.BYTE:
        default:
          return Math.floor(T / 8);
      }
    }, o.getBestVersionForData = function(d, A) {
      let I;
      const L = t.from(A, t.M);
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
      let A = d << 12;
      for (; r.getBCHDigit(A) - a >= 0; )
        A ^= s << r.getBCHDigit(A) - a;
      return d << 12 | A;
    };
  }(ht)), ht;
}
var gt = {}, Gt;
function Be() {
  if (Gt) return gt;
  Gt = 1;
  const o = K(), r = 1335, e = 21522, t = o.getBCHDigit(r);
  return gt.getEncodedBits = function(i, s) {
    const a = i.bit << 3 | s;
    let c = a << 10;
    for (; o.getBCHDigit(c) - t >= 0; )
      c ^= r << o.getBCHDigit(c) - t;
    return (a << 10 | c) ^ e;
  }, gt;
}
var pt = {}, mt, Vt;
function ve() {
  if (Vt) return mt;
  Vt = 1;
  const o = z();
  function r(e) {
    this.mode = o.NUMERIC, this.data = e.toString();
  }
  return r.getBitsLength = function(t) {
    return 10 * Math.floor(t / 3) + (t % 3 ? t % 3 * 3 + 1 : 0);
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(t) {
    let n, i, s;
    for (n = 0; n + 3 <= this.data.length; n += 3)
      i = this.data.substr(n, 3), s = parseInt(i, 10), t.put(s, 10);
    const a = this.data.length - n;
    a > 0 && (i = this.data.substr(n), s = parseInt(i, 10), t.put(s, a * 3 + 1));
  }, mt = r, mt;
}
var Ct, jt;
function Le() {
  if (jt) return Ct;
  jt = 1;
  const o = z(), r = [
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
  function e(t) {
    this.mode = o.ALPHANUMERIC, this.data = t;
  }
  return e.getBitsLength = function(n) {
    return 11 * Math.floor(n / 2) + 6 * (n % 2);
  }, e.prototype.getLength = function() {
    return this.data.length;
  }, e.prototype.getBitsLength = function() {
    return e.getBitsLength(this.data.length);
  }, e.prototype.write = function(n) {
    let i;
    for (i = 0; i + 2 <= this.data.length; i += 2) {
      let s = r.indexOf(this.data[i]) * 45;
      s += r.indexOf(this.data[i + 1]), n.put(s, 11);
    }
    this.data.length % 2 && n.put(r.indexOf(this.data[i]), 6);
  }, Ct = e, Ct;
}
var yt, Yt;
function Me() {
  if (Yt) return yt;
  Yt = 1;
  const o = z();
  function r(e) {
    this.mode = o.BYTE, typeof e == "string" ? this.data = new TextEncoder().encode(e) : this.data = new Uint8Array(e);
  }
  return r.getBitsLength = function(t) {
    return t * 8;
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(e) {
    for (let t = 0, n = this.data.length; t < n; t++)
      e.put(this.data[t], 8);
  }, yt = r, yt;
}
var wt, Qt;
function Re() {
  if (Qt) return wt;
  Qt = 1;
  const o = z(), r = K();
  function e(t) {
    this.mode = o.KANJI, this.data = t;
  }
  return e.getBitsLength = function(n) {
    return n * 13;
  }, e.prototype.getLength = function() {
    return this.data.length;
  }, e.prototype.getBitsLength = function() {
    return e.getBitsLength(this.data.length);
  }, e.prototype.write = function(t) {
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
      i = (i >>> 8 & 255) * 192 + (i & 255), t.put(i, 13);
    }
  }, wt = e, wt;
}
var bt = { exports: {} }, Wt;
function Ne() {
  return Wt || (Wt = 1, function(o) {
    var r = {
      single_source_shortest_paths: function(e, t, n) {
        var i = {}, s = {};
        s[t] = 0;
        var a = r.PriorityQueue.make();
        a.push(t, 0);
        for (var c, l, h, f, g, d, A, I, L; !a.empty(); ) {
          c = a.pop(), l = c.value, f = c.cost, g = e[l] || {};
          for (h in g)
            g.hasOwnProperty(h) && (d = g[h], A = f + d, I = s[h], L = typeof s[h] > "u", (L || I > A) && (s[h] = A, a.push(h, A), i[h] = l));
        }
        if (typeof n < "u" && typeof s[n] > "u") {
          var w = ["Could not find a path from ", t, " to ", n, "."].join("");
          throw new Error(w);
        }
        return i;
      },
      extract_shortest_path_from_predecessor_list: function(e, t) {
        for (var n = [], i = t; i; )
          n.push(i), e[i], i = e[i];
        return n.reverse(), n;
      },
      find_path: function(e, t, n) {
        var i = r.single_source_shortest_paths(e, t, n);
        return r.extract_shortest_path_from_predecessor_list(
          i,
          n
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(e) {
          var t = r.PriorityQueue, n = {}, i;
          e = e || {};
          for (i in t)
            t.hasOwnProperty(i) && (n[i] = t[i]);
          return n.queue = [], n.sorter = e.sorter || t.default_sorter, n;
        },
        default_sorter: function(e, t) {
          return e.cost - t.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(e, t) {
          var n = { value: e, cost: t };
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
  }(bt)), bt.exports;
}
var Zt;
function De() {
  return Zt || (Zt = 1, function(o) {
    const r = z(), e = ve(), t = Le(), n = Me(), i = Re(), s = ae(), a = K(), c = Ne();
    function l(w) {
      return unescape(encodeURIComponent(w)).length;
    }
    function h(w, B, T) {
      const b = [];
      let M;
      for (; (M = w.exec(T)) !== null; )
        b.push({
          data: M[0],
          index: M.index,
          mode: B,
          length: M[0].length
        });
      return b;
    }
    function f(w) {
      const B = h(s.NUMERIC, r.NUMERIC, w), T = h(s.ALPHANUMERIC, r.ALPHANUMERIC, w);
      let b, M;
      return a.isKanjiModeEnabled() ? (b = h(s.BYTE, r.BYTE, w), M = h(s.KANJI, r.KANJI, w)) : (b = h(s.BYTE_KANJI, r.BYTE, w), M = []), B.concat(T, b, M).sort(function(E, S) {
        return E.index - S.index;
      }).map(function(E) {
        return {
          data: E.data,
          mode: E.mode,
          length: E.length
        };
      });
    }
    function g(w, B) {
      switch (B) {
        case r.NUMERIC:
          return e.getBitsLength(w);
        case r.ALPHANUMERIC:
          return t.getBitsLength(w);
        case r.KANJI:
          return i.getBitsLength(w);
        case r.BYTE:
          return n.getBitsLength(w);
      }
    }
    function d(w) {
      return w.reduce(function(B, T) {
        const b = B.length - 1 >= 0 ? B[B.length - 1] : null;
        return b && b.mode === T.mode ? (B[B.length - 1].data += T.data, B) : (B.push(T), B);
      }, []);
    }
    function A(w) {
      const B = [];
      for (let T = 0; T < w.length; T++) {
        const b = w[T];
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
    function I(w, B) {
      const T = {}, b = { start: {} };
      let M = ["start"];
      for (let p = 0; p < w.length; p++) {
        const E = w[p], S = [];
        for (let m = 0; m < E.length; m++) {
          const P = E[m], C = "" + p + m;
          S.push(C), T[C] = { node: P, lastCount: 0 }, b[C] = {};
          for (let F = 0; F < M.length; F++) {
            const y = M[F];
            T[y] && T[y].node.mode === P.mode ? (b[y][C] = g(T[y].lastCount + P.length, P.mode) - g(T[y].lastCount, P.mode), T[y].lastCount += P.length) : (T[y] && (T[y].lastCount = P.length), b[y][C] = g(P.length, P.mode) + 4 + r.getCharCountIndicator(P.mode, B));
          }
        }
        M = S;
      }
      for (let p = 0; p < M.length; p++)
        b[M[p]].end = 0;
      return { map: b, table: T };
    }
    function L(w, B) {
      let T;
      const b = r.getBestModeForData(w);
      if (T = r.from(B, b), T !== r.BYTE && T.bit < b.bit)
        throw new Error('"' + w + '" cannot be encoded with mode ' + r.toString(T) + `.
 Suggested mode is: ` + r.toString(b));
      switch (T === r.KANJI && !a.isKanjiModeEnabled() && (T = r.BYTE), T) {
        case r.NUMERIC:
          return new e(w);
        case r.ALPHANUMERIC:
          return new t(w);
        case r.KANJI:
          return new i(w);
        case r.BYTE:
          return new n(w);
      }
    }
    o.fromArray = function(B) {
      return B.reduce(function(T, b) {
        return typeof b == "string" ? T.push(L(b, null)) : b.data && T.push(L(b.data, b.mode)), T;
      }, []);
    }, o.fromString = function(B, T) {
      const b = f(B, a.isKanjiModeEnabled()), M = A(b), p = I(M, T), E = c.find_path(p.map, "start", "end"), S = [];
      for (let m = 1; m < E.length - 1; m++)
        S.push(p.table[E[m]].node);
      return o.fromArray(d(S));
    }, o.rawSplit = function(B) {
      return o.fromArray(
        f(B, a.isKanjiModeEnabled())
      );
    };
  }(pt)), pt;
}
var Xt;
function ke() {
  if (Xt) return nt;
  Xt = 1;
  const o = K(), r = Tt(), e = we(), t = be(), n = Se(), i = Ee(), s = Fe(), a = re(), c = Ae(), l = Pe(), h = Be(), f = z(), g = De();
  function d(p, E) {
    const S = p.size, m = i.getPositions(E);
    for (let P = 0; P < m.length; P++) {
      const C = m[P][0], F = m[P][1];
      for (let y = -1; y <= 7; y++)
        if (!(C + y <= -1 || S <= C + y))
          for (let v = -1; v <= 7; v++)
            F + v <= -1 || S <= F + v || (y >= 0 && y <= 6 && (v === 0 || v === 6) || v >= 0 && v <= 6 && (y === 0 || y === 6) || y >= 2 && y <= 4 && v >= 2 && v <= 4 ? p.set(C + y, F + v, !0, !0) : p.set(C + y, F + v, !1, !0));
    }
  }
  function A(p) {
    const E = p.size;
    for (let S = 8; S < E - 8; S++) {
      const m = S % 2 === 0;
      p.set(S, 6, m, !0), p.set(6, S, m, !0);
    }
  }
  function I(p, E) {
    const S = n.getPositions(E);
    for (let m = 0; m < S.length; m++) {
      const P = S[m][0], C = S[m][1];
      for (let F = -2; F <= 2; F++)
        for (let y = -2; y <= 2; y++)
          F === -2 || F === 2 || y === -2 || y === 2 || F === 0 && y === 0 ? p.set(P + F, C + y, !0, !0) : p.set(P + F, C + y, !1, !0);
    }
  }
  function L(p, E) {
    const S = p.size, m = l.getEncodedBits(E);
    let P, C, F;
    for (let y = 0; y < 18; y++)
      P = Math.floor(y / 3), C = y % 3 + S - 8 - 3, F = (m >> y & 1) === 1, p.set(P, C, F, !0), p.set(C, P, F, !0);
  }
  function w(p, E, S) {
    const m = p.size, P = h.getEncodedBits(E, S);
    let C, F;
    for (C = 0; C < 15; C++)
      F = (P >> C & 1) === 1, C < 6 ? p.set(C, 8, F, !0) : C < 8 ? p.set(C + 1, 8, F, !0) : p.set(m - 15 + C, 8, F, !0), C < 8 ? p.set(8, m - C - 1, F, !0) : C < 9 ? p.set(8, 15 - C - 1 + 1, F, !0) : p.set(8, 15 - C - 1, F, !0);
    p.set(m - 8, 8, 1, !0);
  }
  function B(p, E) {
    const S = p.size;
    let m = -1, P = S - 1, C = 7, F = 0;
    for (let y = S - 1; y > 0; y -= 2)
      for (y === 6 && y--; ; ) {
        for (let v = 0; v < 2; v++)
          if (!p.isReserved(P, y - v)) {
            let k = !1;
            F < E.length && (k = (E[F] >>> C & 1) === 1), p.set(P, y - v, k), C--, C === -1 && (F++, C = 7);
          }
        if (P += m, P < 0 || S <= P) {
          P -= m, m = -m;
          break;
        }
      }
  }
  function T(p, E, S) {
    const m = new e();
    S.forEach(function(v) {
      m.put(v.mode.bit, 4), m.put(v.getLength(), f.getCharCountIndicator(v.mode, p)), v.write(m);
    });
    const P = o.getSymbolTotalCodewords(p), C = a.getTotalCodewordsCount(p, E), F = (P - C) * 8;
    for (m.getLengthInBits() + 4 <= F && m.put(0, 4); m.getLengthInBits() % 8 !== 0; )
      m.putBit(0);
    const y = (F - m.getLengthInBits()) / 8;
    for (let v = 0; v < y; v++)
      m.put(v % 2 ? 17 : 236, 8);
    return b(m, p, E);
  }
  function b(p, E, S) {
    const m = o.getSymbolTotalCodewords(E), P = a.getTotalCodewordsCount(E, S), C = m - P, F = a.getBlocksCount(E, S), y = m % F, v = F - y, k = Math.floor(m / F), x = Math.floor(C / F), de = x + 1, At = k - x, ge = new c(At);
    let W = 0;
    const V = new Array(F), Pt = new Array(F);
    let Z = 0;
    const pe = new Uint8Array(p.buffer);
    for (let _ = 0; _ < F; _++) {
      const tt = _ < v ? x : de;
      V[_] = pe.slice(W, W + tt), Pt[_] = ge.encode(V[_]), W += tt, Z = Math.max(Z, tt);
    }
    const X = new Uint8Array(m);
    let Bt = 0, N, D;
    for (N = 0; N < Z; N++)
      for (D = 0; D < F; D++)
        N < V[D].length && (X[Bt++] = V[D][N]);
    for (N = 0; N < At; N++)
      for (D = 0; D < F; D++)
        X[Bt++] = Pt[D][N];
    return X;
  }
  function M(p, E, S, m) {
    let P;
    if (Array.isArray(p))
      P = g.fromArray(p);
    else if (typeof p == "string") {
      let k = E;
      if (!k) {
        const x = g.rawSplit(p);
        k = l.getBestVersionForData(x, S);
      }
      P = g.fromString(p, k || 40);
    } else
      throw new Error("Invalid data");
    const C = l.getBestVersionForData(P, S);
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
    const F = T(E, S, P), y = o.getSymbolSize(E), v = new t(y);
    return d(v, E), A(v), I(v, E), w(v, S, 0), E >= 7 && L(v, E), B(v, F), isNaN(m) && (m = s.getBestMask(
      v,
      w.bind(null, v, S)
    )), s.applyMask(m, v), w(v, S, m), {
      modules: v,
      version: E,
      errorCorrectionLevel: S,
      maskPattern: m,
      segments: P
    };
  }
  return nt.create = function(E, S) {
    if (typeof E > "u" || E === "")
      throw new Error("No input text");
    let m = r.M, P, C;
    return typeof S < "u" && (m = r.from(S.errorCorrectionLevel, r.M), P = l.from(S.version), C = s.from(S.maskPattern), S.toSJISFunc && o.setToSJISFunction(S.toSJISFunc)), M(E, P, m, C);
  }, nt;
}
var St = {}, Et = {}, te;
function ce() {
  return te || (te = 1, function(o) {
    function r(e) {
      if (typeof e == "number" && (e = e.toString()), typeof e != "string")
        throw new Error("Color should be defined as hex string");
      let t = e.slice().replace("#", "").split("");
      if (t.length < 3 || t.length === 5 || t.length > 8)
        throw new Error("Invalid hex color: " + e);
      (t.length === 3 || t.length === 4) && (t = Array.prototype.concat.apply([], t.map(function(i) {
        return [i, i];
      }))), t.length === 6 && t.push("F", "F");
      const n = parseInt(t.join(""), 16);
      return {
        r: n >> 24 & 255,
        g: n >> 16 & 255,
        b: n >> 8 & 255,
        a: n & 255,
        hex: "#" + t.slice(0, 6).join("")
      };
    }
    o.getOptions = function(t) {
      t || (t = {}), t.color || (t.color = {});
      const n = typeof t.margin > "u" || t.margin === null || t.margin < 0 ? 4 : t.margin, i = t.width && t.width >= 21 ? t.width : void 0, s = t.scale || 4;
      return {
        width: i,
        scale: i ? 4 : s,
        margin: n,
        color: {
          dark: r(t.color.dark || "#000000ff"),
          light: r(t.color.light || "#ffffffff")
        },
        type: t.type,
        rendererOpts: t.rendererOpts || {}
      };
    }, o.getScale = function(t, n) {
      return n.width && n.width >= t + n.margin * 2 ? n.width / (t + n.margin * 2) : n.scale;
    }, o.getImageWidth = function(t, n) {
      const i = o.getScale(t, n);
      return Math.floor((t + n.margin * 2) * i);
    }, o.qrToImageData = function(t, n, i) {
      const s = n.modules.size, a = n.modules.data, c = o.getScale(s, i), l = Math.floor((s + i.margin * 2) * c), h = i.margin * c, f = [i.color.light, i.color.dark];
      for (let g = 0; g < l; g++)
        for (let d = 0; d < l; d++) {
          let A = (g * l + d) * 4, I = i.color.light;
          if (g >= h && d >= h && g < l - h && d < l - h) {
            const L = Math.floor((g - h) / c), w = Math.floor((d - h) / c);
            I = f[a[L * s + w] ? 1 : 0];
          }
          t[A++] = I.r, t[A++] = I.g, t[A++] = I.b, t[A] = I.a;
        }
    };
  }(Et)), Et;
}
var ee;
function Ue() {
  return ee || (ee = 1, function(o) {
    const r = ce();
    function e(n, i, s) {
      n.clearRect(0, 0, i.width, i.height), i.style || (i.style = {}), i.height = s, i.width = s, i.style.height = s + "px", i.style.width = s + "px";
    }
    function t() {
      try {
        return document.createElement("canvas");
      } catch {
        throw new Error("You need to specify a canvas element");
      }
    }
    o.render = function(i, s, a) {
      let c = a, l = s;
      typeof c > "u" && (!s || !s.getContext) && (c = s, s = void 0), s || (l = t()), c = r.getOptions(c);
      const h = r.getImageWidth(i.modules.size, c), f = l.getContext("2d"), g = f.createImageData(h, h);
      return r.qrToImageData(g.data, i, c), e(f, l, h), f.putImageData(g, 0, 0), l;
    }, o.renderToDataURL = function(i, s, a) {
      let c = a;
      typeof c > "u" && (!s || !s.getContext) && (c = s, s = void 0), c || (c = {});
      const l = o.render(i, s, c), h = c.type || "image/png", f = c.rendererOpts || {};
      return l.toDataURL(h, f.quality);
    };
  }(St)), St;
}
var Ft = {}, ne;
function qe() {
  if (ne) return Ft;
  ne = 1;
  const o = ce();
  function r(n, i) {
    const s = n.a / 255, a = i + '="' + n.hex + '"';
    return s < 1 ? a + " " + i + '-opacity="' + s.toFixed(2).slice(1) + '"' : a;
  }
  function e(n, i, s) {
    let a = n + i;
    return typeof s < "u" && (a += " " + s), a;
  }
  function t(n, i, s) {
    let a = "", c = 0, l = !1, h = 0;
    for (let f = 0; f < n.length; f++) {
      const g = Math.floor(f % i), d = Math.floor(f / i);
      !g && !l && (l = !0), n[f] ? (h++, f > 0 && g > 0 && n[f - 1] || (a += l ? e("M", g + s, 0.5 + d + s) : e("m", c, 0), c = 0, l = !1), g + 1 < i && n[f + 1] || (a += e("h", h), h = 0)) : c++;
    }
    return a;
  }
  return Ft.render = function(i, s, a) {
    const c = o.getOptions(s), l = i.modules.size, h = i.modules.data, f = l + c.margin * 2, g = c.color.light.a ? "<path " + r(c.color.light, "fill") + ' d="M0 0h' + f + "v" + f + 'H0z"/>' : "", d = "<path " + r(c.color.dark, "stroke") + ' d="' + t(h, l, c.margin) + '"/>', A = 'viewBox="0 0 ' + f + " " + f + '"', L = '<svg xmlns="http://www.w3.org/2000/svg" ' + (c.width ? 'width="' + c.width + '" height="' + c.width + '" ' : "") + A + ' shape-rendering="crispEdges">' + g + d + `</svg>
`;
    return typeof a == "function" && a(null, L), L;
  }, Ft;
}
var ie;
function Ke() {
  if (ie) return $;
  ie = 1;
  const o = ye(), r = ke(), e = Ue(), t = qe();
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
      return f === 1 ? (a = s, s = c = void 0) : f === 2 && !s.getContext && (c = a, a = s, s = void 0), new Promise(function(d, A) {
        try {
          const I = r.create(a, c);
          d(i(I, s, c));
        } catch (I) {
          A(I);
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
  return $.create = r.create, $.toCanvas = n.bind(null, e.render), $.toDataURL = n.bind(null, e.renderToDataURL), $.toString = n.bind(null, function(i, s, a) {
    return t.render(i, a);
  }), $;
}
var ze = Ke();
const J = 1e3, Q = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302"]
    }
  ]
};
function _e() {
  return crypto.randomUUID();
}
async function It(o) {
  return await (await fetch(o)).json();
}
function le(o, r) {
  for (const e of o)
    if (JSON.stringify(e) === JSON.stringify(r))
      return !0;
  return !1;
}
class G {
  constructor() {
    u(this, "eventListeners", {});
  }
  on(r, e) {
    const t = this.eventListeners[r] ?? /* @__PURE__ */ new Set();
    t.add(e), this.eventListeners[r] = t;
  }
  off(r, e) {
    const t = this.eventListeners[r];
    t && (t.delete(e), t.size === 0 && delete this.eventListeners[r]);
  }
  emit(r, ...e) {
    const t = this.eventListeners[r] ?? /* @__PURE__ */ new Set();
    for (const n of t)
      n(...e);
  }
}
class ue extends G {
}
async function $e() {
  return await crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256
    },
    !0,
    // extractable
    ["encrypt", "decrypt"]
  );
}
async function xe(o) {
  return (await crypto.subtle.exportKey("jwk", o)).k;
}
async function He(o) {
  const r = {
    kty: "oct",
    k: o,
    alg: "A256GCM",
    ext: !0,
    key_ops: ["encrypt", "decrypt"]
  };
  return await crypto.subtle.importKey(
    "jwk",
    r,
    {
      name: "AES-GCM",
      length: 256
    },
    !0,
    // extractable
    ["encrypt", "decrypt"]
  );
}
async function O(o, r) {
  const e = Oe(o), t = Je(), n = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: t
    },
    r,
    e
  ), i = new Uint8Array(t.length + n.byteLength);
  return i.set(t, 0), i.set(new Uint8Array(n), t.length), Ge(i);
}
async function Y(o, r) {
  const e = Ve(o), t = e.slice(0, 12), n = e.slice(12), i = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: t
    },
    r,
    n
  );
  return je(new Uint8Array(i));
}
function Oe(o) {
  return new TextEncoder().encode(o);
}
function Je() {
  return crypto.getRandomValues(new Uint8Array(12));
}
function Ge(o) {
  return btoa(String.fromCharCode(...new Uint8Array(o)));
}
function Ve(o) {
  const r = atob(o);
  return Uint8Array.from(r, (e) => e.charCodeAt(0));
}
function je(o, r = !0) {
  const t = new TextDecoder().decode(o);
  return r ? JSON.parse(t) : t;
}
class he extends G {
  constructor({
    flottformApi: e,
    createClientUrl: t,
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
    u(this, "cryptoKey", null);
    u(this, "state", "new");
    u(this, "channelNumber", 0);
    u(this, "openPeerConnection", null);
    u(this, "dataChannel", null);
    u(this, "pollForIceTimer", null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    u(this, "changeState", (e, t) => {
      this.state = e, this.emit(e, t), this.logger.info(`State changed to: ${e}`, t ?? "");
    });
    u(this, "start", async () => {
      this.openPeerConnection && this.close(), this.cryptoKey = await $e();
      const e = (this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)).toString().replace(/\/$/, "");
      this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration), this.dataChannel = this.createDataChannel();
      const t = await this.openPeerConnection.createOffer();
      await this.openPeerConnection.setLocalDescription(t);
      const { endpointId: n, hostKey: i } = await this.createEndpoint(e, t);
      this.logger.log("Created endpoint", { endpointId: n, hostKey: i });
      const s = `${e}/${n}`, a = `${e}/${n}/host`, c = /* @__PURE__ */ new Set();
      await this.putHostInfo(a, i, c, t), this.setUpConnectionStateGathering(s), this.setupHostIceGathering(a, i, c, t), this.setupDataChannelForTransfer();
      const l = await xe(this.cryptoKey);
      if (!l)
        throw new Error("Encryption Key is undefined!");
      const h = await this.createClientUrl({ endpointId: n, encryptionKey: l });
      this.changeState("waiting-for-client", {
        qrCode: await ze.toDataURL(h),
        link: h,
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
      this.dataChannel.onmessage = (e) => {
        this.emit("receiving-data", e);
      };
    });
    u(this, "setupHostIceGathering", (e, t, n, i) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to gather Host ICE candidates");
        return;
      }
      this.openPeerConnection.onicecandidate = async (s) => {
        this.logger.info(
          `onicecandidate - ${this.openPeerConnection.connectionState} - ${s.candidate}`
        ), s.candidate && (le(n, s.candidate) || (this.logger.log("host found new ice candidate! Adding it to our list"), n.add(s.candidate), await this.putHostInfo(e, t, n, i)));
      }, this.openPeerConnection.onicegatheringstatechange = async (s) => {
        this.logger.info(
          `onicegatheringstatechange - ${this.openPeerConnection.iceGatheringState} - ${s}`
        );
      }, this.openPeerConnection.onicecandidateerror = async (s) => {
        this.logger.error("peerConnection.onicecandidateerror", s);
      };
    });
    u(this, "setUpConnectionStateGathering", (e) => {
      if (this.openPeerConnection === null) {
        this.changeState(
          "error",
          "openPeerConnection is null. Unable to poll for the client's details"
        );
        return;
      }
      this.startPollingForConnection(e), this.openPeerConnection.onconnectionstatechange = () => {
        this.logger.info(`onconnectionstatechange - ${this.openPeerConnection.connectionState}`), this.openPeerConnection.connectionState === "connected" && this.stopPollingForConnection(), this.openPeerConnection.connectionState === "disconnected" && this.startPollingForConnection(e), this.openPeerConnection.connectionState === "failed" && (this.stopPollingForConnection(), this.changeState("error", { message: "connection-failed" }));
      }, this.openPeerConnection.oniceconnectionstatechange = async (t) => {
        this.logger.info(
          `oniceconnectionstatechange - ${this.openPeerConnection.iceConnectionState} - ${t}`
        ), this.openPeerConnection.iceConnectionState === "failed" && (this.logger.log("Failed to find a possible connection path"), this.changeState("error", { message: "connection-impossible" }));
      };
    });
    u(this, "stopPollingForConnection", async () => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), this.pollForIceTimer = null;
    });
    u(this, "startPollingForConnection", async (e) => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), await this.pollForConnection(e), this.pollForIceTimer = setTimeout(() => {
        this.startPollingForConnection(e);
      }, this.pollTimeForIceInMs);
    });
    u(this, "createEndpoint", async (e, t) => {
      if (!this.cryptoKey)
        throw new Error("CryptoKey is null! Encryption is not possible!!");
      const n = await O(JSON.stringify(t), this.cryptoKey);
      return (await fetch(`${e}/create`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ session: n })
      })).json();
    });
    u(this, "fetchIceServers", async (e) => {
      const t = await fetch(`${e}/ice-server-credentials`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!t.ok)
        throw new Error("Fetching Error!");
      const n = await t.json();
      if (n.success === !1)
        throw new Error(n.message || "Unknown error occurred");
      return n.iceServers;
    });
    u(this, "pollForConnection", async (e) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to retrieve Client's details");
        return;
      }
      this.logger.log("polling for client ice candidates", this.openPeerConnection.iceGatheringState);
      const { clientInfo: t } = await It(e);
      if (!this.cryptoKey)
        throw new Error("CryptoKey is null! Decryption is not possible!!");
      let n, i = [];
      t && (n = await Y(t.session, this.cryptoKey), i = await Y(t.iceCandidates, this.cryptoKey)), t && this.state === "waiting-for-client" && (this.logger.log("Found a client that wants to connect!"), this.changeState("waiting-for-ice"), await this.openPeerConnection.setRemoteDescription(n));
      for (const s of i ?? [])
        await this.openPeerConnection.addIceCandidate(s);
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
      }, this.dataChannel.onerror = (e) => {
        this.logger.log("channel.onerror", e), this.changeState("error", { message: "file-transfer" });
      };
    });
    u(this, "createDataChannel", () => {
      if (this.openPeerConnection === null)
        return this.changeState("error", "openPeerConnection is null. Unable to create a new Data Channel"), null;
      this.channelNumber++;
      const e = `data-channel-${this.channelNumber}`;
      return this.openPeerConnection.createDataChannel(e);
    });
    u(this, "putHostInfo", async (e, t, n, i) => {
      try {
        if (this.logger.log("Updating host info with new list of ice candidates"), !this.cryptoKey)
          throw new Error("CryptoKey is null! Encryption is not possible!!");
        const s = await O(
          JSON.stringify([...n]),
          this.cryptoKey
        ), a = await O(JSON.stringify(i), this.cryptoKey);
        if (!(await fetch(e, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hostKey: t,
            iceCandidates: s,
            session: a
          })
        })).ok)
          throw Error("Could not update host info");
      } catch (s) {
        this.changeState("error", s);
      }
    });
    this.flottformApi = e, this.createClientUrl = t, this.rtcConfiguration = n, this.pollTimeForIceInMs = i, this.logger = s, Promise.resolve().then(() => {
      this.changeState("new", { channel: this });
    });
  }
}
class Ye extends ue {
  constructor({
    flottformApi: e,
    createClientUrl: t,
    inputField: n,
    rtcConfiguration: i = Q,
    pollTimeForIceInMs: s = J,
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
      var e;
      (e = this.channel) == null || e.start();
    });
    u(this, "close", () => {
      var e;
      (e = this.channel) == null || e.close();
    });
    u(this, "getLink", () => (this.link === "" && this.logger.error(
      "Flottform is currently establishing the connection. Link is unavailable for now!"
    ), this.link));
    u(this, "getQrCode", () => (this.qrCode === "" && this.logger.error(
      "Flottform is currently establishing the connection. qrCode is unavailable for now!"
    ), this.qrCode));
    u(this, "handleIncomingData", (e) => {
      var t, n, i;
      if (typeof e.data == "string") {
        const s = JSON.parse(e.data);
        s.type === "file-transfer-meta" ? (this.filesMetaData = s.filesQueue, this.currentFile = { index: 0, receivedSize: 0, arrayBuffer: [] }, this.filesTotalSize = s.totalSize, this.emit("receive")) : s.type === "transfer-complete" && (this.emit("done"), (t = this.channel) == null || t.close());
      } else if (e.data instanceof ArrayBuffer && this.currentFile) {
        this.currentFile.arrayBuffer.push(e.data), this.currentFile.receivedSize += e.data.byteLength, this.receivedDataSize += e.data.byteLength;
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
    u(this, "appendFileToInputField", (e) => {
      var a, c, l;
      const t = ((a = this.filesMetaData[e]) == null ? void 0 : a.name) ?? "no-name", n = ((c = this.filesMetaData[e]) == null ? void 0 : c.type) ?? "application/octet-stream", i = new File((l = this.currentFile) == null ? void 0 : l.arrayBuffer, t, {
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
      var e, t, n, i, s, a, c;
      (e = this.channel) == null || e.on("new", () => {
        this.emit("new");
      }), (t = this.channel) == null || t.on("waiting-for-client", (l) => {
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
    this.channel = new he({
      flottformApi: e,
      createClientUrl: t,
      rtcConfiguration: i,
      pollTimeForIceInMs: s,
      logger: a
    }), this.inputField = n, this.logger = a, this.registerListeners();
  }
}
class fe extends G {
  // 128KB buffer threshold (maximum of 4 chunks in the buffer waiting to be sent over the network)
  constructor({
    endpointId: e,
    flottformApi: t,
    rtcConfiguration: n,
    encryptionKey: i,
    pollTimeForIceInMs: s = J,
    logger: a = console
  }) {
    super();
    u(this, "flottformApi");
    u(this, "endpointId");
    u(this, "rtcConfiguration");
    u(this, "pollTimeForIceInMs");
    u(this, "logger");
    u(this, "cryptoKey", null);
    u(this, "encryptionKey");
    u(this, "state", "init");
    u(this, "openPeerConnection", null);
    u(this, "dataChannel", null);
    u(this, "pollForIceTimer", null);
    u(this, "BUFFER_THRESHOLD", 128 * 1024);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    u(this, "changeState", (e, t) => {
      this.state = e, this.emit(e, t), this.logger.info(`**Client State changed to: ${e}`, t ?? "");
    });
    u(this, "start", async () => {
      this.openPeerConnection && this.close(), this.cryptoKey = await He(this.encryptionKey), (this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)).toString().replace(/\/$/, ""), this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration);
      const e = _e(), t = /* @__PURE__ */ new Set(), n = `${this.flottformApi}/${this.endpointId}`, i = `${this.flottformApi}/${this.endpointId}/client`;
      this.changeState("retrieving-info-from-endpoint");
      const { hostInfo: s } = await It(n);
      if (!this.cryptoKey)
        throw new Error("CryptoKey is null! Decryption is not possible!!");
      const a = await Y(s.session, this.cryptoKey);
      await this.openPeerConnection.setRemoteDescription(a);
      const c = await this.openPeerConnection.createAnswer();
      await this.openPeerConnection.setLocalDescription(c), this.setUpConnectionStateGathering(n), this.setUpClientIceGathering(i, e, t, c), this.openPeerConnection.ondatachannel = (l) => {
        this.logger.info(`ondatachannel: ${l.channel}`), this.changeState("connected"), this.dataChannel = l.channel, this.dataChannel.bufferedAmountLowThreshold = this.BUFFER_THRESHOLD, this.dataChannel.onbufferedamountlow = () => {
          this.emit("bufferedamountlow");
        }, this.dataChannel.onopen = (h) => {
          this.logger.info(`ondatachannel - onopen: ${h.type}`);
        };
      }, this.changeState("sending-client-info"), await this.putClientInfo(i, e, t, c), this.changeState("connecting-to-host"), this.startPollingForIceCandidates(n);
    });
    u(this, "close", () => {
      this.openPeerConnection && (this.openPeerConnection.close(), this.openPeerConnection = null, this.stopPollingForIceCandidates()), this.changeState("disconnected");
    });
    // sendData = (data: string | Blob | ArrayBuffer | ArrayBufferView) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    u(this, "sendData", (e) => {
      if (this.dataChannel == null) {
        this.changeState("error", "dataChannel is null. Unable to send the file to the Host!");
        return;
      } else if (!this.canSendMoreData()) {
        this.logger.warn("Data channel is full! Cannot send data at the moment");
        return;
      }
      this.dataChannel.send(e);
    });
    u(this, "canSendMoreData", () => this.dataChannel && this.dataChannel.bufferedAmount < this.dataChannel.bufferedAmountLowThreshold);
    u(this, "setUpClientIceGathering", (e, t, n, i) => {
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
        ), s.candidate && (le(n, s.candidate) || (this.logger.log("client found new ice candidate! Adding it to our list"), n.add(s.candidate), await this.putClientInfo(e, t, n, i)));
      }, this.openPeerConnection.onicegatheringstatechange = async () => {
        this.logger.info(`onicegatheringstatechange - ${this.openPeerConnection.iceGatheringState}`);
      }, this.openPeerConnection.onicecandidateerror = (s) => {
        this.logger.error(`onicecandidateerror - ${this.openPeerConnection.connectionState}`, s);
      };
    });
    u(this, "setUpConnectionStateGathering", (e) => {
      if (this.openPeerConnection === null) {
        this.changeState(
          "error",
          "openPeerConnection is null. Unable to gather Client ICE candidates"
        );
        return;
      }
      this.openPeerConnection.onconnectionstatechange = () => {
        this.logger.info(`onconnectionstatechange - ${this.openPeerConnection.connectionState}`), this.openPeerConnection.connectionState === "connected" && (this.stopPollingForIceCandidates(), this.state === "connecting-to-host" && this.changeState("connected")), this.openPeerConnection.connectionState === "disconnected" && this.startPollingForIceCandidates(e), this.openPeerConnection.connectionState === "failed" && (this.stopPollingForIceCandidates(), this.state !== "done" && this.changeState("disconnected"));
      }, this.openPeerConnection.oniceconnectionstatechange = () => {
        this.logger.info(
          `oniceconnectionstatechange - ${this.openPeerConnection.iceConnectionState}`
        ), this.openPeerConnection.iceConnectionState === "failed" && (this.logger.log("Failed to find a possible connection path"), this.changeState("connection-impossible"));
      };
    });
    u(this, "stopPollingForIceCandidates", async () => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), this.pollForIceTimer = null;
    });
    u(this, "startPollingForIceCandidates", async (e) => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), await this.pollForConnection(e), this.pollForIceTimer = setTimeout(this.startPollingForIceCandidates, this.pollTimeForIceInMs);
    });
    u(this, "pollForConnection", async (e) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to retrieve Host's details");
        return;
      }
      this.logger.log("polling for host ice candidates", this.openPeerConnection.iceGatheringState);
      const { hostInfo: t } = await It(e);
      if (!this.cryptoKey)
        throw new Error("CryptoKey is null! Decryption is not possible!!");
      const n = await Y(
        t.iceCandidates,
        this.cryptoKey
      );
      for (const i of n)
        await this.openPeerConnection.addIceCandidate(i);
    });
    u(this, "putClientInfo", async (e, t, n, i) => {
      if (this.logger.log("Updating client info with new list of ice candidates"), !this.cryptoKey)
        throw new Error("CryptoKey is null! Encryption is not possible!!");
      const s = await O(
        JSON.stringify([...n]),
        this.cryptoKey
      ), a = await O(JSON.stringify(i), this.cryptoKey);
      if (!(await fetch(e, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey: t,
          iceCandidates: s,
          session: a
        })
      })).ok)
        throw Error("Could not update client info. Did another peer already connect?");
    });
    u(this, "fetchIceServers", async (e) => {
      const t = await fetch(`${e}/ice-server-credentials`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!t.ok)
        throw new Error("Fetching Error!");
      const n = await t.json();
      if (n.success === !1)
        throw new Error(n.message || "Unknown error occurred");
      return n.iceServers;
    });
    this.endpointId = e, this.flottformApi = t, this.rtcConfiguration = n, this.encryptionKey = i, this.pollTimeForIceInMs = s, this.logger = a;
  }
}
class bn extends G {
  constructor({
    endpointId: e,
    fileInput: t,
    flottformApi: n,
    encryptionKey: i,
    rtcConfiguration: s = Q,
    pollTimeForIceInMs: a = J,
    logger: c = console
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
      var e;
      (e = this.channel) == null || e.start();
    });
    u(this, "close", () => {
      var e;
      (e = this.channel) == null || e.close();
    });
    u(this, "createMetaData", (e) => {
      if (!e.files) return null;
      const n = Array.from(e.files).map((i) => ({
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
    u(this, "createArrayBuffers", async (e) => {
      if (!e.files) return null;
      const t = Array.from(e.files);
      return await Promise.all(t.map(async (n) => await n.arrayBuffer()));
    });
    u(this, "sendFiles", async () => {
      var n;
      const e = this.createMetaData(this.inputField), t = await this.createArrayBuffers(this.inputField);
      if (!e || !t)
        throw new Error("Can't find the files that you want to send!");
      this.filesMetaData = e.filesQueue, this.filesArrayBuffer = t, (n = this.channel) == null || n.sendData(JSON.stringify(e)), this.emit("sending"), this.startSendingFiles();
    });
    u(this, "startSendingFiles", () => {
      this.sendNextChunk();
    });
    u(this, "sendNextChunk", async () => {
      var s, a, c, l;
      const e = this.filesMetaData.length;
      if (this.allFilesSent || this.currentFileIndex >= e) {
        this.logger.log("All files are sent"), (s = this.channel) == null || s.sendData(JSON.stringify({ type: "transfer-complete" })), this.allFilesSent = !0, (a = this.channel) == null || a.off("bufferedamountlow", this.startSendingFiles), this.emit("done");
        return;
      }
      const t = this.filesArrayBuffer[this.currentFileIndex];
      if (!t)
        throw new Error(`Can't find the ArrayBuffer for the file number ${this.currentFileIndex}`);
      const n = t.byteLength, i = this.filesMetaData[this.currentFileIndex].name;
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
        (l = this.channel) == null || l.sendData(t.slice(f, g)), this.currentChunkIndex++;
      }
      this.currentChunkIndex * this.chunkSize >= n ? (this.logger.log(`File ${i} fully sent. Moving to next file.`), this.currentFileIndex++, this.currentChunkIndex = 0, this.sendNextChunk()) : setTimeout(this.sendNextChunk, 100);
    });
    u(this, "registerListeners", () => {
      var e, t, n, i, s, a, c, l, h, f;
      (e = this.channel) == null || e.on("init", () => {
      }), (t = this.channel) == null || t.on("retrieving-info-from-endpoint", () => {
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
    this.channel = new fe({
      endpointId: e,
      flottformApi: n,
      rtcConfiguration: s,
      encryptionKey: i,
      pollTimeForIceInMs: a,
      logger: c
    }), this.inputField = t, this.logger = c, this.registerListeners();
  }
}
class Sn extends G {
  constructor({
    endpointId: e,
    flottformApi: t,
    encryptionKey: n,
    rtcConfiguration: i = Q,
    pollTimeForIceInMs: s = J,
    logger: a = console
  }) {
    super();
    u(this, "channel", null);
    u(this, "logger");
    u(this, "start", () => {
      var e;
      (e = this.channel) == null || e.start();
    });
    u(this, "close", () => {
      var e;
      (e = this.channel) == null || e.close();
    });
    u(this, "sendText", (e) => {
      var t;
      this.emit("sending"), (t = this.channel) == null || t.sendData(e), this.emit("done");
    });
    u(this, "registerListeners", () => {
      var e, t, n, i, s, a, c, l, h;
      (e = this.channel) == null || e.on("init", () => {
      }), (t = this.channel) == null || t.on("retrieving-info-from-endpoint", () => {
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
    this.channel = new fe({
      endpointId: e,
      flottformApi: t,
      rtcConfiguration: i,
      encryptionKey: n,
      pollTimeForIceInMs: s,
      logger: a
    }), this.logger = a, this.registerListeners();
  }
}
class Qe extends ue {
  constructor({
    flottformApi: e,
    createClientUrl: t,
    inputField: n = void 0,
    rtcConfiguration: i = Q,
    pollTimeForIceInMs: s = J,
    logger: a = console
  }) {
    super();
    u(this, "channel", null);
    u(this, "logger");
    u(this, "link", "");
    u(this, "qrCode", "");
    u(this, "inputField");
    u(this, "start", () => {
      var e;
      (e = this.channel) == null || e.start();
    });
    u(this, "close", () => {
      var e;
      (e = this.channel) == null || e.close();
    });
    u(this, "getLink", () => (this.link === "" && this.logger.error(
      "Flottform is currently establishing the connection. Link is unavailable for now!"
    ), this.link));
    u(this, "getQrCode", () => (this.qrCode === "" && this.logger.error(
      "Flottform is currently establishing the connection. qrCode is unavailable for now!"
    ), this.qrCode));
    u(this, "handleIncomingData", (e) => {
      if (this.emit("receive"), this.emit("done", e.data), this.inputField) {
        this.inputField.value = e.data;
        const t = new Event("change");
        this.inputField.dispatchEvent(t);
      }
    });
    u(this, "registerListeners", () => {
      var e, t, n, i, s, a, c;
      (e = this.channel) == null || e.on("new", () => {
        this.emit("new");
      }), (t = this.channel) == null || t.on("waiting-for-client", (l) => {
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
    this.channel = new he({
      flottformApi: e,
      createClientUrl: t,
      rtcConfiguration: i,
      pollTimeForIceInMs: s,
      logger: a
    }), this.logger = a, this.inputField = n, this.registerListeners();
  }
}
const We = () => {
  const o = document.querySelector(
    ".flottform-elements-container-wrapper"
  ), r = document.querySelector(".flottform-opener-triangle");
  o.classList.toggle("flottform-open"), r.classList.toggle("flottform-button-svg-open");
}, Ze = (o, r, e) => {
  const t = document.createElement("div");
  t.setAttribute("class", `flottform-root${e ?? ""}`);
  const n = nn(o);
  t.appendChild(n);
  const i = on(r);
  return t.appendChild(i), t;
}, Xe = (o, r) => {
  const e = document.createElement("img");
  e.setAttribute("class", "flottform-qr-code"), e.setAttribute("src", o);
  const t = document.createElement("div");
  return t.setAttribute("class", "flottform-link-offer"), t.innerText = r, {
    createChannelQrCode: e,
    createChannelLinkWithOffer: t
  };
}, En = ({
  flottformAnchorElement: o,
  flottformRootElement: r,
  additionalComponentClass: e,
  flottformRootTitle: t,
  flottformRootDescription: n
}) => {
  const i = r ?? document.querySelector(".flottform-root") ?? Ze(t, n, e), s = i.querySelector(".flottform-elements-container"), a = i.querySelector(
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
      buttonLabel: A,
      onErrorText: I,
      onSuccessText: L
    }) => {
      const w = new Ye({
        flottformApi: c,
        createClientUrl: l,
        inputField: h
      }), {
        flottformItem: B,
        statusInformation: T,
        refreshChannelButton: b,
        flottformStateItemsContainer: M
      } = oe({
        flottformBaseInputHost: w,
        additionalItemClasses: g,
        label: d,
        buttonLabel: A,
        onErrorText: I
      }), p = i.querySelector(".flottform-inputs-list");
      p.appendChild(B), s.appendChild(p), tn({
        flottformItem: B,
        statusInformation: T,
        refreshChannelButton: b,
        flottformStateItemsContainer: M,
        flottformFileInputHost: w,
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
      buttonLabel: A,
      onErrorText: I,
      onSuccessText: L
    }) => {
      const w = new Qe({
        flottformApi: c,
        createClientUrl: l,
        inputField: h
      }), { flottformItem: B, statusInformation: T, refreshChannelButton: b } = oe({
        flottformBaseInputHost: w,
        additionalItemClasses: g,
        label: d,
        buttonLabel: A,
        onErrorText: I
      }), M = i.querySelector(".flottform-inputs-list");
      M.appendChild(B), s.appendChild(M), en({
        flottformItem: B,
        statusInformation: T,
        refreshChannelButton: b,
        flottformTextInputHost: w,
        id: f,
        onSuccessText: L
      });
    }
  };
}, oe = ({
  flottformBaseInputHost: o,
  additionalItemClasses: r,
  label: e,
  buttonLabel: t,
  onErrorText: n
}) => {
  const i = rn(r);
  hn({ label: e, flottformItem: i });
  const s = sn(), a = cn(t);
  a.addEventListener("click", () => o.start());
  const c = an(a);
  i.appendChild(c);
  const l = ln();
  return l.addEventListener("click", () => o.start()), o.on("endpoint-created", ({ link: h, qrCode: f }) => {
    const { createChannelQrCode: g, createChannelLinkWithOffer: d } = Xe(f, h), A = fn();
    c.replaceChildren(g);
    const I = document.createElement("div");
    I.setAttribute("class", "flottform-copy-button-link-wrapper"), I.appendChild(A), I.appendChild(d), c.appendChild(I);
  }), o.on("connected", () => {
    s.innerHTML = "Connected", s.appendChild(l), c.replaceChildren(s);
  }), o.on("error", (h) => {
    s.innerHTML = typeof n == "function" ? n(h) : n ?? `🚨 An error occured (${h.message}). Please try again`, a.innerText = "Retry", c.replaceChildren(s), c.appendChild(a);
  }), { flottformItem: i, statusInformation: s, refreshChannelButton: l, flottformStateItemsContainer: c };
}, tn = ({
  flottformItem: o,
  statusInformation: r,
  refreshChannelButton: e,
  flottformStateItemsContainer: t,
  flottformFileInputHost: n,
  id: i,
  onSuccessText: s
}) => {
  i && o.setAttribute("id", i), n.on(
    "progress",
    ({ currentFileProgress: a, overallProgress: c, fileIndex: l, totalFileCount: h, fileName: f }) => {
      dn(t), yn(
        t,
        c,
        l,
        h
      );
      const g = gn(t);
      mn(
        l,
        f,
        a,
        g,
        t
      );
    }
  ), n.on("done", () => {
    r.innerHTML = s ?? "✨ You have succesfully downloaded all your files.", r.appendChild(e), t.replaceChildren(r);
  });
}, en = ({
  flottformItem: o,
  statusInformation: r,
  refreshChannelButton: e,
  flottformTextInputHost: t,
  id: n,
  onSuccessText: i
}) => {
  n && o.setAttribute("id", n), t.on("done", (s) => {
    if (r.innerHTML = i ?? "✨ You have succesfully submitted your message", r.appendChild(e), o.replaceChildren(r), inputField) {
      inputField.setAttribute("value", s);
      const a = new Event("change");
      inputField.dispatchEvent(a);
    }
  });
}, nn = (o) => {
  const r = document.createElement("button");
  return r.setAttribute("type", "button"), r.setAttribute("class", "flottform-root-opener-button"), r.innerHTML = `<span>${o ?? "Fill from Another Device"}</span><svg class="flottform-opener-triangle" width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M6.5,8.5l6,7l6-7H6.5z"/></svg>`, r.addEventListener("click", () => We()), r;
}, on = (o) => {
  const r = document.createElement("div");
  r.setAttribute("class", "flottform-elements-container");
  const e = document.createElement("div");
  if (e.setAttribute("class", "flottform-elements-container-wrapper"), o !== "") {
    const n = document.createElement("div");
    n.setAttribute("class", "flottform-root-description"), n.innerText = o ?? "This form is powered by Flottform. Need to add details from another device? Simply click a button below to generate a QR code or link, and easily upload information from your other device.", r.appendChild(n);
  }
  const t = document.createElement("ul");
  return t.setAttribute("class", "flottform-inputs-list"), r.appendChild(t), e.appendChild(r), e;
}, rn = (o) => {
  const r = document.createElement("li");
  return r.setAttribute("class", `flottform-item${o ?? ""}`), r;
}, sn = () => {
  const o = document.createElement("div");
  return o.setAttribute("class", "flottform-status-information"), o;
}, an = (o) => {
  const r = document.createElement("div");
  return r.setAttribute("class", "flottform-state-items-container"), r.appendChild(o), r;
}, cn = (o) => {
  const r = document.createElement("button");
  return r.setAttribute("type", "button"), r.setAttribute("class", "flottform-button"), r.innerText = o ?? "Get a link", r;
}, ln = () => {
  const o = document.createElement("button");
  return o.setAttribute("type", "button"), o.setAttribute("class", "flottform-refresh-connection-button"), o.setAttribute(
    "title",
    "Click this button to refresh Flottform connection for the input field. Previous connection will be closed"
  ), o.setAttribute(
    "aria-label",
    "Click this button to refresh Flottform connection for the input field. Previous connection will be closed"
  ), o.innerHTML = '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M13.5 2c-5.288 0-9.649 3.914-10.377 9h-3.123l4 5.917 4-5.917h-2.847c.711-3.972 4.174-7 8.347-7 4.687 0 8.5 3.813 8.5 8.5s-3.813 8.5-8.5 8.5c-3.015 0-5.662-1.583-7.171-3.957l-1.2 1.775c1.916 2.536 4.948 4.182 8.371 4.182 5.797 0 10.5-4.702 10.5-10.5s-4.703-10.5-10.5-10.5z"/></svg>', o;
};
let un = 1;
const hn = ({
  label: o,
  flottformItem: r
}) => {
  const e = document.createElement("p"), t = o ?? `File input ${un++}`;
  t && (e.innerHTML = t, r.appendChild(e));
}, fn = () => {
  const o = document.createElement("button");
  return o.setAttribute("class", "flottform-copy-to-clipboard"), o.setAttribute("type", "button"), o.setAttribute("title", "Copy Flottform link to clipboard"), o.setAttribute("aria-label", "Copy Flottform link to clipboard"), o.innerText = "📋", o.addEventListener("click", async () => {
    const r = document.querySelector(".flottform-link-offer").innerText;
    navigator.clipboard.writeText(r).then(() => {
      o.innerText = "✅", setTimeout(() => {
        o.innerText = "📋";
      }, 1e3);
    }).catch((e) => {
      o.innerText = `❌ Failed to copy: ${e}`, setTimeout(() => {
        o.innerText = "📋";
      }, 1e3);
    });
  }), o;
}, dn = (o) => {
  o.querySelector(
    ".flottform-status-information"
  ) && (o.innerHTML = "");
}, gn = (o) => {
  let r = o.querySelector("details");
  if (!r) {
    r = document.createElement("details");
    const e = document.createElement("summary");
    e.innerText = "Details", r.appendChild(e);
    const t = document.createElement("div");
    t.classList.add("details-container"), r.appendChild(t), o.appendChild(r);
  }
  return r;
}, pn = (o, r) => {
  const e = document.createElement("label");
  e.setAttribute("id", `flottform-status-bar-${o}`), e.classList.add("flottform-progress-bar-label"), e.innerText = `File ${r} progress:`;
  const t = document.createElement("progress");
  return t.setAttribute("id", `flottform-status-bar-${o}`), t.classList.add("flottform-status-bar"), t.setAttribute("max", "100"), t.setAttribute("value", "0"), { currentFileLabel: e, progressBar: t };
}, mn = (o, r, e, t, n) => {
  let i = n.querySelector(
    `progress#flottform-status-bar-${o}`
  );
  if (!i) {
    const { currentFileLabel: s, progressBar: a } = pn(o, r);
    i = a;
    const c = t.querySelector(".details-container");
    c.appendChild(s), c.appendChild(i);
  }
  i.value = e * 100, i.innerText = `${e * 100}%`;
}, Cn = () => {
  const o = document.createElement("label");
  o.setAttribute("id", "flottform-status-bar-overall-progress"), o.classList.add("flottform-progress-bar-label"), o.innerText = "Receiving Files Progress";
  const r = document.createElement("progress");
  return r.setAttribute("id", "flottform-status-bar-overall-progress"), r.classList.add("flottform-status-bar"), r.setAttribute("max", "100"), r.setAttribute("value", "0"), { overallFilesLabel: o, progressBar: r };
}, yn = (o, r, e, t) => {
  let n = o.querySelector("progress#flottform-status-bar-overall-progress");
  if (!n) {
    const { overallFilesLabel: s, progressBar: a } = Cn();
    n = a, o.appendChild(s), o.appendChild(n);
  }
  const i = o.querySelector(
    "label#flottform-status-bar-overall-progress"
  );
  n.value = r * 100, n.innerText = `${r * 100}%`, i.innerText = `Receiving file ${e + 1} of ${t}`;
};
export {
  vt as ConnectionManager,
  bn as FlottformFileInputClient,
  Ye as FlottformFileInputHost,
  Sn as FlottformTextInputClient,
  Qe as FlottformTextInputHost,
  En as createDefaultFlottformComponent
};
//# sourceMappingURL=flottform-bundle.js.map
