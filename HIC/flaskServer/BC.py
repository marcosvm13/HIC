from re import T
import pandas as pd
import numpy as np
from numba import jit
import math
from scipy.stats import kurtosis, skew

#DIVIDE CLUSTER 1-30
def Clusters(X,n):
    v = np.random.randn(n,1)

    v_opt, bc_opt = ascenso_de_gradiente(X, v, 10, [0,4], 0.0001)
    return v_opt, bc_opt 

def repeticion(X,n,powers, v_opt, bc_opt, bc_best, v_best):
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

    
        v_prime,bc_prime = ascenso_de_gradiente(X,v,10,[0,4],0.0001)
        
        if bc_prime>bc_opt:
            #print("k= ", k, "  bc= ",bc_prime," best bc= ", bc_best, " v_opt= ", v_prime.T[0])
            bc_opt = bc_prime
            v_opt = v_prime
            power_index = 0
           
        else:
            #print("antes: ", power_index)
            power_index = power_index + 1 
            #print("despues: ", power_index)  
    if bc_opt>bc_best:
        
        v_best = v_opt
        bc_best = bc_opt
    
    return v_best, bc_best   
        


def ascenso_de_gradiente(X, v, base, exponents , sensitivity):
    bc_best_stage = compute_bc(np.array((X @ v)[:,0], np.float64))
 
    bc_old = 0
    bc_opt = 0
    v_opt = v.copy()
    
    while bc_best_stage- bc_old  > sensitivity:
      
        bc_old = bc_best_stage

        v_grad = compute_gradient_bc_projected(np.array(X, np.float64),np.array(v, np.float64))

        bc_best_stage = 0
        v_best_stage = v
        for p in range(exponents[0],exponents[1]+1):
           
            gamma = base**p

            v_stage = v + (gamma*v_grad)
           
            bc_stage = compute_bc(np.array((X @ v_stage)[:,0], np.float64))
            
            if bc_stage>bc_best_stage:
                v_best_stage = v_stage
                bc_best_stage = bc_stage  
        if bc_best_stage>bc_opt: 
            bc_opt = bc_best_stage
            v_opt = v_best_stage
        v = v_best_stage
    
    return v_opt, bc_opt

@jit(nopython=True)
def compute_gradient_bc_projected(X, v):
    N, n = X.shape

    s2 = 0
    s3 = 0
    s4 = 0
   
    for i in range(N):
        p = (X[i,:]@v)[0]
    
        p2 = p**2
        s2 = s2 + p2
        
        s3 = s3 + p*p2
        s4 = s4 + p2**2        
   
    
    v_grad = np.zeros(n)
    for k in range(n):
        den = s2*s4
        num = (s3**2) + (s2**3/N)
        
        sp2 = 0
        for j in range(N):
            sp2 = sp2 + ((X[j,:]@v)[0]**2)*X[j,k]
        
        t1p = 6*sp2*s3
         
        sp1 = 0
        for j in range(N):
            sp1 = sp1 + ((X[j,:]@v)[0])*X[j,k]
        
        t2p = 6/N*(s2**2)*sp1
        
        sp3 = 0
        for j in range(N):
            sp3 = sp3 + (X[j,:]@v)[0]**3*X[j,k]
      
        tdp =  2*sp1*s4 + 4*sp3*s2
        
        v_grad[k] = ((t1p + t2p)*den - tdp*num)/(den**2)
 
    return v_grad.reshape(len(v_grad), 1)


def compute_bc(y):
   # N = len(y)
    bc = 0.0
    min = np.amin(y)
    max = np.amax(y)
    if not min==max:
        m3 = skew(y ,bias=False)
        m4 = kurtosis(y,bias=False, fisher=False)+3 #fisher false -> Le mete Pearson
        bc = ((m3**2)+1)/(m4-3)#*((N-1)**2)/((N-2)*(N-3)))
    
    return bc