var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

function visualizeMolecules() {
    var scale = canvas.width / 10.;
    var radius = scale / 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var pos = data[stepNo]['pos'];
    var vel = data[stepNo]['vel'];
    for (var i=0; i<pos.length; i++) {
        var p = pos[i];
        var vx = vel[i][0];
        var vy = vel[i][1];
        var v_mag = Math.sqrt(vx * vx + vy * vy);
        var green = parseInt(v_mag / 1.5 * 255);
        var rgb = 'rgb(200,' + green + ',100)';
        ctx.fillStyle = rgb;

        ctx.beginPath();
        ctx.arc(p[0]*scale, canvas.height - p[1]*scale, radius, 0, Math.PI * 2.0);
        ctx.fill();
    }       
}
