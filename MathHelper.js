class MathHelper {
    static nearestPointOnPolygon(returnPoint, polygon, point) {
        const leastNearestPoint = returnPoint || [0, 0];
        let leastDistanceSquared = Number.MAX_VALUE;
        for (let i = 0; i < polygon.length; i++) {
            const currentPoint = polygon[i];
            const nextPoint = polygon[(i + 1) % polygon.length];

            const nearestPoint = MathHelper.nearestPointOnLineSegment([currentPoint, nextPoint], point);
            const dx = nearestPoint[0] - point[0];
            const dy = nearestPoint[1] - point[1];
            const d2 = dx * dx + dy * dy;
            if (d2 < leastDistanceSquared) {
                leastDistanceSquared = d2;
                leastNearestPoint[0] = nearestPoint[0];
                leastNearestPoint[1] = nearestPoint[1];
            }
        }

        return leastDistanceSquared;
    }

    static nearestPointOnLineSegment(line, point) {
        const lineDX = line[1][0] - line[0][0];
        const lineDY = line[1][1] - line[0][1];
        const length2 = lineDX * lineDX + lineDY * lineDY;
        if (length2 === 0) {
            return [line[0][0], line[0][1]];
        }

        const t = ((point[0] - line[0][0]) * (line[1][0] - line[0][0]) + (point[1] - line[0][1]) * (line[1][1] - line[0][1])) / length2;
        if (t < 0) {
            return [line[0][0], line[0][1]];
        }
        if (t > 1) {
            return [line[1][0], line[1][1]];
        }

        return [line[0][0] + t * (line[1][0] - line[0][0]), line[0][1] + t * (line[1][1] - line[0][1])];
    }

    static distanceSquaredBetweenLineSegments(returnPoint, line1, line2) {
        const initialPoint = MathHelper.intersectLines(line1, line2);
        if (initialPoint) {
            if (returnPoint) {
                returnPoint[0] = initialPoint[0];
                returnPoint[1] = initialPoint[1];
            }

            return 0;
        }

        const line1Point1 = MathHelper.nearestPointOnLineSegment(line1, line2[0]);
        const line1Point2 = MathHelper.nearestPointOnLineSegment(line1, line2[1]);
        const line2Point1 = MathHelper.nearestPointOnLineSegment(line2, line1[0]);
        const line2Point2 = MathHelper.nearestPointOnLineSegment(line2, line1[1]);

        const line1Point1DX = line1Point1[0] - line2[0][0];
        const line1Point1DY = line1Point1[1] - line2[0][1];
        const line1Point2DX = line1Point2[0] - line2[1][0];
        const line1Point2DY = line1Point2[1] - line2[1][1];
        const line2Point1DX = line2Point1[0] - line1[0][0];
        const line2Point1DY = line2Point1[1] - line1[0][1];
        const line2Point2DX = line2Point2[0] - line1[1][0];
        const line2Point2DY = line2Point2[1] - line1[1][1];

        const line1Point1D2 = line1Point1DX * line1Point1DX + line1Point1DY * line1Point1DY;
        const line1Point2D2 = line1Point2DX * line1Point2DX + line1Point2DY * line1Point2DY;
        const line2Point1D2 = line2Point1DX * line2Point1DX + line2Point1DY * line2Point1DY;
        const line2Point2D2 = line2Point2DX * line2Point2DX + line2Point2DY * line2Point2DY;

        if (line1Point1D2 < line1Point2D2 && line1Point1D2 < line2Point1D2 && line1Point1D2 < line2Point2D2) {
            if (returnPoint) {
                returnPoint[0] = line1Point1[0];
                returnPoint[1] = line1Point1[1];
            }

            return line1Point1D2;
        } else if (line1Point2D2 < line2Point1D2 && line1Point2D2 < line2Point2D2) {
            if (returnPoint) {
                returnPoint[0] = line1Point2[0];
                returnPoint[1] = line1Point2[1];
            }

            return line1Point2D2;
        } else if (line2Point1D2 < line2Point2D2) {
            if (returnPoint) {
                returnPoint[0] = line2Point1[0];
                returnPoint[1] = line2Point1[1];
            }

            return line2Point1D2;
        } else {
            if (returnPoint) {
                returnPoint[0] = line2Point2[0];
                returnPoint[1] = line2Point2[1];
            }

            return line2Point2D2;
        }
    }

    static distanceSquaredBetweenPolygonAndLine(returnPoint, polygon, line) {
        if (MathHelper.isPointInPolygon(polygon, line[0])) {
            return 0;
        }

        let smallestDistance = Number.MAX_VALUE;
        const smallestReturnPoint = [0, 0];
        for (let i = 0; i < polygon.length; i++) {
            const currentPoint = polygon[i];
            const nextPoint = polygon[(i + 1) % polygon.length];

            const testReturnPoint = [0, 0];
            const d2 = MathHelper.distanceSquaredBetweenLineSegments(testReturnPoint, [currentPoint, nextPoint], line);

            if (d2 < smallestDistance) {
                smallestDistance = d2;
                smallestReturnPoint[0] = testReturnPoint[0];
                smallestReturnPoint[1] = testReturnPoint[1];
            }
        }

        if (returnPoint) {
            returnPoint[0] = smallestReturnPoint[0];
            returnPoint[1] = smallestReturnPoint[1];
        }

        return smallestDistance;
    }

    static intersectSegmentCircle(returnPoint, point, lineStart, lineEnd, radius) {
        let v2aX = lineEnd[0] - lineStart[0];
        let v2aY = lineEnd[1] - lineStart[1];
        const len = Math.sqrt(v2aX * v2aX + v2aY * v2aY);
        v2aX /= (len > 0 ? len : 1);
        v2aY /= (len > 0 ? len : 1);

        const v2bX = point[0] - lineStart[0];
        const v2bY = point[1] - lineStart[1];

        let v2cX = 0;
        let v2cY = 0;
        let v2dX = 0;
        let v2dY = 0;
        const u = v2bX * v2aX + v2bY * v2aY;
        if (u <= 0) {
            v2cX = lineStart[0];
            v2cY = lineStart[1];
        } else if (u >= len) {
            v2cX = lineEnd[0];
            v2cY = lineEnd[1];
        } else {
            v2aX *= u;
            v2aY *= u;
            v2dX = v2aX;
            v2dY = v2aY;
            v2cX = v2dX + lineStart[0];
            v2cY = v2dY + lineStart[1];
        }

        v2aX = v2cX - point[0];
        v2aY = v2cY - point[1];

        v2dX = lineStart[0] - lineEnd[0];
        v2dY = lineStart[1] - lineEnd[1];
        const v2dLen = Math.sqrt(v2dX * v2dX + v2dY * v2dY);
        v2dX /= (v2dLen > 0 ? v2dLen : 1);
        v2dY /= (v2dLen > 0 ? v2dLen : 1);

        // Handle special case of segment containing circle center
        if (v2aX === 0 && v2aY === 0) {
            returnPoint[0] = point[0] + v2dX * radius;
            returnPoint[1] = point[1] + v2dY * radius;
        } else {
            const v2aLen = Math.sqrt(v2aX * v2aX + v2aY * v2aY);
            const v2aNormX = v2aX / (v2aLen > 0 ? v2aLen : 1);
            const v2aNormY = v2aY / (v2aLen > 0 ? v2aLen : 1);
            const depth = radius - v2aLen;

            returnPoint[0] = point[0] + v2aNormX * (radius - depth);
            returnPoint[1] = point[1] + v2aNormY * (radius - depth);

            const percent = Math.abs(Math.cos((radius - depth) / radius * Math.PI / 2));
            returnPoint[0] += v2dX * percent * radius;
            returnPoint[1] += v2dY * percent * radius;
        }

        const v2aLen2 = v2aX * v2aX + v2aY * v2aY;

        return v2aLen2 <= radius * radius;
    }

    static hermite(t, points, tangentials) {
        const n1 = 2 * t * t * t - 3 * t * t + 1;
        const n2 = t * t * t - 2 * t * t + t;
        const n3 = -2 * t * t * t + 3 * t * t;
        const n4 = t * t * t - t * t;

        return [
            n1 * points[0][0] + n2 * tangentials[0][0] + n3 * points[1][0] + n4 * tangentials[1][0],
            n1 * points[0][1] + n2 * tangentials[0][1] + n3 * points[1][1] + n4 * tangentials[1][1],
        ];
    }

    // TODO I should optimize this for when the line comes from the center of the circle
    static ellipseLineIntersection(center, dimensions, line) {
        const segment = true;

        // if the ellipse or line segment are empty, return no intersections
        if (dimensions[0] === 0 || dimensions[1] === 0 || (line[0][0] === line[1][0] && line[0][1] === line[1][1])) {
            console.error('Early return invalid properties.');
            return [];
        }

        const offsetLine = [
            [line[0][0] - center[0], line[0][1] - center[1]],
            [line[1][0] - center[0], line[1][1] - center[1]],
        ];

        // get the semimajor and semiminor axes
        const a = dimensions[0] / 2;
        const b = dimensions[1] / 2;

        // calculate the quadratic parameters
        const lineDX = offsetLine[1][0] - offsetLine[0][0];
        const lineDY = offsetLine[1][1] - offsetLine[0][1];
        const A = lineDX * lineDX / a / a + lineDY * lineDY / b / b;
        const B = 2 * offsetLine[0][0] * lineDX / a / a + 2 * offsetLine[0][1] * lineDY / b / b;
        const C = offsetLine[0][0] * offsetLine[0][0] / a / a + offsetLine[0][1] * offsetLine[0][1] / b / b - 1;

        // make a list of t values
        const t_values = [];

        // calculate the discriminant
        const discriminant = B * B - 4 * A * C;
        if (discriminant === 0) {
            // one real solution
            t_values.push(-B / 2 / A);
        } else if (discriminant > 0) {
            t_values.push((-B + Math.sqrt(discriminant)) / 2 / A);
            t_values.push((-B - Math.sqrt(discriminant)) / 2 / A);
        }

        // convert the t values into points
        const points = [];
        for (let i = 0; i < t_values.length; i++) {
            const t = t_values[i];

            // if the points are on the segment (or we don't care if they are), add them to the list
            if (!segment || ((t >= 0) && t <= 1)) {
                const x = offsetLine[0][0] + (offsetLine[1][0] - offsetLine[0][0]) * t + center[0];
                const y = offsetLine[0][1] + (offsetLine[1][1] - offsetLine[0][0]) * t + center[1];

                points.push([x, y]);
            }
        }

        return points;
    }

    static overlapPolygons(polygon1, polygon2) {
        // check if any point of polygon1 is inside polygon2
        for (let i = 0; i < polygon1.length; i++) {
            if (MathHelper.isPointInPolygon(polygon2, polygon1[i])) {
                return true;
            }
        }

        // check if any point of polygon2 is inside polygon1
        for (let i = 0; i < polygon2.length; i++) {
            if (MathHelper.isPointInPolygon(polygon1, polygon2[i])) {
                return true;
            }
        }

        // check if any polygon1 lines intersect with polygon2, this covers the inverse too
        for (let i = 0; i < polygon1.length; i++) {
            const currentPoint = polygon1[i];
            const nextPoint = polygon1[(i + 1) % polygon1.length];
            const line = [currentPoint, nextPoint];

            if (MathHelper.polygonLineIntersection(polygon2, line)) {
                return true;
            }
        }

        return false;
    }

    static getPolygonAABB(polygon) {
        const aabb = [
            [Number.MAX_VALUE, Number.MAX_VALUE],
            [-Number.MAX_VALUE, -Number.MAX_VALUE],
        ];
        for (let i = 0; i < polygon.length; i++) {
            aabb[0][0] = Math.min(aabb[0][0], polygon[i][0]);
            aabb[0][1] = Math.min(aabb[0][1], polygon[i][1]);
            aabb[1][0] = Math.max(aabb[1][0], polygon[i][0]);
            aabb[1][1] = Math.max(aabb[1][1], polygon[i][1]);
        }

        return aabb;
    }

    static overlapAABB(aabb1, aabb2) {
        return aabb1[0][0] <= aabb2[1][0] && aabb1[1][0] >= aabb2[0][0] && aabb1[0][1] <= aabb2[1][1] && aabb1[1][1] >= aabb2[0][1];
    }

    static polygonLineIntersection(polygon, line) {
        if (MathHelper.isPointInPolygon(polygon, line[0])) {
            return true;
        }

        if (MathHelper.isPointInPolygon(polygon, line[1])) {
            return true;
        }

        for (let i = 0; i < polygon.length; i++) {
            const currentPoint = polygon[i];
            const nextPoint = polygon[(i + 1) % polygon.length];

            if (MathHelper.intersectLines([currentPoint, nextPoint], line)) {
                return true;
            }
        }

        return false;
    }

    static isPointInPolygon(polygon, point) {
        // the polygon can be concave
        let j = polygon.length - 1;
        let oddNodes = false;

        for (let i = 0; i < polygon.length; i++) {
            if ((polygon[i][1] < point[1] && polygon[j][1] >= point[1]
                || polygon[j][1] < point[1] && polygon[i][1] >= point[1])
                && (polygon[i][0] <= point[0] || polygon[j][0] <= point[0])) {
                if (polygon[i][0] + (point[1] - polygon[i][1]) / (polygon[j][1] - polygon[i][1])
                    * (polygon[j][0] - polygon[i][0]) < point[0]) {
                    oddNodes = !oddNodes;
                }
            }
            j = i;
        }

        return oddNodes;
    }

    static intersectLines(line1, line2) {
        const x1 = line1[0][0];
        const y1 = line1[0][1];
        const x2 = line1[1][0];
        const y2 = line1[1][1];
        const x3 = line2[0][0];
        const y3 = line2[0][1];
        const x4 = line2[1][0];
        const y4 = line2[1][1];

        const ang1 = Math.atan2(y2 - y1, x2 - x1);
        const ang2 = Math.atan2(y4 - y3, x4 - x3);
        // TODO this cannot possibly be the most efficient method
        const dAng = MathHelper.radiansBetweenAngles(ang1, ang2);
        if (Math.abs(dAng) === 0 || Math.PI - Math.abs(dAng) === 0) {
            // lines are parallel
            return null;
        }

        const d = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (d === 0) {
            return null;
        }

        const yd = y1 - y3;
        const xd = x1 - x3;
        const ua = ((x4 - x3) * yd - (y4 - y3) * xd) / d;
        if (ua < 0 || ua > 1) {
            return null;
        }

        const ub = ((x2 - x1) * yd - (y2 - y1) * xd) / d;
        if (ub < 0 || ub > 1) {
            return null;
        }

        return [x1 + (x2 - x1) * ua, y1 + (y2 - y1) * ua];
    }

    /**
     * Checks if a point is inside an ellipse centered at 0,0.
     * @param point
     * @param dimensions
     */
    static isPointInsideEllipse(point, dimensions) {
        const dx = point[0] / (dimensions[0] / 2);
        const dy = point[1] / (dimensions[1] / 2);

        return dx * dx + dy * dy <= 1;
    }

    static HSVToRGB(h, s, v) {
        h /= 360;
        s /= 100;
        v /= 100;

        let r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);

        switch (i % 6) {
            case 0:
                r = v;
                g = t;
                b = p;
                break;

            case 1:
                r = q;
                g = v;
                b = p;
                break;

            case 2:
                r = p;
                g = v;
                b = t;
                break;

            case 3:
                r = p;
                g = q;
                b = v;
                break;

            case 4:
                r = t;
                g = p;
                b = v;
                break;

            case 5:
                r = v;
                g = p;
                b = q;
                break;
        }

        return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
    }

    static radiansBetweenAngles(angleFrom, angleTo) {
        if (angleTo < angleFrom) {
            if (angleFrom - angleTo > Math.PI) {
                return Math.PI * 2 - (angleFrom - angleTo);
            } else {
                return -(angleFrom - angleTo);
            }
        } else {
            if (angleTo - angleFrom > Math.PI) {
                return -(Math.PI * 2 - (angleTo - angleFrom));
            } else {
                return angleTo - angleFrom;
            }
        }
    }

    static easeInOut(t) {
        const p = 2.0 * t * t;
        return t < 0.5 ? p : -p + (4.0 * t) - 1.0;
    }

    static inverseEaseInOut(x) {
        return x < 0.25 ? Math.sqrt(x / 2.0) : 1.0 - Math.sqrt(1.0 - x) / Math.sqrt(2.0);
    }
}

register(MathHelper);
