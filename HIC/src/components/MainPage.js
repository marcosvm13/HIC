import React from "react";
import '@atlaskit/css-reset';
import axios from 'axios';
import 'react-dropzone-uploader/dist/styles.css'
import Dropzone from 'react-dropzone-uploader'
import { useHistory } from "react-router-dom";
import Typography  from '@material-ui/core/Typography'
import Slider  from '@material-ui/core/Slider'
import Checkbox  from '@material-ui/core/Checkbox'
import Paper from '@material-ui/core/paper'
import { createMuiTheme, createStyles, MuiThemeProvider } from '@material-ui/core/styles';
import { ThemeProvider  } from '@material-ui/styles';
import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';

import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import ListItemText from '@material-ui/core/ListItemText';
class MainPage extends React.Component {
    constructor(props) {
        super(props);
        

        /*
        Estados importantes:

        CABECERA: Guarda si tiene o no cabecera. POR DEFECTO: SI 
        CHECKBOX: Guarda si tiene o no solucion. POR DEFECTO: SI 
        NUMEROSOLUCION: Guarda la columna a la que se encuentra la solucion. POR DEFECTO 0
        NORMALIZACION: Guarda el tipo de normalizacion: 
                    1 => [-2,2]
                    2 => ZSCORE. POR DEFECTO
                    3 => Lineal
                    4 => Robusta
                    5 => Ninguna
        */ 


        this.state= {
            cabecera: true,  
            checkBox: true, 
            numeroSolucion: 0, 
            normalizacion: 2,
            
           // ESTADOS DE EDICION DE COMPONENTES REACT 

           //Slider
            muiTheme : createMuiTheme({ 
                overrides:{
                  MuiSlider: {
                    thumb:{
                    color: "#192444",
                    },
                    track: {
                      color: '#6970E9'
                    },
                    rail: {
                      color: 'dark purple'
                    }
                  }
              }
              }),

              // Normalizacion
              selectTheme: createMuiTheme({
                overrides: {
                    MuiMenuItem: createStyles({
                      "root": {
                        "&$selected": {
                          "&&": {
                            "backgroundColor": "#192444",
                            "& *": {
                              "color": "white"
                            }
                          },
                          "&&:hover": {
                            "backgroundColor": "#1F2C56",
                            "& *": {
                              "color": "white"
                            }
                          }
                        }
                      }
                    }
                    )
                }
            })

        }
    };
        /*
        Detonante: Seleccion de archivos
        Atributos Usados: file => Archivo subido
        Descripcion: Cargar datos con la libreria propia de dropzone
        */
        getUploadParams = ({ file, meta }) => {   
            const body= new FormData()
            body.append('customFile', file)
            body.append('type', 'normal')
            return { url: '/uploadDB', body } 
          
          }
      
        /*
        Detonante: Pulsar el boton cargar
        Atributos Usados: 
        Descripcion: Llevar al servidor los datos obtenidos por el formulario
        */
        handleSubmit = (files) => { 
          fetch('/iniciar',  
            {headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({tieneSol: this.state.checkBox,
                                  solucion: this.state.numeroSolucion,
                                  normalizacion: this.state.normalizacion,
                                  separador: this.state.separador,
                                  cabecera: this.state.cabecera
                                })
          }).then((response) => response.json())
          
          window.location.href = "/app"  
        }
      
      
        /*
            Cambios del estado
        */
        setNum = (i) => { this.setState({numeroSolucion : i});}
        handleCheckbox = (i) => {this.setState({checkBox : i.target.checked});}
        handleCabecera = (i) => {this.setState({cabecera : i.target.checked});}
        handleTextbox = (i) => {this.setState({separador : i.target.checked});}
        handleChange = (i) => {this.setState({normalizacion : i.target.value});}


        render(){ 
        return(  
            <div  style={{height: '100vh', overflow: 'hidden', backgroundColor:"#EDF1F4"}}>
                <Paper elevation={3} m="auto" justify = "center" style={{height: '52vh', maxWidth:'1000px', overflow: 'auto',  paddingTop:'5vh', marginTop:'15vh',backgroundColor:"white", marginRight:'30vw', marginLeft:'30vw'}}>
                    
                    
                    {/* TITULO */}
                    <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center',}}>  
                      <h1 style={{}}>Algoritmo Interactivo de Clustering</h1> 
                    </div>


                    {/* SUBTITULO */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', }}>  
                      <h5 style={{}}>Separa en grupos la base de datos insertada </h5>  
                    </div>


                    {/* DROPZONE: Subir las bases de datos .csv
                    Atributos:
                        accept: .csv  (Si se desea ayadir mas se puede hacer aqui)
                        submitButtomContent: Texto del boton
                        inputcontent: Texto de la caja, cuando hay error primero (no se da la posibilidad en este caso) y cuando no hay archivos 
                    */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '3vh', marginLeft: '5vw', marginRight: '5vw', }} >      
                    <Dropzone
                      getUploadParams={this.getUploadParams}
                      onSubmit={this.handleSubmit}
                      accept=".csv"
                      multiple= {false}
                      maxFiles = {1}
                      submitButtonContent = "Cargar"
                      inputContent={(files, extra) => (extra.reject ? 'Solo archivos csv' : 'Arrastrar Archivo')}
                      styles = {{
                        dropzoneReject: { borderColor: 'red', backgroundColor: '#DAA' },
                        inputLabel: (files, extra) => (extra.reject ? { color: 'red' } : {}),
                        dropzone: {backgroundColor:'white', overflow:"hidden"}, 
                        inputLabel: {color:'#0075FF'}, 
                        submitButton: {color:'white', backgroundColor:'#0075FF'}}}
                    />
                  </div>
                    
                    
                    
                
                
                 {/* 
                 Checkbox:  Marcar si tiene cabecera
                 */}
                <div style={{ display: 'flex', marginTop: '3vh', marginLeft: '20%', marginRight: '10%', }} >
                 <Typography id="discrete-slider-restrict" gutterBottom style={{}}>
                  Cabecera:
                </Typography>
                <Checkbox
                        checked={this.state.cabecera}
                        inputProps={{ 'aria-label': 'Solucion: ' }}
                        style={{marginLeft:'3vw', marginTop:'-0.8vh'}}
                        onChange={this.handleCabecera}
                        color="primary"
                        />
                 </div>

                  {/* 
                 Checkbox:  Marcar si tiene solucion
                 */}
                <div style={{ display: 'flex', marginTop: '3vh', marginLeft: '20%', marginRight: '10%', }} >
                 <Typography id="discrete-slider-restrict" gutterBottom style={{}}> Información sobre clases: </Typography>
                <Checkbox
                        checked={this.state.checkBox}
                        inputProps={{ 'aria-label': 'Solucion: ' }}
                        style={{marginLeft:'3vw', marginTop:'-0.8vh'}}
                        onChange={this.handleCheckbox}
                        color="primary"
                        />
                 </div>
                
                  {/* 
                 Input:  Columna de la solucion
                         Atributos:
                            type: Numero entero
                 */}
                 <div style={{ display: 'flex', marginTop: '3vh', marginLeft: '20%', marginRight: '10%', }} >
                 <Typography id="discrete-slider-restrict" gutterBottom style={{}}> Columna de Información:</Typography>
                  <input
                      type="number"
                      min={0}
                      max={10000000}
                      step={1}
                      value={this.state.numeroSolucion}
                      onChange={e => this.setNum(e.target.value)}
                      style={{marginLeft:'3vw'}}
                  />
                 </div>
                {/*
                 Select:  Normalizacion
                */}
                 <div style={{ display: 'flex', marginTop: '3vh', marginLeft: '20%', marginRight: '10%', }} >
                 <FormControl style={{width: '20vw'}}>
                    <InputLabel style={{}}>Normalización</InputLabel>
                    <MuiThemeProvider  theme={this.state.selectTheme}>
                    <Select
                        value={this.state.normalizacion}
                        onChange={this.handleChange}
                        
                    >
                    <MenuItem value="1"> <ListItemText>Lineal [-1,1]</ListItemText></MenuItem>
                    <MenuItem value="2"> <ListItemText>ZScore1</ListItemText></MenuItem>
                    <MenuItem value="3"> <ListItemText>Robusto</ListItemText></MenuItem>
                    <MenuItem value="4"> <ListItemText>Lineal [0,1]</ListItemText></MenuItem>
                    <MenuItem value="5"> <ListItemText>None</ListItemText></MenuItem>
                    </Select>
                    </MuiThemeProvider >
                </FormControl>
                
                 </div>
                
                 </Paper>
          </div>
        ); 
        } 
    } 

export default MainPage;

/*
{ SLIDER: 
    
  }

                    <div style={{ display: 'flex', marginTop: '3vh', marginLeft: '20%', marginRight: '30%', }} >
                    <Typography id="discrete-slider-restrict" gutterBottom style={{}}>
                      Batch Size
                      </Typography>
                      <ThemeProvider theme={this.state.muiTheme}>
                      <Slider
                          defaultValue={1}
                          getAriaValueText={this.state.valuetext}
                          aria-labelledby="discrete-slider-custom"
                          step={5}
                          valueLabelDisplay="auto"
                          marks
                          min={1}
                          max={100}
                          />
                  </ThemeProvider>
                  </div>
*/