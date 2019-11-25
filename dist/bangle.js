!function(t) {
	var n = {};

	function a(e) {
		if (n[e]) return n[e].exports;
		var r = n[e] = { i: e, l: !1, exports: {} };
		return t[e].call(r.exports, r, r.exports, a), r.l = !0, r.exports
	}

	a.m = t, a.c = n, a.d = function(e, r, t) {
		a.o(e, r) || Object.defineProperty(e, r, { enumerable: !0, get: t })
	}, a.r = function(e) {
		"undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(e, "__esModule", { value: !0 })
	}, a.t = function(r, e) {
		if (1 & e && (r = a(r)), 8 & e) return r;
		if (4 & e && "object" == typeof r && r && r.__esModule) return r;
		var t = Object.create(null);
		if (a.r(t), Object.defineProperty(t, "default", { enumerable: !0, value: r }), 2 & e && "string" != typeof r) for (var n in r) a.d(t, n, function(e) {
			return r[e]
		}.bind(null, n));
		return t
	}, a.n = function(e) {
		var r = e && e.__esModule ? function() {
			return e.default
		} : function() {
			return e
		};
		return a.d(r, "a", r), r
	}, a.o = function(e, r) {
		return Object.prototype.hasOwnProperty.call(e, r)
	}, a.p = "", a(a.s = 3)
}([function(e, r, t) {
	"use strict";

	function n(e) {
		return (e + 360) % 360
	}

	function a(e) {
		for (var r = {}, t = 0; t <= 360; t += 1) r[Math.round(t)] = e(t / 180 * Math.PI);
		return r
	}

	t.d(r, "a", function() {
		return n
	}), t.d(r, "b", function() {
		return c
	}), t.d(r, "c", function() {
		return f
	}), t.d(r, "d", function() {
		return y
	});
	var l = a(Math.cos), o = a(Math.sin), i = a(Math.tan);

	function u(e, r) {
		var t = Math.floor(e), n = Math.ceil(e + 1e-5), a = r[t], l = n - t, o = r[n] - a;
		return a + Math.abs(e - t) / l * o
	}

	function c(e) {
		return u(e, l)
	}

	function f(e) {
		return u(e, o)
	}

	function y(e) {
		return u(e, i)
	}
}, function(e, r, t) {
	"use strict";
	t.d(r, "a", function() {
		return S
	});
	var m = t(0), A = function(e, r) {
		for (var t = [], n = 0; n < r; n++) {
			t[n] = [];
			for (var a = 0; a < e; a++) n % 2 == 0 || a % 2 == 0 ? t[n].push(1) : t[n].push(-1)
		}
		var l, o = [], i = { x: 1, y: 1 };
		t[i.y][i.x] = 0, o.push(i);
		for (; o.length;) if (i = o.pop(), (l = p(t, i)).length) {
			o.push(i);
			var u = l[(c = 0, f = l.length - 1, Math.floor(Math.random() * (f - c + 1) + c))];
			t[(u.y + i.y) / 2][(u.x + i.x) / 2] = 0, t[u.y][u.x] = 0, o.push(u)
		}
		var c, f;
		return t[1][1] = 2, t[r - 2][e - 2] = 3, t
	}(41, 31), S = {
		mazeWidth: 20,
		mazeHeight: 15,
		screenWidth: 240,
		screenHeight: 160,
		viewAngleWidth: 70,
		angleStep: 7,
		playerStepSize: .1,
		mazeHorCells: 41,
		mazeVerCells: 31,
		playerX: 1.5,
		playerY: 1.5,
		maze: A,
		playerAngle: 1 === A[1][2] ? 90 : 0,
		onFrame: function e(r) {
			r.BTN4.read() && (S.playerAngle = Object(m.a)(S.playerAngle - S.angleStep));
			r.BTN5.read() && (S.playerAngle = Object(m.a)(S.playerAngle + S.angleStep));
			if (r.BTN1.read()) {
				var t = Math.floor(S.playerAngle / 90), n = 2 === t || 3 === t, a = 3 === t || 0 === t,
					l = Math.abs(Object(m.b)(S.playerAngle) * S.playerStepSize) * (a ? 1 : -1),
					o = Math.abs(Object(m.c)(S.playerAngle) * S.playerStepSize) * (n ? -1 : 1);
				c(l, o)
			}
			if (r.BTN2.read()) {
				var t = Math.floor(S.playerAngle / 90), n = 2 === t || 3 === t, a = 3 === t || 0 === t,
					l = Math.abs(Object(m.b)(S.playerAngle) * S.playerStepSize) * (a ? -1 : 1),
					o = Math.abs(Object(m.c)(S.playerAngle) * S.playerStepSize) * (n ? 1 : -1);
				c(l, o)
			}
			if (!i) return;
			d === S.playerX && h === S.playerY && s === S.playerAngle || (r.clear(), u(r), r.flip());
			d = S.playerX;
			h = S.playerY;
			s = S.playerAngle;
			setTimeout(function() {
				return e(r)
			}, 50)
		},
		startGame: function(e) {
			i = !0, S.onFrame(e)
		},
		stopGame: function() {
			i = !1
		}
	}, f = {
		"0000": !1,
		"0001": !0,
		"0010": !0,
		"0011": !1,
		"0100": !0,
		"0101": !1,
		"0110": !1,
		"0111": !0,
		1e3: !0,
		1001: !0,
		1010: !1,
		1011: !0,
		1100: !1,
		1101: !0,
		1110: !0,
		1111: !1
	}, i = !0;

	function T(e, r, t, n) {
		return (t - e) * (t - e) + (n - r) * (n - r)
	}

	function P(e, r) {
		return !(0 <= r.x && r.x < e[0].length && 0 <= r.y && r.y < e.length)
	}

	function y(e, r, t) {
		for (var n, a, l, o, i, u, c, f, y, p, d, h, s, g, b, x, v, M, w = Math.floor(e / 90), j = 0; !n || !a;) d = 2 === w || 3 === w, n || (l || (o = d ? Math.floor(S.playerY) : Math.floor(S.playerY) + 1, l = S.playerX - (S.playerY - o) / Object(m.d)(e)), 0 === j || c || (f = d ? -1 : 1, c = 1 / Object(m.d)(e)), s = l + (c || 0) * j * (d ? -1 : 1), g = o + (f || 0) * j, b = {
			x: Math.floor(s),
			y: Math.floor(g) + (d ? -1 : 0)
		}, P(A, b) || 1 === A[b.y][b.x] ? (r && t.drawDebugPixel(s, g), n = {
			x: s,
			y: g
		}) : r && t.drawDebugPixel(s, g, "#FF0000")), h = 0 === w || 3 === w, a || (i || (i = h ? Math.floor(S.playerX) + 1 : Math.floor(S.playerX), u = S.playerY - (S.playerX - i) * Object(m.d)(e)), 0 === j || y || (y = h ? 1 : -1, p = Math.abs(Object(m.d)(e)) * (d ? -1 : 1)), x = i + (y || 0) * j, v = u + (p || 0) * j, M = {
			x: Math.floor(x) + (h ? 0 : -1),
			y: Math.floor(v)
		}, P(A, M) || 1 === A[M.y][M.x] ? (r && t.drawDebugPixel(x, v), a = { x: x, y: v }) : r && t.drawDebugPixel(x, v, "#FF0000")), j++;
		var O = T(S.playerX, S.playerY, n.x, n.y) < T(S.playerX, S.playerY, a.x, a.y) ? n : a;
		if (r && t.drawDebugPixel(O.x, O.y, "#00FF00"), t.drawDebugLine(S.playerX, S.playerY, O.x, O.y), !O) throw new Error("intersection is null");
		return O
	}

	function u(n) {
		n.drawDebugGrid(A);
		for (var e = Object(m.a)(S.playerAngle - S.viewAngleWidth / 2), r = S.viewAngleWidth / S.screenWidth, t = [], a = 0; a < S.screenWidth; a += 1) {
			var l = Object(m.a)(e + r * a), o = y(l, 0 === a || a >= S.screenWidth - 1, n),
				i = Math.sqrt(T(S.playerX, S.playerY, o.x, o.y)) * Object(m.b)(Object(m.a)(l - S.playerAngle));
			t.push({ angle: l, collision: o, distance: i, shouldDrawWall: !1 })
		}
		var u = {};
		t.forEach(function(e) {
			var r = Math.round(e.collision.x), t = Math.round(e.collision.y);
			u[r + ";" + t] = { x: r, y: t }
		});
		var c = [];
		Object.keys(u).forEach(function(e) {
			var r = u[e], t = A[r.y - 1][r.x - 1], n = A[r.y - 1][r.x], a = A[r.y][r.x - 1], l = A[r.y][r.x];
			f[(1 === t ? "1" : "0") + (1 === n ? "1" : "0") + (1 === a ? "1" : "0") + (1 === l ? "1" : "0")] && c.push(r)
		}), c.forEach(function(n) {
			var a = 1e5, l = 0;
			t.forEach(function(e, r) {
				var t = Math.abs(n.x - e.collision.x) + Math.abs(n.y - e.collision.y);
				t < a && (l = r, a = t)
			}), t[l].shouldDrawWall = !0
		}), t.forEach(function(e, r) {
			var t = S.screenHeight / e.distance;
			e.shouldDrawWall ? n.drawVerticalLine(r, Math.round((S.screenHeight - t) / 2), Math.round((S.screenHeight - t) / 2 + t)) : (n.drawPixel(r, Math.round((S.screenHeight - t) / 2)), n.drawPixel(r, Math.round((S.screenHeight - t) / 2 + t)))
		})
	}

	function a(e, r) {
		return 1 === A[Math.floor(r)][Math.floor(e)]
	}

	function c(e, r) {
		var t = S.playerX + e, n = S.playerY + r;
		return a(t, n) && a(t = S.playerX, n = S.playerY + r) && a(t = S.playerX + e, n = S.playerY) ? void 0 : (S.playerX = t, void (S.playerY = n))
	}

	function p(r, e) {
		return [{ x: e.x - 2, y: e.y }, { x: e.x, y: e.y - 2 }, { x: e.x + 2, y: e.y }, { x: e.x, y: e.y + 2 }].filter(function(e) {
			return !P(r, e) && -1 === r[e.y][e.x]
		})
	}

	console.log("screen: ", S.screenWidth, S.screenHeight);
	var d = void 0, h = void 0, s = void 0
}, , function(e, r, t) {
	"use strict";
	t.r(r);
	var n = t(1);
	Bangle.setLCDMode("doublebuffered");
	var a = {
		BTN1: BTN1, BTN2: BTN2, BTN3: BTN3, BTN4: BTN4, BTN5: BTN5, drawPixel: function(e, r, t) {
			g.setPixel(e, r)
		}, drawVerticalLine: function(e, r, t) {
			g.drawLine(e, r, e, t)
		}, clear: function() {
			g.clear()
		}, flip: function() {
			g.flip()
		}, drawDebugGrid: function() {
		}, drawDebugLine: function() {
		}, drawDebugPixel: function() {
		}
	};
	n.a.startGame(a), console.log("starting maze runner")
}]);
