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
    const NODE_R = 8;
    let highlightNodes = [];
    let highlightLink = null;


    const elem = document.getElementById('graph');
    ForceGraph()(elem)
      .graphData(gData)
      .height(400)
      .width(600)
      .backgroundColor("#EEEEEE")
      .enableZoomPanInteraction(false)
      .nodeRelSize(NODE_R)
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
}); // end jQuery document 



function capitalize(s) {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}



// ***************************************************************
// Force lower characters on Code fields
// ***************************************************************
function forceLower(strInput) 
{
    strInput.value=strInput.value.toLowerCase();
}
