var canvas, ctx, intersectionPoints,
    points, edges, count, currentLevel = minLevel,
    fieldPointColor = "#333", intersectionPointColor = "black",
    noIntersectionColor = "black", intersectionColor = "grey",
    mode, pointsCount, minPointsCount = 10, maxPointsCount = 30, score;

function draw() {
    ctx.clearRect(0, 0, fieldWidth, fieldHeight);
    let x, y;
    ctx.lineWidth = 2;
    intersectionPoints = [];
    for (let i = 0; i < edges.length; ++i) {
        count = 0;
        let curBegin = points[edges[i].beginPoint],
            curEnd = points[edges[i].endPoint];
        for (let j = 0; j < edges.length; ++j) {
            let nextBegin = points[edges[j].beginPoint],
                nextEnd = points[edges[j].endPoint];
            let curLine  = makeLine(curBegin, curEnd),
                nextLine = makeLine(nextBegin, nextEnd);
            let curEdge  = edges[i],
                nextEdge = edges[j];
            if (curLine == nextLine) continue;
            let p = intersectionPoint(curLine, nextLine);
            if (p !== false) {
                ++count;
                curEdge.intersecting = nextEdge.intersecting = true;
                intersectionPoints.push(p);
            }
            if (count == 0) curEdge.intersecting = false;
        }
    }
    for (let i = 0, t0, t1; i < edges.length; ++i) {
        t0 = points[edges[i].beginPoint];
        t1 = points[edges[i].endPoint];
        ctx.lineJoin = ctx.lineCap = 'round';
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgb(255, 255, 255)';
        ctx.strokeStyle = "rgb(255,255,255)";
        if (edges[i].intersecting)  {
            ctx.shadowColor = 'rgb(0, 0, 0)';
            ctx.strokeStyle = intersectionColor;
        }
        ctx.beginPath();
        ctx.moveTo(t0.x, t0.y);
        ctx.lineTo(t1.x, t1.y);
        ctx.closePath();
        ctx.stroke();
    }
    for (let i = 0; i < intersectionPoints.length; ++i) {
        ctx.shadowColor = 'rgb(255, 255, 255)';
        ctx.beginPath();
        ctx.arc(intersectionPoints[i].x, intersectionPoints[i].y, 5, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fillStyle = intersectionPointColor;
        ctx.fill();
    }
    for (let i = 0; i < points.length; ++i) {
        x = points[i].x;
        y = points[i].y;
        field.drawPointPath(radius, x, y, i);
        ctx.fill();
    }
    window.requestAnimationFrame(draw);
};

function Field() {
    this.clear = function(obj) {
        if (points && edges && intersectionPoints) {
            for (let i = 0; i < points.length; ++i) points[i] = null;
            for (let i = 0; i < edges.length; ++i) edges[i] = null;
            for (let i = 0; i < intersectionPoints.length; ++i) intersectionPoints[i] = null;
            canvas = null;
        }
        while (obj.lastChild) obj.removeChild(obj.lastChild);
    }
    this.selectPoint = function() {
        selectedPoint = undefined;
        let x, y, xDis, yDis, dis, minDis = Math.PI * (radius * radius) / 2;
        for (let i = 0; i < points.length; ++i) {
            x = points[i].x;
            y = points[i].y;
            xDis = x - cursorPosX;
            yDis = y - cursorPosY;
            dis  = xDis * xDis + yDis * yDis;
            if (dis <= minDis) { minDis = dis; selectedPoint = i };
        }
    }
    this.movePoint = function() {
        points[selectedPoint].x = cursorPosX;
        points[selectedPoint].y = cursorPosY;
    }
    this.drawPointPath = function(r, x, y, i) {
        if (i == selectedPoint)
            ctx.fillStyle = isMoving ? "#5A5A5A" : "rgb(255,255,255)";
        else
            ctx.fillStyle = "rgb(255,255,255)";
        ctx.beginPath();
        ctx.arc(x,y,r - 7,0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.5)";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2, true);
        ctx.closePath();
    }
    this.changeLevel = function (inc, skip = false) {
        if (mode == "classic") {
            if (currentLevel + inc >= minLevel &&
                currentLevel + inc <= maxLevel)
                currentLevel += inc;
            field.createLayout();
        }
        else if (pointsCount + inc <= maxPointsCount &&
                 pointsCount + inc >= minPointsCount)
            field.generateLayout(pointsCount += inc);
        score = parseInt(score) + 100 - 100*skip;
        document.getElementById("score").innerHTML = "Score: " + score;
        if (!skip) {
            let sound = document.createElement("audio");
            sound.src = "victory.mp3";
            sound.setAttribute("preload", "auto");
            sound.setAttribute("controls", "none");
            sound.style.display = "none";
            sound.play();
        }
    }
    this.createLayout = function() {
        points = [];
        edges  = [];
        let level = presetLevels[currentLevel];
        for (let i = 0; i < level.points.length; ++i) {
            let point = {};
            point.x = level.points[i].x;
            point.y = level.points[i].y;
            points.push(point);
        }
        for (let i = 0; i < level.edges.length; ++i) {
            for (let j = 0; j < level.edges[i].length - 1; ++j) {
                let edge = {};
                edge.beginPoint = level.edges[i][j];
                edge.endPoint = level.edges[i][j + 1];
                edge.intersecting = false;
                edges.push(edge);
            }
        }
    }
    this.generateLayout = function(amount) {
        pointsCount = amount;
        points = [];
        edges  = [];

        let nodes = [], node = {};
        node.parent = 0;
        node.root = 0;
        node.len = 0;
        node.ch = amount;
        node.last_rope = 0;
        node.last_delta = 1;
        node.delta = 1;
        nodes.push(node);

        let i = 0, n = 0, type = 1,lastPoint = 0;
        while(points.length < amount - 1) {
            ++nodes[n].len;
            let point = {};
            let edge = {};
            point.x = randInt(radius, fieldWidth - radius);
            point.y = randInt(radius, fieldHeight - radius);
            points.push(point);

            if(nodes[n].len >= nodes[n].ch) {
                if(lastPoint != nodes[n].root) {
                    edge = {};
                    edge.beginPoint = lastPoint;
                    edge.endPoint = i;
                    edges.push(edge);
                }
                lastPoint = i;
                let l = nodes[n].len;
                n = nodes[n].parent;
                i = nodes[n].root;
                nodes[n].len += l;
            }
            else if((i > 0) && (nodes[n].ch > 1)) {
                let act = randInt(1,3);

                switch(act) {
                    //New rope
                    case 1:
                        //console.log('rope'+i);
                        if(lastPoint != nodes[n].root) {
                            edge = {};
                            edge.beginPoint = lastPoint;
                            edge.endPoint = i;
                            edges.push(edge);
                        }
                        lastPoint = i;
                        nodes[n].last_rope = i;
                        i = nodes[n].root;
                        nodes[n].last_delta = nodes[n].delta;
                        nodes[n].delta = nodes[n].root+nodes[n].len;
                        //console.log(nodes[n].delta);
                        break;

                    //Create node
                    case 2:
                        //console.log('NODE'+i);
                        let node = {};
                        node.parent = n;
                        node.root = node.last_rope = i;
                        node.last_delta = i+1;
                        node.delta = i+1;
                        node.len = 1;
                        node.ch = nodes[n].ch-nodes[n].len;
                        nodes.push(node);
                        n = nodes.length-1;
                        break;

                    //Not declared - default
                    case 3:

                        break;
                }
            }

            //TYPES OF EDGE
            if((nodes[n].last_rope > nodes[n].root)&&(i>nodes[n].root)) type = randInt(1,5);
            else type = 1;
            switch(type) {
                case 1:
                    edge = {};
                    edge.beginPoint = i;
                    edge.endPoint = points.length;
                    edges.push(edge);
                    break;

                case 2:
                    edge = {};
                    nodes[n].last_delta += randInt(0,nodes[n].last_rope-nodes[n].last_delta);
                    edge.beginPoint = nodes[n].last_delta;
                    edge.endPoint = i;
                    edges.push(edge);
                    //console.log('DELTA1on:'+nodes[n].last_delta+'-'+i);
                    break;

                default:
                    edge = {};
                    edge.beginPoint = i;
                    edge.endPoint = points.length;
                    edges.push(edge);

                    nodes[n].last_delta += randInt(0,nodes[n].last_rope-nodes[n].last_delta);

                    edge = {};
                    edge.beginPoint = nodes[n].last_delta;
                    edge.endPoint = i;
                    edges.push(edge);
                    //console.log('DELTA2on:'+nodes[n].last_delta+'-'+i);
                    break;
            }

            if(i < points.length) i = points.length;
            else ++i;
        }
        let point = {};
        point.x = randInt(radius, fieldWidth - radius);
        point.y = randInt(radius, fieldHeight - radius);
        points.push(point);

        let edge = {};
        edge.beginPoint = points.length - 1;
        edge.endPoint = lastPoint;
        edges.push(edge);
    }
}

var field = new Field();