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







    $.getJSON('/api/map-service/links', function (json) {
        console.log("** Received circuit JSON info to populate form for", json);

        let gData = {
            nodes: json.nodes,
            links: []
        };

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
                        name: prevPort.name + " " + prevPort.label + "  ---  " + port.name + " " + port.label 
                    }
                    gData.links.push(link);
                }

                prevPort = port;
            }
        }

        const elem = document.getElementById('graph');
        ForceGraph()(elem)
          .graphData(gData)
          .height(600)
          .width(1000)  //this needs to be dynamic.  Right now it just goes off the screen if I resize.
          .backgroundColor("#EEEEEE")
          .enableZoomPanInteraction(false)
          .nodeRelSize(NODE_R)
          .nodeAutoColorBy("type")
          .zoom(2, 0)
          .onNodeHover(node => {
            highlightNodes = node ? [node] : [];
            elem.style.cursor = node ? '-webkit-grab' : null;
          })
          .onLinkHover(link => {
            highlightLink = link;
            highlightNodes = link ? [link.source, link.target] : [];
          })
          .linkWidth(link => link === highlightLink ? 5 : 1)
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

    });


}); // end jQuery document 

