function Linear(pT, pA, pB) {
    return (1 - pT) * pA + pT * pB
}

function LinearPoint(pT, pA, pB) {
    return new Point(Linear(pT, pA.x, pB.x), Linear(pT, pA.y, pB.y))
}

function QuadraticBezier(pT, pA, pB, pC) {
    //return (1 - pT) * (1 - pT) * pA + 2 * pT * (1 - pT) * pB + pT * pT * pC;
    return Linear(pT, Linear(pT, pA, pB), Linear(pT, pB, pC));
    /*var nn = 2;
    var a0 = BinomialCoefficients(nn);
    var a1 = BezierT(pT, nn);
    return a0[0] * a1[0] * pA + a0[1] * a1[1] * pB + a0[2] * a1[2] * pC;*/
}

function QuadraticBezierPoint(pT, pA, pB, pC) {
    return new Point(QuadraticBezier(pT, pA.x, pB.x, pC.x), QuadraticBezier(pT, pA.y, pB.y, pC.y))
}

function BinomialCoefficients(pN) {
    var temp = new Array(pN + 1);
    var i, j, s
    for (i = 0; i <= pN; i++) {
        s = 1;
        for (j = pN - i + 1; j <= pN; j++) {
            s *= j;
        }
        for (j = 1; j <= i; j++) {
            s /= j;
        }
        temp[i] = s;
    }
    return temp;
}

function Bezier(pV, pT) {
    var nn = pP.length - 1;
    var a0 = BinomialCoefficients(nn);
    var a1 = BezierT(pT, nn);
    var ss = 0;
    for (var i = 0; i <= nn; i++) {
        ss += a0[i] * a1[i] * pV[i]
    }
    return ss;
}

function BezierPoint(pP, pT) {
    var nn = pP.length - 1;
    var a0 = BinomialCoefficients(nn);
    var a1 = BezierT(pT, nn);
    var pp = new Point();
    var ww = [1, 1, 1]
    for (var i = 0; i <= nn; i++) {
        pp.x += a0[i] * a1[i] * pP[i].x * ww[i];
        pp.y += a0[i] * a1[i] * pP[i].y * ww[i];
    }
    return new Point(pp.x, pp.y);
}

function BezierPointWeights(pP, pT, pW) {
    var nn = pP.length - 1;
    var a0 = BinomialCoefficients(nn);
    var a1 = BezierT(pT, nn);
    var pp = new Point();
    for (var i = 0; i <= nn; i++) {
        pp.x += a0[i] * a1[i] * pP[i].x * pW[i];
        pp.y += a0[i] * a1[i] * pP[i].y * pW[i];
    }

    var pp0 = new Point();
    for (var i = 0; i <= nn; i++) {
        pp0.x += a0[i] * a1[i] * pW[i];
        pp0.y += a0[i] * a1[i] * pW[i];
    }
    return new Point(pp.x / pp0.x, pp.y / pp0.y);
}

function BezierT(pT, pN) {
    var temp = new Array(pN + 1);
    var t0 = pT;
    var t1 = 1 - pT;
    var i
    for (i = 0; i <= pN; i++) {
        temp[i] = Math.pow(t1, pN - i) * Math.pow(t0, i);
    }
    return temp;
}

function PosToLineT(pP, pP0, pP1) {
    var tempP = PosToLine(pP, pP0, pP1);
    var v = pP1.sub(pP0);
    if (v.x != 0) {
        return {
            t: (tempP.x - pP0.x) / v.x,
            p: tempP
        };
    } else {
        return {
            t: (tempP.y - pP0.y) / v.y,
            p: tempP
        };
    }
}

function PosToLine(pP, pP0, pP1) {
    var v = pP1.sub(pP0);
    var a = v.y;
    var b = -v.x;
    var c = v.x * pP0.y - v.y * pP0.x;
    var aa = a * a;
    var bb = b * b;
    var aabb = aa + bb;
    var ab = a * b;
    return new Point((bb * pP.x - ab * pP.y - a * c) / aabb, (-ab * pP.x + aa * pP.y - b * c) / aabb);

}

document.addEventListener("DOMContentLoaded", function(event) {
    var pp0 = new Array();
    var ww0 = new Array();
    var t = 0;
    var ID;
    var Points01 = new Array();
    var GraffitiCanvas01 = document.getElementById('Canvas01');
    var GraffitiCanvas01Style = Style(GraffitiCanvas01);
    var ctx = GraffitiCanvas01.getContext("2d");
    var PointLayer01 = document.getElementById('PointLayer01');
    var Selected = -1;
    var speed = 0.01;

    function CreatePoint(pX, pY, pW) {
        var Index = Points01.length;
        var Point01 = document.createElement('div');
        var Point01Style = Style(Point01);
        Points01[Index] = Point01;
        Point01.classList.add('Point01')
        PointLayer01.appendChild(Point01);
        Point01Style.left = pX;
        Point01Style.top = pY;
        pp0[Index] = new Point(pX, pY);
        ww0[Index] = pW;
        return Index;
    }

    function CreateInsertPoint(pX, pY, pW, pI) {
        var Point01 = document.createElement('div');
        var Point01Style = Style(Point01);
        Points01.splice(pI, 0, Point01)
        Point01.classList.add('Point01')
        PointLayer01.appendChild(Point01);
        Point01Style.left = pX;
        Point01Style.top = pY;
        pp0.splice(pI, 0, new Point(pX, pY))
        ww0.splice(pI, 0, pW);
    }

    CreatePoint(0, 0, 1);
    CreatePoint(300, 150, 1);

    ID = setInterval(ef, 1000 / 60);
    var PointLayer01Style = Style(PointLayer01);
    var Drag01 = new Drag();
    Drag01.Bind(PointLayer01);

    Drag01.list.addEvent("Begin", function(e) {
        //console.log(e)
    });

    Drag01.list.addEvent("Process", function(e) {
        if (Selected >= 0) {
            var move = e.data.Point.sub(e.data.OldPoint);
            var DragBox01Style = Style(Points01[Selected]);
            DragBox01Style.left += move.x;
            DragBox01Style.top += move.y;
            pp0[Selected].x = DragBox01Style.left;
            pp0[Selected].y = DragBox01Style.top;
        }
    });

    Drag01.list.addEvent("End", function(e) {
        if (!(pp0[Selected].x >= 0 && pp0[Selected].y >= 0 && pp0[Selected].x <= GraffitiCanvas01Style.width && pp0[Selected].y <= GraffitiCanvas01Style.height)) {
            PointLayer01.removeChild(Points01[Selected]);
            Points01.splice(Selected, 1);
            pp0.splice(Selected, 1);
            ww0.splice(Selected, 1);
            Selected = -1;
        }
    });
    EventUtil.addHandler(PointLayer01, 'dblclick', function(e) {
        if (e.target != PointLayer01) {
            for (var i = 0; i < pp0.length; i++) {
                if (Points01[i] == e.target) {
                    Selected = -1;
                    PointLayer01.removeChild(Points01[i]);
                    Points01.splice(i, 1);
                    pp0.splice(i, 1);
                    ww0.splice(i, 1);
                    break;
                }
            }

        }
    });

    function LineCreatePoint(pP) {
        var d = Infinity;
        var Index = -1;
        var t = 0;
        for (var i = 0; i < pp0.length - 1; i++) {
            var temp001 = PosToLineT(pP, pp0[i], pp0[i + 1]);
            if (temp001.t >= 0 && temp001.t <= 1) {
                var dis = pP.sub(temp001.p).len();
                if (dis <= 10 && dis <= d) {
                    d = dis
                    Index = i;
                    t = temp001.t;
                }
            }
        }
        if (Index >= 0) {
            return Index + 1;
        }
        var d0 = pP.sub(pp0[0]).len();
        var d1 = pP.sub(pp0[pp0.length - 1]).len();
        if (d0 < d1) {
            return 0;
        } else {
            return pp0.length;
        }
    }
    EventUtil.addHandler(PointLayer01, 'mousedown', function(e) {
        console.log(e)
        if (Selected >= 0) {
            Points01[Selected].classList.remove('Selected');
            Selected = -1;
        }
        if (e.button == 0) {
            if (e.target == PointLayer01) {
                var Index = LineCreatePoint(new Point(e.offsetX, e.offsetY));
                if (Index >= 0) {
                    Selected = Index;
                    CreateInsertPoint(e.offsetX, e.offsetY, 1, Selected)
                } else {
                    Selected = CreatePoint(e.offsetX, e.offsetY, 1);
                }
                Points01[Selected].classList.add('Selected');
            } else {
                for (var i = 0; i < pp0.length; i++) {
                    if (Points01[i] == e.target) {
                        Selected = i;
                        break;
                    }
                }
                Points01[Selected].classList.add('Selected');
            }
        }
    });

    function ef() {
        ctx.clearRect(0, 0, GraffitiCanvas01.width, GraffitiCanvas01.height);
        t += Number(speed);
        t %= 1;

        ctx.lineCap = "round";
        ctx.strokeStyle = Change16(0x00ff00);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(pp0[0].x, pp0[0].y);
        for (var i = 0; i < 100; i++) {
            var pppp0 = BezierPointWeights(pp0, (i + 1) / 100, ww0);
            ctx.lineTo(pppp0.x, pppp0.y);
        }
        ctx.stroke();

        ctx.lineCap = "round";
        ctx.strokeStyle = Change16(0xff0000);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.moveTo(pp0[0].x, pp0[0].y);
        for (var i = 1; i < pp0.length; i++) {
            ctx.lineTo(pp0[i].x, pp0[i].y);
        }
        ctx.stroke();

        var pppp = BezierPointWeights(pp0, t, ww0);

        ctx.lineCap = "round";
        ctx.strokeStyle = Change16(0xff0000);
        ctx.beginPath();
        ctx.lineWidth = 1;
        ctx.arc(pppp.x, pppp.y, 10, 0, 2 * Math.PI, true)
        ctx.stroke();
    }



});

ㄑ