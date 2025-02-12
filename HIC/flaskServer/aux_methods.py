from numpy.lib.arraypad import _pad_simple
import pandas as pd
import numpy as np
from numba import jit
import math
import phi as phi
import BC as BC
import psi as psi
from sklearn import decomposition

#TEST DIRECTION CLUSTERING DATA
def load(df):
    print(df)
    N, n = df.shape
    n = n - 1
    print(n)
    m = math.floor(math.log2(n))
    powers = list(map(lambda x: 2**(x), range(m+1)))
    if powers[len(powers)-1] != n:
        powers.append(n)
    #print(powers)
    return N, n, powers



def dividir(df, y_best, division):
    if isinstance(df, pd.DataFrame):
            df = df.to_numpy()
    N, _ = df.shape
    left_indices = np.zeros(N)
    right_indices = np.zeros(N)
    n_left = -1
    n_right = -1
    for i in range(N):
        if y_best[i]<division:
            n_left = n_left+1
            left_indices[n_left] = i
        else:
            n_right = n_right+1
            right_indices[n_right] = i

    left_indices = left_indices[0:n_left+1]
    right_indices = right_indices[0:n_right+1]
    
    Xleft = np.take(df, left_indices.tolist() , 0)
    Xright = np.take(df, right_indices.tolist() , 0)

    return Xleft , Xright 
       


def empezar(X,  powers, n, tieneSol, tipo, tipos):
   # print("LLEGO")
    #data = pd.read_csv("C:/Users/Marcos/Desktop/TFGS/TFG1/TFG/frontend/bk/Database/olives_data.txt", delim_whitespace=True, index_col=False, header=None)
    #data = pd.DataFrame(np.random.randint(0, 2000, size=(573, 8)))
    
    if tieneSol:
        X = X.iloc[:, :-1] 
    else: 
        n = n+1
    X = X.to_numpy()


    if tipo == 0:
        v_opt, phi_opt = phi.Clusters(X,n)
        v_best = v_opt
        phi_best = phi_opt
        #b = 0  
        #while True:
    
        v_best, phi_best = phi.repeticion(X,n,powers, v_opt, phi_opt, phi_best, v_best)
         #v_opt, phi_opt = Clusters(X,n)
         # b+=1
         # if b==1:
         #    break
    if tipo == 1:
        v_opt, phi_opt = BC.Clusters(X,n)
        v_best = v_opt
        phi_best = phi_opt
        #b = 0  
        #while True:
        v_best, phi_best = BC.repeticion(X,n,powers, v_opt, phi_opt, phi_best, v_best)
        
         #v_opt, phi_opt = Clusters(X,n)
         # b+=1
         # if b==1:
         #    break

    if tipo == 2:
        v_opt, phi_opt = psi.Clusters(X,n)
        v_best = v_opt
        phi_best = phi_opt
        #b = 0  
        #while True:
        v_best, phi_best = psi.repeticion(X,n,powers, v_opt, phi_opt, phi_best, v_best)
        
         #v_opt, phi_opt = Clusters(X,n)
         # b+=1
         # if b==1:
         #    break
    if np.sum(v_best)<0:
        v_best = np.multiply(v_best, -1)
    y_best = (X @ (v_best / np.linalg.norm(v_best))).T[0]
   
   
    if tipo == 0:
        bc, ps = 0, 0
        if 1 in tipos:
            bc = BC.compute_bc(np.array((X @ v_best)[:,0], np.float64))
        if 2 in tipos:
            ps = psi.compute_psi(np.array((X @ v_best)[:,0], np.float64))
        return [phi_best ,np.std(y_best),y_best, v_best, phi_best, bc, ps]
    
    if tipo == 1:
        ph, ps = 0, 0
        if 0 in tipos:
            ph = phi.compute_phi(np.array((X @ v_best)[:,0], np.float64))
        if 2 in tipos:
             ps = psi.compute_psi(np.array((X @ v_best)[:,0], np.float64))
        return [phi_best ,np.std(y_best),y_best, v_best, ph, phi_best, ps]
    
    if tipo == 2:
        ph, bc = 0, 0
        if 0 in tipos:
            ph = phi.compute_phi(np.array((X @ v_best)[:,0], np.float64))
        if 1 in tipos:
            bc = BC.compute_bc(np.array((X @ v_best)[:,0], np.float64))
        return [phi_best ,np.std(y_best),y_best, v_best, ph, bc, phi_best]


def varianzamaxima(X, n, tieneSol, tipo, tipos):
   # print("LLEGO")
    #data = pd.read_csv("C:/Users/Marcos/Desktop/TFGS/TFG1/TFG/frontend/bk/Database/olives_data.txt", delim_whitespace=True, index_col=False, header=None)
    #data = pd.DataFrame(np.random.randint(0, 2000, size=(573, 8)))
    
    if tieneSol:
        X = X.iloc[:, :-1] 
    else: 
        n = n+1
    X = X.to_numpy()
    pca = decomposition.PCA()
    pca.fit(X)
    v_best = np.array(pca.explained_variance_)
    print(X @ v_best)
    if np.sum(v_best)<0:
        v_best = np.multiply(v_best, -1)
    y_best = (X @ (v_best / np.linalg.norm(v_best))).T[0]
   
   
    if tipo == 0:
        phi_best = phi.compute_phi(np.array(X @ v_best, np.float64))
        bc, ps = 0, 0
        if 1 in tipos:
            bc = BC.compute_bc(np.array((X @ v_best)[:,0], np.float64))
        if 2 in tipos:
            ps = psi.compute_psi(np.array((X @ v_best)[:,0], np.float64))
        return [phi_best ,np.std(y_best),y_best, v_best, phi_best, bc, ps]
    
    if tipo == 1:
        phi_best = BC.compute_bc(np.array((X @ v_best)[:,0], np.float64))
        ph, ps = 0, 0
        if 0 in tipos:
            ph = phi.compute_phi(np.array((X @ v_best)[:,0], np.float64))
        if 2 in tipos:
             ps = psi.compute_psi(np.array((X @ v_best)[:,0], np.float64))
        return [phi_best ,np.std(y_best),y_best, v_best, ph, phi_best, ps]
    
    if tipo == 2:
        phi_best = psi.compute_psi(np.array((X @ v_best)[:,0], np.float64))
        ph, bc = 0, 0
        if 0 in tipos:
            ph = phi.compute_phi(np.array((X @ v_best)[:,0], np.float64))
        if 1 in tipos:
            bc = BC.compute_bc(np.array((X @ v_best)[:,0], np.float64))
        return [phi_best ,np.std(y_best),y_best, v_best, ph, bc, phi_best]
    
        