"""
This module is an example script to show how to use the simulation module to run Molecular Dynamics simulations.

It initializes the system using command-line arguments and runs a simulation given number of steps. For demonstration
purposes rectangular lattice initialization is used for positions. The output is written to a json file, which is
intended to be visualized via the "Visualizer" part of Spina.
"""
import argparse
import json

import simulation


def parse_arguments():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(description="""Run an MD simulation initialized on a rectangular lattice.""")
    parser.add_argument('-d', '--dimensions', type=int, default=2,
                        help='number of dimension of the physical system. It can be more than 3 :-)')
    parser.add_argument('-p', '--num-per-dim', type=int, default=5, help='number of particles per dimension')
    parser.add_argument('-v', '--max-vel', type=float, default=0.2,
                        help='maximum value of a component of randomly assigned velocities')
    parser.add_argument('-s', '--num-steps', type=int, default=100)
    parser.add_argument('-o', '--output', type=str, default='result.json',
                        help='output filename to save simulation results')
    args = parser.parse_args()
    return args


def initialize_grid(dimensions, num_per_dim, max_vel):
    """Initialize the simulation on a rectangular lattice and assign uniform random velocity components.

    :return: the simulation object
    :rtype: simulation.Simulation"""
    mds = simulation.Simulation(dimensions=dimensions)
    mds.initialize_positions_lattice(num_particles_per_dimension=num_per_dim)
    mds.initialize_velocities_random(max_velocity=max_vel)
    mds.calculate_all()
    mds.calculate_statistics()
    return mds


def run_simulation(mds, num_steps=100):
    """Run the simulation for num_steps steps and save quantities such as all positions and velocities."""
    step_no = 0
    states = []
    for i in range(num_steps):
        state = {
            'pos': mds.positions.tolist(),
            'vel': mds.velocities.tolist(),
            'acc': mds.accelerations.tolist(),
            'pot': mds.potential_energy,
            'kin': mds.kinetic_energy,
            'ene': mds.kinetic_energy + mds.potential_energy,
            'tem': mds.temperature
        }
        states.append(state)
        print('.', end=' ', flush=True)

        mds.step_verlet(dt=0.01)
        mds.calculate_all()
        mds.calculate_statistics()
        step_no += 1
    return states


def save_simulation(states, filename):
    """Save the simulation result into a json file of given name."""
    with open(filename, 'wt') as f:
        serialized = json.dumps(states, sort_keys=True)
        # serialized = json.dumps(states, sort_keys=True, indent=4, separators=(',', ': '))  # pretty print
        f.write(serialized)


def main():
    """Run the script."""
    args = parse_arguments()
    print('Running simulation with parameters {}'.format(args))
    md_sim = initialize_grid(args.dimensions, args.num_per_dim, args.max_vel)
    states = run_simulation(md_sim, num_steps=args.num_steps)
    save_simulation(states, args.output)

if __name__ == '__main__':
    main()
