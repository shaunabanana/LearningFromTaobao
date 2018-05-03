function StartGraph() {
    var width = window.innerWidth,
        height = window.innerHeight,
        padding = 3, // separation between same-color nodes
        clusterPadding = 25, // separation between different-color nodes
        maxRadius = 12;

    var nClusters = 1;

    var color = d3.scale.category10()
        .domain(d3.range(nClusters));

    var clusters = new Array(nClusters);

    d3.json("data/data.json", function (error, data) {
        if (error) throw error;

        entries = data.entries;
        entries.forEach(function (e) {
            e.x = Math.cos(e.cluster / nClusters * 2 * Math.PI) * 200 + width / 2 + Math.random();
            e.y = Math.sin(e.cluster / nClusters * 2 * Math.PI) * 200 + height / 2 + Math.random();
            e.radius = Math.pow(1.4, -e.level) * 20;
            if (e.level == 0) {
                clusters[e.cluster] = e
            }
        })
        console.log(entries);

        force = d3.layout.force()
            .nodes(entries)
            .size([width, height])
            .gravity(.05)
            .charge(-20)
            .on("tick", tick)
            .start();

        svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);

        entry = svg.selectAll("circle")
            .data(entries)
            .enter().append("circle")
            .style("fill", function(d) { return color(d.cluster); })
            .attr("class", function(d) { return "cluster" + d.cluster; })
            .attr("id", function(d) { return "entry" + d.index; })
            .on("mouseover", function (d) {
                d3.selectAll("circle").transition()
                    .duration(200)
                    .style("opacity", 0.4);

                d3.selectAll(".cluster" + d.cluster).transition()
                    .duration(200)
                    .style("opacity", 0.7);

                d3.select("#entry" + d.index).transition()
                    .duration(200)
                    .style("opacity", 1)

                d3.select("#tooltip").transition()
                    .duration(200)
                    .style("opacity", 1)
                    .duration(100)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 60) + "px")
                    .text(d.name);
            })
            .on("mouseout", function (d) {
                d3.select("#tooltip").transition()
                    .duration(500)
                    .style("opacity", 0);
                d3.selectAll("circle").transition()
                    .duration(500)
                    .style("opacity", 1.0);
            })
            .call(force.drag);

        entry.transition()
            .duration(750)
            .delay(function(d, i) { return i * 5; })
            .attrTween("r", function(d) {
                var i = d3.interpolate(0, d.radius);
                return function(t) { return d.radius = i(t); };
            });

        function updateWindow(){
            var w = window,
            d = document,
            e = d.documentElement,
            g = d.getElementsByTagName('body')[0],
            x = w.innerWidth || e.clientWidth || g.clientWidth,
            y = w.innerHeight|| e.clientHeight|| g.clientHeight;

            svg.attr("width", x).attr("height", y);
            force.size([x, y]);
            force.start();
        }
        d3.select(window).on('resize.updatesvg', updateWindow);

        function tick(e) {
            entry
                .each(cluster(10 * e.alpha * e.alpha))
                .each(collide(.5))
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        }

        // Move d to be adjacent to the cluster node.
        function cluster(alpha) {
            return function(d) {
                var cluster = clusters[d.cluster];
                if (cluster === d) return;
                var x = d.x - cluster.x,
                y = d.y - cluster.y,
                l = Math.sqrt(x * x + y * y),
                r = d.radius + cluster.radius;
                if (l != r) {
                    l = (l - r) / l * alpha;
                    d.x -= x *= l;
                    d.y -= y *= l;
                    cluster.x += x;
                    cluster.y += y;
                }
            };
        }

        // Resolves collisions between d and all other circles.
        function collide(alpha) {
            var quadtree = d3.geom.quadtree(entries);
            return function(d) {
                var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
                nx1 = d.x - r,
                nx2 = d.x + r,
                ny1 = d.y - r,
                ny2 = d.y + r;
                quadtree.visit(function(quad, x1, y1, x2, y2) {
                    if (quad.point && (quad.point !== d)) {
                        var x = d.x - quad.point.x,
                        y = d.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
                        if (l < r) {
                            l = (l - r) / l * alpha;
                            d.x -= x *= l;
                            d.y -= y *= l;
                            quad.point.x += x;
                            quad.point.y += y;
                        }
                    }
                    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
                });
            };
        }
    });

    entries = data.entries;
    entries.forEach(function (e) {
        e.x = Math.cos(e.cluster / nClusters * 2 * Math.PI) * 200 + width / 2 + Math.random();
        e.y = Math.sin(e.cluster / nClusters * 2 * Math.PI) * 200 + height / 2 + Math.random();
        e.radius = Math.pow(1.4, -e.level) * 20;
        if (e.level == 0) {
            clusters[e.cluster] = e
        }
    })
    console.log(entries);

    force = d3.layout.force()
        .nodes(entries)
        .size([width, height])
        .gravity(.05)
        .charge(-20)
        .on("tick", tick)
        .start();

    svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    entry = svg.selectAll("circle")
        .data(entries)
        .enter().append("circle")
        .style("fill", function(d) { c = d3.hsl(color(d.cluster)); c.h += d.delta * 10; return c.toString(); })
        .attr("class", function(d) { return "cluster" + d.cluster; })
        .attr("id", function(d) { return "entry" + d.index; })
        .on("mouseover", function (d) {
            d3.selectAll("circle").transition()
                .duration(200)
                .style("opacity", 0.4);

            d3.selectAll(".cluster" + d.cluster).transition()
                .duration(200)
                .style("opacity", 0.7);

            d3.select("#entry" + d.index).transition()
                .duration(200)
                .style("opacity", 1)

            d3.select("#tooltip").transition()
                .duration(200)
                .style("opacity", 1)
                .duration(100)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 60) + "px")
                .text(d.name);

    d3.select("button").on("click", function () {
        entries.push({
            name: "asdfasdf",
            cluster: 0,
            level: 2,
            x: clusters[0].x,
            y: clusters[0].y,
            radius: 10
        })
        entry = entry.data(entries)
        entry.exit().remove();
        entry.enter().append("circle")
            .style("fill", function(d) { return color(d.cluster); })
            .attr("r", function(d) { return d.radius; })
            .call(force.drag)
            .append("title")
                .text(function(d) { return d.name; });

        entry = svg.selectAll("circle")
        force.nodes(entries);
        force.start();
    });
}
