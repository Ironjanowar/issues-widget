// Information to paint
var dataSet = {
    "name": "ERROR!",
    "img2": "https://lh6.ggpht.com/CWNSUHkiD_OiOze5hOBcdvmChE4KAf6C-vBvQPZJsXcGy85MJIavRlNPPGhY4n_tLlw=w300",
    "img": "http://67.media.tumblr.com/2e8986a1b1c062623cea1b9edaddcc52/tumblr_mup3qzOPsX1rk0k2jo1_500.gif"
};

// First function to execute, it:
//   - Defines the inputendpoint
//   - Asigns normalizeJSON() to the inputendpoint
function config() {
    // When a JSON is received paint it
    MashupPlatform.wiring.registerCallback('inputJSON', init);

    // When any preferences change repaint
    MashupPlatform.prefs.registerCallback(repaint);

    // When there is a change in the wiring call init to repaint
    MashupPlatform.wiring.registerStatusCallback(repaint.bind("web"));
    init();
};

// Normalize and paint the JSON coming from the inputendpoint
function init(inputJSON) {
    console.log("Initializing...");
    normalizeJSON(inputJSON);

    // Paint the json
    paint();
};

// Parses the input information to JSON format
var normalizeJSON = function normalizeJSON(inputEndpoint) {
    // input -> dataSet
    try {

        // If inputEndpoint is not a JSON it will be discarded
        var inputJSON = JSON.parse(inputEndpoint);

        // If the input is a valid JSON, reasign the dataSet that is going to
        // be painted
        if (checkJSON(inputJSON)) {
            dataSet = inputJSON;
        }
    } catch(err) {
        console.log(JSON.stringify(err));
    }
};

// Checks if the JSON "toCheck" has a valid format to display
function checkJSON(input) {
    // If the node has the attributes "key" and "img" returns true
    if ("key" in input) {
        // If the node has childs check their format
        if ("children" in input) {
            for (var child of input.children) {

                // If a single child does not have a "name" and an "image" all
                // the JSON will be discarded
                if (!checkJSON(child)) {
                    return false;
                }
            }
        }

        return true;
    }

    return false;
};

// Paints the web view with the json information
function web_view() {
    // some colour variables
    var tcBlack = "#130C0E";

    // Set visible the text
    for (var elem of document.getElementsByClassName("text")) {
        elem.style.visibility = "visible"
    }

    // rest of vars
    var w, h;

    if (MashupPlatform.widget.context.get('widthInPixels') !== 0 &&
        MashupPlatform.widget.context.get('heightInPixels') !== 0) {
        w = MashupPlatform.widget.context.get('widthInPixels');
        h = MashupPlatform.widget.context.get('heightInPixels');
    } else {
        w = 999;
        h = 433;
    }

    var maxNodeSize = 50,
        x_browser = 20,
        y_browser = 25,
        root;

    var force = d3.layout.force();

    var vis = d3.select("#vis")
                .append("svg")
                .attr("width", w)
                .attr("height", h)
                .attr("id", "mySvg");

    var svg = document.getElementById("mySvg");


    // This was into a function ------------------------------
    root = dataSet;
    root.fixed = true;
    root.x = w / 2;
    root.y = h / 4;

    // Build the path
    var defs = vis.insert("svg:defs")
                  .data(["end"]);


    defs.enter().append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    update();
    // -------------------------------------------------------

    /**
     *
     */
    function update() {

        var nodes = flatten(root),
            links = d3.layout.tree().links(nodes);

        // Restart the force layout.
        force.nodes(nodes)
             .links(links)
             .gravity(0.05)
             .charge(-1500)
             .linkDistance(100)
             .friction(0.5)
             .linkStrength(function(l, i) {return 1; })
             .size([w, h])
             .on("tick", tick)
             .start();

        var path = vis.selectAll("path.link")
                      .data(links, function(d) { return d.target.id; });

        path.enter().insert("svg:path")
            .attr("class", "link")
        // .attr("marker-end", "url(#end)")
            .style("stroke", "#eee");


        // Exit any old paths.
        path.exit().remove();



        // Update the nodes…
        var node = vis.selectAll("g.node")
                      .data(nodes, function(d) { return d.id; });


        // Enter any new nodes.
        var nodeEnter = node.enter().append("svg:g")
                            .attr("class", "node")
                            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
                            .on("click", click)
                            .call(force.drag);

        // Append a circle
        nodeEnter.append("svg:circle")
                 .attr("r", function(d) { return Math.sqrt(d.size) / 10 || 4.5; })
                 .style("fill", "#eee");


        // Append images
        var images = nodeEnter.append("svg:image")
                              .attr("xlink:href",  function(d) { return d.img;})
                              .attr("x", function(d) { return -25;})
                              .attr("y", function(d) { return -25;})
                              .attr("height", 50)
                              .attr("width", 50);

        // make the image grow a little on mouse over and add the text details on click
        var setEvents = images
        // Append hero text

        // Not used heather
        //            .on( 'click', function (d) {
        //                d3.select("h1").html(d.last_name);
        //                d3.select("h2").html(d.name);
        //                d3.select("h3").html ("Take me to " + "<a href='" + d.link + "' >"  + d.last_name + " web page ⇢"+ "</a>" );
        //            })

            .on( 'mouseenter', function() {
                // select element in current context
                d3.select( this )
                  .transition()
                  .attr("x", function(d) { return -60;})
                  .attr("y", function(d) { return -60;})
                  .attr("height", 100)
                  .attr("width", 100);
            })
        // set back
            .on( 'mouseleave', function() {
                d3.select( this )
                  .transition()
                  .attr("x", function(d) { return -25;})
                  .attr("y", function(d) { return -25;})
                  .attr("height", 50)
                  .attr("width", 50);
            });


        // Append hero name on roll over next to the node as well
        nodeEnter.append("text")
                 .attr("class", "nodetext")
                 .attr("x", x_browser)
                 .attr("y", y_browser +15)
                 .attr("fill", tcBlack)
                 .text(function(d) { return d.last_name; });


        // Exit any old nodes.
        node.exit().remove();


        // Re-select for update.
        path = vis.selectAll("path.link");
        node = vis.selectAll("g.node");

        function tick() {
            path.attr("d", function(d) {

                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                return   "M" + d.source.x + ","
                       + d.source.y
                       + "A" + dr + ","
                       + dr + " 0 0,1 "
                       + d.target.x + ","
                       + d.target.y;
            });
            node.attr("transform", nodeTransform);
        }
    }


    /**
     * Gives the coordinates of the border for keeping the nodes inside a frame
     * http://bl.ocks.org/mbostock/1129492
     */
    function nodeTransform(d) {
        d.x =  Math.max(maxNodeSize, Math.min(w - (d.imgwidth/2 || 16), d.x));
        d.y =  Math.max(maxNodeSize, Math.min(h - (d.imgheight/2 || 16), d.y));
        return "translate(" + d.x + "," + d.y + ")";
    }

    /**
     * Toggle children on click.
     */
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }

        update();
    }


    /**
     * Returns a list of all nodes under the root.
     */
    function flatten(root) {
        var nodes = [];
        var i = 0;

        function recurse(node) {
            if (node.children)
                node.children.forEach(recurse);
            if (!node.id)
                node.id = ++i;
            nodes.push(node);
        }

        recurse(root);
        return nodes;
    }

    function handleResize(new_values) {
        var toUpdate = false;

        if ('heightInPixels' in new_values && Math.abs(h - new_values.heightInPixels) > 10) {
            h = MashupPlatform.widget.context.get('heightInPixels');
            svg.setAttribute("height", h);
            toUpdate = true;
        }

        if ('widthInPixels' in new_values && Math.abs(h - new_values.widthInPixels) > 10) {
            w = MashupPlatform.widget.context.get('widthInPixels');
            svg.setAttribute("width", w);
            toUpdate = true;
        }

        if (toUpdate) {
            update();
            toUpdate = false;
        }
    }

    MashupPlatform.widget.context.registerCallback(handleResize);
};

// Paints the tree view with the json information
// TODO
function tree_view() {
    var margin = {top: 40, right: 120, bottom: 20, left: 120},
        width = 960 - margin.right - margin.left,
        height = 500 - margin.top - margin.bottom;

    var i = 0,
	duration = 700;

    var tree = d3.layout.tree()
                 .size([height, width]);

    var diagonal = d3.svg.diagonal()
                     .projection(function(d) { return [d.x, d.y]; });

    var svg = d3.select("body").append("svg")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    root = dataSet;

    update(root);

    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 100; });

        // Declare the nodes…
        var node = svg.selectAll("g.node")
                      .data(nodes, function(d) { return d.id || (d.id = ++i); });

        // Enter the nodes.
        var nodeEnter = node.enter().append("g")
                            .attr("class", "node")
                            .attr("transform", function(d) {
                                return "translate(" + d.x + "," + d.y + ")"; });

        nodeEnter.append("circle")
		 .attr("class", (d) => {
		     return d.img ? "image" : "invisible" })
                 .attr("r", 10)
                 .style("fill", "#fff");

        nodeEnter.append("svg:image")
                 .attr("xlink:href", (d) => { return d.img })
                 .attr("x", -25)
                 .attr("y", -25)
                 .attr("height", (d) => { return d.img_h || 50 })
                 .attr("width", (d) => { return d.img_w || 50 })

        nodeEnter.append("text")
                 .attr("x", (d) => {
                     return d.children || d._children ? 40 : 0; })
                 .attr("y", (d) => {
                     return d.children || d._children ? 0 : 28; })
                 .attr("dy", ".35em")
                 .attr("text-anchor", (d) => {
                     return d.children || d._children ? "start" : "middle"})
                 .text(function(d) { return d.name; })
                 .style("fill-opacity", 1);

        // Declare the links…
        var link = svg.selectAll("path.link")
                      .data(links, function(d) { return d.target.id; });

        // Enter the links.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", diagonal);
    }
};

// Paints the tree view with the json information
// TODO: Fix display
function old_tree_view() {
    // ************** Generate the tree diagram      *****************
    var margin = {top: 20, right: 120, bottom: 20, left: 120},
        width = 960 - margin.right - margin.left,
        height = 500 - margin.top - margin.bottom;

    var i = 0,
        duration = 750,
        root;

    var tree = d3.layout.tree()
                 .size([height, width]);

    var diagonal = d3.svg.diagonal()
                     .projection(function(d) { return [d.y, d.x]; });

    var svg = d3.select("body").append("svg")
                .attr("width", width + margin.right + margin.left)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    root = dataSet;
    root.x0 = height / 2;
    root.y0 = 0;

    update(root);

    d3.select(self.frameElement).style("height", "500px");

    function update(source) {

        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 180; });

        // Update the nodes…
        var node = svg.selectAll("g.node")
                      .data(nodes, function(d) { return d.id || (d.id = ++i); });

        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
                            .attr("class", "node")
                            .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                            .on("click", click);

        nodeEnter.append("circle")
                 .attr("r", 1e-6)
                 .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeEnter.append("text")
                 .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
                 .attr("dy", ".35em")
                 .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
                 .text(function(d) { return d.name; })
                 .style("fill-opacity", 1e-6);

        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
                             .duration(duration)
                             .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
                  .attr("r", 10)
                  .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

        nodeUpdate.select("text")
                  .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
                           .duration(duration)
                           .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
                           .remove();

        nodeExit.select("circle")
                .attr("r", 1e-6);

        nodeExit.select("text")
                .style("fill-opacity", 1e-6);

        // Update the links…
        var link = svg.selectAll("path.link")
                      .data(links, function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            });

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    // Toggle children on click.
    function click(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update(d);
    }
};

// Calls the view function that indicates the view parameter and passes it a
// json with the needed information
function paint(view) {
    switch (view.View) {
        case "web":
            web_view();
            break;
        case "tree":
            tree_view();
            break;
        default:
            console.log("ERROR: Invalid view");
    }
};

// Repaints the chart
function repaint(view) {
    d3.select("svg").remove();

    paint(view);
};

// Define the endpoint and the connection handler
config();
