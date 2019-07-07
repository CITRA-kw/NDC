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
    const NODE_R = 3;
    let highlightNodes = [];
    // let highlightLink = null;
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
                        sourceLabel: prevPort.label,
                        targetLabel: port.label,
                        label: prevPort.label + " <> " + port.label,
                        circuit_num: circuit.circuit_num,
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
          .zoom(3, 0)
          .onNodeHover(node => {
            highlightNodes = node ? [node] : [];
            elem.style.cursor = node ? '-webkit-grab' : null;
          })

          .linkWidth(link => highlightLinks.indexOf(link) !== -1 ? 5 : 1)
          // .linkDirectionalParticles(4)
          // .linkDirectionalParticleWidth(link => link === highlightLink ? 4 : 0)
          .nodeCanvasObjectMode(node => 'before')
          .nodeCanvasObject((node, ctx, globalScale) => {
            // add ring just for highlighted nodes
            if (highlightNodes.indexOf(node) !== -1) {
              ctx.beginPath();
              ctx.arc(node.x, node.y, NODE_R * 1.4, 0, 2 * Math.PI, false);
              ctx.fillStyle = 'red';
              ctx.fill();
            }

            const yPos = node.y - 6
            //add label on top
            const label = node.name;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(node.x - bckgDimensions[0] / 2, yPos - bckgDimensions[1] / 2, ...bckgDimensions);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, yPos);
          })
          .onLinkHover(link => {
            // highlightLink = link;  //this is useless now
            highlightNodes = link ? graph.graphData().links.map(l => l.circuit_num == link.circuit_num ? l.source : false) : [];
            highlightNodes
            highlightLinks = link ? graph.graphData().links.filter(l => l.circuit_num == link.circuit_num) : [];

          })
          .linkCanvasObjectMode(() => highlightLinks.length > 0 ? "after" : undefined)
          .linkCanvasObject((link, ctx) => {

            if (highlightLinks.indexOf(link) === -1) return;

            const MAX_FONT_SIZE = 4;
            const LABEL_NODE_MARGIN = graph.nodeRelSize() * 1.5;
            const start = link.source;
            const end = link.target;
            // ignore unbound links
            if (typeof start !== 'object' || typeof end !== 'object') return;
            // calculate label positioning
            const textPos = Object.assign(...['x', 'y'].map(c => ({
              [c]: start[c] + (end[c] - start[c]) / 2 // calc middle point
            })));
            const relLink = { x: end.x - start.x, y: end.y - start.y };

            // console.log(link);
                        // const yPos = link.y - 6

            const maxTextLength = Math.sqrt(Math.pow(relLink.x, 2) + Math.pow(relLink.y, 2)) - LABEL_NODE_MARGIN * 2;
            let textAngle = Math.atan2(relLink.y, relLink.x);
            // maintain label vertical orientation for legibility
            if (textAngle > Math.PI / 2) textAngle = -(Math.PI - textAngle);
            if (textAngle < -Math.PI / 2) textAngle = -(-Math.PI - textAngle);
            const label = `${link.sourceLabel} - ${link.targetLabel} `;
            // estimate fontSize to fit in link length
            ctx.font = '1px Sans-Serif';
            var fontSize = Math.min(MAX_FONT_SIZE, maxTextLength / ctx.measureText(label).width);
            // fontSize -= 1;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding
            // draw text label (with background rect)
            ctx.save();
            ctx.translate(textPos.x, textPos.y);
            ctx.rotate(textAngle);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.fillRect(- bckgDimensions[0] / 2, - bckgDimensions[1] / 2, ...bckgDimensions);

            //source
            // ctx.translate(link.source.x, link.source.y);

            var sourceOnLeft = false;
            if (link.source.x < link.target.x) sourceOnLeft = true;

            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = sourceOnLeft ? link.target.color : link.source.color;
            ctx.fillText(sourceOnLeft ? link.targetLabel : link.sourceLabel, 2, 0);

            //target
            // ctx.translate(link.target.x, link.target.y);
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = sourceOnLeft ? link.source.color : link.target.color;
            ctx.fillText(sourceOnLeft ? link.sourceLabel : link.targetLabel, -2, 0);


            ctx.restore();



          });

    });


}); // end jQuery document 

