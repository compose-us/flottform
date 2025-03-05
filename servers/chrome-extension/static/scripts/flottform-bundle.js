var me = Object.defineProperty;
var Ce = (o, r, n) => r in o ? me(o, r, { enumerable: !0, configurable: !0, writable: !0, value: n }) : o[r] = n;
var u = (o, r, n) => Ce(o, typeof r != "symbol" ? r + "" : r, n);
const q = class q {
  constructor() {
    u(this, "activeConnections");
    this.activeConnections = /* @__PURE__ */ new Map();
  }
  static getInstance() {
    return q.instance || (q.instance = new q()), q.instance;
  }
  addConnection(r, n) {
    this.activeConnections.set(r, n);
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
var x = {}, X, Lt;
function ye() {
  return Lt || (Lt = 1, X = function() {
    return typeof Promise == "function" && Promise.prototype && Promise.prototype.then;
  }), X;
}
var tt = {}, U = {}, Mt;
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
  }, U.getBCHDigit = function(n) {
    let t = 0;
    for (; n !== 0; )
      t++, n >>>= 1;
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
var et = {}, Nt;
function Tt() {
  return Nt || (Nt = 1, function(o) {
    o.L = { bit: 1 }, o.M = { bit: 0 }, o.Q = { bit: 3 }, o.H = { bit: 2 };
    function r(n) {
      if (typeof n != "string")
        throw new Error("Param is not a string");
      switch (n.toLowerCase()) {
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
          throw new Error("Unknown EC Level: " + n);
      }
    }
    o.isValid = function(t) {
      return t && typeof t.bit < "u" && t.bit >= 0 && t.bit < 4;
    }, o.from = function(t, e) {
      if (o.isValid(t))
        return t;
      try {
        return r(t);
      } catch {
        return e;
      }
    };
  }(et)), et;
}
var nt, Rt;
function we() {
  if (Rt) return nt;
  Rt = 1;
  function o() {
    this.buffer = [], this.length = 0;
  }
  return o.prototype = {
    get: function(r) {
      const n = Math.floor(r / 8);
      return (this.buffer[n] >>> 7 - r % 8 & 1) === 1;
    },
    put: function(r, n) {
      for (let t = 0; t < n; t++)
        this.putBit((r >>> n - t - 1 & 1) === 1);
    },
    getLengthInBits: function() {
      return this.length;
    },
    putBit: function(r) {
      const n = Math.floor(this.length / 8);
      this.buffer.length <= n && this.buffer.push(0), r && (this.buffer[n] |= 128 >>> this.length % 8), this.length++;
    }
  }, nt = o, nt;
}
var it, Dt;
function be() {
  if (Dt) return it;
  Dt = 1;
  function o(r) {
    if (!r || r < 1)
      throw new Error("BitMatrix size must be defined and greater than 0");
    this.size = r, this.data = new Uint8Array(r * r), this.reservedBit = new Uint8Array(r * r);
  }
  return o.prototype.set = function(r, n, t, e) {
    const i = r * this.size + n;
    this.data[i] = t, e && (this.reservedBit[i] = !0);
  }, o.prototype.get = function(r, n) {
    return this.data[r * this.size + n];
  }, o.prototype.xor = function(r, n, t) {
    this.data[r * this.size + n] ^= t;
  }, o.prototype.isReserved = function(r, n) {
    return this.reservedBit[r * this.size + n];
  }, it = o, it;
}
var ot = {}, kt;
function Se() {
  return kt || (kt = 1, function(o) {
    const r = K().getSymbolSize;
    o.getRowColCoords = function(t) {
      if (t === 1) return [];
      const e = Math.floor(t / 7) + 2, i = r(t), s = i === 145 ? 26 : Math.ceil((i - 13) / (2 * e - 2)) * 2, a = [i - 7];
      for (let c = 1; c < e - 1; c++)
        a[c] = a[c - 1] - s;
      return a.push(6), a.reverse();
    }, o.getPositions = function(t) {
      const e = [], i = o.getRowColCoords(t), s = i.length;
      for (let a = 0; a < s; a++)
        for (let c = 0; c < s; c++)
          a === 0 && c === 0 || // top-left
          a === 0 && c === s - 1 || // bottom-left
          a === s - 1 && c === 0 || e.push([i[a], i[c]]);
      return e;
    };
  }(ot)), ot;
}
var rt = {}, Ut;
function Ee() {
  if (Ut) return rt;
  Ut = 1;
  const o = K().getSymbolSize, r = 7;
  return rt.getPositions = function(t) {
    const e = o(t);
    return [
      // top-left
      [0, 0],
      // top-right
      [e - r, 0],
      // bottom-left
      [0, e - r]
    ];
  }, rt;
}
var st = {}, qt;
function Ie() {
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
    o.isValid = function(e) {
      return e != null && e !== "" && !isNaN(e) && e >= 0 && e <= 7;
    }, o.from = function(e) {
      return o.isValid(e) ? parseInt(e, 10) : void 0;
    }, o.getPenaltyN1 = function(e) {
      const i = e.size;
      let s = 0, a = 0, c = 0, l = null, h = null;
      for (let f = 0; f < i; f++) {
        a = c = 0, l = h = null;
        for (let g = 0; g < i; g++) {
          let d = e.get(f, g);
          d === l ? a++ : (a >= 5 && (s += r.N1 + (a - 5)), l = d, a = 1), d = e.get(g, f), d === h ? c++ : (c >= 5 && (s += r.N1 + (c - 5)), h = d, c = 1);
        }
        a >= 5 && (s += r.N1 + (a - 5)), c >= 5 && (s += r.N1 + (c - 5));
      }
      return s;
    }, o.getPenaltyN2 = function(e) {
      const i = e.size;
      let s = 0;
      for (let a = 0; a < i - 1; a++)
        for (let c = 0; c < i - 1; c++) {
          const l = e.get(a, c) + e.get(a, c + 1) + e.get(a + 1, c) + e.get(a + 1, c + 1);
          (l === 4 || l === 0) && s++;
        }
      return s * r.N2;
    }, o.getPenaltyN3 = function(e) {
      const i = e.size;
      let s = 0, a = 0, c = 0;
      for (let l = 0; l < i; l++) {
        a = c = 0;
        for (let h = 0; h < i; h++)
          a = a << 1 & 2047 | e.get(l, h), h >= 10 && (a === 1488 || a === 93) && s++, c = c << 1 & 2047 | e.get(h, l), h >= 10 && (c === 1488 || c === 93) && s++;
      }
      return s * r.N3;
    }, o.getPenaltyN4 = function(e) {
      let i = 0;
      const s = e.data.length;
      for (let c = 0; c < s; c++) i += e.data[c];
      return Math.abs(Math.ceil(i * 100 / s / 5) - 10) * r.N4;
    };
    function n(t, e, i) {
      switch (t) {
        case o.Patterns.PATTERN000:
          return (e + i) % 2 === 0;
        case o.Patterns.PATTERN001:
          return e % 2 === 0;
        case o.Patterns.PATTERN010:
          return i % 3 === 0;
        case o.Patterns.PATTERN011:
          return (e + i) % 3 === 0;
        case o.Patterns.PATTERN100:
          return (Math.floor(e / 2) + Math.floor(i / 3)) % 2 === 0;
        case o.Patterns.PATTERN101:
          return e * i % 2 + e * i % 3 === 0;
        case o.Patterns.PATTERN110:
          return (e * i % 2 + e * i % 3) % 2 === 0;
        case o.Patterns.PATTERN111:
          return (e * i % 3 + (e + i) % 2) % 2 === 0;
        default:
          throw new Error("bad maskPattern:" + t);
      }
    }
    o.applyMask = function(e, i) {
      const s = i.size;
      for (let a = 0; a < s; a++)
        for (let c = 0; c < s; c++)
          i.isReserved(c, a) || i.xor(c, a, n(e, c, a));
    }, o.getBestMask = function(e, i) {
      const s = Object.keys(o.Patterns).length;
      let a = 0, c = 1 / 0;
      for (let l = 0; l < s; l++) {
        i(l), o.applyMask(l, e);
        const h = o.getPenaltyN1(e) + o.getPenaltyN2(e) + o.getPenaltyN3(e) + o.getPenaltyN4(e);
        o.applyMask(l, e), h < c && (c = h, a = l);
      }
      return a;
    };
  }(st)), st;
}
var V = {}, Kt;
function re() {
  if (Kt) return V;
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
  ], n = [
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
  return V.getBlocksCount = function(e, i) {
    switch (i) {
      case o.L:
        return r[(e - 1) * 4 + 0];
      case o.M:
        return r[(e - 1) * 4 + 1];
      case o.Q:
        return r[(e - 1) * 4 + 2];
      case o.H:
        return r[(e - 1) * 4 + 3];
      default:
        return;
    }
  }, V.getTotalCodewordsCount = function(e, i) {
    switch (i) {
      case o.L:
        return n[(e - 1) * 4 + 0];
      case o.M:
        return n[(e - 1) * 4 + 1];
      case o.Q:
        return n[(e - 1) * 4 + 2];
      case o.H:
        return n[(e - 1) * 4 + 3];
      default:
        return;
    }
  }, V;
}
var at = {}, O = {}, zt;
function Fe() {
  if (zt) return O;
  zt = 1;
  const o = new Uint8Array(512), r = new Uint8Array(256);
  return function() {
    let t = 1;
    for (let e = 0; e < 255; e++)
      o[e] = t, r[t] = e, t <<= 1, t & 256 && (t ^= 285);
    for (let e = 255; e < 512; e++)
      o[e] = o[e - 255];
  }(), O.log = function(t) {
    if (t < 1) throw new Error("log(" + t + ")");
    return r[t];
  }, O.exp = function(t) {
    return o[t];
  }, O.mul = function(t, e) {
    return t === 0 || e === 0 ? 0 : o[r[t] + r[e]];
  }, O;
}
var _t;
function Te() {
  return _t || (_t = 1, function(o) {
    const r = Fe();
    o.mul = function(t, e) {
      const i = new Uint8Array(t.length + e.length - 1);
      for (let s = 0; s < t.length; s++)
        for (let a = 0; a < e.length; a++)
          i[s + a] ^= r.mul(t[s], e[a]);
      return i;
    }, o.mod = function(t, e) {
      let i = new Uint8Array(t);
      for (; i.length - e.length >= 0; ) {
        const s = i[0];
        for (let c = 0; c < e.length; c++)
          i[c] ^= r.mul(e[c], s);
        let a = 0;
        for (; a < i.length && i[a] === 0; ) a++;
        i = i.slice(a);
      }
      return i;
    }, o.generateECPolynomial = function(t) {
      let e = new Uint8Array([1]);
      for (let i = 0; i < t; i++)
        e = o.mul(e, new Uint8Array([1, r.exp(i)]));
      return e;
    };
  }(at)), at;
}
var ct, xt;
function Ae() {
  if (xt) return ct;
  xt = 1;
  const o = Te();
  function r(n) {
    this.genPoly = void 0, this.degree = n, this.degree && this.initialize(this.degree);
  }
  return r.prototype.initialize = function(t) {
    this.degree = t, this.genPoly = o.generateECPolynomial(this.degree);
  }, r.prototype.encode = function(t) {
    if (!this.genPoly)
      throw new Error("Encoder not initialized");
    const e = new Uint8Array(t.length + this.degree);
    e.set(t);
    const i = o.mod(e, this.genPoly), s = this.degree - i.length;
    if (s > 0) {
      const a = new Uint8Array(this.degree);
      return a.set(i, s), a;
    }
    return i;
  }, ct = r, ct;
}
var lt = {}, ut = {}, ht = {}, $t;
function se() {
  return $t || ($t = 1, ht.isValid = function(r) {
    return !isNaN(r) && r >= 1 && r <= 40;
  }), ht;
}
var N = {}, Ot;
function ae() {
  if (Ot) return N;
  Ot = 1;
  const o = "[0-9]+", r = "[A-Z $%*+\\-./:]+";
  let n = "(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";
  n = n.replace(/u/g, "\\u");
  const t = "(?:(?![A-Z0-9 $%*+\\-./:]|" + n + `)(?:.|[\r
]))+`;
  N.KANJI = new RegExp(n, "g"), N.BYTE_KANJI = new RegExp("[^A-Z0-9 $%*+\\-./:]+", "g"), N.BYTE = new RegExp(t, "g"), N.NUMERIC = new RegExp(o, "g"), N.ALPHANUMERIC = new RegExp(r, "g");
  const e = new RegExp("^" + n + "$"), i = new RegExp("^" + o + "$"), s = new RegExp("^[A-Z0-9 $%*+\\-./:]+$");
  return N.testKanji = function(c) {
    return e.test(c);
  }, N.testNumeric = function(c) {
    return i.test(c);
  }, N.testAlphanumeric = function(c) {
    return s.test(c);
  }, N;
}
var Ht;
function z() {
  return Ht || (Ht = 1, function(o) {
    const r = se(), n = ae();
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
      return n.testNumeric(i) ? o.NUMERIC : n.testAlphanumeric(i) ? o.ALPHANUMERIC : n.testKanji(i) ? o.KANJI : o.BYTE;
    }, o.toString = function(i) {
      if (i && i.id) return i.id;
      throw new Error("Invalid mode");
    }, o.isValid = function(i) {
      return i && i.bit && i.ccBits;
    };
    function t(e) {
      if (typeof e != "string")
        throw new Error("Param is not a string");
      switch (e.toLowerCase()) {
        case "numeric":
          return o.NUMERIC;
        case "alphanumeric":
          return o.ALPHANUMERIC;
        case "kanji":
          return o.KANJI;
        case "byte":
          return o.BYTE;
        default:
          throw new Error("Unknown mode: " + e);
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
  }(ut)), ut;
}
var Jt;
function Pe() {
  return Jt || (Jt = 1, function(o) {
    const r = K(), n = re(), t = Tt(), e = z(), i = se(), s = 7973, a = r.getBCHDigit(s);
    function c(g, d, A) {
      for (let F = 1; F <= 40; F++)
        if (d <= o.getCapacity(F, A, g))
          return F;
    }
    function l(g, d) {
      return e.getCharCountIndicator(g, d) + 4;
    }
    function h(g, d) {
      let A = 0;
      return g.forEach(function(F) {
        const L = l(F.mode, d);
        A += L + F.getBitsLength();
      }), A;
    }
    function f(g, d) {
      for (let A = 1; A <= 40; A++)
        if (h(g, A) <= o.getCapacity(A, d, e.MIXED))
          return A;
    }
    o.from = function(d, A) {
      return i.isValid(d) ? parseInt(d, 10) : A;
    }, o.getCapacity = function(d, A, F) {
      if (!i.isValid(d))
        throw new Error("Invalid QR Code version");
      typeof F > "u" && (F = e.BYTE);
      const L = r.getSymbolTotalCodewords(d), w = n.getTotalCodewordsCount(d, A), B = (L - w) * 8;
      if (F === e.MIXED) return B;
      const T = B - l(F, d);
      switch (F) {
        case e.NUMERIC:
          return Math.floor(T / 10 * 3);
        case e.ALPHANUMERIC:
          return Math.floor(T / 11 * 2);
        case e.KANJI:
          return Math.floor(T / 13);
        case e.BYTE:
        default:
          return Math.floor(T / 8);
      }
    }, o.getBestVersionForData = function(d, A) {
      let F;
      const L = t.from(A, t.M);
      if (Array.isArray(d)) {
        if (d.length > 1)
          return f(d, L);
        if (d.length === 0)
          return 1;
        F = d[0];
      } else
        F = d;
      return c(F.mode, F.getLength(), L);
    }, o.getEncodedBits = function(d) {
      if (!i.isValid(d) || d < 7)
        throw new Error("Invalid QR Code version");
      let A = d << 12;
      for (; r.getBCHDigit(A) - a >= 0; )
        A ^= s << r.getBCHDigit(A) - a;
      return d << 12 | A;
    };
  }(lt)), lt;
}
var ft = {}, Gt;
function Be() {
  if (Gt) return ft;
  Gt = 1;
  const o = K(), r = 1335, n = 21522, t = o.getBCHDigit(r);
  return ft.getEncodedBits = function(i, s) {
    const a = i.bit << 3 | s;
    let c = a << 10;
    for (; o.getBCHDigit(c) - t >= 0; )
      c ^= r << o.getBCHDigit(c) - t;
    return (a << 10 | c) ^ n;
  }, ft;
}
var dt = {}, gt, Vt;
function ve() {
  if (Vt) return gt;
  Vt = 1;
  const o = z();
  function r(n) {
    this.mode = o.NUMERIC, this.data = n.toString();
  }
  return r.getBitsLength = function(t) {
    return 10 * Math.floor(t / 3) + (t % 3 ? t % 3 * 3 + 1 : 0);
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(t) {
    let e, i, s;
    for (e = 0; e + 3 <= this.data.length; e += 3)
      i = this.data.substr(e, 3), s = parseInt(i, 10), t.put(s, 10);
    const a = this.data.length - e;
    a > 0 && (i = this.data.substr(e), s = parseInt(i, 10), t.put(s, a * 3 + 1));
  }, gt = r, gt;
}
var pt, jt;
function Le() {
  if (jt) return pt;
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
  function n(t) {
    this.mode = o.ALPHANUMERIC, this.data = t;
  }
  return n.getBitsLength = function(e) {
    return 11 * Math.floor(e / 2) + 6 * (e % 2);
  }, n.prototype.getLength = function() {
    return this.data.length;
  }, n.prototype.getBitsLength = function() {
    return n.getBitsLength(this.data.length);
  }, n.prototype.write = function(e) {
    let i;
    for (i = 0; i + 2 <= this.data.length; i += 2) {
      let s = r.indexOf(this.data[i]) * 45;
      s += r.indexOf(this.data[i + 1]), e.put(s, 11);
    }
    this.data.length % 2 && e.put(r.indexOf(this.data[i]), 6);
  }, pt = n, pt;
}
var mt, Yt;
function Me() {
  if (Yt) return mt;
  Yt = 1;
  const o = z();
  function r(n) {
    this.mode = o.BYTE, typeof n == "string" ? this.data = new TextEncoder().encode(n) : this.data = new Uint8Array(n);
  }
  return r.getBitsLength = function(t) {
    return t * 8;
  }, r.prototype.getLength = function() {
    return this.data.length;
  }, r.prototype.getBitsLength = function() {
    return r.getBitsLength(this.data.length);
  }, r.prototype.write = function(n) {
    for (let t = 0, e = this.data.length; t < e; t++)
      n.put(this.data[t], 8);
  }, mt = r, mt;
}
var Ct, Qt;
function Ne() {
  if (Qt) return Ct;
  Qt = 1;
  const o = z(), r = K();
  function n(t) {
    this.mode = o.KANJI, this.data = t;
  }
  return n.getBitsLength = function(e) {
    return e * 13;
  }, n.prototype.getLength = function() {
    return this.data.length;
  }, n.prototype.getBitsLength = function() {
    return n.getBitsLength(this.data.length);
  }, n.prototype.write = function(t) {
    let e;
    for (e = 0; e < this.data.length; e++) {
      let i = r.toSJIS(this.data[e]);
      if (i >= 33088 && i <= 40956)
        i -= 33088;
      else if (i >= 57408 && i <= 60351)
        i -= 49472;
      else
        throw new Error(
          "Invalid SJIS character: " + this.data[e] + `
Make sure your charset is UTF-8`
        );
      i = (i >>> 8 & 255) * 192 + (i & 255), t.put(i, 13);
    }
  }, Ct = n, Ct;
}
var yt = { exports: {} }, Wt;
function Re() {
  return Wt || (Wt = 1, function(o) {
    var r = {
      single_source_shortest_paths: function(n, t, e) {
        var i = {}, s = {};
        s[t] = 0;
        var a = r.PriorityQueue.make();
        a.push(t, 0);
        for (var c, l, h, f, g, d, A, F, L; !a.empty(); ) {
          c = a.pop(), l = c.value, f = c.cost, g = n[l] || {};
          for (h in g)
            g.hasOwnProperty(h) && (d = g[h], A = f + d, F = s[h], L = typeof s[h] > "u", (L || F > A) && (s[h] = A, a.push(h, A), i[h] = l));
        }
        if (typeof e < "u" && typeof s[e] > "u") {
          var w = ["Could not find a path from ", t, " to ", e, "."].join("");
          throw new Error(w);
        }
        return i;
      },
      extract_shortest_path_from_predecessor_list: function(n, t) {
        for (var e = [], i = t; i; )
          e.push(i), n[i], i = n[i];
        return e.reverse(), e;
      },
      find_path: function(n, t, e) {
        var i = r.single_source_shortest_paths(n, t, e);
        return r.extract_shortest_path_from_predecessor_list(
          i,
          e
        );
      },
      /**
       * A very naive priority queue implementation.
       */
      PriorityQueue: {
        make: function(n) {
          var t = r.PriorityQueue, e = {}, i;
          n = n || {};
          for (i in t)
            t.hasOwnProperty(i) && (e[i] = t[i]);
          return e.queue = [], e.sorter = n.sorter || t.default_sorter, e;
        },
        default_sorter: function(n, t) {
          return n.cost - t.cost;
        },
        /**
         * Add a new item to the queue and ensure the highest priority element
         * is at the front of the queue.
         */
        push: function(n, t) {
          var e = { value: n, cost: t };
          this.queue.push(e), this.queue.sort(this.sorter);
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
  }(yt)), yt.exports;
}
var Zt;
function De() {
  return Zt || (Zt = 1, function(o) {
    const r = z(), n = ve(), t = Le(), e = Me(), i = Ne(), s = ae(), a = K(), c = Re();
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
          return n.getBitsLength(w);
        case r.ALPHANUMERIC:
          return t.getBitsLength(w);
        case r.KANJI:
          return i.getBitsLength(w);
        case r.BYTE:
          return e.getBitsLength(w);
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
    function F(w, B) {
      const T = {}, b = { start: {} };
      let M = ["start"];
      for (let p = 0; p < w.length; p++) {
        const E = w[p], S = [];
        for (let m = 0; m < E.length; m++) {
          const P = E[m], C = "" + p + m;
          S.push(C), T[C] = { node: P, lastCount: 0 }, b[C] = {};
          for (let I = 0; I < M.length; I++) {
            const y = M[I];
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
          return new n(w);
        case r.ALPHANUMERIC:
          return new t(w);
        case r.KANJI:
          return new i(w);
        case r.BYTE:
          return new e(w);
      }
    }
    o.fromArray = function(B) {
      return B.reduce(function(T, b) {
        return typeof b == "string" ? T.push(L(b, null)) : b.data && T.push(L(b.data, b.mode)), T;
      }, []);
    }, o.fromString = function(B, T) {
      const b = f(B, a.isKanjiModeEnabled()), M = A(b), p = F(M, T), E = c.find_path(p.map, "start", "end"), S = [];
      for (let m = 1; m < E.length - 1; m++)
        S.push(p.table[E[m]].node);
      return o.fromArray(d(S));
    }, o.rawSplit = function(B) {
      return o.fromArray(
        f(B, a.isKanjiModeEnabled())
      );
    };
  }(dt)), dt;
}
var Xt;
function ke() {
  if (Xt) return tt;
  Xt = 1;
  const o = K(), r = Tt(), n = we(), t = be(), e = Se(), i = Ee(), s = Ie(), a = re(), c = Ae(), l = Pe(), h = Be(), f = z(), g = De();
  function d(p, E) {
    const S = p.size, m = i.getPositions(E);
    for (let P = 0; P < m.length; P++) {
      const C = m[P][0], I = m[P][1];
      for (let y = -1; y <= 7; y++)
        if (!(C + y <= -1 || S <= C + y))
          for (let v = -1; v <= 7; v++)
            I + v <= -1 || S <= I + v || (y >= 0 && y <= 6 && (v === 0 || v === 6) || v >= 0 && v <= 6 && (y === 0 || y === 6) || y >= 2 && y <= 4 && v >= 2 && v <= 4 ? p.set(C + y, I + v, !0, !0) : p.set(C + y, I + v, !1, !0));
    }
  }
  function A(p) {
    const E = p.size;
    for (let S = 8; S < E - 8; S++) {
      const m = S % 2 === 0;
      p.set(S, 6, m, !0), p.set(6, S, m, !0);
    }
  }
  function F(p, E) {
    const S = e.getPositions(E);
    for (let m = 0; m < S.length; m++) {
      const P = S[m][0], C = S[m][1];
      for (let I = -2; I <= 2; I++)
        for (let y = -2; y <= 2; y++)
          I === -2 || I === 2 || y === -2 || y === 2 || I === 0 && y === 0 ? p.set(P + I, C + y, !0, !0) : p.set(P + I, C + y, !1, !0);
    }
  }
  function L(p, E) {
    const S = p.size, m = l.getEncodedBits(E);
    let P, C, I;
    for (let y = 0; y < 18; y++)
      P = Math.floor(y / 3), C = y % 3 + S - 8 - 3, I = (m >> y & 1) === 1, p.set(P, C, I, !0), p.set(C, P, I, !0);
  }
  function w(p, E, S) {
    const m = p.size, P = h.getEncodedBits(E, S);
    let C, I;
    for (C = 0; C < 15; C++)
      I = (P >> C & 1) === 1, C < 6 ? p.set(C, 8, I, !0) : C < 8 ? p.set(C + 1, 8, I, !0) : p.set(m - 15 + C, 8, I, !0), C < 8 ? p.set(8, m - C - 1, I, !0) : C < 9 ? p.set(8, 15 - C - 1 + 1, I, !0) : p.set(8, 15 - C - 1, I, !0);
    p.set(m - 8, 8, 1, !0);
  }
  function B(p, E) {
    const S = p.size;
    let m = -1, P = S - 1, C = 7, I = 0;
    for (let y = S - 1; y > 0; y -= 2)
      for (y === 6 && y--; ; ) {
        for (let v = 0; v < 2; v++)
          if (!p.isReserved(P, y - v)) {
            let k = !1;
            I < E.length && (k = (E[I] >>> C & 1) === 1), p.set(P, y - v, k), C--, C === -1 && (I++, C = 7);
          }
        if (P += m, P < 0 || S <= P) {
          P -= m, m = -m;
          break;
        }
      }
  }
  function T(p, E, S) {
    const m = new n();
    S.forEach(function(v) {
      m.put(v.mode.bit, 4), m.put(v.getLength(), f.getCharCountIndicator(v.mode, p)), v.write(m);
    });
    const P = o.getSymbolTotalCodewords(p), C = a.getTotalCodewordsCount(p, E), I = (P - C) * 8;
    for (m.getLengthInBits() + 4 <= I && m.put(0, 4); m.getLengthInBits() % 8 !== 0; )
      m.putBit(0);
    const y = (I - m.getLengthInBits()) / 8;
    for (let v = 0; v < y; v++)
      m.put(v % 2 ? 17 : 236, 8);
    return b(m, p, E);
  }
  function b(p, E, S) {
    const m = o.getSymbolTotalCodewords(E), P = a.getTotalCodewordsCount(E, S), C = m - P, I = a.getBlocksCount(E, S), y = m % I, v = I - y, k = Math.floor(m / I), $ = Math.floor(C / I), de = $ + 1, At = k - $, ge = new c(At);
    let Y = 0;
    const G = new Array(I), Pt = new Array(I);
    let Q = 0;
    const pe = new Uint8Array(p.buffer);
    for (let _ = 0; _ < I; _++) {
      const Z = _ < v ? $ : de;
      G[_] = pe.slice(Y, Y + Z), Pt[_] = ge.encode(G[_]), Y += Z, Q = Math.max(Q, Z);
    }
    const W = new Uint8Array(m);
    let Bt = 0, R, D;
    for (R = 0; R < Q; R++)
      for (D = 0; D < I; D++)
        R < G[D].length && (W[Bt++] = G[D][R]);
    for (R = 0; R < At; R++)
      for (D = 0; D < I; D++)
        W[Bt++] = Pt[D][R];
    return W;
  }
  function M(p, E, S, m) {
    let P;
    if (Array.isArray(p))
      P = g.fromArray(p);
    else if (typeof p == "string") {
      let k = E;
      if (!k) {
        const $ = g.rawSplit(p);
        k = l.getBestVersionForData($, S);
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
    const I = T(E, S, P), y = o.getSymbolSize(E), v = new t(y);
    return d(v, E), A(v), F(v, E), w(v, S, 0), E >= 7 && L(v, E), B(v, I), isNaN(m) && (m = s.getBestMask(
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
  return tt.create = function(E, S) {
    if (typeof E > "u" || E === "")
      throw new Error("No input text");
    let m = r.M, P, C;
    return typeof S < "u" && (m = r.from(S.errorCorrectionLevel, r.M), P = l.from(S.version), C = s.from(S.maskPattern), S.toSJISFunc && o.setToSJISFunction(S.toSJISFunc)), M(E, P, m, C);
  }, tt;
}
var wt = {}, bt = {}, te;
function ce() {
  return te || (te = 1, function(o) {
    function r(n) {
      if (typeof n == "number" && (n = n.toString()), typeof n != "string")
        throw new Error("Color should be defined as hex string");
      let t = n.slice().replace("#", "").split("");
      if (t.length < 3 || t.length === 5 || t.length > 8)
        throw new Error("Invalid hex color: " + n);
      (t.length === 3 || t.length === 4) && (t = Array.prototype.concat.apply([], t.map(function(i) {
        return [i, i];
      }))), t.length === 6 && t.push("F", "F");
      const e = parseInt(t.join(""), 16);
      return {
        r: e >> 24 & 255,
        g: e >> 16 & 255,
        b: e >> 8 & 255,
        a: e & 255,
        hex: "#" + t.slice(0, 6).join("")
      };
    }
    o.getOptions = function(t) {
      t || (t = {}), t.color || (t.color = {});
      const e = typeof t.margin > "u" || t.margin === null || t.margin < 0 ? 4 : t.margin, i = t.width && t.width >= 21 ? t.width : void 0, s = t.scale || 4;
      return {
        width: i,
        scale: i ? 4 : s,
        margin: e,
        color: {
          dark: r(t.color.dark || "#000000ff"),
          light: r(t.color.light || "#ffffffff")
        },
        type: t.type,
        rendererOpts: t.rendererOpts || {}
      };
    }, o.getScale = function(t, e) {
      return e.width && e.width >= t + e.margin * 2 ? e.width / (t + e.margin * 2) : e.scale;
    }, o.getImageWidth = function(t, e) {
      const i = o.getScale(t, e);
      return Math.floor((t + e.margin * 2) * i);
    }, o.qrToImageData = function(t, e, i) {
      const s = e.modules.size, a = e.modules.data, c = o.getScale(s, i), l = Math.floor((s + i.margin * 2) * c), h = i.margin * c, f = [i.color.light, i.color.dark];
      for (let g = 0; g < l; g++)
        for (let d = 0; d < l; d++) {
          let A = (g * l + d) * 4, F = i.color.light;
          if (g >= h && d >= h && g < l - h && d < l - h) {
            const L = Math.floor((g - h) / c), w = Math.floor((d - h) / c);
            F = f[a[L * s + w] ? 1 : 0];
          }
          t[A++] = F.r, t[A++] = F.g, t[A++] = F.b, t[A] = F.a;
        }
    };
  }(bt)), bt;
}
var ee;
function Ue() {
  return ee || (ee = 1, function(o) {
    const r = ce();
    function n(e, i, s) {
      e.clearRect(0, 0, i.width, i.height), i.style || (i.style = {}), i.height = s, i.width = s, i.style.height = s + "px", i.style.width = s + "px";
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
      return r.qrToImageData(g.data, i, c), n(f, l, h), f.putImageData(g, 0, 0), l;
    }, o.renderToDataURL = function(i, s, a) {
      let c = a;
      typeof c > "u" && (!s || !s.getContext) && (c = s, s = void 0), c || (c = {});
      const l = o.render(i, s, c), h = c.type || "image/png", f = c.rendererOpts || {};
      return l.toDataURL(h, f.quality);
    };
  }(wt)), wt;
}
var St = {}, ne;
function qe() {
  if (ne) return St;
  ne = 1;
  const o = ce();
  function r(e, i) {
    const s = e.a / 255, a = i + '="' + e.hex + '"';
    return s < 1 ? a + " " + i + '-opacity="' + s.toFixed(2).slice(1) + '"' : a;
  }
  function n(e, i, s) {
    let a = e + i;
    return typeof s < "u" && (a += " " + s), a;
  }
  function t(e, i, s) {
    let a = "", c = 0, l = !1, h = 0;
    for (let f = 0; f < e.length; f++) {
      const g = Math.floor(f % i), d = Math.floor(f / i);
      !g && !l && (l = !0), e[f] ? (h++, f > 0 && g > 0 && e[f - 1] || (a += l ? n("M", g + s, 0.5 + d + s) : n("m", c, 0), c = 0, l = !1), g + 1 < i && e[f + 1] || (a += n("h", h), h = 0)) : c++;
    }
    return a;
  }
  return St.render = function(i, s, a) {
    const c = o.getOptions(s), l = i.modules.size, h = i.modules.data, f = l + c.margin * 2, g = c.color.light.a ? "<path " + r(c.color.light, "fill") + ' d="M0 0h' + f + "v" + f + 'H0z"/>' : "", d = "<path " + r(c.color.dark, "stroke") + ' d="' + t(h, l, c.margin) + '"/>', A = 'viewBox="0 0 ' + f + " " + f + '"', L = '<svg xmlns="http://www.w3.org/2000/svg" ' + (c.width ? 'width="' + c.width + '" height="' + c.width + '" ' : "") + A + ' shape-rendering="crispEdges">' + g + d + `</svg>
`;
    return typeof a == "function" && a(null, L), L;
  }, St;
}
var ie;
function Ke() {
  if (ie) return x;
  ie = 1;
  const o = ye(), r = ke(), n = Ue(), t = qe();
  function e(i, s, a, c, l) {
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
          const F = r.create(a, c);
          d(i(F, s, c));
        } catch (F) {
          A(F);
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
  return x.create = r.create, x.toCanvas = e.bind(null, n.render), x.toDataURL = e.bind(null, n.renderToDataURL), x.toString = e.bind(null, function(i, s, a) {
    return t.render(i, a);
  }), x;
}
var ze = Ke();
const H = 1e3, j = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302"]
    }
  ]
};
function _e() {
  return crypto.randomUUID();
}
async function Et(o) {
  return await (await fetch(o)).json();
}
function le(o, r) {
  for (const n of o)
    if (JSON.stringify(n) === JSON.stringify(r))
      return !0;
  return !1;
}
class J {
  constructor() {
    u(this, "eventListeners", {});
  }
  on(r, n) {
    const t = this.eventListeners[r] ?? /* @__PURE__ */ new Set();
    t.add(n), this.eventListeners[r] = t;
  }
  off(r, n) {
    const t = this.eventListeners[r];
    t && (t.delete(n), t.size === 0 && delete this.eventListeners[r]);
  }
  emit(r, ...n) {
    const t = this.eventListeners[r] ?? /* @__PURE__ */ new Set();
    for (const e of t)
      e(...n);
  }
}
class ue extends J {
}
async function xe() {
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
async function $e(o) {
  return (await crypto.subtle.exportKey("jwk", o)).k;
}
async function Oe(o) {
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
async function It(o, r) {
  const n = He(o), t = Je(), e = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: t
    },
    r,
    n
  ), i = new Uint8Array(t.length + e.byteLength);
  return i.set(t, 0), i.set(new Uint8Array(e), t.length), Ge(i);
}
async function Ft(o, r) {
  const n = Ve(o), t = n.slice(0, 12), e = n.slice(12), i = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: t
    },
    r,
    e
  );
  return je(new Uint8Array(i));
}
function He(o) {
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
  return Uint8Array.from(r, (n) => n.charCodeAt(0));
}
function je(o, r = !0) {
  const t = new TextDecoder().decode(o);
  return r ? JSON.parse(t) : t;
}
class he extends J {
  constructor({
    flottformApi: n,
    createClientUrl: t,
    rtcConfiguration: e,
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
    u(this, "changeState", (n, t) => {
      this.state = n, this.emit(n, t), this.logger.info(`State changed to: ${n}`, t ?? "");
    });
    u(this, "start", async () => {
      this.openPeerConnection && this.close(), this.cryptoKey = await xe();
      const n = (this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)).toString().replace(/\/$/, "");
      this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration), this.dataChannel = this.createDataChannel();
      const t = await this.openPeerConnection.createOffer();
      await this.openPeerConnection.setLocalDescription(t);
      const { endpointId: e, hostKey: i } = await this.createEndpoint(n, t);
      this.logger.log("Created endpoint", { endpointId: e, hostKey: i });
      const s = `${n}/${e}`, a = `${n}/${e}/host`, c = /* @__PURE__ */ new Set();
      await this.putHostInfo(a, i, c, t), this.setUpConnectionStateGathering(s), this.setupHostIceGathering(a, i, c, t), this.setupDataChannelForTransfer();
      const l = await $e(this.cryptoKey);
      if (!l)
        throw new Error("Encryption Key is undefined!");
      const h = await this.createClientUrl({ endpointId: e, encryptionKey: l });
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
      this.dataChannel.onmessage = (n) => {
        this.emit("receiving-data", n);
      };
    });
    u(this, "setupHostIceGathering", (n, t, e, i) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to gather Host ICE candidates");
        return;
      }
      this.openPeerConnection.onicecandidate = async (s) => {
        this.logger.info(
          `onicecandidate - ${this.openPeerConnection.connectionState} - ${s.candidate}`
        ), s.candidate && (le(e, s.candidate) || (this.logger.log("host found new ice candidate! Adding it to our list"), e.add(s.candidate), await this.putHostInfo(n, t, e, i)));
      }, this.openPeerConnection.onicegatheringstatechange = async (s) => {
        this.logger.info(
          `onicegatheringstatechange - ${this.openPeerConnection.iceGatheringState} - ${s}`
        );
      }, this.openPeerConnection.onicecandidateerror = async (s) => {
        this.logger.error("peerConnection.onicecandidateerror", s);
      };
    });
    u(this, "setUpConnectionStateGathering", (n) => {
      if (this.openPeerConnection === null) {
        this.changeState(
          "error",
          "openPeerConnection is null. Unable to poll for the client's details"
        );
        return;
      }
      this.startPollingForConnection(n), this.openPeerConnection.onconnectionstatechange = () => {
        this.logger.info(`onconnectionstatechange - ${this.openPeerConnection.connectionState}`), this.openPeerConnection.connectionState === "connected" && this.stopPollingForConnection(), this.openPeerConnection.connectionState === "disconnected" && this.startPollingForConnection(n), this.openPeerConnection.connectionState === "failed" && (this.stopPollingForConnection(), this.changeState("error", { message: "connection-failed" }));
      }, this.openPeerConnection.oniceconnectionstatechange = async (t) => {
        this.logger.info(
          `oniceconnectionstatechange - ${this.openPeerConnection.iceConnectionState} - ${t}`
        ), this.openPeerConnection.iceConnectionState === "failed" && (this.logger.log("Failed to find a possible connection path"), this.changeState("error", { message: "connection-impossible" }));
      };
    });
    u(this, "stopPollingForConnection", async () => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), this.pollForIceTimer = null;
    });
    u(this, "startPollingForConnection", async (n) => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), await this.pollForConnection(n), this.pollForIceTimer = setTimeout(() => {
        this.startPollingForConnection(n);
      }, this.pollTimeForIceInMs);
    });
    u(this, "createEndpoint", async (n, t) => {
      if (!this.cryptoKey)
        throw new Error("CryptoKey is null! Encryption is not possible!!");
      const e = await It(JSON.stringify({ session: t }), this.cryptoKey);
      return (await fetch(`${n}/create`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ hostInfo: e })
      })).json();
    });
    u(this, "fetchIceServers", async (n) => {
      const t = await fetch(`${n}/ice-server-credentials`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!t.ok)
        throw new Error("Fetching Error!");
      const e = await t.json();
      if (e.success === !1)
        throw new Error(e.message || "Unknown error occurred");
      return e.iceServers;
    });
    u(this, "pollForConnection", async (n) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to retrieve Client's details");
        return;
      }
      this.logger.log("polling for client ice candidates", this.openPeerConnection.iceGatheringState);
      const t = await Et(n);
      if (!this.cryptoKey)
        throw new Error("CryptoKey is null! Decryption is not possible!!");
      let e, i, s = [];
      t.clientInfo && (e = await Ft(t.clientInfo, this.cryptoKey), console.log("clientInfo After Decryption: ", e), i = JSON.parse(e.session), s = JSON.parse(e.iceCandidates)), console.log("decryptedSession -->", i), console.log("decryptedIceCandidates -->", s), e && this.state === "waiting-for-client" && (this.logger.log("Found a client that wants to connect!"), this.changeState("waiting-for-ice"), await this.openPeerConnection.setRemoteDescription(i));
      for (const a of s ?? [])
        await this.openPeerConnection.addIceCandidate(a);
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
      }, this.dataChannel.onerror = (n) => {
        this.logger.log("channel.onerror", n), this.changeState("error", { message: "file-transfer" });
      };
    });
    u(this, "createDataChannel", () => {
      if (this.openPeerConnection === null)
        return this.changeState("error", "openPeerConnection is null. Unable to create a new Data Channel"), null;
      this.channelNumber++;
      const n = `data-channel-${this.channelNumber}`;
      return this.openPeerConnection.createDataChannel(n);
    });
    u(this, "putHostInfo", async (n, t, e, i) => {
      try {
        if (this.logger.log("Updating host info with new list of ice candidates"), !this.cryptoKey)
          throw new Error("CryptoKey is null! Encryption is not possible!!");
        const s = await It(
          JSON.stringify({
            session: JSON.stringify(i),
            iceCandidates: JSON.stringify([...e])
          }),
          this.cryptoKey
        );
        if (!(await fetch(n, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            hostKey: t,
            hostInfo: s
          })
        })).ok)
          throw Error("Could not update host info");
      } catch (s) {
        this.changeState("error", s);
      }
    });
    this.flottformApi = n, this.createClientUrl = t, this.rtcConfiguration = e, this.pollTimeForIceInMs = i, this.logger = s, Promise.resolve().then(() => {
      this.changeState("new", { channel: this });
    });
  }
}
class Ye extends ue {
  constructor({
    flottformApi: n,
    createClientUrl: t,
    inputField: e,
    rtcConfiguration: i = j,
    pollTimeForIceInMs: s = H,
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
      var n;
      (n = this.channel) == null || n.start();
    });
    u(this, "close", () => {
      var n;
      (n = this.channel) == null || n.close();
    });
    u(this, "getLink", () => (this.link === "" && this.logger.error(
      "Flottform is currently establishing the connection. Link is unavailable for now!"
    ), this.link));
    u(this, "getQrCode", () => (this.qrCode === "" && this.logger.error(
      "Flottform is currently establishing the connection. qrCode is unavailable for now!"
    ), this.qrCode));
    u(this, "handleIncomingData", (n) => {
      var t, e, i;
      if (typeof n.data == "string") {
        const s = JSON.parse(n.data);
        s.type === "file-transfer-meta" ? (this.filesMetaData = s.filesQueue, this.currentFile = { index: 0, receivedSize: 0, arrayBuffer: [] }, this.filesTotalSize = s.totalSize, this.emit("receive")) : s.type === "transfer-complete" && (this.emit("done"), (t = this.channel) == null || t.close());
      } else if (n.data instanceof ArrayBuffer && this.currentFile) {
        this.currentFile.arrayBuffer.push(n.data), this.currentFile.receivedSize += n.data.byteLength, this.receivedDataSize += n.data.byteLength;
        const s = (e = this.filesMetaData[this.currentFile.index]) == null ? void 0 : e.name, a = (i = this.filesMetaData[this.currentFile.index]) == null ? void 0 : i.size, c = (this.currentFile.receivedSize / a).toFixed(
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
    u(this, "appendFileToInputField", (n) => {
      var a, c, l;
      const t = ((a = this.filesMetaData[n]) == null ? void 0 : a.name) ?? "no-name", e = ((c = this.filesMetaData[n]) == null ? void 0 : c.type) ?? "application/octet-stream", i = new File((l = this.currentFile) == null ? void 0 : l.arrayBuffer, t, {
        type: e
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
      var n, t, e, i, s, a, c;
      (n = this.channel) == null || n.on("new", () => {
        this.emit("new");
      }), (t = this.channel) == null || t.on("waiting-for-client", (l) => {
        this.emit("webrtc:waiting-for-client", l);
        const { qrCode: h, link: f } = l;
        this.emit("endpoint-created", { link: f, qrCode: h }), this.link = f, this.qrCode = h;
      }), (e = this.channel) == null || e.on("waiting-for-ice", () => {
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
      flottformApi: n,
      createClientUrl: t,
      rtcConfiguration: i,
      pollTimeForIceInMs: s,
      logger: a
    }), this.inputField = e, this.logger = a, this.registerListeners();
  }
}
class fe extends J {
  // 128KB buffer threshold (maximum of 4 chunks in the buffer waiting to be sent over the network)
  constructor({
    endpointId: n,
    flottformApi: t,
    rtcConfiguration: e,
    encryptionKey: i,
    pollTimeForIceInMs: s = H,
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
    u(this, "changeState", (n, t) => {
      this.state = n, this.emit(n, t), this.logger.info(`**Client State changed to: ${n}`, t ?? "");
    });
    u(this, "start", async () => {
      this.openPeerConnection && this.close(), this.cryptoKey = await Oe(this.encryptionKey), (this.flottformApi instanceof URL ? this.flottformApi : new URL(this.flottformApi)).toString().replace(/\/$/, ""), this.openPeerConnection = new RTCPeerConnection(this.rtcConfiguration);
      const n = _e(), t = /* @__PURE__ */ new Set(), e = `${this.flottformApi}/${this.endpointId}`, i = `${this.flottformApi}/${this.endpointId}/client`;
      this.changeState("retrieving-info-from-endpoint");
      const s = await Et(e);
      if (!this.cryptoKey)
        throw new Error("CryptoKey is null! Decryption is not possible!!");
      const a = await Ft(s.hostInfo, this.cryptoKey);
      console.log("hostInfo --> ", a);
      const c = JSON.parse(a.session);
      await this.openPeerConnection.setRemoteDescription(c);
      const l = await this.openPeerConnection.createAnswer();
      await this.openPeerConnection.setLocalDescription(l), this.setUpConnectionStateGathering(e), this.setUpClientIceGathering(i, n, t, l), this.openPeerConnection.ondatachannel = (h) => {
        this.logger.info(`ondatachannel: ${h.channel}`), this.changeState("connected"), this.dataChannel = h.channel, this.dataChannel.bufferedAmountLowThreshold = this.BUFFER_THRESHOLD, this.dataChannel.onbufferedamountlow = () => {
          this.emit("bufferedamountlow");
        }, this.dataChannel.onopen = (f) => {
          this.logger.info(`ondatachannel - onopen: ${f.type}`);
        };
      }, this.changeState("sending-client-info"), await this.putClientInfo(i, n, t, l), this.changeState("connecting-to-host"), this.startPollingForIceCandidates(e);
    });
    u(this, "close", () => {
      this.openPeerConnection && (this.openPeerConnection.close(), this.openPeerConnection = null, this.stopPollingForIceCandidates()), this.changeState("disconnected");
    });
    // sendData = (data: string | Blob | ArrayBuffer | ArrayBufferView) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    u(this, "sendData", (n) => {
      if (this.dataChannel == null) {
        this.changeState("error", "dataChannel is null. Unable to send the file to the Host!");
        return;
      } else if (!this.canSendMoreData()) {
        this.logger.warn("Data channel is full! Cannot send data at the moment");
        return;
      }
      this.dataChannel.send(n);
    });
    u(this, "canSendMoreData", () => this.dataChannel && this.dataChannel.bufferedAmount < this.dataChannel.bufferedAmountLowThreshold);
    u(this, "setUpClientIceGathering", (n, t, e, i) => {
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
        ), s.candidate && (le(e, s.candidate) || (this.logger.log("client found new ice candidate! Adding it to our list"), e.add(s.candidate), await this.putClientInfo(n, t, e, i)));
      }, this.openPeerConnection.onicegatheringstatechange = async () => {
        this.logger.info(`onicegatheringstatechange - ${this.openPeerConnection.iceGatheringState}`);
      }, this.openPeerConnection.onicecandidateerror = (s) => {
        this.logger.error(`onicecandidateerror - ${this.openPeerConnection.connectionState}`, s);
      };
    });
    u(this, "setUpConnectionStateGathering", (n) => {
      if (this.openPeerConnection === null) {
        this.changeState(
          "error",
          "openPeerConnection is null. Unable to gather Client ICE candidates"
        );
        return;
      }
      this.openPeerConnection.onconnectionstatechange = () => {
        this.logger.info(`onconnectionstatechange - ${this.openPeerConnection.connectionState}`), this.openPeerConnection.connectionState === "connected" && (this.stopPollingForIceCandidates(), this.state === "connecting-to-host" && this.changeState("connected")), this.openPeerConnection.connectionState === "disconnected" && this.startPollingForIceCandidates(n), this.openPeerConnection.connectionState === "failed" && (this.stopPollingForIceCandidates(), this.state !== "done" && this.changeState("disconnected"));
      }, this.openPeerConnection.oniceconnectionstatechange = () => {
        this.logger.info(
          `oniceconnectionstatechange - ${this.openPeerConnection.iceConnectionState}`
        ), this.openPeerConnection.iceConnectionState === "failed" && (this.logger.log("Failed to find a possible connection path"), this.changeState("connection-impossible"));
      };
    });
    u(this, "stopPollingForIceCandidates", async () => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), this.pollForIceTimer = null;
    });
    u(this, "startPollingForIceCandidates", async (n) => {
      this.pollForIceTimer && clearTimeout(this.pollForIceTimer), await this.pollForConnection(n), this.pollForIceTimer = setTimeout(this.startPollingForIceCandidates, this.pollTimeForIceInMs);
    });
    u(this, "pollForConnection", async (n) => {
      if (this.openPeerConnection === null) {
        this.changeState("error", "openPeerConnection is null. Unable to retrieve Host's details");
        return;
      }
      this.logger.log("polling for host ice candidates", this.openPeerConnection.iceGatheringState);
      const t = await Et(n);
      if (console.log("hostInfoCipherText --> ", t), !this.cryptoKey)
        throw new Error("CryptoKey is null! Decryption is not possible!!");
      const e = await Ft(t.hostInfo, this.cryptoKey);
      console.log("hostInfo --> ", e);
      const i = JSON.parse(e.iceCandidates);
      for (const s of i)
        await this.openPeerConnection.addIceCandidate(s);
    });
    u(this, "putClientInfo", async (n, t, e, i) => {
      if (this.logger.log("Updating client info with new list of ice candidates"), !this.cryptoKey)
        throw new Error("CryptoKey is null! Encryption is not possible!!");
      const s = await It(
        JSON.stringify({
          session: JSON.stringify(i),
          iceCandidates: JSON.stringify([...e])
        }),
        this.cryptoKey
      );
      if (!(await fetch(n, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientKey: t,
          clientInfo: s
        })
      })).ok)
        throw Error("Could not update client info. Did another peer already connect?");
    });
    u(this, "fetchIceServers", async (n) => {
      const t = await fetch(`${n}/ice-server-credentials`, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });
      if (!t.ok)
        throw new Error("Fetching Error!");
      const e = await t.json();
      if (e.success === !1)
        throw new Error(e.message || "Unknown error occurred");
      return e.iceServers;
    });
    this.endpointId = n, this.flottformApi = t, this.rtcConfiguration = e, this.encryptionKey = i, this.pollTimeForIceInMs = s, this.logger = a;
  }
}
class bn extends J {
  constructor({
    endpointId: n,
    fileInput: t,
    flottformApi: e,
    encryptionKey: i,
    rtcConfiguration: s = j,
    pollTimeForIceInMs: a = H,
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
      var n;
      (n = this.channel) == null || n.start();
    });
    u(this, "close", () => {
      var n;
      (n = this.channel) == null || n.close();
    });
    u(this, "createMetaData", (n) => {
      if (!n.files) return null;
      const e = Array.from(n.files).map((i) => ({
        name: i.name,
        type: i.type,
        // We're dividing each file into chuncks no matter what the type of the file.
        size: i.size
      }));
      return {
        type: "file-transfer-meta",
        filesQueue: e,
        totalSize: e.reduce((i, s) => i + s.size, 0)
      };
    });
    u(this, "createArrayBuffers", async (n) => {
      if (!n.files) return null;
      const t = Array.from(n.files);
      return await Promise.all(t.map(async (e) => await e.arrayBuffer()));
    });
    u(this, "sendFiles", async () => {
      var e;
      const n = this.createMetaData(this.inputField), t = await this.createArrayBuffers(this.inputField);
      if (!n || !t)
        throw new Error("Can't find the files that you want to send!");
      this.filesMetaData = n.filesQueue, this.filesArrayBuffer = t, (e = this.channel) == null || e.sendData(JSON.stringify(n)), this.emit("sending"), this.startSendingFiles();
    });
    u(this, "startSendingFiles", () => {
      this.sendNextChunk();
    });
    u(this, "sendNextChunk", async () => {
      var s, a, c, l;
      const n = this.filesMetaData.length;
      if (this.allFilesSent || this.currentFileIndex >= n) {
        this.logger.log("All files are sent"), (s = this.channel) == null || s.sendData(JSON.stringify({ type: "transfer-complete" })), this.allFilesSent = !0, (a = this.channel) == null || a.off("bufferedamountlow", this.startSendingFiles), this.emit("done");
        return;
      }
      const t = this.filesArrayBuffer[this.currentFileIndex];
      if (!t)
        throw new Error(`Can't find the ArrayBuffer for the file number ${this.currentFileIndex}`);
      const e = t.byteLength, i = this.filesMetaData[this.currentFileIndex].name;
      for (; this.currentChunkIndex * this.chunkSize < e; ) {
        if (!((c = this.channel) != null && c.canSendMoreData())) {
          this.logger.log("Buffer is full. Pausing sending chunks!");
          break;
        }
        const h = (this.currentChunkIndex * this.chunkSize / e).toFixed(2);
        this.emit("progress", {
          fileIndex: this.currentFileIndex,
          fileName: i,
          progress: parseFloat(h)
        });
        const f = this.currentChunkIndex * this.chunkSize, g = Math.min((this.currentChunkIndex + 1) * this.chunkSize, e);
        (l = this.channel) == null || l.sendData(t.slice(f, g)), this.currentChunkIndex++;
      }
      this.currentChunkIndex * this.chunkSize >= e ? (this.logger.log(`File ${i} fully sent. Moving to next file.`), this.currentFileIndex++, this.currentChunkIndex = 0, this.sendNextChunk()) : setTimeout(this.sendNextChunk, 100);
    });
    u(this, "registerListeners", () => {
      var n, t, e, i, s, a, c, l, h, f;
      (n = this.channel) == null || n.on("init", () => {
      }), (t = this.channel) == null || t.on("retrieving-info-from-endpoint", () => {
      }), (e = this.channel) == null || e.on("sending-client-info", () => {
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
      endpointId: n,
      flottformApi: e,
      rtcConfiguration: s,
      encryptionKey: i,
      pollTimeForIceInMs: a,
      logger: c
    }), this.inputField = t, this.logger = c, this.registerListeners();
  }
}
class Sn extends J {
  constructor({
    endpointId: n,
    flottformApi: t,
    encryptionKey: e,
    rtcConfiguration: i = j,
    pollTimeForIceInMs: s = H,
    logger: a = console
  }) {
    super();
    u(this, "channel", null);
    u(this, "logger");
    u(this, "start", () => {
      var n;
      (n = this.channel) == null || n.start();
    });
    u(this, "close", () => {
      var n;
      (n = this.channel) == null || n.close();
    });
    u(this, "sendText", (n) => {
      var t;
      this.emit("sending"), (t = this.channel) == null || t.sendData(n), this.emit("done");
    });
    u(this, "registerListeners", () => {
      var n, t, e, i, s, a, c, l, h;
      (n = this.channel) == null || n.on("init", () => {
      }), (t = this.channel) == null || t.on("retrieving-info-from-endpoint", () => {
      }), (e = this.channel) == null || e.on("sending-client-info", () => {
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
      endpointId: n,
      flottformApi: t,
      rtcConfiguration: i,
      encryptionKey: e,
      pollTimeForIceInMs: s,
      logger: a
    }), this.logger = a, this.registerListeners();
  }
}
class Qe extends ue {
  constructor({
    flottformApi: n,
    createClientUrl: t,
    inputField: e = void 0,
    rtcConfiguration: i = j,
    pollTimeForIceInMs: s = H,
    logger: a = console
  }) {
    super();
    u(this, "channel", null);
    u(this, "logger");
    u(this, "link", "");
    u(this, "qrCode", "");
    u(this, "inputField");
    u(this, "start", () => {
      var n;
      (n = this.channel) == null || n.start();
    });
    u(this, "close", () => {
      var n;
      (n = this.channel) == null || n.close();
    });
    u(this, "getLink", () => (this.link === "" && this.logger.error(
      "Flottform is currently establishing the connection. Link is unavailable for now!"
    ), this.link));
    u(this, "getQrCode", () => (this.qrCode === "" && this.logger.error(
      "Flottform is currently establishing the connection. qrCode is unavailable for now!"
    ), this.qrCode));
    u(this, "handleIncomingData", (n) => {
      if (this.emit("receive"), this.emit("done", n.data), this.inputField) {
        this.inputField.value = n.data;
        const t = new Event("change");
        this.inputField.dispatchEvent(t);
      }
    });
    u(this, "registerListeners", () => {
      var n, t, e, i, s, a, c;
      (n = this.channel) == null || n.on("new", () => {
        this.emit("new");
      }), (t = this.channel) == null || t.on("waiting-for-client", (l) => {
        this.emit("webrtc:waiting-for-client", l);
        const { qrCode: h, link: f } = l;
        this.emit("endpoint-created", { link: f, qrCode: h }), this.link = f, this.qrCode = h;
      }), (e = this.channel) == null || e.on("waiting-for-ice", () => {
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
      flottformApi: n,
      createClientUrl: t,
      rtcConfiguration: i,
      pollTimeForIceInMs: s,
      logger: a
    }), this.logger = a, this.inputField = e, this.registerListeners();
  }
}
const We = () => {
  const o = document.querySelector(
    ".flottform-elements-container-wrapper"
  ), r = document.querySelector(".flottform-opener-triangle");
  o.classList.toggle("flottform-open"), r.classList.toggle("flottform-button-svg-open");
}, Ze = (o, r, n) => {
  const t = document.createElement("div");
  t.setAttribute("class", `flottform-root${n ?? ""}`);
  const e = nn(o);
  t.appendChild(e);
  const i = on(r);
  return t.appendChild(i), t;
}, Xe = (o, r) => {
  const n = document.createElement("img");
  n.setAttribute("class", "flottform-qr-code"), n.setAttribute("src", o);
  const t = document.createElement("div");
  return t.setAttribute("class", "flottform-link-offer"), t.innerText = r, {
    createChannelQrCode: n,
    createChannelLinkWithOffer: t
  };
}, En = ({
  flottformAnchorElement: o,
  flottformRootElement: r,
  additionalComponentClass: n,
  flottformRootTitle: t,
  flottformRootDescription: e
}) => {
  const i = r ?? document.querySelector(".flottform-root") ?? Ze(t, e, n), s = i.querySelector(".flottform-elements-container"), a = i.querySelector(
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
      onErrorText: F,
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
        onErrorText: F
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
      onErrorText: F,
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
        onErrorText: F
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
  label: n,
  buttonLabel: t,
  onErrorText: e
}) => {
  const i = rn(r);
  hn({ label: n, flottformItem: i });
  const s = sn(), a = cn(t);
  a.addEventListener("click", () => o.start());
  const c = an(a);
  i.appendChild(c);
  const l = ln();
  return l.addEventListener("click", () => o.start()), o.on("endpoint-created", ({ link: h, qrCode: f }) => {
    const { createChannelQrCode: g, createChannelLinkWithOffer: d } = Xe(f, h), A = fn();
    c.replaceChildren(g);
    const F = document.createElement("div");
    F.setAttribute("class", "flottform-copy-button-link-wrapper"), F.appendChild(A), F.appendChild(d), c.appendChild(F);
  }), o.on("connected", () => {
    s.innerHTML = "Connected", s.appendChild(l), c.replaceChildren(s);
  }), o.on("error", (h) => {
    s.innerHTML = typeof e == "function" ? e(h) : e ?? `🚨 An error occured (${h.message}). Please try again`, a.innerText = "Retry", c.replaceChildren(s), c.appendChild(a);
  }), { flottformItem: i, statusInformation: s, refreshChannelButton: l, flottformStateItemsContainer: c };
}, tn = ({
  flottformItem: o,
  statusInformation: r,
  refreshChannelButton: n,
  flottformStateItemsContainer: t,
  flottformFileInputHost: e,
  id: i,
  onSuccessText: s
}) => {
  i && o.setAttribute("id", i), e.on(
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
  ), e.on("done", () => {
    r.innerHTML = s ?? "✨ You have succesfully downloaded all your files.", r.appendChild(n), t.replaceChildren(r);
  });
}, en = ({
  flottformItem: o,
  statusInformation: r,
  refreshChannelButton: n,
  flottformTextInputHost: t,
  id: e,
  onSuccessText: i
}) => {
  e && o.setAttribute("id", e), t.on("done", (s) => {
    if (r.innerHTML = i ?? "✨ You have succesfully submitted your message", r.appendChild(n), o.replaceChildren(r), inputField) {
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
  const n = document.createElement("div");
  if (n.setAttribute("class", "flottform-elements-container-wrapper"), o !== "") {
    const e = document.createElement("div");
    e.setAttribute("class", "flottform-root-description"), e.innerText = o ?? "This form is powered by Flottform. Need to add details from another device? Simply click a button below to generate a QR code or link, and easily upload information from your other device.", r.appendChild(e);
  }
  const t = document.createElement("ul");
  return t.setAttribute("class", "flottform-inputs-list"), r.appendChild(t), n.appendChild(r), n;
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
  const n = document.createElement("p"), t = o ?? `File input ${un++}`;
  t && (n.innerHTML = t, r.appendChild(n));
}, fn = () => {
  const o = document.createElement("button");
  return o.setAttribute("class", "flottform-copy-to-clipboard"), o.setAttribute("type", "button"), o.setAttribute("title", "Copy Flottform link to clipboard"), o.setAttribute("aria-label", "Copy Flottform link to clipboard"), o.innerText = "📋", o.addEventListener("click", async () => {
    const r = document.querySelector(".flottform-link-offer").innerText;
    navigator.clipboard.writeText(r).then(() => {
      o.innerText = "✅", setTimeout(() => {
        o.innerText = "📋";
      }, 1e3);
    }).catch((n) => {
      o.innerText = `❌ Failed to copy: ${n}`, setTimeout(() => {
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
    const n = document.createElement("summary");
    n.innerText = "Details", r.appendChild(n);
    const t = document.createElement("div");
    t.classList.add("details-container"), r.appendChild(t), o.appendChild(r);
  }
  return r;
}, pn = (o, r) => {
  const n = document.createElement("label");
  n.setAttribute("id", `flottform-status-bar-${o}`), n.classList.add("flottform-progress-bar-label"), n.innerText = `File ${r} progress:`;
  const t = document.createElement("progress");
  return t.setAttribute("id", `flottform-status-bar-${o}`), t.classList.add("flottform-status-bar"), t.setAttribute("max", "100"), t.setAttribute("value", "0"), { currentFileLabel: n, progressBar: t };
}, mn = (o, r, n, t, e) => {
  let i = e.querySelector(
    `progress#flottform-status-bar-${o}`
  );
  if (!i) {
    const { currentFileLabel: s, progressBar: a } = pn(o, r);
    i = a;
    const c = t.querySelector(".details-container");
    c.appendChild(s), c.appendChild(i);
  }
  i.value = n * 100, i.innerText = `${n * 100}%`;
}, Cn = () => {
  const o = document.createElement("label");
  o.setAttribute("id", "flottform-status-bar-overall-progress"), o.classList.add("flottform-progress-bar-label"), o.innerText = "Receiving Files Progress";
  const r = document.createElement("progress");
  return r.setAttribute("id", "flottform-status-bar-overall-progress"), r.classList.add("flottform-status-bar"), r.setAttribute("max", "100"), r.setAttribute("value", "0"), { overallFilesLabel: o, progressBar: r };
}, yn = (o, r, n, t) => {
  let e = o.querySelector("progress#flottform-status-bar-overall-progress");
  if (!e) {
    const { overallFilesLabel: s, progressBar: a } = Cn();
    e = a, o.appendChild(s), o.appendChild(e);
  }
  const i = o.querySelector(
    "label#flottform-status-bar-overall-progress"
  );
  e.value = r * 100, e.innerText = `${r * 100}%`, i.innerText = `Receiving file ${n + 1} of ${t}`;
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
