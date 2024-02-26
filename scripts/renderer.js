class Renderer {
  // canvas:              object ({id: __, width: __, height: __})
  // num_curve_sections:  int
  constructor(canvas, num_curve_sections, show_points_flag) {
    this.canvas = document.getElementById(canvas.id);
    this.canvas.width = canvas.width;
    this.canvas.height = canvas.height;
    this.ctx = this.canvas.getContext("2d", { willReadFrequently: true });
    this.slide_idx = 0;
    this.num_curve_sections = num_curve_sections;
    this.show_points = show_points_flag;

    this.line_color = [0, 0, 0, 255];
    this.vertex_color = [255, 0, 0, 255];
  }

  // n:  int
  setNumCurveSections(n) {
    this.num_curve_sections = n;
    this.drawSlide(this.slide_idx);
  }

  // flag:  bool
  showPoints(flag) {
    this.show_points = flag;
    this.drawSlide(this.slide_idx);
  }

  // slide_idx:  int
  drawSlide(slide_idx) {
    this.slide_idx = slide_idx;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    let framebuffer = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

    switch (this.slide_idx) {
      case 0:
        this.drawSlide0(framebuffer);
        break;
      case 1:
        this.drawSlide1(framebuffer);
        break;
      case 2:
        this.drawSlide2(framebuffer);
        break;
      case 3:
        this.drawSlide3(framebuffer);
        break;
    }

    this.ctx.putImageData(framebuffer, 0, 0);
  }

  // framebuffer:  canvas ctx image data
  drawSlide0(framebuffer) {
    // Draws 2 Bezier curves
    //   - variable `this.num_curve_sections` should be used for `num_edges`
    //   - variable `this.show_points` should be used to determine whether or not to render vertices

    this.drawBezierCurve({ x: 1, y: 598 }, { x: 1, y: 1 }, { x: 798, y: 1 }, { x: 798, y: 598 }, this.num_curve_sections, this.line_color, framebuffer);
    this.drawBezierCurve({ x: 51, y: 598 }, { x: 51, y: 51 }, { x: 748, y: 51 }, { x: 748, y: 598 }, this.num_curve_sections, this.line_color, framebuffer);
  }

  // framebuffer:  canvas ctx image data
  drawSlide1(framebuffer) {
    // TODO: draw at least 2 circles
    //   - variable `this.num_curve_sections` should be used for `num_edges`
    //   - variable `this.show_points` should be used to determine whether or not to render vertices
  }

  // framebuffer:  canvas ctx image data
  drawSlide2(framebuffer) {
    // TODO: draw at least 2 convex polygons (each with a different number of vertices >= 5)
    //   - variable `this.show_points` should be used to determine whether or not to render vertices

    // Following lines are example of drawing a single triangle
    // (this should be removed after you implement the polygon)
    let point_a = { x: 80, y: 40 };
    let point_b = { x: 320, y: 160 };
    let point_c = { x: 240, y: 360 };
    this.drawTriangle(point_a, point_c, point_b, [0, 128, 128, 255], framebuffer);
  }

  // framebuffer:  canvas ctx image data
  drawSlide3(framebuffer) {
    // TODO: draw your name!
    //   - variable `this.num_curve_sections` should be used for `num_edges`
    //   - variable `this.show_points` should be used to determine whether or not to render vertices
  }

  // p0:           object {x: __, y: __}
  // p1:           object {x: __, y: __}
  // p2:           object {x: __, y: __}
  // p3:           object {x: __, y: __}
  // num_edges:    int
  // color:        array of int [R, G, B, A]
  // framebuffer:  canvas ctx image data
  drawBezierCurve(p0, p1, p2, p3, num_edges, color, framebuffer) {
    // Draws a sequence of straight lines to approximate a Bezier curve
    // Calculate values that remain constant for all coordinates
    const t_delta = 1 / num_edges;
    const t_limit = 1 + t_delta / 2; // prevents endpoint not being rendered due to floating point error buildup
    const coord_term1_const = { x: 3 * p1.x, y: 3 * p1.y };
    const coord_term2_const = { x: 3 * p2.x, y: 3 * p2.y };
    // Initialize with point 0
    let x0 = p0.x;
    let y0 = p0.y;
    this.drawVertex({ x: x0, y: y0 }, this.vertex_color, framebuffer);
    let x1, y1;
    for (let t = t_delta; t < t_limit; t += t_delta) {
      // Calculate values that remain constant for this `t`
      const t_inv = 1 - t;
      const coord_term0_t_const = t_inv ** 3;
      const coord_term1_t_const = t_inv ** 2 * t;
      const coord_term2_t_const = t_inv * t ** 2;
      const coord_term3_t_const = t ** 3;
      // Calculate the x and y coordinates
      x1 = this.bezierCurveCoord(coord_term0_t_const, p0, coord_term1_t_const, coord_term1_const, coord_term2_t_const, coord_term2_const, coord_term3_t_const, p3, "x");
      y1 = this.bezierCurveCoord(coord_term0_t_const, p0, coord_term1_t_const, coord_term1_const, coord_term2_t_const, coord_term2_const, coord_term3_t_const, p3, "y");
      this.drawLine({ x: x0, y: y0 }, { x: x1, y: y1 }, color, framebuffer);
      x0 = x1;
      y0 = y1;
    }
  }

  bezierCurveCoord(coord_term0_t_const, p0, coord_term1_t_const, coord_term1_const, coord_term2_t_const, coord_term2_const, coord_term3_t_const, p3, coord) {
    return Math.round(coord_term0_t_const * p0[coord] + coord_term1_t_const * coord_term1_const[coord] + coord_term2_t_const * coord_term2_const[coord] + coord_term3_t_const * p3[coord]);
  }

  // center:       object {x: __, y: __}
  // radius:       int
  // num_edges:    int
  // color:        array of int [R, G, B, A]
  // framebuffer:  canvas ctx image data
  drawCircle(center, radius, num_edges, color, framebuffer) {
    // TODO: draw a sequence of straight lines to approximate a circle
  }

  // vertex_list:  array of object [{x: __, y: __}, {x: __, y: __}, ..., {x: __, y: __}]
  // color:        array of int [R, G, B, A]
  // framebuffer:  canvas ctx image data
  drawConvexPolygon(vertex_list, color, framebuffer) {
    // TODO: draw a sequence of triangles to form a convex polygon
  }

  // v:            object {x: __, y: __}
  // color:        array of int [R, G, B, A]
  // framebuffer:  canvas ctx image data
  drawVertex(v, color, framebuffer) {
    // TODO: draw some symbol (e.g. small rectangle, two lines forming an X, ...) centered at position `v`
  }

  /***************************************************************
   ***       Basic Line and Triangle Drawing Routines          ***
   ***       (code provided from in-class activities)          ***
   ***************************************************************/
  pixelIndex(x, y, framebuffer) {
    return 4 * y * framebuffer.width + 4 * x;
  }

  setFramebufferColor(color, x, y, framebuffer) {
    let p_idx = this.pixelIndex(x, y, framebuffer);
    for (let i = 0; i < 4; i++) {
      framebuffer.data[p_idx + i] = color[i];
    }
  }

  swapPoints(a, b) {
    let tmp = { x: a.x, y: a.y };
    a.x = b.x;
    a.y = b.y;
    b.x = tmp.x;
    b.y = tmp.y;
  }

  drawLine(p0, p1, color, framebuffer) {
    if (Math.abs(p1.y - p0.y) <= Math.abs(p1.x - p0.x)) {
      // |m| <= 1
      if (p0.x < p1.x) {
        this.drawLineLow(p0.x, p0.y, p1.x, p1.y, color, framebuffer);
      } else {
        this.drawLineLow(p1.x, p1.y, p0.x, p0.y, color, framebuffer);
      }
    } else {
      // |m| > 1
      if (p0.y < p1.y) {
        this.drawLineHigh(p0.x, p0.y, p1.x, p1.y, color, framebuffer);
      } else {
        this.drawLineHigh(p1.x, p1.y, p0.x, p0.y, color, framebuffer);
      }
    }
  }

  drawLineLow(x0, y0, x1, y1, color, framebuffer) {
    let A = y1 - y0;
    let B = x0 - x1;
    let iy = 1; // y increment (+1 for positive slope, -1 for negative slop)
    if (A < 0) {
      iy = -1;
      A *= -1;
    }
    let D = 2 * A + B;
    let D0 = 2 * A;
    let D1 = 2 * A + 2 * B;

    let y = y0;
    for (let x = x0; x <= x1; x++) {
      this.setFramebufferColor(color, x, y, framebuffer);
      if (D <= 0) {
        D += D0;
      } else {
        D += D1;
        y += iy;
      }
    }
  }

  drawLineHigh(x0, y0, x1, y1, color, framebuffer) {
    let A = x1 - x0;
    let B = y0 - y1;
    let ix = 1; // x increment (+1 for positive slope, -1 for negative slop)
    if (A < 0) {
      ix = -1;
      A *= -1;
    }
    let D = 2 * A + B;
    let D0 = 2 * A;
    let D1 = 2 * A + 2 * B;

    let x = x0;
    for (let y = y0; y <= y1; y++) {
      this.setFramebufferColor(color, x, y, framebuffer);
      if (D <= 0) {
        D += D0;
      } else {
        D += D1;
        x += ix;
      }
    }
  }

  drawTriangle(p0, p1, p2, color, framebuffer) {
    // Deep copy, then sort points in ascending y order
    p0 = { x: p0.x, y: p0.y };
    p1 = { x: p1.x, y: p1.y };
    p2 = { x: p2.x, y: p2.y };
    if (p1.y < p0.y) this.swapPoints(p0, p1);
    if (p2.y < p0.y) this.swapPoints(p0, p2);
    if (p2.y < p1.y) this.swapPoints(p1, p2);

    // Edge coherence triangle algorithm
    // Create initial edge table
    let edge_table = [
      { x: p0.x, inv_slope: (p1.x - p0.x) / (p1.y - p0.y) }, // edge01
      { x: p0.x, inv_slope: (p2.x - p0.x) / (p2.y - p0.y) }, // edge02
      { x: p1.x, inv_slope: (p2.x - p1.x) / (p2.y - p1.y) } // edge12
    ];

    // Do cross product to determine if pt1 is to the right/left of edge02
    let v01 = { x: p1.x - p0.x, y: p1.y - p0.y };
    let v02 = { x: p2.x - p0.x, y: p2.y - p0.y };
    let p1_right = v01.x * v02.y - v01.y * v02.x >= 0;

    // Get the left and right edges from the edge table (lower half of triangle)
    let left_edge, right_edge;
    if (p1_right) {
      left_edge = edge_table[1];
      right_edge = edge_table[0];
    } else {
      left_edge = edge_table[0];
      right_edge = edge_table[1];
    }
    // Draw horizontal lines (lower half of triangle)
    for (let y = p0.y; y < p1.y; y++) {
      let left_x = parseInt(left_edge.x) + 1;
      let right_x = parseInt(right_edge.x);
      if (left_x <= right_x) {
        this.drawLine({ x: left_x, y: y }, { x: right_x, y: y }, color, framebuffer);
      }
      left_edge.x += left_edge.inv_slope;
      right_edge.x += right_edge.inv_slope;
    }

    // Get the left and right edges from the edge table (upper half of triangle) - note only one edge changes
    if (p1_right) {
      right_edge = edge_table[2];
    } else {
      left_edge = edge_table[2];
    }
    // Draw horizontal lines (upper half of triangle)
    for (let y = p1.y; y < p2.y; y++) {
      let left_x = parseInt(left_edge.x) + 1;
      let right_x = parseInt(right_edge.x);
      if (left_x <= right_x) {
        this.drawLine({ x: left_x, y: y }, { x: right_x, y: y }, color, framebuffer);
      }
      left_edge.x += left_edge.inv_slope;
      right_edge.x += right_edge.inv_slope;
    }
  }
}

export { Renderer };
