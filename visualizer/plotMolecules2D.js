class MoleculesVisualization2D {
    constructor(canvasId) {
        // TODO: right now elem is canvas. Make it div and create canvas here.
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
    }

    render(simData, stepNo) {
        var ctx = this.ctx;
        var scale = canvas.width / 10.;
        var radius = scale / 8.0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var pos = simData[stepNo]['pos'];
        var vel = simData[stepNo]['vel'];
        var acc = simData[stepNo]['acc'];

        for (var i=0; i<pos.length; i++) {
            var p = pos[i];
            var vx = vel[i][0];
            var vy = vel[i][1];
            var v_mag = Math.sqrt(vx * vx + vy * vy);
            var green = parseInt(v_mag / 1.5 * 255);
            var rgb = 'rgb(200,' + green + ',100)';
            ctx.fillStyle = rgb;

            var screenX = p[0] * scale;
            var screenY = canvas.height - p[1] * scale;
            ctx.beginPath();
            ctx.arc(screenX, screenY, radius, 0, Math.PI * 2.0);
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = 'green';
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX + acc[i][0], screenY - acc[i][1]);
            ctx.stroke();
        }
    }
}
