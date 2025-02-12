import os
from flask import Flask, flash, request, redirect, make_response
from werkzeug.utils import secure_filename
from flask_cors import CORS
from flask_cors.core import probably_regex
import pandas as pd
import numpy as np
import aux_methods  as aux
import io
import csv
import scipy.stats as stats
from sklearn.preprocessing import MinMaxScaler
from sklearn.preprocessing import RobustScaler
import math

app = Flask(__name__)
CORS(app)


#################################################################
################# VARIABLES GLOABALES ###########################
#################################################################
app.config['Dataset'] = None   # El dataset original
app.config['DatosActual'] = np.empty((0,4)) # La porcion de datos actuales 
app.config['DatosSeparados'] = {} #La separacion de los datos
app.config['ultimoNodo'] = None #El nodo del arbol en que estamos
app.config['powers'] = None # Nuestro algoritmo
app.config['n'] = None # columnas
app.config['N'] = None # filas
app.config['clases'] = None # columnas nombres
app.config['values'] = 1 # values
app.config['tieneSol'] = True # Tiene solucion
app.config['nombreTxt'] = True # Nombre artchivo
app.config['title'] = True
app.config['titulos'] = []
app.config['tipo'] = 0
app.config['TodosLosDatos'] = np.empty((0,7)) # La porcion de datos actuales 

#################################################################
####### SACAR NUEVOS PUNTOS Y CALCULAR LA FRONTERA ##############
#################################################################

@app.route('/graph', methods=['POST'])
def grafico():
    # parametros
    json_ = request.get_json()
    nodo_actual = str(json_['n']) # La division en la que nos encontramos
    tipo = int(json_['tipo']) # La division en la que nos encontramos
    tipos = json_['tipos'] # La division en la que nos encontramos
    if(app.config['tipo']!=tipo):
        app.config['DatosActual'] = np.empty((0,4)) # La porcion de datos actuales
        app.config['TodosLosDatos'] = np.empty((0,7)) # La porcion de datos actuales 
        app.config['tipo'] = tipo
    if app.config['ultimoNodo']!=None and app.config['ultimoNodo']!=nodo_actual:
         app.config['DatosActual'] = np.empty((0,4)) # La porcion de datos actuales 
         app.config['TodosLosDatos'] = np.empty((0,7)) # La porcion de datos actuales 
    #Sacamos nuevo punto y lo almacenamos

    if app.config['DatosActual'].size == 0:
        aux.varianzamaxima(pd.DataFrame(data=app.config['DatosSeparados'][nodo_actual]),app.config['n'], bool(app.config['tieneSol']), tipo, tipos )

    app.config['ultimoNodo'] = nodo_actual
    nuevo_punto = aux.empezar(pd.DataFrame(data=app.config['DatosSeparados'][nodo_actual]),  app.config['powers'],app.config['n'], bool(app.config['tieneSol']), tipo, tipos )
 
    app.config['DatosActual']  = np.vstack([app.config['DatosActual'] , nuevo_punto[0:4]])
    
    app.config['TodosLosDatos']  = np.vstack([app.config['TodosLosDatos'] , nuevo_punto])
    #Escogemos solo los puntos para ejecytar pareto
    puntos = app.config['DatosActual'][:, 0:2]
    
  


    def pareto(costs, return_mask = True, tipo=1):
            if tipo == 0:
                costs[:,0] *= -1
            is_efficient = np.arange(costs.shape[0])
            n_points = costs.shape[0]
            next_point_index = 0  # Next index in the is_efficient array to search for
            while next_point_index<len(costs):
                nondominated_point_mask = np.any(costs>costs[next_point_index], axis=1)
                nondominated_point_mask[next_point_index] = True
                is_efficient = is_efficient[nondominated_point_mask]  # Remove dominated points
                costs = costs[nondominated_point_mask]
                next_point_index = np.sum(nondominated_point_mask[:next_point_index])+1
            if return_mask:
                is_efficient_mask = np.zeros(n_points, dtype = bool)
                is_efficient_mask[is_efficient] = True
                return is_efficient_mask
            else:
                return is_efficient
    
    #Sacamos los puntos de pareto
    paretoP = pareto(puntos, True, tipo)
    if tipo == 0:
         puntos[:, 0] *=-1
    #Los nuevos puntos que vamos a tener en cuenta actualmente son solo los de pareto
    app.config['DatosActual']  = app.config['DatosActual'][paretoP]
    pareto_front = puntos[paretoP]
   
    #Se ordenan los puntos del frente de parento para pintarlos bien
    pareto_front_df = pd.DataFrame(pareto_front)
    pareto_front_df.sort_values(0, inplace=True)
    pareto_front = pareto_front_df.values.tolist()
   
    
    #def diff(l1, l2):
    #    return list(set(tuple(i) for i in l1) - set(tuple(i) for i in l2))

    #puntos_no_front = diff(puntos.tolist(), pareto_front)

    xs = []
    ys = []
    xp, yp = map(list, zip(*pareto_front))
    
    #try: 
    #    xs, ys = map(list, zip(*puntos_no_front)) 
    #except:
    #    pass

    #Pasamos en JSON los puntos nuevos. 
    return {
        'line1x': xp,
        'line1y': yp,
        'line2x': xs,
        'line2y': ys
    }

################################################################################
################## SEPARAR EL DATASET ##########################################
################################################################################

@app.route('/paretoOtro', methods=['POST'])
def paretoOtro():

    json_ = request.get_json()
    tipo_nuevo = int(json_['tipo_nuevo']) # La division en la que nos encontramos
    tipo = int(json_['tipo']) # La division en la que nos encontramos
   
    eleccion = -1
    if tipo_nuevo == 1: eleccion = 4 
    if tipo_nuevo == 2: eleccion = 5 
    if tipo_nuevo == 3: eleccion = 6
    if tipo_nuevo == 4: eleccion = 4
    if tipo_nuevo == 5: eleccion = 5
    if tipo_nuevo == 6: eleccion = 6
    if tipo_nuevo == 7: eleccion = 1  
    puntos = app.config['TodosLosDatos'][:, [0,eleccion]]

    def pareto(costs, return_mask = True, tipo=1):
            if tipo == 0:
                costs[:,0] *= -1
            if tipo_nuevo == 1 or tipo_nuevo==5 or tipo_nuevo==6:
                costs[:,1] *= -1
            is_efficient = np.arange(costs.shape[0])
            n_points = costs.shape[0]
            next_point_index = 0  # Next index in the is_efficient array to search for
            while next_point_index<len(costs):
                nondominated_point_mask = np.any(costs>costs[next_point_index], axis=1)
                nondominated_point_mask[next_point_index] = True
                is_efficient = is_efficient[nondominated_point_mask]  # Remove dominated points
                costs = costs[nondominated_point_mask]
                next_point_index = np.sum(nondominated_point_mask[:next_point_index])+1
            if return_mask:
                is_efficient_mask = np.zeros(n_points, dtype = bool)
                is_efficient_mask[is_efficient] = True
                return is_efficient_mask
            else:
                return is_efficient
    
    #Sacamos los puntos de pareto
    paretoP = pareto(puntos, True, tipo)
    if tipo == 0:
         puntos[:, 0] *=-1
    if tipo_nuevo == 1 or tipo_nuevo==5 or tipo_nuevo==6:
         puntos[:, 1] *=-1
    #Los nuevos puntos que vamos a tener en cuenta actualmente son solo los de pareto
    pareto_front = puntos[paretoP]
    app.config['DatosActual']  = app.config['TodosLosDatos'][paretoP][:, 0:4]
    #Se ordenan los puntos del frente de parento para pintarlos bien
    pareto_front_df = pd.DataFrame(pareto_front)
    pareto_front_df.sort_values(0, inplace=True)
    pareto_front = pareto_front_df.values.tolist()
   

    xs = []
    ys = []
    xp, yp = map(list, zip(*pareto_front))
    

    #Pasamos en JSON los puntos nuevos. 
    return {
        'line1x': xp,
        'line1y': yp,
        'line2x': xs,
        'line2y': ys
    }


@app.route('/separacion', methods=['POST'])
def separacion():
    #Entrada
    json_ = request.get_json()
    sep = json_['sep'] #Separador
    nodo_actual = str(json_['nodo']) #Nodo actual
    y = json_['y'] # Datos a separar
    #print(y)
    #Separar
    izq, der = aux.dividir(app.config['DatosSeparados'][nodo_actual], y, sep)
    
    #Guardar los datos separados
    app.config['DatosSeparados'].pop(nodo_actual)
    app.config['DatosSeparados'][str(int(nodo_actual)*2+1)] = izq
    app.config['DatosSeparados'][str(int(nodo_actual)*2+2)] = der
    app.config['DatosActual'] = np.empty((0,4))

    return {
        'izq': np.shape(izq)[0],
        'der': np.shape(der)[0]
    }

#################################################################################
################## CARGAR UN NUEVO PUNTO ########################################
#################################################################################
@app.route('/newPoint', methods=['POST'])
def nuevoGrafico():
    #Entrada
    json_ = request.get_json()
    x = json_['x']
    # Encontrar el elemento que hemos seleccionado y sacar su y
    v1 = np.full(shape = app.config['DatosActual'] [:,0].shape, fill_value=x)
    v2 = np.array(app.config['DatosActual'] [:,0])
    z, v = app.config['DatosActual'][np.array(np.isclose(v1.tolist(),v2.tolist(), atol=0.00000001))][0,2:4]
    x = z.tolist()
    v = np.abs(v).T.astype(float)
    return{
        'x': x,
        'v': v[0].tolist()
    }


#################################################################################
################## SEPARACION AUTOMATICA ########################################
#################################################################################
""" @app.route('/divisorAutomatico', methods=['POST'])
def divisorAutomatico():
    #Entrada
    json_ = request.get_json()
    y = json_['y']

    maximo_suma = 1.5
    maximo_mayor = 1.5
    elem_suma=0
    elem_may=0
    y.sort()
    for i in range(2,len(y)-1):
        phiA= compute_phi2(np.array(y[:i]))
        phiB= compute_phi2(np.array(y[i:len(y)]))
        suma = phiA+phiB
        mayor = min(phiA,phiB)
        #print(mayor, " - ", y[i], "-", y[i-1])
        if suma<maximo_suma:
            maximo_suma = suma
            elem_suma =  y[i] - abs((y[i]-y[i-1])/2)
            #elem_suma = y[i]
        if mayor<maximo_mayor:
            maximo_mayor = mayor
            elem_may = y[i] - abs((y[i]-y[i-1])/2)
            #elem_may = y[i]
    return{
        'elem_suma': elem_suma,
        'elem_may':elem_may  
    } """


@app.route('/divisorAutomatico', methods=['POST'])
def divisorAutomatico():
    #Entrada
    json_ = request.get_json()
    y = json_['y']
    elem_suma1, elem_suma2, elem_may1, elem_may2  =  otsu(np.array(y))
    

    return{
        'elem_suma': elem_suma1,
        'elem_may':elem_suma2  
    }

def otsu(y):
 
    l = y.size
    mean_weight = 1.0/l
    his, bins = np.histogram(y, bins=30)
    final_thresh = -1
    final_value = -1
    final_thresh1 = -1
    final_value1 = -1
    
    final_thresh2 = 1000000
    final_value2 = 1000000
    
    final_thresh3 = -1
    final_value3 = -1
    print(bins)
    final_thresh4 = 1000000
    final_value4 = 1000000


    intensity_arr = np.arange(len(bins)-1)
    for t in range(1, len(bins)-1): # This goes from 1 to 254 uint8 range (Pretty sure wont be those values)
        pcb = np.sum(np.abs(his[:t]))
        pcf = np.sum(np.abs(his[t:]))
        Wb = pcb * mean_weight
        Wf = pcf * mean_weight
        #print(Wb)
        #print("\t\t\t\t", Wf)
        izq  = y[y <= bins[t]]
        
        der  =  y[y > bins[t]]
        
        
         
        mub = np.sum(intensity_arr[:t]*his[:t]) / float(pcb)
        muf = np.sum(intensity_arr[t:]*his[t:]) / float(pcf)

        value = Wb * Wf * (mub - muf) ** 2
        if value > final_value:
            final_thresh = bins[t]
            final_value = value 
        

        #print("Otsu=> T: ", t, " , Value= ", value)
        phizq =  compute_phi(izq) 
        phder =  compute_phi(der)
        psizq =  compute_psi(izq) 
        psder =  compute_psi(der)
        #value1 =  pcb * compute_phi(izq)  +  pcf * compute_phi(der)
        if phizq > 0.8:
            phizq = 0
        if phder > 0.8:
            phder =0
        if psizq < 0.7:
            psizq = 1
        if psder < 0.7:
            psder = 1
        value1 =  phizq  + phder
        #print("Phi=> T: ", t, ", izq: ", phizq, "-",len(izq), " , der: ", phder, "-", len(der)," , Value= ", value1)
        value2 = psizq  + psder
        print("Psi=> T: ", t, ", izq: ", psizq, "-",len(izq), " , der: ", psder, "-", len(der)," , Value= ", value2)
        #value2 = compute_psi(izq) + compute_psi(der)
        #print("\t\t\t\t\t\t\t\t\t\t Psi=> T: ", t, " , Value= ", value2)
        value3 = Wb * Wf * max(compute_phi(izq) , compute_phi(der)) ** 2
        #print("\t\t\t\t\t\t\t\t\t phi2=> T: ", t, " , Value= ", value3, " , Elem= ", max(compute_phi(izq) , compute_phi(der)) ** 2)
        value4 = Wb * Wf * max(compute_psi(izq) , compute_psi(der)) ** 2
        #print("\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t phi2=> T: ", t, " , Value= ", value4, " , Elem= ", max(compute_psi(izq) , compute_psi(der))) 
        
        if value1 > final_value1:
            final_thresh1 = bins[t]
            final_value1 = value1
        if value2 < final_value2:
            final_thresh2 =  bins[t]
            final_value2 = value2
        if value3 > final_value3:
            final_thresh3 =  bins[t]
            final_value3 = value3
        if value4 < final_value4:
            final_thresh4 =  bins[t]
            final_value4 = value4
    print(final_thresh2)
    return final_thresh1, final_thresh, final_thresh2, final_thresh4

def compute_phi(y):
    min = np.amin(y)
    max = np.amax(y)
    if min==max:
        phi = 1
    else:
        EPSILON = 0.000000001
        N = len(y)
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


#################################################################################
################## DESCARGA BASE DE DATOS #######################################
#################################################################################
@app.route('/download', methods=['GET'])
def download():
    load_array= np.empty((0,app.config['Dataset'].shape[1]+1))
    for key, value in app.config['DatosSeparados'].items():
        separador = np.c_[value,np.full(len(value), key, dtype=int)]
        load_array=np.vstack([load_array, separador])
    si = io.StringIO()
    cw = csv.writer(si)
    if app.config['title']:
        if app.config["tieneSol"]:
            cw.writerow(app.config['titulos']+ [" RealSol"] + [" PredSol"])
        else:
            cw.writerow(app.config['titulos']+ [" PredSol"])
    cw.writerows(load_array.tolist())
    output = make_response(si.getvalue())
    output.headers["Content-Disposition"] = "attachment; filename=export.csv"
    output.headers["Content-type"] = "text/csv"
    print(output)
    return output

#################################################################################
################## CARGAR INFO INICIAL ##########################################
#################################################################################
@app.route('/cargaDatos', methods=['GET'])
def cargaDatos():
    x= []
    y= []
    l= []
    izq = app.config['DatosSeparados']["0"]
    l.append(len(izq))
    if app.config['tieneSol']:
        r = resultadoAuxFunc(izq)
    
        y = [*r]
        x = [*r.values()]
        print(x)
        print(y)
        print(app.config['titulos'])
        return {
            'titulo': app.config['nombreTxt'] ,
            'headers': app.config['titulos'] ,
            'inicialx': y,
            'inicialy': x,
            'iniciall': l,
            'tieneSol': app.config['tieneSol'],
            'n': app.config['n'],
            'N': app.config['N'],
        }
    else:
         return {
            'titulo': app.config['nombreTxt'] ,
            'headers': app.config['titulos'] ,
            'iniciall': l,
            'tieneSol': app.config['tieneSol'],
            'n': app.config['n'],
            'N': app.config['N'],
        }


#################################################################################
################## ELIMINAR NODOS ###############################################
#################################################################################
@app.route('/juntar', methods=['POST'])
def joinSons():
    json_ = request.get_json()
    x = json_['nodo']
    i, app.config['DatosSeparados'][str(x)] = joinAux(int(x))
    #print(app.config['DatosSeparados'])
    return str(i)
  
def joinAux(elem):
    if str(elem) in app.config['DatosSeparados']:
        r = app.config['DatosSeparados'][str(elem)]
        app.config['DatosSeparados'].pop(str(elem))
        return 0, r
    else:
        i, izq = joinAux(elem*2+1)
        j, der = joinAux(elem*2+2)
        return i+j+1, np.concatenate((izq, der), axis=0)




##################################################################################
#################### DIAGRAMAS DE BARRAS DE SOLUCIONES ###########################
##################################################################################

@app.route('/resultadoSolucion', methods=['GET'])
def resultadoSolucion():
    x= []
    y= []
    l= []
    for key, value in app.config['DatosSeparados'].items():
        l.append(len(value))
        print(l)
        r = dict(zip(app.config['clases'].tolist(), np.zeros(len(app.config['clases'])).tolist()))
        print(r)
        x_p, y_p = np.unique(value[:,app.config['n']], return_counts=True)
        for a, b in zip(x_p, y_p):
            r[str(a)] = int(b)
        print(r)
        y.append([*r])
        x.append([*r.values()])
        #x.append(x_p.tolist())
        #y.append(y_p.tolist())
        
    print(x)
    print(y)
    return{
        'x': y,
        'y': x,
        'l': l
    }

@app.route('/resultadoNodoSolucion', methods=['POST'])
def resultadoNodoSolucion():
    json_ = request.get_json()
    nodo = int(json_['nodo'])
    print("Nodo: ", nodo)
    print([*app.config['DatosSeparados']])
    x= []
    y= []
    l= []
    izq = app.config['DatosSeparados'][str(nodo*2+1)]
    l.append(len(izq))
    r = resultadoAuxFunc(izq)
    y.append([*r])
    x.append([*r.values()])
    der = app.config['DatosSeparados'][str(nodo*2+2)]
    l.append(len(der))
    r = resultadoAuxFunc(der)
    y.append([*r])
    x.append([*r.values()])


    return{
        'x': y,
        'y': x,
        'l': l
    }

def resultadoAuxFunc(datos):
    r = dict(zip(list(map(str, app.config['clases'].tolist())), np.zeros(len(app.config['clases'])).tolist()))
    x_p, y_p = np.unique(datos[:,app.config['n']], return_counts=True)
    for a, b in zip(x_p, y_p):
        r[str(a)] = int(b)
    return r



##################################################################################
############################## CARGAR DATOS ######################################
##################################################################################

##### EXTENSIONES VALIDAS ##################
ALLOWED_EXTENSIONS = {'csv'} 
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

#### SUBIR LA BASE DE DATOS ################
@app.route('/uploadDB', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['customFile']     
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            app.config['nombreTxt'] = file.filename
            #Creamos el dataframe y cargamos los datos iniciales
            app.config['Dataset']  = pd.read_csv(file, index_col=False, header=None, sep= ",")           
    return "dataset.csv"

@app.route('/iniciar', methods=['POST'])
def iniciar():
    
    #print(aux.compute_gradient_phi_projected(np.array([1]),np.array([1])))
    #aux.empezar(np.array([[1]]),[1],1,False)
    
    # Cargar datos del front
    json_ = request.get_json()
    #app.config['values'] = json_['values']
    app.config['tieneSol'] = json_['tieneSol']
    app.config['title'] = bool(json_['cabecera'])
    #print(app.config['values'])
    #app.config['title'] = json_['title']
    # Preparar dataset y atributos
   
    if(app.config['title']==True):
        app.config['titulos'] = list(app.config['Dataset'].iloc[0,:])
        if bool(app.config['tieneSol']):
            i=int(json_['solucion'])
            del app.config['titulos'][i]
        app.config['Dataset'].drop(index=app.config['Dataset'].index[:1], axis=0, inplace=True)
    else:
        app.config['titulos'] = list(map(str, list(range(len(app.config['Dataset'].columns)))))
    app.config['Dataset'] = app.config['Dataset'].to_numpy() 
    
    app.config['N'], app.config['n'], app.config['powers']  = aux.load(app.config['Dataset'])
    
    #Sacar la solucion 
    if bool(app.config['tieneSol']):
        i=int(json_['solucion'])

        L = app.config['Dataset'][:,i]
        app.config['clases'], _= np.unique(L, return_counts=True)
        if i <= 0:
            app.config['Dataset'] = app.config['Dataset'][:,i+1:]
        elif i >= app.config['n']:
            app.config['Dataset'] = app.config['Dataset'][:,:i]
        else:
            app.config['Dataset'] =  app.config['Dataset'][:,:i] + app.config['Dataset'][:,i+1:]
    
    app.config['Dataset'] = np.array(app.config['Dataset'], dtype=np.float64) 
 
    n = int(json_['normalizacion'])
    
    if n == 1:
        a, _ = app.config['Dataset'].shape
        for i in range(a):
            gmax = max(app.config['Dataset'][i,:])
            gmin = min(app.config['Dataset'][i,:])
            gap = gmax - gmin
            if gap == 0:
                app.config['Dataset'][i,:] = 0
            else:
                app.config['Dataset'][i,:] = (app.config['Dataset'][i,:] - gmin)/gap
        X = 2*app.config['Dataset'] - 1
        #app.config['Dataset'] = np.nan_to_num(stats.zscore(app.config['Dataset'], ddof=0))
    elif n == 2:
        app.config['Dataset'] = np.nan_to_num(stats.zscore(app.config['Dataset'], ddof=1))
    elif n == 3:
        scaler = RobustScaler()
        app.config['Dataset'] = np.nan_to_num((scaler.fit_transform(app.config['Dataset'])))
    elif n == 4:
        scaler = MinMaxScaler()
        app.config['Dataset'] = np.nan_to_num((scaler.fit_transform(app.config['Dataset'])))
 

    if bool(app.config['tieneSol']):
        app.config['Dataset'] = np.column_stack((app.config['Dataset'], L))
    
    
   
    print(app.config['Dataset'])

    app.config['DatosSeparados'] = {} 
    app.config['DatosSeparados']["0"] = app.config['Dataset'] 
    app.config['TodosLosDatos'] = np.empty((0,7)) # La porcion de datos actuales 
    app.config['DatosActual'] = np.empty((0,4))
    #aux.empezar(pd.DataFrame(data=app.config['DatosSeparados']["0"][0:2,:]),  app.config['powers'],app.config['n'], bool(app.config['tieneSol']) )
    print(app.config['titulos'])
    return ('', 204)


if __name__ == "__main__":
    app.run(debug=True)