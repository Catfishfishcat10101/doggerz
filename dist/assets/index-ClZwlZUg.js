const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "assets/Landing-ut81j_EI.js",
      "assets/settings-BW652Eiz.js",
      "assets/dogSlice-VptOyUWJ.js",
      "assets/Game-DWmq8r5b.js",
      "assets/Potty-J2lfuw4P.js",
    ]),
) => i.map((i) => d[i]);
(function () {
  const e = document.createElement("link").relList;
  if (e && e.supports && e.supports("modulepreload")) return;
  for (const o of document.querySelectorAll('link[rel="modulepreload"]')) i(o);
  new MutationObserver((o) => {
    for (const a of o)
      if (a.type === "childList")
        for (const u of a.addedNodes)
          u.tagName === "LINK" && u.rel === "modulepreload" && i(u);
  }).observe(document, { childList: !0, subtree: !0 });
  function t(o) {
    const a = {};
    return (
      o.integrity && (a.integrity = o.integrity),
      o.referrerPolicy && (a.referrerPolicy = o.referrerPolicy),
      o.crossOrigin === "use-credentials"
        ? (a.credentials = "include")
        : o.crossOrigin === "anonymous"
          ? (a.credentials = "omit")
          : (a.credentials = "same-origin"),
      a
    );
  }
  function i(o) {
    if (o.ep) return;
    o.ep = !0;
    const a = t(o);
    fetch(o.href, a);
  }
})();
function Zp(n) {
  return n && n.__esModule && Object.prototype.hasOwnProperty.call(n, "default")
    ? n.default
    : n;
}
var Lf = { exports: {} },
  Il = {},
  Mf = { exports: {} },
  Ke = {};
var gv;
function wI() {
  if (gv) return Ke;
  gv = 1;
  var n = Symbol.for("react.element"),
    e = Symbol.for("react.portal"),
    t = Symbol.for("react.fragment"),
    i = Symbol.for("react.strict_mode"),
    o = Symbol.for("react.profiler"),
    a = Symbol.for("react.provider"),
    u = Symbol.for("react.context"),
    d = Symbol.for("react.forward_ref"),
    f = Symbol.for("react.suspense"),
    m = Symbol.for("react.memo"),
    v = Symbol.for("react.lazy"),
    w = Symbol.iterator;
  function T(V) {
    return V === null || typeof V != "object"
      ? null
      : ((V = (w && V[w]) || V["@@iterator"]),
        typeof V == "function" ? V : null);
  }
  var A = {
      isMounted: function () {
        return !1;
      },
      enqueueForceUpdate: function () {},
      enqueueReplaceState: function () {},
      enqueueSetState: function () {},
    },
    D = Object.assign,
    j = {};
  function O(V, J, ye) {
    ((this.props = V),
      (this.context = J),
      (this.refs = j),
      (this.updater = ye || A));
  }
  ((O.prototype.isReactComponent = {}),
    (O.prototype.setState = function (V, J) {
      if (typeof V != "object" && typeof V != "function" && V != null)
        throw Error(
          "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
        );
      this.updater.enqueueSetState(this, V, J, "setState");
    }),
    (O.prototype.forceUpdate = function (V) {
      this.updater.enqueueForceUpdate(this, V, "forceUpdate");
    }));
  function X() {}
  X.prototype = O.prototype;
  function q(V, J, ye) {
    ((this.props = V),
      (this.context = J),
      (this.refs = j),
      (this.updater = ye || A));
  }
  var G = (q.prototype = new X());
  ((G.constructor = q), D(G, O.prototype), (G.isPureReactComponent = !0));
  var ae = Array.isArray,
    ee = Object.prototype.hasOwnProperty,
    he = { current: null },
    S = { key: !0, ref: !0, __self: !0, __source: !0 };
  function R(V, J, ye) {
    var Ne,
      Fe = {},
      We = null,
      Ge = null;
    if (J != null)
      for (Ne in (J.ref !== void 0 && (Ge = J.ref),
      J.key !== void 0 && (We = "" + J.key),
      J))
        ee.call(J, Ne) && !S.hasOwnProperty(Ne) && (Fe[Ne] = J[Ne]);
    var tt = arguments.length - 2;
    if (tt === 1) Fe.children = ye;
    else if (1 < tt) {
      for (var dt = Array(tt), Lt = 0; Lt < tt; Lt++)
        dt[Lt] = arguments[Lt + 2];
      Fe.children = dt;
    }
    if (V && V.defaultProps)
      for (Ne in ((tt = V.defaultProps), tt))
        Fe[Ne] === void 0 && (Fe[Ne] = tt[Ne]);
    return {
      $$typeof: n,
      type: V,
      key: We,
      ref: Ge,
      props: Fe,
      _owner: he.current,
    };
  }
  function C(V, J) {
    return {
      $$typeof: n,
      type: V.type,
      key: J,
      ref: V.ref,
      props: V.props,
      _owner: V._owner,
    };
  }
  function x(V) {
    return typeof V == "object" && V !== null && V.$$typeof === n;
  }
  function L(V) {
    var J = { "=": "=0", ":": "=2" };
    return (
      "$" +
      V.replace(/[=:]/g, function (ye) {
        return J[ye];
      })
    );
  }
  var U = /\/+/g;
  function k(V, J) {
    return typeof V == "object" && V !== null && V.key != null
      ? L("" + V.key)
      : J.toString(36);
  }
  function Oe(V, J, ye, Ne, Fe) {
    var We = typeof V;
    (We === "undefined" || We === "boolean") && (V = null);
    var Ge = !1;
    if (V === null) Ge = !0;
    else
      switch (We) {
        case "string":
        case "number":
          Ge = !0;
          break;
        case "object":
          switch (V.$$typeof) {
            case n:
            case e:
              Ge = !0;
          }
      }
    if (Ge)
      return (
        (Ge = V),
        (Fe = Fe(Ge)),
        (V = Ne === "" ? "." + k(Ge, 0) : Ne),
        ae(Fe)
          ? ((ye = ""),
            V != null && (ye = V.replace(U, "$&/") + "/"),
            Oe(Fe, J, ye, "", function (Lt) {
              return Lt;
            }))
          : Fe != null &&
            (x(Fe) &&
              (Fe = C(
                Fe,
                ye +
                  (!Fe.key || (Ge && Ge.key === Fe.key)
                    ? ""
                    : ("" + Fe.key).replace(U, "$&/") + "/") +
                  V,
              )),
            J.push(Fe)),
        1
      );
    if (((Ge = 0), (Ne = Ne === "" ? "." : Ne + ":"), ae(V)))
      for (var tt = 0; tt < V.length; tt++) {
        We = V[tt];
        var dt = Ne + k(We, tt);
        Ge += Oe(We, J, ye, dt, Fe);
      }
    else if (((dt = T(V)), typeof dt == "function"))
      for (V = dt.call(V), tt = 0; !(We = V.next()).done; )
        ((We = We.value),
          (dt = Ne + k(We, tt++)),
          (Ge += Oe(We, J, ye, dt, Fe)));
    else if (We === "object")
      throw (
        (J = String(V)),
        Error(
          "Objects are not valid as a React child (found: " +
            (J === "[object Object]"
              ? "object with keys {" + Object.keys(V).join(", ") + "}"
              : J) +
            "). If you meant to render a collection of children, use an array instead.",
        )
      );
    return Ge;
  }
  function He(V, J, ye) {
    if (V == null) return V;
    var Ne = [],
      Fe = 0;
    return (
      Oe(V, Ne, "", "", function (We) {
        return J.call(ye, We, Fe++);
      }),
      Ne
    );
  }
  function lt(V) {
    if (V._status === -1) {
      var J = V._result;
      ((J = J()),
        J.then(
          function (ye) {
            (V._status === 0 || V._status === -1) &&
              ((V._status = 1), (V._result = ye));
          },
          function (ye) {
            (V._status === 0 || V._status === -1) &&
              ((V._status = 2), (V._result = ye));
          },
        ),
        V._status === -1 && ((V._status = 0), (V._result = J)));
    }
    if (V._status === 1) return V._result.default;
    throw V._result;
  }
  var Ce = { current: null },
    oe = { transition: null },
    me = {
      ReactCurrentDispatcher: Ce,
      ReactCurrentBatchConfig: oe,
      ReactCurrentOwner: he,
    };
  function de() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return (
    (Ke.Children = {
      map: He,
      forEach: function (V, J, ye) {
        He(
          V,
          function () {
            J.apply(this, arguments);
          },
          ye,
        );
      },
      count: function (V) {
        var J = 0;
        return (
          He(V, function () {
            J++;
          }),
          J
        );
      },
      toArray: function (V) {
        return (
          He(V, function (J) {
            return J;
          }) || []
        );
      },
      only: function (V) {
        if (!x(V))
          throw Error(
            "React.Children.only expected to receive a single React element child.",
          );
        return V;
      },
    }),
    (Ke.Component = O),
    (Ke.Fragment = t),
    (Ke.Profiler = o),
    (Ke.PureComponent = q),
    (Ke.StrictMode = i),
    (Ke.Suspense = f),
    (Ke.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = me),
    (Ke.act = de),
    (Ke.cloneElement = function (V, J, ye) {
      if (V == null)
        throw Error(
          "React.cloneElement(...): The argument must be a React element, but you passed " +
            V +
            ".",
        );
      var Ne = D({}, V.props),
        Fe = V.key,
        We = V.ref,
        Ge = V._owner;
      if (J != null) {
        if (
          (J.ref !== void 0 && ((We = J.ref), (Ge = he.current)),
          J.key !== void 0 && (Fe = "" + J.key),
          V.type && V.type.defaultProps)
        )
          var tt = V.type.defaultProps;
        for (dt in J)
          ee.call(J, dt) &&
            !S.hasOwnProperty(dt) &&
            (Ne[dt] = J[dt] === void 0 && tt !== void 0 ? tt[dt] : J[dt]);
      }
      var dt = arguments.length - 2;
      if (dt === 1) Ne.children = ye;
      else if (1 < dt) {
        tt = Array(dt);
        for (var Lt = 0; Lt < dt; Lt++) tt[Lt] = arguments[Lt + 2];
        Ne.children = tt;
      }
      return {
        $$typeof: n,
        type: V.type,
        key: Fe,
        ref: We,
        props: Ne,
        _owner: Ge,
      };
    }),
    (Ke.createContext = function (V) {
      return (
        (V = {
          $$typeof: u,
          _currentValue: V,
          _currentValue2: V,
          _threadCount: 0,
          Provider: null,
          Consumer: null,
          _defaultValue: null,
          _globalName: null,
        }),
        (V.Provider = { $$typeof: a, _context: V }),
        (V.Consumer = V)
      );
    }),
    (Ke.createElement = R),
    (Ke.createFactory = function (V) {
      var J = R.bind(null, V);
      return ((J.type = V), J);
    }),
    (Ke.createRef = function () {
      return { current: null };
    }),
    (Ke.forwardRef = function (V) {
      return { $$typeof: d, render: V };
    }),
    (Ke.isValidElement = x),
    (Ke.lazy = function (V) {
      return { $$typeof: v, _payload: { _status: -1, _result: V }, _init: lt };
    }),
    (Ke.memo = function (V, J) {
      return { $$typeof: m, type: V, compare: J === void 0 ? null : J };
    }),
    (Ke.startTransition = function (V) {
      var J = oe.transition;
      oe.transition = {};
      try {
        V();
      } finally {
        oe.transition = J;
      }
    }),
    (Ke.unstable_act = de),
    (Ke.useCallback = function (V, J) {
      return Ce.current.useCallback(V, J);
    }),
    (Ke.useContext = function (V) {
      return Ce.current.useContext(V);
    }),
    (Ke.useDebugValue = function () {}),
    (Ke.useDeferredValue = function (V) {
      return Ce.current.useDeferredValue(V);
    }),
    (Ke.useEffect = function (V, J) {
      return Ce.current.useEffect(V, J);
    }),
    (Ke.useId = function () {
      return Ce.current.useId();
    }),
    (Ke.useImperativeHandle = function (V, J, ye) {
      return Ce.current.useImperativeHandle(V, J, ye);
    }),
    (Ke.useInsertionEffect = function (V, J) {
      return Ce.current.useInsertionEffect(V, J);
    }),
    (Ke.useLayoutEffect = function (V, J) {
      return Ce.current.useLayoutEffect(V, J);
    }),
    (Ke.useMemo = function (V, J) {
      return Ce.current.useMemo(V, J);
    }),
    (Ke.useReducer = function (V, J, ye) {
      return Ce.current.useReducer(V, J, ye);
    }),
    (Ke.useRef = function (V) {
      return Ce.current.useRef(V);
    }),
    (Ke.useState = function (V) {
      return Ce.current.useState(V);
    }),
    (Ke.useSyncExternalStore = function (V, J, ye) {
      return Ce.current.useSyncExternalStore(V, J, ye);
    }),
    (Ke.useTransition = function () {
      return Ce.current.useTransition();
    }),
    (Ke.version = "18.3.1"),
    Ke
  );
}
var yv;
function Lh() {
  return (yv || ((yv = 1), (Mf.exports = wI())), Mf.exports);
}
var vv;
function EI() {
  if (vv) return Il;
  vv = 1;
  var n = Lh(),
    e = Symbol.for("react.element"),
    t = Symbol.for("react.fragment"),
    i = Object.prototype.hasOwnProperty,
    o = n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
    a = { key: !0, ref: !0, __self: !0, __source: !0 };
  function u(d, f, m) {
    var v,
      w = {},
      T = null,
      A = null;
    (m !== void 0 && (T = "" + m),
      f.key !== void 0 && (T = "" + f.key),
      f.ref !== void 0 && (A = f.ref));
    for (v in f) i.call(f, v) && !a.hasOwnProperty(v) && (w[v] = f[v]);
    if (d && d.defaultProps)
      for (v in ((f = d.defaultProps), f)) w[v] === void 0 && (w[v] = f[v]);
    return {
      $$typeof: e,
      type: d,
      key: T,
      ref: A,
      props: w,
      _owner: o.current,
    };
  }
  return ((Il.Fragment = t), (Il.jsx = u), (Il.jsxs = u), Il);
}
var _v;
function TI() {
  return (_v || ((_v = 1), (Lf.exports = EI())), Lf.exports);
}
var Y = TI(),
  z = Lh();
const SI = Zp(z);
var W0 = (n) => {
    throw TypeError(n);
  },
  II = (n, e, t) => e.has(n) || W0("Cannot " + t),
  Vf = (n, e, t) => (
    II(n, e, "read from private field"),
    t ? t.call(n) : e.get(n)
  ),
  RI = (n, e, t) =>
    e.has(n)
      ? W0("Cannot add the same private member more than once")
      : e instanceof WeakSet
        ? e.add(n)
        : e.set(n, t),
  wv = "popstate";
function AI(n = {}) {
  function e(i, o) {
    let { pathname: a, search: u, hash: d } = i.location;
    return ql(
      "",
      { pathname: a, search: u, hash: d },
      (o.state && o.state.usr) || null,
      (o.state && o.state.key) || "default",
    );
  }
  function t(i, o) {
    return typeof o == "string" ? o : si(o);
  }
  return PI(e, t, null, n);
}
function Be(n, e) {
  if (n === !1 || n === null || typeof n > "u") throw new Error(e);
}
function Dt(n, e) {
  if (!n) {
    typeof console < "u" && console.warn(e);
    try {
      throw new Error(e);
    } catch {}
  }
}
function CI() {
  return Math.random().toString(36).substring(2, 10);
}
function Ev(n, e) {
  return { usr: n.state, key: n.key, idx: e };
}
function ql(n, e, t = null, i) {
  return {
    pathname: typeof n == "string" ? n : n.pathname,
    search: "",
    hash: "",
    ...(typeof e == "string" ? Wi(e) : e),
    state: t,
    key: (e && e.key) || i || CI(),
  };
}
function si({ pathname: n = "/", search: e = "", hash: t = "" }) {
  return (
    e && e !== "?" && (n += e.charAt(0) === "?" ? e : "?" + e),
    t && t !== "#" && (n += t.charAt(0) === "#" ? t : "#" + t),
    n
  );
}
function Wi(n) {
  let e = {};
  if (n) {
    let t = n.indexOf("#");
    t >= 0 && ((e.hash = n.substring(t)), (n = n.substring(0, t)));
    let i = n.indexOf("?");
    (i >= 0 && ((e.search = n.substring(i)), (n = n.substring(0, i))),
      n && (e.pathname = n));
  }
  return e;
}
function PI(n, e, t, i = {}) {
  let { window: o = document.defaultView, v5Compat: a = !1 } = i,
    u = o.history,
    d = "POP",
    f = null,
    m = v();
  m == null && ((m = 0), u.replaceState({ ...u.state, idx: m }, ""));
  function v() {
    return (u.state || { idx: null }).idx;
  }
  function w() {
    d = "POP";
    let O = v(),
      X = O == null ? null : O - m;
    ((m = O), f && f({ action: d, location: j.location, delta: X }));
  }
  function T(O, X) {
    d = "PUSH";
    let q = ql(j.location, O, X);
    m = v() + 1;
    let G = Ev(q, m),
      ae = j.createHref(q);
    try {
      u.pushState(G, "", ae);
    } catch (ee) {
      if (ee instanceof DOMException && ee.name === "DataCloneError") throw ee;
      o.location.assign(ae);
    }
    a && f && f({ action: d, location: j.location, delta: 1 });
  }
  function A(O, X) {
    d = "REPLACE";
    let q = ql(j.location, O, X);
    m = v();
    let G = Ev(q, m),
      ae = j.createHref(q);
    (u.replaceState(G, "", ae),
      a && f && f({ action: d, location: j.location, delta: 0 }));
  }
  function D(O) {
    return q0(O);
  }
  let j = {
    get action() {
      return d;
    },
    get location() {
      return n(o, u);
    },
    listen(O) {
      if (f) throw new Error("A history only accepts one active listener");
      return (
        o.addEventListener(wv, w),
        (f = O),
        () => {
          (o.removeEventListener(wv, w), (f = null));
        }
      );
    },
    createHref(O) {
      return e(o, O);
    },
    createURL: D,
    encodeLocation(O) {
      let X = D(O);
      return { pathname: X.pathname, search: X.search, hash: X.hash };
    },
    push: T,
    replace: A,
    go(O) {
      return u.go(O);
    },
  };
  return j;
}
function q0(n, e = !1) {
  let t = "http://localhost";
  (typeof window < "u" &&
    (t =
      window.location.origin !== "null"
        ? window.location.origin
        : window.location.href),
    Be(t, "No window.location.(origin|href) available to create URL"));
  let i = typeof n == "string" ? n : si(n);
  return (
    (i = i.replace(/ $/, "%20")),
    !e && i.startsWith("//") && (i = t + i),
    new URL(i, t)
  );
}
var xl,
  Tv = class {
    constructor(n) {
      if ((RI(this, xl, new Map()), n)) for (let [e, t] of n) this.set(e, t);
    }
    get(n) {
      if (Vf(this, xl).has(n)) return Vf(this, xl).get(n);
      if (n.defaultValue !== void 0) return n.defaultValue;
      throw new Error("No value found for context");
    }
    set(n, e) {
      Vf(this, xl).set(n, e);
    }
  };
xl = new WeakMap();
var kI = new Set(["lazy", "caseSensitive", "path", "id", "index", "children"]);
function xI(n) {
  return kI.has(n);
}
var bI = new Set([
  "lazy",
  "caseSensitive",
  "path",
  "id",
  "index",
  "middleware",
  "children",
]);
function DI(n) {
  return bI.has(n);
}
function NI(n) {
  return n.index === !0;
}
function Kl(n, e, t = [], i = {}, o = !1) {
  return n.map((a, u) => {
    let d = [...t, String(u)],
      f = typeof a.id == "string" ? a.id : d.join("-");
    if (
      (Be(
        a.index !== !0 || !a.children,
        "Cannot specify children on an index route",
      ),
      Be(
        o || !i[f],
        `Found a route id collision on id "${f}".  Route id's must be globally unique within Data Router usages`,
      ),
      NI(a))
    ) {
      let m = { ...a, id: f };
      return ((i[f] = Sv(m, e(m))), m);
    } else {
      let m = { ...a, id: f, children: void 0 };
      return (
        (i[f] = Sv(m, e(m))),
        a.children && (m.children = Kl(a.children, e, d, i, o)),
        m
      );
    }
  });
}
function Sv(n, e) {
  return Object.assign(n, {
    ...e,
    ...(typeof e.lazy == "object" && e.lazy != null
      ? { lazy: { ...n.lazy, ...e.lazy } }
      : {}),
  });
}
function Cs(n, e, t = "/") {
  return bl(n, e, t, !1);
}
function bl(n, e, t, i) {
  let o = typeof e == "string" ? Wi(e) : e,
    a = hr(o.pathname || "/", t);
  if (a == null) return null;
  let u = K0(n);
  LI(u);
  let d = null;
  for (let f = 0; d == null && f < u.length; ++f) {
    let m = qI(a);
    d = HI(u[f], m, i);
  }
  return d;
}
function OI(n, e) {
  let { route: t, pathname: i, params: o } = n;
  return {
    id: t.id,
    pathname: i,
    params: o,
    data: e[t.id],
    loaderData: e[t.id],
    handle: t.handle,
  };
}
function K0(n, e = [], t = [], i = "", o = !1) {
  let a = (u, d, f = o, m) => {
    let v = {
      relativePath: m === void 0 ? u.path || "" : m,
      caseSensitive: u.caseSensitive === !0,
      childrenIndex: d,
      route: u,
    };
    if (v.relativePath.startsWith("/")) {
      if (!v.relativePath.startsWith(i) && f) return;
      (Be(
        v.relativePath.startsWith(i),
        `Absolute route path "${v.relativePath}" nested under path "${i}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`,
      ),
        (v.relativePath = v.relativePath.slice(i.length)));
    }
    let w = Jr([i, v.relativePath]),
      T = t.concat(v);
    (u.children &&
      u.children.length > 0 &&
      (Be(
        u.index !== !0,
        `Index routes must not have child routes. Please remove all child routes from route path "${w}".`,
      ),
      K0(u.children, e, T, w, f)),
      !(u.path == null && !u.index) &&
        e.push({ path: w, score: BI(w, u.index), routesMeta: T }));
  };
  return (
    n.forEach((u, d) => {
      if (u.path === "" || !u.path?.includes("?")) a(u, d);
      else for (let f of G0(u.path)) a(u, d, !0, f);
    }),
    e
  );
}
function G0(n) {
  let e = n.split("/");
  if (e.length === 0) return [];
  let [t, ...i] = e,
    o = t.endsWith("?"),
    a = t.replace(/\?$/, "");
  if (i.length === 0) return o ? [a, ""] : [a];
  let u = G0(i.join("/")),
    d = [];
  return (
    d.push(...u.map((f) => (f === "" ? a : [a, f].join("/")))),
    o && d.push(...u),
    d.map((f) => (n.startsWith("/") && f === "" ? "/" : f))
  );
}
function LI(n) {
  n.sort((e, t) =>
    e.score !== t.score
      ? t.score - e.score
      : $I(
          e.routesMeta.map((i) => i.childrenIndex),
          t.routesMeta.map((i) => i.childrenIndex),
        ),
  );
}
var MI = /^:[\w-]+$/,
  VI = 3,
  FI = 2,
  UI = 1,
  zI = 10,
  jI = -2,
  Iv = (n) => n === "*";
function BI(n, e) {
  let t = n.split("/"),
    i = t.length;
  return (
    t.some(Iv) && (i += jI),
    e && (i += FI),
    t
      .filter((o) => !Iv(o))
      .reduce((o, a) => o + (MI.test(a) ? VI : a === "" ? UI : zI), i)
  );
}
function $I(n, e) {
  return n.length === e.length && n.slice(0, -1).every((i, o) => i === e[o])
    ? n[n.length - 1] - e[e.length - 1]
    : 0;
}
function HI(n, e, t = !1) {
  let { routesMeta: i } = n,
    o = {},
    a = "/",
    u = [];
  for (let d = 0; d < i.length; ++d) {
    let f = i[d],
      m = d === i.length - 1,
      v = a === "/" ? e : e.slice(a.length) || "/",
      w = oh(
        { path: f.relativePath, caseSensitive: f.caseSensitive, end: m },
        v,
      ),
      T = f.route;
    if (
      (!w &&
        m &&
        t &&
        !i[i.length - 1].route.index &&
        (w = oh(
          { path: f.relativePath, caseSensitive: f.caseSensitive, end: !1 },
          v,
        )),
      !w)
    )
      return null;
    (Object.assign(o, w.params),
      u.push({
        params: o,
        pathname: Jr([a, w.pathname]),
        pathnameBase: YI(Jr([a, w.pathnameBase])),
        route: T,
      }),
      w.pathnameBase !== "/" && (a = Jr([a, w.pathnameBase])));
  }
  return u;
}
function oh(n, e) {
  typeof n == "string" && (n = { path: n, caseSensitive: !1, end: !0 });
  let [t, i] = WI(n.path, n.caseSensitive, n.end),
    o = e.match(t);
  if (!o) return null;
  let a = o[0],
    u = a.replace(/(.)\/+$/, "$1"),
    d = o.slice(1);
  return {
    params: i.reduce((m, { paramName: v, isOptional: w }, T) => {
      if (v === "*") {
        let D = d[T] || "";
        u = a.slice(0, a.length - D.length).replace(/(.)\/+$/, "$1");
      }
      const A = d[T];
      return (
        w && !A ? (m[v] = void 0) : (m[v] = (A || "").replace(/%2F/g, "/")),
        m
      );
    }, {}),
    pathname: a,
    pathnameBase: u,
    pattern: n,
  };
}
function WI(n, e = !1, t = !0) {
  Dt(
    n === "*" || !n.endsWith("*") || n.endsWith("/*"),
    `Route path "${n}" will be treated as if it were "${n.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${n.replace(/\*$/, "/*")}".`,
  );
  let i = [],
    o =
      "^" +
      n
        .replace(/\/*\*?$/, "")
        .replace(/^\/*/, "/")
        .replace(/[\\.*+^${}|()[\]]/g, "\\$&")
        .replace(
          /\/:([\w-]+)(\?)?/g,
          (u, d, f) => (
            i.push({ paramName: d, isOptional: f != null }),
            f ? "/?([^\\/]+)?" : "/([^\\/]+)"
          ),
        )
        .replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
  return (
    n.endsWith("*")
      ? (i.push({ paramName: "*" }),
        (o += n === "*" || n === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$"))
      : t
        ? (o += "\\/*$")
        : n !== "" && n !== "/" && (o += "(?:(?=\\/|$))"),
    [new RegExp(o, e ? void 0 : "i"), i]
  );
}
function qI(n) {
  try {
    return n
      .split("/")
      .map((e) => decodeURIComponent(e).replace(/\//g, "%2F"))
      .join("/");
  } catch (e) {
    return (
      Dt(
        !1,
        `The URL path "${n}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${e}).`,
      ),
      n
    );
  }
}
function hr(n, e) {
  if (e === "/") return n;
  if (!n.toLowerCase().startsWith(e.toLowerCase())) return null;
  let t = e.endsWith("/") ? e.length - 1 : e.length,
    i = n.charAt(t);
  return i && i !== "/" ? null : n.slice(t) || "/";
}
function KI({ basename: n, pathname: e }) {
  return e === "/" ? n : Jr([n, e]);
}
var GI = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  Mh = (n) => GI.test(n);
function QI(n, e = "/") {
  let {
      pathname: t,
      search: i = "",
      hash: o = "",
    } = typeof n == "string" ? Wi(n) : n,
    a;
  if (t)
    if (Mh(t)) a = t;
    else {
      if (t.includes("//")) {
        let u = t;
        ((t = t.replace(/\/\/+/g, "/")),
          Dt(
            !1,
            `Pathnames cannot have embedded double slashes - normalizing ${u} -> ${t}`,
          ));
      }
      t.startsWith("/") ? (a = Rv(t.substring(1), "/")) : (a = Rv(t, e));
    }
  else a = e;
  return { pathname: a, search: XI(i), hash: JI(o) };
}
function Rv(n, e) {
  let t = e.replace(/\/+$/, "").split("/");
  return (
    n.split("/").forEach((o) => {
      o === ".." ? t.length > 1 && t.pop() : o !== "." && t.push(o);
    }),
    t.length > 1 ? t.join("/") : "/"
  );
}
function Ff(n, e, t, i) {
  return `Cannot include a '${n}' character in a manually specified \`to.${e}\` field [${JSON.stringify(i)}].  Please separate it out to the \`to.${t}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`;
}
function Q0(n) {
  return n.filter(
    (e, t) => t === 0 || (e.route.path && e.route.path.length > 0),
  );
}
function Vh(n) {
  let e = Q0(n);
  return e.map((t, i) => (i === e.length - 1 ? t.pathname : t.pathnameBase));
}
function Fh(n, e, t, i = !1) {
  let o;
  typeof n == "string"
    ? (o = Wi(n))
    : ((o = { ...n }),
      Be(
        !o.pathname || !o.pathname.includes("?"),
        Ff("?", "pathname", "search", o),
      ),
      Be(
        !o.pathname || !o.pathname.includes("#"),
        Ff("#", "pathname", "hash", o),
      ),
      Be(!o.search || !o.search.includes("#"), Ff("#", "search", "hash", o)));
  let a = n === "" || o.pathname === "",
    u = a ? "/" : o.pathname,
    d;
  if (u == null) d = t;
  else {
    let w = e.length - 1;
    if (!i && u.startsWith("..")) {
      let T = u.split("/");
      for (; T[0] === ".."; ) (T.shift(), (w -= 1));
      o.pathname = T.join("/");
    }
    d = w >= 0 ? e[w] : "/";
  }
  let f = QI(o, d),
    m = u && u !== "/" && u.endsWith("/"),
    v = (a || u === ".") && t.endsWith("/");
  return (!f.pathname.endsWith("/") && (m || v) && (f.pathname += "/"), f);
}
var Jr = (n) => n.join("/").replace(/\/\/+/g, "/"),
  YI = (n) => n.replace(/\/+$/, "").replace(/^\/*/, "/"),
  XI = (n) => (!n || n === "?" ? "" : n.startsWith("?") ? n : "?" + n),
  JI = (n) => (!n || n === "#" ? "" : n.startsWith("#") ? n : "#" + n),
  ah = class {
    constructor(n, e, t, i = !1) {
      ((this.status = n),
        (this.statusText = e || ""),
        (this.internal = i),
        t instanceof Error
          ? ((this.data = t.toString()), (this.error = t))
          : (this.data = t));
    }
  };
function Gl(n) {
  return (
    n != null &&
    typeof n.status == "number" &&
    typeof n.statusText == "string" &&
    typeof n.internal == "boolean" &&
    "data" in n
  );
}
function em(n) {
  return n.filter(Boolean).join("/").replace(/\/\/*/g, "/") || "/";
}
var Ds = Symbol("Uninstrumented");
function ZI(n, e) {
  let t = {
    lazy: [],
    "lazy.loader": [],
    "lazy.action": [],
    "lazy.middleware": [],
    middleware: [],
    loader: [],
    action: [],
  };
  n.forEach((o) =>
    o({
      id: e.id,
      index: e.index,
      path: e.path,
      instrument(a) {
        let u = Object.keys(t);
        for (let d of u) a[d] && t[d].push(a[d]);
      },
    }),
  );
  let i = {};
  if (typeof e.lazy == "function" && t.lazy.length > 0) {
    let o = Ia(t.lazy, e.lazy, () => {});
    o && (i.lazy = o);
  }
  if (typeof e.lazy == "object") {
    let o = e.lazy;
    ["middleware", "loader", "action"].forEach((a) => {
      let u = o[a],
        d = t[`lazy.${a}`];
      if (typeof u == "function" && d.length > 0) {
        let f = Ia(d, u, () => {});
        f && (i.lazy = Object.assign(i.lazy || {}, { [a]: f }));
      }
    });
  }
  return (
    ["loader", "action"].forEach((o) => {
      let a = e[o];
      if (typeof a == "function" && t[o].length > 0) {
        let u = a[Ds] ?? a,
          d = Ia(t[o], u, (...f) => Av(f[0]));
        d && ((d[Ds] = u), (i[o] = d));
      }
    }),
    e.middleware &&
      e.middleware.length > 0 &&
      t.middleware.length > 0 &&
      (i.middleware = e.middleware.map((o) => {
        let a = o[Ds] ?? o,
          u = Ia(t.middleware, a, (...d) => Av(d[0]));
        return u ? ((u[Ds] = a), u) : o;
      })),
    i
  );
}
function e1(n, e) {
  let t = { navigate: [], fetch: [] };
  if (
    (e.forEach((i) =>
      i({
        instrument(o) {
          let a = Object.keys(o);
          for (let u of a) o[u] && t[u].push(o[u]);
        },
      }),
    ),
    t.navigate.length > 0)
  ) {
    let i = n.navigate[Ds] ?? n.navigate,
      o = Ia(t.navigate, i, (...a) => {
        let [u, d] = a;
        return {
          to:
            typeof u == "number" || typeof u == "string" ? u : u ? si(u) : ".",
          ...Cv(n, d ?? {}),
        };
      });
    o && ((o[Ds] = i), (n.navigate = o));
  }
  if (t.fetch.length > 0) {
    let i = n.fetch[Ds] ?? n.fetch,
      o = Ia(t.fetch, i, (...a) => {
        let [u, , d, f] = a;
        return { href: d ?? ".", fetcherKey: u, ...Cv(n, f ?? {}) };
      });
    o && ((o[Ds] = i), (n.fetch = o));
  }
  return n;
}
function Ia(n, e, t) {
  return n.length === 0
    ? null
    : async (...i) => {
        let o = await Y0(n, t(...i), () => e(...i), n.length - 1);
        if (o.type === "error") throw o.value;
        return o.value;
      };
}
async function Y0(n, e, t, i) {
  let o = n[i],
    a;
  if (o) {
    let u,
      d = async () => (
        u
          ? console.error(
              "You cannot call instrumented handlers more than once",
            )
          : (u = Y0(n, e, t, i - 1)),
        (a = await u),
        Be(a, "Expected a result"),
        a.type === "error" && a.value instanceof Error
          ? { status: "error", error: a.value }
          : { status: "success", error: void 0 }
      );
    try {
      await o(d, e);
    } catch (f) {
      console.error("An instrumentation function threw an error:", f);
    }
    (u || (await d()), await u);
  } else
    try {
      a = { type: "success", value: await t() };
    } catch (u) {
      a = { type: "error", value: u };
    }
  return (
    a || {
      type: "error",
      value: new Error("No result assigned in instrumentation chain."),
    }
  );
}
function Av(n) {
  let { request: e, context: t, params: i, unstable_pattern: o } = n;
  return {
    request: t1(e),
    params: { ...i },
    unstable_pattern: o,
    context: n1(t),
  };
}
function Cv(n, e) {
  return {
    currentUrl: si(n.state.location),
    ...("formMethod" in e ? { formMethod: e.formMethod } : {}),
    ...("formEncType" in e ? { formEncType: e.formEncType } : {}),
    ...("formData" in e ? { formData: e.formData } : {}),
    ...("body" in e ? { body: e.body } : {}),
  };
}
function t1(n) {
  return {
    method: n.method,
    url: n.url,
    headers: { get: (...e) => n.headers.get(...e) },
  };
}
function n1(n) {
  if (i1(n)) {
    let e = { ...n };
    return (Object.freeze(e), e);
  } else return { get: (e) => n.get(e) };
}
var r1 = Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function i1(n) {
  if (n === null || typeof n != "object") return !1;
  const e = Object.getPrototypeOf(n);
  return (
    e === Object.prototype ||
    e === null ||
    Object.getOwnPropertyNames(e).sort().join("\0") === r1
  );
}
var X0 = ["POST", "PUT", "PATCH", "DELETE"],
  s1 = new Set(X0),
  o1 = ["GET", ...X0],
  a1 = new Set(o1),
  l1 = new Set([301, 302, 303, 307, 308]),
  u1 = new Set([307, 308]),
  Uf = {
    state: "idle",
    location: void 0,
    formMethod: void 0,
    formAction: void 0,
    formEncType: void 0,
    formData: void 0,
    json: void 0,
    text: void 0,
  },
  c1 = {
    state: "idle",
    data: void 0,
    formMethod: void 0,
    formAction: void 0,
    formEncType: void 0,
    formData: void 0,
    json: void 0,
    text: void 0,
  },
  Rl = { state: "unblocked", proceed: void 0, reset: void 0, location: void 0 },
  h1 = (n) => ({ hasErrorBoundary: !!n.hasErrorBoundary }),
  J0 = "remix-router-transitions",
  Z0 = Symbol("ResetLoaderData");
function d1(n) {
  const e = n.window ? n.window : typeof window < "u" ? window : void 0,
    t =
      typeof e < "u" &&
      typeof e.document < "u" &&
      typeof e.document.createElement < "u";
  Be(
    n.routes.length > 0,
    "You must provide a non-empty routes array to createRouter",
  );
  let i = n.hydrationRouteProperties || [],
    o = n.mapRouteProperties || h1,
    a = o;
  if (n.unstable_instrumentations) {
    let b = n.unstable_instrumentations;
    a = (F) => ({ ...o(F), ...ZI(b.map((W) => W.route).filter(Boolean), F) });
  }
  let u = {},
    d = Kl(n.routes, a, void 0, u),
    f,
    m = n.basename || "/";
  m.startsWith("/") || (m = `/${m}`);
  let v = n.dataStrategy || y1,
    w = { ...n.future },
    T = null,
    A = new Set(),
    D = null,
    j = null,
    O = null,
    X = n.hydrationData != null,
    q = Cs(d, n.history.location, m),
    G = !1,
    ae = null,
    ee;
  if (q == null && !n.patchRoutesOnNavigation) {
    let b = lr(404, { pathname: n.history.location.pathname }),
      { matches: F, route: W } = xc(d);
    ((ee = !0), (q = F), (ae = { [W.id]: b }));
  } else if (
    (q &&
      !n.hydrationData &&
      Xn(q, d, n.history.location.pathname).active &&
      (q = null),
    q)
  )
    if (q.some((b) => b.route.lazy)) ee = !1;
    else if (!q.some((b) => tm(b.route))) ee = !0;
    else {
      let b = n.hydrationData ? n.hydrationData.loaderData : null,
        F = n.hydrationData ? n.hydrationData.errors : null;
      if (F) {
        let W = q.findIndex((ne) => F[ne.route.id] !== void 0);
        ee = q.slice(0, W + 1).every((ne) => !fp(ne.route, b, F));
      } else ee = q.every((W) => !fp(W.route, b, F));
    }
  else {
    ((ee = !1), (q = []));
    let b = Xn(null, d, n.history.location.pathname);
    b.active && b.matches && ((G = !0), (q = b.matches));
  }
  let he,
    S = {
      historyAction: n.history.action,
      location: n.history.location,
      matches: q,
      initialized: ee,
      navigation: Uf,
      restoreScrollPosition: n.hydrationData != null ? !1 : null,
      preventScrollReset: !1,
      revalidation: "idle",
      loaderData: (n.hydrationData && n.hydrationData.loaderData) || {},
      actionData: (n.hydrationData && n.hydrationData.actionData) || null,
      errors: (n.hydrationData && n.hydrationData.errors) || ae,
      fetchers: new Map(),
      blockers: new Map(),
    },
    R = "POP",
    C = !1,
    x,
    L = !1,
    U = new Map(),
    k = null,
    Oe = !1,
    He = !1,
    lt = new Set(),
    Ce = new Map(),
    oe = 0,
    me = -1,
    de = new Map(),
    V = new Set(),
    J = new Map(),
    ye = new Map(),
    Ne = new Set(),
    Fe = new Map(),
    We,
    Ge = null;
  function tt() {
    if (
      ((T = n.history.listen(({ action: b, location: F, delta: W }) => {
        if (We) {
          (We(), (We = void 0));
          return;
        }
        Dt(
          Fe.size === 0 || W != null,
          "You are trying to use a blocker on a POP navigation to a location that was not created by @remix-run/router. This will fail silently in production. This can happen if you are navigating outside the router via `window.history.pushState`/`window.location.hash` instead of using router navigation APIs.  This can also happen if you are using createHashRouter and the user manually changes the URL.",
        );
        let ne = fi({
          currentLocation: S.location,
          nextLocation: F,
          historyAction: b,
        });
        if (ne && W != null) {
          let ue = new Promise((ge) => {
            We = ge;
          });
          (n.history.go(W * -1),
            gr(ne, {
              state: "blocked",
              location: F,
              proceed() {
                (gr(ne, {
                  state: "proceeding",
                  proceed: void 0,
                  reset: void 0,
                  location: F,
                }),
                  ue.then(() => n.history.go(W)));
              },
              reset() {
                let ge = new Map(S.blockers);
                (ge.set(ne, Rl), mt({ blockers: ge }));
              },
            }));
          return;
        }
        return Rn(b, F);
      })),
      t)
    ) {
      D1(e, U);
      let b = () => N1(e, U);
      (e.addEventListener("pagehide", b),
        (k = () => e.removeEventListener("pagehide", b)));
    }
    return (
      S.initialized || Rn("POP", S.location, { initialHydration: !0 }),
      he
    );
  }
  function dt() {
    (T && T(),
      k && k(),
      A.clear(),
      x && x.abort(),
      S.fetchers.forEach((b, F) => mr(F)),
      S.blockers.forEach((b, F) => Mr(F)));
  }
  function Lt(b) {
    return (A.add(b), () => A.delete(b));
  }
  function mt(b, F = {}) {
    (b.matches &&
      (b.matches = b.matches.map((ue) => {
        let ge = u[ue.route.id],
          Se = ue.route;
        return Se.element !== ge.element ||
          Se.errorElement !== ge.errorElement ||
          Se.hydrateFallbackElement !== ge.hydrateFallbackElement
          ? { ...ue, route: ge }
          : ue;
      })),
      (S = { ...S, ...b }));
    let W = [],
      ne = [];
    (S.fetchers.forEach((ue, ge) => {
      ue.state === "idle" && (Ne.has(ge) ? W.push(ge) : ne.push(ge));
    }),
      Ne.forEach((ue) => {
        !S.fetchers.has(ue) && !Ce.has(ue) && W.push(ue);
      }),
      [...A].forEach((ue) =>
        ue(S, {
          deletedFetchers: W,
          viewTransitionOpts: F.viewTransitionOpts,
          flushSync: F.flushSync === !0,
        }),
      ),
      W.forEach((ue) => mr(ue)),
      ne.forEach((ue) => S.fetchers.delete(ue)));
  }
  function Fn(b, F, { flushSync: W } = {}) {
    let ne =
        S.actionData != null &&
        S.navigation.formMethod != null &&
        Sn(S.navigation.formMethod) &&
        S.navigation.state === "loading" &&
        b.state?._isRedirect !== !0,
      ue;
    F.actionData
      ? Object.keys(F.actionData).length > 0
        ? (ue = F.actionData)
        : (ue = null)
      : ne
        ? (ue = S.actionData)
        : (ue = null);
    let ge = F.loaderData
        ? Vv(S.loaderData, F.loaderData, F.matches || [], F.errors)
        : S.loaderData,
      Se = S.blockers;
    Se.size > 0 && ((Se = new Map(Se)), Se.forEach((ve, Ie) => Se.set(Ie, Rl)));
    let Ee = Oe ? !1 : Zi(b, F.matches || S.matches),
      Te =
        C === !0 ||
        (S.navigation.formMethod != null &&
          Sn(S.navigation.formMethod) &&
          b.state?._isRedirect !== !0);
    (f && ((d = f), (f = void 0)),
      Oe ||
        R === "POP" ||
        (R === "PUSH"
          ? n.history.push(b, b.state)
          : R === "REPLACE" && n.history.replace(b, b.state)));
    let Pe;
    if (R === "POP") {
      let ve = U.get(S.location.pathname);
      ve && ve.has(b.pathname)
        ? (Pe = { currentLocation: S.location, nextLocation: b })
        : U.has(b.pathname) &&
          (Pe = { currentLocation: b, nextLocation: S.location });
    } else if (L) {
      let ve = U.get(S.location.pathname);
      (ve
        ? ve.add(b.pathname)
        : ((ve = new Set([b.pathname])), U.set(S.location.pathname, ve)),
        (Pe = { currentLocation: S.location, nextLocation: b }));
    }
    (mt(
      {
        ...F,
        actionData: ue,
        loaderData: ge,
        historyAction: R,
        location: b,
        initialized: !0,
        navigation: Uf,
        revalidation: "idle",
        restoreScrollPosition: Ee,
        preventScrollReset: Te,
        blockers: Se,
      },
      { viewTransitionOpts: Pe, flushSync: W === !0 },
    ),
      (R = "POP"),
      (C = !1),
      (L = !1),
      (Oe = !1),
      (He = !1),
      Ge?.resolve(),
      (Ge = null));
  }
  async function dr(b, F) {
    if (typeof b == "number") {
      n.history.go(b);
      return;
    }
    let W = dp(S.location, S.matches, m, b, F?.fromRouteId, F?.relative),
      { path: ne, submission: ue, error: ge } = Pv(!1, W, F),
      Se = S.location,
      Ee = ql(S.location, ne, F && F.state);
    Ee = { ...Ee, ...n.history.encodeLocation(Ee) };
    let Te = F && F.replace != null ? F.replace : void 0,
      Pe = "PUSH";
    Te === !0
      ? (Pe = "REPLACE")
      : Te === !1 ||
        (ue != null &&
          Sn(ue.formMethod) &&
          ue.formAction === S.location.pathname + S.location.search &&
          (Pe = "REPLACE"));
    let ve =
        F && "preventScrollReset" in F ? F.preventScrollReset === !0 : void 0,
      Ie = (F && F.flushSync) === !0,
      Ue = fi({ currentLocation: Se, nextLocation: Ee, historyAction: Pe });
    if (Ue) {
      gr(Ue, {
        state: "blocked",
        location: Ee,
        proceed() {
          (gr(Ue, {
            state: "proceeding",
            proceed: void 0,
            reset: void 0,
            location: Ee,
          }),
            dr(b, F));
        },
        reset() {
          let ct = new Map(S.blockers);
          (ct.set(Ue, Rl), mt({ blockers: ct }));
        },
      });
      return;
    }
    await Rn(Pe, Ee, {
      submission: ue,
      pendingError: ge,
      preventScrollReset: ve,
      replace: F && F.replace,
      enableViewTransition: F && F.viewTransition,
      flushSync: Ie,
    });
  }
  function hi() {
    (Ge || (Ge = O1()), It(), mt({ revalidation: "loading" }));
    let b = Ge.promise;
    return S.navigation.state === "submitting"
      ? b
      : S.navigation.state === "idle"
        ? (Rn(S.historyAction, S.location, {
            startUninterruptedRevalidation: !0,
          }),
          b)
        : (Rn(R || S.historyAction, S.navigation.location, {
            overrideNavigation: S.navigation,
            enableViewTransition: L === !0,
          }),
          b);
  }
  async function Rn(b, F, W) {
    (x && x.abort(),
      (x = null),
      (R = b),
      (Oe = (W && W.startUninterruptedRevalidation) === !0),
      Yn(S.location, S.matches),
      (C = (W && W.preventScrollReset) === !0),
      (L = (W && W.enableViewTransition) === !0));
    let ne = f || d,
      ue = W && W.overrideNavigation,
      ge =
        W?.initialHydration && S.matches && S.matches.length > 0 && !G
          ? S.matches
          : Cs(ne, F, m),
      Se = (W && W.flushSync) === !0;
    if (
      ge &&
      S.initialized &&
      !He &&
      R1(S.location, F) &&
      !(W && W.submission && Sn(W.submission.formMethod))
    ) {
      Fn(F, { matches: ge }, { flushSync: Se });
      return;
    }
    let Ee = Xn(ge, ne, F.pathname);
    if ((Ee.active && Ee.matches && (ge = Ee.matches), !ge)) {
      let { error: vt, notFoundMatches: rt, route: st } = un(F.pathname);
      Fn(
        F,
        { matches: rt, loaderData: {}, errors: { [st.id]: vt } },
        { flushSync: Se },
      );
      return;
    }
    x = new AbortController();
    let Te = va(n.history, F, x.signal, W && W.submission),
      Pe = n.getContext ? await n.getContext() : new Tv(),
      ve;
    if (W && W.pendingError)
      ve = [Ps(ge).route.id, { type: "error", error: W.pendingError }];
    else if (W && W.submission && Sn(W.submission.formMethod)) {
      let vt = await Ks(
        Te,
        F,
        W.submission,
        ge,
        Pe,
        Ee.active,
        W && W.initialHydration === !0,
        { replace: W.replace, flushSync: Se },
      );
      if (vt.shortCircuited) return;
      if (vt.pendingActionResult) {
        let [rt, st] = vt.pendingActionResult;
        if (Wn(st) && Gl(st.error) && st.error.status === 404) {
          ((x = null),
            Fn(F, {
              matches: vt.matches,
              loaderData: {},
              errors: { [rt]: st.error },
            }));
          return;
        }
      }
      ((ge = vt.matches || ge),
        (ve = vt.pendingActionResult),
        (ue = zf(F, W.submission)),
        (Se = !1),
        (Ee.active = !1),
        (Te = va(n.history, Te.url, Te.signal)));
    }
    let {
      shortCircuited: Ie,
      matches: Ue,
      loaderData: ct,
      errors: yt,
    } = await Gs(
      Te,
      F,
      ge,
      Pe,
      Ee.active,
      ue,
      W && W.submission,
      W && W.fetcherSubmission,
      W && W.replace,
      W && W.initialHydration === !0,
      Se,
      ve,
    );
    Ie ||
      ((x = null),
      Fn(F, { matches: Ue || ge, ...Fv(ve), loaderData: ct, errors: yt }));
  }
  async function Ks(b, F, W, ne, ue, ge, Se, Ee = {}) {
    It();
    let Te = x1(F, W);
    if ((mt({ navigation: Te }, { flushSync: Ee.flushSync === !0 }), ge)) {
      let Ie = await Vr(ne, F.pathname, b.signal);
      if (Ie.type === "aborted") return { shortCircuited: !0 };
      if (Ie.type === "error") {
        if (Ie.partialMatches.length === 0) {
          let { matches: ct, route: yt } = xc(d);
          return {
            matches: ct,
            pendingActionResult: [yt.id, { type: "error", error: Ie.error }],
          };
        }
        let Ue = Ps(Ie.partialMatches).route.id;
        return {
          matches: Ie.partialMatches,
          pendingActionResult: [Ue, { type: "error", error: Ie.error }],
        };
      } else if (Ie.matches) ne = Ie.matches;
      else {
        let { notFoundMatches: Ue, error: ct, route: yt } = un(F.pathname);
        return {
          matches: Ue,
          pendingActionResult: [yt.id, { type: "error", error: ct }],
        };
      }
    }
    let Pe,
      ve = Hc(ne, F);
    if (!ve.route.action && !ve.route.lazy)
      Pe = {
        type: "error",
        error: lr(405, {
          method: b.method,
          pathname: F.pathname,
          routeId: ve.route.id,
        }),
      };
    else {
      let Ie = Aa(a, u, b, ne, ve, Se ? [] : i, ue),
        Ue = await Gn(b, Ie, ue, null);
      if (((Pe = Ue[ve.route.id]), !Pe)) {
        for (let ct of ne)
          if (Ue[ct.route.id]) {
            Pe = Ue[ct.route.id];
            break;
          }
      }
      if (b.signal.aborted) return { shortCircuited: !0 };
    }
    if (So(Pe)) {
      let Ie;
      return (
        Ee && Ee.replace != null
          ? (Ie = Ee.replace)
          : (Ie =
              Ov(Pe.response.headers.get("Location"), new URL(b.url), m) ===
              S.location.pathname + S.location.search),
        await An(b, Pe, !0, { submission: W, replace: Ie }),
        { shortCircuited: !0 }
      );
    }
    if (Wn(Pe)) {
      let Ie = Ps(ne, ve.route.id);
      return (
        (Ee && Ee.replace) !== !0 && (R = "PUSH"),
        { matches: ne, pendingActionResult: [Ie.route.id, Pe, ve.route.id] }
      );
    }
    return { matches: ne, pendingActionResult: [ve.route.id, Pe] };
  }
  async function Gs(b, F, W, ne, ue, ge, Se, Ee, Te, Pe, ve, Ie) {
    let Ue = ge || zf(F, Se),
      ct = Se || Ee || zv(Ue),
      yt = !Oe && !Pe;
    if (ue) {
      if (yt) {
        let ot = Qs(Ie);
        mt(
          { navigation: Ue, ...(ot !== void 0 ? { actionData: ot } : {}) },
          { flushSync: ve },
        );
      }
      let $e = await Vr(W, F.pathname, b.signal);
      if ($e.type === "aborted") return { shortCircuited: !0 };
      if ($e.type === "error") {
        if ($e.partialMatches.length === 0) {
          let { matches: vr, route: At } = xc(d);
          return { matches: vr, loaderData: {}, errors: { [At.id]: $e.error } };
        }
        let ot = Ps($e.partialMatches).route.id;
        return {
          matches: $e.partialMatches,
          loaderData: {},
          errors: { [ot]: $e.error },
        };
      } else if ($e.matches) W = $e.matches;
      else {
        let { error: ot, notFoundMatches: vr, route: At } = un(F.pathname);
        return { matches: vr, loaderData: {}, errors: { [At.id]: ot } };
      }
    }
    let vt = f || d,
      { dsMatches: rt, revalidatingFetchers: st } = kv(
        b,
        ne,
        a,
        u,
        n.history,
        S,
        W,
        ct,
        F,
        Pe ? [] : i,
        Pe === !0,
        He,
        lt,
        Ne,
        J,
        V,
        vt,
        m,
        n.patchRoutesOnNavigation != null,
        Ie,
      );
    if (
      ((me = ++oe),
      !n.dataStrategy &&
        !rt.some(($e) => $e.shouldLoad) &&
        !rt.some(
          ($e) => $e.route.middleware && $e.route.middleware.length > 0,
        ) &&
        st.length === 0)
    ) {
      let $e = Xi();
      return (
        Fn(
          F,
          {
            matches: W,
            loaderData: {},
            errors: Ie && Wn(Ie[1]) ? { [Ie[0]]: Ie[1].error } : null,
            ...Fv(Ie),
            ...($e ? { fetchers: new Map(S.fetchers) } : {}),
          },
          { flushSync: ve },
        ),
        { shortCircuited: !0 }
      );
    }
    if (yt) {
      let $e = {};
      if (!ue) {
        $e.navigation = Ue;
        let ot = Qs(Ie);
        ot !== void 0 && ($e.actionData = ot);
      }
      (st.length > 0 && ($e.fetchers = Ki(st)), mt($e, { flushSync: ve }));
    }
    st.forEach(($e) => {
      (vn($e.key), $e.controller && Ce.set($e.key, $e.controller));
    });
    let Zn = () => st.forEach(($e) => vn($e.key));
    x && x.signal.addEventListener("abort", Zn);
    let { loaderResults: mi, fetcherResults: Xe } = await Gi(rt, st, b, ne);
    if (b.signal.aborted) return { shortCircuited: !0 };
    (x && x.signal.removeEventListener("abort", Zn),
      st.forEach(($e) => Ce.delete($e.key)));
    let _n = bc(mi);
    if (_n)
      return (
        await An(b, _n.result, !0, { replace: Te }),
        { shortCircuited: !0 }
      );
    if (((_n = bc(Xe)), _n))
      return (
        V.add(_n.key),
        await An(b, _n.result, !0, { replace: Te }),
        { shortCircuited: !0 }
      );
    let { loaderData: yr, errors: Cn } = Mv(S, W, mi, Ie, st, Xe);
    Pe && S.errors && (Cn = { ...S.errors, ...Cn });
    let Mt = Xi(),
      Fr = Ji(me),
      gi = Mt || Fr || st.length > 0;
    return {
      matches: W,
      loaderData: yr,
      errors: Cn,
      ...(gi ? { fetchers: new Map(S.fetchers) } : {}),
    };
  }
  function Qs(b) {
    if (b && !Wn(b[1])) return { [b[0]]: b[1].data };
    if (S.actionData)
      return Object.keys(S.actionData).length === 0 ? null : S.actionData;
  }
  function Ki(b) {
    return (
      b.forEach((F) => {
        let W = S.fetchers.get(F.key),
          ne = Al(void 0, W ? W.data : void 0);
        S.fetchers.set(F.key, ne);
      }),
      new Map(S.fetchers)
    );
  }
  async function fr(b, F, W, ne) {
    vn(b);
    let ue = (ne && ne.flushSync) === !0,
      ge = f || d,
      Se = dp(S.location, S.matches, m, W, F, ne?.relative),
      Ee = Cs(ge, Se, m),
      Te = Xn(Ee, ge, Se);
    if ((Te.active && Te.matches && (Ee = Te.matches), !Ee)) {
      jt(b, F, lr(404, { pathname: Se }), { flushSync: ue });
      return;
    }
    let { path: Pe, submission: ve, error: Ie } = Pv(!0, Se, ne);
    if (Ie) {
      jt(b, F, Ie, { flushSync: ue });
      return;
    }
    let Ue = n.getContext ? await n.getContext() : new Tv(),
      ct = (ne && ne.preventScrollReset) === !0;
    if (ve && Sn(ve.formMethod)) {
      await pr(b, F, Pe, Ee, Ue, Te.active, ue, ct, ve);
      return;
    }
    (J.set(b, { routeId: F, path: Pe }),
      await Ys(b, F, Pe, Ee, Ue, Te.active, ue, ct, ve));
  }
  async function pr(b, F, W, ne, ue, ge, Se, Ee, Te) {
    (It(), J.delete(b));
    let Pe = S.fetchers.get(b);
    ut(b, b1(Te, Pe), { flushSync: Se });
    let ve = new AbortController(),
      Ie = va(n.history, W, ve.signal, Te);
    if (ge) {
      let ft = await Vr(ne, new URL(Ie.url).pathname, Ie.signal, b);
      if (ft.type === "aborted") return;
      if (ft.type === "error") {
        jt(b, F, ft.error, { flushSync: Se });
        return;
      } else if (ft.matches) ne = ft.matches;
      else {
        jt(b, F, lr(404, { pathname: W }), { flushSync: Se });
        return;
      }
    }
    let Ue = Hc(ne, W);
    if (!Ue.route.action && !Ue.route.lazy) {
      let ft = lr(405, { method: Te.formMethod, pathname: W, routeId: F });
      jt(b, F, ft, { flushSync: Se });
      return;
    }
    Ce.set(b, ve);
    let ct = oe,
      yt = Aa(a, u, Ie, ne, Ue, i, ue),
      vt = await Gn(Ie, yt, ue, b),
      rt = vt[Ue.route.id];
    if (!rt) {
      for (let ft of yt)
        if (vt[ft.route.id]) {
          rt = vt[ft.route.id];
          break;
        }
    }
    if (Ie.signal.aborted) {
      Ce.get(b) === ve && Ce.delete(b);
      return;
    }
    if (Ne.has(b)) {
      if (So(rt) || Wn(rt)) {
        ut(b, bi(void 0));
        return;
      }
    } else {
      if (So(rt))
        if ((Ce.delete(b), me > ct)) {
          ut(b, bi(void 0));
          return;
        } else
          return (
            V.add(b),
            ut(b, Al(Te)),
            An(Ie, rt, !1, { fetcherSubmission: Te, preventScrollReset: Ee })
          );
      if (Wn(rt)) {
        jt(b, F, rt.error);
        return;
      }
    }
    let st = S.navigation.location || S.location,
      Zn = va(n.history, st, ve.signal),
      mi = f || d,
      Xe =
        S.navigation.state !== "idle"
          ? Cs(mi, S.navigation.location, m)
          : S.matches;
    Be(Xe, "Didn't find any matches after fetcher action");
    let _n = ++oe;
    de.set(b, _n);
    let yr = Al(Te, rt.data);
    S.fetchers.set(b, yr);
    let { dsMatches: Cn, revalidatingFetchers: Mt } = kv(
      Zn,
      ue,
      a,
      u,
      n.history,
      S,
      Xe,
      Te,
      st,
      i,
      !1,
      He,
      lt,
      Ne,
      J,
      V,
      mi,
      m,
      n.patchRoutesOnNavigation != null,
      [Ue.route.id, rt],
    );
    (Mt.filter((ft) => ft.key !== b).forEach((ft) => {
      let yi = ft.key,
        Zs = S.fetchers.get(yi),
        es = Al(void 0, Zs ? Zs.data : void 0);
      (S.fetchers.set(yi, es),
        vn(yi),
        ft.controller && Ce.set(yi, ft.controller));
    }),
      mt({ fetchers: new Map(S.fetchers) }));
    let Fr = () => Mt.forEach((ft) => vn(ft.key));
    ve.signal.addEventListener("abort", Fr);
    let { loaderResults: gi, fetcherResults: $e } = await Gi(Cn, Mt, Zn, ue);
    if (ve.signal.aborted) return;
    if (
      (ve.signal.removeEventListener("abort", Fr),
      de.delete(b),
      Ce.delete(b),
      Mt.forEach((ft) => Ce.delete(ft.key)),
      S.fetchers.has(b))
    ) {
      let ft = bi(rt.data);
      S.fetchers.set(b, ft);
    }
    let ot = bc(gi);
    if (ot) return An(Zn, ot.result, !1, { preventScrollReset: Ee });
    if (((ot = bc($e)), ot))
      return (V.add(ot.key), An(Zn, ot.result, !1, { preventScrollReset: Ee }));
    let { loaderData: vr, errors: At } = Mv(S, Xe, gi, void 0, Mt, $e);
    (Ji(_n),
      S.navigation.state === "loading" && _n > me
        ? (Be(R, "Expected pending action"),
          x && x.abort(),
          Fn(S.navigation.location, {
            matches: Xe,
            loaderData: vr,
            errors: At,
            fetchers: new Map(S.fetchers),
          }))
        : (mt({
            errors: At,
            loaderData: Vv(S.loaderData, vr, Xe, At),
            fetchers: new Map(S.fetchers),
          }),
          (He = !1)));
  }
  async function Ys(b, F, W, ne, ue, ge, Se, Ee, Te) {
    let Pe = S.fetchers.get(b);
    ut(b, Al(Te, Pe ? Pe.data : void 0), { flushSync: Se });
    let ve = new AbortController(),
      Ie = va(n.history, W, ve.signal);
    if (ge) {
      let st = await Vr(ne, new URL(Ie.url).pathname, Ie.signal, b);
      if (st.type === "aborted") return;
      if (st.type === "error") {
        jt(b, F, st.error, { flushSync: Se });
        return;
      } else if (st.matches) ne = st.matches;
      else {
        jt(b, F, lr(404, { pathname: W }), { flushSync: Se });
        return;
      }
    }
    let Ue = Hc(ne, W);
    Ce.set(b, ve);
    let ct = oe,
      yt = Aa(a, u, Ie, ne, Ue, i, ue),
      rt = (await Gn(Ie, yt, ue, b))[Ue.route.id];
    if ((Ce.get(b) === ve && Ce.delete(b), !Ie.signal.aborted)) {
      if (Ne.has(b)) {
        ut(b, bi(void 0));
        return;
      }
      if (So(rt))
        if (me > ct) {
          ut(b, bi(void 0));
          return;
        } else {
          (V.add(b), await An(Ie, rt, !1, { preventScrollReset: Ee }));
          return;
        }
      if (Wn(rt)) {
        jt(b, F, rt.error);
        return;
      }
      ut(b, bi(rt.data));
    }
  }
  async function An(
    b,
    F,
    W,
    {
      submission: ne,
      fetcherSubmission: ue,
      preventScrollReset: ge,
      replace: Se,
    } = {},
  ) {
    F.response.headers.has("X-Remix-Revalidate") && (He = !0);
    let Ee = F.response.headers.get("Location");
    (Be(Ee, "Expected a Location header on the redirect Response"),
      (Ee = Ov(Ee, new URL(b.url), m)));
    let Te = ql(S.location, Ee, { _isRedirect: !0 });
    if (t) {
      let yt = !1;
      if (F.response.headers.has("X-Remix-Reload-Document")) yt = !0;
      else if (Mh(Ee)) {
        const vt = q0(Ee, !0);
        yt = vt.origin !== e.location.origin || hr(vt.pathname, m) == null;
      }
      if (yt) {
        Se ? e.location.replace(Ee) : e.location.assign(Ee);
        return;
      }
    }
    x = null;
    let Pe =
        Se === !0 || F.response.headers.has("X-Remix-Replace")
          ? "REPLACE"
          : "PUSH",
      { formMethod: ve, formAction: Ie, formEncType: Ue } = S.navigation;
    !ne && !ue && ve && Ie && Ue && (ne = zv(S.navigation));
    let ct = ne || ue;
    if (u1.has(F.response.status) && ct && Sn(ct.formMethod))
      await Rn(Pe, Te, {
        submission: { ...ct, formAction: Ee },
        preventScrollReset: ge || C,
        enableViewTransition: W ? L : void 0,
      });
    else {
      let yt = zf(Te, ne);
      await Rn(Pe, Te, {
        overrideNavigation: yt,
        fetcherSubmission: ue,
        preventScrollReset: ge || C,
        enableViewTransition: W ? L : void 0,
      });
    }
  }
  async function Gn(b, F, W, ne) {
    let ue,
      ge = {};
    try {
      ue = await _1(v, b, F, ne, W, !1);
    } catch (Se) {
      return (
        F.filter((Ee) => Ee.shouldLoad).forEach((Ee) => {
          ge[Ee.route.id] = { type: "error", error: Se };
        }),
        ge
      );
    }
    if (b.signal.aborted) return ge;
    for (let [Se, Ee] of Object.entries(ue))
      if (P1(Ee)) {
        let Te = Ee.result;
        ge[Se] = { type: "redirect", response: S1(Te, b, Se, F, m) };
      } else ge[Se] = await T1(Ee);
    return ge;
  }
  async function Gi(b, F, W, ne) {
    let ue = Gn(W, b, ne, null),
      ge = Promise.all(
        F.map(async (Te) => {
          if (Te.matches && Te.match && Te.request && Te.controller) {
            let ve = (await Gn(Te.request, Te.matches, ne, Te.key))[
              Te.match.route.id
            ];
            return { [Te.key]: ve };
          } else
            return Promise.resolve({
              [Te.key]: {
                type: "error",
                error: lr(404, { pathname: Te.path }),
              },
            });
        }),
      ),
      Se = await ue,
      Ee = (await ge).reduce((Te, Pe) => Object.assign(Te, Pe), {});
    return { loaderResults: Se, fetcherResults: Ee };
  }
  function It() {
    ((He = !0),
      J.forEach((b, F) => {
        (Ce.has(F) && lt.add(F), vn(F));
      }));
  }
  function ut(b, F, W = {}) {
    (S.fetchers.set(b, F),
      mt(
        { fetchers: new Map(S.fetchers) },
        { flushSync: (W && W.flushSync) === !0 },
      ));
  }
  function jt(b, F, W, ne = {}) {
    let ue = Ps(S.matches, F);
    (mr(b),
      mt(
        { errors: { [ue.route.id]: W }, fetchers: new Map(S.fetchers) },
        { flushSync: (ne && ne.flushSync) === !0 },
      ));
  }
  function Qi(b) {
    return (
      ye.set(b, (ye.get(b) || 0) + 1),
      Ne.has(b) && Ne.delete(b),
      S.fetchers.get(b) || c1
    );
  }
  function Lr(b, F) {
    (vn(b, F?.reason), ut(b, bi(null)));
  }
  function mr(b) {
    let F = S.fetchers.get(b);
    (Ce.has(b) && !(F && F.state === "loading" && de.has(b)) && vn(b),
      J.delete(b),
      de.delete(b),
      V.delete(b),
      Ne.delete(b),
      lt.delete(b),
      S.fetchers.delete(b));
  }
  function di(b) {
    let F = (ye.get(b) || 0) - 1;
    (F <= 0 ? (ye.delete(b), Ne.add(b)) : ye.set(b, F),
      mt({ fetchers: new Map(S.fetchers) }));
  }
  function vn(b, F) {
    let W = Ce.get(b);
    W && (W.abort(F), Ce.delete(b));
  }
  function Yi(b) {
    for (let F of b) {
      let W = Qi(F),
        ne = bi(W.data);
      S.fetchers.set(F, ne);
    }
  }
  function Xi() {
    let b = [],
      F = !1;
    for (let W of V) {
      let ne = S.fetchers.get(W);
      (Be(ne, `Expected fetcher: ${W}`),
        ne.state === "loading" && (V.delete(W), b.push(W), (F = !0)));
    }
    return (Yi(b), F);
  }
  function Ji(b) {
    let F = [];
    for (let [W, ne] of de)
      if (ne < b) {
        let ue = S.fetchers.get(W);
        (Be(ue, `Expected fetcher: ${W}`),
          ue.state === "loading" && (vn(W), de.delete(W), F.push(W)));
      }
    return (Yi(F), F.length > 0);
  }
  function Xs(b, F) {
    let W = S.blockers.get(b) || Rl;
    return (Fe.get(b) !== F && Fe.set(b, F), W);
  }
  function Mr(b) {
    (S.blockers.delete(b), Fe.delete(b));
  }
  function gr(b, F) {
    let W = S.blockers.get(b) || Rl;
    Be(
      (W.state === "unblocked" && F.state === "blocked") ||
        (W.state === "blocked" && F.state === "blocked") ||
        (W.state === "blocked" && F.state === "proceeding") ||
        (W.state === "blocked" && F.state === "unblocked") ||
        (W.state === "proceeding" && F.state === "unblocked"),
      `Invalid blocker state transition: ${W.state} -> ${F.state}`,
    );
    let ne = new Map(S.blockers);
    (ne.set(b, F), mt({ blockers: ne }));
  }
  function fi({ currentLocation: b, nextLocation: F, historyAction: W }) {
    if (Fe.size === 0) return;
    Fe.size > 1 && Dt(!1, "A router only supports one blocker at a time");
    let ne = Array.from(Fe.entries()),
      [ue, ge] = ne[ne.length - 1],
      Se = S.blockers.get(ue);
    if (
      !(Se && Se.state === "proceeding") &&
      ge({ currentLocation: b, nextLocation: F, historyAction: W })
    )
      return ue;
  }
  function un(b) {
    let F = lr(404, { pathname: b }),
      W = f || d,
      { matches: ne, route: ue } = xc(W);
    return { notFoundMatches: ne, route: ue, error: F };
  }
  function Qn(b, F, W) {
    if (((D = b), (O = F), (j = W || null), !X && S.navigation === Uf)) {
      X = !0;
      let ne = Zi(S.location, S.matches);
      ne != null && mt({ restoreScrollPosition: ne });
    }
    return () => {
      ((D = null), (O = null), (j = null));
    };
  }
  function pi(b, F) {
    return (
      (j &&
        j(
          b,
          F.map((ne) => OI(ne, S.loaderData)),
        )) ||
      b.key
    );
  }
  function Yn(b, F) {
    if (D && O) {
      let W = pi(b, F);
      D[W] = O();
    }
  }
  function Zi(b, F) {
    if (D) {
      let W = pi(b, F),
        ne = D[W];
      if (typeof ne == "number") return ne;
    }
    return null;
  }
  function Xn(b, F, W) {
    if (n.patchRoutesOnNavigation)
      if (b) {
        if (Object.keys(b[0].params).length > 0)
          return { active: !0, matches: bl(F, W, m, !0) };
      } else return { active: !0, matches: bl(F, W, m, !0) || [] };
    return { active: !1, matches: null };
  }
  async function Vr(b, F, W, ne) {
    if (!n.patchRoutesOnNavigation) return { type: "success", matches: b };
    let ue = b;
    for (;;) {
      let ge = f == null,
        Se = f || d,
        Ee = u;
      try {
        await n.patchRoutesOnNavigation({
          signal: W,
          path: F,
          matches: ue,
          fetcherKey: ne,
          patch: (ve, Ie) => {
            W.aborted || xv(ve, Ie, Se, Ee, a, !1);
          },
        });
      } catch (ve) {
        return { type: "error", error: ve, partialMatches: ue };
      } finally {
        ge && !W.aborted && (d = [...d]);
      }
      if (W.aborted) return { type: "aborted" };
      let Te = Cs(Se, F, m),
        Pe = null;
      if (Te) {
        if (Object.keys(Te[0].params).length === 0)
          return { type: "success", matches: Te };
        if (
          ((Pe = bl(Se, F, m, !0)),
          !(Pe && ue.length < Pe.length && Jn(ue, Pe.slice(0, ue.length))))
        )
          return { type: "success", matches: Te };
      }
      if ((Pe || (Pe = bl(Se, F, m, !0)), !Pe || Jn(ue, Pe)))
        return { type: "success", matches: null };
      ue = Pe;
    }
  }
  function Jn(b, F) {
    return (
      b.length === F.length && b.every((W, ne) => W.route.id === F[ne].route.id)
    );
  }
  function Js(b) {
    ((u = {}), (f = Kl(b, a, void 0, u)));
  }
  function Rt(b, F, W = !1) {
    let ne = f == null;
    (xv(b, F, f || d, u, a, W), ne && ((d = [...d]), mt({})));
  }
  return (
    (he = {
      get basename() {
        return m;
      },
      get future() {
        return w;
      },
      get state() {
        return S;
      },
      get routes() {
        return d;
      },
      get window() {
        return e;
      },
      initialize: tt,
      subscribe: Lt,
      enableScrollRestoration: Qn,
      navigate: dr,
      fetch: fr,
      revalidate: hi,
      createHref: (b) => n.history.createHref(b),
      encodeLocation: (b) => n.history.encodeLocation(b),
      getFetcher: Qi,
      resetFetcher: Lr,
      deleteFetcher: di,
      dispose: dt,
      getBlocker: Xs,
      deleteBlocker: Mr,
      patchRoutes: Rt,
      _internalFetchControllers: Ce,
      _internalSetRoutes: Js,
      _internalSetStateDoNotUseOrYouWillBreakYourApp(b) {
        mt(b);
      },
    }),
    n.unstable_instrumentations &&
      (he = e1(
        he,
        n.unstable_instrumentations.map((b) => b.router).filter(Boolean),
      )),
    he
  );
}
function f1(n) {
  return (
    n != null &&
    (("formData" in n && n.formData != null) ||
      ("body" in n && n.body !== void 0))
  );
}
function dp(n, e, t, i, o, a) {
  let u, d;
  if (o) {
    u = [];
    for (let m of e)
      if ((u.push(m), m.route.id === o)) {
        d = m;
        break;
      }
  } else ((u = e), (d = e[e.length - 1]));
  let f = Fh(i || ".", Vh(u), hr(n.pathname, t) || n.pathname, a === "path");
  if (
    (i == null && ((f.search = n.search), (f.hash = n.hash)),
    (i == null || i === "" || i === ".") && d)
  ) {
    let m = nm(f.search);
    if (d.route.index && !m)
      f.search = f.search ? f.search.replace(/^\?/, "?index&") : "?index";
    else if (!d.route.index && m) {
      let v = new URLSearchParams(f.search),
        w = v.getAll("index");
      (v.delete("index"),
        w.filter((A) => A).forEach((A) => v.append("index", A)));
      let T = v.toString();
      f.search = T ? `?${T}` : "";
    }
  }
  return (
    t !== "/" && (f.pathname = KI({ basename: t, pathname: f.pathname })),
    si(f)
  );
}
function Pv(n, e, t) {
  if (!t || !f1(t)) return { path: e };
  if (t.formMethod && !k1(t.formMethod))
    return { path: e, error: lr(405, { method: t.formMethod }) };
  let i = () => ({ path: e, error: lr(400, { type: "invalid-body" }) }),
    a = (t.formMethod || "get").toUpperCase(),
    u = sw(e);
  if (t.body !== void 0) {
    if (t.formEncType === "text/plain") {
      if (!Sn(a)) return i();
      let w =
        typeof t.body == "string"
          ? t.body
          : t.body instanceof FormData || t.body instanceof URLSearchParams
            ? Array.from(t.body.entries()).reduce(
                (T, [A, D]) => `${T}${A}=${D}
`,
                "",
              )
            : String(t.body);
      return {
        path: e,
        submission: {
          formMethod: a,
          formAction: u,
          formEncType: t.formEncType,
          formData: void 0,
          json: void 0,
          text: w,
        },
      };
    } else if (t.formEncType === "application/json") {
      if (!Sn(a)) return i();
      try {
        let w = typeof t.body == "string" ? JSON.parse(t.body) : t.body;
        return {
          path: e,
          submission: {
            formMethod: a,
            formAction: u,
            formEncType: t.formEncType,
            formData: void 0,
            json: w,
            text: void 0,
          },
        };
      } catch {
        return i();
      }
    }
  }
  Be(
    typeof FormData == "function",
    "FormData is not available in this environment",
  );
  let d, f;
  if (t.formData) ((d = mp(t.formData)), (f = t.formData));
  else if (t.body instanceof FormData) ((d = mp(t.body)), (f = t.body));
  else if (t.body instanceof URLSearchParams) ((d = t.body), (f = Lv(d)));
  else if (t.body == null) ((d = new URLSearchParams()), (f = new FormData()));
  else
    try {
      ((d = new URLSearchParams(t.body)), (f = Lv(d)));
    } catch {
      return i();
    }
  let m = {
    formMethod: a,
    formAction: u,
    formEncType: (t && t.formEncType) || "application/x-www-form-urlencoded",
    formData: f,
    json: void 0,
    text: void 0,
  };
  if (Sn(m.formMethod)) return { path: e, submission: m };
  let v = Wi(e);
  return (
    n && v.search && nm(v.search) && d.append("index", ""),
    (v.search = `?${d}`),
    { path: si(v), submission: m }
  );
}
function kv(n, e, t, i, o, a, u, d, f, m, v, w, T, A, D, j, O, X, q, G) {
  let ae = G ? (Wn(G[1]) ? G[1].error : G[1].data) : void 0,
    ee = o.createURL(a.location),
    he = o.createURL(f),
    S;
  if (v && a.errors) {
    let Oe = Object.keys(a.errors)[0];
    S = u.findIndex((He) => He.route.id === Oe);
  } else if (G && Wn(G[1])) {
    let Oe = G[0];
    S = u.findIndex((He) => He.route.id === Oe) - 1;
  }
  let R = G ? G[1].statusCode : void 0,
    C = R && R >= 400,
    x = {
      currentUrl: ee,
      currentParams: a.matches[0]?.params || {},
      nextUrl: he,
      nextParams: u[0].params,
      ...d,
      actionResult: ae,
      actionStatus: R,
    },
    L = em(u.map((Oe) => Oe.route.path)),
    U = u.map((Oe, He) => {
      let { route: lt } = Oe,
        Ce = null;
      if (
        (S != null && He > S
          ? (Ce = !1)
          : lt.lazy
            ? (Ce = !0)
            : tm(lt)
              ? v
                ? (Ce = fp(lt, a.loaderData, a.errors))
                : p1(a.loaderData, a.matches[He], Oe) && (Ce = !0)
              : (Ce = !1),
        Ce !== null)
      )
        return pp(t, i, n, L, Oe, m, e, Ce);
      let oe = C
          ? !1
          : w ||
            ee.pathname + ee.search === he.pathname + he.search ||
            ee.search !== he.search ||
            m1(a.matches[He], Oe),
        me = { ...x, defaultShouldRevalidate: oe },
        de = lh(Oe, me);
      return pp(t, i, n, L, Oe, m, e, de, me);
    }),
    k = [];
  return (
    D.forEach((Oe, He) => {
      if (v || !u.some((ye) => ye.route.id === Oe.routeId) || A.has(He)) return;
      let lt = a.fetchers.get(He),
        Ce = lt && lt.state !== "idle" && lt.data === void 0,
        oe = Cs(O, Oe.path, X);
      if (!oe) {
        if (q && Ce) return;
        k.push({
          key: He,
          routeId: Oe.routeId,
          path: Oe.path,
          matches: null,
          match: null,
          request: null,
          controller: null,
        });
        return;
      }
      if (j.has(He)) return;
      let me = Hc(oe, Oe.path),
        de = new AbortController(),
        V = va(o, Oe.path, de.signal),
        J = null;
      if (T.has(He)) (T.delete(He), (J = Aa(t, i, V, oe, me, m, e)));
      else if (Ce) w && (J = Aa(t, i, V, oe, me, m, e));
      else {
        let ye = { ...x, defaultShouldRevalidate: C ? !1 : w };
        lh(me, ye) && (J = Aa(t, i, V, oe, me, m, e, ye));
      }
      J &&
        k.push({
          key: He,
          routeId: Oe.routeId,
          path: Oe.path,
          matches: J,
          match: me,
          request: V,
          controller: de,
        });
    }),
    { dsMatches: U, revalidatingFetchers: k }
  );
}
function tm(n) {
  return n.loader != null || (n.middleware != null && n.middleware.length > 0);
}
function fp(n, e, t) {
  if (n.lazy) return !0;
  if (!tm(n)) return !1;
  let i = e != null && n.id in e,
    o = t != null && t[n.id] !== void 0;
  return !i && o
    ? !1
    : typeof n.loader == "function" && n.loader.hydrate === !0
      ? !0
      : !i && !o;
}
function p1(n, e, t) {
  let i = !e || t.route.id !== e.route.id,
    o = !n.hasOwnProperty(t.route.id);
  return i || o;
}
function m1(n, e) {
  let t = n.route.path;
  return (
    n.pathname !== e.pathname ||
    (t != null && t.endsWith("*") && n.params["*"] !== e.params["*"])
  );
}
function lh(n, e) {
  if (n.route.shouldRevalidate) {
    let t = n.route.shouldRevalidate(e);
    if (typeof t == "boolean") return t;
  }
  return e.defaultShouldRevalidate;
}
function xv(n, e, t, i, o, a) {
  let u;
  if (n) {
    let m = i[n];
    (Be(m, `No route found to patch children into: routeId = ${n}`),
      m.children || (m.children = []),
      (u = m.children));
  } else u = t;
  let d = [],
    f = [];
  if (
    (e.forEach((m) => {
      let v = u.find((w) => ew(m, w));
      v ? f.push({ existingRoute: v, newRoute: m }) : d.push(m);
    }),
    d.length > 0)
  ) {
    let m = Kl(d, o, [n || "_", "patch", String(u?.length || "0")], i);
    u.push(...m);
  }
  if (a && f.length > 0)
    for (let m = 0; m < f.length; m++) {
      let { existingRoute: v, newRoute: w } = f[m],
        T = v,
        [A] = Kl([w], o, [], {}, !0);
      Object.assign(T, {
        element: A.element ? A.element : T.element,
        errorElement: A.errorElement ? A.errorElement : T.errorElement,
        hydrateFallbackElement: A.hydrateFallbackElement
          ? A.hydrateFallbackElement
          : T.hydrateFallbackElement,
      });
    }
}
function ew(n, e) {
  return "id" in n && "id" in e && n.id === e.id
    ? !0
    : n.index === e.index &&
        n.path === e.path &&
        n.caseSensitive === e.caseSensitive
      ? (!n.children || n.children.length === 0) &&
        (!e.children || e.children.length === 0)
        ? !0
        : n.children.every((t, i) => e.children?.some((o) => ew(t, o)))
      : !1;
}
var bv = new WeakMap(),
  tw = ({ key: n, route: e, manifest: t, mapRouteProperties: i }) => {
    let o = t[e.id];
    if (
      (Be(o, "No route found in manifest"),
      !o.lazy || typeof o.lazy != "object")
    )
      return;
    let a = o.lazy[n];
    if (!a) return;
    let u = bv.get(o);
    u || ((u = {}), bv.set(o, u));
    let d = u[n];
    if (d) return d;
    let f = (async () => {
      let m = xI(n),
        w = o[n] !== void 0 && n !== "hasErrorBoundary";
      if (m)
        (Dt(
          !m,
          "Route property " +
            n +
            " is not a supported lazy route property. This property will be ignored.",
        ),
          (u[n] = Promise.resolve()));
      else if (w)
        Dt(
          !1,
          `Route "${o.id}" has a static property "${n}" defined. The lazy property will be ignored.`,
        );
      else {
        let T = await a();
        T != null && (Object.assign(o, { [n]: T }), Object.assign(o, i(o)));
      }
      typeof o.lazy == "object" &&
        ((o.lazy[n] = void 0),
        Object.values(o.lazy).every((T) => T === void 0) && (o.lazy = void 0));
    })();
    return ((u[n] = f), f);
  },
  Dv = new WeakMap();
function g1(n, e, t, i, o) {
  let a = t[n.id];
  if ((Be(a, "No route found in manifest"), !n.lazy))
    return { lazyRoutePromise: void 0, lazyHandlerPromise: void 0 };
  if (typeof n.lazy == "function") {
    let v = Dv.get(a);
    if (v) return { lazyRoutePromise: v, lazyHandlerPromise: v };
    let w = (async () => {
      Be(typeof n.lazy == "function", "No lazy route function found");
      let T = await n.lazy(),
        A = {};
      for (let D in T) {
        let j = T[D];
        if (j === void 0) continue;
        let O = DI(D),
          q = a[D] !== void 0 && D !== "hasErrorBoundary";
        O
          ? Dt(
              !O,
              "Route property " +
                D +
                " is not a supported property to be returned from a lazy route function. This property will be ignored.",
            )
          : q
            ? Dt(
                !q,
                `Route "${a.id}" has a static property "${D}" defined but its lazy function is also returning a value for this property. The lazy route property "${D}" will be ignored.`,
              )
            : (A[D] = j);
      }
      (Object.assign(a, A), Object.assign(a, { ...i(a), lazy: void 0 }));
    })();
    return (
      Dv.set(a, w),
      w.catch(() => {}),
      { lazyRoutePromise: w, lazyHandlerPromise: w }
    );
  }
  let u = Object.keys(n.lazy),
    d = [],
    f;
  for (let v of u) {
    if (o && o.includes(v)) continue;
    let w = tw({ key: v, route: n, manifest: t, mapRouteProperties: i });
    w && (d.push(w), v === e && (f = w));
  }
  let m = d.length > 0 ? Promise.all(d).then(() => {}) : void 0;
  return (
    m?.catch(() => {}),
    f?.catch(() => {}),
    { lazyRoutePromise: m, lazyHandlerPromise: f }
  );
}
async function Nv(n) {
  let e = n.matches.filter((o) => o.shouldLoad),
    t = {};
  return (
    (await Promise.all(e.map((o) => o.resolve()))).forEach((o, a) => {
      t[e[a].route.id] = o;
    }),
    t
  );
}
async function y1(n) {
  return n.matches.some((e) => e.route.middleware) ? nw(n, () => Nv(n)) : Nv(n);
}
function nw(n, e) {
  return v1(n, e, (i) => i, A1, t);
  function t(i, o, a) {
    if (a)
      return Promise.resolve(
        Object.assign(a.value, { [o]: { type: "error", result: i } }),
      );
    {
      let { matches: u } = n,
        d = Math.min(
          Math.max(
            u.findIndex((m) => m.route.id === o),
            0,
          ),
          Math.max(
            u.findIndex((m) => m.unstable_shouldCallHandler()),
            0,
          ),
        ),
        f = Ps(u, u[d].route.id).route.id;
      return Promise.resolve({ [f]: { type: "error", result: i } });
    }
  }
}
async function v1(n, e, t, i, o) {
  let {
      matches: a,
      request: u,
      params: d,
      context: f,
      unstable_pattern: m,
    } = n,
    v = a.flatMap((T) =>
      T.route.middleware ? T.route.middleware.map((A) => [T.route.id, A]) : [],
    );
  return await rw(
    { request: u, params: d, context: f, unstable_pattern: m },
    v,
    e,
    t,
    i,
    o,
  );
}
async function rw(n, e, t, i, o, a, u = 0) {
  let { request: d } = n;
  if (d.signal.aborted)
    throw d.signal.reason ?? new Error(`Request aborted: ${d.method} ${d.url}`);
  let f = e[u];
  if (!f) return await t();
  let [m, v] = f,
    w,
    T = async () => {
      if (w) throw new Error("You may only call `next()` once per middleware");
      try {
        return ((w = { value: await rw(n, e, t, i, o, a, u + 1) }), w.value);
      } catch (A) {
        return ((w = { value: await a(A, m, w) }), w.value);
      }
    };
  try {
    let A = await v(n, T),
      D = A != null ? i(A) : void 0;
    return o(D)
      ? D
      : w
        ? (D ?? w.value)
        : ((w = { value: await T() }), w.value);
  } catch (A) {
    return await a(A, m, w);
  }
}
function iw(n, e, t, i, o) {
  let a = tw({
      key: "middleware",
      route: i.route,
      manifest: e,
      mapRouteProperties: n,
    }),
    u = g1(i.route, Sn(t.method) ? "action" : "loader", e, n, o);
  return {
    middleware: a,
    route: u.lazyRoutePromise,
    handler: u.lazyHandlerPromise,
  };
}
function pp(n, e, t, i, o, a, u, d, f = null) {
  let m = !1,
    v = iw(n, e, t, o, a);
  return {
    ...o,
    _lazyPromises: v,
    shouldLoad: d,
    unstable_shouldRevalidateArgs: f,
    unstable_shouldCallHandler(w) {
      return (
        (m = !0),
        f
          ? typeof w == "boolean"
            ? lh(o, { ...f, defaultShouldRevalidate: w })
            : lh(o, f)
          : d
      );
    },
    resolve(w) {
      let { lazy: T, loader: A, middleware: D } = o.route,
        j = m || d || (w && !Sn(t.method) && (T || A)),
        O = D && D.length > 0 && !A && !T;
      return j && (Sn(t.method) || !O)
        ? w1({
            request: t,
            unstable_pattern: i,
            match: o,
            lazyHandlerPromise: v?.handler,
            lazyRoutePromise: v?.route,
            handlerOverride: w,
            scopedContext: u,
          })
        : Promise.resolve({ type: "data", result: void 0 });
    },
  };
}
function Aa(n, e, t, i, o, a, u, d = null) {
  return i.map((f) =>
    f.route.id !== o.route.id
      ? {
          ...f,
          shouldLoad: !1,
          unstable_shouldRevalidateArgs: d,
          unstable_shouldCallHandler: () => !1,
          _lazyPromises: iw(n, e, t, f, a),
          resolve: () => Promise.resolve({ type: "data", result: void 0 }),
        }
      : pp(n, e, t, em(i.map((m) => m.route.path)), f, a, u, !0, d),
  );
}
async function _1(n, e, t, i, o, a) {
  t.some((m) => m._lazyPromises?.middleware) &&
    (await Promise.all(t.map((m) => m._lazyPromises?.middleware)));
  let u = {
      request: e,
      unstable_pattern: em(t.map((m) => m.route.path)),
      params: t[0].params,
      context: o,
      matches: t,
    },
    f = await n({
      ...u,
      fetcherKey: i,
      runClientMiddleware: (m) => {
        let v = u;
        return nw(v, () =>
          m({
            ...v,
            fetcherKey: i,
            runClientMiddleware: () => {
              throw new Error(
                "Cannot call `runClientMiddleware()` from within an `runClientMiddleware` handler",
              );
            },
          }),
        );
      },
    });
  try {
    await Promise.all(
      t.flatMap((m) => [m._lazyPromises?.handler, m._lazyPromises?.route]),
    );
  } catch {}
  return f;
}
async function w1({
  request: n,
  unstable_pattern: e,
  match: t,
  lazyHandlerPromise: i,
  lazyRoutePromise: o,
  handlerOverride: a,
  scopedContext: u,
}) {
  let d,
    f,
    m = Sn(n.method),
    v = m ? "action" : "loader",
    w = (T) => {
      let A,
        D = new Promise((X, q) => (A = q));
      ((f = () => A()), n.signal.addEventListener("abort", f));
      let j = (X) =>
          typeof T != "function"
            ? Promise.reject(
                new Error(
                  `You cannot call the handler for a route which defines a boolean "${v}" [routeId: ${t.route.id}]`,
                ),
              )
            : T(
                {
                  request: n,
                  unstable_pattern: e,
                  params: t.params,
                  context: u,
                },
                ...(X !== void 0 ? [X] : []),
              ),
        O = (async () => {
          try {
            return { type: "data", result: await (a ? a((q) => j(q)) : j()) };
          } catch (X) {
            return { type: "error", result: X };
          }
        })();
      return Promise.race([O, D]);
    };
  try {
    let T = m ? t.route.action : t.route.loader;
    if (i || o)
      if (T) {
        let A,
          [D] = await Promise.all([
            w(T).catch((j) => {
              A = j;
            }),
            i,
            o,
          ]);
        if (A !== void 0) throw A;
        d = D;
      } else {
        await i;
        let A = m ? t.route.action : t.route.loader;
        if (A) [d] = await Promise.all([w(A), o]);
        else if (v === "action") {
          let D = new URL(n.url),
            j = D.pathname + D.search;
          throw lr(405, { method: n.method, pathname: j, routeId: t.route.id });
        } else return { type: "data", result: void 0 };
      }
    else if (T) d = await w(T);
    else {
      let A = new URL(n.url),
        D = A.pathname + A.search;
      throw lr(404, { pathname: D });
    }
  } catch (T) {
    return { type: "error", result: T };
  } finally {
    f && n.signal.removeEventListener("abort", f);
  }
  return d;
}
async function E1(n) {
  let e = n.headers.get("Content-Type");
  return e && /\bapplication\/json\b/.test(e)
    ? n.body == null
      ? null
      : n.json()
    : n.text();
}
async function T1(n) {
  let { result: e, type: t } = n;
  if (ow(e)) {
    let i;
    try {
      i = await E1(e);
    } catch (o) {
      return { type: "error", error: o };
    }
    return t === "error"
      ? {
          type: "error",
          error: new ah(e.status, e.statusText, i),
          statusCode: e.status,
          headers: e.headers,
        }
      : { type: "data", data: i, statusCode: e.status, headers: e.headers };
  }
  return t === "error"
    ? Uv(e)
      ? e.data instanceof Error
        ? {
            type: "error",
            error: e.data,
            statusCode: e.init?.status,
            headers: e.init?.headers ? new Headers(e.init.headers) : void 0,
          }
        : {
            type: "error",
            error: new ah(e.init?.status || 500, void 0, e.data),
            statusCode: Gl(e) ? e.status : void 0,
            headers: e.init?.headers ? new Headers(e.init.headers) : void 0,
          }
      : { type: "error", error: e, statusCode: Gl(e) ? e.status : void 0 }
    : Uv(e)
      ? {
          type: "data",
          data: e.data,
          statusCode: e.init?.status,
          headers: e.init?.headers ? new Headers(e.init.headers) : void 0,
        }
      : { type: "data", data: e };
}
function S1(n, e, t, i, o) {
  let a = n.headers.get("Location");
  if (
    (Be(
      a,
      "Redirects returned/thrown from loaders/actions must have a Location header",
    ),
    !Mh(a))
  ) {
    let u = i.slice(0, i.findIndex((d) => d.route.id === t) + 1);
    ((a = dp(new URL(e.url), u, o, a)), n.headers.set("Location", a));
  }
  return n;
}
function Ov(n, e, t) {
  if (Mh(n)) {
    let i = n,
      o = i.startsWith("//") ? new URL(e.protocol + i) : new URL(i),
      a = hr(o.pathname, t) != null;
    if (o.origin === e.origin && a) return o.pathname + o.search + o.hash;
  }
  return n;
}
function va(n, e, t, i) {
  let o = n.createURL(sw(e)).toString(),
    a = { signal: t };
  if (i && Sn(i.formMethod)) {
    let { formMethod: u, formEncType: d } = i;
    ((a.method = u.toUpperCase()),
      d === "application/json"
        ? ((a.headers = new Headers({ "Content-Type": d })),
          (a.body = JSON.stringify(i.json)))
        : d === "text/plain"
          ? (a.body = i.text)
          : d === "application/x-www-form-urlencoded" && i.formData
            ? (a.body = mp(i.formData))
            : (a.body = i.formData));
  }
  return new Request(o, a);
}
function mp(n) {
  let e = new URLSearchParams();
  for (let [t, i] of n.entries())
    e.append(t, typeof i == "string" ? i : i.name);
  return e;
}
function Lv(n) {
  let e = new FormData();
  for (let [t, i] of n.entries()) e.append(t, i);
  return e;
}
function I1(n, e, t, i = !1, o = !1) {
  let a = {},
    u = null,
    d,
    f = !1,
    m = {},
    v = t && Wn(t[1]) ? t[1].error : void 0;
  return (
    n.forEach((w) => {
      if (!(w.route.id in e)) return;
      let T = w.route.id,
        A = e[T];
      if (
        (Be(!So(A), "Cannot handle redirect results in processLoaderData"),
        Wn(A))
      ) {
        let D = A.error;
        if ((v !== void 0 && ((D = v), (v = void 0)), (u = u || {}), o))
          u[T] = D;
        else {
          let j = Ps(n, T);
          u[j.route.id] == null && (u[j.route.id] = D);
        }
        (i || (a[T] = Z0),
          f || ((f = !0), (d = Gl(A.error) ? A.error.status : 500)),
          A.headers && (m[T] = A.headers));
      } else
        ((a[T] = A.data),
          A.statusCode && A.statusCode !== 200 && !f && (d = A.statusCode),
          A.headers && (m[T] = A.headers));
    }),
    v !== void 0 && t && ((u = { [t[0]]: v }), t[2] && (a[t[2]] = void 0)),
    { loaderData: a, errors: u, statusCode: d || 200, loaderHeaders: m }
  );
}
function Mv(n, e, t, i, o, a) {
  let { loaderData: u, errors: d } = I1(e, t, i);
  return (
    o
      .filter((f) => !f.matches || f.matches.some((m) => m.shouldLoad))
      .forEach((f) => {
        let { key: m, match: v, controller: w } = f;
        if (w && w.signal.aborted) return;
        let T = a[m];
        if ((Be(T, "Did not find corresponding fetcher result"), Wn(T))) {
          let A = Ps(n.matches, v?.route.id);
          ((d && d[A.route.id]) || (d = { ...d, [A.route.id]: T.error }),
            n.fetchers.delete(m));
        } else if (So(T)) Be(!1, "Unhandled fetcher revalidation redirect");
        else {
          let A = bi(T.data);
          n.fetchers.set(m, A);
        }
      }),
    { loaderData: u, errors: d }
  );
}
function Vv(n, e, t, i) {
  let o = Object.entries(e)
    .filter(([, a]) => a !== Z0)
    .reduce((a, [u, d]) => ((a[u] = d), a), {});
  for (let a of t) {
    let u = a.route.id;
    if (
      (!e.hasOwnProperty(u) &&
        n.hasOwnProperty(u) &&
        a.route.loader &&
        (o[u] = n[u]),
      i && i.hasOwnProperty(u))
    )
      break;
  }
  return o;
}
function Fv(n) {
  return n
    ? Wn(n[1])
      ? { actionData: {} }
      : { actionData: { [n[0]]: n[1].data } }
    : {};
}
function Ps(n, e) {
  return (
    (e ? n.slice(0, n.findIndex((i) => i.route.id === e) + 1) : [...n])
      .reverse()
      .find((i) => i.route.hasErrorBoundary === !0) || n[0]
  );
}
function xc(n) {
  let e =
    n.length === 1
      ? n[0]
      : n.find((t) => t.index || !t.path || t.path === "/") || {
          id: "__shim-error-route__",
        };
  return {
    matches: [{ params: {}, pathname: "", pathnameBase: "", route: e }],
    route: e,
  };
}
function lr(
  n,
  { pathname: e, routeId: t, method: i, type: o, message: a } = {},
) {
  let u = "Unknown Server Error",
    d = "Unknown @remix-run/router error";
  return (
    n === 400
      ? ((u = "Bad Request"),
        i && e && t
          ? (d = `You made a ${i} request to "${e}" but did not provide a \`loader\` for route "${t}", so there is no way to handle the request.`)
          : o === "invalid-body" && (d = "Unable to encode submission body"))
      : n === 403
        ? ((u = "Forbidden"), (d = `Route "${t}" does not match URL "${e}"`))
        : n === 404
          ? ((u = "Not Found"), (d = `No route matches URL "${e}"`))
          : n === 405 &&
            ((u = "Method Not Allowed"),
            i && e && t
              ? (d = `You made a ${i.toUpperCase()} request to "${e}" but did not provide an \`action\` for route "${t}", so there is no way to handle the request.`)
              : i && (d = `Invalid request method "${i.toUpperCase()}"`)),
    new ah(n || 500, u, new Error(d), !0)
  );
}
function bc(n) {
  let e = Object.entries(n);
  for (let t = e.length - 1; t >= 0; t--) {
    let [i, o] = e[t];
    if (So(o)) return { key: i, result: o };
  }
}
function sw(n) {
  let e = typeof n == "string" ? Wi(n) : n;
  return si({ ...e, hash: "" });
}
function R1(n, e) {
  return n.pathname !== e.pathname || n.search !== e.search
    ? !1
    : n.hash === ""
      ? e.hash !== ""
      : n.hash === e.hash
        ? !0
        : e.hash !== "";
}
function A1(n) {
  return (
    n != null &&
    typeof n == "object" &&
    Object.entries(n).every(([e, t]) => typeof e == "string" && C1(t))
  );
}
function C1(n) {
  return (
    n != null &&
    typeof n == "object" &&
    "type" in n &&
    "result" in n &&
    (n.type === "data" || n.type === "error")
  );
}
function P1(n) {
  return ow(n.result) && l1.has(n.result.status);
}
function Wn(n) {
  return n.type === "error";
}
function So(n) {
  return (n && n.type) === "redirect";
}
function Uv(n) {
  return (
    typeof n == "object" &&
    n != null &&
    "type" in n &&
    "data" in n &&
    "init" in n &&
    n.type === "DataWithResponseInit"
  );
}
function ow(n) {
  return (
    n != null &&
    typeof n.status == "number" &&
    typeof n.statusText == "string" &&
    typeof n.headers == "object" &&
    typeof n.body < "u"
  );
}
function k1(n) {
  return a1.has(n.toUpperCase());
}
function Sn(n) {
  return s1.has(n.toUpperCase());
}
function nm(n) {
  return new URLSearchParams(n).getAll("index").some((e) => e === "");
}
function Hc(n, e) {
  let t = typeof e == "string" ? Wi(e).search : e.search;
  if (n[n.length - 1].route.index && nm(t || "")) return n[n.length - 1];
  let i = Q0(n);
  return i[i.length - 1];
}
function zv(n) {
  let {
    formMethod: e,
    formAction: t,
    formEncType: i,
    text: o,
    formData: a,
    json: u,
  } = n;
  if (!(!e || !t || !i)) {
    if (o != null)
      return {
        formMethod: e,
        formAction: t,
        formEncType: i,
        formData: void 0,
        json: void 0,
        text: o,
      };
    if (a != null)
      return {
        formMethod: e,
        formAction: t,
        formEncType: i,
        formData: a,
        json: void 0,
        text: void 0,
      };
    if (u !== void 0)
      return {
        formMethod: e,
        formAction: t,
        formEncType: i,
        formData: void 0,
        json: u,
        text: void 0,
      };
  }
}
function zf(n, e) {
  return e
    ? {
        state: "loading",
        location: n,
        formMethod: e.formMethod,
        formAction: e.formAction,
        formEncType: e.formEncType,
        formData: e.formData,
        json: e.json,
        text: e.text,
      }
    : {
        state: "loading",
        location: n,
        formMethod: void 0,
        formAction: void 0,
        formEncType: void 0,
        formData: void 0,
        json: void 0,
        text: void 0,
      };
}
function x1(n, e) {
  return {
    state: "submitting",
    location: n,
    formMethod: e.formMethod,
    formAction: e.formAction,
    formEncType: e.formEncType,
    formData: e.formData,
    json: e.json,
    text: e.text,
  };
}
function Al(n, e) {
  return n
    ? {
        state: "loading",
        formMethod: n.formMethod,
        formAction: n.formAction,
        formEncType: n.formEncType,
        formData: n.formData,
        json: n.json,
        text: n.text,
        data: e,
      }
    : {
        state: "loading",
        formMethod: void 0,
        formAction: void 0,
        formEncType: void 0,
        formData: void 0,
        json: void 0,
        text: void 0,
        data: e,
      };
}
function b1(n, e) {
  return {
    state: "submitting",
    formMethod: n.formMethod,
    formAction: n.formAction,
    formEncType: n.formEncType,
    formData: n.formData,
    json: n.json,
    text: n.text,
    data: e ? e.data : void 0,
  };
}
function bi(n) {
  return {
    state: "idle",
    formMethod: void 0,
    formAction: void 0,
    formEncType: void 0,
    formData: void 0,
    json: void 0,
    text: void 0,
    data: n,
  };
}
function D1(n, e) {
  try {
    let t = n.sessionStorage.getItem(J0);
    if (t) {
      let i = JSON.parse(t);
      for (let [o, a] of Object.entries(i || {}))
        a && Array.isArray(a) && e.set(o, new Set(a || []));
    }
  } catch {}
}
function N1(n, e) {
  if (e.size > 0) {
    let t = {};
    for (let [i, o] of e) t[i] = [...o];
    try {
      n.sessionStorage.setItem(J0, JSON.stringify(t));
    } catch (i) {
      Dt(
        !1,
        `Failed to save applied view transitions in sessionStorage (${i}).`,
      );
    }
  }
}
function O1() {
  let n,
    e,
    t = new Promise((i, o) => {
      ((n = async (a) => {
        i(a);
        try {
          await t;
        } catch {}
      }),
        (e = async (a) => {
          o(a);
          try {
            await t;
          } catch {}
        }));
    });
  return { promise: t, resolve: n, reject: e };
}
var Do = z.createContext(null);
Do.displayName = "DataRouter";
var uu = z.createContext(null);
uu.displayName = "DataRouterState";
z.createContext(!1);
var rm = z.createContext({ isTransitioning: !1 });
rm.displayName = "ViewTransition";
var aw = z.createContext(new Map());
aw.displayName = "Fetchers";
var L1 = z.createContext(null);
L1.displayName = "Await";
var Nr = z.createContext(null);
Nr.displayName = "Navigation";
var cu = z.createContext(null);
cu.displayName = "Location";
var ci = z.createContext({ outlet: null, matches: [], isDataRoute: !1 });
ci.displayName = "Route";
var im = z.createContext(null);
im.displayName = "RouteError";
function M1(n, { relative: e } = {}) {
  Be(
    za(),
    "useHref() may be used only in the context of a <Router> component.",
  );
  let { basename: t, navigator: i } = z.useContext(Nr),
    { hash: o, pathname: a, search: u } = hu(n, { relative: e }),
    d = a;
  return (
    t !== "/" && (d = a === "/" ? t : Jr([t, a])),
    i.createHref({ pathname: d, search: u, hash: o })
  );
}
function za() {
  return z.useContext(cu) != null;
}
function Or() {
  return (
    Be(
      za(),
      "useLocation() may be used only in the context of a <Router> component.",
    ),
    z.useContext(cu).location
  );
}
var lw =
  "You should call navigate() in a React.useEffect(), not when your component is first rendered.";
function uw(n) {
  z.useContext(Nr).static || z.useLayoutEffect(n);
}
function Uh() {
  let { isDataRoute: n } = z.useContext(ci);
  return n ? Q1() : V1();
}
function V1() {
  Be(
    za(),
    "useNavigate() may be used only in the context of a <Router> component.",
  );
  let n = z.useContext(Do),
    { basename: e, navigator: t } = z.useContext(Nr),
    { matches: i } = z.useContext(ci),
    { pathname: o } = Or(),
    a = JSON.stringify(Vh(i)),
    u = z.useRef(!1);
  return (
    uw(() => {
      u.current = !0;
    }),
    z.useCallback(
      (f, m = {}) => {
        if ((Dt(u.current, lw), !u.current)) return;
        if (typeof f == "number") {
          t.go(f);
          return;
        }
        let v = Fh(f, JSON.parse(a), o, m.relative === "path");
        (n == null &&
          e !== "/" &&
          (v.pathname = v.pathname === "/" ? e : Jr([e, v.pathname])),
          (m.replace ? t.replace : t.push)(v, m.state, m));
      },
      [e, t, a, o, n],
    )
  );
}
z.createContext(null);
function hu(n, { relative: e } = {}) {
  let { matches: t } = z.useContext(ci),
    { pathname: i } = Or(),
    o = JSON.stringify(Vh(t));
  return z.useMemo(() => Fh(n, JSON.parse(o), i, e === "path"), [n, o, i, e]);
}
function F1(n, e) {
  return cw(n, e);
}
function cw(n, e, t, i, o) {
  Be(
    za(),
    "useRoutes() may be used only in the context of a <Router> component.",
  );
  let { navigator: a } = z.useContext(Nr),
    { matches: u } = z.useContext(ci),
    d = u[u.length - 1],
    f = d ? d.params : {},
    m = d ? d.pathname : "/",
    v = d ? d.pathnameBase : "/",
    w = d && d.route;
  {
    let q = (w && w.path) || "";
    hw(
      m,
      !w || q.endsWith("*") || q.endsWith("*?"),
      `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${m}" (under <Route path="${q}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${q}"> to <Route path="${q === "/" ? "*" : `${q}/*`}">.`,
    );
  }
  let T = Or(),
    A;
  if (e) {
    let q = typeof e == "string" ? Wi(e) : e;
    (Be(
      v === "/" || q.pathname?.startsWith(v),
      `When overriding the location using \`<Routes location>\` or \`useRoutes(routes, location)\`, the location pathname must begin with the portion of the URL pathname that was matched by all parent routes. The current pathname base is "${v}" but pathname "${q.pathname}" was given in the \`location\` prop.`,
    ),
      (A = q));
  } else A = T;
  let D = A.pathname || "/",
    j = D;
  if (v !== "/") {
    let q = v.replace(/^\//, "").split("/");
    j = "/" + D.replace(/^\//, "").split("/").slice(q.length).join("/");
  }
  let O = Cs(n, { pathname: j });
  (Dt(
    w || O != null,
    `No routes matched location "${A.pathname}${A.search}${A.hash}" `,
  ),
    Dt(
      O == null ||
        O[O.length - 1].route.element !== void 0 ||
        O[O.length - 1].route.Component !== void 0 ||
        O[O.length - 1].route.lazy !== void 0,
      `Matched leaf route at location "${A.pathname}${A.search}${A.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`,
    ));
  let X = $1(
    O &&
      O.map((q) =>
        Object.assign({}, q, {
          params: Object.assign({}, f, q.params),
          pathname: Jr([
            v,
            a.encodeLocation
              ? a.encodeLocation(
                  q.pathname.replace(/\?/g, "%3F").replace(/#/g, "%23"),
                ).pathname
              : q.pathname,
          ]),
          pathnameBase:
            q.pathnameBase === "/"
              ? v
              : Jr([
                  v,
                  a.encodeLocation
                    ? a.encodeLocation(
                        q.pathnameBase
                          .replace(/\?/g, "%3F")
                          .replace(/#/g, "%23"),
                      ).pathname
                    : q.pathnameBase,
                ]),
        }),
      ),
    u,
    t,
    i,
    o,
  );
  return e && X
    ? z.createElement(
        cu.Provider,
        {
          value: {
            location: {
              pathname: "/",
              search: "",
              hash: "",
              state: null,
              key: "default",
              ...A,
            },
            navigationType: "POP",
          },
        },
        X,
      )
    : X;
}
function U1() {
  let n = G1(),
    e = Gl(n)
      ? `${n.status} ${n.statusText}`
      : n instanceof Error
        ? n.message
        : JSON.stringify(n),
    t = n instanceof Error ? n.stack : null,
    i = "rgba(200,200,200, 0.5)",
    o = { padding: "0.5rem", backgroundColor: i },
    a = { padding: "2px 4px", backgroundColor: i },
    u = null;
  return (
    console.error("Error handled by React Router default ErrorBoundary:", n),
    (u = z.createElement(
      z.Fragment,
      null,
      z.createElement("p", null, "💿 Hey developer 👋"),
      z.createElement(
        "p",
        null,
        "You can provide a way better UX than this when your app throws errors by providing your own ",
        z.createElement("code", { style: a }, "ErrorBoundary"),
        " or",
        " ",
        z.createElement("code", { style: a }, "errorElement"),
        " prop on your route.",
      ),
    )),
    z.createElement(
      z.Fragment,
      null,
      z.createElement("h2", null, "Unexpected Application Error!"),
      z.createElement("h3", { style: { fontStyle: "italic" } }, e),
      t ? z.createElement("pre", { style: o }, t) : null,
      u,
    )
  );
}
var z1 = z.createElement(U1, null),
  j1 = class extends z.Component {
    constructor(n) {
      (super(n),
        (this.state = {
          location: n.location,
          revalidation: n.revalidation,
          error: n.error,
        }));
    }
    static getDerivedStateFromError(n) {
      return { error: n };
    }
    static getDerivedStateFromProps(n, e) {
      return e.location !== n.location ||
        (e.revalidation !== "idle" && n.revalidation === "idle")
        ? { error: n.error, location: n.location, revalidation: n.revalidation }
        : {
            error: n.error !== void 0 ? n.error : e.error,
            location: e.location,
            revalidation: n.revalidation || e.revalidation,
          };
    }
    componentDidCatch(n, e) {
      this.props.onError
        ? this.props.onError(n, e)
        : console.error(
            "React Router caught the following error during render",
            n,
          );
    }
    render() {
      return this.state.error !== void 0
        ? z.createElement(
            ci.Provider,
            { value: this.props.routeContext },
            z.createElement(im.Provider, {
              value: this.state.error,
              children: this.props.component,
            }),
          )
        : this.props.children;
    }
  };
function B1({ routeContext: n, match: e, children: t }) {
  let i = z.useContext(Do);
  return (
    i &&
      i.static &&
      i.staticContext &&
      (e.route.errorElement || e.route.ErrorBoundary) &&
      (i.staticContext._deepestRenderedBoundaryId = e.route.id),
    z.createElement(ci.Provider, { value: n }, t)
  );
}
function $1(n, e = [], t = null, i = null, o = null) {
  if (n == null) {
    if (!t) return null;
    if (t.errors) n = t.matches;
    else if (e.length === 0 && !t.initialized && t.matches.length > 0)
      n = t.matches;
    else return null;
  }
  let a = n,
    u = t?.errors;
  if (u != null) {
    let v = a.findIndex((w) => w.route.id && u?.[w.route.id] !== void 0);
    (Be(
      v >= 0,
      `Could not find a matching route for errors on route IDs: ${Object.keys(u).join(",")}`,
    ),
      (a = a.slice(0, Math.min(a.length, v + 1))));
  }
  let d = !1,
    f = -1;
  if (t)
    for (let v = 0; v < a.length; v++) {
      let w = a[v];
      if (
        ((w.route.HydrateFallback || w.route.hydrateFallbackElement) && (f = v),
        w.route.id)
      ) {
        let { loaderData: T, errors: A } = t,
          D =
            w.route.loader &&
            !T.hasOwnProperty(w.route.id) &&
            (!A || A[w.route.id] === void 0);
        if (w.route.lazy || D) {
          ((d = !0), f >= 0 ? (a = a.slice(0, f + 1)) : (a = [a[0]]));
          break;
        }
      }
    }
  let m =
    t && i
      ? (v, w) => {
          i(v, {
            location: t.location,
            params: t.matches?.[0]?.params ?? {},
            errorInfo: w,
          });
        }
      : void 0;
  return a.reduceRight((v, w, T) => {
    let A,
      D = !1,
      j = null,
      O = null;
    t &&
      ((A = u && w.route.id ? u[w.route.id] : void 0),
      (j = w.route.errorElement || z1),
      d &&
        (f < 0 && T === 0
          ? (hw(
              "route-fallback",
              !1,
              "No `HydrateFallback` element provided to render during initial hydration",
            ),
            (D = !0),
            (O = null))
          : f === T &&
            ((D = !0), (O = w.route.hydrateFallbackElement || null))));
    let X = e.concat(a.slice(0, T + 1)),
      q = () => {
        let G;
        return (
          A
            ? (G = j)
            : D
              ? (G = O)
              : w.route.Component
                ? (G = z.createElement(w.route.Component, null))
                : w.route.element
                  ? (G = w.route.element)
                  : (G = v),
          z.createElement(B1, {
            match: w,
            routeContext: { outlet: v, matches: X, isDataRoute: t != null },
            children: G,
          })
        );
      };
    return t && (w.route.ErrorBoundary || w.route.errorElement || T === 0)
      ? z.createElement(j1, {
          location: t.location,
          revalidation: t.revalidation,
          component: j,
          error: A,
          children: q(),
          routeContext: { outlet: null, matches: X, isDataRoute: !0 },
          onError: m,
        })
      : q();
  }, null);
}
function sm(n) {
  return `${n} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function H1(n) {
  let e = z.useContext(Do);
  return (Be(e, sm(n)), e);
}
function W1(n) {
  let e = z.useContext(uu);
  return (Be(e, sm(n)), e);
}
function q1(n) {
  let e = z.useContext(ci);
  return (Be(e, sm(n)), e);
}
function om(n) {
  let e = q1(n),
    t = e.matches[e.matches.length - 1];
  return (
    Be(
      t.route.id,
      `${n} can only be used on routes that contain a unique "id"`,
    ),
    t.route.id
  );
}
function K1() {
  return om("useRouteId");
}
function G1() {
  let n = z.useContext(im),
    e = W1("useRouteError"),
    t = om("useRouteError");
  return n !== void 0 ? n : e.errors?.[t];
}
function Q1() {
  let { router: n } = H1("useNavigate"),
    e = om("useNavigate"),
    t = z.useRef(!1);
  return (
    uw(() => {
      t.current = !0;
    }),
    z.useCallback(
      async (o, a = {}) => {
        (Dt(t.current, lw),
          t.current &&
            (typeof o == "number"
              ? n.navigate(o)
              : await n.navigate(o, { fromRouteId: e, ...a })));
      },
      [n, e],
    )
  );
}
var jv = {};
function hw(n, e, t) {
  !e && !jv[n] && ((jv[n] = !0), Dt(!1, t));
}
var Bv = {};
function $v(n, e) {
  !n && !Bv[e] && ((Bv[e] = !0), console.warn(e));
}
function Y1(n) {
  let e = {
    hasErrorBoundary:
      n.hasErrorBoundary || n.ErrorBoundary != null || n.errorElement != null,
  };
  return (
    n.Component &&
      (n.element &&
        Dt(
          !1,
          "You should not include both `Component` and `element` on your route - `Component` will be used.",
        ),
      Object.assign(e, {
        element: z.createElement(n.Component),
        Component: void 0,
      })),
    n.HydrateFallback &&
      (n.hydrateFallbackElement &&
        Dt(
          !1,
          "You should not include both `HydrateFallback` and `hydrateFallbackElement` on your route - `HydrateFallback` will be used.",
        ),
      Object.assign(e, {
        hydrateFallbackElement: z.createElement(n.HydrateFallback),
        HydrateFallback: void 0,
      })),
    n.ErrorBoundary &&
      (n.errorElement &&
        Dt(
          !1,
          "You should not include both `ErrorBoundary` and `errorElement` on your route - `ErrorBoundary` will be used.",
        ),
      Object.assign(e, {
        errorElement: z.createElement(n.ErrorBoundary),
        ErrorBoundary: void 0,
      })),
    e
  );
}
var X1 = ["HydrateFallback", "hydrateFallbackElement"],
  J1 = class {
    constructor() {
      ((this.status = "pending"),
        (this.promise = new Promise((e, t) => {
          ((this.resolve = (i) => {
            this.status === "pending" && ((this.status = "resolved"), e(i));
          }),
            (this.reject = (i) => {
              this.status === "pending" && ((this.status = "rejected"), t(i));
            }));
        })));
    }
  };
function Z1({ router: n, flushSync: e, unstable_onError: t }) {
  let [i, o] = z.useState(n.state),
    [a, u] = z.useState(),
    [d, f] = z.useState({ isTransitioning: !1 }),
    [m, v] = z.useState(),
    [w, T] = z.useState(),
    [A, D] = z.useState(),
    j = z.useRef(new Map()),
    O = z.useCallback(
      (ee) => {
        o(
          (he) => (
            ee.errors &&
              t &&
              Object.entries(ee.errors).forEach(([S, R]) => {
                he.errors?.[S] !== R &&
                  t(R, {
                    location: ee.location,
                    params: ee.matches[0]?.params ?? {},
                  });
              }),
            ee
          ),
        );
      },
      [t],
    ),
    X = z.useCallback(
      (ee, { deletedFetchers: he, flushSync: S, viewTransitionOpts: R }) => {
        (ee.fetchers.forEach((x, L) => {
          x.data !== void 0 && j.current.set(L, x.data);
        }),
          he.forEach((x) => j.current.delete(x)),
          $v(
            S === !1 || e != null,
            'You provided the `flushSync` option to a router update, but you are not using the `<RouterProvider>` from `react-router/dom` so `ReactDOM.flushSync()` is unavailable.  Please update your app to `import { RouterProvider } from "react-router/dom"` and ensure you have `react-dom` installed as a dependency to use the `flushSync` option.',
          ));
        let C =
          n.window != null &&
          n.window.document != null &&
          typeof n.window.document.startViewTransition == "function";
        if (
          ($v(
            R == null || C,
            "You provided the `viewTransition` option to a router update, but you do not appear to be running in a DOM environment as `window.startViewTransition` is not available.",
          ),
          !R || !C)
        ) {
          e && S ? e(() => O(ee)) : z.startTransition(() => O(ee));
          return;
        }
        if (e && S) {
          e(() => {
            (w && (m && m.resolve(), w.skipTransition()),
              f({
                isTransitioning: !0,
                flushSync: !0,
                currentLocation: R.currentLocation,
                nextLocation: R.nextLocation,
              }));
          });
          let x = n.window.document.startViewTransition(() => {
            e(() => O(ee));
          });
          (x.finished.finally(() => {
            e(() => {
              (v(void 0), T(void 0), u(void 0), f({ isTransitioning: !1 }));
            });
          }),
            e(() => T(x)));
          return;
        }
        w
          ? (m && m.resolve(),
            w.skipTransition(),
            D({
              state: ee,
              currentLocation: R.currentLocation,
              nextLocation: R.nextLocation,
            }))
          : (u(ee),
            f({
              isTransitioning: !0,
              flushSync: !1,
              currentLocation: R.currentLocation,
              nextLocation: R.nextLocation,
            }));
      },
      [n.window, e, w, m, O],
    );
  (z.useLayoutEffect(() => n.subscribe(X), [n, X]),
    z.useEffect(() => {
      d.isTransitioning && !d.flushSync && v(new J1());
    }, [d]),
    z.useEffect(() => {
      if (m && a && n.window) {
        let ee = a,
          he = m.promise,
          S = n.window.document.startViewTransition(async () => {
            (z.startTransition(() => O(ee)), await he);
          });
        (S.finished.finally(() => {
          (v(void 0), T(void 0), u(void 0), f({ isTransitioning: !1 }));
        }),
          T(S));
      }
    }, [a, m, n.window, O]),
    z.useEffect(() => {
      m && a && i.location.key === a.location.key && m.resolve();
    }, [m, w, i.location, a]),
    z.useEffect(() => {
      !d.isTransitioning &&
        A &&
        (u(A.state),
        f({
          isTransitioning: !0,
          flushSync: !1,
          currentLocation: A.currentLocation,
          nextLocation: A.nextLocation,
        }),
        D(void 0));
    }, [d.isTransitioning, A]));
  let q = z.useMemo(
      () => ({
        createHref: n.createHref,
        encodeLocation: n.encodeLocation,
        go: (ee) => n.navigate(ee),
        push: (ee, he, S) =>
          n.navigate(ee, {
            state: he,
            preventScrollReset: S?.preventScrollReset,
          }),
        replace: (ee, he, S) =>
          n.navigate(ee, {
            replace: !0,
            state: he,
            preventScrollReset: S?.preventScrollReset,
          }),
      }),
      [n],
    ),
    G = n.basename || "/",
    ae = z.useMemo(
      () => ({
        router: n,
        navigator: q,
        static: !1,
        basename: G,
        unstable_onError: t,
      }),
      [n, q, G, t],
    );
  return z.createElement(
    z.Fragment,
    null,
    z.createElement(
      Do.Provider,
      { value: ae },
      z.createElement(
        uu.Provider,
        { value: i },
        z.createElement(
          aw.Provider,
          { value: j.current },
          z.createElement(
            rm.Provider,
            { value: d },
            z.createElement(
              nR,
              {
                basename: G,
                location: i.location,
                navigationType: i.historyAction,
                navigator: q,
              },
              z.createElement(eR, {
                routes: n.routes,
                future: n.future,
                state: i,
                unstable_onError: t,
              }),
            ),
          ),
        ),
      ),
    ),
    null,
  );
}
var eR = z.memo(tR);
function tR({ routes: n, future: e, state: t, unstable_onError: i }) {
  return cw(n, void 0, t, i, e);
}
function gp({ to: n, replace: e, state: t, relative: i }) {
  Be(
    za(),
    "<Navigate> may be used only in the context of a <Router> component.",
  );
  let { static: o } = z.useContext(Nr);
  Dt(
    !o,
    "<Navigate> must not be used on the initial render in a <StaticRouter>. This is a no-op, but you should modify your code so the <Navigate> is only ever rendered in response to some user interaction or state change.",
  );
  let { matches: a } = z.useContext(ci),
    { pathname: u } = Or(),
    d = Uh(),
    f = Fh(n, Vh(a), u, i === "path"),
    m = JSON.stringify(f);
  return (
    z.useEffect(() => {
      d(JSON.parse(m), { replace: e, state: t, relative: i });
    }, [d, m, i, e, t]),
    null
  );
}
function rn(n) {
  Be(
    !1,
    "A <Route> is only ever to be used as the child of <Routes> element, never rendered directly. Please wrap your <Route> in a <Routes>.",
  );
}
function nR({
  basename: n = "/",
  children: e = null,
  location: t,
  navigationType: i = "POP",
  navigator: o,
  static: a = !1,
}) {
  Be(
    !za(),
    "You cannot render a <Router> inside another <Router>. You should never have more than one in your app.",
  );
  let u = n.replace(/^\/*/, "/"),
    d = z.useMemo(
      () => ({ basename: u, navigator: o, static: a, future: {} }),
      [u, o, a],
    );
  typeof t == "string" && (t = Wi(t));
  let {
      pathname: f = "/",
      search: m = "",
      hash: v = "",
      state: w = null,
      key: T = "default",
    } = t,
    A = z.useMemo(() => {
      let D = hr(f, u);
      return D == null
        ? null
        : {
            location: { pathname: D, search: m, hash: v, state: w, key: T },
            navigationType: i,
          };
    }, [u, f, m, v, w, T, i]);
  return (
    Dt(
      A != null,
      `<Router basename="${u}"> is not able to match the URL "${f}${m}${v}" because it does not start with the basename, so the <Router> won't render anything.`,
    ),
    A == null
      ? null
      : z.createElement(
          Nr.Provider,
          { value: d },
          z.createElement(cu.Provider, { children: e, value: A }),
        )
  );
}
function rR({ children: n, location: e }) {
  return F1(yp(n), e);
}
function yp(n, e = []) {
  let t = [];
  return (
    z.Children.forEach(n, (i, o) => {
      if (!z.isValidElement(i)) return;
      let a = [...e, o];
      if (i.type === z.Fragment) {
        t.push.apply(t, yp(i.props.children, a));
        return;
      }
      (Be(
        i.type === rn,
        `[${typeof i.type == "string" ? i.type : i.type.name}] is not a <Route> component. All component children of <Routes> must be a <Route> or <React.Fragment>`,
      ),
        Be(
          !i.props.index || !i.props.children,
          "An index route cannot have child routes.",
        ));
      let u = {
        id: i.props.id || a.join("-"),
        caseSensitive: i.props.caseSensitive,
        element: i.props.element,
        Component: i.props.Component,
        index: i.props.index,
        path: i.props.path,
        middleware: i.props.middleware,
        loader: i.props.loader,
        action: i.props.action,
        hydrateFallbackElement: i.props.hydrateFallbackElement,
        HydrateFallback: i.props.HydrateFallback,
        errorElement: i.props.errorElement,
        ErrorBoundary: i.props.ErrorBoundary,
        hasErrorBoundary:
          i.props.hasErrorBoundary === !0 ||
          i.props.ErrorBoundary != null ||
          i.props.errorElement != null,
        shouldRevalidate: i.props.shouldRevalidate,
        handle: i.props.handle,
        lazy: i.props.lazy,
      };
      (i.props.children && (u.children = yp(i.props.children, a)), t.push(u));
    }),
    t
  );
}
var Wc = "get",
  qc = "application/x-www-form-urlencoded";
function zh(n) {
  return n != null && typeof n.tagName == "string";
}
function iR(n) {
  return zh(n) && n.tagName.toLowerCase() === "button";
}
function sR(n) {
  return zh(n) && n.tagName.toLowerCase() === "form";
}
function oR(n) {
  return zh(n) && n.tagName.toLowerCase() === "input";
}
function aR(n) {
  return !!(n.metaKey || n.altKey || n.ctrlKey || n.shiftKey);
}
function lR(n, e) {
  return n.button === 0 && (!e || e === "_self") && !aR(n);
}
var Dc = null;
function uR() {
  if (Dc === null)
    try {
      (new FormData(document.createElement("form"), 0), (Dc = !1));
    } catch {
      Dc = !0;
    }
  return Dc;
}
var cR = new Set([
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "text/plain",
]);
function jf(n) {
  return n != null && !cR.has(n)
    ? (Dt(
        !1,
        `"${n}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${qc}"`,
      ),
      null)
    : n;
}
function hR(n, e) {
  let t, i, o, a, u;
  if (sR(n)) {
    let d = n.getAttribute("action");
    ((i = d ? hr(d, e) : null),
      (t = n.getAttribute("method") || Wc),
      (o = jf(n.getAttribute("enctype")) || qc),
      (a = new FormData(n)));
  } else if (iR(n) || (oR(n) && (n.type === "submit" || n.type === "image"))) {
    let d = n.form;
    if (d == null)
      throw new Error(
        'Cannot submit a <button> or <input type="submit"> without a <form>',
      );
    let f = n.getAttribute("formaction") || d.getAttribute("action");
    if (
      ((i = f ? hr(f, e) : null),
      (t = n.getAttribute("formmethod") || d.getAttribute("method") || Wc),
      (o =
        jf(n.getAttribute("formenctype")) ||
        jf(d.getAttribute("enctype")) ||
        qc),
      (a = new FormData(d, n)),
      !uR())
    ) {
      let { name: m, type: v, value: w } = n;
      if (v === "image") {
        let T = m ? `${m}.` : "";
        (a.append(`${T}x`, "0"), a.append(`${T}y`, "0"));
      } else m && a.append(m, w);
    }
  } else {
    if (zh(n))
      throw new Error(
        'Cannot submit element that is not <form>, <button>, or <input type="submit|image">',
      );
    ((t = Wc), (i = null), (o = qc), (u = n));
  }
  return (
    a && o === "text/plain" && ((u = a), (a = void 0)),
    { action: i, method: t.toLowerCase(), encType: o, formData: a, body: u }
  );
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function am(n, e) {
  if (n === !1 || n === null || typeof n > "u") throw new Error(e);
}
function dR(n, e, t) {
  let i =
    typeof n == "string"
      ? new URL(
          n,
          typeof window > "u"
            ? "server://singlefetch/"
            : window.location.origin,
        )
      : n;
  return (
    i.pathname === "/"
      ? (i.pathname = `_root.${t}`)
      : e && hr(i.pathname, e) === "/"
        ? (i.pathname = `${e.replace(/\/$/, "")}/_root.${t}`)
        : (i.pathname = `${i.pathname.replace(/\/$/, "")}.${t}`),
    i
  );
}
async function fR(n, e) {
  if (n.id in e) return e[n.id];
  try {
    let t = await import(n.module);
    return ((e[n.id] = t), t);
  } catch (t) {
    return (
      console.error(
        `Error loading route module \`${n.module}\`, reloading page...`,
      ),
      console.error(t),
      window.__reactRouterContext && window.__reactRouterContext.isSpaMode,
      window.location.reload(),
      new Promise(() => {})
    );
  }
}
function pR(n) {
  return n == null
    ? !1
    : n.href == null
      ? n.rel === "preload" &&
        typeof n.imageSrcSet == "string" &&
        typeof n.imageSizes == "string"
      : typeof n.rel == "string" && typeof n.href == "string";
}
async function mR(n, e, t) {
  let i = await Promise.all(
    n.map(async (o) => {
      let a = e.routes[o.route.id];
      if (a) {
        let u = await fR(a, t);
        return u.links ? u.links() : [];
      }
      return [];
    }),
  );
  return _R(
    i
      .flat(1)
      .filter(pR)
      .filter((o) => o.rel === "stylesheet" || o.rel === "preload")
      .map((o) =>
        o.rel === "stylesheet"
          ? { ...o, rel: "prefetch", as: "style" }
          : { ...o, rel: "prefetch" },
      ),
  );
}
function Hv(n, e, t, i, o, a) {
  let u = (f, m) => (t[m] ? f.route.id !== t[m].route.id : !0),
    d = (f, m) =>
      t[m].pathname !== f.pathname ||
      (t[m].route.path?.endsWith("*") && t[m].params["*"] !== f.params["*"]);
  return a === "assets"
    ? e.filter((f, m) => u(f, m) || d(f, m))
    : a === "data"
      ? e.filter((f, m) => {
          let v = i.routes[f.route.id];
          if (!v || !v.hasLoader) return !1;
          if (u(f, m) || d(f, m)) return !0;
          if (f.route.shouldRevalidate) {
            let w = f.route.shouldRevalidate({
              currentUrl: new URL(
                o.pathname + o.search + o.hash,
                window.origin,
              ),
              currentParams: t[0]?.params || {},
              nextUrl: new URL(n, window.origin),
              nextParams: f.params,
              defaultShouldRevalidate: !0,
            });
            if (typeof w == "boolean") return w;
          }
          return !0;
        })
      : [];
}
function gR(n, e, { includeHydrateFallback: t } = {}) {
  return yR(
    n
      .map((i) => {
        let o = e.routes[i.route.id];
        if (!o) return [];
        let a = [o.module];
        return (
          o.clientActionModule && (a = a.concat(o.clientActionModule)),
          o.clientLoaderModule && (a = a.concat(o.clientLoaderModule)),
          t &&
            o.hydrateFallbackModule &&
            (a = a.concat(o.hydrateFallbackModule)),
          o.imports && (a = a.concat(o.imports)),
          a
        );
      })
      .flat(1),
  );
}
function yR(n) {
  return [...new Set(n)];
}
function vR(n) {
  let e = {},
    t = Object.keys(n).sort();
  for (let i of t) e[i] = n[i];
  return e;
}
function _R(n, e) {
  let t = new Set();
  return (
    new Set(e),
    n.reduce((i, o) => {
      let a = JSON.stringify(vR(o));
      return (t.has(a) || (t.add(a), i.push({ key: a, link: o })), i);
    }, [])
  );
}
function dw() {
  let n = z.useContext(Do);
  return (
    am(
      n,
      "You must render this element inside a <DataRouterContext.Provider> element",
    ),
    n
  );
}
function wR() {
  let n = z.useContext(uu);
  return (
    am(
      n,
      "You must render this element inside a <DataRouterStateContext.Provider> element",
    ),
    n
  );
}
var lm = z.createContext(void 0);
lm.displayName = "FrameworkContext";
function fw() {
  let n = z.useContext(lm);
  return (
    am(n, "You must render this element inside a <HydratedRouter> element"),
    n
  );
}
function ER(n, e) {
  let t = z.useContext(lm),
    [i, o] = z.useState(!1),
    [a, u] = z.useState(!1),
    {
      onFocus: d,
      onBlur: f,
      onMouseEnter: m,
      onMouseLeave: v,
      onTouchStart: w,
    } = e,
    T = z.useRef(null);
  (z.useEffect(() => {
    if ((n === "render" && u(!0), n === "viewport")) {
      let j = (X) => {
          X.forEach((q) => {
            u(q.isIntersecting);
          });
        },
        O = new IntersectionObserver(j, { threshold: 0.5 });
      return (
        T.current && O.observe(T.current),
        () => {
          O.disconnect();
        }
      );
    }
  }, [n]),
    z.useEffect(() => {
      if (i) {
        let j = setTimeout(() => {
          u(!0);
        }, 100);
        return () => {
          clearTimeout(j);
        };
      }
    }, [i]));
  let A = () => {
      o(!0);
    },
    D = () => {
      (o(!1), u(!1));
    };
  return t
    ? n !== "intent"
      ? [a, T, {}]
      : [
          a,
          T,
          {
            onFocus: Cl(d, A),
            onBlur: Cl(f, D),
            onMouseEnter: Cl(m, A),
            onMouseLeave: Cl(v, D),
            onTouchStart: Cl(w, A),
          },
        ]
    : [!1, T, {}];
}
function Cl(n, e) {
  return (t) => {
    (n && n(t), t.defaultPrevented || e(t));
  };
}
function TR({ page: n, ...e }) {
  let { router: t } = dw(),
    i = z.useMemo(() => Cs(t.routes, n, t.basename), [t.routes, n, t.basename]);
  return i ? z.createElement(IR, { page: n, matches: i, ...e }) : null;
}
function SR(n) {
  let { manifest: e, routeModules: t } = fw(),
    [i, o] = z.useState([]);
  return (
    z.useEffect(() => {
      let a = !1;
      return (
        mR(n, e, t).then((u) => {
          a || o(u);
        }),
        () => {
          a = !0;
        }
      );
    }, [n, e, t]),
    i
  );
}
function IR({ page: n, matches: e, ...t }) {
  let i = Or(),
    { manifest: o, routeModules: a } = fw(),
    { basename: u } = dw(),
    { loaderData: d, matches: f } = wR(),
    m = z.useMemo(() => Hv(n, e, f, o, i, "data"), [n, e, f, o, i]),
    v = z.useMemo(() => Hv(n, e, f, o, i, "assets"), [n, e, f, o, i]),
    w = z.useMemo(() => {
      if (n === i.pathname + i.search + i.hash) return [];
      let D = new Set(),
        j = !1;
      if (
        (e.forEach((X) => {
          let q = o.routes[X.route.id];
          !q ||
            !q.hasLoader ||
            ((!m.some((G) => G.route.id === X.route.id) &&
              X.route.id in d &&
              a[X.route.id]?.shouldRevalidate) ||
            q.hasClientLoader
              ? (j = !0)
              : D.add(X.route.id));
        }),
        D.size === 0)
      )
        return [];
      let O = dR(n, u, "data");
      return (
        j &&
          D.size > 0 &&
          O.searchParams.set(
            "_routes",
            e
              .filter((X) => D.has(X.route.id))
              .map((X) => X.route.id)
              .join(","),
          ),
        [O.pathname + O.search]
      );
    }, [u, d, i, o, m, e, n, a]),
    T = z.useMemo(() => gR(v, o), [v, o]),
    A = SR(v);
  return z.createElement(
    z.Fragment,
    null,
    w.map((D) =>
      z.createElement("link", {
        key: D,
        rel: "prefetch",
        as: "fetch",
        href: D,
        ...t,
      }),
    ),
    T.map((D) =>
      z.createElement("link", { key: D, rel: "modulepreload", href: D, ...t }),
    ),
    A.map(({ key: D, link: j }) =>
      z.createElement("link", { key: D, nonce: t.nonce, ...j }),
    ),
  );
}
function RR(...n) {
  return (e) => {
    n.forEach((t) => {
      typeof t == "function" ? t(e) : t != null && (t.current = e);
    });
  };
}
var pw =
  typeof window < "u" &&
  typeof window.document < "u" &&
  typeof window.document.createElement < "u";
try {
  pw && (window.__reactRouterVersion = "7.9.6");
} catch {}
function AR(n, e) {
  return d1({
    basename: e?.basename,
    getContext: e?.getContext,
    future: e?.future,
    history: AI({ window: e?.window }),
    hydrationData: e?.hydrationData || CR(),
    routes: n,
    mapRouteProperties: Y1,
    hydrationRouteProperties: X1,
    dataStrategy: e?.dataStrategy,
    patchRoutesOnNavigation: e?.patchRoutesOnNavigation,
    window: e?.window,
    unstable_instrumentations: e?.unstable_instrumentations,
  }).initialize();
}
function CR() {
  let n = window?.__staticRouterHydrationData;
  return (n && n.errors && (n = { ...n, errors: PR(n.errors) }), n);
}
function PR(n) {
  if (!n) return null;
  let e = Object.entries(n),
    t = {};
  for (let [i, o] of e)
    if (o && o.__type === "RouteErrorResponse")
      t[i] = new ah(o.status, o.statusText, o.data, o.internal === !0);
    else if (o && o.__type === "Error") {
      if (o.__subType) {
        let a = window[o.__subType];
        if (typeof a == "function")
          try {
            let u = new a(o.message);
            ((u.stack = ""), (t[i] = u));
          } catch {}
      }
      if (t[i] == null) {
        let a = new Error(o.message);
        ((a.stack = ""), (t[i] = a));
      }
    } else t[i] = o;
  return t;
}
var mw = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  Ql = z.forwardRef(function (
    {
      onClick: e,
      discover: t = "render",
      prefetch: i = "none",
      relative: o,
      reloadDocument: a,
      replace: u,
      state: d,
      target: f,
      to: m,
      preventScrollReset: v,
      viewTransition: w,
      ...T
    },
    A,
  ) {
    let { basename: D } = z.useContext(Nr),
      j = typeof m == "string" && mw.test(m),
      O,
      X = !1;
    if (typeof m == "string" && j && ((O = m), pw))
      try {
        let C = new URL(window.location.href),
          x = m.startsWith("//") ? new URL(C.protocol + m) : new URL(m),
          L = hr(x.pathname, D);
        x.origin === C.origin && L != null
          ? (m = L + x.search + x.hash)
          : (X = !0);
      } catch {
        Dt(
          !1,
          `<Link to="${m}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`,
        );
      }
    let q = M1(m, { relative: o }),
      [G, ae, ee] = ER(i, T),
      he = DR(m, {
        replace: u,
        state: d,
        target: f,
        preventScrollReset: v,
        relative: o,
        viewTransition: w,
      });
    function S(C) {
      (e && e(C), C.defaultPrevented || he(C));
    }
    let R = z.createElement("a", {
      ...T,
      ...ee,
      href: O || q,
      onClick: X || a ? e : S,
      ref: RR(A, ae),
      target: f,
      "data-discover": !j && t === "render" ? "true" : void 0,
    });
    return G && !j
      ? z.createElement(z.Fragment, null, R, z.createElement(TR, { page: q }))
      : R;
  });
Ql.displayName = "Link";
var kR = z.forwardRef(function (
  {
    "aria-current": e = "page",
    caseSensitive: t = !1,
    className: i = "",
    end: o = !1,
    style: a,
    to: u,
    viewTransition: d,
    children: f,
    ...m
  },
  v,
) {
  let w = hu(u, { relative: m.relative }),
    T = Or(),
    A = z.useContext(uu),
    { navigator: D, basename: j } = z.useContext(Nr),
    O = A != null && VR(w) && d === !0,
    X = D.encodeLocation ? D.encodeLocation(w).pathname : w.pathname,
    q = T.pathname,
    G =
      A && A.navigation && A.navigation.location
        ? A.navigation.location.pathname
        : null;
  (t ||
    ((q = q.toLowerCase()),
    (G = G ? G.toLowerCase() : null),
    (X = X.toLowerCase())),
    G && j && (G = hr(G, j) || G));
  const ae = X !== "/" && X.endsWith("/") ? X.length - 1 : X.length;
  let ee = q === X || (!o && q.startsWith(X) && q.charAt(ae) === "/"),
    he =
      G != null &&
      (G === X || (!o && G.startsWith(X) && G.charAt(X.length) === "/")),
    S = { isActive: ee, isPending: he, isTransitioning: O },
    R = ee ? e : void 0,
    C;
  typeof i == "function"
    ? (C = i(S))
    : (C = [
        i,
        ee ? "active" : null,
        he ? "pending" : null,
        O ? "transitioning" : null,
      ]
        .filter(Boolean)
        .join(" "));
  let x = typeof a == "function" ? a(S) : a;
  return z.createElement(
    Ql,
    {
      ...m,
      "aria-current": R,
      className: C,
      ref: v,
      style: x,
      to: u,
      viewTransition: d,
    },
    typeof f == "function" ? f(S) : f,
  );
});
kR.displayName = "NavLink";
var xR = z.forwardRef(
  (
    {
      discover: n = "render",
      fetcherKey: e,
      navigate: t,
      reloadDocument: i,
      replace: o,
      state: a,
      method: u = Wc,
      action: d,
      onSubmit: f,
      relative: m,
      preventScrollReset: v,
      viewTransition: w,
      ...T
    },
    A,
  ) => {
    let D = LR(),
      j = MR(d, { relative: m }),
      O = u.toLowerCase() === "get" ? "get" : "post",
      X = typeof d == "string" && mw.test(d),
      q = (G) => {
        if ((f && f(G), G.defaultPrevented)) return;
        G.preventDefault();
        let ae = G.nativeEvent.submitter,
          ee = ae?.getAttribute("formmethod") || u;
        D(ae || G.currentTarget, {
          fetcherKey: e,
          method: ee,
          navigate: t,
          replace: o,
          state: a,
          relative: m,
          preventScrollReset: v,
          viewTransition: w,
        });
      };
    return z.createElement("form", {
      ref: A,
      method: O,
      action: j,
      onSubmit: i ? f : q,
      ...T,
      "data-discover": !X && n === "render" ? "true" : void 0,
    });
  },
);
xR.displayName = "Form";
function bR(n) {
  return `${n} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`;
}
function gw(n) {
  let e = z.useContext(Do);
  return (Be(e, bR(n)), e);
}
function DR(
  n,
  {
    target: e,
    replace: t,
    state: i,
    preventScrollReset: o,
    relative: a,
    viewTransition: u,
  } = {},
) {
  let d = Uh(),
    f = Or(),
    m = hu(n, { relative: a });
  return z.useCallback(
    (v) => {
      if (lR(v, e)) {
        v.preventDefault();
        let w = t !== void 0 ? t : si(f) === si(m);
        d(n, {
          replace: w,
          state: i,
          preventScrollReset: o,
          relative: a,
          viewTransition: u,
        });
      }
    },
    [f, d, m, t, i, e, n, o, a, u],
  );
}
var NR = 0,
  OR = () => `__${String(++NR)}__`;
function LR() {
  let { router: n } = gw("useSubmit"),
    { basename: e } = z.useContext(Nr),
    t = K1();
  return z.useCallback(
    async (i, o = {}) => {
      let { action: a, method: u, encType: d, formData: f, body: m } = hR(i, e);
      if (o.navigate === !1) {
        let v = o.fetcherKey || OR();
        await n.fetch(v, t, o.action || a, {
          preventScrollReset: o.preventScrollReset,
          formData: f,
          body: m,
          formMethod: o.method || u,
          formEncType: o.encType || d,
          flushSync: o.flushSync,
        });
      } else
        await n.navigate(o.action || a, {
          preventScrollReset: o.preventScrollReset,
          formData: f,
          body: m,
          formMethod: o.method || u,
          formEncType: o.encType || d,
          replace: o.replace,
          state: o.state,
          fromRouteId: t,
          flushSync: o.flushSync,
          viewTransition: o.viewTransition,
        });
    },
    [n, e, t],
  );
}
function MR(n, { relative: e } = {}) {
  let { basename: t } = z.useContext(Nr),
    i = z.useContext(ci);
  Be(i, "useFormAction must be used inside a RouteContext");
  let [o] = i.matches.slice(-1),
    a = { ...hu(n || ".", { relative: e }) },
    u = Or();
  if (n == null) {
    a.search = u.search;
    let d = new URLSearchParams(a.search),
      f = d.getAll("index");
    if (f.some((v) => v === "")) {
      (d.delete("index"),
        f.filter((w) => w).forEach((w) => d.append("index", w)));
      let v = d.toString();
      a.search = v ? `?${v}` : "";
    }
  }
  return (
    (!n || n === ".") &&
      o.route.index &&
      (a.search = a.search ? a.search.replace(/^\?/, "?index&") : "?index"),
    t !== "/" && (a.pathname = a.pathname === "/" ? t : Jr([t, a.pathname])),
    si(a)
  );
}
function VR(n, { relative: e } = {}) {
  let t = z.useContext(rm);
  Be(
    t != null,
    "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?",
  );
  let { basename: i } = gw("useViewTransitionState"),
    o = hu(n, { relative: e });
  if (!t.isTransitioning) return !1;
  let a = hr(t.currentLocation.pathname, i) || t.currentLocation.pathname,
    u = hr(t.nextLocation.pathname, i) || t.nextLocation.pathname;
  return oh(o.pathname, u) != null || oh(o.pathname, a) != null;
}
var Bf = { exports: {} },
  Ln = {},
  $f = { exports: {} },
  Hf = {};
var Wv;
function FR() {
  return (
    Wv ||
      ((Wv = 1),
      (function (n) {
        function e(oe, me) {
          var de = oe.length;
          oe.push(me);
          e: for (; 0 < de; ) {
            var V = (de - 1) >>> 1,
              J = oe[V];
            if (0 < o(J, me)) ((oe[V] = me), (oe[de] = J), (de = V));
            else break e;
          }
        }
        function t(oe) {
          return oe.length === 0 ? null : oe[0];
        }
        function i(oe) {
          if (oe.length === 0) return null;
          var me = oe[0],
            de = oe.pop();
          if (de !== me) {
            oe[0] = de;
            e: for (var V = 0, J = oe.length, ye = J >>> 1; V < ye; ) {
              var Ne = 2 * (V + 1) - 1,
                Fe = oe[Ne],
                We = Ne + 1,
                Ge = oe[We];
              if (0 > o(Fe, de))
                We < J && 0 > o(Ge, Fe)
                  ? ((oe[V] = Ge), (oe[We] = de), (V = We))
                  : ((oe[V] = Fe), (oe[Ne] = de), (V = Ne));
              else if (We < J && 0 > o(Ge, de))
                ((oe[V] = Ge), (oe[We] = de), (V = We));
              else break e;
            }
          }
          return me;
        }
        function o(oe, me) {
          var de = oe.sortIndex - me.sortIndex;
          return de !== 0 ? de : oe.id - me.id;
        }
        if (
          typeof performance == "object" &&
          typeof performance.now == "function"
        ) {
          var a = performance;
          n.unstable_now = function () {
            return a.now();
          };
        } else {
          var u = Date,
            d = u.now();
          n.unstable_now = function () {
            return u.now() - d;
          };
        }
        var f = [],
          m = [],
          v = 1,
          w = null,
          T = 3,
          A = !1,
          D = !1,
          j = !1,
          O = typeof setTimeout == "function" ? setTimeout : null,
          X = typeof clearTimeout == "function" ? clearTimeout : null,
          q = typeof setImmediate < "u" ? setImmediate : null;
        typeof navigator < "u" &&
          navigator.scheduling !== void 0 &&
          navigator.scheduling.isInputPending !== void 0 &&
          navigator.scheduling.isInputPending.bind(navigator.scheduling);
        function G(oe) {
          for (var me = t(m); me !== null; ) {
            if (me.callback === null) i(m);
            else if (me.startTime <= oe)
              (i(m), (me.sortIndex = me.expirationTime), e(f, me));
            else break;
            me = t(m);
          }
        }
        function ae(oe) {
          if (((j = !1), G(oe), !D))
            if (t(f) !== null) ((D = !0), lt(ee));
            else {
              var me = t(m);
              me !== null && Ce(ae, me.startTime - oe);
            }
        }
        function ee(oe, me) {
          ((D = !1), j && ((j = !1), X(R), (R = -1)), (A = !0));
          var de = T;
          try {
            for (
              G(me), w = t(f);
              w !== null && (!(w.expirationTime > me) || (oe && !L()));

            ) {
              var V = w.callback;
              if (typeof V == "function") {
                ((w.callback = null), (T = w.priorityLevel));
                var J = V(w.expirationTime <= me);
                ((me = n.unstable_now()),
                  typeof J == "function"
                    ? (w.callback = J)
                    : w === t(f) && i(f),
                  G(me));
              } else i(f);
              w = t(f);
            }
            if (w !== null) var ye = !0;
            else {
              var Ne = t(m);
              (Ne !== null && Ce(ae, Ne.startTime - me), (ye = !1));
            }
            return ye;
          } finally {
            ((w = null), (T = de), (A = !1));
          }
        }
        var he = !1,
          S = null,
          R = -1,
          C = 5,
          x = -1;
        function L() {
          return !(n.unstable_now() - x < C);
        }
        function U() {
          if (S !== null) {
            var oe = n.unstable_now();
            x = oe;
            var me = !0;
            try {
              me = S(!0, oe);
            } finally {
              me ? k() : ((he = !1), (S = null));
            }
          } else he = !1;
        }
        var k;
        if (typeof q == "function")
          k = function () {
            q(U);
          };
        else if (typeof MessageChannel < "u") {
          var Oe = new MessageChannel(),
            He = Oe.port2;
          ((Oe.port1.onmessage = U),
            (k = function () {
              He.postMessage(null);
            }));
        } else
          k = function () {
            O(U, 0);
          };
        function lt(oe) {
          ((S = oe), he || ((he = !0), k()));
        }
        function Ce(oe, me) {
          R = O(function () {
            oe(n.unstable_now());
          }, me);
        }
        ((n.unstable_IdlePriority = 5),
          (n.unstable_ImmediatePriority = 1),
          (n.unstable_LowPriority = 4),
          (n.unstable_NormalPriority = 3),
          (n.unstable_Profiling = null),
          (n.unstable_UserBlockingPriority = 2),
          (n.unstable_cancelCallback = function (oe) {
            oe.callback = null;
          }),
          (n.unstable_continueExecution = function () {
            D || A || ((D = !0), lt(ee));
          }),
          (n.unstable_forceFrameRate = function (oe) {
            0 > oe || 125 < oe
              ? console.error(
                  "forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported",
                )
              : (C = 0 < oe ? Math.floor(1e3 / oe) : 5);
          }),
          (n.unstable_getCurrentPriorityLevel = function () {
            return T;
          }),
          (n.unstable_getFirstCallbackNode = function () {
            return t(f);
          }),
          (n.unstable_next = function (oe) {
            switch (T) {
              case 1:
              case 2:
              case 3:
                var me = 3;
                break;
              default:
                me = T;
            }
            var de = T;
            T = me;
            try {
              return oe();
            } finally {
              T = de;
            }
          }),
          (n.unstable_pauseExecution = function () {}),
          (n.unstable_requestPaint = function () {}),
          (n.unstable_runWithPriority = function (oe, me) {
            switch (oe) {
              case 1:
              case 2:
              case 3:
              case 4:
              case 5:
                break;
              default:
                oe = 3;
            }
            var de = T;
            T = oe;
            try {
              return me();
            } finally {
              T = de;
            }
          }),
          (n.unstable_scheduleCallback = function (oe, me, de) {
            var V = n.unstable_now();
            switch (
              (typeof de == "object" && de !== null
                ? ((de = de.delay),
                  (de = typeof de == "number" && 0 < de ? V + de : V))
                : (de = V),
              oe)
            ) {
              case 1:
                var J = -1;
                break;
              case 2:
                J = 250;
                break;
              case 5:
                J = 1073741823;
                break;
              case 4:
                J = 1e4;
                break;
              default:
                J = 5e3;
            }
            return (
              (J = de + J),
              (oe = {
                id: v++,
                callback: me,
                priorityLevel: oe,
                startTime: de,
                expirationTime: J,
                sortIndex: -1,
              }),
              de > V
                ? ((oe.sortIndex = de),
                  e(m, oe),
                  t(f) === null &&
                    oe === t(m) &&
                    (j ? (X(R), (R = -1)) : (j = !0), Ce(ae, de - V)))
                : ((oe.sortIndex = J), e(f, oe), D || A || ((D = !0), lt(ee))),
              oe
            );
          }),
          (n.unstable_shouldYield = L),
          (n.unstable_wrapCallback = function (oe) {
            var me = T;
            return function () {
              var de = T;
              T = me;
              try {
                return oe.apply(this, arguments);
              } finally {
                T = de;
              }
            };
          }));
      })(Hf)),
    Hf
  );
}
var qv;
function UR() {
  return (qv || ((qv = 1), ($f.exports = FR())), $f.exports);
}
var Kv;
function zR() {
  if (Kv) return Ln;
  Kv = 1;
  var n = Lh(),
    e = UR();
  function t(r) {
    for (
      var s = "https://reactjs.org/docs/error-decoder.html?invariant=" + r,
        l = 1;
      l < arguments.length;
      l++
    )
      s += "&args[]=" + encodeURIComponent(arguments[l]);
    return (
      "Minified React error #" +
      r +
      "; visit " +
      s +
      " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    );
  }
  var i = new Set(),
    o = {};
  function a(r, s) {
    (u(r, s), u(r + "Capture", s));
  }
  function u(r, s) {
    for (o[r] = s, r = 0; r < s.length; r++) i.add(s[r]);
  }
  var d = !(
      typeof window > "u" ||
      typeof window.document > "u" ||
      typeof window.document.createElement > "u"
    ),
    f = Object.prototype.hasOwnProperty,
    m =
      /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
    v = {},
    w = {};
  function T(r) {
    return f.call(w, r)
      ? !0
      : f.call(v, r)
        ? !1
        : m.test(r)
          ? (w[r] = !0)
          : ((v[r] = !0), !1);
  }
  function A(r, s, l, h) {
    if (l !== null && l.type === 0) return !1;
    switch (typeof s) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return h
          ? !1
          : l !== null
            ? !l.acceptsBooleans
            : ((r = r.toLowerCase().slice(0, 5)),
              r !== "data-" && r !== "aria-");
      default:
        return !1;
    }
  }
  function D(r, s, l, h) {
    if (s === null || typeof s > "u" || A(r, s, l, h)) return !0;
    if (h) return !1;
    if (l !== null)
      switch (l.type) {
        case 3:
          return !s;
        case 4:
          return s === !1;
        case 5:
          return isNaN(s);
        case 6:
          return isNaN(s) || 1 > s;
      }
    return !1;
  }
  function j(r, s, l, h, p, y, E) {
    ((this.acceptsBooleans = s === 2 || s === 3 || s === 4),
      (this.attributeName = h),
      (this.attributeNamespace = p),
      (this.mustUseProperty = l),
      (this.propertyName = r),
      (this.type = s),
      (this.sanitizeURL = y),
      (this.removeEmptyString = E));
  }
  var O = {};
  ("children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
    .split(" ")
    .forEach(function (r) {
      O[r] = new j(r, 0, !1, r, null, !1, !1);
    }),
    [
      ["acceptCharset", "accept-charset"],
      ["className", "class"],
      ["htmlFor", "for"],
      ["httpEquiv", "http-equiv"],
    ].forEach(function (r) {
      var s = r[0];
      O[s] = new j(s, 1, !1, r[1], null, !1, !1);
    }),
    ["contentEditable", "draggable", "spellCheck", "value"].forEach(
      function (r) {
        O[r] = new j(r, 2, !1, r.toLowerCase(), null, !1, !1);
      },
    ),
    [
      "autoReverse",
      "externalResourcesRequired",
      "focusable",
      "preserveAlpha",
    ].forEach(function (r) {
      O[r] = new j(r, 2, !1, r, null, !1, !1);
    }),
    "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
      .split(" ")
      .forEach(function (r) {
        O[r] = new j(r, 3, !1, r.toLowerCase(), null, !1, !1);
      }),
    ["checked", "multiple", "muted", "selected"].forEach(function (r) {
      O[r] = new j(r, 3, !0, r, null, !1, !1);
    }),
    ["capture", "download"].forEach(function (r) {
      O[r] = new j(r, 4, !1, r, null, !1, !1);
    }),
    ["cols", "rows", "size", "span"].forEach(function (r) {
      O[r] = new j(r, 6, !1, r, null, !1, !1);
    }),
    ["rowSpan", "start"].forEach(function (r) {
      O[r] = new j(r, 5, !1, r.toLowerCase(), null, !1, !1);
    }));
  var X = /[\-:]([a-z])/g;
  function q(r) {
    return r[1].toUpperCase();
  }
  ("accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
    .split(" ")
    .forEach(function (r) {
      var s = r.replace(X, q);
      O[s] = new j(s, 1, !1, r, null, !1, !1);
    }),
    "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
      .split(" ")
      .forEach(function (r) {
        var s = r.replace(X, q);
        O[s] = new j(s, 1, !1, r, "http://www.w3.org/1999/xlink", !1, !1);
      }),
    ["xml:base", "xml:lang", "xml:space"].forEach(function (r) {
      var s = r.replace(X, q);
      O[s] = new j(s, 1, !1, r, "http://www.w3.org/XML/1998/namespace", !1, !1);
    }),
    ["tabIndex", "crossOrigin"].forEach(function (r) {
      O[r] = new j(r, 1, !1, r.toLowerCase(), null, !1, !1);
    }),
    (O.xlinkHref = new j(
      "xlinkHref",
      1,
      !1,
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      !0,
      !1,
    )),
    ["src", "href", "action", "formAction"].forEach(function (r) {
      O[r] = new j(r, 1, !1, r.toLowerCase(), null, !0, !0);
    }));
  function G(r, s, l, h) {
    var p = O.hasOwnProperty(s) ? O[s] : null;
    (p !== null
      ? p.type !== 0
      : h ||
        !(2 < s.length) ||
        (s[0] !== "o" && s[0] !== "O") ||
        (s[1] !== "n" && s[1] !== "N")) &&
      (D(s, l, p, h) && (l = null),
      h || p === null
        ? T(s) &&
          (l === null ? r.removeAttribute(s) : r.setAttribute(s, "" + l))
        : p.mustUseProperty
          ? (r[p.propertyName] = l === null ? (p.type === 3 ? !1 : "") : l)
          : ((s = p.attributeName),
            (h = p.attributeNamespace),
            l === null
              ? r.removeAttribute(s)
              : ((p = p.type),
                (l = p === 3 || (p === 4 && l === !0) ? "" : "" + l),
                h ? r.setAttributeNS(h, s, l) : r.setAttribute(s, l))));
  }
  var ae = n.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
    ee = Symbol.for("react.element"),
    he = Symbol.for("react.portal"),
    S = Symbol.for("react.fragment"),
    R = Symbol.for("react.strict_mode"),
    C = Symbol.for("react.profiler"),
    x = Symbol.for("react.provider"),
    L = Symbol.for("react.context"),
    U = Symbol.for("react.forward_ref"),
    k = Symbol.for("react.suspense"),
    Oe = Symbol.for("react.suspense_list"),
    He = Symbol.for("react.memo"),
    lt = Symbol.for("react.lazy"),
    Ce = Symbol.for("react.offscreen"),
    oe = Symbol.iterator;
  function me(r) {
    return r === null || typeof r != "object"
      ? null
      : ((r = (oe && r[oe]) || r["@@iterator"]),
        typeof r == "function" ? r : null);
  }
  var de = Object.assign,
    V;
  function J(r) {
    if (V === void 0)
      try {
        throw Error();
      } catch (l) {
        var s = l.stack.trim().match(/\n( *(at )?)/);
        V = (s && s[1]) || "";
      }
    return (
      `
` +
      V +
      r
    );
  }
  var ye = !1;
  function Ne(r, s) {
    if (!r || ye) return "";
    ye = !0;
    var l = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (s)
        if (
          ((s = function () {
            throw Error();
          }),
          Object.defineProperty(s.prototype, "props", {
            set: function () {
              throw Error();
            },
          }),
          typeof Reflect == "object" && Reflect.construct)
        ) {
          try {
            Reflect.construct(s, []);
          } catch (K) {
            var h = K;
          }
          Reflect.construct(r, [], s);
        } else {
          try {
            s.call();
          } catch (K) {
            h = K;
          }
          r.call(s.prototype);
        }
      else {
        try {
          throw Error();
        } catch (K) {
          h = K;
        }
        r();
      }
    } catch (K) {
      if (K && h && typeof K.stack == "string") {
        for (
          var p = K.stack.split(`
`),
            y = h.stack.split(`
`),
            E = p.length - 1,
            P = y.length - 1;
          1 <= E && 0 <= P && p[E] !== y[P];

        )
          P--;
        for (; 1 <= E && 0 <= P; E--, P--)
          if (p[E] !== y[P]) {
            if (E !== 1 || P !== 1)
              do
                if ((E--, P--, 0 > P || p[E] !== y[P])) {
                  var N =
                    `
` + p[E].replace(" at new ", " at ");
                  return (
                    r.displayName &&
                      N.includes("<anonymous>") &&
                      (N = N.replace("<anonymous>", r.displayName)),
                    N
                  );
                }
              while (1 <= E && 0 <= P);
            break;
          }
      }
    } finally {
      ((ye = !1), (Error.prepareStackTrace = l));
    }
    return (r = r ? r.displayName || r.name : "") ? J(r) : "";
  }
  function Fe(r) {
    switch (r.tag) {
      case 5:
        return J(r.type);
      case 16:
        return J("Lazy");
      case 13:
        return J("Suspense");
      case 19:
        return J("SuspenseList");
      case 0:
      case 2:
      case 15:
        return ((r = Ne(r.type, !1)), r);
      case 11:
        return ((r = Ne(r.type.render, !1)), r);
      case 1:
        return ((r = Ne(r.type, !0)), r);
      default:
        return "";
    }
  }
  function We(r) {
    if (r == null) return null;
    if (typeof r == "function") return r.displayName || r.name || null;
    if (typeof r == "string") return r;
    switch (r) {
      case S:
        return "Fragment";
      case he:
        return "Portal";
      case C:
        return "Profiler";
      case R:
        return "StrictMode";
      case k:
        return "Suspense";
      case Oe:
        return "SuspenseList";
    }
    if (typeof r == "object")
      switch (r.$$typeof) {
        case L:
          return (r.displayName || "Context") + ".Consumer";
        case x:
          return (r._context.displayName || "Context") + ".Provider";
        case U:
          var s = r.render;
          return (
            (r = r.displayName),
            r ||
              ((r = s.displayName || s.name || ""),
              (r = r !== "" ? "ForwardRef(" + r + ")" : "ForwardRef")),
            r
          );
        case He:
          return (
            (s = r.displayName || null),
            s !== null ? s : We(r.type) || "Memo"
          );
        case lt:
          ((s = r._payload), (r = r._init));
          try {
            return We(r(s));
          } catch {}
      }
    return null;
  }
  function Ge(r) {
    var s = r.type;
    switch (r.tag) {
      case 24:
        return "Cache";
      case 9:
        return (s.displayName || "Context") + ".Consumer";
      case 10:
        return (s._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return (
          (r = s.render),
          (r = r.displayName || r.name || ""),
          s.displayName || (r !== "" ? "ForwardRef(" + r + ")" : "ForwardRef")
        );
      case 7:
        return "Fragment";
      case 5:
        return s;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return We(s);
      case 8:
        return s === R ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof s == "function") return s.displayName || s.name || null;
        if (typeof s == "string") return s;
    }
    return null;
  }
  function tt(r) {
    switch (typeof r) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return r;
      case "object":
        return r;
      default:
        return "";
    }
  }
  function dt(r) {
    var s = r.type;
    return (
      (r = r.nodeName) &&
      r.toLowerCase() === "input" &&
      (s === "checkbox" || s === "radio")
    );
  }
  function Lt(r) {
    var s = dt(r) ? "checked" : "value",
      l = Object.getOwnPropertyDescriptor(r.constructor.prototype, s),
      h = "" + r[s];
    if (
      !r.hasOwnProperty(s) &&
      typeof l < "u" &&
      typeof l.get == "function" &&
      typeof l.set == "function"
    ) {
      var p = l.get,
        y = l.set;
      return (
        Object.defineProperty(r, s, {
          configurable: !0,
          get: function () {
            return p.call(this);
          },
          set: function (E) {
            ((h = "" + E), y.call(this, E));
          },
        }),
        Object.defineProperty(r, s, { enumerable: l.enumerable }),
        {
          getValue: function () {
            return h;
          },
          setValue: function (E) {
            h = "" + E;
          },
          stopTracking: function () {
            ((r._valueTracker = null), delete r[s]);
          },
        }
      );
    }
  }
  function mt(r) {
    r._valueTracker || (r._valueTracker = Lt(r));
  }
  function Fn(r) {
    if (!r) return !1;
    var s = r._valueTracker;
    if (!s) return !0;
    var l = s.getValue(),
      h = "";
    return (
      r && (h = dt(r) ? (r.checked ? "true" : "false") : r.value),
      (r = h),
      r !== l ? (s.setValue(r), !0) : !1
    );
  }
  function dr(r) {
    if (
      ((r = r || (typeof document < "u" ? document : void 0)), typeof r > "u")
    )
      return null;
    try {
      return r.activeElement || r.body;
    } catch {
      return r.body;
    }
  }
  function hi(r, s) {
    var l = s.checked;
    return de({}, s, {
      defaultChecked: void 0,
      defaultValue: void 0,
      value: void 0,
      checked: l ?? r._wrapperState.initialChecked,
    });
  }
  function Rn(r, s) {
    var l = s.defaultValue == null ? "" : s.defaultValue,
      h = s.checked != null ? s.checked : s.defaultChecked;
    ((l = tt(s.value != null ? s.value : l)),
      (r._wrapperState = {
        initialChecked: h,
        initialValue: l,
        controlled:
          s.type === "checkbox" || s.type === "radio"
            ? s.checked != null
            : s.value != null,
      }));
  }
  function Ks(r, s) {
    ((s = s.checked), s != null && G(r, "checked", s, !1));
  }
  function Gs(r, s) {
    Ks(r, s);
    var l = tt(s.value),
      h = s.type;
    if (l != null)
      h === "number"
        ? ((l === 0 && r.value === "") || r.value != l) && (r.value = "" + l)
        : r.value !== "" + l && (r.value = "" + l);
    else if (h === "submit" || h === "reset") {
      r.removeAttribute("value");
      return;
    }
    (s.hasOwnProperty("value")
      ? Ki(r, s.type, l)
      : s.hasOwnProperty("defaultValue") && Ki(r, s.type, tt(s.defaultValue)),
      s.checked == null &&
        s.defaultChecked != null &&
        (r.defaultChecked = !!s.defaultChecked));
  }
  function Qs(r, s, l) {
    if (s.hasOwnProperty("value") || s.hasOwnProperty("defaultValue")) {
      var h = s.type;
      if (
        !(
          (h !== "submit" && h !== "reset") ||
          (s.value !== void 0 && s.value !== null)
        )
      )
        return;
      ((s = "" + r._wrapperState.initialValue),
        l || s === r.value || (r.value = s),
        (r.defaultValue = s));
    }
    ((l = r.name),
      l !== "" && (r.name = ""),
      (r.defaultChecked = !!r._wrapperState.initialChecked),
      l !== "" && (r.name = l));
  }
  function Ki(r, s, l) {
    (s !== "number" || dr(r.ownerDocument) !== r) &&
      (l == null
        ? (r.defaultValue = "" + r._wrapperState.initialValue)
        : r.defaultValue !== "" + l && (r.defaultValue = "" + l));
  }
  var fr = Array.isArray;
  function pr(r, s, l, h) {
    if (((r = r.options), s)) {
      s = {};
      for (var p = 0; p < l.length; p++) s["$" + l[p]] = !0;
      for (l = 0; l < r.length; l++)
        ((p = s.hasOwnProperty("$" + r[l].value)),
          r[l].selected !== p && (r[l].selected = p),
          p && h && (r[l].defaultSelected = !0));
    } else {
      for (l = "" + tt(l), s = null, p = 0; p < r.length; p++) {
        if (r[p].value === l) {
          ((r[p].selected = !0), h && (r[p].defaultSelected = !0));
          return;
        }
        s !== null || r[p].disabled || (s = r[p]);
      }
      s !== null && (s.selected = !0);
    }
  }
  function Ys(r, s) {
    if (s.dangerouslySetInnerHTML != null) throw Error(t(91));
    return de({}, s, {
      value: void 0,
      defaultValue: void 0,
      children: "" + r._wrapperState.initialValue,
    });
  }
  function An(r, s) {
    var l = s.value;
    if (l == null) {
      if (((l = s.children), (s = s.defaultValue), l != null)) {
        if (s != null) throw Error(t(92));
        if (fr(l)) {
          if (1 < l.length) throw Error(t(93));
          l = l[0];
        }
        s = l;
      }
      (s == null && (s = ""), (l = s));
    }
    r._wrapperState = { initialValue: tt(l) };
  }
  function Gn(r, s) {
    var l = tt(s.value),
      h = tt(s.defaultValue);
    (l != null &&
      ((l = "" + l),
      l !== r.value && (r.value = l),
      s.defaultValue == null && r.defaultValue !== l && (r.defaultValue = l)),
      h != null && (r.defaultValue = "" + h));
  }
  function Gi(r) {
    var s = r.textContent;
    s === r._wrapperState.initialValue &&
      s !== "" &&
      s !== null &&
      (r.value = s);
  }
  function It(r) {
    switch (r) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function ut(r, s) {
    return r == null || r === "http://www.w3.org/1999/xhtml"
      ? It(s)
      : r === "http://www.w3.org/2000/svg" && s === "foreignObject"
        ? "http://www.w3.org/1999/xhtml"
        : r;
  }
  var jt,
    Qi = (function (r) {
      return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
        ? function (s, l, h, p) {
            MSApp.execUnsafeLocalFunction(function () {
              return r(s, l, h, p);
            });
          }
        : r;
    })(function (r, s) {
      if (r.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in r)
        r.innerHTML = s;
      else {
        for (
          jt = jt || document.createElement("div"),
            jt.innerHTML = "<svg>" + s.valueOf().toString() + "</svg>",
            s = jt.firstChild;
          r.firstChild;

        )
          r.removeChild(r.firstChild);
        for (; s.firstChild; ) r.appendChild(s.firstChild);
      }
    });
  function Lr(r, s) {
    if (s) {
      var l = r.firstChild;
      if (l && l === r.lastChild && l.nodeType === 3) {
        l.nodeValue = s;
        return;
      }
    }
    r.textContent = s;
  }
  var mr = {
      animationIterationCount: !0,
      aspectRatio: !0,
      borderImageOutset: !0,
      borderImageSlice: !0,
      borderImageWidth: !0,
      boxFlex: !0,
      boxFlexGroup: !0,
      boxOrdinalGroup: !0,
      columnCount: !0,
      columns: !0,
      flex: !0,
      flexGrow: !0,
      flexPositive: !0,
      flexShrink: !0,
      flexNegative: !0,
      flexOrder: !0,
      gridArea: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowSpan: !0,
      gridRowStart: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnSpan: !0,
      gridColumnStart: !0,
      fontWeight: !0,
      lineClamp: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      tabSize: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeDasharray: !0,
      strokeDashoffset: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
      strokeWidth: !0,
    },
    di = ["Webkit", "ms", "Moz", "O"];
  Object.keys(mr).forEach(function (r) {
    di.forEach(function (s) {
      ((s = s + r.charAt(0).toUpperCase() + r.substring(1)), (mr[s] = mr[r]));
    });
  });
  function vn(r, s, l) {
    return s == null || typeof s == "boolean" || s === ""
      ? ""
      : l || typeof s != "number" || s === 0 || (mr.hasOwnProperty(r) && mr[r])
        ? ("" + s).trim()
        : s + "px";
  }
  function Yi(r, s) {
    r = r.style;
    for (var l in s)
      if (s.hasOwnProperty(l)) {
        var h = l.indexOf("--") === 0,
          p = vn(l, s[l], h);
        (l === "float" && (l = "cssFloat"),
          h ? r.setProperty(l, p) : (r[l] = p));
      }
  }
  var Xi = de(
    { menuitem: !0 },
    {
      area: !0,
      base: !0,
      br: !0,
      col: !0,
      embed: !0,
      hr: !0,
      img: !0,
      input: !0,
      keygen: !0,
      link: !0,
      meta: !0,
      param: !0,
      source: !0,
      track: !0,
      wbr: !0,
    },
  );
  function Ji(r, s) {
    if (s) {
      if (Xi[r] && (s.children != null || s.dangerouslySetInnerHTML != null))
        throw Error(t(137, r));
      if (s.dangerouslySetInnerHTML != null) {
        if (s.children != null) throw Error(t(60));
        if (
          typeof s.dangerouslySetInnerHTML != "object" ||
          !("__html" in s.dangerouslySetInnerHTML)
        )
          throw Error(t(61));
      }
      if (s.style != null && typeof s.style != "object") throw Error(t(62));
    }
  }
  function Xs(r, s) {
    if (r.indexOf("-") === -1) return typeof s.is == "string";
    switch (r) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var Mr = null;
  function gr(r) {
    return (
      (r = r.target || r.srcElement || window),
      r.correspondingUseElement && (r = r.correspondingUseElement),
      r.nodeType === 3 ? r.parentNode : r
    );
  }
  var fi = null,
    un = null,
    Qn = null;
  function pi(r) {
    if ((r = ul(r))) {
      if (typeof fi != "function") throw Error(t(280));
      var s = r.stateNode;
      s && ((s = Wu(s)), fi(r.stateNode, r.type, s));
    }
  }
  function Yn(r) {
    un ? (Qn ? Qn.push(r) : (Qn = [r])) : (un = r);
  }
  function Zi() {
    if (un) {
      var r = un,
        s = Qn;
      if (((Qn = un = null), pi(r), s)) for (r = 0; r < s.length; r++) pi(s[r]);
    }
  }
  function Xn(r, s) {
    return r(s);
  }
  function Vr() {}
  var Jn = !1;
  function Js(r, s, l) {
    if (Jn) return r(s, l);
    Jn = !0;
    try {
      return Xn(r, s, l);
    } finally {
      ((Jn = !1), (un !== null || Qn !== null) && (Vr(), Zi()));
    }
  }
  function Rt(r, s) {
    var l = r.stateNode;
    if (l === null) return null;
    var h = Wu(l);
    if (h === null) return null;
    l = h[s];
    e: switch (s) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        ((h = !h.disabled) ||
          ((r = r.type),
          (h = !(
            r === "button" ||
            r === "input" ||
            r === "select" ||
            r === "textarea"
          ))),
          (r = !h));
        break e;
      default:
        r = !1;
    }
    if (r) return null;
    if (l && typeof l != "function") throw Error(t(231, s, typeof l));
    return l;
  }
  var b = !1;
  if (d)
    try {
      var F = {};
      (Object.defineProperty(F, "passive", {
        get: function () {
          b = !0;
        },
      }),
        window.addEventListener("test", F, F),
        window.removeEventListener("test", F, F));
    } catch {
      b = !1;
    }
  function W(r, s, l, h, p, y, E, P, N) {
    var K = Array.prototype.slice.call(arguments, 3);
    try {
      s.apply(l, K);
    } catch (re) {
      this.onError(re);
    }
  }
  var ne = !1,
    ue = null,
    ge = !1,
    Se = null,
    Ee = {
      onError: function (r) {
        ((ne = !0), (ue = r));
      },
    };
  function Te(r, s, l, h, p, y, E, P, N) {
    ((ne = !1), (ue = null), W.apply(Ee, arguments));
  }
  function Pe(r, s, l, h, p, y, E, P, N) {
    if ((Te.apply(this, arguments), ne)) {
      if (ne) {
        var K = ue;
        ((ne = !1), (ue = null));
      } else throw Error(t(198));
      ge || ((ge = !0), (Se = K));
    }
  }
  function ve(r) {
    var s = r,
      l = r;
    if (r.alternate) for (; s.return; ) s = s.return;
    else {
      r = s;
      do ((s = r), (s.flags & 4098) !== 0 && (l = s.return), (r = s.return));
      while (r);
    }
    return s.tag === 3 ? l : null;
  }
  function Ie(r) {
    if (r.tag === 13) {
      var s = r.memoizedState;
      if (
        (s === null && ((r = r.alternate), r !== null && (s = r.memoizedState)),
        s !== null)
      )
        return s.dehydrated;
    }
    return null;
  }
  function Ue(r) {
    if (ve(r) !== r) throw Error(t(188));
  }
  function ct(r) {
    var s = r.alternate;
    if (!s) {
      if (((s = ve(r)), s === null)) throw Error(t(188));
      return s !== r ? null : r;
    }
    for (var l = r, h = s; ; ) {
      var p = l.return;
      if (p === null) break;
      var y = p.alternate;
      if (y === null) {
        if (((h = p.return), h !== null)) {
          l = h;
          continue;
        }
        break;
      }
      if (p.child === y.child) {
        for (y = p.child; y; ) {
          if (y === l) return (Ue(p), r);
          if (y === h) return (Ue(p), s);
          y = y.sibling;
        }
        throw Error(t(188));
      }
      if (l.return !== h.return) ((l = p), (h = y));
      else {
        for (var E = !1, P = p.child; P; ) {
          if (P === l) {
            ((E = !0), (l = p), (h = y));
            break;
          }
          if (P === h) {
            ((E = !0), (h = p), (l = y));
            break;
          }
          P = P.sibling;
        }
        if (!E) {
          for (P = y.child; P; ) {
            if (P === l) {
              ((E = !0), (l = y), (h = p));
              break;
            }
            if (P === h) {
              ((E = !0), (h = y), (l = p));
              break;
            }
            P = P.sibling;
          }
          if (!E) throw Error(t(189));
        }
      }
      if (l.alternate !== h) throw Error(t(190));
    }
    if (l.tag !== 3) throw Error(t(188));
    return l.stateNode.current === l ? r : s;
  }
  function yt(r) {
    return ((r = ct(r)), r !== null ? vt(r) : null);
  }
  function vt(r) {
    if (r.tag === 5 || r.tag === 6) return r;
    for (r = r.child; r !== null; ) {
      var s = vt(r);
      if (s !== null) return s;
      r = r.sibling;
    }
    return null;
  }
  var rt = e.unstable_scheduleCallback,
    st = e.unstable_cancelCallback,
    Zn = e.unstable_shouldYield,
    mi = e.unstable_requestPaint,
    Xe = e.unstable_now,
    _n = e.unstable_getCurrentPriorityLevel,
    yr = e.unstable_ImmediatePriority,
    Cn = e.unstable_UserBlockingPriority,
    Mt = e.unstable_NormalPriority,
    Fr = e.unstable_LowPriority,
    gi = e.unstable_IdlePriority,
    $e = null,
    ot = null;
  function vr(r) {
    if (ot && typeof ot.onCommitFiberRoot == "function")
      try {
        ot.onCommitFiberRoot($e, r, void 0, (r.current.flags & 128) === 128);
      } catch {}
  }
  var At = Math.clz32 ? Math.clz32 : Zs,
    ft = Math.log,
    yi = Math.LN2;
  function Zs(r) {
    return ((r >>>= 0), r === 0 ? 32 : (31 - ((ft(r) / yi) | 0)) | 0);
  }
  var es = 64,
    Vo = 4194304;
  function ts(r) {
    switch (r & -r) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return r & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return r & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return r;
    }
  }
  function eo(r, s) {
    var l = r.pendingLanes;
    if (l === 0) return 0;
    var h = 0,
      p = r.suspendedLanes,
      y = r.pingedLanes,
      E = l & 268435455;
    if (E !== 0) {
      var P = E & ~p;
      P !== 0 ? (h = ts(P)) : ((y &= E), y !== 0 && (h = ts(y)));
    } else ((E = l & ~p), E !== 0 ? (h = ts(E)) : y !== 0 && (h = ts(y)));
    if (h === 0) return 0;
    if (
      s !== 0 &&
      s !== h &&
      (s & p) === 0 &&
      ((p = h & -h), (y = s & -s), p >= y || (p === 16 && (y & 4194240) !== 0))
    )
      return s;
    if (((h & 4) !== 0 && (h |= l & 16), (s = r.entangledLanes), s !== 0))
      for (r = r.entanglements, s &= h; 0 < s; )
        ((l = 31 - At(s)), (p = 1 << l), (h |= r[l]), (s &= ~p));
    return h;
  }
  function cd(r, s) {
    switch (r) {
      case 1:
      case 2:
      case 4:
        return s + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return s + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function vi(r, s) {
    for (
      var l = r.suspendedLanes,
        h = r.pingedLanes,
        p = r.expirationTimes,
        y = r.pendingLanes;
      0 < y;

    ) {
      var E = 31 - At(y),
        P = 1 << E,
        N = p[E];
      (N === -1
        ? ((P & l) === 0 || (P & h) !== 0) && (p[E] = cd(P, s))
        : N <= s && (r.expiredLanes |= P),
        (y &= ~P));
    }
  }
  function Un(r) {
    return (
      (r = r.pendingLanes & -1073741825),
      r !== 0 ? r : r & 1073741824 ? 1073741824 : 0
    );
  }
  function to() {
    var r = es;
    return ((es <<= 1), (es & 4194240) === 0 && (es = 64), r);
  }
  function ns(r) {
    for (var s = [], l = 0; 31 > l; l++) s.push(r);
    return s;
  }
  function rs(r, s, l) {
    ((r.pendingLanes |= s),
      s !== 536870912 && ((r.suspendedLanes = 0), (r.pingedLanes = 0)),
      (r = r.eventTimes),
      (s = 31 - At(s)),
      (r[s] = l));
  }
  function pt(r, s) {
    var l = r.pendingLanes & ~s;
    ((r.pendingLanes = s),
      (r.suspendedLanes = 0),
      (r.pingedLanes = 0),
      (r.expiredLanes &= s),
      (r.mutableReadLanes &= s),
      (r.entangledLanes &= s),
      (s = r.entanglements));
    var h = r.eventTimes;
    for (r = r.expirationTimes; 0 < l; ) {
      var p = 31 - At(l),
        y = 1 << p;
      ((s[p] = 0), (h[p] = -1), (r[p] = -1), (l &= ~y));
    }
  }
  function is(r, s) {
    var l = (r.entangledLanes |= s);
    for (r = r.entanglements; l; ) {
      var h = 31 - At(l),
        p = 1 << h;
      ((p & s) | (r[h] & s) && (r[h] |= s), (l &= ~p));
    }
  }
  var Je = 0;
  function ss(r) {
    return (
      (r &= -r),
      1 < r ? (4 < r ? ((r & 268435455) !== 0 ? 16 : 536870912) : 4) : 1
    );
  }
  var Iu,
    Fo,
    Ru,
    Au,
    Cu,
    Ga = !1,
    Ur = [],
    Zt = null,
    _r = null,
    wr = null,
    os = new Map(),
    er = new Map(),
    zr = [],
    hd =
      "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
        " ",
      );
  function Pu(r, s) {
    switch (r) {
      case "focusin":
      case "focusout":
        Zt = null;
        break;
      case "dragenter":
      case "dragleave":
        _r = null;
        break;
      case "mouseover":
      case "mouseout":
        wr = null;
        break;
      case "pointerover":
      case "pointerout":
        os.delete(s.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        er.delete(s.pointerId);
    }
  }
  function Pn(r, s, l, h, p, y) {
    return r === null || r.nativeEvent !== y
      ? ((r = {
          blockedOn: s,
          domEventName: l,
          eventSystemFlags: h,
          nativeEvent: y,
          targetContainers: [p],
        }),
        s !== null && ((s = ul(s)), s !== null && Fo(s)),
        r)
      : ((r.eventSystemFlags |= h),
        (s = r.targetContainers),
        p !== null && s.indexOf(p) === -1 && s.push(p),
        r);
  }
  function dd(r, s, l, h, p) {
    switch (s) {
      case "focusin":
        return ((Zt = Pn(Zt, r, s, l, h, p)), !0);
      case "dragenter":
        return ((_r = Pn(_r, r, s, l, h, p)), !0);
      case "mouseover":
        return ((wr = Pn(wr, r, s, l, h, p)), !0);
      case "pointerover":
        var y = p.pointerId;
        return (os.set(y, Pn(os.get(y) || null, r, s, l, h, p)), !0);
      case "gotpointercapture":
        return (
          (y = p.pointerId),
          er.set(y, Pn(er.get(y) || null, r, s, l, h, p)),
          !0
        );
    }
    return !1;
  }
  function ku(r) {
    var s = oo(r.target);
    if (s !== null) {
      var l = ve(s);
      if (l !== null) {
        if (((s = l.tag), s === 13)) {
          if (((s = Ie(l)), s !== null)) {
            ((r.blockedOn = s),
              Cu(r.priority, function () {
                Ru(l);
              }));
            return;
          }
        } else if (s === 3 && l.stateNode.current.memoizedState.isDehydrated) {
          r.blockedOn = l.tag === 3 ? l.stateNode.containerInfo : null;
          return;
        }
      }
    }
    r.blockedOn = null;
  }
  function _i(r) {
    if (r.blockedOn !== null) return !1;
    for (var s = r.targetContainers; 0 < s.length; ) {
      var l = Uo(r.domEventName, r.eventSystemFlags, s[0], r.nativeEvent);
      if (l === null) {
        l = r.nativeEvent;
        var h = new l.constructor(l.type, l);
        ((Mr = h), l.target.dispatchEvent(h), (Mr = null));
      } else return ((s = ul(l)), s !== null && Fo(s), (r.blockedOn = l), !1);
      s.shift();
    }
    return !0;
  }
  function no(r, s, l) {
    _i(r) && l.delete(s);
  }
  function xu() {
    ((Ga = !1),
      Zt !== null && _i(Zt) && (Zt = null),
      _r !== null && _i(_r) && (_r = null),
      wr !== null && _i(wr) && (wr = null),
      os.forEach(no),
      er.forEach(no));
  }
  function Er(r, s) {
    r.blockedOn === s &&
      ((r.blockedOn = null),
      Ga ||
        ((Ga = !0),
        e.unstable_scheduleCallback(e.unstable_NormalPriority, xu)));
  }
  function Tr(r) {
    function s(p) {
      return Er(p, r);
    }
    if (0 < Ur.length) {
      Er(Ur[0], r);
      for (var l = 1; l < Ur.length; l++) {
        var h = Ur[l];
        h.blockedOn === r && (h.blockedOn = null);
      }
    }
    for (
      Zt !== null && Er(Zt, r),
        _r !== null && Er(_r, r),
        wr !== null && Er(wr, r),
        os.forEach(s),
        er.forEach(s),
        l = 0;
      l < zr.length;
      l++
    )
      ((h = zr[l]), h.blockedOn === r && (h.blockedOn = null));
    for (; 0 < zr.length && ((l = zr[0]), l.blockedOn === null); )
      (ku(l), l.blockedOn === null && zr.shift());
  }
  var wi = ae.ReactCurrentBatchConfig,
    as = !0;
  function Tt(r, s, l, h) {
    var p = Je,
      y = wi.transition;
    wi.transition = null;
    try {
      ((Je = 1), Qa(r, s, l, h));
    } finally {
      ((Je = p), (wi.transition = y));
    }
  }
  function fd(r, s, l, h) {
    var p = Je,
      y = wi.transition;
    wi.transition = null;
    try {
      ((Je = 4), Qa(r, s, l, h));
    } finally {
      ((Je = p), (wi.transition = y));
    }
  }
  function Qa(r, s, l, h) {
    if (as) {
      var p = Uo(r, s, l, h);
      if (p === null) (Id(r, s, h, ro, l), Pu(r, h));
      else if (dd(p, r, s, l, h)) h.stopPropagation();
      else if ((Pu(r, h), s & 4 && -1 < hd.indexOf(r))) {
        for (; p !== null; ) {
          var y = ul(p);
          if (
            (y !== null && Iu(y),
            (y = Uo(r, s, l, h)),
            y === null && Id(r, s, h, ro, l),
            y === p)
          )
            break;
          p = y;
        }
        p !== null && h.stopPropagation();
      } else Id(r, s, h, null, l);
    }
  }
  var ro = null;
  function Uo(r, s, l, h) {
    if (((ro = null), (r = gr(h)), (r = oo(r)), r !== null))
      if (((s = ve(r)), s === null)) r = null;
      else if (((l = s.tag), l === 13)) {
        if (((r = Ie(s)), r !== null)) return r;
        r = null;
      } else if (l === 3) {
        if (s.stateNode.current.memoizedState.isDehydrated)
          return s.tag === 3 ? s.stateNode.containerInfo : null;
        r = null;
      } else s !== r && (r = null);
    return ((ro = r), null);
  }
  function Ya(r) {
    switch (r) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (_n()) {
          case yr:
            return 1;
          case Cn:
            return 4;
          case Mt:
          case Fr:
            return 16;
          case gi:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var zn = null,
    zo = null,
    kn = null;
  function Xa() {
    if (kn) return kn;
    var r,
      s = zo,
      l = s.length,
      h,
      p = "value" in zn ? zn.value : zn.textContent,
      y = p.length;
    for (r = 0; r < l && s[r] === p[r]; r++);
    var E = l - r;
    for (h = 1; h <= E && s[l - h] === p[y - h]; h++);
    return (kn = p.slice(r, 1 < h ? 1 - h : void 0));
  }
  function jo(r) {
    var s = r.keyCode;
    return (
      "charCode" in r
        ? ((r = r.charCode), r === 0 && s === 13 && (r = 13))
        : (r = s),
      r === 10 && (r = 13),
      32 <= r || r === 13 ? r : 0
    );
  }
  function jr() {
    return !0;
  }
  function Ja() {
    return !1;
  }
  function en(r) {
    function s(l, h, p, y, E) {
      ((this._reactName = l),
        (this._targetInst = p),
        (this.type = h),
        (this.nativeEvent = y),
        (this.target = E),
        (this.currentTarget = null));
      for (var P in r)
        r.hasOwnProperty(P) && ((l = r[P]), (this[P] = l ? l(y) : y[P]));
      return (
        (this.isDefaultPrevented = (
          y.defaultPrevented != null ? y.defaultPrevented : y.returnValue === !1
        )
          ? jr
          : Ja),
        (this.isPropagationStopped = Ja),
        this
      );
    }
    return (
      de(s.prototype, {
        preventDefault: function () {
          this.defaultPrevented = !0;
          var l = this.nativeEvent;
          l &&
            (l.preventDefault
              ? l.preventDefault()
              : typeof l.returnValue != "unknown" && (l.returnValue = !1),
            (this.isDefaultPrevented = jr));
        },
        stopPropagation: function () {
          var l = this.nativeEvent;
          l &&
            (l.stopPropagation
              ? l.stopPropagation()
              : typeof l.cancelBubble != "unknown" && (l.cancelBubble = !0),
            (this.isPropagationStopped = jr));
        },
        persist: function () {},
        isPersistent: jr,
      }),
      s
    );
  }
  var Sr = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function (r) {
        return r.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0,
    },
    Bo = en(Sr),
    Br = de({}, Sr, { view: 0, detail: 0 }),
    pd = en(Br),
    $o,
    Ei,
    ls,
    io = de({}, Br, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: $r,
      button: 0,
      buttons: 0,
      relatedTarget: function (r) {
        return r.relatedTarget === void 0
          ? r.fromElement === r.srcElement
            ? r.toElement
            : r.fromElement
          : r.relatedTarget;
      },
      movementX: function (r) {
        return "movementX" in r
          ? r.movementX
          : (r !== ls &&
              (ls && r.type === "mousemove"
                ? (($o = r.screenX - ls.screenX), (Ei = r.screenY - ls.screenY))
                : (Ei = $o = 0),
              (ls = r)),
            $o);
      },
      movementY: function (r) {
        return "movementY" in r ? r.movementY : Ei;
      },
    }),
    Ho = en(io),
    Za = de({}, io, { dataTransfer: 0 }),
    bu = en(Za),
    Wo = de({}, Br, { relatedTarget: 0 }),
    qo = en(Wo),
    Du = de({}, Sr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
    Ti = en(Du),
    Nu = de({}, Sr, {
      clipboardData: function (r) {
        return "clipboardData" in r ? r.clipboardData : window.clipboardData;
      },
    }),
    Ou = en(Nu),
    Lu = de({}, Sr, { data: 0 }),
    el = en(Lu),
    Ko = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified",
    },
    wn = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta",
    },
    Mu = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey",
    };
  function Vu(r) {
    var s = this.nativeEvent;
    return s.getModifierState
      ? s.getModifierState(r)
      : (r = Mu[r])
        ? !!s[r]
        : !1;
  }
  function $r() {
    return Vu;
  }
  var c = de({}, Br, {
      key: function (r) {
        if (r.key) {
          var s = Ko[r.key] || r.key;
          if (s !== "Unidentified") return s;
        }
        return r.type === "keypress"
          ? ((r = jo(r)), r === 13 ? "Enter" : String.fromCharCode(r))
          : r.type === "keydown" || r.type === "keyup"
            ? wn[r.keyCode] || "Unidentified"
            : "";
      },
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: $r,
      charCode: function (r) {
        return r.type === "keypress" ? jo(r) : 0;
      },
      keyCode: function (r) {
        return r.type === "keydown" || r.type === "keyup" ? r.keyCode : 0;
      },
      which: function (r) {
        return r.type === "keypress"
          ? jo(r)
          : r.type === "keydown" || r.type === "keyup"
            ? r.keyCode
            : 0;
      },
    }),
    g = en(c),
    _ = de({}, io, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0,
    }),
    I = en(_),
    B = de({}, Br, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: $r,
    }),
    Q = en(B),
    ce = de({}, Sr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
    ht = en(ce),
    Bt = de({}, io, {
      deltaX: function (r) {
        return "deltaX" in r
          ? r.deltaX
          : "wheelDeltaX" in r
            ? -r.wheelDeltaX
            : 0;
      },
      deltaY: function (r) {
        return "deltaY" in r
          ? r.deltaY
          : "wheelDeltaY" in r
            ? -r.wheelDeltaY
            : "wheelDelta" in r
              ? -r.wheelDelta
              : 0;
      },
      deltaZ: 0,
      deltaMode: 0,
    }),
    Ze = en(Bt),
    Kt = [9, 13, 27, 32],
    Vt = d && "CompositionEvent" in window,
    tr = null;
  d && "documentMode" in document && (tr = document.documentMode);
  var jn = d && "TextEvent" in window && !tr,
    so = d && (!Vt || (tr && 8 < tr && 11 >= tr)),
    Go = " ",
    cg = !1;
  function hg(r, s) {
    switch (r) {
      case "keyup":
        return Kt.indexOf(s.keyCode) !== -1;
      case "keydown":
        return s.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function dg(r) {
    return (
      (r = r.detail),
      typeof r == "object" && "data" in r ? r.data : null
    );
  }
  var Qo = !1;
  function yS(r, s) {
    switch (r) {
      case "compositionend":
        return dg(s);
      case "keypress":
        return s.which !== 32 ? null : ((cg = !0), Go);
      case "textInput":
        return ((r = s.data), r === Go && cg ? null : r);
      default:
        return null;
    }
  }
  function vS(r, s) {
    if (Qo)
      return r === "compositionend" || (!Vt && hg(r, s))
        ? ((r = Xa()), (kn = zo = zn = null), (Qo = !1), r)
        : null;
    switch (r) {
      case "paste":
        return null;
      case "keypress":
        if (!(s.ctrlKey || s.altKey || s.metaKey) || (s.ctrlKey && s.altKey)) {
          if (s.char && 1 < s.char.length) return s.char;
          if (s.which) return String.fromCharCode(s.which);
        }
        return null;
      case "compositionend":
        return so && s.locale !== "ko" ? null : s.data;
      default:
        return null;
    }
  }
  var _S = {
    color: !0,
    date: !0,
    datetime: !0,
    "datetime-local": !0,
    email: !0,
    month: !0,
    number: !0,
    password: !0,
    range: !0,
    search: !0,
    tel: !0,
    text: !0,
    time: !0,
    url: !0,
    week: !0,
  };
  function fg(r) {
    var s = r && r.nodeName && r.nodeName.toLowerCase();
    return s === "input" ? !!_S[r.type] : s === "textarea";
  }
  function pg(r, s, l, h) {
    (Yn(h),
      (s = Bu(s, "onChange")),
      0 < s.length &&
        ((l = new Bo("onChange", "change", null, l, h)),
        r.push({ event: l, listeners: s })));
  }
  var tl = null,
    nl = null;
  function wS(r) {
    Dg(r, 0);
  }
  function Fu(r) {
    var s = ea(r);
    if (Fn(s)) return r;
  }
  function ES(r, s) {
    if (r === "change") return s;
  }
  var mg = !1;
  if (d) {
    var md;
    if (d) {
      var gd = "oninput" in document;
      if (!gd) {
        var gg = document.createElement("div");
        (gg.setAttribute("oninput", "return;"),
          (gd = typeof gg.oninput == "function"));
      }
      md = gd;
    } else md = !1;
    mg = md && (!document.documentMode || 9 < document.documentMode);
  }
  function yg() {
    tl && (tl.detachEvent("onpropertychange", vg), (nl = tl = null));
  }
  function vg(r) {
    if (r.propertyName === "value" && Fu(nl)) {
      var s = [];
      (pg(s, nl, r, gr(r)), Js(wS, s));
    }
  }
  function TS(r, s, l) {
    r === "focusin"
      ? (yg(), (tl = s), (nl = l), tl.attachEvent("onpropertychange", vg))
      : r === "focusout" && yg();
  }
  function SS(r) {
    if (r === "selectionchange" || r === "keyup" || r === "keydown")
      return Fu(nl);
  }
  function IS(r, s) {
    if (r === "click") return Fu(s);
  }
  function RS(r, s) {
    if (r === "input" || r === "change") return Fu(s);
  }
  function AS(r, s) {
    return (r === s && (r !== 0 || 1 / r === 1 / s)) || (r !== r && s !== s);
  }
  var Ir = typeof Object.is == "function" ? Object.is : AS;
  function rl(r, s) {
    if (Ir(r, s)) return !0;
    if (
      typeof r != "object" ||
      r === null ||
      typeof s != "object" ||
      s === null
    )
      return !1;
    var l = Object.keys(r),
      h = Object.keys(s);
    if (l.length !== h.length) return !1;
    for (h = 0; h < l.length; h++) {
      var p = l[h];
      if (!f.call(s, p) || !Ir(r[p], s[p])) return !1;
    }
    return !0;
  }
  function _g(r) {
    for (; r && r.firstChild; ) r = r.firstChild;
    return r;
  }
  function wg(r, s) {
    var l = _g(r);
    r = 0;
    for (var h; l; ) {
      if (l.nodeType === 3) {
        if (((h = r + l.textContent.length), r <= s && h >= s))
          return { node: l, offset: s - r };
        r = h;
      }
      e: {
        for (; l; ) {
          if (l.nextSibling) {
            l = l.nextSibling;
            break e;
          }
          l = l.parentNode;
        }
        l = void 0;
      }
      l = _g(l);
    }
  }
  function Eg(r, s) {
    return r && s
      ? r === s
        ? !0
        : r && r.nodeType === 3
          ? !1
          : s && s.nodeType === 3
            ? Eg(r, s.parentNode)
            : "contains" in r
              ? r.contains(s)
              : r.compareDocumentPosition
                ? !!(r.compareDocumentPosition(s) & 16)
                : !1
      : !1;
  }
  function Tg() {
    for (var r = window, s = dr(); s instanceof r.HTMLIFrameElement; ) {
      try {
        var l = typeof s.contentWindow.location.href == "string";
      } catch {
        l = !1;
      }
      if (l) r = s.contentWindow;
      else break;
      s = dr(r.document);
    }
    return s;
  }
  function yd(r) {
    var s = r && r.nodeName && r.nodeName.toLowerCase();
    return (
      s &&
      ((s === "input" &&
        (r.type === "text" ||
          r.type === "search" ||
          r.type === "tel" ||
          r.type === "url" ||
          r.type === "password")) ||
        s === "textarea" ||
        r.contentEditable === "true")
    );
  }
  function CS(r) {
    var s = Tg(),
      l = r.focusedElem,
      h = r.selectionRange;
    if (
      s !== l &&
      l &&
      l.ownerDocument &&
      Eg(l.ownerDocument.documentElement, l)
    ) {
      if (h !== null && yd(l)) {
        if (
          ((s = h.start),
          (r = h.end),
          r === void 0 && (r = s),
          "selectionStart" in l)
        )
          ((l.selectionStart = s),
            (l.selectionEnd = Math.min(r, l.value.length)));
        else if (
          ((r = ((s = l.ownerDocument || document) && s.defaultView) || window),
          r.getSelection)
        ) {
          r = r.getSelection();
          var p = l.textContent.length,
            y = Math.min(h.start, p);
          ((h = h.end === void 0 ? y : Math.min(h.end, p)),
            !r.extend && y > h && ((p = h), (h = y), (y = p)),
            (p = wg(l, y)));
          var E = wg(l, h);
          p &&
            E &&
            (r.rangeCount !== 1 ||
              r.anchorNode !== p.node ||
              r.anchorOffset !== p.offset ||
              r.focusNode !== E.node ||
              r.focusOffset !== E.offset) &&
            ((s = s.createRange()),
            s.setStart(p.node, p.offset),
            r.removeAllRanges(),
            y > h
              ? (r.addRange(s), r.extend(E.node, E.offset))
              : (s.setEnd(E.node, E.offset), r.addRange(s)));
        }
      }
      for (s = [], r = l; (r = r.parentNode); )
        r.nodeType === 1 &&
          s.push({ element: r, left: r.scrollLeft, top: r.scrollTop });
      for (typeof l.focus == "function" && l.focus(), l = 0; l < s.length; l++)
        ((r = s[l]),
          (r.element.scrollLeft = r.left),
          (r.element.scrollTop = r.top));
    }
  }
  var PS = d && "documentMode" in document && 11 >= document.documentMode,
    Yo = null,
    vd = null,
    il = null,
    _d = !1;
  function Sg(r, s, l) {
    var h =
      l.window === l ? l.document : l.nodeType === 9 ? l : l.ownerDocument;
    _d ||
      Yo == null ||
      Yo !== dr(h) ||
      ((h = Yo),
      "selectionStart" in h && yd(h)
        ? (h = { start: h.selectionStart, end: h.selectionEnd })
        : ((h = (
            (h.ownerDocument && h.ownerDocument.defaultView) ||
            window
          ).getSelection()),
          (h = {
            anchorNode: h.anchorNode,
            anchorOffset: h.anchorOffset,
            focusNode: h.focusNode,
            focusOffset: h.focusOffset,
          })),
      (il && rl(il, h)) ||
        ((il = h),
        (h = Bu(vd, "onSelect")),
        0 < h.length &&
          ((s = new Bo("onSelect", "select", null, s, l)),
          r.push({ event: s, listeners: h }),
          (s.target = Yo))));
  }
  function Uu(r, s) {
    var l = {};
    return (
      (l[r.toLowerCase()] = s.toLowerCase()),
      (l["Webkit" + r] = "webkit" + s),
      (l["Moz" + r] = "moz" + s),
      l
    );
  }
  var Xo = {
      animationend: Uu("Animation", "AnimationEnd"),
      animationiteration: Uu("Animation", "AnimationIteration"),
      animationstart: Uu("Animation", "AnimationStart"),
      transitionend: Uu("Transition", "TransitionEnd"),
    },
    wd = {},
    Ig = {};
  d &&
    ((Ig = document.createElement("div").style),
    "AnimationEvent" in window ||
      (delete Xo.animationend.animation,
      delete Xo.animationiteration.animation,
      delete Xo.animationstart.animation),
    "TransitionEvent" in window || delete Xo.transitionend.transition);
  function zu(r) {
    if (wd[r]) return wd[r];
    if (!Xo[r]) return r;
    var s = Xo[r],
      l;
    for (l in s) if (s.hasOwnProperty(l) && l in Ig) return (wd[r] = s[l]);
    return r;
  }
  var Rg = zu("animationend"),
    Ag = zu("animationiteration"),
    Cg = zu("animationstart"),
    Pg = zu("transitionend"),
    kg = new Map(),
    xg =
      "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
        " ",
      );
  function us(r, s) {
    (kg.set(r, s), a(s, [r]));
  }
  for (var Ed = 0; Ed < xg.length; Ed++) {
    var Td = xg[Ed],
      kS = Td.toLowerCase(),
      xS = Td[0].toUpperCase() + Td.slice(1);
    us(kS, "on" + xS);
  }
  (us(Rg, "onAnimationEnd"),
    us(Ag, "onAnimationIteration"),
    us(Cg, "onAnimationStart"),
    us("dblclick", "onDoubleClick"),
    us("focusin", "onFocus"),
    us("focusout", "onBlur"),
    us(Pg, "onTransitionEnd"),
    u("onMouseEnter", ["mouseout", "mouseover"]),
    u("onMouseLeave", ["mouseout", "mouseover"]),
    u("onPointerEnter", ["pointerout", "pointerover"]),
    u("onPointerLeave", ["pointerout", "pointerover"]),
    a(
      "onChange",
      "change click focusin focusout input keydown keyup selectionchange".split(
        " ",
      ),
    ),
    a(
      "onSelect",
      "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(
        " ",
      ),
    ),
    a("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    a(
      "onCompositionEnd",
      "compositionend focusout keydown keypress keyup mousedown".split(" "),
    ),
    a(
      "onCompositionStart",
      "compositionstart focusout keydown keypress keyup mousedown".split(" "),
    ),
    a(
      "onCompositionUpdate",
      "compositionupdate focusout keydown keypress keyup mousedown".split(" "),
    ));
  var sl =
      "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
        " ",
      ),
    bS = new Set(
      "cancel close invalid load scroll toggle".split(" ").concat(sl),
    );
  function bg(r, s, l) {
    var h = r.type || "unknown-event";
    ((r.currentTarget = l), Pe(h, s, void 0, r), (r.currentTarget = null));
  }
  function Dg(r, s) {
    s = (s & 4) !== 0;
    for (var l = 0; l < r.length; l++) {
      var h = r[l],
        p = h.event;
      h = h.listeners;
      e: {
        var y = void 0;
        if (s)
          for (var E = h.length - 1; 0 <= E; E--) {
            var P = h[E],
              N = P.instance,
              K = P.currentTarget;
            if (((P = P.listener), N !== y && p.isPropagationStopped()))
              break e;
            (bg(p, P, K), (y = N));
          }
        else
          for (E = 0; E < h.length; E++) {
            if (
              ((P = h[E]),
              (N = P.instance),
              (K = P.currentTarget),
              (P = P.listener),
              N !== y && p.isPropagationStopped())
            )
              break e;
            (bg(p, P, K), (y = N));
          }
      }
    }
    if (ge) throw ((r = Se), (ge = !1), (Se = null), r);
  }
  function _t(r, s) {
    var l = s[xd];
    l === void 0 && (l = s[xd] = new Set());
    var h = r + "__bubble";
    l.has(h) || (Ng(s, r, 2, !1), l.add(h));
  }
  function Sd(r, s, l) {
    var h = 0;
    (s && (h |= 4), Ng(l, r, h, s));
  }
  var ju = "_reactListening" + Math.random().toString(36).slice(2);
  function ol(r) {
    if (!r[ju]) {
      ((r[ju] = !0),
        i.forEach(function (l) {
          l !== "selectionchange" && (bS.has(l) || Sd(l, !1, r), Sd(l, !0, r));
        }));
      var s = r.nodeType === 9 ? r : r.ownerDocument;
      s === null || s[ju] || ((s[ju] = !0), Sd("selectionchange", !1, s));
    }
  }
  function Ng(r, s, l, h) {
    switch (Ya(s)) {
      case 1:
        var p = Tt;
        break;
      case 4:
        p = fd;
        break;
      default:
        p = Qa;
    }
    ((l = p.bind(null, s, l, r)),
      (p = void 0),
      !b ||
        (s !== "touchstart" && s !== "touchmove" && s !== "wheel") ||
        (p = !0),
      h
        ? p !== void 0
          ? r.addEventListener(s, l, { capture: !0, passive: p })
          : r.addEventListener(s, l, !0)
        : p !== void 0
          ? r.addEventListener(s, l, { passive: p })
          : r.addEventListener(s, l, !1));
  }
  function Id(r, s, l, h, p) {
    var y = h;
    if ((s & 1) === 0 && (s & 2) === 0 && h !== null)
      e: for (;;) {
        if (h === null) return;
        var E = h.tag;
        if (E === 3 || E === 4) {
          var P = h.stateNode.containerInfo;
          if (P === p || (P.nodeType === 8 && P.parentNode === p)) break;
          if (E === 4)
            for (E = h.return; E !== null; ) {
              var N = E.tag;
              if (
                (N === 3 || N === 4) &&
                ((N = E.stateNode.containerInfo),
                N === p || (N.nodeType === 8 && N.parentNode === p))
              )
                return;
              E = E.return;
            }
          for (; P !== null; ) {
            if (((E = oo(P)), E === null)) return;
            if (((N = E.tag), N === 5 || N === 6)) {
              h = y = E;
              continue e;
            }
            P = P.parentNode;
          }
        }
        h = h.return;
      }
    Js(function () {
      var K = y,
        re = gr(l),
        se = [];
      e: {
        var te = kg.get(r);
        if (te !== void 0) {
          var fe = Bo,
            we = r;
          switch (r) {
            case "keypress":
              if (jo(l) === 0) break e;
            case "keydown":
            case "keyup":
              fe = g;
              break;
            case "focusin":
              ((we = "focus"), (fe = qo));
              break;
            case "focusout":
              ((we = "blur"), (fe = qo));
              break;
            case "beforeblur":
            case "afterblur":
              fe = qo;
              break;
            case "click":
              if (l.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              fe = Ho;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              fe = bu;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              fe = Q;
              break;
            case Rg:
            case Ag:
            case Cg:
              fe = Ti;
              break;
            case Pg:
              fe = ht;
              break;
            case "scroll":
              fe = pd;
              break;
            case "wheel":
              fe = Ze;
              break;
            case "copy":
            case "cut":
            case "paste":
              fe = Ou;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              fe = I;
          }
          var Re = (s & 4) !== 0,
            Nt = !Re && r === "scroll",
            $ = Re ? (te !== null ? te + "Capture" : null) : te;
          Re = [];
          for (var M = K, H; M !== null; ) {
            H = M;
            var le = H.stateNode;
            if (
              (H.tag === 5 &&
                le !== null &&
                ((H = le),
                $ !== null &&
                  ((le = Rt(M, $)), le != null && Re.push(al(M, le, H)))),
              Nt)
            )
              break;
            M = M.return;
          }
          0 < Re.length &&
            ((te = new fe(te, we, null, l, re)),
            se.push({ event: te, listeners: Re }));
        }
      }
      if ((s & 7) === 0) {
        e: {
          if (
            ((te = r === "mouseover" || r === "pointerover"),
            (fe = r === "mouseout" || r === "pointerout"),
            te &&
              l !== Mr &&
              (we = l.relatedTarget || l.fromElement) &&
              (oo(we) || we[Si]))
          )
            break e;
          if (
            (fe || te) &&
            ((te =
              re.window === re
                ? re
                : (te = re.ownerDocument)
                  ? te.defaultView || te.parentWindow
                  : window),
            fe
              ? ((we = l.relatedTarget || l.toElement),
                (fe = K),
                (we = we ? oo(we) : null),
                we !== null &&
                  ((Nt = ve(we)),
                  we !== Nt || (we.tag !== 5 && we.tag !== 6)) &&
                  (we = null))
              : ((fe = null), (we = K)),
            fe !== we)
          ) {
            if (
              ((Re = Ho),
              (le = "onMouseLeave"),
              ($ = "onMouseEnter"),
              (M = "mouse"),
              (r === "pointerout" || r === "pointerover") &&
                ((Re = I),
                (le = "onPointerLeave"),
                ($ = "onPointerEnter"),
                (M = "pointer")),
              (Nt = fe == null ? te : ea(fe)),
              (H = we == null ? te : ea(we)),
              (te = new Re(le, M + "leave", fe, l, re)),
              (te.target = Nt),
              (te.relatedTarget = H),
              (le = null),
              oo(re) === K &&
                ((Re = new Re($, M + "enter", we, l, re)),
                (Re.target = H),
                (Re.relatedTarget = Nt),
                (le = Re)),
              (Nt = le),
              fe && we)
            )
              t: {
                for (Re = fe, $ = we, M = 0, H = Re; H; H = Jo(H)) M++;
                for (H = 0, le = $; le; le = Jo(le)) H++;
                for (; 0 < M - H; ) ((Re = Jo(Re)), M--);
                for (; 0 < H - M; ) (($ = Jo($)), H--);
                for (; M--; ) {
                  if (Re === $ || ($ !== null && Re === $.alternate)) break t;
                  ((Re = Jo(Re)), ($ = Jo($)));
                }
                Re = null;
              }
            else Re = null;
            (fe !== null && Og(se, te, fe, Re, !1),
              we !== null && Nt !== null && Og(se, Nt, we, Re, !0));
          }
        }
        e: {
          if (
            ((te = K ? ea(K) : window),
            (fe = te.nodeName && te.nodeName.toLowerCase()),
            fe === "select" || (fe === "input" && te.type === "file"))
          )
            var Ae = ES;
          else if (fg(te))
            if (mg) Ae = RS;
            else {
              Ae = SS;
              var xe = TS;
            }
          else
            (fe = te.nodeName) &&
              fe.toLowerCase() === "input" &&
              (te.type === "checkbox" || te.type === "radio") &&
              (Ae = IS);
          if (Ae && (Ae = Ae(r, K))) {
            pg(se, Ae, l, re);
            break e;
          }
          (xe && xe(r, te, K),
            r === "focusout" &&
              (xe = te._wrapperState) &&
              xe.controlled &&
              te.type === "number" &&
              Ki(te, "number", te.value));
        }
        switch (((xe = K ? ea(K) : window), r)) {
          case "focusin":
            (fg(xe) || xe.contentEditable === "true") &&
              ((Yo = xe), (vd = K), (il = null));
            break;
          case "focusout":
            il = vd = Yo = null;
            break;
          case "mousedown":
            _d = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            ((_d = !1), Sg(se, l, re));
            break;
          case "selectionchange":
            if (PS) break;
          case "keydown":
          case "keyup":
            Sg(se, l, re);
        }
        var be;
        if (Vt)
          e: {
            switch (r) {
              case "compositionstart":
                var Me = "onCompositionStart";
                break e;
              case "compositionend":
                Me = "onCompositionEnd";
                break e;
              case "compositionupdate":
                Me = "onCompositionUpdate";
                break e;
            }
            Me = void 0;
          }
        else
          Qo
            ? hg(r, l) && (Me = "onCompositionEnd")
            : r === "keydown" &&
              l.keyCode === 229 &&
              (Me = "onCompositionStart");
        (Me &&
          (so &&
            l.locale !== "ko" &&
            (Qo || Me !== "onCompositionStart"
              ? Me === "onCompositionEnd" && Qo && (be = Xa())
              : ((zn = re),
                (zo = "value" in zn ? zn.value : zn.textContent),
                (Qo = !0))),
          (xe = Bu(K, Me)),
          0 < xe.length &&
            ((Me = new el(Me, r, null, l, re)),
            se.push({ event: Me, listeners: xe }),
            be
              ? (Me.data = be)
              : ((be = dg(l)), be !== null && (Me.data = be)))),
          (be = jn ? yS(r, l) : vS(r, l)) &&
            ((K = Bu(K, "onBeforeInput")),
            0 < K.length &&
              ((re = new el("onBeforeInput", "beforeinput", null, l, re)),
              se.push({ event: re, listeners: K }),
              (re.data = be))));
      }
      Dg(se, s);
    });
  }
  function al(r, s, l) {
    return { instance: r, listener: s, currentTarget: l };
  }
  function Bu(r, s) {
    for (var l = s + "Capture", h = []; r !== null; ) {
      var p = r,
        y = p.stateNode;
      (p.tag === 5 &&
        y !== null &&
        ((p = y),
        (y = Rt(r, l)),
        y != null && h.unshift(al(r, y, p)),
        (y = Rt(r, s)),
        y != null && h.push(al(r, y, p))),
        (r = r.return));
    }
    return h;
  }
  function Jo(r) {
    if (r === null) return null;
    do r = r.return;
    while (r && r.tag !== 5);
    return r || null;
  }
  function Og(r, s, l, h, p) {
    for (var y = s._reactName, E = []; l !== null && l !== h; ) {
      var P = l,
        N = P.alternate,
        K = P.stateNode;
      if (N !== null && N === h) break;
      (P.tag === 5 &&
        K !== null &&
        ((P = K),
        p
          ? ((N = Rt(l, y)), N != null && E.unshift(al(l, N, P)))
          : p || ((N = Rt(l, y)), N != null && E.push(al(l, N, P)))),
        (l = l.return));
    }
    E.length !== 0 && r.push({ event: s, listeners: E });
  }
  var DS = /\r\n?/g,
    NS = /\u0000|\uFFFD/g;
  function Lg(r) {
    return (typeof r == "string" ? r : "" + r)
      .replace(
        DS,
        `
`,
      )
      .replace(NS, "");
  }
  function $u(r, s, l) {
    if (((s = Lg(s)), Lg(r) !== s && l)) throw Error(t(425));
  }
  function Hu() {}
  var Rd = null,
    Ad = null;
  function Cd(r, s) {
    return (
      r === "textarea" ||
      r === "noscript" ||
      typeof s.children == "string" ||
      typeof s.children == "number" ||
      (typeof s.dangerouslySetInnerHTML == "object" &&
        s.dangerouslySetInnerHTML !== null &&
        s.dangerouslySetInnerHTML.__html != null)
    );
  }
  var Pd = typeof setTimeout == "function" ? setTimeout : void 0,
    OS = typeof clearTimeout == "function" ? clearTimeout : void 0,
    Mg = typeof Promise == "function" ? Promise : void 0,
    LS =
      typeof queueMicrotask == "function"
        ? queueMicrotask
        : typeof Mg < "u"
          ? function (r) {
              return Mg.resolve(null).then(r).catch(MS);
            }
          : Pd;
  function MS(r) {
    setTimeout(function () {
      throw r;
    });
  }
  function kd(r, s) {
    var l = s,
      h = 0;
    do {
      var p = l.nextSibling;
      if ((r.removeChild(l), p && p.nodeType === 8))
        if (((l = p.data), l === "/$")) {
          if (h === 0) {
            (r.removeChild(p), Tr(s));
            return;
          }
          h--;
        } else (l !== "$" && l !== "$?" && l !== "$!") || h++;
      l = p;
    } while (l);
    Tr(s);
  }
  function cs(r) {
    for (; r != null; r = r.nextSibling) {
      var s = r.nodeType;
      if (s === 1 || s === 3) break;
      if (s === 8) {
        if (((s = r.data), s === "$" || s === "$!" || s === "$?")) break;
        if (s === "/$") return null;
      }
    }
    return r;
  }
  function Vg(r) {
    r = r.previousSibling;
    for (var s = 0; r; ) {
      if (r.nodeType === 8) {
        var l = r.data;
        if (l === "$" || l === "$!" || l === "$?") {
          if (s === 0) return r;
          s--;
        } else l === "/$" && s++;
      }
      r = r.previousSibling;
    }
    return null;
  }
  var Zo = Math.random().toString(36).slice(2),
    Hr = "__reactFiber$" + Zo,
    ll = "__reactProps$" + Zo,
    Si = "__reactContainer$" + Zo,
    xd = "__reactEvents$" + Zo,
    VS = "__reactListeners$" + Zo,
    FS = "__reactHandles$" + Zo;
  function oo(r) {
    var s = r[Hr];
    if (s) return s;
    for (var l = r.parentNode; l; ) {
      if ((s = l[Si] || l[Hr])) {
        if (
          ((l = s.alternate),
          s.child !== null || (l !== null && l.child !== null))
        )
          for (r = Vg(r); r !== null; ) {
            if ((l = r[Hr])) return l;
            r = Vg(r);
          }
        return s;
      }
      ((r = l), (l = r.parentNode));
    }
    return null;
  }
  function ul(r) {
    return (
      (r = r[Hr] || r[Si]),
      !r || (r.tag !== 5 && r.tag !== 6 && r.tag !== 13 && r.tag !== 3)
        ? null
        : r
    );
  }
  function ea(r) {
    if (r.tag === 5 || r.tag === 6) return r.stateNode;
    throw Error(t(33));
  }
  function Wu(r) {
    return r[ll] || null;
  }
  var bd = [],
    ta = -1;
  function hs(r) {
    return { current: r };
  }
  function wt(r) {
    0 > ta || ((r.current = bd[ta]), (bd[ta] = null), ta--);
  }
  function gt(r, s) {
    (ta++, (bd[ta] = r.current), (r.current = s));
  }
  var ds = {},
    cn = hs(ds),
    xn = hs(!1),
    ao = ds;
  function na(r, s) {
    var l = r.type.contextTypes;
    if (!l) return ds;
    var h = r.stateNode;
    if (h && h.__reactInternalMemoizedUnmaskedChildContext === s)
      return h.__reactInternalMemoizedMaskedChildContext;
    var p = {},
      y;
    for (y in l) p[y] = s[y];
    return (
      h &&
        ((r = r.stateNode),
        (r.__reactInternalMemoizedUnmaskedChildContext = s),
        (r.__reactInternalMemoizedMaskedChildContext = p)),
      p
    );
  }
  function bn(r) {
    return ((r = r.childContextTypes), r != null);
  }
  function qu() {
    (wt(xn), wt(cn));
  }
  function Fg(r, s, l) {
    if (cn.current !== ds) throw Error(t(168));
    (gt(cn, s), gt(xn, l));
  }
  function Ug(r, s, l) {
    var h = r.stateNode;
    if (((s = s.childContextTypes), typeof h.getChildContext != "function"))
      return l;
    h = h.getChildContext();
    for (var p in h) if (!(p in s)) throw Error(t(108, Ge(r) || "Unknown", p));
    return de({}, l, h);
  }
  function Ku(r) {
    return (
      (r =
        ((r = r.stateNode) && r.__reactInternalMemoizedMergedChildContext) ||
        ds),
      (ao = cn.current),
      gt(cn, r),
      gt(xn, xn.current),
      !0
    );
  }
  function zg(r, s, l) {
    var h = r.stateNode;
    if (!h) throw Error(t(169));
    (l
      ? ((r = Ug(r, s, ao)),
        (h.__reactInternalMemoizedMergedChildContext = r),
        wt(xn),
        wt(cn),
        gt(cn, r))
      : wt(xn),
      gt(xn, l));
  }
  var Ii = null,
    Gu = !1,
    Dd = !1;
  function jg(r) {
    Ii === null ? (Ii = [r]) : Ii.push(r);
  }
  function US(r) {
    ((Gu = !0), jg(r));
  }
  function fs() {
    if (!Dd && Ii !== null) {
      Dd = !0;
      var r = 0,
        s = Je;
      try {
        var l = Ii;
        for (Je = 1; r < l.length; r++) {
          var h = l[r];
          do h = h(!0);
          while (h !== null);
        }
        ((Ii = null), (Gu = !1));
      } catch (p) {
        throw (Ii !== null && (Ii = Ii.slice(r + 1)), rt(yr, fs), p);
      } finally {
        ((Je = s), (Dd = !1));
      }
    }
    return null;
  }
  var ra = [],
    ia = 0,
    Qu = null,
    Yu = 0,
    nr = [],
    rr = 0,
    lo = null,
    Ri = 1,
    Ai = "";
  function uo(r, s) {
    ((ra[ia++] = Yu), (ra[ia++] = Qu), (Qu = r), (Yu = s));
  }
  function Bg(r, s, l) {
    ((nr[rr++] = Ri), (nr[rr++] = Ai), (nr[rr++] = lo), (lo = r));
    var h = Ri;
    r = Ai;
    var p = 32 - At(h) - 1;
    ((h &= ~(1 << p)), (l += 1));
    var y = 32 - At(s) + p;
    if (30 < y) {
      var E = p - (p % 5);
      ((y = (h & ((1 << E) - 1)).toString(32)),
        (h >>= E),
        (p -= E),
        (Ri = (1 << (32 - At(s) + p)) | (l << p) | h),
        (Ai = y + r));
    } else ((Ri = (1 << y) | (l << p) | h), (Ai = r));
  }
  function Nd(r) {
    r.return !== null && (uo(r, 1), Bg(r, 1, 0));
  }
  function Od(r) {
    for (; r === Qu; )
      ((Qu = ra[--ia]), (ra[ia] = null), (Yu = ra[--ia]), (ra[ia] = null));
    for (; r === lo; )
      ((lo = nr[--rr]),
        (nr[rr] = null),
        (Ai = nr[--rr]),
        (nr[rr] = null),
        (Ri = nr[--rr]),
        (nr[rr] = null));
  }
  var Bn = null,
    $n = null,
    St = !1,
    Rr = null;
  function $g(r, s) {
    var l = ar(5, null, null, 0);
    ((l.elementType = "DELETED"),
      (l.stateNode = s),
      (l.return = r),
      (s = r.deletions),
      s === null ? ((r.deletions = [l]), (r.flags |= 16)) : s.push(l));
  }
  function Hg(r, s) {
    switch (r.tag) {
      case 5:
        var l = r.type;
        return (
          (s =
            s.nodeType !== 1 || l.toLowerCase() !== s.nodeName.toLowerCase()
              ? null
              : s),
          s !== null
            ? ((r.stateNode = s), (Bn = r), ($n = cs(s.firstChild)), !0)
            : !1
        );
      case 6:
        return (
          (s = r.pendingProps === "" || s.nodeType !== 3 ? null : s),
          s !== null ? ((r.stateNode = s), (Bn = r), ($n = null), !0) : !1
        );
      case 13:
        return (
          (s = s.nodeType !== 8 ? null : s),
          s !== null
            ? ((l = lo !== null ? { id: Ri, overflow: Ai } : null),
              (r.memoizedState = {
                dehydrated: s,
                treeContext: l,
                retryLane: 1073741824,
              }),
              (l = ar(18, null, null, 0)),
              (l.stateNode = s),
              (l.return = r),
              (r.child = l),
              (Bn = r),
              ($n = null),
              !0)
            : !1
        );
      default:
        return !1;
    }
  }
  function Ld(r) {
    return (r.mode & 1) !== 0 && (r.flags & 128) === 0;
  }
  function Md(r) {
    if (St) {
      var s = $n;
      if (s) {
        var l = s;
        if (!Hg(r, s)) {
          if (Ld(r)) throw Error(t(418));
          s = cs(l.nextSibling);
          var h = Bn;
          s && Hg(r, s)
            ? $g(h, l)
            : ((r.flags = (r.flags & -4097) | 2), (St = !1), (Bn = r));
        }
      } else {
        if (Ld(r)) throw Error(t(418));
        ((r.flags = (r.flags & -4097) | 2), (St = !1), (Bn = r));
      }
    }
  }
  function Wg(r) {
    for (
      r = r.return;
      r !== null && r.tag !== 5 && r.tag !== 3 && r.tag !== 13;

    )
      r = r.return;
    Bn = r;
  }
  function Xu(r) {
    if (r !== Bn) return !1;
    if (!St) return (Wg(r), (St = !0), !1);
    var s;
    if (
      ((s = r.tag !== 3) &&
        !(s = r.tag !== 5) &&
        ((s = r.type),
        (s = s !== "head" && s !== "body" && !Cd(r.type, r.memoizedProps))),
      s && (s = $n))
    ) {
      if (Ld(r)) throw (qg(), Error(t(418)));
      for (; s; ) ($g(r, s), (s = cs(s.nextSibling)));
    }
    if ((Wg(r), r.tag === 13)) {
      if (((r = r.memoizedState), (r = r !== null ? r.dehydrated : null), !r))
        throw Error(t(317));
      e: {
        for (r = r.nextSibling, s = 0; r; ) {
          if (r.nodeType === 8) {
            var l = r.data;
            if (l === "/$") {
              if (s === 0) {
                $n = cs(r.nextSibling);
                break e;
              }
              s--;
            } else (l !== "$" && l !== "$!" && l !== "$?") || s++;
          }
          r = r.nextSibling;
        }
        $n = null;
      }
    } else $n = Bn ? cs(r.stateNode.nextSibling) : null;
    return !0;
  }
  function qg() {
    for (var r = $n; r; ) r = cs(r.nextSibling);
  }
  function sa() {
    (($n = Bn = null), (St = !1));
  }
  function Vd(r) {
    Rr === null ? (Rr = [r]) : Rr.push(r);
  }
  var zS = ae.ReactCurrentBatchConfig;
  function cl(r, s, l) {
    if (
      ((r = l.ref),
      r !== null && typeof r != "function" && typeof r != "object")
    ) {
      if (l._owner) {
        if (((l = l._owner), l)) {
          if (l.tag !== 1) throw Error(t(309));
          var h = l.stateNode;
        }
        if (!h) throw Error(t(147, r));
        var p = h,
          y = "" + r;
        return s !== null &&
          s.ref !== null &&
          typeof s.ref == "function" &&
          s.ref._stringRef === y
          ? s.ref
          : ((s = function (E) {
              var P = p.refs;
              E === null ? delete P[y] : (P[y] = E);
            }),
            (s._stringRef = y),
            s);
      }
      if (typeof r != "string") throw Error(t(284));
      if (!l._owner) throw Error(t(290, r));
    }
    return r;
  }
  function Ju(r, s) {
    throw (
      (r = Object.prototype.toString.call(s)),
      Error(
        t(
          31,
          r === "[object Object]"
            ? "object with keys {" + Object.keys(s).join(", ") + "}"
            : r,
        ),
      )
    );
  }
  function Kg(r) {
    var s = r._init;
    return s(r._payload);
  }
  function Gg(r) {
    function s($, M) {
      if (r) {
        var H = $.deletions;
        H === null ? (($.deletions = [M]), ($.flags |= 16)) : H.push(M);
      }
    }
    function l($, M) {
      if (!r) return null;
      for (; M !== null; ) (s($, M), (M = M.sibling));
      return null;
    }
    function h($, M) {
      for ($ = new Map(); M !== null; )
        (M.key !== null ? $.set(M.key, M) : $.set(M.index, M), (M = M.sibling));
      return $;
    }
    function p($, M) {
      return (($ = Es($, M)), ($.index = 0), ($.sibling = null), $);
    }
    function y($, M, H) {
      return (
        ($.index = H),
        r
          ? ((H = $.alternate),
            H !== null
              ? ((H = H.index), H < M ? (($.flags |= 2), M) : H)
              : (($.flags |= 2), M))
          : (($.flags |= 1048576), M)
      );
    }
    function E($) {
      return (r && $.alternate === null && ($.flags |= 2), $);
    }
    function P($, M, H, le) {
      return M === null || M.tag !== 6
        ? ((M = kf(H, $.mode, le)), (M.return = $), M)
        : ((M = p(M, H)), (M.return = $), M);
    }
    function N($, M, H, le) {
      var Ae = H.type;
      return Ae === S
        ? re($, M, H.props.children, le, H.key)
        : M !== null &&
            (M.elementType === Ae ||
              (typeof Ae == "object" &&
                Ae !== null &&
                Ae.$$typeof === lt &&
                Kg(Ae) === M.type))
          ? ((le = p(M, H.props)), (le.ref = cl($, M, H)), (le.return = $), le)
          : ((le = Tc(H.type, H.key, H.props, null, $.mode, le)),
            (le.ref = cl($, M, H)),
            (le.return = $),
            le);
    }
    function K($, M, H, le) {
      return M === null ||
        M.tag !== 4 ||
        M.stateNode.containerInfo !== H.containerInfo ||
        M.stateNode.implementation !== H.implementation
        ? ((M = xf(H, $.mode, le)), (M.return = $), M)
        : ((M = p(M, H.children || [])), (M.return = $), M);
    }
    function re($, M, H, le, Ae) {
      return M === null || M.tag !== 7
        ? ((M = vo(H, $.mode, le, Ae)), (M.return = $), M)
        : ((M = p(M, H)), (M.return = $), M);
    }
    function se($, M, H) {
      if ((typeof M == "string" && M !== "") || typeof M == "number")
        return ((M = kf("" + M, $.mode, H)), (M.return = $), M);
      if (typeof M == "object" && M !== null) {
        switch (M.$$typeof) {
          case ee:
            return (
              (H = Tc(M.type, M.key, M.props, null, $.mode, H)),
              (H.ref = cl($, null, M)),
              (H.return = $),
              H
            );
          case he:
            return ((M = xf(M, $.mode, H)), (M.return = $), M);
          case lt:
            var le = M._init;
            return se($, le(M._payload), H);
        }
        if (fr(M) || me(M))
          return ((M = vo(M, $.mode, H, null)), (M.return = $), M);
        Ju($, M);
      }
      return null;
    }
    function te($, M, H, le) {
      var Ae = M !== null ? M.key : null;
      if ((typeof H == "string" && H !== "") || typeof H == "number")
        return Ae !== null ? null : P($, M, "" + H, le);
      if (typeof H == "object" && H !== null) {
        switch (H.$$typeof) {
          case ee:
            return H.key === Ae ? N($, M, H, le) : null;
          case he:
            return H.key === Ae ? K($, M, H, le) : null;
          case lt:
            return ((Ae = H._init), te($, M, Ae(H._payload), le));
        }
        if (fr(H) || me(H)) return Ae !== null ? null : re($, M, H, le, null);
        Ju($, H);
      }
      return null;
    }
    function fe($, M, H, le, Ae) {
      if ((typeof le == "string" && le !== "") || typeof le == "number")
        return (($ = $.get(H) || null), P(M, $, "" + le, Ae));
      if (typeof le == "object" && le !== null) {
        switch (le.$$typeof) {
          case ee:
            return (
              ($ = $.get(le.key === null ? H : le.key) || null),
              N(M, $, le, Ae)
            );
          case he:
            return (
              ($ = $.get(le.key === null ? H : le.key) || null),
              K(M, $, le, Ae)
            );
          case lt:
            var xe = le._init;
            return fe($, M, H, xe(le._payload), Ae);
        }
        if (fr(le) || me(le))
          return (($ = $.get(H) || null), re(M, $, le, Ae, null));
        Ju(M, le);
      }
      return null;
    }
    function we($, M, H, le) {
      for (
        var Ae = null, xe = null, be = M, Me = (M = 0), Yt = null;
        be !== null && Me < H.length;
        Me++
      ) {
        be.index > Me ? ((Yt = be), (be = null)) : (Yt = be.sibling);
        var it = te($, be, H[Me], le);
        if (it === null) {
          be === null && (be = Yt);
          break;
        }
        (r && be && it.alternate === null && s($, be),
          (M = y(it, M, Me)),
          xe === null ? (Ae = it) : (xe.sibling = it),
          (xe = it),
          (be = Yt));
      }
      if (Me === H.length) return (l($, be), St && uo($, Me), Ae);
      if (be === null) {
        for (; Me < H.length; Me++)
          ((be = se($, H[Me], le)),
            be !== null &&
              ((M = y(be, M, Me)),
              xe === null ? (Ae = be) : (xe.sibling = be),
              (xe = be)));
        return (St && uo($, Me), Ae);
      }
      for (be = h($, be); Me < H.length; Me++)
        ((Yt = fe(be, $, Me, H[Me], le)),
          Yt !== null &&
            (r &&
              Yt.alternate !== null &&
              be.delete(Yt.key === null ? Me : Yt.key),
            (M = y(Yt, M, Me)),
            xe === null ? (Ae = Yt) : (xe.sibling = Yt),
            (xe = Yt)));
      return (
        r &&
          be.forEach(function (Ts) {
            return s($, Ts);
          }),
        St && uo($, Me),
        Ae
      );
    }
    function Re($, M, H, le) {
      var Ae = me(H);
      if (typeof Ae != "function") throw Error(t(150));
      if (((H = Ae.call(H)), H == null)) throw Error(t(151));
      for (
        var xe = (Ae = null), be = M, Me = (M = 0), Yt = null, it = H.next();
        be !== null && !it.done;
        Me++, it = H.next()
      ) {
        be.index > Me ? ((Yt = be), (be = null)) : (Yt = be.sibling);
        var Ts = te($, be, it.value, le);
        if (Ts === null) {
          be === null && (be = Yt);
          break;
        }
        (r && be && Ts.alternate === null && s($, be),
          (M = y(Ts, M, Me)),
          xe === null ? (Ae = Ts) : (xe.sibling = Ts),
          (xe = Ts),
          (be = Yt));
      }
      if (it.done) return (l($, be), St && uo($, Me), Ae);
      if (be === null) {
        for (; !it.done; Me++, it = H.next())
          ((it = se($, it.value, le)),
            it !== null &&
              ((M = y(it, M, Me)),
              xe === null ? (Ae = it) : (xe.sibling = it),
              (xe = it)));
        return (St && uo($, Me), Ae);
      }
      for (be = h($, be); !it.done; Me++, it = H.next())
        ((it = fe(be, $, Me, it.value, le)),
          it !== null &&
            (r &&
              it.alternate !== null &&
              be.delete(it.key === null ? Me : it.key),
            (M = y(it, M, Me)),
            xe === null ? (Ae = it) : (xe.sibling = it),
            (xe = it)));
      return (
        r &&
          be.forEach(function (_I) {
            return s($, _I);
          }),
        St && uo($, Me),
        Ae
      );
    }
    function Nt($, M, H, le) {
      if (
        (typeof H == "object" &&
          H !== null &&
          H.type === S &&
          H.key === null &&
          (H = H.props.children),
        typeof H == "object" && H !== null)
      ) {
        switch (H.$$typeof) {
          case ee:
            e: {
              for (var Ae = H.key, xe = M; xe !== null; ) {
                if (xe.key === Ae) {
                  if (((Ae = H.type), Ae === S)) {
                    if (xe.tag === 7) {
                      (l($, xe.sibling),
                        (M = p(xe, H.props.children)),
                        (M.return = $),
                        ($ = M));
                      break e;
                    }
                  } else if (
                    xe.elementType === Ae ||
                    (typeof Ae == "object" &&
                      Ae !== null &&
                      Ae.$$typeof === lt &&
                      Kg(Ae) === xe.type)
                  ) {
                    (l($, xe.sibling),
                      (M = p(xe, H.props)),
                      (M.ref = cl($, xe, H)),
                      (M.return = $),
                      ($ = M));
                    break e;
                  }
                  l($, xe);
                  break;
                } else s($, xe);
                xe = xe.sibling;
              }
              H.type === S
                ? ((M = vo(H.props.children, $.mode, le, H.key)),
                  (M.return = $),
                  ($ = M))
                : ((le = Tc(H.type, H.key, H.props, null, $.mode, le)),
                  (le.ref = cl($, M, H)),
                  (le.return = $),
                  ($ = le));
            }
            return E($);
          case he:
            e: {
              for (xe = H.key; M !== null; ) {
                if (M.key === xe)
                  if (
                    M.tag === 4 &&
                    M.stateNode.containerInfo === H.containerInfo &&
                    M.stateNode.implementation === H.implementation
                  ) {
                    (l($, M.sibling),
                      (M = p(M, H.children || [])),
                      (M.return = $),
                      ($ = M));
                    break e;
                  } else {
                    l($, M);
                    break;
                  }
                else s($, M);
                M = M.sibling;
              }
              ((M = xf(H, $.mode, le)), (M.return = $), ($ = M));
            }
            return E($);
          case lt:
            return ((xe = H._init), Nt($, M, xe(H._payload), le));
        }
        if (fr(H)) return we($, M, H, le);
        if (me(H)) return Re($, M, H, le);
        Ju($, H);
      }
      return (typeof H == "string" && H !== "") || typeof H == "number"
        ? ((H = "" + H),
          M !== null && M.tag === 6
            ? (l($, M.sibling), (M = p(M, H)), (M.return = $), ($ = M))
            : (l($, M), (M = kf(H, $.mode, le)), (M.return = $), ($ = M)),
          E($))
        : l($, M);
    }
    return Nt;
  }
  var oa = Gg(!0),
    Qg = Gg(!1),
    Zu = hs(null),
    ec = null,
    aa = null,
    Fd = null;
  function Ud() {
    Fd = aa = ec = null;
  }
  function zd(r) {
    var s = Zu.current;
    (wt(Zu), (r._currentValue = s));
  }
  function jd(r, s, l) {
    for (; r !== null; ) {
      var h = r.alternate;
      if (
        ((r.childLanes & s) !== s
          ? ((r.childLanes |= s), h !== null && (h.childLanes |= s))
          : h !== null && (h.childLanes & s) !== s && (h.childLanes |= s),
        r === l)
      )
        break;
      r = r.return;
    }
  }
  function la(r, s) {
    ((ec = r),
      (Fd = aa = null),
      (r = r.dependencies),
      r !== null &&
        r.firstContext !== null &&
        ((r.lanes & s) !== 0 && (Dn = !0), (r.firstContext = null)));
  }
  function ir(r) {
    var s = r._currentValue;
    if (Fd !== r)
      if (((r = { context: r, memoizedValue: s, next: null }), aa === null)) {
        if (ec === null) throw Error(t(308));
        ((aa = r), (ec.dependencies = { lanes: 0, firstContext: r }));
      } else aa = aa.next = r;
    return s;
  }
  var co = null;
  function Bd(r) {
    co === null ? (co = [r]) : co.push(r);
  }
  function Yg(r, s, l, h) {
    var p = s.interleaved;
    return (
      p === null ? ((l.next = l), Bd(s)) : ((l.next = p.next), (p.next = l)),
      (s.interleaved = l),
      Ci(r, h)
    );
  }
  function Ci(r, s) {
    r.lanes |= s;
    var l = r.alternate;
    for (l !== null && (l.lanes |= s), l = r, r = r.return; r !== null; )
      ((r.childLanes |= s),
        (l = r.alternate),
        l !== null && (l.childLanes |= s),
        (l = r),
        (r = r.return));
    return l.tag === 3 ? l.stateNode : null;
  }
  var ps = !1;
  function $d(r) {
    r.updateQueue = {
      baseState: r.memoizedState,
      firstBaseUpdate: null,
      lastBaseUpdate: null,
      shared: { pending: null, interleaved: null, lanes: 0 },
      effects: null,
    };
  }
  function Xg(r, s) {
    ((r = r.updateQueue),
      s.updateQueue === r &&
        (s.updateQueue = {
          baseState: r.baseState,
          firstBaseUpdate: r.firstBaseUpdate,
          lastBaseUpdate: r.lastBaseUpdate,
          shared: r.shared,
          effects: r.effects,
        }));
  }
  function Pi(r, s) {
    return {
      eventTime: r,
      lane: s,
      tag: 0,
      payload: null,
      callback: null,
      next: null,
    };
  }
  function ms(r, s, l) {
    var h = r.updateQueue;
    if (h === null) return null;
    if (((h = h.shared), (nt & 2) !== 0)) {
      var p = h.pending;
      return (
        p === null ? (s.next = s) : ((s.next = p.next), (p.next = s)),
        (h.pending = s),
        Ci(r, l)
      );
    }
    return (
      (p = h.interleaved),
      p === null ? ((s.next = s), Bd(h)) : ((s.next = p.next), (p.next = s)),
      (h.interleaved = s),
      Ci(r, l)
    );
  }
  function tc(r, s, l) {
    if (
      ((s = s.updateQueue), s !== null && ((s = s.shared), (l & 4194240) !== 0))
    ) {
      var h = s.lanes;
      ((h &= r.pendingLanes), (l |= h), (s.lanes = l), is(r, l));
    }
  }
  function Jg(r, s) {
    var l = r.updateQueue,
      h = r.alternate;
    if (h !== null && ((h = h.updateQueue), l === h)) {
      var p = null,
        y = null;
      if (((l = l.firstBaseUpdate), l !== null)) {
        do {
          var E = {
            eventTime: l.eventTime,
            lane: l.lane,
            tag: l.tag,
            payload: l.payload,
            callback: l.callback,
            next: null,
          };
          (y === null ? (p = y = E) : (y = y.next = E), (l = l.next));
        } while (l !== null);
        y === null ? (p = y = s) : (y = y.next = s);
      } else p = y = s;
      ((l = {
        baseState: h.baseState,
        firstBaseUpdate: p,
        lastBaseUpdate: y,
        shared: h.shared,
        effects: h.effects,
      }),
        (r.updateQueue = l));
      return;
    }
    ((r = l.lastBaseUpdate),
      r === null ? (l.firstBaseUpdate = s) : (r.next = s),
      (l.lastBaseUpdate = s));
  }
  function nc(r, s, l, h) {
    var p = r.updateQueue;
    ps = !1;
    var y = p.firstBaseUpdate,
      E = p.lastBaseUpdate,
      P = p.shared.pending;
    if (P !== null) {
      p.shared.pending = null;
      var N = P,
        K = N.next;
      ((N.next = null), E === null ? (y = K) : (E.next = K), (E = N));
      var re = r.alternate;
      re !== null &&
        ((re = re.updateQueue),
        (P = re.lastBaseUpdate),
        P !== E &&
          (P === null ? (re.firstBaseUpdate = K) : (P.next = K),
          (re.lastBaseUpdate = N)));
    }
    if (y !== null) {
      var se = p.baseState;
      ((E = 0), (re = K = N = null), (P = y));
      do {
        var te = P.lane,
          fe = P.eventTime;
        if ((h & te) === te) {
          re !== null &&
            (re = re.next =
              {
                eventTime: fe,
                lane: 0,
                tag: P.tag,
                payload: P.payload,
                callback: P.callback,
                next: null,
              });
          e: {
            var we = r,
              Re = P;
            switch (((te = s), (fe = l), Re.tag)) {
              case 1:
                if (((we = Re.payload), typeof we == "function")) {
                  se = we.call(fe, se, te);
                  break e;
                }
                se = we;
                break e;
              case 3:
                we.flags = (we.flags & -65537) | 128;
              case 0:
                if (
                  ((we = Re.payload),
                  (te = typeof we == "function" ? we.call(fe, se, te) : we),
                  te == null)
                )
                  break e;
                se = de({}, se, te);
                break e;
              case 2:
                ps = !0;
            }
          }
          P.callback !== null &&
            P.lane !== 0 &&
            ((r.flags |= 64),
            (te = p.effects),
            te === null ? (p.effects = [P]) : te.push(P));
        } else
          ((fe = {
            eventTime: fe,
            lane: te,
            tag: P.tag,
            payload: P.payload,
            callback: P.callback,
            next: null,
          }),
            re === null ? ((K = re = fe), (N = se)) : (re = re.next = fe),
            (E |= te));
        if (((P = P.next), P === null)) {
          if (((P = p.shared.pending), P === null)) break;
          ((te = P),
            (P = te.next),
            (te.next = null),
            (p.lastBaseUpdate = te),
            (p.shared.pending = null));
        }
      } while (!0);
      if (
        (re === null && (N = se),
        (p.baseState = N),
        (p.firstBaseUpdate = K),
        (p.lastBaseUpdate = re),
        (s = p.shared.interleaved),
        s !== null)
      ) {
        p = s;
        do ((E |= p.lane), (p = p.next));
        while (p !== s);
      } else y === null && (p.shared.lanes = 0);
      ((po |= E), (r.lanes = E), (r.memoizedState = se));
    }
  }
  function Zg(r, s, l) {
    if (((r = s.effects), (s.effects = null), r !== null))
      for (s = 0; s < r.length; s++) {
        var h = r[s],
          p = h.callback;
        if (p !== null) {
          if (((h.callback = null), (h = l), typeof p != "function"))
            throw Error(t(191, p));
          p.call(h);
        }
      }
  }
  var hl = {},
    Wr = hs(hl),
    dl = hs(hl),
    fl = hs(hl);
  function ho(r) {
    if (r === hl) throw Error(t(174));
    return r;
  }
  function Hd(r, s) {
    switch ((gt(fl, s), gt(dl, r), gt(Wr, hl), (r = s.nodeType), r)) {
      case 9:
      case 11:
        s = (s = s.documentElement) ? s.namespaceURI : ut(null, "");
        break;
      default:
        ((r = r === 8 ? s.parentNode : s),
          (s = r.namespaceURI || null),
          (r = r.tagName),
          (s = ut(s, r)));
    }
    (wt(Wr), gt(Wr, s));
  }
  function ua() {
    (wt(Wr), wt(dl), wt(fl));
  }
  function ey(r) {
    ho(fl.current);
    var s = ho(Wr.current),
      l = ut(s, r.type);
    s !== l && (gt(dl, r), gt(Wr, l));
  }
  function Wd(r) {
    dl.current === r && (wt(Wr), wt(dl));
  }
  var Ct = hs(0);
  function rc(r) {
    for (var s = r; s !== null; ) {
      if (s.tag === 13) {
        var l = s.memoizedState;
        if (
          l !== null &&
          ((l = l.dehydrated), l === null || l.data === "$?" || l.data === "$!")
        )
          return s;
      } else if (s.tag === 19 && s.memoizedProps.revealOrder !== void 0) {
        if ((s.flags & 128) !== 0) return s;
      } else if (s.child !== null) {
        ((s.child.return = s), (s = s.child));
        continue;
      }
      if (s === r) break;
      for (; s.sibling === null; ) {
        if (s.return === null || s.return === r) return null;
        s = s.return;
      }
      ((s.sibling.return = s.return), (s = s.sibling));
    }
    return null;
  }
  var qd = [];
  function Kd() {
    for (var r = 0; r < qd.length; r++)
      qd[r]._workInProgressVersionPrimary = null;
    qd.length = 0;
  }
  var ic = ae.ReactCurrentDispatcher,
    Gd = ae.ReactCurrentBatchConfig,
    fo = 0,
    Pt = null,
    $t = null,
    Gt = null,
    sc = !1,
    pl = !1,
    ml = 0,
    jS = 0;
  function hn() {
    throw Error(t(321));
  }
  function Qd(r, s) {
    if (s === null) return !1;
    for (var l = 0; l < s.length && l < r.length; l++)
      if (!Ir(r[l], s[l])) return !1;
    return !0;
  }
  function Yd(r, s, l, h, p, y) {
    if (
      ((fo = y),
      (Pt = s),
      (s.memoizedState = null),
      (s.updateQueue = null),
      (s.lanes = 0),
      (ic.current = r === null || r.memoizedState === null ? WS : qS),
      (r = l(h, p)),
      pl)
    ) {
      y = 0;
      do {
        if (((pl = !1), (ml = 0), 25 <= y)) throw Error(t(301));
        ((y += 1),
          (Gt = $t = null),
          (s.updateQueue = null),
          (ic.current = KS),
          (r = l(h, p)));
      } while (pl);
    }
    if (
      ((ic.current = lc),
      (s = $t !== null && $t.next !== null),
      (fo = 0),
      (Gt = $t = Pt = null),
      (sc = !1),
      s)
    )
      throw Error(t(300));
    return r;
  }
  function Xd() {
    var r = ml !== 0;
    return ((ml = 0), r);
  }
  function qr() {
    var r = {
      memoizedState: null,
      baseState: null,
      baseQueue: null,
      queue: null,
      next: null,
    };
    return (Gt === null ? (Pt.memoizedState = Gt = r) : (Gt = Gt.next = r), Gt);
  }
  function sr() {
    if ($t === null) {
      var r = Pt.alternate;
      r = r !== null ? r.memoizedState : null;
    } else r = $t.next;
    var s = Gt === null ? Pt.memoizedState : Gt.next;
    if (s !== null) ((Gt = s), ($t = r));
    else {
      if (r === null) throw Error(t(310));
      (($t = r),
        (r = {
          memoizedState: $t.memoizedState,
          baseState: $t.baseState,
          baseQueue: $t.baseQueue,
          queue: $t.queue,
          next: null,
        }),
        Gt === null ? (Pt.memoizedState = Gt = r) : (Gt = Gt.next = r));
    }
    return Gt;
  }
  function gl(r, s) {
    return typeof s == "function" ? s(r) : s;
  }
  function Jd(r) {
    var s = sr(),
      l = s.queue;
    if (l === null) throw Error(t(311));
    l.lastRenderedReducer = r;
    var h = $t,
      p = h.baseQueue,
      y = l.pending;
    if (y !== null) {
      if (p !== null) {
        var E = p.next;
        ((p.next = y.next), (y.next = E));
      }
      ((h.baseQueue = p = y), (l.pending = null));
    }
    if (p !== null) {
      ((y = p.next), (h = h.baseState));
      var P = (E = null),
        N = null,
        K = y;
      do {
        var re = K.lane;
        if ((fo & re) === re)
          (N !== null &&
            (N = N.next =
              {
                lane: 0,
                action: K.action,
                hasEagerState: K.hasEagerState,
                eagerState: K.eagerState,
                next: null,
              }),
            (h = K.hasEagerState ? K.eagerState : r(h, K.action)));
        else {
          var se = {
            lane: re,
            action: K.action,
            hasEagerState: K.hasEagerState,
            eagerState: K.eagerState,
            next: null,
          };
          (N === null ? ((P = N = se), (E = h)) : (N = N.next = se),
            (Pt.lanes |= re),
            (po |= re));
        }
        K = K.next;
      } while (K !== null && K !== y);
      (N === null ? (E = h) : (N.next = P),
        Ir(h, s.memoizedState) || (Dn = !0),
        (s.memoizedState = h),
        (s.baseState = E),
        (s.baseQueue = N),
        (l.lastRenderedState = h));
    }
    if (((r = l.interleaved), r !== null)) {
      p = r;
      do ((y = p.lane), (Pt.lanes |= y), (po |= y), (p = p.next));
      while (p !== r);
    } else p === null && (l.lanes = 0);
    return [s.memoizedState, l.dispatch];
  }
  function Zd(r) {
    var s = sr(),
      l = s.queue;
    if (l === null) throw Error(t(311));
    l.lastRenderedReducer = r;
    var h = l.dispatch,
      p = l.pending,
      y = s.memoizedState;
    if (p !== null) {
      l.pending = null;
      var E = (p = p.next);
      do ((y = r(y, E.action)), (E = E.next));
      while (E !== p);
      (Ir(y, s.memoizedState) || (Dn = !0),
        (s.memoizedState = y),
        s.baseQueue === null && (s.baseState = y),
        (l.lastRenderedState = y));
    }
    return [y, h];
  }
  function ty() {}
  function ny(r, s) {
    var l = Pt,
      h = sr(),
      p = s(),
      y = !Ir(h.memoizedState, p);
    if (
      (y && ((h.memoizedState = p), (Dn = !0)),
      (h = h.queue),
      ef(sy.bind(null, l, h, r), [r]),
      h.getSnapshot !== s || y || (Gt !== null && Gt.memoizedState.tag & 1))
    ) {
      if (
        ((l.flags |= 2048),
        yl(9, iy.bind(null, l, h, p, s), void 0, null),
        Qt === null)
      )
        throw Error(t(349));
      (fo & 30) !== 0 || ry(l, s, p);
    }
    return p;
  }
  function ry(r, s, l) {
    ((r.flags |= 16384),
      (r = { getSnapshot: s, value: l }),
      (s = Pt.updateQueue),
      s === null
        ? ((s = { lastEffect: null, stores: null }),
          (Pt.updateQueue = s),
          (s.stores = [r]))
        : ((l = s.stores), l === null ? (s.stores = [r]) : l.push(r)));
  }
  function iy(r, s, l, h) {
    ((s.value = l), (s.getSnapshot = h), oy(s) && ay(r));
  }
  function sy(r, s, l) {
    return l(function () {
      oy(s) && ay(r);
    });
  }
  function oy(r) {
    var s = r.getSnapshot;
    r = r.value;
    try {
      var l = s();
      return !Ir(r, l);
    } catch {
      return !0;
    }
  }
  function ay(r) {
    var s = Ci(r, 1);
    s !== null && kr(s, r, 1, -1);
  }
  function ly(r) {
    var s = qr();
    return (
      typeof r == "function" && (r = r()),
      (s.memoizedState = s.baseState = r),
      (r = {
        pending: null,
        interleaved: null,
        lanes: 0,
        dispatch: null,
        lastRenderedReducer: gl,
        lastRenderedState: r,
      }),
      (s.queue = r),
      (r = r.dispatch = HS.bind(null, Pt, r)),
      [s.memoizedState, r]
    );
  }
  function yl(r, s, l, h) {
    return (
      (r = { tag: r, create: s, destroy: l, deps: h, next: null }),
      (s = Pt.updateQueue),
      s === null
        ? ((s = { lastEffect: null, stores: null }),
          (Pt.updateQueue = s),
          (s.lastEffect = r.next = r))
        : ((l = s.lastEffect),
          l === null
            ? (s.lastEffect = r.next = r)
            : ((h = l.next), (l.next = r), (r.next = h), (s.lastEffect = r))),
      r
    );
  }
  function uy() {
    return sr().memoizedState;
  }
  function oc(r, s, l, h) {
    var p = qr();
    ((Pt.flags |= r),
      (p.memoizedState = yl(1 | s, l, void 0, h === void 0 ? null : h)));
  }
  function ac(r, s, l, h) {
    var p = sr();
    h = h === void 0 ? null : h;
    var y = void 0;
    if ($t !== null) {
      var E = $t.memoizedState;
      if (((y = E.destroy), h !== null && Qd(h, E.deps))) {
        p.memoizedState = yl(s, l, y, h);
        return;
      }
    }
    ((Pt.flags |= r), (p.memoizedState = yl(1 | s, l, y, h)));
  }
  function cy(r, s) {
    return oc(8390656, 8, r, s);
  }
  function ef(r, s) {
    return ac(2048, 8, r, s);
  }
  function hy(r, s) {
    return ac(4, 2, r, s);
  }
  function dy(r, s) {
    return ac(4, 4, r, s);
  }
  function fy(r, s) {
    if (typeof s == "function")
      return (
        (r = r()),
        s(r),
        function () {
          s(null);
        }
      );
    if (s != null)
      return (
        (r = r()),
        (s.current = r),
        function () {
          s.current = null;
        }
      );
  }
  function py(r, s, l) {
    return (
      (l = l != null ? l.concat([r]) : null),
      ac(4, 4, fy.bind(null, s, r), l)
    );
  }
  function tf() {}
  function my(r, s) {
    var l = sr();
    s = s === void 0 ? null : s;
    var h = l.memoizedState;
    return h !== null && s !== null && Qd(s, h[1])
      ? h[0]
      : ((l.memoizedState = [r, s]), r);
  }
  function gy(r, s) {
    var l = sr();
    s = s === void 0 ? null : s;
    var h = l.memoizedState;
    return h !== null && s !== null && Qd(s, h[1])
      ? h[0]
      : ((r = r()), (l.memoizedState = [r, s]), r);
  }
  function yy(r, s, l) {
    return (fo & 21) === 0
      ? (r.baseState && ((r.baseState = !1), (Dn = !0)), (r.memoizedState = l))
      : (Ir(l, s) ||
          ((l = to()), (Pt.lanes |= l), (po |= l), (r.baseState = !0)),
        s);
  }
  function BS(r, s) {
    var l = Je;
    ((Je = l !== 0 && 4 > l ? l : 4), r(!0));
    var h = Gd.transition;
    Gd.transition = {};
    try {
      (r(!1), s());
    } finally {
      ((Je = l), (Gd.transition = h));
    }
  }
  function vy() {
    return sr().memoizedState;
  }
  function $S(r, s, l) {
    var h = _s(r);
    if (
      ((l = {
        lane: h,
        action: l,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      }),
      _y(r))
    )
      wy(s, l);
    else if (((l = Yg(r, s, l, h)), l !== null)) {
      var p = Tn();
      (kr(l, r, h, p), Ey(l, s, h));
    }
  }
  function HS(r, s, l) {
    var h = _s(r),
      p = {
        lane: h,
        action: l,
        hasEagerState: !1,
        eagerState: null,
        next: null,
      };
    if (_y(r)) wy(s, p);
    else {
      var y = r.alternate;
      if (
        r.lanes === 0 &&
        (y === null || y.lanes === 0) &&
        ((y = s.lastRenderedReducer), y !== null)
      )
        try {
          var E = s.lastRenderedState,
            P = y(E, l);
          if (((p.hasEagerState = !0), (p.eagerState = P), Ir(P, E))) {
            var N = s.interleaved;
            (N === null
              ? ((p.next = p), Bd(s))
              : ((p.next = N.next), (N.next = p)),
              (s.interleaved = p));
            return;
          }
        } catch {
        } finally {
        }
      ((l = Yg(r, s, p, h)),
        l !== null && ((p = Tn()), kr(l, r, h, p), Ey(l, s, h)));
    }
  }
  function _y(r) {
    var s = r.alternate;
    return r === Pt || (s !== null && s === Pt);
  }
  function wy(r, s) {
    pl = sc = !0;
    var l = r.pending;
    (l === null ? (s.next = s) : ((s.next = l.next), (l.next = s)),
      (r.pending = s));
  }
  function Ey(r, s, l) {
    if ((l & 4194240) !== 0) {
      var h = s.lanes;
      ((h &= r.pendingLanes), (l |= h), (s.lanes = l), is(r, l));
    }
  }
  var lc = {
      readContext: ir,
      useCallback: hn,
      useContext: hn,
      useEffect: hn,
      useImperativeHandle: hn,
      useInsertionEffect: hn,
      useLayoutEffect: hn,
      useMemo: hn,
      useReducer: hn,
      useRef: hn,
      useState: hn,
      useDebugValue: hn,
      useDeferredValue: hn,
      useTransition: hn,
      useMutableSource: hn,
      useSyncExternalStore: hn,
      useId: hn,
      unstable_isNewReconciler: !1,
    },
    WS = {
      readContext: ir,
      useCallback: function (r, s) {
        return ((qr().memoizedState = [r, s === void 0 ? null : s]), r);
      },
      useContext: ir,
      useEffect: cy,
      useImperativeHandle: function (r, s, l) {
        return (
          (l = l != null ? l.concat([r]) : null),
          oc(4194308, 4, fy.bind(null, s, r), l)
        );
      },
      useLayoutEffect: function (r, s) {
        return oc(4194308, 4, r, s);
      },
      useInsertionEffect: function (r, s) {
        return oc(4, 2, r, s);
      },
      useMemo: function (r, s) {
        var l = qr();
        return (
          (s = s === void 0 ? null : s),
          (r = r()),
          (l.memoizedState = [r, s]),
          r
        );
      },
      useReducer: function (r, s, l) {
        var h = qr();
        return (
          (s = l !== void 0 ? l(s) : s),
          (h.memoizedState = h.baseState = s),
          (r = {
            pending: null,
            interleaved: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: r,
            lastRenderedState: s,
          }),
          (h.queue = r),
          (r = r.dispatch = $S.bind(null, Pt, r)),
          [h.memoizedState, r]
        );
      },
      useRef: function (r) {
        var s = qr();
        return ((r = { current: r }), (s.memoizedState = r));
      },
      useState: ly,
      useDebugValue: tf,
      useDeferredValue: function (r) {
        return (qr().memoizedState = r);
      },
      useTransition: function () {
        var r = ly(!1),
          s = r[0];
        return ((r = BS.bind(null, r[1])), (qr().memoizedState = r), [s, r]);
      },
      useMutableSource: function () {},
      useSyncExternalStore: function (r, s, l) {
        var h = Pt,
          p = qr();
        if (St) {
          if (l === void 0) throw Error(t(407));
          l = l();
        } else {
          if (((l = s()), Qt === null)) throw Error(t(349));
          (fo & 30) !== 0 || ry(h, s, l);
        }
        p.memoizedState = l;
        var y = { value: l, getSnapshot: s };
        return (
          (p.queue = y),
          cy(sy.bind(null, h, y, r), [r]),
          (h.flags |= 2048),
          yl(9, iy.bind(null, h, y, l, s), void 0, null),
          l
        );
      },
      useId: function () {
        var r = qr(),
          s = Qt.identifierPrefix;
        if (St) {
          var l = Ai,
            h = Ri;
          ((l = (h & ~(1 << (32 - At(h) - 1))).toString(32) + l),
            (s = ":" + s + "R" + l),
            (l = ml++),
            0 < l && (s += "H" + l.toString(32)),
            (s += ":"));
        } else ((l = jS++), (s = ":" + s + "r" + l.toString(32) + ":"));
        return (r.memoizedState = s);
      },
      unstable_isNewReconciler: !1,
    },
    qS = {
      readContext: ir,
      useCallback: my,
      useContext: ir,
      useEffect: ef,
      useImperativeHandle: py,
      useInsertionEffect: hy,
      useLayoutEffect: dy,
      useMemo: gy,
      useReducer: Jd,
      useRef: uy,
      useState: function () {
        return Jd(gl);
      },
      useDebugValue: tf,
      useDeferredValue: function (r) {
        var s = sr();
        return yy(s, $t.memoizedState, r);
      },
      useTransition: function () {
        var r = Jd(gl)[0],
          s = sr().memoizedState;
        return [r, s];
      },
      useMutableSource: ty,
      useSyncExternalStore: ny,
      useId: vy,
      unstable_isNewReconciler: !1,
    },
    KS = {
      readContext: ir,
      useCallback: my,
      useContext: ir,
      useEffect: ef,
      useImperativeHandle: py,
      useInsertionEffect: hy,
      useLayoutEffect: dy,
      useMemo: gy,
      useReducer: Zd,
      useRef: uy,
      useState: function () {
        return Zd(gl);
      },
      useDebugValue: tf,
      useDeferredValue: function (r) {
        var s = sr();
        return $t === null ? (s.memoizedState = r) : yy(s, $t.memoizedState, r);
      },
      useTransition: function () {
        var r = Zd(gl)[0],
          s = sr().memoizedState;
        return [r, s];
      },
      useMutableSource: ty,
      useSyncExternalStore: ny,
      useId: vy,
      unstable_isNewReconciler: !1,
    };
  function Ar(r, s) {
    if (r && r.defaultProps) {
      ((s = de({}, s)), (r = r.defaultProps));
      for (var l in r) s[l] === void 0 && (s[l] = r[l]);
      return s;
    }
    return s;
  }
  function nf(r, s, l, h) {
    ((s = r.memoizedState),
      (l = l(h, s)),
      (l = l == null ? s : de({}, s, l)),
      (r.memoizedState = l),
      r.lanes === 0 && (r.updateQueue.baseState = l));
  }
  var uc = {
    isMounted: function (r) {
      return (r = r._reactInternals) ? ve(r) === r : !1;
    },
    enqueueSetState: function (r, s, l) {
      r = r._reactInternals;
      var h = Tn(),
        p = _s(r),
        y = Pi(h, p);
      ((y.payload = s),
        l != null && (y.callback = l),
        (s = ms(r, y, p)),
        s !== null && (kr(s, r, p, h), tc(s, r, p)));
    },
    enqueueReplaceState: function (r, s, l) {
      r = r._reactInternals;
      var h = Tn(),
        p = _s(r),
        y = Pi(h, p);
      ((y.tag = 1),
        (y.payload = s),
        l != null && (y.callback = l),
        (s = ms(r, y, p)),
        s !== null && (kr(s, r, p, h), tc(s, r, p)));
    },
    enqueueForceUpdate: function (r, s) {
      r = r._reactInternals;
      var l = Tn(),
        h = _s(r),
        p = Pi(l, h);
      ((p.tag = 2),
        s != null && (p.callback = s),
        (s = ms(r, p, h)),
        s !== null && (kr(s, r, h, l), tc(s, r, h)));
    },
  };
  function Ty(r, s, l, h, p, y, E) {
    return (
      (r = r.stateNode),
      typeof r.shouldComponentUpdate == "function"
        ? r.shouldComponentUpdate(h, y, E)
        : s.prototype && s.prototype.isPureReactComponent
          ? !rl(l, h) || !rl(p, y)
          : !0
    );
  }
  function Sy(r, s, l) {
    var h = !1,
      p = ds,
      y = s.contextType;
    return (
      typeof y == "object" && y !== null
        ? (y = ir(y))
        : ((p = bn(s) ? ao : cn.current),
          (h = s.contextTypes),
          (y = (h = h != null) ? na(r, p) : ds)),
      (s = new s(l, y)),
      (r.memoizedState =
        s.state !== null && s.state !== void 0 ? s.state : null),
      (s.updater = uc),
      (r.stateNode = s),
      (s._reactInternals = r),
      h &&
        ((r = r.stateNode),
        (r.__reactInternalMemoizedUnmaskedChildContext = p),
        (r.__reactInternalMemoizedMaskedChildContext = y)),
      s
    );
  }
  function Iy(r, s, l, h) {
    ((r = s.state),
      typeof s.componentWillReceiveProps == "function" &&
        s.componentWillReceiveProps(l, h),
      typeof s.UNSAFE_componentWillReceiveProps == "function" &&
        s.UNSAFE_componentWillReceiveProps(l, h),
      s.state !== r && uc.enqueueReplaceState(s, s.state, null));
  }
  function rf(r, s, l, h) {
    var p = r.stateNode;
    ((p.props = l), (p.state = r.memoizedState), (p.refs = {}), $d(r));
    var y = s.contextType;
    (typeof y == "object" && y !== null
      ? (p.context = ir(y))
      : ((y = bn(s) ? ao : cn.current), (p.context = na(r, y))),
      (p.state = r.memoizedState),
      (y = s.getDerivedStateFromProps),
      typeof y == "function" && (nf(r, s, y, l), (p.state = r.memoizedState)),
      typeof s.getDerivedStateFromProps == "function" ||
        typeof p.getSnapshotBeforeUpdate == "function" ||
        (typeof p.UNSAFE_componentWillMount != "function" &&
          typeof p.componentWillMount != "function") ||
        ((s = p.state),
        typeof p.componentWillMount == "function" && p.componentWillMount(),
        typeof p.UNSAFE_componentWillMount == "function" &&
          p.UNSAFE_componentWillMount(),
        s !== p.state && uc.enqueueReplaceState(p, p.state, null),
        nc(r, l, p, h),
        (p.state = r.memoizedState)),
      typeof p.componentDidMount == "function" && (r.flags |= 4194308));
  }
  function ca(r, s) {
    try {
      var l = "",
        h = s;
      do ((l += Fe(h)), (h = h.return));
      while (h);
      var p = l;
    } catch (y) {
      p =
        `
Error generating stack: ` +
        y.message +
        `
` +
        y.stack;
    }
    return { value: r, source: s, stack: p, digest: null };
  }
  function sf(r, s, l) {
    return { value: r, source: null, stack: l ?? null, digest: s ?? null };
  }
  function of(r, s) {
    try {
      console.error(s.value);
    } catch (l) {
      setTimeout(function () {
        throw l;
      });
    }
  }
  var GS = typeof WeakMap == "function" ? WeakMap : Map;
  function Ry(r, s, l) {
    ((l = Pi(-1, l)), (l.tag = 3), (l.payload = { element: null }));
    var h = s.value;
    return (
      (l.callback = function () {
        (gc || ((gc = !0), (Ef = h)), of(r, s));
      }),
      l
    );
  }
  function Ay(r, s, l) {
    ((l = Pi(-1, l)), (l.tag = 3));
    var h = r.type.getDerivedStateFromError;
    if (typeof h == "function") {
      var p = s.value;
      ((l.payload = function () {
        return h(p);
      }),
        (l.callback = function () {
          of(r, s);
        }));
    }
    var y = r.stateNode;
    return (
      y !== null &&
        typeof y.componentDidCatch == "function" &&
        (l.callback = function () {
          (of(r, s),
            typeof h != "function" &&
              (ys === null ? (ys = new Set([this])) : ys.add(this)));
          var E = s.stack;
          this.componentDidCatch(s.value, {
            componentStack: E !== null ? E : "",
          });
        }),
      l
    );
  }
  function Cy(r, s, l) {
    var h = r.pingCache;
    if (h === null) {
      h = r.pingCache = new GS();
      var p = new Set();
      h.set(s, p);
    } else ((p = h.get(s)), p === void 0 && ((p = new Set()), h.set(s, p)));
    p.has(l) || (p.add(l), (r = lI.bind(null, r, s, l)), s.then(r, r));
  }
  function Py(r) {
    do {
      var s;
      if (
        ((s = r.tag === 13) &&
          ((s = r.memoizedState),
          (s = s !== null ? s.dehydrated !== null : !0)),
        s)
      )
        return r;
      r = r.return;
    } while (r !== null);
    return null;
  }
  function ky(r, s, l, h, p) {
    return (r.mode & 1) === 0
      ? (r === s
          ? (r.flags |= 65536)
          : ((r.flags |= 128),
            (l.flags |= 131072),
            (l.flags &= -52805),
            l.tag === 1 &&
              (l.alternate === null
                ? (l.tag = 17)
                : ((s = Pi(-1, 1)), (s.tag = 2), ms(l, s, 1))),
            (l.lanes |= 1)),
        r)
      : ((r.flags |= 65536), (r.lanes = p), r);
  }
  var QS = ae.ReactCurrentOwner,
    Dn = !1;
  function En(r, s, l, h) {
    s.child = r === null ? Qg(s, null, l, h) : oa(s, r.child, l, h);
  }
  function xy(r, s, l, h, p) {
    l = l.render;
    var y = s.ref;
    return (
      la(s, p),
      (h = Yd(r, s, l, h, y, p)),
      (l = Xd()),
      r !== null && !Dn
        ? ((s.updateQueue = r.updateQueue),
          (s.flags &= -2053),
          (r.lanes &= ~p),
          ki(r, s, p))
        : (St && l && Nd(s), (s.flags |= 1), En(r, s, h, p), s.child)
    );
  }
  function by(r, s, l, h, p) {
    if (r === null) {
      var y = l.type;
      return typeof y == "function" &&
        !Pf(y) &&
        y.defaultProps === void 0 &&
        l.compare === null &&
        l.defaultProps === void 0
        ? ((s.tag = 15), (s.type = y), Dy(r, s, y, h, p))
        : ((r = Tc(l.type, null, h, s, s.mode, p)),
          (r.ref = s.ref),
          (r.return = s),
          (s.child = r));
    }
    if (((y = r.child), (r.lanes & p) === 0)) {
      var E = y.memoizedProps;
      if (
        ((l = l.compare), (l = l !== null ? l : rl), l(E, h) && r.ref === s.ref)
      )
        return ki(r, s, p);
    }
    return (
      (s.flags |= 1),
      (r = Es(y, h)),
      (r.ref = s.ref),
      (r.return = s),
      (s.child = r)
    );
  }
  function Dy(r, s, l, h, p) {
    if (r !== null) {
      var y = r.memoizedProps;
      if (rl(y, h) && r.ref === s.ref)
        if (((Dn = !1), (s.pendingProps = h = y), (r.lanes & p) !== 0))
          (r.flags & 131072) !== 0 && (Dn = !0);
        else return ((s.lanes = r.lanes), ki(r, s, p));
    }
    return af(r, s, l, h, p);
  }
  function Ny(r, s, l) {
    var h = s.pendingProps,
      p = h.children,
      y = r !== null ? r.memoizedState : null;
    if (h.mode === "hidden")
      if ((s.mode & 1) === 0)
        ((s.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null,
        }),
          gt(da, Hn),
          (Hn |= l));
      else {
        if ((l & 1073741824) === 0)
          return (
            (r = y !== null ? y.baseLanes | l : l),
            (s.lanes = s.childLanes = 1073741824),
            (s.memoizedState = {
              baseLanes: r,
              cachePool: null,
              transitions: null,
            }),
            (s.updateQueue = null),
            gt(da, Hn),
            (Hn |= r),
            null
          );
        ((s.memoizedState = {
          baseLanes: 0,
          cachePool: null,
          transitions: null,
        }),
          (h = y !== null ? y.baseLanes : l),
          gt(da, Hn),
          (Hn |= h));
      }
    else
      (y !== null ? ((h = y.baseLanes | l), (s.memoizedState = null)) : (h = l),
        gt(da, Hn),
        (Hn |= h));
    return (En(r, s, p, l), s.child);
  }
  function Oy(r, s) {
    var l = s.ref;
    ((r === null && l !== null) || (r !== null && r.ref !== l)) &&
      ((s.flags |= 512), (s.flags |= 2097152));
  }
  function af(r, s, l, h, p) {
    var y = bn(l) ? ao : cn.current;
    return (
      (y = na(s, y)),
      la(s, p),
      (l = Yd(r, s, l, h, y, p)),
      (h = Xd()),
      r !== null && !Dn
        ? ((s.updateQueue = r.updateQueue),
          (s.flags &= -2053),
          (r.lanes &= ~p),
          ki(r, s, p))
        : (St && h && Nd(s), (s.flags |= 1), En(r, s, l, p), s.child)
    );
  }
  function Ly(r, s, l, h, p) {
    if (bn(l)) {
      var y = !0;
      Ku(s);
    } else y = !1;
    if ((la(s, p), s.stateNode === null))
      (hc(r, s), Sy(s, l, h), rf(s, l, h, p), (h = !0));
    else if (r === null) {
      var E = s.stateNode,
        P = s.memoizedProps;
      E.props = P;
      var N = E.context,
        K = l.contextType;
      typeof K == "object" && K !== null
        ? (K = ir(K))
        : ((K = bn(l) ? ao : cn.current), (K = na(s, K)));
      var re = l.getDerivedStateFromProps,
        se =
          typeof re == "function" ||
          typeof E.getSnapshotBeforeUpdate == "function";
      (se ||
        (typeof E.UNSAFE_componentWillReceiveProps != "function" &&
          typeof E.componentWillReceiveProps != "function") ||
        ((P !== h || N !== K) && Iy(s, E, h, K)),
        (ps = !1));
      var te = s.memoizedState;
      ((E.state = te),
        nc(s, h, E, p),
        (N = s.memoizedState),
        P !== h || te !== N || xn.current || ps
          ? (typeof re == "function" &&
              (nf(s, l, re, h), (N = s.memoizedState)),
            (P = ps || Ty(s, l, P, h, te, N, K))
              ? (se ||
                  (typeof E.UNSAFE_componentWillMount != "function" &&
                    typeof E.componentWillMount != "function") ||
                  (typeof E.componentWillMount == "function" &&
                    E.componentWillMount(),
                  typeof E.UNSAFE_componentWillMount == "function" &&
                    E.UNSAFE_componentWillMount()),
                typeof E.componentDidMount == "function" &&
                  (s.flags |= 4194308))
              : (typeof E.componentDidMount == "function" &&
                  (s.flags |= 4194308),
                (s.memoizedProps = h),
                (s.memoizedState = N)),
            (E.props = h),
            (E.state = N),
            (E.context = K),
            (h = P))
          : (typeof E.componentDidMount == "function" && (s.flags |= 4194308),
            (h = !1)));
    } else {
      ((E = s.stateNode),
        Xg(r, s),
        (P = s.memoizedProps),
        (K = s.type === s.elementType ? P : Ar(s.type, P)),
        (E.props = K),
        (se = s.pendingProps),
        (te = E.context),
        (N = l.contextType),
        typeof N == "object" && N !== null
          ? (N = ir(N))
          : ((N = bn(l) ? ao : cn.current), (N = na(s, N))));
      var fe = l.getDerivedStateFromProps;
      ((re =
        typeof fe == "function" ||
        typeof E.getSnapshotBeforeUpdate == "function") ||
        (typeof E.UNSAFE_componentWillReceiveProps != "function" &&
          typeof E.componentWillReceiveProps != "function") ||
        ((P !== se || te !== N) && Iy(s, E, h, N)),
        (ps = !1),
        (te = s.memoizedState),
        (E.state = te),
        nc(s, h, E, p));
      var we = s.memoizedState;
      P !== se || te !== we || xn.current || ps
        ? (typeof fe == "function" && (nf(s, l, fe, h), (we = s.memoizedState)),
          (K = ps || Ty(s, l, K, h, te, we, N) || !1)
            ? (re ||
                (typeof E.UNSAFE_componentWillUpdate != "function" &&
                  typeof E.componentWillUpdate != "function") ||
                (typeof E.componentWillUpdate == "function" &&
                  E.componentWillUpdate(h, we, N),
                typeof E.UNSAFE_componentWillUpdate == "function" &&
                  E.UNSAFE_componentWillUpdate(h, we, N)),
              typeof E.componentDidUpdate == "function" && (s.flags |= 4),
              typeof E.getSnapshotBeforeUpdate == "function" &&
                (s.flags |= 1024))
            : (typeof E.componentDidUpdate != "function" ||
                (P === r.memoizedProps && te === r.memoizedState) ||
                (s.flags |= 4),
              typeof E.getSnapshotBeforeUpdate != "function" ||
                (P === r.memoizedProps && te === r.memoizedState) ||
                (s.flags |= 1024),
              (s.memoizedProps = h),
              (s.memoizedState = we)),
          (E.props = h),
          (E.state = we),
          (E.context = N),
          (h = K))
        : (typeof E.componentDidUpdate != "function" ||
            (P === r.memoizedProps && te === r.memoizedState) ||
            (s.flags |= 4),
          typeof E.getSnapshotBeforeUpdate != "function" ||
            (P === r.memoizedProps && te === r.memoizedState) ||
            (s.flags |= 1024),
          (h = !1));
    }
    return lf(r, s, l, h, y, p);
  }
  function lf(r, s, l, h, p, y) {
    Oy(r, s);
    var E = (s.flags & 128) !== 0;
    if (!h && !E) return (p && zg(s, l, !1), ki(r, s, y));
    ((h = s.stateNode), (QS.current = s));
    var P =
      E && typeof l.getDerivedStateFromError != "function" ? null : h.render();
    return (
      (s.flags |= 1),
      r !== null && E
        ? ((s.child = oa(s, r.child, null, y)), (s.child = oa(s, null, P, y)))
        : En(r, s, P, y),
      (s.memoizedState = h.state),
      p && zg(s, l, !0),
      s.child
    );
  }
  function My(r) {
    var s = r.stateNode;
    (s.pendingContext
      ? Fg(r, s.pendingContext, s.pendingContext !== s.context)
      : s.context && Fg(r, s.context, !1),
      Hd(r, s.containerInfo));
  }
  function Vy(r, s, l, h, p) {
    return (sa(), Vd(p), (s.flags |= 256), En(r, s, l, h), s.child);
  }
  var uf = { dehydrated: null, treeContext: null, retryLane: 0 };
  function cf(r) {
    return { baseLanes: r, cachePool: null, transitions: null };
  }
  function Fy(r, s, l) {
    var h = s.pendingProps,
      p = Ct.current,
      y = !1,
      E = (s.flags & 128) !== 0,
      P;
    if (
      ((P = E) ||
        (P = r !== null && r.memoizedState === null ? !1 : (p & 2) !== 0),
      P
        ? ((y = !0), (s.flags &= -129))
        : (r === null || r.memoizedState !== null) && (p |= 1),
      gt(Ct, p & 1),
      r === null)
    )
      return (
        Md(s),
        (r = s.memoizedState),
        r !== null && ((r = r.dehydrated), r !== null)
          ? ((s.mode & 1) === 0
              ? (s.lanes = 1)
              : r.data === "$!"
                ? (s.lanes = 8)
                : (s.lanes = 1073741824),
            null)
          : ((E = h.children),
            (r = h.fallback),
            y
              ? ((h = s.mode),
                (y = s.child),
                (E = { mode: "hidden", children: E }),
                (h & 1) === 0 && y !== null
                  ? ((y.childLanes = 0), (y.pendingProps = E))
                  : (y = Sc(E, h, 0, null)),
                (r = vo(r, h, l, null)),
                (y.return = s),
                (r.return = s),
                (y.sibling = r),
                (s.child = y),
                (s.child.memoizedState = cf(l)),
                (s.memoizedState = uf),
                r)
              : hf(s, E))
      );
    if (((p = r.memoizedState), p !== null && ((P = p.dehydrated), P !== null)))
      return YS(r, s, E, h, P, p, l);
    if (y) {
      ((y = h.fallback), (E = s.mode), (p = r.child), (P = p.sibling));
      var N = { mode: "hidden", children: h.children };
      return (
        (E & 1) === 0 && s.child !== p
          ? ((h = s.child),
            (h.childLanes = 0),
            (h.pendingProps = N),
            (s.deletions = null))
          : ((h = Es(p, N)), (h.subtreeFlags = p.subtreeFlags & 14680064)),
        P !== null ? (y = Es(P, y)) : ((y = vo(y, E, l, null)), (y.flags |= 2)),
        (y.return = s),
        (h.return = s),
        (h.sibling = y),
        (s.child = h),
        (h = y),
        (y = s.child),
        (E = r.child.memoizedState),
        (E =
          E === null
            ? cf(l)
            : {
                baseLanes: E.baseLanes | l,
                cachePool: null,
                transitions: E.transitions,
              }),
        (y.memoizedState = E),
        (y.childLanes = r.childLanes & ~l),
        (s.memoizedState = uf),
        h
      );
    }
    return (
      (y = r.child),
      (r = y.sibling),
      (h = Es(y, { mode: "visible", children: h.children })),
      (s.mode & 1) === 0 && (h.lanes = l),
      (h.return = s),
      (h.sibling = null),
      r !== null &&
        ((l = s.deletions),
        l === null ? ((s.deletions = [r]), (s.flags |= 16)) : l.push(r)),
      (s.child = h),
      (s.memoizedState = null),
      h
    );
  }
  function hf(r, s) {
    return (
      (s = Sc({ mode: "visible", children: s }, r.mode, 0, null)),
      (s.return = r),
      (r.child = s)
    );
  }
  function cc(r, s, l, h) {
    return (
      h !== null && Vd(h),
      oa(s, r.child, null, l),
      (r = hf(s, s.pendingProps.children)),
      (r.flags |= 2),
      (s.memoizedState = null),
      r
    );
  }
  function YS(r, s, l, h, p, y, E) {
    if (l)
      return s.flags & 256
        ? ((s.flags &= -257), (h = sf(Error(t(422)))), cc(r, s, E, h))
        : s.memoizedState !== null
          ? ((s.child = r.child), (s.flags |= 128), null)
          : ((y = h.fallback),
            (p = s.mode),
            (h = Sc({ mode: "visible", children: h.children }, p, 0, null)),
            (y = vo(y, p, E, null)),
            (y.flags |= 2),
            (h.return = s),
            (y.return = s),
            (h.sibling = y),
            (s.child = h),
            (s.mode & 1) !== 0 && oa(s, r.child, null, E),
            (s.child.memoizedState = cf(E)),
            (s.memoizedState = uf),
            y);
    if ((s.mode & 1) === 0) return cc(r, s, E, null);
    if (p.data === "$!") {
      if (((h = p.nextSibling && p.nextSibling.dataset), h)) var P = h.dgst;
      return (
        (h = P),
        (y = Error(t(419))),
        (h = sf(y, h, void 0)),
        cc(r, s, E, h)
      );
    }
    if (((P = (E & r.childLanes) !== 0), Dn || P)) {
      if (((h = Qt), h !== null)) {
        switch (E & -E) {
          case 4:
            p = 2;
            break;
          case 16:
            p = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            p = 32;
            break;
          case 536870912:
            p = 268435456;
            break;
          default:
            p = 0;
        }
        ((p = (p & (h.suspendedLanes | E)) !== 0 ? 0 : p),
          p !== 0 &&
            p !== y.retryLane &&
            ((y.retryLane = p), Ci(r, p), kr(h, r, p, -1)));
      }
      return (Cf(), (h = sf(Error(t(421)))), cc(r, s, E, h));
    }
    return p.data === "$?"
      ? ((s.flags |= 128),
        (s.child = r.child),
        (s = uI.bind(null, r)),
        (p._reactRetry = s),
        null)
      : ((r = y.treeContext),
        ($n = cs(p.nextSibling)),
        (Bn = s),
        (St = !0),
        (Rr = null),
        r !== null &&
          ((nr[rr++] = Ri),
          (nr[rr++] = Ai),
          (nr[rr++] = lo),
          (Ri = r.id),
          (Ai = r.overflow),
          (lo = s)),
        (s = hf(s, h.children)),
        (s.flags |= 4096),
        s);
  }
  function Uy(r, s, l) {
    r.lanes |= s;
    var h = r.alternate;
    (h !== null && (h.lanes |= s), jd(r.return, s, l));
  }
  function df(r, s, l, h, p) {
    var y = r.memoizedState;
    y === null
      ? (r.memoizedState = {
          isBackwards: s,
          rendering: null,
          renderingStartTime: 0,
          last: h,
          tail: l,
          tailMode: p,
        })
      : ((y.isBackwards = s),
        (y.rendering = null),
        (y.renderingStartTime = 0),
        (y.last = h),
        (y.tail = l),
        (y.tailMode = p));
  }
  function zy(r, s, l) {
    var h = s.pendingProps,
      p = h.revealOrder,
      y = h.tail;
    if ((En(r, s, h.children, l), (h = Ct.current), (h & 2) !== 0))
      ((h = (h & 1) | 2), (s.flags |= 128));
    else {
      if (r !== null && (r.flags & 128) !== 0)
        e: for (r = s.child; r !== null; ) {
          if (r.tag === 13) r.memoizedState !== null && Uy(r, l, s);
          else if (r.tag === 19) Uy(r, l, s);
          else if (r.child !== null) {
            ((r.child.return = r), (r = r.child));
            continue;
          }
          if (r === s) break e;
          for (; r.sibling === null; ) {
            if (r.return === null || r.return === s) break e;
            r = r.return;
          }
          ((r.sibling.return = r.return), (r = r.sibling));
        }
      h &= 1;
    }
    if ((gt(Ct, h), (s.mode & 1) === 0)) s.memoizedState = null;
    else
      switch (p) {
        case "forwards":
          for (l = s.child, p = null; l !== null; )
            ((r = l.alternate),
              r !== null && rc(r) === null && (p = l),
              (l = l.sibling));
          ((l = p),
            l === null
              ? ((p = s.child), (s.child = null))
              : ((p = l.sibling), (l.sibling = null)),
            df(s, !1, p, l, y));
          break;
        case "backwards":
          for (l = null, p = s.child, s.child = null; p !== null; ) {
            if (((r = p.alternate), r !== null && rc(r) === null)) {
              s.child = p;
              break;
            }
            ((r = p.sibling), (p.sibling = l), (l = p), (p = r));
          }
          df(s, !0, l, null, y);
          break;
        case "together":
          df(s, !1, null, null, void 0);
          break;
        default:
          s.memoizedState = null;
      }
    return s.child;
  }
  function hc(r, s) {
    (s.mode & 1) === 0 &&
      r !== null &&
      ((r.alternate = null), (s.alternate = null), (s.flags |= 2));
  }
  function ki(r, s, l) {
    if (
      (r !== null && (s.dependencies = r.dependencies),
      (po |= s.lanes),
      (l & s.childLanes) === 0)
    )
      return null;
    if (r !== null && s.child !== r.child) throw Error(t(153));
    if (s.child !== null) {
      for (
        r = s.child, l = Es(r, r.pendingProps), s.child = l, l.return = s;
        r.sibling !== null;

      )
        ((r = r.sibling),
          (l = l.sibling = Es(r, r.pendingProps)),
          (l.return = s));
      l.sibling = null;
    }
    return s.child;
  }
  function XS(r, s, l) {
    switch (s.tag) {
      case 3:
        (My(s), sa());
        break;
      case 5:
        ey(s);
        break;
      case 1:
        bn(s.type) && Ku(s);
        break;
      case 4:
        Hd(s, s.stateNode.containerInfo);
        break;
      case 10:
        var h = s.type._context,
          p = s.memoizedProps.value;
        (gt(Zu, h._currentValue), (h._currentValue = p));
        break;
      case 13:
        if (((h = s.memoizedState), h !== null))
          return h.dehydrated !== null
            ? (gt(Ct, Ct.current & 1), (s.flags |= 128), null)
            : (l & s.child.childLanes) !== 0
              ? Fy(r, s, l)
              : (gt(Ct, Ct.current & 1),
                (r = ki(r, s, l)),
                r !== null ? r.sibling : null);
        gt(Ct, Ct.current & 1);
        break;
      case 19:
        if (((h = (l & s.childLanes) !== 0), (r.flags & 128) !== 0)) {
          if (h) return zy(r, s, l);
          s.flags |= 128;
        }
        if (
          ((p = s.memoizedState),
          p !== null &&
            ((p.rendering = null), (p.tail = null), (p.lastEffect = null)),
          gt(Ct, Ct.current),
          h)
        )
          break;
        return null;
      case 22:
      case 23:
        return ((s.lanes = 0), Ny(r, s, l));
    }
    return ki(r, s, l);
  }
  var jy, ff, By, $y;
  ((jy = function (r, s) {
    for (var l = s.child; l !== null; ) {
      if (l.tag === 5 || l.tag === 6) r.appendChild(l.stateNode);
      else if (l.tag !== 4 && l.child !== null) {
        ((l.child.return = l), (l = l.child));
        continue;
      }
      if (l === s) break;
      for (; l.sibling === null; ) {
        if (l.return === null || l.return === s) return;
        l = l.return;
      }
      ((l.sibling.return = l.return), (l = l.sibling));
    }
  }),
    (ff = function () {}),
    (By = function (r, s, l, h) {
      var p = r.memoizedProps;
      if (p !== h) {
        ((r = s.stateNode), ho(Wr.current));
        var y = null;
        switch (l) {
          case "input":
            ((p = hi(r, p)), (h = hi(r, h)), (y = []));
            break;
          case "select":
            ((p = de({}, p, { value: void 0 })),
              (h = de({}, h, { value: void 0 })),
              (y = []));
            break;
          case "textarea":
            ((p = Ys(r, p)), (h = Ys(r, h)), (y = []));
            break;
          default:
            typeof p.onClick != "function" &&
              typeof h.onClick == "function" &&
              (r.onclick = Hu);
        }
        Ji(l, h);
        var E;
        l = null;
        for (K in p)
          if (!h.hasOwnProperty(K) && p.hasOwnProperty(K) && p[K] != null)
            if (K === "style") {
              var P = p[K];
              for (E in P) P.hasOwnProperty(E) && (l || (l = {}), (l[E] = ""));
            } else
              K !== "dangerouslySetInnerHTML" &&
                K !== "children" &&
                K !== "suppressContentEditableWarning" &&
                K !== "suppressHydrationWarning" &&
                K !== "autoFocus" &&
                (o.hasOwnProperty(K)
                  ? y || (y = [])
                  : (y = y || []).push(K, null));
        for (K in h) {
          var N = h[K];
          if (
            ((P = p?.[K]),
            h.hasOwnProperty(K) && N !== P && (N != null || P != null))
          )
            if (K === "style")
              if (P) {
                for (E in P)
                  !P.hasOwnProperty(E) ||
                    (N && N.hasOwnProperty(E)) ||
                    (l || (l = {}), (l[E] = ""));
                for (E in N)
                  N.hasOwnProperty(E) &&
                    P[E] !== N[E] &&
                    (l || (l = {}), (l[E] = N[E]));
              } else (l || (y || (y = []), y.push(K, l)), (l = N));
            else
              K === "dangerouslySetInnerHTML"
                ? ((N = N ? N.__html : void 0),
                  (P = P ? P.__html : void 0),
                  N != null && P !== N && (y = y || []).push(K, N))
                : K === "children"
                  ? (typeof N != "string" && typeof N != "number") ||
                    (y = y || []).push(K, "" + N)
                  : K !== "suppressContentEditableWarning" &&
                    K !== "suppressHydrationWarning" &&
                    (o.hasOwnProperty(K)
                      ? (N != null && K === "onScroll" && _t("scroll", r),
                        y || P === N || (y = []))
                      : (y = y || []).push(K, N));
        }
        l && (y = y || []).push("style", l);
        var K = y;
        (s.updateQueue = K) && (s.flags |= 4);
      }
    }),
    ($y = function (r, s, l, h) {
      l !== h && (s.flags |= 4);
    }));
  function vl(r, s) {
    if (!St)
      switch (r.tailMode) {
        case "hidden":
          s = r.tail;
          for (var l = null; s !== null; )
            (s.alternate !== null && (l = s), (s = s.sibling));
          l === null ? (r.tail = null) : (l.sibling = null);
          break;
        case "collapsed":
          l = r.tail;
          for (var h = null; l !== null; )
            (l.alternate !== null && (h = l), (l = l.sibling));
          h === null
            ? s || r.tail === null
              ? (r.tail = null)
              : (r.tail.sibling = null)
            : (h.sibling = null);
      }
  }
  function dn(r) {
    var s = r.alternate !== null && r.alternate.child === r.child,
      l = 0,
      h = 0;
    if (s)
      for (var p = r.child; p !== null; )
        ((l |= p.lanes | p.childLanes),
          (h |= p.subtreeFlags & 14680064),
          (h |= p.flags & 14680064),
          (p.return = r),
          (p = p.sibling));
    else
      for (p = r.child; p !== null; )
        ((l |= p.lanes | p.childLanes),
          (h |= p.subtreeFlags),
          (h |= p.flags),
          (p.return = r),
          (p = p.sibling));
    return ((r.subtreeFlags |= h), (r.childLanes = l), s);
  }
  function JS(r, s, l) {
    var h = s.pendingProps;
    switch ((Od(s), s.tag)) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return (dn(s), null);
      case 1:
        return (bn(s.type) && qu(), dn(s), null);
      case 3:
        return (
          (h = s.stateNode),
          ua(),
          wt(xn),
          wt(cn),
          Kd(),
          h.pendingContext &&
            ((h.context = h.pendingContext), (h.pendingContext = null)),
          (r === null || r.child === null) &&
            (Xu(s)
              ? (s.flags |= 4)
              : r === null ||
                (r.memoizedState.isDehydrated && (s.flags & 256) === 0) ||
                ((s.flags |= 1024), Rr !== null && (If(Rr), (Rr = null)))),
          ff(r, s),
          dn(s),
          null
        );
      case 5:
        Wd(s);
        var p = ho(fl.current);
        if (((l = s.type), r !== null && s.stateNode != null))
          (By(r, s, l, h, p),
            r.ref !== s.ref && ((s.flags |= 512), (s.flags |= 2097152)));
        else {
          if (!h) {
            if (s.stateNode === null) throw Error(t(166));
            return (dn(s), null);
          }
          if (((r = ho(Wr.current)), Xu(s))) {
            ((h = s.stateNode), (l = s.type));
            var y = s.memoizedProps;
            switch (((h[Hr] = s), (h[ll] = y), (r = (s.mode & 1) !== 0), l)) {
              case "dialog":
                (_t("cancel", h), _t("close", h));
                break;
              case "iframe":
              case "object":
              case "embed":
                _t("load", h);
                break;
              case "video":
              case "audio":
                for (p = 0; p < sl.length; p++) _t(sl[p], h);
                break;
              case "source":
                _t("error", h);
                break;
              case "img":
              case "image":
              case "link":
                (_t("error", h), _t("load", h));
                break;
              case "details":
                _t("toggle", h);
                break;
              case "input":
                (Rn(h, y), _t("invalid", h));
                break;
              case "select":
                ((h._wrapperState = { wasMultiple: !!y.multiple }),
                  _t("invalid", h));
                break;
              case "textarea":
                (An(h, y), _t("invalid", h));
            }
            (Ji(l, y), (p = null));
            for (var E in y)
              if (y.hasOwnProperty(E)) {
                var P = y[E];
                E === "children"
                  ? typeof P == "string"
                    ? h.textContent !== P &&
                      (y.suppressHydrationWarning !== !0 &&
                        $u(h.textContent, P, r),
                      (p = ["children", P]))
                    : typeof P == "number" &&
                      h.textContent !== "" + P &&
                      (y.suppressHydrationWarning !== !0 &&
                        $u(h.textContent, P, r),
                      (p = ["children", "" + P]))
                  : o.hasOwnProperty(E) &&
                    P != null &&
                    E === "onScroll" &&
                    _t("scroll", h);
              }
            switch (l) {
              case "input":
                (mt(h), Qs(h, y, !0));
                break;
              case "textarea":
                (mt(h), Gi(h));
                break;
              case "select":
              case "option":
                break;
              default:
                typeof y.onClick == "function" && (h.onclick = Hu);
            }
            ((h = p), (s.updateQueue = h), h !== null && (s.flags |= 4));
          } else {
            ((E = p.nodeType === 9 ? p : p.ownerDocument),
              r === "http://www.w3.org/1999/xhtml" && (r = It(l)),
              r === "http://www.w3.org/1999/xhtml"
                ? l === "script"
                  ? ((r = E.createElement("div")),
                    (r.innerHTML = "<script><\/script>"),
                    (r = r.removeChild(r.firstChild)))
                  : typeof h.is == "string"
                    ? (r = E.createElement(l, { is: h.is }))
                    : ((r = E.createElement(l)),
                      l === "select" &&
                        ((E = r),
                        h.multiple
                          ? (E.multiple = !0)
                          : h.size && (E.size = h.size)))
                : (r = E.createElementNS(r, l)),
              (r[Hr] = s),
              (r[ll] = h),
              jy(r, s, !1, !1),
              (s.stateNode = r));
            e: {
              switch (((E = Xs(l, h)), l)) {
                case "dialog":
                  (_t("cancel", r), _t("close", r), (p = h));
                  break;
                case "iframe":
                case "object":
                case "embed":
                  (_t("load", r), (p = h));
                  break;
                case "video":
                case "audio":
                  for (p = 0; p < sl.length; p++) _t(sl[p], r);
                  p = h;
                  break;
                case "source":
                  (_t("error", r), (p = h));
                  break;
                case "img":
                case "image":
                case "link":
                  (_t("error", r), _t("load", r), (p = h));
                  break;
                case "details":
                  (_t("toggle", r), (p = h));
                  break;
                case "input":
                  (Rn(r, h), (p = hi(r, h)), _t("invalid", r));
                  break;
                case "option":
                  p = h;
                  break;
                case "select":
                  ((r._wrapperState = { wasMultiple: !!h.multiple }),
                    (p = de({}, h, { value: void 0 })),
                    _t("invalid", r));
                  break;
                case "textarea":
                  (An(r, h), (p = Ys(r, h)), _t("invalid", r));
                  break;
                default:
                  p = h;
              }
              (Ji(l, p), (P = p));
              for (y in P)
                if (P.hasOwnProperty(y)) {
                  var N = P[y];
                  y === "style"
                    ? Yi(r, N)
                    : y === "dangerouslySetInnerHTML"
                      ? ((N = N ? N.__html : void 0), N != null && Qi(r, N))
                      : y === "children"
                        ? typeof N == "string"
                          ? (l !== "textarea" || N !== "") && Lr(r, N)
                          : typeof N == "number" && Lr(r, "" + N)
                        : y !== "suppressContentEditableWarning" &&
                          y !== "suppressHydrationWarning" &&
                          y !== "autoFocus" &&
                          (o.hasOwnProperty(y)
                            ? N != null && y === "onScroll" && _t("scroll", r)
                            : N != null && G(r, y, N, E));
                }
              switch (l) {
                case "input":
                  (mt(r), Qs(r, h, !1));
                  break;
                case "textarea":
                  (mt(r), Gi(r));
                  break;
                case "option":
                  h.value != null && r.setAttribute("value", "" + tt(h.value));
                  break;
                case "select":
                  ((r.multiple = !!h.multiple),
                    (y = h.value),
                    y != null
                      ? pr(r, !!h.multiple, y, !1)
                      : h.defaultValue != null &&
                        pr(r, !!h.multiple, h.defaultValue, !0));
                  break;
                default:
                  typeof p.onClick == "function" && (r.onclick = Hu);
              }
              switch (l) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  h = !!h.autoFocus;
                  break e;
                case "img":
                  h = !0;
                  break e;
                default:
                  h = !1;
              }
            }
            h && (s.flags |= 4);
          }
          s.ref !== null && ((s.flags |= 512), (s.flags |= 2097152));
        }
        return (dn(s), null);
      case 6:
        if (r && s.stateNode != null) $y(r, s, r.memoizedProps, h);
        else {
          if (typeof h != "string" && s.stateNode === null) throw Error(t(166));
          if (((l = ho(fl.current)), ho(Wr.current), Xu(s))) {
            if (
              ((h = s.stateNode),
              (l = s.memoizedProps),
              (h[Hr] = s),
              (y = h.nodeValue !== l) && ((r = Bn), r !== null))
            )
              switch (r.tag) {
                case 3:
                  $u(h.nodeValue, l, (r.mode & 1) !== 0);
                  break;
                case 5:
                  r.memoizedProps.suppressHydrationWarning !== !0 &&
                    $u(h.nodeValue, l, (r.mode & 1) !== 0);
              }
            y && (s.flags |= 4);
          } else
            ((h = (l.nodeType === 9 ? l : l.ownerDocument).createTextNode(h)),
              (h[Hr] = s),
              (s.stateNode = h));
        }
        return (dn(s), null);
      case 13:
        if (
          (wt(Ct),
          (h = s.memoizedState),
          r === null ||
            (r.memoizedState !== null && r.memoizedState.dehydrated !== null))
        ) {
          if (St && $n !== null && (s.mode & 1) !== 0 && (s.flags & 128) === 0)
            (qg(), sa(), (s.flags |= 98560), (y = !1));
          else if (((y = Xu(s)), h !== null && h.dehydrated !== null)) {
            if (r === null) {
              if (!y) throw Error(t(318));
              if (
                ((y = s.memoizedState),
                (y = y !== null ? y.dehydrated : null),
                !y)
              )
                throw Error(t(317));
              y[Hr] = s;
            } else
              (sa(),
                (s.flags & 128) === 0 && (s.memoizedState = null),
                (s.flags |= 4));
            (dn(s), (y = !1));
          } else (Rr !== null && (If(Rr), (Rr = null)), (y = !0));
          if (!y) return s.flags & 65536 ? s : null;
        }
        return (s.flags & 128) !== 0
          ? ((s.lanes = l), s)
          : ((h = h !== null),
            h !== (r !== null && r.memoizedState !== null) &&
              h &&
              ((s.child.flags |= 8192),
              (s.mode & 1) !== 0 &&
                (r === null || (Ct.current & 1) !== 0
                  ? Ht === 0 && (Ht = 3)
                  : Cf())),
            s.updateQueue !== null && (s.flags |= 4),
            dn(s),
            null);
      case 4:
        return (
          ua(),
          ff(r, s),
          r === null && ol(s.stateNode.containerInfo),
          dn(s),
          null
        );
      case 10:
        return (zd(s.type._context), dn(s), null);
      case 17:
        return (bn(s.type) && qu(), dn(s), null);
      case 19:
        if ((wt(Ct), (y = s.memoizedState), y === null)) return (dn(s), null);
        if (((h = (s.flags & 128) !== 0), (E = y.rendering), E === null))
          if (h) vl(y, !1);
          else {
            if (Ht !== 0 || (r !== null && (r.flags & 128) !== 0))
              for (r = s.child; r !== null; ) {
                if (((E = rc(r)), E !== null)) {
                  for (
                    s.flags |= 128,
                      vl(y, !1),
                      h = E.updateQueue,
                      h !== null && ((s.updateQueue = h), (s.flags |= 4)),
                      s.subtreeFlags = 0,
                      h = l,
                      l = s.child;
                    l !== null;

                  )
                    ((y = l),
                      (r = h),
                      (y.flags &= 14680066),
                      (E = y.alternate),
                      E === null
                        ? ((y.childLanes = 0),
                          (y.lanes = r),
                          (y.child = null),
                          (y.subtreeFlags = 0),
                          (y.memoizedProps = null),
                          (y.memoizedState = null),
                          (y.updateQueue = null),
                          (y.dependencies = null),
                          (y.stateNode = null))
                        : ((y.childLanes = E.childLanes),
                          (y.lanes = E.lanes),
                          (y.child = E.child),
                          (y.subtreeFlags = 0),
                          (y.deletions = null),
                          (y.memoizedProps = E.memoizedProps),
                          (y.memoizedState = E.memoizedState),
                          (y.updateQueue = E.updateQueue),
                          (y.type = E.type),
                          (r = E.dependencies),
                          (y.dependencies =
                            r === null
                              ? null
                              : {
                                  lanes: r.lanes,
                                  firstContext: r.firstContext,
                                })),
                      (l = l.sibling));
                  return (gt(Ct, (Ct.current & 1) | 2), s.child);
                }
                r = r.sibling;
              }
            y.tail !== null &&
              Xe() > fa &&
              ((s.flags |= 128), (h = !0), vl(y, !1), (s.lanes = 4194304));
          }
        else {
          if (!h)
            if (((r = rc(E)), r !== null)) {
              if (
                ((s.flags |= 128),
                (h = !0),
                (l = r.updateQueue),
                l !== null && ((s.updateQueue = l), (s.flags |= 4)),
                vl(y, !0),
                y.tail === null &&
                  y.tailMode === "hidden" &&
                  !E.alternate &&
                  !St)
              )
                return (dn(s), null);
            } else
              2 * Xe() - y.renderingStartTime > fa &&
                l !== 1073741824 &&
                ((s.flags |= 128), (h = !0), vl(y, !1), (s.lanes = 4194304));
          y.isBackwards
            ? ((E.sibling = s.child), (s.child = E))
            : ((l = y.last),
              l !== null ? (l.sibling = E) : (s.child = E),
              (y.last = E));
        }
        return y.tail !== null
          ? ((s = y.tail),
            (y.rendering = s),
            (y.tail = s.sibling),
            (y.renderingStartTime = Xe()),
            (s.sibling = null),
            (l = Ct.current),
            gt(Ct, h ? (l & 1) | 2 : l & 1),
            s)
          : (dn(s), null);
      case 22:
      case 23:
        return (
          Af(),
          (h = s.memoizedState !== null),
          r !== null && (r.memoizedState !== null) !== h && (s.flags |= 8192),
          h && (s.mode & 1) !== 0
            ? (Hn & 1073741824) !== 0 &&
              (dn(s), s.subtreeFlags & 6 && (s.flags |= 8192))
            : dn(s),
          null
        );
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(t(156, s.tag));
  }
  function ZS(r, s) {
    switch ((Od(s), s.tag)) {
      case 1:
        return (
          bn(s.type) && qu(),
          (r = s.flags),
          r & 65536 ? ((s.flags = (r & -65537) | 128), s) : null
        );
      case 3:
        return (
          ua(),
          wt(xn),
          wt(cn),
          Kd(),
          (r = s.flags),
          (r & 65536) !== 0 && (r & 128) === 0
            ? ((s.flags = (r & -65537) | 128), s)
            : null
        );
      case 5:
        return (Wd(s), null);
      case 13:
        if (
          (wt(Ct), (r = s.memoizedState), r !== null && r.dehydrated !== null)
        ) {
          if (s.alternate === null) throw Error(t(340));
          sa();
        }
        return (
          (r = s.flags),
          r & 65536 ? ((s.flags = (r & -65537) | 128), s) : null
        );
      case 19:
        return (wt(Ct), null);
      case 4:
        return (ua(), null);
      case 10:
        return (zd(s.type._context), null);
      case 22:
      case 23:
        return (Af(), null);
      case 24:
        return null;
      default:
        return null;
    }
  }
  var dc = !1,
    fn = !1,
    eI = typeof WeakSet == "function" ? WeakSet : Set,
    _e = null;
  function ha(r, s) {
    var l = r.ref;
    if (l !== null)
      if (typeof l == "function")
        try {
          l(null);
        } catch (h) {
          bt(r, s, h);
        }
      else l.current = null;
  }
  function pf(r, s, l) {
    try {
      l();
    } catch (h) {
      bt(r, s, h);
    }
  }
  var Hy = !1;
  function tI(r, s) {
    if (((Rd = as), (r = Tg()), yd(r))) {
      if ("selectionStart" in r)
        var l = { start: r.selectionStart, end: r.selectionEnd };
      else
        e: {
          l = ((l = r.ownerDocument) && l.defaultView) || window;
          var h = l.getSelection && l.getSelection();
          if (h && h.rangeCount !== 0) {
            l = h.anchorNode;
            var p = h.anchorOffset,
              y = h.focusNode;
            h = h.focusOffset;
            try {
              (l.nodeType, y.nodeType);
            } catch {
              l = null;
              break e;
            }
            var E = 0,
              P = -1,
              N = -1,
              K = 0,
              re = 0,
              se = r,
              te = null;
            t: for (;;) {
              for (
                var fe;
                se !== l || (p !== 0 && se.nodeType !== 3) || (P = E + p),
                  se !== y || (h !== 0 && se.nodeType !== 3) || (N = E + h),
                  se.nodeType === 3 && (E += se.nodeValue.length),
                  (fe = se.firstChild) !== null;

              )
                ((te = se), (se = fe));
              for (;;) {
                if (se === r) break t;
                if (
                  (te === l && ++K === p && (P = E),
                  te === y && ++re === h && (N = E),
                  (fe = se.nextSibling) !== null)
                )
                  break;
                ((se = te), (te = se.parentNode));
              }
              se = fe;
            }
            l = P === -1 || N === -1 ? null : { start: P, end: N };
          } else l = null;
        }
      l = l || { start: 0, end: 0 };
    } else l = null;
    for (
      Ad = { focusedElem: r, selectionRange: l }, as = !1, _e = s;
      _e !== null;

    )
      if (
        ((s = _e), (r = s.child), (s.subtreeFlags & 1028) !== 0 && r !== null)
      )
        ((r.return = s), (_e = r));
      else
        for (; _e !== null; ) {
          s = _e;
          try {
            var we = s.alternate;
            if ((s.flags & 1024) !== 0)
              switch (s.tag) {
                case 0:
                case 11:
                case 15:
                  break;
                case 1:
                  if (we !== null) {
                    var Re = we.memoizedProps,
                      Nt = we.memoizedState,
                      $ = s.stateNode,
                      M = $.getSnapshotBeforeUpdate(
                        s.elementType === s.type ? Re : Ar(s.type, Re),
                        Nt,
                      );
                    $.__reactInternalSnapshotBeforeUpdate = M;
                  }
                  break;
                case 3:
                  var H = s.stateNode.containerInfo;
                  H.nodeType === 1
                    ? (H.textContent = "")
                    : H.nodeType === 9 &&
                      H.documentElement &&
                      H.removeChild(H.documentElement);
                  break;
                case 5:
                case 6:
                case 4:
                case 17:
                  break;
                default:
                  throw Error(t(163));
              }
          } catch (le) {
            bt(s, s.return, le);
          }
          if (((r = s.sibling), r !== null)) {
            ((r.return = s.return), (_e = r));
            break;
          }
          _e = s.return;
        }
    return ((we = Hy), (Hy = !1), we);
  }
  function _l(r, s, l) {
    var h = s.updateQueue;
    if (((h = h !== null ? h.lastEffect : null), h !== null)) {
      var p = (h = h.next);
      do {
        if ((p.tag & r) === r) {
          var y = p.destroy;
          ((p.destroy = void 0), y !== void 0 && pf(s, l, y));
        }
        p = p.next;
      } while (p !== h);
    }
  }
  function fc(r, s) {
    if (
      ((s = s.updateQueue), (s = s !== null ? s.lastEffect : null), s !== null)
    ) {
      var l = (s = s.next);
      do {
        if ((l.tag & r) === r) {
          var h = l.create;
          l.destroy = h();
        }
        l = l.next;
      } while (l !== s);
    }
  }
  function mf(r) {
    var s = r.ref;
    if (s !== null) {
      var l = r.stateNode;
      switch (r.tag) {
        case 5:
          r = l;
          break;
        default:
          r = l;
      }
      typeof s == "function" ? s(r) : (s.current = r);
    }
  }
  function Wy(r) {
    var s = r.alternate;
    (s !== null && ((r.alternate = null), Wy(s)),
      (r.child = null),
      (r.deletions = null),
      (r.sibling = null),
      r.tag === 5 &&
        ((s = r.stateNode),
        s !== null &&
          (delete s[Hr],
          delete s[ll],
          delete s[xd],
          delete s[VS],
          delete s[FS])),
      (r.stateNode = null),
      (r.return = null),
      (r.dependencies = null),
      (r.memoizedProps = null),
      (r.memoizedState = null),
      (r.pendingProps = null),
      (r.stateNode = null),
      (r.updateQueue = null));
  }
  function qy(r) {
    return r.tag === 5 || r.tag === 3 || r.tag === 4;
  }
  function Ky(r) {
    e: for (;;) {
      for (; r.sibling === null; ) {
        if (r.return === null || qy(r.return)) return null;
        r = r.return;
      }
      for (
        r.sibling.return = r.return, r = r.sibling;
        r.tag !== 5 && r.tag !== 6 && r.tag !== 18;

      ) {
        if (r.flags & 2 || r.child === null || r.tag === 4) continue e;
        ((r.child.return = r), (r = r.child));
      }
      if (!(r.flags & 2)) return r.stateNode;
    }
  }
  function gf(r, s, l) {
    var h = r.tag;
    if (h === 5 || h === 6)
      ((r = r.stateNode),
        s
          ? l.nodeType === 8
            ? l.parentNode.insertBefore(r, s)
            : l.insertBefore(r, s)
          : (l.nodeType === 8
              ? ((s = l.parentNode), s.insertBefore(r, l))
              : ((s = l), s.appendChild(r)),
            (l = l._reactRootContainer),
            l != null || s.onclick !== null || (s.onclick = Hu)));
    else if (h !== 4 && ((r = r.child), r !== null))
      for (gf(r, s, l), r = r.sibling; r !== null; )
        (gf(r, s, l), (r = r.sibling));
  }
  function yf(r, s, l) {
    var h = r.tag;
    if (h === 5 || h === 6)
      ((r = r.stateNode), s ? l.insertBefore(r, s) : l.appendChild(r));
    else if (h !== 4 && ((r = r.child), r !== null))
      for (yf(r, s, l), r = r.sibling; r !== null; )
        (yf(r, s, l), (r = r.sibling));
  }
  var tn = null,
    Cr = !1;
  function gs(r, s, l) {
    for (l = l.child; l !== null; ) (Gy(r, s, l), (l = l.sibling));
  }
  function Gy(r, s, l) {
    if (ot && typeof ot.onCommitFiberUnmount == "function")
      try {
        ot.onCommitFiberUnmount($e, l);
      } catch {}
    switch (l.tag) {
      case 5:
        fn || ha(l, s);
      case 6:
        var h = tn,
          p = Cr;
        ((tn = null),
          gs(r, s, l),
          (tn = h),
          (Cr = p),
          tn !== null &&
            (Cr
              ? ((r = tn),
                (l = l.stateNode),
                r.nodeType === 8
                  ? r.parentNode.removeChild(l)
                  : r.removeChild(l))
              : tn.removeChild(l.stateNode)));
        break;
      case 18:
        tn !== null &&
          (Cr
            ? ((r = tn),
              (l = l.stateNode),
              r.nodeType === 8
                ? kd(r.parentNode, l)
                : r.nodeType === 1 && kd(r, l),
              Tr(r))
            : kd(tn, l.stateNode));
        break;
      case 4:
        ((h = tn),
          (p = Cr),
          (tn = l.stateNode.containerInfo),
          (Cr = !0),
          gs(r, s, l),
          (tn = h),
          (Cr = p));
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (
          !fn &&
          ((h = l.updateQueue), h !== null && ((h = h.lastEffect), h !== null))
        ) {
          p = h = h.next;
          do {
            var y = p,
              E = y.destroy;
            ((y = y.tag),
              E !== void 0 && ((y & 2) !== 0 || (y & 4) !== 0) && pf(l, s, E),
              (p = p.next));
          } while (p !== h);
        }
        gs(r, s, l);
        break;
      case 1:
        if (
          !fn &&
          (ha(l, s),
          (h = l.stateNode),
          typeof h.componentWillUnmount == "function")
        )
          try {
            ((h.props = l.memoizedProps),
              (h.state = l.memoizedState),
              h.componentWillUnmount());
          } catch (P) {
            bt(l, s, P);
          }
        gs(r, s, l);
        break;
      case 21:
        gs(r, s, l);
        break;
      case 22:
        l.mode & 1
          ? ((fn = (h = fn) || l.memoizedState !== null), gs(r, s, l), (fn = h))
          : gs(r, s, l);
        break;
      default:
        gs(r, s, l);
    }
  }
  function Qy(r) {
    var s = r.updateQueue;
    if (s !== null) {
      r.updateQueue = null;
      var l = r.stateNode;
      (l === null && (l = r.stateNode = new eI()),
        s.forEach(function (h) {
          var p = cI.bind(null, r, h);
          l.has(h) || (l.add(h), h.then(p, p));
        }));
    }
  }
  function Pr(r, s) {
    var l = s.deletions;
    if (l !== null)
      for (var h = 0; h < l.length; h++) {
        var p = l[h];
        try {
          var y = r,
            E = s,
            P = E;
          e: for (; P !== null; ) {
            switch (P.tag) {
              case 5:
                ((tn = P.stateNode), (Cr = !1));
                break e;
              case 3:
                ((tn = P.stateNode.containerInfo), (Cr = !0));
                break e;
              case 4:
                ((tn = P.stateNode.containerInfo), (Cr = !0));
                break e;
            }
            P = P.return;
          }
          if (tn === null) throw Error(t(160));
          (Gy(y, E, p), (tn = null), (Cr = !1));
          var N = p.alternate;
          (N !== null && (N.return = null), (p.return = null));
        } catch (K) {
          bt(p, s, K);
        }
      }
    if (s.subtreeFlags & 12854)
      for (s = s.child; s !== null; ) (Yy(s, r), (s = s.sibling));
  }
  function Yy(r, s) {
    var l = r.alternate,
      h = r.flags;
    switch (r.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if ((Pr(s, r), Kr(r), h & 4)) {
          try {
            (_l(3, r, r.return), fc(3, r));
          } catch (Re) {
            bt(r, r.return, Re);
          }
          try {
            _l(5, r, r.return);
          } catch (Re) {
            bt(r, r.return, Re);
          }
        }
        break;
      case 1:
        (Pr(s, r), Kr(r), h & 512 && l !== null && ha(l, l.return));
        break;
      case 5:
        if (
          (Pr(s, r),
          Kr(r),
          h & 512 && l !== null && ha(l, l.return),
          r.flags & 32)
        ) {
          var p = r.stateNode;
          try {
            Lr(p, "");
          } catch (Re) {
            bt(r, r.return, Re);
          }
        }
        if (h & 4 && ((p = r.stateNode), p != null)) {
          var y = r.memoizedProps,
            E = l !== null ? l.memoizedProps : y,
            P = r.type,
            N = r.updateQueue;
          if (((r.updateQueue = null), N !== null))
            try {
              (P === "input" &&
                y.type === "radio" &&
                y.name != null &&
                Ks(p, y),
                Xs(P, E));
              var K = Xs(P, y);
              for (E = 0; E < N.length; E += 2) {
                var re = N[E],
                  se = N[E + 1];
                re === "style"
                  ? Yi(p, se)
                  : re === "dangerouslySetInnerHTML"
                    ? Qi(p, se)
                    : re === "children"
                      ? Lr(p, se)
                      : G(p, re, se, K);
              }
              switch (P) {
                case "input":
                  Gs(p, y);
                  break;
                case "textarea":
                  Gn(p, y);
                  break;
                case "select":
                  var te = p._wrapperState.wasMultiple;
                  p._wrapperState.wasMultiple = !!y.multiple;
                  var fe = y.value;
                  fe != null
                    ? pr(p, !!y.multiple, fe, !1)
                    : te !== !!y.multiple &&
                      (y.defaultValue != null
                        ? pr(p, !!y.multiple, y.defaultValue, !0)
                        : pr(p, !!y.multiple, y.multiple ? [] : "", !1));
              }
              p[ll] = y;
            } catch (Re) {
              bt(r, r.return, Re);
            }
        }
        break;
      case 6:
        if ((Pr(s, r), Kr(r), h & 4)) {
          if (r.stateNode === null) throw Error(t(162));
          ((p = r.stateNode), (y = r.memoizedProps));
          try {
            p.nodeValue = y;
          } catch (Re) {
            bt(r, r.return, Re);
          }
        }
        break;
      case 3:
        if (
          (Pr(s, r), Kr(r), h & 4 && l !== null && l.memoizedState.isDehydrated)
        )
          try {
            Tr(s.containerInfo);
          } catch (Re) {
            bt(r, r.return, Re);
          }
        break;
      case 4:
        (Pr(s, r), Kr(r));
        break;
      case 13:
        (Pr(s, r),
          Kr(r),
          (p = r.child),
          p.flags & 8192 &&
            ((y = p.memoizedState !== null),
            (p.stateNode.isHidden = y),
            !y ||
              (p.alternate !== null && p.alternate.memoizedState !== null) ||
              (wf = Xe())),
          h & 4 && Qy(r));
        break;
      case 22:
        if (
          ((re = l !== null && l.memoizedState !== null),
          r.mode & 1 ? ((fn = (K = fn) || re), Pr(s, r), (fn = K)) : Pr(s, r),
          Kr(r),
          h & 8192)
        ) {
          if (
            ((K = r.memoizedState !== null),
            (r.stateNode.isHidden = K) && !re && (r.mode & 1) !== 0)
          )
            for (_e = r, re = r.child; re !== null; ) {
              for (se = _e = re; _e !== null; ) {
                switch (((te = _e), (fe = te.child), te.tag)) {
                  case 0:
                  case 11:
                  case 14:
                  case 15:
                    _l(4, te, te.return);
                    break;
                  case 1:
                    ha(te, te.return);
                    var we = te.stateNode;
                    if (typeof we.componentWillUnmount == "function") {
                      ((h = te), (l = te.return));
                      try {
                        ((s = h),
                          (we.props = s.memoizedProps),
                          (we.state = s.memoizedState),
                          we.componentWillUnmount());
                      } catch (Re) {
                        bt(h, l, Re);
                      }
                    }
                    break;
                  case 5:
                    ha(te, te.return);
                    break;
                  case 22:
                    if (te.memoizedState !== null) {
                      Zy(se);
                      continue;
                    }
                }
                fe !== null ? ((fe.return = te), (_e = fe)) : Zy(se);
              }
              re = re.sibling;
            }
          e: for (re = null, se = r; ; ) {
            if (se.tag === 5) {
              if (re === null) {
                re = se;
                try {
                  ((p = se.stateNode),
                    K
                      ? ((y = p.style),
                        typeof y.setProperty == "function"
                          ? y.setProperty("display", "none", "important")
                          : (y.display = "none"))
                      : ((P = se.stateNode),
                        (N = se.memoizedProps.style),
                        (E =
                          N != null && N.hasOwnProperty("display")
                            ? N.display
                            : null),
                        (P.style.display = vn("display", E))));
                } catch (Re) {
                  bt(r, r.return, Re);
                }
              }
            } else if (se.tag === 6) {
              if (re === null)
                try {
                  se.stateNode.nodeValue = K ? "" : se.memoizedProps;
                } catch (Re) {
                  bt(r, r.return, Re);
                }
            } else if (
              ((se.tag !== 22 && se.tag !== 23) ||
                se.memoizedState === null ||
                se === r) &&
              se.child !== null
            ) {
              ((se.child.return = se), (se = se.child));
              continue;
            }
            if (se === r) break e;
            for (; se.sibling === null; ) {
              if (se.return === null || se.return === r) break e;
              (re === se && (re = null), (se = se.return));
            }
            (re === se && (re = null),
              (se.sibling.return = se.return),
              (se = se.sibling));
          }
        }
        break;
      case 19:
        (Pr(s, r), Kr(r), h & 4 && Qy(r));
        break;
      case 21:
        break;
      default:
        (Pr(s, r), Kr(r));
    }
  }
  function Kr(r) {
    var s = r.flags;
    if (s & 2) {
      try {
        e: {
          for (var l = r.return; l !== null; ) {
            if (qy(l)) {
              var h = l;
              break e;
            }
            l = l.return;
          }
          throw Error(t(160));
        }
        switch (h.tag) {
          case 5:
            var p = h.stateNode;
            h.flags & 32 && (Lr(p, ""), (h.flags &= -33));
            var y = Ky(r);
            yf(r, y, p);
            break;
          case 3:
          case 4:
            var E = h.stateNode.containerInfo,
              P = Ky(r);
            gf(r, P, E);
            break;
          default:
            throw Error(t(161));
        }
      } catch (N) {
        bt(r, r.return, N);
      }
      r.flags &= -3;
    }
    s & 4096 && (r.flags &= -4097);
  }
  function nI(r, s, l) {
    ((_e = r), Xy(r));
  }
  function Xy(r, s, l) {
    for (var h = (r.mode & 1) !== 0; _e !== null; ) {
      var p = _e,
        y = p.child;
      if (p.tag === 22 && h) {
        var E = p.memoizedState !== null || dc;
        if (!E) {
          var P = p.alternate,
            N = (P !== null && P.memoizedState !== null) || fn;
          P = dc;
          var K = fn;
          if (((dc = E), (fn = N) && !K))
            for (_e = p; _e !== null; )
              ((E = _e),
                (N = E.child),
                E.tag === 22 && E.memoizedState !== null
                  ? ev(p)
                  : N !== null
                    ? ((N.return = E), (_e = N))
                    : ev(p));
          for (; y !== null; ) ((_e = y), Xy(y), (y = y.sibling));
          ((_e = p), (dc = P), (fn = K));
        }
        Jy(r);
      } else
        (p.subtreeFlags & 8772) !== 0 && y !== null
          ? ((y.return = p), (_e = y))
          : Jy(r);
    }
  }
  function Jy(r) {
    for (; _e !== null; ) {
      var s = _e;
      if ((s.flags & 8772) !== 0) {
        var l = s.alternate;
        try {
          if ((s.flags & 8772) !== 0)
            switch (s.tag) {
              case 0:
              case 11:
              case 15:
                fn || fc(5, s);
                break;
              case 1:
                var h = s.stateNode;
                if (s.flags & 4 && !fn)
                  if (l === null) h.componentDidMount();
                  else {
                    var p =
                      s.elementType === s.type
                        ? l.memoizedProps
                        : Ar(s.type, l.memoizedProps);
                    h.componentDidUpdate(
                      p,
                      l.memoizedState,
                      h.__reactInternalSnapshotBeforeUpdate,
                    );
                  }
                var y = s.updateQueue;
                y !== null && Zg(s, y, h);
                break;
              case 3:
                var E = s.updateQueue;
                if (E !== null) {
                  if (((l = null), s.child !== null))
                    switch (s.child.tag) {
                      case 5:
                        l = s.child.stateNode;
                        break;
                      case 1:
                        l = s.child.stateNode;
                    }
                  Zg(s, E, l);
                }
                break;
              case 5:
                var P = s.stateNode;
                if (l === null && s.flags & 4) {
                  l = P;
                  var N = s.memoizedProps;
                  switch (s.type) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                      N.autoFocus && l.focus();
                      break;
                    case "img":
                      N.src && (l.src = N.src);
                  }
                }
                break;
              case 6:
                break;
              case 4:
                break;
              case 12:
                break;
              case 13:
                if (s.memoizedState === null) {
                  var K = s.alternate;
                  if (K !== null) {
                    var re = K.memoizedState;
                    if (re !== null) {
                      var se = re.dehydrated;
                      se !== null && Tr(se);
                    }
                  }
                }
                break;
              case 19:
              case 17:
              case 21:
              case 22:
              case 23:
              case 25:
                break;
              default:
                throw Error(t(163));
            }
          fn || (s.flags & 512 && mf(s));
        } catch (te) {
          bt(s, s.return, te);
        }
      }
      if (s === r) {
        _e = null;
        break;
      }
      if (((l = s.sibling), l !== null)) {
        ((l.return = s.return), (_e = l));
        break;
      }
      _e = s.return;
    }
  }
  function Zy(r) {
    for (; _e !== null; ) {
      var s = _e;
      if (s === r) {
        _e = null;
        break;
      }
      var l = s.sibling;
      if (l !== null) {
        ((l.return = s.return), (_e = l));
        break;
      }
      _e = s.return;
    }
  }
  function ev(r) {
    for (; _e !== null; ) {
      var s = _e;
      try {
        switch (s.tag) {
          case 0:
          case 11:
          case 15:
            var l = s.return;
            try {
              fc(4, s);
            } catch (N) {
              bt(s, l, N);
            }
            break;
          case 1:
            var h = s.stateNode;
            if (typeof h.componentDidMount == "function") {
              var p = s.return;
              try {
                h.componentDidMount();
              } catch (N) {
                bt(s, p, N);
              }
            }
            var y = s.return;
            try {
              mf(s);
            } catch (N) {
              bt(s, y, N);
            }
            break;
          case 5:
            var E = s.return;
            try {
              mf(s);
            } catch (N) {
              bt(s, E, N);
            }
        }
      } catch (N) {
        bt(s, s.return, N);
      }
      if (s === r) {
        _e = null;
        break;
      }
      var P = s.sibling;
      if (P !== null) {
        ((P.return = s.return), (_e = P));
        break;
      }
      _e = s.return;
    }
  }
  var rI = Math.ceil,
    pc = ae.ReactCurrentDispatcher,
    vf = ae.ReactCurrentOwner,
    or = ae.ReactCurrentBatchConfig,
    nt = 0,
    Qt = null,
    Ft = null,
    nn = 0,
    Hn = 0,
    da = hs(0),
    Ht = 0,
    wl = null,
    po = 0,
    mc = 0,
    _f = 0,
    El = null,
    Nn = null,
    wf = 0,
    fa = 1 / 0,
    xi = null,
    gc = !1,
    Ef = null,
    ys = null,
    yc = !1,
    vs = null,
    vc = 0,
    Tl = 0,
    Tf = null,
    _c = -1,
    wc = 0;
  function Tn() {
    return (nt & 6) !== 0 ? Xe() : _c !== -1 ? _c : (_c = Xe());
  }
  function _s(r) {
    return (r.mode & 1) === 0
      ? 1
      : (nt & 2) !== 0 && nn !== 0
        ? nn & -nn
        : zS.transition !== null
          ? (wc === 0 && (wc = to()), wc)
          : ((r = Je),
            r !== 0 ||
              ((r = window.event), (r = r === void 0 ? 16 : Ya(r.type))),
            r);
  }
  function kr(r, s, l, h) {
    if (50 < Tl) throw ((Tl = 0), (Tf = null), Error(t(185)));
    (rs(r, l, h),
      ((nt & 2) === 0 || r !== Qt) &&
        (r === Qt && ((nt & 2) === 0 && (mc |= l), Ht === 4 && ws(r, nn)),
        On(r, h),
        l === 1 &&
          nt === 0 &&
          (s.mode & 1) === 0 &&
          ((fa = Xe() + 500), Gu && fs())));
  }
  function On(r, s) {
    var l = r.callbackNode;
    vi(r, s);
    var h = eo(r, r === Qt ? nn : 0);
    if (h === 0)
      (l !== null && st(l), (r.callbackNode = null), (r.callbackPriority = 0));
    else if (((s = h & -h), r.callbackPriority !== s)) {
      if ((l != null && st(l), s === 1))
        (r.tag === 0 ? US(nv.bind(null, r)) : jg(nv.bind(null, r)),
          LS(function () {
            (nt & 6) === 0 && fs();
          }),
          (l = null));
      else {
        switch (ss(h)) {
          case 1:
            l = yr;
            break;
          case 4:
            l = Cn;
            break;
          case 16:
            l = Mt;
            break;
          case 536870912:
            l = gi;
            break;
          default:
            l = Mt;
        }
        l = cv(l, tv.bind(null, r));
      }
      ((r.callbackPriority = s), (r.callbackNode = l));
    }
  }
  function tv(r, s) {
    if (((_c = -1), (wc = 0), (nt & 6) !== 0)) throw Error(t(327));
    var l = r.callbackNode;
    if (pa() && r.callbackNode !== l) return null;
    var h = eo(r, r === Qt ? nn : 0);
    if (h === 0) return null;
    if ((h & 30) !== 0 || (h & r.expiredLanes) !== 0 || s) s = Ec(r, h);
    else {
      s = h;
      var p = nt;
      nt |= 2;
      var y = iv();
      (Qt !== r || nn !== s) && ((xi = null), (fa = Xe() + 500), go(r, s));
      do
        try {
          oI();
          break;
        } catch (P) {
          rv(r, P);
        }
      while (!0);
      (Ud(),
        (pc.current = y),
        (nt = p),
        Ft !== null ? (s = 0) : ((Qt = null), (nn = 0), (s = Ht)));
    }
    if (s !== 0) {
      if (
        (s === 2 && ((p = Un(r)), p !== 0 && ((h = p), (s = Sf(r, p)))),
        s === 1)
      )
        throw ((l = wl), go(r, 0), ws(r, h), On(r, Xe()), l);
      if (s === 6) ws(r, h);
      else {
        if (
          ((p = r.current.alternate),
          (h & 30) === 0 &&
            !iI(p) &&
            ((s = Ec(r, h)),
            s === 2 && ((y = Un(r)), y !== 0 && ((h = y), (s = Sf(r, y)))),
            s === 1))
        )
          throw ((l = wl), go(r, 0), ws(r, h), On(r, Xe()), l);
        switch (((r.finishedWork = p), (r.finishedLanes = h), s)) {
          case 0:
          case 1:
            throw Error(t(345));
          case 2:
            yo(r, Nn, xi);
            break;
          case 3:
            if (
              (ws(r, h),
              (h & 130023424) === h && ((s = wf + 500 - Xe()), 10 < s))
            ) {
              if (eo(r, 0) !== 0) break;
              if (((p = r.suspendedLanes), (p & h) !== h)) {
                (Tn(), (r.pingedLanes |= r.suspendedLanes & p));
                break;
              }
              r.timeoutHandle = Pd(yo.bind(null, r, Nn, xi), s);
              break;
            }
            yo(r, Nn, xi);
            break;
          case 4:
            if ((ws(r, h), (h & 4194240) === h)) break;
            for (s = r.eventTimes, p = -1; 0 < h; ) {
              var E = 31 - At(h);
              ((y = 1 << E), (E = s[E]), E > p && (p = E), (h &= ~y));
            }
            if (
              ((h = p),
              (h = Xe() - h),
              (h =
                (120 > h
                  ? 120
                  : 480 > h
                    ? 480
                    : 1080 > h
                      ? 1080
                      : 1920 > h
                        ? 1920
                        : 3e3 > h
                          ? 3e3
                          : 4320 > h
                            ? 4320
                            : 1960 * rI(h / 1960)) - h),
              10 < h)
            ) {
              r.timeoutHandle = Pd(yo.bind(null, r, Nn, xi), h);
              break;
            }
            yo(r, Nn, xi);
            break;
          case 5:
            yo(r, Nn, xi);
            break;
          default:
            throw Error(t(329));
        }
      }
    }
    return (On(r, Xe()), r.callbackNode === l ? tv.bind(null, r) : null);
  }
  function Sf(r, s) {
    var l = El;
    return (
      r.current.memoizedState.isDehydrated && (go(r, s).flags |= 256),
      (r = Ec(r, s)),
      r !== 2 && ((s = Nn), (Nn = l), s !== null && If(s)),
      r
    );
  }
  function If(r) {
    Nn === null ? (Nn = r) : Nn.push.apply(Nn, r);
  }
  function iI(r) {
    for (var s = r; ; ) {
      if (s.flags & 16384) {
        var l = s.updateQueue;
        if (l !== null && ((l = l.stores), l !== null))
          for (var h = 0; h < l.length; h++) {
            var p = l[h],
              y = p.getSnapshot;
            p = p.value;
            try {
              if (!Ir(y(), p)) return !1;
            } catch {
              return !1;
            }
          }
      }
      if (((l = s.child), s.subtreeFlags & 16384 && l !== null))
        ((l.return = s), (s = l));
      else {
        if (s === r) break;
        for (; s.sibling === null; ) {
          if (s.return === null || s.return === r) return !0;
          s = s.return;
        }
        ((s.sibling.return = s.return), (s = s.sibling));
      }
    }
    return !0;
  }
  function ws(r, s) {
    for (
      s &= ~_f,
        s &= ~mc,
        r.suspendedLanes |= s,
        r.pingedLanes &= ~s,
        r = r.expirationTimes;
      0 < s;

    ) {
      var l = 31 - At(s),
        h = 1 << l;
      ((r[l] = -1), (s &= ~h));
    }
  }
  function nv(r) {
    if ((nt & 6) !== 0) throw Error(t(327));
    pa();
    var s = eo(r, 0);
    if ((s & 1) === 0) return (On(r, Xe()), null);
    var l = Ec(r, s);
    if (r.tag !== 0 && l === 2) {
      var h = Un(r);
      h !== 0 && ((s = h), (l = Sf(r, h)));
    }
    if (l === 1) throw ((l = wl), go(r, 0), ws(r, s), On(r, Xe()), l);
    if (l === 6) throw Error(t(345));
    return (
      (r.finishedWork = r.current.alternate),
      (r.finishedLanes = s),
      yo(r, Nn, xi),
      On(r, Xe()),
      null
    );
  }
  function Rf(r, s) {
    var l = nt;
    nt |= 1;
    try {
      return r(s);
    } finally {
      ((nt = l), nt === 0 && ((fa = Xe() + 500), Gu && fs()));
    }
  }
  function mo(r) {
    vs !== null && vs.tag === 0 && (nt & 6) === 0 && pa();
    var s = nt;
    nt |= 1;
    var l = or.transition,
      h = Je;
    try {
      if (((or.transition = null), (Je = 1), r)) return r();
    } finally {
      ((Je = h), (or.transition = l), (nt = s), (nt & 6) === 0 && fs());
    }
  }
  function Af() {
    ((Hn = da.current), wt(da));
  }
  function go(r, s) {
    ((r.finishedWork = null), (r.finishedLanes = 0));
    var l = r.timeoutHandle;
    if ((l !== -1 && ((r.timeoutHandle = -1), OS(l)), Ft !== null))
      for (l = Ft.return; l !== null; ) {
        var h = l;
        switch ((Od(h), h.tag)) {
          case 1:
            ((h = h.type.childContextTypes), h != null && qu());
            break;
          case 3:
            (ua(), wt(xn), wt(cn), Kd());
            break;
          case 5:
            Wd(h);
            break;
          case 4:
            ua();
            break;
          case 13:
            wt(Ct);
            break;
          case 19:
            wt(Ct);
            break;
          case 10:
            zd(h.type._context);
            break;
          case 22:
          case 23:
            Af();
        }
        l = l.return;
      }
    if (
      ((Qt = r),
      (Ft = r = Es(r.current, null)),
      (nn = Hn = s),
      (Ht = 0),
      (wl = null),
      (_f = mc = po = 0),
      (Nn = El = null),
      co !== null)
    ) {
      for (s = 0; s < co.length; s++)
        if (((l = co[s]), (h = l.interleaved), h !== null)) {
          l.interleaved = null;
          var p = h.next,
            y = l.pending;
          if (y !== null) {
            var E = y.next;
            ((y.next = p), (h.next = E));
          }
          l.pending = h;
        }
      co = null;
    }
    return r;
  }
  function rv(r, s) {
    do {
      var l = Ft;
      try {
        if ((Ud(), (ic.current = lc), sc)) {
          for (var h = Pt.memoizedState; h !== null; ) {
            var p = h.queue;
            (p !== null && (p.pending = null), (h = h.next));
          }
          sc = !1;
        }
        if (
          ((fo = 0),
          (Gt = $t = Pt = null),
          (pl = !1),
          (ml = 0),
          (vf.current = null),
          l === null || l.return === null)
        ) {
          ((Ht = 1), (wl = s), (Ft = null));
          break;
        }
        e: {
          var y = r,
            E = l.return,
            P = l,
            N = s;
          if (
            ((s = nn),
            (P.flags |= 32768),
            N !== null && typeof N == "object" && typeof N.then == "function")
          ) {
            var K = N,
              re = P,
              se = re.tag;
            if ((re.mode & 1) === 0 && (se === 0 || se === 11 || se === 15)) {
              var te = re.alternate;
              te
                ? ((re.updateQueue = te.updateQueue),
                  (re.memoizedState = te.memoizedState),
                  (re.lanes = te.lanes))
                : ((re.updateQueue = null), (re.memoizedState = null));
            }
            var fe = Py(E);
            if (fe !== null) {
              ((fe.flags &= -257),
                ky(fe, E, P, y, s),
                fe.mode & 1 && Cy(y, K, s),
                (s = fe),
                (N = K));
              var we = s.updateQueue;
              if (we === null) {
                var Re = new Set();
                (Re.add(N), (s.updateQueue = Re));
              } else we.add(N);
              break e;
            } else {
              if ((s & 1) === 0) {
                (Cy(y, K, s), Cf());
                break e;
              }
              N = Error(t(426));
            }
          } else if (St && P.mode & 1) {
            var Nt = Py(E);
            if (Nt !== null) {
              ((Nt.flags & 65536) === 0 && (Nt.flags |= 256),
                ky(Nt, E, P, y, s),
                Vd(ca(N, P)));
              break e;
            }
          }
          ((y = N = ca(N, P)),
            Ht !== 4 && (Ht = 2),
            El === null ? (El = [y]) : El.push(y),
            (y = E));
          do {
            switch (y.tag) {
              case 3:
                ((y.flags |= 65536), (s &= -s), (y.lanes |= s));
                var $ = Ry(y, N, s);
                Jg(y, $);
                break e;
              case 1:
                P = N;
                var M = y.type,
                  H = y.stateNode;
                if (
                  (y.flags & 128) === 0 &&
                  (typeof M.getDerivedStateFromError == "function" ||
                    (H !== null &&
                      typeof H.componentDidCatch == "function" &&
                      (ys === null || !ys.has(H))))
                ) {
                  ((y.flags |= 65536), (s &= -s), (y.lanes |= s));
                  var le = Ay(y, P, s);
                  Jg(y, le);
                  break e;
                }
            }
            y = y.return;
          } while (y !== null);
        }
        ov(l);
      } catch (Ae) {
        ((s = Ae), Ft === l && l !== null && (Ft = l = l.return));
        continue;
      }
      break;
    } while (!0);
  }
  function iv() {
    var r = pc.current;
    return ((pc.current = lc), r === null ? lc : r);
  }
  function Cf() {
    ((Ht === 0 || Ht === 3 || Ht === 2) && (Ht = 4),
      Qt === null ||
        ((po & 268435455) === 0 && (mc & 268435455) === 0) ||
        ws(Qt, nn));
  }
  function Ec(r, s) {
    var l = nt;
    nt |= 2;
    var h = iv();
    (Qt !== r || nn !== s) && ((xi = null), go(r, s));
    do
      try {
        sI();
        break;
      } catch (p) {
        rv(r, p);
      }
    while (!0);
    if ((Ud(), (nt = l), (pc.current = h), Ft !== null)) throw Error(t(261));
    return ((Qt = null), (nn = 0), Ht);
  }
  function sI() {
    for (; Ft !== null; ) sv(Ft);
  }
  function oI() {
    for (; Ft !== null && !Zn(); ) sv(Ft);
  }
  function sv(r) {
    var s = uv(r.alternate, r, Hn);
    ((r.memoizedProps = r.pendingProps),
      s === null ? ov(r) : (Ft = s),
      (vf.current = null));
  }
  function ov(r) {
    var s = r;
    do {
      var l = s.alternate;
      if (((r = s.return), (s.flags & 32768) === 0)) {
        if (((l = JS(l, s, Hn)), l !== null)) {
          Ft = l;
          return;
        }
      } else {
        if (((l = ZS(l, s)), l !== null)) {
          ((l.flags &= 32767), (Ft = l));
          return;
        }
        if (r !== null)
          ((r.flags |= 32768), (r.subtreeFlags = 0), (r.deletions = null));
        else {
          ((Ht = 6), (Ft = null));
          return;
        }
      }
      if (((s = s.sibling), s !== null)) {
        Ft = s;
        return;
      }
      Ft = s = r;
    } while (s !== null);
    Ht === 0 && (Ht = 5);
  }
  function yo(r, s, l) {
    var h = Je,
      p = or.transition;
    try {
      ((or.transition = null), (Je = 1), aI(r, s, l, h));
    } finally {
      ((or.transition = p), (Je = h));
    }
    return null;
  }
  function aI(r, s, l, h) {
    do pa();
    while (vs !== null);
    if ((nt & 6) !== 0) throw Error(t(327));
    l = r.finishedWork;
    var p = r.finishedLanes;
    if (l === null) return null;
    if (((r.finishedWork = null), (r.finishedLanes = 0), l === r.current))
      throw Error(t(177));
    ((r.callbackNode = null), (r.callbackPriority = 0));
    var y = l.lanes | l.childLanes;
    if (
      (pt(r, y),
      r === Qt && ((Ft = Qt = null), (nn = 0)),
      ((l.subtreeFlags & 2064) === 0 && (l.flags & 2064) === 0) ||
        yc ||
        ((yc = !0),
        cv(Mt, function () {
          return (pa(), null);
        })),
      (y = (l.flags & 15990) !== 0),
      (l.subtreeFlags & 15990) !== 0 || y)
    ) {
      ((y = or.transition), (or.transition = null));
      var E = Je;
      Je = 1;
      var P = nt;
      ((nt |= 4),
        (vf.current = null),
        tI(r, l),
        Yy(l, r),
        CS(Ad),
        (as = !!Rd),
        (Ad = Rd = null),
        (r.current = l),
        nI(l),
        mi(),
        (nt = P),
        (Je = E),
        (or.transition = y));
    } else r.current = l;
    if (
      (yc && ((yc = !1), (vs = r), (vc = p)),
      (y = r.pendingLanes),
      y === 0 && (ys = null),
      vr(l.stateNode),
      On(r, Xe()),
      s !== null)
    )
      for (h = r.onRecoverableError, l = 0; l < s.length; l++)
        ((p = s[l]), h(p.value, { componentStack: p.stack, digest: p.digest }));
    if (gc) throw ((gc = !1), (r = Ef), (Ef = null), r);
    return (
      (vc & 1) !== 0 && r.tag !== 0 && pa(),
      (y = r.pendingLanes),
      (y & 1) !== 0 ? (r === Tf ? Tl++ : ((Tl = 0), (Tf = r))) : (Tl = 0),
      fs(),
      null
    );
  }
  function pa() {
    if (vs !== null) {
      var r = ss(vc),
        s = or.transition,
        l = Je;
      try {
        if (((or.transition = null), (Je = 16 > r ? 16 : r), vs === null))
          var h = !1;
        else {
          if (((r = vs), (vs = null), (vc = 0), (nt & 6) !== 0))
            throw Error(t(331));
          var p = nt;
          for (nt |= 4, _e = r.current; _e !== null; ) {
            var y = _e,
              E = y.child;
            if ((_e.flags & 16) !== 0) {
              var P = y.deletions;
              if (P !== null) {
                for (var N = 0; N < P.length; N++) {
                  var K = P[N];
                  for (_e = K; _e !== null; ) {
                    var re = _e;
                    switch (re.tag) {
                      case 0:
                      case 11:
                      case 15:
                        _l(8, re, y);
                    }
                    var se = re.child;
                    if (se !== null) ((se.return = re), (_e = se));
                    else
                      for (; _e !== null; ) {
                        re = _e;
                        var te = re.sibling,
                          fe = re.return;
                        if ((Wy(re), re === K)) {
                          _e = null;
                          break;
                        }
                        if (te !== null) {
                          ((te.return = fe), (_e = te));
                          break;
                        }
                        _e = fe;
                      }
                  }
                }
                var we = y.alternate;
                if (we !== null) {
                  var Re = we.child;
                  if (Re !== null) {
                    we.child = null;
                    do {
                      var Nt = Re.sibling;
                      ((Re.sibling = null), (Re = Nt));
                    } while (Re !== null);
                  }
                }
                _e = y;
              }
            }
            if ((y.subtreeFlags & 2064) !== 0 && E !== null)
              ((E.return = y), (_e = E));
            else
              e: for (; _e !== null; ) {
                if (((y = _e), (y.flags & 2048) !== 0))
                  switch (y.tag) {
                    case 0:
                    case 11:
                    case 15:
                      _l(9, y, y.return);
                  }
                var $ = y.sibling;
                if ($ !== null) {
                  (($.return = y.return), (_e = $));
                  break e;
                }
                _e = y.return;
              }
          }
          var M = r.current;
          for (_e = M; _e !== null; ) {
            E = _e;
            var H = E.child;
            if ((E.subtreeFlags & 2064) !== 0 && H !== null)
              ((H.return = E), (_e = H));
            else
              e: for (E = M; _e !== null; ) {
                if (((P = _e), (P.flags & 2048) !== 0))
                  try {
                    switch (P.tag) {
                      case 0:
                      case 11:
                      case 15:
                        fc(9, P);
                    }
                  } catch (Ae) {
                    bt(P, P.return, Ae);
                  }
                if (P === E) {
                  _e = null;
                  break e;
                }
                var le = P.sibling;
                if (le !== null) {
                  ((le.return = P.return), (_e = le));
                  break e;
                }
                _e = P.return;
              }
          }
          if (
            ((nt = p),
            fs(),
            ot && typeof ot.onPostCommitFiberRoot == "function")
          )
            try {
              ot.onPostCommitFiberRoot($e, r);
            } catch {}
          h = !0;
        }
        return h;
      } finally {
        ((Je = l), (or.transition = s));
      }
    }
    return !1;
  }
  function av(r, s, l) {
    ((s = ca(l, s)),
      (s = Ry(r, s, 1)),
      (r = ms(r, s, 1)),
      (s = Tn()),
      r !== null && (rs(r, 1, s), On(r, s)));
  }
  function bt(r, s, l) {
    if (r.tag === 3) av(r, r, l);
    else
      for (; s !== null; ) {
        if (s.tag === 3) {
          av(s, r, l);
          break;
        } else if (s.tag === 1) {
          var h = s.stateNode;
          if (
            typeof s.type.getDerivedStateFromError == "function" ||
            (typeof h.componentDidCatch == "function" &&
              (ys === null || !ys.has(h)))
          ) {
            ((r = ca(l, r)),
              (r = Ay(s, r, 1)),
              (s = ms(s, r, 1)),
              (r = Tn()),
              s !== null && (rs(s, 1, r), On(s, r)));
            break;
          }
        }
        s = s.return;
      }
  }
  function lI(r, s, l) {
    var h = r.pingCache;
    (h !== null && h.delete(s),
      (s = Tn()),
      (r.pingedLanes |= r.suspendedLanes & l),
      Qt === r &&
        (nn & l) === l &&
        (Ht === 4 || (Ht === 3 && (nn & 130023424) === nn && 500 > Xe() - wf)
          ? go(r, 0)
          : (_f |= l)),
      On(r, s));
  }
  function lv(r, s) {
    s === 0 &&
      ((r.mode & 1) === 0
        ? (s = 1)
        : ((s = Vo), (Vo <<= 1), (Vo & 130023424) === 0 && (Vo = 4194304)));
    var l = Tn();
    ((r = Ci(r, s)), r !== null && (rs(r, s, l), On(r, l)));
  }
  function uI(r) {
    var s = r.memoizedState,
      l = 0;
    (s !== null && (l = s.retryLane), lv(r, l));
  }
  function cI(r, s) {
    var l = 0;
    switch (r.tag) {
      case 13:
        var h = r.stateNode,
          p = r.memoizedState;
        p !== null && (l = p.retryLane);
        break;
      case 19:
        h = r.stateNode;
        break;
      default:
        throw Error(t(314));
    }
    (h !== null && h.delete(s), lv(r, l));
  }
  var uv;
  uv = function (r, s, l) {
    if (r !== null)
      if (r.memoizedProps !== s.pendingProps || xn.current) Dn = !0;
      else {
        if ((r.lanes & l) === 0 && (s.flags & 128) === 0)
          return ((Dn = !1), XS(r, s, l));
        Dn = (r.flags & 131072) !== 0;
      }
    else ((Dn = !1), St && (s.flags & 1048576) !== 0 && Bg(s, Yu, s.index));
    switch (((s.lanes = 0), s.tag)) {
      case 2:
        var h = s.type;
        (hc(r, s), (r = s.pendingProps));
        var p = na(s, cn.current);
        (la(s, l), (p = Yd(null, s, h, r, p, l)));
        var y = Xd();
        return (
          (s.flags |= 1),
          typeof p == "object" &&
          p !== null &&
          typeof p.render == "function" &&
          p.$$typeof === void 0
            ? ((s.tag = 1),
              (s.memoizedState = null),
              (s.updateQueue = null),
              bn(h) ? ((y = !0), Ku(s)) : (y = !1),
              (s.memoizedState =
                p.state !== null && p.state !== void 0 ? p.state : null),
              $d(s),
              (p.updater = uc),
              (s.stateNode = p),
              (p._reactInternals = s),
              rf(s, h, r, l),
              (s = lf(null, s, h, !0, y, l)))
            : ((s.tag = 0), St && y && Nd(s), En(null, s, p, l), (s = s.child)),
          s
        );
      case 16:
        h = s.elementType;
        e: {
          switch (
            (hc(r, s),
            (r = s.pendingProps),
            (p = h._init),
            (h = p(h._payload)),
            (s.type = h),
            (p = s.tag = dI(h)),
            (r = Ar(h, r)),
            p)
          ) {
            case 0:
              s = af(null, s, h, r, l);
              break e;
            case 1:
              s = Ly(null, s, h, r, l);
              break e;
            case 11:
              s = xy(null, s, h, r, l);
              break e;
            case 14:
              s = by(null, s, h, Ar(h.type, r), l);
              break e;
          }
          throw Error(t(306, h, ""));
        }
        return s;
      case 0:
        return (
          (h = s.type),
          (p = s.pendingProps),
          (p = s.elementType === h ? p : Ar(h, p)),
          af(r, s, h, p, l)
        );
      case 1:
        return (
          (h = s.type),
          (p = s.pendingProps),
          (p = s.elementType === h ? p : Ar(h, p)),
          Ly(r, s, h, p, l)
        );
      case 3:
        e: {
          if ((My(s), r === null)) throw Error(t(387));
          ((h = s.pendingProps),
            (y = s.memoizedState),
            (p = y.element),
            Xg(r, s),
            nc(s, h, null, l));
          var E = s.memoizedState;
          if (((h = E.element), y.isDehydrated))
            if (
              ((y = {
                element: h,
                isDehydrated: !1,
                cache: E.cache,
                pendingSuspenseBoundaries: E.pendingSuspenseBoundaries,
                transitions: E.transitions,
              }),
              (s.updateQueue.baseState = y),
              (s.memoizedState = y),
              s.flags & 256)
            ) {
              ((p = ca(Error(t(423)), s)), (s = Vy(r, s, h, l, p)));
              break e;
            } else if (h !== p) {
              ((p = ca(Error(t(424)), s)), (s = Vy(r, s, h, l, p)));
              break e;
            } else
              for (
                $n = cs(s.stateNode.containerInfo.firstChild),
                  Bn = s,
                  St = !0,
                  Rr = null,
                  l = Qg(s, null, h, l),
                  s.child = l;
                l;

              )
                ((l.flags = (l.flags & -3) | 4096), (l = l.sibling));
          else {
            if ((sa(), h === p)) {
              s = ki(r, s, l);
              break e;
            }
            En(r, s, h, l);
          }
          s = s.child;
        }
        return s;
      case 5:
        return (
          ey(s),
          r === null && Md(s),
          (h = s.type),
          (p = s.pendingProps),
          (y = r !== null ? r.memoizedProps : null),
          (E = p.children),
          Cd(h, p) ? (E = null) : y !== null && Cd(h, y) && (s.flags |= 32),
          Oy(r, s),
          En(r, s, E, l),
          s.child
        );
      case 6:
        return (r === null && Md(s), null);
      case 13:
        return Fy(r, s, l);
      case 4:
        return (
          Hd(s, s.stateNode.containerInfo),
          (h = s.pendingProps),
          r === null ? (s.child = oa(s, null, h, l)) : En(r, s, h, l),
          s.child
        );
      case 11:
        return (
          (h = s.type),
          (p = s.pendingProps),
          (p = s.elementType === h ? p : Ar(h, p)),
          xy(r, s, h, p, l)
        );
      case 7:
        return (En(r, s, s.pendingProps, l), s.child);
      case 8:
        return (En(r, s, s.pendingProps.children, l), s.child);
      case 12:
        return (En(r, s, s.pendingProps.children, l), s.child);
      case 10:
        e: {
          if (
            ((h = s.type._context),
            (p = s.pendingProps),
            (y = s.memoizedProps),
            (E = p.value),
            gt(Zu, h._currentValue),
            (h._currentValue = E),
            y !== null)
          )
            if (Ir(y.value, E)) {
              if (y.children === p.children && !xn.current) {
                s = ki(r, s, l);
                break e;
              }
            } else
              for (y = s.child, y !== null && (y.return = s); y !== null; ) {
                var P = y.dependencies;
                if (P !== null) {
                  E = y.child;
                  for (var N = P.firstContext; N !== null; ) {
                    if (N.context === h) {
                      if (y.tag === 1) {
                        ((N = Pi(-1, l & -l)), (N.tag = 2));
                        var K = y.updateQueue;
                        if (K !== null) {
                          K = K.shared;
                          var re = K.pending;
                          (re === null
                            ? (N.next = N)
                            : ((N.next = re.next), (re.next = N)),
                            (K.pending = N));
                        }
                      }
                      ((y.lanes |= l),
                        (N = y.alternate),
                        N !== null && (N.lanes |= l),
                        jd(y.return, l, s),
                        (P.lanes |= l));
                      break;
                    }
                    N = N.next;
                  }
                } else if (y.tag === 10) E = y.type === s.type ? null : y.child;
                else if (y.tag === 18) {
                  if (((E = y.return), E === null)) throw Error(t(341));
                  ((E.lanes |= l),
                    (P = E.alternate),
                    P !== null && (P.lanes |= l),
                    jd(E, l, s),
                    (E = y.sibling));
                } else E = y.child;
                if (E !== null) E.return = y;
                else
                  for (E = y; E !== null; ) {
                    if (E === s) {
                      E = null;
                      break;
                    }
                    if (((y = E.sibling), y !== null)) {
                      ((y.return = E.return), (E = y));
                      break;
                    }
                    E = E.return;
                  }
                y = E;
              }
          (En(r, s, p.children, l), (s = s.child));
        }
        return s;
      case 9:
        return (
          (p = s.type),
          (h = s.pendingProps.children),
          la(s, l),
          (p = ir(p)),
          (h = h(p)),
          (s.flags |= 1),
          En(r, s, h, l),
          s.child
        );
      case 14:
        return (
          (h = s.type),
          (p = Ar(h, s.pendingProps)),
          (p = Ar(h.type, p)),
          by(r, s, h, p, l)
        );
      case 15:
        return Dy(r, s, s.type, s.pendingProps, l);
      case 17:
        return (
          (h = s.type),
          (p = s.pendingProps),
          (p = s.elementType === h ? p : Ar(h, p)),
          hc(r, s),
          (s.tag = 1),
          bn(h) ? ((r = !0), Ku(s)) : (r = !1),
          la(s, l),
          Sy(s, h, p),
          rf(s, h, p, l),
          lf(null, s, h, !0, r, l)
        );
      case 19:
        return zy(r, s, l);
      case 22:
        return Ny(r, s, l);
    }
    throw Error(t(156, s.tag));
  };
  function cv(r, s) {
    return rt(r, s);
  }
  function hI(r, s, l, h) {
    ((this.tag = r),
      (this.key = l),
      (this.sibling =
        this.child =
        this.return =
        this.stateNode =
        this.type =
        this.elementType =
          null),
      (this.index = 0),
      (this.ref = null),
      (this.pendingProps = s),
      (this.dependencies =
        this.memoizedState =
        this.updateQueue =
        this.memoizedProps =
          null),
      (this.mode = h),
      (this.subtreeFlags = this.flags = 0),
      (this.deletions = null),
      (this.childLanes = this.lanes = 0),
      (this.alternate = null));
  }
  function ar(r, s, l, h) {
    return new hI(r, s, l, h);
  }
  function Pf(r) {
    return ((r = r.prototype), !(!r || !r.isReactComponent));
  }
  function dI(r) {
    if (typeof r == "function") return Pf(r) ? 1 : 0;
    if (r != null) {
      if (((r = r.$$typeof), r === U)) return 11;
      if (r === He) return 14;
    }
    return 2;
  }
  function Es(r, s) {
    var l = r.alternate;
    return (
      l === null
        ? ((l = ar(r.tag, s, r.key, r.mode)),
          (l.elementType = r.elementType),
          (l.type = r.type),
          (l.stateNode = r.stateNode),
          (l.alternate = r),
          (r.alternate = l))
        : ((l.pendingProps = s),
          (l.type = r.type),
          (l.flags = 0),
          (l.subtreeFlags = 0),
          (l.deletions = null)),
      (l.flags = r.flags & 14680064),
      (l.childLanes = r.childLanes),
      (l.lanes = r.lanes),
      (l.child = r.child),
      (l.memoizedProps = r.memoizedProps),
      (l.memoizedState = r.memoizedState),
      (l.updateQueue = r.updateQueue),
      (s = r.dependencies),
      (l.dependencies =
        s === null ? null : { lanes: s.lanes, firstContext: s.firstContext }),
      (l.sibling = r.sibling),
      (l.index = r.index),
      (l.ref = r.ref),
      l
    );
  }
  function Tc(r, s, l, h, p, y) {
    var E = 2;
    if (((h = r), typeof r == "function")) Pf(r) && (E = 1);
    else if (typeof r == "string") E = 5;
    else
      e: switch (r) {
        case S:
          return vo(l.children, p, y, s);
        case R:
          ((E = 8), (p |= 8));
          break;
        case C:
          return (
            (r = ar(12, l, s, p | 2)),
            (r.elementType = C),
            (r.lanes = y),
            r
          );
        case k:
          return ((r = ar(13, l, s, p)), (r.elementType = k), (r.lanes = y), r);
        case Oe:
          return (
            (r = ar(19, l, s, p)),
            (r.elementType = Oe),
            (r.lanes = y),
            r
          );
        case Ce:
          return Sc(l, p, y, s);
        default:
          if (typeof r == "object" && r !== null)
            switch (r.$$typeof) {
              case x:
                E = 10;
                break e;
              case L:
                E = 9;
                break e;
              case U:
                E = 11;
                break e;
              case He:
                E = 14;
                break e;
              case lt:
                ((E = 16), (h = null));
                break e;
            }
          throw Error(t(130, r == null ? r : typeof r, ""));
      }
    return (
      (s = ar(E, l, s, p)),
      (s.elementType = r),
      (s.type = h),
      (s.lanes = y),
      s
    );
  }
  function vo(r, s, l, h) {
    return ((r = ar(7, r, h, s)), (r.lanes = l), r);
  }
  function Sc(r, s, l, h) {
    return (
      (r = ar(22, r, h, s)),
      (r.elementType = Ce),
      (r.lanes = l),
      (r.stateNode = { isHidden: !1 }),
      r
    );
  }
  function kf(r, s, l) {
    return ((r = ar(6, r, null, s)), (r.lanes = l), r);
  }
  function xf(r, s, l) {
    return (
      (s = ar(4, r.children !== null ? r.children : [], r.key, s)),
      (s.lanes = l),
      (s.stateNode = {
        containerInfo: r.containerInfo,
        pendingChildren: null,
        implementation: r.implementation,
      }),
      s
    );
  }
  function fI(r, s, l, h, p) {
    ((this.tag = s),
      (this.containerInfo = r),
      (this.finishedWork =
        this.pingCache =
        this.current =
        this.pendingChildren =
          null),
      (this.timeoutHandle = -1),
      (this.callbackNode = this.pendingContext = this.context = null),
      (this.callbackPriority = 0),
      (this.eventTimes = ns(0)),
      (this.expirationTimes = ns(-1)),
      (this.entangledLanes =
        this.finishedLanes =
        this.mutableReadLanes =
        this.expiredLanes =
        this.pingedLanes =
        this.suspendedLanes =
        this.pendingLanes =
          0),
      (this.entanglements = ns(0)),
      (this.identifierPrefix = h),
      (this.onRecoverableError = p),
      (this.mutableSourceEagerHydrationData = null));
  }
  function bf(r, s, l, h, p, y, E, P, N) {
    return (
      (r = new fI(r, s, l, P, N)),
      s === 1 ? ((s = 1), y === !0 && (s |= 8)) : (s = 0),
      (y = ar(3, null, null, s)),
      (r.current = y),
      (y.stateNode = r),
      (y.memoizedState = {
        element: h,
        isDehydrated: l,
        cache: null,
        transitions: null,
        pendingSuspenseBoundaries: null,
      }),
      $d(y),
      r
    );
  }
  function pI(r, s, l) {
    var h =
      3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return {
      $$typeof: he,
      key: h == null ? null : "" + h,
      children: r,
      containerInfo: s,
      implementation: l,
    };
  }
  function hv(r) {
    if (!r) return ds;
    r = r._reactInternals;
    e: {
      if (ve(r) !== r || r.tag !== 1) throw Error(t(170));
      var s = r;
      do {
        switch (s.tag) {
          case 3:
            s = s.stateNode.context;
            break e;
          case 1:
            if (bn(s.type)) {
              s = s.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        s = s.return;
      } while (s !== null);
      throw Error(t(171));
    }
    if (r.tag === 1) {
      var l = r.type;
      if (bn(l)) return Ug(r, l, s);
    }
    return s;
  }
  function dv(r, s, l, h, p, y, E, P, N) {
    return (
      (r = bf(l, h, !0, r, p, y, E, P, N)),
      (r.context = hv(null)),
      (l = r.current),
      (h = Tn()),
      (p = _s(l)),
      (y = Pi(h, p)),
      (y.callback = s ?? null),
      ms(l, y, p),
      (r.current.lanes = p),
      rs(r, p, h),
      On(r, h),
      r
    );
  }
  function Ic(r, s, l, h) {
    var p = s.current,
      y = Tn(),
      E = _s(p);
    return (
      (l = hv(l)),
      s.context === null ? (s.context = l) : (s.pendingContext = l),
      (s = Pi(y, E)),
      (s.payload = { element: r }),
      (h = h === void 0 ? null : h),
      h !== null && (s.callback = h),
      (r = ms(p, s, E)),
      r !== null && (kr(r, p, E, y), tc(r, p, E)),
      E
    );
  }
  function Rc(r) {
    if (((r = r.current), !r.child)) return null;
    switch (r.child.tag) {
      case 5:
        return r.child.stateNode;
      default:
        return r.child.stateNode;
    }
  }
  function fv(r, s) {
    if (((r = r.memoizedState), r !== null && r.dehydrated !== null)) {
      var l = r.retryLane;
      r.retryLane = l !== 0 && l < s ? l : s;
    }
  }
  function Df(r, s) {
    (fv(r, s), (r = r.alternate) && fv(r, s));
  }
  function mI() {
    return null;
  }
  var pv =
    typeof reportError == "function"
      ? reportError
      : function (r) {
          console.error(r);
        };
  function Nf(r) {
    this._internalRoot = r;
  }
  ((Ac.prototype.render = Nf.prototype.render =
    function (r) {
      var s = this._internalRoot;
      if (s === null) throw Error(t(409));
      Ic(r, s, null, null);
    }),
    (Ac.prototype.unmount = Nf.prototype.unmount =
      function () {
        var r = this._internalRoot;
        if (r !== null) {
          this._internalRoot = null;
          var s = r.containerInfo;
          (mo(function () {
            Ic(null, r, null, null);
          }),
            (s[Si] = null));
        }
      }));
  function Ac(r) {
    this._internalRoot = r;
  }
  Ac.prototype.unstable_scheduleHydration = function (r) {
    if (r) {
      var s = Au();
      r = { blockedOn: null, target: r, priority: s };
      for (var l = 0; l < zr.length && s !== 0 && s < zr[l].priority; l++);
      (zr.splice(l, 0, r), l === 0 && ku(r));
    }
  };
  function Of(r) {
    return !(!r || (r.nodeType !== 1 && r.nodeType !== 9 && r.nodeType !== 11));
  }
  function Cc(r) {
    return !(
      !r ||
      (r.nodeType !== 1 &&
        r.nodeType !== 9 &&
        r.nodeType !== 11 &&
        (r.nodeType !== 8 || r.nodeValue !== " react-mount-point-unstable "))
    );
  }
  function mv() {}
  function gI(r, s, l, h, p) {
    if (p) {
      if (typeof h == "function") {
        var y = h;
        h = function () {
          var K = Rc(E);
          y.call(K);
        };
      }
      var E = dv(s, h, r, 0, null, !1, !1, "", mv);
      return (
        (r._reactRootContainer = E),
        (r[Si] = E.current),
        ol(r.nodeType === 8 ? r.parentNode : r),
        mo(),
        E
      );
    }
    for (; (p = r.lastChild); ) r.removeChild(p);
    if (typeof h == "function") {
      var P = h;
      h = function () {
        var K = Rc(N);
        P.call(K);
      };
    }
    var N = bf(r, 0, !1, null, null, !1, !1, "", mv);
    return (
      (r._reactRootContainer = N),
      (r[Si] = N.current),
      ol(r.nodeType === 8 ? r.parentNode : r),
      mo(function () {
        Ic(s, N, l, h);
      }),
      N
    );
  }
  function Pc(r, s, l, h, p) {
    var y = l._reactRootContainer;
    if (y) {
      var E = y;
      if (typeof p == "function") {
        var P = p;
        p = function () {
          var N = Rc(E);
          P.call(N);
        };
      }
      Ic(s, E, r, p);
    } else E = gI(l, s, r, p, h);
    return Rc(E);
  }
  ((Iu = function (r) {
    switch (r.tag) {
      case 3:
        var s = r.stateNode;
        if (s.current.memoizedState.isDehydrated) {
          var l = ts(s.pendingLanes);
          l !== 0 &&
            (is(s, l | 1),
            On(s, Xe()),
            (nt & 6) === 0 && ((fa = Xe() + 500), fs()));
        }
        break;
      case 13:
        (mo(function () {
          var h = Ci(r, 1);
          if (h !== null) {
            var p = Tn();
            kr(h, r, 1, p);
          }
        }),
          Df(r, 1));
    }
  }),
    (Fo = function (r) {
      if (r.tag === 13) {
        var s = Ci(r, 134217728);
        if (s !== null) {
          var l = Tn();
          kr(s, r, 134217728, l);
        }
        Df(r, 134217728);
      }
    }),
    (Ru = function (r) {
      if (r.tag === 13) {
        var s = _s(r),
          l = Ci(r, s);
        if (l !== null) {
          var h = Tn();
          kr(l, r, s, h);
        }
        Df(r, s);
      }
    }),
    (Au = function () {
      return Je;
    }),
    (Cu = function (r, s) {
      var l = Je;
      try {
        return ((Je = r), s());
      } finally {
        Je = l;
      }
    }),
    (fi = function (r, s, l) {
      switch (s) {
        case "input":
          if ((Gs(r, l), (s = l.name), l.type === "radio" && s != null)) {
            for (l = r; l.parentNode; ) l = l.parentNode;
            for (
              l = l.querySelectorAll(
                "input[name=" + JSON.stringify("" + s) + '][type="radio"]',
              ),
                s = 0;
              s < l.length;
              s++
            ) {
              var h = l[s];
              if (h !== r && h.form === r.form) {
                var p = Wu(h);
                if (!p) throw Error(t(90));
                (Fn(h), Gs(h, p));
              }
            }
          }
          break;
        case "textarea":
          Gn(r, l);
          break;
        case "select":
          ((s = l.value), s != null && pr(r, !!l.multiple, s, !1));
      }
    }),
    (Xn = Rf),
    (Vr = mo));
  var yI = { usingClientEntryPoint: !1, Events: [ul, ea, Wu, Yn, Zi, Rf] },
    Sl = {
      findFiberByHostInstance: oo,
      bundleType: 0,
      version: "18.3.1",
      rendererPackageName: "react-dom",
    },
    vI = {
      bundleType: Sl.bundleType,
      version: Sl.version,
      rendererPackageName: Sl.rendererPackageName,
      rendererConfig: Sl.rendererConfig,
      overrideHookState: null,
      overrideHookStateDeletePath: null,
      overrideHookStateRenamePath: null,
      overrideProps: null,
      overridePropsDeletePath: null,
      overridePropsRenamePath: null,
      setErrorHandler: null,
      setSuspenseHandler: null,
      scheduleUpdate: null,
      currentDispatcherRef: ae.ReactCurrentDispatcher,
      findHostInstanceByFiber: function (r) {
        return ((r = yt(r)), r === null ? null : r.stateNode);
      },
      findFiberByHostInstance: Sl.findFiberByHostInstance || mI,
      findHostInstancesForRefresh: null,
      scheduleRefresh: null,
      scheduleRoot: null,
      setRefreshHandler: null,
      getCurrentFiber: null,
      reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
    };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var kc = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!kc.isDisabled && kc.supportsFiber)
      try {
        (($e = kc.inject(vI)), (ot = kc));
      } catch {}
  }
  return (
    (Ln.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = yI),
    (Ln.createPortal = function (r, s) {
      var l =
        2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
      if (!Of(s)) throw Error(t(200));
      return pI(r, s, null, l);
    }),
    (Ln.createRoot = function (r, s) {
      if (!Of(r)) throw Error(t(299));
      var l = !1,
        h = "",
        p = pv;
      return (
        s != null &&
          (s.unstable_strictMode === !0 && (l = !0),
          s.identifierPrefix !== void 0 && (h = s.identifierPrefix),
          s.onRecoverableError !== void 0 && (p = s.onRecoverableError)),
        (s = bf(r, 1, !1, null, null, l, !1, h, p)),
        (r[Si] = s.current),
        ol(r.nodeType === 8 ? r.parentNode : r),
        new Nf(s)
      );
    }),
    (Ln.findDOMNode = function (r) {
      if (r == null) return null;
      if (r.nodeType === 1) return r;
      var s = r._reactInternals;
      if (s === void 0)
        throw typeof r.render == "function"
          ? Error(t(188))
          : ((r = Object.keys(r).join(",")), Error(t(268, r)));
      return ((r = yt(s)), (r = r === null ? null : r.stateNode), r);
    }),
    (Ln.flushSync = function (r) {
      return mo(r);
    }),
    (Ln.hydrate = function (r, s, l) {
      if (!Cc(s)) throw Error(t(200));
      return Pc(null, r, s, !0, l);
    }),
    (Ln.hydrateRoot = function (r, s, l) {
      if (!Of(r)) throw Error(t(405));
      var h = (l != null && l.hydratedSources) || null,
        p = !1,
        y = "",
        E = pv;
      if (
        (l != null &&
          (l.unstable_strictMode === !0 && (p = !0),
          l.identifierPrefix !== void 0 && (y = l.identifierPrefix),
          l.onRecoverableError !== void 0 && (E = l.onRecoverableError)),
        (s = dv(s, null, r, 1, l ?? null, p, !1, y, E)),
        (r[Si] = s.current),
        ol(r),
        h)
      )
        for (r = 0; r < h.length; r++)
          ((l = h[r]),
            (p = l._getVersion),
            (p = p(l._source)),
            s.mutableSourceEagerHydrationData == null
              ? (s.mutableSourceEagerHydrationData = [l, p])
              : s.mutableSourceEagerHydrationData.push(l, p));
      return new Ac(s);
    }),
    (Ln.render = function (r, s, l) {
      if (!Cc(s)) throw Error(t(200));
      return Pc(null, r, s, !1, l);
    }),
    (Ln.unmountComponentAtNode = function (r) {
      if (!Cc(r)) throw Error(t(40));
      return r._reactRootContainer
        ? (mo(function () {
            Pc(null, null, r, !1, function () {
              ((r._reactRootContainer = null), (r[Si] = null));
            });
          }),
          !0)
        : !1;
    }),
    (Ln.unstable_batchedUpdates = Rf),
    (Ln.unstable_renderSubtreeIntoContainer = function (r, s, l, h) {
      if (!Cc(l)) throw Error(t(200));
      if (r == null || r._reactInternals === void 0) throw Error(t(38));
      return Pc(r, s, l, !1, h);
    }),
    (Ln.version = "18.3.1-next-f1338f8080-20240426"),
    Ln
  );
}
var Gv;
function yw() {
  if (Gv) return Bf.exports;
  Gv = 1;
  function n() {
    if (
      !(
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
        typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
      )
    )
      try {
        __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(n);
      } catch (e) {
        console.error(e);
      }
  }
  return (n(), (Bf.exports = zR()), Bf.exports);
}
var jR = yw();
function BR(n) {
  return z.createElement(Z1, { flushSync: jR.flushSync, ...n });
}
const $R = "modulepreload",
  HR = function (n) {
    return "/" + n;
  },
  Qv = {},
  Kn = function (e, t, i) {
    let o = Promise.resolve();
    if (t && t.length > 0) {
      let f = function (m) {
        return Promise.all(
          m.map((v) =>
            Promise.resolve(v).then(
              (w) => ({ status: "fulfilled", value: w }),
              (w) => ({ status: "rejected", reason: w }),
            ),
          ),
        );
      };
      document.getElementsByTagName("link");
      const u = document.querySelector("meta[property=csp-nonce]"),
        d = u?.nonce || u?.getAttribute("nonce");
      o = f(
        t.map((m) => {
          if (((m = HR(m)), m in Qv)) return;
          Qv[m] = !0;
          const v = m.endsWith(".css"),
            w = v ? '[rel="stylesheet"]' : "";
          if (document.querySelector(`link[href="${m}"]${w}`)) return;
          const T = document.createElement("link");
          if (
            ((T.rel = v ? "stylesheet" : $R),
            v || (T.as = "script"),
            (T.crossOrigin = ""),
            (T.href = m),
            d && T.setAttribute("nonce", d),
            document.head.appendChild(T),
            v)
          )
            return new Promise((A, D) => {
              (T.addEventListener("load", A),
                T.addEventListener("error", () =>
                  D(new Error(`Unable to preload CSS for ${m}`)),
                ));
            });
        }),
      );
    }
    function a(u) {
      const d = new Event("vite:preloadError", { cancelable: !0 });
      if (((d.payload = u), window.dispatchEvent(d), !d.defaultPrevented))
        throw u;
    }
    return o.then((u) => {
      for (const d of u || []) d.status === "rejected" && a(d.reason);
      return e().catch(a);
    });
  },
  ma = {
    emerald: { 300: "#6ee7b7", 500: "#10b981" },
    neutral: { 900: "#0b0b0c", 800: "#111214", 400: "#3f3f46" },
    accent: { sky: "#38bdf8" },
  };
function WR() {
  const n = [];
  return (
    n.push(`--dg-emerald-500: ${ma.emerald[500]};`),
    n.push(`--dg-emerald-300: ${ma.emerald[300]};`),
    n.push(`--dg-bg: ${ma.neutral[900]};`),
    n.push(`--dg-surface: ${ma.neutral[800]};`),
    n.push(`--dg-muted: ${ma.neutral[400]};`),
    n.push(`--dg-accent-sky: ${ma.accent.sky};`),
    n.join(`
`)
  );
}
function qR() {
  const n = Uh(),
    e = Or(),
    t = e.pathname === "/" || e.pathname === "/splash";
  return Y.jsx("header", {
    className:
      "border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-50",
    children: Y.jsxs("div", {
      className:
        "container mx-auto px-4 py-3 flex items-center justify-between",
      children: [
        Y.jsxs(Ql, {
          to: "/",
          className: "flex flex-col leading-none",
          children: [
            Y.jsx("span", {
              className: "text-2xl font-extrabold tracking-tight text-white",
              children: "Doggerz",
            }),
            Y.jsx("span", {
              className:
                "text-[10px] uppercase tracking-[0.28em] text-emerald-400/90",
              children: "Virtual Pup",
            }),
          ],
        }),
        Y.jsxs("nav", {
          className: "flex items-center gap-4",
          "aria-label": "Main navigation",
          children: [
            Y.jsx("button", {
              onClick: () => n("/settings"),
              className: "text-sm text-zinc-100 hover:text-white transition",
              title: "Settings",
              children: "Settings",
            }),
            Y.jsx("button", {
              onClick: () => n("/about"),
              className: "text-sm text-zinc-100 hover:text-white transition",
              children: "About",
            }),
            !t &&
              Y.jsx("button", {
                onClick: () => n("/"),
                className: "text-sm text-zinc-100 hover:text-white transition",
                children: "Home",
              }),
            Y.jsxs("div", {
              className: "ml-2 flex items-center gap-3",
              children: [
                Y.jsx("button", {
                  onClick: () => n("/login"),
                  className:
                    "text-sm text-zinc-100 hover:text-white transition",
                  children: "Login",
                }),
                Y.jsx("button", {
                  onClick: () => n("/adopt"),
                  className:
                    "rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-4 py-1.5 transition",
                  children: "Adopt",
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function KR() {
  const n = Uh(),
    e = new Date().getFullYear();
  return Y.jsx("footer", {
    className:
      "border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-500 py-4",
    children: Y.jsxs("div", {
      className:
        "container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2",
      children: [
        Y.jsxs("p", {
          className: "text-zinc-500",
          children: ["© ", e, " Doggerz."],
        }),
        Y.jsxs("nav", {
          className: "flex items-center gap-4",
          "aria-label": "Footer navigation",
          children: [
            Y.jsx("button", {
              onClick: () => n("/press"),
              className: "text-zinc-400 hover:text-zinc-200",
              children: "Press",
            }),
            Y.jsx("button", {
              onClick: () => n("/contribute"),
              className: "text-zinc-400 hover:text-zinc-200",
              children: "Contribute",
            }),
            Y.jsx("button", {
              onClick: () => n("/support"),
              className: "text-zinc-400 hover:text-zinc-200",
              children: "Support",
            }),
            Y.jsx("button", {
              onClick: () => n("/faq"),
              className: "text-zinc-400 hover:text-zinc-200",
              children: "FAQ",
            }),
            Y.jsx("button", {
              onClick: () => n("/about"),
              className: "text-zinc-400 hover:text-zinc-200",
              children: "About",
            }),
            Y.jsx("button", {
              onClick: () => n("/contact"),
              className: "text-zinc-400 hover:text-zinc-200",
              children: "Contact",
            }),
            Y.jsx("a", {
              href: "https://facebook.com",
              target: "_blank",
              rel: "noreferrer",
              className: "text-zinc-400 hover:text-zinc-200",
              "aria-label": "Facebook",
              children: Y.jsx("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                width: "16",
                height: "16",
                fill: "currentColor",
                viewBox: "0 0 24 24",
                className: "inline-block",
                children: Y.jsx("path", {
                  d: "M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H7.9v-2.9h2.54V9.83c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34v7.03C18.34 21.19 22 17.06 22 12.07z",
                }),
              }),
            }),
            Y.jsx("a", {
              href: "https://github.com",
              target: "_blank",
              rel: "noreferrer",
              className: "text-zinc-400 hover:text-zinc-200",
              "aria-label": "GitHub",
              children: Y.jsx("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                width: "16",
                height: "16",
                fill: "currentColor",
                viewBox: "0 0 24 24",
                className: "inline-block",
                children: Y.jsx("path", {
                  d: "M12 .5C5.73.5.75 5.47.75 11.74c0 4.93 3.19 9.11 7.61 10.59.56.1.76-.24.76-.53 0-.26-.01-1.12-.02-2.03-3.09.67-3.74-1.49-3.74-1.49-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1.01 1.72 2.65 1.22 3.29.93.1-.72.39-1.22.71-1.5-2.47-.28-5.06-1.24-5.06-5.52 0-1.22.43-2.21 1.14-2.99-.11-.28-.5-1.4.11-2.92 0 0 .93-.3 3.05 1.14a10.6 10.6 0 012.78-.38c.94.01 1.89.13 2.78.38 2.12-1.44 3.05-1.14 3.05-1.14.61 1.52.22 2.64.11 2.92.71.78 1.14 1.77 1.14 2.99 0 4.29-2.6 5.24-5.08 5.51.4.35.75 1.05.75 2.12 0 1.53-.01 2.76-.01 3.13 0 .29.2.64.77.53 4.42-1.48 7.61-5.66 7.61-10.59C23.25 5.47 18.27.5 12 .5z",
                }),
              }),
            }),
          ],
        }),
      ],
    }),
  });
}
var Wf = { exports: {} },
  qf = {};
var Yv;
function GR() {
  if (Yv) return qf;
  Yv = 1;
  var n = Lh();
  function e(f, m) {
    return (f === m && (f !== 0 || 1 / f === 1 / m)) || (f !== f && m !== m);
  }
  var t = typeof Object.is == "function" ? Object.is : e,
    i = n.useSyncExternalStore,
    o = n.useRef,
    a = n.useEffect,
    u = n.useMemo,
    d = n.useDebugValue;
  return (
    (qf.useSyncExternalStoreWithSelector = function (f, m, v, w, T) {
      var A = o(null);
      if (A.current === null) {
        var D = { hasValue: !1, value: null };
        A.current = D;
      } else D = A.current;
      A = u(
        function () {
          function O(ee) {
            if (!X) {
              if (
                ((X = !0), (q = ee), (ee = w(ee)), T !== void 0 && D.hasValue)
              ) {
                var he = D.value;
                if (T(he, ee)) return (G = he);
              }
              return (G = ee);
            }
            if (((he = G), t(q, ee))) return he;
            var S = w(ee);
            return T !== void 0 && T(he, S)
              ? ((q = ee), he)
              : ((q = ee), (G = S));
          }
          var X = !1,
            q,
            G,
            ae = v === void 0 ? null : v;
          return [
            function () {
              return O(m());
            },
            ae === null
              ? void 0
              : function () {
                  return O(ae());
                },
          ];
        },
        [m, v, w, T],
      );
      var j = i(f, A[0], A[1]);
      return (
        a(
          function () {
            ((D.hasValue = !0), (D.value = j));
          },
          [j],
        ),
        d(j),
        j
      );
    }),
    qf
  );
}
var Xv;
function QR() {
  return (Xv || ((Xv = 1), (Wf.exports = GR())), Wf.exports);
}
var YR = QR();
function XR(n) {
  n();
}
function JR() {
  let n = null,
    e = null;
  return {
    clear() {
      ((n = null), (e = null));
    },
    notify() {
      XR(() => {
        let t = n;
        for (; t; ) (t.callback(), (t = t.next));
      });
    },
    get() {
      const t = [];
      let i = n;
      for (; i; ) (t.push(i), (i = i.next));
      return t;
    },
    subscribe(t) {
      let i = !0;
      const o = (e = { callback: t, next: null, prev: e });
      return (
        o.prev ? (o.prev.next = o) : (n = o),
        function () {
          !i ||
            n === null ||
            ((i = !1),
            o.next ? (o.next.prev = o.prev) : (e = o.prev),
            o.prev ? (o.prev.next = o.next) : (n = o.next));
        }
      );
    },
  };
}
var Jv = { notify() {}, get: () => [] };
function ZR(n, e) {
  let t,
    i = Jv,
    o = 0,
    a = !1;
  function u(j) {
    v();
    const O = i.subscribe(j);
    let X = !1;
    return () => {
      X || ((X = !0), O(), w());
    };
  }
  function d() {
    i.notify();
  }
  function f() {
    D.onStateChange && D.onStateChange();
  }
  function m() {
    return a;
  }
  function v() {
    (o++, t || ((t = n.subscribe(f)), (i = JR())));
  }
  function w() {
    (o--, t && o === 0 && (t(), (t = void 0), i.clear(), (i = Jv)));
  }
  function T() {
    a || ((a = !0), v());
  }
  function A() {
    a && ((a = !1), w());
  }
  const D = {
    addNestedSub: u,
    notifyNestedSubs: d,
    handleChangeWrapper: f,
    isSubscribed: m,
    trySubscribe: T,
    tryUnsubscribe: A,
    getListeners: () => i,
  };
  return D;
}
var eA = () =>
    typeof window < "u" &&
    typeof window.document < "u" &&
    typeof window.document.createElement < "u",
  tA = eA(),
  nA = () => typeof navigator < "u" && navigator.product === "ReactNative",
  rA = nA(),
  iA = () => (tA || rA ? z.useLayoutEffect : z.useEffect),
  sA = iA(),
  oA = Symbol.for("react-redux-context"),
  aA = typeof globalThis < "u" ? globalThis : {};
function lA() {
  if (!z.createContext) return {};
  const n = (aA[oA] ??= new Map());
  let e = n.get(z.createContext);
  return (e || ((e = z.createContext(null)), n.set(z.createContext, e)), e);
}
var Us = lA();
function uA(n) {
  const { children: e, context: t, serverState: i, store: o } = n,
    a = z.useMemo(() => {
      const f = ZR(o);
      return {
        store: o,
        subscription: f,
        getServerState: i ? () => i : void 0,
      };
    }, [o, i]),
    u = z.useMemo(() => o.getState(), [o]);
  sA(() => {
    const { subscription: f } = a;
    return (
      (f.onStateChange = f.notifyNestedSubs),
      f.trySubscribe(),
      u !== o.getState() && f.notifyNestedSubs(),
      () => {
        (f.tryUnsubscribe(), (f.onStateChange = void 0));
      }
    );
  }, [a, u]);
  const d = t || Us;
  return z.createElement(d.Provider, { value: a }, e);
}
var cA = uA;
function um(n = Us) {
  return function () {
    return z.useContext(n);
  };
}
var vw = um();
function _w(n = Us) {
  const e = n === Us ? vw : um(n),
    t = () => {
      const { store: i } = e();
      return i;
    };
  return (Object.assign(t, { withTypes: () => t }), t);
}
var hA = _w();
function dA(n = Us) {
  const e = n === Us ? hA : _w(n),
    t = () => e().dispatch;
  return (Object.assign(t, { withTypes: () => t }), t);
}
var fA = dA(),
  pA = (n, e) => n === e;
function mA(n = Us) {
  const e = n === Us ? vw : um(n),
    t = (i, o = {}) => {
      const { equalityFn: a = pA } =
          typeof o == "function" ? { equalityFn: o } : o,
        u = e(),
        { store: d, subscription: f, getServerState: m } = u;
      z.useRef(!0);
      const v = z.useCallback(
          {
            [i.name](T) {
              return i(T);
            },
          }[i.name],
          [i],
        ),
        w = YR.useSyncExternalStoreWithSelector(
          f.addNestedSub,
          d.getState,
          m || d.getState,
          v,
          a,
        );
      return (z.useDebugValue(w), w);
    };
  return (Object.assign(t, { withTypes: () => t }), t);
}
var gA = mA(),
  Kf = { exports: {} },
  Gf,
  Zv;
function yA() {
  if (Zv) return Gf;
  Zv = 1;
  var n = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
  return ((Gf = n), Gf);
}
var Qf, e_;
function vA() {
  if (e_) return Qf;
  e_ = 1;
  var n = yA();
  function e() {}
  function t() {}
  return (
    (t.resetWarningCache = e),
    (Qf = function () {
      function i(u, d, f, m, v, w) {
        if (w !== n) {
          var T = new Error(
            "Calling PropTypes validators directly is not supported by the `prop-types` package. Use PropTypes.checkPropTypes() to call them. Read more at http://fb.me/use-check-prop-types",
          );
          throw ((T.name = "Invariant Violation"), T);
        }
      }
      i.isRequired = i;
      function o() {
        return i;
      }
      var a = {
        array: i,
        bigint: i,
        bool: i,
        func: i,
        number: i,
        object: i,
        string: i,
        symbol: i,
        any: i,
        arrayOf: o,
        element: i,
        elementType: i,
        instanceOf: o,
        node: i,
        objectOf: o,
        oneOf: o,
        oneOfType: o,
        shape: o,
        exact: o,
        checkPropTypes: t,
        resetWarningCache: e,
      };
      return ((a.PropTypes = a), a);
    }),
    Qf
  );
}
var t_;
function _A() {
  return (t_ || ((t_ = 1), (Kf.exports = vA()())), Kf.exports);
}
var wA = _A();
const vp = Zp(wA);
function sn(n) {
  return `Minified Redux error #${n}; visit https://redux.js.org/Errors?code=${n} for the full message or use the non-minified dev environment for full errors. `;
}
var EA = (typeof Symbol == "function" && Symbol.observable) || "@@observable",
  n_ = EA,
  Yf = () => Math.random().toString(36).substring(7).split("").join("."),
  TA = {
    INIT: `@@redux/INIT${Yf()}`,
    REPLACE: `@@redux/REPLACE${Yf()}`,
    PROBE_UNKNOWN_ACTION: () => `@@redux/PROBE_UNKNOWN_ACTION${Yf()}`,
  },
  uh = TA;
function cm(n) {
  if (typeof n != "object" || n === null) return !1;
  let e = n;
  for (; Object.getPrototypeOf(e) !== null; ) e = Object.getPrototypeOf(e);
  return Object.getPrototypeOf(n) === e || Object.getPrototypeOf(n) === null;
}
function ww(n, e, t) {
  if (typeof n != "function") throw new Error(sn(2));
  if (
    (typeof e == "function" && typeof t == "function") ||
    (typeof t == "function" && typeof arguments[3] == "function")
  )
    throw new Error(sn(0));
  if (
    (typeof e == "function" && typeof t > "u" && ((t = e), (e = void 0)),
    typeof t < "u")
  ) {
    if (typeof t != "function") throw new Error(sn(1));
    return t(ww)(n, e);
  }
  let i = n,
    o = e,
    a = new Map(),
    u = a,
    d = 0,
    f = !1;
  function m() {
    u === a &&
      ((u = new Map()),
      a.forEach((O, X) => {
        u.set(X, O);
      }));
  }
  function v() {
    if (f) throw new Error(sn(3));
    return o;
  }
  function w(O) {
    if (typeof O != "function") throw new Error(sn(4));
    if (f) throw new Error(sn(5));
    let X = !0;
    m();
    const q = d++;
    return (
      u.set(q, O),
      function () {
        if (X) {
          if (f) throw new Error(sn(6));
          ((X = !1), m(), u.delete(q), (a = null));
        }
      }
    );
  }
  function T(O) {
    if (!cm(O)) throw new Error(sn(7));
    if (typeof O.type > "u") throw new Error(sn(8));
    if (typeof O.type != "string") throw new Error(sn(17));
    if (f) throw new Error(sn(9));
    try {
      ((f = !0), (o = i(o, O)));
    } finally {
      f = !1;
    }
    return (
      (a = u).forEach((q) => {
        q();
      }),
      O
    );
  }
  function A(O) {
    if (typeof O != "function") throw new Error(sn(10));
    ((i = O), T({ type: uh.REPLACE }));
  }
  function D() {
    const O = w;
    return {
      subscribe(X) {
        if (typeof X != "object" || X === null) throw new Error(sn(11));
        function q() {
          const ae = X;
          ae.next && ae.next(v());
        }
        return (q(), { unsubscribe: O(q) });
      },
      [n_]() {
        return this;
      },
    };
  }
  return (
    T({ type: uh.INIT }),
    { dispatch: T, subscribe: w, getState: v, replaceReducer: A, [n_]: D }
  );
}
function SA(n) {
  Object.keys(n).forEach((e) => {
    const t = n[e];
    if (typeof t(void 0, { type: uh.INIT }) > "u") throw new Error(sn(12));
    if (typeof t(void 0, { type: uh.PROBE_UNKNOWN_ACTION() }) > "u")
      throw new Error(sn(13));
  });
}
function IA(n) {
  const e = Object.keys(n),
    t = {};
  for (let a = 0; a < e.length; a++) {
    const u = e[a];
    typeof n[u] == "function" && (t[u] = n[u]);
  }
  const i = Object.keys(t);
  let o;
  try {
    SA(t);
  } catch (a) {
    o = a;
  }
  return function (u = {}, d) {
    if (o) throw o;
    let f = !1;
    const m = {};
    for (let v = 0; v < i.length; v++) {
      const w = i[v],
        T = t[w],
        A = u[w],
        D = T(A, d);
      if (typeof D > "u") throw (d && d.type, new Error(sn(14)));
      ((m[w] = D), (f = f || D !== A));
    }
    return ((f = f || i.length !== Object.keys(u).length), f ? m : u);
  };
}
function ch(...n) {
  return n.length === 0
    ? (e) => e
    : n.length === 1
      ? n[0]
      : n.reduce(
          (e, t) =>
            (...i) =>
              e(t(...i)),
        );
}
function RA(...n) {
  return (e) => (t, i) => {
    const o = e(t, i);
    let a = () => {
      throw new Error(sn(15));
    };
    const u = { getState: o.getState, dispatch: (f, ...m) => a(f, ...m) },
      d = n.map((f) => f(u));
    return ((a = ch(...d)(o.dispatch)), { ...o, dispatch: a });
  };
}
function AA(n) {
  return cm(n) && "type" in n && typeof n.type == "string";
}
var Ew = Symbol.for("immer-nothing"),
  r_ = Symbol.for("immer-draftable"),
  In = Symbol.for("immer-state");
function xr(n, ...e) {
  throw new Error(
    `[Immer] minified error nr: ${n}. Full error at: https://bit.ly/3cXEKWf`,
  );
}
var qn = Object,
  ba = qn.getPrototypeOf,
  hh = "constructor",
  jh = "prototype",
  _p = "configurable",
  dh = "enumerable",
  Kc = "writable",
  Yl = "value",
  Ui = (n) => !!n && !!n[In];
function oi(n) {
  return n ? Tw(n) || Bh(n) || !!n[r_] || !!n[hh]?.[r_] || $h(n) || Hh(n) : !1;
}
var CA = qn[jh][hh].toString(),
  i_ = new WeakMap();
function Tw(n) {
  if (!n || !hm(n)) return !1;
  const e = ba(n);
  if (e === null || e === qn[jh]) return !0;
  const t = qn.hasOwnProperty.call(e, hh) && e[hh];
  if (t === Object) return !0;
  if (!_a(t)) return !1;
  let i = i_.get(t);
  return (
    i === void 0 && ((i = Function.toString.call(t)), i_.set(t, i)),
    i === CA
  );
}
function du(n, e, t = !0) {
  fu(n) === 0
    ? (t ? Reflect.ownKeys(n) : qn.keys(n)).forEach((o) => {
        e(o, n[o], n);
      })
    : n.forEach((i, o) => e(o, i, n));
}
function fu(n) {
  const e = n[In];
  return e ? e.type_ : Bh(n) ? 1 : $h(n) ? 2 : Hh(n) ? 3 : 0;
}
var s_ = (n, e, t = fu(n)) =>
    t === 2 ? n.has(e) : qn[jh].hasOwnProperty.call(n, e),
  wp = (n, e, t = fu(n)) => (t === 2 ? n.get(e) : n[e]),
  fh = (n, e, t, i = fu(n)) => {
    i === 2 ? n.set(e, t) : i === 3 ? n.add(t) : (n[e] = t);
  };
function PA(n, e) {
  return n === e ? n !== 0 || 1 / n === 1 / e : n !== n && e !== e;
}
var Bh = Array.isArray,
  $h = (n) => n instanceof Map,
  Hh = (n) => n instanceof Set,
  hm = (n) => typeof n == "object",
  _a = (n) => typeof n == "function",
  Xf = (n) => typeof n == "boolean",
  Di = (n) => n.copy_ || n.base_,
  dm = (n) => (n.modified_ ? n.copy_ : n.base_);
function Ep(n, e) {
  if ($h(n)) return new Map(n);
  if (Hh(n)) return new Set(n);
  if (Bh(n)) return Array[jh].slice.call(n);
  const t = Tw(n);
  if (e === !0 || (e === "class_only" && !t)) {
    const i = qn.getOwnPropertyDescriptors(n);
    delete i[In];
    let o = Reflect.ownKeys(i);
    for (let a = 0; a < o.length; a++) {
      const u = o[a],
        d = i[u];
      (d[Kc] === !1 && ((d[Kc] = !0), (d[_p] = !0)),
        (d.get || d.set) &&
          (i[u] = { [_p]: !0, [Kc]: !0, [dh]: d[dh], [Yl]: n[u] }));
    }
    return qn.create(ba(n), i);
  } else {
    const i = ba(n);
    if (i !== null && t) return { ...n };
    const o = qn.create(i);
    return qn.assign(o, n);
  }
}
function fm(n, e = !1) {
  return (
    Wh(n) ||
      Ui(n) ||
      (fu(n) > 1 &&
        qn.defineProperties(n, { set: Nc, add: Nc, clear: Nc, delete: Nc }),
      qn.freeze(n),
      e &&
        du(
          n,
          (t, i) => {
            fm(i, !0);
          },
          !1,
        )),
    n
  );
}
function kA() {
  xr(2);
}
var Nc = { [Yl]: kA };
function Wh(n) {
  return n === null || !hm(n) ? !0 : qn.isFrozen(n);
}
var ph = "MapSet",
  Tp = "Patches",
  Sw = {};
function Da(n) {
  const e = Sw[n];
  return (e || xr(0, n), e);
}
var xA = (n) => !!Sw[n],
  Xl,
  Iw = () => Xl,
  bA = (n, e) => ({
    drafts_: [],
    parent_: n,
    immer_: e,
    canAutoFreeze_: !0,
    unfinalizedDrafts_: 0,
    handledSet_: new Set(),
    processedForPatches_: new Set(),
    mapSetPlugin_: xA(ph) ? Da(ph) : void 0,
  });
function o_(n, e) {
  e &&
    ((n.patchPlugin_ = Da(Tp)),
    (n.patches_ = []),
    (n.inversePatches_ = []),
    (n.patchListener_ = e));
}
function Sp(n) {
  (Ip(n), n.drafts_.forEach(DA), (n.drafts_ = null));
}
function Ip(n) {
  n === Xl && (Xl = n.parent_);
}
var a_ = (n) => (Xl = bA(Xl, n));
function DA(n) {
  const e = n[In];
  e.type_ === 0 || e.type_ === 1 ? e.revoke_() : (e.revoked_ = !0);
}
function l_(n, e) {
  e.unfinalizedDrafts_ = e.drafts_.length;
  const t = e.drafts_[0];
  if (n !== void 0 && n !== t) {
    (t[In].modified_ && (Sp(e), xr(4)), oi(n) && (n = u_(e, n)));
    const { patchPlugin_: o } = e;
    o && o.generateReplacementPatches_(t[In].base_, n, e);
  } else n = u_(e, t);
  return (
    NA(e, n, !0),
    Sp(e),
    e.patches_ && e.patchListener_(e.patches_, e.inversePatches_),
    n !== Ew ? n : void 0
  );
}
function u_(n, e) {
  if (Wh(e)) return e;
  const t = e[In];
  if (!t) return pm(e, n.handledSet_, n);
  if (!qh(t, n)) return e;
  if (!t.modified_) return t.base_;
  if (!t.finalized_) {
    const { callbacks_: i } = t;
    if (i) for (; i.length > 0; ) i.pop()(n);
    Cw(t, n);
  }
  return t.copy_;
}
function NA(n, e, t = !1) {
  !n.parent_ && n.immer_.autoFreeze_ && n.canAutoFreeze_ && fm(e, t);
}
function Rw(n) {
  ((n.finalized_ = !0), n.scope_.unfinalizedDrafts_--);
}
var qh = (n, e) => n.scope_ === e,
  OA = [];
function Aw(n, e, t, i) {
  const o = Di(n),
    a = n.type_;
  if (i !== void 0 && wp(o, i, a) === e) {
    fh(o, i, t, a);
    return;
  }
  if (!n.draftLocations_) {
    const d = (n.draftLocations_ = new Map());
    du(o, (f, m) => {
      if (Ui(m)) {
        const v = d.get(m) || [];
        (v.push(f), d.set(m, v));
      }
    });
  }
  const u = n.draftLocations_.get(e) ?? OA;
  for (const d of u) fh(o, d, t, a);
}
function LA(n, e, t) {
  n.callbacks_.push(function (o) {
    const a = e;
    if (!a || !qh(a, o)) return;
    o.mapSetPlugin_?.fixSetContents(a);
    const u = dm(a);
    (Aw(n, a.draft_ ?? a, u, t), Cw(a, o));
  });
}
function Cw(n, e) {
  if (
    n.modified_ &&
    !n.finalized_ &&
    (n.type_ === 3 || (n.assigned_?.size ?? 0) > 0)
  ) {
    const { patchPlugin_: i } = e;
    if (i) {
      const o = i.getPath(n);
      o && i.generatePatches_(n, o, e);
    }
    Rw(n);
  }
}
function MA(n, e, t) {
  const { scope_: i } = n;
  if (Ui(t)) {
    const o = t[In];
    qh(o, i) &&
      o.callbacks_.push(function () {
        Gc(n);
        const u = dm(o);
        Aw(n, t, u, e);
      });
  } else
    oi(t) &&
      n.callbacks_.push(function () {
        const a = Di(n);
        wp(a, e, n.type_) === t &&
          i.drafts_.length > 1 &&
          (n.assigned_.get(e) ?? !1) === !0 &&
          n.copy_ &&
          pm(wp(n.copy_, e, n.type_), i.handledSet_, i);
      });
}
function pm(n, e, t) {
  return (
    (!t.immer_.autoFreeze_ && t.unfinalizedDrafts_ < 1) ||
      Ui(n) ||
      e.has(n) ||
      !oi(n) ||
      Wh(n) ||
      (e.add(n),
      du(n, (i, o) => {
        if (Ui(o)) {
          const a = o[In];
          if (qh(a, t)) {
            const u = dm(a);
            (fh(n, i, u, n.type_), Rw(a));
          }
        } else oi(o) && pm(o, e, t);
      })),
    n
  );
}
function VA(n, e) {
  const t = Bh(n),
    i = {
      type_: t ? 1 : 0,
      scope_: e ? e.scope_ : Iw(),
      modified_: !1,
      finalized_: !1,
      assigned_: void 0,
      parent_: e,
      base_: n,
      draft_: null,
      copy_: null,
      revoke_: null,
      isManual_: !1,
      callbacks_: void 0,
    };
  let o = i,
    a = mm;
  t && ((o = [i]), (a = Jl));
  const { revoke: u, proxy: d } = Proxy.revocable(o, a);
  return ((i.draft_ = d), (i.revoke_ = u), [d, i]);
}
var mm = {
    get(n, e) {
      if (e === In) return n;
      const t = Di(n);
      if (!s_(t, e, n.type_)) return FA(n, t, e);
      const i = t[e];
      if (n.finalized_ || !oi(i)) return i;
      if (i === Jf(n.base_, e)) {
        Gc(n);
        const o = n.type_ === 1 ? +e : e,
          a = Ap(n.scope_, i, n, o);
        return (n.copy_[o] = a);
      }
      return i;
    },
    has(n, e) {
      return e in Di(n);
    },
    ownKeys(n) {
      return Reflect.ownKeys(Di(n));
    },
    set(n, e, t) {
      const i = Pw(Di(n), e);
      if (i?.set) return (i.set.call(n.draft_, t), !0);
      if (!n.modified_) {
        const o = Jf(Di(n), e),
          a = o?.[In];
        if (a && a.base_ === t)
          return ((n.copy_[e] = t), n.assigned_.set(e, !1), !0);
        if (PA(t, o) && (t !== void 0 || s_(n.base_, e, n.type_))) return !0;
        (Gc(n), Rp(n));
      }
      return (
        (n.copy_[e] === t && (t !== void 0 || e in n.copy_)) ||
          (Number.isNaN(t) && Number.isNaN(n.copy_[e])) ||
          ((n.copy_[e] = t), n.assigned_.set(e, !0), MA(n, e, t)),
        !0
      );
    },
    deleteProperty(n, e) {
      return (
        Gc(n),
        Jf(n.base_, e) !== void 0 || e in n.base_
          ? (n.assigned_.set(e, !1), Rp(n))
          : n.assigned_.delete(e),
        n.copy_ && delete n.copy_[e],
        !0
      );
    },
    getOwnPropertyDescriptor(n, e) {
      const t = Di(n),
        i = Reflect.getOwnPropertyDescriptor(t, e);
      return (
        i && {
          [Kc]: !0,
          [_p]: n.type_ !== 1 || e !== "length",
          [dh]: i[dh],
          [Yl]: t[e],
        }
      );
    },
    defineProperty() {
      xr(11);
    },
    getPrototypeOf(n) {
      return ba(n.base_);
    },
    setPrototypeOf() {
      xr(12);
    },
  },
  Jl = {};
du(mm, (n, e) => {
  Jl[n] = function () {
    const t = arguments;
    return ((t[0] = t[0][0]), e.apply(this, t));
  };
});
Jl.deleteProperty = function (n, e) {
  return Jl.set.call(this, n, e, void 0);
};
Jl.set = function (n, e, t) {
  return mm.set.call(this, n[0], e, t, n[0]);
};
function Jf(n, e) {
  const t = n[In];
  return (t ? Di(t) : n)[e];
}
function FA(n, e, t) {
  const i = Pw(e, t);
  return i ? (Yl in i ? i[Yl] : i.get?.call(n.draft_)) : void 0;
}
function Pw(n, e) {
  if (!(e in n)) return;
  let t = ba(n);
  for (; t; ) {
    const i = Object.getOwnPropertyDescriptor(t, e);
    if (i) return i;
    t = ba(t);
  }
}
function Rp(n) {
  n.modified_ || ((n.modified_ = !0), n.parent_ && Rp(n.parent_));
}
function Gc(n) {
  n.copy_ ||
    ((n.assigned_ = new Map()),
    (n.copy_ = Ep(n.base_, n.scope_.immer_.useStrictShallowCopy_)));
}
var UA = class {
  constructor(n) {
    ((this.autoFreeze_ = !0),
      (this.useStrictShallowCopy_ = !1),
      (this.useStrictIteration_ = !1),
      (this.produce = (e, t, i) => {
        if (_a(e) && !_a(t)) {
          const a = t;
          t = e;
          const u = this;
          return function (f = a, ...m) {
            return u.produce(f, (v) => t.call(this, v, ...m));
          };
        }
        (_a(t) || xr(6), i !== void 0 && !_a(i) && xr(7));
        let o;
        if (oi(e)) {
          const a = a_(this),
            u = Ap(a, e, void 0);
          let d = !0;
          try {
            ((o = t(u)), (d = !1));
          } finally {
            d ? Sp(a) : Ip(a);
          }
          return (o_(a, i), l_(o, a));
        } else if (!e || !hm(e)) {
          if (
            ((o = t(e)),
            o === void 0 && (o = e),
            o === Ew && (o = void 0),
            this.autoFreeze_ && fm(o, !0),
            i)
          ) {
            const a = [],
              u = [];
            (Da(Tp).generateReplacementPatches_(e, o, {
              patches_: a,
              inversePatches_: u,
            }),
              i(a, u));
          }
          return o;
        } else xr(1, e);
      }),
      (this.produceWithPatches = (e, t) => {
        if (_a(e))
          return (u, ...d) => this.produceWithPatches(u, (f) => e(f, ...d));
        let i, o;
        return [
          this.produce(e, t, (u, d) => {
            ((i = u), (o = d));
          }),
          i,
          o,
        ];
      }),
      Xf(n?.autoFreeze) && this.setAutoFreeze(n.autoFreeze),
      Xf(n?.useStrictShallowCopy) &&
        this.setUseStrictShallowCopy(n.useStrictShallowCopy),
      Xf(n?.useStrictIteration) &&
        this.setUseStrictIteration(n.useStrictIteration));
  }
  createDraft(n) {
    (oi(n) || xr(8), Ui(n) && (n = zA(n)));
    const e = a_(this),
      t = Ap(e, n, void 0);
    return ((t[In].isManual_ = !0), Ip(e), t);
  }
  finishDraft(n, e) {
    const t = n && n[In];
    (!t || !t.isManual_) && xr(9);
    const { scope_: i } = t;
    return (o_(i, e), l_(void 0, i));
  }
  setAutoFreeze(n) {
    this.autoFreeze_ = n;
  }
  setUseStrictShallowCopy(n) {
    this.useStrictShallowCopy_ = n;
  }
  setUseStrictIteration(n) {
    this.useStrictIteration_ = n;
  }
  shouldUseStrictIteration() {
    return this.useStrictIteration_;
  }
  applyPatches(n, e) {
    let t;
    for (t = e.length - 1; t >= 0; t--) {
      const o = e[t];
      if (o.path.length === 0 && o.op === "replace") {
        n = o.value;
        break;
      }
    }
    t > -1 && (e = e.slice(t + 1));
    const i = Da(Tp).applyPatches_;
    return Ui(n) ? i(n, e) : this.produce(n, (o) => i(o, e));
  }
};
function Ap(n, e, t, i) {
  const [o, a] = $h(e)
    ? Da(ph).proxyMap_(e, t)
    : Hh(e)
      ? Da(ph).proxySet_(e, t)
      : VA(e, t);
  return (
    (t?.scope_ ?? Iw()).drafts_.push(o),
    (a.callbacks_ = t?.callbacks_ ?? []),
    (a.key_ = i),
    t && i !== void 0
      ? LA(t, a, i)
      : a.callbacks_.push(function (f) {
          f.mapSetPlugin_?.fixSetContents(a);
          const { patchPlugin_: m } = f;
          a.modified_ && m && m.generatePatches_(a, [], f);
        }),
    o
  );
}
function zA(n) {
  return (Ui(n) || xr(10, n), kw(n));
}
function kw(n) {
  if (!oi(n) || Wh(n)) return n;
  const e = n[In];
  let t,
    i = !0;
  if (e) {
    if (!e.modified_) return e.base_;
    ((e.finalized_ = !0),
      (t = Ep(n, e.scope_.immer_.useStrictShallowCopy_)),
      (i = e.scope_.immer_.shouldUseStrictIteration()));
  } else t = Ep(n, !0);
  return (
    du(
      t,
      (o, a) => {
        fh(t, o, kw(a));
      },
      i,
    ),
    e && (e.finalized_ = !1),
    t
  );
}
var jA = new UA(),
  xw = jA.produce;
function BA(n, e = `expected a function, instead received ${typeof n}`) {
  if (typeof n != "function") throw new TypeError(e);
}
function $A(n, e = `expected an object, instead received ${typeof n}`) {
  if (typeof n != "object") throw new TypeError(e);
}
function HA(
  n,
  e = "expected all items to be functions, instead received the following types: ",
) {
  if (!n.every((t) => typeof t == "function")) {
    const t = n
      .map((i) =>
        typeof i == "function" ? `function ${i.name || "unnamed"}()` : typeof i,
      )
      .join(", ");
    throw new TypeError(`${e}[${t}]`);
  }
}
var c_ = (n) => (Array.isArray(n) ? n : [n]);
function WA(n) {
  const e = Array.isArray(n[0]) ? n[0] : n;
  return (
    HA(
      e,
      "createSelector expects all input-selectors to be functions, but received the following types: ",
    ),
    e
  );
}
function qA(n, e) {
  const t = [],
    { length: i } = n;
  for (let o = 0; o < i; o++) t.push(n[o].apply(null, e));
  return t;
}
var KA = class {
    constructor(n) {
      this.value = n;
    }
    deref() {
      return this.value;
    }
  },
  GA = typeof WeakRef < "u" ? WeakRef : KA,
  QA = 0,
  h_ = 1;
function Oc() {
  return { s: QA, v: void 0, o: null, p: null };
}
function bw(n, e = {}) {
  let t = Oc();
  const { resultEqualityCheck: i } = e;
  let o,
    a = 0;
  function u() {
    let d = t;
    const { length: f } = arguments;
    for (let w = 0, T = f; w < T; w++) {
      const A = arguments[w];
      if (typeof A == "function" || (typeof A == "object" && A !== null)) {
        let D = d.o;
        D === null && (d.o = D = new WeakMap());
        const j = D.get(A);
        j === void 0 ? ((d = Oc()), D.set(A, d)) : (d = j);
      } else {
        let D = d.p;
        D === null && (d.p = D = new Map());
        const j = D.get(A);
        j === void 0 ? ((d = Oc()), D.set(A, d)) : (d = j);
      }
    }
    const m = d;
    let v;
    if (d.s === h_) v = d.v;
    else if (((v = n.apply(null, arguments)), a++, i)) {
      const w = o?.deref?.() ?? o;
      (w != null && i(w, v) && ((v = w), a !== 0 && a--),
        (o =
          (typeof v == "object" && v !== null) || typeof v == "function"
            ? new GA(v)
            : v));
    }
    return ((m.s = h_), (m.v = v), v);
  }
  return (
    (u.clearCache = () => {
      ((t = Oc()), u.resetResultsCount());
    }),
    (u.resultsCount = () => a),
    (u.resetResultsCount = () => {
      a = 0;
    }),
    u
  );
}
function YA(n, ...e) {
  const t = typeof n == "function" ? { memoize: n, memoizeOptions: e } : n,
    i = (...o) => {
      let a = 0,
        u = 0,
        d,
        f = {},
        m = o.pop();
      (typeof m == "object" && ((f = m), (m = o.pop())),
        BA(
          m,
          `createSelector expects an output function after the inputs, but received: [${typeof m}]`,
        ));
      const v = { ...t, ...f },
        {
          memoize: w,
          memoizeOptions: T = [],
          argsMemoize: A = bw,
          argsMemoizeOptions: D = [],
        } = v,
        j = c_(T),
        O = c_(D),
        X = WA(o),
        q = w(
          function () {
            return (a++, m.apply(null, arguments));
          },
          ...j,
        ),
        G = A(
          function () {
            u++;
            const ee = qA(X, arguments);
            return ((d = q.apply(null, ee)), d);
          },
          ...O,
        );
      return Object.assign(G, {
        resultFunc: m,
        memoizedResultFunc: q,
        dependencies: X,
        dependencyRecomputations: () => u,
        resetDependencyRecomputations: () => {
          u = 0;
        },
        lastResult: () => d,
        recomputations: () => a,
        resetRecomputations: () => {
          a = 0;
        },
        memoize: w,
        argsMemoize: A,
      });
    };
  return (Object.assign(i, { withTypes: () => i }), i);
}
var Dw = YA(bw),
  XA = Object.assign(
    (n, e = Dw) => {
      $A(
        n,
        `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof n}`,
      );
      const t = Object.keys(n),
        i = t.map((a) => n[a]);
      return e(i, (...a) => a.reduce((u, d, f) => ((u[t[f]] = d), u), {}));
    },
    { withTypes: () => XA },
  );
function Nw(n) {
  return ({ dispatch: t, getState: i }) =>
    (o) =>
    (a) =>
      typeof a == "function" ? a(t, i, n) : o(a);
}
var JA = Nw(),
  ZA = Nw,
  eC =
    typeof window < "u" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
      : function () {
          if (arguments.length !== 0)
            return typeof arguments[0] == "object"
              ? ch
              : ch.apply(null, arguments);
        },
  tC = (n) => n && typeof n.match == "function";
function Vl(n, e) {
  function t(...i) {
    if (e) {
      let o = e(...i);
      if (!o) throw new Error(Vi(0));
      return {
        type: n,
        payload: o.payload,
        ...("meta" in o && { meta: o.meta }),
        ...("error" in o && { error: o.error }),
      };
    }
    return { type: n, payload: i[0] };
  }
  return (
    (t.toString = () => `${n}`),
    (t.type = n),
    (t.match = (i) => AA(i) && i.type === n),
    t
  );
}
var Ow = class Dl extends Array {
  constructor(...e) {
    (super(...e), Object.setPrototypeOf(this, Dl.prototype));
  }
  static get [Symbol.species]() {
    return Dl;
  }
  concat(...e) {
    return super.concat.apply(this, e);
  }
  prepend(...e) {
    return e.length === 1 && Array.isArray(e[0])
      ? new Dl(...e[0].concat(this))
      : new Dl(...e.concat(this));
  }
};
function d_(n) {
  return oi(n) ? xw(n, () => {}) : n;
}
function Lc(n, e, t) {
  return n.has(e) ? n.get(e) : n.set(e, t(e)).get(e);
}
function nC(n) {
  return typeof n == "boolean";
}
var rC = () =>
    function (e) {
      const {
        thunk: t = !0,
        immutableCheck: i = !0,
        serializableCheck: o = !0,
        actionCreatorCheck: a = !0,
      } = e ?? {};
      let u = new Ow();
      return (t && (nC(t) ? u.push(JA) : u.push(ZA(t.extraArgument))), u);
    },
  iC = "RTK_autoBatch",
  f_ = (n) => (e) => {
    setTimeout(e, n);
  },
  sC =
    (n = { type: "raf" }) =>
    (e) =>
    (...t) => {
      const i = e(...t);
      let o = !0,
        a = !1,
        u = !1;
      const d = new Set(),
        f =
          n.type === "tick"
            ? queueMicrotask
            : n.type === "raf"
              ? typeof window < "u" && window.requestAnimationFrame
                ? window.requestAnimationFrame
                : f_(10)
              : n.type === "callback"
                ? n.queueNotification
                : f_(n.timeout),
        m = () => {
          ((u = !1), a && ((a = !1), d.forEach((v) => v())));
        };
      return Object.assign({}, i, {
        subscribe(v) {
          const w = () => o && v(),
            T = i.subscribe(w);
          return (
            d.add(v),
            () => {
              (T(), d.delete(v));
            }
          );
        },
        dispatch(v) {
          try {
            return (
              (o = !v?.meta?.[iC]),
              (a = !o),
              a && (u || ((u = !0), f(m))),
              i.dispatch(v)
            );
          } finally {
            o = !0;
          }
        },
      });
    },
  oC = (n) =>
    function (t) {
      const { autoBatch: i = !0 } = t ?? {};
      let o = new Ow(n);
      return (i && o.push(sC(typeof i == "object" ? i : void 0)), o);
    };
function aC(n) {
  const e = rC(),
    {
      reducer: t = void 0,
      middleware: i,
      devTools: o = !0,
      preloadedState: a = void 0,
      enhancers: u = void 0,
    } = n || {};
  let d;
  if (typeof t == "function") d = t;
  else if (cm(t)) d = IA(t);
  else throw new Error(Vi(1));
  let f;
  typeof i == "function" ? (f = i(e)) : (f = e());
  let m = ch;
  o && (m = eC({ trace: !1, ...(typeof o == "object" && o) }));
  const v = RA(...f),
    w = oC(v);
  let T = typeof u == "function" ? u(w) : w();
  const A = m(...T);
  return ww(d, a, A);
}
function Lw(n) {
  const e = {},
    t = [];
  let i;
  const o = {
    addCase(a, u) {
      const d = typeof a == "string" ? a : a.type;
      if (!d) throw new Error(Vi(28));
      if (d in e) throw new Error(Vi(29));
      return ((e[d] = u), o);
    },
    addAsyncThunk(a, u) {
      return (
        u.pending && (e[a.pending.type] = u.pending),
        u.rejected && (e[a.rejected.type] = u.rejected),
        u.fulfilled && (e[a.fulfilled.type] = u.fulfilled),
        u.settled && t.push({ matcher: a.settled, reducer: u.settled }),
        o
      );
    },
    addMatcher(a, u) {
      return (t.push({ matcher: a, reducer: u }), o);
    },
    addDefaultCase(a) {
      return ((i = a), o);
    },
  };
  return (n(o), [e, t, i]);
}
function lC(n) {
  return typeof n == "function";
}
function uC(n, e) {
  let [t, i, o] = Lw(e),
    a;
  if (lC(n)) a = () => d_(n());
  else {
    const d = d_(n);
    a = () => d;
  }
  function u(d = a(), f) {
    let m = [
      t[f.type],
      ...i.filter(({ matcher: v }) => v(f)).map(({ reducer: v }) => v),
    ];
    return (
      m.filter((v) => !!v).length === 0 && (m = [o]),
      m.reduce((v, w) => {
        if (w)
          if (Ui(v)) {
            const A = w(v, f);
            return A === void 0 ? v : A;
          } else {
            if (oi(v)) return xw(v, (T) => w(T, f));
            {
              const T = w(v, f);
              if (T === void 0) {
                if (v === null) return v;
                throw Error(
                  "A case reducer on a non-draftable value must not return undefined",
                );
              }
              return T;
            }
          }
        return v;
      }, d)
    );
  }
  return ((u.getInitialState = a), u);
}
var cC = (n, e) => (tC(n) ? n.match(e) : n(e));
function hC(...n) {
  return (e) => n.some((t) => cC(t, e));
}
var dC = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW",
  fC = (n = 21) => {
    let e = "",
      t = n;
    for (; t--; ) e += dC[(Math.random() * 64) | 0];
    return e;
  },
  pC = ["name", "message", "stack", "code"],
  Zf = class {
    constructor(n, e) {
      ((this.payload = n), (this.meta = e));
    }
    _type;
  },
  p_ = class {
    constructor(n, e) {
      ((this.payload = n), (this.meta = e));
    }
    _type;
  },
  mC = (n) => {
    if (typeof n == "object" && n !== null) {
      const e = {};
      for (const t of pC) typeof n[t] == "string" && (e[t] = n[t]);
      return e;
    }
    return { message: String(n) };
  },
  m_ = "External signal was aborted",
  Mw = (() => {
    function n(e, t, i) {
      const o = Vl(e + "/fulfilled", (f, m, v, w) => ({
          payload: f,
          meta: {
            ...(w || {}),
            arg: v,
            requestId: m,
            requestStatus: "fulfilled",
          },
        })),
        a = Vl(e + "/pending", (f, m, v) => ({
          payload: void 0,
          meta: {
            ...(v || {}),
            arg: m,
            requestId: f,
            requestStatus: "pending",
          },
        })),
        u = Vl(e + "/rejected", (f, m, v, w, T) => ({
          payload: w,
          error: ((i && i.serializeError) || mC)(f || "Rejected"),
          meta: {
            ...(T || {}),
            arg: v,
            requestId: m,
            rejectedWithValue: !!w,
            requestStatus: "rejected",
            aborted: f?.name === "AbortError",
            condition: f?.name === "ConditionError",
          },
        }));
      function d(f, { signal: m } = {}) {
        return (v, w, T) => {
          const A = i?.idGenerator ? i.idGenerator(f) : fC(),
            D = new AbortController();
          let j, O;
          function X(G) {
            ((O = G), D.abort());
          }
          m &&
            (m.aborted
              ? X(m_)
              : m.addEventListener("abort", () => X(m_), { once: !0 }));
          const q = (async function () {
            let G;
            try {
              let ee = i?.condition?.(f, { getState: w, extra: T });
              if ((yC(ee) && (ee = await ee), ee === !1 || D.signal.aborted))
                throw {
                  name: "ConditionError",
                  message: "Aborted due to condition callback returning false.",
                };
              const he = new Promise((S, R) => {
                ((j = () => {
                  R({ name: "AbortError", message: O || "Aborted" });
                }),
                  D.signal.addEventListener("abort", j));
              });
              (v(
                a(
                  A,
                  f,
                  i?.getPendingMeta?.(
                    { requestId: A, arg: f },
                    { getState: w, extra: T },
                  ),
                ),
              ),
                (G = await Promise.race([
                  he,
                  Promise.resolve(
                    t(f, {
                      dispatch: v,
                      getState: w,
                      extra: T,
                      requestId: A,
                      signal: D.signal,
                      abort: X,
                      rejectWithValue: (S, R) => new Zf(S, R),
                      fulfillWithValue: (S, R) => new p_(S, R),
                    }),
                  ).then((S) => {
                    if (S instanceof Zf) throw S;
                    return S instanceof p_
                      ? o(S.payload, A, f, S.meta)
                      : o(S, A, f);
                  }),
                ])));
            } catch (ee) {
              G =
                ee instanceof Zf
                  ? u(null, A, f, ee.payload, ee.meta)
                  : u(ee, A, f);
            } finally {
              j && D.signal.removeEventListener("abort", j);
            }
            return (
              (i &&
                !i.dispatchConditionRejection &&
                u.match(G) &&
                G.meta.condition) ||
                v(G),
              G
            );
          })();
          return Object.assign(q, {
            abort: X,
            requestId: A,
            arg: f,
            unwrap() {
              return q.then(gC);
            },
          });
        };
      }
      return Object.assign(d, {
        pending: a,
        rejected: u,
        fulfilled: o,
        settled: hC(u, o),
        typePrefix: e,
      });
    }
    return ((n.withTypes = () => n), n);
  })();
function gC(n) {
  if (n.meta && n.meta.rejectedWithValue) throw n.payload;
  if (n.error) throw n.error;
  return n.payload;
}
function yC(n) {
  return n !== null && typeof n == "object" && typeof n.then == "function";
}
var vC = Symbol.for("rtk-slice-createasyncthunk");
function _C(n, e) {
  return `${n}/${e}`;
}
function wC({ creators: n } = {}) {
  const e = n?.asyncThunk?.[vC];
  return function (i) {
    const { name: o, reducerPath: a = o } = i;
    if (!o) throw new Error(Vi(11));
    const u =
        (typeof i.reducers == "function" ? i.reducers(TC()) : i.reducers) || {},
      d = Object.keys(u),
      f = {
        sliceCaseReducersByName: {},
        sliceCaseReducersByType: {},
        actionCreators: {},
        sliceMatchers: [],
      },
      m = {
        addCase(G, ae) {
          const ee = typeof G == "string" ? G : G.type;
          if (!ee) throw new Error(Vi(12));
          if (ee in f.sliceCaseReducersByType) throw new Error(Vi(13));
          return ((f.sliceCaseReducersByType[ee] = ae), m);
        },
        addMatcher(G, ae) {
          return (f.sliceMatchers.push({ matcher: G, reducer: ae }), m);
        },
        exposeAction(G, ae) {
          return ((f.actionCreators[G] = ae), m);
        },
        exposeCaseReducer(G, ae) {
          return ((f.sliceCaseReducersByName[G] = ae), m);
        },
      };
    d.forEach((G) => {
      const ae = u[G],
        ee = {
          reducerName: G,
          type: _C(o, G),
          createNotation: typeof i.reducers == "function",
        };
      IC(ae) ? AC(ee, ae, m, e) : SC(ee, ae, m);
    });
    function v() {
      const [G = {}, ae = [], ee = void 0] =
          typeof i.extraReducers == "function"
            ? Lw(i.extraReducers)
            : [i.extraReducers],
        he = { ...G, ...f.sliceCaseReducersByType };
      return uC(i.initialState, (S) => {
        for (let R in he) S.addCase(R, he[R]);
        for (let R of f.sliceMatchers) S.addMatcher(R.matcher, R.reducer);
        for (let R of ae) S.addMatcher(R.matcher, R.reducer);
        ee && S.addDefaultCase(ee);
      });
    }
    const w = (G) => G,
      T = new Map(),
      A = new WeakMap();
    let D;
    function j(G, ae) {
      return (D || (D = v()), D(G, ae));
    }
    function O() {
      return (D || (D = v()), D.getInitialState());
    }
    function X(G, ae = !1) {
      function ee(S) {
        let R = S[G];
        return (typeof R > "u" && ae && (R = Lc(A, ee, O)), R);
      }
      function he(S = w) {
        const R = Lc(T, ae, () => new WeakMap());
        return Lc(R, S, () => {
          const C = {};
          for (const [x, L] of Object.entries(i.selectors ?? {}))
            C[x] = EC(L, S, () => Lc(A, S, O), ae);
          return C;
        });
      }
      return {
        reducerPath: G,
        getSelectors: he,
        get selectors() {
          return he(ee);
        },
        selectSlice: ee,
      };
    }
    const q = {
      name: o,
      reducer: j,
      actions: f.actionCreators,
      caseReducers: f.sliceCaseReducersByName,
      getInitialState: O,
      ...X(a),
      injectInto(G, { reducerPath: ae, ...ee } = {}) {
        const he = ae ?? a;
        return (
          G.inject({ reducerPath: he, reducer: j }, ee),
          { ...q, ...X(he, !0) }
        );
      },
    };
    return q;
  };
}
function EC(n, e, t, i) {
  function o(a, ...u) {
    let d = e(a);
    return (typeof d > "u" && i && (d = t()), n(d, ...u));
  }
  return ((o.unwrapped = n), o);
}
var gm = wC();
function TC() {
  function n(e, t) {
    return { _reducerDefinitionType: "asyncThunk", payloadCreator: e, ...t };
  }
  return (
    (n.withTypes = () => n),
    {
      reducer(e) {
        return Object.assign(
          {
            [e.name](...t) {
              return e(...t);
            },
          }[e.name],
          { _reducerDefinitionType: "reducer" },
        );
      },
      preparedReducer(e, t) {
        return {
          _reducerDefinitionType: "reducerWithPrepare",
          prepare: e,
          reducer: t,
        };
      },
      asyncThunk: n,
    }
  );
}
function SC({ type: n, reducerName: e, createNotation: t }, i, o) {
  let a, u;
  if ("reducer" in i) {
    if (t && !RC(i)) throw new Error(Vi(17));
    ((a = i.reducer), (u = i.prepare));
  } else a = i;
  o.addCase(n, a)
    .exposeCaseReducer(e, a)
    .exposeAction(e, u ? Vl(n, u) : Vl(n));
}
function IC(n) {
  return n._reducerDefinitionType === "asyncThunk";
}
function RC(n) {
  return n._reducerDefinitionType === "reducerWithPrepare";
}
function AC({ type: n, reducerName: e }, t, i, o) {
  if (!o) throw new Error(Vi(18));
  const {
      payloadCreator: a,
      fulfilled: u,
      pending: d,
      rejected: f,
      settled: m,
      options: v,
    } = t,
    w = o(n, a, v);
  (i.exposeAction(e, w),
    u && i.addCase(w.fulfilled, u),
    d && i.addCase(w.pending, d),
    f && i.addCase(w.rejected, f),
    m && i.addMatcher(w.settled, m),
    i.exposeCaseReducer(e, {
      fulfilled: u || Mc,
      pending: d || Mc,
      rejected: f || Mc,
      settled: m || Mc,
    }));
}
function Mc() {}
function Vi(n) {
  return `Minified Redux Toolkit error #${n}; visit https://redux-toolkit.js.org/Errors?code=${n} for the full message or use the non-minified dev environment for full errors. `;
}
const ym = "doggerz:userState",
  CC = () => {
    if (typeof window > "u") return null;
    try {
      const n = window.localStorage.getItem(ym);
      return n ? JSON.parse(n) : null;
    } catch (n) {
      return (
        console.warn("[userSlice] Failed to parse user from storage:", n),
        null
      );
    }
  },
  Pl = (n) => {
    if (!(typeof window > "u"))
      try {
        window.localStorage.setItem(ym, JSON.stringify(n));
      } catch (e) {
        console.warn("[userSlice] Failed to save user to storage:", e);
      }
  },
  PC = CC() || {
    id: null,
    displayName: "Trainer",
    email: null,
    avatarUrl: null,
    zip: null,
    coins: 0,
    streak: { current: 0, best: 0, lastPlayedAt: null },
    createdAt: null,
  },
  Vw = gm({
    name: "user",
    initialState: PC,
    reducers: {
      setUser(n, e) {
        const {
          id: t,
          displayName: i,
          email: o,
          avatarUrl: a,
          coins: u,
          streak: d,
          createdAt: f,
          zip: m,
        } = e.payload || {};
        ((n.id = t ?? n.id),
          (n.displayName = i ?? n.displayName),
          (n.email = o ?? n.email),
          (n.avatarUrl = a ?? n.avatarUrl),
          typeof u == "number" && (n.coins = u),
          d &&
            typeof d == "object" &&
            ((n.streak.current = d.current ?? n.streak.current),
            (n.streak.best = d.best ?? n.streak.best),
            (n.streak.lastPlayedAt = d.lastPlayedAt ?? n.streak.lastPlayedAt)),
          (n.createdAt = f ?? n.createdAt),
          m !== void 0 && (n.zip = m),
          Pl(n));
      },
      clearUser(n) {
        if (
          ((n.id = null),
          (n.displayName = "Trainer"),
          (n.email = null),
          (n.avatarUrl = null),
          (n.coins = 0),
          (n.streak = { current: 0, best: 0, lastPlayedAt: null }),
          (n.createdAt = null),
          (n.zip = null),
          typeof window < "u")
        )
          try {
            window.localStorage.removeItem(ym);
          } catch {}
      },
      addCoins(n, e) {
        const t = Number(e.payload || 0);
        Number.isFinite(t) &&
          ((n.coins = Math.max(0, (n.coins || 0) + t)), Pl(n));
      },
      setCoins(n, e) {
        const t = Number(e.payload || 0);
        Number.isFinite(t) && ((n.coins = Math.max(0, t)), Pl(n));
      },
      updateStreak(n, e) {
        const { current: t, best: i, lastPlayedAt: o } = e.payload || {};
        (typeof t == "number" && (n.streak.current = t),
          typeof i == "number" && (n.streak.best = i),
          o !== void 0 && (n.streak.lastPlayedAt = o),
          Pl(n));
      },
      setZip(n, e) {
        const t = String(e.payload || "").trim(),
          i = /^[0-9]{5}$/.test(t) ? t : null;
        ((n.zip = i), Pl(n));
      },
    },
  }),
  {
    setUser: $O,
    clearUser: HO,
    addCoins: WO,
    setCoins: qO,
    updateStreak: KO,
    setZip: GO,
  } = Vw.actions,
  kC = (n) => n.user,
  xC = Vw.reducer;
function Cp({ children: n }) {
  const e = gA(kC),
    t = Or();
  return e
    ? n
    : Y.jsx(gp, {
        to: "/login",
        replace: !0,
        state: { from: t.pathname || "/" },
      });
}
Cp.propTypes = { children: vp.node.isRequired };
const Fw = z.createContext(null);
function bC() {
  return z.useContext(Fw);
}
function DC({ children: n }) {
  const [e, t] = z.useState([]),
    i = z.useCallback((a, u = {}) => {
      const d = Date.now() + Math.random(),
        f = { id: d, message: a, ...u };
      t((v) => [f, ...v]);
      const m = u.duration || 3e3;
      setTimeout(() => t((v) => v.filter((w) => w.id !== d)), m);
    }, []),
    o = z.useCallback((a) => t((u) => u.filter((d) => d.id !== a)), []);
  return Y.jsxs(Fw.Provider, {
    value: { add: i, remove: o },
    children: [
      n,
      Y.jsx("div", {
        "aria-live": "polite",
        className:
          "pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2",
        children: e.map((a) =>
          Y.jsx(
            "div",
            {
              className:
                "pointer-events-auto max-w-xs rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 shadow-md",
              role: "status",
              children: a.message,
            },
            a.id,
          ),
        ),
      }),
    ],
  });
}
const NC = () => {};
var g_ = {};
const Uw = function (n) {
    const e = [];
    let t = 0;
    for (let i = 0; i < n.length; i++) {
      let o = n.charCodeAt(i);
      o < 128
        ? (e[t++] = o)
        : o < 2048
          ? ((e[t++] = (o >> 6) | 192), (e[t++] = (o & 63) | 128))
          : (o & 64512) === 55296 &&
              i + 1 < n.length &&
              (n.charCodeAt(i + 1) & 64512) === 56320
            ? ((o = 65536 + ((o & 1023) << 10) + (n.charCodeAt(++i) & 1023)),
              (e[t++] = (o >> 18) | 240),
              (e[t++] = ((o >> 12) & 63) | 128),
              (e[t++] = ((o >> 6) & 63) | 128),
              (e[t++] = (o & 63) | 128))
            : ((e[t++] = (o >> 12) | 224),
              (e[t++] = ((o >> 6) & 63) | 128),
              (e[t++] = (o & 63) | 128));
    }
    return e;
  },
  OC = function (n) {
    const e = [];
    let t = 0,
      i = 0;
    for (; t < n.length; ) {
      const o = n[t++];
      if (o < 128) e[i++] = String.fromCharCode(o);
      else if (o > 191 && o < 224) {
        const a = n[t++];
        e[i++] = String.fromCharCode(((o & 31) << 6) | (a & 63));
      } else if (o > 239 && o < 365) {
        const a = n[t++],
          u = n[t++],
          d = n[t++],
          f =
            (((o & 7) << 18) | ((a & 63) << 12) | ((u & 63) << 6) | (d & 63)) -
            65536;
        ((e[i++] = String.fromCharCode(55296 + (f >> 10))),
          (e[i++] = String.fromCharCode(56320 + (f & 1023))));
      } else {
        const a = n[t++],
          u = n[t++];
        e[i++] = String.fromCharCode(
          ((o & 15) << 12) | ((a & 63) << 6) | (u & 63),
        );
      }
    }
    return e.join("");
  },
  zw = {
    byteToCharMap_: null,
    charToByteMap_: null,
    byteToCharMapWebSafe_: null,
    charToByteMapWebSafe_: null,
    ENCODED_VALS_BASE:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    get ENCODED_VALS() {
      return this.ENCODED_VALS_BASE + "+/=";
    },
    get ENCODED_VALS_WEBSAFE() {
      return this.ENCODED_VALS_BASE + "-_.";
    },
    HAS_NATIVE_SUPPORT: typeof atob == "function",
    encodeByteArray(n, e) {
      if (!Array.isArray(n))
        throw Error("encodeByteArray takes an array as a parameter");
      this.init_();
      const t = e ? this.byteToCharMapWebSafe_ : this.byteToCharMap_,
        i = [];
      for (let o = 0; o < n.length; o += 3) {
        const a = n[o],
          u = o + 1 < n.length,
          d = u ? n[o + 1] : 0,
          f = o + 2 < n.length,
          m = f ? n[o + 2] : 0,
          v = a >> 2,
          w = ((a & 3) << 4) | (d >> 4);
        let T = ((d & 15) << 2) | (m >> 6),
          A = m & 63;
        (f || ((A = 64), u || (T = 64)), i.push(t[v], t[w], t[T], t[A]));
      }
      return i.join("");
    },
    encodeString(n, e) {
      return this.HAS_NATIVE_SUPPORT && !e
        ? btoa(n)
        : this.encodeByteArray(Uw(n), e);
    },
    decodeString(n, e) {
      return this.HAS_NATIVE_SUPPORT && !e
        ? atob(n)
        : OC(this.decodeStringToByteArray(n, e));
    },
    decodeStringToByteArray(n, e) {
      this.init_();
      const t = e ? this.charToByteMapWebSafe_ : this.charToByteMap_,
        i = [];
      for (let o = 0; o < n.length; ) {
        const a = t[n.charAt(o++)],
          d = o < n.length ? t[n.charAt(o)] : 0;
        ++o;
        const m = o < n.length ? t[n.charAt(o)] : 64;
        ++o;
        const w = o < n.length ? t[n.charAt(o)] : 64;
        if ((++o, a == null || d == null || m == null || w == null))
          throw new LC();
        const T = (a << 2) | (d >> 4);
        if ((i.push(T), m !== 64)) {
          const A = ((d << 4) & 240) | (m >> 2);
          if ((i.push(A), w !== 64)) {
            const D = ((m << 6) & 192) | w;
            i.push(D);
          }
        }
      }
      return i;
    },
    init_() {
      if (!this.byteToCharMap_) {
        ((this.byteToCharMap_ = {}),
          (this.charToByteMap_ = {}),
          (this.byteToCharMapWebSafe_ = {}),
          (this.charToByteMapWebSafe_ = {}));
        for (let n = 0; n < this.ENCODED_VALS.length; n++)
          ((this.byteToCharMap_[n] = this.ENCODED_VALS.charAt(n)),
            (this.charToByteMap_[this.byteToCharMap_[n]] = n),
            (this.byteToCharMapWebSafe_[n] =
              this.ENCODED_VALS_WEBSAFE.charAt(n)),
            (this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[n]] = n),
            n >= this.ENCODED_VALS_BASE.length &&
              ((this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(n)] = n),
              (this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(n)] = n)));
      }
    },
  };
class LC extends Error {
  constructor() {
    (super(...arguments), (this.name = "DecodeBase64StringError"));
  }
}
const MC = function (n) {
    const e = Uw(n);
    return zw.encodeByteArray(e, !0);
  },
  mh = function (n) {
    return MC(n).replace(/\./g, "");
  },
  jw = function (n) {
    try {
      return zw.decodeString(n, !0);
    } catch (e) {
      console.error("base64Decode failed: ", e);
    }
    return null;
  };
function VC() {
  if (typeof self < "u") return self;
  if (typeof window < "u") return window;
  if (typeof global < "u") return global;
  throw new Error("Unable to locate global object.");
}
const FC = () => VC().__FIREBASE_DEFAULTS__,
  UC = () => {
    if (typeof process > "u" || typeof g_ > "u") return;
    const n = g_.__FIREBASE_DEFAULTS__;
    if (n) return JSON.parse(n);
  },
  zC = () => {
    if (typeof document > "u") return;
    let n;
    try {
      n = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
    } catch {
      return;
    }
    const e = n && jw(n[1]);
    return e && JSON.parse(e);
  },
  Kh = () => {
    try {
      return NC() || FC() || UC() || zC();
    } catch (n) {
      console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${n}`);
      return;
    }
  },
  Bw = (n) => {
    var e, t;
    return (t =
      (e = Kh()) === null || e === void 0 ? void 0 : e.emulatorHosts) ===
      null || t === void 0
      ? void 0
      : t[n];
  },
  jC = (n) => {
    const e = Bw(n);
    if (!e) return;
    const t = e.lastIndexOf(":");
    if (t <= 0 || t + 1 === e.length)
      throw new Error(`Invalid host ${e} with no separate hostname and port!`);
    const i = parseInt(e.substring(t + 1), 10);
    return e[0] === "[" ? [e.substring(1, t - 1), i] : [e.substring(0, t), i];
  },
  $w = () => {
    var n;
    return (n = Kh()) === null || n === void 0 ? void 0 : n.config;
  },
  Hw = (n) => {
    var e;
    return (e = Kh()) === null || e === void 0 ? void 0 : e[`_${n}`];
  };
class BC {
  constructor() {
    ((this.reject = () => {}),
      (this.resolve = () => {}),
      (this.promise = new Promise((e, t) => {
        ((this.resolve = e), (this.reject = t));
      })));
  }
  wrapCallback(e) {
    return (t, i) => {
      (t ? this.reject(t) : this.resolve(i),
        typeof e == "function" &&
          (this.promise.catch(() => {}), e.length === 1 ? e(t) : e(t, i)));
    };
  }
}
function ja(n) {
  try {
    return (
      n.startsWith("http://") || n.startsWith("https://")
        ? new URL(n).hostname
        : n
    ).endsWith(".cloudworkstations.dev");
  } catch {
    return !1;
  }
}
async function Ww(n) {
  return (await fetch(n, { credentials: "include" })).ok;
}
function $C(n, e) {
  if (n.uid)
    throw new Error(
      'The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.',
    );
  const t = { alg: "none", type: "JWT" },
    i = e || "demo-project",
    o = n.iat || 0,
    a = n.sub || n.user_id;
  if (!a)
    throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
  const u = Object.assign(
    {
      iss: `https://securetoken.google.com/${i}`,
      aud: i,
      iat: o,
      exp: o + 3600,
      auth_time: o,
      sub: a,
      user_id: a,
      firebase: { sign_in_provider: "custom", identities: {} },
    },
    n,
  );
  return [mh(JSON.stringify(t)), mh(JSON.stringify(u)), ""].join(".");
}
const Fl = {};
function HC() {
  const n = { prod: [], emulator: [] };
  for (const e of Object.keys(Fl)) Fl[e] ? n.emulator.push(e) : n.prod.push(e);
  return n;
}
function WC(n) {
  let e = document.getElementById(n),
    t = !1;
  return (
    e ||
      ((e = document.createElement("div")), e.setAttribute("id", n), (t = !0)),
    { created: t, element: e }
  );
}
let y_ = !1;
function qw(n, e) {
  if (
    typeof window > "u" ||
    typeof document > "u" ||
    !ja(window.location.host) ||
    Fl[n] === e ||
    Fl[n] ||
    y_
  )
    return;
  Fl[n] = e;
  function t(T) {
    return `__firebase__banner__${T}`;
  }
  const i = "__firebase__banner",
    a = HC().prod.length > 0;
  function u() {
    const T = document.getElementById(i);
    T && T.remove();
  }
  function d(T) {
    ((T.style.display = "flex"),
      (T.style.background = "#7faaf0"),
      (T.style.position = "fixed"),
      (T.style.bottom = "5px"),
      (T.style.left = "5px"),
      (T.style.padding = ".5em"),
      (T.style.borderRadius = "5px"),
      (T.style.alignItems = "center"));
  }
  function f(T, A) {
    (T.setAttribute("width", "24"),
      T.setAttribute("id", A),
      T.setAttribute("height", "24"),
      T.setAttribute("viewBox", "0 0 24 24"),
      T.setAttribute("fill", "none"),
      (T.style.marginLeft = "-6px"));
  }
  function m() {
    const T = document.createElement("span");
    return (
      (T.style.cursor = "pointer"),
      (T.style.marginLeft = "16px"),
      (T.style.fontSize = "24px"),
      (T.innerHTML = " &times;"),
      (T.onclick = () => {
        ((y_ = !0), u());
      }),
      T
    );
  }
  function v(T, A) {
    (T.setAttribute("id", A),
      (T.innerText = "Learn more"),
      (T.href =
        "https://firebase.google.com/docs/studio/preview-apps#preview-backend"),
      T.setAttribute("target", "__blank"),
      (T.style.paddingLeft = "5px"),
      (T.style.textDecoration = "underline"));
  }
  function w() {
    const T = WC(i),
      A = t("text"),
      D = document.getElementById(A) || document.createElement("span"),
      j = t("learnmore"),
      O = document.getElementById(j) || document.createElement("a"),
      X = t("preprendIcon"),
      q =
        document.getElementById(X) ||
        document.createElementNS("http://www.w3.org/2000/svg", "svg");
    if (T.created) {
      const G = T.element;
      (d(G), v(O, j));
      const ae = m();
      (f(q, X), G.append(q, D, O, ae), document.body.appendChild(G));
    }
    (a
      ? ((D.innerText = "Preview backend disconnected."),
        (q.innerHTML = `<g clip-path="url(#clip0_6013_33858)">
<path d="M4.8 17.6L12 5.6L19.2 17.6H4.8ZM6.91667 16.4H17.0833L12 7.93333L6.91667 16.4ZM12 15.6C12.1667 15.6 12.3056 15.5444 12.4167 15.4333C12.5389 15.3111 12.6 15.1667 12.6 15C12.6 14.8333 12.5389 14.6944 12.4167 14.5833C12.3056 14.4611 12.1667 14.4 12 14.4C11.8333 14.4 11.6889 14.4611 11.5667 14.5833C11.4556 14.6944 11.4 14.8333 11.4 15C11.4 15.1667 11.4556 15.3111 11.5667 15.4333C11.6889 15.5444 11.8333 15.6 12 15.6ZM11.4 13.6H12.6V10.4H11.4V13.6Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6013_33858">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`))
      : ((q.innerHTML = `<g clip-path="url(#clip0_6083_34804)">
<path d="M11.4 15.2H12.6V11.2H11.4V15.2ZM12 10C12.1667 10 12.3056 9.94444 12.4167 9.83333C12.5389 9.71111 12.6 9.56667 12.6 9.4C12.6 9.23333 12.5389 9.09444 12.4167 8.98333C12.3056 8.86111 12.1667 8.8 12 8.8C11.8333 8.8 11.6889 8.86111 11.5667 8.98333C11.4556 9.09444 11.4 9.23333 11.4 9.4C11.4 9.56667 11.4556 9.71111 11.5667 9.83333C11.6889 9.94444 11.8333 10 12 10ZM12 18.4C11.1222 18.4 10.2944 18.2333 9.51667 17.9C8.73889 17.5667 8.05556 17.1111 7.46667 16.5333C6.88889 15.9444 6.43333 15.2611 6.1 14.4833C5.76667 13.7056 5.6 12.8778 5.6 12C5.6 11.1111 5.76667 10.2833 6.1 9.51667C6.43333 8.73889 6.88889 8.06111 7.46667 7.48333C8.05556 6.89444 8.73889 6.43333 9.51667 6.1C10.2944 5.76667 11.1222 5.6 12 5.6C12.8889 5.6 13.7167 5.76667 14.4833 6.1C15.2611 6.43333 15.9389 6.89444 16.5167 7.48333C17.1056 8.06111 17.5667 8.73889 17.9 9.51667C18.2333 10.2833 18.4 11.1111 18.4 12C18.4 12.8778 18.2333 13.7056 17.9 14.4833C17.5667 15.2611 17.1056 15.9444 16.5167 16.5333C15.9389 17.1111 15.2611 17.5667 14.4833 17.9C13.7167 18.2333 12.8889 18.4 12 18.4ZM12 17.2C13.4444 17.2 14.6722 16.6944 15.6833 15.6833C16.6944 14.6722 17.2 13.4444 17.2 12C17.2 10.5556 16.6944 9.32778 15.6833 8.31667C14.6722 7.30555 13.4444 6.8 12 6.8C10.5556 6.8 9.32778 7.30555 8.31667 8.31667C7.30556 9.32778 6.8 10.5556 6.8 12C6.8 13.4444 7.30556 14.6722 8.31667 15.6833C9.32778 16.6944 10.5556 17.2 12 17.2Z" fill="#212121"/>
</g>
<defs>
<clipPath id="clip0_6083_34804">
<rect width="24" height="24" fill="white"/>
</clipPath>
</defs>`),
        (D.innerText = "Preview backend running in this workspace.")),
      D.setAttribute("id", A));
  }
  document.readyState === "loading"
    ? window.addEventListener("DOMContentLoaded", w)
    : w();
}
function yn() {
  return typeof navigator < "u" && typeof navigator.userAgent == "string"
    ? navigator.userAgent
    : "";
}
function qC() {
  return (
    typeof window < "u" &&
    !!(window.cordova || window.phonegap || window.PhoneGap) &&
    /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(yn())
  );
}
function KC() {
  var n;
  const e = (n = Kh()) === null || n === void 0 ? void 0 : n.forceEnvironment;
  if (e === "node") return !0;
  if (e === "browser") return !1;
  try {
    return (
      Object.prototype.toString.call(global.process) === "[object process]"
    );
  } catch {
    return !1;
  }
}
function GC() {
  return typeof navigator < "u" && navigator.userAgent === "Cloudflare-Workers";
}
function QC() {
  const n =
    typeof chrome == "object"
      ? chrome.runtime
      : typeof browser == "object"
        ? browser.runtime
        : void 0;
  return typeof n == "object" && n.id !== void 0;
}
function YC() {
  return typeof navigator == "object" && navigator.product === "ReactNative";
}
function XC() {
  const n = yn();
  return n.indexOf("MSIE ") >= 0 || n.indexOf("Trident/") >= 0;
}
function JC() {
  return (
    !KC() &&
    !!navigator.userAgent &&
    navigator.userAgent.includes("Safari") &&
    !navigator.userAgent.includes("Chrome")
  );
}
function ZC() {
  try {
    return typeof indexedDB == "object";
  } catch {
    return !1;
  }
}
function eP() {
  return new Promise((n, e) => {
    try {
      let t = !0;
      const i = "validate-browser-context-for-indexeddb-analytics-module",
        o = self.indexedDB.open(i);
      ((o.onsuccess = () => {
        (o.result.close(), t || self.indexedDB.deleteDatabase(i), n(!0));
      }),
        (o.onupgradeneeded = () => {
          t = !1;
        }),
        (o.onerror = () => {
          var a;
          e(
            ((a = o.error) === null || a === void 0 ? void 0 : a.message) || "",
          );
        }));
    } catch (t) {
      e(t);
    }
  });
}
const tP = "FirebaseError";
class qi extends Error {
  constructor(e, t, i) {
    (super(t),
      (this.code = e),
      (this.customData = i),
      (this.name = tP),
      Object.setPrototypeOf(this, qi.prototype),
      Error.captureStackTrace &&
        Error.captureStackTrace(this, pu.prototype.create));
  }
}
class pu {
  constructor(e, t, i) {
    ((this.service = e), (this.serviceName = t), (this.errors = i));
  }
  create(e, ...t) {
    const i = t[0] || {},
      o = `${this.service}/${e}`,
      a = this.errors[e],
      u = a ? nP(a, i) : "Error",
      d = `${this.serviceName}: ${u} (${o}).`;
    return new qi(o, d, i);
  }
}
function nP(n, e) {
  return n.replace(rP, (t, i) => {
    const o = e[i];
    return o != null ? String(o) : `<${i}?>`;
  });
}
const rP = /\{\$([^}]+)}/g;
function iP(n) {
  for (const e in n) if (Object.prototype.hasOwnProperty.call(n, e)) return !1;
  return !0;
}
function Co(n, e) {
  if (n === e) return !0;
  const t = Object.keys(n),
    i = Object.keys(e);
  for (const o of t) {
    if (!i.includes(o)) return !1;
    const a = n[o],
      u = e[o];
    if (v_(a) && v_(u)) {
      if (!Co(a, u)) return !1;
    } else if (a !== u) return !1;
  }
  for (const o of i) if (!t.includes(o)) return !1;
  return !0;
}
function v_(n) {
  return n !== null && typeof n == "object";
}
function mu(n) {
  const e = [];
  for (const [t, i] of Object.entries(n))
    Array.isArray(i)
      ? i.forEach((o) => {
          e.push(encodeURIComponent(t) + "=" + encodeURIComponent(o));
        })
      : e.push(encodeURIComponent(t) + "=" + encodeURIComponent(i));
  return e.length ? "&" + e.join("&") : "";
}
function sP(n, e) {
  const t = new oP(n, e);
  return t.subscribe.bind(t);
}
class oP {
  constructor(e, t) {
    ((this.observers = []),
      (this.unsubscribes = []),
      (this.observerCount = 0),
      (this.task = Promise.resolve()),
      (this.finalized = !1),
      (this.onNoObservers = t),
      this.task
        .then(() => {
          e(this);
        })
        .catch((i) => {
          this.error(i);
        }));
  }
  next(e) {
    this.forEachObserver((t) => {
      t.next(e);
    });
  }
  error(e) {
    (this.forEachObserver((t) => {
      t.error(e);
    }),
      this.close(e));
  }
  complete() {
    (this.forEachObserver((e) => {
      e.complete();
    }),
      this.close());
  }
  subscribe(e, t, i) {
    let o;
    if (e === void 0 && t === void 0 && i === void 0)
      throw new Error("Missing Observer.");
    (aP(e, ["next", "error", "complete"])
      ? (o = e)
      : (o = { next: e, error: t, complete: i }),
      o.next === void 0 && (o.next = ep),
      o.error === void 0 && (o.error = ep),
      o.complete === void 0 && (o.complete = ep));
    const a = this.unsubscribeOne.bind(this, this.observers.length);
    return (
      this.finalized &&
        this.task.then(() => {
          try {
            this.finalError ? o.error(this.finalError) : o.complete();
          } catch {}
        }),
      this.observers.push(o),
      a
    );
  }
  unsubscribeOne(e) {
    this.observers === void 0 ||
      this.observers[e] === void 0 ||
      (delete this.observers[e],
      (this.observerCount -= 1),
      this.observerCount === 0 &&
        this.onNoObservers !== void 0 &&
        this.onNoObservers(this));
  }
  forEachObserver(e) {
    if (!this.finalized)
      for (let t = 0; t < this.observers.length; t++) this.sendOne(t, e);
  }
  sendOne(e, t) {
    this.task.then(() => {
      if (this.observers !== void 0 && this.observers[e] !== void 0)
        try {
          t(this.observers[e]);
        } catch (i) {
          typeof console < "u" && console.error && console.error(i);
        }
    });
  }
  close(e) {
    this.finalized ||
      ((this.finalized = !0),
      e !== void 0 && (this.finalError = e),
      this.task.then(() => {
        ((this.observers = void 0), (this.onNoObservers = void 0));
      }));
  }
}
function aP(n, e) {
  if (typeof n != "object" || n === null) return !1;
  for (const t of e) if (t in n && typeof n[t] == "function") return !0;
  return !1;
}
function ep() {}
function ai(n) {
  return n && n._delegate ? n._delegate : n;
}
class Po {
  constructor(e, t, i) {
    ((this.name = e),
      (this.instanceFactory = t),
      (this.type = i),
      (this.multipleInstances = !1),
      (this.serviceProps = {}),
      (this.instantiationMode = "LAZY"),
      (this.onInstanceCreated = null));
  }
  setInstantiationMode(e) {
    return ((this.instantiationMode = e), this);
  }
  setMultipleInstances(e) {
    return ((this.multipleInstances = e), this);
  }
  setServiceProps(e) {
    return ((this.serviceProps = e), this);
  }
  setInstanceCreatedCallback(e) {
    return ((this.onInstanceCreated = e), this);
  }
}
const To = "[DEFAULT]";
class lP {
  constructor(e, t) {
    ((this.name = e),
      (this.container = t),
      (this.component = null),
      (this.instances = new Map()),
      (this.instancesDeferred = new Map()),
      (this.instancesOptions = new Map()),
      (this.onInitCallbacks = new Map()));
  }
  get(e) {
    const t = this.normalizeInstanceIdentifier(e);
    if (!this.instancesDeferred.has(t)) {
      const i = new BC();
      if (
        (this.instancesDeferred.set(t, i),
        this.isInitialized(t) || this.shouldAutoInitialize())
      )
        try {
          const o = this.getOrInitializeService({ instanceIdentifier: t });
          o && i.resolve(o);
        } catch {}
    }
    return this.instancesDeferred.get(t).promise;
  }
  getImmediate(e) {
    var t;
    const i = this.normalizeInstanceIdentifier(e?.identifier),
      o = (t = e?.optional) !== null && t !== void 0 ? t : !1;
    if (this.isInitialized(i) || this.shouldAutoInitialize())
      try {
        return this.getOrInitializeService({ instanceIdentifier: i });
      } catch (a) {
        if (o) return null;
        throw a;
      }
    else {
      if (o) return null;
      throw Error(`Service ${this.name} is not available`);
    }
  }
  getComponent() {
    return this.component;
  }
  setComponent(e) {
    if (e.name !== this.name)
      throw Error(`Mismatching Component ${e.name} for Provider ${this.name}.`);
    if (this.component)
      throw Error(`Component for ${this.name} has already been provided`);
    if (((this.component = e), !!this.shouldAutoInitialize())) {
      if (cP(e))
        try {
          this.getOrInitializeService({ instanceIdentifier: To });
        } catch {}
      for (const [t, i] of this.instancesDeferred.entries()) {
        const o = this.normalizeInstanceIdentifier(t);
        try {
          const a = this.getOrInitializeService({ instanceIdentifier: o });
          i.resolve(a);
        } catch {}
      }
    }
  }
  clearInstance(e = To) {
    (this.instancesDeferred.delete(e),
      this.instancesOptions.delete(e),
      this.instances.delete(e));
  }
  async delete() {
    const e = Array.from(this.instances.values());
    await Promise.all([
      ...e.filter((t) => "INTERNAL" in t).map((t) => t.INTERNAL.delete()),
      ...e.filter((t) => "_delete" in t).map((t) => t._delete()),
    ]);
  }
  isComponentSet() {
    return this.component != null;
  }
  isInitialized(e = To) {
    return this.instances.has(e);
  }
  getOptions(e = To) {
    return this.instancesOptions.get(e) || {};
  }
  initialize(e = {}) {
    const { options: t = {} } = e,
      i = this.normalizeInstanceIdentifier(e.instanceIdentifier);
    if (this.isInitialized(i))
      throw Error(`${this.name}(${i}) has already been initialized`);
    if (!this.isComponentSet())
      throw Error(`Component ${this.name} has not been registered yet`);
    const o = this.getOrInitializeService({
      instanceIdentifier: i,
      options: t,
    });
    for (const [a, u] of this.instancesDeferred.entries()) {
      const d = this.normalizeInstanceIdentifier(a);
      i === d && u.resolve(o);
    }
    return o;
  }
  onInit(e, t) {
    var i;
    const o = this.normalizeInstanceIdentifier(t),
      a =
        (i = this.onInitCallbacks.get(o)) !== null && i !== void 0
          ? i
          : new Set();
    (a.add(e), this.onInitCallbacks.set(o, a));
    const u = this.instances.get(o);
    return (
      u && e(u, o),
      () => {
        a.delete(e);
      }
    );
  }
  invokeOnInitCallbacks(e, t) {
    const i = this.onInitCallbacks.get(t);
    if (i)
      for (const o of i)
        try {
          o(e, t);
        } catch {}
  }
  getOrInitializeService({ instanceIdentifier: e, options: t = {} }) {
    let i = this.instances.get(e);
    if (
      !i &&
      this.component &&
      ((i = this.component.instanceFactory(this.container, {
        instanceIdentifier: uP(e),
        options: t,
      })),
      this.instances.set(e, i),
      this.instancesOptions.set(e, t),
      this.invokeOnInitCallbacks(i, e),
      this.component.onInstanceCreated)
    )
      try {
        this.component.onInstanceCreated(this.container, e, i);
      } catch {}
    return i || null;
  }
  normalizeInstanceIdentifier(e = To) {
    return this.component ? (this.component.multipleInstances ? e : To) : e;
  }
  shouldAutoInitialize() {
    return !!this.component && this.component.instantiationMode !== "EXPLICIT";
  }
}
function uP(n) {
  return n === To ? void 0 : n;
}
function cP(n) {
  return n.instantiationMode === "EAGER";
}
class hP {
  constructor(e) {
    ((this.name = e), (this.providers = new Map()));
  }
  addComponent(e) {
    const t = this.getProvider(e.name);
    if (t.isComponentSet())
      throw new Error(
        `Component ${e.name} has already been registered with ${this.name}`,
      );
    t.setComponent(e);
  }
  addOrOverwriteComponent(e) {
    (this.getProvider(e.name).isComponentSet() && this.providers.delete(e.name),
      this.addComponent(e));
  }
  getProvider(e) {
    if (this.providers.has(e)) return this.providers.get(e);
    const t = new lP(e, this);
    return (this.providers.set(e, t), t);
  }
  getProviders() {
    return Array.from(this.providers.values());
  }
}
var Qe;
(function (n) {
  ((n[(n.DEBUG = 0)] = "DEBUG"),
    (n[(n.VERBOSE = 1)] = "VERBOSE"),
    (n[(n.INFO = 2)] = "INFO"),
    (n[(n.WARN = 3)] = "WARN"),
    (n[(n.ERROR = 4)] = "ERROR"),
    (n[(n.SILENT = 5)] = "SILENT"));
})(Qe || (Qe = {}));
const dP = {
    debug: Qe.DEBUG,
    verbose: Qe.VERBOSE,
    info: Qe.INFO,
    warn: Qe.WARN,
    error: Qe.ERROR,
    silent: Qe.SILENT,
  },
  fP = Qe.INFO,
  pP = {
    [Qe.DEBUG]: "log",
    [Qe.VERBOSE]: "log",
    [Qe.INFO]: "info",
    [Qe.WARN]: "warn",
    [Qe.ERROR]: "error",
  },
  mP = (n, e, ...t) => {
    if (e < n.logLevel) return;
    const i = new Date().toISOString(),
      o = pP[e];
    if (o) console[o](`[${i}]  ${n.name}:`, ...t);
    else
      throw new Error(
        `Attempted to log a message with an invalid logType (value: ${e})`,
      );
  };
class vm {
  constructor(e) {
    ((this.name = e),
      (this._logLevel = fP),
      (this._logHandler = mP),
      (this._userLogHandler = null));
  }
  get logLevel() {
    return this._logLevel;
  }
  set logLevel(e) {
    if (!(e in Qe))
      throw new TypeError(`Invalid value "${e}" assigned to \`logLevel\``);
    this._logLevel = e;
  }
  setLogLevel(e) {
    this._logLevel = typeof e == "string" ? dP[e] : e;
  }
  get logHandler() {
    return this._logHandler;
  }
  set logHandler(e) {
    if (typeof e != "function")
      throw new TypeError("Value assigned to `logHandler` must be a function");
    this._logHandler = e;
  }
  get userLogHandler() {
    return this._userLogHandler;
  }
  set userLogHandler(e) {
    this._userLogHandler = e;
  }
  debug(...e) {
    (this._userLogHandler && this._userLogHandler(this, Qe.DEBUG, ...e),
      this._logHandler(this, Qe.DEBUG, ...e));
  }
  log(...e) {
    (this._userLogHandler && this._userLogHandler(this, Qe.VERBOSE, ...e),
      this._logHandler(this, Qe.VERBOSE, ...e));
  }
  info(...e) {
    (this._userLogHandler && this._userLogHandler(this, Qe.INFO, ...e),
      this._logHandler(this, Qe.INFO, ...e));
  }
  warn(...e) {
    (this._userLogHandler && this._userLogHandler(this, Qe.WARN, ...e),
      this._logHandler(this, Qe.WARN, ...e));
  }
  error(...e) {
    (this._userLogHandler && this._userLogHandler(this, Qe.ERROR, ...e),
      this._logHandler(this, Qe.ERROR, ...e));
  }
}
const gP = (n, e) => e.some((t) => n instanceof t);
let __, w_;
function yP() {
  return (
    __ ||
    (__ = [IDBDatabase, IDBObjectStore, IDBIndex, IDBCursor, IDBTransaction])
  );
}
function vP() {
  return (
    w_ ||
    (w_ = [
      IDBCursor.prototype.advance,
      IDBCursor.prototype.continue,
      IDBCursor.prototype.continuePrimaryKey,
    ])
  );
}
const Kw = new WeakMap(),
  Pp = new WeakMap(),
  Gw = new WeakMap(),
  tp = new WeakMap(),
  _m = new WeakMap();
function _P(n) {
  const e = new Promise((t, i) => {
    const o = () => {
        (n.removeEventListener("success", a),
          n.removeEventListener("error", u));
      },
      a = () => {
        (t(Os(n.result)), o());
      },
      u = () => {
        (i(n.error), o());
      };
    (n.addEventListener("success", a), n.addEventListener("error", u));
  });
  return (
    e
      .then((t) => {
        t instanceof IDBCursor && Kw.set(t, n);
      })
      .catch(() => {}),
    _m.set(e, n),
    e
  );
}
function wP(n) {
  if (Pp.has(n)) return;
  const e = new Promise((t, i) => {
    const o = () => {
        (n.removeEventListener("complete", a),
          n.removeEventListener("error", u),
          n.removeEventListener("abort", u));
      },
      a = () => {
        (t(), o());
      },
      u = () => {
        (i(n.error || new DOMException("AbortError", "AbortError")), o());
      };
    (n.addEventListener("complete", a),
      n.addEventListener("error", u),
      n.addEventListener("abort", u));
  });
  Pp.set(n, e);
}
let kp = {
  get(n, e, t) {
    if (n instanceof IDBTransaction) {
      if (e === "done") return Pp.get(n);
      if (e === "objectStoreNames") return n.objectStoreNames || Gw.get(n);
      if (e === "store")
        return t.objectStoreNames[1]
          ? void 0
          : t.objectStore(t.objectStoreNames[0]);
    }
    return Os(n[e]);
  },
  set(n, e, t) {
    return ((n[e] = t), !0);
  },
  has(n, e) {
    return n instanceof IDBTransaction && (e === "done" || e === "store")
      ? !0
      : e in n;
  },
};
function EP(n) {
  kp = n(kp);
}
function TP(n) {
  return n === IDBDatabase.prototype.transaction &&
    !("objectStoreNames" in IDBTransaction.prototype)
    ? function (e, ...t) {
        const i = n.call(np(this), e, ...t);
        return (Gw.set(i, e.sort ? e.sort() : [e]), Os(i));
      }
    : vP().includes(n)
      ? function (...e) {
          return (n.apply(np(this), e), Os(Kw.get(this)));
        }
      : function (...e) {
          return Os(n.apply(np(this), e));
        };
}
function SP(n) {
  return typeof n == "function"
    ? TP(n)
    : (n instanceof IDBTransaction && wP(n),
      gP(n, yP()) ? new Proxy(n, kp) : n);
}
function Os(n) {
  if (n instanceof IDBRequest) return _P(n);
  if (tp.has(n)) return tp.get(n);
  const e = SP(n);
  return (e !== n && (tp.set(n, e), _m.set(e, n)), e);
}
const np = (n) => _m.get(n);
function IP(n, e, { blocked: t, upgrade: i, blocking: o, terminated: a } = {}) {
  const u = indexedDB.open(n, e),
    d = Os(u);
  return (
    i &&
      u.addEventListener("upgradeneeded", (f) => {
        i(Os(u.result), f.oldVersion, f.newVersion, Os(u.transaction), f);
      }),
    t && u.addEventListener("blocked", (f) => t(f.oldVersion, f.newVersion, f)),
    d
      .then((f) => {
        (a && f.addEventListener("close", () => a()),
          o &&
            f.addEventListener("versionchange", (m) =>
              o(m.oldVersion, m.newVersion, m),
            ));
      })
      .catch(() => {}),
    d
  );
}
const RP = ["get", "getKey", "getAll", "getAllKeys", "count"],
  AP = ["put", "add", "delete", "clear"],
  rp = new Map();
function E_(n, e) {
  if (!(n instanceof IDBDatabase && !(e in n) && typeof e == "string")) return;
  if (rp.get(e)) return rp.get(e);
  const t = e.replace(/FromIndex$/, ""),
    i = e !== t,
    o = AP.includes(t);
  if (
    !(t in (i ? IDBIndex : IDBObjectStore).prototype) ||
    !(o || RP.includes(t))
  )
    return;
  const a = async function (u, ...d) {
    const f = this.transaction(u, o ? "readwrite" : "readonly");
    let m = f.store;
    return (
      i && (m = m.index(d.shift())),
      (await Promise.all([m[t](...d), o && f.done]))[0]
    );
  };
  return (rp.set(e, a), a);
}
EP((n) => ({
  ...n,
  get: (e, t, i) => E_(e, t) || n.get(e, t, i),
  has: (e, t) => !!E_(e, t) || n.has(e, t),
}));
class CP {
  constructor(e) {
    this.container = e;
  }
  getPlatformInfoString() {
    return this.container
      .getProviders()
      .map((t) => {
        if (PP(t)) {
          const i = t.getImmediate();
          return `${i.library}/${i.version}`;
        } else return null;
      })
      .filter((t) => t)
      .join(" ");
  }
}
function PP(n) {
  const e = n.getComponent();
  return e?.type === "VERSION";
}
const xp = "@firebase/app",
  T_ = "0.13.2";
const zi = new vm("@firebase/app"),
  kP = "@firebase/app-compat",
  xP = "@firebase/analytics-compat",
  bP = "@firebase/analytics",
  DP = "@firebase/app-check-compat",
  NP = "@firebase/app-check",
  OP = "@firebase/auth",
  LP = "@firebase/auth-compat",
  MP = "@firebase/database",
  VP = "@firebase/data-connect",
  FP = "@firebase/database-compat",
  UP = "@firebase/functions",
  zP = "@firebase/functions-compat",
  jP = "@firebase/installations",
  BP = "@firebase/installations-compat",
  $P = "@firebase/messaging",
  HP = "@firebase/messaging-compat",
  WP = "@firebase/performance",
  qP = "@firebase/performance-compat",
  KP = "@firebase/remote-config",
  GP = "@firebase/remote-config-compat",
  QP = "@firebase/storage",
  YP = "@firebase/storage-compat",
  XP = "@firebase/firestore",
  JP = "@firebase/ai",
  ZP = "@firebase/firestore-compat",
  ek = "firebase",
  tk = "11.10.0";
const bp = "[DEFAULT]",
  nk = {
    [xp]: "fire-core",
    [kP]: "fire-core-compat",
    [bP]: "fire-analytics",
    [xP]: "fire-analytics-compat",
    [NP]: "fire-app-check",
    [DP]: "fire-app-check-compat",
    [OP]: "fire-auth",
    [LP]: "fire-auth-compat",
    [MP]: "fire-rtdb",
    [VP]: "fire-data-connect",
    [FP]: "fire-rtdb-compat",
    [UP]: "fire-fn",
    [zP]: "fire-fn-compat",
    [jP]: "fire-iid",
    [BP]: "fire-iid-compat",
    [$P]: "fire-fcm",
    [HP]: "fire-fcm-compat",
    [WP]: "fire-perf",
    [qP]: "fire-perf-compat",
    [KP]: "fire-rc",
    [GP]: "fire-rc-compat",
    [QP]: "fire-gcs",
    [YP]: "fire-gcs-compat",
    [XP]: "fire-fst",
    [ZP]: "fire-fst-compat",
    [JP]: "fire-vertex",
    "fire-js": "fire-js",
    [ek]: "fire-js-all",
  };
const gh = new Map(),
  rk = new Map(),
  Dp = new Map();
function S_(n, e) {
  try {
    n.container.addComponent(e);
  } catch (t) {
    zi.debug(
      `Component ${e.name} failed to register with FirebaseApp ${n.name}`,
      t,
    );
  }
}
function Na(n) {
  const e = n.name;
  if (Dp.has(e))
    return (
      zi.debug(`There were multiple attempts to register component ${e}.`),
      !1
    );
  Dp.set(e, n);
  for (const t of gh.values()) S_(t, n);
  for (const t of rk.values()) S_(t, n);
  return !0;
}
function wm(n, e) {
  const t = n.container.getProvider("heartbeat").getImmediate({ optional: !0 });
  return (t && t.triggerHeartbeat(), n.container.getProvider(e));
}
function Xr(n) {
  return n == null ? !1 : n.settings !== void 0;
}
const ik = {
    "no-app":
      "No Firebase App '{$appName}' has been created - call initializeApp() first",
    "bad-app-name": "Illegal App name: '{$appName}'",
    "duplicate-app":
      "Firebase App named '{$appName}' already exists with different options or config",
    "app-deleted": "Firebase App named '{$appName}' already deleted",
    "server-app-deleted": "Firebase Server App has been deleted",
    "no-options":
      "Need to provide options, when not being deployed to hosting via source.",
    "invalid-app-argument":
      "firebase.{$appName}() takes either no argument or a Firebase App instance.",
    "invalid-log-argument":
      "First argument to `onLog` must be null or a function.",
    "idb-open":
      "Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.",
    "idb-get":
      "Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.",
    "idb-set":
      "Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.",
    "idb-delete":
      "Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.",
    "finalization-registry-not-supported":
      "FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.",
    "invalid-server-app-environment":
      "FirebaseServerApp is not for use in browser environments.",
  },
  Ls = new pu("app", "Firebase", ik);
class sk {
  constructor(e, t, i) {
    ((this._isDeleted = !1),
      (this._options = Object.assign({}, e)),
      (this._config = Object.assign({}, t)),
      (this._name = t.name),
      (this._automaticDataCollectionEnabled = t.automaticDataCollectionEnabled),
      (this._container = i),
      this.container.addComponent(new Po("app", () => this, "PUBLIC")));
  }
  get automaticDataCollectionEnabled() {
    return (this.checkDestroyed(), this._automaticDataCollectionEnabled);
  }
  set automaticDataCollectionEnabled(e) {
    (this.checkDestroyed(), (this._automaticDataCollectionEnabled = e));
  }
  get name() {
    return (this.checkDestroyed(), this._name);
  }
  get options() {
    return (this.checkDestroyed(), this._options);
  }
  get config() {
    return (this.checkDestroyed(), this._config);
  }
  get container() {
    return this._container;
  }
  get isDeleted() {
    return this._isDeleted;
  }
  set isDeleted(e) {
    this._isDeleted = e;
  }
  checkDestroyed() {
    if (this.isDeleted) throw Ls.create("app-deleted", { appName: this._name });
  }
}
const Ba = tk;
function Qw(n, e = {}) {
  let t = n;
  typeof e != "object" && (e = { name: e });
  const i = Object.assign({ name: bp, automaticDataCollectionEnabled: !0 }, e),
    o = i.name;
  if (typeof o != "string" || !o)
    throw Ls.create("bad-app-name", { appName: String(o) });
  if ((t || (t = $w()), !t)) throw Ls.create("no-options");
  const a = gh.get(o);
  if (a) {
    if (Co(t, a.options) && Co(i, a.config)) return a;
    throw Ls.create("duplicate-app", { appName: o });
  }
  const u = new hP(o);
  for (const f of Dp.values()) u.addComponent(f);
  const d = new sk(t, i, u);
  return (gh.set(o, d), d);
}
function Yw(n = bp) {
  const e = gh.get(n);
  if (!e && n === bp && $w()) return Qw();
  if (!e) throw Ls.create("no-app", { appName: n });
  return e;
}
function Ms(n, e, t) {
  var i;
  let o = (i = nk[n]) !== null && i !== void 0 ? i : n;
  t && (o += `-${t}`);
  const a = o.match(/\s|\//),
    u = e.match(/\s|\//);
  if (a || u) {
    const d = [`Unable to register library "${o}" with version "${e}":`];
    (a &&
      d.push(
        `library name "${o}" contains illegal characters (whitespace or "/")`,
      ),
      a && u && d.push("and"),
      u &&
        d.push(
          `version name "${e}" contains illegal characters (whitespace or "/")`,
        ),
      zi.warn(d.join(" ")));
    return;
  }
  Na(new Po(`${o}-version`, () => ({ library: o, version: e }), "VERSION"));
}
const ok = "firebase-heartbeat-database",
  ak = 1,
  Zl = "firebase-heartbeat-store";
let ip = null;
function Xw() {
  return (
    ip ||
      (ip = IP(ok, ak, {
        upgrade: (n, e) => {
          switch (e) {
            case 0:
              try {
                n.createObjectStore(Zl);
              } catch (t) {
                console.warn(t);
              }
          }
        },
      }).catch((n) => {
        throw Ls.create("idb-open", { originalErrorMessage: n.message });
      })),
    ip
  );
}
async function lk(n) {
  try {
    const t = (await Xw()).transaction(Zl),
      i = await t.objectStore(Zl).get(Jw(n));
    return (await t.done, i);
  } catch (e) {
    if (e instanceof qi) zi.warn(e.message);
    else {
      const t = Ls.create("idb-get", { originalErrorMessage: e?.message });
      zi.warn(t.message);
    }
  }
}
async function I_(n, e) {
  try {
    const i = (await Xw()).transaction(Zl, "readwrite");
    (await i.objectStore(Zl).put(e, Jw(n)), await i.done);
  } catch (t) {
    if (t instanceof qi) zi.warn(t.message);
    else {
      const i = Ls.create("idb-set", { originalErrorMessage: t?.message });
      zi.warn(i.message);
    }
  }
}
function Jw(n) {
  return `${n.name}!${n.options.appId}`;
}
const uk = 1024,
  ck = 30;
class hk {
  constructor(e) {
    ((this.container = e), (this._heartbeatsCache = null));
    const t = this.container.getProvider("app").getImmediate();
    ((this._storage = new fk(t)),
      (this._heartbeatsCachePromise = this._storage
        .read()
        .then((i) => ((this._heartbeatsCache = i), i))));
  }
  async triggerHeartbeat() {
    var e, t;
    try {
      const o = this.container
          .getProvider("platform-logger")
          .getImmediate()
          .getPlatformInfoString(),
        a = R_();
      if (
        (((e = this._heartbeatsCache) === null || e === void 0
          ? void 0
          : e.heartbeats) == null &&
          ((this._heartbeatsCache = await this._heartbeatsCachePromise),
          ((t = this._heartbeatsCache) === null || t === void 0
            ? void 0
            : t.heartbeats) == null)) ||
        this._heartbeatsCache.lastSentHeartbeatDate === a ||
        this._heartbeatsCache.heartbeats.some((u) => u.date === a)
      )
        return;
      if (
        (this._heartbeatsCache.heartbeats.push({ date: a, agent: o }),
        this._heartbeatsCache.heartbeats.length > ck)
      ) {
        const u = pk(this._heartbeatsCache.heartbeats);
        this._heartbeatsCache.heartbeats.splice(u, 1);
      }
      return this._storage.overwrite(this._heartbeatsCache);
    } catch (i) {
      zi.warn(i);
    }
  }
  async getHeartbeatsHeader() {
    var e;
    try {
      if (
        (this._heartbeatsCache === null && (await this._heartbeatsCachePromise),
        ((e = this._heartbeatsCache) === null || e === void 0
          ? void 0
          : e.heartbeats) == null ||
          this._heartbeatsCache.heartbeats.length === 0)
      )
        return "";
      const t = R_(),
        { heartbeatsToSend: i, unsentEntries: o } = dk(
          this._heartbeatsCache.heartbeats,
        ),
        a = mh(JSON.stringify({ version: 2, heartbeats: i }));
      return (
        (this._heartbeatsCache.lastSentHeartbeatDate = t),
        o.length > 0
          ? ((this._heartbeatsCache.heartbeats = o),
            await this._storage.overwrite(this._heartbeatsCache))
          : ((this._heartbeatsCache.heartbeats = []),
            this._storage.overwrite(this._heartbeatsCache)),
        a
      );
    } catch (t) {
      return (zi.warn(t), "");
    }
  }
}
function R_() {
  return new Date().toISOString().substring(0, 10);
}
function dk(n, e = uk) {
  const t = [];
  let i = n.slice();
  for (const o of n) {
    const a = t.find((u) => u.agent === o.agent);
    if (a) {
      if ((a.dates.push(o.date), A_(t) > e)) {
        a.dates.pop();
        break;
      }
    } else if ((t.push({ agent: o.agent, dates: [o.date] }), A_(t) > e)) {
      t.pop();
      break;
    }
    i = i.slice(1);
  }
  return { heartbeatsToSend: t, unsentEntries: i };
}
class fk {
  constructor(e) {
    ((this.app = e),
      (this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck()));
  }
  async runIndexedDBEnvironmentCheck() {
    return ZC()
      ? eP()
          .then(() => !0)
          .catch(() => !1)
      : !1;
  }
  async read() {
    if (await this._canUseIndexedDBPromise) {
      const t = await lk(this.app);
      return t?.heartbeats ? t : { heartbeats: [] };
    } else return { heartbeats: [] };
  }
  async overwrite(e) {
    var t;
    if (await this._canUseIndexedDBPromise) {
      const o = await this.read();
      return I_(this.app, {
        lastSentHeartbeatDate:
          (t = e.lastSentHeartbeatDate) !== null && t !== void 0
            ? t
            : o.lastSentHeartbeatDate,
        heartbeats: e.heartbeats,
      });
    } else return;
  }
  async add(e) {
    var t;
    if (await this._canUseIndexedDBPromise) {
      const o = await this.read();
      return I_(this.app, {
        lastSentHeartbeatDate:
          (t = e.lastSentHeartbeatDate) !== null && t !== void 0
            ? t
            : o.lastSentHeartbeatDate,
        heartbeats: [...o.heartbeats, ...e.heartbeats],
      });
    } else return;
  }
}
function A_(n) {
  return mh(JSON.stringify({ version: 2, heartbeats: n })).length;
}
function pk(n) {
  if (n.length === 0) return -1;
  let e = 0,
    t = n[0].date;
  for (let i = 1; i < n.length; i++)
    n[i].date < t && ((t = n[i].date), (e = i));
  return e;
}
function mk(n) {
  (Na(new Po("platform-logger", (e) => new CP(e), "PRIVATE")),
    Na(new Po("heartbeat", (e) => new hk(e), "PRIVATE")),
    Ms(xp, T_, n),
    Ms(xp, T_, "esm2017"),
    Ms("fire-js", ""));
}
mk("");
var C_ =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
      ? window
      : typeof global < "u"
        ? global
        : typeof self < "u"
          ? self
          : {};
var Vs, Zw;
(function () {
  var n;
  function e(S, R) {
    function C() {}
    ((C.prototype = R.prototype),
      (S.D = R.prototype),
      (S.prototype = new C()),
      (S.prototype.constructor = S),
      (S.C = function (x, L, U) {
        for (
          var k = Array(arguments.length - 2), Oe = 2;
          Oe < arguments.length;
          Oe++
        )
          k[Oe - 2] = arguments[Oe];
        return R.prototype[L].apply(x, k);
      }));
  }
  function t() {
    this.blockSize = -1;
  }
  function i() {
    ((this.blockSize = -1),
      (this.blockSize = 64),
      (this.g = Array(4)),
      (this.B = Array(this.blockSize)),
      (this.o = this.h = 0),
      this.s());
  }
  (e(i, t),
    (i.prototype.s = function () {
      ((this.g[0] = 1732584193),
        (this.g[1] = 4023233417),
        (this.g[2] = 2562383102),
        (this.g[3] = 271733878),
        (this.o = this.h = 0));
    }));
  function o(S, R, C) {
    C || (C = 0);
    var x = Array(16);
    if (typeof R == "string")
      for (var L = 0; 16 > L; ++L)
        x[L] =
          R.charCodeAt(C++) |
          (R.charCodeAt(C++) << 8) |
          (R.charCodeAt(C++) << 16) |
          (R.charCodeAt(C++) << 24);
    else
      for (L = 0; 16 > L; ++L)
        x[L] = R[C++] | (R[C++] << 8) | (R[C++] << 16) | (R[C++] << 24);
    ((R = S.g[0]), (C = S.g[1]), (L = S.g[2]));
    var U = S.g[3],
      k = (R + (U ^ (C & (L ^ U))) + x[0] + 3614090360) & 4294967295;
    ((R = C + (((k << 7) & 4294967295) | (k >>> 25))),
      (k = (U + (L ^ (R & (C ^ L))) + x[1] + 3905402710) & 4294967295),
      (U = R + (((k << 12) & 4294967295) | (k >>> 20))),
      (k = (L + (C ^ (U & (R ^ C))) + x[2] + 606105819) & 4294967295),
      (L = U + (((k << 17) & 4294967295) | (k >>> 15))),
      (k = (C + (R ^ (L & (U ^ R))) + x[3] + 3250441966) & 4294967295),
      (C = L + (((k << 22) & 4294967295) | (k >>> 10))),
      (k = (R + (U ^ (C & (L ^ U))) + x[4] + 4118548399) & 4294967295),
      (R = C + (((k << 7) & 4294967295) | (k >>> 25))),
      (k = (U + (L ^ (R & (C ^ L))) + x[5] + 1200080426) & 4294967295),
      (U = R + (((k << 12) & 4294967295) | (k >>> 20))),
      (k = (L + (C ^ (U & (R ^ C))) + x[6] + 2821735955) & 4294967295),
      (L = U + (((k << 17) & 4294967295) | (k >>> 15))),
      (k = (C + (R ^ (L & (U ^ R))) + x[7] + 4249261313) & 4294967295),
      (C = L + (((k << 22) & 4294967295) | (k >>> 10))),
      (k = (R + (U ^ (C & (L ^ U))) + x[8] + 1770035416) & 4294967295),
      (R = C + (((k << 7) & 4294967295) | (k >>> 25))),
      (k = (U + (L ^ (R & (C ^ L))) + x[9] + 2336552879) & 4294967295),
      (U = R + (((k << 12) & 4294967295) | (k >>> 20))),
      (k = (L + (C ^ (U & (R ^ C))) + x[10] + 4294925233) & 4294967295),
      (L = U + (((k << 17) & 4294967295) | (k >>> 15))),
      (k = (C + (R ^ (L & (U ^ R))) + x[11] + 2304563134) & 4294967295),
      (C = L + (((k << 22) & 4294967295) | (k >>> 10))),
      (k = (R + (U ^ (C & (L ^ U))) + x[12] + 1804603682) & 4294967295),
      (R = C + (((k << 7) & 4294967295) | (k >>> 25))),
      (k = (U + (L ^ (R & (C ^ L))) + x[13] + 4254626195) & 4294967295),
      (U = R + (((k << 12) & 4294967295) | (k >>> 20))),
      (k = (L + (C ^ (U & (R ^ C))) + x[14] + 2792965006) & 4294967295),
      (L = U + (((k << 17) & 4294967295) | (k >>> 15))),
      (k = (C + (R ^ (L & (U ^ R))) + x[15] + 1236535329) & 4294967295),
      (C = L + (((k << 22) & 4294967295) | (k >>> 10))),
      (k = (R + (L ^ (U & (C ^ L))) + x[1] + 4129170786) & 4294967295),
      (R = C + (((k << 5) & 4294967295) | (k >>> 27))),
      (k = (U + (C ^ (L & (R ^ C))) + x[6] + 3225465664) & 4294967295),
      (U = R + (((k << 9) & 4294967295) | (k >>> 23))),
      (k = (L + (R ^ (C & (U ^ R))) + x[11] + 643717713) & 4294967295),
      (L = U + (((k << 14) & 4294967295) | (k >>> 18))),
      (k = (C + (U ^ (R & (L ^ U))) + x[0] + 3921069994) & 4294967295),
      (C = L + (((k << 20) & 4294967295) | (k >>> 12))),
      (k = (R + (L ^ (U & (C ^ L))) + x[5] + 3593408605) & 4294967295),
      (R = C + (((k << 5) & 4294967295) | (k >>> 27))),
      (k = (U + (C ^ (L & (R ^ C))) + x[10] + 38016083) & 4294967295),
      (U = R + (((k << 9) & 4294967295) | (k >>> 23))),
      (k = (L + (R ^ (C & (U ^ R))) + x[15] + 3634488961) & 4294967295),
      (L = U + (((k << 14) & 4294967295) | (k >>> 18))),
      (k = (C + (U ^ (R & (L ^ U))) + x[4] + 3889429448) & 4294967295),
      (C = L + (((k << 20) & 4294967295) | (k >>> 12))),
      (k = (R + (L ^ (U & (C ^ L))) + x[9] + 568446438) & 4294967295),
      (R = C + (((k << 5) & 4294967295) | (k >>> 27))),
      (k = (U + (C ^ (L & (R ^ C))) + x[14] + 3275163606) & 4294967295),
      (U = R + (((k << 9) & 4294967295) | (k >>> 23))),
      (k = (L + (R ^ (C & (U ^ R))) + x[3] + 4107603335) & 4294967295),
      (L = U + (((k << 14) & 4294967295) | (k >>> 18))),
      (k = (C + (U ^ (R & (L ^ U))) + x[8] + 1163531501) & 4294967295),
      (C = L + (((k << 20) & 4294967295) | (k >>> 12))),
      (k = (R + (L ^ (U & (C ^ L))) + x[13] + 2850285829) & 4294967295),
      (R = C + (((k << 5) & 4294967295) | (k >>> 27))),
      (k = (U + (C ^ (L & (R ^ C))) + x[2] + 4243563512) & 4294967295),
      (U = R + (((k << 9) & 4294967295) | (k >>> 23))),
      (k = (L + (R ^ (C & (U ^ R))) + x[7] + 1735328473) & 4294967295),
      (L = U + (((k << 14) & 4294967295) | (k >>> 18))),
      (k = (C + (U ^ (R & (L ^ U))) + x[12] + 2368359562) & 4294967295),
      (C = L + (((k << 20) & 4294967295) | (k >>> 12))),
      (k = (R + (C ^ L ^ U) + x[5] + 4294588738) & 4294967295),
      (R = C + (((k << 4) & 4294967295) | (k >>> 28))),
      (k = (U + (R ^ C ^ L) + x[8] + 2272392833) & 4294967295),
      (U = R + (((k << 11) & 4294967295) | (k >>> 21))),
      (k = (L + (U ^ R ^ C) + x[11] + 1839030562) & 4294967295),
      (L = U + (((k << 16) & 4294967295) | (k >>> 16))),
      (k = (C + (L ^ U ^ R) + x[14] + 4259657740) & 4294967295),
      (C = L + (((k << 23) & 4294967295) | (k >>> 9))),
      (k = (R + (C ^ L ^ U) + x[1] + 2763975236) & 4294967295),
      (R = C + (((k << 4) & 4294967295) | (k >>> 28))),
      (k = (U + (R ^ C ^ L) + x[4] + 1272893353) & 4294967295),
      (U = R + (((k << 11) & 4294967295) | (k >>> 21))),
      (k = (L + (U ^ R ^ C) + x[7] + 4139469664) & 4294967295),
      (L = U + (((k << 16) & 4294967295) | (k >>> 16))),
      (k = (C + (L ^ U ^ R) + x[10] + 3200236656) & 4294967295),
      (C = L + (((k << 23) & 4294967295) | (k >>> 9))),
      (k = (R + (C ^ L ^ U) + x[13] + 681279174) & 4294967295),
      (R = C + (((k << 4) & 4294967295) | (k >>> 28))),
      (k = (U + (R ^ C ^ L) + x[0] + 3936430074) & 4294967295),
      (U = R + (((k << 11) & 4294967295) | (k >>> 21))),
      (k = (L + (U ^ R ^ C) + x[3] + 3572445317) & 4294967295),
      (L = U + (((k << 16) & 4294967295) | (k >>> 16))),
      (k = (C + (L ^ U ^ R) + x[6] + 76029189) & 4294967295),
      (C = L + (((k << 23) & 4294967295) | (k >>> 9))),
      (k = (R + (C ^ L ^ U) + x[9] + 3654602809) & 4294967295),
      (R = C + (((k << 4) & 4294967295) | (k >>> 28))),
      (k = (U + (R ^ C ^ L) + x[12] + 3873151461) & 4294967295),
      (U = R + (((k << 11) & 4294967295) | (k >>> 21))),
      (k = (L + (U ^ R ^ C) + x[15] + 530742520) & 4294967295),
      (L = U + (((k << 16) & 4294967295) | (k >>> 16))),
      (k = (C + (L ^ U ^ R) + x[2] + 3299628645) & 4294967295),
      (C = L + (((k << 23) & 4294967295) | (k >>> 9))),
      (k = (R + (L ^ (C | ~U)) + x[0] + 4096336452) & 4294967295),
      (R = C + (((k << 6) & 4294967295) | (k >>> 26))),
      (k = (U + (C ^ (R | ~L)) + x[7] + 1126891415) & 4294967295),
      (U = R + (((k << 10) & 4294967295) | (k >>> 22))),
      (k = (L + (R ^ (U | ~C)) + x[14] + 2878612391) & 4294967295),
      (L = U + (((k << 15) & 4294967295) | (k >>> 17))),
      (k = (C + (U ^ (L | ~R)) + x[5] + 4237533241) & 4294967295),
      (C = L + (((k << 21) & 4294967295) | (k >>> 11))),
      (k = (R + (L ^ (C | ~U)) + x[12] + 1700485571) & 4294967295),
      (R = C + (((k << 6) & 4294967295) | (k >>> 26))),
      (k = (U + (C ^ (R | ~L)) + x[3] + 2399980690) & 4294967295),
      (U = R + (((k << 10) & 4294967295) | (k >>> 22))),
      (k = (L + (R ^ (U | ~C)) + x[10] + 4293915773) & 4294967295),
      (L = U + (((k << 15) & 4294967295) | (k >>> 17))),
      (k = (C + (U ^ (L | ~R)) + x[1] + 2240044497) & 4294967295),
      (C = L + (((k << 21) & 4294967295) | (k >>> 11))),
      (k = (R + (L ^ (C | ~U)) + x[8] + 1873313359) & 4294967295),
      (R = C + (((k << 6) & 4294967295) | (k >>> 26))),
      (k = (U + (C ^ (R | ~L)) + x[15] + 4264355552) & 4294967295),
      (U = R + (((k << 10) & 4294967295) | (k >>> 22))),
      (k = (L + (R ^ (U | ~C)) + x[6] + 2734768916) & 4294967295),
      (L = U + (((k << 15) & 4294967295) | (k >>> 17))),
      (k = (C + (U ^ (L | ~R)) + x[13] + 1309151649) & 4294967295),
      (C = L + (((k << 21) & 4294967295) | (k >>> 11))),
      (k = (R + (L ^ (C | ~U)) + x[4] + 4149444226) & 4294967295),
      (R = C + (((k << 6) & 4294967295) | (k >>> 26))),
      (k = (U + (C ^ (R | ~L)) + x[11] + 3174756917) & 4294967295),
      (U = R + (((k << 10) & 4294967295) | (k >>> 22))),
      (k = (L + (R ^ (U | ~C)) + x[2] + 718787259) & 4294967295),
      (L = U + (((k << 15) & 4294967295) | (k >>> 17))),
      (k = (C + (U ^ (L | ~R)) + x[9] + 3951481745) & 4294967295),
      (S.g[0] = (S.g[0] + R) & 4294967295),
      (S.g[1] =
        (S.g[1] + (L + (((k << 21) & 4294967295) | (k >>> 11)))) & 4294967295),
      (S.g[2] = (S.g[2] + L) & 4294967295),
      (S.g[3] = (S.g[3] + U) & 4294967295));
  }
  ((i.prototype.u = function (S, R) {
    R === void 0 && (R = S.length);
    for (var C = R - this.blockSize, x = this.B, L = this.h, U = 0; U < R; ) {
      if (L == 0) for (; U <= C; ) (o(this, S, U), (U += this.blockSize));
      if (typeof S == "string") {
        for (; U < R; )
          if (((x[L++] = S.charCodeAt(U++)), L == this.blockSize)) {
            (o(this, x), (L = 0));
            break;
          }
      } else
        for (; U < R; )
          if (((x[L++] = S[U++]), L == this.blockSize)) {
            (o(this, x), (L = 0));
            break;
          }
    }
    ((this.h = L), (this.o += R));
  }),
    (i.prototype.v = function () {
      var S = Array(
        (56 > this.h ? this.blockSize : 2 * this.blockSize) - this.h,
      );
      S[0] = 128;
      for (var R = 1; R < S.length - 8; ++R) S[R] = 0;
      var C = 8 * this.o;
      for (R = S.length - 8; R < S.length; ++R) ((S[R] = C & 255), (C /= 256));
      for (this.u(S), S = Array(16), R = C = 0; 4 > R; ++R)
        for (var x = 0; 32 > x; x += 8) S[C++] = (this.g[R] >>> x) & 255;
      return S;
    }));
  function a(S, R) {
    var C = d;
    return Object.prototype.hasOwnProperty.call(C, S) ? C[S] : (C[S] = R(S));
  }
  function u(S, R) {
    this.h = R;
    for (var C = [], x = !0, L = S.length - 1; 0 <= L; L--) {
      var U = S[L] | 0;
      (x && U == R) || ((C[L] = U), (x = !1));
    }
    this.g = C;
  }
  var d = {};
  function f(S) {
    return -128 <= S && 128 > S
      ? a(S, function (R) {
          return new u([R | 0], 0 > R ? -1 : 0);
        })
      : new u([S | 0], 0 > S ? -1 : 0);
  }
  function m(S) {
    if (isNaN(S) || !isFinite(S)) return w;
    if (0 > S) return O(m(-S));
    for (var R = [], C = 1, x = 0; S >= C; x++)
      ((R[x] = (S / C) | 0), (C *= 4294967296));
    return new u(R, 0);
  }
  function v(S, R) {
    if (S.length == 0) throw Error("number format error: empty string");
    if (((R = R || 10), 2 > R || 36 < R))
      throw Error("radix out of range: " + R);
    if (S.charAt(0) == "-") return O(v(S.substring(1), R));
    if (0 <= S.indexOf("-"))
      throw Error('number format error: interior "-" character');
    for (var C = m(Math.pow(R, 8)), x = w, L = 0; L < S.length; L += 8) {
      var U = Math.min(8, S.length - L),
        k = parseInt(S.substring(L, L + U), R);
      8 > U
        ? ((U = m(Math.pow(R, U))), (x = x.j(U).add(m(k))))
        : ((x = x.j(C)), (x = x.add(m(k))));
    }
    return x;
  }
  var w = f(0),
    T = f(1),
    A = f(16777216);
  ((n = u.prototype),
    (n.m = function () {
      if (j(this)) return -O(this).m();
      for (var S = 0, R = 1, C = 0; C < this.g.length; C++) {
        var x = this.i(C);
        ((S += (0 <= x ? x : 4294967296 + x) * R), (R *= 4294967296));
      }
      return S;
    }),
    (n.toString = function (S) {
      if (((S = S || 10), 2 > S || 36 < S))
        throw Error("radix out of range: " + S);
      if (D(this)) return "0";
      if (j(this)) return "-" + O(this).toString(S);
      for (var R = m(Math.pow(S, 6)), C = this, x = ""; ; ) {
        var L = ae(C, R).g;
        C = X(C, L.j(R));
        var U = ((0 < C.g.length ? C.g[0] : C.h) >>> 0).toString(S);
        if (((C = L), D(C))) return U + x;
        for (; 6 > U.length; ) U = "0" + U;
        x = U + x;
      }
    }),
    (n.i = function (S) {
      return 0 > S ? 0 : S < this.g.length ? this.g[S] : this.h;
    }));
  function D(S) {
    if (S.h != 0) return !1;
    for (var R = 0; R < S.g.length; R++) if (S.g[R] != 0) return !1;
    return !0;
  }
  function j(S) {
    return S.h == -1;
  }
  n.l = function (S) {
    return ((S = X(this, S)), j(S) ? -1 : D(S) ? 0 : 1);
  };
  function O(S) {
    for (var R = S.g.length, C = [], x = 0; x < R; x++) C[x] = ~S.g[x];
    return new u(C, ~S.h).add(T);
  }
  ((n.abs = function () {
    return j(this) ? O(this) : this;
  }),
    (n.add = function (S) {
      for (
        var R = Math.max(this.g.length, S.g.length), C = [], x = 0, L = 0;
        L <= R;
        L++
      ) {
        var U = x + (this.i(L) & 65535) + (S.i(L) & 65535),
          k = (U >>> 16) + (this.i(L) >>> 16) + (S.i(L) >>> 16);
        ((x = k >>> 16), (U &= 65535), (k &= 65535), (C[L] = (k << 16) | U));
      }
      return new u(C, C[C.length - 1] & -2147483648 ? -1 : 0);
    }));
  function X(S, R) {
    return S.add(O(R));
  }
  n.j = function (S) {
    if (D(this) || D(S)) return w;
    if (j(this)) return j(S) ? O(this).j(O(S)) : O(O(this).j(S));
    if (j(S)) return O(this.j(O(S)));
    if (0 > this.l(A) && 0 > S.l(A)) return m(this.m() * S.m());
    for (var R = this.g.length + S.g.length, C = [], x = 0; x < 2 * R; x++)
      C[x] = 0;
    for (x = 0; x < this.g.length; x++)
      for (var L = 0; L < S.g.length; L++) {
        var U = this.i(x) >>> 16,
          k = this.i(x) & 65535,
          Oe = S.i(L) >>> 16,
          He = S.i(L) & 65535;
        ((C[2 * x + 2 * L] += k * He),
          q(C, 2 * x + 2 * L),
          (C[2 * x + 2 * L + 1] += U * He),
          q(C, 2 * x + 2 * L + 1),
          (C[2 * x + 2 * L + 1] += k * Oe),
          q(C, 2 * x + 2 * L + 1),
          (C[2 * x + 2 * L + 2] += U * Oe),
          q(C, 2 * x + 2 * L + 2));
      }
    for (x = 0; x < R; x++) C[x] = (C[2 * x + 1] << 16) | C[2 * x];
    for (x = R; x < 2 * R; x++) C[x] = 0;
    return new u(C, 0);
  };
  function q(S, R) {
    for (; (S[R] & 65535) != S[R]; )
      ((S[R + 1] += S[R] >>> 16), (S[R] &= 65535), R++);
  }
  function G(S, R) {
    ((this.g = S), (this.h = R));
  }
  function ae(S, R) {
    if (D(R)) throw Error("division by zero");
    if (D(S)) return new G(w, w);
    if (j(S)) return ((R = ae(O(S), R)), new G(O(R.g), O(R.h)));
    if (j(R)) return ((R = ae(S, O(R))), new G(O(R.g), R.h));
    if (30 < S.g.length) {
      if (j(S) || j(R))
        throw Error("slowDivide_ only works with positive integers.");
      for (var C = T, x = R; 0 >= x.l(S); ) ((C = ee(C)), (x = ee(x)));
      var L = he(C, 1),
        U = he(x, 1);
      for (x = he(x, 2), C = he(C, 2); !D(x); ) {
        var k = U.add(x);
        (0 >= k.l(S) && ((L = L.add(C)), (U = k)),
          (x = he(x, 1)),
          (C = he(C, 1)));
      }
      return ((R = X(S, L.j(R))), new G(L, R));
    }
    for (L = w; 0 <= S.l(R); ) {
      for (
        C = Math.max(1, Math.floor(S.m() / R.m())),
          x = Math.ceil(Math.log(C) / Math.LN2),
          x = 48 >= x ? 1 : Math.pow(2, x - 48),
          U = m(C),
          k = U.j(R);
        j(k) || 0 < k.l(S);

      )
        ((C -= x), (U = m(C)), (k = U.j(R)));
      (D(U) && (U = T), (L = L.add(U)), (S = X(S, k)));
    }
    return new G(L, S);
  }
  ((n.A = function (S) {
    return ae(this, S).h;
  }),
    (n.and = function (S) {
      for (
        var R = Math.max(this.g.length, S.g.length), C = [], x = 0;
        x < R;
        x++
      )
        C[x] = this.i(x) & S.i(x);
      return new u(C, this.h & S.h);
    }),
    (n.or = function (S) {
      for (
        var R = Math.max(this.g.length, S.g.length), C = [], x = 0;
        x < R;
        x++
      )
        C[x] = this.i(x) | S.i(x);
      return new u(C, this.h | S.h);
    }),
    (n.xor = function (S) {
      for (
        var R = Math.max(this.g.length, S.g.length), C = [], x = 0;
        x < R;
        x++
      )
        C[x] = this.i(x) ^ S.i(x);
      return new u(C, this.h ^ S.h);
    }));
  function ee(S) {
    for (var R = S.g.length + 1, C = [], x = 0; x < R; x++)
      C[x] = (S.i(x) << 1) | (S.i(x - 1) >>> 31);
    return new u(C, S.h);
  }
  function he(S, R) {
    var C = R >> 5;
    R %= 32;
    for (var x = S.g.length - C, L = [], U = 0; U < x; U++)
      L[U] =
        0 < R ? (S.i(U + C) >>> R) | (S.i(U + C + 1) << (32 - R)) : S.i(U + C);
    return new u(L, S.h);
  }
  ((i.prototype.digest = i.prototype.v),
    (i.prototype.reset = i.prototype.s),
    (i.prototype.update = i.prototype.u),
    (Zw = i),
    (u.prototype.add = u.prototype.add),
    (u.prototype.multiply = u.prototype.j),
    (u.prototype.modulo = u.prototype.A),
    (u.prototype.compare = u.prototype.l),
    (u.prototype.toNumber = u.prototype.m),
    (u.prototype.toString = u.prototype.toString),
    (u.prototype.getBits = u.prototype.i),
    (u.fromNumber = m),
    (u.fromString = v),
    (Vs = u));
}).apply(
  typeof C_ < "u"
    ? C_
    : typeof self < "u"
      ? self
      : typeof window < "u"
        ? window
        : {},
);
var Vc =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
      ? window
      : typeof global < "u"
        ? global
        : typeof self < "u"
          ? self
          : {};
var eE, Nl, tE, Qc, Np, nE, rE, iE;
(function () {
  var n,
    e =
      typeof Object.defineProperties == "function"
        ? Object.defineProperty
        : function (c, g, _) {
            return (
              c == Array.prototype || c == Object.prototype || (c[g] = _.value),
              c
            );
          };
  function t(c) {
    c = [
      typeof globalThis == "object" && globalThis,
      c,
      typeof window == "object" && window,
      typeof self == "object" && self,
      typeof Vc == "object" && Vc,
    ];
    for (var g = 0; g < c.length; ++g) {
      var _ = c[g];
      if (_ && _.Math == Math) return _;
    }
    throw Error("Cannot find global object");
  }
  var i = t(this);
  function o(c, g) {
    if (g)
      e: {
        var _ = i;
        c = c.split(".");
        for (var I = 0; I < c.length - 1; I++) {
          var B = c[I];
          if (!(B in _)) break e;
          _ = _[B];
        }
        ((c = c[c.length - 1]),
          (I = _[c]),
          (g = g(I)),
          g != I &&
            g != null &&
            e(_, c, { configurable: !0, writable: !0, value: g }));
      }
  }
  function a(c, g) {
    c instanceof String && (c += "");
    var _ = 0,
      I = !1,
      B = {
        next: function () {
          if (!I && _ < c.length) {
            var Q = _++;
            return { value: g(Q, c[Q]), done: !1 };
          }
          return ((I = !0), { done: !0, value: void 0 });
        },
      };
    return (
      (B[Symbol.iterator] = function () {
        return B;
      }),
      B
    );
  }
  o("Array.prototype.values", function (c) {
    return (
      c ||
      function () {
        return a(this, function (g, _) {
          return _;
        });
      }
    );
  });
  var u = u || {},
    d = this || self;
  function f(c) {
    var g = typeof c;
    return (
      (g = g != "object" ? g : c ? (Array.isArray(c) ? "array" : g) : "null"),
      g == "array" || (g == "object" && typeof c.length == "number")
    );
  }
  function m(c) {
    var g = typeof c;
    return (g == "object" && c != null) || g == "function";
  }
  function v(c, g, _) {
    return c.call.apply(c.bind, arguments);
  }
  function w(c, g, _) {
    if (!c) throw Error();
    if (2 < arguments.length) {
      var I = Array.prototype.slice.call(arguments, 2);
      return function () {
        var B = Array.prototype.slice.call(arguments);
        return (Array.prototype.unshift.apply(B, I), c.apply(g, B));
      };
    }
    return function () {
      return c.apply(g, arguments);
    };
  }
  function T(c, g, _) {
    return (
      (T =
        Function.prototype.bind &&
        Function.prototype.bind.toString().indexOf("native code") != -1
          ? v
          : w),
      T.apply(null, arguments)
    );
  }
  function A(c, g) {
    var _ = Array.prototype.slice.call(arguments, 1);
    return function () {
      var I = _.slice();
      return (I.push.apply(I, arguments), c.apply(this, I));
    };
  }
  function D(c, g) {
    function _() {}
    ((_.prototype = g.prototype),
      (c.aa = g.prototype),
      (c.prototype = new _()),
      (c.prototype.constructor = c),
      (c.Qb = function (I, B, Q) {
        for (
          var ce = Array(arguments.length - 2), ht = 2;
          ht < arguments.length;
          ht++
        )
          ce[ht - 2] = arguments[ht];
        return g.prototype[B].apply(I, ce);
      }));
  }
  function j(c) {
    const g = c.length;
    if (0 < g) {
      const _ = Array(g);
      for (let I = 0; I < g; I++) _[I] = c[I];
      return _;
    }
    return [];
  }
  function O(c, g) {
    for (let _ = 1; _ < arguments.length; _++) {
      const I = arguments[_];
      if (f(I)) {
        const B = c.length || 0,
          Q = I.length || 0;
        c.length = B + Q;
        for (let ce = 0; ce < Q; ce++) c[B + ce] = I[ce];
      } else c.push(I);
    }
  }
  class X {
    constructor(g, _) {
      ((this.i = g), (this.j = _), (this.h = 0), (this.g = null));
    }
    get() {
      let g;
      return (
        0 < this.h
          ? (this.h--, (g = this.g), (this.g = g.next), (g.next = null))
          : (g = this.i()),
        g
      );
    }
  }
  function q(c) {
    return /^[\s\xa0]*$/.test(c);
  }
  function G() {
    var c = d.navigator;
    return c && (c = c.userAgent) ? c : "";
  }
  function ae(c) {
    return (ae[" "](c), c);
  }
  ae[" "] = function () {};
  var ee =
    G().indexOf("Gecko") != -1 &&
    !(G().toLowerCase().indexOf("webkit") != -1 && G().indexOf("Edge") == -1) &&
    !(G().indexOf("Trident") != -1 || G().indexOf("MSIE") != -1) &&
    G().indexOf("Edge") == -1;
  function he(c, g, _) {
    for (const I in c) g.call(_, c[I], I, c);
  }
  function S(c, g) {
    for (const _ in c) g.call(void 0, c[_], _, c);
  }
  function R(c) {
    const g = {};
    for (const _ in c) g[_] = c[_];
    return g;
  }
  const C =
    "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(
      " ",
    );
  function x(c, g) {
    let _, I;
    for (let B = 1; B < arguments.length; B++) {
      I = arguments[B];
      for (_ in I) c[_] = I[_];
      for (let Q = 0; Q < C.length; Q++)
        ((_ = C[Q]),
          Object.prototype.hasOwnProperty.call(I, _) && (c[_] = I[_]));
    }
  }
  function L(c) {
    var g = 1;
    c = c.split(":");
    const _ = [];
    for (; 0 < g && c.length; ) (_.push(c.shift()), g--);
    return (c.length && _.push(c.join(":")), _);
  }
  function U(c) {
    d.setTimeout(() => {
      throw c;
    }, 0);
  }
  function k() {
    var c = me;
    let g = null;
    return (
      c.g &&
        ((g = c.g), (c.g = c.g.next), c.g || (c.h = null), (g.next = null)),
      g
    );
  }
  class Oe {
    constructor() {
      this.h = this.g = null;
    }
    add(g, _) {
      const I = He.get();
      (I.set(g, _), this.h ? (this.h.next = I) : (this.g = I), (this.h = I));
    }
  }
  var He = new X(
    () => new lt(),
    (c) => c.reset(),
  );
  class lt {
    constructor() {
      this.next = this.g = this.h = null;
    }
    set(g, _) {
      ((this.h = g), (this.g = _), (this.next = null));
    }
    reset() {
      this.next = this.g = this.h = null;
    }
  }
  let Ce,
    oe = !1,
    me = new Oe(),
    de = () => {
      const c = d.Promise.resolve(void 0);
      Ce = () => {
        c.then(V);
      };
    };
  var V = () => {
    for (var c; (c = k()); ) {
      try {
        c.h.call(c.g);
      } catch (_) {
        U(_);
      }
      var g = He;
      (g.j(c), 100 > g.h && (g.h++, (c.next = g.g), (g.g = c)));
    }
    oe = !1;
  };
  function J() {
    ((this.s = this.s), (this.C = this.C));
  }
  ((J.prototype.s = !1),
    (J.prototype.ma = function () {
      this.s || ((this.s = !0), this.N());
    }),
    (J.prototype.N = function () {
      if (this.C) for (; this.C.length; ) this.C.shift()();
    }));
  function ye(c, g) {
    ((this.type = c), (this.g = this.target = g), (this.defaultPrevented = !1));
  }
  ye.prototype.h = function () {
    this.defaultPrevented = !0;
  };
  var Ne = (function () {
    if (!d.addEventListener || !Object.defineProperty) return !1;
    var c = !1,
      g = Object.defineProperty({}, "passive", {
        get: function () {
          c = !0;
        },
      });
    try {
      const _ = () => {};
      (d.addEventListener("test", _, g), d.removeEventListener("test", _, g));
    } catch {}
    return c;
  })();
  function Fe(c, g) {
    if (
      (ye.call(this, c ? c.type : ""),
      (this.relatedTarget = this.g = this.target = null),
      (this.button =
        this.screenY =
        this.screenX =
        this.clientY =
        this.clientX =
          0),
      (this.key = ""),
      (this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1),
      (this.state = null),
      (this.pointerId = 0),
      (this.pointerType = ""),
      (this.i = null),
      c)
    ) {
      var _ = (this.type = c.type),
        I =
          c.changedTouches && c.changedTouches.length
            ? c.changedTouches[0]
            : null;
      if (
        ((this.target = c.target || c.srcElement),
        (this.g = g),
        (g = c.relatedTarget))
      ) {
        if (ee) {
          e: {
            try {
              ae(g.nodeName);
              var B = !0;
              break e;
            } catch {}
            B = !1;
          }
          B || (g = null);
        }
      } else
        _ == "mouseover"
          ? (g = c.fromElement)
          : _ == "mouseout" && (g = c.toElement);
      ((this.relatedTarget = g),
        I
          ? ((this.clientX = I.clientX !== void 0 ? I.clientX : I.pageX),
            (this.clientY = I.clientY !== void 0 ? I.clientY : I.pageY),
            (this.screenX = I.screenX || 0),
            (this.screenY = I.screenY || 0))
          : ((this.clientX = c.clientX !== void 0 ? c.clientX : c.pageX),
            (this.clientY = c.clientY !== void 0 ? c.clientY : c.pageY),
            (this.screenX = c.screenX || 0),
            (this.screenY = c.screenY || 0)),
        (this.button = c.button),
        (this.key = c.key || ""),
        (this.ctrlKey = c.ctrlKey),
        (this.altKey = c.altKey),
        (this.shiftKey = c.shiftKey),
        (this.metaKey = c.metaKey),
        (this.pointerId = c.pointerId || 0),
        (this.pointerType =
          typeof c.pointerType == "string"
            ? c.pointerType
            : We[c.pointerType] || ""),
        (this.state = c.state),
        (this.i = c),
        c.defaultPrevented && Fe.aa.h.call(this));
    }
  }
  D(Fe, ye);
  var We = { 2: "touch", 3: "pen", 4: "mouse" };
  Fe.prototype.h = function () {
    Fe.aa.h.call(this);
    var c = this.i;
    c.preventDefault ? c.preventDefault() : (c.returnValue = !1);
  };
  var Ge = "closure_listenable_" + ((1e6 * Math.random()) | 0),
    tt = 0;
  function dt(c, g, _, I, B) {
    ((this.listener = c),
      (this.proxy = null),
      (this.src = g),
      (this.type = _),
      (this.capture = !!I),
      (this.ha = B),
      (this.key = ++tt),
      (this.da = this.fa = !1));
  }
  function Lt(c) {
    ((c.da = !0),
      (c.listener = null),
      (c.proxy = null),
      (c.src = null),
      (c.ha = null));
  }
  function mt(c) {
    ((this.src = c), (this.g = {}), (this.h = 0));
  }
  mt.prototype.add = function (c, g, _, I, B) {
    var Q = c.toString();
    ((c = this.g[Q]), c || ((c = this.g[Q] = []), this.h++));
    var ce = dr(c, g, I, B);
    return (
      -1 < ce
        ? ((g = c[ce]), _ || (g.fa = !1))
        : ((g = new dt(g, this.src, Q, !!I, B)), (g.fa = _), c.push(g)),
      g
    );
  };
  function Fn(c, g) {
    var _ = g.type;
    if (_ in c.g) {
      var I = c.g[_],
        B = Array.prototype.indexOf.call(I, g, void 0),
        Q;
      ((Q = 0 <= B) && Array.prototype.splice.call(I, B, 1),
        Q && (Lt(g), c.g[_].length == 0 && (delete c.g[_], c.h--)));
    }
  }
  function dr(c, g, _, I) {
    for (var B = 0; B < c.length; ++B) {
      var Q = c[B];
      if (!Q.da && Q.listener == g && Q.capture == !!_ && Q.ha == I) return B;
    }
    return -1;
  }
  var hi = "closure_lm_" + ((1e6 * Math.random()) | 0),
    Rn = {};
  function Ks(c, g, _, I, B) {
    if (Array.isArray(g)) {
      for (var Q = 0; Q < g.length; Q++) Ks(c, g[Q], _, I, B);
      return null;
    }
    return (
      (_ = Gi(_)),
      c && c[Ge] ? c.K(g, _, m(I) ? !!I.capture : !1, B) : Gs(c, g, _, !1, I, B)
    );
  }
  function Gs(c, g, _, I, B, Q) {
    if (!g) throw Error("Invalid event type");
    var ce = m(B) ? !!B.capture : !!B,
      ht = An(c);
    if ((ht || (c[hi] = ht = new mt(c)), (_ = ht.add(g, _, I, ce, Q)), _.proxy))
      return _;
    if (
      ((I = Qs()),
      (_.proxy = I),
      (I.src = c),
      (I.listener = _),
      c.addEventListener)
    )
      (Ne || (B = ce),
        B === void 0 && (B = !1),
        c.addEventListener(g.toString(), I, B));
    else if (c.attachEvent) c.attachEvent(pr(g.toString()), I);
    else if (c.addListener && c.removeListener) c.addListener(I);
    else throw Error("addEventListener and attachEvent are unavailable.");
    return _;
  }
  function Qs() {
    function c(_) {
      return g.call(c.src, c.listener, _);
    }
    const g = Ys;
    return c;
  }
  function Ki(c, g, _, I, B) {
    if (Array.isArray(g))
      for (var Q = 0; Q < g.length; Q++) Ki(c, g[Q], _, I, B);
    else
      ((I = m(I) ? !!I.capture : !!I),
        (_ = Gi(_)),
        c && c[Ge]
          ? ((c = c.i),
            (g = String(g).toString()),
            g in c.g &&
              ((Q = c.g[g]),
              (_ = dr(Q, _, I, B)),
              -1 < _ &&
                (Lt(Q[_]),
                Array.prototype.splice.call(Q, _, 1),
                Q.length == 0 && (delete c.g[g], c.h--))))
          : c &&
            (c = An(c)) &&
            ((g = c.g[g.toString()]),
            (c = -1),
            g && (c = dr(g, _, I, B)),
            (_ = -1 < c ? g[c] : null) && fr(_)));
  }
  function fr(c) {
    if (typeof c != "number" && c && !c.da) {
      var g = c.src;
      if (g && g[Ge]) Fn(g.i, c);
      else {
        var _ = c.type,
          I = c.proxy;
        (g.removeEventListener
          ? g.removeEventListener(_, I, c.capture)
          : g.detachEvent
            ? g.detachEvent(pr(_), I)
            : g.addListener && g.removeListener && g.removeListener(I),
          (_ = An(g))
            ? (Fn(_, c), _.h == 0 && ((_.src = null), (g[hi] = null)))
            : Lt(c));
      }
    }
  }
  function pr(c) {
    return c in Rn ? Rn[c] : (Rn[c] = "on" + c);
  }
  function Ys(c, g) {
    if (c.da) c = !0;
    else {
      g = new Fe(g, this);
      var _ = c.listener,
        I = c.ha || c.src;
      (c.fa && fr(c), (c = _.call(I, g)));
    }
    return c;
  }
  function An(c) {
    return ((c = c[hi]), c instanceof mt ? c : null);
  }
  var Gn = "__closure_events_fn_" + ((1e9 * Math.random()) >>> 0);
  function Gi(c) {
    return typeof c == "function"
      ? c
      : (c[Gn] ||
          (c[Gn] = function (g) {
            return c.handleEvent(g);
          }),
        c[Gn]);
  }
  function It() {
    (J.call(this), (this.i = new mt(this)), (this.M = this), (this.F = null));
  }
  (D(It, J),
    (It.prototype[Ge] = !0),
    (It.prototype.removeEventListener = function (c, g, _, I) {
      Ki(this, c, g, _, I);
    }));
  function ut(c, g) {
    var _,
      I = c.F;
    if (I) for (_ = []; I; I = I.F) _.push(I);
    if (((c = c.M), (I = g.type || g), typeof g == "string")) g = new ye(g, c);
    else if (g instanceof ye) g.target = g.target || c;
    else {
      var B = g;
      ((g = new ye(I, c)), x(g, B));
    }
    if (((B = !0), _))
      for (var Q = _.length - 1; 0 <= Q; Q--) {
        var ce = (g.g = _[Q]);
        B = jt(ce, I, !0, g) && B;
      }
    if (
      ((ce = g.g = c),
      (B = jt(ce, I, !0, g) && B),
      (B = jt(ce, I, !1, g) && B),
      _)
    )
      for (Q = 0; Q < _.length; Q++)
        ((ce = g.g = _[Q]), (B = jt(ce, I, !1, g) && B));
  }
  ((It.prototype.N = function () {
    if ((It.aa.N.call(this), this.i)) {
      var c = this.i,
        g;
      for (g in c.g) {
        for (var _ = c.g[g], I = 0; I < _.length; I++) Lt(_[I]);
        (delete c.g[g], c.h--);
      }
    }
    this.F = null;
  }),
    (It.prototype.K = function (c, g, _, I) {
      return this.i.add(String(c), g, !1, _, I);
    }),
    (It.prototype.L = function (c, g, _, I) {
      return this.i.add(String(c), g, !0, _, I);
    }));
  function jt(c, g, _, I) {
    if (((g = c.i.g[String(g)]), !g)) return !0;
    g = g.concat();
    for (var B = !0, Q = 0; Q < g.length; ++Q) {
      var ce = g[Q];
      if (ce && !ce.da && ce.capture == _) {
        var ht = ce.listener,
          Bt = ce.ha || ce.src;
        (ce.fa && Fn(c.i, ce), (B = ht.call(Bt, I) !== !1 && B));
      }
    }
    return B && !I.defaultPrevented;
  }
  function Qi(c, g, _) {
    if (typeof c == "function") _ && (c = T(c, _));
    else if (c && typeof c.handleEvent == "function") c = T(c.handleEvent, c);
    else throw Error("Invalid listener argument");
    return 2147483647 < Number(g) ? -1 : d.setTimeout(c, g || 0);
  }
  function Lr(c) {
    c.g = Qi(() => {
      ((c.g = null), c.i && ((c.i = !1), Lr(c)));
    }, c.l);
    const g = c.h;
    ((c.h = null), c.m.apply(null, g));
  }
  class mr extends J {
    constructor(g, _) {
      (super(),
        (this.m = g),
        (this.l = _),
        (this.h = null),
        (this.i = !1),
        (this.g = null));
    }
    j(g) {
      ((this.h = arguments), this.g ? (this.i = !0) : Lr(this));
    }
    N() {
      (super.N(),
        this.g &&
          (d.clearTimeout(this.g),
          (this.g = null),
          (this.i = !1),
          (this.h = null)));
    }
  }
  function di(c) {
    (J.call(this), (this.h = c), (this.g = {}));
  }
  D(di, J);
  var vn = [];
  function Yi(c) {
    (he(
      c.g,
      function (g, _) {
        this.g.hasOwnProperty(_) && fr(g);
      },
      c,
    ),
      (c.g = {}));
  }
  ((di.prototype.N = function () {
    (di.aa.N.call(this), Yi(this));
  }),
    (di.prototype.handleEvent = function () {
      throw Error("EventHandler.handleEvent not implemented");
    }));
  var Xi = d.JSON.stringify,
    Ji = d.JSON.parse,
    Xs = class {
      stringify(c) {
        return d.JSON.stringify(c, void 0);
      }
      parse(c) {
        return d.JSON.parse(c, void 0);
      }
    };
  function Mr() {}
  Mr.prototype.h = null;
  function gr(c) {
    return c.h || (c.h = c.i());
  }
  function fi() {}
  var un = { OPEN: "a", kb: "b", Ja: "c", wb: "d" };
  function Qn() {
    ye.call(this, "d");
  }
  D(Qn, ye);
  function pi() {
    ye.call(this, "c");
  }
  D(pi, ye);
  var Yn = {},
    Zi = null;
  function Xn() {
    return (Zi = Zi || new It());
  }
  Yn.La = "serverreachability";
  function Vr(c) {
    ye.call(this, Yn.La, c);
  }
  D(Vr, ye);
  function Jn(c) {
    const g = Xn();
    ut(g, new Vr(g));
  }
  Yn.STAT_EVENT = "statevent";
  function Js(c, g) {
    (ye.call(this, Yn.STAT_EVENT, c), (this.stat = g));
  }
  D(Js, ye);
  function Rt(c) {
    const g = Xn();
    ut(g, new Js(g, c));
  }
  Yn.Ma = "timingevent";
  function b(c, g) {
    (ye.call(this, Yn.Ma, c), (this.size = g));
  }
  D(b, ye);
  function F(c, g) {
    if (typeof c != "function")
      throw Error("Fn must not be null and must be a function");
    return d.setTimeout(function () {
      c();
    }, g);
  }
  function W() {
    this.g = !0;
  }
  W.prototype.xa = function () {
    this.g = !1;
  };
  function ne(c, g, _, I, B, Q) {
    c.info(function () {
      if (c.g)
        if (Q)
          for (var ce = "", ht = Q.split("&"), Bt = 0; Bt < ht.length; Bt++) {
            var Ze = ht[Bt].split("=");
            if (1 < Ze.length) {
              var Kt = Ze[0];
              Ze = Ze[1];
              var Vt = Kt.split("_");
              ce =
                2 <= Vt.length && Vt[1] == "type"
                  ? ce + (Kt + "=" + Ze + "&")
                  : ce + (Kt + "=redacted&");
            }
          }
        else ce = null;
      else ce = Q;
      return (
        "XMLHTTP REQ (" +
        I +
        ") [attempt " +
        B +
        "]: " +
        g +
        `
` +
        _ +
        `
` +
        ce
      );
    });
  }
  function ue(c, g, _, I, B, Q, ce) {
    c.info(function () {
      return (
        "XMLHTTP RESP (" +
        I +
        ") [ attempt " +
        B +
        "]: " +
        g +
        `
` +
        _ +
        `
` +
        Q +
        " " +
        ce
      );
    });
  }
  function ge(c, g, _, I) {
    c.info(function () {
      return "XMLHTTP TEXT (" + g + "): " + Ee(c, _) + (I ? " " + I : "");
    });
  }
  function Se(c, g) {
    c.info(function () {
      return "TIMEOUT: " + g;
    });
  }
  W.prototype.info = function () {};
  function Ee(c, g) {
    if (!c.g) return g;
    if (!g) return null;
    try {
      var _ = JSON.parse(g);
      if (_) {
        for (c = 0; c < _.length; c++)
          if (Array.isArray(_[c])) {
            var I = _[c];
            if (!(2 > I.length)) {
              var B = I[1];
              if (Array.isArray(B) && !(1 > B.length)) {
                var Q = B[0];
                if (Q != "noop" && Q != "stop" && Q != "close")
                  for (var ce = 1; ce < B.length; ce++) B[ce] = "";
              }
            }
          }
      }
      return Xi(_);
    } catch {
      return g;
    }
  }
  var Te = {
      NO_ERROR: 0,
      gb: 1,
      tb: 2,
      sb: 3,
      nb: 4,
      rb: 5,
      ub: 6,
      Ia: 7,
      TIMEOUT: 8,
      xb: 9,
    },
    Pe = {
      lb: "complete",
      Hb: "success",
      Ja: "error",
      Ia: "abort",
      zb: "ready",
      Ab: "readystatechange",
      TIMEOUT: "timeout",
      vb: "incrementaldata",
      yb: "progress",
      ob: "downloadprogress",
      Pb: "uploadprogress",
    },
    ve;
  function Ie() {}
  (D(Ie, Mr),
    (Ie.prototype.g = function () {
      return new XMLHttpRequest();
    }),
    (Ie.prototype.i = function () {
      return {};
    }),
    (ve = new Ie()));
  function Ue(c, g, _, I) {
    ((this.j = c),
      (this.i = g),
      (this.l = _),
      (this.R = I || 1),
      (this.U = new di(this)),
      (this.I = 45e3),
      (this.H = null),
      (this.o = !1),
      (this.m = this.A = this.v = this.L = this.F = this.S = this.B = null),
      (this.D = []),
      (this.g = null),
      (this.C = 0),
      (this.s = this.u = null),
      (this.X = -1),
      (this.J = !1),
      (this.O = 0),
      (this.M = null),
      (this.W = this.K = this.T = this.P = !1),
      (this.h = new ct()));
  }
  function ct() {
    ((this.i = null), (this.g = ""), (this.h = !1));
  }
  var yt = {},
    vt = {};
  function rt(c, g, _) {
    ((c.L = 1), (c.v = is(Un(g))), (c.m = _), (c.P = !0), st(c, null));
  }
  function st(c, g) {
    ((c.F = Date.now()), Xe(c), (c.A = Un(c.v)));
    var _ = c.A,
      I = c.R;
    (Array.isArray(I) || (I = [String(I)]),
      os(_.i, "t", I),
      (c.C = 0),
      (_ = c.j.J),
      (c.h = new ct()),
      (c.g = Lu(c.j, _ ? g : null, !c.m)),
      0 < c.O && (c.M = new mr(T(c.Y, c, c.g), c.O)),
      (g = c.U),
      (_ = c.g),
      (I = c.ca));
    var B = "readystatechange";
    Array.isArray(B) || (B && (vn[0] = B.toString()), (B = vn));
    for (var Q = 0; Q < B.length; Q++) {
      var ce = Ks(_, B[Q], I || g.handleEvent, !1, g.h || g);
      if (!ce) break;
      g.g[ce.key] = ce;
    }
    ((g = c.H ? R(c.H) : {}),
      c.m
        ? (c.u || (c.u = "POST"),
          (g["Content-Type"] = "application/x-www-form-urlencoded"),
          c.g.ea(c.A, c.u, c.m, g))
        : ((c.u = "GET"), c.g.ea(c.A, c.u, null, g)),
      Jn(),
      ne(c.i, c.u, c.A, c.l, c.R, c.m));
  }
  ((Ue.prototype.ca = function (c) {
    c = c.target;
    const g = this.M;
    g && kn(c) == 3 ? g.j() : this.Y(c);
  }),
    (Ue.prototype.Y = function (c) {
      try {
        if (c == this.g)
          e: {
            const Vt = kn(this.g);
            var g = this.g.Ba();
            const tr = this.g.Z();
            if (
              !(3 > Vt) &&
              (Vt != 3 || (this.g && (this.h.h || this.g.oa() || Xa(this.g))))
            ) {
              (this.J ||
                Vt != 4 ||
                g == 7 ||
                (g == 8 || 0 >= tr ? Jn(3) : Jn(2)),
                yr(this));
              var _ = this.g.Z();
              this.X = _;
              t: if (Zn(this)) {
                var I = Xa(this.g);
                c = "";
                var B = I.length,
                  Q = kn(this.g) == 4;
                if (!this.h.i) {
                  if (typeof TextDecoder > "u") {
                    (Mt(this), Cn(this));
                    var ce = "";
                    break t;
                  }
                  this.h.i = new d.TextDecoder();
                }
                for (g = 0; g < B; g++)
                  ((this.h.h = !0),
                    (c += this.h.i.decode(I[g], {
                      stream: !(Q && g == B - 1),
                    })));
                ((I.length = 0),
                  (this.h.g += c),
                  (this.C = 0),
                  (ce = this.h.g));
              } else ce = this.g.oa();
              if (
                ((this.o = _ == 200),
                ue(this.i, this.u, this.A, this.l, this.R, Vt, _),
                this.o)
              ) {
                if (this.T && !this.K) {
                  t: {
                    if (this.g) {
                      var ht,
                        Bt = this.g;
                      if (
                        (ht = Bt.g
                          ? Bt.g.getResponseHeader("X-HTTP-Initial-Response")
                          : null) &&
                        !q(ht)
                      ) {
                        var Ze = ht;
                        break t;
                      }
                    }
                    Ze = null;
                  }
                  if ((_ = Ze))
                    (ge(
                      this.i,
                      this.l,
                      _,
                      "Initial handshake response via X-HTTP-Initial-Response",
                    ),
                      (this.K = !0),
                      Fr(this, _));
                  else {
                    ((this.o = !1), (this.s = 3), Rt(12), Mt(this), Cn(this));
                    break e;
                  }
                }
                if (this.P) {
                  _ = !0;
                  let jn;
                  for (; !this.J && this.C < ce.length; )
                    if (((jn = mi(this, ce)), jn == vt)) {
                      (Vt == 4 && ((this.s = 4), Rt(14), (_ = !1)),
                        ge(this.i, this.l, null, "[Incomplete Response]"));
                      break;
                    } else if (jn == yt) {
                      ((this.s = 4),
                        Rt(15),
                        ge(this.i, this.l, ce, "[Invalid Chunk]"),
                        (_ = !1));
                      break;
                    } else (ge(this.i, this.l, jn, null), Fr(this, jn));
                  if (
                    (Zn(this) &&
                      this.C != 0 &&
                      ((this.h.g = this.h.g.slice(this.C)), (this.C = 0)),
                    Vt != 4 ||
                      ce.length != 0 ||
                      this.h.h ||
                      ((this.s = 1), Rt(16), (_ = !1)),
                    (this.o = this.o && _),
                    !_)
                  )
                    (ge(this.i, this.l, ce, "[Invalid Chunked Response]"),
                      Mt(this),
                      Cn(this));
                  else if (0 < ce.length && !this.W) {
                    this.W = !0;
                    var Kt = this.j;
                    Kt.g == this &&
                      Kt.ba &&
                      !Kt.M &&
                      (Kt.j.info(
                        "Great, no buffering proxy detected. Bytes received: " +
                          ce.length,
                      ),
                      Za(Kt),
                      (Kt.M = !0),
                      Rt(11));
                  }
                } else (ge(this.i, this.l, ce, null), Fr(this, ce));
                (Vt == 4 && Mt(this),
                  this.o &&
                    !this.J &&
                    (Vt == 4 ? qo(this.j, this) : ((this.o = !1), Xe(this))));
              } else
                (jo(this.g),
                  _ == 400 && 0 < ce.indexOf("Unknown SID")
                    ? ((this.s = 3), Rt(12))
                    : ((this.s = 0), Rt(13)),
                  Mt(this),
                  Cn(this));
            }
          }
      } catch {
      } finally {
      }
    }));
  function Zn(c) {
    return c.g ? c.u == "GET" && c.L != 2 && c.j.Ca : !1;
  }
  function mi(c, g) {
    var _ = c.C,
      I = g.indexOf(
        `
`,
        _,
      );
    return I == -1
      ? vt
      : ((_ = Number(g.substring(_, I))),
        isNaN(_)
          ? yt
          : ((I += 1),
            I + _ > g.length
              ? vt
              : ((g = g.slice(I, I + _)), (c.C = I + _), g)));
  }
  Ue.prototype.cancel = function () {
    ((this.J = !0), Mt(this));
  };
  function Xe(c) {
    ((c.S = Date.now() + c.I), _n(c, c.I));
  }
  function _n(c, g) {
    if (c.B != null) throw Error("WatchDog timer not null");
    c.B = F(T(c.ba, c), g);
  }
  function yr(c) {
    c.B && (d.clearTimeout(c.B), (c.B = null));
  }
  Ue.prototype.ba = function () {
    this.B = null;
    const c = Date.now();
    0 <= c - this.S
      ? (Se(this.i, this.A),
        this.L != 2 && (Jn(), Rt(17)),
        Mt(this),
        (this.s = 2),
        Cn(this))
      : _n(this, this.S - c);
  };
  function Cn(c) {
    c.j.G == 0 || c.J || qo(c.j, c);
  }
  function Mt(c) {
    yr(c);
    var g = c.M;
    (g && typeof g.ma == "function" && g.ma(),
      (c.M = null),
      Yi(c.U),
      c.g && ((g = c.g), (c.g = null), g.abort(), g.ma()));
  }
  function Fr(c, g) {
    try {
      var _ = c.j;
      if (_.G != 0 && (_.g == c || At(_.h, c))) {
        if (!c.K && At(_.h, c) && _.G == 3) {
          try {
            var I = _.Da.g.parse(g);
          } catch {
            I = null;
          }
          if (Array.isArray(I) && I.length == 3) {
            var B = I;
            if (B[0] == 0) {
              e: if (!_.u) {
                if (_.g)
                  if (_.g.F + 3e3 < c.F) (Wo(_), Sr(_));
                  else break e;
                (Ho(_), Rt(18));
              }
            } else
              ((_.za = B[1]),
                0 < _.za - _.T &&
                  37500 > B[2] &&
                  _.F &&
                  _.v == 0 &&
                  !_.C &&
                  (_.C = F(T(_.Za, _), 6e3)));
            if (1 >= vr(_.h) && _.ca) {
              try {
                _.ca();
              } catch {}
              _.ca = void 0;
            }
          } else Ti(_, 11);
        } else if (((c.K || _.g == c) && Wo(_), !q(g)))
          for (B = _.Da.g.parse(g), g = 0; g < B.length; g++) {
            let Ze = B[g];
            if (((_.T = Ze[0]), (Ze = Ze[1]), _.G == 2))
              if (Ze[0] == "c") {
                ((_.K = Ze[1]), (_.ia = Ze[2]));
                const Kt = Ze[3];
                Kt != null && ((_.la = Kt), _.j.info("VER=" + _.la));
                const Vt = Ze[4];
                Vt != null && ((_.Aa = Vt), _.j.info("SVER=" + _.Aa));
                const tr = Ze[5];
                (tr != null &&
                  typeof tr == "number" &&
                  0 < tr &&
                  ((I = 1.5 * tr),
                  (_.L = I),
                  _.j.info("backChannelRequestTimeoutMs_=" + I)),
                  (I = _));
                const jn = c.g;
                if (jn) {
                  const so = jn.g
                    ? jn.g.getResponseHeader("X-Client-Wire-Protocol")
                    : null;
                  if (so) {
                    var Q = I.h;
                    Q.g ||
                      (so.indexOf("spdy") == -1 &&
                        so.indexOf("quic") == -1 &&
                        so.indexOf("h2") == -1) ||
                      ((Q.j = Q.l),
                      (Q.g = new Set()),
                      Q.h && (ft(Q, Q.h), (Q.h = null)));
                  }
                  if (I.D) {
                    const Go = jn.g
                      ? jn.g.getResponseHeader("X-HTTP-Session-Id")
                      : null;
                    Go && ((I.ya = Go), pt(I.I, I.D, Go));
                  }
                }
                ((_.G = 3),
                  _.l && _.l.ua(),
                  _.ba &&
                    ((_.R = Date.now() - c.F),
                    _.j.info("Handshake RTT: " + _.R + "ms")),
                  (I = _));
                var ce = c;
                if (((I.qa = Ou(I, I.J ? I.ia : null, I.W)), ce.K)) {
                  yi(I.h, ce);
                  var ht = ce,
                    Bt = I.L;
                  (Bt && (ht.I = Bt), ht.B && (yr(ht), Xe(ht)), (I.g = ce));
                } else io(I);
                0 < _.i.length && Br(_);
              } else (Ze[0] != "stop" && Ze[0] != "close") || Ti(_, 7);
            else
              _.G == 3 &&
                (Ze[0] == "stop" || Ze[0] == "close"
                  ? Ze[0] == "stop"
                    ? Ti(_, 7)
                    : en(_)
                  : Ze[0] != "noop" && _.l && _.l.ta(Ze),
                (_.v = 0));
          }
      }
      Jn(4);
    } catch {}
  }
  var gi = class {
    constructor(c, g) {
      ((this.g = c), (this.map = g));
    }
  };
  function $e(c) {
    ((this.l = c || 10),
      d.PerformanceNavigationTiming
        ? ((c = d.performance.getEntriesByType("navigation")),
          (c =
            0 < c.length &&
            (c[0].nextHopProtocol == "hq" || c[0].nextHopProtocol == "h2")))
        : (c = !!(
            d.chrome &&
            d.chrome.loadTimes &&
            d.chrome.loadTimes() &&
            d.chrome.loadTimes().wasFetchedViaSpdy
          )),
      (this.j = c ? this.l : 1),
      (this.g = null),
      1 < this.j && (this.g = new Set()),
      (this.h = null),
      (this.i = []));
  }
  function ot(c) {
    return c.h ? !0 : c.g ? c.g.size >= c.j : !1;
  }
  function vr(c) {
    return c.h ? 1 : c.g ? c.g.size : 0;
  }
  function At(c, g) {
    return c.h ? c.h == g : c.g ? c.g.has(g) : !1;
  }
  function ft(c, g) {
    c.g ? c.g.add(g) : (c.h = g);
  }
  function yi(c, g) {
    c.h && c.h == g ? (c.h = null) : c.g && c.g.has(g) && c.g.delete(g);
  }
  $e.prototype.cancel = function () {
    if (((this.i = Zs(this)), this.h)) (this.h.cancel(), (this.h = null));
    else if (this.g && this.g.size !== 0) {
      for (const c of this.g.values()) c.cancel();
      this.g.clear();
    }
  };
  function Zs(c) {
    if (c.h != null) return c.i.concat(c.h.D);
    if (c.g != null && c.g.size !== 0) {
      let g = c.i;
      for (const _ of c.g.values()) g = g.concat(_.D);
      return g;
    }
    return j(c.i);
  }
  function es(c) {
    if (c.V && typeof c.V == "function") return c.V();
    if (
      (typeof Map < "u" && c instanceof Map) ||
      (typeof Set < "u" && c instanceof Set)
    )
      return Array.from(c.values());
    if (typeof c == "string") return c.split("");
    if (f(c)) {
      for (var g = [], _ = c.length, I = 0; I < _; I++) g.push(c[I]);
      return g;
    }
    ((g = []), (_ = 0));
    for (I in c) g[_++] = c[I];
    return g;
  }
  function Vo(c) {
    if (c.na && typeof c.na == "function") return c.na();
    if (!c.V || typeof c.V != "function") {
      if (typeof Map < "u" && c instanceof Map) return Array.from(c.keys());
      if (!(typeof Set < "u" && c instanceof Set)) {
        if (f(c) || typeof c == "string") {
          var g = [];
          c = c.length;
          for (var _ = 0; _ < c; _++) g.push(_);
          return g;
        }
        ((g = []), (_ = 0));
        for (const I in c) g[_++] = I;
        return g;
      }
    }
  }
  function ts(c, g) {
    if (c.forEach && typeof c.forEach == "function") c.forEach(g, void 0);
    else if (f(c) || typeof c == "string")
      Array.prototype.forEach.call(c, g, void 0);
    else
      for (var _ = Vo(c), I = es(c), B = I.length, Q = 0; Q < B; Q++)
        g.call(void 0, I[Q], _ && _[Q], c);
  }
  var eo = RegExp(
    "^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$",
  );
  function cd(c, g) {
    if (c) {
      c = c.split("&");
      for (var _ = 0; _ < c.length; _++) {
        var I = c[_].indexOf("="),
          B = null;
        if (0 <= I) {
          var Q = c[_].substring(0, I);
          B = c[_].substring(I + 1);
        } else Q = c[_];
        g(Q, B ? decodeURIComponent(B.replace(/\+/g, " ")) : "");
      }
    }
  }
  function vi(c) {
    if (
      ((this.g = this.o = this.j = ""),
      (this.s = null),
      (this.m = this.l = ""),
      (this.h = !1),
      c instanceof vi)
    ) {
      ((this.h = c.h),
        to(this, c.j),
        (this.o = c.o),
        (this.g = c.g),
        ns(this, c.s),
        (this.l = c.l));
      var g = c.i,
        _ = new Ur();
      ((_.i = g.i),
        g.g && ((_.g = new Map(g.g)), (_.h = g.h)),
        rs(this, _),
        (this.m = c.m));
    } else
      c && (g = String(c).match(eo))
        ? ((this.h = !1),
          to(this, g[1] || "", !0),
          (this.o = Je(g[2] || "")),
          (this.g = Je(g[3] || "", !0)),
          ns(this, g[4]),
          (this.l = Je(g[5] || "", !0)),
          rs(this, g[6] || "", !0),
          (this.m = Je(g[7] || "")))
        : ((this.h = !1), (this.i = new Ur(null, this.h)));
  }
  vi.prototype.toString = function () {
    var c = [],
      g = this.j;
    g && c.push(ss(g, Fo, !0), ":");
    var _ = this.g;
    return (
      (_ || g == "file") &&
        (c.push("//"),
        (g = this.o) && c.push(ss(g, Fo, !0), "@"),
        c.push(
          encodeURIComponent(String(_)).replace(/%25([0-9a-fA-F]{2})/g, "%$1"),
        ),
        (_ = this.s),
        _ != null && c.push(":", String(_))),
      (_ = this.l) &&
        (this.g && _.charAt(0) != "/" && c.push("/"),
        c.push(ss(_, _.charAt(0) == "/" ? Au : Ru, !0))),
      (_ = this.i.toString()) && c.push("?", _),
      (_ = this.m) && c.push("#", ss(_, Ga)),
      c.join("")
    );
  };
  function Un(c) {
    return new vi(c);
  }
  function to(c, g, _) {
    ((c.j = _ ? Je(g, !0) : g), c.j && (c.j = c.j.replace(/:$/, "")));
  }
  function ns(c, g) {
    if (g) {
      if (((g = Number(g)), isNaN(g) || 0 > g))
        throw Error("Bad port number " + g);
      c.s = g;
    } else c.s = null;
  }
  function rs(c, g, _) {
    g instanceof Ur
      ? ((c.i = g), zr(c.i, c.h))
      : (_ || (g = ss(g, Cu)), (c.i = new Ur(g, c.h)));
  }
  function pt(c, g, _) {
    c.i.set(g, _);
  }
  function is(c) {
    return (
      pt(
        c,
        "zx",
        Math.floor(2147483648 * Math.random()).toString(36) +
          Math.abs(
            Math.floor(2147483648 * Math.random()) ^ Date.now(),
          ).toString(36),
      ),
      c
    );
  }
  function Je(c, g) {
    return c
      ? g
        ? decodeURI(c.replace(/%25/g, "%2525"))
        : decodeURIComponent(c)
      : "";
  }
  function ss(c, g, _) {
    return typeof c == "string"
      ? ((c = encodeURI(c).replace(g, Iu)),
        _ && (c = c.replace(/%25([0-9a-fA-F]{2})/g, "%$1")),
        c)
      : null;
  }
  function Iu(c) {
    return (
      (c = c.charCodeAt(0)),
      "%" + ((c >> 4) & 15).toString(16) + (c & 15).toString(16)
    );
  }
  var Fo = /[#\/\?@]/g,
    Ru = /[#\?:]/g,
    Au = /[#\?]/g,
    Cu = /[#\?@]/g,
    Ga = /#/g;
  function Ur(c, g) {
    ((this.h = this.g = null), (this.i = c || null), (this.j = !!g));
  }
  function Zt(c) {
    c.g ||
      ((c.g = new Map()),
      (c.h = 0),
      c.i &&
        cd(c.i, function (g, _) {
          c.add(decodeURIComponent(g.replace(/\+/g, " ")), _);
        }));
  }
  ((n = Ur.prototype),
    (n.add = function (c, g) {
      (Zt(this), (this.i = null), (c = er(this, c)));
      var _ = this.g.get(c);
      return (_ || this.g.set(c, (_ = [])), _.push(g), (this.h += 1), this);
    }));
  function _r(c, g) {
    (Zt(c),
      (g = er(c, g)),
      c.g.has(g) && ((c.i = null), (c.h -= c.g.get(g).length), c.g.delete(g)));
  }
  function wr(c, g) {
    return (Zt(c), (g = er(c, g)), c.g.has(g));
  }
  ((n.forEach = function (c, g) {
    (Zt(this),
      this.g.forEach(function (_, I) {
        _.forEach(function (B) {
          c.call(g, B, I, this);
        }, this);
      }, this));
  }),
    (n.na = function () {
      Zt(this);
      const c = Array.from(this.g.values()),
        g = Array.from(this.g.keys()),
        _ = [];
      for (let I = 0; I < g.length; I++) {
        const B = c[I];
        for (let Q = 0; Q < B.length; Q++) _.push(g[I]);
      }
      return _;
    }),
    (n.V = function (c) {
      Zt(this);
      let g = [];
      if (typeof c == "string")
        wr(this, c) && (g = g.concat(this.g.get(er(this, c))));
      else {
        c = Array.from(this.g.values());
        for (let _ = 0; _ < c.length; _++) g = g.concat(c[_]);
      }
      return g;
    }),
    (n.set = function (c, g) {
      return (
        Zt(this),
        (this.i = null),
        (c = er(this, c)),
        wr(this, c) && (this.h -= this.g.get(c).length),
        this.g.set(c, [g]),
        (this.h += 1),
        this
      );
    }),
    (n.get = function (c, g) {
      return c ? ((c = this.V(c)), 0 < c.length ? String(c[0]) : g) : g;
    }));
  function os(c, g, _) {
    (_r(c, g),
      0 < _.length &&
        ((c.i = null), c.g.set(er(c, g), j(_)), (c.h += _.length)));
  }
  n.toString = function () {
    if (this.i) return this.i;
    if (!this.g) return "";
    const c = [],
      g = Array.from(this.g.keys());
    for (var _ = 0; _ < g.length; _++) {
      var I = g[_];
      const Q = encodeURIComponent(String(I)),
        ce = this.V(I);
      for (I = 0; I < ce.length; I++) {
        var B = Q;
        (ce[I] !== "" && (B += "=" + encodeURIComponent(String(ce[I]))),
          c.push(B));
      }
    }
    return (this.i = c.join("&"));
  };
  function er(c, g) {
    return ((g = String(g)), c.j && (g = g.toLowerCase()), g);
  }
  function zr(c, g) {
    (g &&
      !c.j &&
      (Zt(c),
      (c.i = null),
      c.g.forEach(function (_, I) {
        var B = I.toLowerCase();
        I != B && (_r(this, I), os(this, B, _));
      }, c)),
      (c.j = g));
  }
  function hd(c, g) {
    const _ = new W();
    if (d.Image) {
      const I = new Image();
      ((I.onload = A(Pn, _, "TestLoadImage: loaded", !0, g, I)),
        (I.onerror = A(Pn, _, "TestLoadImage: error", !1, g, I)),
        (I.onabort = A(Pn, _, "TestLoadImage: abort", !1, g, I)),
        (I.ontimeout = A(Pn, _, "TestLoadImage: timeout", !1, g, I)),
        d.setTimeout(function () {
          I.ontimeout && I.ontimeout();
        }, 1e4),
        (I.src = c));
    } else g(!1);
  }
  function Pu(c, g) {
    const _ = new W(),
      I = new AbortController(),
      B = setTimeout(() => {
        (I.abort(), Pn(_, "TestPingServer: timeout", !1, g));
      }, 1e4);
    fetch(c, { signal: I.signal })
      .then((Q) => {
        (clearTimeout(B),
          Q.ok
            ? Pn(_, "TestPingServer: ok", !0, g)
            : Pn(_, "TestPingServer: server error", !1, g));
      })
      .catch(() => {
        (clearTimeout(B), Pn(_, "TestPingServer: error", !1, g));
      });
  }
  function Pn(c, g, _, I, B) {
    try {
      (B &&
        ((B.onload = null),
        (B.onerror = null),
        (B.onabort = null),
        (B.ontimeout = null)),
        I(_));
    } catch {}
  }
  function dd() {
    this.g = new Xs();
  }
  function ku(c, g, _) {
    const I = _ || "";
    try {
      ts(c, function (B, Q) {
        let ce = B;
        (m(B) && (ce = Xi(B)), g.push(I + Q + "=" + encodeURIComponent(ce)));
      });
    } catch (B) {
      throw (g.push(I + "type=" + encodeURIComponent("_badmap")), B);
    }
  }
  function _i(c) {
    ((this.l = c.Ub || null), (this.j = c.eb || !1));
  }
  (D(_i, Mr),
    (_i.prototype.g = function () {
      return new no(this.l, this.j);
    }),
    (_i.prototype.i = (function (c) {
      return function () {
        return c;
      };
    })({})));
  function no(c, g) {
    (It.call(this),
      (this.D = c),
      (this.o = g),
      (this.m = void 0),
      (this.status = this.readyState = 0),
      (this.responseType =
        this.responseText =
        this.response =
        this.statusText =
          ""),
      (this.onreadystatechange = null),
      (this.u = new Headers()),
      (this.h = null),
      (this.B = "GET"),
      (this.A = ""),
      (this.g = !1),
      (this.v = this.j = this.l = null));
  }
  (D(no, It),
    (n = no.prototype),
    (n.open = function (c, g) {
      if (this.readyState != 0)
        throw (this.abort(), Error("Error reopening a connection"));
      ((this.B = c), (this.A = g), (this.readyState = 1), Tr(this));
    }),
    (n.send = function (c) {
      if (this.readyState != 1)
        throw (this.abort(), Error("need to call open() first. "));
      this.g = !0;
      const g = {
        headers: this.u,
        method: this.B,
        credentials: this.m,
        cache: void 0,
      };
      (c && (g.body = c),
        (this.D || d)
          .fetch(new Request(this.A, g))
          .then(this.Sa.bind(this), this.ga.bind(this)));
    }),
    (n.abort = function () {
      ((this.response = this.responseText = ""),
        (this.u = new Headers()),
        (this.status = 0),
        this.j && this.j.cancel("Request was aborted.").catch(() => {}),
        1 <= this.readyState &&
          this.g &&
          this.readyState != 4 &&
          ((this.g = !1), Er(this)),
        (this.readyState = 0));
    }),
    (n.Sa = function (c) {
      if (
        this.g &&
        ((this.l = c),
        this.h ||
          ((this.status = this.l.status),
          (this.statusText = this.l.statusText),
          (this.h = c.headers),
          (this.readyState = 2),
          Tr(this)),
        this.g && ((this.readyState = 3), Tr(this), this.g))
      )
        if (this.responseType === "arraybuffer")
          c.arrayBuffer().then(this.Qa.bind(this), this.ga.bind(this));
        else if (typeof d.ReadableStream < "u" && "body" in c) {
          if (((this.j = c.body.getReader()), this.o)) {
            if (this.responseType)
              throw Error(
                'responseType must be empty for "streamBinaryChunks" mode responses.',
              );
            this.response = [];
          } else
            ((this.response = this.responseText = ""),
              (this.v = new TextDecoder()));
          xu(this);
        } else c.text().then(this.Ra.bind(this), this.ga.bind(this));
    }));
  function xu(c) {
    c.j.read().then(c.Pa.bind(c)).catch(c.ga.bind(c));
  }
  ((n.Pa = function (c) {
    if (this.g) {
      if (this.o && c.value) this.response.push(c.value);
      else if (!this.o) {
        var g = c.value ? c.value : new Uint8Array(0);
        (g = this.v.decode(g, { stream: !c.done })) &&
          (this.response = this.responseText += g);
      }
      (c.done ? Er(this) : Tr(this), this.readyState == 3 && xu(this));
    }
  }),
    (n.Ra = function (c) {
      this.g && ((this.response = this.responseText = c), Er(this));
    }),
    (n.Qa = function (c) {
      this.g && ((this.response = c), Er(this));
    }),
    (n.ga = function () {
      this.g && Er(this);
    }));
  function Er(c) {
    ((c.readyState = 4), (c.l = null), (c.j = null), (c.v = null), Tr(c));
  }
  ((n.setRequestHeader = function (c, g) {
    this.u.append(c, g);
  }),
    (n.getResponseHeader = function (c) {
      return (this.h && this.h.get(c.toLowerCase())) || "";
    }),
    (n.getAllResponseHeaders = function () {
      if (!this.h) return "";
      const c = [],
        g = this.h.entries();
      for (var _ = g.next(); !_.done; )
        ((_ = _.value), c.push(_[0] + ": " + _[1]), (_ = g.next()));
      return c.join(`\r
`);
    }));
  function Tr(c) {
    c.onreadystatechange && c.onreadystatechange.call(c);
  }
  Object.defineProperty(no.prototype, "withCredentials", {
    get: function () {
      return this.m === "include";
    },
    set: function (c) {
      this.m = c ? "include" : "same-origin";
    },
  });
  function wi(c) {
    let g = "";
    return (
      he(c, function (_, I) {
        ((g += I),
          (g += ":"),
          (g += _),
          (g += `\r
`));
      }),
      g
    );
  }
  function as(c, g, _) {
    e: {
      for (I in _) {
        var I = !1;
        break e;
      }
      I = !0;
    }
    I ||
      ((_ = wi(_)),
      typeof c == "string"
        ? _ != null && encodeURIComponent(String(_))
        : pt(c, g, _));
  }
  function Tt(c) {
    (It.call(this),
      (this.headers = new Map()),
      (this.o = c || null),
      (this.h = !1),
      (this.v = this.g = null),
      (this.D = ""),
      (this.m = 0),
      (this.l = ""),
      (this.j = this.B = this.u = this.A = !1),
      (this.I = null),
      (this.H = ""),
      (this.J = !1));
  }
  D(Tt, It);
  var fd = /^https?$/i,
    Qa = ["POST", "PUT"];
  ((n = Tt.prototype),
    (n.Ha = function (c) {
      this.J = c;
    }),
    (n.ea = function (c, g, _, I) {
      if (this.g)
        throw Error(
          "[goog.net.XhrIo] Object is active with another request=" +
            this.D +
            "; newUri=" +
            c,
        );
      ((g = g ? g.toUpperCase() : "GET"),
        (this.D = c),
        (this.l = ""),
        (this.m = 0),
        (this.A = !1),
        (this.h = !0),
        (this.g = this.o ? this.o.g() : ve.g()),
        (this.v = this.o ? gr(this.o) : gr(ve)),
        (this.g.onreadystatechange = T(this.Ea, this)));
      try {
        ((this.B = !0), this.g.open(g, String(c), !0), (this.B = !1));
      } catch (Q) {
        ro(this, Q);
        return;
      }
      if (((c = _ || ""), (_ = new Map(this.headers)), I))
        if (Object.getPrototypeOf(I) === Object.prototype)
          for (var B in I) _.set(B, I[B]);
        else if (typeof I.keys == "function" && typeof I.get == "function")
          for (const Q of I.keys()) _.set(Q, I.get(Q));
        else throw Error("Unknown input type for opt_headers: " + String(I));
      ((I = Array.from(_.keys()).find(
        (Q) => Q.toLowerCase() == "content-type",
      )),
        (B = d.FormData && c instanceof d.FormData),
        !(0 <= Array.prototype.indexOf.call(Qa, g, void 0)) ||
          I ||
          B ||
          _.set(
            "Content-Type",
            "application/x-www-form-urlencoded;charset=utf-8",
          ));
      for (const [Q, ce] of _) this.g.setRequestHeader(Q, ce);
      (this.H && (this.g.responseType = this.H),
        "withCredentials" in this.g &&
          this.g.withCredentials !== this.J &&
          (this.g.withCredentials = this.J));
      try {
        (zo(this), (this.u = !0), this.g.send(c), (this.u = !1));
      } catch (Q) {
        ro(this, Q);
      }
    }));
  function ro(c, g) {
    ((c.h = !1),
      c.g && ((c.j = !0), c.g.abort(), (c.j = !1)),
      (c.l = g),
      (c.m = 5),
      Uo(c),
      zn(c));
  }
  function Uo(c) {
    c.A || ((c.A = !0), ut(c, "complete"), ut(c, "error"));
  }
  ((n.abort = function (c) {
    this.g &&
      this.h &&
      ((this.h = !1),
      (this.j = !0),
      this.g.abort(),
      (this.j = !1),
      (this.m = c || 7),
      ut(this, "complete"),
      ut(this, "abort"),
      zn(this));
  }),
    (n.N = function () {
      (this.g &&
        (this.h &&
          ((this.h = !1), (this.j = !0), this.g.abort(), (this.j = !1)),
        zn(this, !0)),
        Tt.aa.N.call(this));
    }),
    (n.Ea = function () {
      this.s || (this.B || this.u || this.j ? Ya(this) : this.bb());
    }),
    (n.bb = function () {
      Ya(this);
    }));
  function Ya(c) {
    if (c.h && typeof u < "u" && (!c.v[1] || kn(c) != 4 || c.Z() != 2)) {
      if (c.u && kn(c) == 4) Qi(c.Ea, 0, c);
      else if ((ut(c, "readystatechange"), kn(c) == 4)) {
        c.h = !1;
        try {
          const ce = c.Z();
          e: switch (ce) {
            case 200:
            case 201:
            case 202:
            case 204:
            case 206:
            case 304:
            case 1223:
              var g = !0;
              break e;
            default:
              g = !1;
          }
          var _;
          if (!(_ = g)) {
            var I;
            if ((I = ce === 0)) {
              var B = String(c.D).match(eo)[1] || null;
              (!B &&
                d.self &&
                d.self.location &&
                (B = d.self.location.protocol.slice(0, -1)),
                (I = !fd.test(B ? B.toLowerCase() : "")));
            }
            _ = I;
          }
          if (_) (ut(c, "complete"), ut(c, "success"));
          else {
            c.m = 6;
            try {
              var Q = 2 < kn(c) ? c.g.statusText : "";
            } catch {
              Q = "";
            }
            ((c.l = Q + " [" + c.Z() + "]"), Uo(c));
          }
        } finally {
          zn(c);
        }
      }
    }
  }
  function zn(c, g) {
    if (c.g) {
      zo(c);
      const _ = c.g,
        I = c.v[0] ? () => {} : null;
      ((c.g = null), (c.v = null), g || ut(c, "ready"));
      try {
        _.onreadystatechange = I;
      } catch {}
    }
  }
  function zo(c) {
    c.I && (d.clearTimeout(c.I), (c.I = null));
  }
  n.isActive = function () {
    return !!this.g;
  };
  function kn(c) {
    return c.g ? c.g.readyState : 0;
  }
  ((n.Z = function () {
    try {
      return 2 < kn(this) ? this.g.status : -1;
    } catch {
      return -1;
    }
  }),
    (n.oa = function () {
      try {
        return this.g ? this.g.responseText : "";
      } catch {
        return "";
      }
    }),
    (n.Oa = function (c) {
      if (this.g) {
        var g = this.g.responseText;
        return (c && g.indexOf(c) == 0 && (g = g.substring(c.length)), Ji(g));
      }
    }));
  function Xa(c) {
    try {
      if (!c.g) return null;
      if ("response" in c.g) return c.g.response;
      switch (c.H) {
        case "":
        case "text":
          return c.g.responseText;
        case "arraybuffer":
          if ("mozResponseArrayBuffer" in c.g)
            return c.g.mozResponseArrayBuffer;
      }
      return null;
    } catch {
      return null;
    }
  }
  function jo(c) {
    const g = {};
    c = ((c.g && 2 <= kn(c) && c.g.getAllResponseHeaders()) || "").split(`\r
`);
    for (let I = 0; I < c.length; I++) {
      if (q(c[I])) continue;
      var _ = L(c[I]);
      const B = _[0];
      if (((_ = _[1]), typeof _ != "string")) continue;
      _ = _.trim();
      const Q = g[B] || [];
      ((g[B] = Q), Q.push(_));
    }
    S(g, function (I) {
      return I.join(", ");
    });
  }
  ((n.Ba = function () {
    return this.m;
  }),
    (n.Ka = function () {
      return typeof this.l == "string" ? this.l : String(this.l);
    }));
  function jr(c, g, _) {
    return (_ && _.internalChannelParams && _.internalChannelParams[c]) || g;
  }
  function Ja(c) {
    ((this.Aa = 0),
      (this.i = []),
      (this.j = new W()),
      (this.ia =
        this.qa =
        this.I =
        this.W =
        this.g =
        this.ya =
        this.D =
        this.H =
        this.m =
        this.S =
        this.o =
          null),
      (this.Ya = this.U = 0),
      (this.Va = jr("failFast", !1, c)),
      (this.F = this.C = this.u = this.s = this.l = null),
      (this.X = !0),
      (this.za = this.T = -1),
      (this.Y = this.v = this.B = 0),
      (this.Ta = jr("baseRetryDelayMs", 5e3, c)),
      (this.cb = jr("retryDelaySeedMs", 1e4, c)),
      (this.Wa = jr("forwardChannelMaxRetries", 2, c)),
      (this.wa = jr("forwardChannelRequestTimeoutMs", 2e4, c)),
      (this.pa = (c && c.xmlHttpFactory) || void 0),
      (this.Xa = (c && c.Tb) || void 0),
      (this.Ca = (c && c.useFetchStreams) || !1),
      (this.L = void 0),
      (this.J = (c && c.supportsCrossDomainXhr) || !1),
      (this.K = ""),
      (this.h = new $e(c && c.concurrentRequestLimit)),
      (this.Da = new dd()),
      (this.P = (c && c.fastHandshake) || !1),
      (this.O = (c && c.encodeInitMessageHeaders) || !1),
      this.P && this.O && (this.O = !1),
      (this.Ua = (c && c.Rb) || !1),
      c && c.xa && this.j.xa(),
      c && c.forceLongPolling && (this.X = !1),
      (this.ba = (!this.P && this.X && c && c.detectBufferingProxy) || !1),
      (this.ja = void 0),
      c &&
        c.longPollingTimeout &&
        0 < c.longPollingTimeout &&
        (this.ja = c.longPollingTimeout),
      (this.ca = void 0),
      (this.R = 0),
      (this.M = !1),
      (this.ka = this.A = null));
  }
  ((n = Ja.prototype),
    (n.la = 8),
    (n.G = 1),
    (n.connect = function (c, g, _, I) {
      (Rt(0),
        (this.W = c),
        (this.H = g || {}),
        _ && I !== void 0 && ((this.H.OSID = _), (this.H.OAID = I)),
        (this.F = this.X),
        (this.I = Ou(this, null, this.W)),
        Br(this));
    }));
  function en(c) {
    if ((Bo(c), c.G == 3)) {
      var g = c.U++,
        _ = Un(c.I);
      if (
        (pt(_, "SID", c.K),
        pt(_, "RID", g),
        pt(_, "TYPE", "terminate"),
        Ei(c, _),
        (g = new Ue(c, c.j, g)),
        (g.L = 2),
        (g.v = is(Un(_))),
        (_ = !1),
        d.navigator && d.navigator.sendBeacon)
      )
        try {
          _ = d.navigator.sendBeacon(g.v.toString(), "");
        } catch {}
      (!_ && d.Image && ((new Image().src = g.v), (_ = !0)),
        _ || ((g.g = Lu(g.j, null)), g.g.ea(g.v)),
        (g.F = Date.now()),
        Xe(g));
    }
    Nu(c);
  }
  function Sr(c) {
    c.g && (Za(c), c.g.cancel(), (c.g = null));
  }
  function Bo(c) {
    (Sr(c),
      c.u && (d.clearTimeout(c.u), (c.u = null)),
      Wo(c),
      c.h.cancel(),
      c.s && (typeof c.s == "number" && d.clearTimeout(c.s), (c.s = null)));
  }
  function Br(c) {
    if (!ot(c.h) && !c.s) {
      c.s = !0;
      var g = c.Ga;
      (Ce || de(), oe || (Ce(), (oe = !0)), me.add(g, c), (c.B = 0));
    }
  }
  function pd(c, g) {
    return vr(c.h) >= c.h.j - (c.s ? 1 : 0)
      ? !1
      : c.s
        ? ((c.i = g.D.concat(c.i)), !0)
        : c.G == 1 || c.G == 2 || c.B >= (c.Va ? 0 : c.Wa)
          ? !1
          : ((c.s = F(T(c.Ga, c, g), Du(c, c.B))), c.B++, !0);
  }
  n.Ga = function (c) {
    if (this.s)
      if (((this.s = null), this.G == 1)) {
        if (!c) {
          ((this.U = Math.floor(1e5 * Math.random())), (c = this.U++));
          const B = new Ue(this, this.j, c);
          let Q = this.o;
          if (
            (this.S && (Q ? ((Q = R(Q)), x(Q, this.S)) : (Q = this.S)),
            this.m !== null || this.O || ((B.H = Q), (Q = null)),
            this.P)
          )
            e: {
              for (var g = 0, _ = 0; _ < this.i.length; _++) {
                t: {
                  var I = this.i[_];
                  if (
                    "__data__" in I.map &&
                    ((I = I.map.__data__), typeof I == "string")
                  ) {
                    I = I.length;
                    break t;
                  }
                  I = void 0;
                }
                if (I === void 0) break;
                if (((g += I), 4096 < g)) {
                  g = _;
                  break e;
                }
                if (g === 4096 || _ === this.i.length - 1) {
                  g = _ + 1;
                  break e;
                }
              }
              g = 1e3;
            }
          else g = 1e3;
          ((g = ls(this, B, g)),
            (_ = Un(this.I)),
            pt(_, "RID", c),
            pt(_, "CVER", 22),
            this.D && pt(_, "X-HTTP-Session-Id", this.D),
            Ei(this, _),
            Q &&
              (this.O
                ? (g = "headers=" + encodeURIComponent(String(wi(Q))) + "&" + g)
                : this.m && as(_, this.m, Q)),
            ft(this.h, B),
            this.Ua && pt(_, "TYPE", "init"),
            this.P
              ? (pt(_, "$req", g),
                pt(_, "SID", "null"),
                (B.T = !0),
                rt(B, _, null))
              : rt(B, _, g),
            (this.G = 2));
        }
      } else
        this.G == 3 &&
          (c ? $o(this, c) : this.i.length == 0 || ot(this.h) || $o(this));
  };
  function $o(c, g) {
    var _;
    g ? (_ = g.l) : (_ = c.U++);
    const I = Un(c.I);
    (pt(I, "SID", c.K),
      pt(I, "RID", _),
      pt(I, "AID", c.T),
      Ei(c, I),
      c.m && c.o && as(I, c.m, c.o),
      (_ = new Ue(c, c.j, _, c.B + 1)),
      c.m === null && (_.H = c.o),
      g && (c.i = g.D.concat(c.i)),
      (g = ls(c, _, 1e3)),
      (_.I = Math.round(0.5 * c.wa) + Math.round(0.5 * c.wa * Math.random())),
      ft(c.h, _),
      rt(_, I, g));
  }
  function Ei(c, g) {
    (c.H &&
      he(c.H, function (_, I) {
        pt(g, I, _);
      }),
      c.l &&
        ts({}, function (_, I) {
          pt(g, I, _);
        }));
  }
  function ls(c, g, _) {
    _ = Math.min(c.i.length, _);
    var I = c.l ? T(c.l.Na, c.l, c) : null;
    e: {
      var B = c.i;
      let Q = -1;
      for (;;) {
        const ce = ["count=" + _];
        Q == -1
          ? 0 < _
            ? ((Q = B[0].g), ce.push("ofs=" + Q))
            : (Q = 0)
          : ce.push("ofs=" + Q);
        let ht = !0;
        for (let Bt = 0; Bt < _; Bt++) {
          let Ze = B[Bt].g;
          const Kt = B[Bt].map;
          if (((Ze -= Q), 0 > Ze))
            ((Q = Math.max(0, B[Bt].g - 100)), (ht = !1));
          else
            try {
              ku(Kt, ce, "req" + Ze + "_");
            } catch {
              I && I(Kt);
            }
        }
        if (ht) {
          I = ce.join("&");
          break e;
        }
      }
    }
    return ((c = c.i.splice(0, _)), (g.D = c), I);
  }
  function io(c) {
    if (!c.g && !c.u) {
      c.Y = 1;
      var g = c.Fa;
      (Ce || de(), oe || (Ce(), (oe = !0)), me.add(g, c), (c.v = 0));
    }
  }
  function Ho(c) {
    return c.g || c.u || 3 <= c.v
      ? !1
      : (c.Y++, (c.u = F(T(c.Fa, c), Du(c, c.v))), c.v++, !0);
  }
  ((n.Fa = function () {
    if (
      ((this.u = null),
      bu(this),
      this.ba && !(this.M || this.g == null || 0 >= this.R))
    ) {
      var c = 2 * this.R;
      (this.j.info("BP detection timer enabled: " + c),
        (this.A = F(T(this.ab, this), c)));
    }
  }),
    (n.ab = function () {
      this.A &&
        ((this.A = null),
        this.j.info("BP detection timeout reached."),
        this.j.info("Buffering proxy detected and switch to long-polling!"),
        (this.F = !1),
        (this.M = !0),
        Rt(10),
        Sr(this),
        bu(this));
    }));
  function Za(c) {
    c.A != null && (d.clearTimeout(c.A), (c.A = null));
  }
  function bu(c) {
    ((c.g = new Ue(c, c.j, "rpc", c.Y)),
      c.m === null && (c.g.H = c.o),
      (c.g.O = 0));
    var g = Un(c.qa);
    (pt(g, "RID", "rpc"),
      pt(g, "SID", c.K),
      pt(g, "AID", c.T),
      pt(g, "CI", c.F ? "0" : "1"),
      !c.F && c.ja && pt(g, "TO", c.ja),
      pt(g, "TYPE", "xmlhttp"),
      Ei(c, g),
      c.m && c.o && as(g, c.m, c.o),
      c.L && (c.g.I = c.L));
    var _ = c.g;
    ((c = c.ia),
      (_.L = 1),
      (_.v = is(Un(g))),
      (_.m = null),
      (_.P = !0),
      st(_, c));
  }
  n.Za = function () {
    this.C != null && ((this.C = null), Sr(this), Ho(this), Rt(19));
  };
  function Wo(c) {
    c.C != null && (d.clearTimeout(c.C), (c.C = null));
  }
  function qo(c, g) {
    var _ = null;
    if (c.g == g) {
      (Wo(c), Za(c), (c.g = null));
      var I = 2;
    } else if (At(c.h, g)) ((_ = g.D), yi(c.h, g), (I = 1));
    else return;
    if (c.G != 0) {
      if (g.o)
        if (I == 1) {
          ((_ = g.m ? g.m.length : 0), (g = Date.now() - g.F));
          var B = c.B;
          ((I = Xn()), ut(I, new b(I, _)), Br(c));
        } else io(c);
      else if (
        ((B = g.s),
        B == 3 ||
          (B == 0 && 0 < g.X) ||
          !((I == 1 && pd(c, g)) || (I == 2 && Ho(c))))
      )
        switch ((_ && 0 < _.length && ((g = c.h), (g.i = g.i.concat(_))), B)) {
          case 1:
            Ti(c, 5);
            break;
          case 4:
            Ti(c, 10);
            break;
          case 3:
            Ti(c, 6);
            break;
          default:
            Ti(c, 2);
        }
    }
  }
  function Du(c, g) {
    let _ = c.Ta + Math.floor(Math.random() * c.cb);
    return (c.isActive() || (_ *= 2), _ * g);
  }
  function Ti(c, g) {
    if ((c.j.info("Error code " + g), g == 2)) {
      var _ = T(c.fb, c),
        I = c.Xa;
      const B = !I;
      ((I = new vi(I || "//www.google.com/images/cleardot.gif")),
        (d.location && d.location.protocol == "http") || to(I, "https"),
        is(I),
        B ? hd(I.toString(), _) : Pu(I.toString(), _));
    } else Rt(2);
    ((c.G = 0), c.l && c.l.sa(g), Nu(c), Bo(c));
  }
  n.fb = function (c) {
    c
      ? (this.j.info("Successfully pinged google.com"), Rt(2))
      : (this.j.info("Failed to ping google.com"), Rt(1));
  };
  function Nu(c) {
    if (((c.G = 0), (c.ka = []), c.l)) {
      const g = Zs(c.h);
      ((g.length != 0 || c.i.length != 0) &&
        (O(c.ka, g),
        O(c.ka, c.i),
        (c.h.i.length = 0),
        j(c.i),
        (c.i.length = 0)),
        c.l.ra());
    }
  }
  function Ou(c, g, _) {
    var I = _ instanceof vi ? Un(_) : new vi(_);
    if (I.g != "") (g && (I.g = g + "." + I.g), ns(I, I.s));
    else {
      var B = d.location;
      ((I = B.protocol),
        (g = g ? g + "." + B.hostname : B.hostname),
        (B = +B.port));
      var Q = new vi(null);
      (I && to(Q, I), g && (Q.g = g), B && ns(Q, B), _ && (Q.l = _), (I = Q));
    }
    return (
      (_ = c.D),
      (g = c.ya),
      _ && g && pt(I, _, g),
      pt(I, "VER", c.la),
      Ei(c, I),
      I
    );
  }
  function Lu(c, g, _) {
    if (g && !c.J)
      throw Error("Can't create secondary domain capable XhrIo object.");
    return (
      (g = c.Ca && !c.pa ? new Tt(new _i({ eb: _ })) : new Tt(c.pa)),
      g.Ha(c.J),
      g
    );
  }
  n.isActive = function () {
    return !!this.l && this.l.isActive(this);
  };
  function el() {}
  ((n = el.prototype),
    (n.ua = function () {}),
    (n.ta = function () {}),
    (n.sa = function () {}),
    (n.ra = function () {}),
    (n.isActive = function () {
      return !0;
    }),
    (n.Na = function () {}));
  function Ko() {}
  Ko.prototype.g = function (c, g) {
    return new wn(c, g);
  };
  function wn(c, g) {
    (It.call(this),
      (this.g = new Ja(g)),
      (this.l = c),
      (this.h = (g && g.messageUrlParams) || null),
      (c = (g && g.messageHeaders) || null),
      g &&
        g.clientProtocolHeaderRequired &&
        (c
          ? (c["X-Client-Protocol"] = "webchannel")
          : (c = { "X-Client-Protocol": "webchannel" })),
      (this.g.o = c),
      (c = (g && g.initMessageHeaders) || null),
      g &&
        g.messageContentType &&
        (c
          ? (c["X-WebChannel-Content-Type"] = g.messageContentType)
          : (c = { "X-WebChannel-Content-Type": g.messageContentType })),
      g &&
        g.va &&
        (c
          ? (c["X-WebChannel-Client-Profile"] = g.va)
          : (c = { "X-WebChannel-Client-Profile": g.va })),
      (this.g.S = c),
      (c = g && g.Sb) && !q(c) && (this.g.m = c),
      (this.v = (g && g.supportsCrossDomainXhr) || !1),
      (this.u = (g && g.sendRawJson) || !1),
      (g = g && g.httpSessionIdParam) &&
        !q(g) &&
        ((this.g.D = g),
        (c = this.h),
        c !== null && g in c && ((c = this.h), g in c && delete c[g])),
      (this.j = new $r(this)));
  }
  (D(wn, It),
    (wn.prototype.m = function () {
      ((this.g.l = this.j),
        this.v && (this.g.J = !0),
        this.g.connect(this.l, this.h || void 0));
    }),
    (wn.prototype.close = function () {
      en(this.g);
    }),
    (wn.prototype.o = function (c) {
      var g = this.g;
      if (typeof c == "string") {
        var _ = {};
        ((_.__data__ = c), (c = _));
      } else this.u && ((_ = {}), (_.__data__ = Xi(c)), (c = _));
      (g.i.push(new gi(g.Ya++, c)), g.G == 3 && Br(g));
    }),
    (wn.prototype.N = function () {
      ((this.g.l = null),
        delete this.j,
        en(this.g),
        delete this.g,
        wn.aa.N.call(this));
    }));
  function Mu(c) {
    (Qn.call(this),
      c.__headers__ &&
        ((this.headers = c.__headers__),
        (this.statusCode = c.__status__),
        delete c.__headers__,
        delete c.__status__));
    var g = c.__sm__;
    if (g) {
      e: {
        for (const _ in g) {
          c = _;
          break e;
        }
        c = void 0;
      }
      ((this.i = c) &&
        ((c = this.i), (g = g !== null && c in g ? g[c] : void 0)),
        (this.data = g));
    } else this.data = c;
  }
  D(Mu, Qn);
  function Vu() {
    (pi.call(this), (this.status = 1));
  }
  D(Vu, pi);
  function $r(c) {
    this.g = c;
  }
  (D($r, el),
    ($r.prototype.ua = function () {
      ut(this.g, "a");
    }),
    ($r.prototype.ta = function (c) {
      ut(this.g, new Mu(c));
    }),
    ($r.prototype.sa = function (c) {
      ut(this.g, new Vu());
    }),
    ($r.prototype.ra = function () {
      ut(this.g, "b");
    }),
    (Ko.prototype.createWebChannel = Ko.prototype.g),
    (wn.prototype.send = wn.prototype.o),
    (wn.prototype.open = wn.prototype.m),
    (wn.prototype.close = wn.prototype.close),
    (iE = function () {
      return new Ko();
    }),
    (rE = function () {
      return Xn();
    }),
    (nE = Yn),
    (Np = {
      mb: 0,
      pb: 1,
      qb: 2,
      Jb: 3,
      Ob: 4,
      Lb: 5,
      Mb: 6,
      Kb: 7,
      Ib: 8,
      Nb: 9,
      PROXY: 10,
      NOPROXY: 11,
      Gb: 12,
      Cb: 13,
      Db: 14,
      Bb: 15,
      Eb: 16,
      Fb: 17,
      ib: 18,
      hb: 19,
      jb: 20,
    }),
    (Te.NO_ERROR = 0),
    (Te.TIMEOUT = 8),
    (Te.HTTP_ERROR = 6),
    (Qc = Te),
    (Pe.COMPLETE = "complete"),
    (tE = Pe),
    (fi.EventType = un),
    (un.OPEN = "a"),
    (un.CLOSE = "b"),
    (un.ERROR = "c"),
    (un.MESSAGE = "d"),
    (It.prototype.listen = It.prototype.K),
    (Nl = fi),
    (Tt.prototype.listenOnce = Tt.prototype.L),
    (Tt.prototype.getLastError = Tt.prototype.Ka),
    (Tt.prototype.getLastErrorCode = Tt.prototype.Ba),
    (Tt.prototype.getStatus = Tt.prototype.Z),
    (Tt.prototype.getResponseJson = Tt.prototype.Oa),
    (Tt.prototype.getResponseText = Tt.prototype.oa),
    (Tt.prototype.send = Tt.prototype.ea),
    (Tt.prototype.setWithCredentials = Tt.prototype.Ha),
    (eE = Tt));
}).apply(
  typeof Vc < "u"
    ? Vc
    : typeof self < "u"
      ? self
      : typeof window < "u"
        ? window
        : {},
);
const P_ = "@firebase/firestore",
  k_ = "4.8.0";
class mn {
  constructor(e) {
    this.uid = e;
  }
  isAuthenticated() {
    return this.uid != null;
  }
  toKey() {
    return this.isAuthenticated() ? "uid:" + this.uid : "anonymous-user";
  }
  isEqual(e) {
    return e.uid === this.uid;
  }
}
((mn.UNAUTHENTICATED = new mn(null)),
  (mn.GOOGLE_CREDENTIALS = new mn("google-credentials-uid")),
  (mn.FIRST_PARTY = new mn("first-party-uid")),
  (mn.MOCK_USER = new mn("mock-user")));
let $a = "11.10.0";
const ko = new vm("@firebase/firestore");
function wa() {
  return ko.logLevel;
}
function pe(n, ...e) {
  if (ko.logLevel <= Qe.DEBUG) {
    const t = e.map(Em);
    ko.debug(`Firestore (${$a}): ${n}`, ...t);
  }
}
function ji(n, ...e) {
  if (ko.logLevel <= Qe.ERROR) {
    const t = e.map(Em);
    ko.error(`Firestore (${$a}): ${n}`, ...t);
  }
}
function zs(n, ...e) {
  if (ko.logLevel <= Qe.WARN) {
    const t = e.map(Em);
    ko.warn(`Firestore (${$a}): ${n}`, ...t);
  }
}
function Em(n) {
  if (typeof n == "string") return n;
  try {
    return (function (t) {
      return JSON.stringify(t);
    })(n);
  } catch {
    return n;
  }
}
function Le(n, e, t) {
  let i = "Unexpected state";
  (typeof e == "string" ? (i = e) : (t = e), sE(n, i, t));
}
function sE(n, e, t) {
  let i = `FIRESTORE (${$a}) INTERNAL ASSERTION FAILED: ${e} (ID: ${n.toString(16)})`;
  if (t !== void 0)
    try {
      i += " CONTEXT: " + JSON.stringify(t);
    } catch {
      i += " CONTEXT: " + t;
    }
  throw (ji(i), new Error(i));
}
function at(n, e, t, i) {
  let o = "Unexpected state";
  (typeof t == "string" ? (o = t) : (i = t), n || sE(e, o, i));
}
function je(n, e) {
  return n;
}
const ie = {
  OK: "ok",
  CANCELLED: "cancelled",
  UNKNOWN: "unknown",
  INVALID_ARGUMENT: "invalid-argument",
  DEADLINE_EXCEEDED: "deadline-exceeded",
  NOT_FOUND: "not-found",
  ALREADY_EXISTS: "already-exists",
  PERMISSION_DENIED: "permission-denied",
  UNAUTHENTICATED: "unauthenticated",
  RESOURCE_EXHAUSTED: "resource-exhausted",
  FAILED_PRECONDITION: "failed-precondition",
  ABORTED: "aborted",
  OUT_OF_RANGE: "out-of-range",
  UNIMPLEMENTED: "unimplemented",
  INTERNAL: "internal",
  UNAVAILABLE: "unavailable",
  DATA_LOSS: "data-loss",
};
class ke extends qi {
  constructor(e, t) {
    (super(e, t),
      (this.code = e),
      (this.message = t),
      (this.toString = () =>
        `${this.name}: [code=${this.code}]: ${this.message}`));
  }
}
class Fs {
  constructor() {
    this.promise = new Promise((e, t) => {
      ((this.resolve = e), (this.reject = t));
    });
  }
}
class oE {
  constructor(e, t) {
    ((this.user = t),
      (this.type = "OAuth"),
      (this.headers = new Map()),
      this.headers.set("Authorization", `Bearer ${e}`));
  }
}
class gk {
  getToken() {
    return Promise.resolve(null);
  }
  invalidateToken() {}
  start(e, t) {
    e.enqueueRetryable(() => t(mn.UNAUTHENTICATED));
  }
  shutdown() {}
}
class yk {
  constructor(e) {
    ((this.token = e), (this.changeListener = null));
  }
  getToken() {
    return Promise.resolve(this.token);
  }
  invalidateToken() {}
  start(e, t) {
    ((this.changeListener = t), e.enqueueRetryable(() => t(this.token.user)));
  }
  shutdown() {
    this.changeListener = null;
  }
}
class vk {
  constructor(e) {
    ((this.t = e),
      (this.currentUser = mn.UNAUTHENTICATED),
      (this.i = 0),
      (this.forceRefresh = !1),
      (this.auth = null));
  }
  start(e, t) {
    at(this.o === void 0, 42304);
    let i = this.i;
    const o = (f) => (this.i !== i ? ((i = this.i), t(f)) : Promise.resolve());
    let a = new Fs();
    this.o = () => {
      (this.i++,
        (this.currentUser = this.u()),
        a.resolve(),
        (a = new Fs()),
        e.enqueueRetryable(() => o(this.currentUser)));
    };
    const u = () => {
        const f = a;
        e.enqueueRetryable(async () => {
          (await f.promise, await o(this.currentUser));
        });
      },
      d = (f) => {
        (pe("FirebaseAuthCredentialsProvider", "Auth detected"),
          (this.auth = f),
          this.o && (this.auth.addAuthTokenListener(this.o), u()));
      };
    (this.t.onInit((f) => d(f)),
      setTimeout(() => {
        if (!this.auth) {
          const f = this.t.getImmediate({ optional: !0 });
          f
            ? d(f)
            : (pe("FirebaseAuthCredentialsProvider", "Auth not yet detected"),
              a.resolve(),
              (a = new Fs()));
        }
      }, 0),
      u());
  }
  getToken() {
    const e = this.i,
      t = this.forceRefresh;
    return (
      (this.forceRefresh = !1),
      this.auth
        ? this.auth
            .getToken(t)
            .then((i) =>
              this.i !== e
                ? (pe(
                    "FirebaseAuthCredentialsProvider",
                    "getToken aborted due to token change.",
                  ),
                  this.getToken())
                : i
                  ? (at(typeof i.accessToken == "string", 31837, { l: i }),
                    new oE(i.accessToken, this.currentUser))
                  : null,
            )
        : Promise.resolve(null)
    );
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    (this.auth && this.o && this.auth.removeAuthTokenListener(this.o),
      (this.o = void 0));
  }
  u() {
    const e = this.auth && this.auth.getUid();
    return (at(e === null || typeof e == "string", 2055, { h: e }), new mn(e));
  }
}
class _k {
  constructor(e, t, i) {
    ((this.P = e),
      (this.T = t),
      (this.I = i),
      (this.type = "FirstParty"),
      (this.user = mn.FIRST_PARTY),
      (this.A = new Map()));
  }
  R() {
    return this.I ? this.I() : null;
  }
  get headers() {
    this.A.set("X-Goog-AuthUser", this.P);
    const e = this.R();
    return (
      e && this.A.set("Authorization", e),
      this.T && this.A.set("X-Goog-Iam-Authorization-Token", this.T),
      this.A
    );
  }
}
class wk {
  constructor(e, t, i) {
    ((this.P = e), (this.T = t), (this.I = i));
  }
  getToken() {
    return Promise.resolve(new _k(this.P, this.T, this.I));
  }
  start(e, t) {
    e.enqueueRetryable(() => t(mn.FIRST_PARTY));
  }
  shutdown() {}
  invalidateToken() {}
}
class x_ {
  constructor(e) {
    ((this.value = e),
      (this.type = "AppCheck"),
      (this.headers = new Map()),
      e && e.length > 0 && this.headers.set("x-firebase-appcheck", this.value));
  }
}
class Ek {
  constructor(e, t) {
    ((this.V = t),
      (this.forceRefresh = !1),
      (this.appCheck = null),
      (this.m = null),
      (this.p = null),
      Xr(e) && e.settings.appCheckToken && (this.p = e.settings.appCheckToken));
  }
  start(e, t) {
    at(this.o === void 0, 3512);
    const i = (a) => {
      a.error != null &&
        pe(
          "FirebaseAppCheckTokenProvider",
          `Error getting App Check token; using placeholder token instead. Error: ${a.error.message}`,
        );
      const u = a.token !== this.m;
      return (
        (this.m = a.token),
        pe(
          "FirebaseAppCheckTokenProvider",
          `Received ${u ? "new" : "existing"} token.`,
        ),
        u ? t(a.token) : Promise.resolve()
      );
    };
    this.o = (a) => {
      e.enqueueRetryable(() => i(a));
    };
    const o = (a) => {
      (pe("FirebaseAppCheckTokenProvider", "AppCheck detected"),
        (this.appCheck = a),
        this.o && this.appCheck.addTokenListener(this.o));
    };
    (this.V.onInit((a) => o(a)),
      setTimeout(() => {
        if (!this.appCheck) {
          const a = this.V.getImmediate({ optional: !0 });
          a
            ? o(a)
            : pe("FirebaseAppCheckTokenProvider", "AppCheck not yet detected");
        }
      }, 0));
  }
  getToken() {
    if (this.p) return Promise.resolve(new x_(this.p));
    const e = this.forceRefresh;
    return (
      (this.forceRefresh = !1),
      this.appCheck
        ? this.appCheck
            .getToken(e)
            .then((t) =>
              t
                ? (at(typeof t.token == "string", 44558, { tokenResult: t }),
                  (this.m = t.token),
                  new x_(t.token))
                : null,
            )
        : Promise.resolve(null)
    );
  }
  invalidateToken() {
    this.forceRefresh = !0;
  }
  shutdown() {
    (this.appCheck && this.o && this.appCheck.removeTokenListener(this.o),
      (this.o = void 0));
  }
}
function Tk(n) {
  const e = typeof self < "u" && (self.crypto || self.msCrypto),
    t = new Uint8Array(n);
  if (e && typeof e.getRandomValues == "function") e.getRandomValues(t);
  else for (let i = 0; i < n; i++) t[i] = Math.floor(256 * Math.random());
  return t;
}
function aE() {
  return new TextEncoder();
}
class Tm {
  static newId() {
    const e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      t = 62 * Math.floor(4.129032258064516);
    let i = "";
    for (; i.length < 20; ) {
      const o = Tk(40);
      for (let a = 0; a < o.length; ++a)
        i.length < 20 && o[a] < t && (i += e.charAt(o[a] % 62));
    }
    return i;
  }
}
function qe(n, e) {
  return n < e ? -1 : n > e ? 1 : 0;
}
function Op(n, e) {
  let t = 0;
  for (; t < n.length && t < e.length; ) {
    const i = n.codePointAt(t),
      o = e.codePointAt(t);
    if (i !== o) {
      if (i < 128 && o < 128) return qe(i, o);
      {
        const a = aE(),
          u = Sk(a.encode(b_(n, t)), a.encode(b_(e, t)));
        return u !== 0 ? u : qe(i, o);
      }
    }
    t += i > 65535 ? 2 : 1;
  }
  return qe(n.length, e.length);
}
function b_(n, e) {
  return n.codePointAt(e) > 65535
    ? n.substring(e, e + 2)
    : n.substring(e, e + 1);
}
function Sk(n, e) {
  for (let t = 0; t < n.length && t < e.length; ++t)
    if (n[t] !== e[t]) return qe(n[t], e[t]);
  return qe(n.length, e.length);
}
function Oa(n, e, t) {
  return n.length === e.length && n.every((i, o) => t(i, e[o]));
}
const D_ = "__name__";
class Yr {
  constructor(e, t, i) {
    (t === void 0
      ? (t = 0)
      : t > e.length && Le(637, { offset: t, range: e.length }),
      i === void 0
        ? (i = e.length - t)
        : i > e.length - t && Le(1746, { length: i, range: e.length - t }),
      (this.segments = e),
      (this.offset = t),
      (this.len = i));
  }
  get length() {
    return this.len;
  }
  isEqual(e) {
    return Yr.comparator(this, e) === 0;
  }
  child(e) {
    const t = this.segments.slice(this.offset, this.limit());
    return (
      e instanceof Yr
        ? e.forEach((i) => {
            t.push(i);
          })
        : t.push(e),
      this.construct(t)
    );
  }
  limit() {
    return this.offset + this.length;
  }
  popFirst(e) {
    return (
      (e = e === void 0 ? 1 : e),
      this.construct(this.segments, this.offset + e, this.length - e)
    );
  }
  popLast() {
    return this.construct(this.segments, this.offset, this.length - 1);
  }
  firstSegment() {
    return this.segments[this.offset];
  }
  lastSegment() {
    return this.get(this.length - 1);
  }
  get(e) {
    return this.segments[this.offset + e];
  }
  isEmpty() {
    return this.length === 0;
  }
  isPrefixOf(e) {
    if (e.length < this.length) return !1;
    for (let t = 0; t < this.length; t++)
      if (this.get(t) !== e.get(t)) return !1;
    return !0;
  }
  isImmediateParentOf(e) {
    if (this.length + 1 !== e.length) return !1;
    for (let t = 0; t < this.length; t++)
      if (this.get(t) !== e.get(t)) return !1;
    return !0;
  }
  forEach(e) {
    for (let t = this.offset, i = this.limit(); t < i; t++) e(this.segments[t]);
  }
  toArray() {
    return this.segments.slice(this.offset, this.limit());
  }
  static comparator(e, t) {
    const i = Math.min(e.length, t.length);
    for (let o = 0; o < i; o++) {
      const a = Yr.compareSegments(e.get(o), t.get(o));
      if (a !== 0) return a;
    }
    return qe(e.length, t.length);
  }
  static compareSegments(e, t) {
    const i = Yr.isNumericId(e),
      o = Yr.isNumericId(t);
    return i && !o
      ? -1
      : !i && o
        ? 1
        : i && o
          ? Yr.extractNumericId(e).compare(Yr.extractNumericId(t))
          : Op(e, t);
  }
  static isNumericId(e) {
    return e.startsWith("__id") && e.endsWith("__");
  }
  static extractNumericId(e) {
    return Vs.fromString(e.substring(4, e.length - 2));
  }
}
class kt extends Yr {
  construct(e, t, i) {
    return new kt(e, t, i);
  }
  canonicalString() {
    return this.toArray().join("/");
  }
  toString() {
    return this.canonicalString();
  }
  toUriEncodedString() {
    return this.toArray().map(encodeURIComponent).join("/");
  }
  static fromString(...e) {
    const t = [];
    for (const i of e) {
      if (i.indexOf("//") >= 0)
        throw new ke(
          ie.INVALID_ARGUMENT,
          `Invalid segment (${i}). Paths must not contain // in them.`,
        );
      t.push(...i.split("/").filter((o) => o.length > 0));
    }
    return new kt(t);
  }
  static emptyPath() {
    return new kt([]);
  }
}
const Ik = /^[_a-zA-Z][_a-zA-Z0-9]*$/;
class an extends Yr {
  construct(e, t, i) {
    return new an(e, t, i);
  }
  static isValidIdentifier(e) {
    return Ik.test(e);
  }
  canonicalString() {
    return this.toArray()
      .map(
        (e) => (
          (e = e.replace(/\\/g, "\\\\").replace(/`/g, "\\`")),
          an.isValidIdentifier(e) || (e = "`" + e + "`"),
          e
        ),
      )
      .join(".");
  }
  toString() {
    return this.canonicalString();
  }
  isKeyField() {
    return this.length === 1 && this.get(0) === D_;
  }
  static keyField() {
    return new an([D_]);
  }
  static fromServerFormat(e) {
    const t = [];
    let i = "",
      o = 0;
    const a = () => {
      if (i.length === 0)
        throw new ke(
          ie.INVALID_ARGUMENT,
          `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
        );
      (t.push(i), (i = ""));
    };
    let u = !1;
    for (; o < e.length; ) {
      const d = e[o];
      if (d === "\\") {
        if (o + 1 === e.length)
          throw new ke(
            ie.INVALID_ARGUMENT,
            "Path has trailing escape character: " + e,
          );
        const f = e[o + 1];
        if (f !== "\\" && f !== "." && f !== "`")
          throw new ke(
            ie.INVALID_ARGUMENT,
            "Path has invalid escape sequence: " + e,
          );
        ((i += f), (o += 2));
      } else
        d === "`"
          ? ((u = !u), o++)
          : d !== "." || u
            ? ((i += d), o++)
            : (a(), o++);
    }
    if ((a(), u))
      throw new ke(ie.INVALID_ARGUMENT, "Unterminated ` in path: " + e);
    return new an(t);
  }
  static emptyPath() {
    return new an([]);
  }
}
class De {
  constructor(e) {
    this.path = e;
  }
  static fromPath(e) {
    return new De(kt.fromString(e));
  }
  static fromName(e) {
    return new De(kt.fromString(e).popFirst(5));
  }
  static empty() {
    return new De(kt.emptyPath());
  }
  get collectionGroup() {
    return this.path.popLast().lastSegment();
  }
  hasCollectionId(e) {
    return this.path.length >= 2 && this.path.get(this.path.length - 2) === e;
  }
  getCollectionGroup() {
    return this.path.get(this.path.length - 2);
  }
  getCollectionPath() {
    return this.path.popLast();
  }
  isEqual(e) {
    return e !== null && kt.comparator(this.path, e.path) === 0;
  }
  toString() {
    return this.path.toString();
  }
  static comparator(e, t) {
    return kt.comparator(e.path, t.path);
  }
  static isDocumentKey(e) {
    return e.length % 2 == 0;
  }
  static fromSegments(e) {
    return new De(new kt(e.slice()));
  }
}
function Rk(n, e, t) {
  if (!t)
    throw new ke(
      ie.INVALID_ARGUMENT,
      `Function ${n}() cannot be called with an empty ${e}.`,
    );
}
function Ak(n, e, t, i) {
  if (e === !0 && i === !0)
    throw new ke(ie.INVALID_ARGUMENT, `${n} and ${t} cannot be used together.`);
}
function N_(n) {
  if (!De.isDocumentKey(n))
    throw new ke(
      ie.INVALID_ARGUMENT,
      `Invalid document reference. Document references must have an even number of segments, but ${n} has ${n.length}.`,
    );
}
function lE(n) {
  return (
    typeof n == "object" &&
    n !== null &&
    (Object.getPrototypeOf(n) === Object.prototype ||
      Object.getPrototypeOf(n) === null)
  );
}
function Sm(n) {
  if (n === void 0) return "undefined";
  if (n === null) return "null";
  if (typeof n == "string")
    return (
      n.length > 20 && (n = `${n.substring(0, 20)}...`),
      JSON.stringify(n)
    );
  if (typeof n == "number" || typeof n == "boolean") return "" + n;
  if (typeof n == "object") {
    if (n instanceof Array) return "an array";
    {
      const e = (function (i) {
        return i.constructor ? i.constructor.name : null;
      })(n);
      return e ? `a custom ${e} object` : "an object";
    }
  }
  return typeof n == "function" ? "a function" : Le(12329, { type: typeof n });
}
function eu(n, e) {
  if (("_delegate" in n && (n = n._delegate), !(n instanceof e))) {
    if (e.name === n.constructor.name)
      throw new ke(
        ie.INVALID_ARGUMENT,
        "Type does not match the expected instance. Did you pass a reference from a different Firestore SDK?",
      );
    {
      const t = Sm(n);
      throw new ke(
        ie.INVALID_ARGUMENT,
        `Expected type '${e.name}', but it was: ${t}`,
      );
    }
  }
  return n;
}
function zt(n, e) {
  const t = { typeString: n };
  return (e && (t.value = e), t);
}
function gu(n, e) {
  if (!lE(n)) throw new ke(ie.INVALID_ARGUMENT, "JSON must be an object");
  let t;
  for (const i in e)
    if (e[i]) {
      const o = e[i].typeString,
        a = "value" in e[i] ? { value: e[i].value } : void 0;
      if (!(i in n)) {
        t = `JSON missing required field: '${i}'`;
        break;
      }
      const u = n[i];
      if (o && typeof u !== o) {
        t = `JSON field '${i}' must be a ${o}.`;
        break;
      }
      if (a !== void 0 && u !== a.value) {
        t = `Expected '${i}' field to equal '${a.value}'`;
        break;
      }
    }
  if (t) throw new ke(ie.INVALID_ARGUMENT, t);
  return !0;
}
const O_ = -62135596800,
  L_ = 1e6;
class Et {
  static now() {
    return Et.fromMillis(Date.now());
  }
  static fromDate(e) {
    return Et.fromMillis(e.getTime());
  }
  static fromMillis(e) {
    const t = Math.floor(e / 1e3),
      i = Math.floor((e - 1e3 * t) * L_);
    return new Et(t, i);
  }
  constructor(e, t) {
    if (((this.seconds = e), (this.nanoseconds = t), t < 0))
      throw new ke(
        ie.INVALID_ARGUMENT,
        "Timestamp nanoseconds out of range: " + t,
      );
    if (t >= 1e9)
      throw new ke(
        ie.INVALID_ARGUMENT,
        "Timestamp nanoseconds out of range: " + t,
      );
    if (e < O_)
      throw new ke(ie.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
    if (e >= 253402300800)
      throw new ke(ie.INVALID_ARGUMENT, "Timestamp seconds out of range: " + e);
  }
  toDate() {
    return new Date(this.toMillis());
  }
  toMillis() {
    return 1e3 * this.seconds + this.nanoseconds / L_;
  }
  _compareTo(e) {
    return this.seconds === e.seconds
      ? qe(this.nanoseconds, e.nanoseconds)
      : qe(this.seconds, e.seconds);
  }
  isEqual(e) {
    return e.seconds === this.seconds && e.nanoseconds === this.nanoseconds;
  }
  toString() {
    return (
      "Timestamp(seconds=" +
      this.seconds +
      ", nanoseconds=" +
      this.nanoseconds +
      ")"
    );
  }
  toJSON() {
    return {
      type: Et._jsonSchemaVersion,
      seconds: this.seconds,
      nanoseconds: this.nanoseconds,
    };
  }
  static fromJSON(e) {
    if (gu(e, Et._jsonSchema)) return new Et(e.seconds, e.nanoseconds);
  }
  valueOf() {
    const e = this.seconds - O_;
    return (
      String(e).padStart(12, "0") +
      "." +
      String(this.nanoseconds).padStart(9, "0")
    );
  }
}
((Et._jsonSchemaVersion = "firestore/timestamp/1.0"),
  (Et._jsonSchema = {
    type: zt("string", Et._jsonSchemaVersion),
    seconds: zt("number"),
    nanoseconds: zt("number"),
  }));
class ze {
  static fromTimestamp(e) {
    return new ze(e);
  }
  static min() {
    return new ze(new Et(0, 0));
  }
  static max() {
    return new ze(new Et(253402300799, 999999999));
  }
  constructor(e) {
    this.timestamp = e;
  }
  compareTo(e) {
    return this.timestamp._compareTo(e.timestamp);
  }
  isEqual(e) {
    return this.timestamp.isEqual(e.timestamp);
  }
  toMicroseconds() {
    return 1e6 * this.timestamp.seconds + this.timestamp.nanoseconds / 1e3;
  }
  toString() {
    return "SnapshotVersion(" + this.timestamp.toString() + ")";
  }
  toTimestamp() {
    return this.timestamp;
  }
}
const tu = -1;
function Ck(n, e) {
  const t = n.toTimestamp().seconds,
    i = n.toTimestamp().nanoseconds + 1,
    o = ze.fromTimestamp(i === 1e9 ? new Et(t + 1, 0) : new Et(t, i));
  return new js(o, De.empty(), e);
}
function Pk(n) {
  return new js(n.readTime, n.key, tu);
}
class js {
  constructor(e, t, i) {
    ((this.readTime = e), (this.documentKey = t), (this.largestBatchId = i));
  }
  static min() {
    return new js(ze.min(), De.empty(), tu);
  }
  static max() {
    return new js(ze.max(), De.empty(), tu);
  }
}
function kk(n, e) {
  let t = n.readTime.compareTo(e.readTime);
  return t !== 0
    ? t
    : ((t = De.comparator(n.documentKey, e.documentKey)),
      t !== 0 ? t : qe(n.largestBatchId, e.largestBatchId));
}
const xk =
  "The current tab is not in the required state to perform this operation. It might be necessary to refresh the browser tab.";
class bk {
  constructor() {
    this.onCommittedListeners = [];
  }
  addOnCommittedListener(e) {
    this.onCommittedListeners.push(e);
  }
  raiseOnCommittedEvent() {
    this.onCommittedListeners.forEach((e) => e());
  }
}
async function Ha(n) {
  if (n.code !== ie.FAILED_PRECONDITION || n.message !== xk) throw n;
  pe("LocalStore", "Unexpectedly lost primary lease");
}
class Z {
  constructor(e) {
    ((this.nextCallback = null),
      (this.catchCallback = null),
      (this.result = void 0),
      (this.error = void 0),
      (this.isDone = !1),
      (this.callbackAttached = !1),
      e(
        (t) => {
          ((this.isDone = !0),
            (this.result = t),
            this.nextCallback && this.nextCallback(t));
        },
        (t) => {
          ((this.isDone = !0),
            (this.error = t),
            this.catchCallback && this.catchCallback(t));
        },
      ));
  }
  catch(e) {
    return this.next(void 0, e);
  }
  next(e, t) {
    return (
      this.callbackAttached && Le(59440),
      (this.callbackAttached = !0),
      this.isDone
        ? this.error
          ? this.wrapFailure(t, this.error)
          : this.wrapSuccess(e, this.result)
        : new Z((i, o) => {
            ((this.nextCallback = (a) => {
              this.wrapSuccess(e, a).next(i, o);
            }),
              (this.catchCallback = (a) => {
                this.wrapFailure(t, a).next(i, o);
              }));
          })
    );
  }
  toPromise() {
    return new Promise((e, t) => {
      this.next(e, t);
    });
  }
  wrapUserFunction(e) {
    try {
      const t = e();
      return t instanceof Z ? t : Z.resolve(t);
    } catch (t) {
      return Z.reject(t);
    }
  }
  wrapSuccess(e, t) {
    return e ? this.wrapUserFunction(() => e(t)) : Z.resolve(t);
  }
  wrapFailure(e, t) {
    return e ? this.wrapUserFunction(() => e(t)) : Z.reject(t);
  }
  static resolve(e) {
    return new Z((t, i) => {
      t(e);
    });
  }
  static reject(e) {
    return new Z((t, i) => {
      i(e);
    });
  }
  static waitFor(e) {
    return new Z((t, i) => {
      let o = 0,
        a = 0,
        u = !1;
      (e.forEach((d) => {
        (++o,
          d.next(
            () => {
              (++a, u && a === o && t());
            },
            (f) => i(f),
          ));
      }),
        (u = !0),
        a === o && t());
    });
  }
  static or(e) {
    let t = Z.resolve(!1);
    for (const i of e) t = t.next((o) => (o ? Z.resolve(o) : i()));
    return t;
  }
  static forEach(e, t) {
    const i = [];
    return (
      e.forEach((o, a) => {
        i.push(t.call(this, o, a));
      }),
      this.waitFor(i)
    );
  }
  static mapArray(e, t) {
    return new Z((i, o) => {
      const a = e.length,
        u = new Array(a);
      let d = 0;
      for (let f = 0; f < a; f++) {
        const m = f;
        t(e[m]).next(
          (v) => {
            ((u[m] = v), ++d, d === a && i(u));
          },
          (v) => o(v),
        );
      }
    });
  }
  static doWhile(e, t) {
    return new Z((i, o) => {
      const a = () => {
        e() === !0
          ? t().next(() => {
              a();
            }, o)
          : i();
      };
      a();
    });
  }
}
function Dk(n) {
  const e = n.match(/Android ([\d.]+)/i),
    t = e ? e[1].split(".").slice(0, 2).join(".") : "-1";
  return Number(t);
}
function Wa(n) {
  return n.name === "IndexedDbTransactionError";
}
class Gh {
  constructor(e, t) {
    ((this.previousValue = e),
      t &&
        ((t.sequenceNumberHandler = (i) => this._e(i)),
        (this.ae = (i) => t.writeSequenceNumber(i))));
  }
  _e(e) {
    return (
      (this.previousValue = Math.max(e, this.previousValue)),
      this.previousValue
    );
  }
  next() {
    const e = ++this.previousValue;
    return (this.ae && this.ae(e), e);
  }
}
Gh.ue = -1;
const Im = -1;
function Qh(n) {
  return n == null;
}
function yh(n) {
  return n === 0 && 1 / n == -1 / 0;
}
function Nk(n) {
  return (
    typeof n == "number" &&
    Number.isInteger(n) &&
    !yh(n) &&
    n <= Number.MAX_SAFE_INTEGER &&
    n >= Number.MIN_SAFE_INTEGER
  );
}
const uE = "";
function Ok(n) {
  let e = "";
  for (let t = 0; t < n.length; t++)
    (e.length > 0 && (e = M_(e)), (e = Lk(n.get(t), e)));
  return M_(e);
}
function Lk(n, e) {
  let t = e;
  const i = n.length;
  for (let o = 0; o < i; o++) {
    const a = n.charAt(o);
    switch (a) {
      case "\0":
        t += "";
        break;
      case uE:
        t += "";
        break;
      default:
        t += a;
    }
  }
  return t;
}
function M_(n) {
  return n + uE + "";
}
function V_(n) {
  let e = 0;
  for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && e++;
  return e;
}
function No(n, e) {
  for (const t in n) Object.prototype.hasOwnProperty.call(n, t) && e(t, n[t]);
}
function cE(n) {
  for (const e in n) if (Object.prototype.hasOwnProperty.call(n, e)) return !1;
  return !0;
}
class xt {
  constructor(e, t) {
    ((this.comparator = e), (this.root = t || on.EMPTY));
  }
  insert(e, t) {
    return new xt(
      this.comparator,
      this.root
        .insert(e, t, this.comparator)
        .copy(null, null, on.BLACK, null, null),
    );
  }
  remove(e) {
    return new xt(
      this.comparator,
      this.root
        .remove(e, this.comparator)
        .copy(null, null, on.BLACK, null, null),
    );
  }
  get(e) {
    let t = this.root;
    for (; !t.isEmpty(); ) {
      const i = this.comparator(e, t.key);
      if (i === 0) return t.value;
      i < 0 ? (t = t.left) : i > 0 && (t = t.right);
    }
    return null;
  }
  indexOf(e) {
    let t = 0,
      i = this.root;
    for (; !i.isEmpty(); ) {
      const o = this.comparator(e, i.key);
      if (o === 0) return t + i.left.size;
      o < 0 ? (i = i.left) : ((t += i.left.size + 1), (i = i.right));
    }
    return -1;
  }
  isEmpty() {
    return this.root.isEmpty();
  }
  get size() {
    return this.root.size;
  }
  minKey() {
    return this.root.minKey();
  }
  maxKey() {
    return this.root.maxKey();
  }
  inorderTraversal(e) {
    return this.root.inorderTraversal(e);
  }
  forEach(e) {
    this.inorderTraversal((t, i) => (e(t, i), !1));
  }
  toString() {
    const e = [];
    return (
      this.inorderTraversal((t, i) => (e.push(`${t}:${i}`), !1)),
      `{${e.join(", ")}}`
    );
  }
  reverseTraversal(e) {
    return this.root.reverseTraversal(e);
  }
  getIterator() {
    return new Fc(this.root, null, this.comparator, !1);
  }
  getIteratorFrom(e) {
    return new Fc(this.root, e, this.comparator, !1);
  }
  getReverseIterator() {
    return new Fc(this.root, null, this.comparator, !0);
  }
  getReverseIteratorFrom(e) {
    return new Fc(this.root, e, this.comparator, !0);
  }
}
class Fc {
  constructor(e, t, i, o) {
    ((this.isReverse = o), (this.nodeStack = []));
    let a = 1;
    for (; !e.isEmpty(); )
      if (((a = t ? i(e.key, t) : 1), t && o && (a *= -1), a < 0))
        e = this.isReverse ? e.left : e.right;
      else {
        if (a === 0) {
          this.nodeStack.push(e);
          break;
        }
        (this.nodeStack.push(e), (e = this.isReverse ? e.right : e.left));
      }
  }
  getNext() {
    let e = this.nodeStack.pop();
    const t = { key: e.key, value: e.value };
    if (this.isReverse)
      for (e = e.left; !e.isEmpty(); ) (this.nodeStack.push(e), (e = e.right));
    else
      for (e = e.right; !e.isEmpty(); ) (this.nodeStack.push(e), (e = e.left));
    return t;
  }
  hasNext() {
    return this.nodeStack.length > 0;
  }
  peek() {
    if (this.nodeStack.length === 0) return null;
    const e = this.nodeStack[this.nodeStack.length - 1];
    return { key: e.key, value: e.value };
  }
}
class on {
  constructor(e, t, i, o, a) {
    ((this.key = e),
      (this.value = t),
      (this.color = i ?? on.RED),
      (this.left = o ?? on.EMPTY),
      (this.right = a ?? on.EMPTY),
      (this.size = this.left.size + 1 + this.right.size));
  }
  copy(e, t, i, o, a) {
    return new on(
      e ?? this.key,
      t ?? this.value,
      i ?? this.color,
      o ?? this.left,
      a ?? this.right,
    );
  }
  isEmpty() {
    return !1;
  }
  inorderTraversal(e) {
    return (
      this.left.inorderTraversal(e) ||
      e(this.key, this.value) ||
      this.right.inorderTraversal(e)
    );
  }
  reverseTraversal(e) {
    return (
      this.right.reverseTraversal(e) ||
      e(this.key, this.value) ||
      this.left.reverseTraversal(e)
    );
  }
  min() {
    return this.left.isEmpty() ? this : this.left.min();
  }
  minKey() {
    return this.min().key;
  }
  maxKey() {
    return this.right.isEmpty() ? this.key : this.right.maxKey();
  }
  insert(e, t, i) {
    let o = this;
    const a = i(e, o.key);
    return (
      (o =
        a < 0
          ? o.copy(null, null, null, o.left.insert(e, t, i), null)
          : a === 0
            ? o.copy(null, t, null, null, null)
            : o.copy(null, null, null, null, o.right.insert(e, t, i))),
      o.fixUp()
    );
  }
  removeMin() {
    if (this.left.isEmpty()) return on.EMPTY;
    let e = this;
    return (
      e.left.isRed() || e.left.left.isRed() || (e = e.moveRedLeft()),
      (e = e.copy(null, null, null, e.left.removeMin(), null)),
      e.fixUp()
    );
  }
  remove(e, t) {
    let i,
      o = this;
    if (t(e, o.key) < 0)
      (o.left.isEmpty() ||
        o.left.isRed() ||
        o.left.left.isRed() ||
        (o = o.moveRedLeft()),
        (o = o.copy(null, null, null, o.left.remove(e, t), null)));
    else {
      if (
        (o.left.isRed() && (o = o.rotateRight()),
        o.right.isEmpty() ||
          o.right.isRed() ||
          o.right.left.isRed() ||
          (o = o.moveRedRight()),
        t(e, o.key) === 0)
      ) {
        if (o.right.isEmpty()) return on.EMPTY;
        ((i = o.right.min()),
          (o = o.copy(i.key, i.value, null, null, o.right.removeMin())));
      }
      o = o.copy(null, null, null, null, o.right.remove(e, t));
    }
    return o.fixUp();
  }
  isRed() {
    return this.color;
  }
  fixUp() {
    let e = this;
    return (
      e.right.isRed() && !e.left.isRed() && (e = e.rotateLeft()),
      e.left.isRed() && e.left.left.isRed() && (e = e.rotateRight()),
      e.left.isRed() && e.right.isRed() && (e = e.colorFlip()),
      e
    );
  }
  moveRedLeft() {
    let e = this.colorFlip();
    return (
      e.right.left.isRed() &&
        ((e = e.copy(null, null, null, null, e.right.rotateRight())),
        (e = e.rotateLeft()),
        (e = e.colorFlip())),
      e
    );
  }
  moveRedRight() {
    let e = this.colorFlip();
    return (
      e.left.left.isRed() && ((e = e.rotateRight()), (e = e.colorFlip())),
      e
    );
  }
  rotateLeft() {
    const e = this.copy(null, null, on.RED, null, this.right.left);
    return this.right.copy(null, null, this.color, e, null);
  }
  rotateRight() {
    const e = this.copy(null, null, on.RED, this.left.right, null);
    return this.left.copy(null, null, this.color, null, e);
  }
  colorFlip() {
    const e = this.left.copy(null, null, !this.left.color, null, null),
      t = this.right.copy(null, null, !this.right.color, null, null);
    return this.copy(null, null, !this.color, e, t);
  }
  checkMaxDepth() {
    const e = this.check();
    return Math.pow(2, e) <= this.size + 1;
  }
  check() {
    if (this.isRed() && this.left.isRed())
      throw Le(43730, { key: this.key, value: this.value });
    if (this.right.isRed())
      throw Le(14113, { key: this.key, value: this.value });
    const e = this.left.check();
    if (e !== this.right.check()) throw Le(27949);
    return e + (this.isRed() ? 0 : 1);
  }
}
((on.EMPTY = null), (on.RED = !0), (on.BLACK = !1));
on.EMPTY = new (class {
  constructor() {
    this.size = 0;
  }
  get key() {
    throw Le(57766);
  }
  get value() {
    throw Le(16141);
  }
  get color() {
    throw Le(16727);
  }
  get left() {
    throw Le(29726);
  }
  get right() {
    throw Le(36894);
  }
  copy(e, t, i, o, a) {
    return this;
  }
  insert(e, t, i) {
    return new on(e, t);
  }
  remove(e, t) {
    return this;
  }
  isEmpty() {
    return !0;
  }
  inorderTraversal(e) {
    return !1;
  }
  reverseTraversal(e) {
    return !1;
  }
  minKey() {
    return null;
  }
  maxKey() {
    return null;
  }
  isRed() {
    return !1;
  }
  checkMaxDepth() {
    return !0;
  }
  check() {
    return 0;
  }
})();
class qt {
  constructor(e) {
    ((this.comparator = e), (this.data = new xt(this.comparator)));
  }
  has(e) {
    return this.data.get(e) !== null;
  }
  first() {
    return this.data.minKey();
  }
  last() {
    return this.data.maxKey();
  }
  get size() {
    return this.data.size;
  }
  indexOf(e) {
    return this.data.indexOf(e);
  }
  forEach(e) {
    this.data.inorderTraversal((t, i) => (e(t), !1));
  }
  forEachInRange(e, t) {
    const i = this.data.getIteratorFrom(e[0]);
    for (; i.hasNext(); ) {
      const o = i.getNext();
      if (this.comparator(o.key, e[1]) >= 0) return;
      t(o.key);
    }
  }
  forEachWhile(e, t) {
    let i;
    for (
      i = t !== void 0 ? this.data.getIteratorFrom(t) : this.data.getIterator();
      i.hasNext();

    )
      if (!e(i.getNext().key)) return;
  }
  firstAfterOrEqual(e) {
    const t = this.data.getIteratorFrom(e);
    return t.hasNext() ? t.getNext().key : null;
  }
  getIterator() {
    return new F_(this.data.getIterator());
  }
  getIteratorFrom(e) {
    return new F_(this.data.getIteratorFrom(e));
  }
  add(e) {
    return this.copy(this.data.remove(e).insert(e, !0));
  }
  delete(e) {
    return this.has(e) ? this.copy(this.data.remove(e)) : this;
  }
  isEmpty() {
    return this.data.isEmpty();
  }
  unionWith(e) {
    let t = this;
    return (
      t.size < e.size && ((t = e), (e = this)),
      e.forEach((i) => {
        t = t.add(i);
      }),
      t
    );
  }
  isEqual(e) {
    if (!(e instanceof qt) || this.size !== e.size) return !1;
    const t = this.data.getIterator(),
      i = e.data.getIterator();
    for (; t.hasNext(); ) {
      const o = t.getNext().key,
        a = i.getNext().key;
      if (this.comparator(o, a) !== 0) return !1;
    }
    return !0;
  }
  toArray() {
    const e = [];
    return (
      this.forEach((t) => {
        e.push(t);
      }),
      e
    );
  }
  toString() {
    const e = [];
    return (this.forEach((t) => e.push(t)), "SortedSet(" + e.toString() + ")");
  }
  copy(e) {
    const t = new qt(this.comparator);
    return ((t.data = e), t);
  }
}
class F_ {
  constructor(e) {
    this.iter = e;
  }
  getNext() {
    return this.iter.getNext().key;
  }
  hasNext() {
    return this.iter.hasNext();
  }
}
class br {
  constructor(e) {
    ((this.fields = e), e.sort(an.comparator));
  }
  static empty() {
    return new br([]);
  }
  unionWith(e) {
    let t = new qt(an.comparator);
    for (const i of this.fields) t = t.add(i);
    for (const i of e) t = t.add(i);
    return new br(t.toArray());
  }
  covers(e) {
    for (const t of this.fields) if (t.isPrefixOf(e)) return !0;
    return !1;
  }
  isEqual(e) {
    return Oa(this.fields, e.fields, (t, i) => t.isEqual(i));
  }
}
class hE extends Error {
  constructor() {
    (super(...arguments), (this.name = "Base64DecodeError"));
  }
}
class ln {
  constructor(e) {
    this.binaryString = e;
  }
  static fromBase64String(e) {
    const t = (function (o) {
      try {
        return atob(o);
      } catch (a) {
        throw typeof DOMException < "u" && a instanceof DOMException
          ? new hE("Invalid base64 string: " + a)
          : a;
      }
    })(e);
    return new ln(t);
  }
  static fromUint8Array(e) {
    const t = (function (o) {
      let a = "";
      for (let u = 0; u < o.length; ++u) a += String.fromCharCode(o[u]);
      return a;
    })(e);
    return new ln(t);
  }
  [Symbol.iterator]() {
    let e = 0;
    return {
      next: () =>
        e < this.binaryString.length
          ? { value: this.binaryString.charCodeAt(e++), done: !1 }
          : { value: void 0, done: !0 },
    };
  }
  toBase64() {
    return (function (t) {
      return btoa(t);
    })(this.binaryString);
  }
  toUint8Array() {
    return (function (t) {
      const i = new Uint8Array(t.length);
      for (let o = 0; o < t.length; o++) i[o] = t.charCodeAt(o);
      return i;
    })(this.binaryString);
  }
  approximateByteSize() {
    return 2 * this.binaryString.length;
  }
  compareTo(e) {
    return qe(this.binaryString, e.binaryString);
  }
  isEqual(e) {
    return this.binaryString === e.binaryString;
  }
}
ln.EMPTY_BYTE_STRING = new ln("");
const Mk = new RegExp(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.(\d+))?Z$/);
function Bs(n) {
  if ((at(!!n, 39018), typeof n == "string")) {
    let e = 0;
    const t = Mk.exec(n);
    if ((at(!!t, 46558, { timestamp: n }), t[1])) {
      let o = t[1];
      ((o = (o + "000000000").substr(0, 9)), (e = Number(o)));
    }
    const i = new Date(n);
    return { seconds: Math.floor(i.getTime() / 1e3), nanos: e };
  }
  return { seconds: Ot(n.seconds), nanos: Ot(n.nanos) };
}
function Ot(n) {
  return typeof n == "number" ? n : typeof n == "string" ? Number(n) : 0;
}
function $s(n) {
  return typeof n == "string" ? ln.fromBase64String(n) : ln.fromUint8Array(n);
}
const dE = "server_timestamp",
  fE = "__type__",
  pE = "__previous_value__",
  mE = "__local_write_time__";
function Rm(n) {
  var e, t;
  return (
    ((t = (((e = n?.mapValue) === null || e === void 0 ? void 0 : e.fields) ||
      {})[fE]) === null || t === void 0
      ? void 0
      : t.stringValue) === dE
  );
}
function Yh(n) {
  const e = n.mapValue.fields[pE];
  return Rm(e) ? Yh(e) : e;
}
function nu(n) {
  const e = Bs(n.mapValue.fields[mE].timestampValue);
  return new Et(e.seconds, e.nanos);
}
class Vk {
  constructor(e, t, i, o, a, u, d, f, m, v) {
    ((this.databaseId = e),
      (this.appId = t),
      (this.persistenceKey = i),
      (this.host = o),
      (this.ssl = a),
      (this.forceLongPolling = u),
      (this.autoDetectLongPolling = d),
      (this.longPollingOptions = f),
      (this.useFetchStreams = m),
      (this.isUsingEmulator = v));
  }
}
const vh = "(default)";
class ru {
  constructor(e, t) {
    ((this.projectId = e), (this.database = t || vh));
  }
  static empty() {
    return new ru("", "");
  }
  get isDefaultDatabase() {
    return this.database === vh;
  }
  isEqual(e) {
    return (
      e instanceof ru &&
      e.projectId === this.projectId &&
      e.database === this.database
    );
  }
}
const gE = "__type__",
  Fk = "__max__",
  Uc = { mapValue: {} },
  yE = "__vector__",
  _h = "value";
function Hs(n) {
  return "nullValue" in n
    ? 0
    : "booleanValue" in n
      ? 1
      : "integerValue" in n || "doubleValue" in n
        ? 2
        : "timestampValue" in n
          ? 3
          : "stringValue" in n
            ? 5
            : "bytesValue" in n
              ? 6
              : "referenceValue" in n
                ? 7
                : "geoPointValue" in n
                  ? 8
                  : "arrayValue" in n
                    ? 9
                    : "mapValue" in n
                      ? Rm(n)
                        ? 4
                        : zk(n)
                          ? 9007199254740991
                          : Uk(n)
                            ? 10
                            : 11
                      : Le(28295, { value: n });
}
function li(n, e) {
  if (n === e) return !0;
  const t = Hs(n);
  if (t !== Hs(e)) return !1;
  switch (t) {
    case 0:
    case 9007199254740991:
      return !0;
    case 1:
      return n.booleanValue === e.booleanValue;
    case 4:
      return nu(n).isEqual(nu(e));
    case 3:
      return (function (o, a) {
        if (
          typeof o.timestampValue == "string" &&
          typeof a.timestampValue == "string" &&
          o.timestampValue.length === a.timestampValue.length
        )
          return o.timestampValue === a.timestampValue;
        const u = Bs(o.timestampValue),
          d = Bs(a.timestampValue);
        return u.seconds === d.seconds && u.nanos === d.nanos;
      })(n, e);
    case 5:
      return n.stringValue === e.stringValue;
    case 6:
      return (function (o, a) {
        return $s(o.bytesValue).isEqual($s(a.bytesValue));
      })(n, e);
    case 7:
      return n.referenceValue === e.referenceValue;
    case 8:
      return (function (o, a) {
        return (
          Ot(o.geoPointValue.latitude) === Ot(a.geoPointValue.latitude) &&
          Ot(o.geoPointValue.longitude) === Ot(a.geoPointValue.longitude)
        );
      })(n, e);
    case 2:
      return (function (o, a) {
        if ("integerValue" in o && "integerValue" in a)
          return Ot(o.integerValue) === Ot(a.integerValue);
        if ("doubleValue" in o && "doubleValue" in a) {
          const u = Ot(o.doubleValue),
            d = Ot(a.doubleValue);
          return u === d ? yh(u) === yh(d) : isNaN(u) && isNaN(d);
        }
        return !1;
      })(n, e);
    case 9:
      return Oa(n.arrayValue.values || [], e.arrayValue.values || [], li);
    case 10:
    case 11:
      return (function (o, a) {
        const u = o.mapValue.fields || {},
          d = a.mapValue.fields || {};
        if (V_(u) !== V_(d)) return !1;
        for (const f in u)
          if (u.hasOwnProperty(f) && (d[f] === void 0 || !li(u[f], d[f])))
            return !1;
        return !0;
      })(n, e);
    default:
      return Le(52216, { left: n });
  }
}
function iu(n, e) {
  return (n.values || []).find((t) => li(t, e)) !== void 0;
}
function La(n, e) {
  if (n === e) return 0;
  const t = Hs(n),
    i = Hs(e);
  if (t !== i) return qe(t, i);
  switch (t) {
    case 0:
    case 9007199254740991:
      return 0;
    case 1:
      return qe(n.booleanValue, e.booleanValue);
    case 2:
      return (function (a, u) {
        const d = Ot(a.integerValue || a.doubleValue),
          f = Ot(u.integerValue || u.doubleValue);
        return d < f
          ? -1
          : d > f
            ? 1
            : d === f
              ? 0
              : isNaN(d)
                ? isNaN(f)
                  ? 0
                  : -1
                : 1;
      })(n, e);
    case 3:
      return U_(n.timestampValue, e.timestampValue);
    case 4:
      return U_(nu(n), nu(e));
    case 5:
      return Op(n.stringValue, e.stringValue);
    case 6:
      return (function (a, u) {
        const d = $s(a),
          f = $s(u);
        return d.compareTo(f);
      })(n.bytesValue, e.bytesValue);
    case 7:
      return (function (a, u) {
        const d = a.split("/"),
          f = u.split("/");
        for (let m = 0; m < d.length && m < f.length; m++) {
          const v = qe(d[m], f[m]);
          if (v !== 0) return v;
        }
        return qe(d.length, f.length);
      })(n.referenceValue, e.referenceValue);
    case 8:
      return (function (a, u) {
        const d = qe(Ot(a.latitude), Ot(u.latitude));
        return d !== 0 ? d : qe(Ot(a.longitude), Ot(u.longitude));
      })(n.geoPointValue, e.geoPointValue);
    case 9:
      return z_(n.arrayValue, e.arrayValue);
    case 10:
      return (function (a, u) {
        var d, f, m, v;
        const w = a.fields || {},
          T = u.fields || {},
          A = (d = w[_h]) === null || d === void 0 ? void 0 : d.arrayValue,
          D = (f = T[_h]) === null || f === void 0 ? void 0 : f.arrayValue,
          j = qe(
            ((m = A?.values) === null || m === void 0 ? void 0 : m.length) || 0,
            ((v = D?.values) === null || v === void 0 ? void 0 : v.length) || 0,
          );
        return j !== 0 ? j : z_(A, D);
      })(n.mapValue, e.mapValue);
    case 11:
      return (function (a, u) {
        if (a === Uc.mapValue && u === Uc.mapValue) return 0;
        if (a === Uc.mapValue) return 1;
        if (u === Uc.mapValue) return -1;
        const d = a.fields || {},
          f = Object.keys(d),
          m = u.fields || {},
          v = Object.keys(m);
        (f.sort(), v.sort());
        for (let w = 0; w < f.length && w < v.length; ++w) {
          const T = Op(f[w], v[w]);
          if (T !== 0) return T;
          const A = La(d[f[w]], m[v[w]]);
          if (A !== 0) return A;
        }
        return qe(f.length, v.length);
      })(n.mapValue, e.mapValue);
    default:
      throw Le(23264, { le: t });
  }
}
function U_(n, e) {
  if (typeof n == "string" && typeof e == "string" && n.length === e.length)
    return qe(n, e);
  const t = Bs(n),
    i = Bs(e),
    o = qe(t.seconds, i.seconds);
  return o !== 0 ? o : qe(t.nanos, i.nanos);
}
function z_(n, e) {
  const t = n.values || [],
    i = e.values || [];
  for (let o = 0; o < t.length && o < i.length; ++o) {
    const a = La(t[o], i[o]);
    if (a) return a;
  }
  return qe(t.length, i.length);
}
function Ma(n) {
  return Lp(n);
}
function Lp(n) {
  return "nullValue" in n
    ? "null"
    : "booleanValue" in n
      ? "" + n.booleanValue
      : "integerValue" in n
        ? "" + n.integerValue
        : "doubleValue" in n
          ? "" + n.doubleValue
          : "timestampValue" in n
            ? (function (t) {
                const i = Bs(t);
                return `time(${i.seconds},${i.nanos})`;
              })(n.timestampValue)
            : "stringValue" in n
              ? n.stringValue
              : "bytesValue" in n
                ? (function (t) {
                    return $s(t).toBase64();
                  })(n.bytesValue)
                : "referenceValue" in n
                  ? (function (t) {
                      return De.fromName(t).toString();
                    })(n.referenceValue)
                  : "geoPointValue" in n
                    ? (function (t) {
                        return `geo(${t.latitude},${t.longitude})`;
                      })(n.geoPointValue)
                    : "arrayValue" in n
                      ? (function (t) {
                          let i = "[",
                            o = !0;
                          for (const a of t.values || [])
                            (o ? (o = !1) : (i += ","), (i += Lp(a)));
                          return i + "]";
                        })(n.arrayValue)
                      : "mapValue" in n
                        ? (function (t) {
                            const i = Object.keys(t.fields || {}).sort();
                            let o = "{",
                              a = !0;
                            for (const u of i)
                              (a ? (a = !1) : (o += ","),
                                (o += `${u}:${Lp(t.fields[u])}`));
                            return o + "}";
                          })(n.mapValue)
                        : Le(61005, { value: n });
}
function Yc(n) {
  switch (Hs(n)) {
    case 0:
    case 1:
      return 4;
    case 2:
      return 8;
    case 3:
    case 8:
      return 16;
    case 4:
      const e = Yh(n);
      return e ? 16 + Yc(e) : 16;
    case 5:
      return 2 * n.stringValue.length;
    case 6:
      return $s(n.bytesValue).approximateByteSize();
    case 7:
      return n.referenceValue.length;
    case 9:
      return (function (i) {
        return (i.values || []).reduce((o, a) => o + Yc(a), 0);
      })(n.arrayValue);
    case 10:
    case 11:
      return (function (i) {
        let o = 0;
        return (
          No(i.fields, (a, u) => {
            o += a.length + Yc(u);
          }),
          o
        );
      })(n.mapValue);
    default:
      throw Le(13486, { value: n });
  }
}
function Mp(n) {
  return !!n && "integerValue" in n;
}
function Am(n) {
  return !!n && "arrayValue" in n;
}
function j_(n) {
  return !!n && "nullValue" in n;
}
function B_(n) {
  return !!n && "doubleValue" in n && isNaN(Number(n.doubleValue));
}
function Xc(n) {
  return !!n && "mapValue" in n;
}
function Uk(n) {
  var e, t;
  return (
    ((t = (((e = n?.mapValue) === null || e === void 0 ? void 0 : e.fields) ||
      {})[gE]) === null || t === void 0
      ? void 0
      : t.stringValue) === yE
  );
}
function Ul(n) {
  if (n.geoPointValue)
    return { geoPointValue: Object.assign({}, n.geoPointValue) };
  if (n.timestampValue && typeof n.timestampValue == "object")
    return { timestampValue: Object.assign({}, n.timestampValue) };
  if (n.mapValue) {
    const e = { mapValue: { fields: {} } };
    return (No(n.mapValue.fields, (t, i) => (e.mapValue.fields[t] = Ul(i))), e);
  }
  if (n.arrayValue) {
    const e = { arrayValue: { values: [] } };
    for (let t = 0; t < (n.arrayValue.values || []).length; ++t)
      e.arrayValue.values[t] = Ul(n.arrayValue.values[t]);
    return e;
  }
  return Object.assign({}, n);
}
function zk(n) {
  return (((n.mapValue || {}).fields || {}).__type__ || {}).stringValue === Fk;
}
class ur {
  constructor(e) {
    this.value = e;
  }
  static empty() {
    return new ur({ mapValue: {} });
  }
  field(e) {
    if (e.isEmpty()) return this.value;
    {
      let t = this.value;
      for (let i = 0; i < e.length - 1; ++i)
        if (((t = (t.mapValue.fields || {})[e.get(i)]), !Xc(t))) return null;
      return ((t = (t.mapValue.fields || {})[e.lastSegment()]), t || null);
    }
  }
  set(e, t) {
    this.getFieldsMap(e.popLast())[e.lastSegment()] = Ul(t);
  }
  setAll(e) {
    let t = an.emptyPath(),
      i = {},
      o = [];
    e.forEach((u, d) => {
      if (!t.isImmediateParentOf(d)) {
        const f = this.getFieldsMap(t);
        (this.applyChanges(f, i, o), (i = {}), (o = []), (t = d.popLast()));
      }
      u ? (i[d.lastSegment()] = Ul(u)) : o.push(d.lastSegment());
    });
    const a = this.getFieldsMap(t);
    this.applyChanges(a, i, o);
  }
  delete(e) {
    const t = this.field(e.popLast());
    Xc(t) && t.mapValue.fields && delete t.mapValue.fields[e.lastSegment()];
  }
  isEqual(e) {
    return li(this.value, e.value);
  }
  getFieldsMap(e) {
    let t = this.value;
    t.mapValue.fields || (t.mapValue = { fields: {} });
    for (let i = 0; i < e.length; ++i) {
      let o = t.mapValue.fields[e.get(i)];
      ((Xc(o) && o.mapValue.fields) ||
        ((o = { mapValue: { fields: {} } }), (t.mapValue.fields[e.get(i)] = o)),
        (t = o));
    }
    return t.mapValue.fields;
  }
  applyChanges(e, t, i) {
    No(t, (o, a) => (e[o] = a));
    for (const o of i) delete e[o];
  }
  clone() {
    return new ur(Ul(this.value));
  }
}
function vE(n) {
  const e = [];
  return (
    No(n.fields, (t, i) => {
      const o = new an([t]);
      if (Xc(i)) {
        const a = vE(i.mapValue).fields;
        if (a.length === 0) e.push(o);
        else for (const u of a) e.push(o.child(u));
      } else e.push(o);
    }),
    new br(e)
  );
}
class gn {
  constructor(e, t, i, o, a, u, d) {
    ((this.key = e),
      (this.documentType = t),
      (this.version = i),
      (this.readTime = o),
      (this.createTime = a),
      (this.data = u),
      (this.documentState = d));
  }
  static newInvalidDocument(e) {
    return new gn(e, 0, ze.min(), ze.min(), ze.min(), ur.empty(), 0);
  }
  static newFoundDocument(e, t, i, o) {
    return new gn(e, 1, t, ze.min(), i, o, 0);
  }
  static newNoDocument(e, t) {
    return new gn(e, 2, t, ze.min(), ze.min(), ur.empty(), 0);
  }
  static newUnknownDocument(e, t) {
    return new gn(e, 3, t, ze.min(), ze.min(), ur.empty(), 2);
  }
  convertToFoundDocument(e, t) {
    return (
      !this.createTime.isEqual(ze.min()) ||
        (this.documentType !== 2 && this.documentType !== 0) ||
        (this.createTime = e),
      (this.version = e),
      (this.documentType = 1),
      (this.data = t),
      (this.documentState = 0),
      this
    );
  }
  convertToNoDocument(e) {
    return (
      (this.version = e),
      (this.documentType = 2),
      (this.data = ur.empty()),
      (this.documentState = 0),
      this
    );
  }
  convertToUnknownDocument(e) {
    return (
      (this.version = e),
      (this.documentType = 3),
      (this.data = ur.empty()),
      (this.documentState = 2),
      this
    );
  }
  setHasCommittedMutations() {
    return ((this.documentState = 2), this);
  }
  setHasLocalMutations() {
    return ((this.documentState = 1), (this.version = ze.min()), this);
  }
  setReadTime(e) {
    return ((this.readTime = e), this);
  }
  get hasLocalMutations() {
    return this.documentState === 1;
  }
  get hasCommittedMutations() {
    return this.documentState === 2;
  }
  get hasPendingWrites() {
    return this.hasLocalMutations || this.hasCommittedMutations;
  }
  isValidDocument() {
    return this.documentType !== 0;
  }
  isFoundDocument() {
    return this.documentType === 1;
  }
  isNoDocument() {
    return this.documentType === 2;
  }
  isUnknownDocument() {
    return this.documentType === 3;
  }
  isEqual(e) {
    return (
      e instanceof gn &&
      this.key.isEqual(e.key) &&
      this.version.isEqual(e.version) &&
      this.documentType === e.documentType &&
      this.documentState === e.documentState &&
      this.data.isEqual(e.data)
    );
  }
  mutableCopy() {
    return new gn(
      this.key,
      this.documentType,
      this.version,
      this.readTime,
      this.createTime,
      this.data.clone(),
      this.documentState,
    );
  }
  toString() {
    return `Document(${this.key}, ${this.version}, ${JSON.stringify(this.data.value)}, {createTime: ${this.createTime}}), {documentType: ${this.documentType}}), {documentState: ${this.documentState}})`;
  }
}
class wh {
  constructor(e, t) {
    ((this.position = e), (this.inclusive = t));
  }
}
function $_(n, e, t) {
  let i = 0;
  for (let o = 0; o < n.position.length; o++) {
    const a = e[o],
      u = n.position[o];
    if (
      (a.field.isKeyField()
        ? (i = De.comparator(De.fromName(u.referenceValue), t.key))
        : (i = La(u, t.data.field(a.field))),
      a.dir === "desc" && (i *= -1),
      i !== 0)
    )
      break;
  }
  return i;
}
function H_(n, e) {
  if (n === null) return e === null;
  if (
    e === null ||
    n.inclusive !== e.inclusive ||
    n.position.length !== e.position.length
  )
    return !1;
  for (let t = 0; t < n.position.length; t++)
    if (!li(n.position[t], e.position[t])) return !1;
  return !0;
}
class Eh {
  constructor(e, t = "asc") {
    ((this.field = e), (this.dir = t));
  }
}
function jk(n, e) {
  return n.dir === e.dir && n.field.isEqual(e.field);
}
class _E {}
class Wt extends _E {
  constructor(e, t, i) {
    (super(), (this.field = e), (this.op = t), (this.value = i));
  }
  static create(e, t, i) {
    return e.isKeyField()
      ? t === "in" || t === "not-in"
        ? this.createKeyFieldInFilter(e, t, i)
        : new $k(e, t, i)
      : t === "array-contains"
        ? new qk(e, i)
        : t === "in"
          ? new Kk(e, i)
          : t === "not-in"
            ? new Gk(e, i)
            : t === "array-contains-any"
              ? new Qk(e, i)
              : new Wt(e, t, i);
  }
  static createKeyFieldInFilter(e, t, i) {
    return t === "in" ? new Hk(e, i) : new Wk(e, i);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return this.op === "!="
      ? t !== null &&
          t.nullValue === void 0 &&
          this.matchesComparison(La(t, this.value))
      : t !== null &&
          Hs(this.value) === Hs(t) &&
          this.matchesComparison(La(t, this.value));
  }
  matchesComparison(e) {
    switch (this.op) {
      case "<":
        return e < 0;
      case "<=":
        return e <= 0;
      case "==":
        return e === 0;
      case "!=":
        return e !== 0;
      case ">":
        return e > 0;
      case ">=":
        return e >= 0;
      default:
        return Le(47266, { operator: this.op });
    }
  }
  isInequality() {
    return ["<", "<=", ">", ">=", "!=", "not-in"].indexOf(this.op) >= 0;
  }
  getFlattenedFilters() {
    return [this];
  }
  getFilters() {
    return [this];
  }
}
class ui extends _E {
  constructor(e, t) {
    (super(), (this.filters = e), (this.op = t), (this.he = null));
  }
  static create(e, t) {
    return new ui(e, t);
  }
  matches(e) {
    return wE(this)
      ? this.filters.find((t) => !t.matches(e)) === void 0
      : this.filters.find((t) => t.matches(e)) !== void 0;
  }
  getFlattenedFilters() {
    return (
      this.he !== null ||
        (this.he = this.filters.reduce(
          (e, t) => e.concat(t.getFlattenedFilters()),
          [],
        )),
      this.he
    );
  }
  getFilters() {
    return Object.assign([], this.filters);
  }
}
function wE(n) {
  return n.op === "and";
}
function EE(n) {
  return Bk(n) && wE(n);
}
function Bk(n) {
  for (const e of n.filters) if (e instanceof ui) return !1;
  return !0;
}
function Vp(n) {
  if (n instanceof Wt)
    return n.field.canonicalString() + n.op.toString() + Ma(n.value);
  if (EE(n)) return n.filters.map((e) => Vp(e)).join(",");
  {
    const e = n.filters.map((t) => Vp(t)).join(",");
    return `${n.op}(${e})`;
  }
}
function TE(n, e) {
  return n instanceof Wt
    ? (function (i, o) {
        return (
          o instanceof Wt &&
          i.op === o.op &&
          i.field.isEqual(o.field) &&
          li(i.value, o.value)
        );
      })(n, e)
    : n instanceof ui
      ? (function (i, o) {
          return o instanceof ui &&
            i.op === o.op &&
            i.filters.length === o.filters.length
            ? i.filters.reduce((a, u, d) => a && TE(u, o.filters[d]), !0)
            : !1;
        })(n, e)
      : void Le(19439);
}
function SE(n) {
  return n instanceof Wt
    ? (function (t) {
        return `${t.field.canonicalString()} ${t.op} ${Ma(t.value)}`;
      })(n)
    : n instanceof ui
      ? (function (t) {
          return (
            t.op.toString() + " {" + t.getFilters().map(SE).join(" ,") + "}"
          );
        })(n)
      : "Filter";
}
class $k extends Wt {
  constructor(e, t, i) {
    (super(e, t, i), (this.key = De.fromName(i.referenceValue)));
  }
  matches(e) {
    const t = De.comparator(e.key, this.key);
    return this.matchesComparison(t);
  }
}
class Hk extends Wt {
  constructor(e, t) {
    (super(e, "in", t), (this.keys = IE("in", t)));
  }
  matches(e) {
    return this.keys.some((t) => t.isEqual(e.key));
  }
}
class Wk extends Wt {
  constructor(e, t) {
    (super(e, "not-in", t), (this.keys = IE("not-in", t)));
  }
  matches(e) {
    return !this.keys.some((t) => t.isEqual(e.key));
  }
}
function IE(n, e) {
  var t;
  return (
    ((t = e.arrayValue) === null || t === void 0 ? void 0 : t.values) || []
  ).map((i) => De.fromName(i.referenceValue));
}
class qk extends Wt {
  constructor(e, t) {
    super(e, "array-contains", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return Am(t) && iu(t.arrayValue, this.value);
  }
}
class Kk extends Wt {
  constructor(e, t) {
    super(e, "in", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return t !== null && iu(this.value.arrayValue, t);
  }
}
class Gk extends Wt {
  constructor(e, t) {
    super(e, "not-in", t);
  }
  matches(e) {
    if (iu(this.value.arrayValue, { nullValue: "NULL_VALUE" })) return !1;
    const t = e.data.field(this.field);
    return (
      t !== null && t.nullValue === void 0 && !iu(this.value.arrayValue, t)
    );
  }
}
class Qk extends Wt {
  constructor(e, t) {
    super(e, "array-contains-any", t);
  }
  matches(e) {
    const t = e.data.field(this.field);
    return (
      !(!Am(t) || !t.arrayValue.values) &&
      t.arrayValue.values.some((i) => iu(this.value.arrayValue, i))
    );
  }
}
class Yk {
  constructor(e, t = null, i = [], o = [], a = null, u = null, d = null) {
    ((this.path = e),
      (this.collectionGroup = t),
      (this.orderBy = i),
      (this.filters = o),
      (this.limit = a),
      (this.startAt = u),
      (this.endAt = d),
      (this.Pe = null));
  }
}
function W_(n, e = null, t = [], i = [], o = null, a = null, u = null) {
  return new Yk(n, e, t, i, o, a, u);
}
function Cm(n) {
  const e = je(n);
  if (e.Pe === null) {
    let t = e.path.canonicalString();
    (e.collectionGroup !== null && (t += "|cg:" + e.collectionGroup),
      (t += "|f:"),
      (t += e.filters.map((i) => Vp(i)).join(",")),
      (t += "|ob:"),
      (t += e.orderBy
        .map((i) =>
          (function (a) {
            return a.field.canonicalString() + a.dir;
          })(i),
        )
        .join(",")),
      Qh(e.limit) || ((t += "|l:"), (t += e.limit)),
      e.startAt &&
        ((t += "|lb:"),
        (t += e.startAt.inclusive ? "b:" : "a:"),
        (t += e.startAt.position.map((i) => Ma(i)).join(","))),
      e.endAt &&
        ((t += "|ub:"),
        (t += e.endAt.inclusive ? "a:" : "b:"),
        (t += e.endAt.position.map((i) => Ma(i)).join(","))),
      (e.Pe = t));
  }
  return e.Pe;
}
function Pm(n, e) {
  if (n.limit !== e.limit || n.orderBy.length !== e.orderBy.length) return !1;
  for (let t = 0; t < n.orderBy.length; t++)
    if (!jk(n.orderBy[t], e.orderBy[t])) return !1;
  if (n.filters.length !== e.filters.length) return !1;
  for (let t = 0; t < n.filters.length; t++)
    if (!TE(n.filters[t], e.filters[t])) return !1;
  return (
    n.collectionGroup === e.collectionGroup &&
    !!n.path.isEqual(e.path) &&
    !!H_(n.startAt, e.startAt) &&
    H_(n.endAt, e.endAt)
  );
}
function Fp(n) {
  return (
    De.isDocumentKey(n.path) &&
    n.collectionGroup === null &&
    n.filters.length === 0
  );
}
class Xh {
  constructor(
    e,
    t = null,
    i = [],
    o = [],
    a = null,
    u = "F",
    d = null,
    f = null,
  ) {
    ((this.path = e),
      (this.collectionGroup = t),
      (this.explicitOrderBy = i),
      (this.filters = o),
      (this.limit = a),
      (this.limitType = u),
      (this.startAt = d),
      (this.endAt = f),
      (this.Te = null),
      (this.Ie = null),
      (this.de = null),
      this.startAt,
      this.endAt);
  }
}
function Xk(n, e, t, i, o, a, u, d) {
  return new Xh(n, e, t, i, o, a, u, d);
}
function km(n) {
  return new Xh(n);
}
function q_(n) {
  return (
    n.filters.length === 0 &&
    n.limit === null &&
    n.startAt == null &&
    n.endAt == null &&
    (n.explicitOrderBy.length === 0 ||
      (n.explicitOrderBy.length === 1 &&
        n.explicitOrderBy[0].field.isKeyField()))
  );
}
function Jk(n) {
  return n.collectionGroup !== null;
}
function zl(n) {
  const e = je(n);
  if (e.Te === null) {
    e.Te = [];
    const t = new Set();
    for (const a of e.explicitOrderBy)
      (e.Te.push(a), t.add(a.field.canonicalString()));
    const i =
      e.explicitOrderBy.length > 0
        ? e.explicitOrderBy[e.explicitOrderBy.length - 1].dir
        : "asc";
    ((function (u) {
      let d = new qt(an.comparator);
      return (
        u.filters.forEach((f) => {
          f.getFlattenedFilters().forEach((m) => {
            m.isInequality() && (d = d.add(m.field));
          });
        }),
        d
      );
    })(e).forEach((a) => {
      t.has(a.canonicalString()) || a.isKeyField() || e.Te.push(new Eh(a, i));
    }),
      t.has(an.keyField().canonicalString()) ||
        e.Te.push(new Eh(an.keyField(), i)));
  }
  return e.Te;
}
function Zr(n) {
  const e = je(n);
  return (e.Ie || (e.Ie = Zk(e, zl(n))), e.Ie);
}
function Zk(n, e) {
  if (n.limitType === "F")
    return W_(
      n.path,
      n.collectionGroup,
      e,
      n.filters,
      n.limit,
      n.startAt,
      n.endAt,
    );
  {
    e = e.map((o) => {
      const a = o.dir === "desc" ? "asc" : "desc";
      return new Eh(o.field, a);
    });
    const t = n.endAt ? new wh(n.endAt.position, n.endAt.inclusive) : null,
      i = n.startAt ? new wh(n.startAt.position, n.startAt.inclusive) : null;
    return W_(n.path, n.collectionGroup, e, n.filters, n.limit, t, i);
  }
}
function Up(n, e, t) {
  return new Xh(
    n.path,
    n.collectionGroup,
    n.explicitOrderBy.slice(),
    n.filters.slice(),
    e,
    t,
    n.startAt,
    n.endAt,
  );
}
function Jh(n, e) {
  return Pm(Zr(n), Zr(e)) && n.limitType === e.limitType;
}
function RE(n) {
  return `${Cm(Zr(n))}|lt:${n.limitType}`;
}
function Ea(n) {
  return `Query(target=${(function (t) {
    let i = t.path.canonicalString();
    return (
      t.collectionGroup !== null &&
        (i += " collectionGroup=" + t.collectionGroup),
      t.filters.length > 0 &&
        (i += `, filters: [${t.filters.map((o) => SE(o)).join(", ")}]`),
      Qh(t.limit) || (i += ", limit: " + t.limit),
      t.orderBy.length > 0 &&
        (i += `, orderBy: [${t.orderBy
          .map((o) =>
            (function (u) {
              return `${u.field.canonicalString()} (${u.dir})`;
            })(o),
          )
          .join(", ")}]`),
      t.startAt &&
        ((i += ", startAt: "),
        (i += t.startAt.inclusive ? "b:" : "a:"),
        (i += t.startAt.position.map((o) => Ma(o)).join(","))),
      t.endAt &&
        ((i += ", endAt: "),
        (i += t.endAt.inclusive ? "a:" : "b:"),
        (i += t.endAt.position.map((o) => Ma(o)).join(","))),
      `Target(${i})`
    );
  })(Zr(n))}; limitType=${n.limitType})`;
}
function Zh(n, e) {
  return (
    e.isFoundDocument() &&
    (function (i, o) {
      const a = o.key.path;
      return i.collectionGroup !== null
        ? o.key.hasCollectionId(i.collectionGroup) && i.path.isPrefixOf(a)
        : De.isDocumentKey(i.path)
          ? i.path.isEqual(a)
          : i.path.isImmediateParentOf(a);
    })(n, e) &&
    (function (i, o) {
      for (const a of zl(i))
        if (!a.field.isKeyField() && o.data.field(a.field) === null) return !1;
      return !0;
    })(n, e) &&
    (function (i, o) {
      for (const a of i.filters) if (!a.matches(o)) return !1;
      return !0;
    })(n, e) &&
    (function (i, o) {
      return !(
        (i.startAt &&
          !(function (u, d, f) {
            const m = $_(u, d, f);
            return u.inclusive ? m <= 0 : m < 0;
          })(i.startAt, zl(i), o)) ||
        (i.endAt &&
          !(function (u, d, f) {
            const m = $_(u, d, f);
            return u.inclusive ? m >= 0 : m > 0;
          })(i.endAt, zl(i), o))
      );
    })(n, e)
  );
}
function ex(n) {
  return (
    n.collectionGroup ||
    (n.path.length % 2 == 1
      ? n.path.lastSegment()
      : n.path.get(n.path.length - 2))
  );
}
function AE(n) {
  return (e, t) => {
    let i = !1;
    for (const o of zl(n)) {
      const a = tx(o, e, t);
      if (a !== 0) return a;
      i = i || o.field.isKeyField();
    }
    return 0;
  };
}
function tx(n, e, t) {
  const i = n.field.isKeyField()
    ? De.comparator(e.key, t.key)
    : (function (a, u, d) {
        const f = u.data.field(a),
          m = d.data.field(a);
        return f !== null && m !== null ? La(f, m) : Le(42886);
      })(n.field, e, t);
  switch (n.dir) {
    case "asc":
      return i;
    case "desc":
      return -1 * i;
    default:
      return Le(19790, { direction: n.dir });
  }
}
class Oo {
  constructor(e, t) {
    ((this.mapKeyFn = e),
      (this.equalsFn = t),
      (this.inner = {}),
      (this.innerSize = 0));
  }
  get(e) {
    const t = this.mapKeyFn(e),
      i = this.inner[t];
    if (i !== void 0) {
      for (const [o, a] of i) if (this.equalsFn(o, e)) return a;
    }
  }
  has(e) {
    return this.get(e) !== void 0;
  }
  set(e, t) {
    const i = this.mapKeyFn(e),
      o = this.inner[i];
    if (o === void 0)
      return ((this.inner[i] = [[e, t]]), void this.innerSize++);
    for (let a = 0; a < o.length; a++)
      if (this.equalsFn(o[a][0], e)) return void (o[a] = [e, t]);
    (o.push([e, t]), this.innerSize++);
  }
  delete(e) {
    const t = this.mapKeyFn(e),
      i = this.inner[t];
    if (i === void 0) return !1;
    for (let o = 0; o < i.length; o++)
      if (this.equalsFn(i[o][0], e))
        return (
          i.length === 1 ? delete this.inner[t] : i.splice(o, 1),
          this.innerSize--,
          !0
        );
    return !1;
  }
  forEach(e) {
    No(this.inner, (t, i) => {
      for (const [o, a] of i) e(o, a);
    });
  }
  isEmpty() {
    return cE(this.inner);
  }
  size() {
    return this.innerSize;
  }
}
const nx = new xt(De.comparator);
function Bi() {
  return nx;
}
const CE = new xt(De.comparator);
function Ol(...n) {
  let e = CE;
  for (const t of n) e = e.insert(t.key, t);
  return e;
}
function PE(n) {
  let e = CE;
  return (n.forEach((t, i) => (e = e.insert(t, i.overlayedDocument))), e);
}
function Io() {
  return jl();
}
function kE() {
  return jl();
}
function jl() {
  return new Oo(
    (n) => n.toString(),
    (n, e) => n.isEqual(e),
  );
}
const rx = new xt(De.comparator),
  ix = new qt(De.comparator);
function Ye(...n) {
  let e = ix;
  for (const t of n) e = e.add(t);
  return e;
}
const sx = new qt(qe);
function ox() {
  return sx;
}
function xm(n, e) {
  if (n.useProto3Json) {
    if (isNaN(e)) return { doubleValue: "NaN" };
    if (e === 1 / 0) return { doubleValue: "Infinity" };
    if (e === -1 / 0) return { doubleValue: "-Infinity" };
  }
  return { doubleValue: yh(e) ? "-0" : e };
}
function xE(n) {
  return { integerValue: "" + n };
}
function ax(n, e) {
  return Nk(e) ? xE(e) : xm(n, e);
}
class ed {
  constructor() {
    this._ = void 0;
  }
}
function lx(n, e, t) {
  return n instanceof Th
    ? (function (o, a) {
        const u = {
          fields: {
            [fE]: { stringValue: dE },
            [mE]: {
              timestampValue: { seconds: o.seconds, nanos: o.nanoseconds },
            },
          },
        };
        return (
          a && Rm(a) && (a = Yh(a)),
          a && (u.fields[pE] = a),
          { mapValue: u }
        );
      })(t, e)
    : n instanceof su
      ? DE(n, e)
      : n instanceof ou
        ? NE(n, e)
        : (function (o, a) {
            const u = bE(o, a),
              d = K_(u) + K_(o.Ee);
            return Mp(u) && Mp(o.Ee) ? xE(d) : xm(o.serializer, d);
          })(n, e);
}
function ux(n, e, t) {
  return n instanceof su ? DE(n, e) : n instanceof ou ? NE(n, e) : t;
}
function bE(n, e) {
  return n instanceof Sh
    ? (function (i) {
        return (
          Mp(i) ||
          (function (a) {
            return !!a && "doubleValue" in a;
          })(i)
        );
      })(e)
      ? e
      : { integerValue: 0 }
    : null;
}
class Th extends ed {}
class su extends ed {
  constructor(e) {
    (super(), (this.elements = e));
  }
}
function DE(n, e) {
  const t = OE(e);
  for (const i of n.elements) t.some((o) => li(o, i)) || t.push(i);
  return { arrayValue: { values: t } };
}
class ou extends ed {
  constructor(e) {
    (super(), (this.elements = e));
  }
}
function NE(n, e) {
  let t = OE(e);
  for (const i of n.elements) t = t.filter((o) => !li(o, i));
  return { arrayValue: { values: t } };
}
class Sh extends ed {
  constructor(e, t) {
    (super(), (this.serializer = e), (this.Ee = t));
  }
}
function K_(n) {
  return Ot(n.integerValue || n.doubleValue);
}
function OE(n) {
  return Am(n) && n.arrayValue.values ? n.arrayValue.values.slice() : [];
}
function cx(n, e) {
  return (
    n.field.isEqual(e.field) &&
    (function (i, o) {
      return (i instanceof su && o instanceof su) ||
        (i instanceof ou && o instanceof ou)
        ? Oa(i.elements, o.elements, li)
        : i instanceof Sh && o instanceof Sh
          ? li(i.Ee, o.Ee)
          : i instanceof Th && o instanceof Th;
    })(n.transform, e.transform)
  );
}
class hx {
  constructor(e, t) {
    ((this.version = e), (this.transformResults = t));
  }
}
class Fi {
  constructor(e, t) {
    ((this.updateTime = e), (this.exists = t));
  }
  static none() {
    return new Fi();
  }
  static exists(e) {
    return new Fi(void 0, e);
  }
  static updateTime(e) {
    return new Fi(e);
  }
  get isNone() {
    return this.updateTime === void 0 && this.exists === void 0;
  }
  isEqual(e) {
    return (
      this.exists === e.exists &&
      (this.updateTime
        ? !!e.updateTime && this.updateTime.isEqual(e.updateTime)
        : !e.updateTime)
    );
  }
}
function Jc(n, e) {
  return n.updateTime !== void 0
    ? e.isFoundDocument() && e.version.isEqual(n.updateTime)
    : n.exists === void 0 || n.exists === e.isFoundDocument();
}
class td {}
function LE(n, e) {
  if (!n.hasLocalMutations || (e && e.fields.length === 0)) return null;
  if (e === null)
    return n.isNoDocument()
      ? new VE(n.key, Fi.none())
      : new yu(n.key, n.data, Fi.none());
  {
    const t = n.data,
      i = ur.empty();
    let o = new qt(an.comparator);
    for (let a of e.fields)
      if (!o.has(a)) {
        let u = t.field(a);
        (u === null && a.length > 1 && ((a = a.popLast()), (u = t.field(a))),
          u === null ? i.delete(a) : i.set(a, u),
          (o = o.add(a)));
      }
    return new Lo(n.key, i, new br(o.toArray()), Fi.none());
  }
}
function dx(n, e, t) {
  n instanceof yu
    ? (function (o, a, u) {
        const d = o.value.clone(),
          f = Q_(o.fieldTransforms, a, u.transformResults);
        (d.setAll(f),
          a.convertToFoundDocument(u.version, d).setHasCommittedMutations());
      })(n, e, t)
    : n instanceof Lo
      ? (function (o, a, u) {
          if (!Jc(o.precondition, a))
            return void a.convertToUnknownDocument(u.version);
          const d = Q_(o.fieldTransforms, a, u.transformResults),
            f = a.data;
          (f.setAll(ME(o)),
            f.setAll(d),
            a.convertToFoundDocument(u.version, f).setHasCommittedMutations());
        })(n, e, t)
      : (function (o, a, u) {
          a.convertToNoDocument(u.version).setHasCommittedMutations();
        })(0, e, t);
}
function Bl(n, e, t, i) {
  return n instanceof yu
    ? (function (a, u, d, f) {
        if (!Jc(a.precondition, u)) return d;
        const m = a.value.clone(),
          v = Y_(a.fieldTransforms, f, u);
        return (
          m.setAll(v),
          u.convertToFoundDocument(u.version, m).setHasLocalMutations(),
          null
        );
      })(n, e, t, i)
    : n instanceof Lo
      ? (function (a, u, d, f) {
          if (!Jc(a.precondition, u)) return d;
          const m = Y_(a.fieldTransforms, f, u),
            v = u.data;
          return (
            v.setAll(ME(a)),
            v.setAll(m),
            u.convertToFoundDocument(u.version, v).setHasLocalMutations(),
            d === null
              ? null
              : d
                  .unionWith(a.fieldMask.fields)
                  .unionWith(a.fieldTransforms.map((w) => w.field))
          );
        })(n, e, t, i)
      : (function (a, u, d) {
          return Jc(a.precondition, u)
            ? (u.convertToNoDocument(u.version).setHasLocalMutations(), null)
            : d;
        })(n, e, t);
}
function fx(n, e) {
  let t = null;
  for (const i of n.fieldTransforms) {
    const o = e.data.field(i.field),
      a = bE(i.transform, o || null);
    a != null && (t === null && (t = ur.empty()), t.set(i.field, a));
  }
  return t || null;
}
function G_(n, e) {
  return (
    n.type === e.type &&
    !!n.key.isEqual(e.key) &&
    !!n.precondition.isEqual(e.precondition) &&
    !!(function (i, o) {
      return (
        (i === void 0 && o === void 0) ||
        (!(!i || !o) && Oa(i, o, (a, u) => cx(a, u)))
      );
    })(n.fieldTransforms, e.fieldTransforms) &&
    (n.type === 0
      ? n.value.isEqual(e.value)
      : n.type !== 1 ||
        (n.data.isEqual(e.data) && n.fieldMask.isEqual(e.fieldMask)))
  );
}
class yu extends td {
  constructor(e, t, i, o = []) {
    (super(),
      (this.key = e),
      (this.value = t),
      (this.precondition = i),
      (this.fieldTransforms = o),
      (this.type = 0));
  }
  getFieldMask() {
    return null;
  }
}
class Lo extends td {
  constructor(e, t, i, o, a = []) {
    (super(),
      (this.key = e),
      (this.data = t),
      (this.fieldMask = i),
      (this.precondition = o),
      (this.fieldTransforms = a),
      (this.type = 1));
  }
  getFieldMask() {
    return this.fieldMask;
  }
}
function ME(n) {
  const e = new Map();
  return (
    n.fieldMask.fields.forEach((t) => {
      if (!t.isEmpty()) {
        const i = n.data.field(t);
        e.set(t, i);
      }
    }),
    e
  );
}
function Q_(n, e, t) {
  const i = new Map();
  at(n.length === t.length, 32656, { Ae: t.length, Re: n.length });
  for (let o = 0; o < t.length; o++) {
    const a = n[o],
      u = a.transform,
      d = e.data.field(a.field);
    i.set(a.field, ux(u, d, t[o]));
  }
  return i;
}
function Y_(n, e, t) {
  const i = new Map();
  for (const o of n) {
    const a = o.transform,
      u = t.data.field(o.field);
    i.set(o.field, lx(a, u, e));
  }
  return i;
}
class VE extends td {
  constructor(e, t) {
    (super(),
      (this.key = e),
      (this.precondition = t),
      (this.type = 2),
      (this.fieldTransforms = []));
  }
  getFieldMask() {
    return null;
  }
}
class px extends td {
  constructor(e, t) {
    (super(),
      (this.key = e),
      (this.precondition = t),
      (this.type = 3),
      (this.fieldTransforms = []));
  }
  getFieldMask() {
    return null;
  }
}
class mx {
  constructor(e, t, i, o) {
    ((this.batchId = e),
      (this.localWriteTime = t),
      (this.baseMutations = i),
      (this.mutations = o));
  }
  applyToRemoteDocument(e, t) {
    const i = t.mutationResults;
    for (let o = 0; o < this.mutations.length; o++) {
      const a = this.mutations[o];
      a.key.isEqual(e.key) && dx(a, e, i[o]);
    }
  }
  applyToLocalView(e, t) {
    for (const i of this.baseMutations)
      i.key.isEqual(e.key) && (t = Bl(i, e, t, this.localWriteTime));
    for (const i of this.mutations)
      i.key.isEqual(e.key) && (t = Bl(i, e, t, this.localWriteTime));
    return t;
  }
  applyToLocalDocumentSet(e, t) {
    const i = kE();
    return (
      this.mutations.forEach((o) => {
        const a = e.get(o.key),
          u = a.overlayedDocument;
        let d = this.applyToLocalView(u, a.mutatedFields);
        d = t.has(o.key) ? null : d;
        const f = LE(u, d);
        (f !== null && i.set(o.key, f),
          u.isValidDocument() || u.convertToNoDocument(ze.min()));
      }),
      i
    );
  }
  keys() {
    return this.mutations.reduce((e, t) => e.add(t.key), Ye());
  }
  isEqual(e) {
    return (
      this.batchId === e.batchId &&
      Oa(this.mutations, e.mutations, (t, i) => G_(t, i)) &&
      Oa(this.baseMutations, e.baseMutations, (t, i) => G_(t, i))
    );
  }
}
class bm {
  constructor(e, t, i, o) {
    ((this.batch = e),
      (this.commitVersion = t),
      (this.mutationResults = i),
      (this.docVersions = o));
  }
  static from(e, t, i) {
    at(e.mutations.length === i.length, 58842, {
      Ve: e.mutations.length,
      me: i.length,
    });
    let o = (function () {
      return rx;
    })();
    const a = e.mutations;
    for (let u = 0; u < a.length; u++) o = o.insert(a[u].key, i[u].version);
    return new bm(e, t, i, o);
  }
}
class gx {
  constructor(e, t) {
    ((this.largestBatchId = e), (this.mutation = t));
  }
  getKey() {
    return this.mutation.key;
  }
  isEqual(e) {
    return e !== null && this.mutation === e.mutation;
  }
  toString() {
    return `Overlay{
      largestBatchId: ${this.largestBatchId},
      mutation: ${this.mutation.toString()}
    }`;
  }
}
class yx {
  constructor(e, t) {
    ((this.count = e), (this.unchangedNames = t));
  }
}
var Ut, et;
function vx(n) {
  switch (n) {
    case ie.OK:
      return Le(64938);
    case ie.CANCELLED:
    case ie.UNKNOWN:
    case ie.DEADLINE_EXCEEDED:
    case ie.RESOURCE_EXHAUSTED:
    case ie.INTERNAL:
    case ie.UNAVAILABLE:
    case ie.UNAUTHENTICATED:
      return !1;
    case ie.INVALID_ARGUMENT:
    case ie.NOT_FOUND:
    case ie.ALREADY_EXISTS:
    case ie.PERMISSION_DENIED:
    case ie.FAILED_PRECONDITION:
    case ie.ABORTED:
    case ie.OUT_OF_RANGE:
    case ie.UNIMPLEMENTED:
    case ie.DATA_LOSS:
      return !0;
    default:
      return Le(15467, { code: n });
  }
}
function FE(n) {
  if (n === void 0) return (ji("GRPC error has no .code"), ie.UNKNOWN);
  switch (n) {
    case Ut.OK:
      return ie.OK;
    case Ut.CANCELLED:
      return ie.CANCELLED;
    case Ut.UNKNOWN:
      return ie.UNKNOWN;
    case Ut.DEADLINE_EXCEEDED:
      return ie.DEADLINE_EXCEEDED;
    case Ut.RESOURCE_EXHAUSTED:
      return ie.RESOURCE_EXHAUSTED;
    case Ut.INTERNAL:
      return ie.INTERNAL;
    case Ut.UNAVAILABLE:
      return ie.UNAVAILABLE;
    case Ut.UNAUTHENTICATED:
      return ie.UNAUTHENTICATED;
    case Ut.INVALID_ARGUMENT:
      return ie.INVALID_ARGUMENT;
    case Ut.NOT_FOUND:
      return ie.NOT_FOUND;
    case Ut.ALREADY_EXISTS:
      return ie.ALREADY_EXISTS;
    case Ut.PERMISSION_DENIED:
      return ie.PERMISSION_DENIED;
    case Ut.FAILED_PRECONDITION:
      return ie.FAILED_PRECONDITION;
    case Ut.ABORTED:
      return ie.ABORTED;
    case Ut.OUT_OF_RANGE:
      return ie.OUT_OF_RANGE;
    case Ut.UNIMPLEMENTED:
      return ie.UNIMPLEMENTED;
    case Ut.DATA_LOSS:
      return ie.DATA_LOSS;
    default:
      return Le(39323, { code: n });
  }
}
(((et = Ut || (Ut = {}))[(et.OK = 0)] = "OK"),
  (et[(et.CANCELLED = 1)] = "CANCELLED"),
  (et[(et.UNKNOWN = 2)] = "UNKNOWN"),
  (et[(et.INVALID_ARGUMENT = 3)] = "INVALID_ARGUMENT"),
  (et[(et.DEADLINE_EXCEEDED = 4)] = "DEADLINE_EXCEEDED"),
  (et[(et.NOT_FOUND = 5)] = "NOT_FOUND"),
  (et[(et.ALREADY_EXISTS = 6)] = "ALREADY_EXISTS"),
  (et[(et.PERMISSION_DENIED = 7)] = "PERMISSION_DENIED"),
  (et[(et.UNAUTHENTICATED = 16)] = "UNAUTHENTICATED"),
  (et[(et.RESOURCE_EXHAUSTED = 8)] = "RESOURCE_EXHAUSTED"),
  (et[(et.FAILED_PRECONDITION = 9)] = "FAILED_PRECONDITION"),
  (et[(et.ABORTED = 10)] = "ABORTED"),
  (et[(et.OUT_OF_RANGE = 11)] = "OUT_OF_RANGE"),
  (et[(et.UNIMPLEMENTED = 12)] = "UNIMPLEMENTED"),
  (et[(et.INTERNAL = 13)] = "INTERNAL"),
  (et[(et.UNAVAILABLE = 14)] = "UNAVAILABLE"),
  (et[(et.DATA_LOSS = 15)] = "DATA_LOSS"));
const _x = new Vs([4294967295, 4294967295], 0);
function X_(n) {
  const e = aE().encode(n),
    t = new Zw();
  return (t.update(e), new Uint8Array(t.digest()));
}
function J_(n) {
  const e = new DataView(n.buffer),
    t = e.getUint32(0, !0),
    i = e.getUint32(4, !0),
    o = e.getUint32(8, !0),
    a = e.getUint32(12, !0);
  return [new Vs([t, i], 0), new Vs([o, a], 0)];
}
class Dm {
  constructor(e, t, i) {
    if (
      ((this.bitmap = e),
      (this.padding = t),
      (this.hashCount = i),
      t < 0 || t >= 8)
    )
      throw new Ll(`Invalid padding: ${t}`);
    if (i < 0) throw new Ll(`Invalid hash count: ${i}`);
    if (e.length > 0 && this.hashCount === 0)
      throw new Ll(`Invalid hash count: ${i}`);
    if (e.length === 0 && t !== 0)
      throw new Ll(`Invalid padding when bitmap length is 0: ${t}`);
    ((this.fe = 8 * e.length - t), (this.ge = Vs.fromNumber(this.fe)));
  }
  pe(e, t, i) {
    let o = e.add(t.multiply(Vs.fromNumber(i)));
    return (
      o.compare(_x) === 1 && (o = new Vs([o.getBits(0), o.getBits(1)], 0)),
      o.modulo(this.ge).toNumber()
    );
  }
  ye(e) {
    return !!(this.bitmap[Math.floor(e / 8)] & (1 << e % 8));
  }
  mightContain(e) {
    if (this.fe === 0) return !1;
    const t = X_(e),
      [i, o] = J_(t);
    for (let a = 0; a < this.hashCount; a++) {
      const u = this.pe(i, o, a);
      if (!this.ye(u)) return !1;
    }
    return !0;
  }
  static create(e, t, i) {
    const o = e % 8 == 0 ? 0 : 8 - (e % 8),
      a = new Uint8Array(Math.ceil(e / 8)),
      u = new Dm(a, o, t);
    return (i.forEach((d) => u.insert(d)), u);
  }
  insert(e) {
    if (this.fe === 0) return;
    const t = X_(e),
      [i, o] = J_(t);
    for (let a = 0; a < this.hashCount; a++) {
      const u = this.pe(i, o, a);
      this.we(u);
    }
  }
  we(e) {
    const t = Math.floor(e / 8),
      i = e % 8;
    this.bitmap[t] |= 1 << i;
  }
}
class Ll extends Error {
  constructor() {
    (super(...arguments), (this.name = "BloomFilterError"));
  }
}
class nd {
  constructor(e, t, i, o, a) {
    ((this.snapshotVersion = e),
      (this.targetChanges = t),
      (this.targetMismatches = i),
      (this.documentUpdates = o),
      (this.resolvedLimboDocuments = a));
  }
  static createSynthesizedRemoteEventForCurrentChange(e, t, i) {
    const o = new Map();
    return (
      o.set(e, vu.createSynthesizedTargetChangeForCurrentChange(e, t, i)),
      new nd(ze.min(), o, new xt(qe), Bi(), Ye())
    );
  }
}
class vu {
  constructor(e, t, i, o, a) {
    ((this.resumeToken = e),
      (this.current = t),
      (this.addedDocuments = i),
      (this.modifiedDocuments = o),
      (this.removedDocuments = a));
  }
  static createSynthesizedTargetChangeForCurrentChange(e, t, i) {
    return new vu(i, t, Ye(), Ye(), Ye());
  }
}
class Zc {
  constructor(e, t, i, o) {
    ((this.Se = e), (this.removedTargetIds = t), (this.key = i), (this.be = o));
  }
}
class UE {
  constructor(e, t) {
    ((this.targetId = e), (this.De = t));
  }
}
class zE {
  constructor(e, t, i = ln.EMPTY_BYTE_STRING, o = null) {
    ((this.state = e),
      (this.targetIds = t),
      (this.resumeToken = i),
      (this.cause = o));
  }
}
class Z_ {
  constructor() {
    ((this.ve = 0),
      (this.Ce = e0()),
      (this.Fe = ln.EMPTY_BYTE_STRING),
      (this.Me = !1),
      (this.xe = !0));
  }
  get current() {
    return this.Me;
  }
  get resumeToken() {
    return this.Fe;
  }
  get Oe() {
    return this.ve !== 0;
  }
  get Ne() {
    return this.xe;
  }
  Be(e) {
    e.approximateByteSize() > 0 && ((this.xe = !0), (this.Fe = e));
  }
  Le() {
    let e = Ye(),
      t = Ye(),
      i = Ye();
    return (
      this.Ce.forEach((o, a) => {
        switch (a) {
          case 0:
            e = e.add(o);
            break;
          case 2:
            t = t.add(o);
            break;
          case 1:
            i = i.add(o);
            break;
          default:
            Le(38017, { changeType: a });
        }
      }),
      new vu(this.Fe, this.Me, e, t, i)
    );
  }
  ke() {
    ((this.xe = !1), (this.Ce = e0()));
  }
  qe(e, t) {
    ((this.xe = !0), (this.Ce = this.Ce.insert(e, t)));
  }
  Qe(e) {
    ((this.xe = !0), (this.Ce = this.Ce.remove(e)));
  }
  $e() {
    this.ve += 1;
  }
  Ue() {
    ((this.ve -= 1), at(this.ve >= 0, 3241, { ve: this.ve }));
  }
  Ke() {
    ((this.xe = !0), (this.Me = !0));
  }
}
class wx {
  constructor(e) {
    ((this.We = e),
      (this.Ge = new Map()),
      (this.ze = Bi()),
      (this.je = zc()),
      (this.Je = zc()),
      (this.He = new xt(qe)));
  }
  Ye(e) {
    for (const t of e.Se)
      e.be && e.be.isFoundDocument()
        ? this.Ze(t, e.be)
        : this.Xe(t, e.key, e.be);
    for (const t of e.removedTargetIds) this.Xe(t, e.key, e.be);
  }
  et(e) {
    this.forEachTarget(e, (t) => {
      const i = this.tt(t);
      switch (e.state) {
        case 0:
          this.nt(t) && i.Be(e.resumeToken);
          break;
        case 1:
          (i.Ue(), i.Oe || i.ke(), i.Be(e.resumeToken));
          break;
        case 2:
          (i.Ue(), i.Oe || this.removeTarget(t));
          break;
        case 3:
          this.nt(t) && (i.Ke(), i.Be(e.resumeToken));
          break;
        case 4:
          this.nt(t) && (this.rt(t), i.Be(e.resumeToken));
          break;
        default:
          Le(56790, { state: e.state });
      }
    });
  }
  forEachTarget(e, t) {
    e.targetIds.length > 0
      ? e.targetIds.forEach(t)
      : this.Ge.forEach((i, o) => {
          this.nt(o) && t(o);
        });
  }
  it(e) {
    const t = e.targetId,
      i = e.De.count,
      o = this.st(t);
    if (o) {
      const a = o.target;
      if (Fp(a))
        if (i === 0) {
          const u = new De(a.path);
          this.Xe(t, u, gn.newNoDocument(u, ze.min()));
        } else at(i === 1, 20013, { expectedCount: i });
      else {
        const u = this.ot(t);
        if (u !== i) {
          const d = this._t(e),
            f = d ? this.ut(d, e, u) : 1;
          if (f !== 0) {
            this.rt(t);
            const m =
              f === 2
                ? "TargetPurposeExistenceFilterMismatchBloom"
                : "TargetPurposeExistenceFilterMismatch";
            this.He = this.He.insert(t, m);
          }
        }
      }
    }
  }
  _t(e) {
    const t = e.De.unchangedNames;
    if (!t || !t.bits) return null;
    const {
      bits: { bitmap: i = "", padding: o = 0 },
      hashCount: a = 0,
    } = t;
    let u, d;
    try {
      u = $s(i).toUint8Array();
    } catch (f) {
      if (f instanceof hE)
        return (
          zs(
            "Decoding the base64 bloom filter in existence filter failed (" +
              f.message +
              "); ignoring the bloom filter and falling back to full re-query.",
          ),
          null
        );
      throw f;
    }
    try {
      d = new Dm(u, o, a);
    } catch (f) {
      return (
        zs(
          f instanceof Ll
            ? "BloomFilter error: "
            : "Applying bloom filter failed: ",
          f,
        ),
        null
      );
    }
    return d.fe === 0 ? null : d;
  }
  ut(e, t, i) {
    return t.De.count === i - this.ht(e, t.targetId) ? 0 : 2;
  }
  ht(e, t) {
    const i = this.We.getRemoteKeysForTarget(t);
    let o = 0;
    return (
      i.forEach((a) => {
        const u = this.We.lt(),
          d = `projects/${u.projectId}/databases/${u.database}/documents/${a.path.canonicalString()}`;
        e.mightContain(d) || (this.Xe(t, a, null), o++);
      }),
      o
    );
  }
  Pt(e) {
    const t = new Map();
    this.Ge.forEach((a, u) => {
      const d = this.st(u);
      if (d) {
        if (a.current && Fp(d.target)) {
          const f = new De(d.target.path);
          this.Tt(f).has(u) ||
            this.It(u, f) ||
            this.Xe(u, f, gn.newNoDocument(f, e));
        }
        a.Ne && (t.set(u, a.Le()), a.ke());
      }
    });
    let i = Ye();
    (this.Je.forEach((a, u) => {
      let d = !0;
      (u.forEachWhile((f) => {
        const m = this.st(f);
        return (
          !m || m.purpose === "TargetPurposeLimboResolution" || ((d = !1), !1)
        );
      }),
        d && (i = i.add(a)));
    }),
      this.ze.forEach((a, u) => u.setReadTime(e)));
    const o = new nd(e, t, this.He, this.ze, i);
    return (
      (this.ze = Bi()),
      (this.je = zc()),
      (this.Je = zc()),
      (this.He = new xt(qe)),
      o
    );
  }
  Ze(e, t) {
    if (!this.nt(e)) return;
    const i = this.It(e, t.key) ? 2 : 0;
    (this.tt(e).qe(t.key, i),
      (this.ze = this.ze.insert(t.key, t)),
      (this.je = this.je.insert(t.key, this.Tt(t.key).add(e))),
      (this.Je = this.Je.insert(t.key, this.dt(t.key).add(e))));
  }
  Xe(e, t, i) {
    if (!this.nt(e)) return;
    const o = this.tt(e);
    (this.It(e, t) ? o.qe(t, 1) : o.Qe(t),
      (this.Je = this.Je.insert(t, this.dt(t).delete(e))),
      (this.Je = this.Je.insert(t, this.dt(t).add(e))),
      i && (this.ze = this.ze.insert(t, i)));
  }
  removeTarget(e) {
    this.Ge.delete(e);
  }
  ot(e) {
    const t = this.tt(e).Le();
    return (
      this.We.getRemoteKeysForTarget(e).size +
      t.addedDocuments.size -
      t.removedDocuments.size
    );
  }
  $e(e) {
    this.tt(e).$e();
  }
  tt(e) {
    let t = this.Ge.get(e);
    return (t || ((t = new Z_()), this.Ge.set(e, t)), t);
  }
  dt(e) {
    let t = this.Je.get(e);
    return (t || ((t = new qt(qe)), (this.Je = this.Je.insert(e, t))), t);
  }
  Tt(e) {
    let t = this.je.get(e);
    return (t || ((t = new qt(qe)), (this.je = this.je.insert(e, t))), t);
  }
  nt(e) {
    const t = this.st(e) !== null;
    return (t || pe("WatchChangeAggregator", "Detected inactive target", e), t);
  }
  st(e) {
    const t = this.Ge.get(e);
    return t && t.Oe ? null : this.We.Et(e);
  }
  rt(e) {
    (this.Ge.set(e, new Z_()),
      this.We.getRemoteKeysForTarget(e).forEach((t) => {
        this.Xe(e, t, null);
      }));
  }
  It(e, t) {
    return this.We.getRemoteKeysForTarget(e).has(t);
  }
}
function zc() {
  return new xt(De.comparator);
}
function e0() {
  return new xt(De.comparator);
}
const Ex = { asc: "ASCENDING", desc: "DESCENDING" },
  Tx = {
    "<": "LESS_THAN",
    "<=": "LESS_THAN_OR_EQUAL",
    ">": "GREATER_THAN",
    ">=": "GREATER_THAN_OR_EQUAL",
    "==": "EQUAL",
    "!=": "NOT_EQUAL",
    "array-contains": "ARRAY_CONTAINS",
    in: "IN",
    "not-in": "NOT_IN",
    "array-contains-any": "ARRAY_CONTAINS_ANY",
  },
  Sx = { and: "AND", or: "OR" };
class Ix {
  constructor(e, t) {
    ((this.databaseId = e), (this.useProto3Json = t));
  }
}
function zp(n, e) {
  return n.useProto3Json || Qh(e) ? e : { value: e };
}
function Ih(n, e) {
  return n.useProto3Json
    ? `${new Date(1e3 * e.seconds).toISOString().replace(/\.\d*/, "").replace("Z", "")}.${("000000000" + e.nanoseconds).slice(-9)}Z`
    : { seconds: "" + e.seconds, nanos: e.nanoseconds };
}
function jE(n, e) {
  return n.useProto3Json ? e.toBase64() : e.toUint8Array();
}
function Rx(n, e) {
  return Ih(n, e.toTimestamp());
}
function ei(n) {
  return (
    at(!!n, 49232),
    ze.fromTimestamp(
      (function (t) {
        const i = Bs(t);
        return new Et(i.seconds, i.nanos);
      })(n),
    )
  );
}
function Nm(n, e) {
  return jp(n, e).canonicalString();
}
function jp(n, e) {
  const t = (function (o) {
    return new kt(["projects", o.projectId, "databases", o.database]);
  })(n).child("documents");
  return e === void 0 ? t : t.child(e);
}
function BE(n) {
  const e = kt.fromString(n);
  return (at(KE(e), 10190, { key: e.toString() }), e);
}
function Bp(n, e) {
  return Nm(n.databaseId, e.path);
}
function sp(n, e) {
  const t = BE(e);
  if (t.get(1) !== n.databaseId.projectId)
    throw new ke(
      ie.INVALID_ARGUMENT,
      "Tried to deserialize key from different project: " +
        t.get(1) +
        " vs " +
        n.databaseId.projectId,
    );
  if (t.get(3) !== n.databaseId.database)
    throw new ke(
      ie.INVALID_ARGUMENT,
      "Tried to deserialize key from different database: " +
        t.get(3) +
        " vs " +
        n.databaseId.database,
    );
  return new De(HE(t));
}
function $E(n, e) {
  return Nm(n.databaseId, e);
}
function Ax(n) {
  const e = BE(n);
  return e.length === 4 ? kt.emptyPath() : HE(e);
}
function $p(n) {
  return new kt([
    "projects",
    n.databaseId.projectId,
    "databases",
    n.databaseId.database,
  ]).canonicalString();
}
function HE(n) {
  return (
    at(n.length > 4 && n.get(4) === "documents", 29091, { key: n.toString() }),
    n.popFirst(5)
  );
}
function t0(n, e, t) {
  return { name: Bp(n, e), fields: t.value.mapValue.fields };
}
function Cx(n, e) {
  let t;
  if ("targetChange" in e) {
    e.targetChange;
    const i = (function (m) {
        return m === "NO_CHANGE"
          ? 0
          : m === "ADD"
            ? 1
            : m === "REMOVE"
              ? 2
              : m === "CURRENT"
                ? 3
                : m === "RESET"
                  ? 4
                  : Le(39313, { state: m });
      })(e.targetChange.targetChangeType || "NO_CHANGE"),
      o = e.targetChange.targetIds || [],
      a = (function (m, v) {
        return m.useProto3Json
          ? (at(v === void 0 || typeof v == "string", 58123),
            ln.fromBase64String(v || ""))
          : (at(
              v === void 0 || v instanceof Buffer || v instanceof Uint8Array,
              16193,
            ),
            ln.fromUint8Array(v || new Uint8Array()));
      })(n, e.targetChange.resumeToken),
      u = e.targetChange.cause,
      d =
        u &&
        (function (m) {
          const v = m.code === void 0 ? ie.UNKNOWN : FE(m.code);
          return new ke(v, m.message || "");
        })(u);
    t = new zE(i, o, a, d || null);
  } else if ("documentChange" in e) {
    e.documentChange;
    const i = e.documentChange;
    (i.document, i.document.name, i.document.updateTime);
    const o = sp(n, i.document.name),
      a = ei(i.document.updateTime),
      u = i.document.createTime ? ei(i.document.createTime) : ze.min(),
      d = new ur({ mapValue: { fields: i.document.fields } }),
      f = gn.newFoundDocument(o, a, u, d),
      m = i.targetIds || [],
      v = i.removedTargetIds || [];
    t = new Zc(m, v, f.key, f);
  } else if ("documentDelete" in e) {
    e.documentDelete;
    const i = e.documentDelete;
    i.document;
    const o = sp(n, i.document),
      a = i.readTime ? ei(i.readTime) : ze.min(),
      u = gn.newNoDocument(o, a),
      d = i.removedTargetIds || [];
    t = new Zc([], d, u.key, u);
  } else if ("documentRemove" in e) {
    e.documentRemove;
    const i = e.documentRemove;
    i.document;
    const o = sp(n, i.document),
      a = i.removedTargetIds || [];
    t = new Zc([], a, o, null);
  } else {
    if (!("filter" in e)) return Le(11601, { At: e });
    {
      e.filter;
      const i = e.filter;
      i.targetId;
      const { count: o = 0, unchangedNames: a } = i,
        u = new yx(o, a),
        d = i.targetId;
      t = new UE(d, u);
    }
  }
  return t;
}
function Px(n, e) {
  let t;
  if (e instanceof yu) t = { update: t0(n, e.key, e.value) };
  else if (e instanceof VE) t = { delete: Bp(n, e.key) };
  else if (e instanceof Lo)
    t = { update: t0(n, e.key, e.data), updateMask: Vx(e.fieldMask) };
  else {
    if (!(e instanceof px)) return Le(16599, { Rt: e.type });
    t = { verify: Bp(n, e.key) };
  }
  return (
    e.fieldTransforms.length > 0 &&
      (t.updateTransforms = e.fieldTransforms.map((i) =>
        (function (a, u) {
          const d = u.transform;
          if (d instanceof Th)
            return {
              fieldPath: u.field.canonicalString(),
              setToServerValue: "REQUEST_TIME",
            };
          if (d instanceof su)
            return {
              fieldPath: u.field.canonicalString(),
              appendMissingElements: { values: d.elements },
            };
          if (d instanceof ou)
            return {
              fieldPath: u.field.canonicalString(),
              removeAllFromArray: { values: d.elements },
            };
          if (d instanceof Sh)
            return { fieldPath: u.field.canonicalString(), increment: d.Ee };
          throw Le(20930, { transform: u.transform });
        })(0, i),
      )),
    e.precondition.isNone ||
      (t.currentDocument = (function (o, a) {
        return a.updateTime !== void 0
          ? { updateTime: Rx(o, a.updateTime) }
          : a.exists !== void 0
            ? { exists: a.exists }
            : Le(27497);
      })(n, e.precondition)),
    t
  );
}
function kx(n, e) {
  return n && n.length > 0
    ? (at(e !== void 0, 14353),
      n.map((t) =>
        (function (o, a) {
          let u = o.updateTime ? ei(o.updateTime) : ei(a);
          return (
            u.isEqual(ze.min()) && (u = ei(a)),
            new hx(u, o.transformResults || [])
          );
        })(t, e),
      ))
    : [];
}
function xx(n, e) {
  return { documents: [$E(n, e.path)] };
}
function bx(n, e) {
  const t = { structuredQuery: {} },
    i = e.path;
  let o;
  (e.collectionGroup !== null
    ? ((o = i),
      (t.structuredQuery.from = [
        { collectionId: e.collectionGroup, allDescendants: !0 },
      ]))
    : ((o = i.popLast()),
      (t.structuredQuery.from = [{ collectionId: i.lastSegment() }])),
    (t.parent = $E(n, o)));
  const a = (function (m) {
    if (m.length !== 0) return qE(ui.create(m, "and"));
  })(e.filters);
  a && (t.structuredQuery.where = a);
  const u = (function (m) {
    if (m.length !== 0)
      return m.map((v) =>
        (function (T) {
          return { field: Ta(T.field), direction: Ox(T.dir) };
        })(v),
      );
  })(e.orderBy);
  u && (t.structuredQuery.orderBy = u);
  const d = zp(n, e.limit);
  return (
    d !== null && (t.structuredQuery.limit = d),
    e.startAt &&
      (t.structuredQuery.startAt = (function (m) {
        return { before: m.inclusive, values: m.position };
      })(e.startAt)),
    e.endAt &&
      (t.structuredQuery.endAt = (function (m) {
        return { before: !m.inclusive, values: m.position };
      })(e.endAt)),
    { Vt: t, parent: o }
  );
}
function Dx(n) {
  let e = Ax(n.parent);
  const t = n.structuredQuery,
    i = t.from ? t.from.length : 0;
  let o = null;
  if (i > 0) {
    at(i === 1, 65062);
    const v = t.from[0];
    v.allDescendants ? (o = v.collectionId) : (e = e.child(v.collectionId));
  }
  let a = [];
  t.where &&
    (a = (function (w) {
      const T = WE(w);
      return T instanceof ui && EE(T) ? T.getFilters() : [T];
    })(t.where));
  let u = [];
  t.orderBy &&
    (u = (function (w) {
      return w.map((T) =>
        (function (D) {
          return new Eh(
            Sa(D.field),
            (function (O) {
              switch (O) {
                case "ASCENDING":
                  return "asc";
                case "DESCENDING":
                  return "desc";
                default:
                  return;
              }
            })(D.direction),
          );
        })(T),
      );
    })(t.orderBy));
  let d = null;
  t.limit &&
    (d = (function (w) {
      let T;
      return ((T = typeof w == "object" ? w.value : w), Qh(T) ? null : T);
    })(t.limit));
  let f = null;
  t.startAt &&
    (f = (function (w) {
      const T = !!w.before,
        A = w.values || [];
      return new wh(A, T);
    })(t.startAt));
  let m = null;
  return (
    t.endAt &&
      (m = (function (w) {
        const T = !w.before,
          A = w.values || [];
        return new wh(A, T);
      })(t.endAt)),
    Xk(e, o, u, a, d, "F", f, m)
  );
}
function Nx(n, e) {
  const t = (function (o) {
    switch (o) {
      case "TargetPurposeListen":
        return null;
      case "TargetPurposeExistenceFilterMismatch":
        return "existence-filter-mismatch";
      case "TargetPurposeExistenceFilterMismatchBloom":
        return "existence-filter-mismatch-bloom";
      case "TargetPurposeLimboResolution":
        return "limbo-document";
      default:
        return Le(28987, { purpose: o });
    }
  })(e.purpose);
  return t == null ? null : { "goog-listen-tags": t };
}
function WE(n) {
  return n.unaryFilter !== void 0
    ? (function (t) {
        switch (t.unaryFilter.op) {
          case "IS_NAN":
            const i = Sa(t.unaryFilter.field);
            return Wt.create(i, "==", { doubleValue: NaN });
          case "IS_NULL":
            const o = Sa(t.unaryFilter.field);
            return Wt.create(o, "==", { nullValue: "NULL_VALUE" });
          case "IS_NOT_NAN":
            const a = Sa(t.unaryFilter.field);
            return Wt.create(a, "!=", { doubleValue: NaN });
          case "IS_NOT_NULL":
            const u = Sa(t.unaryFilter.field);
            return Wt.create(u, "!=", { nullValue: "NULL_VALUE" });
          case "OPERATOR_UNSPECIFIED":
            return Le(61313);
          default:
            return Le(60726);
        }
      })(n)
    : n.fieldFilter !== void 0
      ? (function (t) {
          return Wt.create(
            Sa(t.fieldFilter.field),
            (function (o) {
              switch (o) {
                case "EQUAL":
                  return "==";
                case "NOT_EQUAL":
                  return "!=";
                case "GREATER_THAN":
                  return ">";
                case "GREATER_THAN_OR_EQUAL":
                  return ">=";
                case "LESS_THAN":
                  return "<";
                case "LESS_THAN_OR_EQUAL":
                  return "<=";
                case "ARRAY_CONTAINS":
                  return "array-contains";
                case "IN":
                  return "in";
                case "NOT_IN":
                  return "not-in";
                case "ARRAY_CONTAINS_ANY":
                  return "array-contains-any";
                case "OPERATOR_UNSPECIFIED":
                  return Le(58110);
                default:
                  return Le(50506);
              }
            })(t.fieldFilter.op),
            t.fieldFilter.value,
          );
        })(n)
      : n.compositeFilter !== void 0
        ? (function (t) {
            return ui.create(
              t.compositeFilter.filters.map((i) => WE(i)),
              (function (o) {
                switch (o) {
                  case "AND":
                    return "and";
                  case "OR":
                    return "or";
                  default:
                    return Le(1026);
                }
              })(t.compositeFilter.op),
            );
          })(n)
        : Le(30097, { filter: n });
}
function Ox(n) {
  return Ex[n];
}
function Lx(n) {
  return Tx[n];
}
function Mx(n) {
  return Sx[n];
}
function Ta(n) {
  return { fieldPath: n.canonicalString() };
}
function Sa(n) {
  return an.fromServerFormat(n.fieldPath);
}
function qE(n) {
  return n instanceof Wt
    ? (function (t) {
        if (t.op === "==") {
          if (B_(t.value))
            return { unaryFilter: { field: Ta(t.field), op: "IS_NAN" } };
          if (j_(t.value))
            return { unaryFilter: { field: Ta(t.field), op: "IS_NULL" } };
        } else if (t.op === "!=") {
          if (B_(t.value))
            return { unaryFilter: { field: Ta(t.field), op: "IS_NOT_NAN" } };
          if (j_(t.value))
            return { unaryFilter: { field: Ta(t.field), op: "IS_NOT_NULL" } };
        }
        return {
          fieldFilter: { field: Ta(t.field), op: Lx(t.op), value: t.value },
        };
      })(n)
    : n instanceof ui
      ? (function (t) {
          const i = t.getFilters().map((o) => qE(o));
          return i.length === 1
            ? i[0]
            : { compositeFilter: { op: Mx(t.op), filters: i } };
        })(n)
      : Le(54877, { filter: n });
}
function Vx(n) {
  const e = [];
  return (
    n.fields.forEach((t) => e.push(t.canonicalString())),
    { fieldPaths: e }
  );
}
function KE(n) {
  return n.length >= 4 && n.get(0) === "projects" && n.get(2) === "databases";
}
class Ns {
  constructor(
    e,
    t,
    i,
    o,
    a = ze.min(),
    u = ze.min(),
    d = ln.EMPTY_BYTE_STRING,
    f = null,
  ) {
    ((this.target = e),
      (this.targetId = t),
      (this.purpose = i),
      (this.sequenceNumber = o),
      (this.snapshotVersion = a),
      (this.lastLimboFreeSnapshotVersion = u),
      (this.resumeToken = d),
      (this.expectedCount = f));
  }
  withSequenceNumber(e) {
    return new Ns(
      this.target,
      this.targetId,
      this.purpose,
      e,
      this.snapshotVersion,
      this.lastLimboFreeSnapshotVersion,
      this.resumeToken,
      this.expectedCount,
    );
  }
  withResumeToken(e, t) {
    return new Ns(
      this.target,
      this.targetId,
      this.purpose,
      this.sequenceNumber,
      t,
      this.lastLimboFreeSnapshotVersion,
      e,
      null,
    );
  }
  withExpectedCount(e) {
    return new Ns(
      this.target,
      this.targetId,
      this.purpose,
      this.sequenceNumber,
      this.snapshotVersion,
      this.lastLimboFreeSnapshotVersion,
      this.resumeToken,
      e,
    );
  }
  withLastLimboFreeSnapshotVersion(e) {
    return new Ns(
      this.target,
      this.targetId,
      this.purpose,
      this.sequenceNumber,
      this.snapshotVersion,
      e,
      this.resumeToken,
      this.expectedCount,
    );
  }
}
class Fx {
  constructor(e) {
    this.gt = e;
  }
}
function Ux(n) {
  const e = Dx({ parent: n.parent, structuredQuery: n.structuredQuery });
  return n.limitType === "LAST" ? Up(e, e.limit, "L") : e;
}
class zx {
  constructor() {
    this.Dn = new jx();
  }
  addToCollectionParentIndex(e, t) {
    return (this.Dn.add(t), Z.resolve());
  }
  getCollectionParents(e, t) {
    return Z.resolve(this.Dn.getEntries(t));
  }
  addFieldIndex(e, t) {
    return Z.resolve();
  }
  deleteFieldIndex(e, t) {
    return Z.resolve();
  }
  deleteAllFieldIndexes(e) {
    return Z.resolve();
  }
  createTargetIndexes(e, t) {
    return Z.resolve();
  }
  getDocumentsMatchingTarget(e, t) {
    return Z.resolve(null);
  }
  getIndexType(e, t) {
    return Z.resolve(0);
  }
  getFieldIndexes(e, t) {
    return Z.resolve([]);
  }
  getNextCollectionGroupToUpdate(e) {
    return Z.resolve(null);
  }
  getMinOffset(e, t) {
    return Z.resolve(js.min());
  }
  getMinOffsetFromCollectionGroup(e, t) {
    return Z.resolve(js.min());
  }
  updateCollectionGroup(e, t, i) {
    return Z.resolve();
  }
  updateIndexEntries(e, t) {
    return Z.resolve();
  }
}
class jx {
  constructor() {
    this.index = {};
  }
  add(e) {
    const t = e.lastSegment(),
      i = e.popLast(),
      o = this.index[t] || new qt(kt.comparator),
      a = !o.has(i);
    return ((this.index[t] = o.add(i)), a);
  }
  has(e) {
    const t = e.lastSegment(),
      i = e.popLast(),
      o = this.index[t];
    return o && o.has(i);
  }
  getEntries(e) {
    return (this.index[e] || new qt(kt.comparator)).toArray();
  }
}
const n0 = {
    didRun: !1,
    sequenceNumbersCollected: 0,
    targetsRemoved: 0,
    documentsRemoved: 0,
  },
  GE = 41943040;
class Vn {
  static withCacheSize(e) {
    return new Vn(
      e,
      Vn.DEFAULT_COLLECTION_PERCENTILE,
      Vn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT,
    );
  }
  constructor(e, t, i) {
    ((this.cacheSizeCollectionThreshold = e),
      (this.percentileToCollect = t),
      (this.maximumSequenceNumbersToCollect = i));
  }
}
((Vn.DEFAULT_COLLECTION_PERCENTILE = 10),
  (Vn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT = 1e3),
  (Vn.DEFAULT = new Vn(
    GE,
    Vn.DEFAULT_COLLECTION_PERCENTILE,
    Vn.DEFAULT_MAX_SEQUENCE_NUMBERS_TO_COLLECT,
  )),
  (Vn.DISABLED = new Vn(-1, 0, 0)));
class Va {
  constructor(e) {
    this._r = e;
  }
  next() {
    return ((this._r += 2), this._r);
  }
  static ar() {
    return new Va(0);
  }
  static ur() {
    return new Va(-1);
  }
}
const r0 = "LruGarbageCollector",
  Bx = 1048576;
function i0([n, e], [t, i]) {
  const o = qe(n, t);
  return o === 0 ? qe(e, i) : o;
}
class $x {
  constructor(e) {
    ((this.Tr = e), (this.buffer = new qt(i0)), (this.Ir = 0));
  }
  dr() {
    return ++this.Ir;
  }
  Er(e) {
    const t = [e, this.dr()];
    if (this.buffer.size < this.Tr) this.buffer = this.buffer.add(t);
    else {
      const i = this.buffer.last();
      i0(t, i) < 0 && (this.buffer = this.buffer.delete(i).add(t));
    }
  }
  get maxValue() {
    return this.buffer.last()[0];
  }
}
class Hx {
  constructor(e, t, i) {
    ((this.garbageCollector = e),
      (this.asyncQueue = t),
      (this.localStore = i),
      (this.Ar = null));
  }
  start() {
    this.garbageCollector.params.cacheSizeCollectionThreshold !== -1 &&
      this.Rr(6e4);
  }
  stop() {
    this.Ar && (this.Ar.cancel(), (this.Ar = null));
  }
  get started() {
    return this.Ar !== null;
  }
  Rr(e) {
    (pe(r0, `Garbage collection scheduled in ${e}ms`),
      (this.Ar = this.asyncQueue.enqueueAfterDelay(
        "lru_garbage_collection",
        e,
        async () => {
          this.Ar = null;
          try {
            await this.localStore.collectGarbage(this.garbageCollector);
          } catch (t) {
            Wa(t)
              ? pe(
                  r0,
                  "Ignoring IndexedDB error during garbage collection: ",
                  t,
                )
              : await Ha(t);
          }
          await this.Rr(3e5);
        },
      )));
  }
}
class Wx {
  constructor(e, t) {
    ((this.Vr = e), (this.params = t));
  }
  calculateTargetCount(e, t) {
    return this.Vr.mr(e).next((i) => Math.floor((t / 100) * i));
  }
  nthSequenceNumber(e, t) {
    if (t === 0) return Z.resolve(Gh.ue);
    const i = new $x(t);
    return this.Vr.forEachTarget(e, (o) => i.Er(o.sequenceNumber))
      .next(() => this.Vr.gr(e, (o) => i.Er(o)))
      .next(() => i.maxValue);
  }
  removeTargets(e, t, i) {
    return this.Vr.removeTargets(e, t, i);
  }
  removeOrphanedDocuments(e, t) {
    return this.Vr.removeOrphanedDocuments(e, t);
  }
  collect(e, t) {
    return this.params.cacheSizeCollectionThreshold === -1
      ? (pe("LruGarbageCollector", "Garbage collection skipped; disabled"),
        Z.resolve(n0))
      : this.getCacheSize(e).next((i) =>
          i < this.params.cacheSizeCollectionThreshold
            ? (pe(
                "LruGarbageCollector",
                `Garbage collection skipped; Cache size ${i} is lower than threshold ${this.params.cacheSizeCollectionThreshold}`,
              ),
              n0)
            : this.pr(e, t),
        );
  }
  getCacheSize(e) {
    return this.Vr.getCacheSize(e);
  }
  pr(e, t) {
    let i, o, a, u, d, f, m;
    const v = Date.now();
    return this.calculateTargetCount(e, this.params.percentileToCollect)
      .next(
        (w) => (
          w > this.params.maximumSequenceNumbersToCollect
            ? (pe(
                "LruGarbageCollector",
                `Capping sequence numbers to collect down to the maximum of ${this.params.maximumSequenceNumbersToCollect} from ${w}`,
              ),
              (o = this.params.maximumSequenceNumbersToCollect))
            : (o = w),
          (u = Date.now()),
          this.nthSequenceNumber(e, o)
        ),
      )
      .next((w) => ((i = w), (d = Date.now()), this.removeTargets(e, i, t)))
      .next(
        (w) => ((a = w), (f = Date.now()), this.removeOrphanedDocuments(e, i)),
      )
      .next(
        (w) => (
          (m = Date.now()),
          wa() <= Qe.DEBUG &&
            pe(
              "LruGarbageCollector",
              `LRU Garbage Collection
	Counted targets in ${u - v}ms
	Determined least recently used ${o} in ` +
                (d - u) +
                `ms
	Removed ${a} targets in ` +
                (f - d) +
                `ms
	Removed ${w} documents in ` +
                (m - f) +
                `ms
Total Duration: ${m - v}ms`,
            ),
          Z.resolve({
            didRun: !0,
            sequenceNumbersCollected: o,
            targetsRemoved: a,
            documentsRemoved: w,
          })
        ),
      );
  }
}
function qx(n, e) {
  return new Wx(n, e);
}
class Kx {
  constructor() {
    ((this.changes = new Oo(
      (e) => e.toString(),
      (e, t) => e.isEqual(t),
    )),
      (this.changesApplied = !1));
  }
  addEntry(e) {
    (this.assertNotApplied(), this.changes.set(e.key, e));
  }
  removeEntry(e, t) {
    (this.assertNotApplied(),
      this.changes.set(e, gn.newInvalidDocument(e).setReadTime(t)));
  }
  getEntry(e, t) {
    this.assertNotApplied();
    const i = this.changes.get(t);
    return i !== void 0 ? Z.resolve(i) : this.getFromCache(e, t);
  }
  getEntries(e, t) {
    return this.getAllFromCache(e, t);
  }
  apply(e) {
    return (
      this.assertNotApplied(),
      (this.changesApplied = !0),
      this.applyChanges(e)
    );
  }
  assertNotApplied() {}
}
class Gx {
  constructor(e, t) {
    ((this.overlayedDocument = e), (this.mutatedFields = t));
  }
}
class Qx {
  constructor(e, t, i, o) {
    ((this.remoteDocumentCache = e),
      (this.mutationQueue = t),
      (this.documentOverlayCache = i),
      (this.indexManager = o));
  }
  getDocument(e, t) {
    let i = null;
    return this.documentOverlayCache
      .getOverlay(e, t)
      .next((o) => ((i = o), this.remoteDocumentCache.getEntry(e, t)))
      .next((o) => (i !== null && Bl(i.mutation, o, br.empty(), Et.now()), o));
  }
  getDocuments(e, t) {
    return this.remoteDocumentCache
      .getEntries(e, t)
      .next((i) => this.getLocalViewOfDocuments(e, i, Ye()).next(() => i));
  }
  getLocalViewOfDocuments(e, t, i = Ye()) {
    const o = Io();
    return this.populateOverlays(e, o, t).next(() =>
      this.computeViews(e, t, o, i).next((a) => {
        let u = Ol();
        return (
          a.forEach((d, f) => {
            u = u.insert(d, f.overlayedDocument);
          }),
          u
        );
      }),
    );
  }
  getOverlayedDocuments(e, t) {
    const i = Io();
    return this.populateOverlays(e, i, t).next(() =>
      this.computeViews(e, t, i, Ye()),
    );
  }
  populateOverlays(e, t, i) {
    const o = [];
    return (
      i.forEach((a) => {
        t.has(a) || o.push(a);
      }),
      this.documentOverlayCache.getOverlays(e, o).next((a) => {
        a.forEach((u, d) => {
          t.set(u, d);
        });
      })
    );
  }
  computeViews(e, t, i, o) {
    let a = Bi();
    const u = jl(),
      d = (function () {
        return jl();
      })();
    return (
      t.forEach((f, m) => {
        const v = i.get(m.key);
        o.has(m.key) && (v === void 0 || v.mutation instanceof Lo)
          ? (a = a.insert(m.key, m))
          : v !== void 0
            ? (u.set(m.key, v.mutation.getFieldMask()),
              Bl(v.mutation, m, v.mutation.getFieldMask(), Et.now()))
            : u.set(m.key, br.empty());
      }),
      this.recalculateAndSaveOverlays(e, a).next(
        (f) => (
          f.forEach((m, v) => u.set(m, v)),
          t.forEach((m, v) => {
            var w;
            return d.set(
              m,
              new Gx(v, (w = u.get(m)) !== null && w !== void 0 ? w : null),
            );
          }),
          d
        ),
      )
    );
  }
  recalculateAndSaveOverlays(e, t) {
    const i = jl();
    let o = new xt((u, d) => u - d),
      a = Ye();
    return this.mutationQueue
      .getAllMutationBatchesAffectingDocumentKeys(e, t)
      .next((u) => {
        for (const d of u)
          d.keys().forEach((f) => {
            const m = t.get(f);
            if (m === null) return;
            let v = i.get(f) || br.empty();
            ((v = d.applyToLocalView(m, v)), i.set(f, v));
            const w = (o.get(d.batchId) || Ye()).add(f);
            o = o.insert(d.batchId, w);
          });
      })
      .next(() => {
        const u = [],
          d = o.getReverseIterator();
        for (; d.hasNext(); ) {
          const f = d.getNext(),
            m = f.key,
            v = f.value,
            w = kE();
          (v.forEach((T) => {
            if (!a.has(T)) {
              const A = LE(t.get(T), i.get(T));
              (A !== null && w.set(T, A), (a = a.add(T)));
            }
          }),
            u.push(this.documentOverlayCache.saveOverlays(e, m, w)));
        }
        return Z.waitFor(u);
      })
      .next(() => i);
  }
  recalculateAndSaveOverlaysForDocumentKeys(e, t) {
    return this.remoteDocumentCache
      .getEntries(e, t)
      .next((i) => this.recalculateAndSaveOverlays(e, i));
  }
  getDocumentsMatchingQuery(e, t, i, o) {
    return (function (u) {
      return (
        De.isDocumentKey(u.path) &&
        u.collectionGroup === null &&
        u.filters.length === 0
      );
    })(t)
      ? this.getDocumentsMatchingDocumentQuery(e, t.path)
      : Jk(t)
        ? this.getDocumentsMatchingCollectionGroupQuery(e, t, i, o)
        : this.getDocumentsMatchingCollectionQuery(e, t, i, o);
  }
  getNextDocuments(e, t, i, o) {
    return this.remoteDocumentCache
      .getAllFromCollectionGroup(e, t, i, o)
      .next((a) => {
        const u =
          o - a.size > 0
            ? this.documentOverlayCache.getOverlaysForCollectionGroup(
                e,
                t,
                i.largestBatchId,
                o - a.size,
              )
            : Z.resolve(Io());
        let d = tu,
          f = a;
        return u.next((m) =>
          Z.forEach(
            m,
            (v, w) => (
              d < w.largestBatchId && (d = w.largestBatchId),
              a.get(v)
                ? Z.resolve()
                : this.remoteDocumentCache.getEntry(e, v).next((T) => {
                    f = f.insert(v, T);
                  })
            ),
          )
            .next(() => this.populateOverlays(e, m, a))
            .next(() => this.computeViews(e, f, m, Ye()))
            .next((v) => ({ batchId: d, changes: PE(v) })),
        );
      });
  }
  getDocumentsMatchingDocumentQuery(e, t) {
    return this.getDocument(e, new De(t)).next((i) => {
      let o = Ol();
      return (i.isFoundDocument() && (o = o.insert(i.key, i)), o);
    });
  }
  getDocumentsMatchingCollectionGroupQuery(e, t, i, o) {
    const a = t.collectionGroup;
    let u = Ol();
    return this.indexManager.getCollectionParents(e, a).next((d) =>
      Z.forEach(d, (f) => {
        const m = (function (w, T) {
          return new Xh(
            T,
            null,
            w.explicitOrderBy.slice(),
            w.filters.slice(),
            w.limit,
            w.limitType,
            w.startAt,
            w.endAt,
          );
        })(t, f.child(a));
        return this.getDocumentsMatchingCollectionQuery(e, m, i, o).next(
          (v) => {
            v.forEach((w, T) => {
              u = u.insert(w, T);
            });
          },
        );
      }).next(() => u),
    );
  }
  getDocumentsMatchingCollectionQuery(e, t, i, o) {
    let a;
    return this.documentOverlayCache
      .getOverlaysForCollection(e, t.path, i.largestBatchId)
      .next(
        (u) => (
          (a = u),
          this.remoteDocumentCache.getDocumentsMatchingQuery(e, t, i, a, o)
        ),
      )
      .next((u) => {
        a.forEach((f, m) => {
          const v = m.getKey();
          u.get(v) === null && (u = u.insert(v, gn.newInvalidDocument(v)));
        });
        let d = Ol();
        return (
          u.forEach((f, m) => {
            const v = a.get(f);
            (v !== void 0 && Bl(v.mutation, m, br.empty(), Et.now()),
              Zh(t, m) && (d = d.insert(f, m)));
          }),
          d
        );
      });
  }
}
class Yx {
  constructor(e) {
    ((this.serializer = e), (this.Br = new Map()), (this.Lr = new Map()));
  }
  getBundleMetadata(e, t) {
    return Z.resolve(this.Br.get(t));
  }
  saveBundleMetadata(e, t) {
    return (
      this.Br.set(
        t.id,
        (function (o) {
          return { id: o.id, version: o.version, createTime: ei(o.createTime) };
        })(t),
      ),
      Z.resolve()
    );
  }
  getNamedQuery(e, t) {
    return Z.resolve(this.Lr.get(t));
  }
  saveNamedQuery(e, t) {
    return (
      this.Lr.set(
        t.name,
        (function (o) {
          return {
            name: o.name,
            query: Ux(o.bundledQuery),
            readTime: ei(o.readTime),
          };
        })(t),
      ),
      Z.resolve()
    );
  }
}
class Xx {
  constructor() {
    ((this.overlays = new xt(De.comparator)), (this.kr = new Map()));
  }
  getOverlay(e, t) {
    return Z.resolve(this.overlays.get(t));
  }
  getOverlays(e, t) {
    const i = Io();
    return Z.forEach(t, (o) =>
      this.getOverlay(e, o).next((a) => {
        a !== null && i.set(o, a);
      }),
    ).next(() => i);
  }
  saveOverlays(e, t, i) {
    return (
      i.forEach((o, a) => {
        this.wt(e, t, a);
      }),
      Z.resolve()
    );
  }
  removeOverlaysForBatchId(e, t, i) {
    const o = this.kr.get(i);
    return (
      o !== void 0 &&
        (o.forEach((a) => (this.overlays = this.overlays.remove(a))),
        this.kr.delete(i)),
      Z.resolve()
    );
  }
  getOverlaysForCollection(e, t, i) {
    const o = Io(),
      a = t.length + 1,
      u = new De(t.child("")),
      d = this.overlays.getIteratorFrom(u);
    for (; d.hasNext(); ) {
      const f = d.getNext().value,
        m = f.getKey();
      if (!t.isPrefixOf(m.path)) break;
      m.path.length === a && f.largestBatchId > i && o.set(f.getKey(), f);
    }
    return Z.resolve(o);
  }
  getOverlaysForCollectionGroup(e, t, i, o) {
    let a = new xt((m, v) => m - v);
    const u = this.overlays.getIterator();
    for (; u.hasNext(); ) {
      const m = u.getNext().value;
      if (m.getKey().getCollectionGroup() === t && m.largestBatchId > i) {
        let v = a.get(m.largestBatchId);
        (v === null && ((v = Io()), (a = a.insert(m.largestBatchId, v))),
          v.set(m.getKey(), m));
      }
    }
    const d = Io(),
      f = a.getIterator();
    for (
      ;
      f.hasNext() &&
      (f.getNext().value.forEach((m, v) => d.set(m, v)), !(d.size() >= o));

    );
    return Z.resolve(d);
  }
  wt(e, t, i) {
    const o = this.overlays.get(i.key);
    if (o !== null) {
      const u = this.kr.get(o.largestBatchId).delete(i.key);
      this.kr.set(o.largestBatchId, u);
    }
    this.overlays = this.overlays.insert(i.key, new gx(t, i));
    let a = this.kr.get(t);
    (a === void 0 && ((a = Ye()), this.kr.set(t, a)),
      this.kr.set(t, a.add(i.key)));
  }
}
class Jx {
  constructor() {
    this.sessionToken = ln.EMPTY_BYTE_STRING;
  }
  getSessionToken(e) {
    return Z.resolve(this.sessionToken);
  }
  setSessionToken(e, t) {
    return ((this.sessionToken = t), Z.resolve());
  }
}
class Om {
  constructor() {
    ((this.qr = new qt(Xt.Qr)), (this.$r = new qt(Xt.Ur)));
  }
  isEmpty() {
    return this.qr.isEmpty();
  }
  addReference(e, t) {
    const i = new Xt(e, t);
    ((this.qr = this.qr.add(i)), (this.$r = this.$r.add(i)));
  }
  Kr(e, t) {
    e.forEach((i) => this.addReference(i, t));
  }
  removeReference(e, t) {
    this.Wr(new Xt(e, t));
  }
  Gr(e, t) {
    e.forEach((i) => this.removeReference(i, t));
  }
  zr(e) {
    const t = new De(new kt([])),
      i = new Xt(t, e),
      o = new Xt(t, e + 1),
      a = [];
    return (
      this.$r.forEachInRange([i, o], (u) => {
        (this.Wr(u), a.push(u.key));
      }),
      a
    );
  }
  jr() {
    this.qr.forEach((e) => this.Wr(e));
  }
  Wr(e) {
    ((this.qr = this.qr.delete(e)), (this.$r = this.$r.delete(e)));
  }
  Jr(e) {
    const t = new De(new kt([])),
      i = new Xt(t, e),
      o = new Xt(t, e + 1);
    let a = Ye();
    return (
      this.$r.forEachInRange([i, o], (u) => {
        a = a.add(u.key);
      }),
      a
    );
  }
  containsKey(e) {
    const t = new Xt(e, 0),
      i = this.qr.firstAfterOrEqual(t);
    return i !== null && e.isEqual(i.key);
  }
}
class Xt {
  constructor(e, t) {
    ((this.key = e), (this.Hr = t));
  }
  static Qr(e, t) {
    return De.comparator(e.key, t.key) || qe(e.Hr, t.Hr);
  }
  static Ur(e, t) {
    return qe(e.Hr, t.Hr) || De.comparator(e.key, t.key);
  }
}
class Zx {
  constructor(e, t) {
    ((this.indexManager = e),
      (this.referenceDelegate = t),
      (this.mutationQueue = []),
      (this.er = 1),
      (this.Yr = new qt(Xt.Qr)));
  }
  checkEmpty(e) {
    return Z.resolve(this.mutationQueue.length === 0);
  }
  addMutationBatch(e, t, i, o) {
    const a = this.er;
    (this.er++,
      this.mutationQueue.length > 0 &&
        this.mutationQueue[this.mutationQueue.length - 1]);
    const u = new mx(a, t, i, o);
    this.mutationQueue.push(u);
    for (const d of o)
      ((this.Yr = this.Yr.add(new Xt(d.key, a))),
        this.indexManager.addToCollectionParentIndex(e, d.key.path.popLast()));
    return Z.resolve(u);
  }
  lookupMutationBatch(e, t) {
    return Z.resolve(this.Zr(t));
  }
  getNextMutationBatchAfterBatchId(e, t) {
    const i = t + 1,
      o = this.Xr(i),
      a = o < 0 ? 0 : o;
    return Z.resolve(
      this.mutationQueue.length > a ? this.mutationQueue[a] : null,
    );
  }
  getHighestUnacknowledgedBatchId() {
    return Z.resolve(this.mutationQueue.length === 0 ? Im : this.er - 1);
  }
  getAllMutationBatches(e) {
    return Z.resolve(this.mutationQueue.slice());
  }
  getAllMutationBatchesAffectingDocumentKey(e, t) {
    const i = new Xt(t, 0),
      o = new Xt(t, Number.POSITIVE_INFINITY),
      a = [];
    return (
      this.Yr.forEachInRange([i, o], (u) => {
        const d = this.Zr(u.Hr);
        a.push(d);
      }),
      Z.resolve(a)
    );
  }
  getAllMutationBatchesAffectingDocumentKeys(e, t) {
    let i = new qt(qe);
    return (
      t.forEach((o) => {
        const a = new Xt(o, 0),
          u = new Xt(o, Number.POSITIVE_INFINITY);
        this.Yr.forEachInRange([a, u], (d) => {
          i = i.add(d.Hr);
        });
      }),
      Z.resolve(this.ei(i))
    );
  }
  getAllMutationBatchesAffectingQuery(e, t) {
    const i = t.path,
      o = i.length + 1;
    let a = i;
    De.isDocumentKey(a) || (a = a.child(""));
    const u = new Xt(new De(a), 0);
    let d = new qt(qe);
    return (
      this.Yr.forEachWhile((f) => {
        const m = f.key.path;
        return !!i.isPrefixOf(m) && (m.length === o && (d = d.add(f.Hr)), !0);
      }, u),
      Z.resolve(this.ei(d))
    );
  }
  ei(e) {
    const t = [];
    return (
      e.forEach((i) => {
        const o = this.Zr(i);
        o !== null && t.push(o);
      }),
      t
    );
  }
  removeMutationBatch(e, t) {
    (at(this.ti(t.batchId, "removed") === 0, 55003),
      this.mutationQueue.shift());
    let i = this.Yr;
    return Z.forEach(t.mutations, (o) => {
      const a = new Xt(o.key, t.batchId);
      return (
        (i = i.delete(a)),
        this.referenceDelegate.markPotentiallyOrphaned(e, o.key)
      );
    }).next(() => {
      this.Yr = i;
    });
  }
  rr(e) {}
  containsKey(e, t) {
    const i = new Xt(t, 0),
      o = this.Yr.firstAfterOrEqual(i);
    return Z.resolve(t.isEqual(o && o.key));
  }
  performConsistencyCheck(e) {
    return (this.mutationQueue.length, Z.resolve());
  }
  ti(e, t) {
    return this.Xr(e);
  }
  Xr(e) {
    return this.mutationQueue.length === 0
      ? 0
      : e - this.mutationQueue[0].batchId;
  }
  Zr(e) {
    const t = this.Xr(e);
    return t < 0 || t >= this.mutationQueue.length
      ? null
      : this.mutationQueue[t];
  }
}
class eb {
  constructor(e) {
    ((this.ni = e),
      (this.docs = (function () {
        return new xt(De.comparator);
      })()),
      (this.size = 0));
  }
  setIndexManager(e) {
    this.indexManager = e;
  }
  addEntry(e, t) {
    const i = t.key,
      o = this.docs.get(i),
      a = o ? o.size : 0,
      u = this.ni(t);
    return (
      (this.docs = this.docs.insert(i, { document: t.mutableCopy(), size: u })),
      (this.size += u - a),
      this.indexManager.addToCollectionParentIndex(e, i.path.popLast())
    );
  }
  removeEntry(e) {
    const t = this.docs.get(e);
    t && ((this.docs = this.docs.remove(e)), (this.size -= t.size));
  }
  getEntry(e, t) {
    const i = this.docs.get(t);
    return Z.resolve(i ? i.document.mutableCopy() : gn.newInvalidDocument(t));
  }
  getEntries(e, t) {
    let i = Bi();
    return (
      t.forEach((o) => {
        const a = this.docs.get(o);
        i = i.insert(
          o,
          a ? a.document.mutableCopy() : gn.newInvalidDocument(o),
        );
      }),
      Z.resolve(i)
    );
  }
  getDocumentsMatchingQuery(e, t, i, o) {
    let a = Bi();
    const u = t.path,
      d = new De(u.child("__id-9223372036854775808__")),
      f = this.docs.getIteratorFrom(d);
    for (; f.hasNext(); ) {
      const {
        key: m,
        value: { document: v },
      } = f.getNext();
      if (!u.isPrefixOf(m.path)) break;
      m.path.length > u.length + 1 ||
        kk(Pk(v), i) <= 0 ||
        ((o.has(v.key) || Zh(t, v)) && (a = a.insert(v.key, v.mutableCopy())));
    }
    return Z.resolve(a);
  }
  getAllFromCollectionGroup(e, t, i, o) {
    Le(9500);
  }
  ri(e, t) {
    return Z.forEach(this.docs, (i) => t(i));
  }
  newChangeBuffer(e) {
    return new tb(this);
  }
  getSize(e) {
    return Z.resolve(this.size);
  }
}
class tb extends Kx {
  constructor(e) {
    (super(), (this.Or = e));
  }
  applyChanges(e) {
    const t = [];
    return (
      this.changes.forEach((i, o) => {
        o.isValidDocument()
          ? t.push(this.Or.addEntry(e, o))
          : this.Or.removeEntry(i);
      }),
      Z.waitFor(t)
    );
  }
  getFromCache(e, t) {
    return this.Or.getEntry(e, t);
  }
  getAllFromCache(e, t) {
    return this.Or.getEntries(e, t);
  }
}
class nb {
  constructor(e) {
    ((this.persistence = e),
      (this.ii = new Oo((t) => Cm(t), Pm)),
      (this.lastRemoteSnapshotVersion = ze.min()),
      (this.highestTargetId = 0),
      (this.si = 0),
      (this.oi = new Om()),
      (this.targetCount = 0),
      (this._i = Va.ar()));
  }
  forEachTarget(e, t) {
    return (this.ii.forEach((i, o) => t(o)), Z.resolve());
  }
  getLastRemoteSnapshotVersion(e) {
    return Z.resolve(this.lastRemoteSnapshotVersion);
  }
  getHighestSequenceNumber(e) {
    return Z.resolve(this.si);
  }
  allocateTargetId(e) {
    return (
      (this.highestTargetId = this._i.next()),
      Z.resolve(this.highestTargetId)
    );
  }
  setTargetsMetadata(e, t, i) {
    return (
      i && (this.lastRemoteSnapshotVersion = i),
      t > this.si && (this.si = t),
      Z.resolve()
    );
  }
  hr(e) {
    this.ii.set(e.target, e);
    const t = e.targetId;
    (t > this.highestTargetId &&
      ((this._i = new Va(t)), (this.highestTargetId = t)),
      e.sequenceNumber > this.si && (this.si = e.sequenceNumber));
  }
  addTargetData(e, t) {
    return (this.hr(t), (this.targetCount += 1), Z.resolve());
  }
  updateTargetData(e, t) {
    return (this.hr(t), Z.resolve());
  }
  removeTargetData(e, t) {
    return (
      this.ii.delete(t.target),
      this.oi.zr(t.targetId),
      (this.targetCount -= 1),
      Z.resolve()
    );
  }
  removeTargets(e, t, i) {
    let o = 0;
    const a = [];
    return (
      this.ii.forEach((u, d) => {
        d.sequenceNumber <= t &&
          i.get(d.targetId) === null &&
          (this.ii.delete(u),
          a.push(this.removeMatchingKeysForTargetId(e, d.targetId)),
          o++);
      }),
      Z.waitFor(a).next(() => o)
    );
  }
  getTargetCount(e) {
    return Z.resolve(this.targetCount);
  }
  getTargetData(e, t) {
    const i = this.ii.get(t) || null;
    return Z.resolve(i);
  }
  addMatchingKeys(e, t, i) {
    return (this.oi.Kr(t, i), Z.resolve());
  }
  removeMatchingKeys(e, t, i) {
    this.oi.Gr(t, i);
    const o = this.persistence.referenceDelegate,
      a = [];
    return (
      o &&
        t.forEach((u) => {
          a.push(o.markPotentiallyOrphaned(e, u));
        }),
      Z.waitFor(a)
    );
  }
  removeMatchingKeysForTargetId(e, t) {
    return (this.oi.zr(t), Z.resolve());
  }
  getMatchingKeysForTargetId(e, t) {
    const i = this.oi.Jr(t);
    return Z.resolve(i);
  }
  containsKey(e, t) {
    return Z.resolve(this.oi.containsKey(t));
  }
}
class QE {
  constructor(e, t) {
    ((this.ai = {}),
      (this.overlays = {}),
      (this.ui = new Gh(0)),
      (this.ci = !1),
      (this.ci = !0),
      (this.li = new Jx()),
      (this.referenceDelegate = e(this)),
      (this.hi = new nb(this)),
      (this.indexManager = new zx()),
      (this.remoteDocumentCache = (function (o) {
        return new eb(o);
      })((i) => this.referenceDelegate.Pi(i))),
      (this.serializer = new Fx(t)),
      (this.Ti = new Yx(this.serializer)));
  }
  start() {
    return Promise.resolve();
  }
  shutdown() {
    return ((this.ci = !1), Promise.resolve());
  }
  get started() {
    return this.ci;
  }
  setDatabaseDeletedListener() {}
  setNetworkEnabled() {}
  getIndexManager(e) {
    return this.indexManager;
  }
  getDocumentOverlayCache(e) {
    let t = this.overlays[e.toKey()];
    return (t || ((t = new Xx()), (this.overlays[e.toKey()] = t)), t);
  }
  getMutationQueue(e, t) {
    let i = this.ai[e.toKey()];
    return (
      i || ((i = new Zx(t, this.referenceDelegate)), (this.ai[e.toKey()] = i)),
      i
    );
  }
  getGlobalsCache() {
    return this.li;
  }
  getTargetCache() {
    return this.hi;
  }
  getRemoteDocumentCache() {
    return this.remoteDocumentCache;
  }
  getBundleCache() {
    return this.Ti;
  }
  runTransaction(e, t, i) {
    pe("MemoryPersistence", "Starting transaction:", e);
    const o = new rb(this.ui.next());
    return (
      this.referenceDelegate.Ii(),
      i(o)
        .next((a) => this.referenceDelegate.di(o).next(() => a))
        .toPromise()
        .then((a) => (o.raiseOnCommittedEvent(), a))
    );
  }
  Ei(e, t) {
    return Z.or(Object.values(this.ai).map((i) => () => i.containsKey(e, t)));
  }
}
class rb extends bk {
  constructor(e) {
    (super(), (this.currentSequenceNumber = e));
  }
}
class Lm {
  constructor(e) {
    ((this.persistence = e), (this.Ai = new Om()), (this.Ri = null));
  }
  static Vi(e) {
    return new Lm(e);
  }
  get mi() {
    if (this.Ri) return this.Ri;
    throw Le(60996);
  }
  addReference(e, t, i) {
    return (
      this.Ai.addReference(i, t),
      this.mi.delete(i.toString()),
      Z.resolve()
    );
  }
  removeReference(e, t, i) {
    return (
      this.Ai.removeReference(i, t),
      this.mi.add(i.toString()),
      Z.resolve()
    );
  }
  markPotentiallyOrphaned(e, t) {
    return (this.mi.add(t.toString()), Z.resolve());
  }
  removeTarget(e, t) {
    this.Ai.zr(t.targetId).forEach((o) => this.mi.add(o.toString()));
    const i = this.persistence.getTargetCache();
    return i
      .getMatchingKeysForTargetId(e, t.targetId)
      .next((o) => {
        o.forEach((a) => this.mi.add(a.toString()));
      })
      .next(() => i.removeTargetData(e, t));
  }
  Ii() {
    this.Ri = new Set();
  }
  di(e) {
    const t = this.persistence.getRemoteDocumentCache().newChangeBuffer();
    return Z.forEach(this.mi, (i) => {
      const o = De.fromPath(i);
      return this.fi(e, o).next((a) => {
        a || t.removeEntry(o, ze.min());
      });
    }).next(() => ((this.Ri = null), t.apply(e)));
  }
  updateLimboDocument(e, t) {
    return this.fi(e, t).next((i) => {
      i ? this.mi.delete(t.toString()) : this.mi.add(t.toString());
    });
  }
  Pi(e) {
    return 0;
  }
  fi(e, t) {
    return Z.or([
      () => Z.resolve(this.Ai.containsKey(t)),
      () => this.persistence.getTargetCache().containsKey(e, t),
      () => this.persistence.Ei(e, t),
    ]);
  }
}
class Rh {
  constructor(e, t) {
    ((this.persistence = e),
      (this.gi = new Oo(
        (i) => Ok(i.path),
        (i, o) => i.isEqual(o),
      )),
      (this.garbageCollector = qx(this, t)));
  }
  static Vi(e, t) {
    return new Rh(e, t);
  }
  Ii() {}
  di(e) {
    return Z.resolve();
  }
  forEachTarget(e, t) {
    return this.persistence.getTargetCache().forEachTarget(e, t);
  }
  mr(e) {
    const t = this.yr(e);
    return this.persistence
      .getTargetCache()
      .getTargetCount(e)
      .next((i) => t.next((o) => i + o));
  }
  yr(e) {
    let t = 0;
    return this.gr(e, (i) => {
      t++;
    }).next(() => t);
  }
  gr(e, t) {
    return Z.forEach(this.gi, (i, o) =>
      this.Sr(e, i, o).next((a) => (a ? Z.resolve() : t(o))),
    );
  }
  removeTargets(e, t, i) {
    return this.persistence.getTargetCache().removeTargets(e, t, i);
  }
  removeOrphanedDocuments(e, t) {
    let i = 0;
    const o = this.persistence.getRemoteDocumentCache(),
      a = o.newChangeBuffer();
    return o
      .ri(e, (u) =>
        this.Sr(e, u, t).next((d) => {
          d || (i++, a.removeEntry(u, ze.min()));
        }),
      )
      .next(() => a.apply(e))
      .next(() => i);
  }
  markPotentiallyOrphaned(e, t) {
    return (this.gi.set(t, e.currentSequenceNumber), Z.resolve());
  }
  removeTarget(e, t) {
    const i = t.withSequenceNumber(e.currentSequenceNumber);
    return this.persistence.getTargetCache().updateTargetData(e, i);
  }
  addReference(e, t, i) {
    return (this.gi.set(i, e.currentSequenceNumber), Z.resolve());
  }
  removeReference(e, t, i) {
    return (this.gi.set(i, e.currentSequenceNumber), Z.resolve());
  }
  updateLimboDocument(e, t) {
    return (this.gi.set(t, e.currentSequenceNumber), Z.resolve());
  }
  Pi(e) {
    let t = e.key.toString().length;
    return (e.isFoundDocument() && (t += Yc(e.data.value)), t);
  }
  Sr(e, t, i) {
    return Z.or([
      () => this.persistence.Ei(e, t),
      () => this.persistence.getTargetCache().containsKey(e, t),
      () => {
        const o = this.gi.get(t);
        return Z.resolve(o !== void 0 && o > i);
      },
    ]);
  }
  getCacheSize(e) {
    return this.persistence.getRemoteDocumentCache().getSize(e);
  }
}
class Mm {
  constructor(e, t, i, o) {
    ((this.targetId = e), (this.fromCache = t), (this.Is = i), (this.ds = o));
  }
  static Es(e, t) {
    let i = Ye(),
      o = Ye();
    for (const a of t.docChanges)
      switch (a.type) {
        case 0:
          i = i.add(a.doc.key);
          break;
        case 1:
          o = o.add(a.doc.key);
      }
    return new Mm(e, t.fromCache, i, o);
  }
}
class ib {
  constructor() {
    this._documentReadCount = 0;
  }
  get documentReadCount() {
    return this._documentReadCount;
  }
  incrementDocumentReadCount(e) {
    this._documentReadCount += e;
  }
}
class sb {
  constructor() {
    ((this.As = !1),
      (this.Rs = !1),
      (this.Vs = 100),
      (this.fs = (function () {
        return JC() ? 8 : Dk(yn()) > 0 ? 6 : 4;
      })()));
  }
  initialize(e, t) {
    ((this.gs = e), (this.indexManager = t), (this.As = !0));
  }
  getDocumentsMatchingQuery(e, t, i, o) {
    const a = { result: null };
    return this.ps(e, t)
      .next((u) => {
        a.result = u;
      })
      .next(() => {
        if (!a.result)
          return this.ys(e, t, o, i).next((u) => {
            a.result = u;
          });
      })
      .next(() => {
        if (a.result) return;
        const u = new ib();
        return this.ws(e, t, u).next((d) => {
          if (((a.result = d), this.Rs)) return this.Ss(e, t, u, d.size);
        });
      })
      .next(() => a.result);
  }
  Ss(e, t, i, o) {
    return i.documentReadCount < this.Vs
      ? (wa() <= Qe.DEBUG &&
          pe(
            "QueryEngine",
            "SDK will not create cache indexes for query:",
            Ea(t),
            "since it only creates cache indexes for collection contains",
            "more than or equal to",
            this.Vs,
            "documents",
          ),
        Z.resolve())
      : (wa() <= Qe.DEBUG &&
          pe(
            "QueryEngine",
            "Query:",
            Ea(t),
            "scans",
            i.documentReadCount,
            "local documents and returns",
            o,
            "documents as results.",
          ),
        i.documentReadCount > this.fs * o
          ? (wa() <= Qe.DEBUG &&
              pe(
                "QueryEngine",
                "The SDK decides to create cache indexes for query:",
                Ea(t),
                "as using cache indexes may help improve performance.",
              ),
            this.indexManager.createTargetIndexes(e, Zr(t)))
          : Z.resolve());
  }
  ps(e, t) {
    if (q_(t)) return Z.resolve(null);
    let i = Zr(t);
    return this.indexManager.getIndexType(e, i).next((o) =>
      o === 0
        ? null
        : (t.limit !== null && o === 1 && ((t = Up(t, null, "F")), (i = Zr(t))),
          this.indexManager.getDocumentsMatchingTarget(e, i).next((a) => {
            const u = Ye(...a);
            return this.gs.getDocuments(e, u).next((d) =>
              this.indexManager.getMinOffset(e, i).next((f) => {
                const m = this.bs(t, d);
                return this.Ds(t, m, u, f.readTime)
                  ? this.ps(e, Up(t, null, "F"))
                  : this.vs(e, m, t, f);
              }),
            );
          })),
    );
  }
  ys(e, t, i, o) {
    return q_(t) || o.isEqual(ze.min())
      ? Z.resolve(null)
      : this.gs.getDocuments(e, i).next((a) => {
          const u = this.bs(t, a);
          return this.Ds(t, u, i, o)
            ? Z.resolve(null)
            : (wa() <= Qe.DEBUG &&
                pe(
                  "QueryEngine",
                  "Re-using previous result from %s to execute query: %s",
                  o.toString(),
                  Ea(t),
                ),
              this.vs(e, u, t, Ck(o, tu)).next((d) => d));
        });
  }
  bs(e, t) {
    let i = new qt(AE(e));
    return (
      t.forEach((o, a) => {
        Zh(e, a) && (i = i.add(a));
      }),
      i
    );
  }
  Ds(e, t, i, o) {
    if (e.limit === null) return !1;
    if (i.size !== t.size) return !0;
    const a = e.limitType === "F" ? t.last() : t.first();
    return !!a && (a.hasPendingWrites || a.version.compareTo(o) > 0);
  }
  ws(e, t, i) {
    return (
      wa() <= Qe.DEBUG &&
        pe(
          "QueryEngine",
          "Using full collection scan to execute query:",
          Ea(t),
        ),
      this.gs.getDocumentsMatchingQuery(e, t, js.min(), i)
    );
  }
  vs(e, t, i, o) {
    return this.gs.getDocumentsMatchingQuery(e, i, o).next(
      (a) => (
        t.forEach((u) => {
          a = a.insert(u.key, u);
        }),
        a
      ),
    );
  }
}
const Vm = "LocalStore",
  ob = 3e8;
class ab {
  constructor(e, t, i, o) {
    ((this.persistence = e),
      (this.Cs = t),
      (this.serializer = o),
      (this.Fs = new xt(qe)),
      (this.Ms = new Oo((a) => Cm(a), Pm)),
      (this.xs = new Map()),
      (this.Os = e.getRemoteDocumentCache()),
      (this.hi = e.getTargetCache()),
      (this.Ti = e.getBundleCache()),
      this.Ns(i));
  }
  Ns(e) {
    ((this.documentOverlayCache = this.persistence.getDocumentOverlayCache(e)),
      (this.indexManager = this.persistence.getIndexManager(e)),
      (this.mutationQueue = this.persistence.getMutationQueue(
        e,
        this.indexManager,
      )),
      (this.localDocuments = new Qx(
        this.Os,
        this.mutationQueue,
        this.documentOverlayCache,
        this.indexManager,
      )),
      this.Os.setIndexManager(this.indexManager),
      this.Cs.initialize(this.localDocuments, this.indexManager));
  }
  collectGarbage(e) {
    return this.persistence.runTransaction(
      "Collect garbage",
      "readwrite-primary",
      (t) => e.collect(t, this.Fs),
    );
  }
}
function lb(n, e, t, i) {
  return new ab(n, e, t, i);
}
async function YE(n, e) {
  const t = je(n);
  return await t.persistence.runTransaction(
    "Handle user change",
    "readonly",
    (i) => {
      let o;
      return t.mutationQueue
        .getAllMutationBatches(i)
        .next(
          (a) => ((o = a), t.Ns(e), t.mutationQueue.getAllMutationBatches(i)),
        )
        .next((a) => {
          const u = [],
            d = [];
          let f = Ye();
          for (const m of o) {
            u.push(m.batchId);
            for (const v of m.mutations) f = f.add(v.key);
          }
          for (const m of a) {
            d.push(m.batchId);
            for (const v of m.mutations) f = f.add(v.key);
          }
          return t.localDocuments
            .getDocuments(i, f)
            .next((m) => ({ Bs: m, removedBatchIds: u, addedBatchIds: d }));
        });
    },
  );
}
function ub(n, e) {
  const t = je(n);
  return t.persistence.runTransaction(
    "Acknowledge batch",
    "readwrite-primary",
    (i) => {
      const o = e.batch.keys(),
        a = t.Os.newChangeBuffer({ trackRemovals: !0 });
      return (function (d, f, m, v) {
        const w = m.batch,
          T = w.keys();
        let A = Z.resolve();
        return (
          T.forEach((D) => {
            A = A.next(() => v.getEntry(f, D)).next((j) => {
              const O = m.docVersions.get(D);
              (at(O !== null, 48541),
                j.version.compareTo(O) < 0 &&
                  (w.applyToRemoteDocument(j, m),
                  j.isValidDocument() &&
                    (j.setReadTime(m.commitVersion), v.addEntry(j))));
            });
          }),
          A.next(() => d.mutationQueue.removeMutationBatch(f, w))
        );
      })(t, i, e, a)
        .next(() => a.apply(i))
        .next(() => t.mutationQueue.performConsistencyCheck(i))
        .next(() =>
          t.documentOverlayCache.removeOverlaysForBatchId(
            i,
            o,
            e.batch.batchId,
          ),
        )
        .next(() =>
          t.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(
            i,
            (function (d) {
              let f = Ye();
              for (let m = 0; m < d.mutationResults.length; ++m)
                d.mutationResults[m].transformResults.length > 0 &&
                  (f = f.add(d.batch.mutations[m].key));
              return f;
            })(e),
          ),
        )
        .next(() => t.localDocuments.getDocuments(i, o));
    },
  );
}
function XE(n) {
  const e = je(n);
  return e.persistence.runTransaction(
    "Get last remote snapshot version",
    "readonly",
    (t) => e.hi.getLastRemoteSnapshotVersion(t),
  );
}
function cb(n, e) {
  const t = je(n),
    i = e.snapshotVersion;
  let o = t.Fs;
  return t.persistence
    .runTransaction("Apply remote event", "readwrite-primary", (a) => {
      const u = t.Os.newChangeBuffer({ trackRemovals: !0 });
      o = t.Fs;
      const d = [];
      e.targetChanges.forEach((v, w) => {
        const T = o.get(w);
        if (!T) return;
        d.push(
          t.hi
            .removeMatchingKeys(a, v.removedDocuments, w)
            .next(() => t.hi.addMatchingKeys(a, v.addedDocuments, w)),
        );
        let A = T.withSequenceNumber(a.currentSequenceNumber);
        (e.targetMismatches.get(w) !== null
          ? (A = A.withResumeToken(
              ln.EMPTY_BYTE_STRING,
              ze.min(),
            ).withLastLimboFreeSnapshotVersion(ze.min()))
          : v.resumeToken.approximateByteSize() > 0 &&
            (A = A.withResumeToken(v.resumeToken, i)),
          (o = o.insert(w, A)),
          (function (j, O, X) {
            return j.resumeToken.approximateByteSize() === 0 ||
              O.snapshotVersion.toMicroseconds() -
                j.snapshotVersion.toMicroseconds() >=
                ob
              ? !0
              : X.addedDocuments.size +
                  X.modifiedDocuments.size +
                  X.removedDocuments.size >
                  0;
          })(T, A, v) && d.push(t.hi.updateTargetData(a, A)));
      });
      let f = Bi(),
        m = Ye();
      if (
        (e.documentUpdates.forEach((v) => {
          e.resolvedLimboDocuments.has(v) &&
            d.push(t.persistence.referenceDelegate.updateLimboDocument(a, v));
        }),
        d.push(
          hb(a, u, e.documentUpdates).next((v) => {
            ((f = v.Ls), (m = v.ks));
          }),
        ),
        !i.isEqual(ze.min()))
      ) {
        const v = t.hi
          .getLastRemoteSnapshotVersion(a)
          .next((w) => t.hi.setTargetsMetadata(a, a.currentSequenceNumber, i));
        d.push(v);
      }
      return Z.waitFor(d)
        .next(() => u.apply(a))
        .next(() => t.localDocuments.getLocalViewOfDocuments(a, f, m))
        .next(() => f);
    })
    .then((a) => ((t.Fs = o), a));
}
function hb(n, e, t) {
  let i = Ye(),
    o = Ye();
  return (
    t.forEach((a) => (i = i.add(a))),
    e.getEntries(n, i).next((a) => {
      let u = Bi();
      return (
        t.forEach((d, f) => {
          const m = a.get(d);
          (f.isFoundDocument() !== m.isFoundDocument() && (o = o.add(d)),
            f.isNoDocument() && f.version.isEqual(ze.min())
              ? (e.removeEntry(d, f.readTime), (u = u.insert(d, f)))
              : !m.isValidDocument() ||
                  f.version.compareTo(m.version) > 0 ||
                  (f.version.compareTo(m.version) === 0 && m.hasPendingWrites)
                ? (e.addEntry(f), (u = u.insert(d, f)))
                : pe(
                    Vm,
                    "Ignoring outdated watch update for ",
                    d,
                    ". Current version:",
                    m.version,
                    " Watch version:",
                    f.version,
                  ));
        }),
        { Ls: u, ks: o }
      );
    })
  );
}
function db(n, e) {
  const t = je(n);
  return t.persistence.runTransaction(
    "Get next mutation batch",
    "readonly",
    (i) => (
      e === void 0 && (e = Im),
      t.mutationQueue.getNextMutationBatchAfterBatchId(i, e)
    ),
  );
}
function fb(n, e) {
  const t = je(n);
  return t.persistence
    .runTransaction("Allocate target", "readwrite", (i) => {
      let o;
      return t.hi
        .getTargetData(i, e)
        .next((a) =>
          a
            ? ((o = a), Z.resolve(o))
            : t.hi
                .allocateTargetId(i)
                .next(
                  (u) => (
                    (o = new Ns(
                      e,
                      u,
                      "TargetPurposeListen",
                      i.currentSequenceNumber,
                    )),
                    t.hi.addTargetData(i, o).next(() => o)
                  ),
                ),
        );
    })
    .then((i) => {
      const o = t.Fs.get(i.targetId);
      return (
        (o === null || i.snapshotVersion.compareTo(o.snapshotVersion) > 0) &&
          ((t.Fs = t.Fs.insert(i.targetId, i)), t.Ms.set(e, i.targetId)),
        i
      );
    });
}
async function Hp(n, e, t) {
  const i = je(n),
    o = i.Fs.get(e),
    a = t ? "readwrite" : "readwrite-primary";
  try {
    t ||
      (await i.persistence.runTransaction("Release target", a, (u) =>
        i.persistence.referenceDelegate.removeTarget(u, o),
      ));
  } catch (u) {
    if (!Wa(u)) throw u;
    pe(Vm, `Failed to update sequence numbers for target ${e}: ${u}`);
  }
  ((i.Fs = i.Fs.remove(e)), i.Ms.delete(o.target));
}
function s0(n, e, t) {
  const i = je(n);
  let o = ze.min(),
    a = Ye();
  return i.persistence.runTransaction("Execute query", "readwrite", (u) =>
    (function (f, m, v) {
      const w = je(f),
        T = w.Ms.get(v);
      return T !== void 0 ? Z.resolve(w.Fs.get(T)) : w.hi.getTargetData(m, v);
    })(i, u, Zr(e))
      .next((d) => {
        if (d)
          return (
            (o = d.lastLimboFreeSnapshotVersion),
            i.hi.getMatchingKeysForTargetId(u, d.targetId).next((f) => {
              a = f;
            })
          );
      })
      .next(() =>
        i.Cs.getDocumentsMatchingQuery(u, e, t ? o : ze.min(), t ? a : Ye()),
      )
      .next((d) => (pb(i, ex(e), d), { documents: d, qs: a })),
  );
}
function pb(n, e, t) {
  let i = n.xs.get(e) || ze.min();
  (t.forEach((o, a) => {
    a.readTime.compareTo(i) > 0 && (i = a.readTime);
  }),
    n.xs.set(e, i));
}
class o0 {
  constructor() {
    this.activeTargetIds = ox();
  }
  Gs(e) {
    this.activeTargetIds = this.activeTargetIds.add(e);
  }
  zs(e) {
    this.activeTargetIds = this.activeTargetIds.delete(e);
  }
  Ws() {
    const e = {
      activeTargetIds: this.activeTargetIds.toArray(),
      updateTimeMs: Date.now(),
    };
    return JSON.stringify(e);
  }
}
class mb {
  constructor() {
    ((this.Fo = new o0()),
      (this.Mo = {}),
      (this.onlineStateHandler = null),
      (this.sequenceNumberHandler = null));
  }
  addPendingMutation(e) {}
  updateMutationState(e, t, i) {}
  addLocalQueryTarget(e, t = !0) {
    return (t && this.Fo.Gs(e), this.Mo[e] || "not-current");
  }
  updateQueryState(e, t, i) {
    this.Mo[e] = t;
  }
  removeLocalQueryTarget(e) {
    this.Fo.zs(e);
  }
  isLocalQueryTarget(e) {
    return this.Fo.activeTargetIds.has(e);
  }
  clearQueryState(e) {
    delete this.Mo[e];
  }
  getAllActiveQueryTargets() {
    return this.Fo.activeTargetIds;
  }
  isActiveQueryTarget(e) {
    return this.Fo.activeTargetIds.has(e);
  }
  start() {
    return ((this.Fo = new o0()), Promise.resolve());
  }
  handleUserChange(e, t, i) {}
  setOnlineState(e) {}
  shutdown() {}
  writeSequenceNumber(e) {}
  notifyBundleLoaded(e) {}
}
class gb {
  xo(e) {}
  shutdown() {}
}
const a0 = "ConnectivityMonitor";
class l0 {
  constructor() {
    ((this.Oo = () => this.No()),
      (this.Bo = () => this.Lo()),
      (this.ko = []),
      this.qo());
  }
  xo(e) {
    this.ko.push(e);
  }
  shutdown() {
    (window.removeEventListener("online", this.Oo),
      window.removeEventListener("offline", this.Bo));
  }
  qo() {
    (window.addEventListener("online", this.Oo),
      window.addEventListener("offline", this.Bo));
  }
  No() {
    pe(a0, "Network connectivity changed: AVAILABLE");
    for (const e of this.ko) e(0);
  }
  Lo() {
    pe(a0, "Network connectivity changed: UNAVAILABLE");
    for (const e of this.ko) e(1);
  }
  static C() {
    return (
      typeof window < "u" &&
      window.addEventListener !== void 0 &&
      window.removeEventListener !== void 0
    );
  }
}
let jc = null;
function Wp() {
  return (
    jc === null
      ? (jc = (function () {
          return 268435456 + Math.round(2147483648 * Math.random());
        })())
      : jc++,
    "0x" + jc.toString(16)
  );
}
const op = "RestConnection",
  yb = {
    BatchGetDocuments: "batchGet",
    Commit: "commit",
    RunQuery: "runQuery",
    RunAggregationQuery: "runAggregationQuery",
  };
class vb {
  get Qo() {
    return !1;
  }
  constructor(e) {
    ((this.databaseInfo = e), (this.databaseId = e.databaseId));
    const t = e.ssl ? "https" : "http",
      i = encodeURIComponent(this.databaseId.projectId),
      o = encodeURIComponent(this.databaseId.database);
    ((this.$o = t + "://" + e.host),
      (this.Uo = `projects/${i}/databases/${o}`),
      (this.Ko =
        this.databaseId.database === vh
          ? `project_id=${i}`
          : `project_id=${i}&database_id=${o}`));
  }
  Wo(e, t, i, o, a) {
    const u = Wp(),
      d = this.Go(e, t.toUriEncodedString());
    pe(op, `Sending RPC '${e}' ${u}:`, d, i);
    const f = {
      "google-cloud-resource-prefix": this.Uo,
      "x-goog-request-params": this.Ko,
    };
    this.zo(f, o, a);
    const { host: m } = new URL(d),
      v = ja(m);
    return this.jo(e, d, f, i, v).then(
      (w) => (pe(op, `Received RPC '${e}' ${u}: `, w), w),
      (w) => {
        throw (
          zs(
            op,
            `RPC '${e}' ${u} failed with error: `,
            w,
            "url: ",
            d,
            "request:",
            i,
          ),
          w
        );
      },
    );
  }
  Jo(e, t, i, o, a, u) {
    return this.Wo(e, t, i, o, a);
  }
  zo(e, t, i) {
    ((e["X-Goog-Api-Client"] = (function () {
      return "gl-js/ fire/" + $a;
    })()),
      (e["Content-Type"] = "text/plain"),
      this.databaseInfo.appId &&
        (e["X-Firebase-GMPID"] = this.databaseInfo.appId),
      t && t.headers.forEach((o, a) => (e[a] = o)),
      i && i.headers.forEach((o, a) => (e[a] = o)));
  }
  Go(e, t) {
    const i = yb[e];
    return `${this.$o}/v1/${t}:${i}`;
  }
  terminate() {}
}
class _b {
  constructor(e) {
    ((this.Ho = e.Ho), (this.Yo = e.Yo));
  }
  Zo(e) {
    this.Xo = e;
  }
  e_(e) {
    this.t_ = e;
  }
  n_(e) {
    this.r_ = e;
  }
  onMessage(e) {
    this.i_ = e;
  }
  close() {
    this.Yo();
  }
  send(e) {
    this.Ho(e);
  }
  s_() {
    this.Xo();
  }
  o_() {
    this.t_();
  }
  __(e) {
    this.r_(e);
  }
  a_(e) {
    this.i_(e);
  }
}
const pn = "WebChannelConnection";
class wb extends vb {
  constructor(e) {
    (super(e),
      (this.u_ = []),
      (this.forceLongPolling = e.forceLongPolling),
      (this.autoDetectLongPolling = e.autoDetectLongPolling),
      (this.useFetchStreams = e.useFetchStreams),
      (this.longPollingOptions = e.longPollingOptions));
  }
  jo(e, t, i, o, a) {
    const u = Wp();
    return new Promise((d, f) => {
      const m = new eE();
      (m.setWithCredentials(!0),
        m.listenOnce(tE.COMPLETE, () => {
          try {
            switch (m.getLastErrorCode()) {
              case Qc.NO_ERROR:
                const w = m.getResponseJson();
                (pe(pn, `XHR for RPC '${e}' ${u} received:`, JSON.stringify(w)),
                  d(w));
                break;
              case Qc.TIMEOUT:
                (pe(pn, `RPC '${e}' ${u} timed out`),
                  f(new ke(ie.DEADLINE_EXCEEDED, "Request time out")));
                break;
              case Qc.HTTP_ERROR:
                const T = m.getStatus();
                if (
                  (pe(
                    pn,
                    `RPC '${e}' ${u} failed with status:`,
                    T,
                    "response text:",
                    m.getResponseText(),
                  ),
                  T > 0)
                ) {
                  let A = m.getResponseJson();
                  Array.isArray(A) && (A = A[0]);
                  const D = A?.error;
                  if (D && D.status && D.message) {
                    const j = (function (X) {
                      const q = X.toLowerCase().replace(/_/g, "-");
                      return Object.values(ie).indexOf(q) >= 0 ? q : ie.UNKNOWN;
                    })(D.status);
                    f(new ke(j, D.message));
                  } else
                    f(
                      new ke(
                        ie.UNKNOWN,
                        "Server responded with status " + m.getStatus(),
                      ),
                    );
                } else f(new ke(ie.UNAVAILABLE, "Connection failed."));
                break;
              default:
                Le(9055, {
                  c_: e,
                  streamId: u,
                  l_: m.getLastErrorCode(),
                  h_: m.getLastError(),
                });
            }
          } finally {
            pe(pn, `RPC '${e}' ${u} completed.`);
          }
        }));
      const v = JSON.stringify(o);
      (pe(pn, `RPC '${e}' ${u} sending request:`, o),
        m.send(t, "POST", v, i, 15));
    });
  }
  P_(e, t, i) {
    const o = Wp(),
      a = [this.$o, "/", "google.firestore.v1.Firestore", "/", e, "/channel"],
      u = iE(),
      d = rE(),
      f = {
        httpSessionIdParam: "gsessionid",
        initMessageHeaders: {},
        messageUrlParams: {
          database: `projects/${this.databaseId.projectId}/databases/${this.databaseId.database}`,
        },
        sendRawJson: !0,
        supportsCrossDomainXhr: !0,
        internalChannelParams: { forwardChannelRequestTimeoutMs: 6e5 },
        forceLongPolling: this.forceLongPolling,
        detectBufferingProxy: this.autoDetectLongPolling,
      },
      m = this.longPollingOptions.timeoutSeconds;
    (m !== void 0 && (f.longPollingTimeout = Math.round(1e3 * m)),
      this.useFetchStreams && (f.useFetchStreams = !0),
      this.zo(f.initMessageHeaders, t, i),
      (f.encodeInitMessageHeaders = !0));
    const v = a.join("");
    pe(pn, `Creating RPC '${e}' stream ${o}: ${v}`, f);
    const w = u.createWebChannel(v, f);
    this.T_(w);
    let T = !1,
      A = !1;
    const D = new _b({
        Ho: (O) => {
          A
            ? pe(pn, `Not sending because RPC '${e}' stream ${o} is closed:`, O)
            : (T ||
                (pe(pn, `Opening RPC '${e}' stream ${o} transport.`),
                w.open(),
                (T = !0)),
              pe(pn, `RPC '${e}' stream ${o} sending:`, O),
              w.send(O));
        },
        Yo: () => w.close(),
      }),
      j = (O, X, q) => {
        O.listen(X, (G) => {
          try {
            q(G);
          } catch (ae) {
            setTimeout(() => {
              throw ae;
            }, 0);
          }
        });
      };
    return (
      j(w, Nl.EventType.OPEN, () => {
        A || (pe(pn, `RPC '${e}' stream ${o} transport opened.`), D.s_());
      }),
      j(w, Nl.EventType.CLOSE, () => {
        A ||
          ((A = !0),
          pe(pn, `RPC '${e}' stream ${o} transport closed`),
          D.__(),
          this.I_(w));
      }),
      j(w, Nl.EventType.ERROR, (O) => {
        A ||
          ((A = !0),
          zs(
            pn,
            `RPC '${e}' stream ${o} transport errored. Name:`,
            O.name,
            "Message:",
            O.message,
          ),
          D.__(new ke(ie.UNAVAILABLE, "The operation could not be completed")));
      }),
      j(w, Nl.EventType.MESSAGE, (O) => {
        var X;
        if (!A) {
          const q = O.data[0];
          at(!!q, 16349);
          const G = q,
            ae =
              G?.error ||
              ((X = G[0]) === null || X === void 0 ? void 0 : X.error);
          if (ae) {
            pe(pn, `RPC '${e}' stream ${o} received error:`, ae);
            const ee = ae.status;
            let he = (function (C) {
                const x = Ut[C];
                if (x !== void 0) return FE(x);
              })(ee),
              S = ae.message;
            (he === void 0 &&
              ((he = ie.INTERNAL),
              (S =
                "Unknown error status: " + ee + " with message " + ae.message)),
              (A = !0),
              D.__(new ke(he, S)),
              w.close());
          } else (pe(pn, `RPC '${e}' stream ${o} received:`, q), D.a_(q));
        }
      }),
      j(d, nE.STAT_EVENT, (O) => {
        O.stat === Np.PROXY
          ? pe(pn, `RPC '${e}' stream ${o} detected buffering proxy`)
          : O.stat === Np.NOPROXY &&
            pe(pn, `RPC '${e}' stream ${o} detected no buffering proxy`);
      }),
      setTimeout(() => {
        D.o_();
      }, 0),
      D
    );
  }
  terminate() {
    (this.u_.forEach((e) => e.close()), (this.u_ = []));
  }
  T_(e) {
    this.u_.push(e);
  }
  I_(e) {
    this.u_ = this.u_.filter((t) => t === e);
  }
}
function ap() {
  return typeof document < "u" ? document : null;
}
function rd(n) {
  return new Ix(n, !0);
}
class JE {
  constructor(e, t, i = 1e3, o = 1.5, a = 6e4) {
    ((this.Fi = e),
      (this.timerId = t),
      (this.d_ = i),
      (this.E_ = o),
      (this.A_ = a),
      (this.R_ = 0),
      (this.V_ = null),
      (this.m_ = Date.now()),
      this.reset());
  }
  reset() {
    this.R_ = 0;
  }
  f_() {
    this.R_ = this.A_;
  }
  g_(e) {
    this.cancel();
    const t = Math.floor(this.R_ + this.p_()),
      i = Math.max(0, Date.now() - this.m_),
      o = Math.max(0, t - i);
    (o > 0 &&
      pe(
        "ExponentialBackoff",
        `Backing off for ${o} ms (base delay: ${this.R_} ms, delay with jitter: ${t} ms, last attempt: ${i} ms ago)`,
      ),
      (this.V_ = this.Fi.enqueueAfterDelay(
        this.timerId,
        o,
        () => ((this.m_ = Date.now()), e()),
      )),
      (this.R_ *= this.E_),
      this.R_ < this.d_ && (this.R_ = this.d_),
      this.R_ > this.A_ && (this.R_ = this.A_));
  }
  y_() {
    this.V_ !== null && (this.V_.skipDelay(), (this.V_ = null));
  }
  cancel() {
    this.V_ !== null && (this.V_.cancel(), (this.V_ = null));
  }
  p_() {
    return (Math.random() - 0.5) * this.R_;
  }
}
const u0 = "PersistentStream";
class ZE {
  constructor(e, t, i, o, a, u, d, f) {
    ((this.Fi = e),
      (this.w_ = i),
      (this.S_ = o),
      (this.connection = a),
      (this.authCredentialsProvider = u),
      (this.appCheckCredentialsProvider = d),
      (this.listener = f),
      (this.state = 0),
      (this.b_ = 0),
      (this.D_ = null),
      (this.v_ = null),
      (this.stream = null),
      (this.C_ = 0),
      (this.F_ = new JE(e, t)));
  }
  M_() {
    return this.state === 1 || this.state === 5 || this.x_();
  }
  x_() {
    return this.state === 2 || this.state === 3;
  }
  start() {
    ((this.C_ = 0), this.state !== 4 ? this.auth() : this.O_());
  }
  async stop() {
    this.M_() && (await this.close(0));
  }
  N_() {
    ((this.state = 0), this.F_.reset());
  }
  B_() {
    this.x_() &&
      this.D_ === null &&
      (this.D_ = this.Fi.enqueueAfterDelay(this.w_, 6e4, () => this.L_()));
  }
  k_(e) {
    (this.q_(), this.stream.send(e));
  }
  async L_() {
    if (this.x_()) return this.close(0);
  }
  q_() {
    this.D_ && (this.D_.cancel(), (this.D_ = null));
  }
  Q_() {
    this.v_ && (this.v_.cancel(), (this.v_ = null));
  }
  async close(e, t) {
    (this.q_(),
      this.Q_(),
      this.F_.cancel(),
      this.b_++,
      e !== 4
        ? this.F_.reset()
        : t && t.code === ie.RESOURCE_EXHAUSTED
          ? (ji(t.toString()),
            ji(
              "Using maximum backoff delay to prevent overloading the backend.",
            ),
            this.F_.f_())
          : t &&
            t.code === ie.UNAUTHENTICATED &&
            this.state !== 3 &&
            (this.authCredentialsProvider.invalidateToken(),
            this.appCheckCredentialsProvider.invalidateToken()),
      this.stream !== null &&
        (this.U_(), this.stream.close(), (this.stream = null)),
      (this.state = e),
      await this.listener.n_(t));
  }
  U_() {}
  auth() {
    this.state = 1;
    const e = this.K_(this.b_),
      t = this.b_;
    Promise.all([
      this.authCredentialsProvider.getToken(),
      this.appCheckCredentialsProvider.getToken(),
    ]).then(
      ([i, o]) => {
        this.b_ === t && this.W_(i, o);
      },
      (i) => {
        e(() => {
          const o = new ke(
            ie.UNKNOWN,
            "Fetching auth token failed: " + i.message,
          );
          return this.G_(o);
        });
      },
    );
  }
  W_(e, t) {
    const i = this.K_(this.b_);
    ((this.stream = this.z_(e, t)),
      this.stream.Zo(() => {
        i(() => this.listener.Zo());
      }),
      this.stream.e_(() => {
        i(
          () => (
            (this.state = 2),
            (this.v_ = this.Fi.enqueueAfterDelay(
              this.S_,
              1e4,
              () => (this.x_() && (this.state = 3), Promise.resolve()),
            )),
            this.listener.e_()
          ),
        );
      }),
      this.stream.n_((o) => {
        i(() => this.G_(o));
      }),
      this.stream.onMessage((o) => {
        i(() => (++this.C_ == 1 ? this.j_(o) : this.onNext(o)));
      }));
  }
  O_() {
    ((this.state = 5),
      this.F_.g_(async () => {
        ((this.state = 0), this.start());
      }));
  }
  G_(e) {
    return (
      pe(u0, `close with error: ${e}`),
      (this.stream = null),
      this.close(4, e)
    );
  }
  K_(e) {
    return (t) => {
      this.Fi.enqueueAndForget(() =>
        this.b_ === e
          ? t()
          : (pe(u0, "stream callback skipped by getCloseGuardedDispatcher."),
            Promise.resolve()),
      );
    };
  }
}
class Eb extends ZE {
  constructor(e, t, i, o, a, u) {
    (super(
      e,
      "listen_stream_connection_backoff",
      "listen_stream_idle",
      "health_check_timeout",
      t,
      i,
      o,
      u,
    ),
      (this.serializer = a));
  }
  z_(e, t) {
    return this.connection.P_("Listen", e, t);
  }
  j_(e) {
    return this.onNext(e);
  }
  onNext(e) {
    this.F_.reset();
    const t = Cx(this.serializer, e),
      i = (function (a) {
        if (!("targetChange" in a)) return ze.min();
        const u = a.targetChange;
        return u.targetIds && u.targetIds.length
          ? ze.min()
          : u.readTime
            ? ei(u.readTime)
            : ze.min();
      })(e);
    return this.listener.J_(t, i);
  }
  H_(e) {
    const t = {};
    ((t.database = $p(this.serializer)),
      (t.addTarget = (function (a, u) {
        let d;
        const f = u.target;
        if (
          ((d = Fp(f) ? { documents: xx(a, f) } : { query: bx(a, f).Vt }),
          (d.targetId = u.targetId),
          u.resumeToken.approximateByteSize() > 0)
        ) {
          d.resumeToken = jE(a, u.resumeToken);
          const m = zp(a, u.expectedCount);
          m !== null && (d.expectedCount = m);
        } else if (u.snapshotVersion.compareTo(ze.min()) > 0) {
          d.readTime = Ih(a, u.snapshotVersion.toTimestamp());
          const m = zp(a, u.expectedCount);
          m !== null && (d.expectedCount = m);
        }
        return d;
      })(this.serializer, e)));
    const i = Nx(this.serializer, e);
    (i && (t.labels = i), this.k_(t));
  }
  Y_(e) {
    const t = {};
    ((t.database = $p(this.serializer)), (t.removeTarget = e), this.k_(t));
  }
}
class Tb extends ZE {
  constructor(e, t, i, o, a, u) {
    (super(
      e,
      "write_stream_connection_backoff",
      "write_stream_idle",
      "health_check_timeout",
      t,
      i,
      o,
      u,
    ),
      (this.serializer = a));
  }
  get Z_() {
    return this.C_ > 0;
  }
  start() {
    ((this.lastStreamToken = void 0), super.start());
  }
  U_() {
    this.Z_ && this.X_([]);
  }
  z_(e, t) {
    return this.connection.P_("Write", e, t);
  }
  j_(e) {
    return (
      at(!!e.streamToken, 31322),
      (this.lastStreamToken = e.streamToken),
      at(!e.writeResults || e.writeResults.length === 0, 55816),
      this.listener.ea()
    );
  }
  onNext(e) {
    (at(!!e.streamToken, 12678),
      (this.lastStreamToken = e.streamToken),
      this.F_.reset());
    const t = kx(e.writeResults, e.commitTime),
      i = ei(e.commitTime);
    return this.listener.ta(i, t);
  }
  na() {
    const e = {};
    ((e.database = $p(this.serializer)), this.k_(e));
  }
  X_(e) {
    const t = {
      streamToken: this.lastStreamToken,
      writes: e.map((i) => Px(this.serializer, i)),
    };
    this.k_(t);
  }
}
class Sb {}
class Ib extends Sb {
  constructor(e, t, i, o) {
    (super(),
      (this.authCredentials = e),
      (this.appCheckCredentials = t),
      (this.connection = i),
      (this.serializer = o),
      (this.ra = !1));
  }
  ia() {
    if (this.ra)
      throw new ke(
        ie.FAILED_PRECONDITION,
        "The client has already been terminated.",
      );
  }
  Wo(e, t, i, o) {
    return (
      this.ia(),
      Promise.all([
        this.authCredentials.getToken(),
        this.appCheckCredentials.getToken(),
      ])
        .then(([a, u]) => this.connection.Wo(e, jp(t, i), o, a, u))
        .catch((a) => {
          throw a.name === "FirebaseError"
            ? (a.code === ie.UNAUTHENTICATED &&
                (this.authCredentials.invalidateToken(),
                this.appCheckCredentials.invalidateToken()),
              a)
            : new ke(ie.UNKNOWN, a.toString());
        })
    );
  }
  Jo(e, t, i, o, a) {
    return (
      this.ia(),
      Promise.all([
        this.authCredentials.getToken(),
        this.appCheckCredentials.getToken(),
      ])
        .then(([u, d]) => this.connection.Jo(e, jp(t, i), o, u, d, a))
        .catch((u) => {
          throw u.name === "FirebaseError"
            ? (u.code === ie.UNAUTHENTICATED &&
                (this.authCredentials.invalidateToken(),
                this.appCheckCredentials.invalidateToken()),
              u)
            : new ke(ie.UNKNOWN, u.toString());
        })
    );
  }
  terminate() {
    ((this.ra = !0), this.connection.terminate());
  }
}
class Rb {
  constructor(e, t) {
    ((this.asyncQueue = e),
      (this.onlineStateHandler = t),
      (this.state = "Unknown"),
      (this.sa = 0),
      (this.oa = null),
      (this._a = !0));
  }
  aa() {
    this.sa === 0 &&
      (this.ua("Unknown"),
      (this.oa = this.asyncQueue.enqueueAfterDelay(
        "online_state_timeout",
        1e4,
        () => (
          (this.oa = null),
          this.ca("Backend didn't respond within 10 seconds."),
          this.ua("Offline"),
          Promise.resolve()
        ),
      )));
  }
  la(e) {
    this.state === "Online"
      ? this.ua("Unknown")
      : (this.sa++,
        this.sa >= 1 &&
          (this.ha(),
          this.ca(
            `Connection failed 1 times. Most recent error: ${e.toString()}`,
          ),
          this.ua("Offline")));
  }
  set(e) {
    (this.ha(), (this.sa = 0), e === "Online" && (this._a = !1), this.ua(e));
  }
  ua(e) {
    e !== this.state && ((this.state = e), this.onlineStateHandler(e));
  }
  ca(e) {
    const t = `Could not reach Cloud Firestore backend. ${e}
This typically indicates that your device does not have a healthy Internet connection at the moment. The client will operate in offline mode until it is able to successfully connect to the backend.`;
    this._a ? (ji(t), (this._a = !1)) : pe("OnlineStateTracker", t);
  }
  ha() {
    this.oa !== null && (this.oa.cancel(), (this.oa = null));
  }
}
const xo = "RemoteStore";
class Ab {
  constructor(e, t, i, o, a) {
    ((this.localStore = e),
      (this.datastore = t),
      (this.asyncQueue = i),
      (this.remoteSyncer = {}),
      (this.Pa = []),
      (this.Ta = new Map()),
      (this.Ia = new Set()),
      (this.da = []),
      (this.Ea = a),
      this.Ea.xo((u) => {
        i.enqueueAndForget(async () => {
          Mo(this) &&
            (pe(xo, "Restarting streams for network reachability change."),
            await (async function (f) {
              const m = je(f);
              (m.Ia.add(4),
                await _u(m),
                m.Aa.set("Unknown"),
                m.Ia.delete(4),
                await id(m));
            })(this));
        });
      }),
      (this.Aa = new Rb(i, o)));
  }
}
async function id(n) {
  if (Mo(n)) for (const e of n.da) await e(!0);
}
async function _u(n) {
  for (const e of n.da) await e(!1);
}
function eT(n, e) {
  const t = je(n);
  t.Ta.has(e.targetId) ||
    (t.Ta.set(e.targetId, e), jm(t) ? zm(t) : qa(t).x_() && Um(t, e));
}
function Fm(n, e) {
  const t = je(n),
    i = qa(t);
  (t.Ta.delete(e),
    i.x_() && tT(t, e),
    t.Ta.size === 0 && (i.x_() ? i.B_() : Mo(t) && t.Aa.set("Unknown")));
}
function Um(n, e) {
  if (
    (n.Ra.$e(e.targetId),
    e.resumeToken.approximateByteSize() > 0 ||
      e.snapshotVersion.compareTo(ze.min()) > 0)
  ) {
    const t = n.remoteSyncer.getRemoteKeysForTarget(e.targetId).size;
    e = e.withExpectedCount(t);
  }
  qa(n).H_(e);
}
function tT(n, e) {
  (n.Ra.$e(e), qa(n).Y_(e));
}
function zm(n) {
  ((n.Ra = new wx({
    getRemoteKeysForTarget: (e) => n.remoteSyncer.getRemoteKeysForTarget(e),
    Et: (e) => n.Ta.get(e) || null,
    lt: () => n.datastore.serializer.databaseId,
  })),
    qa(n).start(),
    n.Aa.aa());
}
function jm(n) {
  return Mo(n) && !qa(n).M_() && n.Ta.size > 0;
}
function Mo(n) {
  return je(n).Ia.size === 0;
}
function nT(n) {
  n.Ra = void 0;
}
async function Cb(n) {
  n.Aa.set("Online");
}
async function Pb(n) {
  n.Ta.forEach((e, t) => {
    Um(n, e);
  });
}
async function kb(n, e) {
  (nT(n), jm(n) ? (n.Aa.la(e), zm(n)) : n.Aa.set("Unknown"));
}
async function xb(n, e, t) {
  if ((n.Aa.set("Online"), e instanceof zE && e.state === 2 && e.cause))
    try {
      await (async function (o, a) {
        const u = a.cause;
        for (const d of a.targetIds)
          o.Ta.has(d) &&
            (await o.remoteSyncer.rejectListen(d, u),
            o.Ta.delete(d),
            o.Ra.removeTarget(d));
      })(n, e);
    } catch (i) {
      (pe(xo, "Failed to remove targets %s: %s ", e.targetIds.join(","), i),
        await Ah(n, i));
    }
  else if (
    (e instanceof Zc ? n.Ra.Ye(e) : e instanceof UE ? n.Ra.it(e) : n.Ra.et(e),
    !t.isEqual(ze.min()))
  )
    try {
      const i = await XE(n.localStore);
      t.compareTo(i) >= 0 &&
        (await (function (a, u) {
          const d = a.Ra.Pt(u);
          return (
            d.targetChanges.forEach((f, m) => {
              if (f.resumeToken.approximateByteSize() > 0) {
                const v = a.Ta.get(m);
                v && a.Ta.set(m, v.withResumeToken(f.resumeToken, u));
              }
            }),
            d.targetMismatches.forEach((f, m) => {
              const v = a.Ta.get(f);
              if (!v) return;
              (a.Ta.set(
                f,
                v.withResumeToken(ln.EMPTY_BYTE_STRING, v.snapshotVersion),
              ),
                tT(a, f));
              const w = new Ns(v.target, f, m, v.sequenceNumber);
              Um(a, w);
            }),
            a.remoteSyncer.applyRemoteEvent(d)
          );
        })(n, t));
    } catch (i) {
      (pe(xo, "Failed to raise snapshot:", i), await Ah(n, i));
    }
}
async function Ah(n, e, t) {
  if (!Wa(e)) throw e;
  (n.Ia.add(1),
    await _u(n),
    n.Aa.set("Offline"),
    t || (t = () => XE(n.localStore)),
    n.asyncQueue.enqueueRetryable(async () => {
      (pe(xo, "Retrying IndexedDB access"),
        await t(),
        n.Ia.delete(1),
        await id(n));
    }));
}
function rT(n, e) {
  return e().catch((t) => Ah(n, t, e));
}
async function sd(n) {
  const e = je(n),
    t = Ws(e);
  let i = e.Pa.length > 0 ? e.Pa[e.Pa.length - 1].batchId : Im;
  for (; bb(e); )
    try {
      const o = await db(e.localStore, i);
      if (o === null) {
        e.Pa.length === 0 && t.B_();
        break;
      }
      ((i = o.batchId), Db(e, o));
    } catch (o) {
      await Ah(e, o);
    }
  iT(e) && sT(e);
}
function bb(n) {
  return Mo(n) && n.Pa.length < 10;
}
function Db(n, e) {
  n.Pa.push(e);
  const t = Ws(n);
  t.x_() && t.Z_ && t.X_(e.mutations);
}
function iT(n) {
  return Mo(n) && !Ws(n).M_() && n.Pa.length > 0;
}
function sT(n) {
  Ws(n).start();
}
async function Nb(n) {
  Ws(n).na();
}
async function Ob(n) {
  const e = Ws(n);
  for (const t of n.Pa) e.X_(t.mutations);
}
async function Lb(n, e, t) {
  const i = n.Pa.shift(),
    o = bm.from(i, e, t);
  (await rT(n, () => n.remoteSyncer.applySuccessfulWrite(o)), await sd(n));
}
async function Mb(n, e) {
  (e &&
    Ws(n).Z_ &&
    (await (async function (i, o) {
      if (
        (function (u) {
          return vx(u) && u !== ie.ABORTED;
        })(o.code)
      ) {
        const a = i.Pa.shift();
        (Ws(i).N_(),
          await rT(i, () => i.remoteSyncer.rejectFailedWrite(a.batchId, o)),
          await sd(i));
      }
    })(n, e)),
    iT(n) && sT(n));
}
async function c0(n, e) {
  const t = je(n);
  (t.asyncQueue.verifyOperationInProgress(),
    pe(xo, "RemoteStore received new credentials"));
  const i = Mo(t);
  (t.Ia.add(3),
    await _u(t),
    i && t.Aa.set("Unknown"),
    await t.remoteSyncer.handleCredentialChange(e),
    t.Ia.delete(3),
    await id(t));
}
async function Vb(n, e) {
  const t = je(n);
  e
    ? (t.Ia.delete(2), await id(t))
    : e || (t.Ia.add(2), await _u(t), t.Aa.set("Unknown"));
}
function qa(n) {
  return (
    n.Va ||
      ((n.Va = (function (t, i, o) {
        const a = je(t);
        return (
          a.ia(),
          new Eb(
            i,
            a.connection,
            a.authCredentials,
            a.appCheckCredentials,
            a.serializer,
            o,
          )
        );
      })(n.datastore, n.asyncQueue, {
        Zo: Cb.bind(null, n),
        e_: Pb.bind(null, n),
        n_: kb.bind(null, n),
        J_: xb.bind(null, n),
      })),
      n.da.push(async (e) => {
        e
          ? (n.Va.N_(), jm(n) ? zm(n) : n.Aa.set("Unknown"))
          : (await n.Va.stop(), nT(n));
      })),
    n.Va
  );
}
function Ws(n) {
  return (
    n.ma ||
      ((n.ma = (function (t, i, o) {
        const a = je(t);
        return (
          a.ia(),
          new Tb(
            i,
            a.connection,
            a.authCredentials,
            a.appCheckCredentials,
            a.serializer,
            o,
          )
        );
      })(n.datastore, n.asyncQueue, {
        Zo: () => Promise.resolve(),
        e_: Nb.bind(null, n),
        n_: Mb.bind(null, n),
        ea: Ob.bind(null, n),
        ta: Lb.bind(null, n),
      })),
      n.da.push(async (e) => {
        e
          ? (n.ma.N_(), await sd(n))
          : (await n.ma.stop(),
            n.Pa.length > 0 &&
              (pe(
                xo,
                `Stopping write stream with ${n.Pa.length} pending writes`,
              ),
              (n.Pa = [])));
      })),
    n.ma
  );
}
class Bm {
  constructor(e, t, i, o, a) {
    ((this.asyncQueue = e),
      (this.timerId = t),
      (this.targetTimeMs = i),
      (this.op = o),
      (this.removalCallback = a),
      (this.deferred = new Fs()),
      (this.then = this.deferred.promise.then.bind(this.deferred.promise)),
      this.deferred.promise.catch((u) => {}));
  }
  get promise() {
    return this.deferred.promise;
  }
  static createAndSchedule(e, t, i, o, a) {
    const u = Date.now() + i,
      d = new Bm(e, t, u, o, a);
    return (d.start(i), d);
  }
  start(e) {
    this.timerHandle = setTimeout(() => this.handleDelayElapsed(), e);
  }
  skipDelay() {
    return this.handleDelayElapsed();
  }
  cancel(e) {
    this.timerHandle !== null &&
      (this.clearTimeout(),
      this.deferred.reject(
        new ke(ie.CANCELLED, "Operation cancelled" + (e ? ": " + e : "")),
      ));
  }
  handleDelayElapsed() {
    this.asyncQueue.enqueueAndForget(() =>
      this.timerHandle !== null
        ? (this.clearTimeout(), this.op().then((e) => this.deferred.resolve(e)))
        : Promise.resolve(),
    );
  }
  clearTimeout() {
    this.timerHandle !== null &&
      (this.removalCallback(this),
      clearTimeout(this.timerHandle),
      (this.timerHandle = null));
  }
}
function $m(n, e) {
  if ((ji("AsyncQueue", `${e}: ${n}`), Wa(n)))
    return new ke(ie.UNAVAILABLE, `${e}: ${n}`);
  throw n;
}
class Ca {
  static emptySet(e) {
    return new Ca(e.comparator);
  }
  constructor(e) {
    ((this.comparator = e
      ? (t, i) => e(t, i) || De.comparator(t.key, i.key)
      : (t, i) => De.comparator(t.key, i.key)),
      (this.keyedMap = Ol()),
      (this.sortedSet = new xt(this.comparator)));
  }
  has(e) {
    return this.keyedMap.get(e) != null;
  }
  get(e) {
    return this.keyedMap.get(e);
  }
  first() {
    return this.sortedSet.minKey();
  }
  last() {
    return this.sortedSet.maxKey();
  }
  isEmpty() {
    return this.sortedSet.isEmpty();
  }
  indexOf(e) {
    const t = this.keyedMap.get(e);
    return t ? this.sortedSet.indexOf(t) : -1;
  }
  get size() {
    return this.sortedSet.size;
  }
  forEach(e) {
    this.sortedSet.inorderTraversal((t, i) => (e(t), !1));
  }
  add(e) {
    const t = this.delete(e.key);
    return t.copy(t.keyedMap.insert(e.key, e), t.sortedSet.insert(e, null));
  }
  delete(e) {
    const t = this.get(e);
    return t
      ? this.copy(this.keyedMap.remove(e), this.sortedSet.remove(t))
      : this;
  }
  isEqual(e) {
    if (!(e instanceof Ca) || this.size !== e.size) return !1;
    const t = this.sortedSet.getIterator(),
      i = e.sortedSet.getIterator();
    for (; t.hasNext(); ) {
      const o = t.getNext().key,
        a = i.getNext().key;
      if (!o.isEqual(a)) return !1;
    }
    return !0;
  }
  toString() {
    const e = [];
    return (
      this.forEach((t) => {
        e.push(t.toString());
      }),
      e.length === 0
        ? "DocumentSet ()"
        : `DocumentSet (
  ` +
          e.join(`  
`) +
          `
)`
    );
  }
  copy(e, t) {
    const i = new Ca();
    return (
      (i.comparator = this.comparator),
      (i.keyedMap = e),
      (i.sortedSet = t),
      i
    );
  }
}
class h0 {
  constructor() {
    this.fa = new xt(De.comparator);
  }
  track(e) {
    const t = e.doc.key,
      i = this.fa.get(t);
    i
      ? e.type !== 0 && i.type === 3
        ? (this.fa = this.fa.insert(t, e))
        : e.type === 3 && i.type !== 1
          ? (this.fa = this.fa.insert(t, { type: i.type, doc: e.doc }))
          : e.type === 2 && i.type === 2
            ? (this.fa = this.fa.insert(t, { type: 2, doc: e.doc }))
            : e.type === 2 && i.type === 0
              ? (this.fa = this.fa.insert(t, { type: 0, doc: e.doc }))
              : e.type === 1 && i.type === 0
                ? (this.fa = this.fa.remove(t))
                : e.type === 1 && i.type === 2
                  ? (this.fa = this.fa.insert(t, { type: 1, doc: i.doc }))
                  : e.type === 0 && i.type === 1
                    ? (this.fa = this.fa.insert(t, { type: 2, doc: e.doc }))
                    : Le(63341, { At: e, ga: i })
      : (this.fa = this.fa.insert(t, e));
  }
  pa() {
    const e = [];
    return (
      this.fa.inorderTraversal((t, i) => {
        e.push(i);
      }),
      e
    );
  }
}
class Fa {
  constructor(e, t, i, o, a, u, d, f, m) {
    ((this.query = e),
      (this.docs = t),
      (this.oldDocs = i),
      (this.docChanges = o),
      (this.mutatedKeys = a),
      (this.fromCache = u),
      (this.syncStateChanged = d),
      (this.excludesMetadataChanges = f),
      (this.hasCachedResults = m));
  }
  static fromInitialDocuments(e, t, i, o, a) {
    const u = [];
    return (
      t.forEach((d) => {
        u.push({ type: 0, doc: d });
      }),
      new Fa(e, t, Ca.emptySet(t), u, i, o, !0, !1, a)
    );
  }
  get hasPendingWrites() {
    return !this.mutatedKeys.isEmpty();
  }
  isEqual(e) {
    if (
      !(
        this.fromCache === e.fromCache &&
        this.hasCachedResults === e.hasCachedResults &&
        this.syncStateChanged === e.syncStateChanged &&
        this.mutatedKeys.isEqual(e.mutatedKeys) &&
        Jh(this.query, e.query) &&
        this.docs.isEqual(e.docs) &&
        this.oldDocs.isEqual(e.oldDocs)
      )
    )
      return !1;
    const t = this.docChanges,
      i = e.docChanges;
    if (t.length !== i.length) return !1;
    for (let o = 0; o < t.length; o++)
      if (t[o].type !== i[o].type || !t[o].doc.isEqual(i[o].doc)) return !1;
    return !0;
  }
}
class Fb {
  constructor() {
    ((this.ya = void 0), (this.wa = []));
  }
  Sa() {
    return this.wa.some((e) => e.ba());
  }
}
class Ub {
  constructor() {
    ((this.queries = d0()),
      (this.onlineState = "Unknown"),
      (this.Da = new Set()));
  }
  terminate() {
    (function (t, i) {
      const o = je(t),
        a = o.queries;
      ((o.queries = d0()),
        a.forEach((u, d) => {
          for (const f of d.wa) f.onError(i);
        }));
    })(this, new ke(ie.ABORTED, "Firestore shutting down"));
  }
}
function d0() {
  return new Oo((n) => RE(n), Jh);
}
async function zb(n, e) {
  const t = je(n);
  let i = 3;
  const o = e.query;
  let a = t.queries.get(o);
  a ? !a.Sa() && e.ba() && (i = 2) : ((a = new Fb()), (i = e.ba() ? 0 : 1));
  try {
    switch (i) {
      case 0:
        a.ya = await t.onListen(o, !0);
        break;
      case 1:
        a.ya = await t.onListen(o, !1);
        break;
      case 2:
        await t.onFirstRemoteStoreListen(o);
    }
  } catch (u) {
    const d = $m(u, `Initialization of query '${Ea(e.query)}' failed`);
    return void e.onError(d);
  }
  (t.queries.set(o, a),
    a.wa.push(e),
    e.va(t.onlineState),
    a.ya && e.Ca(a.ya) && Hm(t));
}
async function jb(n, e) {
  const t = je(n),
    i = e.query;
  let o = 3;
  const a = t.queries.get(i);
  if (a) {
    const u = a.wa.indexOf(e);
    u >= 0 &&
      (a.wa.splice(u, 1),
      a.wa.length === 0 ? (o = e.ba() ? 0 : 1) : !a.Sa() && e.ba() && (o = 2));
  }
  switch (o) {
    case 0:
      return (t.queries.delete(i), t.onUnlisten(i, !0));
    case 1:
      return (t.queries.delete(i), t.onUnlisten(i, !1));
    case 2:
      return t.onLastRemoteStoreUnlisten(i);
    default:
      return;
  }
}
function Bb(n, e) {
  const t = je(n);
  let i = !1;
  for (const o of e) {
    const a = o.query,
      u = t.queries.get(a);
    if (u) {
      for (const d of u.wa) d.Ca(o) && (i = !0);
      u.ya = o;
    }
  }
  i && Hm(t);
}
function $b(n, e, t) {
  const i = je(n),
    o = i.queries.get(e);
  if (o) for (const a of o.wa) a.onError(t);
  i.queries.delete(e);
}
function Hm(n) {
  n.Da.forEach((e) => {
    e.next();
  });
}
var qp, f0;
(((f0 = qp || (qp = {})).Fa = "default"), (f0.Cache = "cache"));
class Hb {
  constructor(e, t, i) {
    ((this.query = e),
      (this.Ma = t),
      (this.xa = !1),
      (this.Oa = null),
      (this.onlineState = "Unknown"),
      (this.options = i || {}));
  }
  Ca(e) {
    if (!this.options.includeMetadataChanges) {
      const i = [];
      for (const o of e.docChanges) o.type !== 3 && i.push(o);
      e = new Fa(
        e.query,
        e.docs,
        e.oldDocs,
        i,
        e.mutatedKeys,
        e.fromCache,
        e.syncStateChanged,
        !0,
        e.hasCachedResults,
      );
    }
    let t = !1;
    return (
      this.xa
        ? this.Na(e) && (this.Ma.next(e), (t = !0))
        : this.Ba(e, this.onlineState) && (this.La(e), (t = !0)),
      (this.Oa = e),
      t
    );
  }
  onError(e) {
    this.Ma.error(e);
  }
  va(e) {
    this.onlineState = e;
    let t = !1;
    return (
      this.Oa &&
        !this.xa &&
        this.Ba(this.Oa, e) &&
        (this.La(this.Oa), (t = !0)),
      t
    );
  }
  Ba(e, t) {
    if (!e.fromCache || !this.ba()) return !0;
    const i = t !== "Offline";
    return (
      (!this.options.ka || !i) &&
      (!e.docs.isEmpty() || e.hasCachedResults || t === "Offline")
    );
  }
  Na(e) {
    if (e.docChanges.length > 0) return !0;
    const t = this.Oa && this.Oa.hasPendingWrites !== e.hasPendingWrites;
    return (
      !(!e.syncStateChanged && !t) && this.options.includeMetadataChanges === !0
    );
  }
  La(e) {
    ((e = Fa.fromInitialDocuments(
      e.query,
      e.docs,
      e.mutatedKeys,
      e.fromCache,
      e.hasCachedResults,
    )),
      (this.xa = !0),
      this.Ma.next(e));
  }
  ba() {
    return this.options.source !== qp.Cache;
  }
}
class oT {
  constructor(e) {
    this.key = e;
  }
}
class aT {
  constructor(e) {
    this.key = e;
  }
}
class Wb {
  constructor(e, t) {
    ((this.query = e),
      (this.Ha = t),
      (this.Ya = null),
      (this.hasCachedResults = !1),
      (this.current = !1),
      (this.Za = Ye()),
      (this.mutatedKeys = Ye()),
      (this.Xa = AE(e)),
      (this.eu = new Ca(this.Xa)));
  }
  get tu() {
    return this.Ha;
  }
  nu(e, t) {
    const i = t ? t.ru : new h0(),
      o = t ? t.eu : this.eu;
    let a = t ? t.mutatedKeys : this.mutatedKeys,
      u = o,
      d = !1;
    const f =
        this.query.limitType === "F" && o.size === this.query.limit
          ? o.last()
          : null,
      m =
        this.query.limitType === "L" && o.size === this.query.limit
          ? o.first()
          : null;
    if (
      (e.inorderTraversal((v, w) => {
        const T = o.get(v),
          A = Zh(this.query, w) ? w : null,
          D = !!T && this.mutatedKeys.has(T.key),
          j =
            !!A &&
            (A.hasLocalMutations ||
              (this.mutatedKeys.has(A.key) && A.hasCommittedMutations));
        let O = !1;
        (T && A
          ? T.data.isEqual(A.data)
            ? D !== j && (i.track({ type: 3, doc: A }), (O = !0))
            : this.iu(T, A) ||
              (i.track({ type: 2, doc: A }),
              (O = !0),
              ((f && this.Xa(A, f) > 0) || (m && this.Xa(A, m) < 0)) &&
                (d = !0))
          : !T && A
            ? (i.track({ type: 0, doc: A }), (O = !0))
            : T &&
              !A &&
              (i.track({ type: 1, doc: T }), (O = !0), (f || m) && (d = !0)),
          O &&
            (A
              ? ((u = u.add(A)), (a = j ? a.add(v) : a.delete(v)))
              : ((u = u.delete(v)), (a = a.delete(v)))));
      }),
      this.query.limit !== null)
    )
      for (; u.size > this.query.limit; ) {
        const v = this.query.limitType === "F" ? u.last() : u.first();
        ((u = u.delete(v.key)),
          (a = a.delete(v.key)),
          i.track({ type: 1, doc: v }));
      }
    return { eu: u, ru: i, Ds: d, mutatedKeys: a };
  }
  iu(e, t) {
    return (
      e.hasLocalMutations && t.hasCommittedMutations && !t.hasLocalMutations
    );
  }
  applyChanges(e, t, i, o) {
    const a = this.eu;
    ((this.eu = e.eu), (this.mutatedKeys = e.mutatedKeys));
    const u = e.ru.pa();
    (u.sort(
      (v, w) =>
        (function (A, D) {
          const j = (O) => {
            switch (O) {
              case 0:
                return 1;
              case 2:
              case 3:
                return 2;
              case 1:
                return 0;
              default:
                return Le(20277, { At: O });
            }
          };
          return j(A) - j(D);
        })(v.type, w.type) || this.Xa(v.doc, w.doc),
    ),
      this.su(i),
      (o = o != null && o));
    const d = t && !o ? this.ou() : [],
      f = this.Za.size === 0 && this.current && !o ? 1 : 0,
      m = f !== this.Ya;
    return (
      (this.Ya = f),
      u.length !== 0 || m
        ? {
            snapshot: new Fa(
              this.query,
              e.eu,
              a,
              u,
              e.mutatedKeys,
              f === 0,
              m,
              !1,
              !!i && i.resumeToken.approximateByteSize() > 0,
            ),
            _u: d,
          }
        : { _u: d }
    );
  }
  va(e) {
    return this.current && e === "Offline"
      ? ((this.current = !1),
        this.applyChanges(
          { eu: this.eu, ru: new h0(), mutatedKeys: this.mutatedKeys, Ds: !1 },
          !1,
        ))
      : { _u: [] };
  }
  au(e) {
    return (
      !this.Ha.has(e) && !!this.eu.has(e) && !this.eu.get(e).hasLocalMutations
    );
  }
  su(e) {
    e &&
      (e.addedDocuments.forEach((t) => (this.Ha = this.Ha.add(t))),
      e.modifiedDocuments.forEach((t) => {}),
      e.removedDocuments.forEach((t) => (this.Ha = this.Ha.delete(t))),
      (this.current = e.current));
  }
  ou() {
    if (!this.current) return [];
    const e = this.Za;
    ((this.Za = Ye()),
      this.eu.forEach((i) => {
        this.au(i.key) && (this.Za = this.Za.add(i.key));
      }));
    const t = [];
    return (
      e.forEach((i) => {
        this.Za.has(i) || t.push(new aT(i));
      }),
      this.Za.forEach((i) => {
        e.has(i) || t.push(new oT(i));
      }),
      t
    );
  }
  uu(e) {
    ((this.Ha = e.qs), (this.Za = Ye()));
    const t = this.nu(e.documents);
    return this.applyChanges(t, !0);
  }
  cu() {
    return Fa.fromInitialDocuments(
      this.query,
      this.eu,
      this.mutatedKeys,
      this.Ya === 0,
      this.hasCachedResults,
    );
  }
}
const Wm = "SyncEngine";
class qb {
  constructor(e, t, i) {
    ((this.query = e), (this.targetId = t), (this.view = i));
  }
}
class Kb {
  constructor(e) {
    ((this.key = e), (this.lu = !1));
  }
}
class Gb {
  constructor(e, t, i, o, a, u) {
    ((this.localStore = e),
      (this.remoteStore = t),
      (this.eventManager = i),
      (this.sharedClientState = o),
      (this.currentUser = a),
      (this.maxConcurrentLimboResolutions = u),
      (this.hu = {}),
      (this.Pu = new Oo((d) => RE(d), Jh)),
      (this.Tu = new Map()),
      (this.Iu = new Set()),
      (this.du = new xt(De.comparator)),
      (this.Eu = new Map()),
      (this.Au = new Om()),
      (this.Ru = {}),
      (this.Vu = new Map()),
      (this.mu = Va.ur()),
      (this.onlineState = "Unknown"),
      (this.fu = void 0));
  }
  get isPrimaryClient() {
    return this.fu === !0;
  }
}
async function Qb(n, e, t = !0) {
  const i = fT(n);
  let o;
  const a = i.Pu.get(e);
  return (
    a
      ? (i.sharedClientState.addLocalQueryTarget(a.targetId), (o = a.view.cu()))
      : (o = await lT(i, e, t, !0)),
    o
  );
}
async function Yb(n, e) {
  const t = fT(n);
  await lT(t, e, !0, !1);
}
async function lT(n, e, t, i) {
  const o = await fb(n.localStore, Zr(e)),
    a = o.targetId,
    u = n.sharedClientState.addLocalQueryTarget(a, t);
  let d;
  return (
    i && (d = await Xb(n, e, a, u === "current", o.resumeToken)),
    n.isPrimaryClient && t && eT(n.remoteStore, o),
    d
  );
}
async function Xb(n, e, t, i, o) {
  n.gu = (w, T, A) =>
    (async function (j, O, X, q) {
      let G = O.view.nu(X);
      G.Ds &&
        (G = await s0(j.localStore, O.query, !1).then(({ documents: S }) =>
          O.view.nu(S, G),
        ));
      const ae = q && q.targetChanges.get(O.targetId),
        ee = q && q.targetMismatches.get(O.targetId) != null,
        he = O.view.applyChanges(G, j.isPrimaryClient, ae, ee);
      return (m0(j, O.targetId, he._u), he.snapshot);
    })(n, w, T, A);
  const a = await s0(n.localStore, e, !0),
    u = new Wb(e, a.qs),
    d = u.nu(a.documents),
    f = vu.createSynthesizedTargetChangeForCurrentChange(
      t,
      i && n.onlineState !== "Offline",
      o,
    ),
    m = u.applyChanges(d, n.isPrimaryClient, f);
  m0(n, t, m._u);
  const v = new qb(e, t, u);
  return (
    n.Pu.set(e, v),
    n.Tu.has(t) ? n.Tu.get(t).push(e) : n.Tu.set(t, [e]),
    m.snapshot
  );
}
async function Jb(n, e, t) {
  const i = je(n),
    o = i.Pu.get(e),
    a = i.Tu.get(o.targetId);
  if (a.length > 1)
    return (
      i.Tu.set(
        o.targetId,
        a.filter((u) => !Jh(u, e)),
      ),
      void i.Pu.delete(e)
    );
  i.isPrimaryClient
    ? (i.sharedClientState.removeLocalQueryTarget(o.targetId),
      i.sharedClientState.isActiveQueryTarget(o.targetId) ||
        (await Hp(i.localStore, o.targetId, !1)
          .then(() => {
            (i.sharedClientState.clearQueryState(o.targetId),
              t && Fm(i.remoteStore, o.targetId),
              Kp(i, o.targetId));
          })
          .catch(Ha)))
    : (Kp(i, o.targetId), await Hp(i.localStore, o.targetId, !0));
}
async function Zb(n, e) {
  const t = je(n),
    i = t.Pu.get(e),
    o = t.Tu.get(i.targetId);
  t.isPrimaryClient &&
    o.length === 1 &&
    (t.sharedClientState.removeLocalQueryTarget(i.targetId),
    Fm(t.remoteStore, i.targetId));
}
async function eD(n, e, t) {
  const i = aD(n);
  try {
    const o = await (function (u, d) {
      const f = je(u),
        m = Et.now(),
        v = d.reduce((A, D) => A.add(D.key), Ye());
      let w, T;
      return f.persistence
        .runTransaction("Locally write mutations", "readwrite", (A) => {
          let D = Bi(),
            j = Ye();
          return f.Os.getEntries(A, v)
            .next((O) => {
              ((D = O),
                D.forEach((X, q) => {
                  q.isValidDocument() || (j = j.add(X));
                }));
            })
            .next(() => f.localDocuments.getOverlayedDocuments(A, D))
            .next((O) => {
              w = O;
              const X = [];
              for (const q of d) {
                const G = fx(q, w.get(q.key).overlayedDocument);
                G != null &&
                  X.push(new Lo(q.key, G, vE(G.value.mapValue), Fi.exists(!0)));
              }
              return f.mutationQueue.addMutationBatch(A, m, X, d);
            })
            .next((O) => {
              T = O;
              const X = O.applyToLocalDocumentSet(w, j);
              return f.documentOverlayCache.saveOverlays(A, O.batchId, X);
            });
        })
        .then(() => ({ batchId: T.batchId, changes: PE(w) }));
    })(i.localStore, e);
    (i.sharedClientState.addPendingMutation(o.batchId),
      (function (u, d, f) {
        let m = u.Ru[u.currentUser.toKey()];
        (m || (m = new xt(qe)),
          (m = m.insert(d, f)),
          (u.Ru[u.currentUser.toKey()] = m));
      })(i, o.batchId, t),
      await wu(i, o.changes),
      await sd(i.remoteStore));
  } catch (o) {
    const a = $m(o, "Failed to persist write");
    t.reject(a);
  }
}
async function uT(n, e) {
  const t = je(n);
  try {
    const i = await cb(t.localStore, e);
    (e.targetChanges.forEach((o, a) => {
      const u = t.Eu.get(a);
      u &&
        (at(
          o.addedDocuments.size +
            o.modifiedDocuments.size +
            o.removedDocuments.size <=
            1,
          22616,
        ),
        o.addedDocuments.size > 0
          ? (u.lu = !0)
          : o.modifiedDocuments.size > 0
            ? at(u.lu, 14607)
            : o.removedDocuments.size > 0 && (at(u.lu, 42227), (u.lu = !1)));
    }),
      await wu(t, i, e));
  } catch (i) {
    await Ha(i);
  }
}
function p0(n, e, t) {
  const i = je(n);
  if ((i.isPrimaryClient && t === 0) || (!i.isPrimaryClient && t === 1)) {
    const o = [];
    (i.Pu.forEach((a, u) => {
      const d = u.view.va(e);
      d.snapshot && o.push(d.snapshot);
    }),
      (function (u, d) {
        const f = je(u);
        f.onlineState = d;
        let m = !1;
        (f.queries.forEach((v, w) => {
          for (const T of w.wa) T.va(d) && (m = !0);
        }),
          m && Hm(f));
      })(i.eventManager, e),
      o.length && i.hu.J_(o),
      (i.onlineState = e),
      i.isPrimaryClient && i.sharedClientState.setOnlineState(e));
  }
}
async function tD(n, e, t) {
  const i = je(n);
  i.sharedClientState.updateQueryState(e, "rejected", t);
  const o = i.Eu.get(e),
    a = o && o.key;
  if (a) {
    let u = new xt(De.comparator);
    u = u.insert(a, gn.newNoDocument(a, ze.min()));
    const d = Ye().add(a),
      f = new nd(ze.min(), new Map(), new xt(qe), u, d);
    (await uT(i, f), (i.du = i.du.remove(a)), i.Eu.delete(e), qm(i));
  } else
    await Hp(i.localStore, e, !1)
      .then(() => Kp(i, e, t))
      .catch(Ha);
}
async function nD(n, e) {
  const t = je(n),
    i = e.batch.batchId;
  try {
    const o = await ub(t.localStore, e);
    (hT(t, i, null),
      cT(t, i),
      t.sharedClientState.updateMutationState(i, "acknowledged"),
      await wu(t, o));
  } catch (o) {
    await Ha(o);
  }
}
async function rD(n, e, t) {
  const i = je(n);
  try {
    const o = await (function (u, d) {
      const f = je(u);
      return f.persistence.runTransaction(
        "Reject batch",
        "readwrite-primary",
        (m) => {
          let v;
          return f.mutationQueue
            .lookupMutationBatch(m, d)
            .next(
              (w) => (
                at(w !== null, 37113),
                (v = w.keys()),
                f.mutationQueue.removeMutationBatch(m, w)
              ),
            )
            .next(() => f.mutationQueue.performConsistencyCheck(m))
            .next(() =>
              f.documentOverlayCache.removeOverlaysForBatchId(m, v, d),
            )
            .next(() =>
              f.localDocuments.recalculateAndSaveOverlaysForDocumentKeys(m, v),
            )
            .next(() => f.localDocuments.getDocuments(m, v));
        },
      );
    })(i.localStore, e);
    (hT(i, e, t),
      cT(i, e),
      i.sharedClientState.updateMutationState(e, "rejected", t),
      await wu(i, o));
  } catch (o) {
    await Ha(o);
  }
}
function cT(n, e) {
  ((n.Vu.get(e) || []).forEach((t) => {
    t.resolve();
  }),
    n.Vu.delete(e));
}
function hT(n, e, t) {
  const i = je(n);
  let o = i.Ru[i.currentUser.toKey()];
  if (o) {
    const a = o.get(e);
    (a && (t ? a.reject(t) : a.resolve(), (o = o.remove(e))),
      (i.Ru[i.currentUser.toKey()] = o));
  }
}
function Kp(n, e, t = null) {
  n.sharedClientState.removeLocalQueryTarget(e);
  for (const i of n.Tu.get(e)) (n.Pu.delete(i), t && n.hu.pu(i, t));
  (n.Tu.delete(e),
    n.isPrimaryClient &&
      n.Au.zr(e).forEach((i) => {
        n.Au.containsKey(i) || dT(n, i);
      }));
}
function dT(n, e) {
  n.Iu.delete(e.path.canonicalString());
  const t = n.du.get(e);
  t !== null &&
    (Fm(n.remoteStore, t), (n.du = n.du.remove(e)), n.Eu.delete(t), qm(n));
}
function m0(n, e, t) {
  for (const i of t)
    i instanceof oT
      ? (n.Au.addReference(i.key, e), iD(n, i))
      : i instanceof aT
        ? (pe(Wm, "Document no longer in limbo: " + i.key),
          n.Au.removeReference(i.key, e),
          n.Au.containsKey(i.key) || dT(n, i.key))
        : Le(19791, { yu: i });
}
function iD(n, e) {
  const t = e.key,
    i = t.path.canonicalString();
  n.du.get(t) ||
    n.Iu.has(i) ||
    (pe(Wm, "New document in limbo: " + t), n.Iu.add(i), qm(n));
}
function qm(n) {
  for (; n.Iu.size > 0 && n.du.size < n.maxConcurrentLimboResolutions; ) {
    const e = n.Iu.values().next().value;
    n.Iu.delete(e);
    const t = new De(kt.fromString(e)),
      i = n.mu.next();
    (n.Eu.set(i, new Kb(t)),
      (n.du = n.du.insert(t, i)),
      eT(
        n.remoteStore,
        new Ns(Zr(km(t.path)), i, "TargetPurposeLimboResolution", Gh.ue),
      ));
  }
}
async function wu(n, e, t) {
  const i = je(n),
    o = [],
    a = [],
    u = [];
  i.Pu.isEmpty() ||
    (i.Pu.forEach((d, f) => {
      u.push(
        i.gu(f, e, t).then((m) => {
          var v;
          if ((m || t) && i.isPrimaryClient) {
            const w = m
              ? !m.fromCache
              : (v = t?.targetChanges.get(f.targetId)) === null || v === void 0
                ? void 0
                : v.current;
            i.sharedClientState.updateQueryState(
              f.targetId,
              w ? "current" : "not-current",
            );
          }
          if (m) {
            o.push(m);
            const w = Mm.Es(f.targetId, m);
            a.push(w);
          }
        }),
      );
    }),
    await Promise.all(u),
    i.hu.J_(o),
    await (async function (f, m) {
      const v = je(f);
      try {
        await v.persistence.runTransaction(
          "notifyLocalViewChanges",
          "readwrite",
          (w) =>
            Z.forEach(m, (T) =>
              Z.forEach(T.Is, (A) =>
                v.persistence.referenceDelegate.addReference(w, T.targetId, A),
              ).next(() =>
                Z.forEach(T.ds, (A) =>
                  v.persistence.referenceDelegate.removeReference(
                    w,
                    T.targetId,
                    A,
                  ),
                ),
              ),
            ),
        );
      } catch (w) {
        if (!Wa(w)) throw w;
        pe(Vm, "Failed to update sequence numbers: " + w);
      }
      for (const w of m) {
        const T = w.targetId;
        if (!w.fromCache) {
          const A = v.Fs.get(T),
            D = A.snapshotVersion,
            j = A.withLastLimboFreeSnapshotVersion(D);
          v.Fs = v.Fs.insert(T, j);
        }
      }
    })(i.localStore, a));
}
async function sD(n, e) {
  const t = je(n);
  if (!t.currentUser.isEqual(e)) {
    pe(Wm, "User change. New user:", e.toKey());
    const i = await YE(t.localStore, e);
    ((t.currentUser = e),
      (function (a, u) {
        (a.Vu.forEach((d) => {
          d.forEach((f) => {
            f.reject(new ke(ie.CANCELLED, u));
          });
        }),
          a.Vu.clear());
      })(t, "'waitForPendingWrites' promise is rejected due to a user change."),
      t.sharedClientState.handleUserChange(
        e,
        i.removedBatchIds,
        i.addedBatchIds,
      ),
      await wu(t, i.Bs));
  }
}
function oD(n, e) {
  const t = je(n),
    i = t.Eu.get(e);
  if (i && i.lu) return Ye().add(i.key);
  {
    let o = Ye();
    const a = t.Tu.get(e);
    if (!a) return o;
    for (const u of a) {
      const d = t.Pu.get(u);
      o = o.unionWith(d.view.tu);
    }
    return o;
  }
}
function fT(n) {
  const e = je(n);
  return (
    (e.remoteStore.remoteSyncer.applyRemoteEvent = uT.bind(null, e)),
    (e.remoteStore.remoteSyncer.getRemoteKeysForTarget = oD.bind(null, e)),
    (e.remoteStore.remoteSyncer.rejectListen = tD.bind(null, e)),
    (e.hu.J_ = Bb.bind(null, e.eventManager)),
    (e.hu.pu = $b.bind(null, e.eventManager)),
    e
  );
}
function aD(n) {
  const e = je(n);
  return (
    (e.remoteStore.remoteSyncer.applySuccessfulWrite = nD.bind(null, e)),
    (e.remoteStore.remoteSyncer.rejectFailedWrite = rD.bind(null, e)),
    e
  );
}
class Ch {
  constructor() {
    ((this.kind = "memory"), (this.synchronizeTabs = !1));
  }
  async initialize(e) {
    ((this.serializer = rd(e.databaseInfo.databaseId)),
      (this.sharedClientState = this.bu(e)),
      (this.persistence = this.Du(e)),
      await this.persistence.start(),
      (this.localStore = this.vu(e)),
      (this.gcScheduler = this.Cu(e, this.localStore)),
      (this.indexBackfillerScheduler = this.Fu(e, this.localStore)));
  }
  Cu(e, t) {
    return null;
  }
  Fu(e, t) {
    return null;
  }
  vu(e) {
    return lb(this.persistence, new sb(), e.initialUser, this.serializer);
  }
  Du(e) {
    return new QE(Lm.Vi, this.serializer);
  }
  bu(e) {
    return new mb();
  }
  async terminate() {
    var e, t;
    ((e = this.gcScheduler) === null || e === void 0 || e.stop(),
      (t = this.indexBackfillerScheduler) === null || t === void 0 || t.stop(),
      this.sharedClientState.shutdown(),
      await this.persistence.shutdown());
  }
}
Ch.provider = { build: () => new Ch() };
class lD extends Ch {
  constructor(e) {
    (super(), (this.cacheSizeBytes = e));
  }
  Cu(e, t) {
    at(this.persistence.referenceDelegate instanceof Rh, 46915);
    const i = this.persistence.referenceDelegate.garbageCollector;
    return new Hx(i, e.asyncQueue, t);
  }
  Du(e) {
    const t =
      this.cacheSizeBytes !== void 0
        ? Vn.withCacheSize(this.cacheSizeBytes)
        : Vn.DEFAULT;
    return new QE((i) => Rh.Vi(i, t), this.serializer);
  }
}
class Gp {
  async initialize(e, t) {
    this.localStore ||
      ((this.localStore = e.localStore),
      (this.sharedClientState = e.sharedClientState),
      (this.datastore = this.createDatastore(t)),
      (this.remoteStore = this.createRemoteStore(t)),
      (this.eventManager = this.createEventManager(t)),
      (this.syncEngine = this.createSyncEngine(t, !e.synchronizeTabs)),
      (this.sharedClientState.onlineStateHandler = (i) =>
        p0(this.syncEngine, i, 1)),
      (this.remoteStore.remoteSyncer.handleCredentialChange = sD.bind(
        null,
        this.syncEngine,
      )),
      await Vb(this.remoteStore, this.syncEngine.isPrimaryClient));
  }
  createEventManager(e) {
    return (function () {
      return new Ub();
    })();
  }
  createDatastore(e) {
    const t = rd(e.databaseInfo.databaseId),
      i = (function (a) {
        return new wb(a);
      })(e.databaseInfo);
    return (function (a, u, d, f) {
      return new Ib(a, u, d, f);
    })(e.authCredentials, e.appCheckCredentials, i, t);
  }
  createRemoteStore(e) {
    return (function (i, o, a, u, d) {
      return new Ab(i, o, a, u, d);
    })(
      this.localStore,
      this.datastore,
      e.asyncQueue,
      (t) => p0(this.syncEngine, t, 0),
      (function () {
        return l0.C() ? new l0() : new gb();
      })(),
    );
  }
  createSyncEngine(e, t) {
    return (function (o, a, u, d, f, m, v) {
      const w = new Gb(o, a, u, d, f, m);
      return (v && (w.fu = !0), w);
    })(
      this.localStore,
      this.remoteStore,
      this.eventManager,
      this.sharedClientState,
      e.initialUser,
      e.maxConcurrentLimboResolutions,
      t,
    );
  }
  async terminate() {
    var e, t;
    (await (async function (o) {
      const a = je(o);
      (pe(xo, "RemoteStore shutting down."),
        a.Ia.add(5),
        await _u(a),
        a.Ea.shutdown(),
        a.Aa.set("Unknown"));
    })(this.remoteStore),
      (e = this.datastore) === null || e === void 0 || e.terminate(),
      (t = this.eventManager) === null || t === void 0 || t.terminate());
  }
}
Gp.provider = { build: () => new Gp() };
class uD {
  constructor(e) {
    ((this.observer = e), (this.muted = !1));
  }
  next(e) {
    this.muted || (this.observer.next && this.xu(this.observer.next, e));
  }
  error(e) {
    this.muted ||
      (this.observer.error
        ? this.xu(this.observer.error, e)
        : ji("Uncaught Error in snapshot listener:", e.toString()));
  }
  Ou() {
    this.muted = !0;
  }
  xu(e, t) {
    setTimeout(() => {
      this.muted || e(t);
    }, 0);
  }
}
const qs = "FirestoreClient";
class cD {
  constructor(e, t, i, o, a) {
    ((this.authCredentials = e),
      (this.appCheckCredentials = t),
      (this.asyncQueue = i),
      (this.databaseInfo = o),
      (this.user = mn.UNAUTHENTICATED),
      (this.clientId = Tm.newId()),
      (this.authCredentialListener = () => Promise.resolve()),
      (this.appCheckCredentialListener = () => Promise.resolve()),
      (this._uninitializedComponentsProvider = a),
      this.authCredentials.start(i, async (u) => {
        (pe(qs, "Received user=", u.uid),
          await this.authCredentialListener(u),
          (this.user = u));
      }),
      this.appCheckCredentials.start(
        i,
        (u) => (
          pe(qs, "Received new app check token=", u),
          this.appCheckCredentialListener(u, this.user)
        ),
      ));
  }
  get configuration() {
    return {
      asyncQueue: this.asyncQueue,
      databaseInfo: this.databaseInfo,
      clientId: this.clientId,
      authCredentials: this.authCredentials,
      appCheckCredentials: this.appCheckCredentials,
      initialUser: this.user,
      maxConcurrentLimboResolutions: 100,
    };
  }
  setCredentialChangeListener(e) {
    this.authCredentialListener = e;
  }
  setAppCheckTokenChangeListener(e) {
    this.appCheckCredentialListener = e;
  }
  terminate() {
    this.asyncQueue.enterRestrictedMode();
    const e = new Fs();
    return (
      this.asyncQueue.enqueueAndForgetEvenWhileRestricted(async () => {
        try {
          (this._onlineComponents && (await this._onlineComponents.terminate()),
            this._offlineComponents &&
              (await this._offlineComponents.terminate()),
            this.authCredentials.shutdown(),
            this.appCheckCredentials.shutdown(),
            e.resolve());
        } catch (t) {
          const i = $m(t, "Failed to shutdown persistence");
          e.reject(i);
        }
      }),
      e.promise
    );
  }
}
async function lp(n, e) {
  (n.asyncQueue.verifyOperationInProgress(),
    pe(qs, "Initializing OfflineComponentProvider"));
  const t = n.configuration;
  await e.initialize(t);
  let i = t.initialUser;
  (n.setCredentialChangeListener(async (o) => {
    i.isEqual(o) || (await YE(e.localStore, o), (i = o));
  }),
    e.persistence.setDatabaseDeletedListener(() => {
      (zs("Terminating Firestore due to IndexedDb database deletion"),
        n
          .terminate()
          .then(() => {
            pe(
              "Terminating Firestore due to IndexedDb database deletion completed successfully",
            );
          })
          .catch((o) => {
            zs(
              "Terminating Firestore due to IndexedDb database deletion failed",
              o,
            );
          }));
    }),
    (n._offlineComponents = e));
}
async function g0(n, e) {
  n.asyncQueue.verifyOperationInProgress();
  const t = await hD(n);
  (pe(qs, "Initializing OnlineComponentProvider"),
    await e.initialize(t, n.configuration),
    n.setCredentialChangeListener((i) => c0(e.remoteStore, i)),
    n.setAppCheckTokenChangeListener((i, o) => c0(e.remoteStore, o)),
    (n._onlineComponents = e));
}
async function hD(n) {
  if (!n._offlineComponents)
    if (n._uninitializedComponentsProvider) {
      pe(qs, "Using user provided OfflineComponentProvider");
      try {
        await lp(n, n._uninitializedComponentsProvider._offline);
      } catch (e) {
        const t = e;
        if (
          !(function (o) {
            return o.name === "FirebaseError"
              ? o.code === ie.FAILED_PRECONDITION || o.code === ie.UNIMPLEMENTED
              : !(typeof DOMException < "u" && o instanceof DOMException) ||
                  o.code === 22 ||
                  o.code === 20 ||
                  o.code === 11;
          })(t)
        )
          throw t;
        (zs(
          "Error using user provided cache. Falling back to memory cache: " + t,
        ),
          await lp(n, new Ch()));
      }
    } else
      (pe(qs, "Using default OfflineComponentProvider"),
        await lp(n, new lD(void 0)));
  return n._offlineComponents;
}
async function pT(n) {
  return (
    n._onlineComponents ||
      (n._uninitializedComponentsProvider
        ? (pe(qs, "Using user provided OnlineComponentProvider"),
          await g0(n, n._uninitializedComponentsProvider._online))
        : (pe(qs, "Using default OnlineComponentProvider"),
          await g0(n, new Gp()))),
    n._onlineComponents
  );
}
function dD(n) {
  return pT(n).then((e) => e.syncEngine);
}
async function fD(n) {
  const e = await pT(n),
    t = e.eventManager;
  return (
    (t.onListen = Qb.bind(null, e.syncEngine)),
    (t.onUnlisten = Jb.bind(null, e.syncEngine)),
    (t.onFirstRemoteStoreListen = Yb.bind(null, e.syncEngine)),
    (t.onLastRemoteStoreUnlisten = Zb.bind(null, e.syncEngine)),
    t
  );
}
function pD(n, e, t = {}) {
  const i = new Fs();
  return (
    n.asyncQueue.enqueueAndForget(async () =>
      (function (a, u, d, f, m) {
        const v = new uD({
            next: (T) => {
              (v.Ou(), u.enqueueAndForget(() => jb(a, w)));
              const A = T.docs.has(d);
              !A && T.fromCache
                ? m.reject(
                    new ke(
                      ie.UNAVAILABLE,
                      "Failed to get document because the client is offline.",
                    ),
                  )
                : A && T.fromCache && f && f.source === "server"
                  ? m.reject(
                      new ke(
                        ie.UNAVAILABLE,
                        'Failed to get document from server. (However, this document does exist in the local cache. Run again without setting source to "server" to retrieve the cached document.)',
                      ),
                    )
                  : m.resolve(T);
            },
            error: (T) => m.reject(T),
          }),
          w = new Hb(km(d.path), v, { includeMetadataChanges: !0, ka: !0 });
        return zb(a, w);
      })(await fD(n), n.asyncQueue, e, t, i),
    ),
    i.promise
  );
}
function mT(n) {
  const e = {};
  return (
    n.timeoutSeconds !== void 0 && (e.timeoutSeconds = n.timeoutSeconds),
    e
  );
}
const y0 = new Map();
const gT = "firestore.googleapis.com",
  v0 = !0;
class _0 {
  constructor(e) {
    var t, i;
    if (e.host === void 0) {
      if (e.ssl !== void 0)
        throw new ke(
          ie.INVALID_ARGUMENT,
          "Can't provide ssl option if host option is not set",
        );
      ((this.host = gT), (this.ssl = v0));
    } else
      ((this.host = e.host),
        (this.ssl = (t = e.ssl) !== null && t !== void 0 ? t : v0));
    if (
      ((this.isUsingEmulator = e.emulatorOptions !== void 0),
      (this.credentials = e.credentials),
      (this.ignoreUndefinedProperties = !!e.ignoreUndefinedProperties),
      (this.localCache = e.localCache),
      e.cacheSizeBytes === void 0)
    )
      this.cacheSizeBytes = GE;
    else {
      if (e.cacheSizeBytes !== -1 && e.cacheSizeBytes < Bx)
        throw new ke(
          ie.INVALID_ARGUMENT,
          "cacheSizeBytes must be at least 1048576",
        );
      this.cacheSizeBytes = e.cacheSizeBytes;
    }
    (Ak(
      "experimentalForceLongPolling",
      e.experimentalForceLongPolling,
      "experimentalAutoDetectLongPolling",
      e.experimentalAutoDetectLongPolling,
    ),
      (this.experimentalForceLongPolling = !!e.experimentalForceLongPolling),
      this.experimentalForceLongPolling
        ? (this.experimentalAutoDetectLongPolling = !1)
        : e.experimentalAutoDetectLongPolling === void 0
          ? (this.experimentalAutoDetectLongPolling = !0)
          : (this.experimentalAutoDetectLongPolling =
              !!e.experimentalAutoDetectLongPolling),
      (this.experimentalLongPollingOptions = mT(
        (i = e.experimentalLongPollingOptions) !== null && i !== void 0
          ? i
          : {},
      )),
      (function (a) {
        if (a.timeoutSeconds !== void 0) {
          if (isNaN(a.timeoutSeconds))
            throw new ke(
              ie.INVALID_ARGUMENT,
              `invalid long polling timeout: ${a.timeoutSeconds} (must not be NaN)`,
            );
          if (a.timeoutSeconds < 5)
            throw new ke(
              ie.INVALID_ARGUMENT,
              `invalid long polling timeout: ${a.timeoutSeconds} (minimum allowed value is 5)`,
            );
          if (a.timeoutSeconds > 30)
            throw new ke(
              ie.INVALID_ARGUMENT,
              `invalid long polling timeout: ${a.timeoutSeconds} (maximum allowed value is 30)`,
            );
        }
      })(this.experimentalLongPollingOptions),
      (this.useFetchStreams = !!e.useFetchStreams));
  }
  isEqual(e) {
    return (
      this.host === e.host &&
      this.ssl === e.ssl &&
      this.credentials === e.credentials &&
      this.cacheSizeBytes === e.cacheSizeBytes &&
      this.experimentalForceLongPolling === e.experimentalForceLongPolling &&
      this.experimentalAutoDetectLongPolling ===
        e.experimentalAutoDetectLongPolling &&
      (function (i, o) {
        return i.timeoutSeconds === o.timeoutSeconds;
      })(
        this.experimentalLongPollingOptions,
        e.experimentalLongPollingOptions,
      ) &&
      this.ignoreUndefinedProperties === e.ignoreUndefinedProperties &&
      this.useFetchStreams === e.useFetchStreams
    );
  }
}
class Km {
  constructor(e, t, i, o) {
    ((this._authCredentials = e),
      (this._appCheckCredentials = t),
      (this._databaseId = i),
      (this._app = o),
      (this.type = "firestore-lite"),
      (this._persistenceKey = "(lite)"),
      (this._settings = new _0({})),
      (this._settingsFrozen = !1),
      (this._emulatorOptions = {}),
      (this._terminateTask = "notTerminated"));
  }
  get app() {
    if (!this._app)
      throw new ke(
        ie.FAILED_PRECONDITION,
        "Firestore was not initialized using the Firebase SDK. 'app' is not available",
      );
    return this._app;
  }
  get _initialized() {
    return this._settingsFrozen;
  }
  get _terminated() {
    return this._terminateTask !== "notTerminated";
  }
  _setSettings(e) {
    if (this._settingsFrozen)
      throw new ke(
        ie.FAILED_PRECONDITION,
        "Firestore has already been started and its settings can no longer be changed. You can only modify settings before calling any other methods on a Firestore object.",
      );
    ((this._settings = new _0(e)),
      (this._emulatorOptions = e.emulatorOptions || {}),
      e.credentials !== void 0 &&
        (this._authCredentials = (function (i) {
          if (!i) return new gk();
          switch (i.type) {
            case "firstParty":
              return new wk(
                i.sessionIndex || "0",
                i.iamToken || null,
                i.authTokenFactory || null,
              );
            case "provider":
              return i.client;
            default:
              throw new ke(
                ie.INVALID_ARGUMENT,
                "makeAuthCredentialsProvider failed due to invalid credential type",
              );
          }
        })(e.credentials)));
  }
  _getSettings() {
    return this._settings;
  }
  _getEmulatorOptions() {
    return this._emulatorOptions;
  }
  _freezeSettings() {
    return ((this._settingsFrozen = !0), this._settings);
  }
  _delete() {
    return (
      this._terminateTask === "notTerminated" &&
        (this._terminateTask = this._terminate()),
      this._terminateTask
    );
  }
  async _restart() {
    this._terminateTask === "notTerminated"
      ? await this._terminate()
      : (this._terminateTask = "notTerminated");
  }
  toJSON() {
    return {
      app: this._app,
      databaseId: this._databaseId,
      settings: this._settings,
    };
  }
  _terminate() {
    return (
      (function (t) {
        const i = y0.get(t);
        i &&
          (pe("ComponentProvider", "Removing Datastore"),
          y0.delete(t),
          i.terminate());
      })(this),
      Promise.resolve()
    );
  }
}
function mD(n, e, t, i = {}) {
  var o;
  n = eu(n, Km);
  const a = ja(e),
    u = n._getSettings(),
    d = Object.assign(Object.assign({}, u), {
      emulatorOptions: n._getEmulatorOptions(),
    }),
    f = `${e}:${t}`;
  (a && (Ww(`https://${f}`), qw("Firestore", !0)),
    u.host !== gT &&
      u.host !== f &&
      zs(
        "Host has been set in both settings() and connectFirestoreEmulator(), emulator host will be used.",
      ));
  const m = Object.assign(Object.assign({}, u), {
    host: f,
    ssl: a,
    emulatorOptions: i,
  });
  if (!Co(m, d) && (n._setSettings(m), i.mockUserToken)) {
    let v, w;
    if (typeof i.mockUserToken == "string")
      ((v = i.mockUserToken), (w = mn.MOCK_USER));
    else {
      v = $C(
        i.mockUserToken,
        (o = n._app) === null || o === void 0 ? void 0 : o.options.projectId,
      );
      const T = i.mockUserToken.sub || i.mockUserToken.user_id;
      if (!T)
        throw new ke(
          ie.INVALID_ARGUMENT,
          "mockUserToken must contain 'sub' or 'user_id' field!",
        );
      w = new mn(T);
    }
    n._authCredentials = new yk(new oE(v, w));
  }
}
class Gm {
  constructor(e, t, i) {
    ((this.converter = t),
      (this._query = i),
      (this.type = "query"),
      (this.firestore = e));
  }
  withConverter(e) {
    return new Gm(this.firestore, e, this._query);
  }
}
class Jt {
  constructor(e, t, i) {
    ((this.converter = t),
      (this._key = i),
      (this.type = "document"),
      (this.firestore = e));
  }
  get _path() {
    return this._key.path;
  }
  get id() {
    return this._key.path.lastSegment();
  }
  get path() {
    return this._key.path.canonicalString();
  }
  get parent() {
    return new au(this.firestore, this.converter, this._key.path.popLast());
  }
  withConverter(e) {
    return new Jt(this.firestore, e, this._key);
  }
  toJSON() {
    return { type: Jt._jsonSchemaVersion, referencePath: this._key.toString() };
  }
  static fromJSON(e, t, i) {
    if (gu(t, Jt._jsonSchema))
      return new Jt(e, i || null, new De(kt.fromString(t.referencePath)));
  }
}
((Jt._jsonSchemaVersion = "firestore/documentReference/1.0"),
  (Jt._jsonSchema = {
    type: zt("string", Jt._jsonSchemaVersion),
    referencePath: zt("string"),
  }));
class au extends Gm {
  constructor(e, t, i) {
    (super(e, t, km(i)), (this._path = i), (this.type = "collection"));
  }
  get id() {
    return this._query.path.lastSegment();
  }
  get path() {
    return this._query.path.canonicalString();
  }
  get parent() {
    const e = this._path.popLast();
    return e.isEmpty() ? null : new Jt(this.firestore, null, new De(e));
  }
  withConverter(e) {
    return new au(this.firestore, e, this._path);
  }
}
function yT(n, e, ...t) {
  if (
    ((n = ai(n)),
    arguments.length === 1 && (e = Tm.newId()),
    Rk("doc", "path", e),
    n instanceof Km)
  ) {
    const i = kt.fromString(e, ...t);
    return (N_(i), new Jt(n, null, new De(i)));
  }
  {
    if (!(n instanceof Jt || n instanceof au))
      throw new ke(
        ie.INVALID_ARGUMENT,
        "Expected first argument to collection() to be a CollectionReference, a DocumentReference or FirebaseFirestore",
      );
    const i = n._path.child(kt.fromString(e, ...t));
    return (
      N_(i),
      new Jt(n.firestore, n instanceof au ? n.converter : null, new De(i))
    );
  }
}
const w0 = "AsyncQueue";
class E0 {
  constructor(e = Promise.resolve()) {
    ((this.Zu = []),
      (this.Xu = !1),
      (this.ec = []),
      (this.tc = null),
      (this.nc = !1),
      (this.rc = !1),
      (this.sc = []),
      (this.F_ = new JE(this, "async_queue_retry")),
      (this.oc = () => {
        const i = ap();
        (i && pe(w0, "Visibility state changed to " + i.visibilityState),
          this.F_.y_());
      }),
      (this._c = e));
    const t = ap();
    t &&
      typeof t.addEventListener == "function" &&
      t.addEventListener("visibilitychange", this.oc);
  }
  get isShuttingDown() {
    return this.Xu;
  }
  enqueueAndForget(e) {
    this.enqueue(e);
  }
  enqueueAndForgetEvenWhileRestricted(e) {
    (this.ac(), this.uc(e));
  }
  enterRestrictedMode(e) {
    if (!this.Xu) {
      ((this.Xu = !0), (this.rc = e || !1));
      const t = ap();
      t &&
        typeof t.removeEventListener == "function" &&
        t.removeEventListener("visibilitychange", this.oc);
    }
  }
  enqueue(e) {
    if ((this.ac(), this.Xu)) return new Promise(() => {});
    const t = new Fs();
    return this.uc(() =>
      this.Xu && this.rc
        ? Promise.resolve()
        : (e().then(t.resolve, t.reject), t.promise),
    ).then(() => t.promise);
  }
  enqueueRetryable(e) {
    this.enqueueAndForget(() => (this.Zu.push(e), this.cc()));
  }
  async cc() {
    if (this.Zu.length !== 0) {
      try {
        (await this.Zu[0](), this.Zu.shift(), this.F_.reset());
      } catch (e) {
        if (!Wa(e)) throw e;
        pe(w0, "Operation failed with retryable error: " + e);
      }
      this.Zu.length > 0 && this.F_.g_(() => this.cc());
    }
  }
  uc(e) {
    const t = this._c.then(
      () => (
        (this.nc = !0),
        e()
          .catch((i) => {
            throw (
              (this.tc = i),
              (this.nc = !1),
              ji("INTERNAL UNHANDLED ERROR: ", T0(i)),
              i
            );
          })
          .then((i) => ((this.nc = !1), i))
      ),
    );
    return ((this._c = t), t);
  }
  enqueueAfterDelay(e, t, i) {
    (this.ac(), this.sc.indexOf(e) > -1 && (t = 0));
    const o = Bm.createAndSchedule(this, e, t, i, (a) => this.lc(a));
    return (this.ec.push(o), o);
  }
  ac() {
    this.tc && Le(47125, { hc: T0(this.tc) });
  }
  verifyOperationInProgress() {}
  async Pc() {
    let e;
    do ((e = this._c), await e);
    while (e !== this._c);
  }
  Tc(e) {
    for (const t of this.ec) if (t.timerId === e) return !0;
    return !1;
  }
  Ic(e) {
    return this.Pc().then(() => {
      this.ec.sort((t, i) => t.targetTimeMs - i.targetTimeMs);
      for (const t of this.ec)
        if ((t.skipDelay(), e !== "all" && t.timerId === e)) break;
      return this.Pc();
    });
  }
  dc(e) {
    this.sc.push(e);
  }
  lc(e) {
    const t = this.ec.indexOf(e);
    this.ec.splice(t, 1);
  }
}
function T0(n) {
  let e = n.message || "";
  return (
    n.stack &&
      (e = n.stack.includes(n.message)
        ? n.stack
        : n.message +
          `
` +
          n.stack),
    e
  );
}
class Qm extends Km {
  constructor(e, t, i, o) {
    (super(e, t, i, o),
      (this.type = "firestore"),
      (this._queue = new E0()),
      (this._persistenceKey = o?.name || "[DEFAULT]"));
  }
  async _terminate() {
    if (this._firestoreClient) {
      const e = this._firestoreClient.terminate();
      ((this._queue = new E0(e)), (this._firestoreClient = void 0), await e);
    }
  }
}
function gD(n, e) {
  const t = typeof n == "object" ? n : Yw(),
    i = typeof n == "string" ? n : vh,
    o = wm(t, "firestore").getImmediate({ identifier: i });
  if (!o._initialized) {
    const a = jC("firestore");
    a && mD(o, ...a);
  }
  return o;
}
function vT(n) {
  if (n._terminated)
    throw new ke(
      ie.FAILED_PRECONDITION,
      "The client has already been terminated.",
    );
  return (n._firestoreClient || yD(n), n._firestoreClient);
}
function yD(n) {
  var e, t, i;
  const o = n._freezeSettings(),
    a = (function (d, f, m, v) {
      return new Vk(
        d,
        f,
        m,
        v.host,
        v.ssl,
        v.experimentalForceLongPolling,
        v.experimentalAutoDetectLongPolling,
        mT(v.experimentalLongPollingOptions),
        v.useFetchStreams,
        v.isUsingEmulator,
      );
    })(
      n._databaseId,
      ((e = n._app) === null || e === void 0 ? void 0 : e.options.appId) || "",
      n._persistenceKey,
      o,
    );
  (n._componentsProvider ||
    (!((t = o.localCache) === null || t === void 0) &&
      t._offlineComponentProvider &&
      !((i = o.localCache) === null || i === void 0) &&
      i._onlineComponentProvider &&
      (n._componentsProvider = {
        _offline: o.localCache._offlineComponentProvider,
        _online: o.localCache._onlineComponentProvider,
      })),
    (n._firestoreClient = new cD(
      n._authCredentials,
      n._appCheckCredentials,
      n._queue,
      a,
      n._componentsProvider &&
        (function (d) {
          const f = d?._online.build();
          return { _offline: d?._offline.build(f), _online: f };
        })(n._componentsProvider),
    )));
}
class cr {
  constructor(e) {
    this._byteString = e;
  }
  static fromBase64String(e) {
    try {
      return new cr(ln.fromBase64String(e));
    } catch (t) {
      throw new ke(
        ie.INVALID_ARGUMENT,
        "Failed to construct data from Base64 string: " + t,
      );
    }
  }
  static fromUint8Array(e) {
    return new cr(ln.fromUint8Array(e));
  }
  toBase64() {
    return this._byteString.toBase64();
  }
  toUint8Array() {
    return this._byteString.toUint8Array();
  }
  toString() {
    return "Bytes(base64: " + this.toBase64() + ")";
  }
  isEqual(e) {
    return this._byteString.isEqual(e._byteString);
  }
  toJSON() {
    return { type: cr._jsonSchemaVersion, bytes: this.toBase64() };
  }
  static fromJSON(e) {
    if (gu(e, cr._jsonSchema)) return cr.fromBase64String(e.bytes);
  }
}
((cr._jsonSchemaVersion = "firestore/bytes/1.0"),
  (cr._jsonSchema = {
    type: zt("string", cr._jsonSchemaVersion),
    bytes: zt("string"),
  }));
class Ym {
  constructor(...e) {
    for (let t = 0; t < e.length; ++t)
      if (e[t].length === 0)
        throw new ke(
          ie.INVALID_ARGUMENT,
          "Invalid field name at argument $(i + 1). Field names must not be empty.",
        );
    this._internalPath = new an(e);
  }
  isEqual(e) {
    return this._internalPath.isEqual(e._internalPath);
  }
}
class _T {
  constructor(e) {
    this._methodName = e;
  }
}
class ti {
  constructor(e, t) {
    if (!isFinite(e) || e < -90 || e > 90)
      throw new ke(
        ie.INVALID_ARGUMENT,
        "Latitude must be a number between -90 and 90, but was: " + e,
      );
    if (!isFinite(t) || t < -180 || t > 180)
      throw new ke(
        ie.INVALID_ARGUMENT,
        "Longitude must be a number between -180 and 180, but was: " + t,
      );
    ((this._lat = e), (this._long = t));
  }
  get latitude() {
    return this._lat;
  }
  get longitude() {
    return this._long;
  }
  isEqual(e) {
    return this._lat === e._lat && this._long === e._long;
  }
  _compareTo(e) {
    return qe(this._lat, e._lat) || qe(this._long, e._long);
  }
  toJSON() {
    return {
      latitude: this._lat,
      longitude: this._long,
      type: ti._jsonSchemaVersion,
    };
  }
  static fromJSON(e) {
    if (gu(e, ti._jsonSchema)) return new ti(e.latitude, e.longitude);
  }
}
((ti._jsonSchemaVersion = "firestore/geoPoint/1.0"),
  (ti._jsonSchema = {
    type: zt("string", ti._jsonSchemaVersion),
    latitude: zt("number"),
    longitude: zt("number"),
  }));
class ni {
  constructor(e) {
    this._values = (e || []).map((t) => t);
  }
  toArray() {
    return this._values.map((e) => e);
  }
  isEqual(e) {
    return (function (i, o) {
      if (i.length !== o.length) return !1;
      for (let a = 0; a < i.length; ++a) if (i[a] !== o[a]) return !1;
      return !0;
    })(this._values, e._values);
  }
  toJSON() {
    return { type: ni._jsonSchemaVersion, vectorValues: this._values };
  }
  static fromJSON(e) {
    if (gu(e, ni._jsonSchema)) {
      if (
        Array.isArray(e.vectorValues) &&
        e.vectorValues.every((t) => typeof t == "number")
      )
        return new ni(e.vectorValues);
      throw new ke(
        ie.INVALID_ARGUMENT,
        "Expected 'vectorValues' field to be a number array",
      );
    }
  }
}
((ni._jsonSchemaVersion = "firestore/vectorValue/1.0"),
  (ni._jsonSchema = {
    type: zt("string", ni._jsonSchemaVersion),
    vectorValues: zt("object"),
  }));
const vD = /^__.*__$/;
class _D {
  constructor(e, t, i) {
    ((this.data = e), (this.fieldMask = t), (this.fieldTransforms = i));
  }
  toMutation(e, t) {
    return this.fieldMask !== null
      ? new Lo(e, this.data, this.fieldMask, t, this.fieldTransforms)
      : new yu(e, this.data, t, this.fieldTransforms);
  }
}
function wT(n) {
  switch (n) {
    case 0:
    case 2:
    case 1:
      return !0;
    case 3:
    case 4:
      return !1;
    default:
      throw Le(40011, { Ec: n });
  }
}
class Xm {
  constructor(e, t, i, o, a, u) {
    ((this.settings = e),
      (this.databaseId = t),
      (this.serializer = i),
      (this.ignoreUndefinedProperties = o),
      a === void 0 && this.Ac(),
      (this.fieldTransforms = a || []),
      (this.fieldMask = u || []));
  }
  get path() {
    return this.settings.path;
  }
  get Ec() {
    return this.settings.Ec;
  }
  Rc(e) {
    return new Xm(
      Object.assign(Object.assign({}, this.settings), e),
      this.databaseId,
      this.serializer,
      this.ignoreUndefinedProperties,
      this.fieldTransforms,
      this.fieldMask,
    );
  }
  Vc(e) {
    var t;
    const i = (t = this.path) === null || t === void 0 ? void 0 : t.child(e),
      o = this.Rc({ path: i, mc: !1 });
    return (o.fc(e), o);
  }
  gc(e) {
    var t;
    const i = (t = this.path) === null || t === void 0 ? void 0 : t.child(e),
      o = this.Rc({ path: i, mc: !1 });
    return (o.Ac(), o);
  }
  yc(e) {
    return this.Rc({ path: void 0, mc: !0 });
  }
  wc(e) {
    return Ph(
      e,
      this.settings.methodName,
      this.settings.Sc || !1,
      this.path,
      this.settings.bc,
    );
  }
  contains(e) {
    return (
      this.fieldMask.find((t) => e.isPrefixOf(t)) !== void 0 ||
      this.fieldTransforms.find((t) => e.isPrefixOf(t.field)) !== void 0
    );
  }
  Ac() {
    if (this.path)
      for (let e = 0; e < this.path.length; e++) this.fc(this.path.get(e));
  }
  fc(e) {
    if (e.length === 0) throw this.wc("Document fields must not be empty");
    if (wT(this.Ec) && vD.test(e))
      throw this.wc('Document fields cannot begin and end with "__"');
  }
}
class wD {
  constructor(e, t, i) {
    ((this.databaseId = e),
      (this.ignoreUndefinedProperties = t),
      (this.serializer = i || rd(e)));
  }
  Dc(e, t, i, o = !1) {
    return new Xm(
      { Ec: e, methodName: t, bc: i, path: an.emptyPath(), mc: !1, Sc: o },
      this.databaseId,
      this.serializer,
      this.ignoreUndefinedProperties,
    );
  }
}
function ED(n) {
  const e = n._freezeSettings(),
    t = rd(n._databaseId);
  return new wD(n._databaseId, !!e.ignoreUndefinedProperties, t);
}
function TD(n, e, t, i, o, a = {}) {
  const u = n.Dc(a.merge || a.mergeFields ? 2 : 0, e, t, o);
  IT("Data must be an object, but it was:", u, i);
  const d = TT(i, u);
  let f, m;
  if (a.merge) ((f = new br(u.fieldMask)), (m = u.fieldTransforms));
  else if (a.mergeFields) {
    const v = [];
    for (const w of a.mergeFields) {
      const T = SD(e, w, t);
      if (!u.contains(T))
        throw new ke(
          ie.INVALID_ARGUMENT,
          `Field '${T}' is specified in your field mask but missing from your input data.`,
        );
      RD(v, T) || v.push(T);
    }
    ((f = new br(v)), (m = u.fieldTransforms.filter((w) => f.covers(w.field))));
  } else ((f = null), (m = u.fieldTransforms));
  return new _D(new ur(d), f, m);
}
function ET(n, e) {
  if (ST((n = ai(n)))) return (IT("Unsupported field value:", e, n), TT(n, e));
  if (n instanceof _T)
    return (
      (function (i, o) {
        if (!wT(o.Ec))
          throw o.wc(
            `${i._methodName}() can only be used with update() and set()`,
          );
        if (!o.path)
          throw o.wc(
            `${i._methodName}() is not currently supported inside arrays`,
          );
        const a = i._toFieldTransform(o);
        a && o.fieldTransforms.push(a);
      })(n, e),
      null
    );
  if (n === void 0 && e.ignoreUndefinedProperties) return null;
  if ((e.path && e.fieldMask.push(e.path), n instanceof Array)) {
    if (e.settings.mc && e.Ec !== 4)
      throw e.wc("Nested arrays are not supported");
    return (function (i, o) {
      const a = [];
      let u = 0;
      for (const d of i) {
        let f = ET(d, o.yc(u));
        (f == null && (f = { nullValue: "NULL_VALUE" }), a.push(f), u++);
      }
      return { arrayValue: { values: a } };
    })(n, e);
  }
  return (function (i, o) {
    if ((i = ai(i)) === null) return { nullValue: "NULL_VALUE" };
    if (typeof i == "number") return ax(o.serializer, i);
    if (typeof i == "boolean") return { booleanValue: i };
    if (typeof i == "string") return { stringValue: i };
    if (i instanceof Date) {
      const a = Et.fromDate(i);
      return { timestampValue: Ih(o.serializer, a) };
    }
    if (i instanceof Et) {
      const a = new Et(i.seconds, 1e3 * Math.floor(i.nanoseconds / 1e3));
      return { timestampValue: Ih(o.serializer, a) };
    }
    if (i instanceof ti)
      return {
        geoPointValue: { latitude: i.latitude, longitude: i.longitude },
      };
    if (i instanceof cr) return { bytesValue: jE(o.serializer, i._byteString) };
    if (i instanceof Jt) {
      const a = o.databaseId,
        u = i.firestore._databaseId;
      if (!u.isEqual(a))
        throw o.wc(
          `Document reference is for database ${u.projectId}/${u.database} but should be for database ${a.projectId}/${a.database}`,
        );
      return {
        referenceValue: Nm(
          i.firestore._databaseId || o.databaseId,
          i._key.path,
        ),
      };
    }
    if (i instanceof ni)
      return (function (u, d) {
        return {
          mapValue: {
            fields: {
              [gE]: { stringValue: yE },
              [_h]: {
                arrayValue: {
                  values: u.toArray().map((m) => {
                    if (typeof m != "number")
                      throw d.wc(
                        "VectorValues must only contain numeric values.",
                      );
                    return xm(d.serializer, m);
                  }),
                },
              },
            },
          },
        };
      })(i, o);
    throw o.wc(`Unsupported field value: ${Sm(i)}`);
  })(n, e);
}
function TT(n, e) {
  const t = {};
  return (
    cE(n)
      ? e.path && e.path.length > 0 && e.fieldMask.push(e.path)
      : No(n, (i, o) => {
          const a = ET(o, e.Vc(i));
          a != null && (t[i] = a);
        }),
    { mapValue: { fields: t } }
  );
}
function ST(n) {
  return !(
    typeof n != "object" ||
    n === null ||
    n instanceof Array ||
    n instanceof Date ||
    n instanceof Et ||
    n instanceof ti ||
    n instanceof cr ||
    n instanceof Jt ||
    n instanceof _T ||
    n instanceof ni
  );
}
function IT(n, e, t) {
  if (!ST(t) || !lE(t)) {
    const i = Sm(t);
    throw i === "an object" ? e.wc(n + " a custom object") : e.wc(n + " " + i);
  }
}
function SD(n, e, t) {
  if ((e = ai(e)) instanceof Ym) return e._internalPath;
  if (typeof e == "string") return RT(n, e);
  throw Ph("Field path arguments must be of type string or ", n, !1, void 0, t);
}
const ID = new RegExp("[~\\*/\\[\\]]");
function RT(n, e, t) {
  if (e.search(ID) >= 0)
    throw Ph(
      `Invalid field path (${e}). Paths must not contain '~', '*', '/', '[', or ']'`,
      n,
      !1,
      void 0,
      t,
    );
  try {
    return new Ym(...e.split("."))._internalPath;
  } catch {
    throw Ph(
      `Invalid field path (${e}). Paths must not be empty, begin with '.', end with '.', or contain '..'`,
      n,
      !1,
      void 0,
      t,
    );
  }
}
function Ph(n, e, t, i, o) {
  const a = i && !i.isEmpty(),
    u = o !== void 0;
  let d = `Function ${e}() called with invalid data`;
  (t && (d += " (via `toFirestore()`)"), (d += ". "));
  let f = "";
  return (
    (a || u) &&
      ((f += " (found"),
      a && (f += ` in field ${i}`),
      u && (f += ` in document ${o}`),
      (f += ")")),
    new ke(ie.INVALID_ARGUMENT, d + n + f)
  );
}
function RD(n, e) {
  return n.some((t) => t.isEqual(e));
}
class AT {
  constructor(e, t, i, o, a) {
    ((this._firestore = e),
      (this._userDataWriter = t),
      (this._key = i),
      (this._document = o),
      (this._converter = a));
  }
  get id() {
    return this._key.path.lastSegment();
  }
  get ref() {
    return new Jt(this._firestore, this._converter, this._key);
  }
  exists() {
    return this._document !== null;
  }
  data() {
    if (this._document) {
      if (this._converter) {
        const e = new AD(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          null,
        );
        return this._converter.fromFirestore(e);
      }
      return this._userDataWriter.convertValue(this._document.data.value);
    }
  }
  get(e) {
    if (this._document) {
      const t = this._document.data.field(CT("DocumentSnapshot.get", e));
      if (t !== null) return this._userDataWriter.convertValue(t);
    }
  }
}
class AD extends AT {
  data() {
    return super.data();
  }
}
function CT(n, e) {
  return typeof e == "string"
    ? RT(n, e)
    : e instanceof Ym
      ? e._internalPath
      : e._delegate._internalPath;
}
class CD {
  convertValue(e, t = "none") {
    switch (Hs(e)) {
      case 0:
        return null;
      case 1:
        return e.booleanValue;
      case 2:
        return Ot(e.integerValue || e.doubleValue);
      case 3:
        return this.convertTimestamp(e.timestampValue);
      case 4:
        return this.convertServerTimestamp(e, t);
      case 5:
        return e.stringValue;
      case 6:
        return this.convertBytes($s(e.bytesValue));
      case 7:
        return this.convertReference(e.referenceValue);
      case 8:
        return this.convertGeoPoint(e.geoPointValue);
      case 9:
        return this.convertArray(e.arrayValue, t);
      case 11:
        return this.convertObject(e.mapValue, t);
      case 10:
        return this.convertVectorValue(e.mapValue);
      default:
        throw Le(62114, { value: e });
    }
  }
  convertObject(e, t) {
    return this.convertObjectMap(e.fields, t);
  }
  convertObjectMap(e, t = "none") {
    const i = {};
    return (
      No(e, (o, a) => {
        i[o] = this.convertValue(a, t);
      }),
      i
    );
  }
  convertVectorValue(e) {
    var t, i, o;
    const a =
      (o =
        (i =
          (t = e.fields) === null || t === void 0
            ? void 0
            : t[_h].arrayValue) === null || i === void 0
          ? void 0
          : i.values) === null || o === void 0
        ? void 0
        : o.map((u) => Ot(u.doubleValue));
    return new ni(a);
  }
  convertGeoPoint(e) {
    return new ti(Ot(e.latitude), Ot(e.longitude));
  }
  convertArray(e, t) {
    return (e.values || []).map((i) => this.convertValue(i, t));
  }
  convertServerTimestamp(e, t) {
    switch (t) {
      case "previous":
        const i = Yh(e);
        return i == null ? null : this.convertValue(i, t);
      case "estimate":
        return this.convertTimestamp(nu(e));
      default:
        return null;
    }
  }
  convertTimestamp(e) {
    const t = Bs(e);
    return new Et(t.seconds, t.nanos);
  }
  convertDocumentKey(e, t) {
    const i = kt.fromString(e);
    at(KE(i), 9688, { name: e });
    const o = new ru(i.get(1), i.get(3)),
      a = new De(i.popFirst(5));
    return (
      o.isEqual(t) ||
        ji(
          `Document ${a} contains a document reference within a different database (${o.projectId}/${o.database}) which is not supported. It will be treated as a reference in the current database (${t.projectId}/${t.database}) instead.`,
        ),
      a
    );
  }
}
function PD(n, e, t) {
  let i;
  return (
    (i = n
      ? t && (t.merge || t.mergeFields)
        ? n.toFirestore(e, t)
        : n.toFirestore(e)
      : e),
    i
  );
}
class Ml {
  constructor(e, t) {
    ((this.hasPendingWrites = e), (this.fromCache = t));
  }
  isEqual(e) {
    return (
      this.hasPendingWrites === e.hasPendingWrites &&
      this.fromCache === e.fromCache
    );
  }
}
class Ro extends AT {
  constructor(e, t, i, o, a, u) {
    (super(e, t, i, o, u),
      (this._firestore = e),
      (this._firestoreImpl = e),
      (this.metadata = a));
  }
  exists() {
    return super.exists();
  }
  data(e = {}) {
    if (this._document) {
      if (this._converter) {
        const t = new eh(
          this._firestore,
          this._userDataWriter,
          this._key,
          this._document,
          this.metadata,
          null,
        );
        return this._converter.fromFirestore(t, e);
      }
      return this._userDataWriter.convertValue(
        this._document.data.value,
        e.serverTimestamps,
      );
    }
  }
  get(e, t = {}) {
    if (this._document) {
      const i = this._document.data.field(CT("DocumentSnapshot.get", e));
      if (i !== null)
        return this._userDataWriter.convertValue(i, t.serverTimestamps);
    }
  }
  toJSON() {
    if (this.metadata.hasPendingWrites)
      throw new ke(
        ie.FAILED_PRECONDITION,
        "DocumentSnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().",
      );
    const e = this._document,
      t = {};
    return (
      (t.type = Ro._jsonSchemaVersion),
      (t.bundle = ""),
      (t.bundleSource = "DocumentSnapshot"),
      (t.bundleName = this._key.toString()),
      !e || !e.isValidDocument() || !e.isFoundDocument()
        ? t
        : (this._userDataWriter.convertObjectMap(
            e.data.value.mapValue.fields,
            "previous",
          ),
          (t.bundle = (this._firestore, this.ref.path, "NOT SUPPORTED")),
          t)
    );
  }
}
((Ro._jsonSchemaVersion = "firestore/documentSnapshot/1.0"),
  (Ro._jsonSchema = {
    type: zt("string", Ro._jsonSchemaVersion),
    bundleSource: zt("string", "DocumentSnapshot"),
    bundleName: zt("string"),
    bundle: zt("string"),
  }));
class eh extends Ro {
  data(e = {}) {
    return super.data(e);
  }
}
class $l {
  constructor(e, t, i, o) {
    ((this._firestore = e),
      (this._userDataWriter = t),
      (this._snapshot = o),
      (this.metadata = new Ml(o.hasPendingWrites, o.fromCache)),
      (this.query = i));
  }
  get docs() {
    const e = [];
    return (this.forEach((t) => e.push(t)), e);
  }
  get size() {
    return this._snapshot.docs.size;
  }
  get empty() {
    return this.size === 0;
  }
  forEach(e, t) {
    this._snapshot.docs.forEach((i) => {
      e.call(
        t,
        new eh(
          this._firestore,
          this._userDataWriter,
          i.key,
          i,
          new Ml(
            this._snapshot.mutatedKeys.has(i.key),
            this._snapshot.fromCache,
          ),
          this.query.converter,
        ),
      );
    });
  }
  docChanges(e = {}) {
    const t = !!e.includeMetadataChanges;
    if (t && this._snapshot.excludesMetadataChanges)
      throw new ke(
        ie.INVALID_ARGUMENT,
        "To include metadata changes with your document changes, you must also pass { includeMetadataChanges:true } to onSnapshot().",
      );
    return (
      (this._cachedChanges &&
        this._cachedChangesIncludeMetadataChanges === t) ||
        ((this._cachedChanges = (function (o, a) {
          if (o._snapshot.oldDocs.isEmpty()) {
            let u = 0;
            return o._snapshot.docChanges.map((d) => {
              const f = new eh(
                o._firestore,
                o._userDataWriter,
                d.doc.key,
                d.doc,
                new Ml(
                  o._snapshot.mutatedKeys.has(d.doc.key),
                  o._snapshot.fromCache,
                ),
                o.query.converter,
              );
              return (
                d.doc,
                { type: "added", doc: f, oldIndex: -1, newIndex: u++ }
              );
            });
          }
          {
            let u = o._snapshot.oldDocs;
            return o._snapshot.docChanges
              .filter((d) => a || d.type !== 3)
              .map((d) => {
                const f = new eh(
                  o._firestore,
                  o._userDataWriter,
                  d.doc.key,
                  d.doc,
                  new Ml(
                    o._snapshot.mutatedKeys.has(d.doc.key),
                    o._snapshot.fromCache,
                  ),
                  o.query.converter,
                );
                let m = -1,
                  v = -1;
                return (
                  d.type !== 0 &&
                    ((m = u.indexOf(d.doc.key)), (u = u.delete(d.doc.key))),
                  d.type !== 1 &&
                    ((u = u.add(d.doc)), (v = u.indexOf(d.doc.key))),
                  { type: kD(d.type), doc: f, oldIndex: m, newIndex: v }
                );
              });
          }
        })(this, t)),
        (this._cachedChangesIncludeMetadataChanges = t)),
      this._cachedChanges
    );
  }
  toJSON() {
    if (this.metadata.hasPendingWrites)
      throw new ke(
        ie.FAILED_PRECONDITION,
        "QuerySnapshot.toJSON() attempted to serialize a document with pending writes. Await waitForPendingWrites() before invoking toJSON().",
      );
    const e = {};
    ((e.type = $l._jsonSchemaVersion),
      (e.bundleSource = "QuerySnapshot"),
      (e.bundleName = Tm.newId()),
      this._firestore._databaseId.database,
      this._firestore._databaseId.projectId);
    const t = [],
      i = [],
      o = [];
    return (
      this.docs.forEach((a) => {
        a._document !== null &&
          (t.push(a._document),
          i.push(
            this._userDataWriter.convertObjectMap(
              a._document.data.value.mapValue.fields,
              "previous",
            ),
          ),
          o.push(a.ref.path));
      }),
      (e.bundle =
        (this._firestore, this.query._query, e.bundleName, "NOT SUPPORTED")),
      e
    );
  }
}
function kD(n) {
  switch (n) {
    case 0:
      return "added";
    case 2:
    case 3:
      return "modified";
    case 1:
      return "removed";
    default:
      return Le(61501, { type: n });
  }
}
function xD(n) {
  n = eu(n, Jt);
  const e = eu(n.firestore, Qm);
  return pD(vT(e), n._key).then((t) => OD(e, n, t));
}
(($l._jsonSchemaVersion = "firestore/querySnapshot/1.0"),
  ($l._jsonSchema = {
    type: zt("string", $l._jsonSchemaVersion),
    bundleSource: zt("string", "QuerySnapshot"),
    bundleName: zt("string"),
    bundle: zt("string"),
  }));
class bD extends CD {
  constructor(e) {
    (super(), (this.firestore = e));
  }
  convertBytes(e) {
    return new cr(e);
  }
  convertReference(e) {
    const t = this.convertDocumentKey(e, this.firestore._databaseId);
    return new Jt(this.firestore, null, t);
  }
}
function DD(n, e, t) {
  n = eu(n, Jt);
  const i = eu(n.firestore, Qm),
    o = PD(n.converter, e, t);
  return ND(i, [
    TD(ED(i), "setDoc", n._key, o, n.converter !== null, t).toMutation(
      n._key,
      Fi.none(),
    ),
  ]);
}
function ND(n, e) {
  return (function (i, o) {
    const a = new Fs();
    return (
      i.asyncQueue.enqueueAndForget(async () => eD(await dD(i), o, a)),
      a.promise
    );
  })(vT(n), e);
}
function OD(n, e, t) {
  const i = t.docs.get(e._key),
    o = new bD(n);
  return new Ro(
    n,
    o,
    e._key,
    i,
    new Ml(t.hasPendingWrites, t.fromCache),
    e.converter,
  );
}
(function (e, t = !0) {
  ((function (o) {
    $a = o;
  })(Ba),
    Na(
      new Po(
        "firestore",
        (i, { instanceIdentifier: o, options: a }) => {
          const u = i.getProvider("app").getImmediate(),
            d = new Qm(
              new vk(i.getProvider("auth-internal")),
              new Ek(u, i.getProvider("app-check-internal")),
              (function (m, v) {
                if (
                  !Object.prototype.hasOwnProperty.apply(m.options, [
                    "projectId",
                  ])
                )
                  throw new ke(
                    ie.INVALID_ARGUMENT,
                    '"projectId" not provided in firebase.initializeApp.',
                  );
                return new ru(m.options.projectId, v);
              })(u, o),
              u,
            );
          return (
            (a = Object.assign({ useFetchStreams: t }, a)),
            d._setSettings(a),
            d
          );
        },
        "PUBLIC",
      ).setMultipleInstances(!0),
    ),
    Ms(P_, k_, e),
    Ms(P_, k_, "esm2017"));
})();
var LD = "firebase",
  MD = "11.10.0";
Ms(LD, MD, "app");
function Jm(n, e) {
  var t = {};
  for (var i in n)
    Object.prototype.hasOwnProperty.call(n, i) &&
      e.indexOf(i) < 0 &&
      (t[i] = n[i]);
  if (n != null && typeof Object.getOwnPropertySymbols == "function")
    for (var o = 0, i = Object.getOwnPropertySymbols(n); o < i.length; o++)
      e.indexOf(i[o]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(n, i[o]) &&
        (t[i[o]] = n[i[o]]);
  return t;
}
function PT() {
  return {
    "dependent-sdk-initialized-before-auth":
      "Another Firebase SDK was initialized and is trying to use Auth before Auth is initialized. Please be sure to call `initializeAuth` or `getAuth` before starting any other Firebase SDK.",
  };
}
const VD = PT,
  kT = new pu("auth", "Firebase", PT());
const kh = new vm("@firebase/auth");
function FD(n, ...e) {
  kh.logLevel <= Qe.WARN && kh.warn(`Auth (${Ba}): ${n}`, ...e);
}
function th(n, ...e) {
  kh.logLevel <= Qe.ERROR && kh.error(`Auth (${Ba}): ${n}`, ...e);
}
function $i(n, ...e) {
  throw Zm(n, ...e);
}
function ri(n, ...e) {
  return Zm(n, ...e);
}
function xT(n, e, t) {
  const i = Object.assign(Object.assign({}, VD()), { [e]: t });
  return new pu("auth", "Firebase", i).create(e, { appName: n.name });
}
function Ao(n) {
  return xT(
    n,
    "operation-not-supported-in-this-environment",
    "Operations that alter the current user are not supported in conjunction with FirebaseServerApp",
  );
}
function Zm(n, ...e) {
  if (typeof n != "string") {
    const t = e[0],
      i = [...e.slice(1)];
    return (i[0] && (i[0].appName = n.name), n._errorFactory.create(t, ...i));
  }
  return kT.create(n, ...e);
}
function Ve(n, e, ...t) {
  if (!n) throw Zm(e, ...t);
}
function Li(n) {
  const e = "INTERNAL ASSERTION FAILED: " + n;
  throw (th(e), new Error(e));
}
function Hi(n, e) {
  n || Li(e);
}
function Qp() {
  var n;
  return (
    (typeof self < "u" &&
      ((n = self.location) === null || n === void 0 ? void 0 : n.href)) ||
    ""
  );
}
function UD() {
  return S0() === "http:" || S0() === "https:";
}
function S0() {
  var n;
  return (
    (typeof self < "u" &&
      ((n = self.location) === null || n === void 0 ? void 0 : n.protocol)) ||
    null
  );
}
function zD() {
  return typeof navigator < "u" &&
    navigator &&
    "onLine" in navigator &&
    typeof navigator.onLine == "boolean" &&
    (UD() || QC() || "connection" in navigator)
    ? navigator.onLine
    : !0;
}
function jD() {
  if (typeof navigator > "u") return null;
  const n = navigator;
  return (n.languages && n.languages[0]) || n.language || null;
}
class Eu {
  constructor(e, t) {
    ((this.shortDelay = e),
      (this.longDelay = t),
      Hi(t > e, "Short delay should be less than long delay!"),
      (this.isMobile = qC() || YC()));
  }
  get() {
    return zD()
      ? this.isMobile
        ? this.longDelay
        : this.shortDelay
      : Math.min(5e3, this.shortDelay);
  }
}
function eg(n, e) {
  Hi(n.emulator, "Emulator should always be set here");
  const { url: t } = n.emulator;
  return e ? `${t}${e.startsWith("/") ? e.slice(1) : e}` : t;
}
class bT {
  static initialize(e, t, i) {
    ((this.fetchImpl = e),
      t && (this.headersImpl = t),
      i && (this.responseImpl = i));
  }
  static fetch() {
    if (this.fetchImpl) return this.fetchImpl;
    if (typeof self < "u" && "fetch" in self) return self.fetch;
    if (typeof globalThis < "u" && globalThis.fetch) return globalThis.fetch;
    if (typeof fetch < "u") return fetch;
    Li(
      "Could not find fetch implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill",
    );
  }
  static headers() {
    if (this.headersImpl) return this.headersImpl;
    if (typeof self < "u" && "Headers" in self) return self.Headers;
    if (typeof globalThis < "u" && globalThis.Headers)
      return globalThis.Headers;
    if (typeof Headers < "u") return Headers;
    Li(
      "Could not find Headers implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill",
    );
  }
  static response() {
    if (this.responseImpl) return this.responseImpl;
    if (typeof self < "u" && "Response" in self) return self.Response;
    if (typeof globalThis < "u" && globalThis.Response)
      return globalThis.Response;
    if (typeof Response < "u") return Response;
    Li(
      "Could not find Response implementation, make sure you call FetchProvider.initialize() with an appropriate polyfill",
    );
  }
}
const BD = {
  CREDENTIAL_MISMATCH: "custom-token-mismatch",
  MISSING_CUSTOM_TOKEN: "internal-error",
  INVALID_IDENTIFIER: "invalid-email",
  MISSING_CONTINUE_URI: "internal-error",
  INVALID_PASSWORD: "wrong-password",
  MISSING_PASSWORD: "missing-password",
  INVALID_LOGIN_CREDENTIALS: "invalid-credential",
  EMAIL_EXISTS: "email-already-in-use",
  PASSWORD_LOGIN_DISABLED: "operation-not-allowed",
  INVALID_IDP_RESPONSE: "invalid-credential",
  INVALID_PENDING_TOKEN: "invalid-credential",
  FEDERATED_USER_ID_ALREADY_LINKED: "credential-already-in-use",
  MISSING_REQ_TYPE: "internal-error",
  EMAIL_NOT_FOUND: "user-not-found",
  RESET_PASSWORD_EXCEED_LIMIT: "too-many-requests",
  EXPIRED_OOB_CODE: "expired-action-code",
  INVALID_OOB_CODE: "invalid-action-code",
  MISSING_OOB_CODE: "internal-error",
  CREDENTIAL_TOO_OLD_LOGIN_AGAIN: "requires-recent-login",
  INVALID_ID_TOKEN: "invalid-user-token",
  TOKEN_EXPIRED: "user-token-expired",
  USER_NOT_FOUND: "user-token-expired",
  TOO_MANY_ATTEMPTS_TRY_LATER: "too-many-requests",
  PASSWORD_DOES_NOT_MEET_REQUIREMENTS: "password-does-not-meet-requirements",
  INVALID_CODE: "invalid-verification-code",
  INVALID_SESSION_INFO: "invalid-verification-id",
  INVALID_TEMPORARY_PROOF: "invalid-credential",
  MISSING_SESSION_INFO: "missing-verification-id",
  SESSION_EXPIRED: "code-expired",
  MISSING_ANDROID_PACKAGE_NAME: "missing-android-pkg-name",
  UNAUTHORIZED_DOMAIN: "unauthorized-continue-uri",
  INVALID_OAUTH_CLIENT_ID: "invalid-oauth-client-id",
  ADMIN_ONLY_OPERATION: "admin-restricted-operation",
  INVALID_MFA_PENDING_CREDENTIAL: "invalid-multi-factor-session",
  MFA_ENROLLMENT_NOT_FOUND: "multi-factor-info-not-found",
  MISSING_MFA_ENROLLMENT_ID: "missing-multi-factor-info",
  MISSING_MFA_PENDING_CREDENTIAL: "missing-multi-factor-session",
  SECOND_FACTOR_EXISTS: "second-factor-already-in-use",
  SECOND_FACTOR_LIMIT_EXCEEDED: "maximum-second-factor-count-exceeded",
  BLOCKING_FUNCTION_ERROR_RESPONSE: "internal-error",
  RECAPTCHA_NOT_ENABLED: "recaptcha-not-enabled",
  MISSING_RECAPTCHA_TOKEN: "missing-recaptcha-token",
  INVALID_RECAPTCHA_TOKEN: "invalid-recaptcha-token",
  INVALID_RECAPTCHA_ACTION: "invalid-recaptcha-action",
  MISSING_CLIENT_TYPE: "missing-client-type",
  MISSING_RECAPTCHA_VERSION: "missing-recaptcha-version",
  INVALID_RECAPTCHA_VERSION: "invalid-recaptcha-version",
  INVALID_REQ_TYPE: "invalid-req-type",
};
const $D = [
    "/v1/accounts:signInWithCustomToken",
    "/v1/accounts:signInWithEmailLink",
    "/v1/accounts:signInWithIdp",
    "/v1/accounts:signInWithPassword",
    "/v1/accounts:signInWithPhoneNumber",
    "/v1/token",
  ],
  HD = new Eu(3e4, 6e4);
function tg(n, e) {
  return n.tenantId && !e.tenantId
    ? Object.assign(Object.assign({}, e), { tenantId: n.tenantId })
    : e;
}
async function Ka(n, e, t, i, o = {}) {
  return DT(n, o, async () => {
    let a = {},
      u = {};
    i && (e === "GET" ? (u = i) : (a = { body: JSON.stringify(i) }));
    const d = mu(Object.assign({ key: n.config.apiKey }, u)).slice(1),
      f = await n._getAdditionalHeaders();
    ((f["Content-Type"] = "application/json"),
      n.languageCode && (f["X-Firebase-Locale"] = n.languageCode));
    const m = Object.assign({ method: e, headers: f }, a);
    return (
      GC() || (m.referrerPolicy = "no-referrer"),
      n.emulatorConfig &&
        ja(n.emulatorConfig.host) &&
        (m.credentials = "include"),
      bT.fetch()(await NT(n, n.config.apiHost, t, d), m)
    );
  });
}
async function DT(n, e, t) {
  n._canInitEmulator = !1;
  const i = Object.assign(Object.assign({}, BD), e);
  try {
    const o = new qD(n),
      a = await Promise.race([t(), o.promise]);
    o.clearNetworkTimeout();
    const u = await a.json();
    if ("needConfirmation" in u)
      throw Bc(n, "account-exists-with-different-credential", u);
    if (a.ok && !("errorMessage" in u)) return u;
    {
      const d = a.ok ? u.errorMessage : u.error.message,
        [f, m] = d.split(" : ");
      if (f === "FEDERATED_USER_ID_ALREADY_LINKED")
        throw Bc(n, "credential-already-in-use", u);
      if (f === "EMAIL_EXISTS") throw Bc(n, "email-already-in-use", u);
      if (f === "USER_DISABLED") throw Bc(n, "user-disabled", u);
      const v = i[f] || f.toLowerCase().replace(/[_\s]+/g, "-");
      if (m) throw xT(n, v, m);
      $i(n, v);
    }
  } catch (o) {
    if (o instanceof qi) throw o;
    $i(n, "network-request-failed", { message: String(o) });
  }
}
async function WD(n, e, t, i, o = {}) {
  const a = await Ka(n, e, t, i, o);
  return (
    "mfaPendingCredential" in a &&
      $i(n, "multi-factor-auth-required", { _serverResponse: a }),
    a
  );
}
async function NT(n, e, t, i) {
  const o = `${e}${t}?${i}`,
    a = n,
    u = a.config.emulator ? eg(n.config, o) : `${n.config.apiScheme}://${o}`;
  return $D.includes(t) &&
    (await a._persistenceManagerAvailable, a._getPersistenceType() === "COOKIE")
    ? a._getPersistence()._getFinalTarget(u).toString()
    : u;
}
class qD {
  clearNetworkTimeout() {
    clearTimeout(this.timer);
  }
  constructor(e) {
    ((this.auth = e),
      (this.timer = null),
      (this.promise = new Promise((t, i) => {
        this.timer = setTimeout(
          () => i(ri(this.auth, "network-request-failed")),
          HD.get(),
        );
      })));
  }
}
function Bc(n, e, t) {
  const i = { appName: n.name };
  (t.email && (i.email = t.email),
    t.phoneNumber && (i.phoneNumber = t.phoneNumber));
  const o = ri(n, e, i);
  return ((o.customData._tokenResponse = t), o);
}
async function KD(n, e) {
  return Ka(n, "POST", "/v1/accounts:delete", e);
}
async function xh(n, e) {
  return Ka(n, "POST", "/v1/accounts:lookup", e);
}
function Hl(n) {
  if (n)
    try {
      const e = new Date(Number(n));
      if (!isNaN(e.getTime())) return e.toUTCString();
    } catch {}
}
async function GD(n, e = !1) {
  const t = ai(n),
    i = await t.getIdToken(e),
    o = ng(i);
  Ve(o && o.exp && o.auth_time && o.iat, t.auth, "internal-error");
  const a = typeof o.firebase == "object" ? o.firebase : void 0,
    u = a?.sign_in_provider;
  return {
    claims: o,
    token: i,
    authTime: Hl(up(o.auth_time)),
    issuedAtTime: Hl(up(o.iat)),
    expirationTime: Hl(up(o.exp)),
    signInProvider: u || null,
    signInSecondFactor: a?.sign_in_second_factor || null,
  };
}
function up(n) {
  return Number(n) * 1e3;
}
function ng(n) {
  const [e, t, i] = n.split(".");
  if (e === void 0 || t === void 0 || i === void 0)
    return (th("JWT malformed, contained fewer than 3 sections"), null);
  try {
    const o = jw(t);
    return o
      ? JSON.parse(o)
      : (th("Failed to decode base64 JWT payload"), null);
  } catch (o) {
    return (
      th("Caught error parsing JWT payload as JSON", o?.toString()),
      null
    );
  }
}
function I0(n) {
  const e = ng(n);
  return (
    Ve(e, "internal-error"),
    Ve(typeof e.exp < "u", "internal-error"),
    Ve(typeof e.iat < "u", "internal-error"),
    Number(e.exp) - Number(e.iat)
  );
}
async function lu(n, e, t = !1) {
  if (t) return e;
  try {
    return await e;
  } catch (i) {
    throw (
      i instanceof qi &&
        QD(i) &&
        n.auth.currentUser === n &&
        (await n.auth.signOut()),
      i
    );
  }
}
function QD({ code: n }) {
  return n === "auth/user-disabled" || n === "auth/user-token-expired";
}
class YD {
  constructor(e) {
    ((this.user = e),
      (this.isRunning = !1),
      (this.timerId = null),
      (this.errorBackoff = 3e4));
  }
  _start() {
    this.isRunning || ((this.isRunning = !0), this.schedule());
  }
  _stop() {
    this.isRunning &&
      ((this.isRunning = !1),
      this.timerId !== null && clearTimeout(this.timerId));
  }
  getInterval(e) {
    var t;
    if (e) {
      const i = this.errorBackoff;
      return ((this.errorBackoff = Math.min(this.errorBackoff * 2, 96e4)), i);
    } else {
      this.errorBackoff = 3e4;
      const o =
        ((t = this.user.stsTokenManager.expirationTime) !== null && t !== void 0
          ? t
          : 0) -
        Date.now() -
        3e5;
      return Math.max(0, o);
    }
  }
  schedule(e = !1) {
    if (!this.isRunning) return;
    const t = this.getInterval(e);
    this.timerId = setTimeout(async () => {
      await this.iteration();
    }, t);
  }
  async iteration() {
    try {
      await this.user.getIdToken(!0);
    } catch (e) {
      e?.code === "auth/network-request-failed" && this.schedule(!0);
      return;
    }
    this.schedule();
  }
}
class Yp {
  constructor(e, t) {
    ((this.createdAt = e), (this.lastLoginAt = t), this._initializeTime());
  }
  _initializeTime() {
    ((this.lastSignInTime = Hl(this.lastLoginAt)),
      (this.creationTime = Hl(this.createdAt)));
  }
  _copy(e) {
    ((this.createdAt = e.createdAt),
      (this.lastLoginAt = e.lastLoginAt),
      this._initializeTime());
  }
  toJSON() {
    return { createdAt: this.createdAt, lastLoginAt: this.lastLoginAt };
  }
}
async function bh(n) {
  var e;
  const t = n.auth,
    i = await n.getIdToken(),
    o = await lu(n, xh(t, { idToken: i }));
  Ve(o?.users.length, t, "internal-error");
  const a = o.users[0];
  n._notifyReloadListener(a);
  const u =
      !((e = a.providerUserInfo) === null || e === void 0) && e.length
        ? OT(a.providerUserInfo)
        : [],
    d = JD(n.providerData, u),
    f = n.isAnonymous,
    m = !(n.email && a.passwordHash) && !d?.length,
    v = f ? m : !1,
    w = {
      uid: a.localId,
      displayName: a.displayName || null,
      photoURL: a.photoUrl || null,
      email: a.email || null,
      emailVerified: a.emailVerified || !1,
      phoneNumber: a.phoneNumber || null,
      tenantId: a.tenantId || null,
      providerData: d,
      metadata: new Yp(a.createdAt, a.lastLoginAt),
      isAnonymous: v,
    };
  Object.assign(n, w);
}
async function XD(n) {
  const e = ai(n);
  (await bh(e),
    await e.auth._persistUserIfCurrent(e),
    e.auth._notifyListenersIfCurrent(e));
}
function JD(n, e) {
  return [
    ...n.filter((i) => !e.some((o) => o.providerId === i.providerId)),
    ...e,
  ];
}
function OT(n) {
  return n.map((e) => {
    var { providerId: t } = e,
      i = Jm(e, ["providerId"]);
    return {
      providerId: t,
      uid: i.rawId || "",
      displayName: i.displayName || null,
      email: i.email || null,
      phoneNumber: i.phoneNumber || null,
      photoURL: i.photoUrl || null,
    };
  });
}
async function ZD(n, e) {
  const t = await DT(n, {}, async () => {
    const i = mu({ grant_type: "refresh_token", refresh_token: e }).slice(1),
      { tokenApiHost: o, apiKey: a } = n.config,
      u = await NT(n, o, "/v1/token", `key=${a}`),
      d = await n._getAdditionalHeaders();
    d["Content-Type"] = "application/x-www-form-urlencoded";
    const f = { method: "POST", headers: d, body: i };
    return (
      n.emulatorConfig &&
        ja(n.emulatorConfig.host) &&
        (f.credentials = "include"),
      bT.fetch()(u, f)
    );
  });
  return {
    accessToken: t.access_token,
    expiresIn: t.expires_in,
    refreshToken: t.refresh_token,
  };
}
async function eN(n, e) {
  return Ka(n, "POST", "/v2/accounts:revokeToken", tg(n, e));
}
class Pa {
  constructor() {
    ((this.refreshToken = null),
      (this.accessToken = null),
      (this.expirationTime = null));
  }
  get isExpired() {
    return !this.expirationTime || Date.now() > this.expirationTime - 3e4;
  }
  updateFromServerResponse(e) {
    (Ve(e.idToken, "internal-error"),
      Ve(typeof e.idToken < "u", "internal-error"),
      Ve(typeof e.refreshToken < "u", "internal-error"));
    const t =
      "expiresIn" in e && typeof e.expiresIn < "u"
        ? Number(e.expiresIn)
        : I0(e.idToken);
    this.updateTokensAndExpiration(e.idToken, e.refreshToken, t);
  }
  updateFromIdToken(e) {
    Ve(e.length !== 0, "internal-error");
    const t = I0(e);
    this.updateTokensAndExpiration(e, null, t);
  }
  async getToken(e, t = !1) {
    return !t && this.accessToken && !this.isExpired
      ? this.accessToken
      : (Ve(this.refreshToken, e, "user-token-expired"),
        this.refreshToken
          ? (await this.refresh(e, this.refreshToken), this.accessToken)
          : null);
  }
  clearRefreshToken() {
    this.refreshToken = null;
  }
  async refresh(e, t) {
    const { accessToken: i, refreshToken: o, expiresIn: a } = await ZD(e, t);
    this.updateTokensAndExpiration(i, o, Number(a));
  }
  updateTokensAndExpiration(e, t, i) {
    ((this.refreshToken = t || null),
      (this.accessToken = e || null),
      (this.expirationTime = Date.now() + i * 1e3));
  }
  static fromJSON(e, t) {
    const { refreshToken: i, accessToken: o, expirationTime: a } = t,
      u = new Pa();
    return (
      i &&
        (Ve(typeof i == "string", "internal-error", { appName: e }),
        (u.refreshToken = i)),
      o &&
        (Ve(typeof o == "string", "internal-error", { appName: e }),
        (u.accessToken = o)),
      a &&
        (Ve(typeof a == "number", "internal-error", { appName: e }),
        (u.expirationTime = a)),
      u
    );
  }
  toJSON() {
    return {
      refreshToken: this.refreshToken,
      accessToken: this.accessToken,
      expirationTime: this.expirationTime,
    };
  }
  _assign(e) {
    ((this.accessToken = e.accessToken),
      (this.refreshToken = e.refreshToken),
      (this.expirationTime = e.expirationTime));
  }
  _clone() {
    return Object.assign(new Pa(), this.toJSON());
  }
  _performRefresh() {
    return Li("not implemented");
  }
}
function Ss(n, e) {
  Ve(typeof n == "string" || typeof n > "u", "internal-error", { appName: e });
}
class Dr {
  constructor(e) {
    var { uid: t, auth: i, stsTokenManager: o } = e,
      a = Jm(e, ["uid", "auth", "stsTokenManager"]);
    ((this.providerId = "firebase"),
      (this.proactiveRefresh = new YD(this)),
      (this.reloadUserInfo = null),
      (this.reloadListener = null),
      (this.uid = t),
      (this.auth = i),
      (this.stsTokenManager = o),
      (this.accessToken = o.accessToken),
      (this.displayName = a.displayName || null),
      (this.email = a.email || null),
      (this.emailVerified = a.emailVerified || !1),
      (this.phoneNumber = a.phoneNumber || null),
      (this.photoURL = a.photoURL || null),
      (this.isAnonymous = a.isAnonymous || !1),
      (this.tenantId = a.tenantId || null),
      (this.providerData = a.providerData ? [...a.providerData] : []),
      (this.metadata = new Yp(a.createdAt || void 0, a.lastLoginAt || void 0)));
  }
  async getIdToken(e) {
    const t = await lu(this, this.stsTokenManager.getToken(this.auth, e));
    return (
      Ve(t, this.auth, "internal-error"),
      this.accessToken !== t &&
        ((this.accessToken = t),
        await this.auth._persistUserIfCurrent(this),
        this.auth._notifyListenersIfCurrent(this)),
      t
    );
  }
  getIdTokenResult(e) {
    return GD(this, e);
  }
  reload() {
    return XD(this);
  }
  _assign(e) {
    this !== e &&
      (Ve(this.uid === e.uid, this.auth, "internal-error"),
      (this.displayName = e.displayName),
      (this.photoURL = e.photoURL),
      (this.email = e.email),
      (this.emailVerified = e.emailVerified),
      (this.phoneNumber = e.phoneNumber),
      (this.isAnonymous = e.isAnonymous),
      (this.tenantId = e.tenantId),
      (this.providerData = e.providerData.map((t) => Object.assign({}, t))),
      this.metadata._copy(e.metadata),
      this.stsTokenManager._assign(e.stsTokenManager));
  }
  _clone(e) {
    const t = new Dr(
      Object.assign(Object.assign({}, this), {
        auth: e,
        stsTokenManager: this.stsTokenManager._clone(),
      }),
    );
    return (t.metadata._copy(this.metadata), t);
  }
  _onReload(e) {
    (Ve(!this.reloadListener, this.auth, "internal-error"),
      (this.reloadListener = e),
      this.reloadUserInfo &&
        (this._notifyReloadListener(this.reloadUserInfo),
        (this.reloadUserInfo = null)));
  }
  _notifyReloadListener(e) {
    this.reloadListener ? this.reloadListener(e) : (this.reloadUserInfo = e);
  }
  _startProactiveRefresh() {
    this.proactiveRefresh._start();
  }
  _stopProactiveRefresh() {
    this.proactiveRefresh._stop();
  }
  async _updateTokensIfNecessary(e, t = !1) {
    let i = !1;
    (e.idToken &&
      e.idToken !== this.stsTokenManager.accessToken &&
      (this.stsTokenManager.updateFromServerResponse(e), (i = !0)),
      t && (await bh(this)),
      await this.auth._persistUserIfCurrent(this),
      i && this.auth._notifyListenersIfCurrent(this));
  }
  async delete() {
    if (Xr(this.auth.app)) return Promise.reject(Ao(this.auth));
    const e = await this.getIdToken();
    return (
      await lu(this, KD(this.auth, { idToken: e })),
      this.stsTokenManager.clearRefreshToken(),
      this.auth.signOut()
    );
  }
  toJSON() {
    return Object.assign(
      Object.assign(
        {
          uid: this.uid,
          email: this.email || void 0,
          emailVerified: this.emailVerified,
          displayName: this.displayName || void 0,
          isAnonymous: this.isAnonymous,
          photoURL: this.photoURL || void 0,
          phoneNumber: this.phoneNumber || void 0,
          tenantId: this.tenantId || void 0,
          providerData: this.providerData.map((e) => Object.assign({}, e)),
          stsTokenManager: this.stsTokenManager.toJSON(),
          _redirectEventId: this._redirectEventId,
        },
        this.metadata.toJSON(),
      ),
      { apiKey: this.auth.config.apiKey, appName: this.auth.name },
    );
  }
  get refreshToken() {
    return this.stsTokenManager.refreshToken || "";
  }
  static _fromJSON(e, t) {
    var i, o, a, u, d, f, m, v;
    const w = (i = t.displayName) !== null && i !== void 0 ? i : void 0,
      T = (o = t.email) !== null && o !== void 0 ? o : void 0,
      A = (a = t.phoneNumber) !== null && a !== void 0 ? a : void 0,
      D = (u = t.photoURL) !== null && u !== void 0 ? u : void 0,
      j = (d = t.tenantId) !== null && d !== void 0 ? d : void 0,
      O = (f = t._redirectEventId) !== null && f !== void 0 ? f : void 0,
      X = (m = t.createdAt) !== null && m !== void 0 ? m : void 0,
      q = (v = t.lastLoginAt) !== null && v !== void 0 ? v : void 0,
      {
        uid: G,
        emailVerified: ae,
        isAnonymous: ee,
        providerData: he,
        stsTokenManager: S,
      } = t;
    Ve(G && S, e, "internal-error");
    const R = Pa.fromJSON(this.name, S);
    (Ve(typeof G == "string", e, "internal-error"),
      Ss(w, e.name),
      Ss(T, e.name),
      Ve(typeof ae == "boolean", e, "internal-error"),
      Ve(typeof ee == "boolean", e, "internal-error"),
      Ss(A, e.name),
      Ss(D, e.name),
      Ss(j, e.name),
      Ss(O, e.name),
      Ss(X, e.name),
      Ss(q, e.name));
    const C = new Dr({
      uid: G,
      auth: e,
      email: T,
      emailVerified: ae,
      displayName: w,
      isAnonymous: ee,
      photoURL: D,
      phoneNumber: A,
      tenantId: j,
      stsTokenManager: R,
      createdAt: X,
      lastLoginAt: q,
    });
    return (
      he &&
        Array.isArray(he) &&
        (C.providerData = he.map((x) => Object.assign({}, x))),
      O && (C._redirectEventId = O),
      C
    );
  }
  static async _fromIdTokenResponse(e, t, i = !1) {
    const o = new Pa();
    o.updateFromServerResponse(t);
    const a = new Dr({
      uid: t.localId,
      auth: e,
      stsTokenManager: o,
      isAnonymous: i,
    });
    return (await bh(a), a);
  }
  static async _fromGetAccountInfoResponse(e, t, i) {
    const o = t.users[0];
    Ve(o.localId !== void 0, "internal-error");
    const a = o.providerUserInfo !== void 0 ? OT(o.providerUserInfo) : [],
      u = !(o.email && o.passwordHash) && !a?.length,
      d = new Pa();
    d.updateFromIdToken(i);
    const f = new Dr({
        uid: o.localId,
        auth: e,
        stsTokenManager: d,
        isAnonymous: u,
      }),
      m = {
        uid: o.localId,
        displayName: o.displayName || null,
        photoURL: o.photoUrl || null,
        email: o.email || null,
        emailVerified: o.emailVerified || !1,
        phoneNumber: o.phoneNumber || null,
        tenantId: o.tenantId || null,
        providerData: a,
        metadata: new Yp(o.createdAt, o.lastLoginAt),
        isAnonymous: !(o.email && o.passwordHash) && !a?.length,
      };
    return (Object.assign(f, m), f);
  }
}
const R0 = new Map();
function Mi(n) {
  Hi(n instanceof Function, "Expected a class definition");
  let e = R0.get(n);
  return e
    ? (Hi(e instanceof n, "Instance stored in cache mismatched with class"), e)
    : ((e = new n()), R0.set(n, e), e);
}
class LT {
  constructor() {
    ((this.type = "NONE"), (this.storage = {}));
  }
  async _isAvailable() {
    return !0;
  }
  async _set(e, t) {
    this.storage[e] = t;
  }
  async _get(e) {
    const t = this.storage[e];
    return t === void 0 ? null : t;
  }
  async _remove(e) {
    delete this.storage[e];
  }
  _addListener(e, t) {}
  _removeListener(e, t) {}
}
LT.type = "NONE";
const A0 = LT;
function nh(n, e, t) {
  return `firebase:${n}:${e}:${t}`;
}
class ka {
  constructor(e, t, i) {
    ((this.persistence = e), (this.auth = t), (this.userKey = i));
    const { config: o, name: a } = this.auth;
    ((this.fullUserKey = nh(this.userKey, o.apiKey, a)),
      (this.fullPersistenceKey = nh("persistence", o.apiKey, a)),
      (this.boundEventHandler = t._onStorageEvent.bind(t)),
      this.persistence._addListener(this.fullUserKey, this.boundEventHandler));
  }
  setCurrentUser(e) {
    return this.persistence._set(this.fullUserKey, e.toJSON());
  }
  async getCurrentUser() {
    const e = await this.persistence._get(this.fullUserKey);
    if (!e) return null;
    if (typeof e == "string") {
      const t = await xh(this.auth, { idToken: e }).catch(() => {});
      return t ? Dr._fromGetAccountInfoResponse(this.auth, t, e) : null;
    }
    return Dr._fromJSON(this.auth, e);
  }
  removeCurrentUser() {
    return this.persistence._remove(this.fullUserKey);
  }
  savePersistenceForRedirect() {
    return this.persistence._set(
      this.fullPersistenceKey,
      this.persistence.type,
    );
  }
  async setPersistence(e) {
    if (this.persistence === e) return;
    const t = await this.getCurrentUser();
    if ((await this.removeCurrentUser(), (this.persistence = e), t))
      return this.setCurrentUser(t);
  }
  delete() {
    this.persistence._removeListener(this.fullUserKey, this.boundEventHandler);
  }
  static async create(e, t, i = "authUser") {
    if (!t.length) return new ka(Mi(A0), e, i);
    const o = (
      await Promise.all(
        t.map(async (m) => {
          if (await m._isAvailable()) return m;
        }),
      )
    ).filter((m) => m);
    let a = o[0] || Mi(A0);
    const u = nh(i, e.config.apiKey, e.name);
    let d = null;
    for (const m of t)
      try {
        const v = await m._get(u);
        if (v) {
          let w;
          if (typeof v == "string") {
            const T = await xh(e, { idToken: v }).catch(() => {});
            if (!T) break;
            w = await Dr._fromGetAccountInfoResponse(e, T, v);
          } else w = Dr._fromJSON(e, v);
          (m !== a && (d = w), (a = m));
          break;
        }
      } catch {}
    const f = o.filter((m) => m._shouldAllowMigration);
    return !a._shouldAllowMigration || !f.length
      ? new ka(a, e, i)
      : ((a = f[0]),
        d && (await a._set(u, d.toJSON())),
        await Promise.all(
          t.map(async (m) => {
            if (m !== a)
              try {
                await m._remove(u);
              } catch {}
          }),
        ),
        new ka(a, e, i));
  }
}
function C0(n) {
  const e = n.toLowerCase();
  if (e.includes("opera/") || e.includes("opr/") || e.includes("opios/"))
    return "Opera";
  if (UT(e)) return "IEMobile";
  if (e.includes("msie") || e.includes("trident/")) return "IE";
  if (e.includes("edge/")) return "Edge";
  if (MT(e)) return "Firefox";
  if (e.includes("silk/")) return "Silk";
  if (jT(e)) return "Blackberry";
  if (BT(e)) return "Webos";
  if (VT(e)) return "Safari";
  if ((e.includes("chrome/") || FT(e)) && !e.includes("edge/")) return "Chrome";
  if (zT(e)) return "Android";
  {
    const t = /([a-zA-Z\d\.]+)\/[a-zA-Z\d\.]*$/,
      i = n.match(t);
    if (i?.length === 2) return i[1];
  }
  return "Other";
}
function MT(n = yn()) {
  return /firefox\//i.test(n);
}
function VT(n = yn()) {
  const e = n.toLowerCase();
  return (
    e.includes("safari/") &&
    !e.includes("chrome/") &&
    !e.includes("crios/") &&
    !e.includes("android")
  );
}
function FT(n = yn()) {
  return /crios\//i.test(n);
}
function UT(n = yn()) {
  return /iemobile/i.test(n);
}
function zT(n = yn()) {
  return /android/i.test(n);
}
function jT(n = yn()) {
  return /blackberry/i.test(n);
}
function BT(n = yn()) {
  return /webos/i.test(n);
}
function rg(n = yn()) {
  return (
    /iphone|ipad|ipod/i.test(n) || (/macintosh/i.test(n) && /mobile/i.test(n))
  );
}
function tN(n = yn()) {
  var e;
  return (
    rg(n) &&
    !!(!((e = window.navigator) === null || e === void 0) && e.standalone)
  );
}
function nN() {
  return XC() && document.documentMode === 10;
}
function $T(n = yn()) {
  return rg(n) || zT(n) || BT(n) || jT(n) || /windows phone/i.test(n) || UT(n);
}
function HT(n, e = []) {
  let t;
  switch (n) {
    case "Browser":
      t = C0(yn());
      break;
    case "Worker":
      t = `${C0(yn())}-${n}`;
      break;
    default:
      t = n;
  }
  const i = e.length ? e.join(",") : "FirebaseCore-web";
  return `${t}/JsCore/${Ba}/${i}`;
}
class rN {
  constructor(e) {
    ((this.auth = e), (this.queue = []));
  }
  pushCallback(e, t) {
    const i = (a) =>
      new Promise((u, d) => {
        try {
          const f = e(a);
          u(f);
        } catch (f) {
          d(f);
        }
      });
    ((i.onAbort = t), this.queue.push(i));
    const o = this.queue.length - 1;
    return () => {
      this.queue[o] = () => Promise.resolve();
    };
  }
  async runMiddleware(e) {
    if (this.auth.currentUser === e) return;
    const t = [];
    try {
      for (const i of this.queue) (await i(e), i.onAbort && t.push(i.onAbort));
    } catch (i) {
      t.reverse();
      for (const o of t)
        try {
          o();
        } catch {}
      throw this.auth._errorFactory.create("login-blocked", {
        originalMessage: i?.message,
      });
    }
  }
}
async function iN(n, e = {}) {
  return Ka(n, "GET", "/v2/passwordPolicy", tg(n, e));
}
const sN = 6;
class oN {
  constructor(e) {
    var t, i, o, a;
    const u = e.customStrengthOptions;
    ((this.customStrengthOptions = {}),
      (this.customStrengthOptions.minPasswordLength =
        (t = u.minPasswordLength) !== null && t !== void 0 ? t : sN),
      u.maxPasswordLength &&
        (this.customStrengthOptions.maxPasswordLength = u.maxPasswordLength),
      u.containsLowercaseCharacter !== void 0 &&
        (this.customStrengthOptions.containsLowercaseLetter =
          u.containsLowercaseCharacter),
      u.containsUppercaseCharacter !== void 0 &&
        (this.customStrengthOptions.containsUppercaseLetter =
          u.containsUppercaseCharacter),
      u.containsNumericCharacter !== void 0 &&
        (this.customStrengthOptions.containsNumericCharacter =
          u.containsNumericCharacter),
      u.containsNonAlphanumericCharacter !== void 0 &&
        (this.customStrengthOptions.containsNonAlphanumericCharacter =
          u.containsNonAlphanumericCharacter),
      (this.enforcementState = e.enforcementState),
      this.enforcementState === "ENFORCEMENT_STATE_UNSPECIFIED" &&
        (this.enforcementState = "OFF"),
      (this.allowedNonAlphanumericCharacters =
        (o =
          (i = e.allowedNonAlphanumericCharacters) === null || i === void 0
            ? void 0
            : i.join("")) !== null && o !== void 0
          ? o
          : ""),
      (this.forceUpgradeOnSignin =
        (a = e.forceUpgradeOnSignin) !== null && a !== void 0 ? a : !1),
      (this.schemaVersion = e.schemaVersion));
  }
  validatePassword(e) {
    var t, i, o, a, u, d;
    const f = { isValid: !0, passwordPolicy: this };
    return (
      this.validatePasswordLengthOptions(e, f),
      this.validatePasswordCharacterOptions(e, f),
      f.isValid &&
        (f.isValid =
          (t = f.meetsMinPasswordLength) !== null && t !== void 0 ? t : !0),
      f.isValid &&
        (f.isValid =
          (i = f.meetsMaxPasswordLength) !== null && i !== void 0 ? i : !0),
      f.isValid &&
        (f.isValid =
          (o = f.containsLowercaseLetter) !== null && o !== void 0 ? o : !0),
      f.isValid &&
        (f.isValid =
          (a = f.containsUppercaseLetter) !== null && a !== void 0 ? a : !0),
      f.isValid &&
        (f.isValid =
          (u = f.containsNumericCharacter) !== null && u !== void 0 ? u : !0),
      f.isValid &&
        (f.isValid =
          (d = f.containsNonAlphanumericCharacter) !== null && d !== void 0
            ? d
            : !0),
      f
    );
  }
  validatePasswordLengthOptions(e, t) {
    const i = this.customStrengthOptions.minPasswordLength,
      o = this.customStrengthOptions.maxPasswordLength;
    (i && (t.meetsMinPasswordLength = e.length >= i),
      o && (t.meetsMaxPasswordLength = e.length <= o));
  }
  validatePasswordCharacterOptions(e, t) {
    this.updatePasswordCharacterOptionsStatuses(t, !1, !1, !1, !1);
    let i;
    for (let o = 0; o < e.length; o++)
      ((i = e.charAt(o)),
        this.updatePasswordCharacterOptionsStatuses(
          t,
          i >= "a" && i <= "z",
          i >= "A" && i <= "Z",
          i >= "0" && i <= "9",
          this.allowedNonAlphanumericCharacters.includes(i),
        ));
  }
  updatePasswordCharacterOptionsStatuses(e, t, i, o, a) {
    (this.customStrengthOptions.containsLowercaseLetter &&
      (e.containsLowercaseLetter || (e.containsLowercaseLetter = t)),
      this.customStrengthOptions.containsUppercaseLetter &&
        (e.containsUppercaseLetter || (e.containsUppercaseLetter = i)),
      this.customStrengthOptions.containsNumericCharacter &&
        (e.containsNumericCharacter || (e.containsNumericCharacter = o)),
      this.customStrengthOptions.containsNonAlphanumericCharacter &&
        (e.containsNonAlphanumericCharacter ||
          (e.containsNonAlphanumericCharacter = a)));
  }
}
class aN {
  constructor(e, t, i, o) {
    ((this.app = e),
      (this.heartbeatServiceProvider = t),
      (this.appCheckServiceProvider = i),
      (this.config = o),
      (this.currentUser = null),
      (this.emulatorConfig = null),
      (this.operations = Promise.resolve()),
      (this.authStateSubscription = new P0(this)),
      (this.idTokenSubscription = new P0(this)),
      (this.beforeStateQueue = new rN(this)),
      (this.redirectUser = null),
      (this.isProactiveRefreshEnabled = !1),
      (this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION = 1),
      (this._canInitEmulator = !0),
      (this._isInitialized = !1),
      (this._deleted = !1),
      (this._initializationPromise = null),
      (this._popupRedirectResolver = null),
      (this._errorFactory = kT),
      (this._agentRecaptchaConfig = null),
      (this._tenantRecaptchaConfigs = {}),
      (this._projectPasswordPolicy = null),
      (this._tenantPasswordPolicies = {}),
      (this._resolvePersistenceManagerAvailable = void 0),
      (this.lastNotifiedUid = void 0),
      (this.languageCode = null),
      (this.tenantId = null),
      (this.settings = { appVerificationDisabledForTesting: !1 }),
      (this.frameworks = []),
      (this.name = e.name),
      (this.clientVersion = o.sdkClientVersion),
      (this._persistenceManagerAvailable = new Promise(
        (a) => (this._resolvePersistenceManagerAvailable = a),
      )));
  }
  _initializeWithPersistence(e, t) {
    return (
      t && (this._popupRedirectResolver = Mi(t)),
      (this._initializationPromise = this.queue(async () => {
        var i, o, a;
        if (
          !this._deleted &&
          ((this.persistenceManager = await ka.create(this, e)),
          (i = this._resolvePersistenceManagerAvailable) === null ||
            i === void 0 ||
            i.call(this),
          !this._deleted)
        ) {
          if (
            !((o = this._popupRedirectResolver) === null || o === void 0) &&
            o._shouldInitProactively
          )
            try {
              await this._popupRedirectResolver._initialize(this);
            } catch {}
          (await this.initializeCurrentUser(t),
            (this.lastNotifiedUid =
              ((a = this.currentUser) === null || a === void 0
                ? void 0
                : a.uid) || null),
            !this._deleted && (this._isInitialized = !0));
        }
      })),
      this._initializationPromise
    );
  }
  async _onStorageEvent() {
    if (this._deleted) return;
    const e = await this.assertedPersistence.getCurrentUser();
    if (!(!this.currentUser && !e)) {
      if (this.currentUser && e && this.currentUser.uid === e.uid) {
        (this._currentUser._assign(e), await this.currentUser.getIdToken());
        return;
      }
      await this._updateCurrentUser(e, !0);
    }
  }
  async initializeCurrentUserFromIdToken(e) {
    try {
      const t = await xh(this, { idToken: e }),
        i = await Dr._fromGetAccountInfoResponse(this, t, e);
      await this.directlySetCurrentUser(i);
    } catch (t) {
      (console.warn(
        "FirebaseServerApp could not login user with provided authIdToken: ",
        t,
      ),
        await this.directlySetCurrentUser(null));
    }
  }
  async initializeCurrentUser(e) {
    var t;
    if (Xr(this.app)) {
      const u = this.app.settings.authIdToken;
      return u
        ? new Promise((d) => {
            setTimeout(() =>
              this.initializeCurrentUserFromIdToken(u).then(d, d),
            );
          })
        : this.directlySetCurrentUser(null);
    }
    const i = await this.assertedPersistence.getCurrentUser();
    let o = i,
      a = !1;
    if (e && this.config.authDomain) {
      await this.getOrInitRedirectPersistenceManager();
      const u =
          (t = this.redirectUser) === null || t === void 0
            ? void 0
            : t._redirectEventId,
        d = o?._redirectEventId,
        f = await this.tryRedirectSignIn(e);
      (!u || u === d) && f?.user && ((o = f.user), (a = !0));
    }
    if (!o) return this.directlySetCurrentUser(null);
    if (!o._redirectEventId) {
      if (a)
        try {
          await this.beforeStateQueue.runMiddleware(o);
        } catch (u) {
          ((o = i),
            this._popupRedirectResolver._overrideRedirectResult(this, () =>
              Promise.reject(u),
            ));
        }
      return o
        ? this.reloadAndSetCurrentUserOrClear(o)
        : this.directlySetCurrentUser(null);
    }
    return (
      Ve(this._popupRedirectResolver, this, "argument-error"),
      await this.getOrInitRedirectPersistenceManager(),
      this.redirectUser &&
      this.redirectUser._redirectEventId === o._redirectEventId
        ? this.directlySetCurrentUser(o)
        : this.reloadAndSetCurrentUserOrClear(o)
    );
  }
  async tryRedirectSignIn(e) {
    let t = null;
    try {
      t = await this._popupRedirectResolver._completeRedirectFn(this, e, !0);
    } catch {
      await this._setRedirectUser(null);
    }
    return t;
  }
  async reloadAndSetCurrentUserOrClear(e) {
    try {
      await bh(e);
    } catch (t) {
      if (t?.code !== "auth/network-request-failed")
        return this.directlySetCurrentUser(null);
    }
    return this.directlySetCurrentUser(e);
  }
  useDeviceLanguage() {
    this.languageCode = jD();
  }
  async _delete() {
    this._deleted = !0;
  }
  async updateCurrentUser(e) {
    if (Xr(this.app)) return Promise.reject(Ao(this));
    const t = e ? ai(e) : null;
    return (
      t &&
        Ve(
          t.auth.config.apiKey === this.config.apiKey,
          this,
          "invalid-user-token",
        ),
      this._updateCurrentUser(t && t._clone(this))
    );
  }
  async _updateCurrentUser(e, t = !1) {
    if (!this._deleted)
      return (
        e && Ve(this.tenantId === e.tenantId, this, "tenant-id-mismatch"),
        t || (await this.beforeStateQueue.runMiddleware(e)),
        this.queue(async () => {
          (await this.directlySetCurrentUser(e), this.notifyAuthListeners());
        })
      );
  }
  async signOut() {
    return Xr(this.app)
      ? Promise.reject(Ao(this))
      : (await this.beforeStateQueue.runMiddleware(null),
        (this.redirectPersistenceManager || this._popupRedirectResolver) &&
          (await this._setRedirectUser(null)),
        this._updateCurrentUser(null, !0));
  }
  setPersistence(e) {
    return Xr(this.app)
      ? Promise.reject(Ao(this))
      : this.queue(async () => {
          await this.assertedPersistence.setPersistence(Mi(e));
        });
  }
  _getRecaptchaConfig() {
    return this.tenantId == null
      ? this._agentRecaptchaConfig
      : this._tenantRecaptchaConfigs[this.tenantId];
  }
  async validatePassword(e) {
    this._getPasswordPolicyInternal() || (await this._updatePasswordPolicy());
    const t = this._getPasswordPolicyInternal();
    return t.schemaVersion !== this.EXPECTED_PASSWORD_POLICY_SCHEMA_VERSION
      ? Promise.reject(
          this._errorFactory.create(
            "unsupported-password-policy-schema-version",
            {},
          ),
        )
      : t.validatePassword(e);
  }
  _getPasswordPolicyInternal() {
    return this.tenantId === null
      ? this._projectPasswordPolicy
      : this._tenantPasswordPolicies[this.tenantId];
  }
  async _updatePasswordPolicy() {
    const e = await iN(this),
      t = new oN(e);
    this.tenantId === null
      ? (this._projectPasswordPolicy = t)
      : (this._tenantPasswordPolicies[this.tenantId] = t);
  }
  _getPersistenceType() {
    return this.assertedPersistence.persistence.type;
  }
  _getPersistence() {
    return this.assertedPersistence.persistence;
  }
  _updateErrorMap(e) {
    this._errorFactory = new pu("auth", "Firebase", e());
  }
  onAuthStateChanged(e, t, i) {
    return this.registerStateListener(this.authStateSubscription, e, t, i);
  }
  beforeAuthStateChanged(e, t) {
    return this.beforeStateQueue.pushCallback(e, t);
  }
  onIdTokenChanged(e, t, i) {
    return this.registerStateListener(this.idTokenSubscription, e, t, i);
  }
  authStateReady() {
    return new Promise((e, t) => {
      if (this.currentUser) e();
      else {
        const i = this.onAuthStateChanged(() => {
          (i(), e());
        }, t);
      }
    });
  }
  async revokeAccessToken(e) {
    if (this.currentUser) {
      const t = await this.currentUser.getIdToken(),
        i = {
          providerId: "apple.com",
          tokenType: "ACCESS_TOKEN",
          token: e,
          idToken: t,
        };
      (this.tenantId != null && (i.tenantId = this.tenantId),
        await eN(this, i));
    }
  }
  toJSON() {
    var e;
    return {
      apiKey: this.config.apiKey,
      authDomain: this.config.authDomain,
      appName: this.name,
      currentUser:
        (e = this._currentUser) === null || e === void 0 ? void 0 : e.toJSON(),
    };
  }
  async _setRedirectUser(e, t) {
    const i = await this.getOrInitRedirectPersistenceManager(t);
    return e === null ? i.removeCurrentUser() : i.setCurrentUser(e);
  }
  async getOrInitRedirectPersistenceManager(e) {
    if (!this.redirectPersistenceManager) {
      const t = (e && Mi(e)) || this._popupRedirectResolver;
      (Ve(t, this, "argument-error"),
        (this.redirectPersistenceManager = await ka.create(
          this,
          [Mi(t._redirectPersistence)],
          "redirectUser",
        )),
        (this.redirectUser =
          await this.redirectPersistenceManager.getCurrentUser()));
    }
    return this.redirectPersistenceManager;
  }
  async _redirectUserForId(e) {
    var t, i;
    return (
      this._isInitialized && (await this.queue(async () => {})),
      ((t = this._currentUser) === null || t === void 0
        ? void 0
        : t._redirectEventId) === e
        ? this._currentUser
        : ((i = this.redirectUser) === null || i === void 0
              ? void 0
              : i._redirectEventId) === e
          ? this.redirectUser
          : null
    );
  }
  async _persistUserIfCurrent(e) {
    if (e === this.currentUser)
      return this.queue(async () => this.directlySetCurrentUser(e));
  }
  _notifyListenersIfCurrent(e) {
    e === this.currentUser && this.notifyAuthListeners();
  }
  _key() {
    return `${this.config.authDomain}:${this.config.apiKey}:${this.name}`;
  }
  _startProactiveRefresh() {
    ((this.isProactiveRefreshEnabled = !0),
      this.currentUser && this._currentUser._startProactiveRefresh());
  }
  _stopProactiveRefresh() {
    ((this.isProactiveRefreshEnabled = !1),
      this.currentUser && this._currentUser._stopProactiveRefresh());
  }
  get _currentUser() {
    return this.currentUser;
  }
  notifyAuthListeners() {
    var e, t;
    if (!this._isInitialized) return;
    this.idTokenSubscription.next(this.currentUser);
    const i =
      (t = (e = this.currentUser) === null || e === void 0 ? void 0 : e.uid) !==
        null && t !== void 0
        ? t
        : null;
    this.lastNotifiedUid !== i &&
      ((this.lastNotifiedUid = i),
      this.authStateSubscription.next(this.currentUser));
  }
  registerStateListener(e, t, i, o) {
    if (this._deleted) return () => {};
    const a = typeof t == "function" ? t : t.next.bind(t);
    let u = !1;
    const d = this._isInitialized
      ? Promise.resolve()
      : this._initializationPromise;
    if (
      (Ve(d, this, "internal-error"),
      d.then(() => {
        u || a(this.currentUser);
      }),
      typeof t == "function")
    ) {
      const f = e.addObserver(t, i, o);
      return () => {
        ((u = !0), f());
      };
    } else {
      const f = e.addObserver(t);
      return () => {
        ((u = !0), f());
      };
    }
  }
  async directlySetCurrentUser(e) {
    (this.currentUser &&
      this.currentUser !== e &&
      this._currentUser._stopProactiveRefresh(),
      e && this.isProactiveRefreshEnabled && e._startProactiveRefresh(),
      (this.currentUser = e),
      e
        ? await this.assertedPersistence.setCurrentUser(e)
        : await this.assertedPersistence.removeCurrentUser());
  }
  queue(e) {
    return ((this.operations = this.operations.then(e, e)), this.operations);
  }
  get assertedPersistence() {
    return (
      Ve(this.persistenceManager, this, "internal-error"),
      this.persistenceManager
    );
  }
  _logFramework(e) {
    !e ||
      this.frameworks.includes(e) ||
      (this.frameworks.push(e),
      this.frameworks.sort(),
      (this.clientVersion = HT(
        this.config.clientPlatform,
        this._getFrameworks(),
      )));
  }
  _getFrameworks() {
    return this.frameworks;
  }
  async _getAdditionalHeaders() {
    var e;
    const t = { "X-Client-Version": this.clientVersion };
    this.app.options.appId && (t["X-Firebase-gmpid"] = this.app.options.appId);
    const i = await ((e = this.heartbeatServiceProvider.getImmediate({
      optional: !0,
    })) === null || e === void 0
      ? void 0
      : e.getHeartbeatsHeader());
    i && (t["X-Firebase-Client"] = i);
    const o = await this._getAppCheckToken();
    return (o && (t["X-Firebase-AppCheck"] = o), t);
  }
  async _getAppCheckToken() {
    var e;
    if (Xr(this.app) && this.app.settings.appCheckToken)
      return this.app.settings.appCheckToken;
    const t = await ((e = this.appCheckServiceProvider.getImmediate({
      optional: !0,
    })) === null || e === void 0
      ? void 0
      : e.getToken());
    return (
      t?.error && FD(`Error while retrieving App Check token: ${t.error}`),
      t?.token
    );
  }
}
function ig(n) {
  return ai(n);
}
class P0 {
  constructor(e) {
    ((this.auth = e),
      (this.observer = null),
      (this.addObserver = sP((t) => (this.observer = t))));
  }
  get next() {
    return (
      Ve(this.observer, this.auth, "internal-error"),
      this.observer.next.bind(this.observer)
    );
  }
}
let sg = {
  async loadJS() {
    throw new Error("Unable to load external scripts");
  },
  recaptchaV2Script: "",
  recaptchaEnterpriseScript: "",
  gapiScript: "",
};
function lN(n) {
  sg = n;
}
function uN(n) {
  return sg.loadJS(n);
}
function cN() {
  return sg.gapiScript;
}
function hN(n) {
  return `__${n}${Math.floor(Math.random() * 1e6)}`;
}
function dN(n, e) {
  const t = wm(n, "auth");
  if (t.isInitialized()) {
    const o = t.getImmediate(),
      a = t.getOptions();
    if (Co(a, e ?? {})) return o;
    $i(o, "already-initialized");
  }
  return t.initialize({ options: e });
}
function fN(n, e) {
  const t = e?.persistence || [],
    i = (Array.isArray(t) ? t : [t]).map(Mi);
  (e?.errorMap && n._updateErrorMap(e.errorMap),
    n._initializeWithPersistence(i, e?.popupRedirectResolver));
}
function pN(n, e, t) {
  const i = ig(n);
  Ve(/^https?:\/\//.test(e), i, "invalid-emulator-scheme");
  const o = !1,
    a = WT(e),
    { host: u, port: d } = mN(e),
    f = d === null ? "" : `:${d}`,
    m = { url: `${a}//${u}${f}/` },
    v = Object.freeze({
      host: u,
      port: d,
      protocol: a.replace(":", ""),
      options: Object.freeze({ disableWarnings: o }),
    });
  if (!i._canInitEmulator) {
    (Ve(i.config.emulator && i.emulatorConfig, i, "emulator-config-failed"),
      Ve(
        Co(m, i.config.emulator) && Co(v, i.emulatorConfig),
        i,
        "emulator-config-failed",
      ));
    return;
  }
  ((i.config.emulator = m),
    (i.emulatorConfig = v),
    (i.settings.appVerificationDisabledForTesting = !0),
    ja(u) ? (Ww(`${a}//${u}${f}`), qw("Auth", !0)) : gN());
}
function WT(n) {
  const e = n.indexOf(":");
  return e < 0 ? "" : n.substr(0, e + 1);
}
function mN(n) {
  const e = WT(n),
    t = /(\/\/)?([^?#/]+)/.exec(n.substr(e.length));
  if (!t) return { host: "", port: null };
  const i = t[2].split("@").pop() || "",
    o = /^(\[[^\]]+\])(:|$)/.exec(i);
  if (o) {
    const a = o[1];
    return { host: a, port: k0(i.substr(a.length + 1)) };
  } else {
    const [a, u] = i.split(":");
    return { host: a, port: k0(u) };
  }
}
function k0(n) {
  if (!n) return null;
  const e = Number(n);
  return isNaN(e) ? null : e;
}
function gN() {
  function n() {
    const e = document.createElement("p"),
      t = e.style;
    ((e.innerText =
      "Running in emulator mode. Do not use with production credentials."),
      (t.position = "fixed"),
      (t.width = "100%"),
      (t.backgroundColor = "#ffffff"),
      (t.border = ".1em solid #000000"),
      (t.color = "#b50000"),
      (t.bottom = "0px"),
      (t.left = "0px"),
      (t.margin = "0px"),
      (t.zIndex = "10000"),
      (t.textAlign = "center"),
      e.classList.add("firebase-emulator-warning"),
      document.body.appendChild(e));
  }
  (typeof console < "u" &&
    typeof console.info == "function" &&
    console.info(
      "WARNING: You are using the Auth Emulator, which is intended for local testing only.  Do not use with production credentials.",
    ),
    typeof window < "u" &&
      typeof document < "u" &&
      (document.readyState === "loading"
        ? window.addEventListener("DOMContentLoaded", n)
        : n()));
}
class qT {
  constructor(e, t) {
    ((this.providerId = e), (this.signInMethod = t));
  }
  toJSON() {
    return Li("not implemented");
  }
  _getIdTokenResponse(e) {
    return Li("not implemented");
  }
  _linkToIdToken(e, t) {
    return Li("not implemented");
  }
  _getReauthenticationResolver(e) {
    return Li("not implemented");
  }
}
async function xa(n, e) {
  return WD(n, "POST", "/v1/accounts:signInWithIdp", tg(n, e));
}
const yN = "http://localhost";
class bo extends qT {
  constructor() {
    (super(...arguments), (this.pendingToken = null));
  }
  static _fromParams(e) {
    const t = new bo(e.providerId, e.signInMethod);
    return (
      e.idToken || e.accessToken
        ? (e.idToken && (t.idToken = e.idToken),
          e.accessToken && (t.accessToken = e.accessToken),
          e.nonce && !e.pendingToken && (t.nonce = e.nonce),
          e.pendingToken && (t.pendingToken = e.pendingToken))
        : e.oauthToken && e.oauthTokenSecret
          ? ((t.accessToken = e.oauthToken), (t.secret = e.oauthTokenSecret))
          : $i("argument-error"),
      t
    );
  }
  toJSON() {
    return {
      idToken: this.idToken,
      accessToken: this.accessToken,
      secret: this.secret,
      nonce: this.nonce,
      pendingToken: this.pendingToken,
      providerId: this.providerId,
      signInMethod: this.signInMethod,
    };
  }
  static fromJSON(e) {
    const t = typeof e == "string" ? JSON.parse(e) : e,
      { providerId: i, signInMethod: o } = t,
      a = Jm(t, ["providerId", "signInMethod"]);
    if (!i || !o) return null;
    const u = new bo(i, o);
    return (
      (u.idToken = a.idToken || void 0),
      (u.accessToken = a.accessToken || void 0),
      (u.secret = a.secret),
      (u.nonce = a.nonce),
      (u.pendingToken = a.pendingToken || null),
      u
    );
  }
  _getIdTokenResponse(e) {
    const t = this.buildRequest();
    return xa(e, t);
  }
  _linkToIdToken(e, t) {
    const i = this.buildRequest();
    return ((i.idToken = t), xa(e, i));
  }
  _getReauthenticationResolver(e) {
    const t = this.buildRequest();
    return ((t.autoCreate = !1), xa(e, t));
  }
  buildRequest() {
    const e = { requestUri: yN, returnSecureToken: !0 };
    if (this.pendingToken) e.pendingToken = this.pendingToken;
    else {
      const t = {};
      (this.idToken && (t.id_token = this.idToken),
        this.accessToken && (t.access_token = this.accessToken),
        this.secret && (t.oauth_token_secret = this.secret),
        (t.providerId = this.providerId),
        this.nonce && !this.pendingToken && (t.nonce = this.nonce),
        (e.postBody = mu(t)));
    }
    return e;
  }
}
class KT {
  constructor(e) {
    ((this.providerId = e),
      (this.defaultLanguageCode = null),
      (this.customParameters = {}));
  }
  setDefaultLanguage(e) {
    this.defaultLanguageCode = e;
  }
  setCustomParameters(e) {
    return ((this.customParameters = e), this);
  }
  getCustomParameters() {
    return this.customParameters;
  }
}
class Tu extends KT {
  constructor() {
    (super(...arguments), (this.scopes = []));
  }
  addScope(e) {
    return (this.scopes.includes(e) || this.scopes.push(e), this);
  }
  getScopes() {
    return [...this.scopes];
  }
}
class ks extends Tu {
  constructor() {
    super("facebook.com");
  }
  static credential(e) {
    return bo._fromParams({
      providerId: ks.PROVIDER_ID,
      signInMethod: ks.FACEBOOK_SIGN_IN_METHOD,
      accessToken: e,
    });
  }
  static credentialFromResult(e) {
    return ks.credentialFromTaggedObject(e);
  }
  static credentialFromError(e) {
    return ks.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !("oauthAccessToken" in e) || !e.oauthAccessToken) return null;
    try {
      return ks.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
ks.FACEBOOK_SIGN_IN_METHOD = "facebook.com";
ks.PROVIDER_ID = "facebook.com";
class Oi extends Tu {
  constructor() {
    (super("google.com"), this.addScope("profile"));
  }
  static credential(e, t) {
    return bo._fromParams({
      providerId: Oi.PROVIDER_ID,
      signInMethod: Oi.GOOGLE_SIGN_IN_METHOD,
      idToken: e,
      accessToken: t,
    });
  }
  static credentialFromResult(e) {
    return Oi.credentialFromTaggedObject(e);
  }
  static credentialFromError(e) {
    return Oi.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e) return null;
    const { oauthIdToken: t, oauthAccessToken: i } = e;
    if (!t && !i) return null;
    try {
      return Oi.credential(t, i);
    } catch {
      return null;
    }
  }
}
Oi.GOOGLE_SIGN_IN_METHOD = "google.com";
Oi.PROVIDER_ID = "google.com";
class xs extends Tu {
  constructor() {
    super("github.com");
  }
  static credential(e) {
    return bo._fromParams({
      providerId: xs.PROVIDER_ID,
      signInMethod: xs.GITHUB_SIGN_IN_METHOD,
      accessToken: e,
    });
  }
  static credentialFromResult(e) {
    return xs.credentialFromTaggedObject(e);
  }
  static credentialFromError(e) {
    return xs.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e || !("oauthAccessToken" in e) || !e.oauthAccessToken) return null;
    try {
      return xs.credential(e.oauthAccessToken);
    } catch {
      return null;
    }
  }
}
xs.GITHUB_SIGN_IN_METHOD = "github.com";
xs.PROVIDER_ID = "github.com";
class bs extends Tu {
  constructor() {
    super("twitter.com");
  }
  static credential(e, t) {
    return bo._fromParams({
      providerId: bs.PROVIDER_ID,
      signInMethod: bs.TWITTER_SIGN_IN_METHOD,
      oauthToken: e,
      oauthTokenSecret: t,
    });
  }
  static credentialFromResult(e) {
    return bs.credentialFromTaggedObject(e);
  }
  static credentialFromError(e) {
    return bs.credentialFromTaggedObject(e.customData || {});
  }
  static credentialFromTaggedObject({ _tokenResponse: e }) {
    if (!e) return null;
    const { oauthAccessToken: t, oauthTokenSecret: i } = e;
    if (!t || !i) return null;
    try {
      return bs.credential(t, i);
    } catch {
      return null;
    }
  }
}
bs.TWITTER_SIGN_IN_METHOD = "twitter.com";
bs.PROVIDER_ID = "twitter.com";
class Ua {
  constructor(e) {
    ((this.user = e.user),
      (this.providerId = e.providerId),
      (this._tokenResponse = e._tokenResponse),
      (this.operationType = e.operationType));
  }
  static async _fromIdTokenResponse(e, t, i, o = !1) {
    const a = await Dr._fromIdTokenResponse(e, i, o),
      u = x0(i);
    return new Ua({
      user: a,
      providerId: u,
      _tokenResponse: i,
      operationType: t,
    });
  }
  static async _forOperation(e, t, i) {
    await e._updateTokensIfNecessary(i, !0);
    const o = x0(i);
    return new Ua({
      user: e,
      providerId: o,
      _tokenResponse: i,
      operationType: t,
    });
  }
}
function x0(n) {
  return n.providerId ? n.providerId : "phoneNumber" in n ? "phone" : null;
}
class Dh extends qi {
  constructor(e, t, i, o) {
    var a;
    (super(t.code, t.message),
      (this.operationType = i),
      (this.user = o),
      Object.setPrototypeOf(this, Dh.prototype),
      (this.customData = {
        appName: e.name,
        tenantId: (a = e.tenantId) !== null && a !== void 0 ? a : void 0,
        _serverResponse: t.customData._serverResponse,
        operationType: i,
      }));
  }
  static _fromErrorAndOperation(e, t, i, o) {
    return new Dh(e, t, i, o);
  }
}
function GT(n, e, t, i) {
  return (
    e === "reauthenticate"
      ? t._getReauthenticationResolver(n)
      : t._getIdTokenResponse(n)
  ).catch((a) => {
    throw a.code === "auth/multi-factor-auth-required"
      ? Dh._fromErrorAndOperation(n, a, e, i)
      : a;
  });
}
async function vN(n, e, t = !1) {
  const i = await lu(n, e._linkToIdToken(n.auth, await n.getIdToken()), t);
  return Ua._forOperation(n, "link", i);
}
async function _N(n, e, t = !1) {
  const { auth: i } = n;
  if (Xr(i.app)) return Promise.reject(Ao(i));
  const o = "reauthenticate";
  try {
    const a = await lu(n, GT(i, o, e, n), t);
    Ve(a.idToken, i, "internal-error");
    const u = ng(a.idToken);
    Ve(u, i, "internal-error");
    const { sub: d } = u;
    return (Ve(n.uid === d, i, "user-mismatch"), Ua._forOperation(n, o, a));
  } catch (a) {
    throw (a?.code === "auth/user-not-found" && $i(i, "user-mismatch"), a);
  }
}
async function wN(n, e, t = !1) {
  if (Xr(n.app)) return Promise.reject(Ao(n));
  const i = "signIn",
    o = await GT(n, i, e),
    a = await Ua._fromIdTokenResponse(n, i, o);
  return (t || (await n._updateCurrentUser(a.user)), a);
}
function EN(n, e, t, i) {
  return ai(n).onIdTokenChanged(e, t, i);
}
function TN(n, e, t) {
  return ai(n).beforeAuthStateChanged(e, t);
}
const Nh = "__sak";
class QT {
  constructor(e, t) {
    ((this.storageRetriever = e), (this.type = t));
  }
  _isAvailable() {
    try {
      return this.storage
        ? (this.storage.setItem(Nh, "1"),
          this.storage.removeItem(Nh),
          Promise.resolve(!0))
        : Promise.resolve(!1);
    } catch {
      return Promise.resolve(!1);
    }
  }
  _set(e, t) {
    return (this.storage.setItem(e, JSON.stringify(t)), Promise.resolve());
  }
  _get(e) {
    const t = this.storage.getItem(e);
    return Promise.resolve(t ? JSON.parse(t) : null);
  }
  _remove(e) {
    return (this.storage.removeItem(e), Promise.resolve());
  }
  get storage() {
    return this.storageRetriever();
  }
}
const SN = 1e3,
  IN = 10;
class YT extends QT {
  constructor() {
    (super(() => window.localStorage, "LOCAL"),
      (this.boundEventHandler = (e, t) => this.onStorageEvent(e, t)),
      (this.listeners = {}),
      (this.localCache = {}),
      (this.pollTimer = null),
      (this.fallbackToPolling = $T()),
      (this._shouldAllowMigration = !0));
  }
  forAllChangedKeys(e) {
    for (const t of Object.keys(this.listeners)) {
      const i = this.storage.getItem(t),
        o = this.localCache[t];
      i !== o && e(t, o, i);
    }
  }
  onStorageEvent(e, t = !1) {
    if (!e.key) {
      this.forAllChangedKeys((u, d, f) => {
        this.notifyListeners(u, f);
      });
      return;
    }
    const i = e.key;
    t ? this.detachListener() : this.stopPolling();
    const o = () => {
        const u = this.storage.getItem(i);
        (!t && this.localCache[i] === u) || this.notifyListeners(i, u);
      },
      a = this.storage.getItem(i);
    nN() && a !== e.newValue && e.newValue !== e.oldValue
      ? setTimeout(o, IN)
      : o();
  }
  notifyListeners(e, t) {
    this.localCache[e] = t;
    const i = this.listeners[e];
    if (i) for (const o of Array.from(i)) o(t && JSON.parse(t));
  }
  startPolling() {
    (this.stopPolling(),
      (this.pollTimer = setInterval(() => {
        this.forAllChangedKeys((e, t, i) => {
          this.onStorageEvent(
            new StorageEvent("storage", { key: e, oldValue: t, newValue: i }),
            !0,
          );
        });
      }, SN)));
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), (this.pollTimer = null));
  }
  attachListener() {
    window.addEventListener("storage", this.boundEventHandler);
  }
  detachListener() {
    window.removeEventListener("storage", this.boundEventHandler);
  }
  _addListener(e, t) {
    (Object.keys(this.listeners).length === 0 &&
      (this.fallbackToPolling ? this.startPolling() : this.attachListener()),
      this.listeners[e] ||
        ((this.listeners[e] = new Set()),
        (this.localCache[e] = this.storage.getItem(e))),
      this.listeners[e].add(t));
  }
  _removeListener(e, t) {
    (this.listeners[e] &&
      (this.listeners[e].delete(t),
      this.listeners[e].size === 0 && delete this.listeners[e]),
      Object.keys(this.listeners).length === 0 &&
        (this.detachListener(), this.stopPolling()));
  }
  async _set(e, t) {
    (await super._set(e, t), (this.localCache[e] = JSON.stringify(t)));
  }
  async _get(e) {
    const t = await super._get(e);
    return ((this.localCache[e] = JSON.stringify(t)), t);
  }
  async _remove(e) {
    (await super._remove(e), delete this.localCache[e]);
  }
}
YT.type = "LOCAL";
const RN = YT;
class XT extends QT {
  constructor() {
    super(() => window.sessionStorage, "SESSION");
  }
  _addListener(e, t) {}
  _removeListener(e, t) {}
}
XT.type = "SESSION";
const JT = XT;
function AN(n) {
  return Promise.all(
    n.map(async (e) => {
      try {
        return { fulfilled: !0, value: await e };
      } catch (t) {
        return { fulfilled: !1, reason: t };
      }
    }),
  );
}
class od {
  constructor(e) {
    ((this.eventTarget = e),
      (this.handlersMap = {}),
      (this.boundEventHandler = this.handleEvent.bind(this)));
  }
  static _getInstance(e) {
    const t = this.receivers.find((o) => o.isListeningto(e));
    if (t) return t;
    const i = new od(e);
    return (this.receivers.push(i), i);
  }
  isListeningto(e) {
    return this.eventTarget === e;
  }
  async handleEvent(e) {
    const t = e,
      { eventId: i, eventType: o, data: a } = t.data,
      u = this.handlersMap[o];
    if (!u?.size) return;
    t.ports[0].postMessage({ status: "ack", eventId: i, eventType: o });
    const d = Array.from(u).map(async (m) => m(t.origin, a)),
      f = await AN(d);
    t.ports[0].postMessage({
      status: "done",
      eventId: i,
      eventType: o,
      response: f,
    });
  }
  _subscribe(e, t) {
    (Object.keys(this.handlersMap).length === 0 &&
      this.eventTarget.addEventListener("message", this.boundEventHandler),
      this.handlersMap[e] || (this.handlersMap[e] = new Set()),
      this.handlersMap[e].add(t));
  }
  _unsubscribe(e, t) {
    (this.handlersMap[e] && t && this.handlersMap[e].delete(t),
      (!t || this.handlersMap[e].size === 0) && delete this.handlersMap[e],
      Object.keys(this.handlersMap).length === 0 &&
        this.eventTarget.removeEventListener(
          "message",
          this.boundEventHandler,
        ));
  }
}
od.receivers = [];
function og(n = "", e = 10) {
  let t = "";
  for (let i = 0; i < e; i++) t += Math.floor(Math.random() * 10);
  return n + t;
}
class CN {
  constructor(e) {
    ((this.target = e), (this.handlers = new Set()));
  }
  removeMessageHandler(e) {
    (e.messageChannel &&
      (e.messageChannel.port1.removeEventListener("message", e.onMessage),
      e.messageChannel.port1.close()),
      this.handlers.delete(e));
  }
  async _send(e, t, i = 50) {
    const o = typeof MessageChannel < "u" ? new MessageChannel() : null;
    if (!o) throw new Error("connection_unavailable");
    let a, u;
    return new Promise((d, f) => {
      const m = og("", 20);
      o.port1.start();
      const v = setTimeout(() => {
        f(new Error("unsupported_event"));
      }, i);
      ((u = {
        messageChannel: o,
        onMessage(w) {
          const T = w;
          if (T.data.eventId === m)
            switch (T.data.status) {
              case "ack":
                (clearTimeout(v),
                  (a = setTimeout(() => {
                    f(new Error("timeout"));
                  }, 3e3)));
                break;
              case "done":
                (clearTimeout(a), d(T.data.response));
                break;
              default:
                (clearTimeout(v),
                  clearTimeout(a),
                  f(new Error("invalid_response")));
                break;
            }
        },
      }),
        this.handlers.add(u),
        o.port1.addEventListener("message", u.onMessage),
        this.target.postMessage({ eventType: e, eventId: m, data: t }, [
          o.port2,
        ]));
    }).finally(() => {
      u && this.removeMessageHandler(u);
    });
  }
}
function ii() {
  return window;
}
function PN(n) {
  ii().location.href = n;
}
function ZT() {
  return (
    typeof ii().WorkerGlobalScope < "u" &&
    typeof ii().importScripts == "function"
  );
}
async function kN() {
  if (!navigator?.serviceWorker) return null;
  try {
    return (await navigator.serviceWorker.ready).active;
  } catch {
    return null;
  }
}
function xN() {
  var n;
  return (
    ((n = navigator?.serviceWorker) === null || n === void 0
      ? void 0
      : n.controller) || null
  );
}
function bN() {
  return ZT() ? self : null;
}
const eS = "firebaseLocalStorageDb",
  DN = 1,
  Oh = "firebaseLocalStorage",
  tS = "fbase_key";
class Su {
  constructor(e) {
    this.request = e;
  }
  toPromise() {
    return new Promise((e, t) => {
      (this.request.addEventListener("success", () => {
        e(this.request.result);
      }),
        this.request.addEventListener("error", () => {
          t(this.request.error);
        }));
    });
  }
}
function ad(n, e) {
  return n.transaction([Oh], e ? "readwrite" : "readonly").objectStore(Oh);
}
function NN() {
  const n = indexedDB.deleteDatabase(eS);
  return new Su(n).toPromise();
}
function Xp() {
  const n = indexedDB.open(eS, DN);
  return new Promise((e, t) => {
    (n.addEventListener("error", () => {
      t(n.error);
    }),
      n.addEventListener("upgradeneeded", () => {
        const i = n.result;
        try {
          i.createObjectStore(Oh, { keyPath: tS });
        } catch (o) {
          t(o);
        }
      }),
      n.addEventListener("success", async () => {
        const i = n.result;
        i.objectStoreNames.contains(Oh)
          ? e(i)
          : (i.close(), await NN(), e(await Xp()));
      }));
  });
}
async function b0(n, e, t) {
  const i = ad(n, !0).put({ [tS]: e, value: t });
  return new Su(i).toPromise();
}
async function ON(n, e) {
  const t = ad(n, !1).get(e),
    i = await new Su(t).toPromise();
  return i === void 0 ? null : i.value;
}
function D0(n, e) {
  const t = ad(n, !0).delete(e);
  return new Su(t).toPromise();
}
const LN = 800,
  MN = 3;
class nS {
  constructor() {
    ((this.type = "LOCAL"),
      (this._shouldAllowMigration = !0),
      (this.listeners = {}),
      (this.localCache = {}),
      (this.pollTimer = null),
      (this.pendingWrites = 0),
      (this.receiver = null),
      (this.sender = null),
      (this.serviceWorkerReceiverAvailable = !1),
      (this.activeServiceWorker = null),
      (this._workerInitializationPromise =
        this.initializeServiceWorkerMessaging().then(
          () => {},
          () => {},
        )));
  }
  async _openDb() {
    return this.db ? this.db : ((this.db = await Xp()), this.db);
  }
  async _withRetries(e) {
    let t = 0;
    for (;;)
      try {
        const i = await this._openDb();
        return await e(i);
      } catch (i) {
        if (t++ > MN) throw i;
        this.db && (this.db.close(), (this.db = void 0));
      }
  }
  async initializeServiceWorkerMessaging() {
    return ZT() ? this.initializeReceiver() : this.initializeSender();
  }
  async initializeReceiver() {
    ((this.receiver = od._getInstance(bN())),
      this.receiver._subscribe("keyChanged", async (e, t) => ({
        keyProcessed: (await this._poll()).includes(t.key),
      })),
      this.receiver._subscribe("ping", async (e, t) => ["keyChanged"]));
  }
  async initializeSender() {
    var e, t;
    if (((this.activeServiceWorker = await kN()), !this.activeServiceWorker))
      return;
    this.sender = new CN(this.activeServiceWorker);
    const i = await this.sender._send("ping", {}, 800);
    i &&
      !((e = i[0]) === null || e === void 0) &&
      e.fulfilled &&
      !((t = i[0]) === null || t === void 0) &&
      t.value.includes("keyChanged") &&
      (this.serviceWorkerReceiverAvailable = !0);
  }
  async notifyServiceWorker(e) {
    if (
      !(
        !this.sender ||
        !this.activeServiceWorker ||
        xN() !== this.activeServiceWorker
      )
    )
      try {
        await this.sender._send(
          "keyChanged",
          { key: e },
          this.serviceWorkerReceiverAvailable ? 800 : 50,
        );
      } catch {}
  }
  async _isAvailable() {
    try {
      if (!indexedDB) return !1;
      const e = await Xp();
      return (await b0(e, Nh, "1"), await D0(e, Nh), !0);
    } catch {}
    return !1;
  }
  async _withPendingWrite(e) {
    this.pendingWrites++;
    try {
      await e();
    } finally {
      this.pendingWrites--;
    }
  }
  async _set(e, t) {
    return this._withPendingWrite(
      async () => (
        await this._withRetries((i) => b0(i, e, t)),
        (this.localCache[e] = t),
        this.notifyServiceWorker(e)
      ),
    );
  }
  async _get(e) {
    const t = await this._withRetries((i) => ON(i, e));
    return ((this.localCache[e] = t), t);
  }
  async _remove(e) {
    return this._withPendingWrite(
      async () => (
        await this._withRetries((t) => D0(t, e)),
        delete this.localCache[e],
        this.notifyServiceWorker(e)
      ),
    );
  }
  async _poll() {
    const e = await this._withRetries((o) => {
      const a = ad(o, !1).getAll();
      return new Su(a).toPromise();
    });
    if (!e) return [];
    if (this.pendingWrites !== 0) return [];
    const t = [],
      i = new Set();
    if (e.length !== 0)
      for (const { fbase_key: o, value: a } of e)
        (i.add(o),
          JSON.stringify(this.localCache[o]) !== JSON.stringify(a) &&
            (this.notifyListeners(o, a), t.push(o)));
    for (const o of Object.keys(this.localCache))
      this.localCache[o] &&
        !i.has(o) &&
        (this.notifyListeners(o, null), t.push(o));
    return t;
  }
  notifyListeners(e, t) {
    this.localCache[e] = t;
    const i = this.listeners[e];
    if (i) for (const o of Array.from(i)) o(t);
  }
  startPolling() {
    (this.stopPolling(),
      (this.pollTimer = setInterval(async () => this._poll(), LN)));
  }
  stopPolling() {
    this.pollTimer && (clearInterval(this.pollTimer), (this.pollTimer = null));
  }
  _addListener(e, t) {
    (Object.keys(this.listeners).length === 0 && this.startPolling(),
      this.listeners[e] || ((this.listeners[e] = new Set()), this._get(e)),
      this.listeners[e].add(t));
  }
  _removeListener(e, t) {
    (this.listeners[e] &&
      (this.listeners[e].delete(t),
      this.listeners[e].size === 0 && delete this.listeners[e]),
      Object.keys(this.listeners).length === 0 && this.stopPolling());
  }
}
nS.type = "LOCAL";
const VN = nS;
new Eu(3e4, 6e4);
function FN(n, e) {
  return e
    ? Mi(e)
    : (Ve(n._popupRedirectResolver, n, "argument-error"),
      n._popupRedirectResolver);
}
class ag extends qT {
  constructor(e) {
    (super("custom", "custom"), (this.params = e));
  }
  _getIdTokenResponse(e) {
    return xa(e, this._buildIdpRequest());
  }
  _linkToIdToken(e, t) {
    return xa(e, this._buildIdpRequest(t));
  }
  _getReauthenticationResolver(e) {
    return xa(e, this._buildIdpRequest());
  }
  _buildIdpRequest(e) {
    const t = {
      requestUri: this.params.requestUri,
      sessionId: this.params.sessionId,
      postBody: this.params.postBody,
      tenantId: this.params.tenantId,
      pendingToken: this.params.pendingToken,
      returnSecureToken: !0,
      returnIdpCredential: !0,
    };
    return (e && (t.idToken = e), t);
  }
}
function UN(n) {
  return wN(n.auth, new ag(n), n.bypassAuthState);
}
function zN(n) {
  const { auth: e, user: t } = n;
  return (Ve(t, e, "internal-error"), _N(t, new ag(n), n.bypassAuthState));
}
async function jN(n) {
  const { auth: e, user: t } = n;
  return (Ve(t, e, "internal-error"), vN(t, new ag(n), n.bypassAuthState));
}
class rS {
  constructor(e, t, i, o, a = !1) {
    ((this.auth = e),
      (this.resolver = i),
      (this.user = o),
      (this.bypassAuthState = a),
      (this.pendingPromise = null),
      (this.eventManager = null),
      (this.filter = Array.isArray(t) ? t : [t]));
  }
  execute() {
    return new Promise(async (e, t) => {
      this.pendingPromise = { resolve: e, reject: t };
      try {
        ((this.eventManager = await this.resolver._initialize(this.auth)),
          await this.onExecution(),
          this.eventManager.registerConsumer(this));
      } catch (i) {
        this.reject(i);
      }
    });
  }
  async onAuthEvent(e) {
    const {
      urlResponse: t,
      sessionId: i,
      postBody: o,
      tenantId: a,
      error: u,
      type: d,
    } = e;
    if (u) {
      this.reject(u);
      return;
    }
    const f = {
      auth: this.auth,
      requestUri: t,
      sessionId: i,
      tenantId: a || void 0,
      postBody: o || void 0,
      user: this.user,
      bypassAuthState: this.bypassAuthState,
    };
    try {
      this.resolve(await this.getIdpTask(d)(f));
    } catch (m) {
      this.reject(m);
    }
  }
  onError(e) {
    this.reject(e);
  }
  getIdpTask(e) {
    switch (e) {
      case "signInViaPopup":
      case "signInViaRedirect":
        return UN;
      case "linkViaPopup":
      case "linkViaRedirect":
        return jN;
      case "reauthViaPopup":
      case "reauthViaRedirect":
        return zN;
      default:
        $i(this.auth, "internal-error");
    }
  }
  resolve(e) {
    (Hi(this.pendingPromise, "Pending promise was never set"),
      this.pendingPromise.resolve(e),
      this.unregisterAndCleanUp());
  }
  reject(e) {
    (Hi(this.pendingPromise, "Pending promise was never set"),
      this.pendingPromise.reject(e),
      this.unregisterAndCleanUp());
  }
  unregisterAndCleanUp() {
    (this.eventManager && this.eventManager.unregisterConsumer(this),
      (this.pendingPromise = null),
      this.cleanUp());
  }
}
const BN = new Eu(2e3, 1e4);
class Ra extends rS {
  constructor(e, t, i, o, a) {
    (super(e, t, o, a),
      (this.provider = i),
      (this.authWindow = null),
      (this.pollId = null),
      Ra.currentPopupAction && Ra.currentPopupAction.cancel(),
      (Ra.currentPopupAction = this));
  }
  async executeNotNull() {
    const e = await this.execute();
    return (Ve(e, this.auth, "internal-error"), e);
  }
  async onExecution() {
    Hi(this.filter.length === 1, "Popup operations only handle one event");
    const e = og();
    ((this.authWindow = await this.resolver._openPopup(
      this.auth,
      this.provider,
      this.filter[0],
      e,
    )),
      (this.authWindow.associatedEvent = e),
      this.resolver._originValidation(this.auth).catch((t) => {
        this.reject(t);
      }),
      this.resolver._isIframeWebStorageSupported(this.auth, (t) => {
        t || this.reject(ri(this.auth, "web-storage-unsupported"));
      }),
      this.pollUserCancellation());
  }
  get eventId() {
    var e;
    return (
      ((e = this.authWindow) === null || e === void 0
        ? void 0
        : e.associatedEvent) || null
    );
  }
  cancel() {
    this.reject(ri(this.auth, "cancelled-popup-request"));
  }
  cleanUp() {
    (this.authWindow && this.authWindow.close(),
      this.pollId && window.clearTimeout(this.pollId),
      (this.authWindow = null),
      (this.pollId = null),
      (Ra.currentPopupAction = null));
  }
  pollUserCancellation() {
    const e = () => {
      var t, i;
      if (
        !(
          (i =
            (t = this.authWindow) === null || t === void 0
              ? void 0
              : t.window) === null || i === void 0
        ) &&
        i.closed
      ) {
        this.pollId = window.setTimeout(() => {
          ((this.pollId = null),
            this.reject(ri(this.auth, "popup-closed-by-user")));
        }, 8e3);
        return;
      }
      this.pollId = window.setTimeout(e, BN.get());
    };
    e();
  }
}
Ra.currentPopupAction = null;
const $N = "pendingRedirect",
  rh = new Map();
class HN extends rS {
  constructor(e, t, i = !1) {
    (super(
      e,
      ["signInViaRedirect", "linkViaRedirect", "reauthViaRedirect", "unknown"],
      t,
      void 0,
      i,
    ),
      (this.eventId = null));
  }
  async execute() {
    let e = rh.get(this.auth._key());
    if (!e) {
      try {
        const i = (await WN(this.resolver, this.auth))
          ? await super.execute()
          : null;
        e = () => Promise.resolve(i);
      } catch (t) {
        e = () => Promise.reject(t);
      }
      rh.set(this.auth._key(), e);
    }
    return (
      this.bypassAuthState ||
        rh.set(this.auth._key(), () => Promise.resolve(null)),
      e()
    );
  }
  async onAuthEvent(e) {
    if (e.type === "signInViaRedirect") return super.onAuthEvent(e);
    if (e.type === "unknown") {
      this.resolve(null);
      return;
    }
    if (e.eventId) {
      const t = await this.auth._redirectUserForId(e.eventId);
      if (t) return ((this.user = t), super.onAuthEvent(e));
      this.resolve(null);
    }
  }
  async onExecution() {}
  cleanUp() {}
}
async function WN(n, e) {
  const t = GN(e),
    i = KN(n);
  if (!(await i._isAvailable())) return !1;
  const o = (await i._get(t)) === "true";
  return (await i._remove(t), o);
}
function qN(n, e) {
  rh.set(n._key(), e);
}
function KN(n) {
  return Mi(n._redirectPersistence);
}
function GN(n) {
  return nh($N, n.config.apiKey, n.name);
}
async function QN(n, e, t = !1) {
  if (Xr(n.app)) return Promise.reject(Ao(n));
  const i = ig(n),
    o = FN(i, e),
    u = await new HN(i, o, t).execute();
  return (
    u &&
      !t &&
      (delete u.user._redirectEventId,
      await i._persistUserIfCurrent(u.user),
      await i._setRedirectUser(null, e)),
    u
  );
}
const YN = 600 * 1e3;
class XN {
  constructor(e) {
    ((this.auth = e),
      (this.cachedEventUids = new Set()),
      (this.consumers = new Set()),
      (this.queuedRedirectEvent = null),
      (this.hasHandledPotentialRedirect = !1),
      (this.lastProcessedEventTime = Date.now()));
  }
  registerConsumer(e) {
    (this.consumers.add(e),
      this.queuedRedirectEvent &&
        this.isEventForConsumer(this.queuedRedirectEvent, e) &&
        (this.sendToConsumer(this.queuedRedirectEvent, e),
        this.saveEventToCache(this.queuedRedirectEvent),
        (this.queuedRedirectEvent = null)));
  }
  unregisterConsumer(e) {
    this.consumers.delete(e);
  }
  onEvent(e) {
    if (this.hasEventBeenHandled(e)) return !1;
    let t = !1;
    return (
      this.consumers.forEach((i) => {
        this.isEventForConsumer(e, i) &&
          ((t = !0), this.sendToConsumer(e, i), this.saveEventToCache(e));
      }),
      this.hasHandledPotentialRedirect ||
        !JN(e) ||
        ((this.hasHandledPotentialRedirect = !0),
        t || ((this.queuedRedirectEvent = e), (t = !0))),
      t
    );
  }
  sendToConsumer(e, t) {
    var i;
    if (e.error && !iS(e)) {
      const o =
        ((i = e.error.code) === null || i === void 0
          ? void 0
          : i.split("auth/")[1]) || "internal-error";
      t.onError(ri(this.auth, o));
    } else t.onAuthEvent(e);
  }
  isEventForConsumer(e, t) {
    const i = t.eventId === null || (!!e.eventId && e.eventId === t.eventId);
    return t.filter.includes(e.type) && i;
  }
  hasEventBeenHandled(e) {
    return (
      Date.now() - this.lastProcessedEventTime >= YN &&
        this.cachedEventUids.clear(),
      this.cachedEventUids.has(N0(e))
    );
  }
  saveEventToCache(e) {
    (this.cachedEventUids.add(N0(e)),
      (this.lastProcessedEventTime = Date.now()));
  }
}
function N0(n) {
  return [n.type, n.eventId, n.sessionId, n.tenantId]
    .filter((e) => e)
    .join("-");
}
function iS({ type: n, error: e }) {
  return n === "unknown" && e?.code === "auth/no-auth-event";
}
function JN(n) {
  switch (n.type) {
    case "signInViaRedirect":
    case "linkViaRedirect":
    case "reauthViaRedirect":
      return !0;
    case "unknown":
      return iS(n);
    default:
      return !1;
  }
}
async function ZN(n, e = {}) {
  return Ka(n, "GET", "/v1/projects", e);
}
const e2 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/,
  t2 = /^https?/;
async function n2(n) {
  if (n.config.emulator) return;
  const { authorizedDomains: e } = await ZN(n);
  for (const t of e)
    try {
      if (r2(t)) return;
    } catch {}
  $i(n, "unauthorized-domain");
}
function r2(n) {
  const e = Qp(),
    { protocol: t, hostname: i } = new URL(e);
  if (n.startsWith("chrome-extension://")) {
    const u = new URL(n);
    return u.hostname === "" && i === ""
      ? t === "chrome-extension:" &&
          n.replace("chrome-extension://", "") ===
            e.replace("chrome-extension://", "")
      : t === "chrome-extension:" && u.hostname === i;
  }
  if (!t2.test(t)) return !1;
  if (e2.test(n)) return i === n;
  const o = n.replace(/\./g, "\\.");
  return new RegExp("^(.+\\." + o + "|" + o + ")$", "i").test(i);
}
const i2 = new Eu(3e4, 6e4);
function O0() {
  const n = ii().___jsl;
  if (n?.H) {
    for (const e of Object.keys(n.H))
      if (
        ((n.H[e].r = n.H[e].r || []),
        (n.H[e].L = n.H[e].L || []),
        (n.H[e].r = [...n.H[e].L]),
        n.CP)
      )
        for (let t = 0; t < n.CP.length; t++) n.CP[t] = null;
  }
}
function s2(n) {
  return new Promise((e, t) => {
    var i, o, a;
    function u() {
      (O0(),
        gapi.load("gapi.iframes", {
          callback: () => {
            e(gapi.iframes.getContext());
          },
          ontimeout: () => {
            (O0(), t(ri(n, "network-request-failed")));
          },
          timeout: i2.get(),
        }));
    }
    if (
      !(
        (o = (i = ii().gapi) === null || i === void 0 ? void 0 : i.iframes) ===
          null || o === void 0
      ) &&
      o.Iframe
    )
      e(gapi.iframes.getContext());
    else if (!((a = ii().gapi) === null || a === void 0) && a.load) u();
    else {
      const d = hN("iframefcb");
      return (
        (ii()[d] = () => {
          gapi.load ? u() : t(ri(n, "network-request-failed"));
        }),
        uN(`${cN()}?onload=${d}`).catch((f) => t(f))
      );
    }
  }).catch((e) => {
    throw ((ih = null), e);
  });
}
let ih = null;
function o2(n) {
  return ((ih = ih || s2(n)), ih);
}
const a2 = new Eu(5e3, 15e3),
  l2 = "__/auth/iframe",
  u2 = "emulator/auth/iframe",
  c2 = {
    style: { position: "absolute", top: "-100px", width: "1px", height: "1px" },
    "aria-hidden": "true",
    tabindex: "-1",
  },
  h2 = new Map([
    ["identitytoolkit.googleapis.com", "p"],
    ["staging-identitytoolkit.sandbox.googleapis.com", "s"],
    ["test-identitytoolkit.sandbox.googleapis.com", "t"],
  ]);
function d2(n) {
  const e = n.config;
  Ve(e.authDomain, n, "auth-domain-config-required");
  const t = e.emulator ? eg(e, u2) : `https://${n.config.authDomain}/${l2}`,
    i = { apiKey: e.apiKey, appName: n.name, v: Ba },
    o = h2.get(n.config.apiHost);
  o && (i.eid = o);
  const a = n._getFrameworks();
  return (a.length && (i.fw = a.join(",")), `${t}?${mu(i).slice(1)}`);
}
async function f2(n) {
  const e = await o2(n),
    t = ii().gapi;
  return (
    Ve(t, n, "internal-error"),
    e.open(
      {
        where: document.body,
        url: d2(n),
        messageHandlersFilter: t.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
        attributes: c2,
        dontclear: !0,
      },
      (i) =>
        new Promise(async (o, a) => {
          await i.restyle({ setHideOnLeave: !1 });
          const u = ri(n, "network-request-failed"),
            d = ii().setTimeout(() => {
              a(u);
            }, a2.get());
          function f() {
            (ii().clearTimeout(d), o(i));
          }
          i.ping(f).then(f, () => {
            a(u);
          });
        }),
    )
  );
}
const p2 = {
    location: "yes",
    resizable: "yes",
    statusbar: "yes",
    toolbar: "no",
  },
  m2 = 500,
  g2 = 600,
  y2 = "_blank",
  v2 = "http://localhost";
class L0 {
  constructor(e) {
    ((this.window = e), (this.associatedEvent = null));
  }
  close() {
    if (this.window)
      try {
        this.window.close();
      } catch {}
  }
}
function _2(n, e, t, i = m2, o = g2) {
  const a = Math.max((window.screen.availHeight - o) / 2, 0).toString(),
    u = Math.max((window.screen.availWidth - i) / 2, 0).toString();
  let d = "";
  const f = Object.assign(Object.assign({}, p2), {
      width: i.toString(),
      height: o.toString(),
      top: a,
      left: u,
    }),
    m = yn().toLowerCase();
  (t && (d = FT(m) ? y2 : t), MT(m) && ((e = e || v2), (f.scrollbars = "yes")));
  const v = Object.entries(f).reduce((T, [A, D]) => `${T}${A}=${D},`, "");
  if (tN(m) && d !== "_self") return (w2(e || "", d), new L0(null));
  const w = window.open(e || "", d, v);
  Ve(w, n, "popup-blocked");
  try {
    w.focus();
  } catch {}
  return new L0(w);
}
function w2(n, e) {
  const t = document.createElement("a");
  ((t.href = n), (t.target = e));
  const i = document.createEvent("MouseEvent");
  (i.initMouseEvent(
    "click",
    !0,
    !0,
    window,
    1,
    0,
    0,
    0,
    0,
    !1,
    !1,
    !1,
    !1,
    1,
    null,
  ),
    t.dispatchEvent(i));
}
const E2 = "__/auth/handler",
  T2 = "emulator/auth/handler",
  S2 = encodeURIComponent("fac");
async function M0(n, e, t, i, o, a) {
  (Ve(n.config.authDomain, n, "auth-domain-config-required"),
    Ve(n.config.apiKey, n, "invalid-api-key"));
  const u = {
    apiKey: n.config.apiKey,
    appName: n.name,
    authType: t,
    redirectUrl: i,
    v: Ba,
    eventId: o,
  };
  if (e instanceof KT) {
    (e.setDefaultLanguage(n.languageCode),
      (u.providerId = e.providerId || ""),
      iP(e.getCustomParameters()) ||
        (u.customParameters = JSON.stringify(e.getCustomParameters())));
    for (const [v, w] of Object.entries({})) u[v] = w;
  }
  if (e instanceof Tu) {
    const v = e.getScopes().filter((w) => w !== "");
    v.length > 0 && (u.scopes = v.join(","));
  }
  n.tenantId && (u.tid = n.tenantId);
  const d = u;
  for (const v of Object.keys(d)) d[v] === void 0 && delete d[v];
  const f = await n._getAppCheckToken(),
    m = f ? `#${S2}=${encodeURIComponent(f)}` : "";
  return `${I2(n)}?${mu(d).slice(1)}${m}`;
}
function I2({ config: n }) {
  return n.emulator ? eg(n, T2) : `https://${n.authDomain}/${E2}`;
}
const cp = "webStorageSupport";
class R2 {
  constructor() {
    ((this.eventManagers = {}),
      (this.iframes = {}),
      (this.originValidationPromises = {}),
      (this._redirectPersistence = JT),
      (this._completeRedirectFn = QN),
      (this._overrideRedirectResult = qN));
  }
  async _openPopup(e, t, i, o) {
    var a;
    Hi(
      (a = this.eventManagers[e._key()]) === null || a === void 0
        ? void 0
        : a.manager,
      "_initialize() not called before _openPopup()",
    );
    const u = await M0(e, t, i, Qp(), o);
    return _2(e, u, og());
  }
  async _openRedirect(e, t, i, o) {
    await this._originValidation(e);
    const a = await M0(e, t, i, Qp(), o);
    return (PN(a), new Promise(() => {}));
  }
  _initialize(e) {
    const t = e._key();
    if (this.eventManagers[t]) {
      const { manager: o, promise: a } = this.eventManagers[t];
      return o
        ? Promise.resolve(o)
        : (Hi(a, "If manager is not set, promise should be"), a);
    }
    const i = this.initAndGetManager(e);
    return (
      (this.eventManagers[t] = { promise: i }),
      i.catch(() => {
        delete this.eventManagers[t];
      }),
      i
    );
  }
  async initAndGetManager(e) {
    const t = await f2(e),
      i = new XN(e);
    return (
      t.register(
        "authEvent",
        (o) => (
          Ve(o?.authEvent, e, "invalid-auth-event"),
          { status: i.onEvent(o.authEvent) ? "ACK" : "ERROR" }
        ),
        gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
      ),
      (this.eventManagers[e._key()] = { manager: i }),
      (this.iframes[e._key()] = t),
      i
    );
  }
  _isIframeWebStorageSupported(e, t) {
    this.iframes[e._key()].send(
      cp,
      { type: cp },
      (o) => {
        var a;
        const u = (a = o?.[0]) === null || a === void 0 ? void 0 : a[cp];
        (u !== void 0 && t(!!u), $i(e, "internal-error"));
      },
      gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
    );
  }
  _originValidation(e) {
    const t = e._key();
    return (
      this.originValidationPromises[t] ||
        (this.originValidationPromises[t] = n2(e)),
      this.originValidationPromises[t]
    );
  }
  get _shouldInitProactively() {
    return $T() || VT() || rg();
  }
}
const A2 = R2;
var V0 = "@firebase/auth",
  F0 = "1.10.8";
class C2 {
  constructor(e) {
    ((this.auth = e), (this.internalListeners = new Map()));
  }
  getUid() {
    var e;
    return (
      this.assertAuthConfigured(),
      ((e = this.auth.currentUser) === null || e === void 0 ? void 0 : e.uid) ||
        null
    );
  }
  async getToken(e) {
    return (
      this.assertAuthConfigured(),
      await this.auth._initializationPromise,
      this.auth.currentUser
        ? { accessToken: await this.auth.currentUser.getIdToken(e) }
        : null
    );
  }
  addAuthTokenListener(e) {
    if ((this.assertAuthConfigured(), this.internalListeners.has(e))) return;
    const t = this.auth.onIdTokenChanged((i) => {
      e(i?.stsTokenManager.accessToken || null);
    });
    (this.internalListeners.set(e, t), this.updateProactiveRefresh());
  }
  removeAuthTokenListener(e) {
    this.assertAuthConfigured();
    const t = this.internalListeners.get(e);
    t && (this.internalListeners.delete(e), t(), this.updateProactiveRefresh());
  }
  assertAuthConfigured() {
    Ve(
      this.auth._initializationPromise,
      "dependent-sdk-initialized-before-auth",
    );
  }
  updateProactiveRefresh() {
    this.internalListeners.size > 0
      ? this.auth._startProactiveRefresh()
      : this.auth._stopProactiveRefresh();
  }
}
function P2(n) {
  switch (n) {
    case "Node":
      return "node";
    case "ReactNative":
      return "rn";
    case "Worker":
      return "webworker";
    case "Cordova":
      return "cordova";
    case "WebExtension":
      return "web-extension";
    default:
      return;
  }
}
function k2(n) {
  (Na(
    new Po(
      "auth",
      (e, { options: t }) => {
        const i = e.getProvider("app").getImmediate(),
          o = e.getProvider("heartbeat"),
          a = e.getProvider("app-check-internal"),
          { apiKey: u, authDomain: d } = i.options;
        Ve(u && !u.includes(":"), "invalid-api-key", { appName: i.name });
        const f = {
            apiKey: u,
            authDomain: d,
            clientPlatform: n,
            apiHost: "identitytoolkit.googleapis.com",
            tokenApiHost: "securetoken.googleapis.com",
            apiScheme: "https",
            sdkClientVersion: HT(n),
          },
          m = new aN(i, o, a, f);
        return (fN(m, t), m);
      },
      "PUBLIC",
    )
      .setInstantiationMode("EXPLICIT")
      .setInstanceCreatedCallback((e, t, i) => {
        e.getProvider("auth-internal").initialize();
      }),
  ),
    Na(
      new Po(
        "auth-internal",
        (e) => {
          const t = ig(e.getProvider("auth").getImmediate());
          return ((i) => new C2(i))(t);
        },
        "PRIVATE",
      ).setInstantiationMode("EXPLICIT"),
    ),
    Ms(V0, F0, P2(n)),
    Ms(V0, F0, "esm2017"));
}
const x2 = 300,
  b2 = Hw("authIdTokenMaxAge") || x2;
let U0 = null;
const D2 = (n) => async (e) => {
  const t = e && (await e.getIdTokenResult()),
    i = t && (new Date().getTime() - Date.parse(t.issuedAtTime)) / 1e3;
  if (i && i > b2) return;
  const o = t?.token;
  U0 !== o &&
    ((U0 = o),
    await fetch(n, {
      method: o ? "POST" : "DELETE",
      headers: o ? { Authorization: `Bearer ${o}` } : {},
    }));
};
function N2(n = Yw()) {
  const e = wm(n, "auth");
  if (e.isInitialized()) return e.getImmediate();
  const t = dN(n, { popupRedirectResolver: A2, persistence: [VN, RN, JT] }),
    i = Hw("authTokenSyncURL");
  if (i && typeof isSecureContext == "boolean" && isSecureContext) {
    const a = new URL(i, location.origin);
    if (location.origin === a.origin) {
      const u = D2(a.toString());
      (TN(t, u, () => u(t.currentUser)), EN(t, (d) => u(d)));
    }
  }
  const o = Bw("auth");
  return (o && pN(t, `http://${o}`), t);
}
function O2() {
  var n, e;
  return (e =
    (n = document.getElementsByTagName("head")) === null || n === void 0
      ? void 0
      : n[0]) !== null && e !== void 0
    ? e
    : document;
}
lN({
  loadJS(n) {
    return new Promise((e, t) => {
      const i = document.createElement("script");
      (i.setAttribute("src", n),
        (i.onload = e),
        (i.onerror = (o) => {
          const a = ri("internal-error");
          ((a.customData = o), t(a));
        }),
        (i.type = "text/javascript"),
        (i.charset = "UTF-8"),
        O2().appendChild(i));
    });
  },
  gapiScript: "https://apis.google.com/js/api.js",
  recaptchaV2Script: "https://www.google.com/recaptcha/api.js",
  recaptchaEnterpriseScript:
    "https://www.google.com/recaptcha/enterprise.js?render=",
});
k2("Browser");
const z0 = new Set(),
  L2 = !1,
  ga = (n, e) => (
    !n &&
      L2 &&
      !z0.has(e) &&
      (z0.add(e),
      console.warn(
        `[env] Missing env var "${e}". Check your .env.local (VITE_${e}).`,
      )),
    n ?? void 0
  ),
  sS = {
    apiKey: ga("AIzaSyBYN6XJEAiw6eVIChByegk9xcGLWIA0C1E", "FIREBASE_API_KEY"),
    authDomain: ga("dogger-a8021.firebaseapp.com", "FIREBASE_AUTH_DOMAIN"),
    projectId: ga("dogger-a8021", "FIREBASE_PROJECT_ID"),
    storageBucket: ga("dogger-a8021.appspot.com", "FIREBASE_STORAGE_BUCKET"),
    messagingSenderId: ga("1014835520506", "FIREBASE_MESSAGING_SENDER_ID"),
    appId: ga("1:1014835520506:web:6dc75cbe987d1dc10a3a49", "FIREBASE_APP_ID"),
    measurementId: void 0,
  },
  M2 = [
    "apiKey",
    "authDomain",
    "projectId",
    "storageBucket",
    "messagingSenderId",
    "appId",
  ],
  Jp = M2.filter((n) => !sS[n]),
  V2 = Jp.length === 0;
let sh = null,
  ld = null,
  ud = null,
  j0 = null,
  oS = null;
function F2() {
  const n = Jp.length ? Jp.join(", ") : "unknown";
  console.warn(
    `[Doggerz] Firebase disabled. Missing config keys: ${n}. Populate .env.local or disable cloud features.`,
  );
}
if (V2)
  try {
    ((sh = Qw(sS)),
      (ld = N2(sh)),
      (ud = gD(sh)),
      (j0 = new Oi()),
      j0.setCustomParameters({ prompt: "select_account" }));
  } catch (n) {
    ((oS = n), console.error("[Doggerz] Firebase initialization failed:", n));
  }
else F2();
const aS = !!(sh && ld && ud && !oS),
  U2 = 4,
  kl = {
    PUPPY: { id: "PUPPY", label: "Puppy", min: 0, max: 180 },
    ADULT: { id: "ADULT", label: "Adult", min: 181, max: 2555 },
    SENIOR: { id: "SENIOR", label: "Senior", min: 2556, max: 5475 },
  };
function z2() {
  return (1440 * 60 * 1e3) / U2;
}
function j2(n) {
  return n >= kl.SENIOR.min
    ? kl.SENIOR
    : n >= kl.ADULT.min
      ? kl.ADULT
      : kl.PUPPY;
}
function B2(n, e = Date.now()) {
  if (!n || !Number.isFinite(n)) return null;
  const t = z2(),
    i = Math.max(0, e - n),
    o = Math.floor(i / t),
    a = j2(o),
    u = Math.max(0, o - a.min),
    d = Math.max(1, a.max - a.min),
    f = Math.min(1, u / d);
  return {
    adoptedAt: n,
    days: o,
    stage: a.id,
    label: a.label,
    daysIntoStage: u,
    stageLength: d,
    progressInStage: f,
  };
}
const $2 = 4,
  H2 = {
    ADULT: { cleanliness: 1, energy: 1, happiness: 1, hunger: 1 },
    PUPPY: { cleanliness: 0.95, energy: 0.85, happiness: 1, hunger: 1.15 },
    SENIOR: { cleanliness: 1.15, energy: 1.2, happiness: 1.05, hunger: 0.9 },
  },
  W2 = { DIRTY: 50, FLEAS: 25, MANGE: 0 },
  q2 = {
    FRESH: { label: "Fresh", pottyGainMultiplier: 1 },
    DIRTY: {
      happinessTickPenalty: 1,
      journalSummary: "Your pup is tracking in a little dirt. Bath soon?",
      label: "Dirty",
      pottyGainMultiplier: 1.1,
    },
    FLEAS: {
      cleanlinessTickPenalty: 1,
      energyTickPenalty: 1,
      happinessTickPenalty: 2,
      journalSummary:
        "Scratching nonstop. Looks like your pup picked up some hitchhikers.",
      label: "Fleas",
      pottyGainMultiplier: 1.25,
    },
    MANGE: {
      cleanlinessTickPenalty: 2,
      energyTickPenalty: 2,
      happinessTickPenalty: 4,
      journalSummary:
        "Skin is irritated and patchy. Needs a vet visit and serious TLC.",
      label: "Mange",
      pottyGainMultiplier: 1.5,
    },
  },
  YO = "doggerz:dogState",
  Ni = (n, e = 0, t = 100) =>
    Math.max(e, Math.min(t, Number.isFinite(n) ? n : 0)),
  K2 = { hunger: 8, happiness: 6, energy: 5, cleanliness: 3 },
  G2 = 0.65,
  Q2 = 60,
  B0 = 100,
  $0 = 50,
  lS = 60 * 1e3,
  Wl = 60 * lS,
  lg = 24 * Wl,
  Mn = () => Date.now(),
  _o = (n) => new Date(n).toISOString().slice(0, 10),
  Y2 = (n, e) => (n ? (e - n) / lg : 1 / 0),
  X2 = (n, e) => (n ? Y2(n, e) * $2 : 0),
  J2 = () => ({ hunger: 100, happiness: 100, energy: 100, cleanliness: 100 }),
  Z2 = () => ({
    obedience: {
      sit: { level: 0, xp: 0 },
      stay: { level: 0, xp: 0 },
      rollOver: { level: 0, xp: 0 },
      speak: { level: 0, xp: 0 },
    },
  }),
  ug = () => ({
    traits: { clingy: 0, toyObsessed: 0, foodMotivated: 0 },
    primaryLabel: null,
    secondaryLabel: null,
    revealReady: !1,
    revealedAt: null,
    lastEvaluatedAt: null,
  }),
  eO = () => ({ current: 0, best: 0, lastDate: null }),
  uS = () => ({ lastMoodSampleAt: null, lastTag: "neutral", samples: [] }),
  cS = () => ({
    lastFedAt: null,
    lastPlayedAt: null,
    lastRestedAt: null,
    lastBathAt: null,
    lastPottyAt: null,
    lastAccidentAt: null,
    lastTrainingAt: null,
    lastSeenAt: null,
  }),
  tO = () => ({
    puppy: { potty: { successes: 0, attempts: 0, completedAt: null } },
    adult: {
      obedienceDrill: {
        lastDrillDate: null,
        streak: 0,
        longestStreak: 0,
        missedDays: 0,
      },
    },
  }),
  nO = () => ({ queue: [], lastPollAt: null }),
  rO = () => ({ enabled: !1 }),
  hS = () => ({
    id: null,
    name: "Pup",
    breed: "Jack Russell (default)",
    level: 1,
    xp: 0,
    coins: 0,
    adoptedAt: null,
    createdAt: null,
    lastUpdatedAt: null,
    lifeStage: "puppy",
    lifeStageLabel: "Puppy",
    ageDays: 0,
    stats: J2(),
    cleanlinessTier: "FRESH",
    temperament: ug(),
    skills: Z2(),
    streak: eO(),
    mood: uS(),
    memory: cS(),
    training: tO(),
    polls: nO(),
    journal: [],
    debug: rO(),
  });
function Qr(n, e, t) {
  const i = e.createdAt ?? t ?? Mn(),
    o = e.id ?? `${i}-${n.journal.length}`;
  (n.journal.push({
    id: o,
    createdAt: i,
    type: e.type ?? "note",
    moodTag: e.moodTag ?? null,
    summary: e.summary ?? "",
    body: e.body ?? "",
  }),
    n.journal.length > 200 && n.journal.splice(0, n.journal.length - 200));
}
function Is(n, e, t) {
  const i = n.mood || (n.mood = uS()),
    o = i.lastMoodSampleAt;
  if (o && e - o < Q2 * lS) {
    i.lastTag = t || i.lastTag;
    return;
  }
  const a = {
    at: e,
    tag: t || i.lastTag || "neutral",
    hunger: n.stats.hunger,
    happiness: n.stats.happiness,
    energy: n.stats.energy,
    cleanliness: n.stats.cleanliness,
  };
  (i.samples.push(a),
    i.samples.length > 100 && i.samples.splice(0, i.samples.length - 100),
    (i.lastMoodSampleAt = e),
    (i.lastTag = a.tag));
}
function wo(n, e) {
  if (!e || !Number.isFinite(e)) return;
  n.xp = Math.max(0, (n.xp ?? 0) + e);
  let t = !1;
  for (; n.xp >= B0; )
    ((n.xp -= B0), (n.level += 1), (n.coins += 10), (t = !0));
  if (t) {
    const i = Mn();
    Qr(
      n,
      {
        type: "level-up",
        moodTag: "proud",
        summary: `Level ${n.level}`,
        body: `Your pup reached level ${n.level}!`,
      },
      i,
    );
  }
}
function iO(n, e, t) {
  if (!t) return;
  const i = n.skills?.obedience || (n.skills.obedience = {}),
    o = i[e] || (i[e] = { level: 0, xp: 0 });
  o.xp += t;
  let a = !1;
  for (; o.xp >= $0; ) ((o.xp -= $0), (o.level += 1), (a = !0));
  if (a) {
    const u = Mn();
    Qr(
      n,
      {
        type: "skill-up",
        moodTag: "focused",
        summary: `${e} → Lv.${o.level}`,
        body: `Your pup improved the ${e} command to level ${o.level}.`,
      },
      u,
    );
  }
}
function Eo(n, e) {
  if (!e) return;
  if (!n.lastDate) {
    ((n.lastDate = e), (n.current = 1), (n.best = 1));
    return;
  }
  if (n.lastDate === e) return;
  const t = new Date(n.lastDate),
    i = new Date(e);
  (Math.round((i.getTime() - t.getTime()) / lg) === 1
    ? (n.current += 1)
    : (n.current = 1),
    n.current > n.best && (n.best = n.current),
    (n.lastDate = e));
}
function sO(n) {
  const e = Ni(n.stats.cleanliness),
    t = W2 || {};
  let i = "FRESH";
  (e < t.MANGE
    ? (i = "MANGE")
    : e < t.FLEAS
      ? (i = "FLEAS")
      : e < t.DIRTY
        ? (i = "DIRTY")
        : (i = "FRESH"),
    (n.cleanlinessTier = i));
}
function ya(n, e, t) {
  (!n.traits[e] && n.traits[e] !== 0 && (n.traits[e] = 0),
    (n.traits[e] = Ni(n.traits[e] + t, 0, 100)));
}
function oO(n, e) {
  const t = n.temperament || (n.temperament = ug());
  if (t.lastEvaluatedAt && e - t.lastEvaluatedAt < lg) return;
  const i = n.memory || cS(),
    o = n.stats,
    a = i.lastFedAt != null ? (e - i.lastFedAt) / Wl : 1 / 0,
    u = i.lastPlayedAt != null ? (e - i.lastPlayedAt) / Wl : 1 / 0,
    d = i.lastSeenAt != null ? (e - i.lastSeenAt) / Wl : 1 / 0;
  (a < 6 && o.hunger > 70
    ? ya(t, "foodMotivated", 2)
    : (a > 18 || o.hunger < 30) && ya(t, "foodMotivated", -1),
    u < 6 && o.happiness > 70
      ? ya(t, "toyObsessed", 2)
      : (u > 18 || o.happiness < 40) && ya(t, "toyObsessed", -1),
    d > 24 || o.happiness < 40
      ? ya(t, "clingy", 2)
      : d < 8 && o.happiness > 70 && ya(t, "clingy", -1));
  const f = Object.entries(t.traits);
  f.sort((D, j) => j[1] - D[1]);
  const [m, v] = f;
  let w = null,
    T = null;
  const A = (D) => {
    switch (D) {
      case "toyObsessed":
        return "SPICY";
      case "clingy":
        return "SWEET";
      case "foodMotivated":
        return "CHILL";
      default:
        return null;
    }
  };
  (m && m[1] >= 20 && (w = A(m[0])),
    v && v[1] >= 20 && v[0] !== m[0] && (T = A(v[0])),
    (t.primaryLabel = w),
    (t.secondaryLabel = T),
    (t.lastEvaluatedAt = e));
}
function Rs(n, e) {
  const t = n.temperament || (n.temperament = ug());
  if (!n.adoptedAt || t.revealReady) return;
  X2(n.adoptedAt, e) >= 3 && ((t.revealReady = !0), (t.revealedAt = e));
}
function As(n, e, t = {}) {
  const { difficultyMultiplier: i = 1 } = t;
  if (!n.lastUpdatedAt) {
    n.lastUpdatedAt = e;
    return;
  }
  const o = e - n.lastUpdatedAt;
  if (!Number.isFinite(o) || o <= 0) return;
  const a = (o / Wl) * G2,
    u = (n.lifeStage && H2[n.lifeStage]) || {},
    f =
      ((n.cleanlinessTier && q2[n.cleanlinessTier]) || {}).decayMultiplier || 1;
  (["hunger", "happiness", "energy", "cleanliness"].forEach((m) => {
    const v = K2[m] || 0;
    if (!v) return;
    const w = u[`${m}DecayMultiplier`] || 1,
      A = v * w * i * f * a,
      D = n.stats[m] ?? 0;
    n.stats[m] = Ni(D - A);
  }),
    (n.lastUpdatedAt = e));
}
function Gr(n, e) {
  if ((e || (e = Mn()), n.adoptedAt)) {
    const t = B2(n.adoptedAt, e) || {};
    ((n.lifeStage = t.lifeStage || t.stage || n.lifeStage),
      (n.lifeStageLabel = t.label || n.lifeStageLabel),
      (n.ageDays = t.ageDays ?? n.ageDays));
  } else
    ((n.lifeStage = n.lifeStage || "puppy"),
      (n.lifeStageLabel = n.lifeStageLabel || "Puppy"));
  (sO(n), oO(n, e));
}
function aO(n, e) {
  !e ||
    !n.polls?.queue ||
    (n.polls.queue = n.polls.queue.filter((t) => t.id !== e));
}
const lO = hS(),
  dS = gm({
    name: "dog",
    initialState: lO,
    reducers: {
      hydrateDog(n, { payload: e }) {
        const t = hS(),
          i = {
            ...t,
            ...e,
            stats: { ...t.stats, ...(e?.stats || {}) },
            temperament: {
              ...t.temperament,
              ...(e?.temperament || {}),
              traits: {
                ...t.temperament.traits,
                ...(e?.temperament?.traits || {}),
              },
            },
            skills: {
              ...t.skills,
              ...(e?.skills || {}),
              obedience: {
                ...t.skills.obedience,
                ...(e?.skills?.obedience || {}),
              },
            },
            streak: { ...t.streak, ...(e?.streak || {}) },
            mood: { ...t.mood, ...(e?.mood || {}) },
            memory: { ...t.memory, ...(e?.memory || {}) },
            training: { ...t.training, ...(e?.training || {}) },
            polls: { ...t.polls, ...(e?.polls || {}) },
            debug: { ...t.debug, ...(e?.debug || {}) },
          };
        Object.assign(n, i);
        const o = Mn();
        (Gr(n, o), n.lastUpdatedAt || (n.lastUpdatedAt = o));
      },
      toggleDebug(n) {
        n.debug.enabled = !n.debug.enabled;
      },
      setDogName(n, { payload: e }) {
        n.name = (e || "").trim() || "Pup";
      },
      setAdoptedAt(n, { payload: e }) {
        const t = e ?? Mn();
        ((n.adoptedAt = t), n.createdAt || (n.createdAt = t), Gr(n, t));
      },
      feed(n, { payload: e }) {
        const t = e?.now ?? Mn();
        As(n, t);
        const i = e?.amount ?? 25;
        ((n.stats.hunger = Ni(n.stats.hunger + i)),
          (n.stats.happiness = Ni(n.stats.happiness + 5)),
          (n.memory.lastFedAt = t),
          (n.memory.lastSeenAt = t),
          wo(n, e?.xp ?? 10),
          Is(n, t, "fed"),
          Eo(n.streak, _o(t)),
          Rs(n, t),
          Qr(
            n,
            {
              type: "care-feed",
              moodTag: "fed",
              summary: "You fed your pup",
              body: "A meal was served. Belly: happier, life: slightly less chaotic.",
            },
            t,
          ),
          Gr(n, t));
      },
      play(n, { payload: e }) {
        const t = e?.now ?? Mn();
        As(n, t);
        const i = e?.happiness ?? 20,
          o = e?.energyCost ?? 10;
        ((n.stats.happiness = Ni(n.stats.happiness + i)),
          (n.stats.energy = Ni(n.stats.energy - o)),
          (n.memory.lastPlayedAt = t),
          (n.memory.lastSeenAt = t),
          wo(n, e?.xp ?? 10),
          Is(n, t, "playful"),
          Eo(n.streak, _o(t)),
          Rs(n, t),
          Qr(
            n,
            {
              type: "care-play",
              moodTag: "playful",
              summary: "Playtime!",
              body: "You played with your pup. Toys have feelings too, probably.",
            },
            t,
          ),
          Gr(n, t));
      },
      bathe(n, { payload: e }) {
        const t = e?.now ?? Mn();
        (As(n, t),
          (n.stats.cleanliness = 100),
          (n.stats.happiness = Ni(n.stats.happiness - 5)),
          (n.memory.lastBathAt = t),
          (n.memory.lastSeenAt = t),
          wo(n, e?.xp ?? 8),
          Is(n, t, "fresh"),
          Eo(n.streak, _o(t)),
          Rs(n, t),
          Qr(
            n,
            {
              type: "care-bath",
              moodTag: "fresh",
              summary: "Bath time",
              body: "Soap happened. Dignity may or may not recover.",
            },
            t,
          ),
          Gr(n, t));
      },
      goPotty(n, { payload: e }) {
        const t = e?.now ?? Mn();
        As(n, t);
        const i = n.training.puppy.potty;
        ((i.attempts += 1),
          i.successes < 8 && (i.successes += 1),
          !i.completedAt && i.successes >= 8
            ? ((i.completedAt = t),
              Qr(
                n,
                {
                  type: "training-potty-complete",
                  moodTag: "proud",
                  summary: "Potty training complete",
                  body: "Your pup reliably heads outside now. Accident rate will drop.",
                },
                t,
              ))
            : Qr(
                n,
                {
                  type: "training-potty",
                  moodTag: "relieved",
                  summary: "Successful potty break",
                  body: "You guided your pup to the right spot. Floors remain safe.",
                },
                t,
              ),
          (n.memory.lastPottyAt = t),
          (n.memory.lastSeenAt = t),
          wo(n, e?.xp ?? 12),
          Is(n, t, "relieved"),
          Eo(n.streak, _o(t)),
          Rs(n, t),
          Gr(n, t));
      },
      scoopPoop(n, { payload: e }) {
        const t = e?.now ?? Mn();
        (As(n, t),
          (n.stats.cleanliness = Ni(n.stats.cleanliness + 10)),
          (n.memory.lastAccidentAt = t),
          (n.memory.lastSeenAt = t),
          wo(n, e?.xp ?? 5),
          Is(n, t, "grossed"),
          Eo(n.streak, _o(t)),
          Rs(n, t),
          Qr(
            n,
            {
              type: "care-cleanup",
              moodTag: "grossed",
              summary: "Cleanup duty",
              body: "You handled an accident. Heroic, in a very specific way.",
            },
            t,
          ),
          Gr(n, t));
      },
      trainObedience(n, { payload: e }) {
        const t = e?.now ?? Mn(),
          i = e?.commandId || "sit";
        (As(n, t), iO(n, i, e?.xp ?? 10));
        const o = n.training.adult.obedienceDrill,
          a = _o(t);
        (o.lastDrillDate !== a &&
          ((o.lastDrillDate = a),
          (o.streak += 1),
          o.streak > o.longestStreak && (o.longestStreak = o.streak)),
          (n.memory.lastTrainingAt = t),
          (n.memory.lastSeenAt = t),
          wo(n, e?.bonusXp ?? 5),
          Is(n, t, "focused"),
          Eo(n.streak, a),
          Rs(n, t),
          Qr(
            n,
            {
              type: "training-obedience",
              moodTag: "focused",
              summary: `Obedience drill: ${i}`,
              body: `You practiced the ${i} command. Reps build reliable behavior.`,
            },
            t,
          ),
          Gr(n, t));
      },
      respondToDogPoll(n, { payload: e }) {
        const t = e?.now ?? Mn(),
          { pollId: i, choiceId: o } = e || {};
        (As(n, t),
          aO(n, i),
          (n.polls.lastPollAt = t),
          (n.memory.lastSeenAt = t),
          wo(n, e?.xp ?? 3),
          Is(n, t, "curious"),
          Eo(n.streak, _o(t)),
          Rs(n, t),
          Qr(
            n,
            {
              type: "dog-poll",
              moodTag: "curious",
              summary: "You answered a dog poll",
              body: `Poll ${i || ""} was answered with choice ${o || ""}. Future builds can shape temperament or events from this.`,
            },
            t,
          ),
          Gr(n, t));
      },
      engineTick(n, { payload: e }) {
        const t = e?.now ?? Mn();
        e?.bladderModel;
        const i = e?.difficultyMultiplier ?? 1;
        (As(n, t, { difficultyMultiplier: i }),
          Is(n, t, "tick"),
          Rs(n, t),
          Gr(n, t));
      },
    },
  }),
  XO = (n) => n.dog,
  JO = Dw(
    [(n) => n.dog.lifeStage, (n) => n.dog.lifeStageLabel, (n) => n.dog.ageDays],
    (n, e, t) => ({ lifeStage: n, lifeStageLabel: e, ageDays: t }),
  ),
  ZO = (n) => n.dog.training,
  eL = (n) => n.dog.polls,
  tL = (n) => n.dog.temperament,
  nL = (n) => n.dog.cleanlinessTier,
  {
    hydrateDog: uO,
    toggleDebug: rL,
    setDogName: iL,
    setAdoptedAt: sL,
    feed: oL,
    play: aL,
    bathe: lL,
    goPotty: uL,
    scoopPoop: cL,
    trainObedience: hL,
    respondToDogPoll: dL,
    engineTick: fL,
  } = dS.actions,
  cO = dS.reducer,
  hO = 1,
  fS = "dogs",
  dO = (n) => ({ ...n, lastCloudSyncAt: Date.now(), version: hO }),
  fO = (n) => {
    if (!n) return null;
    const { version: e, ...t } = n;
    return t;
  },
  pO = (n) => n.dog?.dog ?? null,
  mO = Mw(
    "dog/loadDogFromCloud",
    async (n, { dispatch: e, rejectWithValue: t }) => {
      if (!aS)
        return (
          console.warn("[Doggerz] Firebase not ready; skipping cloud load."),
          t("firebase-not-ready")
        );
      const i = ld.currentUser;
      if (!i)
        return (
          console.warn("[Doggerz] No user; cannot load cloud dog."),
          t("not-authenticated")
        );
      try {
        const o = yT(ud, fS, i.uid),
          a = await xD(o);
        if (!a.exists())
          return (
            console.info("[Doggerz] No cloud dog document yet."),
            t("no-cloud-dog")
          );
        const u = fO(a.data());
        return u ? (e(uO(u)), u) : t("invalid-cloud-dog");
      } catch (o) {
        return (
          console.error("[Doggerz] loadDogFromCloud failed", o),
          t(o.message || "load-failed")
        );
      }
    },
  ),
  pL = Mw(
    "dog/saveDogToCloud",
    async (n, { getState: e, rejectWithValue: t }) => {
      if (!aS)
        return (
          console.warn("[Doggerz] Firebase not ready; skipping cloud save."),
          t("firebase-not-ready")
        );
      const i = ld.currentUser;
      if (!i)
        return (
          console.warn("[Doggerz] No user; cannot save cloud dog."),
          t("not-authenticated")
        );
      const o = pO(e());
      if (!o || !o.adoptedAt)
        return (
          console.warn(
            "[Doggerz] No adopted dog to sync; skipping cloud save.",
          ),
          t("no-dog")
        );
      try {
        const a = yT(ud, fS, i.uid),
          u = dO(o);
        return (await DD(a, u, { merge: !0 }), u);
      } catch (a) {
        return (
          console.error("[Doggerz] saveDogToCloud failed", a),
          t(a.message || "save-failed")
        );
      }
    },
  );
function gO() {
  const [n, e] = z.useState(
      () =>
        !!(
          typeof window < "u" &&
          window.localStorage.getItem("doggerz:cloudDisabled")
        ),
    ),
    t = fA(),
    i = bC();
  if (
    (z.useEffect(() => {
      const u = () => {
        e(!!window.localStorage.getItem("doggerz:cloudDisabled"));
      };
      return (
        window.addEventListener("storage", u),
        () => window.removeEventListener("storage", u)
      );
    }, []),
    z.useEffect(() => {
      if (n)
        try {
          i?.add("Cloud sync disabled (permission). Running local-only.");
        } catch {}
    }, [n, i]),
    !n)
  )
    return null;
  const o = async () => {
      try {
        (window.localStorage.removeItem("doggerz:cloudDisabled"), e(!1));
        try {
          (await t(mO()).unwrap(), i?.add("Cloud sync re-enabled."));
        } catch (u) {
          i?.add("Retry failed: " + (u?.message || "permission denied"));
        }
      } catch {}
    },
    a = () => {
      try {
        (e(!1), i?.add("Cloud sync notice dismissed."));
      } catch {}
    };
  return Y.jsx("div", {
    className: "fixed top-4 right-4 z-50",
    children: Y.jsx("div", {
      className:
        "rounded-md bg-amber-800 text-white px-3 py-2 text-sm shadow-md",
      children: Y.jsxs("div", {
        className: "flex items-center gap-3",
        children: [
          Y.jsx("div", { children: "Cloud sync disabled (permission)" }),
          Y.jsxs("div", {
            className: "ml-2 flex items-center gap-2",
            children: [
              Y.jsx("button", {
                onClick: o,
                className: "underline text-emerald-200 hover:text-emerald-100",
                children: "Retry",
              }),
              Y.jsx("button", {
                onClick: a,
                className:
                  "text-zinc-200 bg-zinc-800/40 px-2 py-0.5 rounded hover:bg-zinc-700",
                "aria-label": "Dismiss cloud sync notice",
                children: "Dismiss",
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
function pS({ children: n, className: e = "" }) {
  return Y.jsx("section", {
    className: `doggerz-scroll-page ${e}`.trim(),
    role: "main",
    "aria-label": "Page content",
    tabIndex: -1,
    children: n,
  });
}
pS.propTypes = { children: vp.node, className: vp.string };
const yO = [
    {
      label: "Play & share",
      badge: "Instant impact",
      bullets: [
        "Play regularly and see how the systems feel over days and weeks.",
        "Share Doggerz with friends who love dogs or sim games.",
        "Tell us what parts feel fun, confusing, or too grindy.",
      ],
    },
    {
      label: "Give feedback",
      badge: "Help tune the sim",
      bullets: [
        "Report bugs, crashes, or weird stat behavior.",
        "Suggest training ideas, potty streak rewards, or life-stage events.",
        "Tell us where the UI feels cluttered or empty.",
      ],
    },
    {
      label: "Support development",
      badge: "Coming soon",
      bullets: [
        "Optional supporter packs and cosmetics will arrive later.",
        "You’ll never need to pay to keep your pup alive or happy.",
        "For now, the best support is feedback and sharing the app.",
      ],
    },
  ],
  vO = [
    "Early access to new breeds, tricks, and events.",
    "Exclusive cosmetic items and badges that don’t affect balance.",
    "Name in the credits or a small in-game thank-you.",
  ];
function _O() {
  return Y.jsx(pS, {
    title: "Contribute to Doggerz",
    subtitle:
      "Help shape the virtual pup simulator — feedback, testing, sharing, and future supporter perks.",
    metaDescription:
      "Learn how to contribute to Doggerz by playing, sharing feedback, helping test new features, and supporting development.",
    padding: "px-6 py-10",
    children: Y.jsxs("div", {
      className:
        "grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start",
      children: [
        Y.jsxs("div", {
          className: "space-y-8 text-base leading-relaxed text-zinc-200",
          children: [
            Y.jsxs("section", {
              className:
                "space-y-3 rounded-2xl border border-emerald-500/20 bg-zinc-900/70 px-4 py-4 shadow-md shadow-black/40",
              children: [
                Y.jsx("p", {
                  className:
                    "text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300",
                  children: "WHY CONTRIBUTION MATTERS",
                }),
                Y.jsx("p", {
                  children:
                    "Doggerz is tuned around real-time care, life stages, and long-term potty training streaks. The best way to improve it is by watching how real players use it, where they get attached, and where things feel off. Every bit of feedback helps tighten the loop.",
                }),
                Y.jsx("p", {
                  className: "text-sm text-zinc-400",
                  children:
                    "You do not need to spend money to contribute. Playing, sharing, and telling us what feels good (or bad) is already a huge help.",
                }),
              ],
            }),
            Y.jsxs("section", {
              "aria-label": "Ways to contribute",
              className:
                "space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950/70 px-4 py-4",
              children: [
                Y.jsx("h2", {
                  className: "text-lg font-semibold text-zinc-50",
                  children: "Ways you can help today",
                }),
                Y.jsx("div", {
                  className: "grid gap-4 md:grid-cols-3",
                  children: yO.map((n) =>
                    Y.jsxs(
                      "article",
                      {
                        className:
                          "flex flex-col gap-2 rounded-2xl bg-zinc-900/80 px-3 py-3",
                        children: [
                          Y.jsxs("header", {
                            className:
                              "flex items-center justify-between gap-2",
                            children: [
                              Y.jsx("h3", {
                                className:
                                  "text-sm font-semibold text-zinc-100",
                                children: n.label,
                              }),
                              Y.jsx("span", {
                                className:
                                  "rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300",
                                children: n.badge,
                              }),
                            ],
                          }),
                          Y.jsx("ul", {
                            className:
                              "mt-1 space-y-1.5 text-[0.9rem] text-zinc-300",
                            children: n.bullets.map((e) =>
                              Y.jsxs(
                                "li",
                                {
                                  className: "flex gap-2",
                                  children: [
                                    Y.jsx("span", {
                                      className:
                                        "mt-[7px] h-1.5 w-1.5 rounded-full bg-emerald-400",
                                    }),
                                    Y.jsx("span", { children: e }),
                                  ],
                                },
                                e,
                              ),
                            ),
                          }),
                        ],
                      },
                      n.label,
                    ),
                  ),
                }),
              ],
            }),
            Y.jsxs("section", {
              "aria-label": "Future supporter perks",
              className:
                "space-y-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-4",
              children: [
                Y.jsx("h2", {
                  className: "text-lg font-semibold text-emerald-300",
                  children: "Future supporter perks",
                }),
                Y.jsx("p", {
                  className: "text-[0.95rem]",
                  children:
                    "As Doggerz grows, optional supporter features may unlock. These are cosmetic or convenience-based, never required to care for your pup:",
                }),
                Y.jsx("ul", {
                  className:
                    "mt-1 list-disc list-inside space-y-1.5 text-[0.9rem] text-zinc-200",
                  children: vO.map((n) => Y.jsx("li", { children: n }, n)),
                }),
                Y.jsx("p", {
                  className: "pt-1 text-xs text-zinc-400",
                  children:
                    "Exact details may change; this page will stay honest about what paid features do and don't affect.",
                }),
              ],
            }),
            Y.jsxs("section", {
              "aria-label": "Contact and feedback",
              className: "space-y-3 border-t border-zinc-800 pt-6",
              children: [
                Y.jsx("h2", {
                  className: "text-lg font-semibold text-zinc-50",
                  children: "Got feedback or found a bug?",
                }),
                Y.jsx("p", {
                  className: "text-[0.95rem] text-zinc-200",
                  children:
                    "Keep a note of what happened (what you tapped, what screen you were on, what you expected vs. what you saw). Screenshots are gold. Use the Support link in the footer or the in-app feedback option once it is live.",
                }),
                Y.jsx("p", {
                  className: "text-xs text-zinc-400",
                  children:
                    "If you prefer, you can also reach out via the Support area when it goes live — this page is designed to plug into that flow.",
                }),
              ],
            }),
          ],
        }),
        Y.jsxs("aside", {
          "aria-label": "Supporter overview",
          className: "relative mt-2 lg:mt-0",
          children: [
            Y.jsx("div", {
              className:
                "pointer-events-none absolute -inset-5 -z-10 bg-emerald-500/10 blur-3xl",
            }),
            Y.jsxs("div", {
              className:
                "flex h-full flex-col justify-between rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-5 shadow-2xl shadow-emerald-500/30",
              children: [
                Y.jsxs("header", {
                  className: "mb-4 space-y-1",
                  children: [
                    Y.jsx("p", {
                      className:
                        "text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300",
                      children: "COMMUNITY-DRIVEN",
                    }),
                    Y.jsx("h2", {
                      className: "text-base font-semibold text-zinc-50",
                      children: "Doggerz grows with its trainers.",
                    }),
                    Y.jsx("p", {
                      className: "text-xs text-zinc-300",
                      children:
                        "Every session, streak, and bug report helps tune the systems so pups feel alive without feeling like chores.",
                    }),
                  ],
                }),
                Y.jsxs("div", {
                  className: "space-y-3 text-sm text-zinc-200",
                  children: [
                    Y.jsxs("p", {
                      children: [
                        "If you like where Doggerz is heading, the best contribution right now is simple:",
                        " ",
                        Y.jsx("span", {
                          className: "font-semibold text-emerald-300",
                          children: "keep playing and tell us what feels off.",
                        }),
                        " ",
                        "The app will add clearer feedback and support entry points over time.",
                      ],
                    }),
                    Y.jsx("p", {
                      className: "text-xs text-zinc-400",
                      children:
                        "Long term, this card can link out to supporter tiers, dev logs, or community hubs — the layout is ready for those hooks.",
                    }),
                  ],
                }),
                Y.jsxs("footer", {
                  className: "mt-5 flex flex-wrap gap-3 text-xs text-zinc-300",
                  children: [
                    Y.jsx(Ql, {
                      to: "/",
                      className:
                        "inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-[11px] font-semibold text-zinc-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-400",
                      children: "Back to home",
                    }),
                    Y.jsx(Ql, {
                      to: "/about",
                      className:
                        "inline-flex items-center justify-center rounded-full border border-zinc-700 px-4 py-2 text-[11px] font-semibold text-zinc-100 transition hover:border-zinc-500 hover:bg-zinc-900",
                      children: "Learn how the sim works",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
const wO = z.lazy(() => Kn(() => import("./Splash-CuDJ3zkC.js"), [])),
  EO = z.lazy(() =>
    Kn(() => import("./Landing-ut81j_EI.js"), __vite__mapDeps([0, 1, 2])),
  ),
  TO = z.lazy(() => Kn(() => import("./Adopt-CIkprTGu.js"), [])),
  SO = z.lazy(() =>
    Kn(() => import("./Game-DWmq8r5b.js"), __vite__mapDeps([3, 1])),
  ),
  IO = z.lazy(() => Kn(() => import("./Login-DEndXJkp.js"), [])),
  RO = z.lazy(() => Kn(() => import("./Signup-BI7okwUl.js"), [])),
  AO = z.lazy(() => Kn(() => import("./About-Bl8Vf5Sj.js"), [])),
  CO = z.lazy(() => Kn(() => import("./Settings-DPKp_jlK.js"), [])),
  PO = z.lazy(() => Kn(() => import("./Legal-Cd8UB1l3.js"), [])),
  kO = z.lazy(() => Kn(() => import("./NotFound-BsnPWOGQ.js"), [])),
  xO = z.lazy(() => Kn(() => import("./Memory-ZSVFxocC.js"), [])),
  bO = z.lazy(() =>
    Kn(() => import("./Potty-J2lfuw4P.js"), __vite__mapDeps([4, 2])),
  ),
  DO = z.lazy(() => Kn(() => import("./Contact-B6HrMc2q.js"), []));
function NO() {
  const n = Or();
  return Y.jsx(DC, {
    children: Y.jsxs("div", {
      className: "app-shell flex flex-col min-h-screen",
      children: [
        Y.jsx("style", {
          children: `:root{
${WR()}
}`,
        }),
        Y.jsx("a", {
          href: "#app-main",
          className:
            "sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black shadow-lg",
          children: "Skip to main content",
        }),
        Y.jsx(qR, {}),
        Y.jsx(gO, {}),
        Y.jsx("main", {
          className: "flex-1",
          id: "app-main",
          "aria-label": "App main area",
          children: Y.jsx(z.Suspense, {
            fallback: Y.jsx("div", {
              className:
                "flex items-center justify-center h-screen text-zinc-400",
              children: "Loading...",
            }),
            children: Y.jsxs(rR, {
              location: n,
              children: [
                Y.jsx(rn, { path: "/", element: Y.jsx(EO, {}) }),
                Y.jsx(rn, { path: "/splash", element: Y.jsx(wO, {}) }),
                Y.jsx(rn, { path: "/adopt", element: Y.jsx(TO, {}) }),
                Y.jsx(rn, { path: "/login", element: Y.jsx(IO, {}) }),
                Y.jsx(rn, { path: "/signup", element: Y.jsx(RO, {}) }),
                Y.jsx(rn, {
                  path: "/game",
                  element:
                    n.pathname === "/game"
                      ? Y.jsx(Cp, { children: Y.jsx(SO, {}) })
                      : null,
                }),
                Y.jsx(rn, {
                  path: "/potty",
                  element:
                    n.pathname === "/potty"
                      ? Y.jsx(Cp, { children: Y.jsx(bO, {}) })
                      : null,
                }),
                Y.jsx(Y.Fragment, {
                  children: Y.jsx(rn, {
                    path: "/contribute",
                    element: Y.jsx(_O, {}),
                  }),
                }),
                Y.jsx(rn, { path: "/about", element: Y.jsx(AO, {}) }),
                Y.jsx(rn, { path: "/settings", element: Y.jsx(CO, {}) }),
                Y.jsx(rn, { path: "/legal", element: Y.jsx(PO, {}) }),
                Y.jsx(rn, { path: "/memory", element: Y.jsx(xO, {}) }),
                Y.jsx(rn, { path: "/contact", element: Y.jsx(DO, {}) }),
                Y.jsx(rn, {
                  path: "/home",
                  element: Y.jsx(gp, { to: "/", replace: !0 }),
                }),
                Y.jsx(rn, {
                  path: "/play",
                  element: Y.jsx(gp, { to: "/game", replace: !0 }),
                }),
                Y.jsx(rn, { path: "*", element: Y.jsx(kO, {}) }),
              ],
            }),
          }),
        }),
        Y.jsx(KR, {}),
      ],
    }),
  });
}
const OO = AR([{ path: "/*", element: Y.jsx(NO, {}) }], {
  future: {
    v7_relativeSplatPath: !0,
    v7_fetcherPersist: !0,
    v7_normalizeFormMethod: !0,
    v7_skipActionErrorRevalidation: !0,
  },
});
function LO() {
  return Y.jsx(BR, { router: OO });
}
var $c = {},
  H0;
function MO() {
  if (H0) return $c;
  H0 = 1;
  var n = yw();
  return (($c.createRoot = n.createRoot), ($c.hydrateRoot = n.hydrateRoot), $c);
}
var VO = MO();
const FO = Zp(VO),
  UO = { condition: "sun", lastChangedAt: Date.now() },
  hp = ["sun", "rain", "snow"],
  mS = gm({
    name: "weather",
    initialState: UO,
    reducers: {
      setWeather(n, { payload: e }) {
        !e ||
          !e.condition ||
          ((n.condition = e.condition), (n.lastChangedAt = Date.now()));
      },
      cycleWeather(n) {
        const e = hp.indexOf(n.condition);
        ((n.condition = hp[(e + 1) % hp.length]),
          (n.lastChangedAt = Date.now()));
      },
    },
  }),
  { setWeather: mL, cycleWeather: gL } = mS.actions,
  zO = mS.reducer,
  jO = aC({ reducer: { dog: cO, user: xC, weather: zO } }),
  gS = document.getElementById("root");
if (!gS)
  throw new Error("Root element #root not found. Check your index.html.");
FO.createRoot(gS).render(
  Y.jsx(SI.StrictMode, {
    children: Y.jsx(cA, { store: jO, children: Y.jsx(LO, {}) }),
  }),
);
export {
  mO as A,
  fL as B,
  q2 as C,
  YO as D,
  pL as E,
  gm as F,
  $2 as G,
  H2 as H,
  B2 as I,
  W2 as J,
  Ql as L,
  pS as P,
  SI as R,
  Uh as a,
  bC as b,
  fA as c,
  XO as d,
  iL as e,
  sL as f,
  tL as g,
  vp as h,
  JO as i,
  Y as j,
  nL as k,
  eL as l,
  ZO as m,
  cL as n,
  uL as o,
  lL as p,
  aL as q,
  z as r,
  kC as s,
  hL as t,
  gA as u,
  oL as v,
  dL as w,
  uO as x,
  aS as y,
  ld as z,
};
