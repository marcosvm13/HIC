import pandas as pd
import numpy as np
from numba import jit
import math



#DIVIDE CLUSTER 1-30
def Clusters(X,n):
    v = np.random.randn(n,1)

    v_opt, psi_opt = descenso_de_gradiente(X, v, 10, [0,4], 0.01)
    return v_opt, psi_opt 

def repeticion(X,n,powers, v_opt, psi_opt, psi_best, v_best):
    #print("Primer v_opt: ", v_opt.T[0])
    power_index = 0
    while power_index<len(powers):
        
        k = powers[power_index]
        v = v_opt.copy()
        p = np.random.permutation(n)
        
        aleatorio = np.random.randn(k,1)
        for i in range(k):
            v[p[i]] = aleatorio[i]
            #v[p[i]] = np.random.randn(1)
        v_prime,psi_prime = descenso_de_gradiente(X,v,10,[0,4],0.01)
        if psi_prime>psi_opt:
           # print("k= ", k, "  psi= ",psi_prime," best psi= ", psi_best, " v_opt= ", v_prime.T[0])
            psi_opt = psi_prime
            v_opt = v_prime
            power_index = 0
           
        else:
            #print("antes: ", power_index)
            power_index = power_index + 1 
            #print("despues: ", power_index)  
    if psi_opt>psi_best:
        v_best = v_opt
        psi_best = psi_opt
    return v_best, psi_best   
        


def descenso_de_gradiente(X, v, base, exponents , sensitivity):
    psi_best_stage = compute_psi(np.array((X @ v)[:,0], np.float64))

    psi_old = 0
    psi_opt = 0
    v_opt = v.copy()

    while psi_best_stage - psi_old  > sensitivity:
        
        psi_old = psi_best_stage
     
        v_grad = compute_gradient_psi_projected(np.array(X, np.float64),np.array(v, np.float64))

        psi_best_stage = 0
        v_best_stage = v
        for p in range(exponents[0],exponents[1]+1): 
            gamma = base**p
            v_stage = v - (gamma*v_grad)
            psi_stage = compute_psi(np.array((X @ v_stage)[:,0], np.float64))
            if psi_stage>psi_best_stage:
                v_best_stage = v_stage
                psi_best_stage = psi_stage  
        if psi_best_stage>psi_opt: 
            psi_opt = psi_best_stage
            v_opt = v_best_stage
        v = v_best_stage
    
    return v_opt, psi_opt

@jit(nopython=True)
def compute_gradient_psi_projected(X, v):
    
    EPSILON = 0.000000001
    N, n = X.shape
    y = (X@v)[:,0]
    #print(X[0,0])
    media = np.mean(y)
    I = np.argsort(y)
    ys = np.sort(y)
    j= np.searchsorted(ys, media)

    if abs(media)<EPSILON:
        lamb = np.sum(np.abs(y))/N
        sigma = math.sqrt(np.sum(np.square(y))/(N-1))
    else:
        lamb = np.sum(np.abs(y - media))/N
        sigma = math.sqrt(np.sum(np.square(y - media))/(N-1))


    v_grad = np.zeros(n)
    s2 = np.sum(np.square(y))
    for k in range(n):  
        
        lambda_prime=  (np.sum((-1)*X[:,k][I[0:j]]) + np.sum(X[:,k][I[j:N]]))/N

        sp1 = np.sum(np.multiply(y, X[:,k]))
        sigma_prime = 1/(math.sqrt(s2)*sp1) if (math.sqrt(s2)*sp1) != 0 else 0

        v_grad[k] = (lambda_prime*sigma - sigma_prime*lamb)/(math.sqrt(N)*sigma**2) if (math.sqrt(N)*sigma**2) != 0 else 0
    return v_grad.reshape(len(v_grad), 1)
    
@jit(nopython=True)
def compute_psi(y):
    min = np.amin(y)
    max = np.amax(y)
    psi=0
    if not min==max:
        EPSILON = 0.000000001
        N = len(y)
        if N==0:
            N = 1
        media = np.mean(y)
        if abs(media)<EPSILON:
            lamb = np.sum(np.abs(y))/N
            sigma = math.sqrt(np.sum(np.square(y))/(N-1))
        else:
            lamb = np.sum(np.abs(y - media))/N
            sigma = math.sqrt(np.sum(np.square(y - media))/(N-1))
        psi = lamb/sigma
    return psi