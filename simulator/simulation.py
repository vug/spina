"""
This module includes the Molecular Dynamics calculations class Simulation.
"""
import numpy as np

import forces


class Simulation(object):
    """Main simulation class.

    Object has attributes of
    - the environment such as dimensionality and box size
    - the system such as number of particles, their positions and velocities etc. Also forces between them. And
     kinetic and potential energies of the system
    - Intrinsic properties of particles such as mass and LJ parameters epsilon and sigma

    It can initialize the system on a rectangular grid, random positions or given coordinates. Computes the simulation
    via Verlet integration method. Has methods to compute system properties mentioned above.
    """
    def __init__(self, random_seed=None, dimensions=2):
        """Initialize the simulation.

        :param random_seed: random seed to be able to run the same simulation
        :param dimensions: dimensionality of the system
        """
        # environment
        self.dimensions = dimensions
        self.size = 10.0  # side of the cubical cell

        # particles, state
        self.num_particles = None
        self.positions = None
        self.velocities = None
        self.accelerations = None
        self.forces = None
        self.differences = None  # a tensor of the form T[particle-i, particle-j, spatial-coordinate-mu]
        self.distances = None
        self.kinetic_energy = None
        self.potential_energy = None
        self.temperature = None

        # intrinsic properties of particles
        self.mass = 1.0  # unit mass
        self.epsilon = 1.0
        self.sigma = 1.0

        # setup
        if random_seed is not None:
            np.random.seed(random_seed)

    def initialize_given(self, initial_positions, initial_velocities):
        """Initialize the system with given initial position and velocities"""
        if len(initial_positions) != len(initial_velocities):
            raise BaseException('There should be same number of positions and velocities')
        self.positions = initial_positions
        self.velocities = initial_velocities
        self.num_particles = len(initial_positions)

    def initialize_positions_random(self, num_particles=64):
        """Generate num_particles positions where vector components are uniformly distributed in
        [-self.size, self.size]
        """
        self.num_particles = num_particles
        self.positions = np.random.rand(num_particles, self.dimensions) * self.size

    def initialize_positions_lattice(self, num_particles_per_dimension):
        """Generate num_particles_per_dimension^self.dimensions particles regularly distributed on a hyper-cubical
        lattice.
        """
        # on cell corners
        # lattice_1D = np.linspace(0.0, self.size, num_particles_per_dimension)

        # on cell centers
        lattice_1D = (np.arange(0, num_particles_per_dimension,
                                dtype=np.float) + 0.5) * self.size / num_particles_per_dimension
        ndim_lattice_1D = [lattice_1D] * self.dimensions  # one 1D lattice per dimension
        mesh_grids = np.meshgrid(*ndim_lattice_1D)  # one grid per dimension
        self.positions = np.column_stack([grid.ravel() for grid in mesh_grids])
        self.num_particles = len(self.positions)

    def initialize_velocities_random(self, max_velocity=0.1):
        """Generate uniform random velocities where vectors components are in [-max_velocity, +max_velocity].

        Makes sure that average velocity is 0 so that the system as whole does not float in a direction.
        """
        if self.positions is None:
            raise BaseException('Initialize positions first.')
        vel = (np.random.rand(self.num_particles, self.dimensions) - 0.5) * max_velocity
        self.velocities = vel - vel.mean(axis=0)  # make velocity of center of mass = 0

    def step_verlet(self, dt=0.01):
        """Step forward the dynamic simulation via Verlet integration.

        :param dt: "step size". The fixed duration between each step
        :type dt: float
        """
        self.positions += dt * self.velocities + dt * dt * self.accelerations
        self.velocities += 0.5 * dt * self.accelerations
        self.calculate_accelerations()
        self.velocities += 0.5 * dt * self.accelerations

    def calculate_all(self):
        """Calculate all necessary quantities to calculate simulation."""
        self.calculate_differences()
        self.calculate_distances()
        self.calculate_forces()
        self.calculate_accelerations()

    def calculate_statistics(self):
        """Calculate system properties such as KE, PE and temperature."""
        self.calculate_kinetic_energy()
        self.calculate_potential_energy()
        self.calculate_instantaneous_temperature()

    def calculate_differences(self):
        """Calculate the position differences between all pairs of positions.

        This is core part of our implementation using Numpy. Instead of double looping over all position pairs we use a
        single numpy expression.
        """
        self.differences = self.positions - self.positions[:, np.newaxis]

    def calculate_distances(self):
        self.distances = np.linalg.norm(self.differences, axis=2)

    def calculate_forces(self):
        """Calculate all forces on a particle due to other particles.

        Result is a tensor of the dimensionality F[num_particles, num_particles-1, dimensions]"""
        self.forces = forces.lennard_jones(self.differences, self.distances, epsilon=self.epsilon, sigma=self.sigma)

    def calculate_accelerations(self):
        """Calculate accelerations.

        Result is a matrix of dimensionality a[num_particles, dimensions]
        """
        self.accelerations = self.forces.sum(axis=1) / self.mass

    def calculate_kinetic_energy(self):
        self.kinetic_energy = 0.5 * np.sum(np.square(self.velocities))

    def calculate_potential_energy(self):
        tri = np.triu(self.distances, k=0)
        rijs = tri[np.nonzero(tri)]
        pots = forces.lennard_jones_potential_rij(rijs)
        self.potential_energy = pots.sum()

    def calculate_instantaneous_temperature(self):
        num_degrees_of_freedom = self.dimensions * (self.num_particles - 1)
        self.temperature = self.kinetic_energy / num_degrees_of_freedom
