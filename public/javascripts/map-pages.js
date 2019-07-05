//n3al



$(document).ready(function () {


        
    // Random tree
    const N = 80;
    const gData = {
      nodes: [...Array(N).keys()].map(i => ({ id: i })),
      links: [...Array(N).keys()]
        .filter(id => id)
        .map(id => ({
          source: id,
          target: Math.round(Math.random() * (id-1))
        }))
    };
    const NODE_R = 4;
    let highlightNodes = [];
    let highlightLink = null;
    let highlightLinks = [];






    $.getJSON('/api/map-service/links', function (json) {
        console.log("** Received circuit JSON info to populate form for", json);

        let gData = {
            nodes: json.nodes,
            links: []
        };

        //source-target number of links 
        var numOfLinksBetweenNodes = {};



        //ok so each circuit is a link basically.
        for (var i in json.data) {
            var circuit = json.data[i];

            var ports = circuit.ports.egress;

            var prevPort = null;


            for (var portIndex in ports) {

                var port = ports[portIndex];

                if (prevPort) {


                    var link = {
                        source: prevPort.id,
                        target: port.id,
                        name: prevPort.name + " " + prevPort.label + "  ---  " + port.name + " " + port.label,
                        circuit_num: circuit.circuit_num
                    }

                    var linkKey = link.source +"-"+ link.target;

                    

                    if (!numOfLinksBetweenNodes[linkKey]) {
                        numOfLinksBetweenNodes[linkKey] = 0;
                        if (link.source == link.target) link.curvature = 0.1;  //for self links.  they're invisible if there's no curvature
                    }
                    else {
                        var existingLinks = numOfLinksBetweenNodes[linkKey];

                        var sign = 1;

                        if (existingLinks % 2 == 1) {
                            sign = -1;
                        }

                        existingLinks = Math.ceil(existingLinks/2);
                        // console.log(existingLinks);
                        link.curvature = 0.2 * existingLinks * sign;
                    }


                    numOfLinksBetweenNodes[linkKey]++;

                    gData.links.push(link);

                }

                prevPort = port;
            }
        }

        const elem = document.getElementById('graph');
        var graph = ForceGraph()(elem)
          .graphData(gData)
          .height(600)
          .width(1000)  //this needs to be dynamic.  Right now it just goes off the screen if I resize.
          .backgroundColor("#EEEEEE")
          .enableZoomPanInteraction(false)
          .nodeRelSize(NODE_R)
          .nodeAutoColorBy("type")
          .linkCurvature('curvature')
          .zoom(2, 0)
          .onNodeHover(node => {
            highlightNodes = node ? [node] : [];
            elem.style.cursor = node ? '-webkit-grab' : null;
          })

          .linkWidth(link => highlightLinks.indexOf(link) !== -1 ? 5 : 1)
          .linkDirectionalParticles(4)
          .linkDirectionalParticleWidth(link => link === highlightLink ? 4 : 0)
          .nodeCanvasObjectMode(node => highlightNodes.indexOf(node) !== -1 ? 'before' : undefined)
          .nodeCanvasObject((node, ctx) => {
            // add ring just for highlighted nodes
            ctx.beginPath();
            ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'red';
            ctx.fill();
          });

          graph.onLinkHover(link => {
            highlightLink = link;  //this is useless now
            highlightNodes = link ? [link.source, link.target] : [];
            highlightLinks = link ? graph.graphData().links.filter(l => l.circuit_num == link.circuit_num) : [];
          })

    });


}); // end jQuery document 

