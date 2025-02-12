import pandas as pd
import numpy as np
from numba import jit
import math



#DIVIDE CLUSTER 1-30
def Clusters(X,n):
    v = np.random.randn(n,1)

    v_opt, phi_opt = descenso_de_gradiente(X, v, 10, [0,4], 0.0001)
    return v_opt, phi_opt 

def repeticion(X,n,powers, v_opt, phi_opt, phi_best, v_best):
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

    
        v_prime,phi_prime = descenso_de_gradiente(X,v,10,[0,4],0.0001)
       
        if phi_prime<phi_opt:
           # print("k= ", k, "  phi= ",phi_prime," best phi= ", phi_best, " v_opt= ", v_prime.T[0])
            phi_opt = phi_prime
            v_opt = v_prime
            power_index = 0
           
        else:
            #print("antes: ", power_index)
            power_index = power_index + 1 
            #print("despues: ", power_index)  
    if phi_opt<phi_best:
        
        v_best = v_opt
        phi_best = phi_opt
    
    return v_best, phi_best   
        


def descenso_de_gradiente(X, v, base, exponents , sensitivity):

    phi_best_stage = compute_phi(np.array((X @ v)[:,0], np.float64))

    phi_old = 1
    phi_opt = 1
    v_opt = v.copy()

    while phi_old - phi_best_stage > sensitivity:
        
        phi_old = phi_best_stage

        v_grad = compute_gradient_phi_projected(np.array(X, np.float64),np.array(v, np.float64))

        phi_best_stage = 1
        v_best_stage = v
        for p in range(exponents[0],exponents[1]+1):
           
            gamma = base**p

            v_stage = v - (gamma*v_grad)

            phi_stage = compute_phi(np.array((X @ v_stage)[:,0], np.float64))
            if phi_stage<phi_best_stage:
                v_best_stage = v_stage
                phi_best_stage = phi_stage  
        if phi_best_stage<phi_opt: 
            phi_opt = phi_best_stage
            v_opt = v_best_stage
        v = v_best_stage
    
    return v_opt, phi_opt

@jit(nopython=True)
def compute_gradient_phi_projected(X, v):
    EPSILON = 0.000000001
    N, n = X.shape
    y = (X@v)[:,0]
    #print(X[0,0])
    media = np.mean(y)
    I = np.argsort(y)
    ys = np.sort(y)
    j= np.searchsorted(ys, media)

    if abs(media)<EPSILON:
        media = 0
    lamb = np.sum(np.abs(y - media))/N
    lambda_sq = lamb**2

    nu = np.sum(
            (ys[1:N] - ys[0:N-1]) 
                * (np.array(list(range(1, N)))) 
                 * (np.array(list(range(N-1, 0, -1))))
            )/(N**2)
    v_grad = np.zeros(n)
    
    for k in range(n):  
        
        lambda_prime=  (np.sum((-1)*X[:,k][I[0:j]]) + np.sum(X[:,k][I[j:N]]))/N

        nu_prime = np.sum(
                (X[:,k][I[1:N]] - X[:,k][I[0:N-1]]) 
                            * (np.array(list(range(1, N))))  
                                  *  (np.array(list(range(N-1, 0, -1))))
            )/(N**2)

        v_grad[k] = (nu_prime*lamb - lambda_prime*nu)/lambda_sq
    return v_grad.reshape(len(v_grad), 1)
@jit(nopython=True)
def compute_phi(y):
    min = np.amin(y)
    max = np.amax(y)
    phi=1
    if not min==max:
        EPSILON = 0.000000001
        N = len(y)
        if N==0:
            N = 1
        media = np.mean(y)
        if abs(media)<EPSILON:
            media = 0   
        lamb = np.sum(np.abs(y - media))/N
        ys = np.sort(y)
        nu = np.sum(
            (ys[1:N] - ys[0:N-1]) 
                * (np.array(list(range(1, N)))) 
                    * (np.array(list(range(N-1, 0, -1))))
            )/(N**2)
        phi = nu/lamb
    return phi