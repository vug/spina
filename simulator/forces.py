"""
This module is a collection of forces (and their potentials) between molecules.

For now there is only Lennard-Jones.
"""
import numpy as np


def lennard_jones_ij(ri, rj, epsilon=1.0, sigma=1.0):
    """Compute the LJ force between two molecules.

    :param ri: position of particle-i
    :type ri: np.array
    :param rj: position of particle-j
    :type rj: np.array
    :param: epsilon: parameter epsilon of LJ-force
    :type epsilon: float
    :param: sigma: parameter sigma of LJ-force
    :type sigma: float
    :return: the force
    """
    sigma13 = np.power(sigma, 13.0)
    sigma7 = np.power(sigma, 7.0)
    r = ri - rj
    r_mag = np.linalg.norm(r)
    u = - r / r_mag
    return 24.0 * epsilon / sigma * (2.0 * sigma13 * np.power(r_mag, -13.) - sigma7 * np.power(r_mag, -7.)) * u


def lennard_jones_potential_rij(rij, epsilon=1.0, sigma=1.0):
    """Compute each LJ potential given an array of distances.

    It can get either a single distance or an array of distances.

    :param rij: an array of distances
    :type rij: np.array
    :param: epsilon: parameter epsilon of LJ-force
    :type epsilon: float
    :param: sigma: parameter sigma of LJ-force
    :type sigma: float
    :return: the potentials
    """
    sigma12 = np.power(sigma, 12.0)
    sigma6 = np.power(sigma, 6.0)
    return 4.0 * epsilon * (sigma12 * np.power(rij, -12.) - sigma6 * np.power(rij, -6.))


def lennard_jones(differences_tensor, distances_matrix, epsilon=1.0, sigma=1.0):
    """Compute LJ force given a differences tensor and distances matrix

    :param differences_tensor: A tensor of the form T[i][j][mu] = the position difference between particle-i and
    particle-j on coordinate-mu. For example T[3][7] is the displacement vector from particle-7 to particle-3 and
    T[3][7][1] is the y-coordinate of that vector.
    :type differences_tensor: np.array
    :param distances_matrix: A matrix of the form M[i][j] = the distance between particle-i and particle-j
    :type distances_matrix: np.array
    :param: epsilon: parameter epsilon of LJ-force
    :type epsilon: float
    :param: sigma: parameter sigma of LJ-force
    :type sigma: float
    :return:
    """
    sigma14 = np.power(sigma, 14.0)
    sigma8 = np.power(sigma, 8.0)
    r_j_to_i = - differences_tensor
    r = distances_matrix
    right = (2.0 * sigma14 * np.power(r, -14.) - sigma8 * np.power(r, -8.))[..., np.newaxis]
    left = 24.0 * epsilon / sigma * r_j_to_i
    result_with_self_forces = left * right
    n, _, d = differences_tensor.shape
    result = result_with_self_forces[~np.isnan(result_with_self_forces)].reshape(n, n - 1, d)
    return result
