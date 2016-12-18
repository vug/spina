# Spina

A toy molecular dynamics simulator and visualizer

# Introduction

"Simulator" is a toy MD simulator library written in Python. "Visualizer" is a web-based interface that displays the simulation results of Simulator. "Notebooks" is a collection of Jupyter Notebooks for analysis and explanation of concepts.

The visualizer is deployed [here](http://veliugurguney.com/static/spina/visualizer/visualizer.html)

# Installation

* Simulator: You need `numpy` library which can be installed via `pip install numpy`
* Visualizer: You need a webserver that runs under `spina/visualizer` folder. 
* Jupyter Notebook: You need [juypter notebook installed](https://jupyter.readthedocs.io/en/latest/install.html) on your system. 

# Running

* Simulator: You can run simulations by writing your own script that imports the `simulation` module. An example script, `runsimulation.py` is provided. `python runsimulation.py --help` shows explanations of command-line arguments.
    * 3D simulation example: `python runsimulation.py --dimensions 3 --max-vel 1.6 --num-per-dim 5 --num-steps 1000 --output sim_3d.json`
    * 2D simulation example: `python runsimulation.py --dimensions 2 --max-vel 0.2 --num-per-dim 9 --num-steps 1000 --output sim_2d.json` 
* Visualizer: Python comes with a webserver. In Python 3 run `python -m http.server` and visit `http://localhost:8000` with your browser.
* Notebooks: Open notebooks with Jupyter. They can be previewed (without interaction abilities) on [NBViewer](http://nbviewer.jupyter.org/github/vug/spina/blob/master/notebooks/Lennard-Jones.ipynb) or [GitHub](https://github.com/vug/spina/blob/master/notebooks/Lennard-Jones.ipynb).
